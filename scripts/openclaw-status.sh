#!/usr/bin/env bash
set -euo pipefail

echo "PREFLIGHT=openclaw_status"

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

ACTION="gateway_status"
openclaw gateway status

ACTION="openclaw_status"
openclaw status "$@"

echo "DONE=openclaw_status_complete"
