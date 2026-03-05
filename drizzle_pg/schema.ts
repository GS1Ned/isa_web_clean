import {
  pgEnum,
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  jsonb,
  boolean,
  numeric,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// ---------------------------------------------------------------------------
// Shared enums
// ---------------------------------------------------------------------------

const sourceTypeEnum = pgEnum("source_type", [
  "eu_regulation",
  "eu_directive",
  "gs1_global_standard",
  "gs1_regional_standard",
  "gs1_datamodel",
  "official_guidance",
  "industry_standard",
  "news_article",
  "third_party_analysis",
]);

const sourceStatusEnum = pgEnum("source_status", [
  "draft",
  "active",
  "superseded",
  "deprecated",
  "archived",
]);

const sourceVerificationStatusEnum = pgEnum("source_verification_status", [
  "pending",
  "verified",
  "stale",
  "failed",
]);

const chunkTypeEnum = pgEnum("chunk_type", [
  "article",
  "section",
  "paragraph",
  "table",
  "definition",
  "requirement",
  "guidance",
  "example",
  "full_document",
]);

const ragVerificationStatusEnum = pgEnum("rag_verification_status", [
  "pending",
  "verified",
  "failed",
  "skipped",
]);

const embeddingSourceTypeEnum = pgEnum("embedding_source_type", [
  "regulation",
  "standard",
  "esrs_datapoint",
  "dutch_initiative",
  "esrs_gs1_mapping",
]);

const regulationTypeEnum = pgEnum("regulation_type", [
  "CSRD",
  "ESRS",
  "DPP",
  "EUDR",
  "ESPR",
  "PPWR",
  "EU_TAXONOMY",
  "OTHER",
]);

const gs1SectorEnum = pgEnum("gs1_sector", [
  "food_hb",
  "diy_garden_pet",
  "healthcare",
  "agriculture",
]);

const gs1DatatypeEnum = pgEnum("gs1_datatype", [
  "text",
  "number",
  "boolean",
  "date",
  "code_list",
  "url",
  "other",
]);

const gs1MappingLevelEnum = pgEnum("gs1_mapping_level", ["product", "company"]);

const advisoryReportTypeEnum = pgEnum("advisory_report_type", [
  "COMPLIANCE_ASSESSMENT",
  "STANDARDS_MAPPING",
  "REGULATION_IMPACT",
  "IMPLEMENTATION_GUIDE",
  "GAP_ANALYSIS",
  "SECTOR_ADVISORY",
  "CUSTOM",
]);

const advisoryReviewStatusEnum = pgEnum("advisory_review_status", [
  "DRAFT",
  "UNDER_REVIEW",
  "APPROVED",
  "PUBLISHED",
  "ARCHIVED",
]);

const advisoryPublicationStatusEnum = pgEnum("advisory_publication_status", [
  "INTERNAL_ONLY",
  "READY_FOR_PUBLICATION",
  "PUBLISHED",
  "WITHDRAWN",
]);

const advisoryLaneStatusEnum = pgEnum("advisory_lane_status", [
  "LANE_A",
  "LANE_B",
  "LANE_C",
]);

// ---------------------------------------------------------------------------
// Ask ISA / Knowledge Base subset
// ---------------------------------------------------------------------------

export const sources = pgTable(
  "sources",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 512 }).notNull(),
    acronym: varchar("acronym", { length: 64 }),
    externalId: varchar("external_id", { length: 255 }),
    sourceType: sourceTypeEnum("source_type").notNull(),
    authorityLevel: integer("authority_level").notNull(),
    authorityTier: varchar("authority_tier", { length: 64 }),
    licenseType: varchar("license_type", { length: 64 }),
    publicationStatus: varchar("publication_status", { length: 64 }),
    immutableUri: varchar("immutable_uri", { length: 1024 }),
    publisher: varchar("publisher", { length: 255 }),
    publisherUrl: varchar("publisher_url", { length: 512 }),
    version: varchar("version", { length: 64 }),
    publicationDate: timestamp("publication_date", {
      withTimezone: true,
      mode: "string",
    }),
    effectiveDate: timestamp("effective_date", {
      withTimezone: true,
      mode: "string",
    }),
    expirationDate: timestamp("expiration_date", {
      withTimezone: true,
      mode: "string",
    }),
    officialUrl: varchar("official_url", { length: 1024 }),
    archiveUrl: varchar("archive_url", { length: 1024 }),
    status: sourceStatusEnum("status").default("active").notNull(),
    supersededBy: integer("superseded_by"),
    ingestionDate: timestamp("ingestion_date", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
    lastVerifiedDate: timestamp("last_verified_date", {
      withTimezone: true,
      mode: "string",
    }),
    verificationStatus: sourceVerificationStatusEnum("verification_status")
      .default("pending")
      .notNull(),
    description: text("description"),
    sector: varchar("sector", { length: 128 }),
    language: varchar("language", { length: 8 }).default("en"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    createdBy: varchar("created_by", { length: 255 }),
  },
  (table) => [
    index("sources_source_type_idx").on(table.sourceType),
    index("sources_authority_level_idx").on(table.authorityLevel),
    index("sources_status_idx").on(table.status),
    index("sources_sector_idx").on(table.sector),
    index("sources_publication_date_idx").on(table.publicationDate),
    uniqueIndex("sources_external_id_uq").on(table.externalId),
  ]
);

export const sourceChunks = pgTable(
  "source_chunks",
  {
    id: serial("id").primaryKey(),
    sourceId: integer("source_id")
      .references(() => sources.id, { onDelete: "cascade" })
      .notNull(),
    chunkIndex: integer("chunk_index").notNull(),
    chunkType: chunkTypeEnum("chunk_type").default("paragraph").notNull(),
    sectionPath: varchar("section_path", { length: 512 }),
    heading: varchar("heading", { length: 512 }),
    content: text("content").notNull(),
    contentHash: varchar("content_hash", { length: 64 }).notNull(),
    charStart: integer("char_start"),
    charEnd: integer("char_end"),
    embedding: jsonb("embedding"),
    embeddingModel: varchar("embedding_model", { length: 64 }),
    embeddingGeneratedAt: timestamp("embedding_generated_at", {
      withTimezone: true,
      mode: "string",
    }),
    version: varchar("version", { length: 64 }),
    isActive: boolean("is_active").default(true).notNull(),
    deprecatedAt: timestamp("deprecated_at", {
      withTimezone: true,
      mode: "string",
    }),
    deprecationReason: text("deprecation_reason"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("source_chunks_source_id_idx").on(table.sourceId),
    index("source_chunks_chunk_type_idx").on(table.chunkType),
    index("source_chunks_content_hash_idx").on(table.contentHash),
    index("source_chunks_is_active_idx").on(table.isActive),
    uniqueIndex("source_chunks_source_chunk_uq").on(table.sourceId, table.chunkIndex),
  ]
);

export const ragTraces = pgTable(
  "rag_traces",
  {
    id: serial("id").primaryKey(),
    traceId: varchar("trace_id", { length: 64 }).notNull(),
    conversationId: integer("conversation_id"),
    userId: integer("user_id"),
    query: text("query").notNull(),
    queryEmbedding: jsonb("query_embedding"),
    queryLanguage: varchar("query_language", { length: 8 }),
    sectorFilter: varchar("sector_filter", { length: 64 }),
    retrievedChunkIds: jsonb("retrieved_chunk_ids"),
    retrievalScores: jsonb("retrieval_scores"),
    rerankScores: jsonb("rerank_scores"),
    selectedChunkIds: jsonb("selected_chunk_ids"),
    selectedSpans: jsonb("selected_spans"),
    extractedClaims: jsonb("extracted_claims"),
    generatedAnswer: text("generated_answer"),
    citations: jsonb("citations"),
    confidenceScore: numeric("confidence_score", { precision: 3, scale: 2 }),
    citationPrecision: numeric("citation_precision", { precision: 3, scale: 2 }),
    abstained: boolean("abstained").default(false).notNull(),
    abstentionReason: text("abstention_reason"),
    verificationStatus: ragVerificationStatusEnum("verification_status")
      .default("pending")
      .notNull(),
    verificationDetails: jsonb("verification_details"),
    totalLatencyMs: integer("total_latency_ms"),
    retrievalLatencyMs: integer("retrieval_latency_ms"),
    generationLatencyMs: integer("generation_latency_ms"),
    llmModel: varchar("llm_model", { length: 128 }),
    embeddingModel: varchar("embedding_model", { length: 128 }),
    promptVersion: varchar("prompt_version", { length: 64 }),
    cacheHit: boolean("cache_hit").default(false).notNull(),
    cacheKey: varchar("cache_key", { length: 64 }),
    feedbackId: integer("feedback_id"),
    errorOccurred: boolean("error_occurred").default(false).notNull(),
    errorMessage: text("error_message"),
    errorStack: text("error_stack"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("rag_traces_trace_id_idx").on(table.traceId),
    index("rag_traces_conversation_id_idx").on(table.conversationId),
    index("rag_traces_user_id_idx").on(table.userId),
    index("rag_traces_created_at_idx").on(table.createdAt),
    index("rag_traces_verification_status_idx").on(table.verificationStatus),
    index("rag_traces_abstained_idx").on(table.abstained),
    index("rag_traces_error_occurred_idx").on(table.errorOccurred),
  ]
);

export const knowledgeEmbeddings = pgTable(
  "knowledge_embeddings",
  {
    id: serial("id").primaryKey(),
    sourceType: embeddingSourceTypeEnum("source_type").notNull(),
    sourceId: integer("source_id").notNull(),
    content: text("content").notNull(),
    contentHash: varchar("content_hash", { length: 64 }).notNull(),
    embedding: jsonb("embedding").notNull(),
    embeddingModel: varchar("embedding_model", { length: 64 })
      .default("text-embedding-3-small")
      .notNull(),
    title: varchar("title", { length: 512 }).notNull(),
    url: varchar("url", { length: 512 }),
    datasetId: varchar("dataset_id", { length: 255 }),
    datasetVersion: varchar("dataset_version", { length: 64 }),
    lastVerifiedDate: timestamp("last_verified_date", {
      withTimezone: true,
      mode: "string",
    }),
    isDeprecated: boolean("is_deprecated").default(false).notNull(),
    deprecationReason: text("deprecation_reason"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("knowledge_embeddings_source_type_idx").on(table.sourceType),
    index("knowledge_embeddings_source_id_idx").on(table.sourceId),
    index("knowledge_embeddings_content_hash_idx").on(table.contentHash),
    index("knowledge_embeddings_source_composite_idx").on(table.sourceType, table.sourceId),
  ]
);

// ---------------------------------------------------------------------------
// ESRS Mapping subset
// ---------------------------------------------------------------------------

export const regulations = pgTable(
  "regulations",
  {
    id: serial("id").primaryKey(),
    celexId: varchar("celex_id", { length: 64 }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    regulationType: regulationTypeEnum("regulation_type").notNull(),
    effectiveDate: timestamp("effective_date", {
      withTimezone: true,
      mode: "string",
    }),
    sourceUrl: varchar("source_url", { length: 512 }),
    lastUpdated: timestamp("last_updated", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    embedding: jsonb("embedding"),
    needsVerification: boolean("needs_verification").default(false),
  },
  (table) => [uniqueIndex("regulations_celex_id_uq").on(table.celexId)]
);

export const esrsDatapoints = pgTable(
  "esrs_datapoints",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 100 }).notNull(),
    esrsStandard: varchar("esrs_standard", { length: 50 }),
    disclosureRequirement: varchar("disclosure_requirement", { length: 100 }),
    paragraph: varchar("paragraph", { length: 100 }),
    relatedAr: varchar("related_ar", { length: 100 }),
    name: text("name").notNull(),
    dataType: varchar("data_type", { length: 50 }),
    conditional: boolean("conditional").default(false),
    voluntary: boolean("voluntary").default(false),
    sfdrMapping: varchar("sfdr_mapping", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("esrs_datapoints_code_idx").on(table.code),
    index("esrs_datapoints_standard_idx").on(table.esrsStandard),
  ]
);

export const gs1Attributes = pgTable(
  "gs1_attributes",
  {
    id: serial("id").primaryKey(),
    attributeCode: varchar("attribute_code", { length: 100 }).notNull(),
    attributeName: varchar("attribute_name", { length: 255 }).notNull(),
    sector: gs1SectorEnum("sector").notNull(),
    description: text("description"),
    datatype: gs1DatatypeEnum("datatype").notNull(),
    codeListId: integer("code_list_id"),
    isMandatory: boolean("is_mandatory").default(false),
    esrsRelevance: text("esrs_relevance"),
    dppRelevance: text("dpp_relevance"),
    packagingRelated: boolean("packaging_related").default(false),
    sustainabilityRelated: boolean("sustainability_related").default(false),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("gs1_attributes_sector_idx").on(table.sector),
    index("gs1_attributes_packaging_idx").on(table.packagingRelated),
    index("gs1_attributes_sustainability_idx").on(table.sustainabilityRelated),
  ]
);

export const gs1Standards = pgTable(
  "gs1_standards",
  {
    id: serial("id").primaryKey(),
    standardCode: varchar("standard_code", { length: 64 }).notNull(),
    standardName: varchar("standard_name", { length: 255 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 128 }),
    scope: text("scope"),
    referenceUrl: varchar("reference_url", { length: 512 }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    embedding: jsonb("embedding"),
  },
  (table) => [uniqueIndex("gs1_standards_standard_code_uq").on(table.standardCode)]
);

export const regulationEsrsMappings = pgTable(
  "regulation_esrs_mappings",
  {
    id: serial("id").primaryKey(),
    regulationId: integer("regulation_id").notNull(),
    datapointId: integer("datapoint_id").notNull(),
    relevanceScore: integer("relevance_score").default(5).notNull(),
    reasoning: text("reasoning"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("regulation_esrs_mappings_regulation_id_idx").on(table.regulationId),
    index("regulation_esrs_mappings_datapoint_id_idx").on(table.datapointId),
    uniqueIndex("regulation_esrs_mappings_regulation_datapoint_uq").on(
      table.regulationId,
      table.datapointId
    ),
  ]
);

export const gs1EsrsMappings = pgTable(
  "gs1_esrs_mappings",
  {
    mappingId: integer("mapping_id").primaryKey(),
    level: gs1MappingLevelEnum("level").notNull(),
    esrsStandard: varchar("esrs_standard", { length: 50 }).notNull(),
    esrsTopic: varchar("esrs_topic", { length: 255 }).notNull(),
    dataPointName: text("data_point_name").notNull(),
    shortName: varchar("short_name", { length: 512 }).notNull(),
    definition: text("definition").notNull(),
    gs1Relevance: text("gs1_relevance").notNull(),
    sourceDocument: varchar("source_document", { length: 255 }).default(
      "GS1 Europe CSRD White Paper v1.0"
    ),
    sourceDate: varchar("source_date", { length: 20 }).default("2025-03-21"),
    sourceAuthority: varchar("source_authority", { length: 100 }).default("GS1 in Europe"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow(),
  },
  (table) => [index("gs1_esrs_mappings_standard_idx").on(table.esrsStandard)]
);

export const mappingFeedback = pgTable(
  "mapping_feedback",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    mappingId: integer("mapping_id").notNull(),
    vote: integer("vote").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("mapping_feedback_user_id_idx").on(table.userId),
    index("mapping_feedback_mapping_id_idx").on(table.mappingId),
    uniqueIndex("mapping_feedback_user_mapping_uq").on(table.userId, table.mappingId),
  ]
);

// ---------------------------------------------------------------------------
// Advisory subset (normalized targets for hot-path filters)
// ---------------------------------------------------------------------------

export const advisoryReports = pgTable(
  "advisory_reports",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 512 }).notNull(),
    reportType: advisoryReportTypeEnum("report_type").notNull(),
    executiveSummary: text("executive_summary"),
    content: text("content").notNull(),
    findings: jsonb("findings"),
    recommendations: jsonb("recommendations"),
    targetRegulationIds: jsonb("target_regulation_ids"),
    targetStandardIds: jsonb("target_standard_ids"),
    sectorTags: jsonb("sector_tags"),
    gs1ImpactTags: jsonb("gs1_impact_tags"),
    decisionArtifacts: jsonb("decision_artifacts"),
    version: varchar("version", { length: 32 }).notNull(),
    generatedDate: timestamp("generated_date", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    generatedBy: varchar("generated_by", { length: 255 }),
    llmModel: varchar("llm_model", { length: 128 }),
    generationPrompt: text("generation_prompt"),
    qualityScore: numeric("quality_score", { precision: 3, scale: 2 }),
    reviewStatus: advisoryReviewStatusEnum("review_status").default("DRAFT").notNull(),
    reviewedBy: varchar("reviewed_by", { length: 255 }),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true, mode: "string" }),
    reviewNotes: text("review_notes"),
    publicationStatus: advisoryPublicationStatusEnum("publication_status")
      .default("INTERNAL_ONLY")
      .notNull(),
    laneStatus: advisoryLaneStatusEnum("lane_status").default("LANE_C").notNull(),
    governanceNotes: text("governance_notes"),
    viewCount: integer("view_count").default(0),
    downloadCount: integer("download_count").default(0),
    lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true, mode: "string" }),
    staleSince: timestamp("stale_since", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("advisory_reports_type_idx").on(table.reportType),
    index("advisory_reports_review_status_idx").on(table.reviewStatus),
    index("advisory_reports_publication_status_idx").on(table.publicationStatus),
    index("advisory_reports_generated_date_idx").on(table.generatedDate),
  ]
);

export const advisoryReportVersions = pgTable(
  "advisory_report_versions",
  {
    id: serial("id").primaryKey(),
    reportId: integer("report_id")
      .references(() => advisoryReports.id, { onDelete: "cascade" })
      .notNull(),
    version: varchar("version", { length: 32 }).notNull(),
    content: text("content").notNull(),
    decisionArtifacts: jsonb("decision_artifacts"),
    changeLog: text("change_log"),
    createdBy: varchar("created_by", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [index("advisory_report_versions_report_id_idx").on(table.reportId)]
);

export const advisoryReportTargetRegulations = pgTable(
  "advisory_report_target_regulations",
  {
    id: serial("id").primaryKey(),
    reportId: integer("report_id")
      .references(() => advisoryReports.id, { onDelete: "cascade" })
      .notNull(),
    regulationId: integer("regulation_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("advisory_report_target_regulations_report_regulation_uq").on(
      table.reportId,
      table.regulationId
    ),
    index("advisory_report_target_regulations_regulation_idx").on(table.regulationId),
  ]
);

export const advisoryReportTargetStandards = pgTable(
  "advisory_report_target_standards",
  {
    id: serial("id").primaryKey(),
    reportId: integer("report_id")
      .references(() => advisoryReports.id, { onDelete: "cascade" })
      .notNull(),
    standardId: integer("standard_id").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("advisory_report_target_standards_report_standard_uq").on(
      table.reportId,
      table.standardId
    ),
    index("advisory_report_target_standards_standard_idx").on(table.standardId),
  ]
);
