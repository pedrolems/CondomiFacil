-- PoC P5 (RM-16). Aplicada pelo Flyway como "migrador" (dono). Não é a migration real da fase 2.
-- Base do tenant: esquema app, funções de contexto (iguais às da P3), condominio, unidade e area.
-- O histórico do Flyway fica no esquema "migracao", sem acesso do app_user.

create schema app;
revoke all on schema app from public;

-- Contexto por transação (ADR-001 item 2). Falha fechada: variável ausente vira NULL e nada casa.
create function app.condominio_atual() returns uuid
  language sql stable parallel safe
  as $$ select nullif(current_setting('app.condominio_id', true), '')::uuid $$;

create function app.unidade_atual() returns uuid
  language sql stable parallel safe
  as $$ select nullif(current_setting('app.unidade_id', true), '')::uuid $$;

create table app.condominio (
  id   uuid primary key,
  nome text not null
);

create table app.unidade (
  id            uuid primary key,
  condominio_id uuid not null references app.condominio (id),
  bloco         text not null,
  numero        text not null,
  unique (condominio_id, id),
  unique (condominio_id, bloco, numero)
);

create table app.area (
  id            uuid primary key,
  condominio_id uuid not null references app.condominio (id),
  nome          text not null,
  unique (condominio_id, id)
);

alter table app.condominio enable row level security;
alter table app.condominio force row level security;
alter table app.unidade enable row level security;
alter table app.unidade force row level security;
alter table app.area enable row level security;
alter table app.area force row level security;

create policy tenant on app.condominio for all to app_user
  using (id = app.condominio_atual()) with check (id = app.condominio_atual());
create policy tenant on app.unidade for all to app_user
  using (condominio_id = app.condominio_atual()) with check (condominio_id = app.condominio_atual());
create policy tenant on app.area for all to app_user
  using (condominio_id = app.condominio_atual()) with check (condominio_id = app.condominio_atual());

grant usage on schema app to app_user;
grant execute on function app.condominio_atual(), app.unidade_atual() to app_user;
grant select on app.condominio, app.unidade, app.area to app_user;
