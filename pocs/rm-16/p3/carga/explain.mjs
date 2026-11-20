// EXPLAIN (ANALYZE, BUFFERS) das consultas críticas como app_user, dentro do TenantContext,
// no condomínio grande (5.000 unidades). Escritas são desfeitas por rollback proposital.
// Linha de base sem RLS: papel fixtures (BYPASSRLS, só local) com o filtro de condomínio explícito.
// Uso: node carga/explain.mjs  -> grava resultados/explain.txt
import { writeFileSync } from 'node:fs';
import pg from 'pg';
import { criarTenantDb, ALVOS } from '../src/tenant-db.mjs';
import { A, unidade, portaria, visitaHoje } from '../src/ids.mjs';

const un = unidade(1, 42);
const consultas = [
  ['Q1 lista do dia da portaria', { condominioId: A, papel: 'porteiro' },
    `select id, condominio_id, estado from app.visita where dia = current_date and estado in ('esperada', 'dentro')
     order by criada_em desc limit 50`, [],
    `select id, condominio_id, estado from app.visita where condominio_id = '${A}' and dia = current_date
     and estado in ('esperada', 'dentro') order by criada_em desc limit 50`],
  ['Q2 registrar entrada (2 toques)', { condominioId: A, papel: 'porteiro' },
    `update app.visita set estado = 'dentro', entrada_em = now(), portaria_entrada_id = $1
     where id = $2 and estado = 'esperada' returning id`, [portaria(1, 1), visitaHoje(1, 2)]],
  ['Q3 morador cria visita', { condominioId: A, unidadeId: un, papel: 'morador' },
    `insert into app.visita (condominio_id, unidade_id, nome_visitante, dia) values ($1, $2, 'Explain', current_date) returning id`,
    [A, un]],
  ['Q4 visitas da unidade (morador, segundo nível)', { condominioId: A, unidadeId: un, papel: 'morador' },
    `select id, nome_visitante, dia, estado from app.visita where unidade_id = $1 and dia >= current_date - 30
     order by dia desc limit 20`, [un],
    `select id, nome_visitante, dia, estado from app.visita where condominio_id = '${A}' and unidade_id = '${un}'
     and dia >= current_date - 30 order by dia desc limit 20`],
  ['Q5 busca por ID de outro condomínio (caminho do 404)', { condominioId: A, papel: 'porteiro' },
    `select id from app.visita where id = $1`, [visitaHoje(2, 1)],
    `select id from app.visita where condominio_id = '${A}' and id = '${visitaHoje(2, 1)}'`],
];

const ROLLBACK = new Error('rollback proposital');
const db = criarTenantDb('pg', 'direto', { max: 1 });
const base = new pg.Client({ ...ALVOS.direto, database: 'p3', user: 'fixtures', password: 'fixtures_local_ficticia' });
await base.connect();
const saida = [`EXPLAIN gerado em ${new Date().toISOString()} (PostgreSQL ${(await base.query('show server_version')).rows[0].server_version})\n`];
const plano = (rows) => rows.map((r) => r['QUERY PLAN']).join('\n');

for (const [titulo, ctx, sql, params, semRls] of consultas) {
  for (let i = 0; i < 3; i++) { // aquece o cache; registra a última execução
    var texto;
    await db.comTenant(ctx, async (q) => {
      texto = plano(await q(`explain (analyze, buffers) ${sql}`, params));
      throw ROLLBACK;
    }).catch((e) => { if (e !== ROLLBACK) throw e; });
  }
  saida.push(`=== ${titulo} — app_user com RLS ===\n${texto}\n`);
  if (semRls) {
    for (let i = 0; i < 3; i++) texto = plano((await base.query(`explain (analyze, buffers) ${semRls}`)).rows);
    saida.push(`--- linha de base sem RLS (fixtures, filtro explícito) ---\n${texto}\n`);
  }
}
await base.end();
await db.encerrar();
writeFileSync(new URL('../resultados/explain.txt', import.meta.url), saida.join('\n'));
console.log(saida.join('\n'));
