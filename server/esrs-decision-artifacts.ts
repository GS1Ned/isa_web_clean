import { z } from "zod";

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

export interface EsrsRoadmapDecisionArtifact {
  artifactVersion: '1.0';
  artifactType: 'roadmap';
  capability: 'ESRS_MAPPING';
  generatedAt: string;
  subject: {
    sector: string;
    companySize: string;
    esrsRequirements: string[];
  };
  confidence: DecisionArtifactConfidence;
  evidence: DecisionArtifactEvidence;
  summary: {
    phaseCount: number;
    criticalPhaseCount: number;
    quickWinCount: number;
    mappingCount: number;
    topPhaseIds: string[];
  };
}

export const DecisionArtifactConfidenceSchema = z.object({
  level: z.enum(["high", "medium", "low"]),
  score: z.number().min(0).max(1),
  basis: z.string(),
});

export const DecisionArtifactEvidenceSchema = z.object({
  codePaths: z.array(z.string()),
  dataSources: z.array(z.string()),
});

export const EsrsGapAnalysisDecisionArtifactSchema = z.object({
  artifactVersion: z.literal("1.0"),
  artifactType: z.literal("gap_analysis"),
  capability: z.literal("ESRS_MAPPING"),
  generatedAt: z.string(),
  subject: z.object({
    sector: z.string(),
    companySize: z.string(),
    targetRegulations: z.array(z.string()),
  }),
  confidence: DecisionArtifactConfidenceSchema,
  evidence: DecisionArtifactEvidenceSchema,
  summary: z.object({
    totalRequirements: z.number(),
    coveragePercentage: z.number(),
    criticalGapCount: z.number(),
    highGapCount: z.number(),
    remediationPathCount: z.number(),
    criticalGapIds: z.array(z.string()),
  }),
});

export const EsrsAttributeRecommendationDecisionArtifactSchema = z.object({
  artifactVersion: z.literal("1.0"),
  artifactType: z.literal("attribute_recommendation"),
  capability: z.literal("ESRS_MAPPING"),
  generatedAt: z.string(),
  subject: z.object({
    sector: z.string(),
    companySize: z.string().optional(),
    targetRegulations: z.array(z.string()),
  }),
  confidence: DecisionArtifactConfidenceSchema,
  evidence: DecisionArtifactEvidenceSchema,
  summary: z.object({
    totalRecommendations: z.number(),
    highConfidenceCount: z.number(),
    regulationsCovered: z.array(z.string()),
    topRecommendationIds: z.array(z.string()),
  }),
});

export const EsrsRoadmapDecisionArtifactSchema = z.object({
  artifactVersion: z.literal("1.0"),
  artifactType: z.literal("roadmap"),
  capability: z.literal("ESRS_MAPPING"),
  generatedAt: z.string(),
  subject: z.object({
    sector: z.string(),
    companySize: z.string(),
    esrsRequirements: z.array(z.string()),
  }),
  confidence: DecisionArtifactConfidenceSchema,
  evidence: DecisionArtifactEvidenceSchema,
  summary: z.object({
    phaseCount: z.number(),
    criticalPhaseCount: z.number(),
    quickWinCount: z.number(),
    mappingCount: z.number(),
    topPhaseIds: z.array(z.string()),
  }),
});

export const EsrsDecisionArtifactSchema = z.union([
  EsrsGapAnalysisDecisionArtifactSchema,
  EsrsAttributeRecommendationDecisionArtifactSchema,
  EsrsRoadmapDecisionArtifactSchema,
]);

export const EsrsDecisionArtifactsSchema = z.array(EsrsDecisionArtifactSchema);

export type EsrsDecisionArtifact = z.infer<typeof EsrsDecisionArtifactSchema>;

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

export function buildRoadmapDecisionArtifact(input: {
  generatedAt: string;
  sector: string;
  companySize: string;
  esrsRequirements: string[];
  phaseCount: number;
  criticalPhaseCount: number;
  quickWinCount: number;
  mappingCount: number;
  topPhaseIds: string[];
  mode: 'llm' | 'fallback';
  basis: string;
}): EsrsRoadmapDecisionArtifact {
  const baseScore = input.mode === 'llm' ? 0.62 : 0.48;
  const mappingBoost = Math.min(input.mappingCount / 25, 0.18);
  const phaseShapeBoost = input.phaseCount >= 3 ? 0.08 : 0.03;
  const score = clampScore(baseScore + mappingBoost + phaseShapeBoost);
  const level: DecisionArtifactConfidenceLevel =
    score >= 0.7 ? 'high' : score >= 0.45 ? 'medium' : 'low';

  return {
    artifactVersion: '1.0',
    artifactType: 'roadmap',
    capability: 'ESRS_MAPPING',
    generatedAt: input.generatedAt,
    subject: {
      sector: input.sector,
      companySize: input.companySize,
      esrsRequirements: input.esrsRequirements,
    },
    confidence: {
      level,
      score,
      basis: input.basis,
    },
    evidence: {
      codePaths: [
        'server/routers/esrs-roadmap.ts',
        'server/db-esrs-gs1-mapping.ts',
      ],
      dataSources: [
        'getAllEsrsGs1Mappings',
        'gs1_esrs_mappings',
      ],
    },
    summary: {
      phaseCount: input.phaseCount,
      criticalPhaseCount: input.criticalPhaseCount,
      quickWinCount: input.quickWinCount,
      mappingCount: input.mappingCount,
      topPhaseIds: input.topPhaseIds.slice(0, 5),
    },
  };
}
