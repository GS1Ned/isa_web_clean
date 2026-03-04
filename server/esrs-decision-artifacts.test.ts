import { describe, expect, it } from 'vitest';

import {
  buildAttributeRecommendationDecisionArtifact,
  buildGapAnalysisDecisionArtifact,
  buildRoadmapDecisionArtifact,
} from './esrs-decision-artifacts.js';

describe('ESRS decision artifacts', () => {
  it('builds a stable gap-analysis decision artifact', () => {
    const artifact = buildGapAnalysisDecisionArtifact({
      generatedAt: '2026-03-04T12:00:00.000Z',
      sector: 'food_beverage',
      companySize: 'large',
      targetRegulations: ['CSRD'],
      totalRequirements: 42,
      coveragePercentage: 68,
      criticalGapCount: 3,
      highGapCount: 5,
      remediationPathCount: 4,
      criticalGapIds: ['gap-1', 'gap-2', 'gap-3'],
      factCount: 7,
      inferenceCount: 5,
      uncertainCount: 1,
      overallConfidence: 'medium',
    });

    expect(artifact.artifactType).toBe('gap_analysis');
    expect(artifact.capability).toBe('ESRS_MAPPING');
    expect(artifact.confidence.level).toBe('medium');
    expect(artifact.confidence.score).toBeGreaterThan(0);
    expect(artifact.summary.criticalGapIds).toEqual(['gap-1', 'gap-2', 'gap-3']);
    expect(artifact.evidence.dataSources).toContain('gs1_esrs_mappings');
  });

  it('builds a stable attribute-recommendation decision artifact', () => {
    const artifact = buildAttributeRecommendationDecisionArtifact({
      generatedAt: '2026-03-04T12:00:00.000Z',
      sector: 'Retail',
      companySize: 'medium',
      targetRegulations: ['CSRD', 'DPP'],
      totalRecommendations: 6,
      highConfidenceCount: 3,
      regulationsCovered: ['CSRD', 'DPP'],
      topRecommendationIds: ['productCarbonFootprint', 'recycledContentPercentage'],
      recommendationScores: [0.9, 0.8, 0.6],
      overallConfidence: 'high',
      overallBasis: 'Majority of recommendations based on database mappings',
    });

    expect(artifact.artifactType).toBe('attribute_recommendation');
    expect(artifact.capability).toBe('ESRS_MAPPING');
    expect(artifact.confidence.level).toBe('high');
    expect(artifact.confidence.score).toBeCloseTo(0.77, 2);
    expect(artifact.summary.topRecommendationIds).toEqual([
      'productCarbonFootprint',
      'recycledContentPercentage',
    ]);
    expect(artifact.evidence.dataSources).toContain('ATTRIBUTE_METADATA');
  });

  it('builds a stable roadmap decision artifact', () => {
    const artifact = buildRoadmapDecisionArtifact({
      generatedAt: '2026-03-04T12:00:00.000Z',
      sector: 'electronics',
      companySize: 'large',
      esrsRequirements: ['ESRS E1', 'ESRS E5'],
      phaseCount: 4,
      criticalPhaseCount: 1,
      quickWinCount: 1,
      mappingCount: 12,
      topPhaseIds: ['phase-1', 'phase-2', 'phase-3'],
      mode: 'llm',
      basis: 'LLM roadmap synthesis grounded in 12 relevant mappings.',
    });

    expect(artifact.artifactType).toBe('roadmap');
    expect(artifact.capability).toBe('ESRS_MAPPING');
    expect(artifact.confidence.level).toBe('high');
    expect(artifact.summary.mappingCount).toBe(12);
    expect(artifact.summary.topPhaseIds).toEqual(['phase-1', 'phase-2', 'phase-3']);
  });
});
