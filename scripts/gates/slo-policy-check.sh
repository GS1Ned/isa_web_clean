#!/usr/bin/env bash
set -euo pipefail

# SLO Policy Check
# Validates SLO catalog exists and error budget policy is defined

OUTPUT_FILE="${1:-test-results/ci/slo-policy-check.json}"
mkdir -p "$(dirname "$OUTPUT_FILE")"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Check if SLO catalog exists
SLO_DEFINED=0
SLO_REQUIRED=9  # From SLO_CATALOG.md

if [[ -f "docs/sre/SLO_CATALOG.md" ]]; then
    # Count SLO definitions (lines starting with ### UF- or ### P- or ### RQ-)
    SLO_DEFINED=$(grep -c "^### \(UF-\|P-\|RQ-\)" docs/sre/SLO_CATALOG.md || echo 0)
fi

# Check if error budget status file exists
ERROR_BUDGET_EXISTS=false
if [[ -f "docs/sre/_generated/error_budget_status.json" ]]; then
    ERROR_BUDGET_EXISTS=true
fi

# Determine policy state
POLICY_STATE="UNKNOWN"
if [[ "$ERROR_BUDGET_EXISTS" == "true" ]]; then
    POLICY_STATE=$(jq -r '.overall_state' docs/sre/_generated/error_budget_status.json 2>/dev/null || echo "UNKNOWN")
fi

# Determine status
STATUS="fail"
if [[ $SLO_DEFINED -ge $SLO_REQUIRED ]] && [[ "$ERROR_BUDGET_EXISTS" == "true" ]]; then
    STATUS="pass"
fi

# Generate JSON report
cat > "$OUTPUT_FILE" << EOF
{
  "meta": {
    "generated_at": "$TIMESTAMP"
  },
  "status": "$STATUS",
  "policy_state": "$POLICY_STATE",
  "slo_coverage": {
    "defined": $SLO_DEFINED,
    "required": $SLO_REQUIRED
  },
  "error_budget_file_exists": $ERROR_BUDGET_EXISTS
}
EOF

echo "SLO policy check written to $OUTPUT_FILE"
echo "Status: $STATUS"
echo "SLOs defined: $SLO_DEFINED/$SLO_REQUIRED"
echo "Error budget file exists: $ERROR_BUDGET_EXISTS"

if [[ "$STATUS" != "pass" ]]; then
    exit 1
fi

exit 0
