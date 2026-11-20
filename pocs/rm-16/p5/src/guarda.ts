// Guarda do TenantContext (ADR-001 item 4; ADR-008, riscos), na camada do driver, abaixo do query builder.
// Máquina de estados por conexão física, sobre o texto de cada consulta que a biblioteca envia:
//   livre --begin--> aberta --set_config('app.condominio_id'...)--> contexto --commit/rollback--> livre
// Qualquer outra consulta em "livre" ou "aberta" é recusada ANTES de chegar ao banco, e conexão
// devolvida ao pool fora de "livre" é registrada. Assim, nem a biblioteca nem um uso errado dela
// conseguem consultar sem o contexto do condomínio, com pg ou com postgres.js.
import pg from 'pg';
import postgres from 'postgres';

type Estado = 'livre' | 'aberta' | 'contexto';
export class ForaDoTenantContext extends Error {
  constructor(texto: string, estado: Estado) {
    super(`consulta fora do TenantContext (estado ${estado}): ${texto.slice(0, 80)}`);
    this.name = 'ForaDoTenantContext';
  }
}

export const SQL_MARCA_CONTEXTO = "select set_config('app.condominio_id'";
const ehInicio = (t: string) => /^\s*(begin|start transaction)\b/i.test(t);
const ehFim = (t: string) => /^\s*(commit|rollback|end)\s*;?\s*$/i.test(t);

export class Guarda {
  violacoes: string[] = [];
  /** Devolve o próximo estado ou lança ForaDoTenantContext. */
  transicao(estado: Estado, texto: string): Estado {
    if (ehFim(texto)) return 'livre';
    if (estado === 'contexto') return 'contexto';
    if (estado === 'livre' && ehInicio(texto)) return 'aberta';
    if (estado === 'aberta' && texto.trimStart().toLowerCase().startsWith(SQL_MARCA_CONTEXTO)) return 'contexto';
    const erro = new ForaDoTenantContext(texto, estado);
    this.violacoes.push(erro.message);
    throw erro;
  }
  devolvida(estado: Estado) {
    if (estado !== 'livre') this.violacoes.push(`conexão devolvida ao pool em estado ${estado}`);
  }
}

const textoDe = (cfg: unknown) => (typeof cfg === 'string' ? cfg : (cfg as { text?: string })?.text ?? '');

/** Pool do pg instrumentado: todo client que sai do pool (inclusive via pool.query) passa pela guarda. */
export function poolPgGuardado(guarda: Guarda, config: pg.PoolConfig) {
  const pool = new pg.Pool(config);
  pool.on('error', () => {}); // conexão ociosa derrubada pelo servidor: o pool a descarta
  const estados = new WeakMap<pg.PoolClient, Estado>();
  const liberados = new WeakSet<pg.PoolClient>(); // só o acesso "bruto" dos testes
  pool.on('acquire', (client) => {
    if (estados.has(client)) return;
    estados.set(client, 'livre');
    // Conexão EMPRESTADA derrubada pelo servidor entre duas consultas emite 'error' no client; sem listener
    // vira exceção não tratada e derruba o processo (nem Kysely nem Drizzle registram). A próxima consulta
    // falha, a transação sobe o erro e o pool descarta a conexão.
    client.on('error', () => {});
    const original = client.query.bind(client) as (...a: unknown[]) => unknown;
    (client as { query: unknown }).query = (cfg: unknown, valores?: unknown, cb?: unknown) => {
      if (!liberados.has(client)) {
        try {
          estados.set(client, guarda.transicao(estados.get(client)!, textoDe(cfg)));
        } catch (e) {
          const callback = [valores, cb].find((x) => typeof x === 'function') as ((e: unknown) => void) | undefined;
          if (callback) { queueMicrotask(() => callback(e)); return undefined; } // pool.query usa callback
          return Promise.reject(e);
        }
      }
      return original(cfg, valores, cb);
    };
  });
  pool.on('release', (_err, client) => {
    if (!liberados.has(client)) guarda.devolvida(estados.get(client) ?? 'livre');
  });
  /** Só testes: conexão sem guarda para inspecionar o estado real da sessão. */
  const bruto = async <T>(fn: (c: pg.PoolClient) => Promise<T>) => {
    const c = await pool.connect();
    liberados.add(c);
    try { return await fn(c); } finally { liberados.delete(c); c.release(); }
  };
  return { pool, bruto };
}

type Sql = postgres.Sql;
/**
 * postgres.js instrumentado por Proxy:
 * - consulta pela raiz (sql`...` ou sql.unsafe) é sempre fora de transação -> recusada;
 * - sql.begin(cb): o postgres.js já enviou BEGIN; a primeira consulta do cb tem de ser o set_config;
 * - sql.reserve() (usado pelo kysely-postgres-js): conexão reservada passa pela máquina completa.
 */
export function sqlPostgresJsGuardado(guarda: Guarda, opcoes: postgres.Options<{}>) {
  const sql = postgres(opcoes);
  const recusarRaiz = (texto: string) => guarda.transicao('livre', texto); // lança, a menos que seja begin/fim
  const envolver = <C extends object>(alvo: C, inicial: Estado, aoLiberar?: (e: Estado) => void): C => {
    let estado = inicial;
    return new Proxy(alvo, {
      apply(t, esse, args) { // sql`...` em template
        estado = guarda.transicao(estado, (args[0] as TemplateStringsArray).join('$?'));
        return Reflect.apply(t as (...a: unknown[]) => unknown, esse, args);
      },
      get(t, prop, receiver) {
        const v = Reflect.get(t, prop, receiver);
        if (prop === 'unsafe') return (texto: string, ...resto: unknown[]) => {
          estado = guarda.transicao(estado, texto);
          return (v as (...a: unknown[]) => unknown).call(t, texto, ...resto);
        };
        if (prop === 'release' && aoLiberar) return () => { aoLiberar(estado); return (v as () => void).call(t); };
        return typeof v === 'function' ? v.bind(t) : v;
      },
    });
  };
  const raiz = new Proxy(sql, {
    apply(_t, _esse, args) { recusarRaiz((args[0] as TemplateStringsArray).join('$?')); return Reflect.apply(sql, undefined, args); },
    get(t, prop, receiver) {
      const v = Reflect.get(t, prop, receiver);
      if (prop === 'unsafe') return (texto: string, ...resto: unknown[]) => {
        recusarRaiz(texto);
        return (v as (...a: unknown[]) => unknown).call(t, texto, ...resto);
      };
      if (prop === 'begin') return (...args: unknown[]) => {
        const cb = args.pop() as (tx: Sql) => unknown;
        return (v as (...a: unknown[]) => unknown).call(t, ...args, (tx: Sql) => cb(envolver(tx, 'aberta')));
      };
      if (prop === 'reserve') return async () => envolver(await (v as () => Promise<object>).call(t), 'livre', (e) => guarda.devolvida(e));
      return typeof v === 'function' ? v.bind(t) : v;
    },
  }) as Sql;
  /** Só testes: consulta sem guarda numa conexão reservada do mesmo pool. */
  const bruto = async <T>(fn: (c: postgres.ReservedSql) => Promise<T>) => {
    const c = await sql.reserve();
    try { return await fn(c); } finally { c.release(); }
  };
  return { sql: raiz, bruto };
}
