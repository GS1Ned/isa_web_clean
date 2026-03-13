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

FORCE_LOCAL=0
TARGET_OVERRIDE=""
STATUS_ARGS=()

while [ "$#" -gt 0 ]; do
  case "$1" in
    --local)
      FORCE_LOCAL=1
      ;;
    --target)
      if [ "$#" -lt 2 ]; then
        echo "STOP=usage openclaw-status.sh [--target auto|host|vm] [--local] [openclaw status args]"
        exit 1
      fi
      TARGET_OVERRIDE="$2"
      shift
      ;;
    *)
      STATUS_ARGS+=("$1")
      ;;
  esac
  shift
done

if [ -f ".env" ]; then
  ACTION="load_env"
  set -a
  source .env >/dev/null 2>&1 || { echo "STOP=.env_not_sourceable"; exit 1; }
  set +a
fi

VM_HOST="${VM_SSH_HOST:-${ISA_VM_HOST:-}}"
RUNTIME_MODE="${OPENCLAW_RUNTIME_MODE:-vm_only}"
TARGET="${TARGET_OVERRIDE:-}"
if [ -z "$TARGET" ]; then
  case "$RUNTIME_MODE" in
    vm_only)
      if [ -n "$VM_HOST" ]; then
        TARGET="vm"
      else
        TARGET="host"
      fi
      ;;
    host_only)
      TARGET="host"
      ;;
    auto)
      if [ -n "$VM_HOST" ]; then
        TARGET="vm"
      else
        TARGET="host"
      fi
      ;;
    *)
      TARGET="vm"
      ;;
  esac
fi

case "$TARGET" in
  auto|host|vm)
    ;;
  *)
    echo "STOP=invalid_target value=${TARGET} expected=auto|host|vm"
    exit 1
    ;;
esac

if [ "$TARGET" = "auto" ]; then
  if [ -n "$VM_HOST" ]; then
    TARGET="vm"
  else
    TARGET="host"
  fi
fi

if [ "$FORCE_LOCAL" -eq 0 ] && [ "$TARGET" = "vm" ]; then
  if [ -z "$VM_HOST" ]; then
    echo "STOP=missing_vm_host_for_vm_target"
    exit 1
  fi
  if [ ! -x "scripts/vm-run.sh" ]; then
    echo "STOP=vm_run_script_missing"
    exit 1
  fi
  ACTION="delegate_vm_status"
  echo "READY=openclaw_status_delegate_vm host=${VM_HOST}"
  if [ "${#STATUS_ARGS[@]}" -gt 0 ]; then
    bash scripts/vm-run.sh scripts/openclaw-status.sh --local "${STATUS_ARGS[@]}"
  else
    bash scripts/vm-run.sh scripts/openclaw-status.sh --local
  fi
  echo "DONE=openclaw_status_complete"
  exit 0
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
if [ "${#STATUS_ARGS[@]}" -gt 0 ]; then
  RAW_STATUS_OUTPUT="$(openclaw status "${STATUS_ARGS[@]}" 2>&1 || true)"
else
  RAW_STATUS_OUTPUT="$(openclaw status 2>&1 || true)"
fi
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
