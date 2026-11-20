# PoC P5 — Migrations (P5a) e acesso a dados (P5b), RM-16

Executada em 20/11/2026 na branch `poc/rm-16`, na pasta descartável `pocs/rm-16/p5/`, fora do workspace pnpm. Usa só dados fictícios e banco local em Docker, sem serviço em nuvem (PC-06). Reaproveita o contêiner da P3 (`poc-rm16-pg`) com bancos próprios (`p5` e temporários `p5a_*`), sem tocar no banco `p3`.

**Perguntas** (`criterios-de-poc.md`, P5):

- **P5a:** o Flyway 13.12.2 Community (MS-01) atende histórico com checksum, lock com `transactional.lock=false` e migradores concorrentes, SSL e modo de conexão, arquivo não transacional e reconexão, sem recurso pago?
- **P5b:** Kysely 0.29.9 ou Drizzle 0.45.4 atendem os critérios do ADR-008 (linhas 68-70) sem abrir conexão fora do `TenantContext`?

**Veredito**

- **P5a: APROVADA.** Todos os critérios passaram com evidência executável. Não houve recurso pago nem lock não confiável. Há dois achados que viram regra da fase 2: validação estrita e `CONCURRENTLY` reexecutável (seção 4).
- **P5b: APROVADA, com as duas bibliotecas.** As quatro combinações (biblioteca x driver) passaram em todos os critérios. Nenhuma biblioteca consulta fora do `TenantContext`, e a seção 5 mostra como isso fica impedido e detectado. **Recomendação: Kysely + postgres.js** (seção 6).

## 1. Versões e fontes

| Item | Versão | Fonte |
| --- | --- | --- |
| Flyway | **13.12.2, "Flyway OSS Edition"** | Imagem oficial `flyway/flyway:13.12.2` do Docker Hub, digest `sha256:99c4dd175ca5e622700e6397c4eadf092d83b5080f5b1340e04e73c9a5d343b5`. A saída de `flyway version` é "Flyway OSS Edition 13.12.2 by Redgate". As notas de versão são as indicadas pela própria CLI (help.red-gate.com, "release notes for flyway engine"). A CLI avisou que existe a 13.13.0; a 13.12.2 é a fixada no briefing |
| Java do Flyway | Temurin **25.0.5** LTS | Vem dentro da imagem (`java -version`); a máquina não precisou de Java |
| Parâmetro do lock | `postgresql.transactional.lock` (padrão `true`; com `false`, usa lock de sessão) | Documentação oficial da Redgate: "Flyway PostgreSQL Transactional Lock Setting" e "Migration transaction handling" (executeInTransaction, detecção automática no PostgreSQL), consultadas em 20/11/2026 |
| PostgreSQL | 17.12 (contêiner da P3) | Igual à P3 |
| kysely | 0.29.9 (`latest`) | Registro npm, consultado em 20/11/2026 |
| kysely-postgres-js | 5.1.0 (06/11/2026; peer `kysely >=0.29 <1`, `postgres >=3.4 <5`) | Registro npm; repositório `kysely-org/kysely-postgres-js`, mantido pelo time do Kysely, fora do pacote principal |
| drizzle-orm | 0.45.4 (`latest`; existe `beta` = 1.0.0-beta.22) | Registro npm |
| pg / postgres.js | 8.23.1 / 4.1.1 | Iguais aos da P3 |
| TypeScript | 6.0.3 (PC-09) | Só para `tsc --noEmit`; os testes rodam `.ts` direto no Node 26 (remoção de tipos) |
| Geradores (só introspecção) | kysely-codegen 0.20.0; drizzle-kit 0.31.11 | Registro npm; ficam em `codegen/`, separados da aplicação |
| Node | 26.13.1 via `fnm exec`; testes com `node:test` | — |
| Supabase (modos de conexão) | — | <https://supabase.com/docs/guides/database/connecting-to-postgres>, consultada em 20/11/2026 |

## 2. Como reproduzir

Pré-requisito: o contêiner `poc-rm16-pg` e a rede `poc-rm16-net` da P3 no ar (`sh ../p3/subir.sh`, se não existirem).

```sh
cd pocs/rm-16/p5
fnm exec --using 26.13.1 -- pnpm.cmd install --ignore-workspace         # Windows; em sh: pnpm install --ignore-workspace
fnm exec --using 26.13.1 -- node scripts/subir.mjs                       # SSL, regra pg_hba, banco p5, Flyway migrate, fixtures
fnm exec --using 26.13.1 -- node --test --test-concurrency=1 test/p5a-flyway.test.mjs          # P5a, cerca de 3 min
fnm exec --using 26.13.1 -- node --test --test-concurrency=1 --test-timeout=60000 test/p5b-importacoes.test.ts test/p5b-catalogo.test.ts test/p5b-acesso.test.ts
fnm exec --using 26.13.1 -- cmd /c "node_modules\.bin\tsc.cmd --noEmit -p ."                  # prova de tipos
fnm exec --using 26.13.1 -- node scripts/verificar-importacoes.mjs                              # regra estática
fnm exec --using 26.13.1 -- node scripts/explorar-pooler.mjs transaction 1                      # Flyway via PgBouncer temporário
```

Para gerar os tipos de novo: em `codegen/`, rodar `pnpm install --ignore-workspace --ignore-scripts` e depois `pnpm run kysely` ou `pnpm run drizzle`. O pnpm 12 termina com `ERR_PNPM_IGNORED_BUILDS` por causa do esbuild do drizzle-kit, mas instala os pacotes, e os dois geradores rodam. Os scripts de instalação não foram liberados.

**Alterações no contêiner compartilhado (persistem até ele ser recriado):**

- `ssl = on` via `ALTER SYSTEM`, com uma CA e um certificado de servidor fictícios gerados dentro do contêiner. O SAN cobre `poc-rm16-pg` e `localhost`, e as chaves privadas não saem do contêiner; só o `ca.crt` vai para `ssl/`, que está no `.gitignore`.
- Primeira linha do `pg_hba.conf`: `hostnossl /^p5 migrador all reject`. Ela vale só para o migrador nos bancos `p5*`; `p3` e `app_user` não mudam.
- Os bancos `p5a_*` são criados e removidos pelos testes. O banco `p5` permanece. O PgBouncer temporário `poc-rm16-p5-pooler` é removido pelo script de exploração.
- Depois dessas alterações, a suíte da P3 rodou de novo sem mudanças: 34 testes, 34 aprovados.

### Arquivos

| Arquivo | Conteúdo |
| --- | --- |
| `migracoes/V1..V3` | Migração de exemplo aplicada pelo Flyway como `migrador` (dono): V1 com base do tenant e RLS forçada; V2 com `btree_gist`, `reserva` com `EXCLUDE`, auditoria e gatilho; V3 não transacional (`CREATE INDEX CONCURRENTLY` + `V3__...sql.conf`) |
| `p5a/*/` | Migrations auxiliares dos cenários da P5a (lock, SSL, queda transacional, CONCURRENTLY ingênuo e seguro, sem `.conf`, pooler) |
| `scripts/ambiente.mjs` | Docker, psql de preparação e execução do Flyway (imagem oficial, `verify-full`, histórico no esquema `migracao`) |
| `scripts/subir.mjs` | Prepara o ambiente da P5 de forma idempotente |
| `scripts/explorar-pooler.mjs` | Dois Flyway concorrentes através de um PgBouncer temporário |
| `scripts/verificar-importacoes.mjs` | Protótipo da regra de lint: só a camada de acesso importa drivers; ninguém importa drizzle-kit ou migrators |
| `fixtures/fixtures.sql` | Dois condomínios fictícios com IDs fixos, carregados pelo papel `fixtures` |
| `src/guarda.ts` | Guarda do `TenantContext` na camada do driver (pg e postgres.js) |
| `src/acesso-kysely.ts`, `src/acesso-drizzle.ts` | `TenantContext` em cada biblioteca, para os dois drivers |
| `src/repositorios.ts` | O mesmo repositório de reservas nas duas bibliotecas |
| `src/tipos-kysely.ts` | Gerado pelo kysely-codegen a partir do banco migrado |
| `src/esquema-drizzle.ts` | Esquema do Drizzle escrito à mão (o `pull` não serviu) |
| `src/verificacao-tipos.ts` | Prova de tipos com `@ts-expect-error` |
| `test/p5a-flyway.test.mjs` | P5a: 9 cenários |
| `test/p5b-*.test.ts` | P5b: acesso (4 combinações), catálogo e autoteste da regra estática |
| `resultados/` | Saídas reais: `p5a-suite.txt`, `p5b-suite.txt`, `p5a/<cenario>.txt` (saída do Flyway em cada cenário) e `drizzle-pull/` (saída do `drizzle-kit pull`, como evidência) |

## 3. Desenho

- **Identidades da P3:** `migrador` é dono do banco e das tabelas e só ele roda migrations; `app_user` é a "API" (sem BYPASSRLS e não dono); `fixtures` carrega dados fictícios, só neste ambiente local. O superusuário aparece só na preparação (SSL, `pg_hba`, criação e remoção de bancos), nunca no Flyway nem na "API".
- **Histórico do Flyway** no esquema próprio `migracao` (`-schemas=migracao`), sem `USAGE` para o `app_user`. O teste de catálogo o trata como única exceção do inventário e prova que o `app_user` recebe 42501 ao tentar lê-lo.
- **`btree_gist`** é extensão confiável (trusted) no PostgreSQL 13+, e o dono do banco a criou sem superusuário, no esquema `extensoes`. O briefing autorizou o uso.
- **Gatilho sem `SECURITY DEFINER`:** roda como `app_user` e passa pela RLS da auditoria (`WITH CHECK`). A auditoria aceita só leitura e inserção pelo `app_user`; ele não pode apagar nem alterar.
- **Fixtures** com grants concedidos fora da cadeia de migrations (em `subir.mjs`), para que nada de teste entre no histórico.

## 4. P5a — Flyway 13.12.2 OSS

Saída real (`resultados/p5a-suite.txt`, 20/11/2026): **9 testes, 9 aprovados, 0 falhas.**

| Critério | Resultado | Evidência |
| --- | --- | --- |
| Histórico com checksum e validação | **Aprovado, com achado** | Toda versão é gravada com checksum (CRC32) e `success`. `validate` e `migrate` recusam V2 alterado ("Migration checksum mismatch for migration version 2", checksum gravado 740937774 x local -1520608540), V1_5 fora de ordem ("Detected resolved migration not applied to database: 1.5") e V1 aplicada ausente do pacote ("Detected applied migration not resolved locally: 1"). **Achado:** se a migration ausente for a *última* aplicada, o padrão `ignoreMigrationPatterns=*:future` a trata como futura e o `validate` **passa**. Com `-ignoreMigrationPatterns=` (vazio) ela é recusada. Regra proposta: validar no pipeline em modo estrito. Arquivo: `resultados/p5a/checksum.txt` |
| Lock com `transactional.lock=false` e dois migradores concorrentes | **Aprovado** | Dois `migrate` simultâneos sobre uma V2 não transacional e lenta (`pg_sleep(6)` + `CONCURRENTLY`). Durante a V2 havia exatamente uma trava advisory concedida, na sessão que executava a V2; o outro migrador fazia polling de `pg_try_advisory_lock`. Resultado: um aplicou 2 migrations, o outro respondeu "Schema is up to date". O histórico ficou com 1 e 2, uma vez cada, e o índice válido (`lock.txt`) |
| Lock: migrador que morre segurando a trava | **Aprovado** | `docker kill` no migrador A durante a V2. O B esperou, assumiu a trava, aplicou a V2 uma vez e terminou com código 0. O histórico ficou sem linha de falha, o índice válido e nenhuma trava sobrou (`lock-morte.txt`). A trava é de sessão: morre com a conexão |
| Controle: lock transacional padrão | **Confirma a necessidade de `false`** | Com `transactional.lock=true`, a mesma V2 **travou** até o timeout de 45 s. Uma sessão do Flyway ficou `idle in transaction`, segurando a trava, e o `CREATE INDEX CONCURRENTLY` ficou em `Lock/virtualxid` esperando por ela (`lock-transacional.txt`) |
| SSL | **Aprovado** | Com `sslmode=disable`, a conexão foi recusada pelo `pg_hba` ("no encryption"). Com `verify-full` por `poc-rm16-pg`, a migração passou, e o `pg_stat_ssl` da própria sessão do Flyway registrou `true / TLSv1.3 / TLS_AES_256_GCM_SHA384 / migrador`. Com `verify-full` pelo IP, que está fora do SAN, a conexão foi recusada ("hostname ... could not be verified") (`ssl.txt`) |
| Modo de conexão | **Aprovado na ligação direta; pooler com ressalva** | Todas as provas acima usam ligação direta. Também houve três rodadas com um PgBouncer temporário: transaction com pool 5, transaction com pool 1 e session com pool 5, cada uma com dois migradores concorrentes e uma V2 em 12 passos para permitir intercalação. Nas três, um migrador aplicou, o outro achou o esquema atualizado e o histórico ficou correto (`pooler.txt`). **Não tomar isso como garantia:** a trava de sessão vive numa conexão de servidor que o modo transaction compartilha, e a documentação do Supabase diz que esse modo perde "session advisory locks" e recomenda ligação direta para migrations. Regra: migrations só por ligação direta ou por pooler em modo session |
| Arquivo não transacional | **Aprovado** | `V3__...sql.conf` com `executeInTransaction=false`. O log mostra `[non-transactional]` e o índice ficou com `indisvalid = true`. Sem o `.conf`, o Flyway 13 também detectou o `CONCURRENTLY` sozinho; mesmo assim, recomendo o `.conf` explícito para ficar visível na revisão (`nao-transacional.txt`) |
| Reconexão após erro | **Aprovado, com achado** | (1) Banco inexistente no início: com `-connectRetries=10`, o Flyway tentou de novo após 1, 2 e 4 s e aplicou tudo quando o banco apareceu. (2) Backend terminado no meio de migration transacional: o Flyway saiu com erro, nenhuma linha da V2 foi gravada, a tabela da V2 foi desfeita, e o novo `migrate` aplicou. (3) Backend terminado no meio de `CREATE INDEX CONCURRENTLY`: **sobrou índice inválido** e, como a conexão já tinha morrido, o Flyway não gravou a falha no histórico. A forma ingênua falha ao ser reexecutada ("relation g_ix already exists"), mesmo depois de `repair`. A forma segura (`drop index concurrently if exists` + `create index concurrently`) recuperou com índice válido. Regra proposta: todo `CONCURRENTLY` reexecutável (`reconexao.txt`) |
| Sem recurso pago | **Aprovado** | Edição OSS. Sem login, conta ou aceite de termos. `migrate`, `info`, `validate` e `repair` funcionam; não foi usado undo, dry run nem nada dos planos Teams ou Enterprise |

Critérios de reprovação: **nenhum ocorreu.** Não foi preciso alternativa (dbmate ou node-pg-migrate), conforme o PC-05.

## 5. P5b — Kysely x Drizzle sob TenantContext

Saída real (`resultados/p5b-suite.txt`, 20/11/2026): **46 testes, 46 aprovados, 0 falhas.** São 10 testes em cada uma das 4 combinações, 1 de cancelamento, 4 de catálogo e 1 de autoteste da regra estática. `tsc --noEmit` passou sem erros e `verificar-importacoes` não encontrou importação proibida.

| Critério (ADR-008, linhas 68-70) | Kysely + pg | Kysely + postgres.js | Drizzle + pg | Drizzle + postgres.js |
| --- | --- | --- | --- | --- |
| Transação com `set_config(..., true)` antes de qualquer consulta | Aprovado | Aprovado | Aprovado | Aprovado |
| Consulta sob RLS (A vê só A; escrita em B = 42501; FK composta = 23503) | Aprovado | Aprovado | Aprovado | Aprovado |
| Conexão limpa ao voltar ao pool, após commit, erro SQL e exceção JS (pool de 1, mesmo `pg_backend_pid`, `app.condominio_id` vazio) | Aprovado | Aprovado | Aprovado | Aprovado |
| Controle negativo: `set_config` de sessão vaza e o teste detecta | Aprovado | Aprovado | Aprovado | Aprovado |
| Queda da conexão no meio da transação: o pool descarta e a próxima usa conexão nova | Aprovado* | Aprovado | Aprovado* | Aprovado |
| `EXCLUDE`: sobreposição = 23P01; reserva encostada passa; cancelada não bloqueia | Aprovado | Aprovado | Aprovado | Aprovado |
| Concorrência: 2 transações em conexões distintas na mesma faixa, exatamente 1 vence (23P01) | Aprovado | Aprovado | Aprovado | Aprovado |
| Gatilho grava auditoria pela RLS do próprio condomínio; B não vê | Aprovado | Aprovado | Aprovado | Aprovado |
| Não abre conexão ao ser criado nem antes do primeiro `comTenant` | Aprovado | Aprovado | Aprovado | Aprovado |
| Uso da biblioteca fora do `TenantContext` bloqueado antes do banco | Aprovado | Aprovado | Aprovado | Aprovado |

\* **Achado do driver pg (vale para as duas bibliotecas):** se o servidor derruba uma conexão *emprestada* enquanto ela está ociosa entre duas consultas, o `pg.Client` emite `error` (57P01). Sem listener, isso vira exceção não tratada, que derruba o processo, e nem o Kysely nem o Drizzle registram esse listener. A primeira execução falhou exatamente assim. A camada de acesso passou a registrar `client.on('error')` ao emprestar a conexão (`src/guarda.ts`), e o teste passou. O postgres.js não tem esse problema.

**Migração de exemplo pelo papel dono e teste de catálogo** (`p5b-catalogo.test.ts`, como `app_user`, sobre o esquema produzido pelo Flyway): toda tabela tem RLS habilitada e forçada, pertence ao `migrador`, e todo privilégio do `app_user` é coberto por política permissiva. A regra é genérica: privilégio sem política é erro, e a auditoria, que só aceita leitura e inserção, passa. O teste também confere o `EXCLUDE USING gist` com `btree_gist` no esquema `extensoes`, o gatilho ativo, o índice `CONCURRENTLY` válido, a ausência de `SECURITY DEFINER` e de `TRUNCATE`/`REFERENCES`/`TRIGGER` para o `app_user`, e o 42501 no histórico do Flyway. **O teste não é cego:** uma tabela criada sem RLS (`app.esquecida`) é apontada.

### Como fica impedido abrir conexão ou consultar fora do TenantContext

Em camadas, cada uma com teste:

1. **Encapsulamento:** os módulos de acesso expõem só `comTenant(ctx, fn)`, e `fn` recebe só a transação. A instância crua da biblioteca fica fechada no módulo; aparece em `teste.bibliotecaCrua` apenas para simular o bug.
2. **Guarda no driver** (`src/guarda.ts`), abaixo da biblioteca. É uma máquina de estados por conexão física: `livre -> BEGIN -> set_config('app.condominio_id'...) -> ... -> COMMIT/ROLLBACK`. Qualquer outra consulta é recusada **antes de sair do processo** com `ForaDoTenantContext`, e uma conexão devolvida ao pool fora de `livre` é registrada. No pg, a guarda instrumenta todo client emprestado, inclusive o que o próprio `pool.query` empresta. No postgres.js, um Proxy recusa consultas pela raiz, exige o `set_config` como primeira consulta de `sql.begin` e acompanha `sql.reserve()`, que é o que o kysely-postgres-js usa. Teste: com cada biblioteca, consulta direta e transação sem `set_config` são recusadas, o pool continua utilizável, e os usos legítimos de toda a suíte não geram nenhuma violação.
3. **Regra estática** (`scripts/verificar-importacoes.mjs`, com autoteste): só `src/guarda.ts` e `src/acesso-*.ts` importam drivers e adaptadores, e ninguém importa `drizzle-kit` nem os migrators do Kysely ou do Drizzle. Na fase 2, isso vira `no-restricted-imports` no ESLint (ADR-001 item 4).
4. **Banco em falha fechada** (P3): sem contexto, zero linhas, e escrita recusada.

**Ponto de atenção do Kysely (registrado, não reprova):** com `inflightQueryAbortStrategy: 'cancel query'` ou `'kill session'`, o `PostgresDialect` abre um **`pg.Client` novo, fora do pool e da guarda**, só para rodar `pg_cancel_backend`/`pg_terminate_backend`. Um teste com cliente espião mostrou 1 conexão aberta. O padrão do Kysely é `'ignore query'`, que não abre nada. O acesso passa um `controlClient` que lança erro, e o teste mostra que, com ele, não há conexão extra e a falha fica explícita. Não considerei reprovação porque só acontece com adesão explícita, a conexão não lê dados de tenant e fica bloqueada por configuração com teste. **Essa avaliação é minha e cabe ao orquestrador confirmá-la.** No kysely-postgres-js, `cancel query` usa o protocolo de cancelamento do postgres.js, e `kill session` usa uma conexão do pool, que a guarda barra.

## 6. Comparação e recomendação

| Aspecto | Kysely 0.29.9 | Drizzle 0.45.4 |
| --- | --- | --- |
| Critérios do ADR-008 | Todos aprovados nos dois drivers | Todos aprovados nos dois drivers |
| Driver | pg pelo `PostgresDialect` (núcleo); postgres.js pelo `kysely-postgres-js` 5.1.0 (kysely-org, pacote separado, usa `sql.reserve()`) | pg (`drizzle-orm/node-postgres`) e postgres.js (`drizzle-orm/postgres-js`), ambos no pacote principal |
| Transação nossa (desempate 1) | `db.transaction().execute(trx => ...)`, com `set_config` pelo `sql` tag | `db.transaction(tx => ...)`, com `tx.execute(sql...)`; equivalente |
| SQL como fonte da verdade (desempate 2; MS-01 e MS-02) | Tipos **gerados do banco migrado** pelo kysely-codegen 0.20.0, introspectando como `app_user`. A saída está correta (`src/tipos-kysely.ts`) e pode rodar no CI depois do Flyway, para pegar divergência | Esquema em TypeScript **escrito à mão**, duplicando o SQL. O `drizzle-kit pull` gerou arquivo que **não compila** (`tstzrange` vira `unknown`), sem chaves primárias, com as colunas das FKs compostas trocadas (`[area.id, area.condominioId]` para `(condominio_id, area_id)`) e uma política sem `USING`. Também **gerou um arquivo SQL de migration** (`resultados/drizzle-pull/0000_*.sql`), um convite à segunda cadeia, que a regra estática proíbe. Nada detecta divergência entre o TS e o banco |
| Tipos (desempate 3) | Coluna e tabela inexistentes, tipo errado, coluna obrigatória ausente e resultado projetado viram erro de compilação (`verificacao-tipos.ts`) | Os mesmos erros também são apontados. `tstzrange` precisa de `customType` |
| Zod (ADR-008, linha 40) | Sem integração oficial | Tem `drizzle-zod`. O ADR-015 proíbe Zod manual concorrente; harmonizar na revisão do ADR-008 (risco já listado em `criterios-de-poc.md`) |
| Erros | O erro do driver chega intacto (`code` = SQLSTATE) | Embrulha em `DrizzleQueryError`; o SQLSTATE fica em `cause` |
| Vazamento do driver para o código | Nenhum observado | `tx.execute` devolve `QueryResult` no pg e array no postgres.js (`repositorios.ts`) |
| Ciclo de vida | `db.destroy()` não fecha um pool que o Kysely nunca usou (inicialização preguiçosa); o dono do pool o encerra | Sem observação |
| Conexão fora do pool | Só com `inflightQueryAbortStrategy` (adesão explícita), bloqueada por `controlClient` | Nenhuma observada |
| Maturidade | 0.x estável (`latest` 0.29.9) | 0.x, com 1.0 em beta (`1.0.0-beta.22`): mudança de API à vista |

**Recomendação: Kysely**, pelos critérios do ADR-008 e da estratégia de migrations. O motivo decisivo é o desempate 2: com SQL como fonte da verdade, o Kysely tipa a partir do próprio banco que o Flyway migrou. O Drizzle exige manter um segundo esquema à mão, e a ferramenta dele de introspecção errou neste esquema e ainda gera migration SQL. Os dois cumprem a segurança do `TenantContext`; a escolha não muda o isolamento.

**Driver: postgres.js, o que fecha a recomendação condicionada da P3.** A condição da P3 era haver integração mantida com o query builder. O `kysely-postgres-js` 5.1.0 é do kysely-org, foi publicado em 06/11/2026, declara peer para kysely 0.29 e postgres 4, e passou em todos os testes, inclusive queda de conexão e concorrência. Se esse pacote parar de ser mantido, a alternativa é **Kysely + pg**, que também passou em tudo e é o dialeto do núcleo; nesse caso, a camada de acesso precisa do listener de `error` (seção 5).

O que a recomendação não cobre: não medi o custo do query builder sob carga. A vazão e o p95 da P3 são do driver puro. Repetir a carga RNF-17 com Kysely na fase 2.

## 7. Riscos e limitações

- **Java no CI:** a imagem `flyway/flyway:13.12.2` tem cerca de 1,1 GB, com Temurin 25. A alternativa é instalar Java 25 e o pacote da CLI. Fixar o digest e usar cache no CI. A CLI faz consulta de versão na rede (aviso da 13.13.0); antes do CI, verificar na documentação oficial se há telemetria e como desligá-la, o que não foi feito aqui.
- **Pooler do Supabase:** segundo a documentação oficial, a ligação direta (5432) é IPv6 nos planos Free e Pro, o pooler compartilhado em modo session (5432) é IPv4, e o modo transaction (6543) é IPv4, perde advisory locks de sessão e não aceita prepared statements. Consequências: (1) as migrations vão pela ligação direta ou pelo modo session; se o Render não sair por IPv6, resta o modo session. (2) A API, se usar o 6543, precisa de `prepare: false` no postgres.js. O `prepare: false` global prevalece sobre o `prepare: true` por consulta que o kysely-postgres-js passa (confirmado no código, `postgres/src/pool.js` linha 103: `options.prepare && q.options.prepare !== false`), mas **não testei contra o Supavisor**. (3) O PgBouncer local não reproduziu o conflito de trava; isso não prova que o modo transaction seja seguro.
- **Certificados:** CA local fictícia. Com o Supabase, usar `verify-full` com a CA do provedor, o que não foi testado.
- **Extensões no destino:** `btree_gist` foi criado como extensão confiável pelo dono do banco. No Supabase, confirmar disponibilidade e esquema (eles usam `extensions`), o que não foi testado. Os nomes de papel (`app_user`) estão fixos no SQL da PoC; na fase 2, usar placeholders do Flyway ou papéis com o mesmo nome em todos os ambientes.
- **Regras que a fase 2 precisa herdar:** validação estrita (`-ignoreMigrationPatterns=` vazio) no pipeline; todo `CONCURRENTLY` reexecutável e com `.conf` explícito; `transactional.lock=false`; `connectRetries` no deploy; migrations só por ligação direta ou modo session.
- **A guarda é protótipo:** reconhece o `set_config` pelo prefixo do texto. Na fase 2, ela entra no módulo do `TenantContext` junto da regra de ESLint. Ela não substitui a RLS, só antecipa a falha.
- **Drizzle descartado sem medir a camada relacional** (RQB). Também não testei `drizzle-zod` nem kysely com Zod.
- **Escopo:** P5b só pela ligação direta. Os drivers via PgBouncer já foram provados na P3, e o PgBouncer da P3 só atende o banco `p3`. Esquema de exemplo com 5 tabelas. Sem carga.
- **Ambiente:** Windows com Docker Desktop. Os cenários de queda dependem de tempo (polling de `pg_stat_activity`); se ficarem instáveis numa máquina lenta, aumentar o `pg_sleep` dos arquivos em `p5a/`.
