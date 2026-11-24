import { randomUUID } from 'node:crypto';
import type { Transacao } from '../tenant/index.js';

export interface NovoEvento {
  condominioId: string;
  tipo: string;
  entidadeReferencia: string;
  /** Carga mínima e restrita: sem dado pessoal; o consumidor busca o resto pelo identificador. */
  carga: Record<string, unknown>;
  /** Padrão: UUID novo; informe chave determinística para o mesmo fato não gerar dois eventos. */
  chave?: string;
}

/** Grava o evento na MESMA transação do ato (outbox): some junto se o ato for desfeito. */
export async function registrarEvento(tx: Transacao, e: NovoEvento): Promise<void> {
  await tx
    .insertInto('evento_saida')
    .values({
      condominio_id: e.condominioId,
      tipo: e.tipo,
      entidade_referencia: e.entidadeReferencia,
      carga_minima_restrita: e.carga as never,
      chave_idempotencia: e.chave ?? randomUUID(),
    })
    .execute();
}
