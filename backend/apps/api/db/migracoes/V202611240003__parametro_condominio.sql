-- Objetivo: parametro_condominio (tenant), histórico imutável dos valores configurados por
--   condomínio, com RLS habilitada e forçada; app_user só lê e inclui no próprio tenant, com o
--   titular da transação como autor.
-- Referência: MER/DER, dicionário de parâmetros (parametro_condominio); política de acesso, seção
--   5.1; Regras de Negócio, seção 13 e RN-GE-01 (autor, data, valor antigo e novo pelo histórico);
--   fase 2: decisão de Pedro de 21/11/2026 (parametro_condominio entra no RM-20); ADR-001.
-- Pré-condições: V202611240001 aplicada (usuario e usuario_atual()).
-- Compatibilidade: só cria objetos.
-- Risco de lock: nenhum (objetos novos).
-- Recuperação: forward-only. Local/CI: recriar o banco ("pnpm db:instalar"). Ambiente
--   compartilhado: corrigir por nova migration, nunca editando esta.
set local lock_timeout = '5s';
set local statement_timeout = '60s';

create table condomifacil.parametro_condominio (
  id                uuid primary key default gen_random_uuid(),
  condominio_id     uuid not null references condomifacil.condominio (id),
  definicao_id      uuid not null references condomifacil.parametro_definicao (id),
  valor_json        jsonb not null,
  vigente_desde     timestamptz not null,
  registrado_por_id uuid not null references condomifacil.usuario (id),
  registrado_em     timestamptz not null default now(),
  unique (condominio_id, id),
  -- Sem empate de vigência para a mesma definição no condomínio; também indexa a consulta do
  -- valor vigente.
  unique (condominio_id, definicao_id, vigente_desde)
);

alter table condomifacil.parametro_condominio enable row level security;
alter table condomifacil.parametro_condominio force row level security;
create policy parametro_condominio_leitura_tenant on condomifacil.parametro_condominio
  for select to app_user using (condominio_id = condomifacil.condominio_atual());
-- O autor é sempre o titular da transação (RN-GE-01). Quem pode configurar (A/S) entra com os
-- vínculos do RM-21; até lá a autorização por função é do processo.
create policy parametro_condominio_inclusao_tenant on condomifacil.parametro_condominio
  for insert to app_user
  with check (condominio_id = condomifacil.condominio_atual()
              and registrado_por_id = condomifacil.usuario_atual());
grant select on condomifacil.parametro_condominio to app_user;
-- Sem UPDATE e DELETE: nova vigência é nova linha. registrado_em é o horário do banco.
grant insert (id, condominio_id, definicao_id, valor_json, vigente_desde, registrado_por_id)
  on condomifacil.parametro_condominio to app_user;
