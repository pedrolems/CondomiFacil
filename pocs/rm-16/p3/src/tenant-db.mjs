// TenantContext mínimo (ADR-001 itens 2 a 4) para os dois drivers candidatos.
// Toda consulta de negócio passa por comTenant: BEGIN, set_config(..., true), consulta, COMMIT.
// semContexto existe só para os testes simularem um bug que fura o TenantContext.
import pg from 'pg';
import postgres from 'postgres';

export const ALVOS = {
  direto: { host: '127.0.0.1', port: 54329 },
  pooler: { host: '127.0.0.1', port: 54330 }, // PgBouncer 1.26, pool_mode=transaction
};
const credencial = { database: 'p3', user: 'app_user', password: 'app_local_ficticia' };

const SQL_CONTEXTO =
  "select set_config('app.condominio_id', $1, true), set_config('app.unidade_id', $2, true), set_config('app.papel', $3, true)";
const paramsContexto = (ctx) => [ctx.condominioId, ctx.unidadeId ?? '', ctx.papel ?? ''];

export function criarTenantDb(driver, alvo, { max = 20 } = {}) {
  const destino = { ...ALVOS[alvo], ...credencial };
  return driver === 'pg' ? viaPg(destino, max) : viaPostgresJs(destino, max);
}

function viaPg(destino, max) {
  const pool = new pg.Pool({ ...destino, max });
  pool.on('error', () => {}); // conexão ociosa derrubada pelo servidor: o pool a descarta
  const rodar = async (fn, ctx) => {
    const c = await pool.connect();
    let destruir = false;
    try {
      await c.query('begin');
      if (ctx) await c.query(SQL_CONTEXTO, paramsContexto(ctx));
      const r = await fn(async (text, params) => (await c.query(text, params)).rows);
      await c.query('commit');
      return r;
    } catch (e) {
      // Se nem o rollback funcionar, a conexão é descartada em vez de voltar ao pool.
      await c.query('rollback').catch(() => { destruir = true; });
      throw e;
    } finally {
      c.release(destruir);
    }
  };
  return {
    driver: 'pg',
    comTenant: (ctx, fn) => rodar(fn, ctx),
    semContexto: (fn) => rodar(fn, null),
    encerrar: () => pool.end(),
  };
}

function viaPostgresJs(destino, max) {
  const { host, port, database, user, password } = destino;
  // prepare=true também no pooler: o PgBouncer 1.26 está com max_prepared_statements=200.
  const sql = postgres({ host, port, database, username: user, password, max, prepare: true, onnotice: () => {} });
  // Result do postgres.js é subclasse de Array; copiar para array simples iguala a saída do pg.
  const q = (tx) => async (text, params = []) => [...(await tx.unsafe(text, params, { prepare: true }))];
  const rodar = (fn, ctx) =>
    sql.begin(async (tx) => {
      if (ctx) await tx.unsafe(SQL_CONTEXTO, paramsContexto(ctx), { prepare: true });
      return fn(q(tx));
    });
  return {
    driver: 'postgres.js',
    comTenant: (ctx, fn) => rodar(fn, ctx),
    semContexto: (fn) => rodar(fn, null),
    encerrar: () => sql.end({ timeout: 5 }),
  };
}
