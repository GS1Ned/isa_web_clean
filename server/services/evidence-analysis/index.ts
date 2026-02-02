/**
 * Evidence Analysis Service
 * Part of Gate 2.2: Hard Abstention Policy
 * 
 * This service analyzes retrieved evidence to determine if it is sufficient
 * to generate a reliable answer. If evidence is insufficient, conflicting,
 * or of inadequate authority, the system must abstain.
 * 
 * @module evidence-analysis
 */

import { AbstentionReasonCode } from '../rag-tracing/failure-taxonomy';

// ============================================================================
// Types
// ============================================================================

export interface EvidenceChunk {
  id: number;
  title: string;
  content?: string;
  description?: string;
  similarity: number;
  authorityLevel?: string;
  sourceType?: string;
  url?: string;
}

export interface EvidenceAnalysisResult {
  /** Whether the evidence is sufficient to generate an answer */
  isSufficient: boolean;
  
  /** If not sufficient, the reason code */
  abstentionReason?: AbstentionReasonCode;
  
  /** Human-readable explanation */
  explanation: string;
  
  /** Confidence in the analysis (0-1) */
  analysisConfidence: number;
  
  /** Detailed breakdown */
  details: {
    /** Average similarity score of evidence */
    avgSimilarity: number;
    /** Highest authority level found */
    highestAuthority: string;
    /** Whether conflicting information was detected */
    hasConflicts: boolean;
    /** Number of high-quality chunks (similarity > 0.7) */
    highQualityChunks: number;
    /** Authority distribution */
    authorityDistribution: Record<string, number>;
  };
}

export interface QueryContext {
  /** The original query */
  query: string;
  /** Query type (regulatory, technical, general) */
  queryType?: string;
  /** Required minimum authority level for this query type */
  requiredAuthority?: string;
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Authority level hierarchy (higher number = higher authority)
 */
const AUTHORITY_HIERARCHY: Record<string, number> = {
  'official': 5,      // EU regulations, official GS1 standards
  'regulatory': 4,    // Regulatory guidance, official interpretations
  'industry': 3,      // Industry best practices, sector guidance
  'guidance': 2,      // General guidance, recommendations
  'community': 1,     // Community content, user contributions
  'unknown': 0,       // Unknown authority
};

/**
 * Minimum authority required by query type
 */
const QUERY_TYPE_AUTHORITY_REQUIREMENTS: Record<string, string> = {
  'regulatory': 'regulatory',   // Regulatory questions need at least regulatory authority
  'compliance': 'regulatory',   // Compliance questions need regulatory authority
  'technical': 'industry',      // Technical questions need at least industry authority
  'general': 'guidance',        // General questions can use guidance
  'unknown': 'guidance',        // Default to guidance
};

/**
 * Thresholds for evidence sufficiency
 */
const THRESHOLDS = {
  /** Minimum similarity score to consider evidence relevant */
  MIN_SIMILARITY: 0.5,
  /** Similarity score for high-quality evidence */
  HIGH_QUALITY_SIMILARITY: 0.7,
  /** Minimum number of high-quality chunks for sufficient evidence */
  MIN_HIGH_QUALITY_CHUNKS: 1,
  /** Minimum average similarity for sufficient evidence */
  MIN_AVG_SIMILARITY: 0.55,
  /** Similarity difference threshold for conflict detection */
  CONFLICT_SIMILARITY_THRESHOLD: 0.1,
};

// ============================================================================
// Analysis Functions
// ============================================================================

/**
 * Get the numeric authority level for a given authority string
 */
function getAuthorityLevel(authority: string | undefined): number {
  if (!authority) return AUTHORITY_HIERARCHY['unknown'];
  const normalized = authority.toLowerCase();
  return AUTHORITY_HIERARCHY[normalized] ?? AUTHORITY_HIERARCHY['unknown'];
}

/**
 * Get the highest authority level from a set of chunks
 */
function getHighestAuthority(chunks: EvidenceChunk[]): string {
  let highest = 'unknown';
  let highestLevel = 0;
  
  for (const chunk of chunks) {
    const level = getAuthorityLevel(chunk.authorityLevel);
    if (level > highestLevel) {
      highestLevel = level;
      highest = chunk.authorityLevel || 'unknown';
    }
  }
  
  return highest;
}

/**
 * Calculate authority distribution across chunks
 */
function getAuthorityDistribution(chunks: EvidenceChunk[]): Record<string, number> {
  const distribution: Record<string, number> = {};
  
  for (const chunk of chunks) {
    const authority = chunk.authorityLevel || 'unknown';
    distribution[authority] = (distribution[authority] || 0) + 1;
  }
  
  return distribution;
}

/**
 * Detect potential conflicts in evidence
 * 
 * Conflicts are detected when:
 * 1. Multiple high-similarity chunks exist
 * 2. They have different authority levels
 * 3. Their content appears to contradict (heuristic)
 */
function detectConflicts(chunks: EvidenceChunk[]): boolean {
  // Need at least 2 chunks to have conflicts
  if (chunks.length < 2) return false;
  
  // Get high-quality chunks
  const highQualityChunks = chunks.filter(
    c => c.similarity >= THRESHOLDS.HIGH_QUALITY_SIMILARITY
  );
  
  if (highQualityChunks.length < 2) return false;
  
  // Check for authority level conflicts among high-quality chunks
  const authorities = new Set(
    highQualityChunks.map(c => c.authorityLevel || 'unknown')
  );
  
  // If we have multiple authority levels among top chunks, potential conflict
  if (authorities.size > 1) {
    // Check if similarity scores are close (both are "good" answers)
    const topTwo = highQualityChunks.slice(0, 2);
    const similarityDiff = Math.abs(topTwo[0].similarity - topTwo[1].similarity);
    
    if (similarityDiff < THRESHOLDS.CONFLICT_SIMILARITY_THRESHOLD) {
      // Both chunks are similarly relevant but from different authorities
      // This is a potential conflict that needs human review
      return true;
    }
  }
  
  return false;
}

/**
 * Check if the evidence has sufficient authority for the query type
 */
function hasRequiredAuthority(
  chunks: EvidenceChunk[],
  queryType: string
): boolean {
  const requiredAuthority = QUERY_TYPE_AUTHORITY_REQUIREMENTS[queryType] || 'guidance';
  const requiredLevel = AUTHORITY_HIERARCHY[requiredAuthority] || 0;
  
  // Check if any chunk meets the required authority
  for (const chunk of chunks) {
    const chunkLevel = getAuthorityLevel(chunk.authorityLevel);
    if (chunkLevel >= requiredLevel) {
      return true;
    }
  }
  
  return false;
}

// ============================================================================
// Main Analysis Function
// ============================================================================

/**
 * Analyze evidence to determine if it is sufficient for answering
 * 
 * This function implements the Hard Abstention Policy (Gate 2.2):
 * - If evidence is insufficient, return abstention reason
 * - If evidence has low confidence, return abstention reason
 * - If evidence has insufficient authority, return abstention reason
 * - If evidence has conflicts, return abstention reason
 * 
 * @param chunks - Retrieved evidence chunks
 * @param context - Query context including type and requirements
 * @returns Analysis result with sufficiency determination
 */
export function analyzeEvidenceSufficiency(
  chunks: EvidenceChunk[],
  context: QueryContext
): EvidenceAnalysisResult {
  // Handle empty evidence case
  if (chunks.length === 0) {
    return {
      isSufficient: false,
      abstentionReason: AbstentionReasonCode.NO_RELEVANT_EVIDENCE,
      explanation: 'No relevant evidence found in the knowledge base.',
      analysisConfidence: 1.0,
      details: {
        avgSimilarity: 0,
        highestAuthority: 'none',
        hasConflicts: false,
        highQualityChunks: 0,
        authorityDistribution: {},
      },
    };
  }
  
  // Calculate metrics
  const avgSimilarity = chunks.reduce((sum, c) => sum + c.similarity, 0) / chunks.length;
  const highQualityChunks = chunks.filter(
    c => c.similarity >= THRESHOLDS.HIGH_QUALITY_SIMILARITY
  ).length;
  const highestAuthority = getHighestAuthority(chunks);
  const authorityDistribution = getAuthorityDistribution(chunks);
  const hasConflicts = detectConflicts(chunks);
  
  const details = {
    avgSimilarity,
    highestAuthority,
    hasConflicts,
    highQualityChunks,
    authorityDistribution,
  };
  
  // Check 1: Low confidence evidence
  if (avgSimilarity < THRESHOLDS.MIN_AVG_SIMILARITY || highQualityChunks < THRESHOLDS.MIN_HIGH_QUALITY_CHUNKS) {
    return {
      isSufficient: false,
      abstentionReason: AbstentionReasonCode.LOW_CONFIDENCE_EVIDENCE,
      explanation: `Evidence confidence is too low (avg similarity: ${(avgSimilarity * 100).toFixed(0)}%, high-quality chunks: ${highQualityChunks}). Cannot provide a reliable answer.`,
      analysisConfidence: 0.9,
      details,
    };
  }
  
  // Check 2: Insufficient authority
  const queryType = context.queryType || 'general';
  if (!hasRequiredAuthority(chunks, queryType)) {
    const requiredAuthority = QUERY_TYPE_AUTHORITY_REQUIREMENTS[queryType] || 'guidance';
    return {
      isSufficient: false,
      abstentionReason: AbstentionReasonCode.INSUFFICIENT_AUTHORITY,
      explanation: `This ${queryType} query requires ${requiredAuthority}-level sources, but the highest authority found is ${highestAuthority}.`,
      analysisConfidence: 0.85,
      details,
    };
  }
  
  // Check 3: Conflicting sources
  if (hasConflicts) {
    return {
      isSufficient: false,
      abstentionReason: AbstentionReasonCode.CONFLICTING_SOURCES,
      explanation: 'Multiple authoritative sources provide potentially conflicting information. Manual review recommended.',
      analysisConfidence: 0.75,
      details,
    };
  }
  
  // Evidence is sufficient
  return {
    isSufficient: true,
    explanation: `Evidence is sufficient: ${highQualityChunks} high-quality chunks, avg similarity ${(avgSimilarity * 100).toFixed(0)}%, authority level ${highestAuthority}.`,
    analysisConfidence: Math.min(avgSimilarity, 0.95),
    details,
  };
}

/**
 * Generate a user-friendly abstention message based on the reason
 */
export function generateAbstentionMessage(
  reason: AbstentionReasonCode,
  details?: EvidenceAnalysisResult['details']
): string {
  switch (reason) {
    case AbstentionReasonCode.NO_RELEVANT_EVIDENCE:
      return "I couldn't find any relevant information in the knowledge base to answer your question. Please try rephrasing or ask about EU regulations (CSRD, EUDR, DPP) or GS1 standards.";
    
    case AbstentionReasonCode.LOW_CONFIDENCE_EVIDENCE:
      return "I found some related information, but I'm not confident enough in its relevance to provide a reliable answer. Could you please rephrase your question or provide more specific details?";
    
    case AbstentionReasonCode.INSUFFICIENT_AUTHORITY:
      return `This question requires authoritative sources that I don't currently have access to. For official guidance, please consult the relevant regulatory body or GS1 organization directly.`;
    
    case AbstentionReasonCode.CONFLICTING_SOURCES:
      return "I found multiple sources with potentially conflicting information on this topic. To ensure accuracy, I recommend consulting the official regulatory documentation or contacting GS1 directly for clarification.";
    
    case AbstentionReasonCode.AMBIGUOUS_QUERY:
      return "Your question could be interpreted in multiple ways. Could you please provide more context or specify which aspect you'd like me to focus on?";
    
    case AbstentionReasonCode.OUT_OF_SCOPE:
      return "This question appears to be outside my area of expertise. I specialize in EU regulations (CSRD, EUDR, DPP) and GS1 standards. Please ask about these topics.";
    
    case AbstentionReasonCode.OUTDATED_EVIDENCE:
      return "The information I have on this topic may be outdated. Please check the latest official sources for current guidance.";
    
    default:
      return "I'm unable to provide a reliable answer to this question at this time. Please try rephrasing or consult official sources.";
  }
}

/**
 * Determine query type from query text (simple heuristic)
 */
export function inferQueryType(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  // Regulatory indicators
  if (
    lowerQuery.includes('regulation') ||
    lowerQuery.includes('directive') ||
    lowerQuery.includes('csrd') ||
    lowerQuery.includes('eudr') ||
    lowerQuery.includes('esrs') ||
    lowerQuery.includes('legal') ||
    lowerQuery.includes('mandatory') ||
    lowerQuery.includes('compliance')
  ) {
    return 'regulatory';
  }
  
  // Technical indicators
  if (
    lowerQuery.includes('implement') ||
    lowerQuery.includes('technical') ||
    lowerQuery.includes('specification') ||
    lowerQuery.includes('format') ||
    lowerQuery.includes('gtin') ||
    lowerQuery.includes('barcode') ||
    lowerQuery.includes('data model')
  ) {
    return 'technical';
  }
  
  // Compliance indicators
  if (
    lowerQuery.includes('comply') ||
    lowerQuery.includes('requirement') ||
    lowerQuery.includes('deadline') ||
    lowerQuery.includes('must') ||
    lowerQuery.includes('obligation')
  ) {
    return 'compliance';
  }
  
  return 'general';
}
