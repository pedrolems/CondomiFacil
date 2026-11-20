// Mesmo repositório de reservas escrito nas duas bibliotecas, para comparar código e comportamento.
// Recebe só a transação do TenantContext: não há como chegar ao pool daqui.
import { sql as sqlK } from 'kysely';
import { eq, sql as sqlD } from 'drizzle-orm';
import type { TxKysely } from './acesso-kysely.ts';
import type { TxDrizzle } from './acesso-drizzle.ts';
import { reserva, reservaAuditoria } from './esquema-drizzle.ts';

export type NovaReserva = { id?: string; condominioId: string; areaId: string; unidadeId: string; periodo: string };
export type LinhaReserva = { id: string; condominioId: string; estado: string };
export type LinhaAuditoria = { acao: string; estadoAntes: string | null; estadoDepois: string | null };

export interface RepoReservas<Tx> {
  listar(tx: Tx): Promise<LinhaReserva[]>;
  criar(tx: Tx, r: NovaReserva): Promise<string>;
  cancelar(tx: Tx, id: string): Promise<number>;
  auditoria(tx: Tx, reservaId: string): Promise<LinhaAuditoria[]>;
  /** Estado da sessão física: contexto atual e pid do backend. */
  sessao(tx: Tx): Promise<{ condominio: string | null; pid: number }>;
  dormir(tx: Tx, segundos: number): Promise<void>;
}

export const repoKysely: RepoReservas<TxKysely> = {
  listar: async (tx) => (await tx.selectFrom('app.reserva').select(['id', 'condominio_id', 'estado']).orderBy('id').execute())
    .map((r) => ({ id: r.id, condominioId: r.condominio_id, estado: r.estado })),
  criar: async (tx, r) => (await tx.insertInto('app.reserva')
    .values({ id: r.id, condominio_id: r.condominioId, area_id: r.areaId, unidade_id: r.unidadeId, periodo: r.periodo })
    .returning('id').executeTakeFirstOrThrow()).id,
  cancelar: async (tx, id) => Number((await tx.updateTable('app.reserva').set({ estado: 'cancelada' })
    .where('id', '=', id).executeTakeFirst()).numUpdatedRows),
  auditoria: async (tx, id) => (await tx.selectFrom('app.reserva_auditoria')
    .select(['acao', 'estado_antes', 'estado_depois']).where('reserva_id', '=', id).orderBy('id').execute())
    .map((r) => ({ acao: r.acao, estadoAntes: r.estado_antes, estadoDepois: r.estado_depois })),
  sessao: async (tx) => {
    const { rows: [r] } = await sqlK<{ condominio: string | null; pid: number }>`select nullif(current_setting('app.condominio_id', true), '') as condominio, pg_backend_pid() as pid`.execute(tx);
    return r!;
  },
  dormir: async (tx, s) => { await sqlK`select pg_sleep(${s})`.execute(tx); },
};

// tx.execute devolve QueryResult no node-postgres e array no postgres.js: o driver vaza para o código.
const linhas = (r: unknown) => (Array.isArray(r) ? r : (r as { rows: unknown[] }).rows) as Record<string, unknown>[];

export const repoDrizzle: RepoReservas<TxDrizzle> = {
  listar: (tx) => tx.select({ id: reserva.id, condominioId: reserva.condominioId, estado: reserva.estado })
    .from(reserva).orderBy(reserva.id),
  criar: async (tx, r) => (await tx.insert(reserva).values(r).returning({ id: reserva.id }))[0]!.id,
  cancelar: async (tx, id) => (await tx.update(reserva).set({ estado: 'cancelada' }).where(eq(reserva.id, id))
    .returning({ id: reserva.id })).length,
  auditoria: (tx, id) => tx.select({ acao: reservaAuditoria.acao, estadoAntes: reservaAuditoria.estadoAntes,
    estadoDepois: reservaAuditoria.estadoDepois }).from(reservaAuditoria)
    .where(eq(reservaAuditoria.reservaId, id)).orderBy(reservaAuditoria.id),
  sessao: async (tx) => {
    const [r] = linhas(await tx.execute(sqlD`select nullif(current_setting('app.condominio_id', true), '') as condominio, pg_backend_pid() as pid`));
    return { condominio: (r!.condominio as string | null), pid: Number(r!.pid) };
  },
  dormir: async (tx, s) => { await tx.execute(sqlD`select pg_sleep(${s})`); },
};
