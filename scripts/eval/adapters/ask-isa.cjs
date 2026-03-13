const { execFileSync } = require("node:child_process");
const {
  readJson,
  avg,
  safeDiv,
  latencyNorm,
  selectDatasetByPrefix,
  daysSince,
  fieldPresenceRatio,
  textIncludesAllTerms,
} = require("../lib/common.cjs");

function inferResponseMode(actual) {
  const explicit = String(actual?.response_mode || "")
    .trim()
    .toLowerCase();
  if (explicit) return explicit;
  const answer = String(actual?.answer || "").toLowerCase();
  if (answer.includes("not enough verified") || answer.includes("insufficient evidence")) {
    return "abstain";
  }
  return Array.isArray(actual?.citations) && actual.citations.length > 0 ? "answer" : "abstain";
}

function buildEvidenceMap(evidence) {
  return new Map(
    (Array.isArray(evidence) ? evidence : [])
      .filter((item) => typeof item?.citation === "string" && item.citation.trim().length > 0)
      .map((item) => [item.citation, item])
  );
}

async function evaluate(context) {
  const { registryEntry, datasets, thresholdsByMetric, runId, fixtureVersion } = context;
  const dataset = selectDatasetByPrefix(datasets, "ask_isa_golden_");
  const qualityDataset = datasets.find((item) => String(item.id || "").startsWith("ask_isa_quality_"));

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
  const qualityPayload = qualityDataset ? readJson(qualityDataset.path) : null;
  const qualityCases = Array.isArray(qualityPayload?.cases) ? qualityPayload.cases : [];
  const nowMs = Date.now();

  const citationPresence = safeDiv(
    cases.filter((item) => Array.isArray(item.actual?.citations) && item.actual.citations.length > 0).length,
    cases.length,
    0
  );

  const citationValidity = Number(report.metrics?.citation_precision || 0);

  const allCitations = cases.flatMap((item) => (Array.isArray(item.actual?.citations) ? item.actual.citations : []));
  const uniqueCitations = new Set(allCitations);
  const sourceDiversity = safeDiv(uniqueCitations.size, allCitations.length || 1, 0);

  const qualityResults = qualityCases.map((item) => {
    const expected = item.expected || {};
    const actual = item.actual || {};
    const actualMode = inferResponseMode(actual);
    const citations = Array.isArray(actual.citations) ? actual.citations : [];
    const evidenceMap = buildEvidenceMap(actual.evidence);
    const evidenceRecords = citations.map((citation) => evidenceMap.get(citation)).filter(Boolean);
    const expectedBehavior = String(item.expected_behavior || "answer").toLowerCase();
    const minCitationCount = Number(expected.minimum_citation_count || (expectedBehavior === "abstain" ? 0 : 1));
    const citationUsability = Number(
      citations.length >= minCitationCount &&
      citations.every((citation) => {
        const evidence = evidenceMap.get(citation);
        return Boolean(evidence && typeof evidence.evidenceKey === "string" && evidence.evidenceKey.trim().length > 0);
      })
    );
    const provenanceCompleteness = evidenceRecords.length
      ? avg(
          evidenceRecords.map((record) => {
            const baseScore = fieldPresenceRatio(record, [
              "citation",
              "evidenceKey",
              "lastVerifiedDate",
              "isDeprecated",
            ]);
            if (expected.require_recent_verification) {
              const ageDays = daysSince(record.lastVerifiedDate, nowMs);
              if (ageDays === null || ageDays > 90 || record.isDeprecated === true) return 0;
            }
            return baseScore;
          })
        )
      : expectedBehavior === "abstain"
        ? 1
        : 0;
    const rationaleTerms =
      expectedBehavior === "abstain"
        ? expected.uncertainty_terms || []
        : expected.rationale_terms || [];
    const rationaleCompleteness = Number(
      typeof actual.rationale === "string" &&
      actual.rationale.trim().length > 20 &&
      textIncludesAllTerms(actual.rationale, rationaleTerms)
    );
    const abstentionCorrect = Number(actualMode === expectedBehavior);
    const unsupportedAnswer = Number(
      (expectedBehavior === "abstain" && actualMode !== "abstain") ||
        (expectedBehavior !== "abstain" &&
          (typeof actual.answer !== "string" ||
            !actual.answer.trim() ||
            citationUsability !== 1 ||
            citations.length < minCitationCount))
    );

    return {
      abstentionCorrect,
      citationUsability,
      provenanceCompleteness,
      rationaleCompleteness,
      unsupportedAnswer,
    };
  });

  const abstentionCorrectness = Number(
    avg(qualityResults.map((item) => item.abstentionCorrect)).toFixed(4)
  );

  const answerCompleteness = avg([
    Number(report.metrics?.groundedness || 0),
    Number(report.metrics?.citation_recall || 0),
  ]);
  const citationUsability = Number(avg(qualityResults.map((item) => item.citationUsability)).toFixed(4));
  const provenanceCompleteness = Number(
    avg(qualityResults.map((item) => item.provenanceCompleteness)).toFixed(4)
  );
  const rationaleCompleteness = Number(
    avg(qualityResults.map((item) => item.rationaleCompleteness)).toFixed(4)
  );
  const unsupportedAnswerRate = Number(
    avg(qualityResults.map((item) => item.unsupportedAnswer)).toFixed(4)
  );

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
      dataset_id: qualityDataset?.id || dataset.id,
      metric_id: "ask.citation.usability",
      dimension: "citation usability",
      kind: "coverage",
      value: citationUsability,
      fixture_path: qualityDataset?.path || dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: qualityDataset?.id || dataset.id,
      metric_id: "ask.provenance.completeness",
      dimension: "provenance completeness",
      kind: "authority",
      value: provenanceCompleteness,
      fixture_path: qualityDataset?.path || dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: qualityDataset?.id || dataset.id,
      metric_id: "ask.rationale.completeness",
      dimension: "rationale completeness",
      kind: "explainability",
      value: rationaleCompleteness,
      fixture_path: qualityDataset?.path || dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: qualityDataset?.id || dataset.id,
      metric_id: "ask.unsupported_answer_rate",
      dimension: "unsupported answer rate",
      kind: "correctness",
      value: unsupportedAnswerRate,
      fixture_path: qualityDataset?.path || dataset.path,
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
    correctness: Number(
      avg([citationValidity, abstentionCorrectness, answerCompleteness, 1 - unsupportedAnswerRate]).toFixed(4)
    ),
    coverage: Number(avg([citationPresence, citationUsability]).toFixed(4)),
    explainability: Number(
      avg([citationPresence, Number(report.metrics?.citation_recall || 0), rationaleCompleteness]).toFixed(4)
    ),
    authority: Number(avg([sourceDiversity, provenanceCompleteness]).toFixed(4)),
    contract_adherence: contractAdherence,
    integration_completeness: integrationCompleteness,
    latency_norm: Number(latencyNorm(latencyP95Ms, latencyThreshold).toFixed(4)),
  };

  const syntheticLatencyCount = metrics.filter(
    (metric) => metric.kind === "latency" && metric.measurement_mode === "synthetic"
  ).length;

  return {
    capability: "ASK_ISA",
    datasetIds: datasets.map((item) => item.id),
    fixtureVersion,
    sampleCount: cases.length + qualityCases.length,
    minimumSamples: datasets.reduce((sum, d) => sum + Number(d.minimum_samples || 0), 0),
    contractPath: registryEntry.contract_path,
    metrics,
    rollups,
    syntheticLatencyCount,
    diagnostics: qualityCases.length
      ? {
          answer_quality: {
            case_count: qualityCases.length,
            abstention_correctness: abstentionCorrectness,
            unsupported_answer_rate: unsupportedAnswerRate,
            provenance_completeness: provenanceCompleteness,
          },
        }
      : null,
  };
}

module.exports = { evaluate };
