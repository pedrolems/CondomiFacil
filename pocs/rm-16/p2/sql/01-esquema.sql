-- PoC P2 (RM-16). Executado como "migrador" (dono) no banco p2. Dados ficticios.
create schema app;
grant usage on schema app to app_user, fixtures;

create table app.condominio (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  plano text not null check (plano in ('essencial', 'gestao_suporte'))
);

create table app.usuario (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  senha_hash text,                       -- Argon2id; nulo apos exclusao LGPD
  tipo text not null default 'comum' check (tipo in ('comum', 'suporte')),
  excluido_em timestamptz
);

create table app.vinculo (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references app.usuario,
  condominio_id uuid not null references app.condominio,
  papel text not null check (papel in ('morador', 'sindico', 'subsindico', 'portaria', 'suporte')),
  ativo boolean not null default true,
  unique (usuario_id, condominio_id)
);
create index on app.vinculo (condominio_id);

-- Substituicao do sindico e dado (RN-CD-12): subsindico ativo ganha o papel efetivo de sindico.
create table app.substituicao (
  condominio_id uuid primary key references app.condominio,
  subsindico_usuario_id uuid not null references app.usuario,
  ativa boolean not null default false
);

-- Plano de autenticacao (sem tenant): sessoes e refresh tokens. Sem RLS; protegidos por privilegio de coluna.
create table app.sessao (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references app.usuario,
  cliente text not null check (cliente in ('app', 'web')),
  criada_em timestamptz not null,
  revogada_em timestamptz,
  motivo text
);
create index on app.sessao (usuario_id);

create table app.refresh_token (
  hash bytea primary key,                -- SHA-256 do token opaco; o token em si nunca e gravado
  sessao_id uuid not null references app.sessao,
  gerado_em timestamptz not null,
  expira_em timestamptz not null,
  usado_em timestamptz
);
create index on app.refresh_token (sessao_id);

create table app.aviso (
  id uuid primary key default gen_random_uuid(),
  condominio_id uuid not null references app.condominio,
  texto text not null
);

-- RLS: vinculo e substituicao so do proprio usuario; condominio so os que ele integra; aviso por tenant.
alter table app.vinculo enable row level security;      alter table app.vinculo force row level security;
alter table app.substituicao enable row level security; alter table app.substituicao force row level security;
alter table app.condominio enable row level security;   alter table app.condominio force row level security;
alter table app.aviso enable row level security;        alter table app.aviso force row level security;

create function app.usuario_atual() returns uuid language sql stable
  as $$ select nullif(current_setting('app.usuario_id', true), '')::uuid $$;
create function app.condominio_atual() returns uuid language sql stable
  as $$ select nullif(current_setting('app.condominio_id', true), '')::uuid $$;

create policy p_vinculo on app.vinculo for select to app_user using (usuario_id = app.usuario_atual());
create policy p_subst on app.substituicao for select to app_user using (subsindico_usuario_id = app.usuario_atual());
create policy p_condominio on app.condominio for select to app_user
  using (exists (select 1 from app.vinculo v where v.condominio_id = condominio.id));
create policy p_aviso_sel on app.aviso for select to app_user using (condominio_id = app.condominio_atual());
create policy p_aviso_ins on app.aviso for insert to app_user with check (condominio_id = app.condominio_atual());

-- Privilegios minimos do app_user (nada de delete; update so nas colunas necessarias).
grant select on app.vinculo, app.substituicao, app.condominio to app_user;
grant select, insert on app.aviso to app_user;
grant select, insert on app.usuario to app_user;
grant update (senha_hash, email, excluido_em) on app.usuario to app_user;
grant select, insert on app.sessao to app_user;
grant update (revogada_em, motivo) on app.sessao to app_user;
grant select, insert on app.refresh_token to app_user;
grant update (usado_em) on app.refresh_token to app_user;
