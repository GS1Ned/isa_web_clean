#!/usr/bin/env bash
set -euo pipefail

echo "PREFLIGHT=env_discover"

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

for required_file in \
  .env.example \
  .env \
  scripts/check-env.js \
  scripts/env-check.ts \
  docs/governance/planning_artifacts/ENV_KEY_REGISTRY.json
 do
  if [ ! -f "$required_file" ]; then
    echo "STOP=missing_file path=${required_file}"
    exit 1
  fi
done

TMP_DIR="$(mktemp -d /tmp/isa_env_discover.XXXXXX)"
cleanup() {
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

ACTION="extract_env_example"
awk -F= '/^[A-Za-z_][A-Za-z0-9_]*=/{print $1}' .env.example | sort -u >"$TMP_DIR/env_example.keys"

ACTION="extract_env"
awk -F= '/^[A-Za-z_][A-Za-z0-9_]*=/{print $1}' .env | sort -u >"$TMP_DIR/env.keys"

ACTION="extract_check_env"
node - <<'NODE' >"$TMP_DIR/check_env_required.keys"
const fs = require('fs');
const src = fs.readFileSync('scripts/check-env.js', 'utf8');
const match = src.match(/const REQUIRED_KEYS\s*=\s*\[(.*?)\];/s);
if (!match) process.exit(1);
const keyRegex = /'([A-Z0-9_]+)'/g;
const out = new Set();
let m;
while ((m = keyRegex.exec(match[1])) !== null) out.add(m[1]);
for (const key of [...out].sort()) process.stdout.write(`${key}\n`);
NODE

ACTION="extract_env_check_groups"
node - <<'NODE' >"$TMP_DIR/env_check.keys"
const fs = require('fs');
const src = fs.readFileSync('scripts/env-check.ts', 'utf8');
const keyRegex = /name:\s*"([A-Z0-9_]+)"/g;
const out = new Set();
let m;
while ((m = keyRegex.exec(src)) !== null) out.add(m[1]);
for (const key of [...out].sort()) process.stdout.write(`${key}\n`);
NODE

ACTION="extract_registry"
node - <<'NODE' >"$TMP_DIR/registry.keys"
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('docs/governance/planning_artifacts/ENV_KEY_REGISTRY.json', 'utf8'));
const out = new Set((data.keys || []).map((k) => k.key_name).filter(Boolean));
for (const key of [...out].sort()) process.stdout.write(`${key}\n`);
NODE

echo "READY=env_discover_inputs_loaded"
echo "COUNT_env_example=$(wc -l < "$TMP_DIR/env_example.keys" | tr -d ' ')"
echo "COUNT_env=$(wc -l < "$TMP_DIR/env.keys" | tr -d ' ')"
echo "COUNT_check_env_required=$(wc -l < "$TMP_DIR/check_env_required.keys" | tr -d ' ')"
echo "COUNT_env_check=$(wc -l < "$TMP_DIR/env_check.keys" | tr -d ' ')"
echo "COUNT_registry=$(wc -l < "$TMP_DIR/registry.keys" | tr -d ' ')"

comm -23 "$TMP_DIR/env_example.keys" "$TMP_DIR/env.keys" >"$TMP_DIR/missing_in_env_from_example.keys"
comm -23 "$TMP_DIR/registry.keys" "$TMP_DIR/env_example.keys" >"$TMP_DIR/missing_in_example_from_registry.keys"
comm -23 "$TMP_DIR/check_env_required.keys" "$TMP_DIR/env.keys" >"$TMP_DIR/missing_required_in_env.keys"

echo "COUNT_missing_in_env_from_example=$(wc -l < "$TMP_DIR/missing_in_env_from_example.keys" | tr -d ' ')"
if [ -s "$TMP_DIR/missing_in_env_from_example.keys" ]; then
  echo "MISSING_IN_ENV_FROM_EXAMPLE="
  sed -n '1,120p' "$TMP_DIR/missing_in_env_from_example.keys"
fi

echo "COUNT_missing_in_example_from_registry=$(wc -l < "$TMP_DIR/missing_in_example_from_registry.keys" | tr -d ' ')"
if [ -s "$TMP_DIR/missing_in_example_from_registry.keys" ]; then
  echo "MISSING_IN_EXAMPLE_FROM_REGISTRY="
  sed -n '1,120p' "$TMP_DIR/missing_in_example_from_registry.keys"
fi

echo "COUNT_missing_required_in_env=$(wc -l < "$TMP_DIR/missing_required_in_env.keys" | tr -d ' ')"
if [ -s "$TMP_DIR/missing_required_in_env.keys" ]; then
  echo "MISSING_REQUIRED_IN_ENV="
  sed -n '1,120p' "$TMP_DIR/missing_required_in_env.keys"
fi

echo "DONE=env_discover_complete"
