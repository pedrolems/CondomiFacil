// Única criação de Kysely + postgres.js do aplicativo (ADR-008). A conexão é sempre do app_user
// (sem BYPASSRLS, não dono); quem monta as opções é o processo, por variável de ambiente.
import { Kysely } from 'kysely';
import { PostgresJSDialect } from 'kysely-postgres-js';
import type postgres from 'postgres';
import type { DB } from './gerado/tipos-banco.js';
import { Guarda, sqlPostgresJsGuardado } from './guarda.js';

export const BANCO = Symbol('BANCO');

export type OpcoesDoBanco = postgres.Options<Record<string, postgres.PostgresType>>;

export interface Banco {
  db: Kysely<DB>;
  /** Consultas recusadas pela guarda; vazio em operação normal. */
  violacoes(): string[];
  encerrar(): Promise<void>;
}

export function criarBanco(opcoes: OpcoesDoBanco): Banco {
  const guarda = new Guarda();
  const sql = sqlPostgresJsGuardado(guarda, { onnotice: () => {}, ...opcoes });
  return {
    // Schema explícito: o app_user não depende de search_path.
    db: new Kysely<DB>({ dialect: new PostgresJSDialect({ postgres: sql }) }).withSchema(
      'condomifacil',
    ),
    violacoes: () => guarda.violacoes,
    // O pool é do postgres.js; o Kysely só o fecha se já o tiver inicializado (é preguiçoso).
    encerrar: () => sql.end({ timeout: 5 }),
  };
}
