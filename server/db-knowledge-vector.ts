/**
 * Vector-Based Knowledge Search
 *
 * Fast semantic search using OpenAI embeddings and cosine similarity.
 * Replaces slow LLM-based scoring with pre-computed vector embeddings.
 *
 * Performance: <5s per query (vs 60s with LLM scoring)
 */

import { getDb } from "./db";
import { sql } from "drizzle-orm";
import { generateEmbedding, cosineSimilarity } from "./_core/embedding";
import { regulations, gs1Standards } from "../drizzle/schema";
import { serverLogger } from "./_core/logger-wiring";


/**
 * Search result with similarity score
 */
export interface VectorSearchResult {
  id: number;
  type: "regulation" | "standard";
  title: string;
  description?: string | null;
  similarity: number;
  url?: string;
}

/**
 * Search regulations and standards using vector similarity
 *
 * @param query - User's natural language question
 * @param limit - Maximum number of results to return
 * @returns Sorted array of results by similarity score
 */
export async function vectorSearchKnowledge(
  query: string,
  limit: number = 10
): Promise<VectorSearchResult[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    // Step 1: Generate embedding for query (~500ms)
    const startTime = Date.now();
    const queryEmbedding = await generateEmbedding(query);
    console.log(
      `[VectorSearch] Query embedding generated in ${Date.now() - startTime}ms`
    );

    // Step 2: Fetch all regulations with embeddings
    const allRegulations = await db
      .select({
        id: regulations.id,
        celexId: regulations.celexId,
        title: regulations.title,
        description: regulations.description,
        embedding: regulations.embedding,
        sourceUrl: regulations.sourceUrl,
      })
      .from(regulations)
      .where(sql`${regulations.embedding} IS NOT NULL`);

    // Step 3: Fetch all standards with embeddings
    const allStandards = await db
      .select({
        id: gs1Standards.id,
        standardCode: gs1Standards.standardCode,
        standardName: gs1Standards.standardName,
        description: gs1Standards.description,
        embedding: gs1Standards.embedding,
        referenceUrl: gs1Standards.referenceUrl,
      })
      .from(gs1Standards)
      .where(sql`${gs1Standards.embedding} IS NOT NULL`);

    console.log(
      `[VectorSearch] Fetched ${allRegulations.length} regulations, ${allStandards.length} standards`
    );

    // Step 4: Calculate cosine similarity for all items
    const results: VectorSearchResult[] = [];

    // Process regulations
    for (const reg of allRegulations) {
      if (!reg.embedding || !Array.isArray(reg.embedding)) continue;

      const similarity = cosineSimilarity(
        queryEmbedding.embedding,
        reg.embedding
      );

      results.push({
        id: reg.id,
        type: "regulation",
        title: reg.title,
        description: reg.description,
        similarity,
        url: reg.sourceUrl || undefined,
      });
    }

    // Process standards
    for (const std of allStandards) {
      if (!std.embedding || !Array.isArray(std.embedding)) continue;

      const similarity = cosineSimilarity(
        queryEmbedding.embedding,
        std.embedding
      );

      results.push({
        id: std.id,
        type: "standard",
        title: std.standardName,
        description: std.description,
        similarity,
        url: std.referenceUrl || undefined,
      });
    }

    // Step 5: Sort by similarity (descending) and return top N
    const sortedResults = results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    const totalTime = Date.now() - startTime;
    console.log(
      `[VectorSearch] Found ${sortedResults.length} results in ${totalTime}ms`
    );

    return sortedResults;
  } catch (error) {
    serverLogger.error("[VectorSearch] Search failed:", error);
    return [];
  }
}

/**
 * Get detailed content for a search result
 */
export async function getSearchResultContent(
  type: "regulation" | "standard",
  id: number
): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    if (type === "regulation") {
      const [reg] = await db
        .select()
        .from(regulations)
        .where(sql`${regulations.id} = ${id}`)
        .limit(1);

      if (!reg) return null;

      return `${reg.title}\n\n${reg.description || ""}\n\nCELEX ID: ${reg.celexId}\nType: ${reg.regulationType}\nEffective Date: ${reg.effectiveDate}`;
    } else {
      const [std] = await db
        .select()
        .from(gs1Standards)
        .where(sql`${gs1Standards.id} = ${id}`)
        .limit(1);

      if (!std) return null;

      return `${std.standardName}\n\n${std.description || ""}\n\nStandard Code: ${std.standardCode}\nCategory: ${std.category}\nScope: ${std.scope}`;
    }
  } catch (error) {
    serverLogger.error("[VectorSearch] Failed to get content:", error);
    return null;
  }
}

/**
 * Build context for LLM from vector search results
 */
export async function buildContextFromVectorResults(
  results: VectorSearchResult[]
): Promise<string> {
  const contextParts: string[] = [];

  for (let i = 0; i < results.length; i++) {
    const result = results[i];
    const content = await getSearchResultContent(result.type, result.id);

    if (content) {
      contextParts.push(
        `[Source ${i + 1}: ${result.title} (${Math.round(result.similarity * 100)}% relevant)]\n${content}`
      );
    }
  }

  return contextParts.join("\n\n---\n\n");
}
