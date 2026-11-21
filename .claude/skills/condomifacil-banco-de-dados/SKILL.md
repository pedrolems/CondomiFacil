---
name: condomifacil-banco-de-dados
description: Orienta quem modela, escreve ou revisa o banco do CondomiFacil (PostgreSQL com RLS por condominio_id, migrations Flyway, identidades de banco, seeds e fixtures, testes de banco, anonimização e retenção). Use ao modelar ou alterar tabela, escrever migration, criar ou revisar política de RLS, preparar seed ou fixture, escrever teste de banco, revisar banco e ao responder dúvidas de modelo de dados.
---

# Banco de dados do CondomiFacil

Estado em 21/11/2026: **não existe banco de produto.** `backend/apps/api/db/` só tem `migracoes/README.md` e `seeds/README.md`; não há DDL, `flyway.conf`, compose, seeds, factories, scripts `db:*` nem job de banco no CI. A única forma executada é a PoC descartável em `pocs/rm-16/` (P3 e P5): serve de exemplo de forma, nunca de produto. O [MER/DER](../../../docs/04-banco-de-dados/01-mer-e-der.md) é proposta de 08/11/2026, não aceita. As decisões E1 a E22 da fase 2 foram **aprovadas em A (20 e 21/11/2026)** e o código da fase 2 está liberado, na ordem RM-25 e RM-24, RM-20 e RM-21, RM-23 e RM-22, com commit por pacote RM aprovado por Pedro ([pacote da fase 2](../../../docs/09-infra/pacote-tecnico-fase-2.md), seção 7). Idioma: português do Brasil.

Legenda usada aqui e nas referências: **Implementado** (existe no repositório como produto), **Aceito** (Pedro, com data), **Proposta** (documentada, não aceita), **Pendente** (P-* ou lacuna).

O banco é deste papel (`engenheiro-de-dados`); o backend consome o esquema migrado e os tipos gerados. Contexto de sessão, `TenantContext` e uso do Kysely pela API estão na skill irmã: [dados, RLS e sessões](../condomifacil-backend/references/dados-rls-e-sessoes.md). Não duplique aqui.

## 1. Antes de modelar ou migrar

Anote, em uma linha cada:

1. **Entidade e domínio do MER** (seção 4.x) e se é de condomínio (C) ou global (G).
2. **Invariante** que a tabela protege (MER seção 5) e o RN/RF que a sustenta.
3. **Recorte**: está no recorte da fase 2 (pacote, seção 3.1; E1 aprovada por Pedro em 20/11/2026)? Se não, pare.
4. **Acesso**: quem lê, quem escreve, quem apaga (política de acesso); unidade e papel.
5. **Estado da decisão**: aceito, proposta ou pendente (E*, P-*).

Decisão de modelo, regra de acesso, ampliação de escopo ou conflito entre fontes: **pergunte ao orquestrador/Pedro** com opções, consequências e recomendação, e pause até a resposta (AGENTS.md).

## 2. Fontes de trabalho

Leia por seção (os docs são grandes).

1. Modelo: [MER/DER](../../../docs/04-banco-de-dados/01-mer-e-der.md) (seção 2 convenções, 4 dicionário, 5 invariantes, 6 anonimização e retenção, 9 pendências, 10 critérios do modelo físico).
2. Acesso: [política de acesso a dados](../../../docs/04-banco-de-dados/02-politica-de-acesso-a-dados.md) e [ADR-001](../../../docs/03-arquitetura/adr/001-multi-tenant-rls.md) (aceito com ressalvas em 20/11/2026).
3. Migrations e seeds: [estratégia](../../../docs/04-banco-de-dados/03-estrategia-de-migrations-e-seeds.md) e [ADR-008](../../../docs/03-arquitetura/adr/008-orm-query-builder-migracoes.md) (aceito com ressalvas em 20/11/2026).
4. Fase 2: [pacote técnico](../../../docs/09-infra/pacote-tecnico-fase-2.md) (recorte, identidades, E1 a E22 aprovadas em A). PoCs: [critérios e resultados](../../../docs/03-arquitetura/criterios-de-poc.md), [relatório P3](../../../pocs/rm-16/p3/RELATORIO.md), [relatório P5](../../../pocs/rm-16/p5/RELATORIO.md).
5. Privacidade: [LGPD](../../../docs/07-seguranca/lgpd.md), [segurança](../../../docs/07-seguranca/seguranca.md). Testes: [plano de testes](../../../docs/08-qualidade/01-plano-de-testes.md).
6. Regra de negócio: [Regras de Negócio](../../../docs/01-produto/03-regras-de-negocio.md) e [PRD](../../../docs/01-produto/02-prd.md).
7. Oficiais: [Row Security Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html), [CREATE POLICY](https://www.postgresql.org/docs/current/sql-createpolicy.html), [EXCLUDE](https://www.postgresql.org/docs/current/sql-createtable.html#SQL-CREATETABLE-EXCLUDE) e [btree_gist](https://www.postgresql.org/docs/current/btree-gist.html), [Flyway](https://documentation.red-gate.com/flyway), [kysely-codegen](https://github.com/RobinBlomberg/kysely-codegen), [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security).

Referências desta skill: [modelo e convenções](references/modelo-e-convencoes.md), [RLS e identidades](references/rls-e-identidades.md), [migrations, seeds e fixtures](references/migrations-seeds-e-fixtures.md), [testes, retenção e pendências](references/testes-retencao-e-pendencias.md).

## 3. Regras duras

- **Tabela de condomínio nasce completa na mesma migration**: `condominio_id uuid NOT NULL`, `UQ(condominio_id, id)`, FKs compostas, RLS habilitada **e forçada** e políticas completas (estratégia, proposta; base aceita no ADR-001).
- **Nenhuma FK cruza condomínio**; FK para `usuario` não concede acesso.
- **Contexto só por `set_config(..., true)` dentro da transação**; nunca `SET` de sessão. Sem contexto, zero linhas (ADR-001).
- **Nunca combine políticas que ampliem por OR**; `condominio_id` nulo nunca é acesso a todos; ler não basta para apagar.
- **Identidades separadas, privilégio mínimo**: `app_user` sem BYPASSRLS e não dono; credencial dona nunca no aplicativo (cinco identidades, E6 aprovada por Pedro em 20/11/2026).
- **Flyway forward-only, sequência única**; migration aplicada em ambiente compartilhado é imutável; `repair` nunca automático; sem sincronização pelo ORM (ADR-008).
- **Dinheiro, voto, score e auditoria**: sem `UPDATE` genérico, sem `ON DELETE CASCADE`; correção por estorno ou novo registro; dinheiro em inteiro `_centavos`.
- **Seeds só fictícios e determinísticos**; piloto e produção nunca recebem seed, reset ou limpeza.
- Nada de extensão além de `btree_gist` (pacote, proposta) sem autorização. **Nunca aplique migration em banco remoto** sem autorização do Pedro repassada pelo orquestrador.
- Não invente prazo de retenção, nome de constraint ou tipo de enum que os docs não definem: registre como pendente.

## 4. Passo a passo de uma tabela nova de condomínio

Proposta das fontes acima; só após o aceite das E que faltam (E1, E6, E7 e E17 já aprovadas em 20/11/2026).

1. **Invariante no MER**: localize a entidade (seção 4.x), suas FKs, cardinalidades e a invariante (seção 5). Se faltar no MER, pare e reporte.
2. **Colunas**: `id uuid` PK, `condominio_id uuid NOT NULL`, tipos conforme [convenções](references/modelo-e-convencoes.md) (`_centavos`, `instante` x `data`, vigência `[inicio, fim)`, estados em texto, autoria imutável, `_protegido`).
3. **Constraints**: `UQ(condominio_id, id)`; FK composta `(condominio_id, x_id) -> destino(condominio_id, id)`; CHECK, UNIQUE parcial ou EXCLUDE para a invariante; índices explícitos para as FKs e consultas.
4. **RLS na mesma migration**: `ENABLE` e `FORCE ROW LEVEL SECURITY`, política `tenant` com USING e WITH CHECK, políticas adicionais de unidade/papel sem OR que amplie, `GRANT` mínimo ao `app_user` ([RLS e identidades](references/rls-e-identidades.md)).
5. **Migration**: arquivo `VAAAAMMDDNNNN__descricao_sem_acentos.sql`, UTF-8, LF, com `lock_timeout` e `statement_timeout`; aplicar em banco local limpo ([migrations](references/migrations-seeds-e-fixtures.md)).
6. **Teste de catálogo**: a tabela aparece com RLS habilitada, forçada e com política; só as exceções listadas ficam de fora.
7. **Testes de acesso**: dois condomínios em leitura e escrita, sem contexto zero linhas, escrita cruzada rejeitada, como `app_user` real ([testes](references/testes-retencao-e-pendencias.md)).
8. **Tipos**: rodar o kysely-codegen sobre o esquema migrado e entregar os tipos ao backend.
9. **Fixture**: factory com UUID determinístico e pré-condição mínima; o teste chama a ação real.

## 5. Verificação antes de entregar

- [ ] Migrations aplicadas do zero em PostgreSQL 17 local (Docker), repetição sem reaplicar, `validate` estrito.
- [ ] Catálogo de RLS: habilitada, forçada e com política em toda tabela de condomínio; exceções listadas.
- [ ] `app_user` sem BYPASSRLS, não dono; acesso negado testado com ele.
- [ ] Dois condomínios, sem contexto, vazamento no pool após erro e rollback.
- [ ] Invariantes concorrentes testadas com conexões independentes quando houver.
- [ ] Nenhum `CASCADE` sobre voto, reclamação ou dinheiro; nenhum dado real; nenhum comando em banco remoto.
- [ ] Tipos do kysely-codegen regenerados; nada afirmado como existente que não está no repositório; propostas rotuladas.

## 6. Rastreabilidade e entrega

- Cite entidade do MER, invariante, RN, RF, ADR, E e P-* que sustentam a mudança. Mudou o modelo: MER, política e estratégia na mesma alteração (autorizada).
- Informe: arquivos alterados, verificações e resultados reais (versão do PostgreSQL, contagem de testes), pendências e limitações. Não commite nem faça push sem aprovação do Pedro e indicação da branch.

## Divergências resolvidas

As divergências registradas na criação desta skill foram resolvidas por Pedro em 20/11/2026: fixtures com BYPASSRLS só em banco descartável (E6); sem `SECURITY DEFINER` (E7); `condominio` é tabela de condomínio com RLS própria; auditoria append-only virou invariante do MER; exclusão de avulso só em mês aberto, com auditoria (RN-FI-27); `lotacao_funcionario` e `funcionario_portaria` fora do recorte (E1); schemas `condomifacil`, `infra_migracoes` e `extensoes`. Continuam abertos: identidade de backfill e forma física da exclusão de avulso. Nova divergência: registre aqui e pergunte ao Pedro.
