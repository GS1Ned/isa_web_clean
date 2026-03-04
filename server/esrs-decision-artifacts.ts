export type DecisionArtifactConfidenceLevel = 'high' | 'medium' | 'low';

export interface DecisionArtifactConfidence {
  level: DecisionArtifactConfidenceLevel;
  score: number;
  basis: string;
}

export interface DecisionArtifactEvidence {
  codePaths: string[];
  dataSources: string[];
}

export interface EsrsGapAnalysisDecisionArtifact {
  artifactVersion: '1.0';
  artifactType: 'gap_analysis';
  capability: 'ESRS_MAPPING';
  generatedAt: string;
  subject: {
    sector: string;
    companySize: string;
    targetRegulations: string[];
  };
  confidence: DecisionArtifactConfidence;
  evidence: DecisionArtifactEvidence;
  summary: {
    totalRequirements: number;
    coveragePercentage: number;
    criticalGapCount: number;
    highGapCount: number;
    remediationPathCount: number;
    criticalGapIds: string[];
  };
}

export interface EsrsAttributeRecommendationDecisionArtifact {
  artifactVersion: '1.0';
  artifactType: 'attribute_recommendation';
  capability: 'ESRS_MAPPING';
  generatedAt: string;
  subject: {
    sector: string;
    companySize?: string;
    targetRegulations: string[];
  };
  confidence: DecisionArtifactConfidence;
  evidence: DecisionArtifactEvidence;
  summary: {
    totalRecommendations: number;
    highConfidenceCount: number;
    regulationsCovered: string[];
    topRecommendationIds: string[];
  };
}

const BASE_CONFIDENCE_SCORE: Record<DecisionArtifactConfidenceLevel, number> = {
  high: 0.85,
  medium: 0.65,
  low: 0.35,
};

function clampScore(score: number): number {
  return Math.max(0, Math.min(1, Number(score.toFixed(2))));
}

export function buildGapAnalysisDecisionArtifact(input: {
  generatedAt: string;
  sector: string;
  companySize: string;
  targetRegulations?: string[];
  totalRequirements: number;
  coveragePercentage: number;
  criticalGapCount: number;
  highGapCount: number;
  remediationPathCount: number;
  criticalGapIds: string[];
  factCount: number;
  inferenceCount: number;
  uncertainCount: number;
  overallConfidence: DecisionArtifactConfidenceLevel;
}): EsrsGapAnalysisDecisionArtifact {
  const markerCount = input.factCount + input.inferenceCount + input.uncertainCount;
  const baseScore = BASE_CONFIDENCE_SCORE[input.overallConfidence];
  const factRatio = markerCount === 0 ? 0 : input.factCount / markerCount;
  const uncertaintyPenalty = markerCount === 0 ? 0 : (input.uncertainCount / markerCount) * 0.15;
  const score = clampScore(baseScore + factRatio * 0.15 - uncertaintyPenalty);

  return {
    artifactVersion: '1.0',
    artifactType: 'gap_analysis',
    capability: 'ESRS_MAPPING',
    generatedAt: input.generatedAt,
    subject: {
      sector: input.sector,
      companySize: input.companySize,
      targetRegulations: input.targetRegulations ?? [],
    },
    confidence: {
      level: input.overallConfidence,
      score,
      basis: `Coverage analysis across ${input.totalRequirements} mapped requirements with ${input.factCount} fact markers and ${input.inferenceCount} inferred markers.`,
    },
    evidence: {
      codePaths: [
        'server/routers/gap-analyzer.ts',
        'server/gap-reasoning.ts',
      ],
      dataSources: [
        'gs1_esrs_mappings',
        'gs1_attribute_esrs_mapping',
      ],
    },
    summary: {
      totalRequirements: input.totalRequirements,
      coveragePercentage: input.coveragePercentage,
      criticalGapCount: input.criticalGapCount,
      highGapCount: input.highGapCount,
      remediationPathCount: input.remediationPathCount,
      criticalGapIds: input.criticalGapIds.slice(0, 5),
    },
  };
}

export function buildAttributeRecommendationDecisionArtifact(input: {
  generatedAt: string;
  sector: string;
  companySize?: string;
  targetRegulations?: string[];
  totalRecommendations: number;
  highConfidenceCount: number;
  regulationsCovered: string[];
  topRecommendationIds: string[];
  recommendationScores: number[];
  overallConfidence: DecisionArtifactConfidenceLevel;
  overallBasis: string;
}): EsrsAttributeRecommendationDecisionArtifact {
  const averageScore =
    input.recommendationScores.length === 0
      ? 0
      : input.recommendationScores.reduce((sum, score) => sum + score, 0) /
        input.recommendationScores.length;

  return {
    artifactVersion: '1.0',
    artifactType: 'attribute_recommendation',
    capability: 'ESRS_MAPPING',
    generatedAt: input.generatedAt,
    subject: {
      sector: input.sector,
      companySize: input.companySize,
      targetRegulations: input.targetRegulations ?? [],
    },
    confidence: {
      level: input.overallConfidence,
      score: clampScore(averageScore),
      basis: input.overallBasis,
    },
    evidence: {
      codePaths: [
        'server/attribute-recommender.ts',
        'server/routers/attribute-recommender.ts',
      ],
      dataSources: [
        'ATTRIBUTE_METADATA',
        'SECTOR_ATTRIBUTES',
      ],
    },
    summary: {
      totalRecommendations: input.totalRecommendations,
      highConfidenceCount: input.highConfidenceCount,
      regulationsCovered: input.regulationsCovered,
      topRecommendationIds: input.topRecommendationIds.slice(0, 5),
    },
  };
}
