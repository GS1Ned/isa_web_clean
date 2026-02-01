/**
 * Hybrid Search Module
 * 
 * Combines vector-based semantic search with BM25 keyword search
 * using Reciprocal Rank Fusion (RRF) for optimal retrieval.
 * 
 * Benefits:
 * - Vector search captures semantic meaning
 * - BM25 captures exact keyword matches
 * - RRF merges results without needing score normalization
 */

import { vectorSearchKnowledge, type VectorSearchResult } from './db-knowledge-vector';
import { bm25Search, isBM25Ready, type BM25SearchResult } from './bm25-search';
import { serverLogger } from './_core/logger-wiring';
import { classifyAuthority, type AuthorityLevel, type AuthorityInfo } from './authority-model';

/**
 * Hybrid search result combining both search methods
 */
export interface HybridSearchResult {
  id: number;
  type: 'regulation' | 'standard';
  title: string;
  description: string | null;
  url?: string;
  // Scoring details
  hybridScore: number;
  vectorScore?: number;
  bm25Score?: number;
  vectorRank?: number;
  bm25Rank?: number;
  // Authority information
  authorityLevel: AuthorityLevel;
  authorityScore: number;
}

/**
 * Configuration for hybrid search
 */
export interface HybridSearchConfig {
  /** Weight for vector search results (0.0 - 1.0) */
  vectorWeight: number;
  /** Weight for BM25 search results (0.0 - 1.0) */
  bm25Weight: number;
  /** Maximum number of results to return */
  limit: number;
  /** RRF constant k (default 60, higher = more weight to lower ranks) */
  rrfK: number;
  /** Minimum similarity threshold for vector results */
  vectorThreshold: number;
  /** Minimum score threshold for BM25 results */
  bm25Threshold: number;
  /** Optional sector filter to boost sector-specific content */
  sectorFilter?: string;
}

const DEFAULT_CONFIG: HybridSearchConfig = {
  vectorWeight: 0.7,
  bm25Weight: 0.3,
  limit: 10,
  rrfK: 60,
  vectorThreshold: 0.3,
  bm25Threshold: 0,
};

/**
 * Reciprocal Rank Fusion (RRF) score calculation
 * 
 * RRF(d) = Σ 1 / (k + rank(d))
 * 
 * This method doesn't require score normalization and works well
 * when combining results from different ranking systems.
 */
function calculateRRFScore(ranks: number[], k: number = 60): number {
  return ranks.reduce((sum, rank) => sum + 1 / (k + rank), 0);
}

/**
 * Get sector-specific keywords for boosting search results
 */
function getSectorKeywords(sector: string): string[] {
  const sectorKeywordMap: Record<string, string[]> = {
    fmcg: ['fmcg', 'food', 'beverage', 'levensmiddelen', 'drogisterij', 'nutrition', 'voeding', 'grocery'],
    diy: ['diy', 'doe-het-zelf', 'garden', 'tuin', 'pet', 'dier', 'bouwmarkt', 'hardware'],
    healthcare: ['healthcare', 'gezondheidszorg', 'medical', 'medisch', 'pharma', 'zorg', 'hospital'],
    fashion: ['fashion', 'mode', 'textile', 'textiel', 'apparel', 'kleding', 'footwear', 'schoenen'],
    sustainability: ['sustainability', 'duurzaamheid', 'eco', 'carbon', 'co2', 'dpp', 'circular', 'environment'],
    retail: ['retail', 'store', 'winkel', 'pos', 'checkout', 'inventory', 'voorraad'],
    agriculture: ['agriculture', 'agri', 'farm', 'landbouw', 'crop', 'livestock', 'fresh', 'vers'],
    construction: ['construction', 'bouw', 'building', 'material', 'cement', 'steel', 'installatie'],
  };
  return sectorKeywordMap[sector] || [];
}

/**
 * Perform hybrid search combining vector and BM25 results
 * 
 * @param query - User's search query
 * @param config - Search configuration (optional)
 * @returns Array of hybrid search results sorted by combined score
 */
export async function hybridSearch(
  query: string,
  config: Partial<HybridSearchConfig> = {}
): Promise<HybridSearchResult[]> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const startTime = Date.now();

  serverLogger.info(`[HybridSearch] Starting search for: "${query.slice(0, 50)}..."`);

  // Run both searches in parallel
  const [vectorResults, bm25Results] = await Promise.all([
    vectorSearchKnowledge(query, cfg.limit * 2), // Fetch more for merging
    isBM25Ready() ? Promise.resolve(bm25Search(query, cfg.limit * 2)) : Promise.resolve([]),
  ]);

  serverLogger.info(
    `[HybridSearch] Vector: ${vectorResults.length} results, BM25: ${bm25Results.length} results`
  );

  // If BM25 is not ready, fall back to vector-only search
  if (!isBM25Ready() || bm25Results.length === 0) {
    serverLogger.warn('[HybridSearch] BM25 not available, using vector-only search');
    return vectorResults
      .filter(r => r.similarity >= cfg.vectorThreshold)
      .slice(0, cfg.limit)
      .map(r => {
        const authorityInfo = classifyAuthority({
          type: r.type,
          title: r.title,
          url: r.url,
        });
        return {
          id: r.id,
          type: r.type,
          title: r.title,
          description: r.description || null,
          url: r.url,
          hybridScore: r.similarity,
          vectorScore: r.similarity,
          vectorRank: 1,
          authorityLevel: authorityInfo.level,
          authorityScore: authorityInfo.score,
        };
      });
  }

  // Create maps for quick lookup
  const vectorMap = new Map<string, { result: VectorSearchResult; rank: number }>();
  const bm25Map = new Map<string, { result: BM25SearchResult; rank: number }>();

  // Index vector results with ranks
  vectorResults
    .filter(r => r.similarity >= cfg.vectorThreshold)
    .forEach((result, index) => {
      const key = `${result.type}_${result.id}`;
      vectorMap.set(key, { result, rank: index + 1 });
    });

  // Index BM25 results with ranks
  bm25Results
    .filter(r => r.score >= cfg.bm25Threshold)
    .forEach((result, index) => {
      const key = `${result.type}_${result.id}`;
      bm25Map.set(key, { result, rank: index + 1 });
    });

  // Merge results using RRF
  const vectorKeys = Array.from(vectorMap.keys());
  const bm25Keys = Array.from(bm25Map.keys());
  const allKeys = Array.from(new Set([...vectorKeys, ...bm25Keys]));
  const mergedResults: HybridSearchResult[] = [];

  for (const key of allKeys) {
    const vectorEntry = vectorMap.get(key);
    const bm25Entry = bm25Map.get(key);

    // Calculate RRF score with weights
    const ranks: number[] = [];
    if (vectorEntry) {
      ranks.push(vectorEntry.rank / cfg.vectorWeight);
    }
    if (bm25Entry) {
      ranks.push(bm25Entry.rank / cfg.bm25Weight);
    }

    const rrfScore = calculateRRFScore(ranks, cfg.rrfK);

    // Get document details from whichever source has it
    const doc = vectorEntry?.result || bm25Entry?.result;
    if (!doc) continue;

    // Classify authority level
    const authorityInfo = classifyAuthority({
      type: doc.type,
      title: doc.title,
      url: doc.url,
    });

    mergedResults.push({
      id: doc.id,
      type: doc.type,
      title: doc.title,
      description: 'description' in doc ? (doc.description || null) : null,
      url: doc.url,
      hybridScore: rrfScore,
      vectorScore: vectorEntry?.result.similarity,
      bm25Score: bm25Entry?.result.score,
      vectorRank: vectorEntry?.rank,
      bm25Rank: bm25Entry?.rank,
      authorityLevel: authorityInfo.level,
      authorityScore: authorityInfo.score,
    });
  }

  // Apply sector boost if filter is specified
  if (cfg.sectorFilter) {
    const sectorKeywords = getSectorKeywords(cfg.sectorFilter);
    for (const result of mergedResults) {
      const content = `${result.title} ${result.description || ''}`.toLowerCase();
      const matchesCount = sectorKeywords.filter(kw => content.includes(kw)).length;
      if (matchesCount > 0) {
        // Boost score by 20% per matching keyword (max 60% boost)
        const boost = Math.min(0.6, matchesCount * 0.2);
        result.hybridScore *= (1 + boost);
      }
    }
  }

  // Sort by hybrid score (descending) and limit results
  const sortedResults = mergedResults
    .sort((a, b) => b.hybridScore - a.hybridScore)
    .slice(0, cfg.limit);

  const duration = Date.now() - startTime;
  serverLogger.info(
    `[HybridSearch] Merged ${sortedResults.length} results in ${duration}ms`
  );

  // Log top results for debugging
  if (sortedResults.length > 0) {
    serverLogger.info(
      `[HybridSearch] Top result: "${sortedResults[0].title}" ` +
      `(hybrid=${sortedResults[0].hybridScore.toFixed(4)}, ` +
      `vector=${sortedResults[0].vectorScore?.toFixed(4) || 'N/A'}, ` +
      `bm25=${sortedResults[0].bm25Score?.toFixed(4) || 'N/A'})`
    );
  }

  return sortedResults;
}

/**
 * Get hybrid search statistics
 */
export function getHybridSearchStats(): {
  bm25Ready: boolean;
  defaultConfig: HybridSearchConfig;
} {
  return {
    bm25Ready: isBM25Ready(),
    defaultConfig: DEFAULT_CONFIG,
  };
}

/**
 * Build context string from hybrid search results for LLM
 */
export async function buildContextFromHybridResults(
  results: HybridSearchResult[]
): Promise<string> {
  const contextParts: string[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    
    // Format relevance info
    const relevanceInfo = [];
    if (result.vectorScore !== undefined) {
      relevanceInfo.push(`semantic: ${Math.round(result.vectorScore * 100)}%`);
    }
    if (result.bm25Score !== undefined) {
      relevanceInfo.push(`keyword: ${result.bm25Score.toFixed(2)}`);
    }
    const relevanceStr = relevanceInfo.length > 0 
      ? ` (${relevanceInfo.join(', ')})` 
      : '';

    contextParts.push(
      `[Source ${i + 1}: ${result.title}${relevanceStr}]\n` +
      `Type: ${result.type}\n` +
      `${result.description || 'No description available.'}\n` +
      (result.url ? `URL: ${result.url}` : '')
    );
  }

  return contextParts.join('\n\n---\n\n');
}
