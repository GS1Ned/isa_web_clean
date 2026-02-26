#!/usr/bin/env bash
set -euo pipefail

echo "PREFLIGHT=openclaw_doctor"

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
FORWARD_ARGS=()

while [ "$#" -gt 0 ]; do
  case "$1" in
    --local)
      FORCE_LOCAL=1
      ;;
    --target)
      if [ "$#" -lt 2 ]; then
        echo "STOP=usage openclaw-doctor.sh [--target auto|host|vm] [--local] [doctor args]"
        exit 1
      fi
      TARGET_OVERRIDE="$2"
      shift
      ;;
    *)
      FORWARD_ARGS+=("$1")
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
  ACTION="delegate_vm_doctor"
  echo "READY=openclaw_doctor_delegate_vm host=${VM_HOST}"
  if [ "${#FORWARD_ARGS[@]}" -gt 0 ]; then
    bash scripts/vm-run.sh scripts/openclaw-doctor.sh --local "${FORWARD_ARGS[@]}"
  else
    bash scripts/vm-run.sh scripts/openclaw-doctor.sh --local
  fi
  echo "DONE=openclaw_doctor_complete"
  exit 0
fi

DO_REPAIR=0
DO_FORCE=0
EXTRA_ARGS=()

for arg in "${FORWARD_ARGS[@]}"; do
  case "$arg" in
    --repair)
      DO_REPAIR=1
      ;;
    --force)
      DO_FORCE=1
      DO_REPAIR=1
      ;;
    *)
      EXTRA_ARGS+=("$arg")
      ;;
  esac
done

CMD=(openclaw doctor --non-interactive)
if [ "$DO_REPAIR" -eq 1 ]; then
  CMD+=(--repair --yes)
fi
if [ "$DO_FORCE" -eq 1 ]; then
  CMD+=(--force)
fi

ACTION="openclaw_doctor"
if [ "${#EXTRA_ARGS[@]}" -gt 0 ]; then
  "${CMD[@]}" "${EXTRA_ARGS[@]}"
else
  "${CMD[@]}"
fi

echo "DONE=openclaw_doctor_complete"
