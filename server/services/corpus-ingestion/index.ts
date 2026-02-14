// @ts-nocheck
/**
 * Corpus Ingestion Service
 * Part of Gate 1.3: Refactor Ingestion Pipeline
 * 
 * This service provides automated ingestion of documents into the corpus
 * governance system with versioning, chunking, and embedding generation.
 */

import { getDb } from '../../db';
import { sql } from 'drizzle-orm';
import { createHash } from 'crypto';
import { serverLogger } from '../../_core/logger-wiring';

// ============================================================================
// Types
// ============================================================================

export type SourceType = 
  | 'eu_regulation'
  | 'eu_directive'
  | 'gs1_global_standard'
  | 'gs1_regional_standard'
  | 'gs1_datamodel'
  | 'official_guidance'
  | 'industry_standard'
  | 'news_article'
  | 'third_party_analysis';

export type ChunkType =
  | 'article'
  | 'section'
  | 'paragraph'
  | 'table'
  | 'definition'
  | 'requirement'
  | 'guidance'
  | 'example'
  | 'full_document';

export interface IngestionSourceInput {
  name: string;
  acronym?: string;
  externalId: string;
  sourceType: SourceType;
  authorityLevel: number;
  publisher?: string;
  publisherUrl?: string;
  version?: string;
  publicationDate?: Date;
  effectiveDate?: Date;
  expirationDate?: Date;
  officialUrl?: string;
  archiveUrl?: string;
  description?: string;
  sector?: string;
  language?: string;
}

export interface IngestionChunkInput {
  chunkType: ChunkType;
  sectionPath?: string;
  heading?: string;
  content: string;
  charStart?: number;
  charEnd?: number;
}

export interface IngestionResult {
  sourceId: number;
  chunksCreated: number;
  isNewVersion: boolean;
  previousVersionId?: number;
  embeddingsGenerated: number;
}

export interface IngestionOptions {
  generateEmbeddings?: boolean;
  embeddingModel?: string;
  skipDuplicateCheck?: boolean;
  autoSupersede?: boolean;
}

// ============================================================================
// Authority Level Mapping
// ============================================================================

export const AuthorityLevelByType: Record<SourceType, number> = {
  'eu_regulation': 1,
  'eu_directive': 2,
  'gs1_global_standard': 1,
  'gs1_regional_standard': 2,
  'gs1_datamodel': 3,
  'official_guidance': 3,
  'industry_standard': 4,
  'news_article': 5,
  'third_party_analysis': 4,
};

// ============================================================================
// Content Chunking
// ============================================================================

/**
 * Split content into chunks based on structure
 */
export function chunkContent(
  content: string,
  options: {
    maxChunkSize?: number;
    overlapSize?: number;
    preserveStructure?: boolean;
  } = {}
): IngestionChunkInput[] {
  const {
    maxChunkSize = 1500,
    overlapSize = 100,
    preserveStructure = true,
  } = options;

  const chunks: IngestionChunkInput[] = [];
  
  if (preserveStructure) {
    // Try to split by structural elements
    const articlePattern = /(?:^|\n)(Article\s+\d+[.:]\s*[^\n]*)/gi;
    const sectionPattern = /(?:^|\n)((?:\d+\.)+\s*[^\n]*)/gi;
    
    // Check for article structure (EU regulations)
    const articleMatches = content.match(articlePattern);
    if (articleMatches && articleMatches.length > 1) {
      return chunkByPattern(content, articlePattern, 'article', maxChunkSize);
    }
    
    // Check for section structure
    const sectionMatches = content.match(sectionPattern);
    if (sectionMatches && sectionMatches.length > 1) {
      return chunkByPattern(content, sectionPattern, 'section', maxChunkSize);
    }
  }
  
  // Fall back to paragraph-based chunking
  const paragraphs = content.split(/\n\n+/);
  let currentChunk = '';
  let charStart = 0;
  let chunkStart = 0;
  
  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push({
        chunkType: 'paragraph',
        content: currentChunk.trim(),
        charStart: chunkStart,
        charEnd: charStart,
      });
      
      // Add overlap from previous chunk
      const overlapText = currentChunk.slice(-overlapSize);
      currentChunk = overlapText + paragraph;
      chunkStart = charStart - overlapSize;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
    
    charStart += paragraph.length + 2; // +2 for \n\n
  }
  
  // Add final chunk
  if (currentChunk.trim()) {
    chunks.push({
      chunkType: 'paragraph',
      content: currentChunk.trim(),
      charStart: chunkStart,
      charEnd: charStart + currentChunk.length,
    });
  }
  
  return chunks;
}

function chunkByPattern(
  content: string,
  pattern: RegExp,
  chunkType: ChunkType,
  maxChunkSize: number
): IngestionChunkInput[] {
  const chunks: IngestionChunkInput[] = [];
  const matches = [...content.matchAll(pattern)];
  
  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const nextMatch = matches[i + 1];
    
    const start = match.index || 0;
    const end = nextMatch ? (nextMatch.index || content.length) : content.length;
    const chunkContent = content.slice(start, end).trim();
    
    // Extract heading from the match
    const heading = match[1]?.trim() || '';
    
    // If chunk is too large, split it further
    if (chunkContent.length > maxChunkSize * 2) {
      const subChunks = chunkContent.split(/\n\n+/);
      let currentSubChunk = heading + '\n\n';
      
      for (const sub of subChunks) {
        if (currentSubChunk.length + sub.length > maxChunkSize && currentSubChunk.length > heading.length + 2) {
          chunks.push({
            chunkType,
            heading,
            sectionPath: heading,
            content: currentSubChunk.trim(),
            charStart: start,
            charEnd: end,
          });
          currentSubChunk = heading + '\n\n' + sub;
        } else {
          currentSubChunk += '\n\n' + sub;
        }
      }
      
      if (currentSubChunk.trim().length > heading.length + 2) {
        chunks.push({
          chunkType,
          heading,
          sectionPath: heading,
          content: currentSubChunk.trim(),
          charStart: start,
          charEnd: end,
        });
      }
    } else {
      chunks.push({
        chunkType,
        heading,
        sectionPath: heading,
        content: chunkContent,
        charStart: start,
        charEnd: end,
      });
    }
  }
  
  return chunks;
}

// ============================================================================
// Main Ingestion Function
// ============================================================================

/**
 * Ingest a document into the corpus
 */
export async function ingestDocument(
  source: IngestionSourceInput,
  content: string | IngestionChunkInput[],
  options: IngestionOptions = {}
): Promise<IngestionResult> {
  const db = await getDb();
  if (!db) throw new Error('Database connection not available');
  
  const {
    generateEmbeddings = false,
    embeddingModel = 'text-embedding-3-small',
    skipDuplicateCheck = false,
    autoSupersede = true,
  } = options;
  
  serverLogger.info(`[Ingestion] Starting ingestion for: ${source.name}`);
  
  // Check for existing source with same external ID
  let previousVersionId: number | undefined;
  let isNewVersion = false;
  
  if (!skipDuplicateCheck) {
    const [existingRows] = await db.execute(sql`
      SELECT id, version, status FROM sources 
      WHERE external_id = ${source.externalId}
      ORDER BY created_at DESC
      LIMIT 1
    `);
    
    const existing = (existingRows as any[])[0];
    
    if (existing) {
      if (existing.version === source.version && existing.status === 'active') {
        serverLogger.info(`[Ingestion] Source already exists with same version, skipping`);
        return {
          sourceId: existing.id,
          chunksCreated: 0,
          isNewVersion: false,
        };
      }
      
      if (autoSupersede && existing.status === 'active') {
        previousVersionId = existing.id;
        isNewVersion = true;
        serverLogger.info(`[Ingestion] Found existing version ${existing.version}, will supersede`);
      }
    }
  }
  
  // Create new source
  const [insertResult] = await db.execute(sql`
    INSERT INTO sources (
      name, acronym, external_id, source_type, authority_level,
      publisher, publisher_url, version, publication_date, effective_date,
      expiration_date, official_url, archive_url, status, description,
      sector, language, created_by
    ) VALUES (
      ${source.name}, ${source.acronym || null}, ${source.externalId},
      ${source.sourceType}, ${source.authorityLevel},
      ${source.publisher || null}, ${source.publisherUrl || null},
      ${source.version || null}, ${source.publicationDate?.toISOString() || null},
      ${source.effectiveDate?.toISOString() || null}, ${source.expirationDate?.toISOString() || null},
      ${source.officialUrl || null}, ${source.archiveUrl || null},
      'active', ${source.description || null},
      ${source.sector || null}, ${source.language || 'en'},
      'corpus-ingestion-service'
    )
  `);
  
  const sourceId = (insertResult as any).insertId;
  serverLogger.info(`[Ingestion] Created source with ID: ${sourceId}`);
  
  // Supersede previous version if needed
  if (previousVersionId) {
    await db.execute(sql`
      UPDATE sources SET status = 'superseded', superseded_by = ${sourceId}
      WHERE id = ${previousVersionId}
    `);
    
    // Mark old chunks as inactive
    await db.execute(sql`
      UPDATE source_chunks SET is_active = 0, deprecated_at = NOW(),
      deprecation_reason = 'Superseded by version ${source.version}'
      WHERE source_id = ${previousVersionId}
    `);
    
    serverLogger.info(`[Ingestion] Superseded previous version ID: ${previousVersionId}`);
  }
  
  // Process chunks
  const chunks = Array.isArray(content) ? content : chunkContent(content);
  
  serverLogger.info(`[Ingestion] Processing ${chunks.length} chunks`);
  
  let chunksCreated = 0;
  
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const contentHash = createHash('sha256').update(chunk.content).digest('hex');
    
    await db.execute(sql`
      INSERT INTO source_chunks (
        source_id, chunk_index, chunk_type, section_path, heading,
        content, content_hash, char_start, char_end, version
      ) VALUES (
        ${sourceId}, ${i}, ${chunk.chunkType}, ${chunk.sectionPath || null},
        ${chunk.heading || null}, ${chunk.content}, ${contentHash},
        ${chunk.charStart || null}, ${chunk.charEnd || null}, ${source.version || null}
      )
    `);
    
    chunksCreated++;
  }
  
  serverLogger.info(`[Ingestion] Created ${chunksCreated} chunks`);
  
  // Generate embeddings if requested
  let embeddingsGenerated = 0;
  
  if (generateEmbeddings) {
    // TODO: Implement embedding generation
    // This would call the OpenAI API to generate embeddings for each chunk
    serverLogger.info(`[Ingestion] Embedding generation requested but not yet implemented`);
  }
  
  serverLogger.info(`[Ingestion] Completed ingestion for: ${source.name}`);
  
  return {
    sourceId,
    chunksCreated,
    isNewVersion,
    previousVersionId,
    embeddingsGenerated,
  };
}

// ============================================================================
// Batch Ingestion
// ============================================================================

export interface BatchIngestionItem {
  source: IngestionSourceInput;
  content: string | IngestionChunkInput[];
}

export interface BatchIngestionResult {
  totalProcessed: number;
  successful: number;
  failed: number;
  results: Array<{
    externalId: string;
    success: boolean;
    result?: IngestionResult;
    error?: string;
  }>;
}

/**
 * Ingest multiple documents in batch
 */
export async function ingestBatch(
  items: BatchIngestionItem[],
  options: IngestionOptions = {}
): Promise<BatchIngestionResult> {
  serverLogger.info(`[Ingestion] Starting batch ingestion of ${items.length} items`);
  
  const results: BatchIngestionResult['results'] = [];
  let successful = 0;
  let failed = 0;
  
  for (const item of items) {
    try {
      const result = await ingestDocument(item.source, item.content, options);
      results.push({
        externalId: item.source.externalId,
        success: true,
        result,
      });
      successful++;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      results.push({
        externalId: item.source.externalId,
        success: false,
        error: errorMessage,
      });
      failed++;
      serverLogger.error(`[Ingestion] Failed to ingest ${item.source.externalId}: ${errorMessage}`);
    }
  }
  
  serverLogger.info(`[Ingestion] Batch complete: ${successful} successful, ${failed} failed`);
  
  return {
    totalProcessed: items.length,
    successful,
    failed,
    results,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get ingestion statistics
 */
export async function getIngestionStats(): Promise<{
  totalSources: number;
  activeSources: number;
  totalChunks: number;
  activeChunks: number;
  sourcesByType: Record<string, number>;
  recentIngestions: Array<{
    id: number;
    name: string;
    sourceType: string;
    version: string;
    ingestedAt: Date;
  }>;
}> {
  const db = await getDb();
  if (!db) {
    return {
      totalSources: 0,
      activeSources: 0,
      totalChunks: 0,
      activeChunks: 0,
      sourcesByType: {},
      recentIngestions: [],
    };
  }
  
  const [totalSourcesResult] = await db.execute(sql`SELECT COUNT(*) as count FROM sources`);
  const [activeSourcesResult] = await db.execute(sql`SELECT COUNT(*) as count FROM sources WHERE status = 'active'`);
  const [totalChunksResult] = await db.execute(sql`SELECT COUNT(*) as count FROM source_chunks`);
  const [activeChunksResult] = await db.execute(sql`SELECT COUNT(*) as count FROM source_chunks WHERE is_active = 1`);
  
  const [sourcesByTypeResult] = await db.execute(sql`
    SELECT source_type, COUNT(*) as count FROM sources 
    WHERE status = 'active' 
    GROUP BY source_type
  `);
  
  const [recentResult] = await db.execute(sql`
    SELECT id, name, source_type, version, created_at 
    FROM sources 
    ORDER BY created_at DESC 
    LIMIT 10
  `);
  
  return {
    totalSources: (totalSourcesResult as any[])[0].count,
    activeSources: (activeSourcesResult as any[])[0].count,
    totalChunks: (totalChunksResult as any[])[0].count,
    activeChunks: (activeChunksResult as any[])[0].count,
    sourcesByType: Object.fromEntries(
      (sourcesByTypeResult as any[]).map(r => [r.source_type, r.count])
    ),
    recentIngestions: (recentResult as any[]).map(r => ({
      id: r.id,
      name: r.name,
      sourceType: r.source_type,
      version: r.version,
      ingestedAt: new Date(r.created_at),
    })),
  };
}

// ============================================================================
// Exports
// ============================================================================

export default {
  ingestDocument,
  ingestBatch,
  chunkContent,
  getIngestionStats,
  AuthorityLevelByType,
};
