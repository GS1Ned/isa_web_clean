#!/usr/bin/env bash
set -euo pipefail

# Performance Smoke Gate
# Deterministic pass/fail signal for baseline performance instrumentation readiness.

OUTPUT_FILE="${1:-test-results/ci/perf.json}"
mkdir -p "$(dirname "$OUTPUT_FILE")"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

FAIL_REASONS=()
PERF_MONITORING_CORE=false
PERF_TRACKING_ROUTER=false
PIPELINE_OBSERVABILITY_ROUTER=false
LATENCY_SIGNAL_PRESENT=false

if [[ -f "server/_core/performance-monitoring.ts" ]]; then
  PERF_MONITORING_CORE=true
else
  FAIL_REASONS+=("server/_core/performance-monitoring.ts is missing")
fi

if [[ -f "server/router-performance-tracking.ts" ]]; then
  PERF_TRACKING_ROUTER=true
else
  FAIL_REASONS+=("server/router-performance-tracking.ts is missing")
fi

if [[ -f "server/routers/pipeline-observability.ts" ]]; then
  PIPELINE_OBSERVABILITY_ROUTER=true
else
  FAIL_REASONS+=("server/routers/pipeline-observability.ts is missing")
fi

if command -v rg >/dev/null 2>&1; then
  if rg -q "latency|duration|performance" server/_core server/routers server/router-performance-tracking.ts; then
    LATENCY_SIGNAL_PRESENT=true
  else
    FAIL_REASONS+=("No latency/duration/performance signal found in performance-related runtime modules")
  fi
else
  FAIL_REASONS+=("rg not available for latency signal discovery")
fi

STATUS="pass"
if [[ ${#FAIL_REASONS[@]} -gt 0 ]]; then
  STATUS="fail"
fi

CAPABILITY_EVAL_BLOCK="null"
if [[ -f "test-results/ci/isa-capability-eval.json" ]]; then
  CAPABILITY_EVAL_BLOCK="$(
    jq -c '{
      run_id: .run_id,
      generated_at: .generated_at,
      status: .status,
      latency_p95_ms: (
        .capabilities
        | map({
            key: .capability,
            value: (
              (.metrics[] | select(.metric_id | test("latency\\.p95_ms$")) | .value) // 0
            )
          })
        | from_entries
      )
    }' test-results/ci/isa-capability-eval.json
  )"
fi

if [[ ${#FAIL_REASONS[@]} -gt 0 ]]; then
  FAIL_REASONS_JSON=$(printf '%s\n' "${FAIL_REASONS[@]}" | jq -R . | jq -s .)
else
  FAIL_REASONS_JSON="[]"
fi

cat > "$OUTPUT_FILE" << EOF
{
  "meta": {
    "generated_at": "$TIMESTAMP"
  },
  "status": "$STATUS",
  "checks": {
    "performance_monitoring_core": {
      "pass": $PERF_MONITORING_CORE
    },
    "performance_tracking_router": {
      "pass": $PERF_TRACKING_ROUTER
    },
    "pipeline_observability_router": {
      "pass": $PIPELINE_OBSERVABILITY_ROUTER
    },
    "latency_signal_present": {
      "pass": $LATENCY_SIGNAL_PRESENT
    }
  },
  "thresholds": {
    "catalog_p95_latency_ms_max": 500,
    "catalog_p99_latency_ms_max": 1000,
    "db_query_p95_ms_max": 500
  },
  "capability_eval": $CAPABILITY_EVAL_BLOCK,
  "unknowns": [],
  "fail_reasons": $FAIL_REASONS_JSON
}
EOF

echo "Performance report written to $OUTPUT_FILE"
echo "Status: $STATUS"

if [[ "$STATUS" != "pass" ]]; then
  exit 1
fi

exit 0
