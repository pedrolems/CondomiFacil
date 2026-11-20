import * as SQLite from 'expo-sqlite';
import { abrir, apagarCache, cabecalhoDoArquivo, chaveAtual, existeArquivo } from './db';
import { confirmarDivergencia, contarPendentes, criarEsquema, divergenciasAbertas, enfileirar, enviarPendentes } from './outbox';

export const SERVIDOR = 'http://10.0.2.2:4545';
const C = 'cond1';
const post = (p: string, b: unknown = {}) => fetch(SERVIDOR + p, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) });
const estadoServidor = async () => (await fetch(SERVIDOR + '/admin/estado')).json();
const t = async <T,>(f: () => Promise<T>) => { const i = Date.now(); const r = await f(); return { r, ms: Date.now() - i }; };
const hex = (n: number) => '0'.repeat(n);

export type Ctx = { db: SQLite.SQLiteDatabase; usuario: string };
export let ctxAtual: Ctx | null = null;

async function abrirFila(usuario: string) {
  const { db, ...resto } = await abrir('fila', usuario, C);
  await criarEsquema(db);
  ctxAtual = { db, usuario };
  return { db, ...resto };
}

async function cifra() {
  const { db, arquivo, cipher } = await abrirFila('cifra');
  await enfileirar(db, 'entrada_visitante', { visitante_id: 'v-1', nome: 'MARCADOR-FICTICIO-ZEBRA-42' });
  await db.execAsync('PRAGMA wal_checkpoint(TRUNCATE);');
  const cabecalho = await cabecalhoDoArquivo(arquivo);
  // expo-sqlite reaproveita a conexao aberta do mesmo arquivo; fecha para testar de verdade.
  await db.closeAsync();
  let chaveErrada = 'ABRIU (ERRO!)';
  try { await abrir('fila', 'cifra', C, hex(64)); } catch (e) { chaveErrada = String(e); }
  let semChave = 'LEU (ERRO!)';
  try {
    const raw = await SQLite.openDatabaseAsync(arquivo);
    await raw.getAllAsync('SELECT * FROM ops');
  } catch (e) { semChave = String(e); }
  return { arquivo, cipher, cabecalho_hex: cabecalho, chaveErrada, semChave, marcador: 'MARCADOR-FICTICIO-ZEBRA-42' };
}

async function perf() {
  await post('/admin/reset');
  const usuario = `perf${Date.now()}`;
  const { db } = await abrirFila(usuario);
  const N = 10000;
  const enfileirar_ = await t(async () => {
    for (let i = 0; i < N; i++) await enfileirar(db, i % 2 ? 'entrada_visitante' : 'saida_visitante', { visitante_id: `v-${i}`, nota: 'x'.repeat(80) });
  });
  const pend = await contarPendentes(db);
  await db.closeAsync();
  const reabrir = await t(async () => { const o = await abrir('fila', usuario, C); const n = await contarPendentes(o.db); ctxAtual = { db: o.db, usuario }; return n; });
  const db2 = ctxAtual!.db;
  const sync = await t(() => enviarPendentes(db2, SERVIDOR, { lote: 500 }));
  return { N, enfileirar_ms: enfileirar_.ms, ms_por_op: enfileirar_.ms / N, pendentes_antes: pend, reabrir_ms: reabrir.ms, pendentes_ao_reabrir: reabrir.r, sync_ms: sync.ms, sync: sync.r, pendentes_depois: await contarPendentes(db2), servidor: await estadoServidor() };
}

async function queda() {
  await post('/admin/reset');
  const { db } = await abrirFila(`queda${Date.now()}`);
  for (let i = 0; i < 2000; i++) await enfileirar(db, 'entrada_visitante', { visitante_id: `v-${i}` });
  await post('/admin/falha', { cair_apos: 250, cair_vezes: 2 });
  const tent1 = await enviarPendentes(db, SERVIDOR, { lote: 500 });
  const pendAposQueda = await contarPendentes(db);
  const srvAposQueda = await estadoServidor();
  const tent2 = await enviarPendentes(db, SERVIDOR, { lote: 500 });
  return { tent1, pendAposQueda, srvAposQueda, tent2, pendFinal: await contarPendentes(db), servidor: await estadoServidor() };
}

async function kill_a() {
  await post('/admin/reset');
  const { db } = await abrirFila('kill');
  await db.execAsync("DELETE FROM ops; DELETE FROM sqlite_sequence WHERE name='ops';");
  for (let i = 0; i < 3000; i++) await enfileirar(db, 'entrada_visitante', { visitante_id: `v-${i}` });
  await post('/admin/falha', { atraso_ms: 400 });
  await post('/resultado', { cenario: 'kill_a', fase: 'enviando', pendentes: await contarPendentes(db) });
  const r = await enviarPendentes(db, SERVIDOR, { lote: 100 }); // o script mata o processo no meio
  return { terminou_sem_kill: r };
}

async function kill_b() {
  const { db } = await abrirFila('kill');
  const antes = await contarPendentes(db);
  const srvAntes = await estadoServidor();
  const r = await enviarPendentes(db, SERVIDOR, { lote: 100 });
  return { pendentes_ao_retomar: antes, srvAntes, r, pendFinal: await contarPendentes(db), servidor: await estadoServidor() };
}

async function diverg() {
  await post('/admin/reset');
  await post('/admin/cancelar_visitante', { id: 'v-77' });
  const { db } = await abrirFila(`dv${Date.now()}`);
  for (const id of ['v-1', 'v-77', 'v-2']) await enfileirar(db, 'entrada_visitante', { visitante_id: id });
  await enviarPendentes(db, SERVIDOR);
  return { abertas: await divergenciasAbertas(db), servidor: await estadoServidor() };
}

async function diverg_verificar() {
  const { db } = await abrirFila(ctxAtual?.usuario ?? 'dv');
  return { linhas: await db.getAllAsync('SELECT op_id, confirmada_por, confirmada_em FROM divergencias'), abertas: await divergenciasAbertas(db) };
}

async function logout() {
  const u = `lg${Date.now()}`;
  const cache = await abrir('cache', u, C);
  await cache.db.execAsync('CREATE TABLE IF NOT EXISTS lista_dia (id TEXT PRIMARY KEY, nome TEXT);');
  for (let i = 0; i < 200; i++) await cache.db.runAsync('INSERT INTO lista_dia VALUES (?,?)', `v-${i}`, `Visitante ficticio ${i}`);
  const fila = await abrirFila(u);
  for (let i = 0; i < 5; i++) await enfileirar(fila.db, 'entrada_visitante', { visitante_id: `v-${i}` });
  const antes = { cache: existeArquivo('cache', u, C), fila: existeArquivo('fila', u, C), pend: await contarPendentes(fila.db) };
  const chaveFila = await chaveAtual('fila', u, C);
  await cache.db.closeAsync();
  await fila.db.closeAsync();
  await apagarCache(u, C); // logout / virada do dia
  const depois = { cache: existeArquivo('cache', u, C), fila: existeArquivo('fila', u, C) };
  const re = await abrir('fila', u, C);
  const pendDepois = await contarPendentes(re.db);
  await re.db.closeAsync();
  const outro = await abrir('fila', `${u}_outro`, C);
  await criarEsquema(outro.db);
  const pendOutro = await contarPendentes(outro.db);
  await outro.db.closeAsync();
  let outroLeFila = 'ABRIU (ERRO!)';
  try { const x = await abrir('fila', u, C, (await chaveAtual('fila', `${u}_outro`, C))); await x.db.closeAsync(); } catch (e) { outroLeFila = String(e); }
  return { antes, depois, pendDepoisDoLogout: pendDepois, pendOutroUsuario: pendOutro, outroUsuarioComChaveDele: outroLeFila, chaveFilaMantida: chaveFila.length === 64 };
}

async function adr014() {
  await post('/admin/reset');
  const { db } = await abrirFila(`adr${Date.now()}`);
  const agora = Date.now(); const h = 3600_000;
  const c = (ciclo: string) => ({ ciclo });
  await enfileirar(db, 'conclusao_chamado', c('c1'), agora - 1 * h); // chega primeiro, horario posterior
  await enfileirar(db, 'conclusao_chamado', c('c1'), agora - 2 * h); // horario anterior, chega depois
  await enfileirar(db, 'conclusao_chamado', c('c1'), agora - 2 * h); // empate exato
  await enfileirar(db, 'conclusao_chamado', c('c2'), agora - 1 * h);
  await enfileirar(db, 'conclusao_chamado', c('c2'), agora + 48 * h); // relogio no futuro: perde
  await enfileirar(db, 'conclusao_chamado', c('c3'), agora - 1 * h);
  await enfileirar(db, 'conclusao_chamado', c('c3'), agora - 24 * h); // relogio atrasado: vence sem ser o primeiro de fato
  await enviarPendentes(db, SERVIDOR);
  return { servidor: await estadoServidor(), ops: await db.getAllAsync('SELECT seq, op_id, registrado_em, resultado FROM ops ORDER BY seq') };
}

export const CENARIOS: Record<string, () => Promise<unknown>> = { cifra, perf, queda, kill_a, kill_b, diverg, diverg_verificar, logout, adr014 };

export async function executar(nome: string) {
  const ini = Date.now();
  try {
    const r = await CENARIOS[nome]();
    await post('/resultado', { cenario: nome, ok: true, ms: Date.now() - ini, r });
  } catch (e) {
    await post('/resultado', { cenario: nome, ok: false, erro: String(e), stack: (e as Error).stack?.slice(0, 600) });
  }
}

export { confirmarDivergencia, divergenciasAbertas };
