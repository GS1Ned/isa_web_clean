const {
  readJson,
  readJsonl,
  avg,
  safeDiv,
  clamp01,
  latencyNorm,
  selectDatasetByPrefix,
} = require("../lib/common.cjs");
const { measureRuntimeProbe } = require("../lib/runtime-probes.cjs");

async function evaluate(context) {
  const { registryEntry, datasets, thresholdsByMetric, fixtureVersion } = context;
  const dataset = selectDatasetByPrefix(datasets, "esrs_mapping_gold_");
  const negativeDataset = selectDatasetByPrefix(datasets, "esrs_mapping_negative_");
  const rows = readJsonl(dataset.path);
  const negativePayload = readJson(negativeDataset.path);
  const negativeCases = Array.isArray(negativePayload.cases) ? negativePayload.cases : [];

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

  const negativeCaseCoverage = Number(
    safeDiv(
      negativeCases.filter((row) => {
        return (
          row?.expectedOutcome === "no_mapping" &&
          row?.actualOutcome === "no_mapping" &&
          typeof row?.rationale === "string" &&
          row.rationale.trim().length > 20 &&
          typeof row?.sourceAuthority === "string" &&
          row.sourceAuthority.trim().length > 0 &&
          typeof row?.source_file === "string" &&
          row.source_file.trim().length > 0 &&
          Array.isArray(row?.sectors) &&
          row.sectors.length > 0
        );
      }).length,
      negativeCases.length,
      0
    ).toFixed(4)
  );

  const contractAdherence = Number(avg([precision, explainability, authority]).toFixed(4));
  const integrationCompleteness = Number(
    safeDiv(
      rows.filter(
        (row) =>
          typeof row.source_file === "string" &&
          row.source_file.trim().length > 0 &&
          Array.isArray(row.sectors) &&
          row.sectors.length > 0
      ).length,
      rows.length,
      0
    ).toFixed(4)
  );

  const latencyProbe = await measureRuntimeProbe({
    probeId: "esrs.adapter.compute.v1",
    fn: () => {
      let checksum = 0;
      for (const row of rows) {
        checksum += Number(Boolean(row.gs1Attribute));
        checksum += Number(typeof row.rationale === "string" && row.rationale.length > 20);
        checksum += Number(typeof row.sourceAuthority === "string" && row.sourceAuthority.length > 0);
        checksum += Array.isArray(row.sectors) ? row.sectors.length : 0;
      }
      return checksum;
    },
  });

  const latencyP95Ms = latencyProbe.p95_ms;
  const latencyMeasurementMode = latencyProbe.measurement_mode;

  const metrics = [
    {
      dataset_id: dataset.id,
      metric_id: "esrs.mapping.precision",
      dimension: "mapping precision",
      kind: "correctness",
      value: Number(precision.toFixed(4)),
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "esrs.mapping.coverage",
      dimension: "mapping coverage",
      kind: "coverage",
      value: Number(coverage.toFixed(4)),
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "esrs.mapping.explainability_presence",
      dimension: "explainability presence",
      kind: "explainability",
      value: Number(explainability.toFixed(4)),
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "esrs.mapping.authority_correctness",
      dimension: "authority correctness",
      kind: "authority",
      value: Number(authority.toFixed(4)),
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: negativeDataset.id,
      metric_id: "esrs.mapping.negative_case_coverage",
      dimension: "negative case coverage",
      kind: "coverage",
      value: negativeCaseCoverage,
      fixture_path: negativeDataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "esrs.mapping.contract.adherence",
      dimension: "contract adherence",
      kind: "contract_adherence",
      value: contractAdherence,
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "esrs.mapping.integration.completeness",
      dimension: "integration completeness",
      kind: "integration_completeness",
      value: integrationCompleteness,
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "esrs.mapping.latency.p95_ms",
      dimension: "latency",
      kind: "latency",
      value: latencyP95Ms,
      fixture_path: dataset.path,
      measurement_mode: latencyMeasurementMode,
      fixture_version: fixtureVersion,
      runtime_probe_id: latencyProbe.runtime_probe_id,
      runtime_probe_samples: latencyProbe.samples,
    },
    {
      dataset_id: dataset.id,
      metric_id: "esrs.mapping.latency.measurement_mode_runtime",
      dimension: "latency measurement mode runtime",
      kind: "integration_completeness",
      value: latencyMeasurementMode === "runtime" ? 1 : 0,
      fixture_path: dataset.path,
      measurement_mode: latencyMeasurementMode,
      fixture_version: fixtureVersion,
      runtime_probe_id: latencyProbe.runtime_probe_id,
      runtime_probe_samples: latencyProbe.samples,
    },
  ];

  const latencyThreshold = thresholdsByMetric["esrs.mapping.latency.p95_ms"].value;
  const rollups = {
    correctness: Number(precision.toFixed(4)),
    coverage: Number(avg([coverage, negativeCaseCoverage]).toFixed(4)),
    explainability: Number(explainability.toFixed(4)),
    authority: Number(authority.toFixed(4)),
    contract_adherence: contractAdherence,
    integration_completeness: integrationCompleteness,
    latency_norm: Number(latencyNorm(latencyP95Ms, latencyThreshold).toFixed(4)),
  };

  const syntheticLatencyCount = metrics.filter(
    (metric) => metric.kind === "latency" && metric.measurement_mode === "synthetic"
  ).length;

  return {
    capability: "ESRS_MAPPING",
    datasetIds: [dataset.id, negativeDataset.id],
    fixtureVersion,
    sampleCount: rows.length + negativeCases.length,
    minimumSamples: datasets.reduce((sum, d) => sum + Number(d.minimum_samples || 0), 0),
    contractPath: registryEntry.contract_path,
    metrics,
    rollups,
    syntheticLatencyCount,
  };
}

module.exports = { evaluate };
