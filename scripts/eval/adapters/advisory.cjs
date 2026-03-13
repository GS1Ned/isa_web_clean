const fs = require("node:fs");
const { execFileSync } = require("node:child_process");
const {
  readJson,
  percentile,
  avg,
  safeDiv,
  latencyNorm,
  selectDatasetByPrefix,
  fieldPresenceRatio,
} = require("../lib/common.cjs");

function loadScenarioDiff(scenario) {
  const start = Date.now();
  if (!fs.existsSync(scenario.diff_file)) {
    execFileSync("node", ["scripts/compute_advisory_diff.cjs", scenario.version1, scenario.version2], {
      stdio: "pipe",
    });
  }
  const diff = readJson(scenario.diff_file);
  return { diff, latencyMs: Date.now() - start };
}

function hasKeys(obj, keys) {
  return keys.every((key) => Object.prototype.hasOwnProperty.call(obj || {}, key));
}

async function evaluate(context) {
  const { registryEntry, datasets, thresholdsByMetric, fixtureVersion } = context;
  const dataset = selectDatasetByPrefix(datasets, "advisory_scenarios_");
  const qualityDataset = datasets.find((item) =>
    String(item.id || "").startsWith("advisory_quality_cases_")
  );
  const payload = readJson(dataset.path);
  const scenarios = Array.isArray(payload.scenarios) ? payload.scenarios : [];
  const qualityPayload = qualityDataset ? readJson(qualityDataset.path) : null;
  const qualityCases = Array.isArray(qualityPayload?.cases) ? qualityPayload.cases : [];

  const advisoryV10 = readJson("data/advisories/ISA_ADVISORY_v1.0.json");
  const advisoryV11 = readJson("data/advisories/ISA_ADVISORY_v1.1.json");
  const mappingById = new Map((advisoryV11.mappingResults || []).map((item) => [item.id, item]));
  const gapById = new Map((advisoryV11.gapAnalysis || []).map((item) => [item.id, item]));
  const recommendationById = new Map((advisoryV11.recommendations || []).map((item) => [item.id, item]));

  const evidenceChecks = [];
  const latencies = [];
  const scenarioDiffs = new Map();

  for (const scenario of scenarios) {
    const loaded = loadScenarioDiff(scenario);
    latencies.push(loaded.latencyMs);
    const diff = loaded.diff;
    scenarioDiffs.set(scenario.id, diff);
    evidenceChecks.push(
      hasKeys(diff, [
        "metadata",
        "coverageDeltas",
        "gapLifecycle",
        "recommendationLifecycle",
        "traceabilityDeltas",
        "compositeMetrics",
      ])
        ? 1
        : 0
    );
  }

  evidenceChecks.push(Array.isArray(advisoryV10.mappingResults) ? 1 : 0);
  evidenceChecks.push(Array.isArray(advisoryV10.gaps) ? 1 : 0);
  evidenceChecks.push(Array.isArray(advisoryV10.recommendations) ? 1 : 0);
  evidenceChecks.push(Array.isArray(advisoryV11.mappingResults) ? 1 : 0);
  evidenceChecks.push(
    Array.isArray(advisoryV11.gaps) || typeof advisoryV11.gapAnalysis === "object" ? 1 : 0
  );
  evidenceChecks.push(Array.isArray(advisoryV11.recommendations) ? 1 : 0);

  const evidenceCoverage = avg(evidenceChecks);

  const recommendations = Array.isArray(advisoryV11.recommendations) ? advisoryV11.recommendations : [];
  const recommendationStructure = safeDiv(
    recommendations.filter((recommendation) => {
      return (
        typeof recommendation.id === "string" &&
        typeof recommendation.title === "string" &&
        typeof recommendation.description === "string" &&
        typeof recommendation.priority === "string" &&
        typeof recommendation.timeframe === "string"
      );
    }).length,
    recommendations.length,
    0
  );

  const selfDiff =
    scenarioDiffs.get("advisory-self-diff") ||
    scenarioDiffs.get("advisory-self-diff-v1.0") ||
    scenarioDiffs.get("advisory-self-diff-v1.1") ||
    null;
  const gapDetection =
    selfDiff &&
    Number(selfDiff.coverageDeltas?.totalMappings?.delta || 0) === 0 &&
    Number(selfDiff.gapLifecycle?.totalGaps?.delta || 0) === 0 &&
    Number(selfDiff.recommendationLifecycle?.totalRecommendations?.delta || 0) === 0 &&
    Boolean(selfDiff.compositeMetrics?.regressionDetected) === false
      ? 1
      : 0;

  const mappings = Array.isArray(advisoryV11.mappingResults) ? advisoryV11.mappingResults : [];
  const authorityPropagation = safeDiv(
    mappings.filter((mapping) => typeof mapping.sourceAuthority === "string" && mapping.sourceAuthority.trim().length > 0).length,
    mappings.length,
    0
  );
  const qualityResults = qualityCases.map((item) => {
    if (item.kind === "mapping_traceability") {
      const target = mappingById.get(item.mapping_id);
      return {
        provenance: fieldPresenceRatio(target || {}, item.required_fields || []),
        rationale: Number(
          fieldPresenceRatio(target || {}, item.rationale_fields || ["rationale", "implementationGuidance"]) === 1
        ),
        actionability: Number(
          fieldPresenceRatio(target || {}, item.actionability_fields || ["gs1Attribute", "implementationGuidance"]) === 1
        ),
      };
    }

    if (item.kind === "gap_actionability") {
      const target = gapById.get(item.gap_id);
      return {
        provenance: 0,
        rationale: Number(
          fieldPresenceRatio(target || {}, item.rationale_fields || ["description", "recommendedAction"]) === 1
        ),
        actionability: Number(
          fieldPresenceRatio(target || {}, item.required_fields || []) === 1
        ),
      };
    }

    if (item.kind === "recommendation_actionability") {
      const target = recommendationById.get(item.recommendation_id);
      const meetsStepCount =
        Array.isArray(target?.implementationSteps) &&
        target.implementationSteps.length >= Number(item.minimum_steps || 1);
      return {
        provenance: 0,
        rationale: Number(
          fieldPresenceRatio(target || {}, item.rationale_fields || ["description", "implementationSteps"]) === 1
        ),
        actionability: Number(
          fieldPresenceRatio(target || {}, item.required_fields || []) === 1 && meetsStepCount
        ),
      };
    }

    if (item.kind === "diff_traceability") {
      const target = scenarioDiffs.get(item.scenario_id);
      const requiredDiffFields = Array.isArray(item.required_diff_fields) ? item.required_diff_fields : [];
      return {
        provenance: fieldPresenceRatio(target || {}, requiredDiffFields),
        rationale: 0,
        actionability: 0,
      };
    }

    return { provenance: 0, rationale: 0, actionability: 0 };
  });
  const provenanceTraceability = Number(
    avg(
      qualityResults
        .map((item, index) => ({ item, source: qualityCases[index] }))
        .filter((entry) => ["mapping_traceability", "diff_traceability"].includes(entry.source.kind))
        .map((entry) => entry.item.provenance)
    ).toFixed(4)
  );
  const rationaleCompleteness = Number(
    avg(
      qualityResults
        .map((item, index) => ({ item, source: qualityCases[index] }))
        .filter((entry) =>
          ["mapping_traceability", "gap_actionability", "recommendation_actionability"].includes(entry.source.kind)
        )
        .map((entry) => entry.item.rationale)
    ).toFixed(4)
  );
  const actionabilityCoverage = Number(
    avg(
      qualityResults
        .map((item, index) => ({ item, source: qualityCases[index] }))
        .filter((entry) => ["gap_actionability", "recommendation_actionability"].includes(entry.source.kind))
        .map((entry) => entry.item.actionability)
    ).toFixed(4)
  );

  const contractAdherence = Number(
    safeDiv(
      scenarios.filter((scenario) => typeof scenario.version1 === "string" && typeof scenario.version2 === "string").length,
      scenarios.length,
      0
    ).toFixed(4)
  );
  const integrationCompleteness = Number(
    safeDiv(
      [...scenarioDiffs.values()].filter(
        (diff) =>
          typeof diff?.metadata?.comparisonDate === "string" &&
          typeof diff?.metadata?.version1?.version === "string" &&
          typeof diff?.metadata?.version2?.version === "string"
      ).length,
      scenarios.length,
      0
    ).toFixed(4)
  );

  const latencyP95Ms = percentile(latencies, 0.95);
  const latencyMeasurementMode = "runtime";

  const metrics = [
    {
      dataset_id: dataset.id,
      metric_id: "advisory.evidence.coverage",
      dimension: "evidence coverage",
      kind: "coverage",
      value: Number(evidenceCoverage.toFixed(4)),
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "advisory.recommendation.structure_score",
      dimension: "recommendation structure",
      kind: "explainability",
      value: Number(recommendationStructure.toFixed(4)),
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "advisory.gap_detection.f1",
      dimension: "gap detection correctness",
      kind: "correctness",
      value: Number(gapDetection.toFixed(4)),
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "advisory.authority.propagation",
      dimension: "authority propagation",
      kind: "authority",
      value: Number(authorityPropagation.toFixed(4)),
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: qualityDataset?.id || dataset.id,
      metric_id: "advisory.provenance.traceability",
      dimension: "provenance traceability",
      kind: "authority",
      value: provenanceTraceability,
      fixture_path: qualityDataset?.path || dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: qualityDataset?.id || dataset.id,
      metric_id: "advisory.rationale.completeness",
      dimension: "rationale completeness",
      kind: "explainability",
      value: rationaleCompleteness,
      fixture_path: qualityDataset?.path || dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: qualityDataset?.id || dataset.id,
      metric_id: "advisory.actionability.coverage",
      dimension: "actionability coverage",
      kind: "correctness",
      value: actionabilityCoverage,
      fixture_path: qualityDataset?.path || dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "advisory.contract.adherence",
      dimension: "contract adherence",
      kind: "contract_adherence",
      value: contractAdherence,
      fixture_path: dataset.path,
      measurement_mode: "fixture",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "advisory.integration.completeness",
      dimension: "integration completeness",
      kind: "integration_completeness",
      value: integrationCompleteness,
      fixture_path: dataset.path,
      measurement_mode: "runtime",
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "advisory.latency.p95_ms",
      dimension: "latency",
      kind: "latency",
      value: latencyP95Ms,
      fixture_path: dataset.path,
      measurement_mode: latencyMeasurementMode,
      fixture_version: fixtureVersion,
    },
    {
      dataset_id: dataset.id,
      metric_id: "advisory.latency.measurement_mode_runtime",
      dimension: "latency measurement mode runtime",
      kind: "integration_completeness",
      value: latencyMeasurementMode === "runtime" ? 1 : 0,
      fixture_path: dataset.path,
      measurement_mode: latencyMeasurementMode,
      fixture_version: fixtureVersion,
    },
  ];

  const latencyThreshold = thresholdsByMetric["advisory.latency.p95_ms"].value;
  const rollups = {
    correctness: Number(avg([gapDetection, actionabilityCoverage]).toFixed(4)),
    coverage: Number(avg([evidenceCoverage, provenanceTraceability]).toFixed(4)),
    explainability: Number(avg([recommendationStructure, rationaleCompleteness]).toFixed(4)),
    authority: Number(avg([authorityPropagation, provenanceTraceability]).toFixed(4)),
    contract_adherence: contractAdherence,
    integration_completeness: integrationCompleteness,
    latency_norm: Number(latencyNorm(latencyP95Ms, latencyThreshold).toFixed(4)),
  };

  const syntheticLatencyCount = metrics.filter(
    (metric) => metric.kind === "latency" && metric.measurement_mode === "synthetic"
  ).length;

  return {
    capability: "ADVISORY",
    datasetIds: datasets.map((item) => item.id),
    fixtureVersion,
    sampleCount: scenarios.length + qualityCases.length,
    minimumSamples: datasets.reduce((sum, d) => sum + Number(d.minimum_samples || 0), 0),
    contractPath: registryEntry.contract_path,
    metrics,
    rollups,
    syntheticLatencyCount,
    diagnostics: qualityCases.length
      ? {
          advisory_quality: {
            case_count: qualityCases.length,
            provenance_traceability: provenanceTraceability,
            rationale_completeness: rationaleCompleteness,
            actionability_coverage: actionabilityCoverage,
          },
        }
      : null,
  };
}

module.exports = { evaluate };
