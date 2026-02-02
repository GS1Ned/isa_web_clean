/**
 * Authority Scoring Service
 * Version: 2.0
 * Last Updated: February 2, 2026
 * 
 * Purpose: Provide graduated authority scoring for RAG retrieval and ranking
 * 
 * Improvements over v1.0:
 * - Graduated 5-level authority system (instead of binary boost)
 * - Context-aware scoring (different weights for different query types)
 * - Conflict detection when multiple authority levels disagree
 * - Transparent scoring with audit trail
 */

import { serverLogger } from '../../_core/logger-wiring';

// ============================================================================
// Authority Level Definitions
// ============================================================================

/**
 * Authority levels from highest to lowest
 * 
 * Level 1: Authoritative (EU Regulations, Official Standards)
 * - Primary legal texts (CSRD, EUDR, ESRS)
 * - Official GS1 standards (GTIN, GLN, EPCIS)
 * - Binding regulatory requirements
 * 
 * Level 2: Official (Standards Bodies, Guidance)
 * - EFRAG guidance documents
 * - GS1 position papers
 * - Official implementation guides
 * 
 * Level 3: Standard (Technical Specifications)
 * - ESRS datapoints
 * - Technical specifications
 * - Data models and schemas
 * 
 * Level 4: Guidance (Industry Best Practices)
 * - Implementation guides
 * - Best practice documents
 * - Case studies
 * 
 * Level 5: Informational (News, Reports)
 * - Industry news
 * - Research reports
 * - Third-party analysis
 */
export type AuthorityLevel = 
  | 'authoritative'  // Level 1
  | 'official'       // Level 2
  | 'standard'       // Level 3
  | 'guidance'       // Level 4
  | 'informational'; // Level 5

/**
 * Numeric authority level for calculations
 */
export const AUTHORITY_LEVEL_RANK: Record<AuthorityLevel, number> = {
  authoritative: 1,
  official: 2,
  standard: 3,
  guidance: 4,
  informational: 5,
};

/**
 * Base authority weights (0-1 scale)
 * These are the default weights used when no context is provided
 */
export const BASE_AUTHORITY_WEIGHTS: Record<AuthorityLevel, number> = {
  authoritative: 1.0,
  official: 0.9,
  standard: 0.8,
  guidance: 0.65,
  informational: 0.5,
};

// ============================================================================
// Query Type Definitions
// ============================================================================

/**
 * Query types that affect authority weighting
 */
export type QueryType = 
  | 'compliance'      // Legal/regulatory questions - prioritize authoritative
  | 'implementation'  // How-to questions - prioritize guidance
  | 'definition'      // What-is questions - balanced
  | 'mapping'         // Cross-reference questions - prioritize official
  | 'general';        // General questions - balanced

/**
 * Context-aware authority weights per query type
 * 
 * Compliance queries heavily weight authoritative sources
 * Implementation queries weight guidance higher
 * Definition queries are balanced
 */
export const CONTEXT_AUTHORITY_WEIGHTS: Record<QueryType, Record<AuthorityLevel, number>> = {
  compliance: {
    authoritative: 1.0,
    official: 0.95,
    standard: 0.7,
    guidance: 0.5,
    informational: 0.3,
  },
  implementation: {
    authoritative: 0.9,
    official: 0.85,
    standard: 0.8,
    guidance: 0.95,  // Higher for implementation
    informational: 0.6,
  },
  definition: {
    authoritative: 1.0,
    official: 0.9,
    standard: 0.85,
    guidance: 0.7,
    informational: 0.5,
  },
  mapping: {
    authoritative: 0.95,
    official: 1.0,   // Highest for mapping (position papers)
    standard: 0.85,
    guidance: 0.7,
    informational: 0.4,
  },
  general: BASE_AUTHORITY_WEIGHTS,
};

// ============================================================================
// Authority Boost Configuration
// ============================================================================

/**
 * Authority boost configuration
 */
export interface AuthorityBoostConfig {
  /** Enable/disable authority boosting */
  enabled: boolean;
  /** Query type for context-aware weighting */
  queryType: QueryType;
  /** Minimum authority level to include */
  minimumLevel?: AuthorityLevel;
  /** Maximum boost multiplier (caps the boost) */
  maxBoostMultiplier: number;
  /** Decay factor for lower authority levels */
  decayFactor: number;
}

const DEFAULT_BOOST_CONFIG: AuthorityBoostConfig = {
  enabled: true,
  queryType: 'general',
  maxBoostMultiplier: 1.5,
  decayFactor: 0.15, // Each level down loses 15% weight
};

// ============================================================================
// Authority Scoring Functions
// ============================================================================

/**
 * Calculate authority boost for a single source
 * 
 * @param authorityLevel - The authority level of the source
 * @param baseSimilarity - The base similarity score (0-1)
 * @param config - Boost configuration
 * @returns Boosted similarity score
 */
export function calculateAuthorityBoost(
  authorityLevel: AuthorityLevel | string | undefined,
  baseSimilarity: number,
  config: Partial<AuthorityBoostConfig> = {}
): {
  boostedScore: number;
  boostMultiplier: number;
  authorityWeight: number;
} {
  const cfg = { ...DEFAULT_BOOST_CONFIG, ...config };
  
  if (!cfg.enabled || !authorityLevel) {
    return {
      boostedScore: baseSimilarity,
      boostMultiplier: 1.0,
      authorityWeight: 0.5,
    };
  }
  
  // Normalize authority level
  const normalizedLevel = normalizeAuthorityLevel(authorityLevel);
  
  // Get context-aware weight
  const weights = CONTEXT_AUTHORITY_WEIGHTS[cfg.queryType];
  const authorityWeight = weights[normalizedLevel] || BASE_AUTHORITY_WEIGHTS.informational;
  
  // Calculate boost multiplier
  // Formula: 1 + (weight - 0.5) * maxBoostMultiplier
  // This gives a range from (1 - 0.5*max) to (1 + 0.5*max)
  const boostMultiplier = 1 + (authorityWeight - 0.5) * (cfg.maxBoostMultiplier - 1);
  
  // Apply boost and cap
  const boostedScore = Math.min(baseSimilarity * boostMultiplier, 1.0);
  
  return {
    boostedScore,
    boostMultiplier,
    authorityWeight,
  };
}

/**
 * Normalize authority level string to standard enum
 */
export function normalizeAuthorityLevel(level: string): AuthorityLevel {
  const normalized = level.toLowerCase().trim();
  
  if (normalized === 'authoritative' || normalized === 'regulation') {
    return 'authoritative';
  }
  if (normalized === 'official' || normalized === 'standard_body') {
    return 'official';
  }
  if (normalized === 'standard' || normalized === 'technical') {
    return 'standard';
  }
  if (normalized === 'guidance' || normalized === 'best_practice') {
    return 'guidance';
  }
  
  return 'informational';
}

/**
 * Calculate aggregate authority score for a set of sources
 * 
 * @param sources - Array of sources with authority levels and similarities
 * @param config - Boost configuration
 * @returns Aggregate authority score and breakdown
 */
export function calculateAggregateAuthorityScore(
  sources: Array<{
    authorityLevel: AuthorityLevel | string;
    similarity: number;
  }>,
  config: Partial<AuthorityBoostConfig> = {}
): {
  aggregateScore: number;
  weightedAverage: number;
  levelBreakdown: Record<AuthorityLevel, number>;
  dominantLevel: AuthorityLevel;
  hasConflict: boolean;
  conflictDetails?: string;
} {
  if (sources.length === 0) {
    return {
      aggregateScore: 0,
      weightedAverage: 0,
      levelBreakdown: {
        authoritative: 0,
        official: 0,
        standard: 0,
        guidance: 0,
        informational: 0,
      },
      dominantLevel: 'informational',
      hasConflict: false,
    };
  }
  
  const cfg = { ...DEFAULT_BOOST_CONFIG, ...config };
  const weights = CONTEXT_AUTHORITY_WEIGHTS[cfg.queryType];
  
  // Calculate breakdown
  const levelBreakdown: Record<AuthorityLevel, number> = {
    authoritative: 0,
    official: 0,
    standard: 0,
    guidance: 0,
    informational: 0,
  };
  
  let totalWeight = 0;
  let weightedSum = 0;
  
  for (const source of sources) {
    const level = normalizeAuthorityLevel(source.authorityLevel);
    const weight = weights[level];
    
    levelBreakdown[level]++;
    totalWeight += source.similarity;
    weightedSum += weight * source.similarity;
  }
  
  // Find dominant level
  let dominantLevel: AuthorityLevel = 'informational';
  let maxCount = 0;
  for (const [level, count] of Object.entries(levelBreakdown)) {
    if (count > maxCount) {
      maxCount = count;
      dominantLevel = level as AuthorityLevel;
    }
  }
  
  // Detect conflicts (high-authority and low-authority sources both present)
  const hasHighAuthority = levelBreakdown.authoritative > 0 || levelBreakdown.official > 0;
  const hasLowAuthority = levelBreakdown.guidance > 0 || levelBreakdown.informational > 0;
  const hasConflict = hasHighAuthority && hasLowAuthority && sources.length >= 3;
  
  let conflictDetails: string | undefined;
  if (hasConflict) {
    conflictDetails = `Mixed authority levels detected: ${levelBreakdown.authoritative} authoritative, ${levelBreakdown.official} official, ${levelBreakdown.guidance} guidance, ${levelBreakdown.informational} informational`;
  }
  
  const weightedAverage = totalWeight > 0 ? weightedSum / totalWeight : 0;
  
  // Aggregate score combines weighted average with dominant level bonus
  const dominantBonus = weights[dominantLevel] * 0.1;
  const aggregateScore = Math.min(weightedAverage + dominantBonus, 1.0);
  
  return {
    aggregateScore,
    weightedAverage,
    levelBreakdown,
    dominantLevel,
    hasConflict,
    conflictDetails,
  };
}

/**
 * Rerank results by authority-boosted scores
 * 
 * @param results - Array of search results
 * @param config - Boost configuration
 * @returns Reranked results with authority scores
 */
export function rerankByAuthority<T extends {
  similarity: number;
  authorityLevel?: AuthorityLevel | string;
}>(
  results: T[],
  config: Partial<AuthorityBoostConfig> = {}
): Array<T & {
  originalRank: number;
  boostedScore: number;
  boostMultiplier: number;
  authorityWeight: number;
}> {
  const cfg = { ...DEFAULT_BOOST_CONFIG, ...config };
  
  // Calculate boosted scores
  const boostedResults = results.map((result, index) => {
    const boost = calculateAuthorityBoost(
      result.authorityLevel,
      result.similarity,
      cfg
    );
    
    return {
      ...result,
      originalRank: index + 1,
      boostedScore: boost.boostedScore,
      boostMultiplier: boost.boostMultiplier,
      authorityWeight: boost.authorityWeight,
    };
  });
  
  // Sort by boosted score
  boostedResults.sort((a, b) => b.boostedScore - a.boostedScore);
  
  serverLogger.info(
    `[AuthorityScoring] Reranked ${results.length} results with ${cfg.queryType} context`
  );
  
  return boostedResults;
}

/**
 * Detect query type from question text
 * 
 * @param question - User's question
 * @returns Detected query type
 */
export function detectQueryType(question: string): QueryType {
  const q = question.toLowerCase();
  
  // Compliance indicators
  if (
    q.includes('comply') ||
    q.includes('compliance') ||
    q.includes('requirement') ||
    q.includes('mandatory') ||
    q.includes('must') ||
    q.includes('regulation') ||
    q.includes('legal')
  ) {
    return 'compliance';
  }
  
  // Implementation indicators
  if (
    q.includes('how to') ||
    q.includes('how do') ||
    q.includes('implement') ||
    q.includes('setup') ||
    q.includes('configure') ||
    q.includes('best practice') ||
    q.includes('example')
  ) {
    return 'implementation';
  }
  
  // Definition indicators
  if (
    q.includes('what is') ||
    q.includes('what are') ||
    q.includes('define') ||
    q.includes('definition') ||
    q.includes('explain') ||
    q.includes('meaning')
  ) {
    return 'definition';
  }
  
  // Mapping indicators
  if (
    q.includes('map') ||
    q.includes('mapping') ||
    q.includes('correspond') ||
    q.includes('relate') ||
    q.includes('link') ||
    q.includes('attribute') ||
    q.includes('datapoint')
  ) {
    return 'mapping';
  }
  
  return 'general';
}

// ============================================================================
// Exports
// ============================================================================

export {
  DEFAULT_BOOST_CONFIG,
};
