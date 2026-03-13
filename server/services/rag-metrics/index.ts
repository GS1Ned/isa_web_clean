/**
 * RAG Metrics Module
 * Version: 1.0
 * Last Updated: February 2, 2026
 * 
 * Purpose: Provide diagnostic metrics for RAG quality analysis
 * 
 * IMPORTANT: All metrics in this module are DIAGNOSTIC, not NORMATIVE.
 * They are signals for investigation, not automatic quality judgments.
 * 
 * Metrics:
 * - Traceability Score: How well claims trace back to evidence
 * - Source Diversity: Distribution of sources in the answer
 * 
 * Usage:
 * ```typescript
 * import { 
 *   calculateTraceabilityScore, 
 *   calculateSourceDiversity 
 * } from './services/rag-metrics';
 * 
 * const traceability = calculateTraceabilityScore(answer, sourceIds);
 * const diversity = calculateSourceDiversity(answer, sources);
 * ```
 */

// Traceability Score
export {
  calculateTraceabilityScore,
  interpretTraceabilityScore,
  extractClaims,
  TRACEABILITY_THRESHOLDS,
  type TraceabilityScore,
  type ClaimTraceability,
  type ExtractedClaim,
} from './traceability-score';

// Source Diversity
export {
  calculateSourceDiversity,
  hasSingleSourceDominance,
  getDominantSource,
  type SourceDiversityScore,
  type SourceInfo,
} from './source-diversity';

// ============================================================================
// Combined Analysis
// ============================================================================

import { calculateTraceabilityScore, TraceabilityScore } from './traceability-score';
import { calculateSourceDiversity, SourceDiversityScore, SourceInfo } from './source-diversity';

/**
 * Combined RAG quality metrics
 */
export interface RagQualityMetrics {
  traceability: TraceabilityScore;
  diversity: SourceDiversityScore;
  /** Overall quality assessment */
  assessment: {
    /** Quality level */
    level: 'excellent' | 'good' | 'acceptable' | 'needs-review';
    /** Summary description */
    summary: string;
    /** Issues requiring attention */
    issues: string[];
  };
}

/**
 * Calculate all RAG quality metrics for an answer
 * 
 * @param answer - The answer text
 * @param sources - Information about available sources
 * @returns Combined quality metrics
 */
export function calculateRagQualityMetrics(
  answer: string,
  sources: SourceInfo[]
): RagQualityMetrics {
  // Calculate individual metrics
  const traceability = calculateTraceabilityScore(
    answer,
    sources.map(s => s.sourceNumber),
    sources.length
  );
  
  const diversity = calculateSourceDiversity(answer, sources);
  
  // Generate combined assessment
  const issues: string[] = [];
  
  // Check traceability issues
  if (traceability.citationPresenceRate < 0.7) {
    issues.push(`Low citation rate: ${(traceability.citationPresenceRate * 100).toFixed(0)}% of claims cited`);
  }
  if (traceability.diagnostics.orphanCitations.length > 0) {
    issues.push(`Invalid citations: [${traceability.diagnostics.orphanCitations.join(', ')}]`);
  }
  
  // Check diversity issues (only if flagged for review)
  if (diversity.interpretation.requiresReview) {
    issues.push(diversity.interpretation.description);
  }
  
  // Determine overall level
  let level: 'excellent' | 'good' | 'acceptable' | 'needs-review';
  if (issues.length === 0 && traceability.overallScore >= 0.9) {
    level = 'excellent';
  } else if (issues.length === 0 && traceability.overallScore >= 0.7) {
    level = 'good';
  } else if (issues.length <= 1 && traceability.overallScore >= 0.5) {
    level = 'acceptable';
  } else {
    level = 'needs-review';
  }
  
  const summary = `Traceability: ${(traceability.overallScore * 100).toFixed(0)}%, ` +
    `Sources: ${diversity.uniqueSourcesCited}/${diversity.totalSourcesAvailable}, ` +
    `Pattern: ${diversity.interpretation.pattern}`;
  
  return {
    traceability,
    diversity,
    assessment: { level, summary, issues },
  };
}
