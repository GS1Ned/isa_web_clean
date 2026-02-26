#!/usr/bin/env bash
set -euo pipefail

echo "=== OpenClaw Exec Policy Gate ==="

FILE="config/openclaw/exec-lane.policy.json"
if [[ ! -f "$FILE" ]]; then
  echo "❌ FAIL: Missing $FILE"
  exit 1
fi

jq -e '
  .version | type == "string"
' "$FILE" >/dev/null

jq -e '
  .default_decision == "deny"
  and (.require_manual_approval_env | type == "string")
  and (.audit_log_path | type == "string")
  and (.deny_patterns | type == "array" and length > 0)
  and (.allow_rules | type == "array" and length > 0)
' "$FILE" >/dev/null || {
  echo "❌ FAIL: exec policy missing required fields"
  exit 1
}

jq -e '
  all(.allow_rules[]; (.name|type=="string") and (.class|type=="string") and (.pattern|type=="string") and (.requires_approval|type=="boolean"))
' "$FILE" >/dev/null || {
  echo "❌ FAIL: malformed allow rule"
  exit 1
}

echo "✅ OpenClaw exec policy gate PASSED"
