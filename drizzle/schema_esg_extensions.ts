import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
  boolean,
  decimal,
  index,
} from "drizzle-orm/mysql-core";

/**
 * ESG Common Data Categories - Cross-regulation harmonized data categories
 * Source: GS1 Position Paper on Accelerating Value Chain Digitalisation
 */
export const esgDataCategories = mysqlTable(
  "esg_data_categories",
  {
    id: int("id").autoincrement().primaryKey(),
    categoryId: varchar("categoryId", { length: 128 }).notNull().unique(), // e.g., "contact_information"
    categoryName: varchar("categoryName", { length: 255 }).notNull(),
    description: text("description"),
    regulationLevel: mysqlEnum("regulationLevel", [
      "company",
      "product",
      "both",
    ]).notNull(),
    exampleRegulations: json("exampleRegulations").$type<string[]>(), // ["ESPR/DPP", "EUDR", "PPWR"]
    likelyGS1Standards: json("likelyGS1Standards").$type<string[]>(), // ["GLN", "GTIN", "EPCIS"]
    likelyESGUseCases: json("likelyESGUseCases").$type<string[]>(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    regulationLevelIdx: index("regulationLevel_idx").on(table.regulationLevel),
  })
);

export type ESGDataCategory = typeof esgDataCategories.$inferSelect;
export type InsertESGDataCategory = typeof esgDataCategories.$inferInsert;

/**
 * Critical Tracking Events (CTEs) - Key events in value chain traceability
 * Source: GS1 Position Paper on Accelerating Value Chain Digitalisation
 */
export const criticalTrackingEvents = mysqlTable("critical_tracking_events", {
  id: int("id").autoincrement().primaryKey(),
  cteId: varchar("cteId", { length: 128 }).notNull().unique(), // e.g., "cte_raw_material_sourcing"
  cteName: varchar("cteName", { length: 255 }).notNull(),
  description: text("description"),
  typicalKDEs: json("typicalKDEs").$type<
    Array<{
      kde: string;
      description: string;
      gs1Standard: string;
    }>
  >(), // Key Data Elements for this CTE
  exampleStandards: json("exampleStandards").$type<string[]>(), // ["EPCIS", "CBV", "GLN"]
  exampleRegulations: json("exampleRegulations").$type<string[]>(), // ["EUDR", "ESPR/DPP"]
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CriticalTrackingEvent = typeof criticalTrackingEvents.$inferSelect;
export type InsertCriticalTrackingEvent =
  typeof criticalTrackingEvents.$inferInsert;

/**
 * DPP Product Categories - ESPR/DPP product category scope and identification rules
 * Source: GS1 Digital Product Passport Provisional Application Standard
 */
export const dppProductCategories = mysqlTable(
  "dpp_product_categories",
  {
    id: int("id").autoincrement().primaryKey(),
    productCategory: varchar("productCategory", { length: 255 })
      .notNull()
      .unique(),
    inScope: boolean("inScope").notNull(),
    gtinLevel: varchar("gtinLevel", { length: 255 }), // "GTIN-8, GTIN-12, GTIN-13, or GTIN-14"
    qualifiersRequired: json("qualifiersRequired").$type<string[]>(), // ["batch_lot", "serial_number"]
    qualifierAIs: json("qualifierAIs").$type<Record<string, string>>(), // {"serial_number": "AI (21)"}
    glnPartyRequired: boolean("glnPartyRequired").default(false),
    glnFacilityRequired: boolean("glnFacilityRequired").default(false),
    madeToStockAI: varchar("madeToStockAI", { length: 20 }), // "AI (01)"
    madeToOrderAI: varchar("madeToOrderAI", { length: 20 }), // "AI (03)"
    recommendedCarriers: json("recommendedCarriers").$type<string[]>(), // ["QR Code with GS1 Digital Link URI"]
    regulation: varchar("regulation", { length: 255 }),
    delegatedActStatus: mysqlEnum("delegatedActStatus", [
      "finalized",
      "pending",
      "excluded",
    ]).notNull(),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    inScopeIdx: index("inScope_idx").on(table.inScope),
    delegatedActStatusIdx: index("delegatedActStatus_idx").on(
      table.delegatedActStatus
    ),
  })
);

export type DPPProductCategory = typeof dppProductCategories.$inferSelect;
export type InsertDPPProductCategory = typeof dppProductCategories.$inferInsert;

/**
 * Regulation to Data Category Mappings - Links regulations to common data categories
 */
export const regulationDataCategoryMappings = mysqlTable(
  "regulation_data_category_mappings",
  {
    id: int("id").autoincrement().primaryKey(),
    regulationId: int("regulationId").notNull(),
    dataCategoryId: int("dataCategoryId").notNull(),
    relevanceScore: decimal("relevanceScore", {
      precision: 3,
      scale: 2,
    }).default("0.00"),
    mappingReason: text("mappingReason"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    regulationIdIdx: index("regulationId_idx").on(table.regulationId),
    dataCategoryIdIdx: index("dataCategoryId_idx").on(table.dataCategoryId),
  })
);

export type RegulationDataCategoryMapping =
  typeof regulationDataCategoryMappings.$inferSelect;
export type InsertRegulationDataCategoryMapping =
  typeof regulationDataCategoryMappings.$inferInsert;

/**
 * Data Category to GS1 Standard Mappings - Links data categories to applicable GS1 standards
 */
export const dataCategoryStandardMappings = mysqlTable(
  "data_category_standard_mappings",
  {
    id: int("id").autoincrement().primaryKey(),
    dataCategoryId: int("dataCategoryId").notNull(),
    standardId: int("standardId").notNull(),
    relevanceScore: decimal("relevanceScore", {
      precision: 3,
      scale: 2,
    }).default("0.00"),
    useCaseDescription: text("useCaseDescription"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    dataCategoryIdIdx: index("dataCategoryId_idx").on(table.dataCategoryId),
    standardIdIdx: index("standardId_idx").on(table.standardId),
  })
);

export type DataCategoryStandardMapping =
  typeof dataCategoryStandardMappings.$inferSelect;
export type InsertDataCategoryStandardMapping =
  typeof dataCategoryStandardMappings.$inferInsert;
