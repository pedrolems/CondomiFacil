import type { Selectable } from 'kysely';
import type { DB } from '../tenant/index.js';

export const MANIPULADORES_DE_EVENTO = Symbol('MANIPULADORES_DE_EVENTO');

/** Strategy por `tipo` de evento. Deve ser idempotente: o despacho é pelo menos uma vez. */
export interface ManipuladorDeEvento {
  readonly tipo: string;
  tratar(evento: Selectable<DB['evento_saida']>): Promise<void>;
}
