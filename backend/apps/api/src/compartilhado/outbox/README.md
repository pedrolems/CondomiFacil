# apps/api/src/compartilhado/outbox

Gravação transacional de evento_saida e despacho de eventos. Não importar módulos de domínio.

Implementado (RM-24): `registrarEvento` (na transação do ato) e `Despachante` (laço do worker, com `for update skip locked`, um `ManipuladorDeEvento` por `tipo`, entrega pelo menos uma vez). O despachante não está no `index.ts`: só o worker o importa.
