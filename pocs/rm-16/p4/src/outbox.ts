import type { SQLiteDatabase } from 'expo-sqlite';
import { randomUUID } from 'expo-crypto';

export const novoId = () => randomUUID();

export async function criarEsquema(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS ops (
      seq INTEGER PRIMARY KEY AUTOINCREMENT,
      op_id TEXT NOT NULL UNIQUE,
      tipo TEXT NOT NULL,
      carga TEXT NOT NULL,
      registrado_em INTEGER NOT NULL,
      estado TEXT NOT NULL DEFAULT 'pendente',
      resultado TEXT
    );
    CREATE INDEX IF NOT EXISTS ops_estado ON ops(estado, seq);
    CREATE TABLE IF NOT EXISTS divergencias (
      op_id TEXT PRIMARY KEY, mensagem TEXT NOT NULL,
      confirmada_por TEXT, confirmada_em INTEGER
    );
    CREATE TABLE IF NOT EXISTS sync_estado (k TEXT PRIMARY KEY, v TEXT);
  `);
}

// Uma transacao curta por registro: o que o porteiro faz na pratica (1 toque = 1 operacao).
export async function enfileirar(db: SQLiteDatabase, tipo: string, carga: Record<string, unknown>, agora = Date.now(), opId = novoId()) {
  await db.runAsync('INSERT INTO ops (op_id, tipo, carga, registrado_em) VALUES (?,?,?,?)', opId, tipo, JSON.stringify(carga), agora);
  return opId;
}

export const contarPendentes = async (db: SQLiteDatabase) =>
  (await db.getFirstAsync<{ n: number }>("SELECT count(*) n FROM ops WHERE estado='pendente'"))!.n;

export type Resultado = { op_id: string; resultado: 'aplicada' | 'divergente' | 'recusada'; mensagem?: string };

// Envia em lotes, em ordem de seq. Marca 'enviada' SO depois da resposta do servidor: queda no meio
// deixa a operacao pendente e o reenvio e inofensivo (servidor deduplica por op_id).
export async function enviarPendentes(db: SQLiteDatabase, url: string, opts: { lote?: number } = {}) {
  const lote = opts.lote ?? 500;
  let enviadas = 0;
  for (;;) {
    const linhas = await db.getAllAsync<{ seq: number; op_id: string; tipo: string; carga: string; registrado_em: number }>(
      "SELECT seq, op_id, tipo, carga, registrado_em FROM ops WHERE estado='pendente' ORDER BY seq LIMIT ?", lote);
    if (!linhas.length) return { enviadas, ok: true as const };
    let resp: Response;
    try {
      resp = await fetch(`${url}/sync`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ops: linhas.map((l) => ({ ...l, carga: JSON.parse(l.carga) })) }),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    } catch (e) {
      return { enviadas, ok: false as const, erro: String(e) };
    }
    const { resultados } = (await resp.json()) as { resultados: Resultado[] };
    await db.withTransactionAsync(async () => {
      for (const r of resultados) {
        await db.runAsync("UPDATE ops SET estado='enviada', resultado=? WHERE op_id=?", r.resultado, r.op_id);
        if (r.resultado === 'divergente')
          await db.runAsync('INSERT OR IGNORE INTO divergencias (op_id, mensagem) VALUES (?,?)', r.op_id, r.mensagem ?? 'Divergência');
      }
      await db.runAsync("INSERT OR REPLACE INTO sync_estado (k,v) VALUES ('ultima_sync', ?)", String(Date.now()));
    });
    enviadas += resultados.length;
  }
}

export const divergenciasAbertas = (db: SQLiteDatabase) =>
  db.getAllAsync<{ op_id: string; mensagem: string }>('SELECT op_id, mensagem FROM divergencias WHERE confirmada_em IS NULL');

export const confirmarDivergencia = (db: SQLiteDatabase, opId: string, quem: string) =>
  db.runAsync('UPDATE divergencias SET confirmada_por=?, confirmada_em=? WHERE op_id=?', quem, Date.now(), opId);
