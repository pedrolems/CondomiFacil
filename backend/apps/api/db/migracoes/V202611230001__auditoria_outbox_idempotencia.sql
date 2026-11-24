-- Objetivo: fundação transversal do RM-24. Auditoria append-only (auditoria, de tenant, e
--   auditoria_plataforma, global), outbox transacional por condomínio (evento_saida) e registro
--   de requisições idempotentes (requisicao_idempotente), com RLS habilitada e forçada, grants
--   mínimos ao app_user, função de escopo escopo_atual() e gatilho que rejeita UPDATE, DELETE e
--   TRUNCATE nas duas auditorias para qualquer papel.
-- Referência: MER/DER, seção 4.12 (auditoria, auditoria_plataforma, evento_saida) e invariante de
--   auditoria append-only; ADR-001 (RLS, aceito com ressalvas em 20/11/2026); fase 2: E6
--   (identidades), E7 (sem SECURITY DEFINER), E13 (outbox em PostgreSQL + despachante no worker,
--   com app_user), E17 (idempotência por condomínio, usuário e chave, guarda de 24 h); decisão de
--   Pedro de 23/11/2026 (evento_saida é de tenant; e-mails de acesso do RM-20 saem pelo Mailer,
--   sem outbox global).
-- Escopos (GUC por transação, sempre set_config(..., true)):
--   app.condominio_id = <uuid>    contexto de tenant (já existente; condominio_atual()).
--   app.escopo = 'plataforma'     permite ao app_user INSERIR em auditoria_plataforma.
--   app.escopo = 'sistema'        sem app.condominio_id, permite ao app_user LER os eventos
--                                 pendentes de evento_saida de todos os condomínios, para o
--                                 despachante descobrir onde há pendência; publicar e registrar
--                                 erro continuam por condomínio, com app.condominio_id.
-- FKs adiadas: ator_usuario_id (auditoria e auditoria_plataforma) e requisicao_idempotente.usuario_id
--   ficam uuid sem FK; a FK para usuario entra na migration do RM-20, junto com a tabela usuario.
-- Pré-condições: V202611210001 a V202611210003 aplicadas (condominio e condominio_atual()).
-- Compatibilidade: só cria objetos.
-- Risco de lock: nenhum (objetos novos; FK nova lê condominio sem bloquear escrita relevante).
-- Recuperação: forward-only. Local/CI: recriar o banco ("pnpm db:instalar"). Ambiente
--   compartilhado: corrigir por nova migration, nunca editando esta.
set local lock_timeout = '5s';
set local statement_timeout = '60s';

-- Escopo especial por transação; ausente ou vazio vira NULL. Mesmo formato de condominio_atual().
create function condomifacil.escopo_atual() returns text
  language sql stable parallel safe
  as $$ select nullif(current_setting('app.escopo', true), '') $$;
revoke all on function condomifacil.escopo_atual() from public;
grant execute on function condomifacil.escopo_atual() to app_user;

-- Append-only para qualquer papel, inclusive dono e fixtures (BYPASSRLS não desliga gatilho).
create function condomifacil.rejeitar_alteracao_auditoria() returns trigger
  language plpgsql
  as $$
begin
  raise exception 'auditoria é somente inclusão: % em % recusado', tg_op, tg_table_name
    using errcode = 'P0001';
end
$$;
revoke all on function condomifacil.rejeitar_alteracao_auditoria() from public;

-- 1. auditoria (tenant) ------------------------------------------------------------------------
create table condomifacil.auditoria (
  id                  uuid primary key default gen_random_uuid(),
  condominio_id       uuid not null references condomifacil.condominio (id),
  ator_usuario_id     uuid, -- FK para usuario no RM-20
  ator_sistema        text,
  papel_efetivo       text not null,
  acao                text not null,
  entidade_tipo       text not null,
  -- Identificador histórico da entidade auditada, não FK: sobrevive à remoção/anonimização dela.
  entidade_referencia text not null,
  antes_sanitizado    jsonb,
  depois_sanitizado   jsonb,
  motivo              text,
  registrada_em       timestamptz not null default now(),
  correlacao_operacao text not null,
  unique (condominio_id, id),
  -- Exatamente uma origem: pessoa ou rotina do sistema.
  check ((ator_usuario_id is null) <> (ator_sistema is null)),
  check (ator_sistema is null or ator_sistema <> ''),
  check (correlacao_operacao <> '')
);
create index auditoria_entidade on condomifacil.auditoria
  (condominio_id, entidade_tipo, entidade_referencia, registrada_em);
create index auditoria_cronologia on condomifacil.auditoria (condominio_id, registrada_em);

create trigger auditoria_somente_inclusao
  before update or delete on condomifacil.auditoria
  for each row execute function condomifacil.rejeitar_alteracao_auditoria();
create trigger auditoria_sem_truncate
  before truncate on condomifacil.auditoria
  for each statement execute function condomifacil.rejeitar_alteracao_auditoria();

alter table condomifacil.auditoria enable row level security;
alter table condomifacil.auditoria force row level security;
create policy auditoria_leitura_tenant on condomifacil.auditoria
  for select to app_user using (condominio_id = condomifacil.condominio_atual());
create policy auditoria_inclusao_tenant on condomifacil.auditoria
  for insert to app_user with check (condominio_id = condomifacil.condominio_atual());
grant select on condomifacil.auditoria to app_user;
-- registrada_em fica fora: o horário é do banco, não do aplicativo.
grant insert (id, condominio_id, ator_usuario_id, ator_sistema, papel_efetivo, acao, entidade_tipo,
              entidade_referencia, antes_sanitizado, depois_sanitizado, motivo, correlacao_operacao)
  on condomifacil.auditoria to app_user;

-- 2. auditoria_plataforma (global) -------------------------------------------------------------
create table condomifacil.auditoria_plataforma (
  id                  uuid primary key default gen_random_uuid(),
  ator_usuario_id     uuid not null, -- FK para usuario no RM-20
  acao                text not null,
  entidade_tipo       text not null,
  entidade_referencia text not null, -- identificador histórico, não FK
  antes_sanitizado    jsonb,
  depois_sanitizado   jsonb,
  registrada_em       timestamptz not null default now()
);
create index auditoria_plataforma_cronologia on condomifacil.auditoria_plataforma (registrada_em);

create trigger auditoria_plataforma_somente_inclusao
  before update or delete on condomifacil.auditoria_plataforma
  for each row execute function condomifacil.rejeitar_alteracao_auditoria();
create trigger auditoria_plataforma_sem_truncate
  before truncate on condomifacil.auditoria_plataforma
  for each statement execute function condomifacil.rejeitar_alteracao_auditoria();

alter table condomifacil.auditoria_plataforma enable row level security;
alter table condomifacil.auditoria_plataforma force row level security;
-- Só inclusão, sob escopo de plataforma; sem SELECT (consulta humana não definida), por isso o
-- aplicativo não pode usar RETURNING nesta tabela.
create policy auditoria_plataforma_inclusao on condomifacil.auditoria_plataforma
  for insert to app_user with check (condomifacil.escopo_atual() = 'plataforma');
grant insert (id, ator_usuario_id, acao, entidade_tipo, entidade_referencia, antes_sanitizado,
              depois_sanitizado)
  on condomifacil.auditoria_plataforma to app_user;

-- 3. evento_saida (tenant, outbox transacional) ------------------------------------------------
create table condomifacil.evento_saida (
  id                     uuid primary key default gen_random_uuid(),
  condominio_id          uuid not null references condomifacil.condominio (id),
  tipo                   text not null,
  entidade_referencia    text not null,
  carga_minima_restrita  jsonb not null,
  criado_em              timestamptz not null default now(),
  publicado_em           timestamptz,
  chave_idempotencia     text not null,
  tentativas             integer not null default 0,
  ultimo_erro_sanitizado text,
  unique (condominio_id, id),
  unique (condominio_id, chave_idempotencia),
  check (chave_idempotencia <> ''),
  check (tentativas >= 0),
  check (publicado_em is null or publicado_em >= criado_em)
);
-- Fila do despachante: pendentes por condomínio, em ordem de criação.
create index evento_saida_pendentes on condomifacil.evento_saida (condominio_id, criado_em)
  where publicado_em is null;

alter table condomifacil.evento_saida enable row level security;
alter table condomifacil.evento_saida force row level security;
create policy evento_saida_leitura_tenant on condomifacil.evento_saida
  for select to app_user using (condominio_id = condomifacil.condominio_atual());
-- Despachante (E13): descobre os condomínios com pendência. Só pendentes, só sem contexto de
-- tenant, para nunca somar ao contexto de um condomínio. Ponto para revisão de Pedro.
create policy evento_saida_leitura_pendentes_sistema on condomifacil.evento_saida
  for select to app_user
  using (condomifacil.escopo_atual() = 'sistema'
         and condomifacil.condominio_atual() is null
         and publicado_em is null);
create policy evento_saida_inclusao_tenant on condomifacil.evento_saida
  for insert to app_user with check (condominio_id = condomifacil.condominio_atual());
create policy evento_saida_despacho_tenant on condomifacil.evento_saida
  for update to app_user
  using (condominio_id = condomifacil.condominio_atual())
  with check (condominio_id = condomifacil.condominio_atual());
grant select on condomifacil.evento_saida to app_user;
-- Inclusão nasce pendente (publicado_em, tentativas e erro ficam no padrão); horário do banco.
grant insert (id, condominio_id, tipo, entidade_referencia, carga_minima_restrita, chave_idempotencia)
  on condomifacil.evento_saida to app_user;
-- Atualização só das colunas de despacho; a carga e a chave são imutáveis para o aplicativo.
grant update (publicado_em, tentativas, ultimo_erro_sanitizado)
  on condomifacil.evento_saida to app_user;

-- 4. requisicao_idempotente (tenant, E17) ------------------------------------------------------
create table condomifacil.requisicao_idempotente (
  condominio_id uuid not null references condomifacil.condominio (id),
  usuario_id    uuid not null, -- FK para usuario no RM-20
  chave         text not null,
  metodo        text not null,
  rota          text not null,
  hash_corpo    text not null,
  status_http   smallint not null,
  resposta      jsonb, -- nulo quando a resposta não tem corpo
  criada_em     timestamptz not null default now(),
  -- Padrão criada_em + 24 h (now() é o mesmo na transação). Ao sobrescrever, o aplicativo
  -- informa os dois. Coluna gerada não serve: timestamptz + interval não é IMMUTABLE.
  expira_em     timestamptz not null default now() + interval '24 hours',
  primary key (condominio_id, usuario_id, chave),
  check (chave <> ''),
  check (status_http between 100 and 599),
  check (expira_em > criada_em)
);

alter table condomifacil.requisicao_idempotente enable row level security;
alter table condomifacil.requisicao_idempotente force row level security;
create policy requisicao_idempotente_leitura_tenant on condomifacil.requisicao_idempotente
  for select to app_user using (condominio_id = condomifacil.condominio_atual());
create policy requisicao_idempotente_inclusao_tenant on condomifacil.requisicao_idempotente
  for insert to app_user with check (condominio_id = condomifacil.condominio_atual());
-- Sobrescrita só de linha expirada; dentro da guarda a linha é imutável para o aplicativo.
create policy requisicao_idempotente_sobrescrita_expirada on condomifacil.requisicao_idempotente
  for update to app_user
  using (condominio_id = condomifacil.condominio_atual() and expira_em <= now())
  with check (condominio_id = condomifacil.condominio_atual());
grant select, insert on condomifacil.requisicao_idempotente to app_user;
grant update (metodo, rota, hash_corpo, status_http, resposta, criada_em, expira_em)
  on condomifacil.requisicao_idempotente to app_user;
