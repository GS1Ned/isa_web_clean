/**
 * Enhanced Ask ISA Query Handler
 * 
 * Improves the Ask ISA functionality by:
 * 1. Using the comprehensive knowledge_embeddings table
 * 2. Enriching context with regulation-ESRS and GS1-ESRS mappings
 * 3. Providing source type filtering
 * 4. Including authority and semantic layer metadata
 */

import { searchKnowledgeEmbeddings, getRelatedContent, type KnowledgeSearchResult, type KnowledgeSourceType } from './knowledge-vector-search';
import { serverLogger } from './_core/logger-wiring';

/**
 * Query context for Ask ISA
 */
export interface AskISAContext {
  /** Primary search results */
  primaryResults: KnowledgeSearchResult[];
  /** Related content from mappings */
  relatedContent: KnowledgeSearchResult[];
  /** Total unique sources */
  totalSources: number;
  /** Source type breakdown */
  sourceBreakdown: Record<string, number>;
  /** Average authority score */
  avgAuthorityScore: number;
}

/**
 * Query options for Ask ISA
 */
export interface AskISAQueryOptions {
  /** Maximum primary results */
  limit?: number;
  /** Include related content from mappings */
  includeRelated?: boolean;
  /** Filter by source types */
  sourceTypes?: KnowledgeSourceType[];
  /** Minimum similarity threshold */
  threshold?: number;
}

const DEFAULT_OPTIONS: AskISAQueryOptions = {
  limit: 10,
  includeRelated: true,
  threshold: 0.3,
};

/**
 * Authority score mapping
 */
const AUTHORITY_SCORES: Record<string, number> = {
  'authoritative': 1.0,
  'official': 0.9,
  'guidance': 0.7,
  'informational': 0.5,
};

/**
 * Enhanced query handler for Ask ISA
 * 
 * @param query - User's natural language question
 * @param options - Query options
 * @returns Context with search results and related content
 */
export async function queryAskISA(
  query: string,
  options: AskISAQueryOptions = {}
): Promise<AskISAContext> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const startTime = Date.now();
  
  serverLogger.info(`[AskISA] Processing query: "${query.slice(0, 50)}..."`);

  // Step 1: Search knowledge embeddings
  const primaryResults = await searchKnowledgeEmbeddings(query, {
    limit: opts.limit,
    threshold: opts.threshold,
    sourceTypes: opts.sourceTypes,
  });

  serverLogger.info(`[AskISA] Found ${primaryResults.length} primary results`);

  // Step 2: Get related content from mappings (if enabled)
  let relatedContent: KnowledgeSearchResult[] = [];
  
  if (opts.includeRelated && primaryResults.length > 0) {
    // Get related content for top 3 results
    const topResults = primaryResults.slice(0, 3);
    const relatedPromises = topResults
      .filter(r => ['regulation', 'gs1_standard', 'esrs_datapoint'].includes(r.sourceType))
      .map(r => getRelatedContent(
        r.sourceType as 'regulation' | 'gs1_standard' | 'esrs_datapoint',
        r.sourceId,
        3
      ));

    const relatedArrays = await Promise.all(relatedPromises);
    
    // Flatten and deduplicate
    const seenIds = new Set(primaryResults.map(r => r.id));
    for (const arr of relatedArrays) {
      for (const item of arr) {
        if (!seenIds.has(item.id)) {
          seenIds.add(item.id);
          relatedContent.push(item);
        }
      }
    }

    serverLogger.info(`[AskISA] Found ${relatedContent.length} related items from mappings`);
  }

  // Step 3: Calculate statistics
  const allResults = [...primaryResults, ...relatedContent];
  const sourceBreakdown: Record<string, number> = {};
  let totalAuthorityScore = 0;
  let authorityCount = 0;

  for (const result of allResults) {
    // Source breakdown
    sourceBreakdown[result.sourceType] = (sourceBreakdown[result.sourceType] || 0) + 1;
    
    // Authority score
    if (result.authorityLevel) {
      totalAuthorityScore += AUTHORITY_SCORES[result.authorityLevel] || 0.5;
      authorityCount++;
    }
  }

  const avgAuthorityScore = authorityCount > 0 
    ? totalAuthorityScore / authorityCount 
    : 0.5;

  serverLogger.info(
    `[AskISA] Query completed in ${Date.now() - startTime}ms with ${allResults.length} total sources`
  );

  return {
    primaryResults,
    relatedContent,
    totalSources: allResults.length,
    sourceBreakdown,
    avgAuthorityScore,
  };
}

/**
 * Format search results for LLM context
 * 
 * Creates a structured context string for the LLM to use
 * when generating responses.
 */
export function formatContextForLLM(context: AskISAContext): string {
  const lines: string[] = [];
  
  lines.push('=== RELEVANT KNOWLEDGE BASE CONTENT ===\n');

  // Primary results
  if (context.primaryResults.length > 0) {
    lines.push('## Primary Search Results\n');
    
    for (let i = 0; i < context.primaryResults.length; i++) {
      const result = context.primaryResults[i];
      lines.push(`### [${i + 1}] ${result.title}`);
      lines.push(`- Type: ${formatSourceType(result.sourceType)}`);
      lines.push(`- Relevance: ${(result.similarity * 100).toFixed(1)}%`);
      if (result.authorityLevel) {
        lines.push(`- Authority: ${result.authorityLevel}`);
      }
      if (result.semanticLayer) {
        lines.push(`- Layer: ${result.semanticLayer}`);
      }
      lines.push(`\nContent:\n${result.content.slice(0, 500)}${result.content.length > 500 ? '...' : ''}`);
      if (result.url) {
        lines.push(`\nSource: ${result.url}`);
      }
      lines.push('\n---\n');
    }
  }

  // Related content
  if (context.relatedContent.length > 0) {
    lines.push('## Related Content (from mappings)\n');
    
    for (const result of context.relatedContent) {
      lines.push(`### ${result.title}`);
      lines.push(`- Type: ${formatSourceType(result.sourceType)}`);
      lines.push(`\nContent:\n${result.content.slice(0, 300)}${result.content.length > 300 ? '...' : ''}`);
      lines.push('\n---\n');
    }
  }

  // Statistics
  lines.push('## Context Statistics');
  lines.push(`- Total sources: ${context.totalSources}`);
  lines.push(`- Average authority score: ${(context.avgAuthorityScore * 100).toFixed(0)}%`);
  lines.push(`- Source breakdown: ${JSON.stringify(context.sourceBreakdown)}`);

  return lines.join('\n');
}

/**
 * Format source type for display
 */
function formatSourceType(type: KnowledgeSourceType): string {
  const labels: Record<KnowledgeSourceType, string> = {
    'regulation': 'EU Regulation',
    'gs1_standard': 'GS1 Standard',
    'esrs_datapoint': 'ESRS Datapoint',
    'dpp_component': 'DPP Component',
    'cbv_vocabulary': 'CBV Vocabulary',
    'news': 'News Article',
    'initiative': 'Dutch Initiative',
  };
  return labels[type] || type;
}

/**
 * Detect query intent to optimize search
 */
export function detectQueryIntent(query: string): {
  intent: 'gap_analysis' | 'mapping' | 'recommendation' | 'general';
  suggestedSourceTypes: KnowledgeSourceType[];
} {
  const queryLower = query.toLowerCase();

  // Gap analysis queries
  if (queryLower.includes('gap') || queryLower.includes('missing') || queryLower.includes('coverage')) {
    return {
      intent: 'gap_analysis',
      suggestedSourceTypes: ['esrs_datapoint', 'gs1_standard', 'regulation'],
    };
  }

  // Mapping queries
  if (queryLower.includes('map') || queryLower.includes('attribute') || queryLower.includes('which gs1')) {
    return {
      intent: 'mapping',
      suggestedSourceTypes: ['gs1_standard', 'esrs_datapoint'],
    };
  }

  // Recommendation queries
  if (queryLower.includes('recommend') || queryLower.includes('should') || queryLower.includes('how to')) {
    return {
      intent: 'recommendation',
      suggestedSourceTypes: ['gs1_standard', 'regulation', 'initiative'],
    };
  }

  // General queries
  return {
    intent: 'general',
    suggestedSourceTypes: [],
  };
}

/**
 * Get suggested follow-up questions based on results
 */
export function getSuggestedFollowUps(
  query: string,
  context: AskISAContext
): string[] {
  const suggestions: string[] = [];
  const sourceTypes = Object.keys(context.sourceBreakdown);

  // If we found regulations, suggest mapping questions
  if (sourceTypes.includes('regulation')) {
    suggestions.push('Which GS1 standards support compliance with this regulation?');
  }

  // If we found ESRS datapoints, suggest gap questions
  if (sourceTypes.includes('esrs_datapoint')) {
    suggestions.push('What is the current coverage status for these ESRS requirements?');
  }

  // If we found GS1 standards, suggest implementation questions
  if (sourceTypes.includes('gs1_standard')) {
    suggestions.push('How can these GS1 standards be implemented for sustainability reporting?');
  }

  // Generic follow-ups
  suggestions.push('What are the key deadlines and timelines?');
  suggestions.push('Which sectors are most affected?');

  return suggestions.slice(0, 3);
}
