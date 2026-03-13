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

const qaMessageRoleEnum = pgEnum("qa_message_role", ["user", "assistant"]);

const askIsaFeedbackTypeEnum = pgEnum("ask_isa_feedback_type", [
  "positive",
  "negative",
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
    datasetId: varchar("dataset_id", { length: 255 }),
    sourceType: sourceTypeEnum("source_type").notNull(),
    authorityLevel: integer("authority_level").notNull(),
    authorityTier: varchar("authority_tier", { length: 64 }),
    sourceRole: varchar("source_role", { length: 64 }),
    licenseType: varchar("license_type", { length: 64 }),
    publicationStatus: varchar("publication_status", { length: 64 }),
    immutableUri: varchar("immutable_uri", { length: 1024 }),
    sourceLocator: varchar("source_locator", { length: 1024 }),
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
    retrievedAt: timestamp("retrieved_at", {
      withTimezone: true,
      mode: "string",
    }),
    lastVerifiedDate: timestamp("last_verified_date", {
      withTimezone: true,
      mode: "string",
    }),
    verificationStatus: sourceVerificationStatusEnum("verification_status")
      .default("pending")
      .notNull(),
    contentHash: varchar("content_hash", { length: 64 }),
    description: text("description"),
    admissionBasis: varchar("admission_basis", { length: 64 }),
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
    index("sources_dataset_id_idx").on(table.datasetId),
    index("sources_source_role_idx").on(table.sourceRole),
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

export const qaConversations = pgTable(
  "qa_conversations",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id"),
    title: varchar("title", { length: 255 }),
    messageCount: integer("message_count").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("qa_conversations_user_id_idx").on(table.userId),
    index("qa_conversations_created_at_idx").on(table.createdAt),
  ]
);

export const qaMessages = pgTable(
  "qa_messages",
  {
    id: serial("id").primaryKey(),
    conversationId: integer("conversation_id")
      .references(() => qaConversations.id, { onDelete: "cascade" })
      .notNull(),
    role: qaMessageRoleEnum("role").notNull(),
    content: text("content").notNull(),
    sources: jsonb("sources"),
    retrievedChunks: integer("retrieved_chunks"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("qa_messages_conversation_id_idx").on(table.conversationId),
    index("qa_messages_created_at_idx").on(table.createdAt),
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
    sourceChunkId: integer("source_chunk_id"),
    authorityLevel: varchar("authority_level", { length: 64 }),
    legalStatus: varchar("legal_status", { length: 64 }),
    effectiveDate: timestamp("effective_date", {
      withTimezone: true,
      mode: "string",
    }),
    expiryDate: timestamp("expiry_date", {
      withTimezone: true,
      mode: "string",
    }),
    version: varchar("version", { length: 64 }),
    sourceAuthority: varchar("source_authority", { length: 255 }),
    celexId: varchar("celex_id", { length: 64 }),
    canonicalUrl: varchar("canonical_url", { length: 512 }),
    semanticLayer: varchar("semantic_layer", { length: 64 }),
    documentType: varchar("document_type", { length: 128 }),
    parentEmbeddingId: integer("parent_embedding_id"),
    regulationId: integer("regulation_id"),
    confidenceScore: numeric("confidence_score", { precision: 5, scale: 2 }),
    lastVerifiedDate: timestamp("last_verified_date", {
      withTimezone: true,
      mode: "string",
    }),
    lastVerifiedAt: timestamp("last_verified_at", {
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
    index("knowledge_embeddings_source_chunk_id_idx").on(table.sourceChunkId),
    index("knowledge_embeddings_content_hash_idx").on(table.contentHash),
    index("knowledge_embeddings_source_composite_idx").on(table.sourceType, table.sourceId),
    index("knowledge_embeddings_authority_level_idx").on(table.authorityLevel),
    index("knowledge_embeddings_semantic_layer_idx").on(table.semanticLayer),
    index("knowledge_embeddings_source_authority_idx").on(table.sourceAuthority),
  ]
);

export const askIsaFeedback = pgTable(
  "ask_isa_feedback",
  {
    id: serial("id").primaryKey(),
    questionId: varchar("question_id", { length: 255 }).notNull(),
    userId: integer("user_id"),
    questionText: text("question_text").notNull(),
    answerText: text("answer_text").notNull(),
    feedbackType: askIsaFeedbackTypeEnum("feedback_type").notNull(),
    feedbackComment: text("feedback_comment"),
    promptVariant: varchar("prompt_variant", { length: 50 }),
    confidenceScore: numeric("confidence_score", { precision: 3, scale: 2 }),
    sourcesCount: integer("sources_count"),
    timestamp: timestamp("timestamp", { withTimezone: true, mode: "string" }).defaultNow(),
  },
  (table) => [
    index("ask_isa_feedback_question_id_idx").on(table.questionId),
    index("ask_isa_feedback_user_id_idx").on(table.userId),
    index("ask_isa_feedback_feedback_type_idx").on(table.feedbackType),
    index("ask_isa_feedback_prompt_variant_idx").on(table.promptVariant),
    index("ask_isa_feedback_timestamp_idx").on(table.timestamp),
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
    version: varchar("version", { length: 64 }),
    status: varchar("status", { length: 64 }),
    lastVerifiedAt: timestamp("last_verified_at", {
      withTimezone: true,
      mode: "string",
    }),
    parentCelexId: varchar("parent_celex_id", { length: 64 }),
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
    version: varchar("version", { length: 64 }),
    publicationDate: timestamp("publication_date", {
      withTimezone: true,
      mode: "string",
    }),
    sourceUrl: varchar("source_url", { length: 512 }),
    publisher: varchar("publisher", { length: 128 }),
    lastVerifiedAt: timestamp("last_verified_at", {
      withTimezone: true,
      mode: "string",
    }),
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

// ---------------------------------------------------------------------------
// Platform tables (users, contacts, preferences, alerts)
// ---------------------------------------------------------------------------

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    openId: varchar("open_id", { length: 64 }).notNull(),
    name: text("name"),
    email: varchar("email", { length: 320 }),
    loginMethod: varchar("login_method", { length: 64 }),
    role: varchar("role", { length: 10 }).notNull().default("user"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    lastSignedIn: timestamp("last_signed_in", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("users_open_id_unique").on(table.openId),
  ]
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const contacts = pgTable(
  "contacts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 320 }),
    company: varchar("company", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  }
);

export const userPreferences = pgTable(
  "user_preferences",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id).notNull(),
    preferenceKey: varchar("preference_key", { length: 128 }).notNull(),
    preferenceValue: text("preference_value"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("user_preferences_user_key_uq").on(table.userId, table.preferenceKey),
  ]
);

export const userAlerts = pgTable(
  "user_alerts",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id).notNull(),
    alertType: varchar("alert_type", { length: 64 }).notNull(),
    title: varchar("title", { length: 512 }).notNull(),
    content: text("content"),
    isRead: boolean("is_read").default(false).notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("user_alerts_user_idx").on(table.userId),
  ]
);

export const userAnalyses = pgTable(
  "user_analyses",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").references(() => users.id).notNull(),
    analysisType: varchar("analysis_type", { length: 64 }).notNull(),
    title: varchar("title", { length: 512 }),
    inputData: jsonb("input_data"),
    resultData: jsonb("result_data"),
    status: varchar("status", { length: 32 }).default("pending").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("user_analyses_user_idx").on(table.userId),
  ]
);

export const hubNews = pgTable(
  "hub_news",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 512 }).notNull(),
    summary: text("summary"),
    content: text("content"),
    sourceUrl: varchar("source_url", { length: 2048 }),
    sourceName: varchar("source_name", { length: 255 }),
    category: varchar("category", { length: 64 }),
    tags: jsonb("tags"),
    publishedAt: timestamp("published_at", { withTimezone: true, mode: "string" }),
    // MySQL-compatible columns (camelCase in DB from earlier migration)
    newsType: varchar("newsType", { length: 64 }),
    relatedRegulationIds: jsonb("relatedRegulationIds"),
    sourceTitle: varchar("sourceTitle", { length: 255 }),
    credibilityScore: numeric("credibilityScore", { precision: 3, scale: 2 }),
    gs1ImpactTags: jsonb("gs1ImpactTags"),
    sectorTags: jsonb("sectorTags"),
    relatedStandardIds: jsonb("relatedStandardIds"),
    gs1ImpactAnalysis: text("gs1ImpactAnalysis"),
    suggestedActions: jsonb("suggestedActions"),
    publishedDate: timestamp("publishedDate", { withTimezone: true, mode: "string" }),
    regulationTags: jsonb("regulationTags"),
    impactLevel: varchar("impactLevel", { length: 32 }),
    sourceType: varchar("sourceType", { length: 64 }),
    retrievedAt: timestamp("retrievedAt", { withTimezone: true, mode: "string" }),
    isAutomated: integer("isAutomated"),
    sources: jsonb("sources"),
    regulatoryState: varchar("regulatory_state", { length: 64 }),
    isNegativeSignal: integer("is_negative_signal"),
    confidenceLevel: numeric("confidence_level", { precision: 3, scale: 2 }),
    negativeSignalKeywords: jsonb("negative_signal_keywords"),
    regulatoryEventId: integer("regulatoryEventId"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  }
);

export const regulatoryChangeAlerts = pgTable(
  "regulatory_change_alerts",
  {
    id: serial("id").primaryKey(),
    regulationId: integer("regulation_id").references(() => regulations.id),
    changeType: varchar("change_type", { length: 64 }).notNull(),
    title: varchar("title", { length: 512 }).notNull(),
    description: text("description"),
    severity: varchar("severity", { length: 32 }),
    sourceUrl: varchar("source_url", { length: 2048 }),
    isProcessed: boolean("is_processed").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("regulatory_change_alerts_regulation_idx").on(table.regulationId),
  ]
);

// Type exports for platform tables
export type Regulation = typeof regulations.$inferSelect;
export type InsertRegulation = typeof regulations.$inferInsert;
export type GS1Standard = typeof gs1Standards.$inferSelect;
export type InsertGS1Standard = typeof gs1Standards.$inferInsert;


// ---------------------------------------------------------------------------
// Monitoring & Alert Tables
// ---------------------------------------------------------------------------

const errorLogSeverityEnum = pgEnum("error_log_severity", [
  "critical",
  "error",
  "warning",
  "info",
]);

export const errorLog = pgTable(
  "error_log",
  {
    id: serial("id").primaryKey(),
    severity: varchar("severity", { length: 20 }).notNull(),
    message: text("message").notNull(),
    operation: varchar("operation", { length: 255 }),
    stack: text("stack"),
    context: jsonb("context"),
    timestamp: timestamp("timestamp", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    traceId: varchar("trace_id", { length: 128 }),
    userId: integer("user_id"),
    requestId: varchar("request_id", { length: 128 }),
    resolved: integer("resolved").default(0).notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true, mode: "string" }),
    resolvedBy: varchar("resolved_by", { length: 255 }),
    notes: text("notes"),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("error_log_timestamp_idx").on(table.timestamp),
    index("error_log_severity_idx").on(table.severity),
    index("error_log_operation_idx").on(table.operation),
  ]
);

export const performanceLog = pgTable(
  "performance_log",
  {
    id: serial("id").primaryKey(),
    operation: varchar("operation", { length: 255 }).notNull(),
    duration: integer("duration_ms").notNull(),
    success: integer("success").default(1).notNull(),
    status: varchar("status", { length: 32 }),
    userId: integer("user_id"),
    requestId: varchar("request_id", { length: 128 }),
    metadata: jsonb("metadata"),
    timestamp: timestamp("timestamp", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("performance_log_timestamp_idx").on(table.timestamp),
    index("performance_log_operation_idx").on(table.operation),
    index("performance_log_duration_idx").on(table.duration),
  ]
);

export const alertHistory = pgTable(
  "alert_history",
  {
    id: serial("id").primaryKey(),
    alertType: varchar("alert_type", { length: 50 }).notNull(),
    severity: varchar("severity", { length: 20 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    message: text("message").notNull(),
    metadata: jsonb("metadata"),
    notificationSent: integer("notification_sent").default(0).notNull(),
    acknowledgedAt: timestamp("acknowledged_at", { withTimezone: true, mode: "string" }),
    acknowledgedBy: integer("acknowledged_by"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("alert_history_type_idx").on(table.alertType),
    index("alert_history_severity_idx").on(table.severity),
    index("alert_history_created_at_idx").on(table.createdAt),
  ]
);

export const alertCooldowns = pgTable(
  "alert_cooldowns",
  {
    id: serial("id").primaryKey(),
    alertType: varchar("alert_type", { length: 50 }).notNull(),
    alertKey: varchar("alert_key", { length: 255 }).notNull(),
    lastTriggeredAt: timestamp("last_triggered_at", { withTimezone: true, mode: "string" }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("alert_cooldowns_type_key_idx").on(table.alertType, table.alertKey),
    index("alert_cooldowns_expires_at_idx").on(table.expiresAt),
  ]
);

export const errorLedger = pgTable(
  "error_ledger",
  {
    id: serial("id").primaryKey(),
    traceId: varchar("trace_id", { length: 128 }),
    errorCode: varchar("error_code", { length: 128 }),
    classification: varchar("classification", { length: 128 }),
    commitSha: varchar("commit_sha", { length: 128 }),
    branch: varchar("branch", { length: 128 }),
    environment: varchar("environment", { length: 64 }),
    affectedFiles: text("affected_files"),
    errorPayload: text("error_payload"),
    failingInputs: text("failing_inputs"),
    remediationAttempts: text("remediation_attempts"),
    resolved: integer("resolved").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  }
);

// Type exports for monitoring tables
export type ErrorLog = typeof errorLog.$inferSelect;
export type InsertErrorLog = typeof errorLog.$inferInsert;
export type PerformanceLog = typeof performanceLog.$inferSelect;
export type InsertPerformanceLog = typeof performanceLog.$inferInsert;
export type AlertHistory = typeof alertHistory.$inferSelect;
export type InsertAlertHistory = typeof alertHistory.$inferInsert;
export type AlertCooldown = typeof alertCooldowns.$inferSelect;
export type InsertAlertCooldown = typeof alertCooldowns.$inferInsert;


// ---------------------------------------------------------------------------
// GS1 Extended Tables (Attributes, WebVocabulary, Code Lists)
// ---------------------------------------------------------------------------

export const gs1AttributeCodeLists = pgTable(
  "gs1_attribute_code_lists",
  {
    id: serial("id").primaryKey(),
    attributeId: integer("attribute_id").references(() => gs1Attributes.id),
    code: varchar("code", { length: 128 }).notNull(),
    name: varchar("name", { length: 512 }).notNull(),
    description: text("description"),
    source: varchar("source", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  }
);

export const gs1WebVocabulary = pgTable(
  "gs1_web_vocabulary",
  {
    id: serial("id").primaryKey(),
    uri: varchar("uri", { length: 1024 }).notNull(),
    label: varchar("label", { length: 512 }).notNull(),
    definition: text("definition"),
    comment: text("comment"),
    domain: varchar("domain", { length: 255 }),
    range: varchar("range", { length: 255 }),
    superProperty: varchar("super_property", { length: 1024 }),
    version: varchar("version", { length: 64 }),
    deprecated: boolean("deprecated").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  }
);

export const attributeRegulationMappings = pgTable(
  "attribute_regulation_mappings",
  {
    id: serial("id").primaryKey(),
    attributeId: integer("attribute_id").references(() => gs1Attributes.id),
    regulationId: integer("regulation_id").references(() => regulations.id),
    mappingType: varchar("mapping_type", { length: 64 }),
    relevanceScore: numeric("relevance_score", { precision: 5, scale: 2 }),
    rationale: text("rationale"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  }
);

// ---------------------------------------------------------------------------
// Compliance & Roadmap Tables
// ---------------------------------------------------------------------------

export const roadmapTemplates = pgTable(
  "roadmap_templates",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    regulationType: varchar("regulation_type", { length: 64 }),
    sector: varchar("sector", { length: 128 }),
    complexity: varchar("complexity", { length: 32 }),
    estimatedDurationWeeks: integer("estimated_duration_weeks"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  }
);

export const templateActions = pgTable(
  "template_actions",
  {
    id: serial("id").primaryKey(),
    templateId: integer("template_id").references(() => roadmapTemplates.id),
    title: varchar("title", { length: 512 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 128 }),
    priority: varchar("priority", { length: 32 }),
    estimatedEffortHours: integer("estimated_effort_hours"),
    orderIndex: integer("order_index").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  }
);

export const templateMilestones = pgTable(
  "template_milestones",
  {
    id: serial("id").primaryKey(),
    templateId: integer("template_id").references(() => roadmapTemplates.id),
    title: varchar("title", { length: 512 }).notNull(),
    description: text("description"),
    targetWeek: integer("target_week"),
    orderIndex: integer("order_index").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  }
);

export const templateUsage = pgTable(
  "template_usage",
  {
    id: serial("id").primaryKey(),
    templateId: integer("template_id").references(() => roadmapTemplates.id),
    userId: integer("user_id"),
    roadmapId: integer("roadmap_id"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  }
);

export const roadmapMilestones = pgTable(
  "roadmap_milestones",
  {
    id: serial("id").primaryKey(),
    roadmapId: integer("roadmap_id"),
    title: varchar("title", { length: 512 }).notNull(),
    description: text("description"),
    targetDate: timestamp("target_date", { withTimezone: true, mode: "string" }),
    completedAt: timestamp("completed_at", { withTimezone: true, mode: "string" }),
    status: varchar("status", { length: 32 }).default("pending"),
    orderIndex: integer("order_index").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  }
);

export const complianceScores = pgTable(
  "compliance_scores",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id"),
    regulationId: integer("regulation_id").references(() => regulations.id),
    overallScore: numeric("overall_score", { precision: 5, scale: 2 }),
    dataReadinessScore: numeric("data_readiness_score", { precision: 5, scale: 2 }),
    processMaturityScore: numeric("process_maturity_score", { precision: 5, scale: 2 }),
    documentationScore: numeric("documentation_score", { precision: 5, scale: 2 }),
    assessedAt: timestamp("assessed_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  }
);

export const complianceEvidence = pgTable(
  "compliance_evidence",
  {
    id: serial("id").primaryKey(),
    scoreId: integer("score_id").references(() => complianceScores.id),
    requirementId: varchar("requirement_id", { length: 128 }),
    evidenceType: varchar("evidence_type", { length: 64 }),
    description: text("description"),
    status: varchar("status", { length: 32 }),
    verifiedAt: timestamp("verified_at", { withTimezone: true, mode: "string" }),
    verifiedBy: integer("verified_by"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  }
);

export const complianceRoadmaps = pgTable(
  "compliance_roadmaps",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id"),
    regulationId: integer("regulation_id").references(() => regulations.id),
    templateId: integer("template_id"),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 32 }).default("active"),
    targetDate: timestamp("target_date", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  }
);

// ---------------------------------------------------------------------------
// Supply Chain Tables
// ---------------------------------------------------------------------------

export const supplyChainRisks = pgTable(
  "supply_chain_risks",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id"),
    riskType: varchar("risk_type", { length: 64 }).notNull(),
    severity: varchar("severity", { length: 32 }).notNull(),
    title: varchar("title", { length: 512 }).notNull(),
    description: text("description"),
    affectedRegulationId: integer("affected_regulation_id").references(() => regulations.id),
    mitigationStatus: varchar("mitigation_status", { length: 32 }).default("open"),
    detectedAt: timestamp("detected_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true, mode: "string" }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  }
);

export const epcisEvents = pgTable(
  "epcis_events",
  {
    id: serial("id").primaryKey(),
    eventType: varchar("event_type", { length: 64 }).notNull(),
    eventTime: timestamp("event_time", { withTimezone: true, mode: "string" }).notNull(),
    eventTimezone: varchar("event_timezone", { length: 32 }),
    action: varchar("action", { length: 32 }),
    bizStep: varchar("biz_step", { length: 512 }),
    disposition: varchar("disposition", { length: 512 }),
    readPoint: varchar("read_point", { length: 512 }),
    bizLocation: varchar("biz_location", { length: 512 }),
    epcList: jsonb("epc_list"),
    quantityList: jsonb("quantity_list"),
    sourceList: jsonb("source_list"),
    destinationList: jsonb("destination_list"),
    ilmd: jsonb("ilmd"),
    extensions: jsonb("extensions"),
    rawEvent: jsonb("raw_event"),
    userId: integer("user_id"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  }
);

export const supplyChainNodes = pgTable(
  "supply_chain_nodes",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id"),
    gln: varchar("gln", { length: 64 }),
    name: varchar("name", { length: 512 }).notNull(),
    nodeType: varchar("node_type", { length: 64 }),
    country: varchar("country", { length: 128 }),
    region: varchar("region", { length: 128 }),
    latitude: numeric("latitude", { precision: 10, scale: 6 }),
    longitude: numeric("longitude", { precision: 10, scale: 6 }),
    riskLevel: varchar("risk_level", { length: 32 }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  }
);

// ---------------------------------------------------------------------------
// Auto-generated Postgres stubs for remaining MySQL tables
// These ensure all server imports resolve correctly
// ---------------------------------------------------------------------------

export const automationRequestLedger = pgTable(
  "automation_request_ledger",
  {
    id: serial("id").primaryKey(),
    source: varchar("source", { length: 128 })
  }
);

export const cbvVocabularies = pgTable(
  "cbv_vocabularies",
  {
    id: serial("id").primaryKey(),
    vocabularyType: varchar("vocabulary_type", { length: 100 })
  }
);

export const criticalEventAcknowledgments = pgTable(
  "critical_event_acknowledgments",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id").notNull(),
    userId: integer("user_id").notNull(),
    viewedAt: timestamp("viewed_at", { withTimezone: true, mode: "string" })
  }
);

export const criticalEventAlerts = pgTable(
  "critical_event_alerts",
  {
    id: serial("id").primaryKey(),
    eventId: integer("event_id").notNull(),
    deliveryMethod: varchar("delivery_method", { length: 64 }).notNull(),
    userId: integer("user_id"),
    status: varchar("status", { length: 64 }).notNull().default('PENDING'),
    errorMessage: text("error_message"),
    sentAt: timestamp("sent_at", { withTimezone: true, mode: "string" })
  }
);

export const criticalEvents = pgTable(
  "critical_events",
  {
    id: serial("id").primaryKey(),
    newsId: integer("news_id").notNull(),
    eventType: varchar("event_type", { length: 64 }).notNull(),
    severity: varchar("severity", { length: 64 }).notNull(),
    eventDate: timestamp("event_date", { withTimezone: true, mode: "string" })
  }
);

export const cteKdeMappings = pgTable(
  "cte_kde_mappings",
  {
    id: serial("id").primaryKey(),
    cteId: integer("cte_id").notNull(),
    kdeId: integer("kde_id").notNull(),
    required: integer("required").default(1),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
  }
);

export const ctes = pgTable(
  "ctes",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 100 })
  }
);

export const datasetRegistry = pgTable(
  "dataset_registry",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 })
  }
);

export const digitalLinkTypes = pgTable(
  "digital_link_types",
  {
    id: serial("id").primaryKey(),
    linkType: varchar("link_type", { length: 100 })
  }
);

export const dppIdentificationRules = pgTable(
  "dpp_identification_rules",
  {
    id: serial("id").primaryKey(),
    ruleCode: varchar("rule_code", { length: 100 })
  }
);

export const dppIdentifierComponents = pgTable(
  "dpp_identifier_components",
  {
    id: serial("id").primaryKey(),
    componentCode: varchar("component_code", { length: 50 })
  }
);

export const dutchInitiatives = pgTable(
  "dutch_initiatives",
  {
    id: serial("id").primaryKey(),
    initiativeName: varchar("initiative_name", { length: 255 })
  }
);

export const epcisBatchJobs = pgTable(
  "epcis_batch_jobs",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    fileName: varchar("file_name", { length: 255 })
  }
);

export const epcisEventTemplates = pgTable(
  "epcis_event_templates",
  {
    id: serial("id").primaryKey(),
    templateName: varchar("template_name", { length: 255 })
  }
);

export const esgAtomicRequirements = pgTable(
  "esg_atomic_requirements",
  {
    id: serial("id").primaryKey(),
    atomicId: varchar("atomic_id", { length: 32 })
  }
);

export const esgCorpus = pgTable(
  "esg_corpus",
  {
    id: serial("id").primaryKey(),
    instrumentId: varchar("instrument_id", { length: 32 })
  }
);

export const esgDataRequirements = pgTable(
  "esg_data_requirements",
  {
    id: serial("id").primaryKey(),
    dataId: varchar("data_id", { length: 32 })
  }
);

export const esgGs1Mappings = pgTable(
  "esg_gs1_mappings",
  {
    id: serial("id").primaryKey(),
    dataId: varchar("data_id", { length: 32 })
  }
);

export const esgObligations = pgTable(
  "esg_obligations",
  {
    id: serial("id").primaryKey(),
    obligationId: varchar("obligation_id", { length: 32 })
  }
);

export const esrsXbrlConcepts = pgTable(
  "esrs_xbrl_concepts",
  {
    id: serial("id").primaryKey(),
    datapointId: varchar("datapoint_id", { length: 512 })
  }
);

export const eudrGeolocation = pgTable(
  "eudr_geolocation",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    productGtin: varchar("product_gtin", { length: 14 })
  }
);

export const gdsnClassAttributes = pgTable(
  "gdsn_class_attributes",
  {
    id: serial("id").primaryKey(),
    classId: integer("class_id").notNull(),
    attributeCode: varchar("attribute_code", { length: 255 })
  }
);

export const gdsnClasses = pgTable(
  "gdsn_classes",
  {
    id: serial("id").primaryKey(),
    id: integer("id").notNull(),
    name: varchar("name", { length: 255 })
  }
);

export const gdsnValidationRules = pgTable(
  "gdsn_validation_rules",
  {
    id: serial("id").primaryKey(),
    ruleId: varchar("rule_id", { length: 255 })
  }
);

export const governanceDocuments = pgTable(
  "governance_documents",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 512 })
  }
);

export const gs1AttributeEsrsMapping = pgTable(
  "gs1_attribute_esrs_mapping",
  {
    id: serial("id").primaryKey(),
    gs1AttributeId: varchar("gs1_attribute_id", { length: 255 })
  }
);

export const gs1CodeLists = pgTable(
  "gs1_code_lists",
  {
    id: serial("id").primaryKey(),
    codeListType: varchar("code_list_type", { length: 255 })
  }
);

export const gs1EuCarbonFootprintAttributes = pgTable(
  "gs1_eu_carbon_footprint_attributes",
  {
    id: serial("id").primaryKey(),
    bmsId: varchar("bms_id", { length: 10 })
  }
);

export const gs1EuCarbonFootprintCodeLists = pgTable(
  "gs1_eu_carbon_footprint_code_lists",
  {
    id: serial("id").primaryKey(),
    codeListName: varchar("code_list_name", { length: 100 })
  }
);

export const gs1LocalCodeLists = pgTable(
  "gs1_local_code_lists",
  {
    id: serial("id").primaryKey(),
    validationRuleId: varchar("validation_rule_id", { length: 50 })
  }
);

export const gs1ValidationRules = pgTable(
  "gs1_validation_rules",
  {
    id: serial("id").primaryKey(),
    ruleId: varchar("rule_id", { length: 50 })
  }
);

export const gs1WebvocProperties = pgTable(
  "gs1_webvoc_properties",
  {
    id: serial("id").primaryKey(),
    propertyId: varchar("property_id", { length: 512 })
  }
);

export const gs1WebvocTerms = pgTable(
  "gs1_webvoc_terms",
  {
    id: serial("id").primaryKey(),
    termId: varchar("term_id", { length: 512 })
  }
);

export const hubNewsHistory = pgTable(
  "hub_news_history",
  {
    id: serial("id").primaryKey(),
    originalId: integer("original_id").notNull(),
    title: varchar("title", { length: 512 })
  }
);

export const hubResources = pgTable(
  "hub_resources",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 512 })
  }
);

export const ingestItemProvenance = pgTable(
  "ingest_item_provenance",
  {
    id: serial("id").primaryKey(),
    pipelineType: varchar("pipeline_type", { length: 64 })
  }
);

export const ingestionLogs = pgTable(
  "ingestion_logs",
  {
    id: serial("id").primaryKey(),
    syncStartTime: timestamp("sync_start_time", { withTimezone: true, mode: "string" })
  }
);

export const initiativeRegulationMappings = pgTable(
  "initiative_regulation_mappings",
  {
    id: serial("id").primaryKey(),
    initiativeId: integer("initiative_id").notNull(),
    regulationId: integer("regulation_id").notNull(),
    relationshipType: varchar("relationship_type", { length: 100 })
  }
);

export const initiativeStandardMappings = pgTable(
  "initiative_standard_mappings",
  {
    id: serial("id").primaryKey(),
    initiativeId: integer("initiative_id").notNull(),
    standardId: integer("standard_id").notNull(),
    criticality: varchar("criticality", { length: 50 })
  }
);

export const kdes = pgTable(
  "kdes",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 100 })
  }
);

export const newsRecommendations = pgTable(
  "news_recommendations",
  {
    id: serial("id").primaryKey(),
    newsId: integer("news_id").notNull(),
    resourceType: varchar("resource_type", { length: 50 })
  }
);

export const notificationPreferences = pgTable(
  "notification_preferences",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    riskDetected: integer("risk_detected").default(1),
    remediationUpdated: integer("remediation_updated").default(1),
    commentAdded: integer("comment_added").default(1),
    approvalRequested: integer("approval_requested").default(1),
    approvalDecision: integer("approval_decision").default(1),
    templateUpdated: integer("template_updated").default(1),
    scoreChanged: integer("score_changed").default(1),
    milestoneAchieved: integer("milestone_achieved").default(1),
    minSeverity: varchar("min_severity", { length: 32 })
  }
);

export const pipelineExecutionLog = pgTable(
  "pipeline_execution_log",
  {
    id: serial("id").primaryKey(),
    executionId: varchar("execution_id", { length: 50 })
  }
);

export const policyActionAudit = pgTable(
  "policy_action_audit",
  {
    id: serial("id").primaryKey(),
    source: varchar("source", { length: 128 })
  }
);

export const rawCbvVocabularies = pgTable(
  "raw_cbv_vocabularies",
  {
    id: serial("id").primaryKey(),
    rawJson: jsonb("raw_json"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
  }
);

export const rawCtesKdes = pgTable(
  "raw_ctes_kdes",
  {
    id: serial("id").primaryKey(),
    rawJson: jsonb("raw_json"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
  }
);

export const rawDigitalLinkTypes = pgTable(
  "raw_digital_link_types",
  {
    id: serial("id").primaryKey(),
    rawJson: jsonb("raw_json"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
  }
);

export const rawDppIdentificationRules = pgTable(
  "raw_dpp_identification_rules",
  {
    id: serial("id").primaryKey(),
    rawJson: jsonb("raw_json"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
  }
);

export const rawDppIdentifierComponents = pgTable(
  "raw_dpp_identifier_components",
  {
    id: serial("id").primaryKey(),
    rawJson: jsonb("raw_json"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
  }
);

export const rawEsrsDatapoints = pgTable(
  "raw_esrs_datapoints",
  {
    id: serial("id").primaryKey(),
    code: varchar("code", { length: 100 })
  }
);

export const rawGdsnClassAttributes = pgTable(
  "raw_gdsn_class_attributes",
  {
    id: serial("id").primaryKey(),
    classId: integer("class_id").notNull(),
    attributeCode: varchar("attribute_code", { length: 255 })
  }
);

export const rawGdsnClasses = pgTable(
  "raw_gdsn_classes",
  {
    id: serial("id").primaryKey(),
    id: integer("id").notNull(),
    name: varchar("name", { length: 255 })
  }
);

export const rawGdsnValidationRules = pgTable(
  "raw_gdsn_validation_rules",
  {
    id: serial("id").primaryKey(),
    ruleId: varchar("rule_id", { length: 255 })
  }
);

export const regulationStandardMappings = pgTable(
  "regulation_standard_mappings",
  {
    id: serial("id").primaryKey(),
    regulationId: integer("regulation_id"),
    standardId: integer("standard_id"),
    mappingType: varchar("mapping_type", { length: 64 }),
    confidence: numeric("confidence"),
    rationale: text("rationale"),
    relevanceScore: numeric("relevance_score"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
  }
);

export const regulatoryChangeLog = pgTable(
  "regulatory_change_log",
  {
    id: serial("id").primaryKey(),
    entryDate: timestamp("entry_date", { withTimezone: true, mode: "string" })
  }
);

export const regulatoryEvents = pgTable(
  "regulatory_events",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 512 }),
    description: text("description"),
    eventType: varchar("event_type", { length: 64 }),
    eventDate: timestamp("event_date", { withTimezone: true, mode: "string" }),
    regulationId: integer("regulation_id"),
    sourceUrl: varchar("source_url", { length: 1024 }),
    impactLevel: varchar("impact_level", { length: 32 }),
    metadata: jsonb("metadata"),
    dedupKey: varchar("dedup_key", { length: 255 }),
    primaryRegulation: varchar("primary_regulation", { length: 64 }),
    affectedRegulations: jsonb("affected_regulations"),
    lifecycleState: varchar("lifecycle_state", { length: 64 }),
    eventDateEarliest: timestamp("event_date_earliest", { withTimezone: true, mode: "string" }),
    eventDateLatest: timestamp("event_date_latest", { withTimezone: true, mode: "string" }),
    eventQuarter: varchar("event_quarter", { length: 7 }),
    previousAssumption: text("previous_assumption"),
    newInformation: text("new_information"),
    whatChanged: text("what_changed"),
    whatDidNotChange: text("what_did_not_change"),
    decisionImpact: text("decision_impact"),
    eventTitle: varchar("event_title", { length: 512 }),
    eventSummary: text("event_summary"),
    sourceArticleIds: jsonb("source_article_ids"),
    decisionValueType: varchar("decision_value_type", { length: 64 }),
    stabilityRisk: varchar("stability_risk", { length: 32 }),
    confidenceLevel: varchar("confidence_level", { length: 32 }),
    confidenceSource: varchar("confidence_source", { length: 255 }),
    status: varchar("status", { length: 32 }),
    completenessScore: integer("completeness_score"),
    deltaValidationPassed: boolean("delta_validation_passed"),
    missingDeltaFields: jsonb("missing_delta_fields"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
  }
);

export const remediationProgress = pgTable(
  "remediation_progress",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    planId: integer("plan_id").notNull(),
    totalSteps: integer("total_steps").notNull(),
    completedSteps: integer("completed_steps").default(0),
    evidenceSubmitted: integer("evidence_submitted").default(0),
    evidenceVerified: integer("evidence_verified").default(0),
    progressPercentage: integer("progress_percentage").default(0),
    lastUpdated: timestamp("last_updated", { withTimezone: true, mode: "string" })
  }
);

export const remediationSteps = pgTable(
  "remediation_steps",
  {
    id: serial("id").primaryKey(),
    planId: integer("plan_id").notNull(),
    stepNumber: integer("step_number").notNull(),
    title: varchar("title", { length: 255 })
  }
);

export const remediationTemplates = pgTable(
  "remediation_templates",
  {
    id: serial("id").primaryKey(),
    riskType: varchar("risk_type", { length: 128 })
  }
);

export const riskRemediationPlans = pgTable(
  "risk_remediation_plans",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    riskId: integer("risk_id").notNull(),
    status: varchar("status", { length: 64 }).notNull().default('draft'),
    title: varchar("title", { length: 255 })
  }
);

export const roadmapActions = pgTable(
  "roadmap_actions",
  {
    id: serial("id").primaryKey(),
    roadmapId: integer("roadmap_id").notNull(),
    actionType: varchar("action_type", { length: 128 })
  }
);

export const roadmapActivityLog = pgTable(
  "roadmap_activity_log",
  {
    id: serial("id").primaryKey(),
    roadmapId: integer("roadmap_id").notNull(),
    userId: integer("user_id").notNull(),
    activityType: varchar("activity_type", { length: 64 })
  }
);

export const roadmapApprovals = pgTable(
  "roadmap_approvals",
  {
    id: serial("id").primaryKey(),
    roadmapId: integer("roadmap_id").notNull(),
    actionId: integer("action_id"),
    requiredApproverId: integer("required_approver_id").notNull(),
    approverRole: varchar("approver_role", { length: 64 })
  }
);

export const roadmapComments = pgTable(
  "roadmap_comments",
  {
    id: serial("id").primaryKey(),
    roadmapId: integer("roadmap_id").notNull(),
    actionId: integer("action_id"),
    userId: integer("user_id").notNull(),
    content: text("content").notNull(),
    isApproval: integer("is_approval").default(0),
    approvalStatus: varchar("approval_status", { length: 32 })
  }
);

export const roadmapDependencies = pgTable(
  "roadmap_dependencies",
  {
    id: serial("id").primaryKey(),
    fromActionId: integer("from_action_id").notNull(),
    toActionId: integer("to_action_id").notNull(),
    dependencyType: varchar("dependency_type", { length: 64 })
  }
);

export const scoreHistory = pgTable(
  "score_history",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    overallScore: numeric("overall_score")
  }
);

export const scoreMilestones = pgTable(
  "score_milestones",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    milestoneType: varchar("milestone_type", { length: 128 })
  }
);

export const scoringBenchmarks = pgTable(
  "scoring_benchmarks",
  {
    id: serial("id").primaryKey(),
    industry: varchar("industry", { length: 128 })
  }
);

export const scraperExecutions = pgTable(
  "scraper_executions",
  {
    id: serial("id").primaryKey(),
    sourceId: varchar("source_id", { length: 64 })
  }
);

export const scraperHealthSummary = pgTable(
  "scraper_health_summary",
  {
    id: serial("id").primaryKey(),
    sourceId: varchar("source_id", { length: 64 })
  }
);

export const supplyChainAnalytics = pgTable(
  "supply_chain_analytics",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    metricDate: timestamp("metric_date", { withTimezone: true, mode: "string" })
  }
);

export const supplyChainEdges = pgTable(
  "supply_chain_edges",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    fromNodeId: integer("from_node_id").notNull(),
    toNodeId: integer("to_node_id").notNull(),
    productGtin: varchar("product_gtin", { length: 14 })
  }
);

export const teamRoadmapAccess = pgTable(
  "team_roadmap_access",
  {
    id: serial("id").primaryKey(),
    roadmapId: integer("roadmap_id").notNull(),
    userId: integer("user_id").notNull(),
    accessLevel: varchar("access_level", { length: 32 })
  }
);

export const userSavedItems = pgTable(
  "user_saved_items",
  {
    id: serial("id").primaryKey(),
    userId: integer("user_id").notNull(),
    itemType: varchar("item_type", { length: 64 }).notNull(),
    itemId: integer("item_id").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
  }
);

export const webhookConfiguration = pgTable(
  "webhook_configuration",
  {
    id: serial("id").primaryKey(),
    platform: varchar("platform", { length: 64 }).notNull(),
    webhookUrl: text("webhook_url").notNull(),
    channelName: varchar("channel_name", { length: 255 })
  }
);

export const webhookDeliveryHistory = pgTable(
  "webhook_delivery_history",
  {
    id: serial("id").primaryKey(),
    platform: varchar("platform", { length: 64 }).notNull(),
    webhookUrl: text("webhook_url").notNull(),
    severity: varchar("severity", { length: 64 }).notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    success: integer("success").notNull(),
    statusCode: integer("status_code"),
    attempts: integer("attempts").default(1),
    error: text("error"),
    deliveredAt: timestamp("delivered_at", { withTimezone: true, mode: "string" })
  }
);


// ---------------------------------------------------------------------------
// Type exports (matching MySQL schema type exports)
// ---------------------------------------------------------------------------
export type HubNews = typeof hubNews.$inferSelect;
export type InsertHubNews = typeof hubNews.$inferInsert;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;
export type WebhookConfiguration = typeof webhookConfiguration.$inferSelect;
export type InsertWebhookConfiguration = typeof webhookConfiguration.$inferInsert;
export type WebhookDeliveryHistory = typeof webhookDeliveryHistory.$inferSelect;
export type InsertWebhookDeliveryHistory = typeof webhookDeliveryHistory.$inferInsert;
export type RegulatoryEvent = typeof regulatoryEvents.$inferSelect;
export type InsertRegulatoryEvent = typeof regulatoryEvents.$inferInsert;
export type EsgCorpus = typeof esgCorpus.$inferSelect;
export type InsertEsgCorpus = typeof esgCorpus.$inferInsert;
export type EsgObligation = typeof esgObligations.$inferSelect;
export type InsertEsgObligation = typeof esgObligations.$inferInsert;
export type EsgAtomicRequirement = typeof esgAtomicRequirements.$inferSelect;
export type InsertEsgAtomicRequirement = typeof esgAtomicRequirements.$inferInsert;
export type EsgDataRequirement = typeof esgDataRequirements.$inferSelect;
export type InsertEsgDataRequirement = typeof esgDataRequirements.$inferInsert;
export type EsgGs1Mapping = typeof esgGs1Mappings.$inferSelect;
export type InsertEsgGs1Mapping = typeof esgGs1Mappings.$inferInsert;
export type AutomationRequestLedger = typeof automationRequestLedger.$inferSelect;
export type InsertAutomationRequestLedger = typeof automationRequestLedger.$inferInsert;
export type PolicyActionAudit = typeof policyActionAudit.$inferSelect;
export type InsertPolicyActionAudit = typeof policyActionAudit.$inferInsert;
