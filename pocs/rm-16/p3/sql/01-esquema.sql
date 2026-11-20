-- PoC P3 (RM-16). Executado como "migrador" (dono) no banco p3.
-- Esquema mínimo inspirado no MER (condominio, unidade, portaria, visita). Não é a migration real.

create schema app;
revoke all on schema app from public;

-- Contexto por transação (ADR-001 item 2). Funções SQL simples e STABLE: o planejador as
-- incorpora na consulta e usa o resultado como condição de índice. Sem SECURITY DEFINER.
-- Falha fechada (item 3): variável ausente ou vazia vira NULL e "coluna = NULL" não casa nada.
create function app.condominio_atual() returns uuid
  language sql stable parallel safe
  as $$ select nullif(current_setting('app.condominio_id', true), '')::uuid $$;

create function app.unidade_atual() returns uuid
  language sql stable parallel safe
  as $$ select nullif(current_setting('app.unidade_id', true), '')::uuid $$;

create function app.papel_atual() returns text
  language sql stable parallel safe
  as $$ select nullif(current_setting('app.papel', true), '') $$;

create table app.condominio (
  id   uuid primary key default gen_random_uuid(),
  nome text not null
);

create table app.unidade (
  id            uuid primary key default gen_random_uuid(),
  condominio_id uuid not null references app.condominio (id),
  bloco         text not null,
  numero        text not null,
  unique (condominio_id, id),             -- alvo das FKs compostas (ADR-001 item 5)
  unique (condominio_id, bloco, numero)
);

create table app.portaria (
  id            uuid primary key default gen_random_uuid(),
  condominio_id uuid not null references app.condominio (id),
  nome          text not null,
  unique (condominio_id, id)
);

create table app.visita (
  id                  uuid primary key default gen_random_uuid(),
  condominio_id       uuid not null,
  unidade_id          uuid not null,
  nome_visitante      text not null,
  dia                 date not null,
  estado              text not null default 'esperada'
                      check (estado in ('esperada', 'dentro', 'saiu', 'cancelada')),
  criada_em           timestamptz not null default now(),
  entrada_em          timestamptz,
  portaria_entrada_id uuid,
  -- FKs compostas: um bug de aplicação não consegue apontar para unidade/portaria de outro condomínio.
  foreign key (condominio_id, unidade_id) references app.unidade (condominio_id, id),
  foreign key (condominio_id, portaria_entrada_id) references app.portaria (condominio_id, id)
);

-- Índices guiados pelo predicado de RLS (condominio_id primeiro) e pelas consultas críticas.
create index visita_lista_do_dia on app.visita (condominio_id, dia, criada_em desc);
create index visita_por_unidade  on app.visita (condominio_id, unidade_id, dia desc);
create index portaria_condominio on app.portaria (condominio_id);

-- RLS habilitada e forçada em toda tabela (o dono também fica sujeito às políticas).
alter table app.condominio enable row level security;
alter table app.condominio force row level security;
alter table app.unidade enable row level security;
alter table app.unidade force row level security;
alter table app.portaria enable row level security;
alter table app.portaria force row level security;
alter table app.visita enable row level security;
alter table app.visita force row level security;

-- Políticas só para app_user: qualquer outro papel sem BYPASSRLS (inclusive o dono) cai no
-- "negar por padrão" do PostgreSQL. USING e WITH CHECK cobrem leitura e escrita.
create policy tenant on app.condominio for all to app_user
  using (id = app.condominio_atual()) with check (id = app.condominio_atual());
create policy tenant on app.unidade for all to app_user
  using (condominio_id = app.condominio_atual()) with check (condominio_id = app.condominio_atual());
create policy tenant on app.portaria for all to app_user
  using (condominio_id = app.condominio_atual()) with check (condominio_id = app.condominio_atual());
create policy tenant on app.visita for all to app_user
  using (condominio_id = app.condominio_atual()) with check (condominio_id = app.condominio_atual());

-- Segundo nível (ADR-001 item 6), ILUSTRATIVO: morador só vê visitas da própria unidade;
-- portaria e síndico veem o condomínio. Papel ausente ou desconhecido = nenhuma linha.
-- Não é a matriz de permissões final; serve para medir o custo de uma política restritiva.
create policy segundo_nivel on app.visita as restrictive for all to app_user
  using (app.papel_atual() in ('porteiro', 'sindico')
         or (app.papel_atual() = 'morador' and unidade_id = app.unidade_atual()))
  with check (app.papel_atual() in ('porteiro', 'sindico')
              or (app.papel_atual() = 'morador' and unidade_id = app.unidade_atual()));

-- Privilégios mínimos. Sem TRUNCATE (ignora RLS), sem REFERENCES, sem TRIGGER.
grant usage on schema app to app_user, fixtures;
grant select on app.condominio, app.unidade, app.portaria to app_user;
grant select, insert, update, delete on app.visita to app_user;
grant select, insert on app.condominio, app.unidade, app.portaria, app.visita to fixtures;
