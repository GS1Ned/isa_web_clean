#!/usr/bin/env bash
set -euo pipefail

echo "PREFLIGHT=openclaw_hp_fix_validate"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
RUN_DIR=".openclaw/kernel/runs/$TS"
LOG_DIR="$RUN_DIR/logs"
ART_DIR="$RUN_DIR/artifacts"
VM_SSH_WRAPPER="scripts/vm/isa_vm_ssh.sh"
mkdir -p "$LOG_DIR" "$ART_DIR"

if [ ! -x "$VM_SSH_WRAPPER" ]; then
  echo "STOP=vm_ssh_wrapper_missing"
  exit 1
fi

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

run_step gate_no_console bash scripts/gates/no-console-gate.sh
run_step gate_secrets bash scripts/gates/security-secrets-scan.sh
run_step gate_policy_envelope bash scripts/gates/openclaw-policy-envelope.sh
run_step gate_exec bash scripts/gates/openclaw-exec-policy.sh
run_step gate_browser bash scripts/gates/openclaw-browser-policy.sh
run_step gate_model_routing bash scripts/gates/openclaw-model-routing-policy.sh
run_step gate_skills_allowlist bash scripts/gates/openclaw-skills-allowlist.sh
if [ -x scripts/gates/doc-code-validator.sh ]; then
  run_step gate_doc_code bash scripts/gates/doc-code-validator.sh --canonical-only
fi
run_step runtime_start bash scripts/openclaw-isa-dev-start.sh --skip-validate --no-open
run_step runtime_status bash scripts/openclaw-status.sh --deep --target vm
run_step vm_status bash "$VM_SSH_WRAPPER" exec --command 'openclaw status --deep'
run_step vm_skills_check bash "$VM_SSH_WRAPPER" exec --command 'openclaw skills check --json'
run_step vm_memory_status bash "$VM_SSH_WRAPPER" exec --command 'openclaw memory status --deep --index --verbose'
run_step vm_plugins_doctor bash "$VM_SSH_WRAPPER" exec --command 'openclaw plugins doctor'
run_step router_smoke bash scripts/smoke/isa_router_smoke.sh
if [ -d isa_cost_optimizer/tests ]; then
  if [ -x isa_cost_optimizer/.venv/bin/python ]; then
    run_step optimizer_pytest isa_cost_optimizer/.venv/bin/python -m pytest isa_cost_optimizer/tests -q
  else
    run_step optimizer_pytest python3 -m pytest isa_cost_optimizer/tests -q
  fi
fi

echo "DONE=openclaw_hp_fix_validate_complete run_dir=$RUN_DIR artifacts=$ART_DIR"
