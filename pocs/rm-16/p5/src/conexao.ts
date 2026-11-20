// Conexão da "API" na PoC: sempre app_user (sem BYPASSRLS, não dono), banco p5, ligação direta.
export type Driver = 'pg' | 'postgres.js';
export type ContextoTenant = { condominioId: string; unidadeId?: string };

export const CONEXAO = {
  host: '127.0.0.1',
  port: 54329,
  database: 'p5',
  user: 'app_user',
  password: 'app_local_ficticia',
} as const;

/** Interface comum das quatro combinações (biblioteca x driver). Tx é o tipo de transação da biblioteca. */
export interface AcessoDados<Tx> {
  nome: string;
  /** Único caminho de consulta: BEGIN, set_config(..., true), fn(tx), COMMIT/ROLLBACK. */
  comTenant<T>(ctx: ContextoTenant, fn: (tx: Tx) => Promise<T>): Promise<T>;
  encerrar(): Promise<void>;
  violacoes(): string[];
  /** Só testes. `bibliotecaCrua` simula um bug que usa a biblioteca fora do TenantContext. */
  teste: {
    bibliotecaCrua: unknown;
    /** Consulta sem guarda no mesmo pool, para inspecionar o estado real da conexão física. */
    bruto(texto: string): Promise<Record<string, unknown>[]>;
  };
}
