#!/usr/bin/env bash
set -euo pipefail

# Scoped no-console gate for ISA.
# Intentionally avoids scanning `.github/` because policy text may contain the forbidden substring.
# Excludes: test files (*.test.ts), dev/eval/governance/gates CLI scripts
# which legitimately use console.log/error for CLI output.

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
  if rg -n -S "$pat" \
    --glob '!*.test.ts' \
    --glob '!scripts/dev/*' \
    --glob '!scripts/eval/*' \
    --glob '!scripts/governance/*' \
    --glob '!scripts/gates/*' \
    "${scopes[@]}" >/dev/null 2>&1; then
    rg -n -S "$pat" \
      --glob '!*.test.ts' \
      --glob '!scripts/dev/*' \
      --glob '!scripts/eval/*' \
      --glob '!scripts/governance/*' \
      --glob '!scripts/gates/*' \
      "${scopes[@]}" || true
    echo "STOP=forbidden_console_usage"
    exit 1
  fi
else
  # NOTE: grep --exclude-dir matches directory basenames, not full paths.
  if grep -RInE "$pat" \
    --exclude='*.test.ts' \
    --exclude-dir=dev \
    --exclude-dir=eval \
    --exclude-dir=governance \
    --exclude-dir=gates \
    "${scopes[@]}" >/dev/null 2>&1; then
    grep -RInE "$pat" \
      --exclude='*.test.ts' \
      --exclude-dir=dev \
      --exclude-dir=eval \
      --exclude-dir=governance \
      --exclude-dir=gates \
      "${scopes[@]}" || true
    echo "STOP=forbidden_console_usage"
    exit 1
  fi
fi

echo "DONE=no_console_gate_ok"
