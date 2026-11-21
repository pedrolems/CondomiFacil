-- Objetivo: catálogos globais de parâmetros configuráveis: parametro_definicao (as chaves da RN 13)
--   e parametro_padrao (histórico imutável dos padrões de plataforma), com RLS forçada.
-- Referência: MER/DER, dicionário de parâmetros (parametro_definicao e parametro_padrao); Regras de
--   Negócio, seção 13; fase 2: E4 (origem carga_versionada x usuario); ADR-001; decisão de Pedro de
--   21/11/2026 (parametro_condominio e a FK registrado_por_id -> usuario entram no RM-20).
-- Pré-condições: V202611210001 aplicada (esquema com USAGE para app_user).
-- Compatibilidade: só cria objetos; tabelas globais, sem condominio_id.
-- Risco de lock: nenhum (objetos novos).
-- Recuperação: forward-only. Local/CI: recriar o banco ("pnpm db:instalar"). Ambiente
--   compartilhado: corrigir por nova migration, nunca editando esta.
set local lock_timeout = '5s';
set local statement_timeout = '60s';

create table condomifacil.parametro_definicao (
  id                uuid primary key,
  chave             text not null unique,
  tipo              text not null,
  minimo            numeric,
  maximo            numeric,
  niveis_permitidos text[] not null,
  regra_id          text not null,
  descricao         text not null,
  check (minimo is null or maximo is null or minimo <= maximo),
  check (cardinality(niveis_permitidos) > 0
         and niveis_permitidos <@ array['plataforma', 'condominio', 'area']::text[])
);

create table condomifacil.parametro_padrao (
  id                uuid primary key,
  definicao_id      uuid not null references condomifacil.parametro_definicao (id),
  valor_json        jsonb not null,
  vigente_desde     timestamptz not null,
  -- Sem FK por enquanto: a FK para usuario entra na migration do RM-20, junto com a tabela usuario.
  registrado_por_id uuid,
  registrado_em     timestamptz not null default now(),
  origem            text not null,
  versao_migracao   text,
  -- Sem empate de vigência para a mesma definição; também serve de índice para a FK.
  unique (definicao_id, vigente_desde),
  -- E4: carga versionada não tem autor humano; registro por usuário não tem versão de migration.
  check (
    (origem = 'carga_versionada' and registrado_por_id is null and versao_migracao is not null)
    or (origem = 'usuario' and registrado_por_id is not null and versao_migracao is null)
  )
);

-- Catálogos globais: RLS forçada também aqui, para valer a regra "todo privilégio do app_user é
-- coberto por política permissiva". app_user só lê; o histórico de padrões é imutável para ele.
alter table condomifacil.parametro_definicao enable row level security;
alter table condomifacil.parametro_definicao force row level security;
create policy parametro_definicao_leitura on condomifacil.parametro_definicao
  for select to app_user using (true);
grant select on condomifacil.parametro_definicao to app_user;

alter table condomifacil.parametro_padrao enable row level security;
alter table condomifacil.parametro_padrao force row level security;
create policy parametro_padrao_leitura on condomifacil.parametro_padrao
  for select to app_user using (true);
grant select on condomifacil.parametro_padrao to app_user;
