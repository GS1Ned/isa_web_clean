const {
  readJson,
  percentile,
  avg,
  safeDiv,
  latencyNorm,
  selectDatasetByPrefix,
} = require("../lib/common.cjs");

function minutesBetween(laterIso, earlierIso) {
  const later = Date.parse(laterIso);
  const earlier = Date.parse(earlierIso);
  if (Number.isNaN(later) || Number.isNaN(earlier)) return 0;
  return Math.max(0, Math.round((later - earlier) / (60 * 1000)));
}

async function evaluate(context) {
  const { registryEntry, datasets, thresholdsByMetric, fixtureVersion } = context;
  const dataset = selectDatasetByPrefix(datasets, "news_timeline_");
  const payload = readJson(dataset.path);

  const sources = Array.isArray(payload.sources) ? payload.sources : [];
  const rawArticles = Array.isArray(payload.raw_articles) ? payload.raw_articles : [];
  const referenceTime = payload.reference_time_utc;

  const freshnessMinutes = rawArticles.map((article) => minutesBetween(referenceTime, article.publishedAt));
  const freshnessMedianMinutes = percentile(freshnessMinutes, 0.5);

  const enabledSourceIds = new Set(sources.filter((source) => source.enabled).map((source) => source.id));
  const seenEnabledSources = new Set(
    rawArticles
      .map((article) => article.sourceId)
      .filter((sourceId) => enabledSourceIds.has(sourceId))
  );
  const sourceCoverage = safeDiv(seenEnabledSources.size, enabledSourceIds.size, 0);

  const dedupKeys = rawArticles.map((article) => article.dedup_key).filter(Boolean);
  const uniqueDedupKeys = new Set(dedupKeys);
  const duplicateRate = safeDiv(Math.max(0, dedupKeys.length - uniqueDedupKeys.size), dedupKeys.length, 0);

  const classificationScores = rawArticles.map((article) => {
    const expected = article.classification_expected || {};
    const predicted = article.classification_predicted || {};
    const eventMatch = expected.eventType === predicted.eventType ? 1 : 0;
    const regulationMatch = expected.primaryRegulation === predicted.primaryRegulation ? 1 : 0;
    return (eventMatch + regulationMatch) / 2;
  });
  const classificationF1 = avg(classificationScores);

  const latencyValues = rawArticles.map((article) => Number(article.processing_latency_ms || 0));
  const latencyP95Ms = percentile(latencyValues, 0.95);

  const authorityRatio = safeDiv(
    rawArticles.filter((article) => ["EU_OFFICIAL", "GS1_OFFICIAL"].includes(article.sourceType)).length,
    rawArticles.length,
    0
  );

  const contractAdherence = Number(
    safeDiv(
      rawArticles.filter(
        (article) =>
          typeof article.id === "string" &&
          typeof article.sourceId === "string" &&
          typeof article.publishedAt === "string" &&
          article.classification_expected &&
          article.classification_predicted
      ).length,
      rawArticles.length,
      0
    ).toFixed(4)
  );
  const integrationCompleteness = Number(
    safeDiv(
      rawArticles.filter(
        (article) =>
          enabledSourceIds.has(article.sourceId) &&
          typeof article.dedup_key === "string" &&
          article.dedup_key.trim().length > 0 &&
          Number.isFinite(Number(article.processing_latency_ms))
      ).length,
      rawArticles.length,
      0
    ).toFixed(4)
  );
  const latencyMeasurementMode = "fixture";

  const metrics = [
    {
      dataset_id: dataset.id,
      metric_id: "news.freshness.median_minutes",
      dimension: "freshness",
      kind: "correctness",
      value: freshnessMedianMinutes,
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "news.source.coverage_ratio",
      dimension: "source coverage",
      kind: "coverage",
      value: Number(sourceCoverage.toFixed(4)),
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "news.duplicate.rate",
      dimension: "duplicate rate",
      kind: "correctness",
      value: Number(duplicateRate.toFixed(4)),
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "news.classification.f1_macro",
      dimension: "classification quality",
      kind: "correctness",
      value: Number(classificationF1.toFixed(4)),
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "news.contract.adherence",
      dimension: "contract adherence",
      kind: "contract_adherence",
      value: contractAdherence,
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "news.integration.completeness",
      dimension: "integration completeness",
      kind: "integration_completeness",
      value: integrationCompleteness,
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "news.latency.p95_ms",
      dimension: "latency",
      kind: "latency",
      value: latencyP95Ms,
      fixture_path: dataset.path,
      measurement_mode: latencyMeasurementMode,
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "news.latency.measurement_mode_runtime",
      dimension: "latency measurement mode runtime",
      kind: "integration_completeness",
      value: latencyMeasurementMode === "runtime" ? 1 : 0,
      fixture_path: dataset.path,
      measurement_mode: latencyMeasurementMode,
      fixture_version: fixtureVersion,
    },
  ];

  const latencyThreshold = thresholdsByMetric["news.latency.p95_ms"].value;
  const rollups = {
    correctness: Number(avg([classificationF1, 1 - duplicateRate]).toFixed(4)),
    coverage: Number(sourceCoverage.toFixed(4)),
    explainability: Number(sourceCoverage.toFixed(4)),
    authority: Number(authorityRatio.toFixed(4)),
    contract_adherence: contractAdherence,
    integration_completeness: integrationCompleteness,
    latency_norm: Number(latencyNorm(latencyP95Ms, latencyThreshold).toFixed(4)),
  };

  const syntheticLatencyCount = metrics.filter(
    (metric) => metric.kind === "latency" && metric.measurement_mode === "synthetic"
  ).length;

  return {
    capability: "NEWS_HUB",
    datasetIds: [dataset.id],
    fixtureVersion,
    sampleCount: rawArticles.length,
    minimumSamples: datasets.reduce((sum, d) => sum + Number(d.minimum_samples || 0), 0),
    contractPath: registryEntry.contract_path,
    metrics,
    rollups,
    syntheticLatencyCount,
  };
}

module.exports = { evaluate };
