#!/usr/bin/env node

const fs = require("node:fs");
const { readJson, writeJson, avg } = require("./lib/common.cjs");

const DRIFT_RULES = {
  major_score_degrade_pct: 15,
  major_latency_increase_pct: 30,
  minor_score_degrade_pct: 8,
  minor_latency_increase_pct: 15,
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

function toMetricSeries(history, metricId) {
  return history
    .map((run) => run.metrics?.[metricId])
    .filter((value) => Number.isFinite(value));
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

function classifyDrift(metric, baselineValue, historySeriesWithCurrent) {
  const { value, threshold_op: thresholdOp } = metric;
  const direction = thresholdOp === "<=" ? "latency" : "score";

  const currentDegradePct = degradePct(value, baselineValue, thresholdOp);
  const lastTwo = historySeriesWithCurrent.slice(-2);
  const lastThree = historySeriesWithCurrent.slice(-3);

  let drift = "none";

  if (lastThree.length === 3) {
    const avgLastThree = avg(lastThree);
    const movingDegrade = degradePct(avgLastThree, baselineValue, thresholdOp);
    if (direction === "score" && movingDegrade > DRIFT_RULES.major_score_degrade_pct) {
      drift = "major";
    }
    if (direction === "latency" && movingDegrade > DRIFT_RULES.major_latency_increase_pct) {
      drift = "major";
    }
  }

  if (drift === "none" && lastTwo.length === 2) {
    const bothDegraded = lastTwo.every((runValue) => {
      const pct = degradePct(runValue, baselineValue, thresholdOp);
      if (direction === "score") return pct > DRIFT_RULES.minor_score_degrade_pct;
      return pct > DRIFT_RULES.minor_latency_increase_pct;
    });

    if (bothDegraded) drift = "minor";
  }

  return {
    drift,
    direction,
    currentDegradePct,
    deltaPct: deltaPct(value, baselineValue),
  };
}

function main() {
  const options = parseArgs();
  const evaluation = readJson(options.evalPath);
  const baseline = readJson(options.baselinePath);
  const history = loadHistory(options.historyPath);

  const currentMetrics = evaluation.capabilities.flatMap((capability) =>
    capability.metrics.map((metric) => ({ capability: capability.capability, ...metric }))
  );

  const currentMetricMap = {};
  for (const metric of currentMetrics) {
    currentMetricMap[metric.metric_id] = metric.value;
  }

  const nextHistory = [
    ...history,
    {
      run_id: evaluation.run_id,
      generated_at: evaluation.generated_at,
      metrics: currentMetricMap,
    },
  ];

  const driftRows = [];

  for (const metric of currentMetrics) {
    const baselineValue = baseline.metrics?.[metric.metric_id];
    if (!Number.isFinite(baselineValue)) continue;

    const historicalSeries = toMetricSeries(nextHistory, metric.metric_id);
    const driftInfo = classifyDrift(metric, baselineValue, historicalSeries);

    driftRows.push({
      metric_id: metric.metric_id,
      capability: metric.capability,
      kind: metric.kind,
      direction: driftInfo.direction,
      current: Number(metric.value.toFixed ? metric.value.toFixed(4) : metric.value),
      baseline: baselineValue,
      delta_pct: Number(driftInfo.deltaPct.toFixed(4)),
      drift: driftInfo.drift,
    });
  }

  const summary = {
    major: driftRows.filter((row) => row.drift === "major").length,
    minor: driftRows.filter((row) => row.drift === "minor").length,
    none: driftRows.filter((row) => row.drift === "none").length,
  };

  const alerts = [];
  if (summary.major > 0) alerts.push(`major drift detected for ${summary.major} metrics`);
  if (summary.minor > 0) alerts.push(`minor drift detected for ${summary.minor} metrics`);

  const status = summary.major > 0 ? "fail" : summary.minor > 0 ? "warn" : "pass";

  const report = {
    generated_at: new Date().toISOString(),
    run_id: evaluation.run_id,
    baseline_path: options.baselinePath,
    history_path: options.historyPath,
    rules: DRIFT_RULES,
    summary,
    status,
    alerts,
    metrics: driftRows,
  };

  writeJson(options.historyPath, nextHistory);
  writeJson(options.outPath, report);

  process.stdout.write(`DONE=isa_drift_report_written:${options.outPath}\n`);

  if (status === "fail") {
    process.exit(1);
  }
}

try {
  main();
} catch (error) {
  process.stderr.write(`STOP=isa_drift_detection_error:${String(error?.message || error)}\n`);
  process.exit(1);
}
