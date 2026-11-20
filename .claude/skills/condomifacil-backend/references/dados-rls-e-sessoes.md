# Dados, RLS e sessões

Fontes: [ADR-008](../../../../docs/03-arquitetura/adr/008-orm-query-builder-migracoes.md), [ADR-001](../../../../docs/03-arquitetura/adr/001-multi-tenant-rls.md), [ADR-007](../../../../docs/03-arquitetura/adr/007-autorizacao-jwt-sem-papeis.md), [política de acesso](../../../../docs/04-banco-de-dados/02-politica-de-acesso-a-dados.md), [migrations e seeds](../../../../docs/04-banco-de-dados/03-estrategia-de-migrations-e-seeds.md), [pacote da fase 2](../../../../docs/09-infra/pacote-tecnico-fase-2.md). Referências externas: [Kysely](https://kysely.dev), [Flyway](https://documentation.red-gate.com/flyway), [PostgreSQL Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html), [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/), [OWASP API Security Top 10](https://owasp.org/API-Security/).

## Acesso a dados (ADR-008, aceito com ressalvas em 20/11/2026)

- Kysely 0.29.9 com postgres.js (kysely-postgres-js 5.1.0). Flyway 13.12.2 OSS, SQL-first, executado pelo papel dono. Tipos do banco por kysely-codegen. Sem Zod: a borda é validada pelo Ajv do contrato.
- Migrations só para frente (expandir e contrair), `validate` estrito, `CONCURRENTLY` reexecutável, listener de erro no driver; migrations só por conexão direta ou pooler em modo session.
- **Estado no código**: Kysely, postgres.js e kysely-codegen **ainda não estão instalados**; `backend/apps/api/db/migracoes/` tem só README. Escrever migrations é do `engenheiro-de-dados`.
- Banco local: PostgreSQL 17 em Docker. No CI, Postgres de serviço (**pendente**, E18). Dados sempre fictícios; nenhuma migration em banco remoto sem autorização do Pedro.

## RLS (ADR-001, aceito com ressalvas em 20/11/2026)

- `TenantContext.executar(contexto, fn)` abre `BEGIN` e faz `set_config('app.condominio_id', ..., true)` mais `app.usuario_id`, `app.unidade_id` e `app.papel`. Nunca `SET` de sessão. Sem contexto, zero linhas. Nada de banco fora dele; o pool nunca é usado direto.
- RLS habilitada **e forçada** em toda tabela de tenant; `condominio_id` obrigatório; FKs compostas.
- Auditoria append-only: o aplicativo só faz INSERT e SELECT; gatilho rejeita alteração e exclusão.
- Chaves S3 do storage ignoram RLS: a autorização é da API.

### Identidades de banco (E6, aprovada por Pedro em 20/11/2026)

Provisionamento; `migrador` (dono, sem BYPASSRLS); `app_user` (NOSUPERUSER, NOBYPASSRLS, NOINHERIT, não dono); `app_autenticacao` (só tabelas de credencial e sessão); `fixtures` (BYPASSRLS só em banco descartável). O worker usa `app_user`.

### Exceção aceita

Módulo `autenticacao` com papel próprio e tabelas sem RLS, **listadas no teste de catálogo**. Qualquer outra tabela sem RLS é defeito.

## Sessões (ADR-007, aceito com ressalvas em 20/11/2026; provar na fase 2)

- Access JWT de 15 min (`sub`, `sid`), HS256 na fase 2 (E15, pendente); verificação em função única com `alg`, `iss` e `aud` fixos; `kid` para rotação. Cache de papel de 5 s; `sid` sem cache (E15).
- Refresh opaco, hash SHA-256, rotativo. Retry B+E: o refresh anterior vale uma vez por 30 s enquanto o sucessor não foi usado; reuso fora disso revoga a sessão. Single-flight por processo e trava entre abas.
- `POST /v1/acesso/renovar`. Revogação em sair, troca de senha (encerra as outras) e exclusão LGPD.
- App com expo-secure-store; web com refresh em cookie httpOnly, Secure, SameSite=Lax mais CSRF e access em memória. Senha com Argon2id.
- Lacuna: mecanismo de reautenticação não especificado.
- Papéis não vão no JWT: o papel vem do banco por requisição (cache de 5 s).

## Cuidados de revisão

- Consulta fora de `TenantContext`, `SET` de sessão, role dona ou BYPASSRLS no app, tabela nova sem RLS forçada ou sem `condominio_id`.
- JOIN ou DTO que revele identidade onde há anonimato (ADR-010).
- SECURITY DEFINER é proibido (E7, aprovada por Pedro em 20/11/2026): leituras sem condomínio aberto por políticas explícitas.
