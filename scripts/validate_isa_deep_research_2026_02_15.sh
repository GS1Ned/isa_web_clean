#!/usr/bin/env bash
set -euo pipefail

DATE="2026-02-15"
BASE="docs/research/isa-deep-research/${DATE}"
RAW="${BASE}/raw"

req_files=(
  "${BASE}/PLAN.md"
  "${BASE}/ISA_BASELINE.md"
  "${BASE}/CANDIDATES.md"
  "${BASE}/FINDINGS.md"
  "${BASE}/ANTI_PATTERNS.md"
  "${BASE}/ARCHITECTURE_BENCHMARK.md"
  "${BASE}/DOCS_AND_STRUCTURE_GOLD.md"
  "${BASE}/ISA_ACTION_PLAN.md"
  "${BASE}/benchmarks.json"
  "${RAW}/github_discovery_queries.json"
  "${RAW}/candidate_pool.json"
  "${RAW}/top12_repo_metadata.json"
  "${RAW}/top5_forensic_paths.json"
  "${RAW}/sentiment_sources.json"
)

for f in "${req_files[@]}"; do
  if [ ! -f "$f" ]; then
    echo "STOP=missing_required_file:$f"
    exit 1
  fi
done

echo "READY=required_files_present"

# JSON parse check
python3 -m json.tool "${BASE}/benchmarks.json" >/dev/null

echo "READY=benchmarks_json_parses"

# Ensure all last_verified_date fields in benchmarks.json match DATE
python3 - <<'PY'
import json
from pathlib import Path

DATE = "2026-02-15"
p = Path("docs/research/isa-deep-research/2026-02-15/benchmarks.json")
obj = json.loads(p.read_text(encoding="utf-8"))

bad = []
seen = 0

def walk(v, path="$"):
  global seen
  if isinstance(v, dict):
    for k, val in v.items():
      p2 = f"{path}.{k}"
      if k == "last_verified_date":
        seen += 1
        if val != DATE:
          bad.append({"path": p2, "value": val})
      walk(val, p2)
  elif isinstance(v, list):
    for i, val in enumerate(v):
      walk(val, f"{path}[{i}]")

walk(obj)

if seen == 0:
  raise SystemExit("No last_verified_date fields found")

if bad:
  raise SystemExit("last_verified_date mismatches: " + json.dumps(bad, indent=2))

print("READY=last_verified_date_ok")
PY

# Zero-tolerance forbidden output API usage gate.
# Regex uses an escaped dot to match the literal '.' character.
pat='console\.'

if command -v rg >/dev/null 2>&1; then
  if rg -n -S "$pat" . >/dev/null; then
    rg -n -S "$pat" . || true
    echo "STOP=forbidden_output_api_usage"
    exit 1
  fi
else
  if grep -RInE "$pat" . >/dev/null; then
    grep -RInE "$pat" . || true
    echo "STOP=forbidden_output_api_usage"
    exit 1
  fi
fi

echo "DONE=isa_deep_research_${DATE}_ok"
