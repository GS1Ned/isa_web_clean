const {
  readJson,
  avg,
  safeDiv,
  latencyNorm,
  daysSince,
  selectDatasetByPrefix,
} = require("../lib/common.cjs");

function hasValue(value) {
  return value !== null && value !== undefined && String(value).trim().length > 0;
}

function classifyAuthorityTier(publisher) {
  const value = String(publisher || "").toLowerCase();
  if (value.includes("gs1") || value.includes("european") || value.includes("efrag") || value.includes("eu")) {
    return "official";
  }
  return "verified";
}

function lifecycleMatchesExpected(statusRaw, expectedStateRaw) {
  const status = String(statusRaw || "").toLowerCase();
  const expectedState = String(expectedStateRaw || "active").toLowerCase();

  if (expectedState === "active") {
    return ["mvp_critical", "current", "complete", "final", "ratified"].includes(status);
  }
  if (expectedState === "deprecated") return status === "deprecated";
  if (expectedState === "provisional") return status === "provisional";
  return false;
}

async function evaluate(context) {
  const { registryEntry, datasets, thresholdsByMetric, fixtureVersion } = context;
  const dataset = selectDatasetByPrefix(datasets, "catalog_records_");
  const payload = readJson(dataset.path);
  const rows = Array.isArray(payload.records) ? payload.records : [];

  const requiredFields = ["id", "title", "publisher", "status", "version", "verificationDate"];
  const metadataCompleteness = safeDiv(
    rows.reduce((count, row) => count + requiredFields.filter((field) => hasValue(row[field])).length, 0),
    rows.length * requiredFields.length,
    0
  );

  const authorityTierCorrectness = safeDiv(
    rows.filter((row) => classifyAuthorityTier(row.publisher) === row.authorityTierExpected).length,
    rows.length,
    0
  );

  const nowMs = Date.now();
  const currencyValues = rows
    .map((row) => daysSince(row.verificationDate, nowMs))
    .filter((value) => value !== null);
  const verificationCurrencyDays = currencyValues.length ? Math.round(avg(currencyValues)) : 9999;

  const lifecycleStateCorrectness = safeDiv(
    rows.filter((row) => {
      return lifecycleMatchesExpected(row.status, row.lifecycleStateExpected);
    }).length,
    rows.length,
    0
  );

  const contractAdherence = Number(
    avg([metadataCompleteness, authorityTierCorrectness, lifecycleStateCorrectness]).toFixed(4)
  );
  const integrationCompleteness = Number(
    safeDiv(
      rows.filter(
        (row) =>
          hasValue(row.sourceType) &&
          hasValue(row.verificationDate) &&
          (hasValue(row.releaseDate) || hasValue(row.pubDate))
      ).length,
      rows.length,
      0
    ).toFixed(4)
  );

  const latencyP95Ms = 220;
  const latencyMeasurementMode = "synthetic";

  const metrics = [
    {
      dataset_id: dataset.id,
      metric_id: "catalog.metadata.completeness",
      dimension: "metadata completeness",
      kind: "coverage",
      value: Number(metadataCompleteness.toFixed(4)),
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "catalog.authority.tier_correctness",
      dimension: "authority tier correctness",
      kind: "authority",
      value: Number(authorityTierCorrectness.toFixed(4)),
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "catalog.verification.currency_days",
      dimension: "verification currency",
      kind: "correctness",
      value: verificationCurrencyDays,
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "catalog.lifecycle.state_correctness",
      dimension: "lifecycle state correctness",
      kind: "correctness",
      value: Number(lifecycleStateCorrectness.toFixed(4)),
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "catalog.contract.adherence",
      dimension: "contract adherence",
      kind: "contract_adherence",
      value: contractAdherence,
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "catalog.integration.completeness",
      dimension: "integration completeness",
      kind: "integration_completeness",
      value: integrationCompleteness,
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "catalog.latency.p95_ms",
      dimension: "latency",
      kind: "latency",
      value: latencyP95Ms,
      fixture_path: dataset.path,
      measurement_mode: latencyMeasurementMode,
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "catalog.latency.measurement_mode_runtime",
      dimension: "latency measurement mode runtime",
      kind: "integration_completeness",
      value: latencyMeasurementMode === "runtime" ? 1 : 0,
      fixture_path: dataset.path,
      measurement_mode: latencyMeasurementMode,
      fixture_version: fixtureVersion,
    },
  ];

  const latencyThreshold = thresholdsByMetric["catalog.latency.p95_ms"].value;
  const rollups = {
    correctness: Number(avg([lifecycleStateCorrectness, authorityTierCorrectness]).toFixed(4)),
    coverage: Number(metadataCompleteness.toFixed(4)),
    explainability: Number(metadataCompleteness.toFixed(4)),
    authority: Number(authorityTierCorrectness.toFixed(4)),
    contract_adherence: contractAdherence,
    integration_completeness: integrationCompleteness,
    latency_norm: Number(latencyNorm(latencyP95Ms, latencyThreshold).toFixed(4)),
  };

  const syntheticLatencyCount = metrics.filter(
    (metric) => metric.kind === "latency" && metric.measurement_mode === "synthetic"
  ).length;

  return {
    capability: "CATALOG",
    datasetIds: [dataset.id],
    fixtureVersion,
    sampleCount: rows.length,
    minimumSamples: datasets.reduce((sum, d) => sum + Number(d.minimum_samples || 0), 0),
    contractPath: registryEntry.contract_path,
    metrics,
    rollups,
    syntheticLatencyCount,
  };
}

module.exports = { evaluate };
