#!/usr/bin/env bash
set -euo pipefail

DATE="2026-02-15"
BASE="docs/research/oss-benchmarks/${DATE}"

cd "$(git rev-parse --show-toplevel)"

req_files=(
  "${BASE}/PLAN.md"
  "${BASE}/ISA_BASELINE.md"
  "${BASE}/CANDIDATES.md"
  "${BASE}/FINDINGS.md"
  "${BASE}/ANTI_PATTERNS.md"
  "${BASE}/ISA_ACTION_PLAN.md"
  "${BASE}/benchmarks.json"
  "${BASE}/raw/github_search_candidates.json"
  "${BASE}/raw/top12_repo_metadata.json"
  "${BASE}/raw/top5_forensic_paths.json"
)

missing=0
for f in "${req_files[@]}"; do
  if [[ ! -f "$f" ]]; then
    echo "STOP=missing_required_file:$f"
    missing=1
  fi
done
if [[ "$missing" -ne 0 ]]; then
  exit 1
fi

echo "READY=files_present"

# JSON parse check
node -e "import fs from 'fs'; JSON.parse(fs.readFileSync('${BASE}/benchmarks.json','utf8'));" >/dev/null

echo "READY=json_parse_ok"

# Validate last_verified_date everywhere
node - <<'NODE'
import fs from 'node:fs';

const DATE = '2026-02-15';
const p = 'docs/research/oss-benchmarks/2026-02-15/benchmarks.json';
const obj = JSON.parse(fs.readFileSync(p, 'utf8'));

const bad = [];
let seen = 0;

function walk(v) {
  if (!v) return;
  if (Array.isArray(v)) {
    for (const x of v) walk(x);
    return;
  }
  if (typeof v === 'object') {
    for (const [k, val] of Object.entries(v)) {
      if (k === 'last_verified_date') {
        seen++;
        if (val !== DATE) bad.push({ path: p, value: val });
      }
      walk(val);
    }
  }
}

walk(obj);

if (seen === 0) {
  process.stderr.write('No last_verified_date fields found\n');
  process.exit(1);
}

if (bad.length) {
  process.stderr.write(`last_verified_date mismatches: ${JSON.stringify(bad, null, 2)}\n`);
  process.exit(1);
}
NODE

echo "READY=last_verified_date_ok"

# No-console gate (scoped). Regex uses an escaped dot to match the literal '.' character.
pat='console\.'
scopes=(
  server
  client
  shared
  scripts
  "${BASE}"
)

if command -v rg >/dev/null 2>&1; then
  if rg -n -S "$pat" "${scopes[@]}" >/dev/null; then
    # Print matches for debugging
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

echo "DONE=oss_benchmarks_${DATE}_ok"
