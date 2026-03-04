import { getAdvisoryReports, getReportVersions } from "./db-advisory-reports";
import {
  loadLegacyAdvisory,
  loadLegacyAdvisorySummary,
  normalizeAdvisoryVersionTag,
} from "./advisory-legacy-compat";

const CURRENT_ADVISORY_VERSION = process.env.ISA_ADVISORY_VERSION || "1.1";
const CURRENT_ADVISORY_VERSION_TAG = normalizeAdvisoryVersionTag(CURRENT_ADVISORY_VERSION);

const ESRS_LABELS: Record<string, string> = {
  E1: "Climate Change",
  E2: "Pollution",
  E3: "Water and Marine Resources",
  E4: "Biodiversity and Ecosystems",
  E5: "Circular Economy",
  S1: "Own Workforce",
  S2: "Workers in Value Chain",
  G1: "Business Conduct",
};

function countBy<T extends string>(values: T[]) {
  return values.reduce<Record<string, number>>((accumulator, value) => {
    accumulator[value] = (accumulator[value] ?? 0) + 1;
    return accumulator;
  }, {});
}

function bucketRecommendationTimeframe(timeframe?: string | null) {
  const normalized = timeframe?.toLowerCase() ?? "";

  if (normalized.includes("short") || normalized.includes("0-3")) {
    return "short-term";
  }

  if (normalized.includes("medium") || normalized.includes("3-6")) {
    return "medium-term";
  }

  return "long-term";
}

function normalizeCoverageByEsrs(full: any, summary: any) {
  if (summary?.coverageByESRS && typeof summary.coverageByESRS === "object") {
    return summary.coverageByESRS;
  }

  const mappingResults: any[] = Array.isArray(full?.mappingResults) ? full.mappingResults : [];
  const groupedMappings = mappingResults.reduce((accumulator: Record<string, any[]>, item: any) => {
    const key = String(item?.regulationStandard ?? "")
      .replace(/^ESRS\s+/i, "")
      .trim();

    if (!key) {
      return accumulator;
    }

    accumulator[key] = accumulator[key] ?? [];
    accumulator[key].push(item);
    return accumulator;
  }, {});

  return Object.fromEntries(
    Object.keys(ESRS_LABELS).map(key => {
      const mappings = groupedMappings[key] ?? [];
      const keyAttributes = Array.from(
        new Set(
          mappings
            .map((item: any) => item?.gs1Attribute)
            .filter((value: unknown): value is string => typeof value === "string" && value.length > 0),
        ),
      ).slice(0, 5);

      return [
        key,
        {
          name: ESRS_LABELS[key],
          mappings: mappings.length,
          coverage: mappings.length > 0 ? "partial" : "gap",
          keyAttributes,
        },
      ];
    }),
  );
}

function normalizeTopRecommendations(full: any, summary: any) {
  if (Array.isArray(summary?.topRecommendations)) {
    return summary.topRecommendations;
  }

  const recommendations = Array.isArray(full?.recommendations) ? full.recommendations : [];
  return recommendations.slice(0, 3).map((item: any, index: number) => ({
    id: item?.id ?? item?.recommendationId ?? `legacy-rec-${index + 1}`,
    title: item?.title ?? "Recommendation",
    priority:
      item?.priority ??
      (item?.category === "strategic"
        ? "critical"
        : item?.category === "data_model"
          ? "high"
          : "medium"),
    estimatedROI: item?.estimatedROI ?? item?.estimatedEffort ?? "unknown",
  }));
}

function normalizeRecommendations(full: any) {
  const recommendations = Array.isArray(full?.recommendations) ? full.recommendations : [];

  return recommendations.map((item: any, index: number) => ({
    ...item,
    id: item?.id ?? item?.recommendationId ?? `legacy-rec-${index + 1}`,
    recommendationId:
      item?.recommendationId ??
      item?.id ??
      `REC-${String(index + 1).padStart(3, "0")}`,
    title: item?.title ?? "Recommendation",
    description: item?.description ?? "No description available.",
    timeframe: bucketRecommendationTimeframe(item?.timeframe),
    category:
      item?.category ??
      (item?.priority === "critical" || item?.priority === "high" ? "strategic" : "data_model"),
    estimatedEffort: item?.estimatedEffort ?? item?.estimatedROI ?? "unknown",
    implementationStatus: item?.implementationStatus ?? "proposed",
    datasetReferences: Array.isArray(item?.datasetReferences) ? item.datasetReferences : [],
  }));
}

function normalizeGapAnalysis(full: any) {
  if (Array.isArray(full?.gapAnalysis)) {
    return full.gapAnalysis;
  }

  const gaps = Array.isArray(full?.gaps) ? full.gaps : [];
  return gaps.map((gap: any, index: number) => ({
    id: gap?.id ?? gap?.gapId ?? `legacy-gap-${index + 1}`,
    regulationStandard: Array.isArray(gap?.affectedRegulations)
      ? gap.affectedRegulations[0] ?? "UNKNOWN"
      : "UNKNOWN",
    topic: gap?.topic ?? gap?.title ?? "Gap",
    severity: gap?.severity ?? gap?.category ?? "moderate",
    description: gap?.description ?? "No description available.",
    recommendedAction: gap?.recommendedAction ?? "No recommendation available.",
    sectors: gap?.sectors ?? gap?.affectedSectors ?? ["All"],
    estimatedEffort: gap?.estimatedEffort ?? gap?.impact ?? "unknown",
    priority: gap?.priority ?? gap?.urgency ?? "medium",
  }));
}

function normalizeMappingResults(full: any) {
  const mappings = Array.isArray(full?.mappingResults) ? full.mappingResults : [];

  return mappings.map((mapping: any, index: number) => {
    if (mapping?.id && mapping?.topic && mapping?.coverageLevel) {
      return mapping;
    }

    return {
      id: mapping?.id ?? mapping?.mappingId ?? `legacy-mapping-${index + 1}`,
      regulationStandard: mapping?.regulationStandard ?? "UNKNOWN",
      topic: mapping?.topic ?? mapping?.regulationDatapoint ?? "Mapping",
      gs1Standard: mapping?.gs1Standard ?? mapping?.disclosureRequirement ?? "GS1",
      gs1Attribute: mapping?.gs1Attribute ?? "Unmapped",
      confidence: mapping?.confidence ?? "missing",
      sectors: mapping?.sectors ?? ["All"],
      rationale: mapping?.rationale ?? "No rationale recorded.",
      sourceAuthority: mapping?.sourceAuthority ?? "Legacy advisory artifact",
      implementationGuidance:
        mapping?.implementationGuidance ?? mapping?.rationale ?? "No implementation guidance recorded.",
      coverageLevel:
        mapping?.coverageLevel ??
        (mapping?.confidence === "direct"
          ? "comprehensive"
          : mapping?.confidence === "partial"
            ? "partial"
            : "gap"),
    };
  });
}

export async function getAdvisoryMigrationState() {
  try {
    const reports = await getAdvisoryReports();
    const versionGroups = await Promise.all(reports.map(report => getReportVersions(report.id)));
    const versionCount = versionGroups.reduce((total, versions) => total + versions.length, 0);

    return {
      configuredVersion: CURRENT_ADVISORY_VERSION,
      normalizedVersion: CURRENT_ADVISORY_VERSION_TAG,
      source: "legacy_file_with_snapshot_awareness" as const,
      snapshotBackedReportCount: reports.length,
      snapshotBackedVersionCount: versionCount,
      hasCurrentVersionReport: reports.some(
        report => normalizeAdvisoryVersionTag(report.version) === CURRENT_ADVISORY_VERSION_TAG,
      ),
      hasCurrentVersionSnapshot: versionGroups.some(versions =>
        versions.some(version => normalizeAdvisoryVersionTag(version.version) === CURRENT_ADVISORY_VERSION_TAG),
      ),
    };
  } catch {
    return {
      configuredVersion: CURRENT_ADVISORY_VERSION,
      normalizedVersion: CURRENT_ADVISORY_VERSION_TAG,
      source: "legacy_file_with_snapshot_awareness" as const,
      snapshotBackedReportCount: 0,
      snapshotBackedVersionCount: 0,
      hasCurrentVersionReport: false,
      hasCurrentVersionSnapshot: false,
    };
  }
}

export async function buildAdvisoryReadModel() {
  const advisory = loadLegacyAdvisory(CURRENT_ADVISORY_VERSION_TAG);
  const summary = loadLegacyAdvisorySummary(CURRENT_ADVISORY_VERSION_TAG);
  const migrationState = await getAdvisoryMigrationState();

  const normalizedMappingResults = normalizeMappingResults(advisory);
  const normalizedGapAnalysis = normalizeGapAnalysis(advisory);
  const normalizedRecommendations = normalizeRecommendations(advisory);

  const mappingCounts =
    summary?.mappingResults?.byConfidence ?? {
      direct:
        summary?.stats?.directMappings ??
        advisory?.summary?.directMappings ??
        normalizedMappingResults.filter((item: any) => item.confidence === "direct").length,
      partial:
        summary?.stats?.partialMappings ??
        advisory?.summary?.partialMappings ??
        normalizedMappingResults.filter((item: any) => item.confidence === "partial").length,
      missing:
        summary?.stats?.missingMappings ??
        advisory?.summary?.missingMappings ??
        normalizedMappingResults.filter((item: any) => item.confidence === "missing").length,
    };

  const gapCounts =
    summary?.gaps?.bySeverity ?? {
      critical:
        summary?.stats?.criticalGaps ??
        advisory?.summary?.criticalGaps ??
        normalizedGapAnalysis.filter((item: any) => item.severity === "critical").length,
      moderate:
        summary?.stats?.moderateGaps ??
        advisory?.summary?.moderateGaps ??
        normalizedGapAnalysis.filter((item: any) => item.severity === "moderate").length,
      "low-priority":
        summary?.stats?.lowPriorityGaps ??
        advisory?.summary?.lowPriorityGaps ??
        normalizedGapAnalysis.filter((item: any) => item.severity === "low-priority").length,
    };

  const timeframeCounts = countBy(
    normalizedRecommendations.map((item: any) => item.timeframe),
  );

  return {
    summary: {
      ...summary,
      advisoryId:
        summary?.advisoryId ?? advisory?.advisoryId ?? `ISA_ADVISORY_${CURRENT_ADVISORY_VERSION_TAG}`,
      version: summary?.version ?? advisory?.version ?? CURRENT_ADVISORY_VERSION,
      publicationDate: summary?.publicationDate ?? advisory?.publicationDate ?? null,
      generatedAt: summary?.generatedAt ?? advisory?.generatedAt ?? null,
      datasetRegistryVersion:
        summary?.datasetRegistryVersion ?? advisory?.datasetRegistryVersion ?? null,
      mappingResults: {
        total:
          summary?.mappingResults?.total ??
          summary?.stats?.totalMappings ??
          advisory?.summary?.totalMappings ??
          normalizedMappingResults.length,
        byConfidence: mappingCounts,
      },
      gaps: {
        total:
          summary?.gaps?.total ??
          summary?.stats?.totalGaps ??
          advisory?.summary?.totalGaps ??
          normalizedGapAnalysis.length,
        bySeverity: gapCounts,
      },
      recommendations: {
        total:
          summary?.recommendations?.total ??
          advisory?.summary?.totalRecommendations ??
          normalizedRecommendations.length,
        byTimeframe:
          summary?.recommendations?.byTimeframe ?? {
            "short-term": timeframeCounts["short-term"] ?? 0,
            "medium-term": timeframeCounts["medium-term"] ?? 0,
            "long-term": timeframeCounts["long-term"] ?? 0,
          },
      },
      statistics: {
        totalDatapoints:
          summary?.statistics?.totalDatapoints ??
          summary?.statistics?.totalDatapointsAnalyzed ??
          advisory?.metadata?.totalDatapoints ??
          advisory?.metadata?.totalDatapointsAnalyzed ??
          0,
        totalAttributes:
          summary?.statistics?.totalAttributes ??
          summary?.statistics?.totalAttributesEvaluated ??
          advisory?.metadata?.totalAttributes ??
          advisory?.metadata?.totalAttributesEvaluated ??
          0,
        totalRecords:
          summary?.statistics?.totalRecords ??
          summary?.statistics?.totalRecordsUsed ??
          advisory?.metadata?.totalRecords ??
          advisory?.metadata?.totalRecordsUsed ??
          0,
        regulationsCovered:
          summary?.statistics?.regulationsCovered ??
          (Array.isArray(advisory?.regulationsCovered) ? advisory.regulationsCovered.length : 0),
        sectorsCovered:
          summary?.statistics?.sectorsCovered ??
          (Array.isArray(advisory?.sectorModelsCovered) ? advisory.sectorModelsCovered.length : 0),
        totalMappings:
          summary?.statistics?.totalMappings ??
          summary?.stats?.totalMappings ??
          advisory?.summary?.totalMappings ??
          normalizedMappingResults.length,
      },
      stats:
        summary?.stats ?? {
          totalMappings: normalizedMappingResults.length,
          directMappings: mappingCounts.direct,
          partialMappings: mappingCounts.partial,
          missingMappings: mappingCounts.missing,
          totalGaps: normalizedGapAnalysis.length,
          criticalGaps: gapCounts.critical,
          moderateGaps: gapCounts.moderate,
          lowPriorityGaps: gapCounts["low-priority"],
          overallCoveragePercentage:
            normalizedMappingResults.length === 0
              ? 0
              : Math.round(
                  ((mappingCounts.direct + mappingCounts.partial) /
            normalizedMappingResults.length) *
                    1000,
                ) / 10,
        },
      coverageByESRS: normalizeCoverageByEsrs(advisory, summary),
      topRecommendations: normalizeTopRecommendations(
        { ...advisory, recommendations: normalizedRecommendations },
        summary,
      ),
      migrationState,
    },
    advisory: {
      ...advisory,
      mappingResults: normalizedMappingResults,
      gapAnalysis: normalizedGapAnalysis,
      recommendations: normalizedRecommendations,
      migrationState,
    },
    metadata: {
      advisoryId: advisory?.advisoryId ?? `ISA_ADVISORY_${CURRENT_ADVISORY_VERSION_TAG}`,
      version: advisory?.version ?? CURRENT_ADVISORY_VERSION,
      publicationDate: advisory?.publicationDate ?? null,
      generatedAt: advisory?.generatedAt ?? summary?.generatedAt ?? null,
      datasetRegistryVersion: advisory?.datasetRegistryVersion ?? null,
      author: advisory?.author ?? null,
      sourceArtifacts: advisory?.sourceArtifacts ?? null,
      metadata:
        advisory?.metadata == null
          ? null
          : {
              totalDatapoints:
                advisory.metadata.totalDatapoints ?? advisory.metadata.totalDatapointsAnalyzed ?? null,
              totalAttributes:
                advisory.metadata.totalAttributes ?? advisory.metadata.totalAttributesEvaluated ?? null,
              totalRecords:
                advisory.metadata.totalRecords ?? advisory.metadata.totalRecordsUsed ?? null,
              regulationsCovered:
                advisory.metadata.regulationsCovered ??
                (Array.isArray(advisory?.regulationsCovered) ? advisory.regulationsCovered.length : null),
              sectorsCovered:
                advisory.metadata.sectorsCovered ??
                (Array.isArray(advisory?.sectorModelsCovered) ? advisory.sectorModelsCovered.length : null),
              totalMappings: advisory.metadata.totalMappings ?? null,
            },
      traceabilityStatus: advisory?.sourceArtifacts && advisory?.metadata ? "complete" : "partial",
      migrationState,
    },
  };
}
