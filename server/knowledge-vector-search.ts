/**
 * Enhanced Knowledge Vector Search
 * 
 * Uses the knowledge_embeddings table for comprehensive semantic search
 * across all content types: regulations, standards, ESRS datapoints,
 * news, initiatives, DPP components, and CBV vocabularies.
 * 
 * Key improvements over db-knowledge-vector.ts:
 * - Searches the unified knowledge_embeddings table (1000+ items)
 * - Supports filtering by sourceType, authority_level, semantic_layer
 * - Uses pre-computed embeddings for fast retrieval
 * - Includes metadata for better result ranking
 */

import { getDb } from "./db";
import { sql } from "drizzle-orm";
import { generateEmbedding, cosineSimilarity } from "./_core/embedding";
import { serverLogger } from "./_core/logger-wiring";

/**
 * Source types available in knowledge_embeddings
 */
export type KnowledgeSourceType = 
  | 'regulation'
  | 'gs1_standard'
  | 'esrs_datapoint'
  | 'dpp_component'
  | 'cbv_vocabulary'
  | 'news'
  | 'initiative';

/**
 * Authority levels for filtering
 */
export type AuthorityLevel = 'authoritative' | 'official' | 'guidance' | 'informational';

/**
 * Semantic layers for filtering
 */
export type SemanticLayer = 'juridisch' | 'normatief' | 'operationeel';

/**
 * Search result from knowledge_embeddings
 */
export interface KnowledgeSearchResult {
  id: number;
  sourceType: KnowledgeSourceType;
  sourceId: number;
  title: string;
  content: string;
  url?: string | null;
  similarity: number;
  authorityLevel?: AuthorityLevel;
  semanticLayer?: SemanticLayer;
  sourceAuthority?: string;
  embeddingModel?: string;
}

/**
 * Search configuration options
 */
export interface KnowledgeSearchConfig {
  /** Maximum number of results */
  limit: number;
  /** Minimum similarity threshold (0-1) */
  threshold: number;
  /** Filter by source types */
  sourceTypes?: KnowledgeSourceType[];
  /** Filter by authority level */
  authorityLevel?: AuthorityLevel;
  /** Filter by semantic layer */
  semanticLayer?: SemanticLayer;
  /** Boost factor for authoritative sources */
  authorityBoost: number;
}

const DEFAULT_CONFIG: KnowledgeSearchConfig = {
  limit: 10,
  threshold: 0.3,
  authorityBoost: 1.2,
};

/**
 * Search knowledge embeddings using vector similarity
 * 
 * @param query - User's natural language question
 * @param config - Search configuration options
 * @returns Sorted array of results by similarity score
 */
export async function searchKnowledgeEmbeddings(
  query: string,
  config: Partial<KnowledgeSearchConfig> = {}
): Promise<KnowledgeSearchResult[]> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const db = await getDb();
  if (!db) return [];

  const startTime = Date.now();
  serverLogger.info(`[KnowledgeSearch] Starting search for: "${query.slice(0, 50)}..."`);

  try {
    // Step 1: Generate embedding for query
    const queryEmbedding = await generateEmbedding(query);
    serverLogger.info(`[KnowledgeSearch] Query embedding generated in ${Date.now() - startTime}ms`);

    // Step 2: Fetch embeddings from knowledge_embeddings table
    const { knowledgeEmbeddings } = await import("../drizzle/schema");
    
    // Build query with optional filters
    let dbQuery = db
      .select({
        id: knowledgeEmbeddings.id,
        sourceType: knowledgeEmbeddings.sourceType,
        sourceId: knowledgeEmbeddings.sourceId,
        title: knowledgeEmbeddings.title,
        content: knowledgeEmbeddings.content,
        url: knowledgeEmbeddings.url,
        embedding: knowledgeEmbeddings.embedding,
        authorityLevel: knowledgeEmbeddings.authority_level,
        semanticLayer: knowledgeEmbeddings.semantic_layer,
        sourceAuthority: knowledgeEmbeddings.source_authority,
        embeddingModel: knowledgeEmbeddings.embeddingModel,
      })
      .from(knowledgeEmbeddings)
      .where(sql`${knowledgeEmbeddings.embedding} IS NOT NULL AND JSON_LENGTH(${knowledgeEmbeddings.embedding}) > 0`);

    const allEmbeddings = await dbQuery;
    serverLogger.info(`[KnowledgeSearch] Fetched ${allEmbeddings.length} embeddings`);

    // Step 3: Calculate similarity and filter
    const results: KnowledgeSearchResult[] = [];

    for (const item of allEmbeddings) {
      // Skip if no valid embedding
      if (!item.embedding || !Array.isArray(item.embedding) || item.embedding.length === 0) {
        continue;
      }

      // Apply source type filter
      if (cfg.sourceTypes && cfg.sourceTypes.length > 0) {
        if (!cfg.sourceTypes.includes(item.sourceType as KnowledgeSourceType)) {
          continue;
        }
      }

      // Apply authority level filter
      if (cfg.authorityLevel && item.authorityLevel !== cfg.authorityLevel) {
        continue;
      }

      // Apply semantic layer filter
      if (cfg.semanticLayer && item.semanticLayer !== cfg.semanticLayer) {
        continue;
      }

      // Calculate cosine similarity
      let similarity = cosineSimilarity(queryEmbedding.embedding, item.embedding);

      // Apply authority boost for authoritative sources
      if (item.authorityLevel === 'authoritative' || item.authorityLevel === 'official') {
        similarity *= cfg.authorityBoost;
        // Cap at 1.0
        similarity = Math.min(similarity, 1.0);
      }

      // Apply threshold filter
      if (similarity < cfg.threshold) {
        continue;
      }

      results.push({
        id: item.id,
        sourceType: item.sourceType as KnowledgeSourceType,
        sourceId: item.sourceId,
        title: item.title,
        content: item.content,
        url: item.url,
        similarity,
        authorityLevel: item.authorityLevel as AuthorityLevel,
        semanticLayer: item.semanticLayer as SemanticLayer,
        sourceAuthority: item.sourceAuthority || undefined,
        embeddingModel: item.embeddingModel || undefined,
      });
    }

    // Step 4: Sort by similarity and limit
    results.sort((a, b) => b.similarity - a.similarity);
    const limitedResults = results.slice(0, cfg.limit);

    serverLogger.info(
      `[KnowledgeSearch] Returning ${limitedResults.length} results in ${Date.now() - startTime}ms`
    );

    return limitedResults;
  } catch (error) {
    serverLogger.error("[KnowledgeSearch] Search failed:", error);
    return [];
  }
}

/**
 * Get related content using mappings
 * 
 * Uses regulation_esrs_mappings and gs1_esrs_mappings to find
 * related content for a given source.
 */
export async function getRelatedContent(
  sourceType: 'regulation' | 'gs1_standard' | 'esrs_datapoint',
  sourceId: number,
  limit: number = 5
): Promise<KnowledgeSearchResult[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const { knowledgeEmbeddings, regulationEsrsMappings, gs1EsrsMappings } = 
      await import("../drizzle/schema");

    let relatedIds: number[] = [];

    if (sourceType === 'regulation') {
      // Find ESRS datapoints mapped to this regulation
      const mappings = await db
        .select({ datapointId: regulationEsrsMappings.datapointId })
        .from(regulationEsrsMappings)
        .where(sql`${regulationEsrsMappings.regulationId} = ${sourceId}`)
        .limit(limit * 2);
      
      relatedIds = mappings.map(m => m.datapointId);
    } else if (sourceType === 'gs1_standard') {
      // Find ESRS datapoints mapped to this GS1 standard
      const mappings = await db
        .select({ datapointId: gs1EsrsMappings.datapointId })
        .from(gs1EsrsMappings)
        .where(sql`${gs1EsrsMappings.standardId} = ${sourceId}`)
        .limit(limit * 2);
      
      relatedIds = mappings.map(m => m.datapointId);
    } else if (sourceType === 'esrs_datapoint') {
      // Find regulations and standards mapped to this datapoint
      const regMappings = await db
        .select({ regulationId: regulationEsrsMappings.regulationId })
        .from(regulationEsrsMappings)
        .where(sql`${regulationEsrsMappings.datapointId} = ${sourceId}`)
        .limit(limit);
      
      const gs1Mappings = await db
        .select({ standardId: gs1EsrsMappings.standardId })
        .from(gs1EsrsMappings)
        .where(sql`${gs1EsrsMappings.datapointId} = ${sourceId}`)
        .limit(limit);

      // Get embeddings for related regulations and standards
      const results: KnowledgeSearchResult[] = [];
      
      for (const m of regMappings) {
        const embedding = await db
          .select()
          .from(knowledgeEmbeddings)
          .where(sql`${knowledgeEmbeddings.sourceType} = 'regulation' AND ${knowledgeEmbeddings.sourceId} = ${m.regulationId}`)
          .limit(1);
        
        if (embedding.length > 0) {
          results.push({
            id: embedding[0].id,
            sourceType: 'regulation',
            sourceId: embedding[0].sourceId,
            title: embedding[0].title,
            content: embedding[0].content,
            url: embedding[0].url,
            similarity: 1.0, // Direct mapping = high relevance
            authorityLevel: embedding[0].authority_level as AuthorityLevel,
            semanticLayer: embedding[0].semantic_layer as SemanticLayer,
          });
        }
      }

      for (const m of gs1Mappings) {
        const embedding = await db
          .select()
          .from(knowledgeEmbeddings)
          .where(sql`${knowledgeEmbeddings.sourceType} = 'gs1_standard' AND ${knowledgeEmbeddings.sourceId} = ${m.standardId}`)
          .limit(1);
        
        if (embedding.length > 0) {
          results.push({
            id: embedding[0].id,
            sourceType: 'gs1_standard',
            sourceId: embedding[0].sourceId,
            title: embedding[0].title,
            content: embedding[0].content,
            url: embedding[0].url,
            similarity: 1.0,
            authorityLevel: embedding[0].authority_level as AuthorityLevel,
            semanticLayer: embedding[0].semantic_layer as SemanticLayer,
          });
        }
      }

      return results.slice(0, limit);
    }

    // Fetch embeddings for related ESRS datapoints
    if (relatedIds.length === 0) return [];

    const results: KnowledgeSearchResult[] = [];
    for (const datapointId of relatedIds.slice(0, limit)) {
      const embedding = await db
        .select()
        .from(knowledgeEmbeddings)
        .where(sql`${knowledgeEmbeddings.sourceType} = 'esrs_datapoint' AND ${knowledgeEmbeddings.sourceId} = ${datapointId}`)
        .limit(1);
      
      if (embedding.length > 0) {
        results.push({
          id: embedding[0].id,
          sourceType: 'esrs_datapoint',
          sourceId: embedding[0].sourceId,
          title: embedding[0].title,
          content: embedding[0].content,
          url: embedding[0].url,
          similarity: 1.0,
          authorityLevel: embedding[0].authority_level as AuthorityLevel,
          semanticLayer: embedding[0].semantic_layer as SemanticLayer,
        });
      }
    }

    return results;
  } catch (error) {
    serverLogger.error("[KnowledgeSearch] Failed to get related content:", error);
    return [];
  }
}

/**
 * Get knowledge base statistics by source type
 */
export async function getKnowledgeStats(): Promise<Record<string, number>> {
  const db = await getDb();
  if (!db) return {};

  try {
    const { knowledgeEmbeddings } = await import("../drizzle/schema");

    const stats = await db
      .select({
        sourceType: knowledgeEmbeddings.sourceType,
        count: sql<number>`COUNT(*)`,
      })
      .from(knowledgeEmbeddings)
      .groupBy(knowledgeEmbeddings.sourceType);

    const result: Record<string, number> = {};
    for (const stat of stats) {
      result[stat.sourceType] = Number(stat.count);
    }

    return result;
  } catch (error) {
    serverLogger.error("[KnowledgeSearch] Failed to get stats:", error);
    return {};
  }
}
