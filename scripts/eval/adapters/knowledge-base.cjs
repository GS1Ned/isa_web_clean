const fs = require("node:fs");
const {
  readJson,
  readJsonl,
  avg,
  safeDiv,
  clamp01,
  latencyNorm,
  selectDatasetByPrefix,
} = require("../lib/common.cjs");

const CHECKSUM_RE = /^[a-f0-9]{64}$/;

function hasValue(value) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== null && value !== undefined && String(value).trim().length > 0;
}

async function evaluate(context) {
  const { registryEntry, datasets, thresholdsByMetric, fixtureVersion } = context;
  const corpusDataset = selectDatasetByPrefix(datasets, "kb_corpus_slice_");
  const metadataDataset = selectDatasetByPrefix(datasets, "kb_metadata_gold_");

  const corpusRows = readJsonl(corpusDataset.path);
  const metadataGold = readJson(metadataDataset.path);
  const requiredFields = Array.isArray(metadataGold.required_fields) ? metadataGold.required_fields : [];

  const ingestionCorrectness = safeDiv(
    corpusRows.filter((row) => {
      return (
        typeof row.url === "string" &&
        row.url.startsWith("http") &&
        typeof row.file_path === "string" &&
        CHECKSUM_RE.test(String(row.checksum_sha256 || ""))
      );
    }).length,
    corpusRows.length,
    0
  );

  const metadataCompleteness = safeDiv(
    corpusRows.reduce((count, row) => {
      return (
        count +
        requiredFields.filter((field) => hasValue(row[field])).length
      );
    }, 0),
    corpusRows.length * Math.max(1, requiredFields.length),
    0
  );

  const chunkQuality = safeDiv(
    corpusRows.filter((row) => {
      return (
        hasValue(row.kind) &&
        hasValue(row.content_type) &&
        Array.isArray(row.intended_use) &&
        row.intended_use.length > 0
      );
    }).length,
    corpusRows.length,
    0
  );

  const linkingTarget = Number(metadataGold.linking_target_min || 2);
  const avgLinks = avg(corpusRows.map((row) => (Array.isArray(row.intended_use) ? row.intended_use.length : 0)));
  const linkingDensity = clamp01(safeDiv(avgLinks, linkingTarget, 0));

  const lifecycle = metadataGold.lifecycle || {};
  const lifecycleGovernance =
    hasValue(lifecycle.status) &&
    hasValue(lifecycle.cadence) &&
    typeof lifecycle.evidence === "string" &&
    fs.existsSync(lifecycle.evidence)
      ? 1
      : 0;

  const contractAdherence = Number(
    avg([
      ingestionCorrectness,
      metadataCompleteness,
      lifecycleGovernance,
    ]).toFixed(4)
  );
  const integrationCompleteness = Number(
    safeDiv(
      corpusRows.filter(
        (row) =>
          Array.isArray(row.intended_use) &&
          row.intended_use.includes("RAG") &&
          typeof row.source_manifest === "string" &&
          row.source_manifest.trim().length > 0
      ).length,
      corpusRows.length,
      0
    ).toFixed(4)
  );

  const latencyP95Ms = 180;
  const latencyMeasurementMode = "synthetic";

  const metrics = [
    {
      dataset_id: corpusDataset.id,
      metric_id: "kb.ingestion.correctness",
      dimension: "ingestion correctness",
      kind: "correctness",
      value: Number(ingestionCorrectness.toFixed(4)),
      fixture_path: corpusDataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: metadataDataset.id,
      metric_id: "kb.metadata.completeness",
      dimension: "metadata completeness",
      kind: "coverage",
      value: Number(metadataCompleteness.toFixed(4)),
      fixture_path: metadataDataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: corpusDataset.id,
      metric_id: "kb.chunk.quality",
      dimension: "chunk quality",
      kind: "correctness",
      value: Number(chunkQuality.toFixed(4)),
      fixture_path: corpusDataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: corpusDataset.id,
      metric_id: "kb.linking.density",
      dimension: "linking density",
      kind: "explainability",
      value: Number(linkingDensity.toFixed(4)),
      fixture_path: corpusDataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: metadataDataset.id,
      metric_id: "kb.lifecycle.governance",
      dimension: "lifecycle governance adherence",
      kind: "authority",
      value: Number(lifecycleGovernance.toFixed(4)),
      fixture_path: metadataDataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: metadataDataset.id,
      metric_id: "kb.contract.adherence",
      dimension: "contract adherence",
      kind: "contract_adherence",
      value: contractAdherence,
      fixture_path: metadataDataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: corpusDataset.id,
      metric_id: "kb.integration.completeness",
      dimension: "integration completeness",
      kind: "integration_completeness",
      value: integrationCompleteness,
      fixture_path: corpusDataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: corpusDataset.id,
      metric_id: "kb.latency.p95_ms",
      dimension: "latency",
      kind: "latency",
      value: latencyP95Ms,
      fixture_path: corpusDataset.path,
      measurement_mode: latencyMeasurementMode,
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: corpusDataset.id,
      metric_id: "kb.latency.measurement_mode_runtime",
      dimension: "latency measurement mode runtime",
      kind: "integration_completeness",
      value: latencyMeasurementMode === "runtime" ? 1 : 0,
      fixture_path: corpusDataset.path,
      measurement_mode: latencyMeasurementMode,
      fixture_version: fixtureVersion,
    },
  ];

  const latencyThreshold = thresholdsByMetric["kb.latency.p95_ms"].value;
  const rollups = {
    correctness: Number(avg([ingestionCorrectness, chunkQuality, lifecycleGovernance]).toFixed(4)),
    coverage: Number(metadataCompleteness.toFixed(4)),
    explainability: Number(linkingDensity.toFixed(4)),
    authority: Number(lifecycleGovernance.toFixed(4)),
    contract_adherence: contractAdherence,
    integration_completeness: integrationCompleteness,
    latency_norm: Number(latencyNorm(latencyP95Ms, latencyThreshold).toFixed(4)),
  };

  const syntheticLatencyCount = metrics.filter(
    (metric) => metric.kind === "latency" && metric.measurement_mode === "synthetic"
  ).length;

  return {
    capability: "KNOWLEDGE_BASE",
    datasetIds: datasets.map((d) => d.id),
    fixtureVersion,
    sampleCount: corpusRows.length + 1,
    minimumSamples: datasets.reduce((sum, d) => sum + Number(d.minimum_samples || 0), 0),
    contractPath: registryEntry.contract_path,
    metrics,
    rollups,
    syntheticLatencyCount,
  };
}

module.exports = { evaluate };
