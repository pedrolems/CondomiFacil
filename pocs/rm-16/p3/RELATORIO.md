# PoC P3 — RLS multi-tenant (ADR-001), RM-16

Executada em 20/11/2026 na branch `poc/rm-16`, pasta descartável `pocs/rm-16/p3/` (fora do workspace pnpm). Só dados fictícios, banco local em Docker, nenhum serviço em nuvem (PC-06).

**Pergunta** (`criterios-de-poc.md`, P3): `app_user` sem BYPASSRLS e não dono, FORCE RLS, `set_config(..., true)` por transação e falha fechada isolam os condomínios e cabem no orçamento de desempenho?

**Veredito: APROVADA.** Todos os critérios de aprovação foram atendidos com evidência executável e nenhum critério de reprovação ocorreu. Detalhes e ressalvas abaixo.

## 1. Ambiente e versão do PostgreSQL

| Item | Valor |
| --- | --- |
| PostgreSQL | **17.12** (`postgres:17`, imagem oficial do Docker Hub; `select version()` = `PostgreSQL 17.12 (Debian 17.12-1.pgdg13+1)`) |
| Fonte da versão do Supabase | Repositório oficial `supabase/postgres`, arquivo `ansible/postgres_release.yml`: `postgres17: "17.12.0.002"` (também `postgres15` e `orioledb-17`), <https://github.com/supabase/postgres/blob/develop/ansible/postgres_release.yml>. A CLI oficial usa 17 como versão padrão do banco local (`defaultMajorVersion = 17` em `packages/config/src/db.ts` de <https://github.com/supabase/cli>). Consultado em 20/11/2026 |
| PgBouncer | 1.26.1 (`edoburu/pgbouncer:latest`), `pool_mode=transaction`, `default_pool_size=20`, `max_prepared_statements=200` |
| Drivers | pg 8.23.1 e postgres.js (`postgres`) 4.1.1, com lockfile próprio na pasta |
| Node | 26.13.1 via `fnm exec`; testes com `node:test` (sem dependência extra) |
| Máquina | Windows 11 + Docker Desktop 29.9.2 (VM Linux local); cliente e banco na mesma máquina |

**Por que `postgres:17` e não `supabase/postgres`:** a prova depende só de recursos do núcleo do PostgreSQL (RLS, `set_config`, papéis). A imagem do Supabase acrescenta extensões e os papéis `anon`/`authenticated`/`service_role`, que o ADR-001 não usa (a API usa `app_user` próprio e nunca `service_role`). A versão principal e a secundária (17.12) coincidem com a do Supabase.

### Contêineres (deixados rodando para a P5 e a P2)

| Contêiner | Porta do host | Papel |
| --- | --- | --- |
| `poc-rm16-pg` | 54329 | PostgreSQL 17.12, sem volume persistente, banco `p3` |
| `poc-rm16-pgbouncer` | 54330 | PgBouncer em modo transaction apontando para `p3` |

Rede Docker `poc-rm16-net`. Senhas fictícias locais (ver `sql/00-papeis.sql` e `subir.sh`). Superusuário `postgres` / `postgres_local_ficticia` só para preparar o ambiente e limpar depois da carga; nunca usado pela "API".

## 2. Como reproduzir

```sh
cd pocs/rm-16/p3
fnm exec --using 26.13.1 -- pnpm.cmd install --ignore-workspace   # Windows; em sh: pnpm install --ignore-workspace
sh subir.sh --recriar        # recria contêineres, papéis, esquema e fixtures (~1 min); sem --recriar se não existirem
fnm exec --using 26.13.1 -- node --test --test-concurrency=1 test/   # catálogo, isolamento e 404
fnm exec --using 26.13.1 -- node carga/explain.mjs                    # grava resultados/explain.txt
fnm exec --using 26.13.1 -- node carga/carga.mjs pg direto 30         # driver: pg | postgres.js; alvo: direto | pooler
fnm exec --using 26.13.1 -- node carga/resumir.mjs                    # mediana de resultados/rodadas/ (copiar cada carga-*.json para rodadas/rN-*.json)
```

Para apagar tudo: `docker rm -f poc-rm16-pgbouncer poc-rm16-pg && docker network rm poc-rm16-net`.

### Arquivos

| Arquivo | Conteúdo |
| --- | --- |
| `subir.sh` | Sobe/recria os contêineres e aplica os SQL na ordem |
| `sql/00-papeis.sql` | Identidades separadas: `migrador` (dono, migrations), `app_user` (API/worker), `fixtures` (carga local) |
| `sql/01-esquema.sql` | Esquema mínimo inspirado no MER: `condominio`, `unidade`, `portaria`, `visita`; FKs compostas; RLS habilitada e forçada; políticas; privilégios mínimos |
| `sql/02-fixtures.sql` | 100 condomínios; o "Grande" com 5.000 unidades, 10 portarias e 1,8 mi de visitas (180 dias); 99 com 150 unidades; total 19.850 unidades e 2.245.500 visitas |
| `src/tenant-db.mjs` | `TenantContext` mínimo para os dois drivers: `BEGIN`, `set_config(..., true)` de `app.condominio_id`, `app.unidade_id` e `app.papel`, consulta, `COMMIT`/`ROLLBACK` |
| `src/api.mjs` | Servidor HTTP mínimo com a regra zero linhas -> 404 |
| `test/catalogo.test.mjs` | Catálogo de RLS e papel da aplicação |
| `test/isolamento.test.mjs` | Isolamento em leitura e escrita, sem contexto, vazamento de contexto e controle negativo, repetido para 2 drivers x 2 ligações |
| `test/api-404.test.mjs` | 404 indistinguível |
| `carga/carga.mjs` | Carga RNF-17 com verificação de isolamento em cada resposta |
| `carga/resumir.mjs` | Mediana das rodadas em tabela Markdown |
| `carga/explain.mjs` | `EXPLAIN (ANALYZE, BUFFERS)` das consultas críticas, com linha de base sem RLS |
| `resultados/` | Saídas reais: `explain.txt`, `carga-*.json` (última rodada de cada combinação) e `rodadas/` (3 rodadas intercaladas) |

## 3. Desenho provado

- `app_user`: `NOSUPERUSER NOBYPASSRLS NOINHERIT`, não é dono de nada, sem `TRUNCATE` (que ignora RLS), `REFERENCES` ou `TRIGGER`. Tabelas pertencem a `migrador`.
- Toda tabela com `ENABLE` e `FORCE ROW LEVEL SECURITY`. Políticas `FOR ALL TO app_user` com `USING` e `WITH CHECK` iguais: `condominio_id = app.condominio_atual()` (em `condominio`, `id = ...`). Outros papéis sem BYPASSRLS, inclusive o dono, caem no "negar por padrão".
- `app.condominio_atual()` é função SQL `STABLE` sem `SECURITY DEFINER` que devolve `nullif(current_setting('app.condominio_id', true), '')::uuid`; o PostgreSQL a incorpora na consulta e a usa como condição de índice. Contexto ausente vira `NULL` e nenhuma linha casa (falha fechada).
- Segundo nível **ilustrativo** em `visita` (política `RESTRICTIVE`): porteiro e síndico veem o condomínio; morador só a própria unidade; papel ausente = nada. Serve para medir o custo de uma política restritiva, não é a matriz de permissões final.
- FKs compostas `(condominio_id, unidade_id)` e `(condominio_id, portaria_entrada_id)`.

## 4. Critérios de aprovação

Saída real da suíte (`node --test`, 20/11/2026): **34 testes, 34 aprovados, 0 falhas** (5 de catálogo, 1 de 404, 7 de isolamento x 4 combinações driver/ligação); rodada de novo depois das cargas, mesmo resultado.

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Catálogo: RLS habilitada, forçada e com política em toda tabela | **Aprovado** | `catalogo.test.mjs`: varre `pg_class` de todos os esquemas não sistêmicos (`app.condominio, app.portaria, app.unidade, app.visita`), exige `relrowsecurity`, `relforcerowsecurity` e política permissiva cobrindo todos os comandos; inventário de exceções globais vazio. Também: nenhuma função `SECURITY DEFINER` no esquema |
| `app_user` sem BYPASSRLS e não dono | **Aprovado** | `rolsuper=false, rolbypassrls=false, rolcreaterole=false, rolcreatedb=false`, 0 papéis herdados, 0 relações/esquemas/funções próprias; sem `TRUNCATE`/`REFERENCES`/`TRIGGER`. Tentativas como `app_user`: `ALTER TABLE ... DISABLE/NO FORCE ROW LEVEL SECURITY` e `TRUNCATE` recusados (42501); com `SET row_security = off` a consulta é recusada (42501) em vez de ignorar a política |
| Dois tenants em leitura | **Aprovado** | Em A: só o próprio condomínio, 5.000 unidades, 10 portarias, 0 visitas de outro condomínio, `where id = <visita de B>` vazio, `where condominio_id = B` = 0. Em B: 150 unidades, 150 visitas de hoje, visita de A invisível |
| Dois tenants em escrita | **Aprovado** | Em A: `INSERT` com `condominio_id` de B -> 42501 (`WITH CHECK`); `INSERT` em A com unidade de B -> 23503 (FK composta); entrada com portaria de B -> 23503; `UPDATE` e `DELETE` da visita de B -> 0 linhas; mover visita de A para B -> 42501; conferido em B que a linha ficou intacta. Escrita legítima seguida de erro é desfeita pelo rollback |
| Sem contexto = zero linhas | **Aprovado** | Sem `set_config`: 0 linhas nas 4 tabelas e `INSERT` recusado (42501). Só com condomínio, sem papel: 0 visitas (a restritiva também fecha). `EXPLAIN` sem contexto: varredura de índice com chave nula, 0,08 ms |
| `set_config(..., true)` por transação, sem vazamento ao reutilizar conexão, inclusive após erro e rollback | **Aprovado** | Pool de 1 conexão: depois de transação com contexto A (commit) e de transação com erro (rollback), a próxima transação na **mesma** conexão física (mesmo `pg_backend_pid`, verificado na ligação direta) lê `app.*` vazios e 0 visitas. Dois clientes distintos atrás do PgBouncer: o cliente Y reutilizou a conexão de servidor que o cliente X acabara de usar com contexto em **30/30** iterações (pg e postgres.js) e nunca herdou contexto. **Controle negativo:** com `set_config(..., false)` (sessão) o contexto vaza para a próxima transação na ligação direta e para **outro cliente** no PgBouncer; o teste detecta, o que prova que ele não é cego e justifica proibir `SET` de sessão |
| 404 e não 403 | **Aprovado** | `api-404.test.mjs`: visita própria = 200; visita de B, UUID inexistente e ID malformado devolvem a mesma resposta, byte a byte: `404 {"codigo":"recurso_nao_encontrado","mensagem":"Recurso não encontrado."}`. Regra: zero linhas sob RLS = 404 |
| Carga RNF-17 mantendo RNF-01 e RNF-05, com `EXPLAIN` | **Aprovado, com ressalvas da seção 7** | Seção 5 |

Critérios de reprovação: **nenhum ocorreu**. Zero cruzamento de tenant em testes e em todas as respostas verificadas sob carga; a "API" e a carga usam só `app_user` (nunca dono nem `service_role`); RNF-01 com folga.

## 5. Carga RNF-17 e EXPLAIN

### Cenário (`carga/carga.mjs`, perfil pior caso, sem tempo de pensar)

- Condomínio "Grande": 5.000 unidades, 10.000 visitas no dia, 1,8 mi no histórico.
- 10 portarias simultâneas no Grande: lista do dia (top 50 de `esperada`/`dentro`) + registro de entrada (`UPDATE` condicional), em laço contínuo.
- 20 moradores simultâneos no Grande (papel morador, unidade sorteada): cria visita + lista as visitas da unidade.
- 20 trabalhadores em outros 99 condomínios: lista do dia + tentativa de ler visita do Grande pelo ID (tem de voltar vazia).
- Pool de 20 conexões por processo; 50 trabalhadores concorrendo. Latência medida pela transação inteira do `TenantContext`: espera no pool + `BEGIN` + `set_config` + consulta + `COMMIT`.
- Em cada resposta: toda linha da portaria tem de ser do Grande; toda linha do morador, da unidade dele; toda tentativa de leitura alheia, vazia.
- Visibilidade na portaria (parte do banco no RNF-05): tempo entre o commit da visita criada pelo morador e a primeira lista de portaria que a contém.

### Resultado (3 rodadas de 30 s por combinação, intercaladas; mediana por coluna; `carga/resumir.mjs`)

| Driver | Ligação | Transações/s | p50 ms | p95 ms | p99 ms | máx ms (pior rodada) | p95 visibilidade ms | máx visibilidade ms (pior rodada) | erros | cruzamentos |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| pg | direto | 977,2 | 29,08 | 201,34 | 315,42 | 1.647,02 | 64,69 | 577,60 | 0 | 0 |
| pg | PgBouncer | 985,3 | 37,09 | 140,20 | 364,63 | 1.933,42 | 90,52 | 663,24 | 0 | 0 |
| postgres.js | direto | 1.446,1 | 29,47 | 63,60 | 120,61 | 485,78 | 52,63 | 372,49 | 0 | 0 |
| postgres.js | PgBouncer | 1.515,5 | 27,46 | 57,07 | 104,58 | 1.458,82 | 46,82 | 347,71 | 0 | 0 |

Por rodada (transações/s; p95 geral em ms): pg direto 660 / 201; 1.497 / 58; 977 / 309. pg PgBouncer 666 / 257; 985 / 82; 1.060 / 140. postgres.js direto 1.399 / 64; 1.930 / 42; 1.446 / 64. postgres.js PgBouncer 1.153 / 89; 1.863 / 40; 1.516 / 57. Arquivos em `resultados/rodadas/`.

- **RNF-01 (95% abaixo de 500 ms): mantido.** O pior p95 de todas as 12 rodadas foi 308,74 ms (pg direto, rodada 3), já contando a espera de 50 trabalhadores por 20 conexões. Houve picos isolados acima de 500 ms (máx. 1,9 s), atribuídos ao ambiente (Windows + VM do Docker, `vacuum`/checkpoint); o p99 mediano ficou abaixo de 500 ms nas 4 combinações e o p95 não foi afetado.
- **RNF-05 (até 5 s), parte do banco: mantida.** A visita criada pelo morador apareceu na lista da portaria com p95 de 47 a 91 ms e máximo de 663 ms. Das milhares de visitas criadas por rodada, de 0 a 12 nunca entraram no top 50 da portaria, porque o perfil pior caso cria visitas mais rápido do que a lista de 50 mostra; não é erro de isolamento.
- **Isolamento sob carga:** 0 cruzamentos e 0 erros em 454.598 transações nas 12 rodadas. Antes delas houve 5 rodadas exploratórias (1 de 15 s e 4 de 30 s), também com 0 cruzamentos e 0 erros; `resultados/carga-*.json` guarda só a última execução de cada combinação (igual à rodada 3).
- O estado do banco é restaurado ao fim de cada rodada (visitas da carga removidas, entradas desfeitas, `vacuum analyze`); conferido depois da última: 6.000 esperadas, 2.000 dentro, 1.000 saíram, 1.000 canceladas hoje no Grande, 0 visitas de carga.

### EXPLAIN (`resultados/explain.txt`, como `app_user` no TenantContext, condomínio Grande)

| Consulta | Plano sob RLS | Execução sob RLS | Sem RLS (linha de base) |
| --- | --- | --- | --- |
| Q1 lista do dia da portaria (top 50) | Bitmap em `visita_lista_do_dia` (`condominio_id`, `dia`) + ordenação top-N de 8.000 linhas | 4,13 ms | 0,10 ms (varredura ordenada do índice, para em 50) |
| Q2 registrar entrada | Índice da PK; política como filtro | 0,13 ms | — |
| Q3 morador cria visita | `INSERT` + checagem das FKs compostas | 0,32 ms | — |
| Q4 visitas da unidade (morador) | Bitmap em `visita_por_unidade` (`condominio_id`, `unidade_id`, `dia`) | 0,14 ms | 0,04 ms |
| Q5 busca por ID de outro condomínio (404) | Índice da PK; 1 linha removida pelo filtro da política | 0,03 ms | 0,02 ms |

O predicado da política vira `Index Cond` nos índices que começam por `condominio_id`: a RLS não força varredura sequencial nas consultas críticas.

**Achado de desempenho (não bloqueia):** na Q1 o planejador estima 1 linha sob RLS (real: 8.000) e troca a varredura ordenada do índice por bitmap + ordenação. Causas: o valor de `app.condominio_atual()` só é conhecido na execução, então o planejador usa a seletividade média (1/100 dos condomínios), enquanto o Grande tem 80% das visitas; e a política restritiva multiplica uma seletividade padrão. Custa cerca de 4 ms e cresce linearmente com as visitas do dia do condomínio (10.000 aqui). Testados sem efeito: filtro explícito `condominio_id = <literal>` junto da RLS e índice parcial por estado. Mitigações que preservam a RLS, para avaliar na fase 2 se a lista crescer: paginação por cursor (`criada_em < $cursor`), lista restrita a blocos atendidos, ou reescrever a política de segundo nível para ser estimável. Nada disso relaxa a RLS.

## 6. Comparação de drivers e de ligação

| Aspecto | pg 8.23.1 | postgres.js 4.1.1 |
| --- | --- | --- |
| Isolamento (34 testes, carga) | Aprovado direto e via PgBouncer | Aprovado direto e via PgBouncer |
| Transação com contexto | Manual: `pool.connect()`, `BEGIN`, `set_config`, `COMMIT`/`ROLLBACK`, `release`; descartar a conexão se o rollback falhar | `sql.begin(fn)` faz `BEGIN`/`COMMIT`/`ROLLBACK` e devolve a conexão; menos código para errar |
| Risco de furar o TenantContext | `pool.query()` fora de transação é fácil de chamar | consulta pelo `sql` raiz fora de `begin` também é fácil; os dois precisam da regra de lint do ADR-001 item 4 |
| Desempenho sob carga (mediana) | 977 a 985 transações/s; p95 140 a 201 ms | 1.446 a 1.516 transações/s; p95 57 a 64 ms |
| Prepared statements | Não nomeados por padrão (`parse` a cada consulta) | Nomeados (`prepare: true`); via pooler exige suporte do pooler (aqui `max_prepared_statements=200`) |
| Ecossistema (P5b) | Driver padrão do Kysely (`PostgresDialect`) e suportado pelo Drizzle | Suportado pelo Drizzle; no Kysely depende de dialeto da comunidade (confirmar na P5b) |

| Aspecto | Direto | PgBouncer (transaction) |
| --- | --- | --- |
| Isolamento | Aprovado | Aprovado; `set_config(..., true)` é por transação, compatível com o modo transaction |
| Vazamento por `SET` de sessão (controle negativo) | Vaza para a próxima transação da mesma conexão do pool | Vaza para **outro cliente** que recebe a mesma conexão de servidor: proibir `SET` de sessão é obrigatório com pooler |
| Desempenho | Sem diferença consistente acima do ruído entre rodadas | Idem; multiplexa conexões, o que importa no plano gratuito |

Ressalva: a variação entre rodadas foi grande (pg direto de 660 a 1.497 transações/s) e na rodada 2 o pg chegou perto do postgres.js; a vantagem do postgres.js foi consistente na mediana, mas a margem exata é sensível ao ambiente.

**Recomendação:** os dois drivers passam no isolamento; a escolha não muda a segurança. Recomendo **postgres.js**, pelo desempenho medido (cerca de 1,5x a vazão e p95 cerca de 2,5x menor nesta carga) e pela transação com rollback automático, **condicionado à P5b**: se o query builder escolhido (kysely ou drizzle) não tiver integração mantida com postgres.js, usar **pg**, que também cumpre RNF-01 com folga. Com pooler, confirmar o suporte a prepared statements do pooler real ou usar `prepare: false`.

## 7. Riscos e limitações

- **Latência medida é a do banco + driver**, na mesma máquina, sem rede, sem NestJS, sem TLS e sem a latência real até o Supabase (São Paulo) a partir do Render. RNF-01 é da API inteira: a folga medida é grande, mas a confirmação final é no teste de carga da API (RNF-17 antes do lançamento).
- **RNF-05 provado só na parte do banco** (visibilidade sob RLS). O canal real (outbox + Socket.IO, AsyncAPI) não foi exercitado.
- **Plano gratuito do Supabase não foi medido** (limite de conexões e CPU menores). O PgBouncer local imita o pooler em modo transaction; o pooler do Supabase (Supavisor) não foi testado. Prepared statements através do pooler funcionaram aqui com `max_prepared_statements`; no pooler do Supabase isso precisa ser confirmado (se não houver suporte, usar `prepare: false` no postgres.js).
- **Ruído do ambiente**: Windows + Docker Desktop; houve variação entre rodadas (por isso 3 rodadas intercaladas e mediana).
- **Segundo nível ilustrativo**: a política de unidade/papel é exemplo; a matriz real depende da regra de acesso (fora do escopo da PoC).
- **Esquema mínimo**: 4 tabelas. O teste de catálogo é genérico e deve rodar no CI a cada migration (ADR-001, riscos). Não cobre visões, funções `SECURITY DEFINER` de travessia (administradora com vários condomínios, jobs globais), WebSocket, arquivos nem jobs.
- **`TenantContext` como único caminho** (ADR-001 item 4) não foi provado: a regra de lint que proíbe usar o pool direto fica para a P5b/fase 2. O controle negativo mostra o risco real: com pooler, `SET` de sessão vaza para outro cliente.
- **Superusuário** só aparece nos scripts de preparação/limpeza da PoC; nenhuma credencial dona ou BYPASSRLS chega ao caminho da "API".
- **Fixtures**: horários de hoje são relativos ao momento da carga (`now()`); se `subir.sh` rodar perto da meia-noite UTC, a lista do dia muda.
- Imagem `edoburu/pgbouncer:latest` (comunitária, não oficial do PgBouncer) sem fixar digest; registrada a versão 1.26.1.
