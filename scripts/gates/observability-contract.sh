#!/usr/bin/env bash
set -euo pipefail

# Observability Contract Check
# Deterministic pass/fail verification for logging, tracing, and metrics infrastructure

OUTPUT_FILE="${1:-test-results/ci/observability.json}"
mkdir -p "$(dirname "$OUTPUT_FILE")"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

STRUCTURED_LOGGING=false
LOGGING_COVERAGE=0

if [[ -f "server/_core/logger-wiring.ts" ]]; then
    STRUCTURED_LOGGING=true
    TOTAL_TS_FILES=$(find server -name "*.ts" -not -name "*.test.ts" | wc -l | tr -d ' ')
    FILES_WITH_LOGGER=$(grep -r "serverLogger" server --include="*.ts" --exclude="*.test.ts" | cut -d: -f1 | sort -u | wc -l | tr -d ' ')
    if [[ $TOTAL_TS_FILES -gt 0 ]]; then
        LOGGING_COVERAGE=$(awk "BEGIN {printf \"%.1f\", ($FILES_WITH_LOGGER / $TOTAL_TS_FILES) * 100}")
    fi
fi

# Check for trace propagation
TRACE_PROPAGATION=false
if grep -r "trace.*id\|traceId" server --include="*.ts" &> /dev/null; then
    TRACE_PROPAGATION=true
fi

# Check for metrics collection
METRICS_COLLECTION=false
if grep -r "metrics\|prometheus\|statsd" server --include="*.ts" &> /dev/null; then
    METRICS_COLLECTION=true
fi

FAIL_REASONS=()
if [[ "$STRUCTURED_LOGGING" == "false" ]]; then
    FAIL_REASONS+=("Structured logging wiring not found (server/_core/logger-wiring.ts missing)")
fi
if [[ "$TRACE_PROPAGATION" == "false" ]]; then
    FAIL_REASONS+=("No distributed tracing signal found in server TypeScript sources")
fi
if [[ "$METRICS_COLLECTION" == "false" ]]; then
    FAIL_REASONS+=("No metrics collection signal found in server TypeScript sources")
fi

if ! command -v awk &> /dev/null; then
    FAIL_REASONS+=("awk not available for numeric threshold comparison")
elif [[ "$STRUCTURED_LOGGING" == "true" ]]; then
    if [[ $(awk "BEGIN {print ($LOGGING_COVERAGE >= 80) ? 1 : 0}") -ne 1 ]]; then
        FAIL_REASONS+=("Structured logging coverage below threshold (${LOGGING_COVERAGE}% < 80%)")
    fi
fi

STATUS="pass"
if [[ ${#FAIL_REASONS[@]} -gt 0 ]]; then
    STATUS="fail"
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
    "structured_logging": {
      "implemented": $STRUCTURED_LOGGING,
      "coverage_pct": $LOGGING_COVERAGE
    },
    "trace_propagation": {
      "implemented": $TRACE_PROPAGATION
    },
    "metrics_collection": {
      "implemented": $METRICS_COLLECTION
    }
  },
  "thresholds": {
    "structured_logging_coverage_min": 80
  },
  "unknowns": [],
  "fail_reasons": $FAIL_REASONS_JSON
}
EOF

echo "Observability report written to $OUTPUT_FILE"
echo "Status: $STATUS"
echo "Logging coverage: ${LOGGING_COVERAGE}%"

if [[ "$STATUS" != "pass" ]]; then
    exit 1
fi

exit 0
