import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Regulatory Change Log table
 * 
 * Tracks authoritative regulatory changes from EU/Dutch sources and GS1 publications.
 * Adheres to ISA Design Contract: versioned, immutable, traceable entries.
 * 
 * Design constraints:
 * - Track ONLY authoritative sources (no news feeds, no aggregation)
 * - Immutable entries (no updates after creation)
 * - Machine-readable with structured metadata
 * - Linkable to advisory regeneration decisions
 */
export const regulatoryChangeLog = mysqlTable(
  "regulatory_change_log",
  {
    id: int("id").autoincrement().primaryKey(),

    // Required fields
    entryDate: timestamp("entryDate").notNull(), // Date entry was created
    sourceType: mysqlEnum("sourceType", [
      "EU_DIRECTIVE",
      "EU_REGULATION",
      "EU_DELEGATED_ACT",
      "EU_IMPLEMENTING_ACT",
      "EFRAG_IG",
      "EFRAG_QA",
      "EFRAG_TAXONOMY",
      "GS1_AISBL",
      "GS1_EUROPE",
      "GS1_NL",
    ]).notNull(),
    sourceOrg: varchar("sourceOrg", { length: 255 }).notNull(), // e.g., "European Commission", "EFRAG", "GS1 in Europe"
    title: varchar("title", { length: 512 }).notNull(),
    description: text("description").notNull(), // What changed, why it matters
    url: varchar("url", { length: 512 }).notNull(), // Source document URL
    documentHash: varchar("documentHash", { length: 64 }), // SHA256 hash for traceability

    // Optional fields
    impactAssessment: text("impactAssessment"), // Brief impact analysis (1-2 sentences)
    isaVersionAffected: varchar("isaVersionAffected", { length: 16 }), // e.g., "v1.1", "v1.2"

    // Metadata
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    // Indexes for common queries
    entryDateIdx: index("entryDate_idx").on(table.entryDate),
    sourceTypeIdx: index("sourceType_idx").on(table.sourceType),
    isaVersionIdx: index("isaVersion_idx").on(table.isaVersionAffected),
  })
);

export type RegulatoryChangeLogEntry = typeof regulatoryChangeLog.$inferSelect;
export type InsertRegulatoryChangeLogEntry =
  typeof regulatoryChangeLog.$inferInsert;
