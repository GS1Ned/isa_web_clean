/**
 * Vector-Based Knowledge Search
 *
 * Fast semantic search using OpenAI embeddings and cosine similarity.
 * Replaces slow LLM-based scoring with pre-computed vector embeddings.
 *
 * Performance: <5s per query (vs 60s with LLM scoring)
 * 
 * v2.0 Changes:
 * - Added ESRS datapoints search for CSRD/ESRS queries
 * - Added knowledge embeddings search for pre-computed chunks
 * - Improved relevance for ESG compliance queries
 */

import { getDb } from "./db";
import { sql } from "drizzle-orm";
import { generateEmbedding, cosineSimilarity } from "./_core/embedding";
import { regulations, gs1Standards, esrsDatapoints, knowledgeEmbeddings } from "../drizzle/schema";
import { serverLogger } from "./_core/logger-wiring";


/**
 * Search result with similarity score
 */
export interface VectorSearchResult {
  id: number;
  type: "regulation" | "standard" | "esrs_datapoint" | "knowledge";
  title: string;
  description?: string | null;
  similarity: number;
  url?: string;
  // Additional metadata for ESRS datapoints
  esrsStandard?: string;
  disclosureRequirement?: string;
  dataType?: string;
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
    serverLogger.info(`[VectorSearch] Query embedding generated in ${Date.now() - startTime}ms`);

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

    // Step 4: Fetch ESRS datapoints (for CSRD/ESRS queries)
    const allEsrsDatapoints = await db
      .select({
        id: esrsDatapoints.id,
        code: esrsDatapoints.code,
        name: esrsDatapoints.name,
        esrsStandard: esrsDatapoints.esrsStandard,
        disclosureRequirement: esrsDatapoints.disclosureRequirement,
        dataType: esrsDatapoints.dataType,
      })
      .from(esrsDatapoints);

    // Step 5: Fetch knowledge embeddings (pre-computed embeddings)
    const allKnowledgeEmbeddings = await db
      .select({
        id: knowledgeEmbeddings.id,
        sourceType: knowledgeEmbeddings.sourceType,
        sourceId: knowledgeEmbeddings.sourceId,
        title: knowledgeEmbeddings.title,
        content: knowledgeEmbeddings.content,
        embedding: knowledgeEmbeddings.embedding,
        url: knowledgeEmbeddings.url,
      })
      .from(knowledgeEmbeddings)
      .where(sql`${knowledgeEmbeddings.isDeprecated} = 0`);

    serverLogger.info(`[VectorSearch] Fetched ${allRegulations.length} regulations, ${allStandards.length} standards, ${allEsrsDatapoints.length} ESRS datapoints, ${allKnowledgeEmbeddings.length} knowledge chunks`);

    // Step 6: Calculate cosine similarity for all items
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

    // Process ESRS datapoints (text-based similarity using name field)
    // For ESRS datapoints without embeddings, use keyword matching boost
    const queryLower = query.toLowerCase();
    const esrsKeywords = ['esrs', 'csrd', 'disclosure', 'datapoint', 'e1', 'e2', 'e3', 'e4', 'e5', 's1', 's2', 's3', 's4', 'g1', 'governance', 'climate', 'pollution', 'biodiversity', 'workforce', 'supply chain', 'emission', 'carbon', 'ghg', 'scope 1', 'scope 2', 'scope 3'];
    const isEsrsQuery = esrsKeywords.some(kw => queryLower.includes(kw));
    
    if (isEsrsQuery) {
      for (const dp of allEsrsDatapoints) {
        // Simple text-based relevance scoring for ESRS datapoints
        const nameLower = dp.name.toLowerCase();
        const codeLower = dp.code.toLowerCase();
        const standardLower = (dp.esrsStandard || '').toLowerCase();
        
        let textSimilarity = 0;
        
        // Check for exact code match
        if (queryLower.includes(codeLower) || codeLower.includes(queryLower.replace(/[^a-z0-9]/g, ''))) {
          textSimilarity = 0.9;
        }
        // Check for standard match (e.g., "E1", "S1")
        else if (standardLower && queryLower.includes(standardLower.toLowerCase())) {
          textSimilarity = 0.7;
        }
        // Check for keyword overlap in name
        else {
          const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
          const matchingWords = queryWords.filter(w => nameLower.includes(w));
          textSimilarity = matchingWords.length > 0 ? 0.4 + (matchingWords.length / queryWords.length) * 0.4 : 0;
        }
        
        if (textSimilarity > 0.3) {
          results.push({
            id: dp.id,
            type: "esrs_datapoint",
            title: `${dp.code}: ${dp.name}`,
            description: `ESRS ${dp.esrsStandard} - ${dp.disclosureRequirement}`,
            similarity: textSimilarity,
            esrsStandard: dp.esrsStandard || undefined,
            disclosureRequirement: dp.disclosureRequirement || undefined,
            dataType: dp.dataType || undefined,
          });
        }
      }
    }

    // Process knowledge embeddings (pre-computed)
    for (const ke of allKnowledgeEmbeddings) {
      if (!ke.embedding || !Array.isArray(ke.embedding)) continue;

      const similarity = cosineSimilarity(
        queryEmbedding.embedding,
        ke.embedding as number[]
      );

      results.push({
        id: ke.id,
        type: "knowledge",
        title: ke.title,
        description: ke.content.slice(0, 200) + (ke.content.length > 200 ? '...' : ''),
        similarity,
        url: ke.url || undefined,
      });
    }

    // Step 7: Sort by similarity (descending) and return top N
    const sortedResults = results
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);

    const totalTime = Date.now() - startTime;
    serverLogger.info(`[VectorSearch] Found ${sortedResults.length} results in ${totalTime}ms`);

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
  type: "regulation" | "standard" | "esrs_datapoint" | "knowledge",
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
    } else if (type === "standard") {
      const [std] = await db
        .select()
        .from(gs1Standards)
        .where(sql`${gs1Standards.id} = ${id}`)
        .limit(1);

      if (!std) return null;

      return `${std.standardName}\n\n${std.description || ""}\n\nStandard Code: ${std.standardCode}\nCategory: ${std.category}\nScope: ${std.scope}`;
    } else if (type === "esrs_datapoint") {
      const [dp] = await db
        .select()
        .from(esrsDatapoints)
        .where(sql`${esrsDatapoints.id} = ${id}`)
        .limit(1);

      if (!dp) return null;

      return `ESRS Datapoint: ${dp.code}\n\nName: ${dp.name}\n\nStandard: ESRS ${dp.esrsStandard}\nDisclosure Requirement: ${dp.disclosureRequirement}\nData Type: ${dp.dataType}\nVoluntary: ${dp.voluntary ? 'Yes' : 'No'}`;
    } else if (type === "knowledge") {
      const [ke] = await db
        .select()
        .from(knowledgeEmbeddings)
        .where(sql`${knowledgeEmbeddings.id} = ${id}`)
        .limit(1);

      if (!ke) return null;

      return `${ke.title}\n\n${ke.content}\n\nSource Type: ${ke.sourceType}\nURL: ${ke.url || 'N/A'}`;
    }
    
    return null;
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
      const typeLabel = result.type === 'esrs_datapoint' ? 'ESRS Datapoint' : 
                       result.type === 'knowledge' ? 'Knowledge Base' :
                       result.type.charAt(0).toUpperCase() + result.type.slice(1);
      contextParts.push(
        `[Source ${i + 1}: ${result.title} (${typeLabel}, ${Math.round(result.similarity * 100)}% relevant)]\n${content}`
      );
    }
  }

  return contextParts.join("\n\n---\n\n");
}
