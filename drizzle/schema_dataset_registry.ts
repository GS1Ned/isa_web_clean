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
/**
 * Dataset Registry - ISA's Central Data Governance & Provenance System
 * 
 * Purpose: Track all external datasets with rich metadata for:
 * - Data Governance: Version tracking, verification status, compliance
 * - Provenance: Full lineage with checksums, sources, derivation chains
 * - Intelligence: Enable Ask ISA citations, data currency tracking
 * - Observability: Monitor data quality and verification cadence
 * 
 * Schema migrated to ultimate design on 2026-02-11
 * Evidence: data/metadata/dataset_registry.json v1.4.0, ISA capability requirements
 */
export const datasetRegistry = mysqlTable(
  "dataset_registry",
  {
    id: int("id").autoincrement().primaryKey(),
    
    // Legacy fields (preserved for compatibility)
    datasetName: varchar("dataset_name", { length: 128 }).notNull(),
    sourceType: mysqlEnum("source_type", [
      "official_api",
      "official_download",
      "curated_list",
      "scraped",
      "manual",
    ]).notNull(),
    sourceUrl: varchar("source_url", { length: 512 }),
    sourceAuthority: varchar("source_authority", { length: 128 }),
    licenseType: varchar("license_type", { length: 64 }),
    licenseDisclaimer: text("license_disclaimer"),
    version: varchar("version", { length: 32 }),
    publicationDate: timestamp("publication_date", { mode: 'date' }),
    lastVerifiedAt: timestamp("last_verified_at"),
    checksum: varchar("checksum", { length: 64 }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    
    // Ultimate schema fields (added 2026-02-11)
    name: varchar("name", { length: 255 }),
    description: text("description"),
    title: varchar("title", { length: 512 }),
    category: mysqlEnum("category", [
      "GS1_STANDARDS",
      "GDSN_DATA",
      "ESRS_DATAPOINTS",
      "CBV_VOCABULARIES",
      "DPP_RULES",
      "EU_REGULATIONS",
      "INDUSTRY_DATASETS",
      "REFERENCE_CORPUS",
      "NEWS_SOURCES",
      "OTHER",
    ]),
    format: mysqlEnum("format", [
      "JSON",
      "CSV",
      "XML",
      "XLSX",
      "PDF",
      "HTML",
      "API",
      "ZIP",
      "OTHER",
    ]),
    recordCount: int("record_count"),
    fileSize: int("file_size"),
    downloadUrl: varchar("download_url", { length: 512 }),
    apiEndpoint: varchar("api_endpoint", { length: 512 }),
    lastVerifiedDate: timestamp("last_verified_at"), // Alias for compatibility
    verifiedBy: varchar("verified_by", { length: 255 }),
    verificationNotes: text("verification_notes"),
    metadata: json("metadata").$type<Record<string, unknown>>(),
    tags: json("tags").$type<string[]>(),
    relatedRegulationIds: json("related_regulation_ids").$type<number[]>(),
    relatedStandardIds: json("related_standard_ids").$type<number[]>(),
    governanceNotes: text("governance_notes"),
    laneStatus: mysqlEnum("lane_status", ["LANE_A", "LANE_B", "LANE_C"])
      .default("LANE_C"),
  },
  table => ({
    sourceTypeIdx: index("idx_source_type").on(table.sourceType),
    isActiveIdx: index("idx_is_active").on(table.isActive),
    lastVerifiedIdx: index("idx_last_verified").on(table.lastVerifiedAt),
    categoryIdx: index("idx_category").on(table.category),
    formatIdx: index("idx_format").on(table.format),
    laneStatusIdx: index("idx_lane_status").on(table.laneStatus),
  })
);

export type DatasetRegistry = typeof datasetRegistry.$inferSelect;
export type InsertDatasetRegistry = typeof datasetRegistry.$inferInsert;
