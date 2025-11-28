import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean, decimal, index } from "drizzle-orm/mysql-core";

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
 * Contact submissions from the contact form
 */
export const contacts = mysqlTable("contacts", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  company: varchar("company", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  inquiryType: varchar("inquiryType", { length: 50 }).notNull(),
  message: text("message"),
  status: mysqlEnum("status", ["new", "contacted", "converted", "archived"]).default("new").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;

/**
 * Regulations table - stores information about CSRD, ESRS, DPP, and other EU regulations
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

/**
 * ESG Hub News - curated news and updates about regulations
 */
export const hubNews = mysqlTable("hub_news", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 512 }).notNull(),
  summary: text("summary"),
  content: text("content"),
  newsType: mysqlEnum("newsType", ["NEW_LAW", "AMENDMENT", "ENFORCEMENT", "COURT_DECISION", "GUIDANCE", "PROPOSAL"]).notNull(),
  relatedRegulationIds: json("relatedRegulationIds"),
  sourceUrl: varchar("sourceUrl", { length: 512 }),
  sourceTitle: varchar("sourceTitle", { length: 255 }),
  credibilityScore: decimal("credibilityScore", { precision: 3, scale: 2 }).default("0.00"),
  publishedDate: timestamp("publishedDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HubNews = typeof hubNews.$inferSelect;
export type InsertHubNews = typeof hubNews.$inferInsert;

/**
 * ESG Hub Resources - downloadable guides, checklists, templates
 */
export const hubResources = mysqlTable("hub_resources", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 512 }).notNull(),
  description: text("description"),
  resourceType: mysqlEnum("resourceType", ["GUIDE", "CHECKLIST", "TEMPLATE", "CASE_STUDY", "WHITEPAPER", "TOOL"]).notNull(),
  relatedRegulationIds: json("relatedRegulationIds"),
  relatedStandardIds: json("relatedStandardIds"),
  fileUrl: varchar("fileUrl", { length: 512 }),
  downloadCount: int("downloadCount").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HubResource = typeof hubResources.$inferSelect;
export type InsertHubResource = typeof hubResources.$inferInsert;

/**
 * User Saved Items - regulations, news, resources saved by users
 */
export const userSavedItems = mysqlTable("user_saved_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  itemType: mysqlEnum("itemType", ["REGULATION", "NEWS", "RESOURCE"]).notNull(),
  itemId: int("itemId").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserSavedItem = typeof userSavedItems.$inferSelect;
export type InsertUserSavedItem = typeof userSavedItems.$inferInsert;

/**
 * User Alerts - notification preferences for regulations and deadlines
 */
export const userAlerts = mysqlTable("user_alerts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  alertType: mysqlEnum("alertType", ["REGULATION_UPDATE", "DEADLINE_APPROACHING", "NEW_REGULATION", "ENFORCEMENT_ACTION"]).notNull(),
  regulationId: int("regulationId"),
  standardId: int("standardId"),
  daysBeforeDeadline: int("daysBeforeDeadline"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserAlert = typeof userAlerts.$inferSelect;
export type InsertUserAlert = typeof userAlerts.$inferInsert;

/**
 * EPCIS Events - Supply chain traceability events for EUDR/CSDDD compliance
 */
export const epcisEvents = mysqlTable("epcis_events", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  eventType: mysqlEnum("eventType", ["ObjectEvent", "AggregationEvent", "TransactionEvent", "TransformationEvent", "AssociationEvent"]).notNull(),
  eventTime: timestamp("eventTime").notNull(),
  eventTimeZoneOffset: varchar("eventTimeZoneOffset", { length: 10 }),
  action: mysqlEnum("action", ["OBSERVE", "ADD", "DELETE"]),
  bizStep: varchar("bizStep", { length: 255 }),
  disposition: varchar("disposition", { length: 255 }),
  readPoint: varchar("readPoint", { length: 255 }),
  bizLocation: varchar("bizLocation", { length: 255 }),
  epcList: json("epcList"),
  quantityList: json("quantityList"),
  sensorElementList: json("sensorElementList"),
  sourceList: json("sourceList"),
  destinationList: json("destinationList"),
  ilmd: json("ilmd"),
  rawEvent: json("rawEvent").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  eventTimeIdx: index("eventTime_idx").on(table.eventTime),
  eventTypeIdx: index("eventType_idx").on(table.eventType),
}));

export type EPCISEvent = typeof epcisEvents.$inferSelect;
export type InsertEPCISEvent = typeof epcisEvents.$inferInsert;

/**
 * Supply Chain Nodes - Organizations in the supply chain (suppliers, manufacturers, etc.)
 */
export const supplyChainNodes = mysqlTable("supply_chain_nodes", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  nodeType: mysqlEnum("nodeType", ["supplier", "manufacturer", "distributor", "retailer", "recycler"]).notNull(),
  gln: varchar("gln", { length: 255 }),
  name: varchar("name", { length: 255 }).notNull(),
  tierLevel: int("tierLevel"),
  locationLat: decimal("locationLat", { precision: 10, scale: 8 }),
  locationLng: decimal("locationLng", { precision: 11, scale: 8 }),
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high"]),
  riskFactors: json("riskFactors"),
  certifications: json("certifications"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  glnIdx: index("gln_idx").on(table.gln),
}));

export type SupplyChainNode = typeof supplyChainNodes.$inferSelect;
export type InsertSupplyChainNode = typeof supplyChainNodes.$inferInsert;

/**
 * Supply Chain Edges - Relationships between supply chain nodes
 */
export const supplyChainEdges = mysqlTable("supply_chain_edges", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fromNodeId: int("fromNodeId").notNull(),
  toNodeId: int("toNodeId").notNull(),
  productGtin: varchar("productGtin", { length: 14 }),
  relationshipType: mysqlEnum("relationshipType", ["supplies", "manufactures", "distributes", "retails"]).notNull(),
  lastTransactionDate: timestamp("lastTransactionDate"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  fromNodeIdx: index("fromNode_idx").on(table.fromNodeId),
  toNodeIdx: index("toNode_idx").on(table.toNodeId),
}));

export type SupplyChainEdge = typeof supplyChainEdges.$inferSelect;
export type InsertSupplyChainEdge = typeof supplyChainEdges.$inferInsert;

/**
 * EUDR Geolocation Data - Geographic origin data for EUDR compliance
 */
export const eudrGeolocation = mysqlTable("eudr_geolocation", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  productGtin: varchar("productGtin", { length: 14 }).notNull(),
  originLat: decimal("originLat", { precision: 10, scale: 8 }).notNull(),
  originLng: decimal("originLng", { precision: 11, scale: 8 }).notNull(),
  geofenceGeoJSON: json("geofenceGeoJSON"),
  deforestationRisk: mysqlEnum("deforestationRisk", ["low", "medium", "high"]),
  riskAssessmentDate: timestamp("riskAssessmentDate"),
  dueDiligenceStatement: json("dueDiligenceStatement"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  productGtinIdx: index("productGtin_idx").on(table.productGtin),
}));

export type EUDRGeolocation = typeof eudrGeolocation.$inferSelect;
export type InsertEUDRGeolocation = typeof eudrGeolocation.$inferInsert;

/**
 * Ingestion Logs - Track CELLAR regulation sync history
 */
export const ingestionLogs = mysqlTable("ingestion_logs", {
  id: int("id").autoincrement().primaryKey(),
  syncStartTime: timestamp("syncStartTime").notNull(),
  syncEndTime: timestamp("syncEndTime"),
  status: mysqlEnum("status", ["pending", "success", "failed"]).default("pending").notNull(),
  regulationsInserted: int("regulationsInserted").default(0).notNull(),
  regulationsUpdated: int("regulationsUpdated").default(0).notNull(),
  regulationsTotal: int("regulationsTotal").default(0).notNull(),
  errors: int("errors").default(0).notNull(),
  errorDetails: text("errorDetails"),
  durationSeconds: int("durationSeconds"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  statusIdx: index("status_idx").on(table.status),
  syncStartTimeIdx: index("syncStartTime_idx").on(table.syncStartTime),
}));
export type IngestionLog = typeof ingestionLogs.$inferSelect;
export type InsertIngestionLog = typeof ingestionLogs.$inferInsert;

/**
 * ESRS Datapoints - Official EFRAG IG 3 disclosure requirements
 * Source: https://www.efrag.org/en/projects/esrs-implementation-guidance-documents
 */
export const esrsDatapoints = mysqlTable("esrs_datapoints", {
  id: int("id").autoincrement().primaryKey(),
  datapointId: varchar("datapointId", { length: 50 }).notNull().unique(), // e.g., "BP-1_01"
  esrsStandard: varchar("esrsStandard", { length: 20 }).notNull(), // e.g., "ESRS 2", "ESRS E1"
  disclosureRequirement: varchar("disclosureRequirement", { length: 50 }), // e.g., "BP-1", "E1-1"
  paragraph: varchar("paragraph", { length: 50 }), // e.g., "5 a", "9 b"
  relatedAr: varchar("relatedAr", { length: 50 }), // Related Application Requirement
  name: text("name").notNull(), // Description of the datapoint
  dataType: varchar("dataType", { length: 50 }), // e.g., "narrative", "quantitative", "semi-narrative"
  conditionalOrAlternative: varchar("conditionalOrAlternative", { length: 50 }), // "Conditional", "Alternative", or null
  voluntary: boolean("voluntary").default(false), // May [V] column
  sfdrPillar3: boolean("sfdrPillar3").default(false), // Appendix B indicator
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  esrsStandardIdx: index("esrsStandard_idx").on(table.esrsStandard),
  disclosureRequirementIdx: index("disclosureRequirement_idx").on(table.disclosureRequirement),
}));

export type ESRSDatapoint = typeof esrsDatapoints.$inferSelect;
export type InsertESRSDatapoint = typeof esrsDatapoints.$inferInsert;
