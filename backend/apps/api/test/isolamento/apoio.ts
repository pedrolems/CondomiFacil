// Apoio dos testes de banco real (RM-25). Banco principal dos testes: condomifacil_teste,
// instalado por preparar.ts com o mesmo comando documentado (db:instalar).
import type { Sql } from 'postgres';
import { carregarAmbiente, conectar, flyway } from '../../db/scripts/ambiente.js';
import { recriarBanco } from '../../db/scripts/provisionar.js';

export const BANCO_TESTE = 'condomifacil_teste';
process.env.DB_NOME = BANCO_TESTE;
export const amb = carregarAmbiente();

/** Banco temporário recriado e migrado (cada arquivo de teste usa o seu). */
export async function bancoMigrado(banco: string, opcoes?: { marcar?: boolean }): Promise<void> {
  await recriarBanco(amb, banco, opcoes);
  const r = await flyway(amb, ['migrate'], banco);
  if (r.code !== 0) throw new Error(`flyway migrate em ${banco} falhou:\n${r.out}`);
}

/** Remove um banco temporário. */
export async function removerBanco(banco: string): Promise<void> {
  const su = conectar(amb, 'postgres', 'postgres');
  try {
    await su.unsafe(`drop database if exists "${banco}" with (force)`);
  } finally {
    await su.end();
  }
}

export interface Violacao {
  tabela: string;
  problema: string;
}

// Tabelas de condomifacil que podem ficar sem RLS (inventário revisado). Vazio por ora.
export const EXCECOES_SEM_RLS: string[] = [];

/**
 * Auditoria do catálogo, rodando como app_user: RLS habilitada e forçada, dono migrador, todo
 * privilégio de DML do app_user coberto por política permissiva aplicável a ele, nenhum TRUNCATE,
 * REFERENCES ou TRIGGER e nenhuma função SECURITY DEFINER no esquema.
 */
export async function auditarCatalogo(sql: Sql): Promise<Violacao[]> {
  const tabelas = await sql<
    {
      tabela: string;
      habilitada: boolean;
      forcada: boolean;
      dono: string;
      sem_politica: string[];
      proibidos: string[];
    }[]
  >`
    with t as (
      select c.oid, c.relname::text as tabela, c.relrowsecurity as habilitada,
             c.relforcerowsecurity as forcada, pg_get_userbyid(c.relowner)::text as dono
      from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'condomifacil' and c.relkind in ('r', 'p')
    )
    select t.tabela, t.habilitada, t.forcada, t.dono,
      array(
        select p.priv from unnest(array['SELECT', 'INSERT', 'UPDATE', 'DELETE']) p(priv)
        -- has_any_column_privilege também enxerga grant por coluna (DELETE não tem coluna).
        where (case p.priv when 'DELETE' then has_table_privilege(t.oid, p.priv)
                           else has_any_column_privilege(t.oid, p.priv) end)
          and not exists (
            select from pg_policy pol
            where pol.polrelid = t.oid and pol.polpermissive
              and pol.polcmd in ('*', case p.priv when 'SELECT' then 'r' when 'INSERT' then 'a'
                                                 when 'UPDATE' then 'w' else 'd' end)
              and (0::oid = any(pol.polroles)
                   or (select oid from pg_roles where rolname = current_user) = any(pol.polroles)))
      ) as sem_politica,
      array(
        select p.priv from unnest(array['TRUNCATE', 'REFERENCES', 'TRIGGER']) p(priv)
        where (case p.priv when 'REFERENCES' then has_any_column_privilege(t.oid, p.priv)
                           else has_table_privilege(t.oid, p.priv) end)
      ) as proibidos
    from t order by t.tabela`;
  const v: Violacao[] = [];
  for (const t of tabelas) {
    if (!EXCECOES_SEM_RLS.includes(t.tabela)) {
      if (!t.habilitada) v.push({ tabela: t.tabela, problema: 'RLS não habilitada' });
      if (!t.forcada) v.push({ tabela: t.tabela, problema: 'RLS não forçada' });
    }
    if (t.dono !== 'migrador') v.push({ tabela: t.tabela, problema: `dono ${t.dono}` });
    for (const p of t.sem_politica)
      v.push({ tabela: t.tabela, problema: `${p} sem política permissiva` });
    for (const p of t.proibidos) v.push({ tabela: t.tabela, problema: `privilégio ${p}` });
  }
  const definer = await sql<{ f: string }[]>`
    select p.oid::regprocedure::text as f from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'condomifacil' and p.prosecdef`;
  for (const d of definer) v.push({ tabela: d.f, problema: 'função SECURITY DEFINER' });
  return v;
}

/** Inventário reprodutível: linhas de condomifacil, histórico do Flyway e namespaces de fixtures. */
export async function inventario(banco: string): Promise<Record<string, string>> {
  const su = conectar(amb, 'postgres', banco);
  try {
    const out: Record<string, string> = {};
    const tabelas = await su<{ t: string }[]>`
      select c.relname::text as t from pg_class c join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'condomifacil' and c.relkind in ('r', 'p') order by 1`;
    for (const { t } of tabelas) {
      const [r] = await su.unsafe<[{ n: number; h: string }]>(
        `select count(*)::int as n, coalesce(md5(string_agg(row_to_json(x)::text, ',' order by row_to_json(x)::text)), '') as h
         from condomifacil."${t}" x`,
      );
      out[`condomifacil.${t}`] = `${r.n}:${r.h}`;
    }
    const [f] = await su<[{ h: string }]>`
      select md5(string_agg(concat_ws('|', version, description, checksum, success), ',' order by installed_rank)) as h
      from infra_migracoes.flyway_schema_history`;
    out.flyway = f.h;
    const [ns] = await su<[{ h: string }]>`
      select coalesce(md5(string_agg(concat_ws('|', namespace, cenario, manifesto_hash, estado_hash), ',' order by namespace)), '') as h
      from infra_local.namespace_fixture`;
    out.namespaces = ns.h;
    return out;
  } finally {
    await su.end();
  }
}
