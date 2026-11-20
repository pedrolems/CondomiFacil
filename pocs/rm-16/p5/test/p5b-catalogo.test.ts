// Teste de catálogo de RLS sobre o esquema PRODUZIDO PELO FLYWAY (ADR-008, linha 70; ADR-001 item 7).
// Conectado como app_user. Regra genérica: toda tabela fora do inventário de exceções tem RLS habilitada
// e forçada, e todo privilégio do app_user (SELECT/INSERT/UPDATE/DELETE) é coberto por política permissiva.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { CONEXAO } from '../src/conexao.ts';
import { psql } from '../scripts/ambiente.mjs';

// Inventário explícito: só o histórico do Flyway, em esquema sem USAGE para o app_user (verificado abaixo).
const EXCECOES = ['migracao.flyway_schema_history'];

let c: pg.Client;
before(async () => { c = new pg.Client(CONEXAO); await c.connect(); });
after(() => c.end());

async function problemasDeCatalogo(): Promise<string[]> {
  const { rows } = await c.query<{ tabela: string; habilitada: boolean; forcada: boolean; dono: string; descobertos: string[] }>(`
    select t.oid::regclass::text as tabela, t.relrowsecurity as habilitada, t.relforcerowsecurity as forcada,
           pg_get_userbyid(t.relowner) as dono,
           array(select p.priv from unnest(array['SELECT','INSERT','UPDATE','DELETE']) p(priv)
                 where has_table_privilege('app_user', t.oid, p.priv)
                   and not exists (select 1 from pg_policy pol where pol.polrelid = t.oid and pol.polpermissive
                         and (pol.polroles @> array[0::oid] or pol.polroles @> array[(select oid from pg_roles where rolname = 'app_user')])
                         and pol.polcmd::text in ('*', case p.priv when 'SELECT' then 'r' when 'INSERT' then 'a'
                                                                   when 'UPDATE' then 'w' else 'd' end))) as descobertos
    from pg_class t join pg_namespace n on n.oid = t.relnamespace
    where t.relkind in ('r', 'p') and n.nspname not in ('pg_catalog', 'information_schema') and n.nspname not like 'pg_toast%'
    order by 1`);
  const problemas: string[] = [];
  for (const t of rows) {
    if (EXCECOES.includes(t.tabela)) continue;
    if (!t.habilitada) problemas.push(`${t.tabela}: RLS não habilitada`);
    if (!t.forcada) problemas.push(`${t.tabela}: RLS não forçada`);
    if (t.dono !== 'migrador') problemas.push(`${t.tabela}: dono ${t.dono}, esperado migrador`);
    if (t.descobertos.length) problemas.push(`${t.tabela}: privilégio sem política (${t.descobertos})`);
  }
  if (!rows.some((t) => t.tabela === 'app.reserva')) problemas.push('app.reserva ausente');
  return problemas;
}

test('catálogo de RLS: toda tabela do Flyway com RLS habilitada, forçada, dono migrador e privilégios cobertos', async () => {
  assert.deepEqual(await problemasDeCatalogo(), []);
});

test('catálogo pega tabela nova esquecida sem RLS (o teste não é cego)', async () => {
  await psql('p5', 'create table app.esquecida (id int); grant select on app.esquecida to app_user;', 'migrador');
  try {
    const p = await problemasDeCatalogo();
    assert.ok(p.includes('app.esquecida: RLS não habilitada') && p.includes('app.esquecida: RLS não forçada'), p.join('\n'));
    assert.ok(p.some((x) => x.startsWith('app.esquecida: privilégio sem política')), p.join('\n'));
  } finally {
    await psql('p5', 'drop table app.esquecida;', 'migrador');
  }
});

test('objetos da migração de exemplo: EXCLUDE com btree_gist, gatilho ativo, índice CONCURRENTLY válido', async () => {
  const q = async (s: string) => (await c.query(s)).rows;
  assert.deepEqual(await q(`select conname, pg_get_constraintdef(oid) like 'EXCLUDE USING gist%' as gist
    from pg_constraint where conrelid = 'app.reserva'::regclass and contype = 'x'`),
    [{ conname: 'reserva_sem_sobreposicao', gist: true }]);
  assert.deepEqual(await q(`select extname, extnamespace::regnamespace::text as esquema from pg_extension where extname = 'btree_gist'`),
    [{ extname: 'btree_gist', esquema: 'extensoes' }]);
  assert.deepEqual(await q(`select tgname, tgenabled from pg_trigger where tgrelid = 'app.reserva'::regclass and not tgisinternal`),
    [{ tgname: 'reserva_auditada', tgenabled: 'O' }]);
  assert.deepEqual(await q(`select indisvalid from pg_index where indexrelid = 'app.reserva_por_unidade'::regclass`), [{ indisvalid: true }]);
});

test('app_user: sem BYPASSRLS, não dono, sem TRUNCATE/REFERENCES/TRIGGER, sem acesso ao histórico do Flyway', async () => {
  const { rows: [r] } = await c.query(`select rolsuper, rolbypassrls,
      (select count(*) from pg_class where relowner = r.oid)::int as relacoes,
      has_schema_privilege('app_user', 'migracao', 'USAGE') as usa_migracao,
      has_schema_privilege('app_user', 'extensoes', 'USAGE') as usa_extensoes,
      (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'app' and p.prosecdef)::int as security_definer
    from pg_roles r where rolname = current_user`);
  assert.deepEqual(r, { rolsuper: false, rolbypassrls: false, relacoes: 0, usa_migracao: false, usa_extensoes: false, security_definer: 0 });
  const { rows } = await c.query(`select c.oid::regclass::text as tabela, p.priv from pg_class c join pg_namespace n on n.oid = c.relnamespace,
      unnest(array['TRUNCATE', 'REFERENCES', 'TRIGGER']) p(priv)
    where c.relkind in ('r', 'p') and n.nspname = 'app' and has_table_privilege(c.oid, p.priv)`);
  assert.deepEqual(rows, []);
  await assert.rejects(c.query('select * from migracao.flyway_schema_history'), { code: '42501' });
  await assert.rejects(c.query('delete from app.reserva_auditoria'), { code: '42501' }); // auditoria append-only
});
