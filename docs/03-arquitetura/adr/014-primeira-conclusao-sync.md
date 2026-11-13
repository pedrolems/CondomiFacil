# ADR-014: "Primeira conclusão" na sincronização, por relógio do aparelho ou por chegada

- **Estado:** Proposto
- **Data:** 06/11/2026; revisão em 08/11/2026
- **Decisores:** Pedro Lemos
- **Depende de:** validação técnica do desempate exato e tratamento de relógio incorreto; critério principal de produto definido
- **Relacionado a:** [ADR-003](003-banco-local-e-sync-offline.md), [ADR-012](012-fuso-horario-por-condominio.md)

## Contexto

A RN-CH-04 define que, se duas pessoas da limpeza concluem o mesmo ciclo offline, vale o **menor horário registrado pelo celular**, mesmo enviado depois. A candidata de horário posterior fica sem efeito e é preservada no histórico. A RN-CH-15 define que a avaliação pertence à conclusão efetiva, sem transferir notas de uma conclusão superada.

Na versão original, as regras não diziam o que era "primeira":

- pela **hora em que cada pessoa concluiu** (relógio do aparelho), ou
- pela **ordem de chegada ao servidor**.

Em **08/11/2026, Pedro definiu a opção A**: vale o menor horário registrado pelo celular, mesmo enviado depois. A RN-CH-04 e sua cadeia foram atualizadas. Também definiu que avaliação já enviada para uma conclusão superada fica só no histórico, permitindo nova avaliação da conclusão efetiva (RN-CH-15 e RN-CH-17). Isso não equivale a aceitar integralmente este ADR nem a aprovar limite de desvio de relógio.

Contexto técnico: cada operação offline tem `op_id`, `registrado_em` (relógio do aparelho) e ordem sequencial ([ADR-003](003-banco-local-e-sync-offline.md)); o servidor aplica operações de forma idempotente.

## Opções consideradas

| Opção | Prós | Contras |
| --- | --- | --- |
| **A. Relógio do aparelho (`registrado_em`)** | Reflete quem concluiu primeiro na vida real; independe de quando houve sinal | Relógio do aparelho pode estar errado ou ser manipulado |
| **B. Ordem de chegada ao servidor** | Sem dependência de relógio do aparelho; simples | Premia quem sincronizou primeiro, não quem concluiu primeiro; injusto com quem ficou mais tempo sem conexão |
| **C. A com desempate por B, e limite de desvio de relógio** | Mantém o benefício de A, trata empate e reduz o risco do relógio | Regra mais elaborada de explicar e de testar |

## Decisão (proposta)

Critério de produto já definido: **A**. A implementação abaixo continua **Proposta**:

1. Vale a conclusão com menor `registrado_em` (relógio do aparelho).
2. Em empate exato, propõe-se usar chegada ao servidor como desempate estável. Esse desempate não foi definido como regra de produto.
3. Guardar hora do aparelho, hora de recebimento, `op_id` estável e ciclo. Não foi aprovado limite de desvio, rejeição automática por horário futuro ou uso da chegada no lugar de um horário anterior válido. Horário incorreto/impossível exige política técnica explícita a validar.
4. A conclusão de horário posterior fica sem efeito, com aviso e histórico. Se a anterior chegar depois, ela passa a ser efetiva, sem novo ciclo; avisar funcionários envolvidos e autor do chamado. Reenvios não repetem efeitos.
5. Avaliação da conclusão superada permanece somente no histórico autorizado e ligada ao atendente original, sem entrar em agregados nem ser transferida. A conclusão efetiva disponibilizada pela correção recebe a janela configurada em `chamado.janela_avaliacao_dias` (padrão 7 dias) a partir dessa disponibilização, com lembrete único às 09:00 locais do dia seguinte ao fim das 24h (RN-CH-17); as 48h para reabrir não reiniciam (RN-CH-15 e RN-CH-17).

RN-CH-04, RN-CH-15 e RN-CH-17 contêm as decisões de produto. O estado deste ADR permanece **Proposto**: desempate, validação de relógio, protocolo e provas de idempotência ainda precisam de validação. A antiga proposta C não foi aceita por consequência da escolha de A.

## Consequências

**Positivas**

- A "primeira" corresponde à ordem real do trabalho, o que é o espírito da RN-CH-04.
- Um aparelho sem sinal por horas não perde a conclusão por sincronizar mais tarde.

**Negativas**

- A decisão depende de relógio do aparelho, que o servidor não controla.
- Exige definir tratamento de relógio incorreto e testes de relógio; nenhum parâmetro de desvio foi aprovado.

**Riscos**

- Relógio adiantado ou atrasado de propósito para "ganhar" a avaliação. Política de validação ainda pendente; não alegar que rejeitar futuro resolve relógio atrasado.
- Correção tardia altera atendente efetivo e agregados. O histórico e os avisos precisam explicar a correção sem transferir nota ou comentário ao colega.

## Critérios de validação e o que falta para aceitar

- Critério A e correção de avaliação definidos por Pedro em 08/11/2026; falta validar os mecanismos técnicos deste ADR.
- Definir desempate exato e tratamento de relógio incorreto; não pressupor aprovação de desvio máximo.
- Testes automatizados de RNF-16 para: duas conclusões offline em ordem inversa à de chegada; empate; hora no futuro; conclusão recusada com aviso.
- Validar substituição efetiva em ordem inversa, avaliação superada só no histórico e nova janela, sem duplicar ciclo/operação.

## Referências

- `docs/03-arquitetura/01-arquitetura.md`: seções 3.1.1 (resolução de conflitos), 9.1, 9.3.
- `docs/01-produto/03-regras-de-negocio.md`: RN-CH-04, RN-CH-15.
- `docs/01-produto/02-prd.md`: RNF-16.

## Direção de Pedro em 12/11/2026

Menor horário do celular continua a regra, mesmo enviado depois. Empate exato e desvio de relógio continuam dependentes de proposta e validação, sem tolerância arbitrária. Fila pendente protegida é separada do cache. Este registro não aceita integralmente o ADR. [Decisões consolidadas](../../01-produto/05-decisoes-de-complementacao.md).
