#!/usr/bin/env node

const fs = require("node:fs");
const { readJson, writeJson, avg } = require("./lib/common.cjs");

const DRIFT_RULES = {
  major_score_degrade_pct: 15,
  major_latency_increase_pct: 30,
  minor_score_degrade_pct: 8,
  minor_latency_increase_pct: 15,
  runtime_latency_baseline_floor_ms: 1,
};

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    evalPath: "test-results/ci/isa-capability-eval.json",
    baselinePath: "data/evaluation/baselines/isa-capability-baseline.json",
    historyPath: "test-results/ci/isa-capability-eval-history.json",
    outPath: "test-results/ci/isa-drift-report.json",
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--eval") options.evalPath = args[++i];
    else if (arg === "--baseline") options.baselinePath = args[++i];
    else if (arg === "--history") options.historyPath = args[++i];
    else if (arg === "--out") options.outPath = args[++i];
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function loadHistory(historyPath) {
  if (!fs.existsSync(historyPath)) return [];
  const payload = readJson(historyPath);
  return Array.isArray(payload) ? payload : [];
}

function toComparableSeries(history, metricId, stage, fixtureVersion) {
  return history
    .filter((run) => {
      const runStage = run.stage || "stage_a";
      const meta = run.metric_meta?.[metricId] || {};
      const runFixtureVersion = meta.fixture_version || "v0";
      return runStage === stage && runFixtureVersion === fixtureVersion;
    })
    .map((run) => run.metrics?.[metricId])
    .filter((value) => Number.isFinite(value));
}

function hasPriorDifferentFixtureVersion(history, metricId, stage, fixtureVersion) {
  return history.some((run) => {
    const runStage = run.stage || "stage_a";
    if (runStage !== stage) return false;
    const runFixtureVersion = run.metric_meta?.[metricId]?.fixture_version || "v0";
    return runFixtureVersion !== fixtureVersion;
  });
}

function degradePct(value, baseline, thresholdOp) {
  if (!Number.isFinite(value) || !Number.isFinite(baseline) || baseline === 0) return 0;
  if (thresholdOp === ">=") {
    return ((baseline - value) / baseline) * 100;
  }
  return ((value - baseline) / baseline) * 100;
}

function deltaPct(value, baseline) {
  if (!Number.isFinite(value) || !Number.isFinite(baseline) || baseline === 0) return 0;
  return ((value - baseline) / baseline) * 100;
}

function classifyDrift(metric, baselineValue, comparableSeries) {
  const { value, threshold_op: thresholdOp } = metric;
  const direction = thresholdOp === "<=" ? "latency" : "score";
  const isRuntimeLatency = direction === "latency" && metric.measurement_mode === "runtime";
  const comparisonBaseline = isRuntimeLatency
    ? Math.max(baselineValue, DRIFT_RULES.runtime_latency_baseline_floor_ms)
    : baselineValue;

  const lastTwo = comparableSeries.slice(-2);
  const lastThree = comparableSeries.slice(-3);
  let drift = "none";

  if (lastThree.length === 3) {
    const avgLastThree = avg(lastThree);
    const movingDegrade = degradePct(avgLastThree, comparisonBaseline, thresholdOp);
    if (direction === "score" && movingDegrade > DRIFT_RULES.major_score_degrade_pct) {
      drift = "major";
    }
    if (direction === "latency" && movingDegrade > DRIFT_RULES.major_latency_increase_pct) {
      drift = "major";
    }
  }

  if (drift === "none" && lastTwo.length === 2) {
    const bothDegraded = lastTwo.every((runValue) => {
      const pct = degradePct(runValue, comparisonBaseline, thresholdOp);
      if (direction === "score") return pct > DRIFT_RULES.minor_score_degrade_pct;
      return pct > DRIFT_RULES.minor_latency_increase_pct;
    });

    if (bothDegraded) drift = "minor";
  }

  return {
    drift,
    direction,
    deltaPct: deltaPct(value, baselineValue),
  };
}

function baselineMetaForMetric(baseline, metricId) {
  return baseline.metric_meta?.[metricId] || {};
}

function normalizeDatasetIds(datasetIds) {
  return [...new Set((datasetIds || []).map((value) => String(value).trim()).filter(Boolean))].sort();
}

function benchmarkMixForCapabilityMeta(capabilityMeta) {
  return capabilityMeta?.diagnostics?.benchmark_mix || null;
}

function buildCapabilityProfile(capabilityMeta) {
  if (!capabilityMeta) return null;

  const benchmarkMix = benchmarkMixForCapabilityMeta(capabilityMeta);
  return {
    dataset_ids: normalizeDatasetIds(capabilityMeta.dataset_ids),
    sample_count: Number(capabilityMeta.sample_count || 0),
    minimum_samples: Number(capabilityMeta.minimum_samples || 0),
    confidence: capabilityMeta.confidence || "LOW",
    benchmark_mix: benchmarkMix
      ? {
          positive_case_count: Number(benchmarkMix.positive_case_count || 0),
          negative_case_count: Number(benchmarkMix.negative_case_count || 0),
          direct_case_count: Number(benchmarkMix.direct_case_count || 0),
          partial_case_count: Number(benchmarkMix.partial_case_count || 0),
          no_mapping_case_count: Number(benchmarkMix.no_mapping_case_count || 0),
          direct_case_share: Number(benchmarkMix.direct_case_share || 0),
          partial_case_share: Number(benchmarkMix.partial_case_share || 0),
          no_mapping_case_share: Number(benchmarkMix.no_mapping_case_share || 0),
        }
      : null,
  };
}

function capabilityProfileKey(capabilityMeta) {
  const profile = buildCapabilityProfile(capabilityMeta);
  return profile ? JSON.stringify(profile) : "null";
}

function detectCapabilityTransition({ history, baseline, capability, stage, capabilityMeta }) {
  const currentProfile = buildCapabilityProfile(capabilityMeta);
  if (!currentProfile) {
    return { transition: false, reason: null };
  }

  const currentProfileKey = capabilityProfileKey(capabilityMeta);
  const baselineCapabilityMeta = baseline.capability_meta?.[capability] || null;
  const baselineProfileKey = capabilityProfileKey(baselineCapabilityMeta);

  if (baselineCapabilityMeta && baselineProfileKey !== currentProfileKey) {
    return { transition: true, reason: "benchmark_profile_changed_from_baseline" };
  }

  const hasPriorDifferentProfile = history.some((run) => {
    const runStage = run.stage || "stage_a";
    if (runStage !== stage) return false;
    const priorCapabilityMeta = run.capability_meta?.[capability] || null;
    return capabilityProfileKey(priorCapabilityMeta) !== currentProfileKey;
  });

  if (hasPriorDifferentProfile) {
    return { transition: true, reason: "benchmark_profile_changed_from_history" };
  }

  return { transition: false, reason: null };
}

function main() {
  const options = parseArgs();
  const evaluation = readJson(options.evalPath);
  const baseline = readJson(options.baselinePath);
  const history = loadHistory(options.historyPath);
  const stage = evaluation.stage || baseline.stage || "stage_a";

  const currentMetrics = evaluation.capabilities.flatMap((capability) =>
    capability.metrics.map((metric) => ({ capability: capability.capability, ...metric }))
  );

  const currentMetricMap = {};
  const currentMetricMeta = {};
  const currentCapabilityMeta = {};
  for (const capability of evaluation.capabilities || []) {
    currentCapabilityMeta[capability.capability] = {
      dataset_ids: capability.dataset_ids || [],
      sample_count: Number(capability.sample_count || 0),
      minimum_samples: Number(capability.minimum_samples || 0),
      confidence: capability.confidence || "LOW",
      diagnostics: capability.diagnostics || null,
    };
  }
  for (const metric of currentMetrics) {
    currentMetricMap[metric.metric_id] = metric.value;
    currentMetricMeta[metric.metric_id] = {
      capability: metric.capability,
      fixture_version: metric.fixture_version || "v0",
      measurement_mode: metric.measurement_mode || "fixture",
    };
  }

  const nextHistory = [
    ...history,
    {
      run_id: evaluation.run_id,
      generated_at: evaluation.generated_at,
      stage,
      metrics: currentMetricMap,
      metric_meta: currentMetricMeta,
      capability_meta: currentCapabilityMeta,
    },
  ];

  const driftRows = [];
  const capabilityTransitions = [];
  const capabilityTransitionMap = new Map();

  for (const capability of evaluation.capabilities || []) {
    const transition = detectCapabilityTransition({
      history,
      baseline,
      capability: capability.capability,
      stage,
      capabilityMeta: currentCapabilityMeta[capability.capability],
    });
    capabilityTransitionMap.set(capability.capability, transition);
    if (transition.transition) {
      capabilityTransitions.push({
        capability: capability.capability,
        reason: transition.reason,
      });
    }
  }

  for (const metric of currentMetrics) {
    const baselineValue = baseline.metrics?.[metric.metric_id];
    if (!Number.isFinite(baselineValue)) continue;

    const fixtureVersion = metric.fixture_version || "v0";
    const baselineMeta = baselineMetaForMetric(baseline, metric.metric_id);
    const baselineStage = baseline.stage || null;
    const baselineFixtureVersion = baselineMeta.fixture_version || null;
    const stageMismatch = Boolean(baselineStage && baselineStage !== stage);
    const baselineFixtureMismatch = Boolean(
      baselineFixtureVersion && baselineFixtureVersion !== fixtureVersion
    );

    const comparableSeries = toComparableSeries(
      nextHistory,
      metric.metric_id,
      stage,
      fixtureVersion
    );
    const transition = hasPriorDifferentFixtureVersion(
      history,
      metric.metric_id,
      stage,
      fixtureVersion
    );
    const capabilityTransition =
      capabilityTransitionMap.get(metric.capability) || { transition: false, reason: null };

    let drift = "none";
    let direction = metric.threshold_op === "<=" ? "latency" : "score";
    let comparisonMode = "stage+fixture_version";
    let transitionReason = null;

    if (stageMismatch || baselineFixtureMismatch) {
      drift = "transition";
      comparisonMode = "transition";
      transitionReason = stageMismatch
        ? "stage_mismatch"
        : "fixture_version_mismatch_from_baseline";
    } else if (capabilityTransition.transition) {
      drift = "transition";
      comparisonMode = "transition";
      transitionReason = capabilityTransition.reason;
    } else if (transition && comparableSeries.length < 3) {
      drift = "transition";
      comparisonMode = "transition";
      transitionReason = "fixture_version_changed_from_history";
    } else {
      const driftInfo = classifyDrift(metric, baselineValue, comparableSeries);
      drift = driftInfo.drift;
      direction = driftInfo.direction;
    }

    driftRows.push({
      metric_id: metric.metric_id,
      capability: metric.capability,
      kind: metric.kind,
      direction,
      stage,
      fixture_version: fixtureVersion,
      measurement_mode: metric.measurement_mode || "fixture",
      comparison_mode: comparisonMode,
      transition: comparisonMode === "transition",
      transition_reason: transitionReason,
      current: Number(metric.value.toFixed ? metric.value.toFixed(4) : metric.value),
      baseline: baselineValue,
      delta_pct: Number(deltaPct(metric.value, baselineValue).toFixed(4)),
      drift,
    });
  }

  const summary = {
    major: driftRows.filter((row) => row.drift === "major").length,
    minor: driftRows.filter((row) => row.drift === "minor").length,
    transition: driftRows.filter((row) => row.drift === "transition").length,
    none: driftRows.filter((row) => row.drift === "none").length,
  };

  const alerts = [];
  if (summary.major > 0) alerts.push(`major drift detected for ${summary.major} metrics`);
  if (summary.minor > 0) alerts.push(`minor drift detected for ${summary.minor} metrics`);
  if (summary.transition > 0) {
    alerts.push(`transition comparison mode for ${summary.transition} metrics`);
  }
  if (capabilityTransitions.length > 0) {
    alerts.push(
      `capability benchmark/profile transition for ${capabilityTransitions.length} capabilities`
    );
  }

  const status = summary.major > 0 ? "fail" : summary.minor > 0 ? "warn" : "pass";

  const report = {
    generated_at: new Date().toISOString(),
    run_id: evaluation.run_id,
    baseline_path: options.baselinePath,
    history_path: options.historyPath,
    stage,
    rules: DRIFT_RULES,
    summary,
    status,
    alerts,
    capability_transitions: capabilityTransitions,
    metrics: driftRows,
  };

  writeJson(options.historyPath, nextHistory);
  writeJson(options.outPath, report);

  process.stdout.write(`DONE=isa_drift_report_written:${options.outPath}\n`);

  if (status === "fail") {
    process.exit(1);
  }
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`STOP=isa_drift_detection_error:${String(error?.message || error)}\n`);
    process.exit(1);
  }
}

module.exports = {
  buildCapabilityProfile,
  capabilityProfileKey,
  detectCapabilityTransition,
};
