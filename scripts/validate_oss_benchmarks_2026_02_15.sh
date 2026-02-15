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

# JSON parse checks (benchmarks + raw artifacts)
node - <<NODE >/dev/null
import fs from 'node:fs';

const files = [
  '${BASE}/benchmarks.json',
  '${BASE}/raw/github_search_candidates.json',
  '${BASE}/raw/top12_repo_metadata.json',
  '${BASE}/raw/top5_forensic_paths.json',
];

for (const f of files) {
  JSON.parse(fs.readFileSync(f, 'utf8'));
}
NODE

echo "READY=json_parse_ok"

# Validate last_verified_date everywhere
node - <<'NODE'
import fs from 'node:fs';

const DATE = '2026-02-15';
const p = 'docs/research/oss-benchmarks/2026-02-15/benchmarks.json';
const obj = JSON.parse(fs.readFileSync(p, 'utf8'));

const bad = [];
const missing = [];

function checkRecord(kind, rec, idx) {
  const where = `${kind}[${idx}]`;
  if (!rec || typeof rec !== 'object') {
    missing.push({ where, reason: 'not_an_object' });
    return;
  }
  if (!('last_verified_date' in rec)) {
    missing.push({ where, reason: 'missing_last_verified_date' });
    return;
  }
  if (rec.last_verified_date !== DATE) {
    bad.push({ where, value: rec.last_verified_date });
  }
}

const candidates = Array.isArray(obj.candidates) ? obj.candidates : null;
const patterns = Array.isArray(obj.patterns) ? obj.patterns : null;
const actionPlan = Array.isArray(obj.action_plan) ? obj.action_plan : null;

if (!candidates || !patterns || !actionPlan) {
  process.stderr.write('benchmarks.json missing required arrays: candidates/patterns/action_plan\n');
  process.exit(1);
}

for (let i = 0; i < candidates.length; i++) checkRecord('candidates', candidates[i], i);
for (let i = 0; i < patterns.length; i++) checkRecord('patterns', patterns[i], i);
for (let i = 0; i < actionPlan.length; i++) checkRecord('action_plan', actionPlan[i], i);

if (missing.length) {
  process.stderr.write(`missing last_verified_date fields: ${JSON.stringify(missing, null, 2)}\n`);
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
