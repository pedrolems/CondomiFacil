// Teste de catálogo de RLS e do papel da aplicação (ADR-001 itens 1 e 7; arquitetura 4.11).
// Roda conectado como app_user, o papel real da API, nunca como dono.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { ALVOS } from '../src/tenant-db.mjs';

// Inventário explícito de tabelas globais (fora do tenant). Vazio nesta PoC.
const EXCECOES_GLOBAIS = [];

let c;
before(async () => {
  c = new pg.Client({ ...ALVOS.direto, database: 'p3', user: 'app_user', password: 'app_local_ficticia' });
  await c.connect();
});
after(() => c.end());

const tabelas = async () =>
  (await c.query(`
    select n.nspname || '.' || t.relname as tabela, t.relrowsecurity as habilitada,
           t.relforcerowsecurity as forcada,
           coalesce(array_agg(p.polcmd) filter (where p.polcmd is not null and p.polpermissive), '{}') as cmds_permissivos
    from pg_class t join pg_namespace n on n.oid = t.relnamespace
    left join pg_policy p on p.polrelid = t.oid
    where t.relkind in ('r', 'p') and n.nspname not in ('pg_catalog', 'information_schema')
      and n.nspname not like 'pg_toast%'
    group by 1, 2, 3 order by 1`)).rows;

test('catálogo: toda tabela tem RLS habilitada, forçada e política permissiva para todos os comandos', async () => {
  const lista = (await tabelas()).filter((t) => !EXCECOES_GLOBAIS.includes(t.tabela));
  assert.ok(lista.length >= 4, 'esperava ao menos as 4 tabelas do esquema');
  for (const t of lista) {
    assert.equal(t.habilitada, true, `${t.tabela}: RLS não habilitada`);
    assert.equal(t.forcada, true, `${t.tabela}: RLS não forçada`);
    // '*' = ALL. Sem política permissiva o acesso fica negado, mas a tabela ficaria inútil e
    // o teste quer flagrar tabela nova esquecida, não só "negada por acaso".
    const cobre = t.cmds_permissivos.includes('*') || ['r', 'a', 'w', 'd'].every((x) => t.cmds_permissivos.includes(x));
    assert.ok(cobre, `${t.tabela}: sem política para leitura e escrita (${t.cmds_permissivos})`);
  }
  console.log('tabelas verificadas:', lista.map((t) => t.tabela).join(', '));
});

test('papel app_user: sem superusuário, sem BYPASSRLS, sem papéis herdados e não é dono de nada', async () => {
  const { rows: [r] } = await c.query(`
    select rolsuper, rolbypassrls, rolcreaterole, rolcreatedb,
      (select count(*) from pg_auth_members where member = r.oid)::int as membro_de,
      (select count(*) from pg_class where relowner = r.oid)::int as relacoes,
      (select count(*) from pg_namespace where nspowner = r.oid)::int as esquemas,
      (select count(*) from pg_proc where proowner = r.oid)::int as funcoes
    from pg_roles r where rolname = current_user`);
  assert.deepEqual(r, { rolsuper: false, rolbypassrls: false, rolcreaterole: false, rolcreatedb: false,
    membro_de: 0, relacoes: 0, esquemas: 0, funcoes: 0 });
});

test('papel app_user: sem TRUNCATE (ignora RLS), REFERENCES ou TRIGGER em nenhuma tabela', async () => {
  const { rows } = await c.query(`
    select c.oid::regclass::text as tabela, p.priv
    from pg_class c join pg_namespace n on n.oid = c.relnamespace,
         unnest(array['TRUNCATE', 'REFERENCES', 'TRIGGER']) p(priv)
    where c.relkind in ('r', 'p') and n.nspname = 'app' and has_table_privilege(c.oid, p.priv)`);
  assert.deepEqual(rows, []);
});

test('sem funções SECURITY DEFINER no esquema (travessias só por inventário revisado)', async () => {
  const { rows } = await c.query(`select p.oid::regprocedure::text as f from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'app' and p.prosecdef`);
  assert.deepEqual(rows, []);
});

test('app_user não consegue desligar a RLS', async () => {
  await assert.rejects(c.query('alter table app.visita disable row level security'), { code: '42501' }); // não é dono
  await assert.rejects(c.query('alter table app.visita no force row level security'), { code: '42501' });
  await c.query('set row_security = off');
  try {
    // Com row_security=off o PostgreSQL recusa a consulta em vez de ignorar a política.
    await assert.rejects(c.query('select count(*) from app.visita'), { code: '42501' });
  } finally {
    await c.query('reset row_security');
  }
  await assert.rejects(c.query('truncate app.visita'), { code: '42501' });
});
