#!/usr/bin/env node

const crypto = require("node:crypto");
const {
  readJson,
  writeJson,
  writeText,
  avg,
  compareThreshold,
  computeCapabilityScore,
  scoreGrade,
  inferFixtureVersion,
} = require("./lib/common.cjs");

const ADAPTERS = {
  KNOWLEDGE_BASE: require("./adapters/knowledge-base.cjs"),
  CATALOG: require("./adapters/catalog.cjs"),
  ESRS_MAPPING: require("./adapters/esrs-mapping.cjs"),
  NEWS_HUB: require("./adapters/news-hub.cjs"),
  ADVISORY: require("./adapters/advisory.cjs"),
  ASK_ISA: require("./adapters/ask-isa.cjs"),
};

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    registry: "data/evaluation/golden/registry.json",
    thresholds: "docs/quality/thresholds/isa-capability-thresholds.json",
    outJson: "test-results/ci/isa-capability-eval.json",
    outMarkdown: "/tmp/isa-capability-eval.md",
    capabilities: null,
    stage: null,
    runId: `isa-eval-${crypto.randomUUID()}`,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--registry") options.registry = args[++i];
    else if (arg === "--thresholds") options.thresholds = args[++i];
    else if (arg === "--out-json") options.outJson = args[++i];
    else if (arg === "--out-md") options.outMarkdown = args[++i];
    else if (arg === "--capabilities") options.capabilities = args[++i];
    else if (arg === "--stage") options.stage = args[++i];
    else if (arg === "--run-id") options.runId = args[++i];
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

const DEFAULT_WEIGHTS = {
  correctness: 0.3,
  coverage: 0.2,
  explainability: 0.15,
  authority: 0.15,
  contract_adherence: 0.1,
  integration_completeness: 0.1,
  latency_norm: 0.0,
};

function resolveStageConfig(thresholdsDoc, requestedStage) {
  const availableStages = thresholdsDoc.stages || null;
  if (!availableStages) {
    return {
      stage: requestedStage || thresholdsDoc.default_stage || "stage_a",
      weights: {
        ...DEFAULT_WEIGHTS,
        ...(thresholdsDoc.weights || {}),
      },
      metrics: thresholdsDoc.metrics || {},
      syntheticLatencyPenalty: Number(thresholdsDoc.synthetic_latency_penalty || 0),
    };
  }

  const stage = requestedStage || thresholdsDoc.default_stage || "stage_a";
  const stageConfig = availableStages[stage];
  if (!stageConfig) {
    throw new Error(
      `Unknown stage "${stage}". Available stages: ${Object.keys(availableStages).join(", ")}`
    );
  }

  return {
    stage,
    weights: {
      ...DEFAULT_WEIGHTS,
      ...(thresholdsDoc.weights || {}),
      ...(stageConfig.weights || {}),
    },
    metrics: stageConfig.metrics || thresholdsDoc.metrics || {},
    syntheticLatencyPenalty: Number(
      stageConfig.synthetic_latency_penalty ?? thresholdsDoc.synthetic_latency_penalty ?? 0
    ),
  };
}

function selectDatasetsForStage(registryEntry, stage) {
  const stageIds = registryEntry.fixture_tiers?.[stage];
  if (!Array.isArray(stageIds) || stageIds.length === 0) {
    return registryEntry.datasets || [];
  }
  const datasetMap = new Map((registryEntry.datasets || []).map((dataset) => [dataset.id, dataset]));
  const selected = stageIds.map((datasetId) => datasetMap.get(datasetId)).filter(Boolean);
  if (!selected.length) {
    throw new Error(`No datasets resolved for capability ${registryEntry.capability} at stage ${stage}`);
  }
  return selected;
}

function toCapabilitySet(rawValue) {
  if (!rawValue) return null;
  return new Set(
    String(rawValue)
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean)
  );
}

function capabilityConfidence(sampleCount, minimumSamples) {
  if (minimumSamples <= 0) return "HIGH";
  if (sampleCount >= minimumSamples) return "HIGH";
  if (sampleCount >= Math.ceil(minimumSamples * 0.5)) return "MEDIUM";
  return "LOW";
}

function globalConfidence(confidences) {
  if (confidences.every((value) => value === "HIGH")) return "HIGH";
  if (confidences.every((value) => value === "HIGH" || value === "MEDIUM")) return "MEDIUM";
  return "LOW";
}

function capabilityStatus(metrics) {
  const blockingFailure = metrics.some((metric) => metric.status === "fail" && metric.enforcement === "fail");
  if (blockingFailure) return "fail";
  const warningFailure = metrics.some((metric) => metric.status === "fail");
  if (warningFailure) return "warn";
  return "pass";
}

function buildMarkdown(report) {
  const lines = [];
  lines.push("# ISA Capability Evaluation");
  lines.push("");
  lines.push(`- Run ID: ${report.run_id}`);
  lines.push(`- Generated At: ${report.generated_at}`);
  lines.push(`- ISA Quality Score: ${report.isa_quality_score.value.toFixed(4)} (${report.isa_quality_score.grade})`);
  lines.push(`- Confidence: ${report.isa_quality_score.confidence}`);
  lines.push(`- Stage: ${report.stage}`);
  lines.push(`- Status: ${report.status}`);
  lines.push("");
  lines.push("## Capability Scores");
  lines.push("");
  lines.push("| Capability | Score | Grade | Status | Sample Count | Confidence |");
  lines.push("|---|---:|:---:|:---:|---:|:---:|");

  for (const capability of report.capabilities) {
    lines.push(
        `| ${capability.capability} | ${capability.capability_score.value.toFixed(4)} | ${capability.capability_score.grade} | ${capability.status} | ${capability.sample_count} | ${capability.confidence} |`
      );
  }

  const failedMetrics = report.capabilities
    .flatMap((capability) => capability.metrics.map((metric) => ({ capability: capability.capability, ...metric })))
    .filter((metric) => metric.status === "fail");

  lines.push("");
  lines.push("## Threshold Failures");
  lines.push("");

  if (!failedMetrics.length) {
    lines.push("- None");
  } else {
    lines.push("| Capability | Metric | Value | Threshold | Enforcement |");
    lines.push("|---|---|---:|---:|:---:|");
    for (const metric of failedMetrics) {
      lines.push(
        `| ${metric.capability} | ${metric.metric_id} | ${Number(metric.value).toFixed(4)} | ${metric.threshold_op} ${Number(metric.threshold).toFixed(4)} | ${metric.enforcement} |`
      );
    }
  }

  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- Total metrics: ${report.summary.total_metrics}`);
  lines.push(`- Passed metrics: ${report.summary.pass}`);
  lines.push(`- Failed metrics: ${report.summary.fail}`);
  lines.push(`- Blocking failures: ${report.summary.blocking_failures}`);
  lines.push(`- Warning failures: ${report.summary.warning_failures}`);

  return `${lines.join("\n")}\n`;
}

async function main() {
  const options = parseArgs();
  const registry = readJson(options.registry);
  const thresholdsDoc = readJson(options.thresholds);
  const selectedCapabilities = toCapabilitySet(options.capabilities);
  const generatedAt = new Date().toISOString();
  const stageConfig = resolveStageConfig(thresholdsDoc, options.stage);
  const stage = stageConfig.stage;
  const thresholdsByMetric = stageConfig.metrics;
  const weights = stageConfig.weights;

  const capabilityReports = [];

  for (const registryEntry of registry.capabilities || []) {
    const capability = registryEntry.capability;
    if (selectedCapabilities && !selectedCapabilities.has(capability)) continue;

    const adapter = ADAPTERS[capability];
    if (!adapter) {
      throw new Error(`No adapter registered for capability: ${capability}`);
    }

    const selectedDatasets = selectDatasetsForStage(registryEntry, stage);
    const fixtureVersion = inferFixtureVersion(selectedDatasets.map((dataset) => dataset.id));

    const evaluated = await adapter.evaluate({
      registryEntry,
      datasets: selectedDatasets,
      stage,
      fixtureVersion,
      thresholdsByMetric,
      generatedAt,
      runId: options.runId,
    });

    const enrichedMetrics = evaluated.metrics.map((metric) => {
      const threshold = thresholdsByMetric[metric.metric_id];
      if (!threshold) {
        throw new Error(`Missing threshold definition for metric: ${metric.metric_id}`);
      }

      return {
        run_id: options.runId,
        capability,
        dataset_id: metric.dataset_id,
        metric_id: metric.metric_id,
        dimension: metric.dimension,
        kind: metric.kind,
        value: metric.value,
        threshold: threshold.value,
        threshold_op: threshold.op,
        enforcement: threshold.enforcement,
        status: compareThreshold(metric.value, threshold.op, threshold.value) ? "pass" : "fail",
        timestamp_utc: generatedAt,
        fixture_path: metric.fixture_path,
        fixture_version: metric.fixture_version || fixtureVersion,
        measurement_mode: metric.measurement_mode || "fixture",
        runtime_probe_id: metric.runtime_probe_id,
        runtime_probe_samples: metric.runtime_probe_samples,
        contract_path: evaluated.contractPath,
        provenance: {
          registry_path: options.registry,
          thresholds_path: options.thresholds,
          stage,
        },
      };
    });

    const syntheticPenalty =
      evaluated.syntheticLatencyCount > 0 ? stageConfig.syntheticLatencyPenalty : 0;
    const capabilityScoreValue = Number(
      computeCapabilityScore(evaluated.rollups, weights, {
        syntheticPenalty,
      }).toFixed(4)
    );
    const confidence = capabilityConfidence(evaluated.sampleCount, evaluated.minimumSamples);

    capabilityReports.push({
      capability,
      stage,
      fixture_version: evaluated.fixtureVersion || fixtureVersion,
      dataset_ids: evaluated.datasetIds,
      sample_count: evaluated.sampleCount,
      minimum_samples: evaluated.minimumSamples,
      confidence,
      contract_path: evaluated.contractPath,
      metric_rollups: evaluated.rollups,
      synthetic_penalty: syntheticPenalty,
      capability_score: {
        value: capabilityScoreValue,
        grade: scoreGrade(capabilityScoreValue),
      },
      metrics: enrichedMetrics,
      status: capabilityStatus(enrichedMetrics),
    });
  }

  const metricRows = capabilityReports.flatMap((capability) => capability.metrics);
  const passCount = metricRows.filter((metric) => metric.status === "pass").length;
  const failCount = metricRows.length - passCount;
  const blockingFailures = metricRows.filter(
    (metric) => metric.status === "fail" && metric.enforcement === "fail"
  ).length;
  const warningFailures = metricRows.filter(
    (metric) => metric.status === "fail" && metric.enforcement === "warn"
  ).length;

  const isaQualityValue = Number(avg(capabilityReports.map((capability) => capability.capability_score.value)).toFixed(4));
  const confidences = capabilityReports.map((capability) => capability.confidence);

  const report = {
    schema_version: "2.0.0",
    generated_at: generatedAt,
    run_id: options.runId,
    mode: "fixture-first-stage-aware",
    stage,
    enforcement_mode: thresholdsDoc.enforcement_mode || "advisory-first",
    registry_path: options.registry,
    thresholds_path: options.thresholds,
    capabilities: capabilityReports,
    isa_quality_score: {
      value: isaQualityValue,
      grade: scoreGrade(isaQualityValue),
      confidence: globalConfidence(confidences),
    },
    summary: {
      total_metrics: metricRows.length,
      pass: passCount,
      fail: failCount,
      blocking_failures: blockingFailures,
      warning_failures: warningFailures,
    },
    status: blockingFailures > 0 ? "fail" : "pass",
    drift_status: "unknown",
  };

  writeJson(options.outJson, report);
  if (options.outMarkdown && options.outMarkdown !== "-") {
    writeText(options.outMarkdown, buildMarkdown(report));
  }

  process.stdout.write(`DONE=isa_capability_eval_written:${options.outJson}\n`);
}

main().catch((error) => {
  process.stderr.write(`STOP=isa_capability_eval_error:${String(error?.message || error)}\n`);
  process.exit(1);
});
