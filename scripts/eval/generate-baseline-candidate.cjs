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
  for (const capability of evaluation.capabilities || []) {
    for (const metric of capability.metrics || []) {
      metrics[metric.metric_id] = metric.value;
    }
  }

  const candidate = {
    baseline_id: options.baselineId,
    generated_at: new Date().toISOString(),
    source_eval_run_id: evaluation.run_id,
    source_eval_generated_at: evaluation.generated_at,
    notes: "Weekly baseline candidate generated from latest unified ISA capability evaluation. Requires manual review and approval before replacing canonical baseline.",
    metrics,
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
