/**
 * Deterministic RAG Evaluation (Fixtures)
 *
 * Offline evaluator that produces a schema-valid `test-results/ci/rag-eval.json`
 * without DB access or network calls.
 */

const fs = require("node:fs");
const path = require("node:path");
const { format: utilFormat } = require("node:util");

const cliOut = (...args) => process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args) => process.stderr.write(`${utilFormat(...args)}\n`);

function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    fixtures: "data/metadata/rag_eval_fixtures_v1.json",
    out: "test-results/ci/rag-eval.json",
    limit: null,
    dryRun: false,
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    switch (a) {
      case "--fixtures":
        options.fixtures = args[++i];
        break;
      case "--out":
        options.out = args[++i];
        break;
      case "--limit":
        options.limit = Number.parseInt(args[++i] || "", 10);
        break;
      case "--dry-run":
        options.dryRun = true;
        break;
      default:
        cliErr("Unknown argument: %s", a);
        process.exit(2);
    }
  }

  return options;
}

function percentile95(values) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.max(0, Math.ceil(0.95 * sorted.length) - 1);
  return sorted[idx];
}

function intersectionCount(a, b) {
  const set = new Set(a);
  let n = 0;
  for (const x of b) {
    if (set.has(x)) n++;
  }
  return n;
}

async function main() {
  const opts = parseArgs();

  if (!fs.existsSync(opts.fixtures)) {
    cliErr("Missing fixtures file: %s", opts.fixtures);
    process.exit(1);
  }

  const raw = JSON.parse(fs.readFileSync(opts.fixtures, "utf8"));
  const allCases = Array.isArray(raw.cases) ? raw.cases : [];
  const cases = opts.limit ? allCases.slice(0, opts.limit) : allCases;

  if (!cases.length) {
    cliErr("No cases found in fixtures: %s", opts.fixtures);
    process.exit(1);
  }

  cliOut("READY=fixtures_loaded count=%d", cases.length);

  if (opts.dryRun) {
    for (const c of cases) {
      cliOut("CASE=%s", String(c.id || "UNKNOWN"));
    }
    cliOut("DONE=dry_run");
    return;
  }

  const thresholds = {
    groundedness_min: 0.8,
    citation_precision_min: 0.8,
    citation_recall_min: 0.6,
    answer_consistency_min: 0.9,
    cost_per_query_max: 0.01,
    p95_latency_ms_max: 5000,
  };

  const perCase = [];
  const latencies = [];
  const costs = [];

  let groundedCount = 0;
  let precisionSum = 0;
  let recallSum = 0;
  let consistencySum = 0;

  for (const c of cases) {
    const expected = Array.isArray(c.expected_citations)
      ? c.expected_citations.map(String)
      : [];
    const actual = c.actual && typeof c.actual === "object" ? c.actual : {};
    const repeat = c.repeat_actual && typeof c.repeat_actual === "object" ? c.repeat_actual : null;

    const actualCitations = Array.isArray(actual.citations)
      ? actual.citations.map(String)
      : [];

    const correct = intersectionCount(expected, actualCitations);
    const precision = actualCitations.length ? correct / actualCitations.length : 0;
    const recall = expected.length ? correct / expected.length : 1;
    const grounded = correct > 0 ? 1 : 0;

    const repeatAnswer = repeat ? String(repeat.answer || "") : String(actual.answer || "");
    const repeatCitations = repeat && Array.isArray(repeat.citations) ? repeat.citations.map(String) : actualCitations;
    const consistent =
      String(actual.answer || "") === repeatAnswer &&
      JSON.stringify(actualCitations) === JSON.stringify(repeatCitations)
        ? 1
        : 0;

    const latencyMs = Number(actual.latency_ms || 0);
    const costUsd = Number(actual.cost_usd || 0);

    groundedCount += grounded;
    precisionSum += precision;
    recallSum += recall;
    consistencySum += consistent;
    latencies.push(latencyMs);
    costs.push(costUsd);

    perCase.push({
      id: String(c.id || "UNKNOWN"),
      grounded,
      citation_precision: Number(precision.toFixed(4)),
      citation_recall: Number(recall.toFixed(4)),
      answer_consistency: consistent,
      latency_ms: latencyMs,
      cost_usd: costUsd,
    });
  }

  const n = cases.length;
  const metrics = {
    groundedness: groundedCount / n,
    citation_precision: precisionSum / n,
    citation_recall: recallSum / n,
    answer_consistency: consistencySum / n,
    avg_cost_per_query: costs.reduce((a, b) => a + b, 0) / n,
    p95_latency_ms: percentile95(latencies),
  };

  const failures = [];
  if (metrics.groundedness < thresholds.groundedness_min) {
    failures.push({ metric: "groundedness", actual: metrics.groundedness, threshold: thresholds.groundedness_min });
  }
  if (metrics.citation_precision < thresholds.citation_precision_min) {
    failures.push({ metric: "citation_precision", actual: metrics.citation_precision, threshold: thresholds.citation_precision_min });
  }
  if (metrics.citation_recall < thresholds.citation_recall_min) {
    failures.push({ metric: "citation_recall", actual: metrics.citation_recall, threshold: thresholds.citation_recall_min });
  }
  if (metrics.answer_consistency < thresholds.answer_consistency_min) {
    failures.push({ metric: "answer_consistency", actual: metrics.answer_consistency, threshold: thresholds.answer_consistency_min });
  }
  if (metrics.avg_cost_per_query > thresholds.cost_per_query_max) {
    failures.push({ metric: "avg_cost_per_query", actual: metrics.avg_cost_per_query, threshold: thresholds.cost_per_query_max });
  }
  if (metrics.p95_latency_ms > thresholds.p95_latency_ms_max) {
    failures.push({ metric: "p95_latency_ms", actual: metrics.p95_latency_ms, threshold: thresholds.p95_latency_ms_max });
  }

  const report = {
    timestamp: new Date().toISOString(),
    query_count: n,
    metrics,
    thresholds,
    pass: failures.length === 0,
    failures: failures.length ? failures : undefined,

    // Extra, schema-tolerated metadata
    fixture_version: String(raw.version || "unknown"),
    fixture_path: opts.fixtures,
    cases: perCase,
  };

  fs.mkdirSync(path.dirname(opts.out), { recursive: true });
  fs.writeFileSync(opts.out, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  cliOut("DONE=rag_eval_written:%s", opts.out);
}

main().catch((e) => {
  cliErr("STOP=unhandled_error:%s", String(e));
  process.exit(1);
});

