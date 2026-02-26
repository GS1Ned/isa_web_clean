#!/usr/bin/env bash
set -euo pipefail

echo "PREFLIGHT=vm_run"

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

if [ -f ".env" ]; then
  ACTION="load_env"
  set -a
  source .env >/dev/null 2>&1 || { echo "STOP=.env_not_sourceable"; exit 1; }
  set +a
fi

VM_HOST="${VM_SSH_HOST:-${ISA_VM_HOST:-}}"
VM_REPO="${VM_REPO_PATH:-}"

if [ -z "$VM_HOST" ]; then
  echo "STOP=missing_vm_host"
  exit 1
fi
if [ -z "$VM_REPO" ]; then
  echo "STOP=missing_vm_repo_path"
  exit 1
fi

FORWARD_AGENT=0
if [ "${1:-}" = "--forward-agent" ]; then
  FORWARD_AGENT=1
  shift
fi

if [ "$#" -lt 1 ]; then
  echo "STOP=usage vm-run.sh [--forward-agent] <remote-script> [args...]"
  exit 1
fi

REMOTE_SCRIPT="$1"
shift

if [[ "$REMOTE_SCRIPT" = /* ]]; then
  REMOTE_SCRIPT_PATH="$REMOTE_SCRIPT"
  LOCAL_SCRIPT_PATH="$REMOTE_SCRIPT"
else
  REMOTE_SCRIPT_PATH="$VM_REPO/$REMOTE_SCRIPT"
  LOCAL_SCRIPT_PATH="$REPO_ROOT/$REMOTE_SCRIPT"
fi

SSH_ARGS=(-o BatchMode=yes -o StrictHostKeyChecking=accept-new)
if [ "$FORWARD_AGENT" -eq 1 ]; then
  SSH_ARGS=(-A "${SSH_ARGS[@]}")
fi

REMOTE_CMD="set -euo pipefail; cd $(printf '%q' "$VM_REPO");"
REMOTE_CMD+=" bash $(printf '%q' "$REMOTE_SCRIPT_PATH")"
for arg in "$@"; do
  REMOTE_CMD+=" $(printf '%q' "$arg")"
done

ACTION="remote_exec"
echo "READY=vm_run host=${VM_HOST} script=$(basename "$REMOTE_SCRIPT")"
CHECK_CMD="set -euo pipefail; cd $(printf '%q' "$VM_REPO"); [ -f $(printf '%q' "$REMOTE_SCRIPT_PATH") ]"
if ssh "${SSH_ARGS[@]}" "$VM_HOST" "$CHECK_CMD" >/dev/null 2>&1; then
  ssh "${SSH_ARGS[@]}" "$VM_HOST" "$REMOTE_CMD"
elif [ -f "$LOCAL_SCRIPT_PATH" ]; then
  STREAM_CMD="set -euo pipefail; cd $(printf '%q' "$VM_REPO"); bash -s"
  for arg in "$@"; do
    STREAM_CMD+=" $(printf '%q' "$arg")"
  done
  echo "READY=vm_run_stream_local_script script=$(basename "$REMOTE_SCRIPT")"
  ssh "${SSH_ARGS[@]}" "$VM_HOST" "$STREAM_CMD" < "$LOCAL_SCRIPT_PATH"
else
  echo "STOP=remote_script_missing"
  exit 1
fi
echo "DONE=vm_run_complete"
