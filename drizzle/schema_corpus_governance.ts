/**
 * Corpus Governance Schema
 * 
 * This schema implements the foundation for ISA's compliance-grade knowledge management.
 * It provides versioning, authority ranking, and full auditability for all knowledge sources.
 * 
 * Part of Gate 1: Foundation - Corpus Governance & Observability
 */
import {
  mysqlTable,
  int,
  varchar,
  text,
  timestamp,
  mysqlEnum,
  decimal,
  json,
  tinyint,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

/**
 * Authority Levels for Knowledge Sources
 * 
 * Level 1 (Highest): Primary legal instruments (EU Regulations, Directives)
 * Level 2: Official standards bodies (GS1 Global, ISO)
 * Level 3: National/regional standards (GS1 NL, Benelux)
 * Level 4: Official guidance documents (EC guidelines, GS1 implementation guides)
 * Level 5 (Lowest): Third-party analysis, news, commentary
 */
export type AuthorityLevel = 1 | 2 | 3 | 4 | 5;

/**
 * Sources Table
 * 
 * Tracks every document in the ISA knowledge corpus.
 * This is the single source of truth for document provenance and authority.
 */
export const sources = mysqlTable("sources", {
  id: int().autoincrement().notNull().primaryKey(),
  
  // Identification
  name: varchar({ length: 512 }).notNull(),
  acronym: varchar({ length: 64 }),
  externalId: varchar("external_id", { length: 255 }), // e.g., CELEX number for EU law
  
  // Source metadata
  sourceType: mysqlEnum("source_type", [
    'eu_regulation',
    'eu_directive',
    'gs1_global_standard',
    'gs1_regional_standard',
    'gs1_datamodel',
    'official_guidance',
    'industry_standard',
    'news_article',
    'third_party_analysis'
  ]).notNull(),
  
  // Authority & Trust
  authorityLevel: int("authority_level").notNull().$type<AuthorityLevel>(),
  publisher: varchar({ length: 255 }),
  publisherUrl: varchar("publisher_url", { length: 512 }),
  
  // Versioning
  version: varchar({ length: 64 }),
  publicationDate: timestamp("publication_date", { mode: 'string' }),
  effectiveDate: timestamp("effective_date", { mode: 'string' }),
  expirationDate: timestamp("expiration_date", { mode: 'string' }),
  
  // Source URLs
  officialUrl: varchar("official_url", { length: 1024 }),
  archiveUrl: varchar("archive_url", { length: 1024 }), // Wayback Machine or local archive
  
  // Status
  status: mysqlEnum([
    'draft',
    'active',
    'superseded',
    'deprecated',
    'archived'
  ]).default('active').notNull(),
  supersededBy: int("superseded_by"), // Reference to newer version
  
  // Ingestion metadata
  ingestionDate: timestamp("ingestion_date", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  lastVerifiedDate: timestamp("last_verified_date", { mode: 'string' }),
  verificationStatus: mysqlEnum("verification_status", [
    'pending',
    'verified',
    'stale',
    'failed'
  ]).default('pending').notNull(),
  
  // Content summary
  description: text(),
  sector: varchar({ length: 128 }), // e.g., 'fmcg', 'healthcare', 'all'
  language: varchar({ length: 8 }).default('en'),
  
  // Audit trail
  createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
  createdBy: varchar("created_by", { length: 255 }),
}, (table) => [
  index("source_type_idx").on(table.sourceType),
  index("authority_level_idx").on(table.authorityLevel),
  index("status_idx").on(table.status),
  index("sector_idx").on(table.sector),
  index("publication_date_idx").on(table.publicationDate),
  uniqueIndex("external_id_unique_idx").on(table.externalId),
]);

/**
 * Source Chunks Table
 * 
 * Stores versioned, structured content chunks from source documents.
 * Each chunk is a discrete piece of knowledge that can be cited.
 */
export const sourceChunks = mysqlTable("source_chunks", {
  id: int().autoincrement().notNull().primaryKey(),
  
  // Link to source
  sourceId: int("source_id").notNull(),
  
  // Chunk identification
  chunkIndex: int("chunk_index").notNull(), // Order within document
  chunkType: mysqlEnum("chunk_type", [
    'article',
    'section',
    'paragraph',
    'table',
    'definition',
    'requirement',
    'guidance',
    'example',
    'full_document'
  ]).default('paragraph').notNull(),
  
  // Structural metadata (for precise citation)
  sectionPath: varchar("section_path", { length: 512 }), // e.g., "Article 3 > Section 2 > Paragraph 1"
  heading: varchar({ length: 512 }),
  
  // Content
  content: text().notNull(),
  contentHash: varchar("content_hash", { length: 64 }).notNull(), // SHA-256 for deduplication
  
  // Character range for precise citation
  charStart: int("char_start"),
  charEnd: int("char_end"),
  
  // Embedding
  embedding: json(),
  embeddingModel: varchar("embedding_model", { length: 64 }),
  embeddingGeneratedAt: timestamp("embedding_generated_at", { mode: 'string' }),
  
  // Versioning (inherits from source, but can have chunk-specific version)
  version: varchar({ length: 64 }),
  
  // Status
  isActive: tinyint("is_active").default(1).notNull(),
  deprecatedAt: timestamp("deprecated_at", { mode: 'string' }),
  deprecationReason: text("deprecation_reason"),
  
  // Audit trail
  createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("source_id_idx").on(table.sourceId),
  index("chunk_type_idx").on(table.chunkType),
  index("content_hash_idx").on(table.contentHash),
  index("is_active_idx").on(table.isActive),
  uniqueIndex("source_chunk_unique_idx").on(table.sourceId, table.chunkIndex),
]);

/**
 * RAG Traces Table
 * 
 * Stores complete traces of every Ask ISA query for observability and debugging.
 * This enables root-cause analysis and continuous improvement.
 */
export const ragTraces = mysqlTable("rag_traces", {
  id: int().autoincrement().notNull().primaryKey(),
  
  // Query identification
  traceId: varchar("trace_id", { length: 64 }).notNull(), // UUID for external reference
  conversationId: int("conversation_id"),
  userId: int("user_id"),
  
  // Input
  query: text().notNull(),
  queryEmbedding: json("query_embedding"),
  queryLanguage: varchar("query_language", { length: 8 }),
  sectorFilter: varchar("sector_filter", { length: 64 }),
  
  // Retrieval phase
  retrievedChunkIds: json("retrieved_chunk_ids"), // Array of source_chunk IDs
  retrievalScores: json("retrieval_scores"), // Corresponding similarity scores
  rerankScores: json("rerank_scores"), // Scores after reranking
  
  // Evidence selection
  selectedChunkIds: json("selected_chunk_ids"), // Chunks actually used for generation
  selectedSpans: json("selected_spans"), // Specific text spans used
  
  // Generation phase
  extractedClaims: json("extracted_claims"), // Claims extracted from evidence
  generatedAnswer: text("generated_answer"),
  citations: json(), // Array of {claim, sourceChunkId, span}
  
  // Quality metrics
  confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }),
  citationPrecision: decimal("citation_precision", { precision: 3, scale: 2 }),
  abstained: tinyint().default(0).notNull(), // Did the system refuse to answer?
  abstentionReason: text("abstention_reason"),
  
  // Verification
  verificationStatus: mysqlEnum("verification_status", [
    'pending',
    'verified',
    'failed',
    'skipped'
  ]).default('pending').notNull(),
  verificationDetails: json("verification_details"),
  
  // Performance
  totalLatencyMs: int("total_latency_ms"),
  retrievalLatencyMs: int("retrieval_latency_ms"),
  generationLatencyMs: int("generation_latency_ms"),
  
  // Model information
  llmModel: varchar("llm_model", { length: 128 }),
  embeddingModel: varchar("embedding_model", { length: 128 }),
  promptVersion: varchar("prompt_version", { length: 64 }),
  
  // Cache
  cacheHit: tinyint("cache_hit").default(0).notNull(),
  cacheKey: varchar("cache_key", { length: 64 }),
  
  // User feedback (linked later)
  feedbackId: int("feedback_id"),
  
  // Error handling
  errorOccurred: tinyint("error_occurred").default(0).notNull(),
  errorMessage: text("error_message"),
  errorStack: text("error_stack"),
  
  // Audit trail
  createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
}, (table) => [
  index("trace_id_idx").on(table.traceId),
  index("conversation_id_idx").on(table.conversationId),
  index("user_id_idx").on(table.userId),
  index("created_at_idx").on(table.createdAt),
  index("verification_status_idx").on(table.verificationStatus),
  index("abstained_idx").on(table.abstained),
  index("error_occurred_idx").on(table.errorOccurred),
]);

/**
 * Golden QA Pairs Table
 * 
 * Stores curated question-answer pairs for RAG evaluation.
 * Used for regression testing and continuous quality monitoring.
 */
export const goldenQaPairs = mysqlTable("golden_qa_pairs", {
  id: int().autoincrement().notNull().primaryKey(),
  
  // Question
  question: text().notNull(),
  questionLanguage: varchar("question_language", { length: 8 }).default('en'),
  questionType: mysqlEnum("question_type", [
    'factual',
    'procedural',
    'comparative',
    'multi_hop',
    'adversarial',
    'out_of_scope'
  ]).notNull(),
  
  // Expected answer
  expectedAnswer: text("expected_answer").notNull(),
  expectedCitations: json("expected_citations"), // Array of source_chunk IDs
  expectedAbstain: tinyint("expected_abstain").default(0).notNull(),
  
  // Categorization
  domain: varchar({ length: 128 }), // e.g., 'CSRD', 'PPWR', 'GS1'
  sector: varchar({ length: 128 }),
  difficulty: mysqlEnum(['easy', 'medium', 'hard']).default('medium'),
  
  // Metadata
  notes: text(),
  createdBy: varchar("created_by", { length: 255 }),
  verifiedBy: varchar("verified_by", { length: 255 }),
  verifiedAt: timestamp("verified_at", { mode: 'string' }),
  
  // Status
  isActive: tinyint("is_active").default(1).notNull(),
  
  // Audit trail
  createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
  updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().onUpdateNow().notNull(),
}, (table) => [
  index("question_type_idx").on(table.questionType),
  index("domain_idx").on(table.domain),
  index("sector_idx").on(table.sector),
  index("difficulty_idx").on(table.difficulty),
  index("is_active_idx").on(table.isActive),
]);

/**
 * Evaluation Results Table
 * 
 * Stores results of RAG evaluation runs against the golden dataset.
 */
export const evaluationResults = mysqlTable("evaluation_results", {
  id: int().autoincrement().notNull().primaryKey(),
  
  // Evaluation run identification
  runId: varchar("run_id", { length: 64 }).notNull(), // UUID for the evaluation run
  runType: mysqlEnum("run_type", [
    'full',
    'regression',
    'targeted',
    'ad_hoc'
  ]).notNull(),
  
  // Link to golden QA pair
  goldenQaId: int("golden_qa_id").notNull(),
  
  // Generated answer
  generatedAnswer: text("generated_answer"),
  generatedCitations: json("generated_citations"),
  abstained: tinyint().default(0).notNull(),
  
  // Metrics
  answerCorrectness: decimal("answer_correctness", { precision: 3, scale: 2 }), // 0-1 score
  citationPrecision: decimal("citation_precision", { precision: 3, scale: 2 }),
  citationRecall: decimal("citation_recall", { precision: 3, scale: 2 }),
  abstentionCorrect: tinyint("abstention_correct"), // Did it abstain when expected?
  
  // Trace link
  ragTraceId: int("rag_trace_id"),
  
  // Evaluation details
  evaluatorModel: varchar("evaluator_model", { length: 128 }),
  evaluatorNotes: text("evaluator_notes"),
  
  // Audit trail
  createdAt: timestamp("created_at", { mode: 'string' }).default('CURRENT_TIMESTAMP').notNull(),
}, (table) => [
  index("run_id_idx").on(table.runId),
  index("golden_qa_id_idx").on(table.goldenQaId),
  index("created_at_idx").on(table.createdAt),
]);
