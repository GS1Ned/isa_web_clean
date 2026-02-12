#!/usr/bin/env bash
set -euo pipefail

# Observability Contract Check
# Verifies logging, tracing, and metrics infrastructure

OUTPUT_FILE="${1:-test-results/ci/observability.json}"
mkdir -p "$(dirname "$OUTPUT_FILE")"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Check for structured logging
STRUCTURED_LOGGING=false
LOGGING_COVERAGE=0

if [[ -f "server/_core/logger-wiring.ts" ]]; then
    STRUCTURED_LOGGING=true
    # Estimate coverage by counting logger imports
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

UNKNOWNS=()
if [[ "$TRACE_PROPAGATION" == "false" ]]; then
    UNKNOWNS+=("No distributed tracing implementation found")
fi
if [[ "$METRICS_COLLECTION" == "false" ]]; then
    UNKNOWNS+=("No metrics collection infrastructure found")
fi

STATUS="unknown"
if [[ ${#UNKNOWNS[@]} -eq 0 ]] && [[ $(echo "$LOGGING_COVERAGE >= 80" | bc -l) -eq 1 ]]; then
    STATUS="pass"
elif [[ ${#UNKNOWNS[@]} -gt 0 ]]; then
    STATUS="unknown"
else
    STATUS="fail"
fi

# Generate JSON report
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
  "unknowns": $(printf '%s\n' "${UNKNOWNS[@]}" | jq -R . | jq -s .)
}
EOF

echo "Observability report written to $OUTPUT_FILE"
echo "Status: $STATUS"
echo "Logging coverage: ${LOGGING_COVERAGE}%"

if [[ "$STATUS" != "pass" ]]; then
    exit 1
fi

exit 0
