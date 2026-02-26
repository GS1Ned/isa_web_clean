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
COMMAND_MODE=0
INLINE_COMMAND=""

while [ "$#" -gt 0 ]; do
  case "$1" in
    --forward-agent)
      FORWARD_AGENT=1
      shift
      ;;
    --command)
      COMMAND_MODE=1
      shift
      if [ "$#" -lt 1 ]; then
        echo "STOP=usage vm-run.sh [--forward-agent] [--command '<cmd>' | <remote-script> [args...]]"
        exit 1
      fi
      INLINE_COMMAND="$1"
      shift
      break
      ;;
    *)
      break
      ;;
  esac
done

if [ "$COMMAND_MODE" -eq 0 ] && [ "$#" -lt 1 ]; then
  echo "STOP=usage vm-run.sh [--forward-agent] [--command '<cmd>' | <remote-script> [args...]]"
  exit 1
fi

SSH_ARGS=(-o BatchMode=yes -o StrictHostKeyChecking=accept-new)
if [ "$FORWARD_AGENT" -eq 1 ]; then
  SSH_ARGS=(-A "${SSH_ARGS[@]}")
fi

if [ "$COMMAND_MODE" -eq 1 ]; then
  if [ "$#" -gt 0 ]; then
    echo "STOP=usage vm-run.sh [--forward-agent] [--command '<cmd>' | <remote-script> [args...]]"
    exit 1
  fi
  ACTION="remote_exec_command"
  echo "READY=vm_run host=${VM_HOST} mode=command"
  REMOTE_CMD="set -euo pipefail; cd $(printf '%q' "$VM_REPO"); bash -lc $(printf '%q' "$INLINE_COMMAND")"
  ssh "${SSH_ARGS[@]}" "$VM_HOST" "$REMOTE_CMD"
  echo "DONE=vm_run_complete"
  exit 0
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
  REMOTE_TMP="/tmp/isa_vm_run_$(basename "$REMOTE_SCRIPT_PATH").$$.$RANDOM.sh"
  echo "READY=vm_run_stream_local_script script=$(basename "$REMOTE_SCRIPT")"
  ACTION="remote_stage_local_script"
  ssh "${SSH_ARGS[@]}" "$VM_HOST" \
    "set -euo pipefail; cat > $(printf '%q' "$REMOTE_TMP"); chmod 700 $(printf '%q' "$REMOTE_TMP")" \
    < "$LOCAL_SCRIPT_PATH"
  STAGED_CMD="set -euo pipefail; cd $(printf '%q' "$VM_REPO"); bash $(printf '%q' "$REMOTE_TMP")"
  for arg in "$@"; do
    STAGED_CMD+=" $(printf '%q' "$arg")"
  done
  ACTION="remote_exec_staged_script"
  set +e
  ssh "${SSH_ARGS[@]}" "$VM_HOST" "$STAGED_CMD"
  STAGED_EXIT="$?"
  set -e
  ACTION="remote_cleanup_staged_script"
  ssh "${SSH_ARGS[@]}" "$VM_HOST" "set -euo pipefail; rm -f $(printf '%q' "$REMOTE_TMP")" >/dev/null 2>&1 || true
  if [ "$STAGED_EXIT" -ne 0 ]; then
    echo "STOP=failed action=remote_exec_staged_script exit=${STAGED_EXIT}"
    exit "$STAGED_EXIT"
  fi
else
  echo "STOP=remote_script_missing"
  exit 1
fi
echo "DONE=vm_run_complete"
