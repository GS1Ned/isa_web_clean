#!/usr/bin/env bash
set -euo pipefail

# Scoped no-console gate for ISA.
# Intentionally avoids scanning `.github/` because policy text may contain the forbidden substring.

cd "$(git rev-parse --show-toplevel)"

echo "READY=no_console_gate_start"

# Regex uses an escaped dot to match the literal '.' character.
pat='console\.'
scopes=(
  server
  client
  shared
  scripts
)

if command -v rg >/dev/null 2>&1; then
  if rg -n -S "$pat" "${scopes[@]}" >/dev/null; then
    rg -n -S "$pat" "${scopes[@]}" || true
    echo "STOP=forbidden_console_usage"
    exit 1
  fi
else
  if grep -RInE "$pat" "${scopes[@]}" >/dev/null; then
    grep -RInE "$pat" "${scopes[@]}" || true
    echo "STOP=forbidden_console_usage"
    exit 1
  fi
fi

echo "DONE=no_console_gate_ok"

