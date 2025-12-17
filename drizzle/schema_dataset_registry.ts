import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
  boolean,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Dataset Registry - Catalog of GS1 and ESG-related datasets
 * 
 * Tracks public datasets, their sources, formats, and verification status.
 * Supports Lane C governance with last_verified_date tracking (Decision 3).
 */
export const datasetRegistry = mysqlTable(
  "dataset_registry",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    category: mysqlEnum("category", [
      "GS1_STANDARDS",
      "GDSN_DATA",
      "ESRS_DATAPOINTS",
      "CBV_VOCABULARIES",
      "DPP_RULES",
      "EU_REGULATIONS",
      "INDUSTRY_DATASETS",
      "OTHER",
    ]).notNull(),
    source: varchar("source", { length: 512 }).notNull(), // URL or organization
    format: mysqlEnum("format", [
      "JSON",
      "CSV",
      "XML",
      "XLSX",
      "PDF",
      "API",
      "OTHER",
    ]).notNull(),
    version: varchar("version", { length: 64 }), // Dataset version (e.g., "3.1.32", "2024-Q1")
    recordCount: int("recordCount"), // Number of records in dataset
    fileSize: int("fileSize"), // Size in bytes
    downloadUrl: varchar("downloadUrl", { length: 512 }),
    apiEndpoint: varchar("apiEndpoint", { length: 512 }),
    
    // Governance & Verification (Decision 3: additive only)
    lastVerifiedDate: timestamp("lastVerifiedDate"), // When dataset was last manually verified
    verifiedBy: varchar("verifiedBy", { length: 255 }), // Admin user who verified
    verificationNotes: text("verificationNotes"), // Notes from verification process
    isActive: boolean("isActive").default(true).notNull(), // Whether dataset is currently maintained
    
    // Metadata
    metadata: json("metadata").$type<Record<string, unknown>>(), // Flexible metadata storage
    tags: json("tags").$type<string[]>(), // Searchable tags
    relatedRegulationIds: json("relatedRegulationIds").$type<number[]>(), // Link to regulations table
    relatedStandardIds: json("relatedStandardIds").$type<number[]>(), // Link to gs1Standards table
    
    // Lane C Governance
    governanceNotes: text("governanceNotes"), // Lane C compliance notes
    laneStatus: mysqlEnum("laneStatus", ["LANE_A", "LANE_B", "LANE_C"])
      .default("LANE_C")
      .notNull(),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    categoryIdx: index("category_idx").on(table.category),
    lastVerifiedIdx: index("lastVerified_idx").on(table.lastVerifiedDate),
    isActiveIdx: index("isActive_idx").on(table.isActive),
  })
);

export type DatasetRegistry = typeof datasetRegistry.$inferSelect;
export type InsertDatasetRegistry = typeof datasetRegistry.$inferInsert;
