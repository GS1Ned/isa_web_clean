import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * EU Regulations table - stores information about CSRD, ESRS, DPP, and other EU regulations
 */
export const regulations = mysqlTable("regulations", {
  id: int("id").autoincrement().primaryKey(),
  celexId: varchar("celexId", { length: 64 }).unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  regulationType: mysqlEnum("regulationType", ["CSRD", "ESRS", "DPP", "EUDR", "ESPR", "PPWR", "EU_TAXONOMY", "OTHER"]).notNull(),
  effectiveDate: timestamp("effectiveDate"),
  sourceUrl: varchar("sourceUrl", { length: 512 }),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Regulation = typeof regulations.$inferSelect;
export type InsertRegulation = typeof regulations.$inferInsert;

/**
 * GS1 Standards table - stores canonical GS1 standards
 */
export const gs1Standards = mysqlTable("gs1_standards", {
  id: int("id").autoincrement().primaryKey(),
  standardCode: varchar("standardCode", { length: 64 }).unique().notNull(),
  standardName: varchar("standardName", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 128 }),
  scope: text("scope"),
  referenceUrl: varchar("referenceUrl", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GS1Standard = typeof gs1Standards.$inferSelect;
export type InsertGS1Standard = typeof gs1Standards.$inferInsert;

/**
 * Regulation-to-Standards Mapping - links regulations to applicable GS1 standards
 */
export const regulationStandardMappings = mysqlTable("regulation_standard_mappings", {
  id: int("id").autoincrement().primaryKey(),
  regulationId: int("regulationId").notNull(),
  standardId: int("standardId").notNull(),
  relevanceScore: decimal("relevanceScore", { precision: 3, scale: 2 }).default("0.00"),
  mappingReason: text("mappingReason"),
  detectedAt: timestamp("detectedAt").defaultNow().notNull(),
  verifiedByAdmin: boolean("verifiedByAdmin").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RegulationStandardMapping = typeof regulationStandardMappings.$inferSelect;
export type InsertRegulationStandardMapping = typeof regulationStandardMappings.$inferInsert;

/**
 * User Analyses - tracks when users analyze regulations
 */
export const userAnalyses = mysqlTable("user_analyses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  regulationId: int("regulationId"),
  documentTitle: varchar("documentTitle", { length: 255 }),
  documentUrl: varchar("documentUrl", { length: 512 }),
  analysisType: mysqlEnum("analysisType", ["CELEX", "DOCUMENT_UPLOAD", "URL", "TEXT"]).notNull(),
  detectedStandardsCount: int("detectedStandardsCount").default(0),
  analysisResult: json("analysisResult"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserAnalysis = typeof userAnalyses.$inferSelect;
export type InsertUserAnalysis = typeof userAnalyses.$inferInsert;

/**
 * Regulatory Change Alerts - tracks new regulations and changes
 */
export const regulatoryChangeAlerts = mysqlTable("regulatory_change_alerts", {
  id: int("id").autoincrement().primaryKey(),
  regulationId: int("regulationId").notNull(),
  changeType: mysqlEnum("changeType", ["NEW", "UPDATED", "EFFECTIVE_DATE_CHANGED", "SCOPE_EXPANDED", "DEPRECATED"]).notNull(),
  changeDescription: text("changeDescription"),
  affectedStandardsCount: int("affectedStandardsCount").default(0),
  severity: mysqlEnum("severity", ["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
  detectedAt: timestamp("detectedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RegulatoryChangeAlert = typeof regulatoryChangeAlerts.$inferSelect;
export type InsertRegulatoryChangeAlert = typeof regulatoryChangeAlerts.$inferInsert;

/**
 * User Preferences - stores user-specific settings and interests
 */
export const userPreferences = mysqlTable("user_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  interestedRegulations: json("interestedRegulations"),
  interestedStandards: json("interestedStandards"),
  notificationsEnabled: boolean("notificationsEnabled").default(true),
  industryFocus: varchar("industryFocus", { length: 128 }),
  companySize: mysqlEnum("companySize", ["STARTUP", "SME", "ENTERPRISE", "OTHER"]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;
