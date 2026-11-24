import { sql, type Transaction } from 'kysely';
import type { Banco } from './banco.js';
import type { DB } from './gerado/tipos-banco.js';

export type Transacao = Transaction<DB>;

/** Valores de app.* de uma transação; vazio vira NULL em condominio_atual() e escopo_atual(). */
export interface ValoresDeContexto {
  condominioId?: string;
  // 'sistema' não existe aqui: só escopo-sistema.ts monta esse contexto (uso exclusivo do worker).
  escopo?: 'plataforma';
  usuarioId?: string;
  unidadeId?: string;
  papel?: string;
}

/**
 * Único caminho de consulta: BEGIN, set_config(..., true) local, fn, COMMIT/ROLLBACK. Nunca SET de
 * sessão: o contexto morre com a transação e não vaza para a próxima requisição do pool.
 */
export function abrirTransacao<T>(
  banco: Banco,
  v: ValoresDeContexto,
  fn: (tx: Transacao) => Promise<T>,
): Promise<T> {
  return banco.db.transaction().execute(async (tx) => {
    await sql`select set_config('app.condominio_id', ${v.condominioId ?? ''}, true),
      set_config('app.escopo', ${v.escopo ?? ''}, true),
      set_config('app.usuario_id', ${v.usuarioId ?? ''}, true),
      set_config('app.unidade_id', ${v.unidadeId ?? ''}, true),
      set_config('app.papel', ${v.papel ?? ''}, true)`.execute(tx);
    return fn(tx);
  });
}
