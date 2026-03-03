#!/usr/bin/env bash
set -euo pipefail

echo "PREFLIGHT=openclaw_isa_dev_start"

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

SKIP_VALIDATE=0
NO_OPEN=0

while [ "$#" -gt 0 ]; do
  case "$1" in
    --skip-validate)
      SKIP_VALIDATE=1
      ;;
    --no-open)
      NO_OPEN=1
      ;;
    *)
      echo "STOP=usage openclaw-isa-dev-start.sh [--skip-validate] [--no-open]"
      exit 1
      ;;
  esac
  shift
done

if [ "$SKIP_VALIDATE" -eq 0 ]; then
  ACTION="validate_no_secrets"
  bash scripts/openclaw-validate-no-secrets.sh
else
  echo "READY=no_secrets_validation_skipped"
fi

ACTION="openclaw_ui"
if [ "$NO_OPEN" -eq 1 ]; then
  bash scripts/openclaw-ui.sh --no-open
else
  bash scripts/openclaw-ui.sh
fi

PROMPT_FILE="docs/agent/OPENCLAW_UI_DEV_PROMPT_STARTER.md"
QUICK_REFERENCE_FILE="docs/agent/OPENCLAW_UI_MODEL_QUICK_REFERENCE.md"
if [ "$NO_OPEN" -eq 0 ] && command -v open >/dev/null 2>&1; then
  ACTION="open_supporting_docs"
  open "$PROMPT_FILE"
  open "$QUICK_REFERENCE_FILE"
fi
echo "READY=isa_openclaw_dev_prompt_file path=${PROMPT_FILE}"
echo "READY=isa_openclaw_model_quick_reference_file path=${QUICK_REFERENCE_FILE}"
echo "DONE=openclaw_isa_dev_start_complete"
