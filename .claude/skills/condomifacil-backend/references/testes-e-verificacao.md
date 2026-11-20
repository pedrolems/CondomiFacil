# Testes e verificação

Fontes: [01-backend.md](../../../../docs/05-backend/01-backend.md) (linhas 365-375), [ADR-001](../../../../docs/03-arquitetura/adr/001-multi-tenant-rls.md), [pacote da fase 2](../../../../docs/09-infra/pacote-tecnico-fase-2.md). Referências externas: [Vitest](https://vitest.dev), [NestJS: testes](https://docs.nestjs.com/fundamentals/testing).

## Comandos (existem hoje)

| Comando | Uso |
| --- | --- |
| `pnpm check` | turbo: lint, gerar-contratos, typecheck, build, test, verificar-contratos |
| `pnpm lint` | ESLint |
| `pnpm lint:openapi` | Redocly sobre `docs/05-backend/api/openapi/*.yaml` |
| `pnpm format:check` | Prettier (lista explícita de caminhos no `package.json`) |
| `pnpm dev:api` | API em desenvolvimento |
| no pacote da API | `dev` (tsx watch), `typecheck`, `build`, `test` (vitest run) |

CI (`.github/workflows/ci.yml`): instalação com lockfile congelado, `check`, `test:a11y`, `format:check`, `lint:openapi` e gitleaks.

## O que existe nos testes

Implementado: `test/config.test.ts` e `test/e2e/saude.e2e.test.ts` (Vitest). As pastas `test/isolamento`, `test/integracao` e `test/e2e` têm README; não há teste de banco ainda.

## Camadas (proposta; isolamento obrigatório no CI pelo ADR-001)

1. **Unidade por caso de uso**: relógio injetável e portas falsas; dublê de adaptador (gateway fora do ar, reembolso falho).
2. **Integração**: Postgres real como `app_user`, com migrations aplicadas pelo papel dono. Nunca teste RLS com o papel dono ou BYPASSRLS.
3. **Isolamento de tenant** (obrigatório): catálogo de RLS (toda tabela de tenant com RLS habilitada e forçada; exceções do módulo `autenticacao` listadas), dois condomínios em leitura e escrita, sem contexto (zero linhas), vazamento entre requisições no pool, jobs, WebSocket e arquivos.
4. **Vazamento de identidade por DTO** (ADR-010, proposto): voto, reclamação e avaliação.
5. **Rotinas**: duas execuções com o mesmo resultado, fuso, fan-out isolado.
6. **E2E**: borda completa, erro no formato padrão com `request_id`.

## Cenários mínimos por tipo de mudança

| Mudança | Teste |
| --- | --- |
| Rota nova | Sem token (401), papel errado (403), outro condomínio (404 idêntico), corpo inválido (400), caso feliz |
| Operação que cobra ou reserva | Mesma chave e mesmo corpo repetem a resposta; corpo diferente dá 422; falha no meio desfaz ato, auditoria e evento |
| Webhook | Token inválido (401), evento repetido sem baixa duplicada, evento sem correlação em quarentena |
| Sessão | Refresh dentro e fora dos 30 s, reuso revoga a sessão, troca de senha encerra as outras |
| Estado | Transição inválida em 409 `<MODULO>_ESTADO_INVALIDO`; prazo ou mês fechado em 422 |
| Tabela nova | Entra no catálogo de RLS |

## Estado das provas

PoCs P2 a P5 aprovadas e aceitas em 20/11/2026 (código descartável em `pocs/rm-16/`, fora do workspace). A prova do retry de refresh de 30 s (ADR-007) **fica para a fase 2**.

## Regras

- Dados fictícios; sem segredo em teste; nenhum acesso a Render, Supabase remoto ou Asaas real.
- Registre o resultado real de cada verificação e o que não foi executado.
