import fs from "fs";
import path from "path";

type AdvisoryReadModelPayload = {
  mappingResults?: unknown[];
  gapAnalysis?: unknown[];
  recommendations?: unknown[];
  regulationsCovered?: unknown[];
  sectorModelsCovered?: unknown[];
};

type AdvisoryCompatibilityFilters = {
  sector?: "DIY" | "FMCG" | "Healthcare" | "All";
  regulation?: string;
  confidence?: "direct" | "partial" | "missing";
  severity?: "critical" | "moderate" | "low-priority";
  timeframe?: "short-term" | "medium-term" | "long-term";
  category?: "documentation" | "data_model" | "strategic";
  implementationStatus?: "proposed" | "in_progress" | "completed" | "deferred";
};

type RegisteredStandard = {
  id?: string;
  title?: string;
  version?: string;
  isaDomainTags?: string[];
};

let registeredStandardsCache: RegisteredStandard[] | null = null;

function loadRegisteredStandards() {
  if (registeredStandardsCache) {
    return registeredStandardsCache;
  }

  try {
    const registryPath = path.join(process.cwd(), "data", "metadata", "dataset_registry.json");
    const registry = JSON.parse(fs.readFileSync(registryPath, "utf8"));
    registeredStandardsCache = Array.isArray(registry?.registeredStandards)
      ? registry.registeredStandards
      : [];
  } catch {
    registeredStandardsCache = [];
  }

  return registeredStandardsCache ?? [];
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function uniqueNonEmpty(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values.filter((value): value is string => typeof value === "string" && value.trim().length > 0),
    ),
  );
}

function toLegacyMappingShape(mapping: any) {
  return {
    ...mapping,
    mappingId: mapping?.mappingId ?? mapping?.id,
    regulationDatapoint: mapping?.regulationDatapoint ?? mapping?.topic,
    title: mapping?.title ?? mapping?.topic,
    datasetReferences: Array.isArray(mapping?.datasetReferences) ? mapping.datasetReferences : [],
  };
}

function toLegacyGapShape(gap: any) {
  return {
    ...gap,
    gapId: gap?.gapId ?? gap?.id,
    title: gap?.title ?? gap?.topic,
    category: gap?.category ?? gap?.severity,
    affectedSectors: Array.isArray(gap?.affectedSectors) ? gap?.affectedSectors : gap?.sectors ?? ["All"],
    datasetReferences: Array.isArray(gap?.datasetReferences) ? gap.datasetReferences : [],
  };
}

function toLegacyRecommendationShape(recommendation: any, index: number) {
  return {
    ...recommendation,
    recommendationId:
      recommendation?.recommendationId ??
      recommendation?.id ??
      `REC-${String(index + 1).padStart(3, "0")}`,
    datasetReferences: Array.isArray(recommendation?.datasetReferences)
      ? recommendation.datasetReferences
      : [],
  };
}

function toCoveredRegulationShape(item: any) {
  if (typeof item === "string") {
    return {
      id: toSlug(item),
      name: item,
      legalStatus: null,
      effectiveDate: null,
      datasetIds: [],
    };
  }

  return {
    id: item?.id ?? toSlug(item?.name ?? item?.title ?? "regulation"),
    name: item?.name ?? item?.title ?? item?.id ?? "Unknown regulation",
    legalStatus: item?.legalStatus ?? null,
    effectiveDate: item?.effectiveDate ?? null,
    datasetIds: Array.isArray(item?.datasetIds) ? item.datasetIds : [],
  };
}

function toSectorModelShape(item: any) {
  return {
    id: item?.id ?? null,
    name: item?.name ?? item?.title ?? item?.id ?? "Unknown sector model",
    version: item?.version ?? null,
    totalAttributes: item?.totalAttributes ?? null,
  };
}

function deriveCoveredRegulations(advisory: AdvisoryReadModelPayload) {
  if (Array.isArray(advisory?.regulationsCovered) && advisory.regulationsCovered.length > 0) {
    return advisory.regulationsCovered.map(toCoveredRegulationShape);
  }

  const derivedStandards = uniqueNonEmpty([
    ...(Array.isArray(advisory?.mappingResults)
      ? advisory.mappingResults.map((mapping: any) => mapping?.regulationStandard)
      : []),
    ...(Array.isArray(advisory?.gapAnalysis)
      ? advisory.gapAnalysis.map((gap: any) => gap?.regulationStandard)
      : []),
  ]);

  return derivedStandards.map(toCoveredRegulationShape);
}

function deriveSectorModelsFromDatasetReferences(datasetReferences: string[]) {
  if (datasetReferences.length === 0) {
    return [];
  }

  const standards = loadRegisteredStandards();
  const references = new Set(datasetReferences);

  return standards
    .filter((item) => item?.id && references.has(item.id))
    .map((item) =>
      toSectorModelShape({
        id: item.id,
        name: item.title,
        version: item.version ?? null,
      }),
    );
}

function deriveCoveredSectorModels(advisory: AdvisoryReadModelPayload) {
  if (Array.isArray(advisory?.sectorModelsCovered) && advisory.sectorModelsCovered.length > 0) {
    return advisory.sectorModelsCovered.map(toSectorModelShape);
  }

  const datasetReferences = uniqueNonEmpty([
    ...(Array.isArray(advisory?.mappingResults)
      ? advisory.mappingResults.flatMap((mapping: any) => mapping?.datasetReferences ?? [])
      : []),
    ...(Array.isArray(advisory?.gapAnalysis)
      ? advisory.gapAnalysis.flatMap((gap: any) => gap?.datasetReferences ?? [])
      : []),
    ...(Array.isArray(advisory?.recommendations)
      ? advisory.recommendations.flatMap((recommendation: any) => recommendation?.datasetReferences ?? [])
      : []),
  ]).filter((reference) => reference.startsWith("gs1nl.benelux."));

  return deriveSectorModelsFromDatasetReferences(datasetReferences);
}

export function buildAdvisoryCompatibilityPayloads(advisory: AdvisoryReadModelPayload) {
  const mappings = Array.isArray(advisory?.mappingResults)
    ? advisory.mappingResults.map(toLegacyMappingShape)
    : [];
  const gaps = Array.isArray(advisory?.gapAnalysis)
    ? advisory.gapAnalysis.map(toLegacyGapShape)
    : [];
  const recommendations = Array.isArray(advisory?.recommendations)
    ? advisory.recommendations.map(toLegacyRecommendationShape)
    : [];

  return {
    mappings,
    gaps,
    recommendations,
    regulations: deriveCoveredRegulations(advisory),
    sectorModels: deriveCoveredSectorModels(advisory),
  };
}

export function deriveAdvisoryCompatibilityCoverage(advisory: AdvisoryReadModelPayload) {
  const payloads = buildAdvisoryCompatibilityPayloads(advisory);

  return {
    regulations: payloads.regulations,
    sectorModels: payloads.sectorModels,
  };
}

export function filterAdvisoryCompatibilityPayloads(
  payloads: ReturnType<typeof buildAdvisoryCompatibilityPayloads>,
  filters: AdvisoryCompatibilityFilters,
) {
  let mappings = payloads.mappings;
  let gaps = payloads.gaps;
  let recommendations = payloads.recommendations;

  if (filters.sector) {
    mappings = mappings.filter((mapping: any) =>
      mapping?.sectors?.includes(filters.sector) || mapping?.sectors?.includes("All"),
    );
    gaps = gaps.filter((gap: any) =>
      gap?.affectedSectors?.includes(filters.sector) || gap?.affectedSectors?.includes("All"),
    );
  }

  if (filters.regulation) {
    mappings = mappings.filter((mapping: any) => mapping?.regulationStandard === filters.regulation);
  }

  if (filters.confidence) {
    mappings = mappings.filter((mapping: any) => mapping?.confidence === filters.confidence);
  }

  if (filters.severity) {
    gaps = gaps.filter((gap: any) => gap?.category === filters.severity);
  }

  if (filters.timeframe) {
    recommendations = recommendations.filter(
      (recommendation: any) => recommendation?.timeframe === filters.timeframe,
    );
  }

  if (filters.category) {
    recommendations = recommendations.filter(
      (recommendation: any) => recommendation?.category === filters.category,
    );
  }

  if (filters.implementationStatus) {
    recommendations = recommendations.filter(
      (recommendation: any) => recommendation?.implementationStatus === filters.implementationStatus,
    );
  }

  return {
    mappings,
    gaps,
    recommendations,
    regulations: payloads.regulations,
    sectorModels: payloads.sectorModels,
  };
}
