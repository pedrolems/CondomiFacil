# Migrations, seeds e fixtures

Fontes: [ADR-008](../../../../docs/03-arquitetura/adr/008-orm-query-builder-migracoes.md) (**Aceito** com ressalvas em 20/11/2026: Kysely com postgres.js e Flyway, sem Zod) e [estratégia de migrations e seeds](../../../../docs/04-banco-de-dados/03-estrategia-de-migrations-e-seeds.md) (Proposta). Hoje **Implementado** só [README de migrações](../../../../backend/apps/api/db/migracoes/README.md) e [README de seeds](../../../../backend/apps/api/db/seeds/README.md). Exemplo de forma descartável: `pocs/rm-16/p5/migracoes/`.

## 1. Flyway

| Item | Definição | Estado |
| --- | --- | --- |
| Ferramenta | Flyway 13.12.2 OSS, SQL-first, sem undo, forward-only, sequência única | Aceito (ADR-008) |
| Pasta | `backend/apps/api/db/migracoes/`, prevendo `backfills/`, `seeds/`, `verificacoes/` e `flyway.conf` | Proposta; ainda não existe |
| Nome | `VAAAAMMDDNNNN__descricao_sem_acentos.sql`, UTF-8, LF | Proposta |
| Imutabilidade | Migration aplicada em ambiente compartilhado não se altera | Proposta |
| Configuração | `defaultSchema=infra_migracoes`, `schemas=infra_migracoes,condomifacil,extensoes`, `validateOnMigrate=true`, `ignoreMigrationPatterns` vazio, `outOfOrder=false`, `baselineOnMigrate=false`, `cleanDisabled=true`, `mixed=false`, `postgresql.transactional.lock=false` | Proposta |
| Índice concorrente | `CONCURRENTLY` em arquivo próprio com `.conf` `executeInTransaction=false`, reexecutável (drop e create), checando índice inválido | Proposta |
| Tempo | `lock_timeout` e `statement_timeout` por migration | Proposta |
| Execução | Só o papel migrador, etapa separada do deploy, conexão direta ou pooler em modo session | Proposta |
| Compatibilidade | Expandir e contrair, compatível com duas versões da API, worker, outbox e clientes offline | Proposta |
| Backfill | Script separado, em lote com cursor estável e retomada idempotente, sem OFFSET | Proposta |
| Proibições | `UPDATE` genérico em dinheiro, score, voto e auditoria; `repair` automático; baseline | Proposta |
| Tabela de condomínio | Nasce com `condominio_id`, FKs compostas, RLS habilitada e forçada e políticas completas na mesma migration | Proposta |
| Tipos | kysely-codegen gera os tipos a partir do esquema migrado | Aceito (ADR-008) |
| CI | Job `banco` com `postgres:17` e `flyway/flyway:13.12.2` por digest | Pendente (E18); não existe |

Nunca aplique migration em banco remoto (Supabase de dev, staging ou produção) sem autorização do Pedro repassada pelo orquestrador.

Referências oficiais: [Flyway](https://documentation.red-gate.com/flyway), [kysely-codegen](https://github.com/RobinBlomberg/kysely-codegen).

## 2. Seeds e fixtures (estratégia seção 6; Proposta)

| Classe | Como | Onde |
| --- | --- | --- |
| Catálogos | Migration versionada | Todos os ambientes |
| Fixtures de teste | Factories TypeScript com IDs e relógio controlados; UUID determinístico por namespace + chave lógica; namespace repetido rejeitado | Bancos descartáveis de teste |
| Base fictícia de aceitação manual | Três condomínios fictícios com pelo menos 2 unidades cada, carregados pela identidade fixtures | Banco local ou descartável |

Regras:

- Migration não carrega dado de demonstração.
- Não crie admin humano nem senha global para satisfazer FK. `registrado_por_id` nulo só com `origem='carga_versionada'`: **Pendente** (E4).
- Primeiro Admin da plataforma só como fixture: **Pendente** (E5).
- Cada unidade ocupada com exatamente um habilitado nas factories.
- A fixture carrega a pré-condição; o teste chama a ação real.
- E-mails em domínio reservado; seed não chama Asaas, Resend, push nem webhook.
- Piloto e produção nunca recebem seed, reset ou limpeza; o executor valida ambiente e identidade do banco antes de qualquer DML.
- Comandos `db:seed` e `db:verificar` são ilustrativos; não existem.
- Identidade de fixtures: BYPASSRLS só em banco descartável (E6, aprovada por Pedro em 20/11/2026). Identidade de backfill: a definir antes do primeiro backfill.
