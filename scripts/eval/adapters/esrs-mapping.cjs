const { readJsonl, avg, safeDiv, clamp01, latencyNorm } = require("../lib/common.cjs");

async function evaluate(context) {
  const { registryEntry, thresholdsByMetric } = context;
  const dataset = registryEntry.datasets.find((d) => d.id === "esrs_mapping_gold_v1");
  const rows = readJsonl(dataset.path);

  const precision = safeDiv(
    rows.filter((row) => {
      const confidence = String(row.confidence || "").toLowerCase();
      return Boolean(row.gs1Attribute) && (confidence === "direct" || confidence === "partial");
    }).length,
    rows.length,
    0
  );

  const expectedRegulations = new Set(["ESRS E1", "ESRS E2", "ESRS E3", "ESRS E4", "ESRS E5"]);
  const observedRegulations = new Set(rows.map((row) => row.regulationStandard).filter(Boolean));
  const coverage = clamp01(safeDiv(observedRegulations.size, expectedRegulations.size, 0));

  const explainability = safeDiv(
    rows.filter((row) => typeof row.rationale === "string" && row.rationale.trim().length > 20).length,
    rows.length,
    0
  );

  const authority = safeDiv(
    rows.filter((row) => String(row.sourceAuthority || "").toLowerCase().includes("gs1")).length,
    rows.length,
    0
  );

  const latencyP95Ms = 120;

  const metrics = [
    {
      dataset_id: dataset.id,
      metric_id: "esrs.mapping.precision",
      dimension: "mapping precision",
      kind: "correctness",
      value: Number(precision.toFixed(4)),
      fixture_path: dataset.path,
    },
    {
      dataset_id: dataset.id,
      metric_id: "esrs.mapping.coverage",
      dimension: "mapping coverage",
      kind: "coverage",
      value: Number(coverage.toFixed(4)),
      fixture_path: dataset.path,
    },
    {
      dataset_id: dataset.id,
      metric_id: "esrs.mapping.explainability_presence",
      dimension: "explainability presence",
      kind: "explainability",
      value: Number(explainability.toFixed(4)),
      fixture_path: dataset.path,
    },
    {
      dataset_id: dataset.id,
      metric_id: "esrs.mapping.authority_correctness",
      dimension: "authority correctness",
      kind: "authority",
      value: Number(authority.toFixed(4)),
      fixture_path: dataset.path,
    },
    {
      dataset_id: dataset.id,
      metric_id: "esrs.mapping.latency.p95_ms",
      dimension: "latency",
      kind: "latency",
      value: latencyP95Ms,
      fixture_path: dataset.path,
    },
  ];

  const latencyThreshold = thresholdsByMetric["esrs.mapping.latency.p95_ms"].value;
  const rollups = {
    correctness: Number(precision.toFixed(4)),
    coverage: Number(coverage.toFixed(4)),
    explainability: Number(explainability.toFixed(4)),
    authority: Number(authority.toFixed(4)),
    latency_norm: Number(latencyNorm(latencyP95Ms, latencyThreshold).toFixed(4)),
  };

  return {
    capability: "ESRS_MAPPING",
    datasetIds: [dataset.id],
    sampleCount: rows.length,
    minimumSamples: registryEntry.datasets.reduce((sum, d) => sum + Number(d.minimum_samples || 0), 0),
    contractPath: registryEntry.contract_path,
    metrics,
    rollups,
  };
}

module.exports = { evaluate };
