/**
 * Traceability Score Metric
 * Version: 1.0
 * Last Updated: February 2, 2026
 * 
 * Purpose: Measure how well claims in the final answer trace back to extracted evidence
 * 
 * This metric is critical for validating the Cite-then-Write flow.
 * It distinguishes between three levels of traceability:
 * 
 * Level 1: Citation Present
 *   - The claim has a [Source N] citation
 *   - Weakest level, only checks syntax
 * 
 * Level 2: Citation Valid
 *   - The citation references a source that was actually retrieved
 *   - Medium level, checks reference integrity
 * 
 * Level 3: Citation Supports Claim (Semantic)
 *   - The cited source actually supports the claim being made
 *   - Strongest level, requires semantic analysis
 *   - Note: Full implementation requires LLM verification (future work)
 * 
 * IMPORTANT: This metric is DIAGNOSTIC, not normative.
 * A low score indicates a problem to investigate, not automatically a bad answer.
 */

import { serverLogger } from '../../_core/logger-wiring';

// ============================================================================
// Types
// ============================================================================

/**
 * A claim extracted from the answer
 */
export interface ExtractedClaim {
  /** The claim text */
  text: string;
  /** The sentence containing the claim */
  sentence: string;
  /** Source numbers cited for this claim */
  citedSources: number[];
  /** Position in the answer (sentence index) */
  position: number;
}

/**
 * Traceability analysis result for a single claim
 */
export interface ClaimTraceability {
  claim: ExtractedClaim;
  /** Level 1: Does the claim have any citation? */
  hasCitation: boolean;
  /** Level 2: Do all cited sources exist in the retrieved set? */
  citationsValid: boolean;
  /** Level 3: Do the cited sources semantically support the claim? */
  citationsSupport: boolean | null; // null = not yet analyzed
  /** Invalid source numbers (cited but not retrieved) */
  invalidSources: number[];
}

/**
 * Overall traceability score for an answer
 */
export interface TraceabilityScore {
  /** Total number of factual claims identified */
  totalClaims: number;
  /** Claims with at least one citation (Level 1) */
  claimsWithCitation: number;
  /** Claims with valid citations (Level 2) */
  claimsWithValidCitation: number;
  /** Claims with supporting citations (Level 3) - may be partial */
  claimsWithSupportingCitation: number | null;
  
  /** Level 1 score: citation presence rate (0-1) */
  citationPresenceRate: number;
  /** Level 2 score: citation validity rate (0-1) */
  citationValidityRate: number;
  /** Level 3 score: citation support rate (0-1) - null if not analyzed */
  citationSupportRate: number | null;
  
  /** Overall traceability score (weighted average of levels 1 & 2) */
  overallScore: number;
  
  /** Detailed breakdown per claim */
  claimDetails: ClaimTraceability[];
  
  /** Diagnostic flags */
  diagnostics: {
    /** Claims without any citation */
    uncitedClaims: string[];
    /** Citations referencing non-existent sources */
    orphanCitations: number[];
    /** Sources that were retrieved but never cited */
    unusedSources: number[];
  };
}

// ============================================================================
// Claim Extraction
// ============================================================================

/**
 * Extract factual claims from an answer
 * 
 * A factual claim is a sentence that makes an assertion about the world
 * that could be true or false (as opposed to opinions, questions, or meta-statements)
 * 
 * @param answer - The answer text to analyze
 * @returns Array of extracted claims
 */
export function extractClaims(answer: string): ExtractedClaim[] {
  const claims: ExtractedClaim[] = [];
  
  // Split into sentences (handling common abbreviations)
  const sentences = answer
    .replace(/([.!?])\s+/g, '$1\n')
    .split('\n')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  
  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    
    // Skip meta-statements and non-factual content
    if (isMetaStatement(sentence)) {
      continue;
    }
    
    // Skip very short sentences (likely headers or fragments)
    if (sentence.length < 20) {
      continue;
    }
    
    // Extract cited sources from the sentence
    const citedSources = extractCitedSources(sentence);
    
    claims.push({
      text: sentence.replace(/\[Source \d+\]/g, '').trim(),
      sentence: sentence,
      citedSources,
      position: i,
    });
  }
  
  return claims;
}

/**
 * Check if a sentence is a meta-statement (not a factual claim)
 */
function isMetaStatement(sentence: string): boolean {
  const lowerSentence = sentence.toLowerCase();
  
  // Questions
  if (sentence.endsWith('?')) return true;
  
  // Meta-statements about the answer itself
  const metaPatterns = [
    'based on the sources',
    'according to the provided',
    'i don\'t have enough information',
    'please note that',
    'it\'s important to',
    'in summary',
    'to summarize',
    'in conclusion',
    'as mentioned',
    'as stated above',
    'for more information',
    'please consult',
    'this answer has',
    'confidence',
  ];
  
  return metaPatterns.some(pattern => lowerSentence.includes(pattern));
}

/**
 * Extract source numbers from citations in a sentence
 */
function extractCitedSources(sentence: string): number[] {
  const sources: number[] = [];
  const regex = /\[Source\s*(\d+)\]/gi;
  let match;
  
  while ((match = regex.exec(sentence)) !== null) {
    const sourceNum = parseInt(match[1], 10);
    if (!sources.includes(sourceNum)) {
      sources.push(sourceNum);
    }
  }
  
  return sources;
}

// ============================================================================
// Traceability Analysis
// ============================================================================

/**
 * Calculate traceability score for an answer
 * 
 * @param answer - The answer text to analyze
 * @param retrievedSourceIds - Array of source IDs that were actually retrieved
 * @param maxSourceNumber - Maximum valid source number (typically 5)
 * @returns Traceability score with detailed breakdown
 */
export function calculateTraceabilityScore(
  answer: string,
  retrievedSourceIds: number[],
  maxSourceNumber: number = 5
): TraceabilityScore {
  // Extract claims from the answer
  const claims = extractClaims(answer);
  
  if (claims.length === 0) {
    return createEmptyScore();
  }
  
  // Analyze each claim
  const claimDetails: ClaimTraceability[] = [];
  let claimsWithCitation = 0;
  let claimsWithValidCitation = 0;
  const allCitedSources = new Set<number>();
  const orphanCitations = new Set<number>();
  const uncitedClaims: string[] = [];
  
  for (const claim of claims) {
    const hasCitation = claim.citedSources.length > 0;
    
    // Track all cited sources
    claim.citedSources.forEach(s => allCitedSources.add(s));
    
    // Check citation validity (source number within range)
    const invalidSources = claim.citedSources.filter(s => s < 1 || s > maxSourceNumber);
    const citationsValid = hasCitation && invalidSources.length === 0;
    
    // Track orphan citations
    invalidSources.forEach(s => orphanCitations.add(s));
    
    if (hasCitation) {
      claimsWithCitation++;
    } else {
      uncitedClaims.push(claim.text.slice(0, 100) + (claim.text.length > 100 ? '...' : ''));
    }
    
    if (citationsValid) {
      claimsWithValidCitation++;
    }
    
    claimDetails.push({
      claim,
      hasCitation,
      citationsValid,
      citationsSupport: null, // Level 3 requires LLM analysis
      invalidSources,
    });
  }
  
  // Calculate unused sources
  const usedSourceNumbers = Array.from(allCitedSources);
  const unusedSources: number[] = [];
  for (let i = 1; i <= maxSourceNumber; i++) {
    if (!usedSourceNumbers.includes(i)) {
      unusedSources.push(i);
    }
  }
  
  // Calculate scores
  const citationPresenceRate = claims.length > 0 ? claimsWithCitation / claims.length : 0;
  const citationValidityRate = claims.length > 0 ? claimsWithValidCitation / claims.length : 0;
  
  // Overall score: weighted average (presence: 40%, validity: 60%)
  const overallScore = (citationPresenceRate * 0.4) + (citationValidityRate * 0.6);
  
  serverLogger.info(
    `[TraceabilityScore] Analyzed ${claims.length} claims: ` +
    `presence=${(citationPresenceRate * 100).toFixed(1)}%, ` +
    `validity=${(citationValidityRate * 100).toFixed(1)}%, ` +
    `overall=${(overallScore * 100).toFixed(1)}%`
  );
  
  return {
    totalClaims: claims.length,
    claimsWithCitation,
    claimsWithValidCitation,
    claimsWithSupportingCitation: null,
    citationPresenceRate,
    citationValidityRate,
    citationSupportRate: null,
    overallScore,
    claimDetails,
    diagnostics: {
      uncitedClaims,
      orphanCitations: Array.from(orphanCitations),
      unusedSources,
    },
  };
}

/**
 * Create an empty traceability score (for answers with no claims)
 */
function createEmptyScore(): TraceabilityScore {
  return {
    totalClaims: 0,
    claimsWithCitation: 0,
    claimsWithValidCitation: 0,
    claimsWithSupportingCitation: null,
    citationPresenceRate: 1.0, // No claims = nothing to cite
    citationValidityRate: 1.0,
    citationSupportRate: null,
    overallScore: 1.0,
    claimDetails: [],
    diagnostics: {
      uncitedClaims: [],
      orphanCitations: [],
      unusedSources: [],
    },
  };
}

// ============================================================================
// Thresholds and Interpretation
// ============================================================================

/**
 * Traceability quality thresholds
 * 
 * These are DIAGNOSTIC thresholds, not pass/fail criteria.
 * A score below threshold indicates a need for investigation.
 */
export const TRACEABILITY_THRESHOLDS = {
  /** Minimum acceptable citation presence rate */
  citationPresence: {
    excellent: 0.95,  // 95%+ of claims have citations
    good: 0.85,       // 85%+ of claims have citations
    acceptable: 0.70, // 70%+ of claims have citations
    poor: 0.50,       // Below 50% is concerning
  },
  /** Minimum acceptable citation validity rate */
  citationValidity: {
    excellent: 0.98,  // 98%+ of citations are valid
    good: 0.90,       // 90%+ of citations are valid
    acceptable: 0.80, // 80%+ of citations are valid
    poor: 0.60,       // Below 60% indicates systematic issues
  },
  /** Minimum acceptable overall score */
  overall: {
    excellent: 0.95,
    good: 0.85,
    acceptable: 0.70,
    poor: 0.50,
  },
};

/**
 * Interpret a traceability score
 * 
 * @param score - The traceability score to interpret
 * @returns Human-readable interpretation
 */
export function interpretTraceabilityScore(score: TraceabilityScore): {
  level: 'excellent' | 'good' | 'acceptable' | 'poor';
  summary: string;
  recommendations: string[];
} {
  const thresholds = TRACEABILITY_THRESHOLDS.overall;
  
  let level: 'excellent' | 'good' | 'acceptable' | 'poor';
  if (score.overallScore >= thresholds.excellent) {
    level = 'excellent';
  } else if (score.overallScore >= thresholds.good) {
    level = 'good';
  } else if (score.overallScore >= thresholds.acceptable) {
    level = 'acceptable';
  } else {
    level = 'poor';
  }
  
  const recommendations: string[] = [];
  
  if (score.diagnostics.uncitedClaims.length > 0) {
    recommendations.push(
      `${score.diagnostics.uncitedClaims.length} claims lack citations. ` +
      `Consider refining the Cite-then-Write prompt to enforce stricter citation requirements.`
    );
  }
  
  if (score.diagnostics.orphanCitations.length > 0) {
    recommendations.push(
      `Citations reference non-existent sources: [${score.diagnostics.orphanCitations.join(', ')}]. ` +
      `This may indicate hallucination or prompt confusion.`
    );
  }
  
  if (score.diagnostics.unusedSources.length > 2) {
    recommendations.push(
      `${score.diagnostics.unusedSources.length} retrieved sources were never cited. ` +
      `Consider improving source relevance or retrieval quality.`
    );
  }
  
  const summary = `Traceability: ${level.toUpperCase()} (${(score.overallScore * 100).toFixed(1)}%). ` +
    `${score.claimsWithCitation}/${score.totalClaims} claims cited, ` +
    `${score.claimsWithValidCitation}/${score.totalClaims} valid.`;
  
  return { level, summary, recommendations };
}

// Functions are already exported at definition
