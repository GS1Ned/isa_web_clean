#!/usr/bin/env node

const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const { readJson, writeJson } = require("./lib/common.cjs");

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    out: "test-results/ci/doc-governance-eval.json",
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === "--out") options.out = args[++i];
    else throw new Error(`Unknown argument: ${arg}`);
  }

  return options;
}

function runGate(command, args) {
  try {
    execFileSync(command, args, { stdio: "pipe" });
    return 1;
  } catch {
    return 0;
  }
}

function main() {
  const options = parseArgs();
  const bootstrapPrompt = fs.readFileSync("docs/agent/GEMINI_CODEX_BOOTSTRAP_PROMPT.md", "utf8");
  const executionState = readJson("docs/planning/refactoring/EXECUTION_STATE.json");

  const metrics = [
    {
      metric_id: "doc.canonical_contract_drift.clean",
      value: runGate("bash", ["scripts/gates/canonical-contract-drift.sh"]),
      evidence: "scripts/gates/canonical-contract-drift.sh",
    },
    {
      metric_id: "doc.canonical_allowlist.clean",
      value: runGate("bash", ["scripts/gates/canonical-docs-allowlist.sh"]),
      evidence: "scripts/gates/canonical-docs-allowlist.sh",
    },
    {
      metric_id: "doc.canonical_doc_code.clean",
      value: runGate("bash", ["scripts/gates/doc-code-validator.sh", "--canonical-only"]),
      evidence: "scripts/gates/doc-code-validator.sh --canonical-only",
    },
    {
      metric_id: "doc.bootstrap.dynamic_ready_resolution",
      value: Number(
        bootstrapPrompt.includes("docs/planning/NEXT_ACTIONS.json") &&
          !bootstrapPrompt.includes("Current first READY item")
      ),
      evidence: "docs/agent/GEMINI_CODEX_BOOTSTRAP_PROMPT.md",
    },
    {
      metric_id: "doc.execution_state.repo_ref.current",
      value: Number(
        typeof executionState?.meta?.repo_ref?.commit === "string" &&
          executionState.meta.repo_ref.commit.trim().length > 0
      ),
      evidence: "docs/planning/refactoring/EXECUTION_STATE.json",
    },
  ];

  const passCount = metrics.filter((metric) => metric.value === 1).length;
  const report = {
    schema_version: "1.0.0",
    generated_at: new Date().toISOString(),
    metrics,
    summary: {
      total_metrics: metrics.length,
      pass: passCount,
      fail: metrics.length - passCount,
    },
    status: passCount === metrics.length ? "pass" : "warn",
  };

  writeJson(options.out, report);
  process.stdout.write(`DONE=doc_governance_eval_written:${options.out}\n`);
}

try {
  main();
} catch (error) {
  process.stderr.write(`STOP=doc_governance_eval_error:${String(error?.message || error)}\n`);
  process.exit(1);
}
