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
 * Governance Documents - Catalog of official GS1 and EU regulatory documents
 * 
 * Tracks official documentation sources, versions, and status.
 * Supports Lane C governance with explicit currency disclaimers.
 */
export const governanceDocuments = mysqlTable(
  "governance_documents",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 512 }).notNull(),
    documentType: mysqlEnum("documentType", [
      "GS1_STANDARD",
      "GS1_GUIDELINE",
      "GS1_WHITE_PAPER",
      "EU_REGULATION",
      "EU_DIRECTIVE",
      "EU_IMPLEMENTING_ACT",
      "EU_DELEGATED_ACT",
      "TECHNICAL_SPECIFICATION",
      "INDUSTRY_GUIDANCE",
      "OTHER",
    ]).notNull(),
    category: mysqlEnum("category", [
      "IDENTIFICATION",
      "CAPTURE",
      "SHARE",
      "ESG_REPORTING",
      "TRACEABILITY",
      "DIGITAL_PRODUCT_PASSPORT",
      "CIRCULAR_ECONOMY",
      "DUE_DILIGENCE",
      "PACKAGING",
      "OTHER",
    ]).notNull(),
    
    // Document Metadata
    version: varchar("version", { length: 64 }), // Document version
    documentCode: varchar("documentCode", { length: 128 }), // e.g., "GS1 Gen Specs 24.0", "CELEX:32022L2464"
    publishedDate: timestamp("publishedDate"),
    effectiveDate: timestamp("effectiveDate"),
    expiryDate: timestamp("expiryDate"), // For time-limited documents
    
    // Content & Access
    description: text("description"),
    url: varchar("url", { length: 512 }).notNull(),
    downloadUrl: varchar("downloadUrl", { length: 512 }),
    language: varchar("language", { length: 10 }).default("en").notNull(),
    
    // Status & Governance
    status: mysqlEnum("status", [
      "DRAFT",
      "PUBLISHED",
      "SUPERSEDED",
      "WITHDRAWN",
      "ARCHIVED",
    ]).default("PUBLISHED").notNull(),
    supersededBy: int("supersededBy"), // Reference to newer document
    isOfficial: boolean("isOfficial").default(true).notNull(), // Official vs. unofficial source
    
    // Lane C Governance
    lastVerifiedDate: timestamp("lastVerifiedDate"), // When document availability was last checked
    verifiedBy: varchar("verifiedBy", { length: 255 }),
    currencyDisclaimer: text("currencyDisclaimer"), // Lane C disclaimer text
    laneStatus: mysqlEnum("laneStatus", ["LANE_A", "LANE_B", "LANE_C"])
      .default("LANE_C")
      .notNull(),
    
    // Relationships
    relatedRegulationIds: json("relatedRegulationIds").$type<number[]>(),
    relatedStandardIds: json("relatedStandardIds").$type<number[]>(),
    tags: json("tags").$type<string[]>(),
    
    // Search & Discovery
    keywords: json("keywords").$type<string[]>(),
    metadata: json("metadata").$type<Record<string, unknown>>(),
    
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    documentTypeIdx: index("documentType_idx").on(table.documentType),
    categoryIdx: index("category_idx").on(table.category),
    statusIdx: index("status_idx").on(table.status),
    publishedDateIdx: index("publishedDate_idx").on(table.publishedDate),
    documentCodeIdx: index("documentCode_idx").on(table.documentCode),
  })
);

export type GovernanceDocument = typeof governanceDocuments.$inferSelect;
export type InsertGovernanceDocument = typeof governanceDocuments.$inferInsert;
