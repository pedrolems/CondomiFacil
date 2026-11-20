import { relations } from "drizzle-orm/relations";
import { condominioInApp, unidadeInApp, areaInApp, reservaInApp, reservaAuditoriaInApp } from "./schema";

export const unidadeInAppRelations = relations(unidadeInApp, ({one, many}) => ({
	condominioInApp: one(condominioInApp, {
		fields: [unidadeInApp.condominioId],
		references: [condominioInApp.id]
	}),
	reservaInApps: many(reservaInApp),
}));

export const condominioInAppRelations = relations(condominioInApp, ({many}) => ({
	unidadeInApps: many(unidadeInApp),
	areaInApps: many(areaInApp),
	reservaAuditoriaInApps: many(reservaAuditoriaInApp),
}));

export const areaInAppRelations = relations(areaInApp, ({one, many}) => ({
	condominioInApp: one(condominioInApp, {
		fields: [areaInApp.condominioId],
		references: [condominioInApp.id]
	}),
	reservaInApps: many(reservaInApp),
}));

export const reservaInAppRelations = relations(reservaInApp, ({one}) => ({
	areaInApp: one(areaInApp, {
		fields: [reservaInApp.condominioId],
		references: [areaInApp.id]
	}),
	unidadeInApp: one(unidadeInApp, {
		fields: [reservaInApp.condominioId],
		references: [unidadeInApp.id]
	}),
}));

export const reservaAuditoriaInAppRelations = relations(reservaAuditoriaInApp, ({one}) => ({
	condominioInApp: one(condominioInApp, {
		fields: [reservaAuditoriaInApp.condominioId],
		references: [condominioInApp.id]
	}),
}));