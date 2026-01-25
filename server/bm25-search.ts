/**
 * BM25 Keyword Search Module
 * 
 * Provides keyword-based search using BM25 algorithm to complement
 * vector-based semantic search. Together they form hybrid search.
 * 
 * BM25 excels at exact keyword matching, which vector search can miss.
 */

import bm25 from 'wink-bm25-text-search';
import nlp from 'wink-nlp-utils';
import { getDb } from './db';
import { regulations, gs1Standards } from '../drizzle/schema';
import { sql } from 'drizzle-orm';
import { serverLogger } from './_core/logger-wiring';

/**
 * Document structure for BM25 indexing
 */
interface BM25Document {
  id: number;
  type: 'regulation' | 'standard';
  title: string;
  description: string;
  url?: string;
  body: string; // Combined searchable text
}

/**
 * BM25 search result
 */
export interface BM25SearchResult {
  id: number;
  type: 'regulation' | 'standard';
  title: string;
  description: string | undefined;
  url: string | undefined;
  score: number;}

// Singleton search engine instance
let searchEngine: ReturnType<typeof bm25> | null = null;
let documents: Map<string, BM25Document> = new Map();
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

/**
 * Configure the BM25 search engine with NLP pipeline
 */
function createSearchEngine(): ReturnType<typeof bm25> {
  const engine = bm25();
  
  // Define field weights - title is more important than description
  engine.defineConfig({
    fldWeights: {
      title: 2,
      body: 1,
    },
    bm25Params: {
      k1: 1.2, // Term frequency saturation
      b: 0.75, // Length normalization
    },
  });

  // Define text preparation pipeline
  engine.definePrepTasks([
    nlp.string.lowerCase,
    nlp.string.tokenize0,
    nlp.tokens.removeWords,
    nlp.tokens.stem,
    nlp.tokens.propagateNegations,
  ]);

  return engine;
}

/**
 * Initialize the BM25 index with regulations and standards
 * Call this on server startup or when content changes
 */
export async function initializeBM25Index(): Promise<void> {
  // Prevent multiple simultaneous initializations
  if (initializationPromise) {
    return initializationPromise;
  }

  initializationPromise = (async () => {
    const startTime = Date.now();
    serverLogger.info('[BM25] Initializing search index...');

    try {
      const db = await getDb();
      if (!db) {
        serverLogger.error('[BM25] Database not available');
        return;
      }

      // Create fresh search engine
      searchEngine = createSearchEngine();
      documents.clear();

      // Fetch all regulations
      const allRegulations = await db
        .select({
          id: regulations.id,
          title: regulations.title,
          description: regulations.description,
          celexId: regulations.celexId,
          regulationType: regulations.regulationType,
          sourceUrl: regulations.sourceUrl,
        })
        .from(regulations);

      // Fetch all standards
      const allStandards = await db
        .select({
          id: gs1Standards.id,
          standardName: gs1Standards.standardName,
          description: gs1Standards.description,
          standardCode: gs1Standards.standardCode,
          category: gs1Standards.category,
          referenceUrl: gs1Standards.referenceUrl,
        })
        .from(gs1Standards);

      // Index regulations
      for (const reg of allRegulations) {
        const docId = `regulation_${reg.id}`;
        const body = [
          reg.title,
          reg.description || '',
          reg.celexId || '',
          reg.regulationType || '',
        ].join(' ');

        const doc: BM25Document = {
          id: reg.id,
          type: 'regulation',
          title: reg.title,
          description: reg.description || '',
          url: reg.sourceUrl || undefined,
          body,
        };

        documents.set(docId, doc);
        searchEngine!.addDoc({ title: reg.title, body }, docId);
      }

      // Index standards
      for (const std of allStandards) {
        const docId = `standard_${std.id}`;
        const body = [
          std.standardName,
          std.description || '',
          std.standardCode || '',
          std.category || '',
        ].join(' ');

        const doc: BM25Document = {
          id: std.id,
          type: 'standard',
          title: std.standardName,
          description: std.description || '',
          url: std.referenceUrl || undefined,
          body,
        };

        documents.set(docId, doc);
        searchEngine!.addDoc({ title: std.standardName, body }, docId);
      }

      // Consolidate the index for searching
      searchEngine!.consolidate();

      isInitialized = true;
      const duration = Date.now() - startTime;
      serverLogger.info(
        `[BM25] Index initialized with ${allRegulations.length} regulations and ${allStandards.length} standards in ${duration}ms`
      );
    } catch (error) {
      serverLogger.error('[BM25] Failed to initialize index:', error);
      isInitialized = false;
    }
  })();

  return initializationPromise;
}

/**
 * Search using BM25 keyword matching
 * 
 * @param query - User's search query
 * @param limit - Maximum number of results
 * @returns Array of search results sorted by BM25 score
 */
export function bm25Search(query: string, limit: number = 10): BM25SearchResult[] {
  if (!isInitialized || !searchEngine) {
    serverLogger.warn('[BM25] Search engine not initialized, returning empty results');
    return [];
  }

  try {
    const startTime = Date.now();
    
    // Perform BM25 search
    const results = searchEngine.search(query, limit);
    
    // Map results to our format
    const mappedResults = results
      .map((result: [string, number]): BM25SearchResult | null => {
        const [docId, score] = result;
        const doc = documents.get(docId);
        
        if (!doc) return null;
        
        return {
          id: doc.id,
          type: doc.type,
          title: doc.title,
          description: doc.description || undefined,
          url: doc.url,
          score,
        };
      });
    
    const searchResults: BM25SearchResult[] = mappedResults.filter(
      (r): r is BM25SearchResult => r !== null
    );

    const duration = Date.now() - startTime;
    serverLogger.info(`[BM25] Search for "${query.slice(0, 50)}..." returned ${searchResults.length} results in ${duration}ms`);

    return searchResults;
  } catch (error) {
    serverLogger.error('[BM25] Search failed:', error);
    return [];
  }
}

/**
 * Check if BM25 index is ready
 */
export function isBM25Ready(): boolean {
  return isInitialized && searchEngine !== null;
}

/**
 * Get index statistics
 */
export function getBM25Stats(): { documentCount: number; isReady: boolean } {
  return {
    documentCount: documents.size,
    isReady: isInitialized,
  };
}

/**
 * Refresh the BM25 index (call after content updates)
 */
export async function refreshBM25Index(): Promise<void> {
  isInitialized = false;
  initializationPromise = null;
  await initializeBM25Index();
}
