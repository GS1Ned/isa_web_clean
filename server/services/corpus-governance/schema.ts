/**
 * Corpus Governance Schema
 * Part of Gate 1: Foundation - Corpus Governance & Observability
 * 
 * This module defines the Drizzle ORM schema for the corpus governance tables.
 * These tables provide versioning, authority ranking, and full auditability
 * for ISA's knowledge management system.
 */

import { 
  mysqlTable, 
  int, 
  varchar, 
  text, 
  timestamp, 
  json, 
  tinyint, 
  decimal,
  mysqlEnum,
  index,
  uniqueIndex
} from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

// ============================================================================
// Source Types
// ============================================================================

export const sourceTypeEnum = mysqlEnum('source_type', [
  'eu_regulation',
  'eu_directive',
  'gs1_global_standard',
  'gs1_regional_standard',
  'gs1_datamodel',
  'official_guidance',
  'industry_standard',
  'news_article',
  'third_party_analysis'
]);

export const sourceStatusEnum = mysqlEnum('status', [
  'draft',
  'active',
  'superseded',
  'deprecated',
  'archived'
]);

export const verificationStatusEnum = mysqlEnum('verification_status', [
  'pending',
  'verified',
  'stale',
  'failed'
]);

// ============================================================================
// Sources Table
// ============================================================================

export const sources = mysqlTable('sources', {
  id: int('id').autoincrement().primaryKey(),
  
  // Identification
  name: varchar('name', { length: 512 }).notNull(),
  acronym: varchar('acronym', { length: 64 }),
  externalId: varchar('external_id', { length: 255 }),
  
  // Source metadata
  sourceType: sourceTypeEnum.notNull(),
  
  // Authority & Trust (1=highest, 5=lowest)
  authorityLevel: int('authority_level').notNull(),
  publisher: varchar('publisher', { length: 255 }),
  publisherUrl: varchar('publisher_url', { length: 512 }),
  
  // Versioning
  version: varchar('version', { length: 64 }),
  publicationDate: timestamp('publication_date'),
  effectiveDate: timestamp('effective_date'),
  expirationDate: timestamp('expiration_date'),
  
  // Source URLs
  officialUrl: varchar('official_url', { length: 1024 }),
  archiveUrl: varchar('archive_url', { length: 1024 }),
  
  // Status
  status: sourceStatusEnum.notNull().default('active'),
  supersededBy: int('superseded_by'),
  
  // Ingestion metadata
  ingestionDate: timestamp('ingestion_date').notNull().defaultNow(),
  lastVerifiedDate: timestamp('last_verified_date'),
  verificationStatus: verificationStatusEnum.notNull().default('pending'),
  
  // Content summary
  description: text('description'),
  sector: varchar('sector', { length: 128 }),
  language: varchar('language', { length: 8 }).default('en'),
  
  // Audit trail
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
  createdBy: varchar('created_by', { length: 255 }),
}, (table) => ({
  sourceTypeIdx: index('source_type_idx').on(table.sourceType),
  authorityLevelIdx: index('authority_level_idx').on(table.authorityLevel),
  statusIdx: index('status_idx').on(table.status),
  sectorIdx: index('sector_idx').on(table.sector),
  publicationDateIdx: index('publication_date_idx').on(table.publicationDate),
  externalIdUniqueIdx: uniqueIndex('external_id_unique_idx').on(table.externalId),
}));

// ============================================================================
// Source Chunks Table
// ============================================================================

export const chunkTypeEnum = mysqlEnum('chunk_type', [
  'article',
  'section',
  'paragraph',
  'table',
  'definition',
  'requirement',
  'guidance',
  'example',
  'full_document'
]);

export const sourceChunks = mysqlTable('source_chunks', {
  id: int('id').autoincrement().primaryKey(),
  
  // Link to source
  sourceId: int('source_id').notNull().references(() => sources.id, { onDelete: 'cascade' }),
  
  // Chunk identification
  chunkIndex: int('chunk_index').notNull(),
  chunkType: chunkTypeEnum.notNull().default('paragraph'),
  
  // Structural metadata
  sectionPath: varchar('section_path', { length: 512 }),
  heading: varchar('heading', { length: 512 }),
  
  // Content
  content: text('content').notNull(),
  contentHash: varchar('content_hash', { length: 64 }).notNull(),
  
  // Character range for precise citation
  charStart: int('char_start'),
  charEnd: int('char_end'),
  
  // Embedding
  embedding: json('embedding'),
  embeddingModel: varchar('embedding_model', { length: 64 }),
  embeddingGeneratedAt: timestamp('embedding_generated_at'),
  
  // Versioning
  version: varchar('version', { length: 64 }),
  
  // Status
  isActive: tinyint('is_active').notNull().default(1),
  deprecatedAt: timestamp('deprecated_at'),
  deprecationReason: text('deprecation_reason'),
  
  // Audit trail
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  sourceIdIdx: index('source_id_idx').on(table.sourceId),
  chunkTypeIdx: index('chunk_type_idx').on(table.chunkType),
  contentHashIdx: index('content_hash_idx').on(table.contentHash),
  isActiveIdx: index('is_active_idx').on(table.isActive),
  sourceChunkUniqueIdx: uniqueIndex('source_chunk_unique_idx').on(table.sourceId, table.chunkIndex),
}));

// ============================================================================
// RAG Traces Table
// ============================================================================

export const ragTraceVerificationStatusEnum = mysqlEnum('verification_status', [
  'pending',
  'verified',
  'failed',
  'skipped'
]);

export const ragTraces = mysqlTable('rag_traces', {
  id: int('id').autoincrement().primaryKey(),
  
  // Query identification
  traceId: varchar('trace_id', { length: 64 }).notNull(),
  conversationId: int('conversation_id'),
  userId: int('user_id'),
  
  // Input
  query: text('query').notNull(),
  queryEmbedding: json('query_embedding'),
  queryLanguage: varchar('query_language', { length: 8 }),
  sectorFilter: varchar('sector_filter', { length: 64 }),
  
  // Retrieval phase
  retrievedChunkIds: json('retrieved_chunk_ids'),
  retrievalScores: json('retrieval_scores'),
  rerankScores: json('rerank_scores'),
  
  // Evidence selection
  selectedChunkIds: json('selected_chunk_ids'),
  selectedSpans: json('selected_spans'),
  
  // Generation phase
  extractedClaims: json('extracted_claims'),
  generatedAnswer: text('generated_answer'),
  citations: json('citations'),
  
  // Quality metrics
  confidenceScore: decimal('confidence_score', { precision: 3, scale: 2 }),
  citationPrecision: decimal('citation_precision', { precision: 3, scale: 2 }),
  abstained: tinyint('abstained').notNull().default(0),
  abstentionReason: text('abstention_reason'),
  
  // Verification
  verificationStatus: ragTraceVerificationStatusEnum.notNull().default('pending'),
  verificationDetails: json('verification_details'),
  
  // Performance
  totalLatencyMs: int('total_latency_ms'),
  retrievalLatencyMs: int('retrieval_latency_ms'),
  generationLatencyMs: int('generation_latency_ms'),
  
  // Model information
  llmModel: varchar('llm_model', { length: 128 }),
  embeddingModel: varchar('embedding_model', { length: 128 }),
  promptVersion: varchar('prompt_version', { length: 64 }),
  
  // Cache
  cacheHit: tinyint('cache_hit').notNull().default(0),
  cacheKey: varchar('cache_key', { length: 64 }),
  
  // User feedback
  feedbackId: int('feedback_id'),
  
  // Error handling
  errorOccurred: tinyint('error_occurred').notNull().default(0),
  errorMessage: text('error_message'),
  errorStack: text('error_stack'),
  
  // Audit trail
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  traceIdIdx: index('trace_id_idx').on(table.traceId),
  conversationIdIdx: index('conversation_id_idx').on(table.conversationId),
  userIdIdx: index('user_id_idx').on(table.userId),
  createdAtIdx: index('created_at_idx').on(table.createdAt),
  verificationStatusIdx: index('verification_status_idx').on(table.verificationStatus),
  abstainedIdx: index('abstained_idx').on(table.abstained),
  errorOccurredIdx: index('error_occurred_idx').on(table.errorOccurred),
}));

// ============================================================================
// Golden QA Pairs Table
// ============================================================================

export const questionTypeEnum = mysqlEnum('question_type', [
  'factual',
  'procedural',
  'comparative',
  'multi_hop',
  'adversarial',
  'out_of_scope'
]);

export const difficultyEnum = mysqlEnum('difficulty', [
  'easy',
  'medium',
  'hard'
]);

export const goldenQaPairs = mysqlTable('golden_qa_pairs', {
  id: int('id').autoincrement().primaryKey(),
  
  // Question
  question: text('question').notNull(),
  questionLanguage: varchar('question_language', { length: 8 }).default('en'),
  questionType: questionTypeEnum.notNull(),
  
  // Expected answer
  expectedAnswer: text('expected_answer').notNull(),
  expectedCitations: json('expected_citations'),
  expectedAbstain: tinyint('expected_abstain').notNull().default(0),
  
  // Categorization
  domain: varchar('domain', { length: 128 }),
  sector: varchar('sector', { length: 128 }),
  difficulty: difficultyEnum.default('medium'),
  
  // Metadata
  notes: text('notes'),
  createdBy: varchar('created_by', { length: 255 }),
  verifiedBy: varchar('verified_by', { length: 255 }),
  verifiedAt: timestamp('verified_at'),
  
  // Status
  isActive: tinyint('is_active').notNull().default(1),
  
  // Audit trail
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  questionTypeIdx: index('question_type_idx').on(table.questionType),
  domainIdx: index('domain_idx').on(table.domain),
  sectorIdx: index('sector_idx').on(table.sector),
  difficultyIdx: index('difficulty_idx').on(table.difficulty),
  isActiveIdx: index('is_active_idx').on(table.isActive),
}));

// ============================================================================
// Evaluation Results Table
// ============================================================================

export const runTypeEnum = mysqlEnum('run_type', [
  'full',
  'regression',
  'targeted',
  'ad_hoc'
]);

export const evaluationResults = mysqlTable('evaluation_results', {
  id: int('id').autoincrement().primaryKey(),
  
  // Evaluation run identification
  runId: varchar('run_id', { length: 64 }).notNull(),
  runType: runTypeEnum.notNull(),
  
  // Link to golden QA pair
  goldenQaId: int('golden_qa_id').notNull().references(() => goldenQaPairs.id, { onDelete: 'cascade' }),
  
  // Generated answer
  generatedAnswer: text('generated_answer'),
  generatedCitations: json('generated_citations'),
  abstained: tinyint('abstained').notNull().default(0),
  
  // Metrics
  answerCorrectness: decimal('answer_correctness', { precision: 3, scale: 2 }),
  citationPrecision: decimal('citation_precision', { precision: 3, scale: 2 }),
  citationRecall: decimal('citation_recall', { precision: 3, scale: 2 }),
  abstentionCorrect: tinyint('abstention_correct'),
  
  // Trace link
  ragTraceId: int('rag_trace_id').references(() => ragTraces.id, { onDelete: 'set null' }),
  
  // Evaluation details
  evaluatorModel: varchar('evaluator_model', { length: 128 }),
  evaluatorNotes: text('evaluator_notes'),
  
  // Audit trail
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  runIdIdx: index('run_id_idx').on(table.runId),
  goldenQaIdIdx: index('golden_qa_id_idx').on(table.goldenQaId),
  createdAtIdx: index('created_at_idx').on(table.createdAt),
}));

// ============================================================================
// Relations
// ============================================================================

export const sourcesRelations = relations(sources, ({ many }) => ({
  chunks: many(sourceChunks),
}));

export const sourceChunksRelations = relations(sourceChunks, ({ one }) => ({
  source: one(sources, {
    fields: [sourceChunks.sourceId],
    references: [sources.id],
  }),
}));

export const goldenQaPairsRelations = relations(goldenQaPairs, ({ many }) => ({
  evaluationResults: many(evaluationResults),
}));

export const evaluationResultsRelations = relations(evaluationResults, ({ one }) => ({
  goldenQaPair: one(goldenQaPairs, {
    fields: [evaluationResults.goldenQaId],
    references: [goldenQaPairs.id],
  }),
  ragTrace: one(ragTraces, {
    fields: [evaluationResults.ragTraceId],
    references: [ragTraces.id],
  }),
}));

// ============================================================================
// Type Exports
// ============================================================================

export type Source = typeof sources.$inferSelect;
export type NewSource = typeof sources.$inferInsert;

export type SourceChunk = typeof sourceChunks.$inferSelect;
export type NewSourceChunk = typeof sourceChunks.$inferInsert;

export type RagTrace = typeof ragTraces.$inferSelect;
export type NewRagTrace = typeof ragTraces.$inferInsert;

export type GoldenQaPair = typeof goldenQaPairs.$inferSelect;
export type NewGoldenQaPair = typeof goldenQaPairs.$inferInsert;

export type EvaluationResult = typeof evaluationResults.$inferSelect;
export type NewEvaluationResult = typeof evaluationResults.$inferInsert;
