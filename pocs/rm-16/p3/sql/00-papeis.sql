-- PoC P3 (RM-16). Executado pelo superusuário do contêiner descartável, banco "postgres".
-- Três identidades separadas (privilégio mínimo). Senhas fictícias, só locais.

-- Dono das tabelas: roda as migrations. Não é usado pela aplicação.
create role migrador login password 'migrador_local_ficticia' nosuperuser nobypassrls nocreaterole;

-- Papel da API/worker: sem BYPASSRLS, sem superusuário, não é dono de nada, não herda papéis.
create role app_user login password 'app_local_ficticia'
  nosuperuser nobypassrls nocreatedb nocreaterole noinherit noreplication;

-- Carga de fixtures fictícias (só neste ambiente local). BYPASSRLS só aqui, nunca na API.
create role fixtures login password 'fixtures_local_ficticia' nosuperuser bypassrls noinherit;

create database p3 owner migrador;
revoke all on database p3 from public;
grant connect on database p3 to app_user, fixtures;
