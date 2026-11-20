// Esquema do Drizzle ESCRITO À MÃO a partir das migrations SQL (fonte da verdade, MS-01).
// O drizzle-kit pull não serviu (resultados/drizzle-pull/schema.ts): tstzrange vira unknown (não compila),
// sem chaves primárias, FKs compostas com colunas trocadas e política sem USING. Sem restrições aqui:
// constraints, RLS, EXCLUDE e gatilho vivem só no SQL; este arquivo só tipa as consultas.
import { customType, pgSchema, text, timestamp, uuid, bigint } from 'drizzle-orm/pg-core';

const tstzrange = customType<{ data: string }>({ dataType: () => 'tstzrange' });
const app = pgSchema('app');

export const condominio = app.table('condominio', {
  id: uuid().primaryKey(),
  nome: text().notNull(),
});

export const unidade = app.table('unidade', {
  id: uuid().primaryKey(),
  condominioId: uuid('condominio_id').notNull(),
  bloco: text().notNull(),
  numero: text().notNull(),
});

export const area = app.table('area', {
  id: uuid().primaryKey(),
  condominioId: uuid('condominio_id').notNull(),
  nome: text().notNull(),
});

export const reserva = app.table('reserva', {
  id: uuid().primaryKey().defaultRandom(),
  condominioId: uuid('condominio_id').notNull(),
  areaId: uuid('area_id').notNull(),
  unidadeId: uuid('unidade_id').notNull(),
  periodo: tstzrange().notNull(),
  estado: text().notNull().default('confirmada'),
  criadaEm: timestamp('criada_em', { withTimezone: true, mode: 'string' }).notNull().defaultNow(),
});

export const reservaAuditoria = app.table('reserva_auditoria', {
  id: bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
  condominioId: uuid('condominio_id').notNull(),
  reservaId: uuid('reserva_id').notNull(),
  acao: text().notNull(),
  estadoAntes: text('estado_antes'),
  estadoDepois: text('estado_depois'),
  em: timestamp({ withTimezone: true, mode: 'string' }).notNull().defaultNow(),
});
