#!/usr/bin/env bash
set -euo pipefail

echo "PREFLIGHT=openclaw_config_apply"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "$SCRIPT_DIR/../AGENTS.md" ]; then
  REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
else
  REPO_ROOT="$(pwd)"
fi
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

if ! command -v python3 >/dev/null 2>&1; then
  echo "STOP=missing_command name=python3"
  exit 1
fi

FORCE_LOCAL=0
TARGET_OVERRIDE=""
CHECK_ONLY=0
TEMPLATE_PATH="config/openclaw/openclaw.isa-lab.template.json"
CONFIG_PATH_OVERRIDE=""

while [ "$#" -gt 0 ]; do
  case "$1" in
    --local)
      FORCE_LOCAL=1
      ;;
    --target)
      if [ "$#" -lt 2 ]; then
        echo "STOP=usage openclaw-config-apply.sh [--target auto|host|vm] [--local] [--check] [--template <path>] [--config <path>]"
        exit 1
      fi
      TARGET_OVERRIDE="$2"
      shift
      ;;
    --check)
      CHECK_ONLY=1
      ;;
    --template)
      if [ "$#" -lt 2 ]; then
        echo "STOP=usage openclaw-config-apply.sh [--target auto|host|vm] [--local] [--check] [--template <path>] [--config <path>]"
        exit 1
      fi
      TEMPLATE_PATH="$2"
      shift
      ;;
    --config)
      if [ "$#" -lt 2 ]; then
        echo "STOP=usage openclaw-config-apply.sh [--target auto|host|vm] [--local] [--check] [--template <path>] [--config <path>]"
        exit 1
      fi
      CONFIG_PATH_OVERRIDE="$2"
      shift
      ;;
    *)
      echo "STOP=usage openclaw-config-apply.sh [--target auto|host|vm] [--local] [--check] [--template <path>] [--config <path>]"
      exit 1
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

if [[ "$TEMPLATE_PATH" = /* ]]; then
  RESOLVED_TEMPLATE="$TEMPLATE_PATH"
else
  RESOLVED_TEMPLATE="$REPO_ROOT/$TEMPLATE_PATH"
fi
RESOLVED_CONFIG="${CONFIG_PATH_OVERRIDE:-${OPENCLAW_CONFIG_PATH:-${HOME}/.openclaw/openclaw.json}}"

if [ "$FORCE_LOCAL" -eq 0 ] && [ "$TARGET" = "vm" ]; then
  if [ -z "$VM_HOST" ]; then
    echo "STOP=missing_vm_host_for_vm_target"
    exit 1
  fi
  VM_SSH_WRAPPER="scripts/vm/isa_vm_ssh.sh"
  if [ ! -x "$VM_SSH_WRAPPER" ]; then
    echo "STOP=vm_ssh_wrapper_missing"
    exit 1
  fi
  if [ ! -f "$RESOLVED_TEMPLATE" ]; then
    echo "STOP=template_missing path=${RESOLVED_TEMPLATE}"
    exit 1
  fi
  ACTION="apply_repo_tracked_config_remote"
  echo "READY=openclaw_config_apply_delegate_vm host=${VM_HOST}"
  PYTHON_CODE="$(cat <<'PY'
import json
import sys
from copy import deepcopy
from pathlib import Path

config_path = Path(sys.argv[1]).expanduser()
check_only = sys.argv[2] == "1"
template_label = sys.argv[3]
template = json.load(sys.stdin)

existing = {}
if config_path.exists():
    with config_path.open("r", encoding="utf-8") as handle:
        existing = json.load(handle)

def merge(template_value, existing_value):
    if isinstance(template_value, dict):
        result = deepcopy(existing_value) if isinstance(existing_value, dict) else {}
        for key, value in template_value.items():
            result[key] = merge(value, result.get(key))
        return result
    return deepcopy(template_value)

merged = merge(template, existing)
if isinstance(merged, dict):
    merged.pop("_meta", None)
changed = merged != existing

if changed and not check_only:
    config_path.parent.mkdir(parents=True, exist_ok=True)
    with config_path.open("w", encoding="utf-8") as handle:
        json.dump(merged, handle, indent=2)
        handle.write("\n")

status = "drift" if changed else "aligned"
if check_only:
    print(
        f"READY=openclaw_config_apply_check status={status} template={template_label} target={config_path}"
    )
else:
    action = "updated" if changed else "unchanged"
    print(
        f"READY=openclaw_config_apply_{action} template={template_label} target={config_path}"
    )
    print("DONE=openclaw_config_apply_complete")
PY
)"
  bash "$VM_SSH_WRAPPER" exec \
    --stdin-file "$RESOLVED_TEMPLATE" \
    --command "set -euo pipefail; python3 -c $(printf '%q' "$PYTHON_CODE") $(printf '%q' "$RESOLVED_CONFIG") $(printf '%q' "$CHECK_ONLY") $(printf '%q' "$TEMPLATE_PATH")"
  echo "DONE=openclaw_config_apply_complete"
  exit 0
fi

ACTION="apply_repo_tracked_config"
python3 - "$RESOLVED_TEMPLATE" "$RESOLVED_CONFIG" "$CHECK_ONLY" <<'PY'
import json
import sys
from copy import deepcopy
from pathlib import Path

template_path = Path(sys.argv[1]).expanduser()
config_path = Path(sys.argv[2]).expanduser()
check_only = sys.argv[3] == "1"

if not template_path.exists():
    print(f"STOP=template_missing path={template_path}")
    raise SystemExit(1)

with template_path.open("r", encoding="utf-8") as handle:
    template = json.load(handle)

existing = {}
if config_path.exists():
    with config_path.open("r", encoding="utf-8") as handle:
        existing = json.load(handle)

def merge(template_value, existing_value):
    if isinstance(template_value, dict):
        result = deepcopy(existing_value) if isinstance(existing_value, dict) else {}
        for key, value in template_value.items():
            result[key] = merge(value, result.get(key))
        return result
    return deepcopy(template_value)

merged = merge(template, existing)
if isinstance(merged, dict):
    merged.pop("_meta", None)
changed = merged != existing

if changed and not check_only:
    config_path.parent.mkdir(parents=True, exist_ok=True)
    with config_path.open("w", encoding="utf-8") as handle:
        json.dump(merged, handle, indent=2)
        handle.write("\n")

status = "drift" if changed else "aligned"
if check_only:
    print(
        f"READY=openclaw_config_apply_check status={status} template={template_path} target={config_path}"
    )
else:
    action = "updated" if changed else "unchanged"
    print(
        f"READY=openclaw_config_apply_{action} template={template_path} target={config_path}"
    )
    print("DONE=openclaw_config_apply_complete")
PY
