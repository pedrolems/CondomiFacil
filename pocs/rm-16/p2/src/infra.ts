import { Kysely, sql, type Transaction, type Generated } from 'kysely';
import { PostgresJSDialect } from 'kysely-postgres-js';
import postgres from 'postgres';

export const RELOGIO = Symbol('RELOGIO');
export const DB = Symbol('DB');
export const CONFIG = Symbol('CONFIG');
export interface Relogio { agora(): Date }
export const relogioReal: Relogio = { agora: () => new Date() };

export interface Config {
  /** Origens permitidas para o fluxo web (CORS e verificacao de Origin do cookie). */
  origensWeb: string[];
  /** Tempo do cache do papel efetivo, em ms. 0 desliga. E a janela de defasagem da permissao. */
  cachePapelMs: number;
  accessTtlS: number;
  refreshTtlS: number;
}
export const configPadrao: Config = {
  origensWeb: ['https://painel.exemplo.invalid'], cachePapelMs: 5_000, accessTtlS: 900, refreshTtlS: 30 * 86400,
};

export interface Banco {
  'app.usuario': { id: Generated<string>; email: string; senha_hash: string | null; tipo: 'comum' | 'suporte'; excluido_em: Date | null };
  'app.vinculo': { id: Generated<string>; usuario_id: string; condominio_id: string; papel: string; ativo: boolean };
  'app.condominio': { id: Generated<string>; nome: string; plano: 'essencial' | 'gestao_suporte' };
  'app.substituicao': { condominio_id: string; subsindico_usuario_id: string; ativa: boolean };
  'app.sessao': { id: string; usuario_id: string; cliente: 'app' | 'web'; criada_em: Date; revogada_em: Date | null; motivo: string | null };
  'app.refresh_token': { hash: Buffer; sessao_id: string; gerado_em: Date; expira_em: Date; usado_em: Date | null };
  'app.aviso': { id: Generated<string>; condominio_id: string; texto: string };
}
export type Db = Kysely<Banco>;
export type Tx = Transaction<Banco>;

export const CONEXAO = { host: 'localhost', port: 54329, database: 'p2', username: 'app_user', password: 'app_local_ficticia' };

export function criarDb(max = 10) {
  const pg = postgres({ ...CONEXAO, max, onnotice: () => {} });
  return { db: new Kysely<Banco>({ dialect: new PostgresJSDialect({ postgres: pg }) }), encerrar: () => pg.end({ timeout: 5 }) };
}

export interface Contexto { usuarioId: string; condominioId?: string; papel?: string }

/** Unica porta para dados sob RLS: transacao com o contexto em set_config local (regra P3/P5). */
export function comContexto<T>(db: Db, ctx: Contexto, fn: (tx: Tx) => Promise<T>): Promise<T> {
  return db.transaction().execute(async (tx) => {
    await sql`select set_config('app.usuario_id', ${ctx.usuarioId}, true),
      set_config('app.condominio_id', ${ctx.condominioId ?? ''}, true), set_config('app.papel', ${ctx.papel ?? ''}, true)`.execute(tx);
    return fn(tx);
  });
}
