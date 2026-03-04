type AdvisoryFullPayload = {
  mappingResults?: unknown[];
  gapAnalysis?: unknown[];
  recommendations?: unknown[];
};

export const EXPLORER_ALL_FILTER_VALUE = "__all__";

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

export type AdvisoryExplorerModel = {
  mappings: ExplorerMapping[];
  gaps: ExplorerGap[];
  recommendations: ExplorerRecommendation[];
};

export type AdvisoryExplorerInventory = {
  regulations: string[];
  sectors: string[];
  confidenceLevels: string[];
  gapSeverities: string[];
  recommendationTimeframes: string[];
};

const REGULATION_ORDER = ["ESRS E1", "ESRS E2", "ESRS E3", "ESRS E4", "ESRS E5", "EUDR", "DPP"];
const SECTOR_ORDER = ["DIY", "FMCG", "Healthcare", "All"];
const CONFIDENCE_ORDER = ["direct", "partial", "missing"];
const GAP_SEVERITY_ORDER = ["critical", "moderate", "low-priority"];
const TIMEFRAME_ORDER = ["short-term", "medium-term", "long-term"];

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

function uniqueNonEmpty(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values.filter((value): value is string => typeof value === "string" && value.trim().length > 0),
    ),
  );
}

function sortWithPreferredOrder(values: string[], preferredOrder: string[]) {
  const ranking = new Map(preferredOrder.map((value, index) => [value, index]));

  return [...values].sort((left, right) => {
    const leftRank = ranking.get(left);
    const rightRank = ranking.get(right);

    if (leftRank != null && rightRank != null) {
      return leftRank - rightRank;
    }

    if (leftRank != null) {
      return -1;
    }

    if (rightRank != null) {
      return 1;
    }

    return left.localeCompare(right);
  });
}

export function toExplorerSelectValue(value?: string) {
  return value ?? EXPLORER_ALL_FILTER_VALUE;
}

export function fromExplorerSelectValue(value: string) {
  return value === EXPLORER_ALL_FILTER_VALUE ? undefined : value;
}

export function formatExplorerFilterLabel(value: string) {
  if (value === "All") {
    return "All (cross-sector)";
  }

  if (value.includes("ESRS") || value === "DPP" || value === "EUDR" || value === "DIY" || value === "FMCG") {
    return value;
  }

  return value
    .split(/[-_]/g)
    .map(part => (part.length === 0 ? part : `${part[0].toUpperCase()}${part.slice(1)}`))
    .join(" ");
}

export function buildAdvisoryExplorerModel(
  advisory: AdvisoryFullPayload | null | undefined,
): AdvisoryExplorerModel {
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

export function buildAdvisoryExplorerInventory(
  model: AdvisoryExplorerModel,
): AdvisoryExplorerInventory {
  return {
    regulations: sortWithPreferredOrder(
      uniqueNonEmpty(model.mappings.map(mapping => mapping.regulationStandard)),
      REGULATION_ORDER,
    ),
    sectors: sortWithPreferredOrder(
      uniqueNonEmpty([
        ...model.mappings.flatMap(mapping => mapping.sectors),
        ...model.gaps.flatMap(gap => gap.affectedSectors),
      ]),
      SECTOR_ORDER,
    ),
    confidenceLevels: sortWithPreferredOrder(
      uniqueNonEmpty(model.mappings.map(mapping => mapping.confidence)),
      CONFIDENCE_ORDER,
    ),
    gapSeverities: sortWithPreferredOrder(
      uniqueNonEmpty(model.gaps.map(gap => gap.category)),
      GAP_SEVERITY_ORDER,
    ),
    recommendationTimeframes: sortWithPreferredOrder(
      uniqueNonEmpty(model.recommendations.map(recommendation => recommendation.timeframe)),
      TIMEFRAME_ORDER,
    ),
  };
}
