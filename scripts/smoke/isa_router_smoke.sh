#!/usr/bin/env bash
set -euo pipefail

echo "PREFLIGHT=isa_router_smoke"
ROUTER_URL="${ISA_ROUTER_URL:-http://127.0.0.1:8090}"
HEALTH_URL="$ROUTER_URL/health"
SELECT_URL="$ROUTER_URL/select"
TIMEOUT="${ISA_ROUTER_SMOKE_TIMEOUT:-5}"

health_code="$(curl -sS -o /tmp/isa_router_health.$$ -m "$TIMEOUT" -w '%{http_code}' "$HEALTH_URL" || echo 000)"
if [ "$health_code" != "200" ]; then
  echo "STOP=router_health_failed code=$health_code"
  exit 1
fi

echo "READY=router_health_ok code=$health_code"

payload='{
  "models": [
    {"name":"openrouter/moonshotai/kimi-k2.5","provider":"openrouter","price_in":0.45,"price_out":2.20,"max_context":262144,"latency_ms":1400,"quality":0.9,"stability":0.9,"risk":0.1,"tool_support":true},
    {"name":"openrouter/deepseek/deepseek-v3.2","provider":"openrouter","price_in":0.25,"price_out":0.40,"max_context":163840,"latency_ms":1100,"quality":0.88,"stability":0.9,"risk":0.1,"tool_support":true}
  ],
  "request": {"task_class":"RAG_QA","est_input_tokens":800,"est_output_tokens":120,"required_context":16000,"required_tools":true}
}'

response="$(curl -sS -m "$TIMEOUT" -H 'Content-Type: application/json' -d "$payload" "$SELECT_URL")"
printf '%s' "$response" | jq -e '.selected and .provider and .effective and .rejected' >/dev/null

echo "READY=router_select_ok"
echo "DONE=isa_router_smoke_complete"
