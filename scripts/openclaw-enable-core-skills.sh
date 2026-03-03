#!/usr/bin/env bash
set -euo pipefail

echo "PREFLIGHT=openclaw_enable_core_skills"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"
VM_SSH_WRAPPER="scripts/vm/isa_vm_ssh.sh"
[ -x "$VM_SSH_WRAPPER" ] || { echo "STOP=vm_ssh_wrapper_missing"; exit 1; }

CLAWHUB_VERSION="0.7.0"
MCPORTER_VERSION="0.7.3"
GEMINI_VERSION="0.31.0"

REMOTE_SCRIPT="$(cat <<'REMOTE'
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive
apt-get update >/dev/null
apt-get install -y gh ripgrep >/dev/null
npm install -g "clawhub@0.7.0" "mcporter@0.7.3" "@google/gemini-cli@0.31.0" >/dev/null
printf 'GH='; gh --version | head -n 1
printf 'RG='; rg --version | head -n 1
printf 'CLAWHUB='; clawhub --version | head -n 1 || true
printf 'MCPORTER='; mcporter --version | head -n 1 || true
printf 'GEMINI='; gemini --version | head -n 1 || true
printf '\nREADY_JSON\n'
openclaw skills check --json
REMOTE
)"

bash "$VM_SSH_WRAPPER" exec --command "$REMOTE_SCRIPT"
echo "DONE=openclaw_enable_core_skills_complete"
