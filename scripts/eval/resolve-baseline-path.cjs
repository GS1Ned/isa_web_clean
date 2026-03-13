#!/usr/bin/env node

const fs = require("node:fs");

const BASELINE_STAGE_A = "data/evaluation/baselines/isa-capability-baseline.json";
const BASELINE_STAGE_B = "data/evaluation/baselines/isa-capability-baseline-stage_b.json";
const BASELINE_STAGE_C = "data/evaluation/baselines/isa-capability-baseline-stage_c.json";

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    stage: "stage_a",
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--stage") options.stage = args[++i] || "stage_a";
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function exists(path) {
  return fs.existsSync(path);
}

function resolveBaselinePath(stage) {
  if (stage === "stage_b") {
    if (exists(BASELINE_STAGE_B)) return BASELINE_STAGE_B;
    process.stderr.write(
      `WARN=baseline_stage_b_missing fallback=${BASELINE_STAGE_A}\n`
    );
    return BASELINE_STAGE_A;
  }

  if (stage === "stage_c") {
    if (exists(BASELINE_STAGE_C)) return BASELINE_STAGE_C;
    process.stderr.write(
      `WARN=baseline_stage_c_missing fallback=${BASELINE_STAGE_A}\n`
    );
    return BASELINE_STAGE_A;
  }

  return BASELINE_STAGE_A;
}

function main() {
  const options = parseArgs();
  const baselinePath = resolveBaselinePath(options.stage);
  process.stdout.write(`${baselinePath}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`STOP=baseline_path_resolution_error:${String(error?.message || error)}\n`);
  process.exit(1);
}
