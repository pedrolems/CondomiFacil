// Única criação de Kysely + postgres.js do aplicativo (ADR-008). A conexão é sempre do app_user
// (sem BYPASSRLS, não dono), salvo a do módulo autenticacao (app_autenticacao, ver autenticacao.ts);
// quem monta as opções é o processo, por variável de ambiente.
import { Kysely } from 'kysely';
import { PostgresJSDialect } from 'kysely-postgres-js';
import type postgres from 'postgres';
import type { DbApp } from './tipos.js';
import { Guarda, sqlPostgresJsGuardado } from './guarda.js';

export const BANCO = Symbol('BANCO');

export type OpcoesDoBanco = postgres.Options<Record<string, postgres.PostgresType>>;

export interface Banco<D = DbApp> {
  db: Kysely<D>;
  /** Consultas recusadas pela guarda; vazio em operação normal. */
  violacoes(): string[];
  encerrar(): Promise<void>;
}

export function criarBanco<D = DbApp>(opcoes: OpcoesDoBanco): Banco<D> {
  const guarda = new Guarda();
  const sql = sqlPostgresJsGuardado(guarda, { onnotice: () => {}, ...opcoes });
  return {
    // Schema explícito: o app_user não depende de search_path.
    db: new Kysely<D>({ dialect: new PostgresJSDialect({ postgres: sql }) }).withSchema(
      'condomifacil',
    ),
    violacoes: () => guarda.violacoes,
    // O pool é do postgres.js; o Kysely só o fecha se já o tiver inicializado (é preguiçoso).
    encerrar: () => sql.end({ timeout: 5 }),
  };
}
