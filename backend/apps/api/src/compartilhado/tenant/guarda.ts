// Guarda do TenantContext (ADR-001 item 4; PoC P5): máquina de estados por conexão sobre o texto de
// cada consulta que o postgres.js recebe, ANTES de chegar ao banco:
//   livre --begin--> aberta --set_config('app.condominio_id'...)--> contexto --commit/rollback--> livre
// Qualquer outra consulta em "livre" ou "aberta" é recusada. Não substitui a RLS: só antecipa a falha.
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
    if (estado === 'aberta' && texto.trimStart().toLowerCase().startsWith(SQL_MARCA_CONTEXTO)) {
      return 'contexto';
    }
    const erro = new ForaDoTenantContext(texto, estado);
    this.violacoes.push(erro.message);
    throw erro;
  }

  devolvida(estado: Estado): void {
    if (estado !== 'livre') this.violacoes.push(`conexão devolvida ao pool em estado ${estado}`);
  }
}

type Sql = postgres.Sql;

/**
 * postgres.js instrumentado por Proxy:
 * - consulta pela raiz (sql`...` ou sql.unsafe) é sempre fora de transação e é recusada;
 * - sql.begin(cb): o postgres.js já enviou BEGIN; a primeira consulta do cb tem de ser o set_config;
 * - sql.reserve() (usado pelo kysely-postgres-js): a conexão reservada passa pela máquina completa.
 */
export function sqlPostgresJsGuardado(
  guarda: Guarda,
  opcoes: postgres.Options<Record<string, postgres.PostgresType>>,
): Sql {
  const sql = postgres(opcoes);
  const recusarRaiz = (texto: string) => guarda.transicao('livre', texto);
  const envolver = <C extends object>(
    alvo: C,
    inicial: Estado,
    aoLiberar?: (e: Estado) => void,
  ): C => {
    let estado = inicial;
    return new Proxy(alvo, {
      apply(t, esse, args) {
        estado = guarda.transicao(estado, (args[0] as TemplateStringsArray).join('$?'));
        return Reflect.apply(t as (...a: unknown[]) => unknown, esse, args);
      },
      get(t, prop, receiver) {
        const v = Reflect.get(t, prop, receiver);
        if (prop === 'unsafe') {
          return (texto: string, ...resto: unknown[]) => {
            estado = guarda.transicao(estado, texto);
            return (v as (...a: unknown[]) => unknown).call(t, texto, ...resto);
          };
        }
        if (prop === 'release' && aoLiberar) {
          return () => {
            aoLiberar(estado);
            return (v as () => void).call(t);
          };
        }
        return typeof v === 'function' ? v.bind(t) : v;
      },
    });
  };
  return new Proxy(sql, {
    apply(_t, _esse, args) {
      recusarRaiz((args[0] as TemplateStringsArray).join('$?'));
      return Reflect.apply(sql, undefined, args);
    },
    get(t, prop, receiver) {
      const v = Reflect.get(t, prop, receiver);
      if (prop === 'unsafe') {
        return (texto: string, ...resto: unknown[]) => {
          recusarRaiz(texto);
          return (v as (...a: unknown[]) => unknown).call(t, texto, ...resto);
        };
      }
      if (prop === 'begin') {
        return (...args: unknown[]) => {
          const cb = args.pop() as (tx: Sql) => unknown;
          return (v as (...a: unknown[]) => unknown).call(t, ...args, (tx: Sql) =>
            cb(envolver(tx, 'aberta')),
          );
        };
      }
      if (prop === 'reserve') {
        return async () =>
          envolver(await (v as () => Promise<object>).call(t), 'livre', (e) => guarda.devolvida(e));
      }
      return typeof v === 'function' ? v.bind(t) : v;
    },
  }) as Sql;
}
