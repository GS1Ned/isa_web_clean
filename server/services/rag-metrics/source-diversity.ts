/**
 * Source Diversity Metric
 * Version: 1.0
 * Last Updated: February 2, 2026
 * 
 * Purpose: Measure the diversity of sources used in an answer
 * 
 * CRITICAL: This metric is DIAGNOSTIC, not NORMATIVE.
 * 
 * What this means:
 * - A low diversity score is a SIGNAL to investigate, not automatically a problem
 * - Sometimes ONE authoritative source is the correct answer
 * - High diversity can also be a problem (diluting authority)
 * 
 * Use cases:
 * - Detecting "single-source overconfidence" (answer relies on one source)
 * - Identifying when retrieval is too narrow
 * - Understanding source utilization patterns
 * 
 * Anti-patterns to avoid:
 * - Treating diversity as a quality metric (it's not)
 * - Forcing diversity when one authoritative source is correct
 * - Penalizing answers that correctly use few sources
 */

import { serverLogger } from '../../_core/logger-wiring';
import { AuthorityLevel, AUTHORITY_LEVEL_RANK } from '../authority-scoring';

// ============================================================================
// Types
// ============================================================================

/**
 * Source information for diversity analysis
 */
export interface SourceInfo {
  /** Source number (1-5) */
  sourceNumber: number;
  /** Source type (regulation, standard, etc.) */
  sourceType: string;
  /** Authority level */
  authorityLevel: AuthorityLevel | string;
  /** Number of times cited in the answer */
  citationCount: number;
}

/**
 * Source diversity analysis result
 */
export interface SourceDiversityScore {
  /** Total number of unique sources cited */
  uniqueSourcesCited: number;
  /** Total number of sources available (retrieved) */
  totalSourcesAvailable: number;
  /** Source utilization rate (unique cited / available) */
  utilizationRate: number;
  
  /** Distribution of citations across sources */
  citationDistribution: {
    sourceNumber: number;
    citationCount: number;
    citationPercentage: number;
  }[];
  
  /** Authority level distribution */
  authorityDistribution: {
    level: string;
    count: number;
    percentage: number;
  }[];
  
  /** Source type distribution */
  typeDistribution: {
    type: string;
    count: number;
    percentage: number;
  }[];
  
  /** Concentration metrics */
  concentration: {
    /** Herfindahl-Hirschman Index (0-1, higher = more concentrated) */
    hhi: number;
    /** Gini coefficient (0-1, higher = more unequal) */
    gini: number;
    /** Is the answer dominated by a single source? (>60% citations) */
    singleSourceDominant: boolean;
    /** Dominant source number (if applicable) */
    dominantSource: number | null;
  };
  
  /** Diagnostic interpretation */
  interpretation: {
    pattern: 'balanced' | 'concentrated' | 'single-source' | 'unused-sources';
    description: string;
    /** Is this pattern potentially problematic? */
    requiresReview: boolean;
    /** Suggested investigation (if any) */
    investigationHint: string | null;
  };
}

// ============================================================================
// Diversity Calculation
// ============================================================================

/**
 * Calculate source diversity score
 * 
 * @param answer - The answer text
 * @param sources - Information about available sources
 * @returns Source diversity analysis
 */
export function calculateSourceDiversity(
  answer: string,
  sources: SourceInfo[]
): SourceDiversityScore {
  // Extract citations from answer
  const citationCounts = extractCitationCounts(answer);
  const totalCitations = Object.values(citationCounts).reduce((a, b) => a + b, 0);
  
  // Calculate unique sources cited
  const uniqueSourcesCited = Object.keys(citationCounts).length;
  const totalSourcesAvailable = sources.length;
  const utilizationRate = totalSourcesAvailable > 0 
    ? uniqueSourcesCited / totalSourcesAvailable 
    : 0;
  
  // Build citation distribution
  const citationDistribution = sources.map(source => ({
    sourceNumber: source.sourceNumber,
    citationCount: citationCounts[source.sourceNumber] || 0,
    citationPercentage: totalCitations > 0 
      ? (citationCounts[source.sourceNumber] || 0) / totalCitations 
      : 0,
  }));
  
  // Build authority distribution
  const authorityDistribution = buildAuthorityDistribution(sources, citationCounts);
  
  // Build type distribution
  const typeDistribution = buildTypeDistribution(sources, citationCounts);
  
  // Calculate concentration metrics
  const concentration = calculateConcentration(citationDistribution);
  
  // Generate interpretation
  const interpretation = interpretDiversity(
    uniqueSourcesCited,
    totalSourcesAvailable,
    concentration,
    authorityDistribution
  );
  
  serverLogger.info(
    `[SourceDiversity] ${uniqueSourcesCited}/${totalSourcesAvailable} sources used, ` +
    `HHI=${concentration.hhi.toFixed(3)}, ` +
    `pattern=${interpretation.pattern}`
  );
  
  return {
    uniqueSourcesCited,
    totalSourcesAvailable,
    utilizationRate,
    citationDistribution,
    authorityDistribution,
    typeDistribution,
    concentration,
    interpretation,
  };
}

/**
 * Extract citation counts from answer text
 */
function extractCitationCounts(answer: string): Record<number, number> {
  const counts: Record<number, number> = {};
  const regex = /\[Source\s*(\d+)\]/gi;
  let match;
  
  while ((match = regex.exec(answer)) !== null) {
    const sourceNum = parseInt(match[1], 10);
    counts[sourceNum] = (counts[sourceNum] || 0) + 1;
  }
  
  return counts;
}

/**
 * Build authority level distribution
 */
function buildAuthorityDistribution(
  sources: SourceInfo[],
  citationCounts: Record<number, number>
): { level: string; count: number; percentage: number }[] {
  const levelCounts: Record<string, number> = {};
  let totalCited = 0;
  
  for (const source of sources) {
    const count = citationCounts[source.sourceNumber] || 0;
    if (count > 0) {
      const level = source.authorityLevel || 'unknown';
      levelCounts[level] = (levelCounts[level] || 0) + count;
      totalCited += count;
    }
  }
  
  return Object.entries(levelCounts).map(([level, count]) => ({
    level,
    count,
    percentage: totalCited > 0 ? count / totalCited : 0,
  }));
}

/**
 * Build source type distribution
 */
function buildTypeDistribution(
  sources: SourceInfo[],
  citationCounts: Record<number, number>
): { type: string; count: number; percentage: number }[] {
  const typeCounts: Record<string, number> = {};
  let totalCited = 0;
  
  for (const source of sources) {
    const count = citationCounts[source.sourceNumber] || 0;
    if (count > 0) {
      const type = source.sourceType || 'unknown';
      typeCounts[type] = (typeCounts[type] || 0) + count;
      totalCited += count;
    }
  }
  
  return Object.entries(typeCounts).map(([type, count]) => ({
    type,
    count,
    percentage: totalCited > 0 ? count / totalCited : 0,
  }));
}

/**
 * Calculate concentration metrics
 */
function calculateConcentration(
  distribution: { sourceNumber: number; citationCount: number; citationPercentage: number }[]
): {
  hhi: number;
  gini: number;
  singleSourceDominant: boolean;
  dominantSource: number | null;
} {
  const percentages = distribution.map(d => d.citationPercentage);
  
  // Herfindahl-Hirschman Index (sum of squared market shares)
  const hhi = percentages.reduce((sum, p) => sum + p * p, 0);
  
  // Gini coefficient
  const gini = calculateGini(percentages);
  
  // Check for single-source dominance (>60%)
  let singleSourceDominant = false;
  let dominantSource: number | null = null;
  
  for (const d of distribution) {
    if (d.citationPercentage > 0.6) {
      singleSourceDominant = true;
      dominantSource = d.sourceNumber;
      break;
    }
  }
  
  return { hhi, gini, singleSourceDominant, dominantSource };
}

/**
 * Calculate Gini coefficient
 */
function calculateGini(values: number[]): number {
  if (values.length === 0) return 0;
  
  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const mean = sorted.reduce((a, b) => a + b, 0) / n;
  
  if (mean === 0) return 0;
  
  let sumDiff = 0;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      sumDiff += Math.abs(sorted[i] - sorted[j]);
    }
  }
  
  return sumDiff / (2 * n * n * mean);
}

/**
 * Interpret diversity metrics
 */
function interpretDiversity(
  uniqueSourcesCited: number,
  totalSourcesAvailable: number,
  concentration: { hhi: number; singleSourceDominant: boolean; dominantSource: number | null },
  authorityDistribution: { level: string; count: number; percentage: number }[]
): {
  pattern: 'balanced' | 'concentrated' | 'single-source' | 'unused-sources';
  description: string;
  requiresReview: boolean;
  investigationHint: string | null;
} {
  // Single-source pattern
  if (concentration.singleSourceDominant) {
    // Check if the dominant source is authoritative
    const hasHighAuthority = authorityDistribution.some(
      d => (d.level === 'authoritative' || d.level === 'official') && d.percentage > 0.5
    );
    
    return {
      pattern: 'single-source',
      description: `Answer relies heavily on Source ${concentration.dominantSource}`,
      requiresReview: !hasHighAuthority, // Only review if not high-authority
      investigationHint: hasHighAuthority
        ? null
        : 'Check if single-source reliance is appropriate for this question type',
    };
  }
  
  // Unused sources pattern
  if (uniqueSourcesCited < totalSourcesAvailable * 0.4 && totalSourcesAvailable >= 3) {
    return {
      pattern: 'unused-sources',
      description: `Only ${uniqueSourcesCited}/${totalSourcesAvailable} sources used`,
      requiresReview: true,
      investigationHint: 'Check if retrieval is returning relevant sources',
    };
  }
  
  // Concentrated pattern (HHI > 0.5 but not single-source)
  if (concentration.hhi > 0.5) {
    return {
      pattern: 'concentrated',
      description: 'Citations concentrated on few sources',
      requiresReview: false, // Not necessarily a problem
      investigationHint: null,
    };
  }
  
  // Balanced pattern
  return {
    pattern: 'balanced',
    description: 'Citations distributed across multiple sources',
    requiresReview: false,
    investigationHint: null,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Quick check for single-source dominance
 * 
 * @param answer - The answer text
 * @returns True if one source accounts for >60% of citations
 */
export function hasSingleSourceDominance(answer: string): boolean {
  const counts = extractCitationCounts(answer);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  
  if (total === 0) return false;
  
  for (const count of Object.values(counts)) {
    if (count / total > 0.6) return true;
  }
  
  return false;
}

/**
 * Get the dominant source number (if any)
 * 
 * @param answer - The answer text
 * @returns Dominant source number or null
 */
export function getDominantSource(answer: string): number | null {
  const counts = extractCitationCounts(answer);
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  
  if (total === 0) return null;
  
  for (const [source, count] of Object.entries(counts)) {
    if (count / total > 0.6) return parseInt(source, 10);
  }
  
  return null;
}

// Functions are already exported at definition
