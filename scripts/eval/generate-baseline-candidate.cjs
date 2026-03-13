#!/usr/bin/env node

const { readJson, writeJson } = require("./lib/common.cjs");

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    evalPath: "test-results/ci/isa-capability-eval.json",
    outPath: "test-results/ci/isa-capability-baseline-candidate.json",
    baselineId: "isa-capability-baseline-candidate",
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--eval") options.evalPath = args[++i];
    else if (arg === "--out") options.outPath = args[++i];
    else if (arg === "--id") options.baselineId = args[++i];
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function main() {
  const options = parseArgs();
  const evaluation = readJson(options.evalPath);

  const metrics = {};
  const metricMeta = {};
  const capabilityMeta = {};
  for (const capability of evaluation.capabilities || []) {
    capabilityMeta[capability.capability] = {
      dataset_ids: capability.dataset_ids || [],
      sample_count: Number(capability.sample_count || 0),
      minimum_samples: Number(capability.minimum_samples || 0),
      confidence: capability.confidence || "LOW",
      diagnostics: capability.diagnostics || null,
    };

    for (const metric of capability.metrics || []) {
      metrics[metric.metric_id] = metric.value;
      metricMeta[metric.metric_id] = {
        capability: capability.capability,
        fixture_version: metric.fixture_version || capability.fixture_version || "v0",
        measurement_mode: metric.measurement_mode || "fixture",
        runtime_probe_id: metric.runtime_probe_id || null,
        runtime_probe_samples: Number(metric.runtime_probe_samples || 0),
      };
    }
  }

  const candidate = {
    baseline_id: options.baselineId,
    generated_at: new Date().toISOString(),
    stage: evaluation.stage || "stage_a",
    source_eval_run_id: evaluation.run_id,
    source_eval_generated_at: evaluation.generated_at,
    notes: "Weekly baseline candidate generated from latest unified ISA capability evaluation. Requires manual review and approval before replacing the stage-specific canonical baseline.",
    metrics,
    metric_meta: metricMeta,
    capability_meta: capabilityMeta,
  };

  writeJson(options.outPath, candidate);
  process.stdout.write(`DONE=isa_baseline_candidate_written:${options.outPath}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`STOP=isa_baseline_candidate_error:${String(error?.message || error)}\n`);
  process.exit(1);
}
