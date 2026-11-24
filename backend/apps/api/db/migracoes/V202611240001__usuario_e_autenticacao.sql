-- Objetivo: identidade global e plano de autenticação do RM-20. Tabela usuario (RLS forçada: o
--   titular lê a própria linha e muda só o tema; credenciais só pelo app_autenticacao, por coluna),
--   função usuario_atual(), tabelas sessao, desafio_acesso e controle_login (sem RLS, exceção
--   explícita do módulo autenticacao, só app_autenticacao) e as FKs para usuario adiadas pelo
--   RM-25 e pelo RM-24.
-- Referência: MER/DER, seção 4.1 (usuario, sessao, desafio_acesso, controle_login); política de
--   acesso, seção 5.1; ADR-007 (aceito com ressalvas em 20/11/2026: retry B+E de 30 s e exceção
--   do plano de autenticação); ADR-001; PoC P2, seção 6, item 2; fase 2: E6 (app_autenticacao),
--   E7 (sem SECURITY DEFINER); RN-CD-02 (código de 6 dígitos, 15 min, 5 tentativas, reenvio após
--   60 s invalida o anterior), RN-CD-07, RN-CD-29, SEG-04 (pausa de 15 min após 5 erros), RF-AC-05.
-- Pré-condições: V202611210001 a V202611230001 aplicadas; provisionamento com CONNECT do
--   app_autenticacao no banco. Tabelas com FK adiada vazias ou só com ids de usuario existentes.
-- Compatibilidade: cria objetos e acrescenta FKs em parametro_padrao.registrado_por_id,
--   auditoria.ator_usuario_id, auditoria_plataforma.ator_usuario_id e
--   requisicao_idempotente.usuario_id (sem ação em cascata; usuario não tem DELETE).
-- Risco de lock: SHARE ROW EXCLUSIVE breve nas quatro tabelas com FK nova (validação lê as linhas
--   existentes; local e CI sem uso concorrente).
-- Recuperação: forward-only. Local/CI: recriar o banco ("pnpm db:instalar"). Ambiente
--   compartilhado: corrigir por nova migration, nunca editando esta.
set local lock_timeout = '5s';
set local statement_timeout = '60s';

grant usage on schema condomifacil to app_autenticacao;

-- Titular da transação (app.usuario_id por set_config(..., true)); ausente ou vazio vira NULL.
create function condomifacil.usuario_atual() returns uuid
  language sql stable parallel safe
  as $$ select nullif(current_setting('app.usuario_id', true), '')::uuid $$;
revoke all on function condomifacil.usuario_atual() from public;
grant execute on function condomifacil.usuario_atual() to app_user;

-- 1. usuario (global) --------------------------------------------------------------------------
create table condomifacil.usuario (
  id                uuid primary key default gen_random_uuid(),
  nome              text not null,
  email_normalizado text,
  senha_hash        text,
  -- RN-CD-07: mudança de morador ou desligamento desativam o acesso.
  estado            text not null default 'pre_cadastrado',
  tema_preferido    text not null default 'aparelho',
  anonimizado_em    timestamptz,
  check (estado in ('pre_cadastrado', 'ativo', 'desativado')),
  check (tema_preferido in ('aparelho', 'claro', 'escuro')),
  check (email_normalizado = lower(btrim(email_normalizado)) and email_normalizado <> ''),
  check (senha_hash <> ''),
  -- Identificável sempre tem e-mail; anonimizado não tem e-mail nem senha e fica desativado.
  check (anonimizado_em is not null or email_normalizado is not null),
  check (anonimizado_em is null
         or (email_normalizado is null and senha_hash is null and estado = 'desativado')),
  -- Senha nula antes da ativação; conta ativa sempre tem senha.
  check (estado <> 'pre_cadastrado' or senha_hash is null),
  check (estado <> 'ativo' or senha_hash is not null)
);
-- E-mail único enquanto identificável.
create unique index usuario_email_identificavel on condomifacil.usuario (email_normalizado)
  where anonimizado_em is null;

alter table condomifacil.usuario enable row level security;
alter table condomifacil.usuario force row level security;

-- app_user: projeção própria, sem senha_hash; altera só o tema. Pré-cadastro (INSERT por A/S)
-- entra no RM-21; sem DELETE para ninguém.
create policy usuario_leitura_titular on condomifacil.usuario
  for select to app_user using (id = condomifacil.usuario_atual());
create policy usuario_tema_titular on condomifacil.usuario
  for update to app_user
  using (id = condomifacil.usuario_atual())
  with check (id = condomifacil.usuario_atual());
grant select (id, nome, email_normalizado, estado, tema_preferido, anonimizado_em)
  on condomifacil.usuario to app_user;
grant update (tema_preferido) on condomifacil.usuario to app_user;

-- app_autenticacao: login, ativação e recuperação acontecem antes de existir titular na
-- transação, por isso a busca por e-mail alcança qualquer linha; só as colunas de credencial.
create policy usuario_leitura_autenticacao on condomifacil.usuario
  for select to app_autenticacao using (true);
create policy usuario_credencial_autenticacao on condomifacil.usuario
  for update to app_autenticacao using (true) with check (true);
grant select (id, email_normalizado, senha_hash, estado, anonimizado_em)
  on condomifacil.usuario to app_autenticacao;
grant update (senha_hash, estado) on condomifacil.usuario to app_autenticacao;

-- 2. sessao (global, sem RLS: exceção do módulo autenticacao) ----------------------------------
-- Refresh = "<sessao_id>.<segredo>" (decisão de Pedro de 24/11/2026): a sessão é achada pela PK e
-- só o hash do segredo fica gravado; por isso os hashes não têm UNIQUE nem índice.
-- Retry B+E (ADR-007): numa única linha ficam o hash vigente e o anterior. Toda renovação aceita é
-- um UPDATE condicional atômico; o bloqueio da linha e a reavaliação do WHERE no READ COMMITTED
-- garantem que só uma de duas renovações concorrentes vence.
--   Normal (apresentou o vigente):
--     update sessao set renovacao_hash_anterior = renovacao_hash, renovacao_hash = :novo,
--       rotacionada_em = now(), anterior_reusado_em = null, expira_em = :expira
--     where id = :id and renovacao_hash = :apresentado and revogada_em is null
--       and expira_em > now()
--   Retry (apresentou o anterior; vale uma vez, por 30 s, enquanto o sucessor não foi usado):
--     update sessao set renovacao_hash = :novo, anterior_reusado_em = now(), expira_em = :expira
--     where id = :id and renovacao_hash_anterior = :apresentado and anterior_reusado_em is null
--       and rotacionada_em > now() - interval '30 seconds' and revogada_em is null
--       and expira_em > now()
--   Usar o sucessor faz uma rotação normal, que troca o anterior; logo o anterior da linha sempre
--   tem o sucessor ainda não usado. Se nenhuma das duas afetar a linha, qualquer outro segredo
--   (inclusive de rotações antigas) é replay: update sessao set revogada_em = now() where id = :id.
create table condomifacil.sessao (
  id                        uuid primary key default gen_random_uuid(),
  usuario_id                uuid not null references condomifacil.usuario (id),
  renovacao_hash            text not null,
  renovacao_hash_anterior   text,
  rotacionada_em            timestamptz,
  anterior_reusado_em       timestamptz,
  expira_em                 timestamptz not null,
  revogada_em               timestamptz,
  dispositivo_identificador text,
  criada_em                 timestamptz not null default now(),
  check (renovacao_hash <> ''),
  check (renovacao_hash_anterior is distinct from renovacao_hash),
  -- O anterior só existe depois de uma rotação; o retry só consome um anterior existente.
  check ((renovacao_hash_anterior is null) = (rotacionada_em is null)),
  check (anterior_reusado_em is null or anterior_reusado_em >= rotacionada_em),
  check (expira_em > criada_em),
  check (revogada_em is null or revogada_em >= criada_em)
);
-- Revogar todas as sessões do usuário (troca/redefinição de senha, exclusão).
create index sessao_usuario on condomifacil.sessao (usuario_id) where revogada_em is null;

grant select on condomifacil.sessao to app_autenticacao;
-- criada_em, rotação e revogação nascem no padrão; o horário é do banco.
grant insert (id, usuario_id, renovacao_hash, expira_em, dispositivo_identificador)
  on condomifacil.sessao to app_autenticacao;
grant update (renovacao_hash, renovacao_hash_anterior, rotacionada_em, anterior_reusado_em,
              expira_em, revogada_em)
  on condomifacil.sessao to app_autenticacao;

-- 3. desafio_acesso (global, sem RLS) ----------------------------------------------------------
create table condomifacil.desafio_acesso (
  id                uuid primary key default gen_random_uuid(),
  usuario_id        uuid references condomifacil.usuario (id),
  destino_protegido text not null,
  finalidade        text not null,
  codigo_hash       text not null,
  emitido_em        timestamptz not null default now(),
  expira_em         timestamptz not null,
  tentativas        integer not null default 0,
  consumido_em      timestamptz,
  invalidado_em     timestamptz,
  check (finalidade in ('ativacao', 'recuperacao_senha')),
  check (destino_protegido <> '' and codigo_hash <> ''),
  check (expira_em > emitido_em),
  check (tentativas >= 0),
  check (consumido_em is null or invalidado_em is null)
);
-- No máximo um desafio ativo por destino e finalidade: o reenvio invalida o anterior na mesma
-- transação antes de inserir o novo (expirado sem invalidar também conta como ativo aqui).
create unique index desafio_acesso_ativo on condomifacil.desafio_acesso
  (destino_protegido, finalidade) where consumido_em is null and invalidado_em is null;

grant select on condomifacil.desafio_acesso to app_autenticacao;
grant insert (id, usuario_id, destino_protegido, finalidade, codigo_hash, expira_em)
  on condomifacil.desafio_acesso to app_autenticacao;
grant update (tentativas, consumido_em, invalidado_em)
  on condomifacil.desafio_acesso to app_autenticacao;

-- 4. controle_login (global, sem RLS) ----------------------------------------------------------
-- Um contador por chave protegida (e-mail cadastrado ou não): login, senha atual errada na troca
-- de senha (RN-CD-29) e e-mail não cadastrado usam o mesmo contador (SEG-04). O teto acumulado de
-- códigos errados (10 em 24 h por e-mail, pausa de 24 h; decisão de Pedro de 24/11/2026) usa outra
-- chave, com prefixo de finalidade definido pela API; janela_iniciada_em marca o início da janela
-- (nula até a primeira falha) nos dois usos.
create table condomifacil.controle_login (
  id                        uuid primary key default gen_random_uuid(),
  usuario_id                uuid references condomifacil.usuario (id),
  chave_tentativa_protegida text not null unique,
  falhas                    integer not null default 0,
  bloqueado_ate             timestamptz,
  janela_iniciada_em        timestamptz,
  check (chave_tentativa_protegida <> ''),
  check (falhas >= 0),
  -- A janela começa na primeira falha e zera junto com o contador.
  constraint controle_login_janela_coerente check ((falhas = 0) = (janela_iniciada_em is null))
);

grant select on condomifacil.controle_login to app_autenticacao;
grant insert (id, usuario_id, chave_tentativa_protegida, falhas, bloqueado_ate, janela_iniciada_em)
  on condomifacil.controle_login to app_autenticacao;
grant update (usuario_id, falhas, bloqueado_ate, janela_iniciada_em)
  on condomifacil.controle_login to app_autenticacao;

-- 5. FKs para usuario adiadas pelo RM-25 e pelo RM-24 ------------------------------------------
-- Sem ação em cascata: usuario não é apagado (anonimização preserva o identificador técnico).
alter table condomifacil.parametro_padrao
  add constraint parametro_padrao_registrado_por_fk
  foreign key (registrado_por_id) references condomifacil.usuario (id);
alter table condomifacil.auditoria
  add constraint auditoria_ator_usuario_fk
  foreign key (ator_usuario_id) references condomifacil.usuario (id);
alter table condomifacil.auditoria_plataforma
  add constraint auditoria_plataforma_ator_usuario_fk
  foreign key (ator_usuario_id) references condomifacil.usuario (id);
alter table condomifacil.requisicao_idempotente
  add constraint requisicao_idempotente_usuario_fk
  foreign key (usuario_id) references condomifacil.usuario (id);
