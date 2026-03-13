#!/usr/bin/env bash
set -euo pipefail

# Governance Gate
# Validates governance compliance (gates, evidence, contracts, catalogue)

OUTPUT_FILE="${1:-test-results/ci/governance.json}"
mkdir -p "$(dirname "$OUTPUT_FILE")"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Run validation gates
GATES_PASSING=0
GATES_TOTAL=6

if bash scripts/refactor/validate_gates.sh &> /dev/null; then
    GATES_PASSING=6
fi

# Count evidence markers
EVIDENCE_COUNT=0
if [[ -f "docs/planning/refactoring/EVIDENCE_MARKERS.json" ]]; then
    EVIDENCE_COUNT=$(jq '.evidence_markers | length' docs/planning/refactoring/EVIDENCE_MARKERS.json 2>/dev/null || echo 0)
fi

# Check contract completeness
CONTRACT_COMPLETENESS=70
if [[ -f "docs/planning/refactoring/QUALITY_SCORECARDS.json" ]]; then
    # Try to extract completeness, default to 70 if not found
    EXTRACTED=$(jq -r '.overall_contract_completeness_pct // 70' docs/planning/refactoring/QUALITY_SCORECARDS.json 2>/dev/null || echo "70")
    if [[ -n "$EXTRACTED" ]] && [[ "$EXTRACTED" != "null" ]]; then
        CONTRACT_COMPLETENESS="$EXTRACTED"
    fi
fi

# Check catalogue freshness
CATALOGUE_DAYS_OLD=999
if [[ -f "docs/evidence/_generated/catalogue.json" ]]; then
    CATALOGUE_TS=$(jq -r '.meta.generated_at' docs/evidence/_generated/catalogue.json 2>/dev/null || echo "")
    if [[ -n "$CATALOGUE_TS" ]]; then
        CATALOGUE_EPOCH=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$CATALOGUE_TS" +%s 2>/dev/null || echo 0)
        NOW_EPOCH=$(date +%s)
        CATALOGUE_DAYS_OLD=$(awk "BEGIN {printf \"%.1f\", ($NOW_EPOCH - $CATALOGUE_EPOCH) / 86400}")
    fi
fi

# Determine status
STATUS="fail"
if [[ $GATES_PASSING -ge 6 ]] && \
   [[ $EVIDENCE_COUNT -ge 100 ]] && \
   [[ $(echo "$CONTRACT_COMPLETENESS >= 60" | bc -l) -eq 1 ]] && \
   [[ $(echo "$CATALOGUE_DAYS_OLD <= 7" | bc -l) -eq 1 ]]; then
    STATUS="pass"
fi

# Generate JSON report
cat > "$OUTPUT_FILE" << EOF
{
  "meta": {
    "generated_at": "$TIMESTAMP"
  },
  "status": "$STATUS",
  "checks": {
    "validation_gates": {
      "passing": $GATES_PASSING,
      "total": $GATES_TOTAL
    },
    "evidence_markers": {
      "count": $EVIDENCE_COUNT
    },
    "contract_completeness": {
      "pct": $CONTRACT_COMPLETENESS
    },
    "catalogue_freshness": {
      "days_old": $CATALOGUE_DAYS_OLD
    }
  },
  "thresholds": {
    "validation_gates_min": 6,
    "evidence_markers_min": 100,
    "contract_completeness_min": 60,
    "catalogue_freshness_max_days": 7
  }
}
EOF

echo "Governance report written to $OUTPUT_FILE"
echo "Status: $STATUS"
echo "Gates: $GATES_PASSING/$GATES_TOTAL"
echo "Evidence markers: $EVIDENCE_COUNT"
echo "Contract completeness: ${CONTRACT_COMPLETENESS}%"

if [[ "$STATUS" != "pass" ]]; then
    exit 1
fi

exit 0
