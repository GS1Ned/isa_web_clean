#!/usr/bin/env bash
set -euo pipefail

echo "=== OpenClaw Browser Policy Gate ==="

FILE="config/openclaw/browser.policy.json"
if [[ ! -f "$FILE" ]]; then
  echo "❌ FAIL: Missing $FILE"
  exit 1
fi

jq -e '
  .version | type == "string"
' "$FILE" >/dev/null

jq -e '
  .mode == "fallback_only"
  and (.require_explicit_opt_in_env | type == "string")
  and (.allow_unsafe_launch_flags == false)
  and (.unsafe_launch_flags_env | type == "string")
  and (.prohibited_actions | type == "array" and length > 0)
' "$FILE" >/dev/null || {
  echo "❌ FAIL: browser policy must enforce fallback_only and deny unsafe flags"
  exit 1
}

echo "✅ OpenClaw browser policy gate PASSED"
