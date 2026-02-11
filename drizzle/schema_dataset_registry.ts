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
 * Dataset Registry - Catalog of GS1 and ESG-related datasets
 * 
 * NOTE: This schema matches the ACTUAL database structure (as of 2026-02-11).
 * The database has an older/simpler schema than originally designed.
 * Code and tests expecting richer fields (category, format, metadata, etc.) will fail.
 * 
 * TODO: Either migrate DB to richer schema OR update all code to use current schema.
 */
export const datasetRegistry = mysqlTable(
  "dataset_registry",
  {
    id: int("id").autoincrement().primaryKey(),
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
  },
  table => ({
    sourceTypeIdx: index("source_type_idx").on(table.sourceType),
    isActiveIdx: index("is_active_idx").on(table.isActive),
  })
);

export type DatasetRegistry = typeof datasetRegistry.$inferSelect;
export type InsertDatasetRegistry = typeof datasetRegistry.$inferInsert;
