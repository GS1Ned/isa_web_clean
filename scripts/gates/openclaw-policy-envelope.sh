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

jq -e '
  .runtime.primary_mode == "vm_only"
  and (.runtime.allow_host_local_gateway == false)
  and (.runtime.status_script_default_target == "vm")
  and (.runtime.ui_launcher_script | type == "string")
' "$FILE" >/dev/null || {
  echo "❌ FAIL: runtime policy must enforce vm_only mode"
  exit 1
}

jq -e '
  (.network.reverse_proxy_exposure | type == "boolean")
  and (.network.require_trusted_proxies_when_exposed == true)
  and (.network.trusted_proxies_script | type == "string")
' "$FILE" >/dev/null || {
  echo "❌ FAIL: network policy fields invalid"
  exit 1
}

for artifact in $(jq -r '.artifacts[]' "$FILE"); do
  if [[ ! -f "$artifact" ]]; then
    echo "❌ FAIL: Referenced policy artifact missing: $artifact"
    exit 1
  fi
done

RUNTIME_UI_SCRIPT="$(jq -r '.runtime.ui_launcher_script' "$FILE")"
if [[ ! -f "$RUNTIME_UI_SCRIPT" ]]; then
  echo "❌ FAIL: Referenced runtime UI launcher missing: $RUNTIME_UI_SCRIPT"
  exit 1
fi

TRUSTED_PROXIES_SCRIPT="$(jq -r '.network.trusted_proxies_script' "$FILE")"
if [[ ! -f "$TRUSTED_PROXIES_SCRIPT" ]]; then
  echo "❌ FAIL: Referenced trusted-proxies script missing: $TRUSTED_PROXIES_SCRIPT"
  exit 1
fi

echo "✅ OpenClaw policy envelope gate PASSED"
