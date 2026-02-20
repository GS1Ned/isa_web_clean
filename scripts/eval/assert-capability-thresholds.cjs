#!/usr/bin/env node

const { readJson } = require("./lib/common.cjs");

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    input: "test-results/ci/isa-capability-eval.json",
    strictWarn: false,
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--in") options.input = args[++i];
    else if (arg === "--strict-warn") options.strictWarn = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function metricSummary(metric) {
  return `${metric.capability} ${metric.metric_id} value=${metric.value} threshold=${metric.threshold_op}${metric.threshold}`;
}

function main() {
  const options = parseArgs();
  const report = readJson(options.input);
  const metrics = report.capabilities.flatMap((capability) => capability.metrics);

  const blockingFailures = metrics.filter(
    (metric) => metric.status === "fail" && metric.enforcement === "fail"
  );
  const warningFailures = metrics.filter(
    (metric) => metric.status === "fail" && metric.enforcement === "warn"
  );

  process.stdout.write(
    `READY=threshold_assertions_loaded metrics=${metrics.length} blocking_failures=${blockingFailures.length} warning_failures=${warningFailures.length}\n`
  );

  if (warningFailures.length > 0) {
    process.stdout.write("WARN=non_blocking_capability_regressions\n");
    for (const warning of warningFailures) {
      process.stdout.write(`WARN_DETAIL=${metricSummary(warning)}\n`);
    }
  }

  if (blockingFailures.length > 0) {
    process.stdout.write("STOP=blocking_capability_regressions\n");
    for (const failure of blockingFailures) {
      process.stdout.write(`FAIL_DETAIL=${metricSummary(failure)}\n`);
    }
    process.exit(1);
  }

  if (options.strictWarn && warningFailures.length > 0) {
    process.stdout.write("STOP=strict_warn_mode\n");
    process.exit(1);
  }

  process.stdout.write("DONE=capability_threshold_assertions_passed\n");
}

try {
  main();
} catch (error) {
  process.stderr.write(`STOP=capability_threshold_assertion_error:${String(error?.message || error)}\n`);
  process.exit(1);
}
