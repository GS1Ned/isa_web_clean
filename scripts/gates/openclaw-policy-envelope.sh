#!/usr/bin/env bash
set -euo pipefail

echo "=== OpenClaw Policy Envelope Gate ==="

FILE="config/governance/openclaw_policy_envelope.json"
if [[ ! -f "$FILE" ]]; then
  echo "❌ FAIL: Missing $FILE"
  exit 1
fi

jq -e '
  .version | type == "string"
' "$FILE" >/dev/null

jq -e '
  .enforcement.mode == "fail_closed"
  and (.enforcement.allow_dev_bypass | type == "boolean")
' "$FILE" >/dev/null || {
  echo "❌ FAIL: enforcement policy must be fail_closed"
  exit 1
}

jq -e '
  .automation.strict_mode_production == true
  and (.automation.strict_mode_env_var | type == "string")
  and (.automation.kill_switch_env_var | type == "string")
  and (.automation.max_clock_skew_seconds | type == "number" and . > 0 and . <= 3600)
  and (.automation.require_idempotency_key_in_strict_mode == true)
  and (.automation.require_timestamp_in_strict_mode == true)
  and (.automation.require_signature_in_strict_mode == true)
' "$FILE" >/dev/null || {
  echo "❌ FAIL: automation policy fields invalid"
  exit 1
}

for artifact in $(jq -r '.artifacts[]' "$FILE"); do
  if [[ ! -f "$artifact" ]]; then
    echo "❌ FAIL: Referenced policy artifact missing: $artifact"
    exit 1
  fi
done

echo "✅ OpenClaw policy envelope gate PASSED"
