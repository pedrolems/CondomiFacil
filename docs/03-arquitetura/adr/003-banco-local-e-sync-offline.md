# ADR-003: Banco local do aparelho e sincronização offline

- **Estado:** Proposto
- **Data:** 06/11/2026
- **Decisores:** Pedro Lemos
- **Depende de:** prova de conceito de criptografia e de fila de 10.000 operações
- **Relacionado a:** [ADR-014](014-primeira-conclusao-sync.md), [ADR-011](011-ambientes-branches-eas-ota.md), [ADR-001](001-multi-tenant-rls.md)

## Contexto

O PRD seção 10 deixa em aberto "SQLite ou WatermelonDB". O escopo offline já está decidido: **só** a portaria (lista do dia e entradas e saídas) e a limpeza (chamados do setor e conclusões) funcionam offline. Os demais perfis são online-only, com rascunho de texto (UF 15).

Requisitos:

- RNF-06 (offline da portaria), RNF-07 (offline da limpeza), RNF-08 (sincronização automática com pendências visíveis) e RNF-16 (testes automatizados do offline a cada versão).
- RNF-02: tela utilizável em 3 s no 4G em aparelho de 3 GB de RAM.
- SEG-09 e RN-OF-06: dado offline criptografado, apagado ao sair da conta, ao trocar de condomínio e ao fim do dia.
- RN-OF-01 a RN-OF-05: o que a portaria guarda e como a divergência é tratada. Entrada offline de visitante que o morador cancelou é aplicada pelo servidor e gera divergência, com diálogo bloqueante para o porteiro (RN-OF-04). Divergência não notifica o síndico (RN-OF-05).
- RN-CH-04, RN-CH-14 e RN-CH-15: conclusão de chamado offline, até 5 fotos, avaliação para o funcionário da primeira conclusão.
- A lógica difícil (divergência, primeira conclusão) é código nosso em qualquer biblioteca.

## Opções consideradas

| Critério | `expo-sqlite` + SQLCipher, fila própria | WatermelonDB |
| --- | --- | --- |
| Escopo necessário | Pequeno: lista do dia, chamados do setor e fila de operações | Pensado para apps grandes, muitos dados, sincronização completa |
| Criptografia (SEG-09) | SQLCipher via configuração do Expo | Sobre SQLite; criptografia depende de build com SQLCipher |
| Sincronização | Protocolo próprio, simples e sob controle (outbox + delta por cursor) | Protocolo `pull/push` pronto, para sincronizar tabelas inteiras; adaptar à divergência de RN-OF-04 exige código nosso |
| Desempenho | Suficiente para centenas de linhas | Excelente para milhares; reativo |
| Complexidade e dependências | Menor; API do Expo | Maior; módulo nativo e esquema de modelos |
| Testes (RNF-16) | Fácil simular fila e queda | Também possível |

Observação comum às duas: módulos nativos exigem *dev build*; o Expo Go não basta para SQLCipher (arquitetura 5.1).

## Decisão (proposta)

Usar **`expo-sqlite` com SQLCipher** e uma **fila própria (outbox)**. O escopo offline é restrito a dois perfis e poucos dados. Reavaliar WatermelonDB se o offline crescer para outros perfis.

Desenho (arquitetura 3.1.1, 4.8):

- **Operação** com `op_id` (UUID gerado no aparelho), tipo, carga, `registrado_em` (relógio do aparelho) e ordem sequencial. O servidor guarda `op_id` com unicidade: reenvio nunca duplica.
- **Push** em lote e em ordem, `POST /sync/push`; operação recusada não derruba as demais. Resultado por operação: aplicada, divergente ou recusada.
- **Pull** incremental por cursor (`atualizado_em` + id), `GET /sync/pull?desde=cursor`, só com o dia da portaria. A hora da última sincronização fica sempre visível, e as pendências aparecem no mesmo indicador (RNF-06, RNF-08).
- **Nota de remissão (10/11/2026):** no contrato da API (Proposta), push e pull são `POST /v1/sync` e `GET /v1/sync`, descritos em [`docs/05-backend/api/openapi/sync.yaml`](../../05-backend/api/openapi/sync.yaml). Os caminhos `/sync/push` e `/sync/pull` acima são os do desenho original; a decisão não muda.
- **Fotos de conclusão** ficam em arquivos locais referenciados pela operação e sobem por URL assinada antes de a conclusão ser aplicada, com o mesmo `op_id` como chave de idempotência.
- **Sincronização** dispara ao voltar ao primeiro plano com conexão; com o app aberto, tenta de novo com recuo exponencial.
- **Segurança:** chave gerada no aparelho e guardada no `expo-secure-store`; um arquivo de banco por `(usuario_id, condominio_id)`; apagado ao sair, ao trocar de condomínio e ao fim do dia. Como aparelho offline não recebe a ordem da rotina 13, o app também apaga sozinho na primeira abertura de um novo dia se a data do cache for anterior à de hoje. Antes de apagar ao sair, avisar se há pendências não enviadas e exigir confirmação.
- **Divergência de portaria:** o servidor aplica o registro e cria `divergencia_sincronizacao`; o cliente mostra o diálogo bloqueante sem botão de fechar, que só fecha quando o porteiro confirma por interfone. A confirmação é registrada (quem, quando).
- **Casos propostos:** saída offline de visita já encerrada pela rotina "saída não registrada" vira no-op com aviso informativo; registro offline de visitante removido no servidor é tratado como divergência.
- **Testabilidade:** camada offline isolada, com relógio e rede injetáveis (RNF-16).

A regra de "primeira conclusão" tem decisão própria na [ADR-014](014-primeira-conclusao-sync.md).

## Consequências

**Positivas**

- Menos dependências e protocolo simples, sob nosso controle.
- Encaixa a divergência de RN-OF-04 sem adaptar um protocolo de sincronização genérico.
- Fila fácil de simular em testes.

**Negativas**

- O protocolo de sync, a fila e os conflitos são manutenção nossa.
- Exige dev build; o Expo Go não serve para o fluxo offline.
- Se o offline crescer para outros perfis, a escolha pode precisar ser refeita.

**Riscos**

- Complexidade do offline é risco listado do MVP: falhas na portaria, que "nunca para" (arquitetura 9.4).
- Desvio do relógio do aparelho afeta `registrado_em` (ver ADR-014).
- Aparelho compartilhado entre turnos: mitigado pelo banco por usuário e condomínio e pelo apagamento ao sair.
- Estratégia de sync além de RN-OF-04 e RN-CH-04 é lacuna reconhecida do documento.

## Critérios de validação e o que falta para aceitar

- Prova de conceito de **criptografia (SQLCipher)** e de **10.000 operações na fila** em aparelho de 3 GB de RAM (RNF-02, RNF-07).
- Suíte automatizada (RNF-16): queda de conexão no meio do envio, reenvio idempotente, ordem da fila, divergência, primeira conclusão, limpeza do cache.
- Confirmação de que o dev build cabe no fluxo de EAS da [ADR-011](011-ambientes-branches-eas-ota.md).
- Aprovação do Pedro.

## Referências

- `docs/03-arquitetura/01-arquitetura.md`: seções 3.1.1, 3.1.2, 3.8, 4.8, 5.1, 5.2 (banco local), 8, 9.4.
- `docs/01-produto/02-prd.md`: seção 10; RNF-02, RNF-06, RNF-07, RNF-08, RNF-16; SEG-09.
- `docs/01-produto/03-regras-de-negocio.md`: RN-OF-01 a RN-OF-06, RN-CH-04, RN-CH-14, RN-CH-15.
- `docs/02-design/02-user-flows.md`: seções 6.3 e 15; Design System 10.10, 10.23 e 11.1.
