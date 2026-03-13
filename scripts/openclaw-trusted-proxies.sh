#!/usr/bin/env bash
set -euo pipefail

echo "PREFLIGHT=openclaw_trusted_proxies"

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

for cmd in jq sed awk; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "STOP=missing_command name=${cmd}"
    exit 1
  fi
done

FORCE_LOCAL=0
MODE="status"
PROXIES_CSV=""

while [ "$#" -gt 0 ]; do
  case "$1" in
    --local)
      FORCE_LOCAL=1
      ;;
    status|apply|clear)
      MODE="$1"
      ;;
    --proxies)
      if [ "$#" -lt 2 ]; then
        echo "STOP=usage openclaw-trusted-proxies.sh [status|apply|clear] [--proxies <csv>] [--local]"
        exit 1
      fi
      PROXIES_CSV="$2"
      shift
      ;;
    *)
      if [ "$MODE" = "apply" ] && [ -z "$PROXIES_CSV" ]; then
        PROXIES_CSV="$1"
      else
        echo "STOP=usage openclaw-trusted-proxies.sh [status|apply|clear] [--proxies <csv>] [--local]"
        exit 1
      fi
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
if [ "$FORCE_LOCAL" -eq 0 ] && [ "$RUNTIME_MODE" = "vm_only" ] && [ -n "$VM_HOST" ]; then
  if [ ! -x "scripts/vm-run.sh" ]; then
    echo "STOP=vm_run_script_missing"
    exit 1
  fi
  ACTION="delegate_vm_trusted_proxies"
  echo "READY=openclaw_trusted_proxies_delegate_vm host=${VM_HOST}"
  if [ "$MODE" = "apply" ]; then
    bash scripts/vm-run.sh scripts/openclaw-trusted-proxies.sh --local apply --proxies "$PROXIES_CSV"
  else
    bash scripts/vm-run.sh scripts/openclaw-trusted-proxies.sh --local "$MODE"
  fi
  echo "DONE=openclaw_trusted_proxies_complete"
  exit 0
fi

CONFIG_PATH="${OPENCLAW_CONFIG_PATH:-${HOME}/.openclaw/openclaw.json}"
if [ ! -f "$CONFIG_PATH" ]; then
  echo "STOP=openclaw_config_missing path=${CONFIG_PATH}"
  exit 1
fi

print_status() {
  jq -c '{bind:(.gateway.bind // null),port:(.gateway.port // null),trustedProxies:(.gateway.trustedProxies // [])}' "$CONFIG_PATH"
}

case "$MODE" in
  status)
    ACTION="status"
    print_status
    ;;
  clear)
    ACTION="clear"
    TMP_FILE="$(mktemp /tmp/openclaw_trusted_proxies.XXXXXX.json)"
    jq '.gateway.trustedProxies = []' "$CONFIG_PATH" > "$TMP_FILE"
    mv "$TMP_FILE" "$CONFIG_PATH"
    chmod 600 "$CONFIG_PATH" || true
    echo "READY=trusted_proxies_cleared"
    print_status
    ;;
  apply)
    ACTION="apply"
    if [ "${OPENCLAW_REVERSE_PROXY_EXPOSURE:-0}" != "1" ]; then
      echo "STOP=reverse_proxy_exposure_not_enabled"
      echo "HINT=set OPENCLAW_REVERSE_PROXY_EXPOSURE=1 before applying trusted proxies"
      exit 1
    fi
    if [ -z "$PROXIES_CSV" ]; then
      echo "STOP=trusted_proxies_missing"
      exit 1
    fi
    PROXIES_JSON="$(printf '%s' "$PROXIES_CSV" \
      | tr ',' '\n' \
      | sed -E 's/^[[:space:]]+|[[:space:]]+$//g' \
      | awk 'NF>0' \
      | jq -Rsc 'split("\n") | map(select(length > 0))')"
    if [ "$PROXIES_JSON" = "[]" ]; then
      echo "STOP=trusted_proxies_empty_after_parse"
      exit 1
    fi
    if ! printf '%s' "$PROXIES_JSON" | jq -e 'all(.[]; test("^[0-9A-Fa-f:.]+(/[0-9]{1,3})?$"))' >/dev/null; then
      echo "STOP=trusted_proxies_invalid_format"
      exit 1
    fi
    TMP_FILE="$(mktemp /tmp/openclaw_trusted_proxies.XXXXXX.json)"
    jq --argjson proxies "$PROXIES_JSON" '.gateway.trustedProxies = $proxies' "$CONFIG_PATH" > "$TMP_FILE"
    mv "$TMP_FILE" "$CONFIG_PATH"
    chmod 600 "$CONFIG_PATH" || true
    echo "READY=trusted_proxies_applied"
    print_status
    ;;
  *)
    echo "STOP=usage openclaw-trusted-proxies.sh [status|apply|clear] [--proxies <csv>] [--local]"
    exit 1
    ;;
esac

if command -v openclaw >/dev/null 2>&1; then
  ACTION="status_deep_probe"
  openclaw status --deep | sed -E 's@([?#&](token|auth|key|session)=)[^&# ]+@\1***REDACTED***@Ig; s@(/token/)[^/?# ]+@\1***REDACTED***@Ig' | sed -n '1,120p' || true
fi

echo "DONE=openclaw_trusted_proxies_complete"
