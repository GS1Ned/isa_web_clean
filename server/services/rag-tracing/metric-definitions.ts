/**
 * RAG Quality Metric Definitions
 * 
 * This file defines the standard metrics used to evaluate RAG pipeline quality.
 * Each metric has a clear definition, calculation method, and interpretation guide.
 * 
 * These definitions ensure reproducible and consistent quality evaluation.
 * 
 * @module metric-definitions
 */

// ============================================================================
// Core Quality Metrics
// ============================================================================

/**
 * CITATION_PRECISION
 * 
 * Definition: The proportion of citations in the generated answer that
 * actually support the claims they are attached to.
 * 
 * Calculation:
 *   citation_precision = verified_citations / total_citations
 * 
 * Range: 0.0 to 1.0
 * 
 * Interpretation:
 *   - 1.0: Perfect - all citations support their claims
 *   - 0.8+: Good - most citations are accurate
 *   - 0.5-0.8: Moderate - some citations may be misleading
 *   - <0.5: Poor - many citations don't support claims
 * 
 * Target: >= 0.85 for compliance-grade answers
 */
export interface CitationPrecisionMetric {
  name: 'citation_precision';
  value: number;
  verifiedCitations: number;
  totalCitations: number;
}

/**
 * CONFIDENCE_SCORE
 * 
 * Definition: A composite score indicating the system's confidence in the
 * generated answer, based on evidence quality and coverage.
 * 
 * Calculation:
 *   confidence = (avg_similarity * 0.4) + (authority_score * 0.3) + (coverage_score * 0.3)
 * 
 * Components:
 *   - avg_similarity: Average cosine similarity of retrieved chunks
 *   - authority_score: Weighted authority level of sources
 *   - coverage_score: How well the evidence covers the query
 * 
 * Range: 0.0 to 1.0
 * 
 * Interpretation:
 *   - 0.8+: High confidence - answer is well-supported
 *   - 0.6-0.8: Medium confidence - answer is reasonably supported
 *   - 0.4-0.6: Low confidence - answer may have gaps
 *   - <0.4: Very low - consider abstention
 * 
 * Target: >= 0.7 for production answers
 */
export interface ConfidenceScoreMetric {
  name: 'confidence_score';
  value: number;
  components: {
    avgSimilarity: number;
    authorityScore: number;
    coverageScore: number;
  };
}

/**
 * VERIFICATION_RATE
 * 
 * Definition: The proportion of claims in the answer that can be traced
 * back to specific passages in the retrieved evidence.
 * 
 * Calculation:
 *   verification_rate = verified_claims / total_claims
 * 
 * Range: 0.0 to 1.0
 * 
 * Interpretation:
 *   - 1.0: Perfect - all claims are evidence-backed
 *   - 0.8+: Good - most claims are verifiable
 *   - 0.5-0.8: Moderate - some claims lack evidence
 *   - <0.5: Poor - many claims are unverified (hallucination risk)
 * 
 * Target: >= 0.90 for compliance-grade answers
 */
export interface VerificationRateMetric {
  name: 'verification_rate';
  value: number;
  verifiedClaims: number;
  totalClaims: number;
  unverifiedClaims: string[];
}

/**
 * AUTHORITY_SCORE
 * 
 * Definition: A weighted score indicating the authority level of the
 * sources used to generate the answer.
 * 
 * Authority Weights:
 *   - authoritative (EU regulations, official standards): 1.0
 *   - official (GS1 standards, EFRAG guidance): 0.9
 *   - standard (ESRS datapoints): 0.8
 *   - guidance (implementation guides): 0.7
 *   - technical (technical specifications): 0.6
 *   - informational (news, industry reports): 0.5
 * 
 * Calculation:
 *   authority_score = sum(source_weight * source_similarity) / sum(source_similarity)
 * 
 * Range: 0.0 to 1.0
 * 
 * Interpretation:
 *   - 0.9+: Excellent - primarily authoritative sources
 *   - 0.7-0.9: Good - mix of authoritative and guidance
 *   - 0.5-0.7: Moderate - significant guidance/informational content
 *   - <0.5: Low - primarily informational sources
 * 
 * Target: >= 0.75 for compliance-related queries
 */
export interface AuthorityScoreMetric {
  name: 'authority_score';
  value: number;
  sourceBreakdown: Record<string, number>;
}

/**
 * RETRIEVAL_QUALITY
 * 
 * Definition: A composite score indicating how well the retrieval phase
 * found relevant content for the query.
 * 
 * Components:
 *   - top_k_similarity: Average similarity of top K results
 *   - similarity_variance: Variance in similarity scores (lower is better)
 *   - coverage: Number of distinct source types in results
 * 
 * Calculation:
 *   retrieval_quality = (top_k_similarity * 0.5) + ((1 - similarity_variance) * 0.3) + (coverage_bonus * 0.2)
 * 
 * Range: 0.0 to 1.0
 * 
 * Interpretation:
 *   - 0.8+: Excellent retrieval - highly relevant results
 *   - 0.6-0.8: Good retrieval - mostly relevant
 *   - 0.4-0.6: Moderate - some noise in results
 *   - <0.4: Poor - retrieval may need improvement
 */
export interface RetrievalQualityMetric {
  name: 'retrieval_quality';
  value: number;
  topKSimilarity: number;
  similarityVariance: number;
  sourceTypeCoverage: number;
}

// ============================================================================
// Latency Metrics
// ============================================================================

/**
 * TOTAL_LATENCY_MS
 * 
 * Definition: Total time from query receipt to response delivery.
 * 
 * Target: < 3000ms for interactive use
 */
export interface TotalLatencyMetric {
  name: 'total_latency_ms';
  value: number;
}

/**
 * RETRIEVAL_LATENCY_MS
 * 
 * Definition: Time spent in the retrieval phase (embedding + search).
 * 
 * Target: < 500ms
 */
export interface RetrievalLatencyMetric {
  name: 'retrieval_latency_ms';
  value: number;
}

/**
 * GENERATION_LATENCY_MS
 * 
 * Definition: Time spent in the generation phase (LLM call).
 * 
 * Target: < 2000ms
 */
export interface GenerationLatencyMetric {
  name: 'generation_latency_ms';
  value: number;
}

// ============================================================================
// Aggregate Metrics (for dashboards)
// ============================================================================

/**
 * ABSTENTION_RATE
 * 
 * Definition: Proportion of queries where the system abstained from answering.
 * 
 * Calculation:
 *   abstention_rate = abstained_queries / total_queries
 * 
 * Interpretation:
 *   - <5%: Very low - system answers most queries
 *   - 5-15%: Normal - appropriate caution
 *   - 15-30%: High - may indicate corpus gaps
 *   - >30%: Very high - investigate root causes
 */
export interface AbstentionRateMetric {
  name: 'abstention_rate';
  value: number;
  abstainedCount: number;
  totalCount: number;
  reasonBreakdown: Record<string, number>;
}

/**
 * ERROR_RATE
 * 
 * Definition: Proportion of queries that resulted in errors.
 * 
 * Target: < 1%
 */
export interface ErrorRateMetric {
  name: 'error_rate';
  value: number;
  errorCount: number;
  totalCount: number;
  categoryBreakdown: Record<string, number>;
}

/**
 * CACHE_HIT_RATE
 * 
 * Definition: Proportion of queries served from cache.
 * 
 * Interpretation:
 *   - Higher is better for performance
 *   - But very high (>50%) may indicate limited query diversity
 */
export interface CacheHitRateMetric {
  name: 'cache_hit_rate';
  value: number;
  cacheHits: number;
  totalQueries: number;
}

// ============================================================================
// Metric Calculation Helpers
// ============================================================================

/**
 * Authority level weights for score calculation
 */
export const AUTHORITY_WEIGHTS: Record<string, number> = {
  'authoritative': 1.0,
  'official': 0.9,
  'regulation': 0.9,
  'standard': 0.8,
  'guidance': 0.7,
  'technical': 0.6,
  'informational': 0.5,
};

/**
 * Calculate authority score from sources
 */
export function calculateAuthorityMetric(
  sources: Array<{ authorityLevel: string; similarity: number }>
): AuthorityScoreMetric {
  if (sources.length === 0) {
    return {
      name: 'authority_score',
      value: 0,
      sourceBreakdown: {},
    };
  }
  
  let weightedSum = 0;
  let totalWeight = 0;
  const breakdown: Record<string, number> = {};
  
  for (const source of sources) {
    const weight = AUTHORITY_WEIGHTS[source.authorityLevel] || 0.5;
    weightedSum += weight * source.similarity;
    totalWeight += source.similarity;
    breakdown[source.authorityLevel] = (breakdown[source.authorityLevel] || 0) + 1;
  }
  
  return {
    name: 'authority_score',
    value: totalWeight > 0 ? weightedSum / totalWeight : 0,
    sourceBreakdown: breakdown,
  };
}

/**
 * Calculate verification rate from claims
 */
export function calculateVerificationMetric(
  verifiedClaims: number,
  totalClaims: number,
  unverifiedClaims: string[] = []
): VerificationRateMetric {
  return {
    name: 'verification_rate',
    value: totalClaims > 0 ? verifiedClaims / totalClaims : 0,
    verifiedClaims,
    totalClaims,
    unverifiedClaims,
  };
}

/**
 * Calculate citation precision
 */
export function calculateCitationPrecisionMetric(
  verifiedCitations: number,
  totalCitations: number
): CitationPrecisionMetric {
  return {
    name: 'citation_precision',
    value: totalCitations > 0 ? verifiedCitations / totalCitations : 0,
    verifiedCitations,
    totalCitations,
  };
}

/**
 * Quality thresholds for compliance-grade answers
 */
export const COMPLIANCE_THRESHOLDS = {
  citation_precision: 0.85,
  verification_rate: 0.90,
  confidence_score: 0.70,
  authority_score: 0.75,
} as const;

/**
 * Check if metrics meet compliance-grade thresholds
 */
export function meetsComplianceGrade(metrics: {
  citationPrecision?: number;
  verificationRate?: number;
  confidenceScore?: number;
  authorityScore?: number;
}): { passes: boolean; failures: string[] } {
  const failures: string[] = [];
  
  if (metrics.citationPrecision !== undefined && 
      metrics.citationPrecision < COMPLIANCE_THRESHOLDS.citation_precision) {
    failures.push(`citation_precision (${metrics.citationPrecision.toFixed(2)} < ${COMPLIANCE_THRESHOLDS.citation_precision})`);
  }
  
  if (metrics.verificationRate !== undefined && 
      metrics.verificationRate < COMPLIANCE_THRESHOLDS.verification_rate) {
    failures.push(`verification_rate (${metrics.verificationRate.toFixed(2)} < ${COMPLIANCE_THRESHOLDS.verification_rate})`);
  }
  
  if (metrics.confidenceScore !== undefined && 
      metrics.confidenceScore < COMPLIANCE_THRESHOLDS.confidence_score) {
    failures.push(`confidence_score (${metrics.confidenceScore.toFixed(2)} < ${COMPLIANCE_THRESHOLDS.confidence_score})`);
  }
  
  if (metrics.authorityScore !== undefined && 
      metrics.authorityScore < COMPLIANCE_THRESHOLDS.authority_score) {
    failures.push(`authority_score (${metrics.authorityScore.toFixed(2)} < ${COMPLIANCE_THRESHOLDS.authority_score})`);
  }
  
  return {
    passes: failures.length === 0,
    failures,
  };
}
