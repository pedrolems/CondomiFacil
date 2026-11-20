// Isolamento entre condomínios (CT-IS-01 passo 2) com o papel real app_user, repetido para
// cada driver (pg, postgres.js) e cada ligação (direta, PgBouncer em modo transaction).
import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import pg from 'pg';
import { criarTenantDb, ALVOS } from '../src/tenant-db.mjs';
import { A, B, unidade, portaria, visitaHoje } from '../src/ids.mjs';

const ctxA = { condominioId: A, papel: 'porteiro' };
const ctxB = { condominioId: B, papel: 'porteiro' };
const visitaDeB = visitaHoje(2, 1); // visita de hoje do condomínio B
const visitaDeA = visitaHoje(1, 1);
const TABELAS = ['app.condominio', 'app.unidade', 'app.portaria', 'app.visita'];

const contar = (q, tabela, onde = '') => q(`select count(*)::int as n from ${tabela} ${onde}`).then((r) => r[0].n);
const lerContexto = (q) =>
  q(`select pg_backend_pid() as pid, current_setting('app.condominio_id', true) as cond,
            current_setting('app.unidade_id', true) as unid, current_setting('app.papel', true) as papel`).then((r) => r[0]);
const semValor = (v) => v === null || v === '';

// Encerra conexões de servidor do app_user (limpeza do controle negativo). Usa o superusuário
// só como ferramenta do teste; a API nunca recebe essa credencial.
async function derrubarConexoesApp() {
  const su = new pg.Client({ ...ALVOS.direto, database: 'p3', user: 'postgres', password: 'postgres_local_ficticia' });
  await su.connect();
  await su.query("select pg_terminate_backend(pid) from pg_stat_activity where usename = 'app_user' and pid <> pg_backend_pid()");
  await su.end();
}

for (const driver of ['pg', 'postgres.js']) {
  for (const alvo of ['direto', 'pooler']) {
    describe(`${driver} via ${alvo}`, () => {
      let db;
      before(() => { db = criarTenantDb(driver, alvo, { max: 4 }); });
      after(() => db.encerrar());

      test('sem contexto: zero linhas em toda tabela e escrita recusada', async () => {
        for (const t of TABELAS) assert.equal(await db.semContexto((q) => contar(q, t)), 0, t);
        // Só condomínio sem unidade/papel: a política restritiva de visita também fecha.
        assert.equal(await db.comTenant({ condominioId: A }, (q) => contar(q, 'app.visita')), 0);
        await assert.rejects(
          db.semContexto((q) => q(`insert into app.visita (condominio_id, unidade_id, nome_visitante, dia)
                                   values ($1, $2, 'Teste', current_date)`, [A, unidade(1, 1)])),
          { code: '42501' },
        );
      });

      test('leitura: cada condomínio vê só o próprio, inclusive filtrando pelo ID do outro', async () => {
        const vistoA = await db.comTenant(ctxA, async (q) => ({
          condominios: await q('select id from app.condominio'),
          unidades: await contar(q, 'app.unidade'),
          portarias: await contar(q, 'app.portaria'),
          outros: await contar(q, 'app.visita', `where condominio_id <> '${A}'`),
          deB: await q('select id from app.visita where id = $1', [visitaDeB]),
          filtroB: await contar(q, 'app.unidade', `where condominio_id = '${B}'`),
        }));
        assert.deepEqual(vistoA, { condominios: [{ id: A }], unidades: 5000, portarias: 10, outros: 0, deB: [], filtroB: 0 });
        const vistoB = await db.comTenant(ctxB, async (q) => ({
          unidades: await contar(q, 'app.unidade'),
          deA: await q('select id from app.visita where id = $1', [visitaDeA]),
          hoje: await contar(q, 'app.visita', 'where dia = current_date'),
        }));
        assert.deepEqual(vistoB, { unidades: 150, deA: [], hoje: 150 });
      });

      test('escrita: A não cria, altera, move nem apaga dado de B', async () => {
        // Inserir com condominio_id de B estando em A: WITH CHECK recusa.
        await assert.rejects(db.comTenant(ctxA, (q) => q(
          `insert into app.visita (condominio_id, unidade_id, nome_visitante, dia) values ($1, $2, 'X', current_date)`,
          [B, unidade(2, 1)])), { code: '42501' });
        // Inserir em A apontando para unidade de B: FK composta recusa.
        await assert.rejects(db.comTenant(ctxA, (q) => q(
          `insert into app.visita (condominio_id, unidade_id, nome_visitante, dia) values ($1, $2, 'X', current_date)`,
          [A, unidade(2, 1)])), { code: '23503' });
        // Registrar entrada em A com portaria de B: FK composta recusa.
        await assert.rejects(db.comTenant(ctxA, (q) => q(
          `update app.visita set portaria_entrada_id = $1 where id = $2`, [portaria(2, 1), visitaDeA])), { code: '23503' });
        // UPDATE e DELETE de linha de B a partir de A: zero linhas afetadas.
        const alterou = await db.comTenant(ctxA, (q) => q(
          `update app.visita set nome_visitante = 'invadido' where id = $1 returning id`, [visitaDeB]));
        const apagou = await db.comTenant(ctxA, (q) => q(`delete from app.visita where id = $1 returning id`, [visitaDeB]));
        assert.deepEqual([alterou, apagou], [[], []]);
        // Mover linha própria para B: WITH CHECK recusa.
        await assert.rejects(db.comTenant(ctxA, (q) => q(
          `update app.visita set condominio_id = $1 where id = $2`, [B, visitaDeA])), { code: '42501' });
        // Conferido do lado de B: intacta.
        const linhaB = await db.comTenant(ctxB, (q) => q('select nome_visitante from app.visita where id = $1', [visitaDeB]));
        assert.deepEqual(linhaB, [{ nome_visitante: 'Visitante fictício 1' }]);
        // Escrita legítima em A funciona e é desfeita pelo rollback (erro proposital no fim).
        await assert.rejects(db.comTenant(ctxA, async (q) => {
          const [nova] = await q(`insert into app.visita (condominio_id, unidade_id, nome_visitante, dia)
                                  values ($1, $2, 'Rollback', current_date) returning id`, [A, unidade(1, 1)]);
          assert.ok(nova.id);
          await q('select 1/0');
        }), { code: '22012' });
        assert.equal(await db.comTenant(ctxA, (q) => contar(q, 'app.visita', "where nome_visitante = 'Rollback'")), 0);
      });

      test('segundo nível ilustrativo: morador vê só a própria unidade', async () => {
        const ctxMorador = { condominioId: A, unidadeId: unidade(1, 1), papel: 'morador' };
        const r = await db.comTenant(ctxMorador, async (q) => ({
          unidades: await q('select distinct unidade_id from app.visita where dia = current_date'),
          outraUnidade: await contar(q, 'app.visita', `where unidade_id = '${unidade(1, 2)}'`),
        }));
        assert.deepEqual(r, { unidades: [{ unidade_id: unidade(1, 1) }], outraUnidade: 0 });
        await assert.rejects(db.comTenant(ctxMorador, (q) => q(
          `insert into app.visita (condominio_id, unidade_id, nome_visitante, dia) values ($1, $2, 'X', current_date)`,
          [A, unidade(1, 2)])), { code: '42501' });
      });

      test('sem vazamento ao reutilizar a conexão: após commit, erro e rollback', async () => {
        const um = criarTenantDb(driver, alvo, { max: 1 });
        try {
          const pids = [];
          for (const etapa of ['commit', 'erro']) {
            if (etapa === 'commit') {
              pids.push((await um.comTenant(ctxA, lerContexto)).pid);
            } else {
              await assert.rejects(um.comTenant(ctxA, async (q) => { pids.push((await lerContexto(q)).pid); await q('select 1/0'); }));
            }
            const depois = await um.semContexto(async (q) => ({ ...(await lerContexto(q)), visitas: await contar(q, 'app.visita') }));
            assert.ok(semValor(depois.cond) && semValor(depois.unid) && semValor(depois.papel), `contexto vazou após ${etapa}`);
            assert.equal(depois.visitas, 0);
            pids.push(depois.pid);
          }
          // Na ligação direta a mesma conexão física é reutilizada; no pooler, o PID é o do servidor.
          if (alvo === 'direto') assert.equal(new Set(pids).size, 1, `esperava a mesma conexão: ${pids}`);
          console.log(`  ${driver}/${alvo}: PIDs de servidor usados = ${[...new Set(pids)].join(', ')}`);
        } finally {
          await um.encerrar();
        }
      });

      test('sem vazamento entre clientes diferentes que compartilham conexão de servidor', async () => {
        const x = criarTenantDb(driver, alvo, { max: 1 });
        const y = criarTenantDb(driver, alvo, { max: 1 });
        try {
          let reusos = 0;
          for (let i = 0; i < 30; i++) {
            const px = (await x.comTenant(i % 2 ? ctxA : ctxB, lerContexto)).pid;
            const vy = await y.semContexto(async (q) => ({ ...(await lerContexto(q)), u: await contar(q, 'app.unidade') }));
            assert.ok(semValor(vy.cond) && vy.u === 0, `cliente Y herdou contexto na iteração ${i}`);
            if (vy.pid === px) reusos++;
          }
          console.log(`  ${driver}/${alvo}: Y reutilizou a conexão de servidor de X em ${reusos}/30 iterações`);
          if (alvo === 'pooler') assert.ok(reusos > 0, 'o pooler não reutilizou conexão; o teste não provaria nada');
        } finally {
          await Promise.all([x.encerrar(), y.encerrar()]);
        }
      });

      test('controle negativo: SET de sessão vaza (o teste detecta), por isso é proibido', async () => {
        const x = criarTenantDb(driver, alvo, { max: 1 });
        const y = criarTenantDb(driver, alvo, { max: 1 });
        try {
          let vazou = false;
          for (let i = 0; i < 10 && !vazou; i++) {
            await x.semContexto((q) => q("select set_config('app.condominio_id', $1, false)", [A])); // false = sessão
            const alvoLeitura = alvo === 'pooler' ? y : x; // no pooler o vazamento atinge OUTRO cliente
            const u = await alvoLeitura.semContexto((q) => contar(q, 'app.unidade'));
            vazou = u === 5000;
          }
          assert.ok(vazou, 'o SET de sessão deveria vazar; se não vazou, o teste de vazamento é cego');
        } finally {
          await Promise.all([x.encerrar(), y.encerrar()]);
          await derrubarConexoesApp(); // remove as conexões de servidor contaminadas
        }
      });
    });
  }
}
