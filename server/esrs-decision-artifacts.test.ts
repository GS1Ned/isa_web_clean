import { describe, expect, it } from 'vitest';

import {
  buildDecisionArtifactConfidence,
  buildAttributeRecommendationDecisionArtifact,
  buildGapAnalysisDecisionArtifact,
  buildRoadmapDecisionArtifact,
  scoreToDecisionArtifactConfidenceLevel,
} from './esrs-decision-artifacts.js';

describe('ESRS decision artifacts', () => {
  it('maps confidence scores into stable decision-artifact bands', () => {
    expect(scoreToDecisionArtifactConfidenceLevel(0.82)).toBe('high');
    expect(scoreToDecisionArtifactConfidenceLevel(0.72)).toBe('medium');
    expect(scoreToDecisionArtifactConfidenceLevel(0.35)).toBe('low');
  });

  it('keeps decision-artifact confidence conservative when preferred and score-derived levels differ', () => {
    const confidence = buildDecisionArtifactConfidence({
      preferredLevel: 'medium',
      rawScore: 0.83,
      basis: 'Mixed evidence basis',
    });

    expect(confidence.level).toBe('medium');
    expect(confidence.score).toBe(0.83);
    expect(confidence.basis).toBe('Mixed evidence basis');
    expect(confidence.reviewRecommended).toBe(true);
    expect(confidence.uncertaintyClass).toBe('review_required');
    expect(confidence.escalationAction).toBe('analyst_review');
  });

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
      evidenceRefs: [
        {
          sourceId: 1,
          sourceChunkId: 10,
          evidenceKey: 'ke:10:hash',
          citationLabel: 'CSRD — Article 19a',
          sourceLocator: 'https://eur-lex.example/article-19a',
        },
      ],
    });

    expect(artifact.artifactType).toBe('gap_analysis');
    expect(artifact.capability).toBe('ESRS_MAPPING');
    expect(artifact.confidence.level).toBe('medium');
    expect(artifact.confidence.reviewRecommended).toBe(true);
    expect(artifact.confidence.uncertaintyClass).toBe('review_required');
    expect(artifact.confidence.score).toBeGreaterThan(0);
    expect(artifact.summary.criticalGapIds).toEqual(['gap-1', 'gap-2', 'gap-3']);
    expect(artifact.evidence.dataSources).toContain('gs1_esrs_mappings');
    expect(artifact.evidence.evidenceRefs?.[0]?.evidenceKey).toBe('ke:10:hash');
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
      evidenceRefs: [
        {
          sourceChunkId: 22,
          citationLabel: 'ESRS E1-3 — GHG emissions',
          sourceLocator: 'https://efrag.example/e1-3',
        },
      ],
    });

    expect(artifact.artifactType).toBe('attribute_recommendation');
    expect(artifact.capability).toBe('ESRS_MAPPING');
    expect(artifact.confidence.level).toBe('high');
    expect(artifact.confidence.reviewRecommended).toBe(false);
    expect(artifact.confidence.uncertaintyClass).toBe('decision_grade');
    expect(artifact.confidence.escalationAction).toBe('none');
    expect(artifact.confidence.score).toBeCloseTo(0.77, 2);
    expect(artifact.summary.topRecommendationIds).toEqual([
      'productCarbonFootprint',
      'recycledContentPercentage',
    ]);
    expect(artifact.evidence.dataSources).toContain('ATTRIBUTE_METADATA');
    expect(artifact.evidence.evidenceRefs?.[0]?.citationLabel).toContain('ESRS E1-3');
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
      evidenceRefs: [
        {
          sourceChunkId: 33,
          evidenceKey: 'ke:33:hash',
          citationLabel: 'ESRS E5 — Circular Economy',
          sourceLocator: 'https://efrag.example/e5',
        },
      ],
    });

    expect(artifact.artifactType).toBe('roadmap');
    expect(artifact.capability).toBe('ESRS_MAPPING');
    expect(artifact.confidence.level).toBe('high');
    expect(artifact.confidence.reviewRecommended).toBe(false);
    expect(artifact.confidence.uncertaintyClass).toBe('decision_grade');
    expect(artifact.summary.mappingCount).toBe(12);
    expect(artifact.summary.topPhaseIds).toEqual(['phase-1', 'phase-2', 'phase-3']);
    expect(artifact.evidence.evidenceRefs?.[0]?.sourceChunkId).toBe(33);
  });

  it('marks low-confidence artifacts as insufficient evidence with human review required', () => {
    const confidence = buildDecisionArtifactConfidence({
      rawScore: 0.22,
      basis: 'Sparse and weak evidence basis',
    });

    expect(confidence.level).toBe('low');
    expect(confidence.reviewRecommended).toBe(true);
    expect(confidence.uncertaintyClass).toBe('insufficient_evidence');
    expect(confidence.escalationAction).toBe('human_review_required');
  });
});
