/**
 * RAG Tracing Service
 * Part of Gate 1.2: Observability Stack
 * 
 * This service provides comprehensive tracing for the Ask ISA RAG pipeline,
 * enabling debugging, quality improvement, and compliance auditing.
 * 
 * Trace Schema:
 * query → retrieved_docs → rerank_scores → used_spans → claims → citations
 */

import { getDb } from '../../db';
import { eq, desc, sql, and, gte } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { serverLogger } from '../../_core/logger-wiring';

// ============================================================================
// Types
// ============================================================================

export interface RagTraceInput {
  query: string;
  queryLanguage?: string;
  sectorFilter?: string;
  conversationId?: number;
  userId?: number;
}

export interface RetrievalResult {
  chunkId: number;
  score: number;
  content?: string;
}

export interface RerankResult {
  chunkId: number;
  originalScore: number;
  rerankScore: number;
}

export interface ExtractedClaim {
  claim: string;
  sourceChunkId: number;
  confidence: number;
}

export interface Citation {
  text?: string;
  citedText?: string;
  sourceChunkId: number;
  sourceTitle?: string;
  sourceUrl?: string;
}

export interface RagTraceUpdate {
  // Retrieval phase
  retrievedChunkIds?: number[];
  retrievalScores?: number[];
  rerankScores?: number[];
  retrievalLatencyMs?: number;
  
  // Evidence selection
  selectedChunkIds?: number[];
  selectedSpans?: string[];
  
  // Generation phase
  extractedClaims?: ExtractedClaim[];
  generatedAnswer?: string;
  citations?: Citation[];
  generationLatencyMs?: number;
  
  // Quality metrics
  confidenceScore?: number;
  citationPrecision?: number;
  
  // Abstention
  abstained?: boolean;
  abstentionReason?: string;
  
  // Verification
  verificationStatus?: string;
  verificationDetails?: Record<string, any>;
  
  // Model info
  llmModel?: string;
  embeddingModel?: string;
  promptVersion?: string;
  
  // Cache
  cacheHit?: boolean;
  cacheKey?: string;
  
  // Error
  errorOccurred?: boolean;
  errorMessage?: string;
  errorStack?: string;
}

export interface RagTrace {
  id: number;
  traceId: string;
  query: string;
  queryLanguage?: string;
  sectorFilter?: string;
  conversationId?: number;
  userId?: number;
  
  retrievedChunkIds?: number[];
  retrievalScores?: number[];
  rerankScores?: number[];
  selectedChunkIds?: number[];
  selectedSpans?: string[];
  
  extractedClaims?: ExtractedClaim[];
  generatedAnswer?: string;
  citations?: Citation[];
  
  confidenceScore?: number;
  citationPrecision?: number;
  abstained: boolean;
  abstentionReason?: string;
  
  verificationStatus: string;
  verificationDetails?: Record<string, any>;
  
  totalLatencyMs?: number;
  retrievalLatencyMs?: number;
  generationLatencyMs?: number;
  
  llmModel?: string;
  embeddingModel?: string;
  promptVersion?: string;
  
  cacheHit: boolean;
  cacheKey?: string;
  
  feedbackId?: number;
  
  errorOccurred: boolean;
  errorMessage?: string;
  errorStack?: string;
  
  createdAt: Date;
}

// ============================================================================
// Trace Manager Class
// ============================================================================

/**
 * RagTraceManager - Manages the lifecycle of a single RAG trace
 * 
 * Usage:
 * ```typescript
 * const trace = await RagTraceManager.start({ query: "What is ESPR?" });
 * 
 * // Record retrieval
 * trace.recordRetrieval(results, latencyMs);
 * 
 * // Record generation
 * trace.recordGeneration(answer, claims, citations, latencyMs);
 * 
 * // Complete trace
 * await trace.complete();
 * ```
 */
export class RagTraceManager {
  private traceId: string;
  private dbId: number | null = null;
  private startTime: number;
  private updates: RagTraceUpdate = {};
  private input: RagTraceInput;
  private completed: boolean = false;
  
  private constructor(input: RagTraceInput) {
    this.traceId = randomUUID();
    this.startTime = Date.now();
    this.input = input;
  }
  
  /**
   * Start a new RAG trace
   */
  static async start(input: RagTraceInput): Promise<RagTraceManager> {
    const manager = new RagTraceManager(input);
    
    try {
      const db = await getDb();
      if (db) {
        const result = await db.execute(sql`
          INSERT INTO rag_traces (
            trace_id, query, query_language, sector_filter, 
            conversation_id, user_id, abstained, cache_hit, error_occurred
          ) VALUES (
            ${manager.traceId}, ${input.query}, ${input.queryLanguage || null},
            ${input.sectorFilter || null}, ${input.conversationId || null},
            ${input.userId || null}, 0, 0, 0
          )
        `);
        manager.dbId = (result as any)[0]?.insertId;
        
        serverLogger.info(`[RagTrace] Started trace ${manager.traceId}`);
      }
    } catch (error) {
      serverLogger.warn(`[RagTrace] Failed to start trace: ${error}`);
    }
    
    return manager;
  }
  
  /**
   * Get the trace ID
   */
  getTraceId(): string {
    return this.traceId;
  }
  
  /**
   * Record retrieval phase results
   */
  recordRetrieval(
    results: RetrievalResult[],
    latencyMs: number,
    rerankResults?: RerankResult[]
  ): void {
    this.updates.retrievedChunkIds = results.map(r => r.chunkId);
    this.updates.retrievalScores = results.map(r => r.score);
    this.updates.retrievalLatencyMs = latencyMs;
    
    if (rerankResults) {
      this.updates.rerankScores = rerankResults.map(r => r.rerankScore);
    }
    
    serverLogger.info(`[RagTrace] Recorded retrieval: ${results.length} chunks in ${latencyMs}ms`);
  }
  
  /**
   * Record evidence selection
   */
  recordEvidenceSelection(
    selectedChunkIds: number[],
    selectedSpans?: string[]
  ): void {
    this.updates.selectedChunkIds = selectedChunkIds;
    if (selectedSpans) {
      this.updates.selectedSpans = selectedSpans;
    }
    
    serverLogger.info(`[RagTrace] Recorded evidence selection: ${selectedChunkIds.length} chunks`);
  }
  
  /**
   * Record claim extraction
   */
  recordClaimExtraction(claims: ExtractedClaim[]): void {
    this.updates.extractedClaims = claims;
    
    serverLogger.info(`[RagTrace] Recorded ${claims.length} extracted claims`);
  }
  
  /**
   * Record answer generation
   */
  recordGeneration(
    answer: string,
    citations: Citation[],
    latencyMs: number,
    options?: {
      llmModel?: string;
      promptVersion?: string;
      confidenceScore?: number;
    }
  ): void {
    this.updates.generatedAnswer = answer;
    this.updates.citations = citations;
    this.updates.generationLatencyMs = latencyMs;
    
    if (options?.llmModel) this.updates.llmModel = options.llmModel;
    if (options?.promptVersion) this.updates.promptVersion = options.promptVersion;
    if (options?.confidenceScore) this.updates.confidenceScore = options.confidenceScore;
    
    // Calculate citation precision if we have both citations and selected chunks
    if (citations.length > 0 && this.updates.selectedChunkIds) {
      const citedChunkIds = new Set(citations.map(c => c.sourceChunkId));
      const selectedChunkIds = new Set(this.updates.selectedChunkIds);
      const intersection = Array.from(citedChunkIds).filter(id => selectedChunkIds.has(id));
      this.updates.citationPrecision = intersection.length / citations.length;
    }
    
    serverLogger.info(`[RagTrace] Recorded generation: ${answer.length} chars, ${citations.length} citations`);
  }
  
  /**
   * Record abstention
   */
  recordAbstention(reason: string): void {
    this.updates.abstained = true;
    this.updates.abstentionReason = reason;
    
    serverLogger.info(`[RagTrace] Recorded abstention: ${reason}`);
  }
  
  /**
   * Record cache hit
   */
  recordCacheHit(cacheKey: string): void {
    this.updates.cacheHit = true;
    this.updates.cacheKey = cacheKey;
    
    serverLogger.info(`[RagTrace] Recorded cache hit: ${cacheKey}`);
  }
  
  /**
   * Record error
   */
  recordError(error: Error, errorCategory?: string): void {
    this.updates.errorOccurred = true;
    this.updates.errorMessage = errorCategory ? `[${errorCategory}] ${error.message}` : error.message;
    this.updates.errorStack = error.stack;
    
    serverLogger.info(`[RagTrace] Recorded error: ${errorCategory || 'UNKNOWN'} - ${error.message}`);
  }
  
  /**
   * Set model information
   */
  setModelInfo(options: {
    llmModel?: string;
    embeddingModel?: string;
    promptVersion?: string;
  }): void {
    if (options.llmModel) this.updates.llmModel = options.llmModel;
    if (options.embeddingModel) this.updates.embeddingModel = options.embeddingModel;
    if (options.promptVersion) this.updates.promptVersion = options.promptVersion;
  }
  
  /**
   * Set verification status and details
   */
  setVerificationStatus(
    status: string,
    details?: Record<string, any>
  ): void {
    this.updates.verificationStatus = status;
    if (details) {
      this.updates.verificationDetails = details;
    }
    
    serverLogger.info(`[RagTrace] Set verification status: ${status}`);
  }
  
  /**
   * Complete the trace and persist to database
   */
  async complete(): Promise<void> {
    if (this.completed) {
      serverLogger.warn(`[RagTrace] Trace ${this.traceId} already completed`);
      return;
    }
    
    this.completed = true;
    const totalLatencyMs = Date.now() - this.startTime;
    
    try {
      const db = await getDb();
      if (db && this.dbId) {
        await db.execute(sql`
          UPDATE rag_traces SET
            retrieved_chunk_ids = ${JSON.stringify(this.updates.retrievedChunkIds || [])},
            retrieval_scores = ${JSON.stringify(this.updates.retrievalScores || [])},
            rerank_scores = ${JSON.stringify(this.updates.rerankScores || [])},
            selected_chunk_ids = ${JSON.stringify(this.updates.selectedChunkIds || [])},
            selected_spans = ${JSON.stringify(this.updates.selectedSpans || [])},
            extracted_claims = ${JSON.stringify(this.updates.extractedClaims || [])},
            generated_answer = ${this.updates.generatedAnswer || null},
            citations = ${JSON.stringify(this.updates.citations || [])},
            confidence_score = ${this.updates.confidenceScore || null},
            citation_precision = ${this.updates.citationPrecision || null},
            abstained = ${this.updates.abstained ? 1 : 0},
            abstention_reason = ${this.updates.abstentionReason || null},
            total_latency_ms = ${totalLatencyMs},
            retrieval_latency_ms = ${this.updates.retrievalLatencyMs || null},
            generation_latency_ms = ${this.updates.generationLatencyMs || null},
            llm_model = ${this.updates.llmModel || null},
            embedding_model = ${this.updates.embeddingModel || null},
            prompt_version = ${this.updates.promptVersion || null},
            cache_hit = ${this.updates.cacheHit ? 1 : 0},
            cache_key = ${this.updates.cacheKey || null},
            verification_status = ${this.updates.verificationStatus || 'NOT_CHECKED'},
            verification_details = ${JSON.stringify(this.updates.verificationDetails || {})},
            error_occurred = ${this.updates.errorOccurred ? 1 : 0},
            error_message = ${this.updates.errorMessage || null},
            error_stack = ${this.updates.errorStack || null}
          WHERE id = ${this.dbId}
        `);
        
        serverLogger.info(`[RagTrace] Completed trace ${this.traceId} in ${totalLatencyMs}ms`);
      }
    } catch (error) {
      serverLogger.error(`[RagTrace] Failed to complete trace: ${error}`);
    }
  }
}

// ============================================================================
// Query Functions
// ============================================================================

/**
 * Get a trace by trace ID
 */
export async function getTraceByTraceId(traceId: string): Promise<RagTrace | null> {
  const db = await getDb();
  if (!db) return null;
  
  const [result] = await db.execute(sql`
    SELECT * FROM rag_traces WHERE trace_id = ${traceId}
  `);
  
  const rows = result as unknown as any[];
  if (rows.length === 0) return null;
  
  return mapRowToTrace(rows[0]);
}

/**
 * Get recent traces
 */
export async function getRecentTraces(limit: number = 100): Promise<RagTrace[]> {
  const db = await getDb();
  if (!db) return [];
  
  const [result] = await db.execute(sql`
    SELECT * FROM rag_traces 
    ORDER BY created_at DESC 
    LIMIT ${limit}
  `);
  
  return (result as unknown as any[]).map(mapRowToTrace);
}

/**
 * Get traces with errors
 */
export async function getErrorTraces(limit: number = 100): Promise<RagTrace[]> {
  const db = await getDb();
  if (!db) return [];
  
  const [result] = await db.execute(sql`
    SELECT * FROM rag_traces 
    WHERE error_occurred = 1
    ORDER BY created_at DESC 
    LIMIT ${limit}
  `);
  
  return (result as unknown as any[]).map(mapRowToTrace);
}

/**
 * Get traces that abstained
 */
export async function getAbstainedTraces(limit: number = 100): Promise<RagTrace[]> {
  const db = await getDb();
  if (!db) return [];
  
  const [result] = await db.execute(sql`
    SELECT * FROM rag_traces 
    WHERE abstained = 1
    ORDER BY created_at DESC 
    LIMIT ${limit}
  `);
  
  return (result as unknown as any[]).map(mapRowToTrace);
}

/**
 * Get trace statistics for a time period
 */
export async function getTraceStats(days: number = 7): Promise<{
  totalTraces: number;
  errorRate: number;
  abstentionRate: number;
  cacheHitRate: number;
  avgLatencyMs: number;
  avgCitationPrecision: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalTraces: 0,
      errorRate: 0,
      abstentionRate: 0,
      cacheHitRate: 0,
      avgLatencyMs: 0,
      avgCitationPrecision: 0,
      p50LatencyMs: 0,
      p95LatencyMs: 0,
    };
  }
  
  const since = new Date();
  since.setDate(since.getDate() - days);
  
  const [result] = await db.execute(sql`
    SELECT 
      COUNT(*) as total_traces,
      SUM(CASE WHEN error_occurred = 1 THEN 1 ELSE 0 END) as error_count,
      SUM(CASE WHEN abstained = 1 THEN 1 ELSE 0 END) as abstention_count,
      SUM(CASE WHEN cache_hit = 1 THEN 1 ELSE 0 END) as cache_hit_count,
      AVG(total_latency_ms) as avg_latency_ms,
      AVG(citation_precision) as avg_citation_precision
    FROM rag_traces 
    WHERE created_at >= ${since.toISOString()}
  `);
  
  const stats = (result as unknown as any[])[0];
  const totalTraces = stats.total_traces || 0;
  
  return {
    totalTraces,
    errorRate: totalTraces > 0 ? (stats.error_count || 0) / totalTraces : 0,
    abstentionRate: totalTraces > 0 ? (stats.abstention_count || 0) / totalTraces : 0,
    cacheHitRate: totalTraces > 0 ? (stats.cache_hit_count || 0) / totalTraces : 0,
    avgLatencyMs: Math.round(stats.avg_latency_ms || 0),
    avgCitationPrecision: stats.avg_citation_precision || 0,
    p50LatencyMs: 0, // Would require window functions
    p95LatencyMs: 0, // Would require window functions
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function mapRowToTrace(row: any): RagTrace {
  return {
    id: row.id,
    traceId: row.trace_id,
    query: row.query,
    queryLanguage: row.query_language,
    sectorFilter: row.sector_filter,
    conversationId: row.conversation_id,
    userId: row.user_id,
    
    retrievedChunkIds: parseJson(row.retrieved_chunk_ids),
    retrievalScores: parseJson(row.retrieval_scores),
    rerankScores: parseJson(row.rerank_scores),
    selectedChunkIds: parseJson(row.selected_chunk_ids),
    selectedSpans: parseJson(row.selected_spans),
    
    extractedClaims: parseJson(row.extracted_claims),
    generatedAnswer: row.generated_answer,
    citations: parseJson(row.citations),
    
    confidenceScore: row.confidence_score ? parseFloat(row.confidence_score) : undefined,
    citationPrecision: row.citation_precision ? parseFloat(row.citation_precision) : undefined,
    abstained: row.abstained === 1,
    abstentionReason: row.abstention_reason,
    
    verificationStatus: row.verification_status,
    verificationDetails: parseJson(row.verification_details),
    
    totalLatencyMs: row.total_latency_ms,
    retrievalLatencyMs: row.retrieval_latency_ms,
    generationLatencyMs: row.generation_latency_ms,
    
    llmModel: row.llm_model,
    embeddingModel: row.embedding_model,
    promptVersion: row.prompt_version,
    
    cacheHit: row.cache_hit === 1,
    cacheKey: row.cache_key,
    
    feedbackId: row.feedback_id,
    
    errorOccurred: row.error_occurred === 1,
    errorMessage: row.error_message,
    errorStack: row.error_stack,
    
    createdAt: new Date(row.created_at),
  };
}

function parseJson(value: any): any {
  if (!value) return undefined;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

// ============================================================================
// Exports
// ============================================================================

export { RagTraceManager as default };
