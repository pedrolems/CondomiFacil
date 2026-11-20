import { pgTable, pgSchema, pgPolicy, uuid, text, foreignKey, index, check, timestamp, bigint } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const app = pgSchema("app");


export const condominioInApp = app.table("condominio", {
	id: uuid().notNull(),
	nome: text().notNull(),
}, (table) => [
	pgPolicy("tenant", { as: "permissive", for: "all", to: ["app_user"], using: sql`(id = app.condominio_atual())`, withCheck: sql`(id = app.condominio_atual())`  }),
]);

export const unidadeInApp = app.table("unidade", {
	id: uuid().notNull(),
	condominioId: uuid("condominio_id").notNull(),
	bloco: text().notNull(),
	numero: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.condominioId],
			foreignColumns: [condominioInApp.id],
			name: "unidade_condominio_id_fkey"
		}),
	pgPolicy("tenant", { as: "permissive", for: "all", to: ["app_user"], using: sql`(condominio_id = app.condominio_atual())`, withCheck: sql`(condominio_id = app.condominio_atual())`  }),
]);

export const areaInApp = app.table("area", {
	id: uuid().notNull(),
	condominioId: uuid("condominio_id").notNull(),
	nome: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.condominioId],
			foreignColumns: [condominioInApp.id],
			name: "area_condominio_id_fkey"
		}),
	pgPolicy("tenant", { as: "permissive", for: "all", to: ["app_user"], using: sql`(condominio_id = app.condominio_atual())`, withCheck: sql`(condominio_id = app.condominio_atual())`  }),
]);

export const reservaInApp = app.table("reserva", {
	id: uuid().defaultRandom().notNull(),
	condominioId: uuid("condominio_id").notNull(),
	areaId: uuid("area_id").notNull(),
	unidadeId: uuid("unidade_id").notNull(),
	// TODO: failed to parse database type 'tstzrange'
	periodo: unknown("periodo").notNull(),
	estado: text().default('confirmada').notNull(),
	criadaEm: timestamp("criada_em", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("reserva_por_unidade").using("btree", table.condominioId.asc().nullsLast().op("uuid_ops"), table.unidadeId.asc().nullsLast().op("range_ops"), table.periodo.asc().nullsLast().op("range_ops")),
	foreignKey({
			columns: [table.condominioId, table.areaId],
			foreignColumns: [areaInApp.id, areaInApp.condominioId],
			name: "reserva_condominio_id_area_id_fkey"
		}),
	foreignKey({
			columns: [table.condominioId, table.unidadeId],
			foreignColumns: [unidadeInApp.id, unidadeInApp.condominioId],
			name: "reserva_condominio_id_unidade_id_fkey"
		}),
	pgPolicy("tenant", { as: "permissive", for: "all", to: ["app_user"], using: sql`(condominio_id = app.condominio_atual())`, withCheck: sql`(condominio_id = app.condominio_atual())`  }),
	check("reserva_periodo_check", sql`(NOT isempty(periodo)) AND lower_inc(periodo) AND (NOT upper_inc(periodo))`),
	check("reserva_estado_check", sql`estado = ANY (ARRAY['confirmada'::text, 'cancelada'::text])`),
]);

export const reservaAuditoriaInApp = app.table("reserva_auditoria", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).generatedAlwaysAsIdentity({ name: "app.reserva_auditoria_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	condominioId: uuid("condominio_id").notNull(),
	reservaId: uuid("reserva_id").notNull(),
	acao: text().notNull(),
	estadoAntes: text("estado_antes"),
	estadoDepois: text("estado_depois"),
	em: timestamp({ withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.condominioId],
			foreignColumns: [condominioInApp.id],
			name: "reserva_auditoria_condominio_id_fkey"
		}),
	pgPolicy("tenant_inserir", { as: "permissive", for: "insert", to: ["app_user"], withCheck: sql`(condominio_id = app.condominio_atual())`  }),
	pgPolicy("tenant_ler", { as: "permissive", for: "select", to: ["app_user"] }),
	check("reserva_auditoria_acao_check", sql`acao = ANY (ARRAY['INSERT'::text, 'UPDATE'::text, 'DELETE'::text])`),
]);
