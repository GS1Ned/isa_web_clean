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

DO_REPAIR=0
DO_FORCE=0
EXTRA_ARGS=()

while [ "$#" -gt 0 ]; do
  case "$1" in
    --repair)
      DO_REPAIR=1
      ;;
    --force)
      DO_FORCE=1
      DO_REPAIR=1
      ;;
    *)
      EXTRA_ARGS+=("$1")
      ;;
  esac
  shift
done

CMD=(openclaw doctor --non-interactive)
if [ "$DO_REPAIR" -eq 1 ]; then
  CMD+=(--repair --yes)
fi
if [ "$DO_FORCE" -eq 1 ]; then
  CMD+=(--force)
fi

ACTION="openclaw_doctor"
"${CMD[@]}" "${EXTRA_ARGS[@]}"

echo "DONE=openclaw_doctor_complete"
