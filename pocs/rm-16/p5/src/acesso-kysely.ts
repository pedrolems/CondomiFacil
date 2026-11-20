// TenantContext com Kysely 0.29.9. pg: PostgresDialect (nativo do Kysely). postgres.js: kysely-postgres-js
// 5.1.0 (organização kysely-org no GitHub, mantido pelo time do Kysely, fora do pacote principal).
import { Kysely, PostgresDialect, sql, type Transaction } from 'kysely';
import { PostgresJSDialect } from 'kysely-postgres-js';
import type { DB } from './tipos-kysely.ts';
import { Guarda, poolPgGuardado, sqlPostgresJsGuardado } from './guarda.ts';
import { CONEXAO, type AcessoDados, type ContextoTenant, type Driver } from './conexao.ts';

export type TxKysely = Transaction<DB>;

// Com inflightQueryAbortStrategy 'cancel query'/'kill session', o PostgresDialect abriria um pg.Client NOVO,
// fora do pool e da guarda, para rodar pg_cancel_backend. Este construtor torna isso um erro explícito.
class ClienteDeControleProibido {
  constructor() { throw new Error('conexão de controle proibida: não use inflightQueryAbortStrategy'); }
}

export function criarAcessoKysely(driver: Driver,
  { max = 5, nomeApp = 'p5b', clienteDeControle = ClienteDeControleProibido as unknown } = {}): AcessoDados<TxKysely> {
  const guarda = new Guarda();
  let db: Kysely<DB>;
  let bruto: AcessoDados<TxKysely>['teste']['bruto'];
  // O pool é nosso: db.destroy() só fecha o pool se o Kysely já o tiver inicializado (é preguiçoso).
  let fechar: () => Promise<void>;
  if (driver === 'pg') {
    const g = poolPgGuardado(guarda, { ...CONEXAO, max, application_name: nomeApp });
    db = new Kysely<DB>({ dialect: new PostgresDialect({ pool: g.pool, controlClient: clienteDeControle as never }) });
    bruto = (t) => g.bruto(async (c) => (await c.query(t)).rows);
    fechar = () => g.pool.end();
  } else {
    const g = sqlPostgresJsGuardado(guarda, { ...CONEXAO, username: CONEXAO.user, max, onnotice: () => {},
      connection: { application_name: nomeApp } });
    db = new Kysely<DB>({ dialect: new PostgresJSDialect({ postgres: g.sql }) });
    bruto = (t) => g.bruto(async (c) => [...(await c.unsafe(t))]);
    fechar = () => g.sql.end({ timeout: 5 });
  }
  return {
    nome: `kysely + ${driver}`,
    comTenant: <T>(ctx: ContextoTenant, fn: (tx: TxKysely) => Promise<T>) =>
      db.transaction().execute(async (trx) => {
        await sql`select set_config('app.condominio_id', ${ctx.condominioId}, true), set_config('app.unidade_id', ${ctx.unidadeId ?? ''}, true)`.execute(trx);
        return fn(trx);
      }),
    encerrar: fechar,
    violacoes: () => guarda.violacoes,
    teste: { bibliotecaCrua: db, bruto },
  };
}
