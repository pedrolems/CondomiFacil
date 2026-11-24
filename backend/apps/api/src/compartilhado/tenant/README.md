# apps/api/src/compartilhado/tenant

TenantContext: único caminho ao banco com isolamento por condomínio. Não importar módulos de domínio.

Implementado (RM-24): `TenantContext` (`executar` e `executarComoPlataforma`), guarda no driver que recusa consulta fora do contexto antes de chegar ao banco, Kysely sobre postgres.js e tipos gerados em `gerado/` (`pnpm db:tipos`). `escopo-sistema.ts` (leitura de pendências do outbox) é só do worker e fica fora do `index.ts`; o lint barra o import fora dele.
