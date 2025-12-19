import { relations } from "drizzle-orm/relations";
import { dutchInitiatives, initiativeRegulationMappings, regulations, initiativeStandardMappings, gs1Standards } from "./schema";

export const initiativeRegulationMappingsRelations = relations(initiativeRegulationMappings, ({one}) => ({
	dutchInitiative: one(dutchInitiatives, {
		fields: [initiativeRegulationMappings.initiativeId],
		references: [dutchInitiatives.id]
	}),
	regulation: one(regulations, {
		fields: [initiativeRegulationMappings.regulationId],
		references: [regulations.id]
	}),
}));

export const dutchInitiativesRelations = relations(dutchInitiatives, ({many}) => ({
	initiativeRegulationMappings: many(initiativeRegulationMappings),
	initiativeStandardMappings: many(initiativeStandardMappings),
}));

export const regulationsRelations = relations(regulations, ({many}) => ({
	initiativeRegulationMappings: many(initiativeRegulationMappings),
}));

export const initiativeStandardMappingsRelations = relations(initiativeStandardMappings, ({one}) => ({
	dutchInitiative: one(dutchInitiatives, {
		fields: [initiativeStandardMappings.initiativeId],
		references: [dutchInitiatives.id]
	}),
	gs1Standard: one(gs1Standards, {
		fields: [initiativeStandardMappings.standardId],
		references: [gs1Standards.id]
	}),
}));

export const gs1StandardsRelations = relations(gs1Standards, ({many}) => ({
	initiativeStandardMappings: many(initiativeStandardMappings),
}));