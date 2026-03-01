#!/usr/bin/env bash
set -euo pipefail

echo "PREFLIGHT=env_sync_vm"

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

for cmd in ssh scp awk comm sort; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "STOP=missing_command name=${cmd}"
    exit 1
  fi
done

VM_SSH_WRAPPER="scripts/vm/isa_vm_ssh.sh"
if [ ! -x "$VM_SSH_WRAPPER" ]; then
  echo "STOP=vm_ssh_wrapper_missing"
  exit 1
fi

if [ ! -f ".env" ]; then
  echo "STOP=.env_missing"
  exit 1
fi

ACTION="load_env"
set -a
source .env >/dev/null 2>&1 || { echo "STOP=.env_not_sourceable"; exit 1; }
set +a

VM_HOST="${VM_SSH_HOST:-${ISA_VM_HOST:-}}"
VM_ENV_FILE="${VM_ENV_PATH:-}"

if [ -z "$VM_HOST" ]; then
  echo "STOP=missing_vm_host"
  exit 1
fi
if [ -z "$VM_ENV_FILE" ]; then
  echo "STOP=missing_vm_env_path"
  exit 1
fi

TMP_REMOTE="${VM_ENV_FILE}.tmp.$$"
TMP_DIR="$(mktemp -d /tmp/isa_env_sync_vm.XXXXXX)"
cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

ACTION="copy_env_to_vm"
scp -q -o BatchMode=yes -o StrictHostKeyChecking=accept-new .env "${VM_HOST}:${TMP_REMOTE}"

ACTION="install_env_on_vm"
bash "$VM_SSH_WRAPPER" exec --command \
  "set -euo pipefail; \
   install -m 600 \"$TMP_REMOTE\" \"$VM_ENV_FILE\"; \
   rm -f \"$TMP_REMOTE\"; \
   if [ -f \"$VM_ENV_FILE\" ]; then echo READY=vm_env_file_installed; else echo STOP=vm_env_file_missing_after_install; exit 1; fi"

ACTION="compare_key_names"
LC_ALL=C awk -F= '/^[A-Za-z_][A-Za-z0-9_]*=/{print $1}' .env | tr -d '\r' | sed 's/[[:space:]]*$//' | sed '/^$/d' | LC_ALL=C sort -u >"$TMP_DIR/local.keys"
bash "$VM_SSH_WRAPPER" exec --quiet --command \
  "LC_ALL=C awk -F= '/^[A-Za-z_][A-Za-z0-9_]*=/{print \$1}' \"$VM_ENV_FILE\" | tr -d '\\r' | sed 's/[[:space:]]*$//' | sed '/^$/d' | LC_ALL=C sort -u" >"$TMP_DIR/remote.keys"

LC_ALL=C comm -23 "$TMP_DIR/local.keys" "$TMP_DIR/remote.keys" >"$TMP_DIR/local_only.keys"
LC_ALL=C comm -13 "$TMP_DIR/local.keys" "$TMP_DIR/remote.keys" >"$TMP_DIR/remote_only.keys"

if [ -s "$TMP_DIR/local_only.keys" ] || [ -s "$TMP_DIR/remote_only.keys" ]; then
  echo "STOP=vm_env_key_name_mismatch"
  if [ -s "$TMP_DIR/local_only.keys" ]; then
    echo "LOCAL_ONLY_KEYS="
    sed -n '1,120p' "$TMP_DIR/local_only.keys"
  fi
  if [ -s "$TMP_DIR/remote_only.keys" ]; then
    echo "REMOTE_ONLY_KEYS="
    sed -n '1,120p' "$TMP_DIR/remote_only.keys"
  fi
  exit 1
fi

echo "READY=vm_env_key_names_match local_count=$(wc -l < "$TMP_DIR/local.keys" | tr -d ' ') remote_count=$(wc -l < "$TMP_DIR/remote.keys" | tr -d ' ')"
echo "DONE=env_sync_vm_complete"
