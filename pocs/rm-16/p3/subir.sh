#!/usr/bin/env sh
# PoC P3 (RM-16): sobe (ou recria) o PostgreSQL 17 descartável e o PgBouncer em modo transaction.
# Uso: sh subir.sh            -> cria contêineres, papéis, esquema e fixtures
#      sh subir.sh --recriar  -> remove os contêineres antes (sem volume: os dados somem)
set -eu
cd "$(dirname "$0")"

if [ "${1:-}" = "--recriar" ]; then
  docker rm -f poc-rm16-pgbouncer poc-rm16-pg >/dev/null 2>&1 || true
fi

docker network create poc-rm16-net >/dev/null 2>&1 || true

docker run -d --name poc-rm16-pg --network poc-rm16-net -p 54329:5432 --shm-size=256m \
  -e POSTGRES_PASSWORD=postgres_local_ficticia postgres:17 >/dev/null

# O servidor temporário da inicialização não escuta TCP; esperar o TCP garante o servidor final.
until docker exec poc-rm16-pg pg_isready -q -h 127.0.0.1 -U postgres; do sleep 1; done

psql_em() { # $1 usuário, $2 banco, stdin = SQL
  docker exec -i poc-rm16-pg psql -q -v ON_ERROR_STOP=1 -U "$1" -d "$2"
}
psql_em postgres postgres < sql/00-papeis.sql
psql_em migrador p3 < sql/01-esquema.sql
echo "Carregando fixtures (cerca de 2,2 mi de visitas)..."
psql_em fixtures p3 < sql/02-fixtures.sql
echo "vacuum analyze;" | psql_em postgres p3

# PgBouncer 1.26 em modo transaction, com prepared statements de protocolo habilitados.
docker run -d --name poc-rm16-pgbouncer --network poc-rm16-net -p 54330:5432 \
  -e DB_HOST=poc-rm16-pg -e DB_NAME=p3 -e DB_USER=app_user -e DB_PASSWORD=app_local_ficticia \
  -e AUTH_TYPE=scram-sha-256 -e POOL_MODE=transaction -e DEFAULT_POOL_SIZE=20 \
  -e MAX_CLIENT_CONN=500 -e MAX_PREPARED_STATEMENTS=200 \
  edoburu/pgbouncer:latest >/dev/null

echo "Pronto: direto em localhost:54329, PgBouncer em localhost:54330 (banco p3)."
