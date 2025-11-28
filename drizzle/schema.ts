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


/**
 * Regulation to ESRS Datapoint Mappings
 * Stores LLM-generated mappings between regulations and relevant ESRS disclosure requirements
 */
export const regulationEsrsMappings = mysqlTable("regulation_esrs_mappings", {
  id: int("id").autoincrement().primaryKey(),
  regulationId: int("regulationId").notNull(), // Foreign key to regulations table
  datapointId: int("datapointId").notNull(), // Foreign key to esrs_datapoints table
  relevanceScore: int("relevanceScore").default(5).notNull(), // 1-10 scale, how relevant is this datapoint
  reasoning: text("reasoning"), // LLM explanation of why this datapoint is relevant
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  regulationIdIdx: index("regulationId_idx").on(table.regulationId),
  datapointIdIdx: index("datapointId_idx").on(table.datapointId),
  uniqueMapping: index("unique_mapping_idx").on(table.regulationId, table.datapointId),
}));

export type RegulationEsrsMapping = typeof regulationEsrsMappings.$inferSelect;
export type InsertRegulationEsrsMapping = typeof regulationEsrsMappings.$inferInsert;


/**
 * Mapping Feedback - User validation of ESRS mapping accuracy
 * Collects thumbs up/down votes to improve LLM prompt quality
 */
export const mappingFeedback = mysqlTable("mapping_feedback", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(), // Foreign key to users table
  mappingId: int("mappingId").notNull(), // Foreign key to regulation_esrs_mappings table
  vote: boolean("vote").notNull(), // true = thumbs up, false = thumbs down
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  mappingIdIdx: index("mappingId_idx").on(table.mappingId),
  uniqueVote: index("unique_vote_idx").on(table.userId, table.mappingId), // One vote per user per mapping
}));

export type MappingFeedback = typeof mappingFeedback.$inferSelect;
export type InsertMappingFeedback = typeof mappingFeedback.$inferInsert;

/**
 * EPCIS Batch Jobs - Tracks batch processing of EPCIS files
 */
export const epciBatchJobs = mysqlTable("epcis_batch_jobs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileSize: int("fileSize").notNull(), // in bytes
  status: mysqlEnum("status", ["queued", "processing", "completed", "failed"]).default("queued").notNull(),
  totalEvents: int("totalEvents").default(0),
  processedEvents: int("processedEvents").default(0),
  failedEvents: int("failedEvents").default(0),
  errorMessage: text("errorMessage"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  statusIdx: index("status_idx").on(table.status),
  createdAtIdx: index("createdAt_idx").on(table.createdAt),
}));

export type EPCISBatchJob = typeof epciBatchJobs.$inferSelect;
export type InsertEPCISBatchJob = typeof epciBatchJobs.$inferInsert;

/**
 * Supply Chain Compliance Risks - Detected compliance issues in supply chain
 */
export const supplyChainRisks = mysqlTable("supply_chain_risks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  eventId: int("eventId").notNull(),
  nodeId: int("nodeId"),
  riskType: mysqlEnum("riskType", ["deforestation", "labor", "environmental", "traceability", "certification", "geolocation"]).notNull(),
  severity: mysqlEnum("severity", ["low", "medium", "high", "critical"]).notNull(),
  description: text("description").notNull(),
  regulationId: int("regulationId"),
  recommendedAction: text("recommendedAction"),
  isResolved: boolean("isResolved").default(false),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  eventIdIdx: index("eventId_idx").on(table.eventId),
  nodeIdIdx: index("nodeId_idx").on(table.nodeId),
  severityIdx: index("severity_idx").on(table.severity),
  riskTypeIdx: index("riskType_idx").on(table.riskType),
}));

export type SupplyChainRisk = typeof supplyChainRisks.$inferSelect;
export type InsertSupplyChainRisk = typeof supplyChainRisks.$inferInsert;

/**
 * Supply Chain Analytics - Aggregated metrics for dashboard
 */
export const supplyChainAnalytics = mysqlTable("supply_chain_analytics", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  metricDate: timestamp("metricDate").notNull(),
  totalEvents: int("totalEvents").default(0),
  totalNodes: int("totalNodes").default(0),
  totalEdges: int("totalEdges").default(0),
  highRiskNodes: int("highRiskNodes").default(0),
  averageTraceabilityScore: decimal("averageTraceabilityScore", { precision: 5, scale: 2 }),
  complianceScore: decimal("complianceScore", { precision: 5, scale: 2 }),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  metricDateIdx: index("metricDate_idx").on(table.metricDate),
}));

export type SupplyChainAnalytics = typeof supplyChainAnalytics.$inferSelect;
export type InsertSupplyChainAnalytics = typeof supplyChainAnalytics.$inferInsert;

/**
 * Risk Remediation Plans - Structured workflows for addressing compliance risks
 */
export const riskRemediationPlans = mysqlTable("risk_remediation_plans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  riskId: int("riskId").notNull(),
  status: mysqlEnum("status", ["draft", "in_progress", "completed", "cancelled"]).default("draft").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  targetCompletionDate: timestamp("targetCompletionDate"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  riskIdIdx: index("riskId_idx").on(table.riskId),
  statusIdx: index("status_idx").on(table.status),
}));

export type RiskRemediationPlan = typeof riskRemediationPlans.$inferSelect;
export type InsertRiskRemediationPlan = typeof riskRemediationPlans.$inferInsert;

/**
 * Remediation Steps - Individual action items within a remediation plan
 */
export const remediationSteps = mysqlTable("remediation_steps", {
  id: int("id").autoincrement().primaryKey(),
  planId: int("planId").notNull(),
  stepNumber: int("stepNumber").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  requiredEvidence: text("requiredEvidence"), // JSON array of evidence types
  status: mysqlEnum("status", ["pending", "in_progress", "completed", "skipped"]).default("pending").notNull(),
  assignedTo: varchar("assignedTo", { length: 255 }),
  dueDate: timestamp("dueDate"),
  completedAt: timestamp("completedAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  planIdIdx: index("planId_idx").on(table.planId),
  statusIdx: index("status_idx").on(table.status),
}));

export type RemediationStep = typeof remediationSteps.$inferSelect;
export type InsertRemediationStep = typeof remediationSteps.$inferInsert;

/**
 * Compliance Evidence - Documents and records proving remediation
 */
export const complianceEvidence = mysqlTable("compliance_evidence", {
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
  verificationStatus: mysqlEnum("verificationStatus", ["pending", "verified", "rejected"]).default("pending").notNull(),
  verifiedAt: timestamp("verifiedAt"),
  verifiedBy: varchar("verifiedBy", { length: 255 }),
  verificationNotes: text("verificationNotes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  stepIdIdx: index("stepId_idx").on(table.stepId),
  verificationStatusIdx: index("verificationStatus_idx").on(table.verificationStatus),
}));

export type ComplianceEvidence = typeof complianceEvidence.$inferSelect;
export type InsertComplianceEvidence = typeof complianceEvidence.$inferInsert;

/**
 * Remediation Templates - Pre-built workflows for common risk types
 */
export const remediationTemplates = mysqlTable("remediation_templates", {
  id: int("id").autoincrement().primaryKey(),
  riskType: varchar("riskType", { length: 128 }).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  steps: json("steps").notNull(), // JSON array of step templates
  estimatedDays: int("estimatedDays"),
  isActive: boolean("isActive").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  riskTypeIdx: index("riskType_idx").on(table.riskType),
}));

export type RemediationTemplate = typeof remediationTemplates.$inferSelect;
export type InsertRemediationTemplate = typeof remediationTemplates.$inferInsert;

/**
 * Remediation Progress - Track completion metrics
 */
export const remediationProgress = mysqlTable("remediation_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  planId: int("planId").notNull(),
  totalSteps: int("totalSteps").notNull(),
  completedSteps: int("completedSteps").default(0),
  evidenceSubmitted: int("evidenceSubmitted").default(0),
  evidenceVerified: int("evidenceVerified").default(0),
  progressPercentage: int("progressPercentage").default(0),
  lastUpdated: timestamp("lastUpdated").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  userIdIdx: index("userId_idx").on(table.userId),
  planIdIdx: index("planId_idx").on(table.planId),
}));

export type RemediationProgress = typeof remediationProgress.$inferSelect;
export type InsertRemediationProgress = typeof remediationProgress.$inferInsert;
