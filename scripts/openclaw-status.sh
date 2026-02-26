#!/usr/bin/env bash
set -euo pipefail

echo "PREFLIGHT=openclaw_status"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

ACTION=""
on_err() {
  local exit_code="$?"
  if [ -n "$ACTION" ]; then
    echo "STOP=failed action=${ACTION} exit=${exit_code}"
  else
    echo "STOP=failed exit=${exit_code}"
  fi
  exit "$exit_code"
}
trap on_err ERR

if ! command -v openclaw >/dev/null 2>&1; then
  echo "STOP=openclaw_cli_missing"
  exit 1
fi

sanitize_output() {
  sed -E 's@([?#&](token|auth|key|session)=)[^&# ]+@\1***REDACTED***@Ig; s@(/token/)[^/?# ]+@\1***REDACTED***@Ig'
}

ACTION="gateway_status"
GATEWAY_STATUS_OUTPUT="$(openclaw gateway status 2>&1 || true)"
printf '%s\n' "$GATEWAY_STATUS_OUTPUT" | sanitize_output

if printf '%s' "$GATEWAY_STATUS_OUTPUT" | grep -Eiq 'not loaded|not installed|not running|inactive|start with:\s*openclaw gateway install'; then
  echo "STOP=gateway_not_healthy"
  exit 1
fi

ACTION="openclaw_status"
RAW_STATUS_OUTPUT="$(openclaw status "$@" 2>&1 || true)"
ORPHAN_WARNING_COUNT="$(printf '%s\n' "$RAW_STATUS_OUTPUT" | grep -Eci 'orphan transcript|orphaned transcript' || true)"
FILTERED_STATUS_OUTPUT="$(printf '%s\n' "$RAW_STATUS_OUTPUT" | grep -Evi 'orphan transcript|orphaned transcript' || true)"
printf '%s\n' "$FILTERED_STATUS_OUTPUT" | sanitize_output
if [ "$ORPHAN_WARNING_COUNT" -gt 0 ]; then
  echo "READY=orphan_transcript_warning_suppressed count=${ORPHAN_WARNING_COUNT}"
fi

if [ -x "scripts/openclaw-dashboard-url.sh" ]; then
  ACTION="dashboard_url_probe"
  bash scripts/openclaw-dashboard-url.sh
fi

echo "DONE=openclaw_status_complete"
