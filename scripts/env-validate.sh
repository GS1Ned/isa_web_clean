#!/usr/bin/env bash
set -euo pipefail

echo "PREFLIGHT=env_validate"

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

for cmd in node pnpm ssh; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "STOP=missing_command name=${cmd}"
    exit 1
  fi
done

if [ ! -f ".env" ]; then
  echo "STOP=.env_missing"
  exit 1
fi

ACTION="load_env"
set -a
source .env >/dev/null 2>&1 || { echo "STOP=.env_not_sourceable"; exit 1; }
set +a

VM_HOST="${VM_SSH_HOST:-${ISA_VM_HOST:-}}"
VM_REPO="${VM_REPO_PATH:-}"
VM_ENV_FILE="${VM_ENV_PATH:-}"

if [ -z "$VM_HOST" ]; then
  echo "STOP=missing_vm_host"
  exit 1
fi
if [ -z "$VM_REPO" ] || [ -z "$VM_ENV_FILE" ]; then
  echo "STOP=missing_vm_paths"
  exit 1
fi

ACTION="check_env_js"
node scripts/check-env.js

ACTION="env_check_ts"
pnpm run env:check

ACTION="vm_connectivity_probe"
ssh -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new "$VM_HOST" \
  "set -euo pipefail; \
   if [ -d \"$VM_REPO\" ]; then echo READY=vm_repo_path_exists; else echo STOP=vm_repo_path_missing; exit 1; fi; \
   if [ -f \"$VM_ENV_FILE\" ]; then echo READY=vm_env_path_exists; else echo STOP=vm_env_path_missing; exit 1; fi; \
   if command -v openclaw >/dev/null 2>&1; then echo READY=openclaw_cli_present; else echo STOP=openclaw_cli_missing; exit 1; fi"

ACTION="vm_gateway_probe"
ssh -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new "$VM_HOST" \
  "set -euo pipefail; \
   cd \"$VM_REPO\"; \
   if [ -x \"scripts/openclaw-bootstrap.sh\" ]; then \
     bash scripts/openclaw-bootstrap.sh --check-only; \
   else \
     status=\"\$(openclaw gateway status 2>&1 || true)\"; \
     printf '%s\n' \"\$status\"; \
     if printf '%s' \"\$status\" | grep -Eiq 'not loaded|not installed|not running|inactive'; then \
       echo STOP=gateway_not_healthy; \
       exit 1; \
     fi; \
   fi"

ACTION="vm_dashboard_url_probe"
ssh -o BatchMode=yes -o ConnectTimeout=10 -o StrictHostKeyChecking=accept-new "$VM_HOST" \
  "set -euo pipefail; \
   cd \"$VM_REPO\"; \
   if [ -x \"scripts/openclaw-dashboard-url.sh\" ]; then \
     bash scripts/openclaw-dashboard-url.sh; \
   else \
     echo STOP=dashboard_url_script_missing; \
     exit 1; \
   fi" | sed -E 's@([?#&](token|auth|key|session)=)[^&# ]+@\1***REDACTED***@Ig; s@(/token/)[^/?# ]+@\1***REDACTED***@Ig'

echo "DONE=env_validate_complete"
