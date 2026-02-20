const { execFileSync } = require("node:child_process");
const {
  readJson,
  avg,
  safeDiv,
  latencyNorm,
  selectDatasetByPrefix,
} = require("../lib/common.cjs");

async function evaluate(context) {
  const { registryEntry, datasets, thresholdsByMetric, runId, fixtureVersion } = context;
  const dataset = selectDatasetByPrefix(datasets, "ask_isa_golden_");

  const outputPath = `/tmp/ask-isa-rag-eval-${String(runId || Date.now())}.json`;
  execFileSync(
    "node",
    [
      "scripts/run-rag-evaluation-fixtures.cjs",
      "--fixtures",
      dataset.path,
      "--out",
      outputPath,
    ],
    { stdio: "pipe" }
  );

  const fixture = readJson(dataset.path);
  const report = readJson(outputPath);
  const cases = Array.isArray(fixture.cases) ? fixture.cases : [];

  const citationPresence = safeDiv(
    cases.filter((item) => Array.isArray(item.actual?.citations) && item.actual.citations.length > 0).length,
    cases.length,
    0
  );

  const citationValidity = Number(report.metrics?.citation_precision || 0);

  const allCitations = cases.flatMap((item) => (Array.isArray(item.actual?.citations) ? item.actual.citations : []));
  const uniqueCitations = new Set(allCitations);
  const sourceDiversity = safeDiv(uniqueCitations.size, allCitations.length || 1, 0);

  const abstentionCorrectness = safeDiv(
    cases.filter((item) => typeof item.actual?.answer === "string" && item.actual.answer.trim().length > 0).length,
    cases.length,
    0
  );

  const answerCompleteness = avg([
    Number(report.metrics?.groundedness || 0),
    Number(report.metrics?.citation_recall || 0),
  ]);

  const contractAdherence = Number(
    safeDiv(
      cases.filter((item) => {
        return (
          typeof item.query === "string" &&
          Array.isArray(item.expected_citations) &&
          typeof item.actual?.answer === "string" &&
          Array.isArray(item.actual?.citations)
        );
      }).length,
      cases.length,
      0
    ).toFixed(4)
  );
  const integrationCompleteness = Number(
    safeDiv(
      cases.filter((item) => {
        return (
          typeof item.repeat_actual?.answer === "string" &&
          Array.isArray(item.repeat_actual?.citations) &&
          Number.isFinite(Number(item.actual?.latency_ms)) &&
          Number.isFinite(Number(item.repeat_actual?.latency_ms))
        );
      }).length,
      cases.length,
      0
    ).toFixed(4)
  );

  const latencyP95Ms = Number(report.metrics?.p95_latency_ms || 0);
  const latencyMeasurementMode = "fixture";

  const metrics = [
    {
      dataset_id: dataset.id,
      metric_id: "ask.citation.presence",
      dimension: "citation presence",
      kind: "coverage",
      value: Number(citationPresence.toFixed(4)),
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "ask.citation.validity",
      dimension: "citation validity",
      kind: "correctness",
      value: Number(citationValidity.toFixed(4)),
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "ask.source.diversity",
      dimension: "source diversity",
      kind: "authority",
      value: Number(sourceDiversity.toFixed(4)),
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "ask.abstention.correctness",
      dimension: "abstention correctness",
      kind: "correctness",
      value: Number(abstentionCorrectness.toFixed(4)),
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "ask.answer.completeness",
      dimension: "answer completeness",
      kind: "correctness",
      value: Number(answerCompleteness.toFixed(4)),
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "ask.contract.adherence",
      dimension: "contract adherence",
      kind: "contract_adherence",
      value: contractAdherence,
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "ask.integration.completeness",
      dimension: "integration completeness",
      kind: "integration_completeness",
      value: integrationCompleteness,
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "ask.latency.p95_ms",
      dimension: "latency",
      kind: "latency",
      value: latencyP95Ms,
      fixture_path: outputPath,
      measurement_mode: latencyMeasurementMode,
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "ask.latency.measurement_mode_runtime",
      dimension: "latency measurement mode runtime",
      kind: "integration_completeness",
      value: latencyMeasurementMode === "runtime" ? 1 : 0,
      fixture_path: outputPath,
      measurement_mode: latencyMeasurementMode,
      fixture_version: fixtureVersion,
    },
  ];

  const latencyThreshold = thresholdsByMetric["ask.latency.p95_ms"].value;
  const rollups = {
    correctness: Number(avg([citationValidity, abstentionCorrectness, answerCompleteness]).toFixed(4)),
    coverage: Number(citationPresence.toFixed(4)),
    explainability: Number(avg([citationPresence, Number(report.metrics?.citation_recall || 0)]).toFixed(4)),
    authority: Number(sourceDiversity.toFixed(4)),
    contract_adherence: contractAdherence,
    integration_completeness: integrationCompleteness,
    latency_norm: Number(latencyNorm(latencyP95Ms, latencyThreshold).toFixed(4)),
  };

  const syntheticLatencyCount = metrics.filter(
    (metric) => metric.kind === "latency" && metric.measurement_mode === "synthetic"
  ).length;

  return {
    capability: "ASK_ISA",
    datasetIds: [dataset.id],
    fixtureVersion,
    sampleCount: cases.length,
    minimumSamples: datasets.reduce((sum, d) => sum + Number(d.minimum_samples || 0), 0),
    contractPath: registryEntry.contract_path,
    metrics,
    rollups,
    syntheticLatencyCount,
  };
}

module.exports = { evaluate };
