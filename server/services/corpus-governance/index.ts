/**
 * Corpus Governance Service
 * Part of Gate 1: Foundation - Corpus Governance & Observability
 * 
 * This service provides the core functionality for managing ISA's knowledge corpus
 * with versioning, authority ranking, and full auditability.
 */

import { getDb } from '../../db';
import { eq, and, desc, sql } from 'drizzle-orm';
import { createHash } from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { 
  sources, 
  sourceChunks, 
  ragTraces,
  goldenQaPairs,
  evaluationResults,
  type Source, 
  type NewSource,
  type SourceChunk,
  type NewSourceChunk,
  type RagTrace,
  type NewRagTrace,
} from './schema';

// ============================================================================
// Authority Level Constants
// ============================================================================

export const AuthorityLevel = {
  HIGHEST: 1,      // EU Regulations, Official GS1 Standards
  HIGH: 2,         // EU Directives, GS1 Regional Standards
  MEDIUM: 3,       // Official Guidance, GS1 Datamodels
  LOW: 4,          // Industry Standards, Third-party Analysis
  LOWEST: 5,       // News Articles, User-generated Content
} as const;

export type AuthorityLevelType = typeof AuthorityLevel[keyof typeof AuthorityLevel];

// ============================================================================
// Source Management
// ============================================================================

/**
 * Create a new source in the corpus
 */
export async function createSource(source: NewSource): Promise<Source> {
  const db = await getDb();
  if (!db) throw new Error('Database connection not available');
  
  const result = await db.insert(sources).values(source);
  const insertId = (result as any)[0]?.insertId;
  const [created] = await db.select().from(sources).where(eq(sources.id, insertId));
  return created;
}

/**
 * Get a source by ID
 */
export async function getSourceById(id: number): Promise<Source | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(sources).where(eq(sources.id, id));
  return result[0];
}

/**
 * Get a source by external ID
 */
export async function getSourceByExternalId(externalId: string): Promise<Source | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(sources).where(eq(sources.externalId, externalId));
  return result[0];
}

/**
 * Get all active sources
 */
export async function getActiveSources(): Promise<Source[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(sources).where(eq(sources.status, 'active')).orderBy(sources.authorityLevel, sources.name);
}

/**
 * Get sources by type
 */
export async function getSourcesByType(sourceType: Source['sourceType']): Promise<Source[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(sources).where(
    and(
      eq(sources.sourceType, sourceType),
      eq(sources.status, 'active')
    )
  ).orderBy(sources.authorityLevel, sources.name);
}

/**
 * Update a source
 */
export async function updateSource(id: number, updates: Partial<NewSource>): Promise<Source | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(sources).set(updates).where(eq(sources.id, id));
  return getSourceById(id);
}

/**
 * Supersede a source with a new version
 */
export async function supersedeSource(oldSourceId: number, newSource: NewSource): Promise<Source> {
  const db = await getDb();
  if (!db) throw new Error('Database connection not available');
  
  // Create the new source
  const created = await createSource(newSource);
  
  // Mark the old source as superseded
  await db.update(sources).set({
    status: 'superseded',
    supersededBy: created.id,
  }).where(eq(sources.id, oldSourceId));
  
  return created;
}

// ============================================================================
// Chunk Management
// ============================================================================

/**
 * Generate a content hash for deduplication
 */
export function generateContentHash(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Create a new source chunk
 */
export async function createSourceChunk(chunk: Omit<NewSourceChunk, 'contentHash'>): Promise<SourceChunk> {
  const db = await getDb();
  if (!db) throw new Error('Database connection not available');
  
  const contentHash = generateContentHash(chunk.content);
  const result = await db.insert(sourceChunks).values({ ...chunk, contentHash });
  const insertId = (result as any)[0]?.insertId;
  const [created] = await db.select().from(sourceChunks).where(eq(sourceChunks.id, insertId));
  return created;
}

/**
 * Create multiple source chunks in batch
 */
export async function createSourceChunksBatch(
  sourceId: number, 
  chunks: Array<Omit<NewSourceChunk, 'sourceId' | 'contentHash' | 'chunkIndex'>>
): Promise<SourceChunk[]> {
  const db = await getDb();
  if (!db) throw new Error('Database connection not available');
  
  const chunksWithMeta = chunks.map((chunk, index) => ({
    ...chunk,
    sourceId,
    chunkIndex: index,
    contentHash: generateContentHash(chunk.content),
  }));
  
  await db.insert(sourceChunks).values(chunksWithMeta);
  
  return db.select().from(sourceChunks)
    .where(eq(sourceChunks.sourceId, sourceId))
    .orderBy(sourceChunks.chunkIndex);
}

/**
 * Get chunks for a source
 */
export async function getChunksBySourceId(sourceId: number): Promise<SourceChunk[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(sourceChunks)
    .where(and(
      eq(sourceChunks.sourceId, sourceId),
      eq(sourceChunks.isActive, 1)
    ))
    .orderBy(sourceChunks.chunkIndex);
}

/**
 * Get a chunk by ID
 */
export async function getChunkById(id: number): Promise<SourceChunk | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(sourceChunks).where(eq(sourceChunks.id, id));
  return result[0];
}

/**
 * Deprecate chunks for a source (when updating to new version)
 */
export async function deprecateChunksForSource(sourceId: number, reason: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(sourceChunks).set({
    isActive: 0,
    deprecatedAt: new Date(),
    deprecationReason: reason,
  }).where(eq(sourceChunks.sourceId, sourceId));
}

/**
 * Update chunk embedding
 */
export async function updateChunkEmbedding(
  chunkId: number, 
  embedding: number[], 
  model: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;
  
  await db.update(sourceChunks).set({
    embedding: embedding,
    embeddingModel: model,
    embeddingGeneratedAt: new Date(),
  }).where(eq(sourceChunks.id, chunkId));
}

// ============================================================================
// RAG Trace Management
// ============================================================================

/**
 * Generate a unique trace ID
 */
export function generateTraceId(): string {
  return uuidv4();
}

/**
 * Create a new RAG trace
 */
export async function createRagTrace(trace: NewRagTrace): Promise<RagTrace> {
  const db = await getDb();
  if (!db) throw new Error('Database connection not available');
  
  const result = await db.insert(ragTraces).values(trace);
  const insertId = (result as any)[0]?.insertId;
  const [created] = await db.select().from(ragTraces).where(eq(ragTraces.id, insertId));
  return created;
}

/**
 * Update a RAG trace (e.g., after generation completes)
 */
export async function updateRagTrace(id: number, updates: Partial<NewRagTrace>): Promise<RagTrace | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  await db.update(ragTraces).set(updates).where(eq(ragTraces.id, id));
  const result = await db.select().from(ragTraces).where(eq(ragTraces.id, id));
  return result[0];
}

/**
 * Get a RAG trace by trace ID
 */
export async function getRagTraceByTraceId(traceId: string): Promise<RagTrace | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(ragTraces).where(eq(ragTraces.traceId, traceId));
  return result[0];
}

/**
 * Get recent RAG traces
 */
export async function getRecentRagTraces(limit: number = 100): Promise<RagTrace[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(ragTraces)
    .orderBy(desc(ragTraces.createdAt))
    .limit(limit);
}

/**
 * Get traces with errors
 */
export async function getErrorTraces(limit: number = 100): Promise<RagTrace[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(ragTraces)
    .where(eq(ragTraces.errorOccurred, 1))
    .orderBy(desc(ragTraces.createdAt))
    .limit(limit);
}

/**
 * Get traces that abstained
 */
export async function getAbstainedTraces(limit: number = 100): Promise<RagTrace[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(ragTraces)
    .where(eq(ragTraces.abstained, 1))
    .orderBy(desc(ragTraces.createdAt))
    .limit(limit);
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Get corpus statistics
 */
export async function getCorpusStats(): Promise<{
  totalSources: number;
  activeSources: number;
  totalChunks: number;
  activeChunks: number;
  sourcesByType: Record<string, number>;
  sourcesByAuthority: Record<number, number>;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalSources: 0,
      activeSources: 0,
      totalChunks: 0,
      activeChunks: 0,
      sourcesByType: {},
      sourcesByAuthority: {},
    };
  }
  
  const [totalSourcesResult] = await db.select({ count: sql<number>`COUNT(*)` }).from(sources);
  const [activeSourcesResult] = await db.select({ count: sql<number>`COUNT(*)` }).from(sources).where(eq(sources.status, 'active'));
  const [totalChunksResult] = await db.select({ count: sql<number>`COUNT(*)` }).from(sourceChunks);
  const [activeChunksResult] = await db.select({ count: sql<number>`COUNT(*)` }).from(sourceChunks).where(eq(sourceChunks.isActive, 1));
  
  const sourcesByTypeResult = await db.select({
    sourceType: sources.sourceType,
    count: sql<number>`COUNT(*)`,
  }).from(sources).where(eq(sources.status, 'active')).groupBy(sources.sourceType);
  
  const sourcesByAuthorityResult = await db.select({
    authorityLevel: sources.authorityLevel,
    count: sql<number>`COUNT(*)`,
  }).from(sources).where(eq(sources.status, 'active')).groupBy(sources.authorityLevel);
  
  return {
    totalSources: totalSourcesResult.count,
    activeSources: activeSourcesResult.count,
    totalChunks: totalChunksResult.count,
    activeChunks: activeChunksResult.count,
    sourcesByType: Object.fromEntries(sourcesByTypeResult.map(r => [r.sourceType, r.count])),
    sourcesByAuthority: Object.fromEntries(sourcesByAuthorityResult.map(r => [r.authorityLevel, r.count])),
  };
}

/**
 * Get RAG trace statistics
 */
export async function getRagTraceStats(days: number = 7): Promise<{
  totalTraces: number;
  errorCount: number;
  abstentionCount: number;
  cacheHitCount: number;
  avgLatencyMs: number;
  avgCitationPrecision: number;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalTraces: 0,
      errorCount: 0,
      abstentionCount: 0,
      cacheHitCount: 0,
      avgLatencyMs: 0,
      avgCitationPrecision: 0,
    };
  }
  
  const since = new Date();
  since.setDate(since.getDate() - days);
  
  const [stats] = await db.select({
    totalTraces: sql<number>`COUNT(*)`,
    errorCount: sql<number>`SUM(CASE WHEN error_occurred = 1 THEN 1 ELSE 0 END)`,
    abstentionCount: sql<number>`SUM(CASE WHEN abstained = 1 THEN 1 ELSE 0 END)`,
    cacheHitCount: sql<number>`SUM(CASE WHEN cache_hit = 1 THEN 1 ELSE 0 END)`,
    avgLatencyMs: sql<number>`AVG(total_latency_ms)`,
    avgCitationPrecision: sql<number>`AVG(citation_precision)`,
  }).from(ragTraces).where(sql`created_at >= ${since}`);
  
  return {
    totalTraces: stats.totalTraces || 0,
    errorCount: stats.errorCount || 0,
    abstentionCount: stats.abstentionCount || 0,
    cacheHitCount: stats.cacheHitCount || 0,
    avgLatencyMs: Math.round(stats.avgLatencyMs || 0),
    avgCitationPrecision: stats.avgCitationPrecision || 0,
  };
}

// ============================================================================
// Export all
// ============================================================================

export * from './schema';
