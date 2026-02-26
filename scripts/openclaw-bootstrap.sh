#!/usr/bin/env bash
set -euo pipefail

echo "PREFLIGHT=openclaw_bootstrap"

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

CHECK_ONLY=0
if [ "${1:-}" = "--check-only" ]; then
  CHECK_ONLY=1
  shift
fi
if [ "$#" -gt 0 ]; then
  echo "STOP=usage openclaw-bootstrap.sh [--check-only]"
  exit 1
fi

is_gateway_healthy() {
  local status_output="$1"
  if printf '%s' "$status_output" | grep -Eiq 'not loaded|not installed|not running|inactive|start with:\s*openclaw gateway install'; then
    return 1
  fi
  return 0
}

sanitize_status() {
  sed -E 's@([?#&](token|auth|key|session)=)[^&# ]+@\1***REDACTED***@Ig; s@(/token/)[^/?# ]+@\1***REDACTED***@Ig'
}

ACTION="gateway_status_initial"
INITIAL_STATUS="$(openclaw gateway status 2>&1 || true)"
printf '%s\n' "$INITIAL_STATUS" | sanitize_status

if ! is_gateway_healthy "$INITIAL_STATUS"; then
  if [ "$CHECK_ONLY" -eq 1 ]; then
    echo "STOP=gateway_not_healthy"
    exit 1
  fi

  ACTION="gateway_install"
  openclaw gateway install >/dev/null 2>&1 || true

  ACTION="gateway_start"
  openclaw gateway >/dev/null 2>&1 || true
fi

if [ "${OPENCLAW_REPAIR_ORPHAN_TRANSCRIPTS:-1}" = "1" ] && [ "$CHECK_ONLY" -eq 0 ]; then
  ACTION="orphan_transcript_cleanup"
  if openclaw sessions cleanup --help >/dev/null 2>&1; then
    openclaw sessions cleanup --enforce >/dev/null 2>&1 || true
    echo "READY=orphan_transcript_cleanup_attempted method=sessions_cleanup"
  elif openclaw doctor --help >/dev/null 2>&1; then
    openclaw doctor --non-interactive --repair --yes >/dev/null 2>&1 || true
    echo "READY=orphan_transcript_cleanup_attempted method=doctor_repair"
  else
    echo "READY=orphan_transcript_cleanup_unavailable"
  fi
fi

ACTION="gateway_status_final"
FINAL_STATUS="$(openclaw gateway status 2>&1 || true)"
printf '%s\n' "$FINAL_STATUS" | sanitize_status

if ! is_gateway_healthy "$FINAL_STATUS"; then
  echo "STOP=gateway_not_healthy"
  exit 1
fi

if [ -x "scripts/openclaw-dashboard-url.sh" ]; then
  ACTION="dashboard_url_probe"
  bash scripts/openclaw-dashboard-url.sh >/dev/null 2>&1 || true
fi

echo "READY=openclaw_gateway_healthy"
echo "DONE=openclaw_bootstrap_complete"
