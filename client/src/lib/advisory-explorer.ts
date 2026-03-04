type AdvisoryFullPayload = {
  mappingResults?: unknown[];
  gapAnalysis?: unknown[];
  recommendations?: unknown[];
};

export type ExplorerMapping = {
  mappingId: string;
  regulationDatapoint: string;
  regulationStandard: string;
  sectors: string[];
  confidence: string;
  rationale: string;
  gs1Attribute?: string;
  description?: string;
  datasetReferences: string[];
};

export type ExplorerGap = {
  gapId: string;
  title: string;
  category: string;
  description: string;
  affectedSectors: string[];
  recommendedAction?: string;
  datasetReferences: string[];
};

export type ExplorerRecommendation = {
  recommendationId: string;
  title: string;
  description: string;
  timeframe: string;
  category: string;
  estimatedEffort: string;
  implementationStatus?: string;
  datasetReferences: string[];
};

function bucketRecommendationTimeframe(timeframe?: string | null) {
  const normalized = timeframe?.toLowerCase() ?? "";

  if (normalized.includes("short") || normalized.includes("0-3")) {
    return "short-term";
  }

  if (
    normalized.includes("medium") ||
    normalized.includes("3-6") ||
    normalized.includes("6-12")
  ) {
    return "medium-term";
  }

  return "long-term";
}

export function normalizeExplorerMapping(mapping: any, index: number): ExplorerMapping {
  return {
    mappingId: mapping?.mappingId ?? mapping?.id ?? `legacy-mapping-${index + 1}`,
    regulationDatapoint:
      mapping?.regulationDatapoint ?? mapping?.topic ?? "Mapping",
    regulationStandard: mapping?.regulationStandard ?? "UNKNOWN",
    sectors: Array.isArray(mapping?.sectors) ? mapping.sectors : ["All"],
    confidence: mapping?.confidence ?? "missing",
    rationale:
      mapping?.rationale ??
      mapping?.implementationGuidance ??
      "No rationale recorded.",
    gs1Attribute: mapping?.gs1Attribute,
    description: mapping?.description ?? mapping?.implementationGuidance,
    datasetReferences: Array.isArray(mapping?.datasetReferences)
      ? mapping.datasetReferences
      : [],
  };
}

export function normalizeExplorerGap(gap: any, index: number): ExplorerGap {
  return {
    gapId: gap?.gapId ?? gap?.id ?? `legacy-gap-${index + 1}`,
    title: gap?.title ?? gap?.topic ?? "Gap",
    category: gap?.category ?? gap?.severity ?? "moderate",
    description: gap?.description ?? "No description available.",
    affectedSectors: Array.isArray(gap?.affectedSectors)
      ? gap.affectedSectors
      : Array.isArray(gap?.sectors)
        ? gap.sectors
        : ["All"],
    recommendedAction: gap?.recommendedAction,
    datasetReferences: Array.isArray(gap?.datasetReferences)
      ? gap.datasetReferences
      : [],
  };
}

export function normalizeExplorerRecommendation(
  recommendation: any,
  index: number,
): ExplorerRecommendation {
  return {
    recommendationId:
      recommendation?.recommendationId ??
      recommendation?.id ??
      `legacy-rec-${index + 1}`,
    title: recommendation?.title ?? "Recommendation",
    description: recommendation?.description ?? "No description available.",
    timeframe: bucketRecommendationTimeframe(recommendation?.timeframe),
    category: recommendation?.category ?? "strategic",
    estimatedEffort:
      recommendation?.estimatedEffort ?? recommendation?.estimatedROI ?? "unknown",
    implementationStatus: recommendation?.implementationStatus,
    datasetReferences: Array.isArray(recommendation?.datasetReferences)
      ? recommendation.datasetReferences
      : [],
  };
}

export function buildAdvisoryExplorerModel(advisory: AdvisoryFullPayload | null | undefined) {
  const mappings = Array.isArray(advisory?.mappingResults)
    ? advisory.mappingResults.map(normalizeExplorerMapping)
    : [];
  const gaps = Array.isArray(advisory?.gapAnalysis)
    ? advisory.gapAnalysis.map(normalizeExplorerGap)
    : [];
  const recommendations = Array.isArray(advisory?.recommendations)
    ? advisory.recommendations.map(normalizeExplorerRecommendation)
    : [];

  return {
    mappings,
    gaps,
    recommendations,
  };
}
