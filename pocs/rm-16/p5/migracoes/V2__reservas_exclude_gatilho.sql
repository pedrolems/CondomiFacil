-- PoC P5 (RM-16). Exemplo do ADR-008: RLS forçada, restrição EXCLUDE e gatilho, pelo papel dono.
-- btree_gist é extensão confiável (trusted) no PostgreSQL 13+: o dono do banco a cria sem superusuário.
-- Fica num esquema próprio, fora de "app", para o teste de catálogo não misturar objetos da extensão.

create schema extensoes;
revoke all on schema extensoes from public;
create extension btree_gist with schema extensoes;

create table app.reserva (
  id            uuid primary key default gen_random_uuid(),
  condominio_id uuid not null,
  area_id       uuid not null,
  unidade_id    uuid not null,
  periodo       tstzrange not null check (not isempty(periodo) and lower_inc(periodo) and not upper_inc(periodo)),
  estado        text not null default 'confirmada' check (estado in ('confirmada', 'cancelada')),
  criada_em     timestamptz not null default now(),
  foreign key (condominio_id, area_id) references app.area (condominio_id, id),
  foreign key (condominio_id, unidade_id) references app.unidade (condominio_id, id),
  -- Duas reservas ativas da mesma área não se sobrepõem (arquitetura 3.6). "=" em uuid vem do btree_gist.
  constraint reserva_sem_sobreposicao exclude using gist (
    condominio_id extensoes.gist_uuid_ops with =,
    area_id extensoes.gist_uuid_ops with =,
    periodo with &&
  ) where (estado <> 'cancelada')
);

-- Auditoria só de inserção (append-only para o app_user): quem altera reserva deixa rastro.
create table app.reserva_auditoria (
  id            bigint generated always as identity primary key,
  condominio_id uuid not null references app.condominio (id),
  reserva_id    uuid not null,
  acao          text not null check (acao in ('INSERT', 'UPDATE', 'DELETE')),
  estado_antes  text,
  estado_depois text,
  em            timestamptz not null default now()
);

-- Gatilho sem SECURITY DEFINER: roda como o app_user e passa pela RLS da auditoria (WITH CHECK),
-- então não consegue gravar auditoria de outro condomínio.
create function app.auditar_reserva() returns trigger
  language plpgsql
  as $$
begin
  insert into app.reserva_auditoria (condominio_id, reserva_id, acao, estado_antes, estado_depois)
  values (coalesce(new.condominio_id, old.condominio_id), coalesce(new.id, old.id), tg_op,
          case when tg_op <> 'INSERT' then old.estado end,
          case when tg_op <> 'DELETE' then new.estado end);
  return null;
end
$$;

create trigger reserva_auditada
  after insert or update or delete on app.reserva
  for each row execute function app.auditar_reserva();

alter table app.reserva enable row level security;
alter table app.reserva force row level security;
alter table app.reserva_auditoria enable row level security;
alter table app.reserva_auditoria force row level security;

create policy tenant on app.reserva for all to app_user
  using (condominio_id = app.condominio_atual()) with check (condominio_id = app.condominio_atual());
-- Auditoria: lê e insere no próprio condomínio; sem UPDATE/DELETE (nem privilégio nem política).
create policy tenant_ler on app.reserva_auditoria for select to app_user
  using (condominio_id = app.condominio_atual());
create policy tenant_inserir on app.reserva_auditoria for insert to app_user
  with check (condominio_id = app.condominio_atual());

grant select, insert, update on app.reserva to app_user;
grant select, insert on app.reserva_auditoria to app_user;
grant execute on function app.auditar_reserva() to app_user;
