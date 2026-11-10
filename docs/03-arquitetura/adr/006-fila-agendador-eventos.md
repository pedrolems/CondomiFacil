# ADR-006: Fila, agendador e distribuição de eventos

- **Estado:** Proposto
- **Data:** 06/11/2026
- **Decisores:** Pedro Lemos
- **Depende de:** carga esperada (RNF-17)
- **Relacionado a:** [ADR-001](001-multi-tenant-rls.md), [ADR-004](004-nuvem-regiao-residencia-dados.md), [ADR-012](012-fuso-horario-por-condominio.md)

## Contexto

O PRD seção 10 manda rodar rotinas por jobs no backend e usar WebSockets na lista da portaria. Os documentos não escolhem fila nem agendador (lacuna 9.3).

O que a escolha precisa sustentar:

- 21 rotinas automáticas (RN seção 14), com log de cada execução, mais jobs temporais fora da tabela (reabertura de chamado em 48 h, segundo turno em 7 dias, prazo de recurso de 7 dias).
- RLS valendo nos jobs: cada execução abre o contexto de **um** condomínio ([ADR-001](001-multi-tenant-rls.md)).
- Evento de domínio sem perda: notificação não pode se perder se o processo cair. A proposta é o padrão outbox transacional (`evento_saida`), despachado pelo worker para tempo real, push e e-mail.
- Tempo real: visitante cadastrado, editado ou cancelado aparece em até 5 s (RNF-05). Com mais de uma instância da API, o evento precisa chegar ao socket certo.
- Escala: 5.000 unidades e 10 portarias (RNF-17), rajadas de push e rotinas de meia-noite.
- Equipe pequena e custo contido (RNF-18).

## Opções consideradas

**Fila e agendador**

| Critério | `pg-boss` (sobre PostgreSQL) | BullMQ + Redis |
| --- | --- | --- |
| Componentes a operar | Nenhum a mais | Redis a mais |
| Enfileiramento transacional com o outbox | Sim, na mesma transação do banco | Não, exige cuidado para consistência |
| Cron e atraso (`delay`) | Suportados | Suportados |
| Carga alta | Limitada pelo PostgreSQL | Mais folga |
| Cache e pub/sub | Não | Redis pode servir também a pub/sub |
| Isolamento de tenant (4.7) | Payload com `condominio_id` | Idem, com prefixo de chave obrigatório |

**Distribuição de eventos entre instâncias**

| Critério | `LISTEN/NOTIFY` do PostgreSQL | Redis pub/sub |
| --- | --- | --- |
| Componentes | Nenhum a mais | Redis |
| Escala | Suficiente para o MVP | Maior |
| Entrega | Não persiste; o outbox e o `pull` ao reconectar cobrem perdas | Também não persiste |

## Decisão (proposta)

No MVP:

1. **`pg-boss`** como fila e agendador, no mesmo PostgreSQL. O worker é o mesmo código da API com outro ponto de entrada, sem HTTP, escalável separadamente.
2. **Fan-out por condomínio:** um agendador leve enumera condomínios ativos e enfileira um job `rotina:condominio_id`. Cada execução abre `TenantContext` de um condomínio, falha e repete isoladamente, e um condomínio grande não atrasa os outros. Jobs sem `condominio_id` só existem para os jobs de plataforma listados.
3. **Idempotência** em cada rotina: escrever só o que falta, com chave única (ex.: cobrança do mês X para a unidade Y).
4. **Eventos temporais como jobs com `delay`**, criados no momento do evento, em vez de varreduras.
5. **Registro** em `execucao_rotina` (rotina, condomínio, início, fim, resultado, contagens), com alerta no Sentry em falhas repetidas.
6. **Eventos:** outbox transacional gravado na mesma transação da mudança; o worker o despacha. Entre instâncias, `NOTIFY` no PostgreSQL, com cada instância repassando aos seus sockets. Se o socket cair, o cliente faz `pull` incremental ao reconectar; consulta periódica da lista garante RNF-05 mesmo sem WebSocket.
7. **Evolução:** BullMQ + Redis e Redis pub/sub só se a carga pedir. Se Redis entrar, prefixo obrigatório `c:{condominio_id}:` por um módulo de acesso que não deixa montar chave sem tenant.

Mecanismo de fuso das rotinas "à meia-noite" está na [ADR-012](012-fuso-horario-por-condominio.md).

## Consequências

**Positivas**

- Menos componentes e enfileiramento transacional com o outbox.
- Isolamento por tenant preservado nos jobs.
- Menor custo operacional (RNF-18).

**Negativas**

- A fila compete por recursos com o banco principal. Jobs pesados (push em lote, exportação) podem pressionar o PostgreSQL.
- `NOTIFY` não tem garantia de entrega nem escala ilimitada.

**Riscos**

- Rajada de push e rotinas de meia-noite acima do que o PostgreSQL absorve. Mitigação: push em lote por job, fila dedicada para condomínio muito grande, migração para BullMQ.
- Número de conexões WebSocket por instância é lacuna; medir no teste de carga.

## Critérios de validação e o que falta para aceitar

- Teste de carga (RNF-17) com RLS ativa: rajada de comunicado geral, rotinas de meia-noite em 100 condomínios, evento-a-socket dentro de RNF-05.
- Confirmar que o volume de jobs em `pg-boss` não degrada RNF-01.
- Testes: job de A não processa dado de B; job sem `condominio_id` fora da lista é rejeitado.
- Aprovação do Pedro.

## Referências

- `docs/03-arquitetura/01-arquitetura.md`: seções 3.3, 3.4, 3.5, 4.7, 5.2 (itens menores), 9.3.
- `docs/01-produto/02-prd.md`: seção 10; RNF-05, RNF-17, RNF-18.
- `docs/01-produto/03-regras-de-negocio.md`: seção 14 (rotinas).
