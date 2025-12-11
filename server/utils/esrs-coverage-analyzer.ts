import type { ESRSDatapoint, ESRSMaterialityLevel } from "../../shared/esrs-datapoint-catalog";
import { ESRS_DATAPOINT_CATALOG } from "../../shared/esrs-datapoint-catalog";

export interface ESRSCoverageAnalysisInput {
  sector: string;
  esrsTopics: string[];
  availableStandards: string[];
  minimumMateriality?: ESRSMaterialityLevel;
}

export interface TopicCoverageSummary {
  topic: string;
  totalDatapoints: number;
  coveredCount: number;
  coveragePercentage: number;
  highPriorityGapCount: number;
}

export interface CoverageGap {
  datapointId: string;
  topic: string;
  label: string;
  materiality: ESRSMaterialityLevel;
  sectorRelevance: "core" | "moderate" | "low";
  priority: "high" | "medium" | "low";
  reason: string;
  recommendedAction: string;
}

export interface ESRSCoverageAnalysisResult {
  sector: string;
  topics: TopicCoverageSummary[];
  coveredDatapoints: ESRSDatapoint[];
  gapDatapoints: CoverageGap[];
  recommendations: string[];
}

/**
 * Analyze ESRS coverage by GS1 standards for a given sector and topic set.
 */
export function analyzeESRSCoverage(input: ESRSCoverageAnalysisInput): ESRSCoverageAnalysisResult {
  const sector = input.sector;
  const topics = input.esrsTopics;
  const availableStandardsSet = new Set(input.availableStandards);
  const minimumMateriality = input.minimumMateriality || "low";

  const materialityRank: Record<ESRSMaterialityLevel, number> = {
    mandatory: 4,
    high: 3,
    medium: 2,
    low: 1
  };

  const filteredDatapoints = ESRS_DATAPOINT_CATALOG.filter(datapoint => {
    if (topics.length && topics.indexOf(datapoint.topic) == -1) {
      return false;
    }

    const dataRank = materialityRank[datapoint.materiality];
    const minimumRank = materialityRank[minimumMateriality];
    if (dataRank < minimumRank) {
      return false;
    }

    if (!isSectorRelevant(datapoint, sector)) {
      return false;
    }

    return true;
  });

  const coveredDatapoints: ESRSDatapoint[] = [];
  const gapDatapoints: CoverageGap[] = [];

  filteredDatapoints.forEach(datapoint => {
    const hasCoverage = datapoint.supportedStandards.some(standard => availableStandardsSet.has(standard));
    if (hasCoverage) {
      coveredDatapoints.push(datapoint);
    } else {
      const gap = buildGap(datapoint, sector, materialityRank);
      gapDatapoints.push(gap);
    }
  });

  const topicSummaries: TopicCoverageSummary[] = [];
  topics.forEach(topic => {
    const topicDatapoints = filteredDatapoints.filter(datapoint => datapoint.topic == topic);
    const topicCovered = coveredDatapoints.filter(datapoint => datapoint.topic == topic);
    const topicGaps = gapDatapoints.filter(gap => gap.topic == topic);
    const total = topicDatapoints.length;
    const coveredCount = topicCovered.length;
    const coveragePercentage = total > 0 ? Math.round((coveredCount / total) * 1000) / 10 : 0;
    const highPriorityGapCount = topicGaps.filter(gap => gap.priority == "high").length;

    topicSummaries.push({
      topic,
      totalDatapoints: total,
      coveredCount,
      coveragePercentage,
      highPriorityGapCount
    });
  });

  const recommendationSet = new Set<string>();
  gapDatapoints.forEach(gap => {
    recommendationSet.add(gap.recommendedAction);
  });

  const recommendations = Array.from(recommendationSet);

  return {
    sector,
    topics: topicSummaries,
    coveredDatapoints,
    gapDatapoints,
    recommendations
  };
}

function isSectorRelevant(datapoint: ESRSDatapoint, sector: string): boolean {
  if (!sector) {
    return true;
  }

  if (datapoint.sectorTags.indexOf(sector) != -1) {
    return true;
  }

  if (datapoint.sectorTags.indexOf("generic") != -1) {
    return true;
  }

  return false;
}

function buildGap(datapoint: ESRSDatapoint, sector: string, materialityRank: Record<ESRSMaterialityLevel, number>): CoverageGap {
  const sectorRelevance = computeSectorRelevance(datapoint, sector);
  const priority = computeGapPriority(datapoint.materiality, sectorRelevance, materialityRank);
  const reason = buildGapReason(datapoint, sectorRelevance);
  const recommendedAction = buildRecommendedAction(datapoint, priority);

  return {
    datapointId: datapoint.id,
    topic: datapoint.topic,
    label: datapoint.label,
    materiality: datapoint.materiality,
    sectorRelevance,
    priority,
    reason,
    recommendedAction
  };
}

function computeSectorRelevance(datapoint: ESRSDatapoint, sector: string): "core" | "moderate" | "low" {
  if (datapoint.sectorTags.indexOf(sector) != -1) {
    return "core";
  }
  if (datapoint.sectorTags.indexOf("generic") != -1) {
    return "moderate";
  }
  return "low";
}

function computeGapPriority(
  materiality: ESRSMaterialityLevel,
  sectorRelevance: "core" | "moderate" | "low",
  materialityRank: Record<ESRSMaterialityLevel, number>
): "high" | "medium" | "low" {
  const base = materialityRank[materiality];
  let adjustment = 0;
  if (sectorRelevance == "core") {
    adjustment = 1;
  }
  if (sectorRelevance == "low") {
    adjustment = -1;
  }
  const score = base + adjustment;

  if (score >= 4) {
    return "high";
  }
  if (score >= 2) {
    return "medium";
  }
  return "low";
}

function buildGapReason(datapoint: ESRSDatapoint, sectorRelevance: "core" | "moderate" | "low"): string {
  const base = "No GS1 standard currently mapped for this ESRS datapoint.";
  if (sectorRelevance == "core") {
    return base + " This datapoint is directly relevant for the selected sector.";
  }
  if (sectorRelevance == "moderate") {
    return base + " This datapoint is broadly relevant across sectors.";
  }
  return base + " This datapoint is less central for the selected sector.";
}

function buildRecommendedAction(datapoint: ESRSDatapoint, priority: "high" | "medium" | "low"): string {
  if (priority == "high") {
    return "Define or extend GS1 attributes to cover " + datapoint.id + " as a short term priority.";
  }
  if (priority == "medium") {
    return "Plan GS1 alignment for " + datapoint.id + " in the next standards update cycle.";
  }
  return "Monitor regulatory guidance for " + datapoint.id + " and consider GS1 coverage later.";
}

