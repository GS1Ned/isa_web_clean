#!/usr/bin/env bash
set -euo pipefail

OUTPUT_FILE="${1:-test-results/ci/knowledge-verification-posture.json}"
mkdir -p "$(dirname "$OUTPUT_FILE")"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

FAIL_REASONS=()

CITATION_VALIDATION_CONTRACT=false
CITATION_ADMIN_SUMMARY_SURFACE=false
ASK_ISA_SURFACE=false
KNOWLEDGE_BASE_CONTRACT=false
ASK_ISA_CONTRACT=false

if rg -n "verificationReason|verificationAgeDays|getKnowledgeVerificationStatus|buildKnowledgeEvidenceKey" server/citation-validation.ts >/dev/null 2>&1; then
  CITATION_VALIDATION_CONTRACT=true
else
  FAIL_REASONS+=("server/citation-validation.ts is missing canonical verification posture fields")
fi

if rg -n "getVerificationSummary|freshnessBuckets|oldestVerificationAgeDays|medianVerificationAgeDays" server/routers/citation-admin.ts >/dev/null 2>&1; then
  CITATION_ADMIN_SUMMARY_SURFACE=true
else
  FAIL_REASONS+=("server/routers/citation-admin.ts is missing verification posture summary fields")
fi

if rg -n "verificationReason|verificationAgeDays" server/routers/ask-isa.ts server/routers/ask-isa-v2.ts client/src/pages/AskISA.tsx >/dev/null 2>&1; then
  ASK_ISA_SURFACE=true
else
  FAIL_REASONS+=("ASK_ISA surfaces do not expose verification posture fields consistently")
fi

if rg -n "verificationReason|verificationAgeDays|freshnessBuckets|older than 90 days" docs/spec/KNOWLEDGE_BASE/RUNTIME_CONTRACT.md >/dev/null 2>&1; then
  KNOWLEDGE_BASE_CONTRACT=true
else
  FAIL_REASONS+=("docs/spec/KNOWLEDGE_BASE/RUNTIME_CONTRACT.md is missing verification posture contract language")
fi

if rg -n "verificationReason|verificationAgeDays" docs/spec/ASK_ISA/RUNTIME_CONTRACT.md >/dev/null 2>&1; then
  ASK_ISA_CONTRACT=true
else
  FAIL_REASONS+=("docs/spec/ASK_ISA/RUNTIME_CONTRACT.md is missing verification posture contract language")
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

cat > "$OUTPUT_FILE" <<EOF
{
  "meta": {
    "generated_at": "$TIMESTAMP"
  },
  "status": "$STATUS",
  "checks": {
    "citation_validation_contract": { "pass": $CITATION_VALIDATION_CONTRACT },
    "citation_admin_summary_surface": { "pass": $CITATION_ADMIN_SUMMARY_SURFACE },
    "ask_isa_surface": { "pass": $ASK_ISA_SURFACE },
    "knowledge_base_contract": { "pass": $KNOWLEDGE_BASE_CONTRACT },
    "ask_isa_contract": { "pass": $ASK_ISA_CONTRACT }
  },
  "summary": {
    "verification_reasons_exposed": $CITATION_VALIDATION_CONTRACT,
    "verification_age_exposed": $ASK_ISA_SURFACE,
    "freshness_buckets_exposed": $CITATION_ADMIN_SUMMARY_SURFACE,
    "aggregate_age_stats_exposed": $CITATION_ADMIN_SUMMARY_SURFACE
  },
  "unknowns": [],
  "fail_reasons": $FAIL_REASONS_JSON
}
EOF

echo "Knowledge verification posture written to $OUTPUT_FILE"
echo "Status: $STATUS"

if [[ "$STATUS" != "pass" ]]; then
  exit 1
fi

exit 0
