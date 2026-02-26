#!/usr/bin/env bash
set -euo pipefail

echo "PREFLIGHT=openclaw_validate_no_secrets"

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

for cmd in rg sed mktemp; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "STOP=missing_command name=${cmd}"
    exit 1
  fi
done

VM_HOST=""
if [ -f ".env" ]; then
  set +e
  set -a
  source .env >/dev/null 2>&1
  ENV_SOURCE_EXIT=$?
  set +a
  set -e
  if [ "$ENV_SOURCE_EXIT" -ne 0 ]; then
    echo "READY=env_source_failed_non_blocking"
  fi
  VM_HOST="${VM_SSH_HOST:-${ISA_VM_HOST:-}}"
fi

sanitize() {
  sed -E 's/(sk-[A-Za-z0-9_-]{12,})/***REDACTED***/g; s/(Bearer[[:space:]]+)[A-Za-z0-9._=-]{16,}/\1***REDACTED***/g; s@([?#&](token|auth|key|session)=)[^&# ]+@\1***REDACTED***@Ig; s@(/token/)[^/?# ]+@\1***REDACTED***@Ig'
}

assert_no_secret_pattern() {
  local file="$1"
  if rg -n '(sk-[A-Za-z0-9_-]{12,}|Bearer[[:space:]]+[A-Za-z0-9._=-]{16,}|OPENROUTER_API_KEY=\S+|GITHUB_PAT=\S+|JWT_SECRET=\S+|CRON_SECRET=\S+)' "$file" >/dev/null 2>&1; then
    echo "STOP=secret_pattern_detected output_file=${file}"
    exit 1
  fi
}

run_and_check() {
  local name="$1"
  shift
  local out_file
  out_file="$(mktemp /tmp/openclaw_no_secrets_${name}.XXXXXX.log)"
  set +e
  "$@" >"$out_file" 2>&1
  local cmd_exit=$?
  set -e
  sanitize <"$out_file"
  assert_no_secret_pattern "$out_file"
  rm -f "$out_file"
  if [ "$cmd_exit" -ne 0 ]; then
    echo "STOP=validation_command_failed name=${name} exit=${cmd_exit}"
    exit "$cmd_exit"
  fi
}

run_and_check_optional() {
  local name="$1"
  shift
  local out_file
  out_file="$(mktemp /tmp/openclaw_no_secrets_${name}.XXXXXX.log)"
  set +e
  "$@" >"$out_file" 2>&1
  local cmd_exit=$?
  set -e
  sanitize <"$out_file"
  assert_no_secret_pattern "$out_file"
  rm -f "$out_file"
  if [ "$cmd_exit" -ne 0 ]; then
    echo "READY=validation_command_failed_non_blocking name=${name} exit=${cmd_exit}"
  fi
}

run_runtime_probe() {
  local name="$1"
  shift
  if [ "${OPENCLAW_VALIDATE_REQUIRE_RUNTIME:-0}" = "1" ]; then
    run_and_check "$name" "$@"
  else
    run_and_check_optional "$name" "$@"
  fi
}

ACTION="policy_gates"
run_and_check policy_envelope bash scripts/gates/openclaw-policy-envelope.sh
run_and_check exec_policy bash scripts/gates/openclaw-exec-policy.sh
run_and_check skills_allowlist bash scripts/gates/openclaw-skills-allowlist.sh
run_and_check browser_policy bash scripts/gates/openclaw-browser-policy.sh

RUNTIME_TARGET="${OPENCLAW_VALIDATE_RUNTIME_TARGET:-auto}"
case "$RUNTIME_TARGET" in
  auto)
    if [ -n "$VM_HOST" ] && [ -x "scripts/vm-run.sh" ]; then
      RUNTIME_TARGET="vm"
    else
      RUNTIME_TARGET="host"
    fi
    ;;
  host|vm|both)
    ;;
  *)
    echo "STOP=invalid_runtime_target value=${RUNTIME_TARGET} expected=auto|host|vm|both"
    exit 1
    ;;
esac

if [ "$RUNTIME_TARGET" = "host" ] || [ "$RUNTIME_TARGET" = "both" ]; then
  ACTION="openclaw_status_host"
  if command -v openclaw >/dev/null 2>&1; then
    run_runtime_probe openclaw_status_host bash scripts/openclaw-status.sh
  elif [ "${OPENCLAW_VALIDATE_REQUIRE_RUNTIME:-0}" = "1" ]; then
    echo "STOP=openclaw_cli_not_present_host"
    exit 1
  else
    echo "READY=openclaw_cli_not_present_skipping_host_runtime_checks"
  fi
fi

if [ "$RUNTIME_TARGET" = "vm" ] || [ "$RUNTIME_TARGET" = "both" ]; then
  ACTION="openclaw_status_vm"
  if [ -z "$VM_HOST" ]; then
    if [ "${OPENCLAW_VALIDATE_REQUIRE_RUNTIME:-0}" = "1" ]; then
      echo "STOP=missing_vm_host_for_runtime_target"
      exit 1
    fi
    echo "READY=missing_vm_host_skipping_vm_runtime_checks"
  elif [ ! -x "scripts/vm-run.sh" ]; then
    if [ "${OPENCLAW_VALIDATE_REQUIRE_RUNTIME:-0}" = "1" ]; then
      echo "STOP=vm_run_script_missing"
      exit 1
    fi
    echo "READY=vm_run_script_missing_skipping_vm_runtime_checks"
  else
    run_runtime_probe openclaw_status_vm bash scripts/vm-run.sh scripts/openclaw-status.sh
  fi
fi

echo "DONE=openclaw_validate_no_secrets_complete"
