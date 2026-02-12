#!/usr/bin/env bash
set -euo pipefail

# Performance Smoke Test
# Measures basic performance metrics (currently placeholder)

OUTPUT_FILE="${1:-test-results/ci/perf.json}"
mkdir -p "$(dirname "$OUTPUT_FILE")"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

UNKNOWNS=(
    "No performance instrumentation in place"
    "p95/p99 latency not measured"
    "Database query performance not profiled"
)

# Generate JSON report with UNKNOWN status
cat > "$OUTPUT_FILE" << 'EOF'
{
  "meta": {
    "generated_at": "TIMESTAMP_PLACEHOLDER"
  },
  "status": "unknown",
  "metrics": {},
  "thresholds": {
    "catalog_p95_latency_ms_max": 500,
    "catalog_p99_latency_ms_max": 1000,
    "db_query_p95_ms_max": 500
  },
  "unknowns": [
    "No performance instrumentation in place",
    "p95/p99 latency not measured",
    "Database query performance not profiled"
  ]
}
EOF

# Replace timestamp
sed -i.bak "s/TIMESTAMP_PLACEHOLDER/$TIMESTAMP/" "$OUTPUT_FILE" && rm "$OUTPUT_FILE.bak"

echo "Performance report written to $OUTPUT_FILE"
echo "Status: unknown (instrumentation required)"

exit 1
