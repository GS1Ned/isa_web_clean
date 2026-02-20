#!/usr/bin/env bash
set -euo pipefail

# Reliability Smoke Gate
# Deterministic pass/fail signal for baseline reliability readiness.

OUTPUT_FILE="${1:-test-results/ci/reliability.json}"
mkdir -p "$(dirname "$OUTPUT_FILE")"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

FAIL_REASONS=()
SLO_POLICY_PASS=false
NEWS_SCHEDULER_CONTRACT=false
HEARTBEAT_CONTRACT=false
HUB_ROUTER_CONTRACT=false

SLO_TMP="/tmp/reliability-slo-policy.json"
if [[ -x "scripts/gates/slo-policy-check.sh" ]]; then
  if bash scripts/gates/slo-policy-check.sh "$SLO_TMP" >/tmp/reliability-slo.out 2>/tmp/reliability-slo.err; then
    SLO_POLICY_PASS=true
  else
    FAIL_REASONS+=("slo-policy-check failed; see scripts/gates/slo-policy-check.sh output")
  fi
else
  FAIL_REASONS+=("scripts/gates/slo-policy-check.sh is missing or not executable")
fi

if [[ -f "server/cron-scheduler.ts" && -f "server/news-cron-scheduler.ts" ]]; then
  NEWS_SCHEDULER_CONTRACT=true
else
  FAIL_REASONS+=("news scheduler contract files are missing")
fi

if [[ -f "server/routers/__tests__/capability-heartbeat.test.ts" ]]; then
  HEARTBEAT_CONTRACT=true
else
  FAIL_REASONS+=("capability heartbeat test is missing")
fi

if [[ -f "server/routers/hub.ts" ]]; then
  HUB_ROUTER_CONTRACT=true
else
  FAIL_REASONS+=("NEWS_HUB router contract file server/routers/hub.ts is missing")
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
    "slo_policy_gate": {
      "pass": $SLO_POLICY_PASS
    },
    "news_scheduler_contract": {
      "pass": $NEWS_SCHEDULER_CONTRACT
    },
    "heartbeat_contract": {
      "pass": $HEARTBEAT_CONTRACT
    },
    "hub_router_contract": {
      "pass": $HUB_ROUTER_CONTRACT
    }
  },
  "thresholds": {
    "ask_isa_success_rate_min": 0.995,
    "news_pipeline_success_rate_min": 0.95,
    "news_freshness_hours_max": 24
  },
  "unknowns": [],
  "fail_reasons": $FAIL_REASONS_JSON
}
EOF

echo "Reliability report written to $OUTPUT_FILE"
echo "Status: $STATUS"

if [[ "$STATUS" != "pass" ]]; then
  exit 1
fi

exit 0
