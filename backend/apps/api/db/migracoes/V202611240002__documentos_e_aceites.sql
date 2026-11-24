-- Objetivo: documentos versionados e aceites do RM-20 (documento, documento_versao, aceite), com
--   RLS forçada: documento global legível por quem tem titular na transação, documento de
--   condomínio só no contexto daquele condomínio; versão e aceite herdam o escopo do documento.
--   Documento só existe com ao menos uma versão publicada na mesma transação (P-15).
-- Referência: MER/DER, seção 4.1 (documento, documento_versao, aceite); política de acesso, seção
--   5.1 e 8.2 (publicação global sem autor definido: só fixture na fase 2); RN-CD-03 (nova versão
--   exige novo aceite); decisão de Pedro de 08/11/2026 (documento nasce com versão publicada).
-- Pré-condições: V202611240001 aplicada (usuario e usuario_atual()).
-- Compatibilidade: só cria objetos. arquivo_id e o XOR texto/arquivo entram com a tabela arquivo;
--   até lá conteudo_texto é obrigatório.
-- Risco de lock: nenhum (objetos novos).
-- Recuperação: forward-only. Local/CI: recriar o banco ("pnpm db:instalar"). Ambiente
--   compartilhado: corrigir por nova migration, nunca editando esta.
set local lock_timeout = '5s';
set local statement_timeout = '60s';

-- 1. documento ---------------------------------------------------------------------------------
create table condomifacil.documento (
  id            uuid primary key default gen_random_uuid(),
  tipo          text not null,
  -- Nulo = documento global, sem dado de tenant; nunca abre dados de condomínio.
  condominio_id uuid references condomifacil.condominio (id),
  titulo        text not null,
  check (tipo in ('termos_de_uso', 'politica_de_privacidade', 'regimento', 'como_funciona',
                  'responsabilidade_conta_pf')),
  check (tipo <> 'regimento' or condominio_id is not null),
  check (titulo <> '')
);
-- Um documento por tipo em cada escopo (decisão de Pedro de 24/11/2026); mudança de texto é nova
-- versão do mesmo documento. O índice de condomínio também serve à FK.
create unique index documento_tipo_global on condomifacil.documento (tipo)
  where condominio_id is null;
create unique index documento_tipo_condominio on condomifacil.documento (condominio_id, tipo)
  where condominio_id is not null;

-- 2. documento_versao --------------------------------------------------------------------------
create table condomifacil.documento_versao (
  id             uuid primary key default gen_random_uuid(),
  documento_id   uuid not null references condomifacil.documento (id),
  numero         integer not null,
  conteudo_texto text not null,
  publicado_em   timestamptz not null default now(),
  vigente_desde  timestamptz not null,
  unique (documento_id, numero),
  check (numero > 0),
  check (conteudo_texto <> '')
);

-- P-15: ao fim da transação, todo documento inserido tem versão. Constraint trigger diferida (não
-- SECURITY DEFINER): roda com o papel de quem inseriu, que precisa enxergar a versão que criou.
create function condomifacil.exigir_versao_do_documento() returns trigger
  language plpgsql
  as $$
begin
  if not exists (select from condomifacil.documento_versao v where v.documento_id = new.id) then
    raise exception 'documento % sem versão publicada', new.id
      using errcode = '23514', constraint = 'documento_exige_versao';
  end if;
  return null;
end
$$;
revoke all on function condomifacil.exigir_versao_do_documento() from public;

create constraint trigger documento_exige_versao
  after insert on condomifacil.documento
  deferrable initially deferred
  for each row execute function condomifacil.exigir_versao_do_documento();

-- 3. aceite ------------------------------------------------------------------------------------
create table condomifacil.aceite (
  id                  uuid primary key default gen_random_uuid(),
  usuario_id          uuid not null references condomifacil.usuario (id),
  documento_versao_id uuid not null references condomifacil.documento_versao (id),
  aceito_em           timestamptz not null default now(),
  unique (usuario_id, documento_versao_id)
);
create index aceite_documento_versao on condomifacil.aceite (documento_versao_id);

-- 4. RLS e grants ------------------------------------------------------------------------------
-- Publicação na fase 2 só por fixture: nenhuma política de INSERT de documento ou versão para o
-- app_user. Sem UPDATE e sem DELETE: conteúdo publicado e aceite são imutáveis para o aplicativo.
alter table condomifacil.documento enable row level security;
alter table condomifacil.documento force row level security;
-- Dois ramos disjuntos: global exige titular; de condomínio exige o contexto daquele condomínio.
create policy documento_leitura on condomifacil.documento
  for select to app_user
  using ((condominio_id is null and condomifacil.usuario_atual() is not null)
         or condominio_id = condomifacil.condominio_atual());
grant select on condomifacil.documento to app_user;

alter table condomifacil.documento_versao enable row level security;
alter table condomifacil.documento_versao force row level security;
-- Herda o escopo: a subconsulta em documento passa pela RLS de documento.
create policy documento_versao_leitura on condomifacil.documento_versao
  for select to app_user
  using (exists (select from condomifacil.documento d where d.id = documento_id));
grant select on condomifacil.documento_versao to app_user;

alter table condomifacil.aceite enable row level security;
alter table condomifacil.aceite force row level security;
create policy aceite_leitura_titular on condomifacil.aceite
  for select to app_user
  using (usuario_id = condomifacil.usuario_atual()
         and exists (select from condomifacil.documento_versao v where v.id = documento_versao_id));
create policy aceite_inclusao_titular on condomifacil.aceite
  for insert to app_user
  with check (usuario_id = condomifacil.usuario_atual()
              and exists (select from condomifacil.documento_versao v
                          where v.id = documento_versao_id));
grant select on condomifacil.aceite to app_user;
-- aceito_em é o horário do banco.
grant insert (id, usuario_id, documento_versao_id) on condomifacil.aceite to app_user;
