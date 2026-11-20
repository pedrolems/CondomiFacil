// TenantContext com Drizzle ORM 0.45.4 (só o query builder; sem drizzle-kit migrate/push).
// pg: drizzle-orm/node-postgres. postgres.js: drizzle-orm/postgres-js. Ambos no pacote principal.
import { sql } from 'drizzle-orm';
import { drizzle as drizzlePg, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { drizzle as drizzlePostgresJs, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { PgTransaction, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import * as esquema from './esquema-drizzle.ts';
import { Guarda, poolPgGuardado, sqlPostgresJsGuardado } from './guarda.ts';
import { CONEXAO, type AcessoDados, type ContextoTenant, type Driver } from './conexao.ts';

type Esquema = typeof esquema;
export type TxDrizzle = PgTransaction<PgQueryResultHKT, Esquema>;

export function criarAcessoDrizzle(driver: Driver, { max = 5, nomeApp = 'p5b' } = {}): AcessoDados<TxDrizzle> {
  const guarda = new Guarda();
  let db: NodePgDatabase<Esquema> | PostgresJsDatabase<Esquema>;
  let bruto: AcessoDados<TxDrizzle>['teste']['bruto'];
  let fechar: () => Promise<void>;
  if (driver === 'pg') {
    const g = poolPgGuardado(guarda, { ...CONEXAO, max, application_name: nomeApp });
    db = drizzlePg({ client: g.pool, schema: esquema });
    bruto = (t) => g.bruto(async (c) => (await c.query(t)).rows);
    fechar = () => g.pool.end();
  } else {
    const g = sqlPostgresJsGuardado(guarda, { ...CONEXAO, username: CONEXAO.user, max, onnotice: () => {},
      connection: { application_name: nomeApp } });
    db = drizzlePostgresJs({ client: g.sql, schema: esquema });
    bruto = (t) => g.bruto(async (c) => [...(await c.unsafe(t))]);
    fechar = () => g.sql.end({ timeout: 5 });
  }
  return {
    nome: `drizzle + ${driver}`,
    comTenant: <T>(ctx: ContextoTenant, fn: (tx: TxDrizzle) => Promise<T>) =>
      (db as NodePgDatabase<Esquema>).transaction(async (tx) => {
        await tx.execute(sql`select set_config('app.condominio_id', ${ctx.condominioId}, true), set_config('app.unidade_id', ${ctx.unidadeId ?? ''}, true)`);
        return fn(tx as unknown as TxDrizzle);
      }),
    encerrar: fechar,
    violacoes: () => guarda.violacoes,
    teste: { bibliotecaCrua: db, bruto },
  };
}
