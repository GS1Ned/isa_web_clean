const {
  readJson,
  readJsonl,
  avg,
  safeDiv,
  clamp01,
  latencyNorm,
  selectDatasetByPrefix,
  fieldPresenceRatio,
  textIncludesAllTerms,
} = require("../lib/common.cjs");
const { measureRuntimeProbe } = require("../lib/runtime-probes.cjs");

function countBy(values) {
  return values.reduce((acc, value) => {
    const key = String(value || "UNKNOWN");
    acc[key] = Number(acc[key] || 0) + 1;
    return acc;
  }, {});
}

function deriveDecisionPosture(entry, isNegativeCase = false) {
  if (isNegativeCase) {
    return String(entry?.actualOutcome || "").toLowerCase() === "no_mapping"
      ? "insufficient_evidence"
      : "decision_grade";
  }
  const confidence = String(entry?.confidence || "").toLowerCase();
  if (confidence === "direct") return "decision_grade";
  if (confidence === "partial") return "review_required";
  return "insufficient_evidence";
}

function deriveReviewSignal(posture) {
  if (posture === "decision_grade") return "none";
  if (posture === "review_required") return "review_recommended";
  return "human_review_required";
}

async function evaluate(context) {
  const { registryEntry, datasets, thresholdsByMetric, fixtureVersion } = context;
  const dataset = selectDatasetByPrefix(datasets, "esrs_mapping_gold_");
  const negativeDataset = selectDatasetByPrefix(datasets, "esrs_mapping_negative_");
  const decisionDataset = datasets.find((entry) =>
    String(entry.id || "").startsWith("esrs_mapping_decision_cases_")
  );
  const rows = readJsonl(dataset.path);
  const negativePayload = readJson(negativeDataset.path);
  const negativeCases = Array.isArray(negativePayload.cases) ? negativePayload.cases : [];
  const decisionPayload = decisionDataset ? readJson(decisionDataset.path) : null;
  const decisionCases = Array.isArray(decisionPayload?.cases) ? decisionPayload.cases : [];
  const rowById = new Map(rows.map((row) => [row.id, row]));
  const negativeById = new Map(negativeCases.map((row) => [row.id, row]));

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

  const directCount = rows.filter((row) => String(row.confidence || "").toLowerCase() === "direct").length;
  const partialCount = rows.filter((row) => String(row.confidence || "").toLowerCase() === "partial").length;
  const directShare = Number(safeDiv(directCount, rows.length, 0).toFixed(4));
  const partialShare = Number(safeDiv(partialCount, rows.length, 0).toFixed(4));

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
  const negativeNoMappingCount = negativeCases.filter((row) => row?.actualOutcome === "no_mapping").length;
  const noMappingShare = Number(safeDiv(negativeNoMappingCount, negativeCases.length, 0).toFixed(4));
  const totalDecisionCases = rows.length + negativeCases.length;
  const decisionGradeCount = directCount;
  const reviewRequiredCount = partialCount;
  const insufficientEvidenceCount = negativeNoMappingCount;
  const reviewRecommendedCount = reviewRequiredCount + insufficientEvidenceCount;
  const analystReviewCount = reviewRequiredCount;
  const humanReviewRequiredCount = insufficientEvidenceCount;
  const noEscalationCount = decisionGradeCount;
  const positiveRegulationBreakdown = countBy(rows.map((row) => row.regulationStandard));
  const negativeRegulationBreakdown = countBy(negativeCases.map((row) => row.regulationStandard));
  const decisionResults = decisionCases.map((item) => {
    const target = item.mapping_id ? rowById.get(item.mapping_id) : negativeById.get(item.negative_case_id);
    const negativeCase = Boolean(item.negative_case_id);
    const actualPosture = deriveDecisionPosture(target, negativeCase);
    const actualReviewSignal = deriveReviewSignal(actualPosture);
    const expectedTerms = Array.isArray(item.rationale_terms) ? item.rationale_terms : [];
    return {
      applicabilityCorrect: Number(
        Boolean(
          target &&
            actualPosture === item.expected_posture &&
            (!item.expected_confidence ||
              String(target.confidence || target.actualOutcome || "").toLowerCase() ===
                String(item.expected_confidence).toLowerCase()) &&
            (!item.expected_regulation_standard ||
              target.regulationStandard === item.expected_regulation_standard)
        )
      ),
      rationaleComplete: Number(
        Boolean(
          target &&
            typeof target.rationale === "string" &&
            target.rationale.trim().length >= Number(item.min_rationale_length || 20) &&
            textIncludesAllTerms(target.rationale, expectedTerms)
        )
      ),
      evidenceTrace: Number(
        fieldPresenceRatio(target || {}, Array.isArray(item.required_fields) ? item.required_fields : [
          "sourceAuthority",
          "source_file",
          "sectors",
        ]) === 1
      ),
      uncertaintyHandled: Number(
        Boolean(target && actualReviewSignal === String(item.expected_review_signal || "none"))
      ),
    };
  });
  const applicabilityCorrectness = Number(
    avg(decisionResults.map((item) => item.applicabilityCorrect)).toFixed(4)
  );
  const rationaleCompleteness = Number(
    avg(decisionResults.map((item) => item.rationaleComplete)).toFixed(4)
  );
  const evidenceTraceCompleteness = Number(
    avg(decisionResults.map((item) => item.evidenceTrace)).toFixed(4)
  );
  const uncertaintyHandling = Number(
    avg(decisionResults.map((item) => item.uncertaintyHandled)).toFixed(4)
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
      dataset_id: decisionDataset?.id || dataset.id,
      metric_id: "esrs.mapping.applicability_correctness",
      dimension: "applicability correctness",
      kind: "correctness",
      value: applicabilityCorrectness,
      fixture_path: decisionDataset?.path || dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: decisionDataset?.id || dataset.id,
      metric_id: "esrs.mapping.rationale.completeness",
      dimension: "rationale completeness",
      kind: "explainability",
      value: rationaleCompleteness,
      fixture_path: decisionDataset?.path || dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: decisionDataset?.id || dataset.id,
      metric_id: "esrs.mapping.uncertainty_handling",
      dimension: "uncertainty handling",
      kind: "correctness",
      value: uncertaintyHandling,
      fixture_path: decisionDataset?.path || dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: decisionDataset?.id || dataset.id,
      metric_id: "esrs.mapping.evidence_trace_completeness",
      dimension: "evidence trace completeness",
      kind: "authority",
      value: evidenceTraceCompleteness,
      fixture_path: decisionDataset?.path || dataset.path,
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
    correctness: Number(avg([precision, applicabilityCorrectness, uncertaintyHandling]).toFixed(4)),
    coverage: Number(avg([coverage, negativeCaseCoverage]).toFixed(4)),
    explainability: Number(avg([explainability, rationaleCompleteness]).toFixed(4)),
    authority: Number(avg([authority, evidenceTraceCompleteness]).toFixed(4)),
    contract_adherence: contractAdherence,
    integration_completeness: integrationCompleteness,
    latency_norm: Number(latencyNorm(latencyP95Ms, latencyThreshold).toFixed(4)),
  };

  const syntheticLatencyCount = metrics.filter(
    (metric) => metric.kind === "latency" && metric.measurement_mode === "synthetic"
  ).length;

  return {
    capability: "ESRS_MAPPING",
    datasetIds: datasets.map((entry) => entry.id),
    fixtureVersion,
    sampleCount: rows.length + negativeCases.length + decisionCases.length,
    minimumSamples: datasets.reduce((sum, d) => sum + Number(d.minimum_samples || 0), 0),
    contractPath: registryEntry.contract_path,
    metrics,
    rollups,
    syntheticLatencyCount,
    diagnostics: {
      benchmark_mix: {
        positive_case_count: rows.length,
        negative_case_count: negativeCases.length,
        direct_case_count: directCount,
        partial_case_count: partialCount,
        no_mapping_case_count: negativeNoMappingCount,
        direct_case_share: directShare,
        partial_case_share: partialShare,
        no_mapping_case_share: noMappingShare,
      },
      regulation_breakdown: {
        positive: positiveRegulationBreakdown,
        negative: negativeRegulationBreakdown,
      },
      decision_posture: {
        total_case_count: totalDecisionCases,
        decision_grade_count: decisionGradeCount,
        review_required_count: reviewRequiredCount,
        insufficient_evidence_count: insufficientEvidenceCount,
        review_recommended_count: reviewRecommendedCount,
        none_escalation_count: noEscalationCount,
        analyst_review_count: analystReviewCount,
        human_review_required_count: humanReviewRequiredCount,
        decision_grade_share: Number(safeDiv(decisionGradeCount, totalDecisionCases, 0).toFixed(4)),
        review_required_share: Number(safeDiv(reviewRequiredCount, totalDecisionCases, 0).toFixed(4)),
        insufficient_evidence_share: Number(
          safeDiv(insufficientEvidenceCount, totalDecisionCases, 0).toFixed(4)
        ),
        review_recommended_share: Number(
          safeDiv(reviewRecommendedCount, totalDecisionCases, 0).toFixed(4)
        ),
        human_review_required_share: Number(
          safeDiv(humanReviewRequiredCount, totalDecisionCases, 0).toFixed(4)
        ),
      },
      decision_quality: decisionCases.length
        ? {
            case_count: decisionCases.length,
            applicability_correctness: applicabilityCorrectness,
            uncertainty_handling: uncertaintyHandling,
            evidence_trace_completeness: evidenceTraceCompleteness,
          }
        : undefined,
    },
  };
}

module.exports = { evaluate };
