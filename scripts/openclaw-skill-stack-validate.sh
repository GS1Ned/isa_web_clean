#!/usr/bin/env bash
set -euo pipefail

echo "PREFLIGHT=openclaw_skill_stack_validate"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"
RUN_TS="$(date -u +%Y%m%dT%H%M%SZ)"
RUN_DIR=".openclaw/kernel/runs/$RUN_TS"
LOG_DIR="$RUN_DIR/logs"
ART_DIR="$RUN_DIR/artifacts"
VM_SSH_WRAPPER="scripts/vm/isa_vm_ssh.sh"
mkdir -p "$LOG_DIR" "$ART_DIR"

run_step() {
  local name="$1"
  shift
  local log="$LOG_DIR/${name}.log"
  local status="$ART_DIR/${name}.status"
  printf 'CMD=' > "$status"
  printf '%q ' "$@" >> "$status"
  printf '\n' >> "$status"
  if "$@" >"$log" 2>&1; then
    echo 'EXIT=0' >> "$status"
    echo "READY=$name"
  else
    rc=$?
    echo "EXIT=$rc" >> "$status"
    echo "STOP=$name exit=$rc log=$log"
    return "$rc"
  fi
}

run_step allowlist_gate bash scripts/gates/openclaw-skills-allowlist.sh
run_step vm_skills_check bash "$VM_SSH_WRAPPER" exec --command 'openclaw skills check --json'
run_step github_cli bash "$VM_SSH_WRAPPER" exec --command 'set -euo pipefail; gh repo view GS1Ned/isa_web_clean --json nameWithOwner'
run_step clawhub_search bash "$VM_SSH_WRAPPER" exec --command 'set -euo pipefail; clawhub search github --no-input | head -n 10'
run_step mcporter_help bash "$VM_SSH_WRAPPER" exec --command 'set -euo pipefail; mcporter --version'
run_step skill_route_github bash scripts/openclaw-skill-route.sh --task 'Review a GitHub pull request and inspect CI' --json
run_step skill_route_clawhub bash scripts/openclaw-skill-route.sh --task 'Search and update an OpenClaw skill from clawhub' --json

echo "DONE=openclaw_skill_stack_validate_complete run_dir=$RUN_DIR artifacts=$ART_DIR"
