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
import { sql } from "drizzle-orm";

// Export ESG extension tables
export * from "./schema_esg_extensions";

// Export GS1 EU Carbon Footprint tables
export * from "./schema_gs1_eu_pcf";

// Export cron monitoring tables
export * from "./schema_cron_monitoring";

// Export regulatory change log tables
export * from "./schema_regulatory_change_log";

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
  status: mysqlEnum("status", ["new", "contacted", "converted", "archived"])
    .default("new")
    .notNull(),
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
  regulationType: mysqlEnum("regulationType", [
    "CSRD",
    "ESRS",
    "DPP",
    "EUDR",
    "ESPR",
    "PPWR",
    "EU_TAXONOMY",
    "OTHER",
  ]).notNull(),
  effectiveDate: timestamp("effectiveDate"),
  sourceUrl: varchar("sourceUrl", { length: 512 }),
  embedding: json("embedding").$type<number[]>(),
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
  embedding: json("embedding").$type<number[]>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GS1Standard = typeof gs1Standards.$inferSelect;
export type InsertGS1Standard = typeof gs1Standards.$inferInsert;

/**
 * Regulation-to-Standards Mapping - links regulations to applicable GS1 standards
 */
export const regulationStandardMappings = mysqlTable(
  "regulation_standard_mappings",
  {
    id: int("id").autoincrement().primaryKey(),
    regulationId: int("regulationId").notNull(),
    standardId: int("standardId").notNull(),
    relevanceScore: decimal("relevanceScore", {
      precision: 3,
      scale: 2,
    }).default("0.00"),
    mappingReason: text("mappingReason"),
    detectedAt: timestamp("detectedAt").defaultNow().notNull(),
    verifiedByAdmin: boolean("verifiedByAdmin").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  }
);

export type RegulationStandardMapping =
  typeof regulationStandardMappings.$inferSelect;
export type InsertRegulationStandardMapping =
  typeof regulationStandardMappings.$inferInsert;

/**
 * User Analyses - tracks when users analyze regulations
 */
export const userAnalyses = mysqlTable("user_analyses", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  regulationId: int("regulationId"),
  documentTitle: varchar("documentTitle", { length: 255 }),
  documentUrl: varchar("documentUrl", { length: 512 }),
  analysisType: mysqlEnum("analysisType", [
    "CELEX",
    "DOCUMENT_UPLOAD",
    "URL",
    "TEXT",
  ]).notNull(),
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
  changeType: mysqlEnum("changeType", [
    "NEW",
    "UPDATED",
    "EFFECTIVE_DATE_CHANGED",
    "SCOPE_EXPANDED",
    "DEPRECATED",
  ]).notNull(),
  changeDescription: text("changeDescription"),
  affectedStandardsCount: int("affectedStandardsCount").default(0),
  severity: mysqlEnum("severity", [
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL",
  ]).default("MEDIUM"),
  detectedAt: timestamp("detectedAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type RegulatoryChangeAlert = typeof regulatoryChangeAlerts.$inferSelect;
export type InsertRegulatoryChangeAlert =
  typeof regulatoryChangeAlerts.$inferInsert;

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
  companySize: mysqlEnum("companySize", [
    "STARTUP",
    "SME",
    "ENTERPRISE",
    "OTHER",
  ]),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

/**
 * ESG Hub News - curated news and updates about regulations
 * Extended for automated ingestion pipeline with AI summarization
 */
export const hubNews = mysqlTable(
  "hub_news",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 512 }).notNull(),
    summary: text("summary"),
    content: text("content"),
    newsType: mysqlEnum("newsType", [
      "NEW_LAW",
      "AMENDMENT",
      "ENFORCEMENT",
      "COURT_DECISION",
      "GUIDANCE",
      "PROPOSAL",
    ]).notNull(),
    relatedRegulationIds: json("relatedRegulationIds"),
    regulationTags: json("regulationTags").$type<string[]>(), // CSRD, PPWR, EUDR, DPP, etc.
    impactLevel: mysqlEnum("impactLevel", ["LOW", "MEDIUM", "HIGH"]).default(
      "MEDIUM"
    ),
    sourceUrl: varchar("sourceUrl", { length: 512 }),
    sourceTitle: varchar("sourceTitle", { length: 255 }),
    sourceType: mysqlEnum("sourceType", [
      "EU_OFFICIAL",
      "GS1_OFFICIAL",
      "DUTCH_NATIONAL",
      "INDUSTRY",
      "MEDIA",
    ]).default("EU_OFFICIAL"),
    sources:
      json("sources").$type<
        Array<{ name: string; type: string; url: string }>
      >(), // Multi-source attribution for deduplicated news
    credibilityScore: decimal("credibilityScore", {
      precision: 3,
      scale: 2,
    }).default("0.00"),

    // GS1-specific fields for enhanced intelligence
    gs1ImpactTags: json("gs1ImpactTags").$type<string[]>(), // IDENTIFICATION, PACKAGING_ATTRIBUTES, ESG_REPORTING, DUE_DILIGENCE, TRACEABILITY, DPP, etc.
    sectorTags: json("sectorTags").$type<string[]>(), // RETAIL, HEALTHCARE, FOOD, LOGISTICS, DIY, CONSTRUCTION, TEXTILES, etc.
    relatedStandardIds: json("relatedStandardIds").$type<string[]>(), // Direct linkage to GS1 standards (gtin, gln, epcis, gdsn, digital-link, etc.)
    gs1ImpactAnalysis: text("gs1ImpactAnalysis"), // AI-generated analysis of GS1 relevance and impact
    suggestedActions: json("suggestedActions").$type<string[]>(), // Actionable next steps for GS1 NL members

    publishedDate: timestamp("publishedDate"),
    retrievedAt: timestamp("retrievedAt").defaultNow().notNull(), // when fetched by automation
    isAutomated: boolean("isAutomated").default(false), // true if AI-generated
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    sourceUrlIdx: index("sourceUrl_idx").on(table.sourceUrl),
    publishedDateIdx: index("publishedDate_idx").on(table.publishedDate),
    impactLevelIdx: index("impactLevel_idx").on(table.impactLevel),
  })
);

export type HubNews = typeof hubNews.$inferSelect;
export type InsertHubNews = typeof hubNews.$inferInsert;

/**
 * ESG Hub Resources - downloadable guides, checklists, templates
 */
export const hubResources = mysqlTable("hub_resources", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 512 }).notNull(),
  description: text("description"),
  resourceType: mysqlEnum("resourceType", [
    "GUIDE",
    "CHECKLIST",
    "TEMPLATE",
    "CASE_STUDY",
    "WHITEPAPER",
    "TOOL",
  ]).notNull(),
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
  alertType: mysqlEnum("alertType", [
    "REGULATION_UPDATE",
    "DEADLINE_APPROACHING",
    "NEW_REGULATION",
    "ENFORCEMENT_ACTION",
  ]).notNull(),
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
export const epcisEvents = mysqlTable(
  "epcis_events",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    eventType: mysqlEnum("eventType", [
      "ObjectEvent",
      "AggregationEvent",
      "TransactionEvent",
      "TransformationEvent",
      "AssociationEvent",
    ]).notNull(),
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
  },
  table => ({
    userIdIdx: index("userId_idx").on(table.userId),
    eventTimeIdx: index("eventTime_idx").on(table.eventTime),
    eventTypeIdx: index("eventType_idx").on(table.eventType),
  })
);

export type EPCISEvent = typeof epcisEvents.$inferSelect;
export type InsertEPCISEvent = typeof epcisEvents.$inferInsert;

/**
 * Supply Chain Nodes - Organizations in the supply chain (suppliers, manufacturers, etc.)
 */
export const supplyChainNodes = mysqlTable(
  "supply_chain_nodes",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    nodeType: mysqlEnum("nodeType", [
      "supplier",
      "manufacturer",
      "distributor",
      "retailer",
      "recycler",
    ]).notNull(),
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
  },
  table => ({
    userIdIdx: index("userId_idx").on(table.userId),
    glnIdx: index("gln_idx").on(table.gln),
  })
);

export type SupplyChainNode = typeof supplyChainNodes.$inferSelect;
export type InsertSupplyChainNode = typeof supplyChainNodes.$inferInsert;

/**
 * Supply Chain Edges - Relationships between supply chain nodes
 */
export const supplyChainEdges = mysqlTable(
  "supply_chain_edges",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    fromNodeId: int("fromNodeId").notNull(),
    toNodeId: int("toNodeId").notNull(),
    productGtin: varchar("productGtin", { length: 14 }),
    relationshipType: mysqlEnum("relationshipType", [
      "supplies",
      "manufactures",
      "distributes",
      "retails",
    ]).notNull(),
    lastTransactionDate: timestamp("lastTransactionDate"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    userIdIdx: index("userId_idx").on(table.userId),
    fromNodeIdx: index("fromNode_idx").on(table.fromNodeId),
    toNodeIdx: index("toNode_idx").on(table.toNodeId),
  })
);

export type SupplyChainEdge = typeof supplyChainEdges.$inferSelect;
export type InsertSupplyChainEdge = typeof supplyChainEdges.$inferInsert;

/**
 * EUDR Geolocation Data - Geographic origin data for EUDR compliance
 */
export const eudrGeolocation = mysqlTable(
  "eudr_geolocation",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    productGtin: varchar("productGtin", { length: 14 }).notNull(),
    originLat: decimal("originLat", { precision: 10, scale: 8 }).notNull(),
    originLng: decimal("originLng", { precision: 11, scale: 8 }).notNull(),
    geofenceGeoJSON: json("geofenceGeoJSON"),
    deforestationRisk: mysqlEnum("deforestationRisk", [
      "low",
      "medium",
      "high",
    ]),
    riskAssessmentDate: timestamp("riskAssessmentDate"),
    dueDiligenceStatement: json("dueDiligenceStatement"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    userIdIdx: index("userId_idx").on(table.userId),
    productGtinIdx: index("productGtin_idx").on(table.productGtin),
  })
);

export type EUDRGeolocation = typeof eudrGeolocation.$inferSelect;
export type InsertEUDRGeolocation = typeof eudrGeolocation.$inferInsert;

/**
 * Ingestion Logs - Track CELLAR regulation sync history
 */
export const ingestionLogs = mysqlTable(
  "ingestion_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    syncStartTime: timestamp("syncStartTime").notNull(),
    syncEndTime: timestamp("syncEndTime"),
    status: mysqlEnum("status", ["pending", "success", "failed"])
      .default("pending")
      .notNull(),
    regulationsInserted: int("regulationsInserted").default(0).notNull(),
    regulationsUpdated: int("regulationsUpdated").default(0).notNull(),
    regulationsTotal: int("regulationsTotal").default(0).notNull(),
    errors: int("errors").default(0).notNull(),
    errorDetails: text("errorDetails"),
    durationSeconds: int("durationSeconds"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    statusIdx: index("status_idx").on(table.status),
    syncStartTimeIdx: index("syncStartTime_idx").on(table.syncStartTime),
  })
);
export type IngestionLog = typeof ingestionLogs.$inferSelect;
export type InsertIngestionLog = typeof ingestionLogs.$inferInsert;

/**
 * Raw ESRS datapoints table for staging rows from the EFRAG IG3 Excel file
 * Source: EFRAGIG3ListofESRSDataPoints.xlsx
 */
export const rawEsrsDatapoints = mysqlTable(
  "raw_esrs_datapoints",
  {
    id: int("id").autoincrement().primaryKey(),
    code: varchar("code", { length: 100 }).notNull(),
    esrsStandard: varchar("esrs_standard", { length: 50 }),
    disclosureRequirement: varchar("disclosure_requirement", { length: 100 }),
    paragraph: varchar("paragraph", { length: 100 }),
    relatedAr: varchar("related_ar", { length: 100 }),
    name: text("name").notNull(),
    dataTypeRaw: varchar("data_type_raw", { length: 100 }),
    conditionalRaw: boolean("conditional_raw").default(false),
    voluntaryRaw: boolean("voluntary_raw").default(false),
    sfdrMapping: varchar("sfdr_mapping", { length: 255 }),
    sheetName: varchar("sheet_name", { length: 50 }),
    rowIndex: int("row_index"),
    rawJson: json("raw_json").$type<unknown>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    codeIndex: index("idx_raw_esrs_code").on(table.code),
    sheetIndex: index("idx_raw_esrs_sheet").on(table.sheetName),
  })
);

export type RawESRSDatapoint = typeof rawEsrsDatapoints.$inferSelect;
export type InsertRawESRSDatapoint = typeof rawEsrsDatapoints.$inferInsert;

/**
 * Canonical ESRS datapoints table
 * Source: EFRAG Implementation Guidance 3 (IG3)
 * https://www.efrag.org/en/projects/esrs-implementation-guidance-documents
 */
export const esrsDatapoints = mysqlTable(
  "esrs_datapoints",
  {
    id: int("id").autoincrement().primaryKey(),
    code: varchar("code", { length: 100 }).notNull().unique(),
    esrsStandard: varchar("esrs_standard", { length: 50 }),
    disclosureRequirement: varchar("disclosure_requirement", { length: 100 }),
    paragraph: varchar("paragraph", { length: 100 }),
    relatedAR: varchar("related_ar", { length: 100 }),
    name: text("name").notNull(),
    dataType: varchar("data_type", { length: 50 }),
    conditional: boolean("conditional").default(false),
    voluntary: boolean("voluntary").default(false),
    sfdrMapping: varchar("sfdr_mapping", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    codeIndex: index("idx_esrs_code").on(table.code),
    standardIndex: index("idx_esrs_standard").on(table.esrsStandard),
  })
);

export type ESRSDatapoint = typeof esrsDatapoints.$inferSelect;
export type InsertESRSDatapoint = typeof esrsDatapoints.$inferInsert;

/**
 * Regulation to ESRS Datapoint Mappings
 * Stores LLM-generated mappings between regulations and relevant ESRS disclosure requirements
 */
export const regulationEsrsMappings = mysqlTable(
  "regulation_esrs_mappings",
  {
    id: int("id").autoincrement().primaryKey(),
    regulationId: int("regulationId").notNull(), // Foreign key to regulations table
    datapointId: int("datapointId").notNull(), // Foreign key to esrs_datapoints table
    relevanceScore: int("relevanceScore").default(5).notNull(), // 1-10 scale, how relevant is this datapoint
    reasoning: text("reasoning"), // LLM explanation of why this datapoint is relevant
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    regulationIdIdx: index("regulationId_idx").on(table.regulationId),
    datapointIdIdx: index("datapointId_idx").on(table.datapointId),
    uniqueMapping: index("unique_mapping_idx").on(
      table.regulationId,
      table.datapointId
    ),
  })
);

export type RegulationEsrsMapping = typeof regulationEsrsMappings.$inferSelect;
export type InsertRegulationEsrsMapping =
  typeof regulationEsrsMappings.$inferInsert;

/**
 * Mapping Feedback - User validation of ESRS mapping accuracy
 * Collects thumbs up/down votes to improve LLM prompt quality
 */
export const mappingFeedback = mysqlTable(
  "mapping_feedback",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(), // Foreign key to users table
    mappingId: int("mappingId").notNull(), // Foreign key to regulation_esrs_mappings table
    vote: boolean("vote").notNull(), // true = thumbs up, false = thumbs down
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    userIdIdx: index("userId_idx").on(table.userId),
    mappingIdIdx: index("mappingId_idx").on(table.mappingId),
    uniqueVote: index("unique_vote_idx").on(table.userId, table.mappingId), // One vote per user per mapping
  })
);

export type MappingFeedback = typeof mappingFeedback.$inferSelect;
export type InsertMappingFeedback = typeof mappingFeedback.$inferInsert;

/**
 * EPCIS Batch Jobs - Tracks batch processing of EPCIS files
 */
export const epciBatchJobs = mysqlTable(
  "epcis_batch_jobs",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    fileName: varchar("fileName", { length: 255 }).notNull(),
    fileSize: int("fileSize").notNull(), // in bytes
    status: mysqlEnum("status", ["queued", "processing", "completed", "failed"])
      .default("queued")
      .notNull(),
    totalEvents: int("totalEvents").default(0),
    processedEvents: int("processedEvents").default(0),
    failedEvents: int("failedEvents").default(0),
    errorMessage: text("errorMessage"),
    startedAt: timestamp("startedAt"),
    completedAt: timestamp("completedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    userIdIdx: index("userId_idx").on(table.userId),
    statusIdx: index("status_idx").on(table.status),
    createdAtIdx: index("createdAt_idx").on(table.createdAt),
  })
);

export type EPCISBatchJob = typeof epciBatchJobs.$inferSelect;
export type InsertEPCISBatchJob = typeof epciBatchJobs.$inferInsert;

/**
 * Supply Chain Compliance Risks - Detected compliance issues in supply chain
 */
export const supplyChainRisks = mysqlTable(
  "supply_chain_risks",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    eventId: int("eventId").notNull(),
    nodeId: int("nodeId"),
    riskType: mysqlEnum("riskType", [
      "deforestation",
      "labor",
      "environmental",
      "traceability",
      "certification",
      "geolocation",
    ]).notNull(),
    severity: mysqlEnum("severity", [
      "low",
      "medium",
      "high",
      "critical",
    ]).notNull(),
    description: text("description").notNull(),
    regulationId: int("regulationId"),
    recommendedAction: text("recommendedAction"),
    isResolved: boolean("isResolved").default(false),
    resolvedAt: timestamp("resolvedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    userIdIdx: index("userId_idx").on(table.userId),
    eventIdIdx: index("eventId_idx").on(table.eventId),
    nodeIdIdx: index("nodeId_idx").on(table.nodeId),
    severityIdx: index("severity_idx").on(table.severity),
    riskTypeIdx: index("riskType_idx").on(table.riskType),
  })
);

export type SupplyChainRisk = typeof supplyChainRisks.$inferSelect;
export type InsertSupplyChainRisk = typeof supplyChainRisks.$inferInsert;

/**
 * Supply Chain Analytics - Aggregated metrics for dashboard
 */
export const supplyChainAnalytics = mysqlTable(
  "supply_chain_analytics",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    metricDate: timestamp("metricDate").notNull(),
    totalEvents: int("totalEvents").default(0),
    totalNodes: int("totalNodes").default(0),
    totalEdges: int("totalEdges").default(0),
    highRiskNodes: int("highRiskNodes").default(0),
    averageTraceabilityScore: decimal("averageTraceabilityScore", {
      precision: 5,
      scale: 2,
    }),
    complianceScore: decimal("complianceScore", { precision: 5, scale: 2 }),
    lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    userIdIdx: index("userId_idx").on(table.userId),
    metricDateIdx: index("metricDate_idx").on(table.metricDate),
  })
);

export type SupplyChainAnalytics = typeof supplyChainAnalytics.$inferSelect;
export type InsertSupplyChainAnalytics =
  typeof supplyChainAnalytics.$inferInsert;

/**
 * Risk Remediation Plans - Structured workflows for addressing compliance risks
 */
export const riskRemediationPlans = mysqlTable(
  "risk_remediation_plans",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    riskId: int("riskId").notNull(),
    status: mysqlEnum("status", [
      "draft",
      "in_progress",
      "completed",
      "cancelled",
    ])
      .default("draft")
      .notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    targetCompletionDate: timestamp("targetCompletionDate"),
    completedAt: timestamp("completedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    userIdIdx: index("userId_idx").on(table.userId),
    riskIdIdx: index("riskId_idx").on(table.riskId),
    statusIdx: index("status_idx").on(table.status),
  })
);

export type RiskRemediationPlan = typeof riskRemediationPlans.$inferSelect;
export type InsertRiskRemediationPlan =
  typeof riskRemediationPlans.$inferInsert;

/**
 * Remediation Steps - Individual action items within a remediation plan
 */
export const remediationSteps = mysqlTable(
  "remediation_steps",
  {
    id: int("id").autoincrement().primaryKey(),
    planId: int("planId").notNull(),
    stepNumber: int("stepNumber").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    requiredEvidence: text("requiredEvidence"), // JSON array of evidence types
    status: mysqlEnum("status", [
      "pending",
      "in_progress",
      "completed",
      "skipped",
    ])
      .default("pending")
      .notNull(),
    assignedTo: varchar("assignedTo", { length: 255 }),
    dueDate: timestamp("dueDate"),
    completedAt: timestamp("completedAt"),
    notes: text("notes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    planIdIdx: index("planId_idx").on(table.planId),
    statusIdx: index("status_idx").on(table.status),
  })
);

export type RemediationStep = typeof remediationSteps.$inferSelect;
export type InsertRemediationStep = typeof remediationSteps.$inferInsert;

/**
 * Compliance Evidence - Documents and records proving remediation
 */
export const complianceEvidence = mysqlTable(
  "compliance_evidence",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    stepId: int("stepId").notNull(),
    evidenceType: varchar("evidenceType", { length: 128 }).notNull(), // e.g., "certification", "audit_report", "supplier_declaration"
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    fileUrl: varchar("fileUrl", { length: 512 }), // S3 URL
    fileKey: varchar("fileKey", { length: 512 }), // S3 key for retrieval
    mimeType: varchar("mimeType", { length: 128 }),
    fileSize: int("fileSize"), // in bytes
    uploadedBy: varchar("uploadedBy", { length: 255 }),
    verificationStatus: mysqlEnum("verificationStatus", [
      "pending",
      "verified",
      "rejected",
    ])
      .default("pending")
      .notNull(),
    verifiedAt: timestamp("verifiedAt"),
    verifiedBy: varchar("verifiedBy", { length: 255 }),
    verificationNotes: text("verificationNotes"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    userIdIdx: index("userId_idx").on(table.userId),
    stepIdIdx: index("stepId_idx").on(table.stepId),
    verificationStatusIdx: index("verificationStatus_idx").on(
      table.verificationStatus
    ),
  })
);

export type ComplianceEvidence = typeof complianceEvidence.$inferSelect;
export type InsertComplianceEvidence = typeof complianceEvidence.$inferInsert;

/**
 * Remediation Templates - Pre-built workflows for common risk types
 */
export const remediationTemplates = mysqlTable(
  "remediation_templates",
  {
    id: int("id").autoincrement().primaryKey(),
    riskType: varchar("riskType", { length: 128 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    steps: json("steps").notNull(), // JSON array of step templates
    estimatedDays: int("estimatedDays"),
    isActive: boolean("isActive").default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    riskTypeIdx: index("riskType_idx").on(table.riskType),
  })
);

export type RemediationTemplate = typeof remediationTemplates.$inferSelect;
export type InsertRemediationTemplate =
  typeof remediationTemplates.$inferInsert;

/**
 * Remediation Progress - Track completion metrics
 */
export const remediationProgress = mysqlTable(
  "remediation_progress",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    planId: int("planId").notNull(),
    totalSteps: int("totalSteps").notNull(),
    completedSteps: int("completedSteps").default(0),
    evidenceSubmitted: int("evidenceSubmitted").default(0),
    evidenceVerified: int("evidenceVerified").default(0),
    progressPercentage: int("progressPercentage").default(0),
    lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    userIdIdx: index("userId_idx").on(table.userId),
    planIdIdx: index("planId_idx").on(table.planId),
  })
);

export type RemediationProgress = typeof remediationProgress.$inferSelect;
export type InsertRemediationProgress = typeof remediationProgress.$inferInsert;

/**
 * Compliance Scores - Real-time compliance metrics for users
 */
export const complianceScores = mysqlTable(
  "compliance_scores",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    overallScore: decimal("overallScore", { precision: 5, scale: 2 }).notNull(), // 0-100
    riskManagementScore: decimal("riskManagementScore", {
      precision: 5,
      scale: 2,
    }).notNull(),
    remediationScore: decimal("remediationScore", {
      precision: 5,
      scale: 2,
    }).notNull(),
    evidenceScore: decimal("evidenceScore", {
      precision: 5,
      scale: 2,
    }).notNull(),
    regulationScore: decimal("regulationScore", {
      precision: 5,
      scale: 2,
    }).notNull(),
    totalRisks: int("totalRisks").default(0),
    resolvedRisks: int("resolvedRisks").default(0),
    totalRemediationPlans: int("totalRemediationPlans").default(0),
    completedPlans: int("completedPlans").default(0),
    totalEvidence: int("totalEvidence").default(0),
    verifiedEvidence: int("verifiedEvidence").default(0),
    regulationsCovered: int("regulationsCovered").default(0),
    lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    userIdIdx: index("userId_idx").on(table.userId),
    overallScoreIdx: index("overallScore_idx").on(table.overallScore),
  })
);

export type ComplianceScore = typeof complianceScores.$inferSelect;
export type InsertComplianceScore = typeof complianceScores.$inferInsert;

/**
 * Score History - Track compliance score changes over time
 */
export const scoreHistory = mysqlTable(
  "score_history",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    overallScore: decimal("overallScore", { precision: 5, scale: 2 }).notNull(),
    riskManagementScore: decimal("riskManagementScore", {
      precision: 5,
      scale: 2,
    }).notNull(),
    remediationScore: decimal("remediationScore", {
      precision: 5,
      scale: 2,
    }).notNull(),
    evidenceScore: decimal("evidenceScore", {
      precision: 5,
      scale: 2,
    }).notNull(),
    regulationScore: decimal("regulationScore", {
      precision: 5,
      scale: 2,
    }).notNull(),
    changeReason: varchar("changeReason", { length: 255 }), // e.g., "risk_resolved", "evidence_verified"
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    userIdIdx: index("userId_idx").on(table.userId),
    createdAtIdx: index("createdAt_idx").on(table.createdAt),
  })
);

export type ScoreHistory = typeof scoreHistory.$inferSelect;
export type InsertScoreHistory = typeof scoreHistory.$inferInsert;

/**
 * Scoring Benchmarks - Compare user scores against industry standards
 */
export const scoringBenchmarks = mysqlTable(
  "scoring_benchmarks",
  {
    id: int("id").autoincrement().primaryKey(),
    industry: varchar("industry", { length: 128 }).notNull(),
    region: varchar("region", { length: 128 }).notNull(),
    avgOverallScore: decimal("avgOverallScore", {
      precision: 5,
      scale: 2,
    }).notNull(),
    avgRiskManagementScore: decimal("avgRiskManagementScore", {
      precision: 5,
      scale: 2,
    }).notNull(),
    avgRemediationScore: decimal("avgRemediationScore", {
      precision: 5,
      scale: 2,
    }).notNull(),
    avgEvidenceScore: decimal("avgEvidenceScore", {
      precision: 5,
      scale: 2,
    }).notNull(),
    avgRegulationScore: decimal("avgRegulationScore", {
      precision: 5,
      scale: 2,
    }).notNull(),
    percentile75: decimal("percentile75", { precision: 5, scale: 2 }).notNull(),
    percentile90: decimal("percentile90", { precision: 5, scale: 2 }).notNull(),
    dataPoints: int("dataPoints").default(0),
    lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    industryRegionIdx: index("industry_region_idx").on(
      table.industry,
      table.region
    ),
  })
);

export type ScoringBenchmark = typeof scoringBenchmarks.$inferSelect;
export type InsertScoringBenchmark = typeof scoringBenchmarks.$inferInsert;

/**
 * Score Milestones - Track achievement of compliance milestones
 */
export const scoreMilestones = mysqlTable(
  "score_milestones",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    milestoneType: varchar("milestoneType", { length: 128 }).notNull(), // e.g., "score_50", "all_risks_resolved", "100_evidence_verified"
    milestoneTitle: varchar("milestoneTitle", { length: 255 }).notNull(),
    description: text("description"),
    achievedAt: timestamp("achievedAt").notNull(),
    badge: varchar("badge", { length: 128 }), // emoji or icon identifier
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    userIdIdx: index("userId_idx").on(table.userId),
    achievedAtIdx: index("achievedAt_idx").on(table.achievedAt),
  })
);

export type ScoreMilestone = typeof scoreMilestones.$inferSelect;
export type InsertScoreMilestone = typeof scoreMilestones.$inferInsert;

/**
 * Compliance Roadmaps - Strategic implementation plans
 */
export const complianceRoadmaps = mysqlTable(
  "compliance_roadmaps",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    strategy: varchar("strategy", { length: 128 }).notNull(), // "risk_first", "quick_wins", "balanced", "comprehensive"
    targetScore: int("targetScore").default(80), // Target compliance score
    currentScore: decimal("currentScore", { precision: 5, scale: 2 }).notNull(),
    projectedScore: decimal("projectedScore", {
      precision: 5,
      scale: 2,
    }).notNull(),
    status: varchar("status", { length: 32 }).default("draft"), // draft, active, completed
    startDate: timestamp("startDate").notNull(),
    targetCompletionDate: timestamp("targetCompletionDate").notNull(),
    estimatedEffort: int("estimatedEffort"), // hours
    estimatedImpact: decimal("estimatedImpact", { precision: 5, scale: 2 }), // score improvement
    progressPercentage: int("progressPercentage").default(0),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    userIdIdx: index("userId_idx").on(table.userId),
    statusIdx: index("status_idx").on(table.status),
  })
);

export type ComplianceRoadmap = typeof complianceRoadmaps.$inferSelect;
export type InsertComplianceRoadmap = typeof complianceRoadmaps.$inferInsert;

/**
 * Roadmap Actions - Individual remediation actions in roadmap
 */
export const roadmapActions = mysqlTable(
  "roadmap_actions",
  {
    id: int("id").autoincrement().primaryKey(),
    roadmapId: int("roadmapId").notNull(),
    actionType: varchar("actionType", { length: 128 }).notNull(), // "resolve_risk", "complete_plan", "verify_evidence", "improve_coverage"
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    priority: varchar("priority", { length: 32 }).notNull(), // "critical", "high", "medium", "low"
    sequenceNumber: int("sequenceNumber").notNull(), // Order in roadmap
    estimatedEffort: int("estimatedEffort"), // hours
    estimatedImpact: decimal("estimatedImpact", { precision: 5, scale: 2 }), // score improvement
    startDate: timestamp("startDate").notNull(),
    targetDate: timestamp("targetDate").notNull(),
    status: varchar("status", { length: 32 }).default("pending"), // pending, in_progress, completed, blocked
    relatedRiskId: int("relatedRiskId"), // Foreign key to supply_chain_risks
    relatedPlanId: int("relatedPlanId"), // Foreign key to risk_remediation_plans
    successCriteria: text("successCriteria"),
    blockers: text("blockers"),
    completedAt: timestamp("completedAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    roadmapIdIdx: index("roadmapId_idx").on(table.roadmapId),
    priorityIdx: index("priority_idx").on(table.priority),
    statusIdx: index("status_idx").on(table.status),
  })
);

export type RoadmapAction = typeof roadmapActions.$inferSelect;
export type InsertRoadmapAction = typeof roadmapActions.$inferInsert;

/**
 * Roadmap Dependencies - Track action dependencies
 */
export const roadmapDependencies = mysqlTable(
  "roadmap_dependencies",
  {
    id: int("id").autoincrement().primaryKey(),
    fromActionId: int("fromActionId").notNull(), // Action that must complete first
    toActionId: int("toActionId").notNull(), // Action that depends on fromAction
    dependencyType: varchar("dependencyType", { length: 64 }).notNull(), // "blocking", "soft_dependency"
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    fromActionIdIdx: index("fromActionId_idx").on(table.fromActionId),
    toActionIdIdx: index("toActionId_idx").on(table.toActionId),
  })
);

export type RoadmapDependency = typeof roadmapDependencies.$inferSelect;
export type InsertRoadmapDependency = typeof roadmapDependencies.$inferInsert;

/**
 * Roadmap Milestones - Track progress checkpoints
 */
export const roadmapMilestones = mysqlTable(
  "roadmap_milestones",
  {
    id: int("id").autoincrement().primaryKey(),
    roadmapId: int("roadmapId").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    targetDate: timestamp("targetDate").notNull(),
    targetScore: decimal("targetScore", { precision: 5, scale: 2 }).notNull(),
    completedDate: timestamp("completedDate"),
    status: varchar("status", { length: 32 }).default("pending"), // pending, completed
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    roadmapIdIdx: index("roadmapId_idx").on(table.roadmapId),
  })
);

export type RoadmapMilestone = typeof roadmapMilestones.$inferSelect;
export type InsertRoadmapMilestone = typeof roadmapMilestones.$inferInsert;

/**
 * Roadmap Comments - Team discussion on roadmaps
 */
export const roadmapComments = mysqlTable(
  "roadmap_comments",
  {
    id: int("id").autoincrement().primaryKey(),
    roadmapId: int("roadmapId").notNull(),
    actionId: int("actionId"), // Optional: comment on specific action
    userId: int("userId").notNull(),
    content: text("content").notNull(),
    isApproval: boolean("isApproval").default(false), // Mark as approval/rejection
    approvalStatus: varchar("approvalStatus", { length: 32 }), // approved, rejected, pending
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    roadmapIdIdx: index("roadmapId_idx").on(table.roadmapId),
    actionIdIdx: index("actionId_idx").on(table.actionId),
    userIdIdx: index("userId_idx").on(table.userId),
  })
);

export type RoadmapComment = typeof roadmapComments.$inferSelect;
export type InsertRoadmapComment = typeof roadmapComments.$inferInsert;

/**
 * Roadmap Approvals - Track approval workflows
 */
export const roadmapApprovals = mysqlTable(
  "roadmap_approvals",
  {
    id: int("id").autoincrement().primaryKey(),
    roadmapId: int("roadmapId").notNull(),
    actionId: int("actionId"), // Optional: approval for specific action
    requiredApproverId: int("requiredApproverId").notNull(), // User who needs to approve
    approverRole: varchar("approverRole", { length: 64 }), // stakeholder, manager, admin
    status: varchar("status", { length: 32 }).default("pending"), // pending, approved, rejected
    approvedAt: timestamp("approvedAt"),
    approverComments: text("approverComments"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    roadmapIdIdx: index("roadmapId_idx").on(table.roadmapId),
    requiredApproverIdIdx: index("requiredApproverId_idx").on(
      table.requiredApproverId
    ),
    statusIdx: index("status_idx").on(table.status),
  })
);

export type RoadmapApproval = typeof roadmapApprovals.$inferSelect;
export type InsertRoadmapApproval = typeof roadmapApprovals.$inferInsert;

/**
 * Roadmap Activity Log - Track all changes and discussions
 */
export const roadmapActivityLog = mysqlTable(
  "roadmap_activity_log",
  {
    id: int("id").autoincrement().primaryKey(),
    roadmapId: int("roadmapId").notNull(),
    userId: int("userId").notNull(),
    activityType: varchar("activityType", { length: 64 }).notNull(), // created, updated, commented, approved, rejected, action_completed
    description: text("description"),
    metadata: json("metadata"), // Additional context
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    roadmapIdIdx: index("roadmapId_idx").on(table.roadmapId),
    userIdIdx: index("userId_idx").on(table.userId),
    activityTypeIdx: index("activityType_idx").on(table.activityType),
  })
);

export type RoadmapActivityLog = typeof roadmapActivityLog.$inferSelect;
export type InsertRoadmapActivityLog = typeof roadmapActivityLog.$inferInsert;

/**
 * Team Roadmap Access - Control who can view/edit roadmaps
 */
export const teamRoadmapAccess = mysqlTable(
  "team_roadmap_access",
  {
    id: int("id").autoincrement().primaryKey(),
    roadmapId: int("roadmapId").notNull(),
    userId: int("userId").notNull(),
    accessLevel: varchar("accessLevel", { length: 32 }).notNull(), // viewer, editor, approver
    grantedBy: int("grantedBy").notNull(), // User who granted access
    grantedAt: timestamp("grantedAt").defaultNow().notNull(),
  },
  table => ({
    roadmapIdIdx: index("roadmapId_idx").on(table.roadmapId),
    userIdIdx: index("userId_idx").on(table.userId),
  })
);

export type TeamRoadmapAccess = typeof teamRoadmapAccess.$inferSelect;
export type InsertTeamRoadmapAccess = typeof teamRoadmapAccess.$inferInsert;

/**
 * Roadmap Templates - Pre-built compliance roadmaps
 */
export const roadmapTemplates = mysqlTable(
  "roadmap_templates",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 64 }).notNull(), // csrd, eudr, esrs, custom
    strategy: varchar("strategy", { length: 32 }).notNull(), // risk_first, quick_wins, balanced, comprehensive
    estimatedEffort: int("estimatedEffort").notNull(), // hours
    estimatedImpact: decimal("estimatedImpact", { precision: 5, scale: 2 }), // percentage
    targetScore: decimal("targetScore", { precision: 5, scale: 2 }), // projected score
    isPublic: boolean("isPublic").default(true), // available to all users
    createdBy: int("createdBy").notNull(),
    usageCount: int("usageCount").default(0), // track popularity
    rating: decimal("rating", { precision: 3, scale: 2 }).default("0.00"), // average rating
    tags: json("tags"), // array of tags for filtering
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    categoryIdx: index("category_idx").on(table.category),
    createdByIdx: index("createdBy_idx").on(table.createdBy),
  })
);

export type RoadmapTemplate = typeof roadmapTemplates.$inferSelect;
export type InsertRoadmapTemplate = typeof roadmapTemplates.$inferInsert;

/**
 * Template Actions - Pre-configured actions in templates
 */
export const templateActions = mysqlTable(
  "template_actions",
  {
    id: int("id").autoincrement().primaryKey(),
    templateId: int("templateId").notNull(),
    sequenceNumber: int("sequenceNumber").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    actionType: varchar("actionType", { length: 64 }).notNull(), // resolve_risk, complete_plan, verify_evidence, improve_coverage
    priority: varchar("priority", { length: 32 }).notNull(), // critical, high, medium, low
    estimatedEffort: int("estimatedEffort").notNull(), // hours
    estimatedImpact: decimal("estimatedImpact", { precision: 5, scale: 2 }), // percentage
    successCriteria: text("successCriteria"),
    relatedStandards: json("relatedStandards"), // array of ESRS standards
  },
  table => ({
    templateIdIdx: index("templateId_idx").on(table.templateId),
  })
);

export type TemplateAction = typeof templateActions.$inferSelect;
export type InsertTemplateAction = typeof templateActions.$inferInsert;

/**
 * Template Milestones - Pre-configured milestones in templates
 */
export const templateMilestones = mysqlTable(
  "template_milestones",
  {
    id: int("id").autoincrement().primaryKey(),
    templateId: int("templateId").notNull(),
    sequenceNumber: int("sequenceNumber").notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    targetScore: decimal("targetScore", { precision: 5, scale: 2 }).notNull(),
    daysFromStart: int("daysFromStart").notNull(), // relative timeline
  },
  table => ({
    templateIdIdx: index("templateId_idx").on(table.templateId),
  })
);

export type TemplateMilestone = typeof templateMilestones.$inferSelect;
export type InsertTemplateMilestone = typeof templateMilestones.$inferInsert;

/**
 * Template Usage - Track template usage and ratings
 */
export const templateUsage = mysqlTable(
  "template_usage",
  {
    id: int("id").autoincrement().primaryKey(),
    templateId: int("templateId").notNull(),
    userId: int("userId").notNull(),
    roadmapId: int("roadmapId").notNull(),
    rating: int("rating"), // 1-5 stars
    feedback: text("feedback"),
    usedAt: timestamp("usedAt").defaultNow().notNull(),
  },
  table => ({
    templateIdIdx: index("templateId_idx").on(table.templateId),
    userIdIdx: index("userId_idx").on(table.userId),
  })
);

export type TemplateUsage = typeof templateUsage.$inferSelect;
export type InsertTemplateUsage = typeof templateUsage.$inferInsert;

/**
 * Notification Preferences - User customization for alerts
 */
export const notificationPreferences = mysqlTable(
  "notification_preferences",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().unique(),
    // Notification type toggles
    riskDetected: boolean("riskDetected").default(true),
    remediationUpdated: boolean("remediationUpdated").default(true),
    commentAdded: boolean("commentAdded").default(true),
    approvalRequested: boolean("approvalRequested").default(true),
    approvalDecision: boolean("approvalDecision").default(true),
    templateUpdated: boolean("templateUpdated").default(true),
    scoreChanged: boolean("scoreChanged").default(true),
    milestoneAchieved: boolean("milestoneAchieved").default(true),
    // Severity filtering
    minSeverity: varchar("minSeverity", { length: 32 }).default("low"), // low, medium, high, critical
    // Delivery channels
    inAppNotifications: boolean("inAppNotifications").default(true),
    emailNotifications: boolean("emailNotifications").default(false),
    // Quiet hours
    quietHoursEnabled: boolean("quietHoursEnabled").default(false),
    quietHoursStart: varchar("quietHoursStart", { length: 5 }), // HH:MM format
    quietHoursEnd: varchar("quietHoursEnd", { length: 5 }), // HH:MM format
    // Notification frequency
    batchNotifications: boolean("batchNotifications").default(false),
    batchInterval: int("batchInterval").default(60), // minutes
    // Timestamps
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    userIdIdx: index("userId_idx").on(table.userId),
  })
);

export type NotificationPreference =
  typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference =
  typeof notificationPreferences.$inferInsert;

/**
 * User Onboarding Progress - Track completion of getting started steps
 * TEMPORARILY DISABLED: TiDB doesn't support JSON default values
 */
// export const userOnboardingProgress = mysqlTable("user_onboarding_progress", {
//   id: int("id").autoincrement().primaryKey(),
//   userId: int("userId").notNull().unique(),
//   completedSteps: json("completedSteps").$type<number[]>(), // array of completed step IDs
//   currentStep: int("currentStep").default(1), // current active step
//   completionPercentage: int("completionPercentage").default(0), // 0-100
//   isCompleted: boolean("isCompleted").default(false), // all steps done
//   startedAt: timestamp("startedAt").defaultNow().notNull(),
//   completedAt: timestamp("completedAt"),
//   updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
// }, (table) => ({
//   userIdIdx: index("userId_idx").on(table.userId),
// }));

// export type UserOnboardingProgress = typeof userOnboardingProgress.$inferSelect;
// export type InsertUserOnboardingProgress = typeof userOnboardingProgress.$inferInsert;

/**
 * Dutch Compliance Initiatives - National programs that complement EU regulations
 * Examples: UPV Textiel, Green Deal Zorg, DSGO, Denim Deal, Verpact
 */
export const dutchInitiatives = mysqlTable(
  "dutch_initiatives",
  {
    id: int("id").autoincrement().primaryKey(),

    // Basic Information
    initiativeName: varchar("initiativeName", { length: 255 }).notNull(),
    shortName: varchar("shortName", { length: 100 }).notNull(), // e.g., "UPV Textiel", "DSGO"
    initiativeType: varchar("initiativeType", { length: 100 }).notNull(), // "EPR Scheme", "Voluntary Covenant", "Data Framework"
    status: varchar("status", { length: 100 }).notNull(), // "Active", "Proposed", "Pilot"

    // Scope & Sector
    sector: varchar("sector", { length: 255 }).notNull(), // "Textiles", "Healthcare", "Construction", "Packaging"
    scope: text("scope").notNull(), // Detailed description of what's covered

    // Timeline
    startDate: timestamp("startDate"), // When initiative started
    endDate: timestamp("endDate"), // For covenants with expiry (e.g., Green Deal 2022-2026)
    reportingDeadline: varchar("reportingDeadline", { length: 255 }), // e.g., "Mid-year annually"

    // Targets & Requirements
    keyTargets: json("keyTargets").$type<string[]>().notNull(), // Array of targets
    complianceRequirements: text("complianceRequirements").notNull(), // What companies must do

    // GS1 Integration
    gs1Relevance: text("gs1Relevance").notNull(), // How GS1 standards apply
    requiredGS1Standards: json("requiredGS1Standards").$type<number[]>(), // Array of standard IDs
    requiredGDSNAttributes: json("requiredGDSNAttributes").$type<string[]>(), // Array of attribute names

    // Relationships
    relatedEURegulations: json("relatedEURegulations").$type<number[]>(), // Array of regulation IDs
    managingOrganization: varchar("managingOrganization", { length: 255 }), // e.g., "RIVM", "Verpact"

    // Resources
    officialUrl: varchar("officialUrl", { length: 500 }),
    documentationUrl: varchar("documentationUrl", { length: 500 }),

    // Metadata
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    sectorIdx: index("sector_idx").on(table.sector),
    statusIdx: index("status_idx").on(table.status),
  })
);

export type DutchInitiative = typeof dutchInitiatives.$inferSelect;
export type InsertDutchInitiative = typeof dutchInitiatives.$inferInsert;

/**
 * Initiative-Regulation Mappings - Links Dutch initiatives to EU regulations
 */
export const initiativeRegulationMappings = mysqlTable(
  "initiative_regulation_mappings",
  {
    id: int("id").autoincrement().primaryKey(),
    initiativeId: int("initiativeId")
      .notNull()
      .references(() => dutchInitiatives.id),
    regulationId: int("regulationId")
      .notNull()
      .references(() => regulations.id),
    relationshipType: varchar("relationshipType", { length: 100 }).notNull(), // "Implements", "Complements", "Aligns With"
    description: text("description"), // How they relate
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    initiativeIdIdx: index("initiativeId_idx").on(table.initiativeId),
    regulationIdIdx: index("regulationId_idx").on(table.regulationId),
  })
);

export type InitiativeRegulationMapping =
  typeof initiativeRegulationMappings.$inferSelect;
export type InsertInitiativeRegulationMapping =
  typeof initiativeRegulationMappings.$inferInsert;

/**
 * Initiative-Standard Mappings - Links Dutch initiatives to GS1 standards
 */
export const initiativeStandardMappings = mysqlTable(
  "initiative_standard_mappings",
  {
    id: int("id").autoincrement().primaryKey(),
    initiativeId: int("initiativeId")
      .notNull()
      .references(() => dutchInitiatives.id),
    standardId: int("standardId")
      .notNull()
      .references(() => gs1Standards.id),
    criticality: varchar("criticality", { length: 50 }).notNull(), // "CRITICAL", "RECOMMENDED", "OPTIONAL"
    implementationNotes: text("implementationNotes"), // Specific guidance
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    initiativeIdIdx: index("initiativeId_idx").on(table.initiativeId),
    standardIdIdx: index("standardId_idx").on(table.standardId),
  })
);

export type InitiativeStandardMapping =
  typeof initiativeStandardMappings.$inferSelect;
export type InsertInitiativeStandardMapping =
  typeof initiativeStandardMappings.$inferInsert;

// ============================================================================
// ASK ISA - RAG-POWERED Q&A SYSTEM
// ============================================================================

/**
 * Knowledge Embeddings - Vector embeddings for semantic search
 * Stores embeddings for regulations, standards, ESRS datapoints, and Dutch initiatives
 */
export const knowledgeEmbeddings = mysqlTable(
  "knowledge_embeddings",
  {
    id: int("id").autoincrement().primaryKey(),

    // Source reference
    sourceType: mysqlEnum("sourceType", [
      "regulation",
      "standard",
      "esrs_datapoint",
      "dutch_initiative",
    ]).notNull(),
    sourceId: int("sourceId").notNull(), // ID in the source table

    // Content
    content: text("content").notNull(), // The text that was embedded
    contentHash: varchar("contentHash", { length: 64 }).notNull(), // SHA-256 hash for deduplication

    // Embedding vector (stored as JSON array of floats)
    embedding: json("embedding").$type<number[]>().notNull(),
    embeddingModel: varchar("embeddingModel", { length: 64 })
      .default("text-embedding-3-small")
      .notNull(),

    // Metadata for search result display
    title: varchar("title", { length: 512 }).notNull(),
    url: varchar("url", { length: 512 }), // Link to detail page

    // Timestamps
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    sourceTypeIdx: index("source_type_idx").on(table.sourceType),
    sourceIdIdx: index("source_id_idx").on(table.sourceId),
    contentHashIdx: index("content_hash_idx").on(table.contentHash),
    // Composite index for efficient source lookups
    sourceCompositeIdx: index("source_composite_idx").on(
      table.sourceType,
      table.sourceId
    ),
  })
);

export type KnowledgeEmbedding = typeof knowledgeEmbeddings.$inferSelect;
export type InsertKnowledgeEmbedding = typeof knowledgeEmbeddings.$inferInsert;

/**
 * Q&A Conversations - User question/answer sessions
 */
export const qaConversations = mysqlTable(
  "qa_conversations",
  {
    id: int("id").autoincrement().primaryKey(),

    // User reference (nullable for anonymous users)
    userId: int("userId").references(() => users.id),

    // Conversation metadata
    title: varchar("title", { length: 255 }), // Auto-generated from first question
    messageCount: int("messageCount").default(0).notNull(),

    // Timestamps
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    createdAtIdx: index("created_at_idx").on(table.createdAt),
  })
);

export type QAConversation = typeof qaConversations.$inferSelect;
export type InsertQAConversation = typeof qaConversations.$inferInsert;

/**
 * Q&A Messages - Individual messages in conversations
 */
export const qaMessages = mysqlTable(
  "qa_messages",
  {
    id: int("id").autoincrement().primaryKey(),

    // Conversation reference
    conversationId: int("conversationId")
      .notNull()
      .references(() => qaConversations.id),

    // Message content
    role: mysqlEnum("role", ["user", "assistant"]).notNull(),
    content: text("content").notNull(),

    // Source citations (for assistant messages)
    sources: json("sources").$type<
      Array<{
        type: "regulation" | "standard" | "esrs_datapoint" | "dutch_initiative";
        id: number;
        title: string;
        url: string;
        relevanceScore: number;
      }>
    >(),

    // Search metadata
    retrievedChunks: int("retrievedChunks"), // Number of chunks retrieved from vector search

    // Timestamps
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    conversationIdIdx: index("conversation_id_idx").on(table.conversationId),
    createdAtIdx: index("created_at_idx").on(table.createdAt),
  })
);

export type QAMessage = typeof qaMessages.$inferSelect;
export type InsertQAMessage = typeof qaMessages.$inferInsert;

/**
 * GS1 Attributes - Benelux sector-specific attribute catalog
 * Stores attributes from GS1 Data Source Benelux data models (Food/H&B, DIY, Healthcare)
 */
export const gs1Attributes = mysqlTable(
  "gs1_attributes",
  {
    id: int("id").autoincrement().primaryKey(),
    attributeCode: varchar("attributeCode", { length: 100 }).notNull(),
    attributeName: varchar("attributeName", { length: 255 }).notNull(),
    sector: mysqlEnum("sector", [
      "food_hb",
      "diy_garden_pet",
      "healthcare",
      "agriculture",
    ]).notNull(),
    description: text("description"),
    datatype: mysqlEnum("datatype", [
      "text",
      "number",
      "boolean",
      "date",
      "code_list",
      "url",
      "other",
    ]).notNull(),
    codeListId: int("codeListId"),
    isMandatory: boolean("isMandatory").default(false),
    esrsRelevance: text("esrsRelevance"),
    dppRelevance: text("dppRelevance"),
    packagingRelated: boolean("packagingRelated").default(false),
    sustainabilityRelated: boolean("sustainabilityRelated").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    sectorIdx: index("sector_idx").on(table.sector),
    packagingIdx: index("packaging_idx").on(table.packagingRelated),
    sustainabilityIdx: index("sustainability_idx").on(
      table.sustainabilityRelated
    ),
    // Composite unique constraint: same code can exist across sectors
    uniqueCodeSector: index("unique_code_sector").on(table.attributeCode, table.sector),
  })
);

export type GS1Attribute = typeof gs1Attributes.$inferSelect;
export type InsertGS1Attribute = typeof gs1Attributes.$inferInsert;

/**
 * GS1 Attribute Code Lists - Enumerated values for code_list type attributes
 */
export const gs1AttributeCodeLists = mysqlTable(
  "gs1_attribute_code_lists",
  {
    id: int("id").autoincrement().primaryKey(),
    attributeId: int("attributeId").notNull(),
    code: varchar("code", { length: 50 }).notNull(),
    description: text("description"),
    sortOrder: int("sortOrder").default(0),
    isActive: boolean("isActive").default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    attributeIdIdx: index("attribute_id_idx").on(table.attributeId),
  })
);

export type GS1AttributeCodeList = typeof gs1AttributeCodeLists.$inferSelect;
export type InsertGS1AttributeCodeList =
  typeof gs1AttributeCodeLists.$inferInsert;

/**
 * GS1 Web Vocabulary - JSON-LD classes and properties for Digital Product Passport
 */
export const gs1WebVocabulary = mysqlTable(
  "gs1_web_vocabulary",
  {
    id: int("id").autoincrement().primaryKey(),
    termUri: varchar("termUri", { length: 500 }).notNull().unique(),
    termType: mysqlEnum("termType", ["class", "property"]).notNull(),
    termName: varchar("termName", { length: 255 }).notNull(),
    label: varchar("label", { length: 500 }).notNull(),
    description: text("description"),
    domain: varchar("domain", { length: 500 }),
    range: varchar("range", { length: 500 }),
    dppRelevant: boolean("dppRelevant").default(false),
    esrsRelevant: boolean("esrsRelevant").default(false),
    eudrRelevant: boolean("eudrRelevant").default(false),
    packagingRelated: boolean("packagingRelated").default(false),
    sustainabilityRelated: boolean("sustainabilityRelated").default(false),
    isDeprecated: boolean("isDeprecated").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    termTypeIdx: index("term_type_idx").on(table.termType),
    dppRelevantIdx: index("dpp_relevant_idx").on(table.dppRelevant),
    esrsRelevantIdx: index("esrs_relevant_idx").on(table.esrsRelevant),
    eudrRelevantIdx: index("eudr_relevant_idx").on(table.eudrRelevant),
  })
);

export type GS1WebVocabularyTerm = typeof gs1WebVocabulary.$inferSelect;
export type InsertGS1WebVocabularyTerm = typeof gs1WebVocabulary.$inferInsert;

/**
 * EPCIS Event Templates - Canonical traceability event flows
 */
export const epcisEventTemplates = mysqlTable(
  "epcis_event_templates",
  {
    id: int("id").autoincrement().primaryKey(),
    templateName: varchar("templateName", { length: 255 }).notNull(),
    eventType: mysqlEnum("eventType", [
      "object",
      "aggregation",
      "transformation",
      "transaction",
      "association",
    ]).notNull(),
    useCase: varchar("useCase", { length: 255 }),
    regulationId: int("regulationId"),
    esrsDatapointId: int("esrsDatapointId"),
    eventSchema: json("eventSchema").$type<Record<string, any>>().notNull(),
    cbvVocabulary: json("cbvVocabulary").$type<Record<string, any>>(),
    description: text("description"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    useCaseIdx: index("use_case_idx").on(table.useCase),
    regulationIdIdx: index("regulation_id_idx").on(table.regulationId),
  })
);

export type EPCISEventTemplate = typeof epcisEventTemplates.$inferSelect;
export type InsertEPCISEventTemplate = typeof epcisEventTemplates.$inferInsert;

/**
 * Attribute-to-Regulation Mappings - Links GS1 attributes to regulatory requirements
 */
export const attributeRegulationMappings = mysqlTable(
  "attribute_regulation_mappings",
  {
    id: int("id").autoincrement().primaryKey(),
    attributeId: int("attributeId").notNull(),
    regulationId: int("regulationId").notNull(),
    esrsDatapointId: int("esrsDatapointId"),
    mappingReason: text("mappingReason"),
    relevanceScore: decimal("relevanceScore", {
      precision: 3,
      scale: 2,
    }).default("0.00"),
    verifiedByAdmin: boolean("verifiedByAdmin").default(false),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    attributeIdIdx: index("attribute_id_idx").on(table.attributeId),
    regulationIdIdx: index("regulation_id_idx").on(table.regulationId),
  })
);

export type AttributeRegulationMapping =
  typeof attributeRegulationMappings.$inferSelect;
export type InsertAttributeRegulationMapping =
  typeof attributeRegulationMappings.$inferInsert;

/**
 * ESG Hub News History - Archive for news items older than 200 days
 * Keeps main hubNews table lean while preserving historical data
 */
export const hubNewsHistory = mysqlTable(
  "hub_news_history",
  {
    id: int("id").autoincrement().primaryKey(),
    originalId: int("originalId").notNull(), // Reference to original hubNews id
    title: varchar("title", { length: 512 }).notNull(),
    summary: text("summary"),
    content: text("content"),
    newsType: mysqlEnum("newsType", [
      "NEW_LAW",
      "AMENDMENT",
      "ENFORCEMENT",
      "COURT_DECISION",
      "GUIDANCE",
      "PROPOSAL",
    ]).notNull(),
    relatedRegulationIds: json("relatedRegulationIds"),
    regulationTags: json("regulationTags").$type<string[]>(),
    impactLevel: mysqlEnum("impactLevel", ["LOW", "MEDIUM", "HIGH"]).default(
      "MEDIUM"
    ),
    sourceUrl: varchar("sourceUrl", { length: 512 }),
    sourceTitle: varchar("sourceTitle", { length: 255 }),
    sourceType: mysqlEnum("sourceType", [
      "EU_OFFICIAL",
      "GS1_OFFICIAL",
      "DUTCH_NATIONAL",
      "INDUSTRY",
      "MEDIA",
    ]).default("EU_OFFICIAL"),
    sources:
      json("sources").$type<
        Array<{ name: string; type: string; url: string }>
      >(), // Multi-source attribution for deduplicated news
    credibilityScore: decimal("credibilityScore", {
      precision: 3,
      scale: 2,
    }).default("0.00"),

    // GS1-specific fields for enhanced intelligence
    gs1ImpactTags: json("gs1ImpactTags").$type<string[]>(), // IDENTIFICATION, PACKAGING_ATTRIBUTES, ESG_REPORTING, DUE_DILIGENCE, TRACEABILITY, DPP, etc.
    sectorTags: json("sectorTags").$type<string[]>(), // RETAIL, HEALTHCARE, FOOD, LOGISTICS, DIY, CONSTRUCTION, TEXTILES, etc.
    relatedStandardIds: json("relatedStandardIds").$type<string[]>(), // Direct linkage to GS1 standards (gtin, gln, epcis, gdsn, digital-link, etc.)
    gs1ImpactAnalysis: text("gs1ImpactAnalysis"), // AI-generated analysis of GS1 relevance and impact
    suggestedActions: json("suggestedActions").$type<string[]>(), // Actionable next steps for GS1 NL members

    publishedDate: timestamp("publishedDate"),
    retrievedAt: timestamp("retrievedAt").notNull(),
    isAutomated: boolean("isAutomated").default(false),
    archivedAt: timestamp("archivedAt").defaultNow().notNull(), // when moved to history
    originalCreatedAt: timestamp("originalCreatedAt").notNull(),
    originalUpdatedAt: timestamp("originalUpdatedAt").notNull(),
  },
  table => ({
    originalIdIdx: index("originalId_idx").on(table.originalId),
    publishedDateIdx: index("publishedDate_idx").on(table.publishedDate),
    archivedAtIdx: index("archivedAt_idx").on(table.archivedAt),
  })
);

export type HubNewsHistory = typeof hubNewsHistory.$inferSelect;
export type InsertHubNewsHistory = typeof hubNewsHistory.$inferInsert;

/**
 * News Recommendations - AI-generated links between news and internal resources
 */
export const newsRecommendations = mysqlTable("news_recommendations", {
  id: int("id").primaryKey().autoincrement(),
  newsId: int("news_id").notNull(),
  resourceType: varchar("resource_type", { length: 50 }).notNull(),
  resourceId: int("resource_id").notNull(),
  resourceTitle: varchar("resource_title", { length: 512 }),
  relevanceScore: decimal("relevance_score", {
    precision: 3,
    scale: 2,
  }).notNull(),
  reasoning: text("reasoning"),
  matchedKeywords: text("matched_keywords"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type NewsRecommendation = typeof newsRecommendations.$inferSelect;
export type InsertNewsRecommendation = typeof newsRecommendations.$inferInsert;

// ============================================================================
// INGEST-02: GDSN Current v3.1.32 Tables
// ============================================================================

/**
 * Raw GDSN Classes - 1:1 staging table
 */
export const rawGdsnClasses = mysqlTable(
  "raw_gdsn_classes",
  {
    id: int("id").primaryKey(), // Use source id directly
    name: varchar("name", { length: 255 }).notNull(),
    definition: text("definition"),
    type: int("type"), // 1=String, 2=Boolean, 3=Integer, 4=Enum, etc.
    extensions: json("extensions").$type<unknown[]>(),
    rawJson: json("raw_json").$type<unknown>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    nameIndex: index("idx_raw_gdsn_class_name").on(table.name),
  })
);

export type RawGdsnClass = typeof rawGdsnClasses.$inferSelect;
export type InsertRawGdsnClass = typeof rawGdsnClasses.$inferInsert;

/**
 * Canonical GDSN Classes table
 */
export const gdsnClasses = mysqlTable(
  "gdsn_classes",
  {
    id: int("id").primaryKey(), // Use source id directly
    name: varchar("name", { length: 255 }).notNull(),
    definition: text("definition"),
    type: int("type"),
    extensions: json("extensions").$type<unknown[]>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    nameIndex: index("idx_gdsn_class_name").on(table.name),
  })
);

export type GdsnClass = typeof gdsnClasses.$inferSelect;
export type InsertGdsnClass = typeof gdsnClasses.$inferInsert;

/**
 * Raw GDSN Class Attributes - 1:1 staging table
 */
export const rawGdsnClassAttributes = mysqlTable(
  "raw_gdsn_class_attributes",
  {
    id: int("id").autoincrement().primaryKey(),
    classId: int("class_id").notNull(),
    attributeCode: varchar("attribute_code", { length: 255 }).notNull(),
    attributeName: varchar("attribute_name", { length: 255 }),
    dataType: varchar("data_type", { length: 50 }),
    required: boolean("required").default(false),
    rawJson: json("raw_json").$type<unknown>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    classIdIndex: index("idx_raw_gdsn_attr_class").on(table.classId),
    attrCodeIndex: index("idx_raw_gdsn_attr_code").on(table.attributeCode),
  })
);

export type RawGdsnClassAttribute = typeof rawGdsnClassAttributes.$inferSelect;
export type InsertRawGdsnClassAttribute = typeof rawGdsnClassAttributes.$inferInsert;

/**
 * Canonical GDSN Class Attributes table
 */
export const gdsnClassAttributes = mysqlTable(
  "gdsn_class_attributes",
  {
    id: int("id").autoincrement().primaryKey(),
    classId: int("class_id").notNull(),
    attributeCode: varchar("attribute_code", { length: 255 }).notNull(),
    attributeName: varchar("attribute_name", { length: 255 }),
    dataType: varchar("data_type", { length: 50 }),
    required: boolean("required").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    classIdIndex: index("idx_gdsn_attr_class").on(table.classId),
    attrCodeIndex: index("idx_gdsn_attr_code").on(table.attributeCode),
    uniqueClassAttr: index("unique_class_attr_idx").on(table.classId, table.attributeCode),
  })
);

export type GdsnClassAttribute = typeof gdsnClassAttributes.$inferSelect;
export type InsertGdsnClassAttribute = typeof gdsnClassAttributes.$inferInsert;

/**
 * Raw GDSN Validation Rules - 1:1 staging table
 */
export const rawGdsnValidationRules = mysqlTable(
  "raw_gdsn_validation_rules",
  {
    id: int("id").autoincrement().primaryKey(),
    ruleId: varchar("rule_id", { length: 255 }).notNull(),
    classId: int("class_id"),
    attributeCode: varchar("attribute_code", { length: 255 }),
    ruleType: varchar("rule_type", { length: 50 }),
    ruleExpression: text("rule_expression"),
    errorMessage: text("error_message"),
    rawJson: json("raw_json").$type<unknown>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    ruleIdIndex: index("idx_raw_gdsn_rule_id").on(table.ruleId),
    classIdIndex: index("idx_raw_gdsn_rule_class").on(table.classId),
  })
);

export type RawGdsnValidationRule = typeof rawGdsnValidationRules.$inferSelect;
export type InsertRawGdsnValidationRule = typeof rawGdsnValidationRules.$inferInsert;

/**
 * Canonical GDSN Validation Rules table
 */
export const gdsnValidationRules = mysqlTable(
  "gdsn_validation_rules",
  {
    id: int("id").autoincrement().primaryKey(),
    ruleId: varchar("rule_id", { length: 255 }).notNull().unique(),
    classId: int("class_id"),
    attributeCode: varchar("attribute_code", { length: 255 }),
    ruleType: varchar("rule_type", { length: 50 }),
    ruleExpression: text("rule_expression"),
    errorMessage: text("error_message"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    ruleIdIndex: index("idx_gdsn_rule_id").on(table.ruleId),
    classIdIndex: index("idx_gdsn_rule_class").on(table.classId),
    attrCodeIndex: index("idx_gdsn_rule_attr").on(table.attributeCode),
  })
);

export type GdsnValidationRule = typeof gdsnValidationRules.$inferSelect;
export type InsertGdsnValidationRule = typeof gdsnValidationRules.$inferInsert;

// ============================================================================
// INGEST-04: CTEs and KDEs Tables
// ============================================================================

/**
 * Raw CTEs and KDEs - 1:1 staging table
 */
export const rawCtesKdes = mysqlTable(
  "raw_ctes_kdes",
  {
    id: int("id").autoincrement().primaryKey(),
    rawJson: json("raw_json").$type<unknown>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  }
);

export type RawCteKde = typeof rawCtesKdes.$inferSelect;
export type InsertRawCteKde = typeof rawCtesKdes.$inferInsert;

/**
 * Critical Tracking Events (CTEs)
 */
export const ctes = mysqlTable(
  "ctes",
  {
    id: int("id").autoincrement().primaryKey(),
    code: varchar("code", { length: 100 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 100 }),
    regulationContext: varchar("regulation_context", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    codeIndex: index("idx_cte_code").on(table.code),
    categoryIndex: index("idx_cte_category").on(table.category),
  })
);

export type Cte = typeof ctes.$inferSelect;
export type InsertCte = typeof ctes.$inferInsert;

/**
 * Key Data Elements (KDEs)
 */
export const kdes = mysqlTable(
  "kdes",
  {
    id: int("id").autoincrement().primaryKey(),
    code: varchar("code", { length: 100 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    dataType: varchar("data_type", { length: 50 }),
    mandatory: boolean("mandatory").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    codeIndex: index("idx_kde_code").on(table.code),
  })
);

export type Kde = typeof kdes.$inferSelect;
export type InsertKde = typeof kdes.$inferInsert;

/**
 * CTE to KDE Mappings (many-to-many)
 */
export const cteKdeMappings = mysqlTable(
  "cte_kde_mappings",
  {
    id: int("id").autoincrement().primaryKey(),
    cteId: int("cte_id").notNull(),
    kdeId: int("kde_id").notNull(),
    required: boolean("required").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    cteIdIndex: index("idx_cte_kde_cte").on(table.cteId),
    kdeIdIndex: index("idx_cte_kde_kde").on(table.kdeId),
    uniqueMapping: index("unique_cte_kde_idx").on(table.cteId, table.kdeId),
  })
);

export type CteKdeMapping = typeof cteKdeMappings.$inferSelect;
export type InsertCteKdeMapping = typeof cteKdeMappings.$inferInsert;

// ============================================================================
// INGEST-05: DPP Identification Rules Tables
// ============================================================================

/**
 * Raw DPP Identifier Components - 1:1 staging table
 */
export const rawDppIdentifierComponents = mysqlTable(
  "raw_dpp_identifier_components",
  {
    id: int("id").autoincrement().primaryKey(),
    rawJson: json("raw_json").$type<unknown>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  }
);

export type RawDppIdentifierComponent = typeof rawDppIdentifierComponents.$inferSelect;
export type InsertRawDppIdentifierComponent = typeof rawDppIdentifierComponents.$inferInsert;

/**
 * DPP Identifier Components (GTIN, GLN, SSCC, etc.)
 */
export const dppIdentifierComponents = mysqlTable(
  "dpp_identifier_components",
  {
    id: int("id").autoincrement().primaryKey(),
    componentCode: varchar("component_code", { length: 50 }).notNull().unique(),
    componentName: varchar("component_name", { length: 255 }).notNull(),
    description: text("description"),
    gs1Standard: varchar("gs1_standard", { length: 100 }),
    format: varchar("format", { length: 100 }),
    example: varchar("example", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    codeIndex: index("idx_dpp_comp_code").on(table.componentCode),
  })
);

export type DppIdentifierComponent = typeof dppIdentifierComponents.$inferSelect;
export type InsertDppIdentifierComponent = typeof dppIdentifierComponents.$inferInsert;

/**
 * Raw DPP Identification Rules - 1:1 staging table
 */
export const rawDppIdentificationRules = mysqlTable(
  "raw_dpp_identification_rules",
  {
    id: int("id").autoincrement().primaryKey(),
    rawJson: json("raw_json").$type<unknown>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  }
);

export type RawDppIdentificationRule = typeof rawDppIdentificationRules.$inferSelect;
export type InsertRawDppIdentificationRule = typeof rawDppIdentificationRules.$inferInsert;

/**
 * DPP Identification Rules by product category
 */
export const dppIdentificationRules = mysqlTable(
  "dpp_identification_rules",
  {
    id: int("id").autoincrement().primaryKey(),
    ruleCode: varchar("rule_code", { length: 100 }).notNull().unique(),
    productCategory: varchar("product_category", { length: 255 }).notNull(),
    requiredComponents: json("required_components").$type<string[]>(),
    optionalComponents: json("optional_components").$type<string[]>(),
    description: text("description"),
    regulationContext: varchar("regulation_context", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    ruleCodeIndex: index("idx_dpp_rule_code").on(table.ruleCode),
    categoryIndex: index("idx_dpp_rule_category").on(table.productCategory),
  })
);

export type DppIdentificationRule = typeof dppIdentificationRules.$inferSelect;
export type InsertDppIdentificationRule = typeof dppIdentificationRules.$inferInsert;

// ============================================================================
// INGEST-06: CBV Vocabularies & Digital Link Types Tables
// ============================================================================

/**
 * Raw CBV Vocabularies - 1:1 staging table
 */
export const rawCbvVocabularies = mysqlTable(
  "raw_cbv_vocabularies",
  {
    id: int("id").autoincrement().primaryKey(),
    rawJson: json("raw_json").$type<unknown>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  }
);

export type RawCbvVocabulary = typeof rawCbvVocabularies.$inferSelect;
export type InsertRawCbvVocabulary = typeof rawCbvVocabularies.$inferInsert;

/**
 * CBV Vocabularies (BizSteps, Dispositions, etc.)
 */
export const cbvVocabularies = mysqlTable(
  "cbv_vocabularies",
  {
    id: int("id").autoincrement().primaryKey(),
    vocabularyType: varchar("vocabulary_type", { length: 100 }).notNull(),
    code: varchar("code", { length: 255 }).notNull(),
    label: varchar("label", { length: 255 }).notNull(),
    definition: text("definition"),
    regulationRelevance: json("regulation_relevance").$type<string[]>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    typeIndex: index("idx_cbv_type").on(table.vocabularyType),
    codeIndex: index("idx_cbv_code").on(table.code),
    uniqueTypeCode: index("unique_cbv_type_code_idx").on(table.vocabularyType, table.code),
  })
);

export type CbvVocabulary = typeof cbvVocabularies.$inferSelect;
export type InsertCbvVocabulary = typeof cbvVocabularies.$inferInsert;

/**
 * Raw Digital Link Types - 1:1 staging table
 */
export const rawDigitalLinkTypes = mysqlTable(
  "raw_digital_link_types",
  {
    id: int("id").autoincrement().primaryKey(),
    rawJson: json("raw_json").$type<unknown>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  }
);

export type RawDigitalLinkType = typeof rawDigitalLinkTypes.$inferSelect;
export type InsertRawDigitalLinkType = typeof rawDigitalLinkTypes.$inferInsert;

/**
 * Digital Link Types (relationship types for semantic web linking)
 */
export const digitalLinkTypes = mysqlTable(
  "digital_link_types",
  {
    id: int("id").autoincrement().primaryKey(),
    linkType: varchar("link_type", { length: 100 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    gs1Curie: varchar("gs1_curie", { length: 100 }),
    schemaOrgEquivalent: varchar("schema_org_equivalent", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    linkTypeIndex: index("idx_digital_link_type").on(table.linkType),
  })
);

export type DigitalLinkType = typeof digitalLinkTypes.$inferSelect;
export type InsertDigitalLinkType = typeof digitalLinkTypes.$inferInsert;

/**
 * GS1 NL/Benelux Validation Rules
 * Stores data quality constraints and business rules for GS1 attributes
 */
export const gs1ValidationRules = mysqlTable(
  "gs1_validation_rules",
  {
    id: int("id").autoincrement().primaryKey(),
    ruleId: varchar("ruleId", { length: 50 }).notNull(),
    ruleIdBelu: varchar("ruleIdBelu", { length: 50 }),
    ruleType: mysqlEnum("ruleType", [
      "benelux",
      "gdsn",
      "local",
    ]).notNull(),
    errorMessageDutch: text("errorMessageDutch"),
    errorMessageEnglish: text("errorMessageEnglish"),
    severity: mysqlEnum("severity", ["error", "warning", "info"]).default("error"),
    targetMarkets: text("targetMarkets"), // JSON array of market codes
    targetSectors: text("targetSectors"), // JSON array of sector codes
    affectedAttributes: text("affectedAttributes"), // JSON array of attribute codes
    validationLogic: text("validationLogic"), // Description or algorithm
    addedInVersion: varchar("addedInVersion", { length: 20 }),
    changeType: mysqlEnum("changeType", ["new", "technical", "textual", "delete"]),
    isActive: boolean("isActive").default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  table => ({
    ruleIdIdx: index("rule_id_idx").on(table.ruleId),
    ruleTypeIdx: index("rule_type_idx").on(table.ruleType),
    activeIdx: index("active_idx").on(table.isActive),
  })
);

export type GS1ValidationRule = typeof gs1ValidationRules.$inferSelect;
export type InsertGS1ValidationRule = typeof gs1ValidationRules.$inferInsert;

/**
 * GS1 NL Local Code Lists
 * Stores Dutch-specific code list values referenced by validation rules
 */
export const gs1LocalCodeLists = mysqlTable(
  "gs1_local_code_lists",
  {
    id: int("id").autoincrement().primaryKey(),
    validationRuleId: varchar("validationRuleId", { length: 50 }).notNull(),
    codeListName: varchar("codeListName", { length: 255 }).notNull(),
    codeValue: varchar("codeValue", { length: 255 }).notNull(),
    codeDescription: text("codeDescription"),
    codeListSegment: varchar("codeListSegment", { length: 255 }),
    addedInVersion: varchar("addedInVersion", { length: 20 }),
    isActive: boolean("isActive").default(true),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  table => ({
    ruleIdIdx: index("lcl_rule_id_idx").on(table.validationRuleId),
    codeListIdx: index("lcl_code_list_idx").on(table.codeListName),
    activeIdx: index("lcl_active_idx").on(table.isActive),
  })
);

export type GS1LocalCodeList = typeof gs1LocalCodeLists.$inferSelect;
export type InsertGS1LocalCodeList = typeof gs1LocalCodeLists.$inferInsert;
