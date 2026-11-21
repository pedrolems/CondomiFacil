-- Objetivo: fundação do tenant. Acesso do app_user ao esquema condomifacil, função de contexto
--   condominio_atual() e tabela condominio (raiz do tenant) com RLS habilitada e forçada.
-- Referência: MER/DER (condominio); ADR-001 (RLS por condominio_id, aceito com ressalvas em
--   20/11/2026); PoC P3; fase 2: E3 (fuso_horario), E6 (identidades), E7 (sem SECURITY DEFINER);
--   decisão de Pedro de 21/11/2026 (RM-25 cria condominio; estado e modalidade_gestao ficam para
--   RM-21/RM-22).
-- Pré-condições: provisionamento criou os esquemas condomifacil e infra_migracoes (donos: migrador)
--   e o papel app_user (NOSUPERUSER NOBYPASSRLS NOINHERIT). Aplicada pelo Flyway como migrador.
-- Compatibilidade: primeira migration; só cria objetos.
-- Risco de lock: nenhum (objetos novos, banco sem uso).
-- Recuperação: forward-only. Local/CI: recriar o banco ("pnpm db:instalar"). Ambiente
--   compartilhado: corrigir por nova migration, nunca editando esta.
set local lock_timeout = '5s';
set local statement_timeout = '60s';

revoke all on schema condomifacil from public;
grant usage on schema condomifacil to app_user;

-- Contexto por transação (set_config(..., true)); ausente ou vazio vira NULL e nenhuma linha casa.
-- SQL, STABLE e sem SET de search_path, para continuar elegível a inlining nas políticas.
create function condomifacil.condominio_atual() returns uuid
  language sql stable parallel safe
  as $$ select nullif(current_setting('app.condominio_id', true), '')::uuid $$;
revoke all on function condomifacil.condominio_atual() from public;
grant execute on function condomifacil.condominio_atual() to app_user;

create table condomifacil.condominio (
  id                  uuid primary key,
  nome                text not null,
  documento_protegido text,
  fuso_horario        text not null default 'America/Sao_Paulo',
  criado_em           timestamptz not null default now()
);

alter table condomifacil.condominio enable row level security;
alter table condomifacil.condominio force row level security;

-- A raiz do tenant é o próprio id. app_user só lê; criação e alteração entram nos pacotes seguintes.
create policy condominio_leitura_tenant on condomifacil.condominio
  for select to app_user
  using (id = condomifacil.condominio_atual());

grant select on condomifacil.condominio to app_user;
