# apps/api/db

Banco local e descartável da fase 2 (RM-25): PostgreSQL 17 em Docker, migrations Flyway, provisionamento das identidades, factories e seed manual fictícios. Sem Supabase, sem Render e sem dados reais. **Nunca** aponte estes scripts para banco remoto: o provisionamento e a carga de fixtures recusam qualquer host fora de `localhost`, `127.0.0.1`, `::1` e `postgres` (serviço do CI).

## Versões

| Item | Versão e fonte |
| --- | --- |
| PostgreSQL | `postgres:17@sha256:b60e90042aa6b8dbecd58e224b3e36114dbf8ad754465264c2476ad58a86e45c` (Docker Hub `library/postgres`, índice multiarquitetura da tag 17, conferido em 21/11/2026 com `docker buildx imagetools inspect postgres:17`); servidor 17.12 |
| Flyway | `flyway/flyway:13.12.2@sha256:99c4dd175ca5e622700e6397c4eadf092d83b5080f5b1340e04e73c9a5d343b5` (OSS 13.12.2) |
| Driver | `postgres` (postgres.js) 4.1.1 |

## Instalação limpa (um comando)

Pré-requisitos: Docker (Desktop no Windows), Node 26.13.1 e pnpm 12.21.0, `pnpm install` feito. Igual no Git Bash do Windows e no Linux:

```sh
pnpm --filter @condomifacil/api db:instalar
```

Sobe o contêiner (`db/compose.yaml`, só em `127.0.0.1:54320`), cria ou atualiza os papéis, **recria** o banco `condomifacil` (os dados anteriores somem), aplica as migrations como `migrador` e termina com `validate` estrito e `info`. Na primeira execução, sem `db/.env` e sem as variáveis no ambiente, gera senhas aleatórias em `db/.env` (ignorado pelo Git; modelo em `db/.env.example`).

| Comando (`pnpm --filter @condomifacil/api ...`) | Efeito |
| --- | --- |
| `db:instalar` | Instalação limpa descrita acima |
| `db:seed` | Carrega o seed manual (três condomínios e os documentos globais fictícios com versão 1) como `fixtures`; repetir só informa "já pronto" |
| `db:flyway <comando>` | Flyway no banco local (`info`, `validate`, `migrate`) |
| `test:banco` | Testes de banco real em `test/isolamento/` (rodam `db:instalar` no banco `condomifacil_teste`) |
| `db:parar` | Remove o contêiner e o volume |

No CI, o job `banco` (`.github/workflows/ci.yml`, em todo PR, em paralelo à verificação) usa `postgres:17` (mesmo digest) como serviço na porta 5432 e define `DB_COMPOSE=0`, `DB_HOST=localhost`, `DB_PORTA=5432`, `FLYWAY_REDE=host`, `FLYWAY_DB_HOST=localhost` e `FLYWAY_DB_PORTA=5432`. A senha do superusuário é um valor fictício fixo do serviço efêmero; as demais senhas são geradas com `openssl rand` no próprio job e mascaradas no log. Depois roda `pnpm --filter @condomifacil/api test:banco`. A telemetria do Flyway fica sempre desligada (também localmente): o `docker run` passa `REDGATE_DISABLE_TELEMETRY=true`, conforme a documentação da Redgate (https://documentation.red-gate.com/fd/redgate-disable-telemetry-environment-variable-277579301.html).

## Identidades (E6)

| Papel | Atributos | Uso |
| --- | --- | --- |
| `postgres` | Superusuário do contêiner | Só no provisionamento (`db/scripts/provisionar.ts`) |
| `migrador` | `NOSUPERUSER NOBYPASSRLS`, dono do banco, de `condomifacil`, `infra_migracoes` e `extensoes` | Só o Flyway |
| `app_user` | `NOSUPERUSER NOBYPASSRLS NOINHERIT`, não dono; sem `TRUNCATE`, `REFERENCES`, `TRIGGER` e sem acesso a `infra_migracoes` | API e worker (RM-24 em diante) |
| `app_autenticacao` | `NOSUPERUSER NOBYPASSRLS NOINHERIT`, `CONNECT` e `USAGE` em `condomifacil` | Só o módulo `autenticacao`: colunas de credencial de `usuario` e as tabelas `sessao`, `desafio_acesso` e `controle_login` (RM-20); nenhuma tabela de tenant. O refresh token tem o formato `<sessao_id>.<segredo>`, com a sessão buscada pela PK |
| `fixtures` | `BYPASSRLS NOINHERIT` | Carga de fixtures em banco descartável; grants dados pelo provisionamento, fora da cadeia de migrations |

## Barreira das fixtures

O provisionamento cria o esquema `infra_local` (dono `postgres`, sem acesso de `app_user` nem `migrador`), com o marcador `banco_descartavel` e o controle `namespace_fixture`. A carga (`db/seeds/fixtures.ts`) confere o host permitido antes de conectar, o papel `fixtures` e o marcador do banco atual antes de qualquer DML, e recusa namespace já carregado, exceto o mesmo manifesto com o estado inicial intacto ("já pronto"). Não depende de `NODE_ENV` nem de `--force`.

## Esquemas

- `condomifacil`: objetos do produto (migrations).
- `infra_migracoes`: histórico do Flyway (`flyway_schema_history`).
- `extensoes`: reservado; nenhuma extensão instalada.
- `infra_local`: marcador e controle das fixtures, só em banco descartável.

O esquema `public` é removido no provisionamento.
