#!/usr/bin/env bash
# Parity Eval Structure Gate
# Validates the evaluation infrastructure is intact for Postgres parity CI:
#   - Threshold definition file exists and parses
#   - Golden fixture registry is valid JSON with all 6 capabilities
#   - Eval adapter files are present for each capability
#   - At least one golden fixture file exists per registered capability
#
# This gate does NOT require a live database.  It confirms that the threshold
# assertion machinery will function once ISA_IMPLEMENTATION_ONLY_MODE is lifted.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

echo "READY=parity_eval_structure_gate_start"

FAIL=0

# ---------------------------------------------------------------------------
# 1. Threshold definition file
# ---------------------------------------------------------------------------
THRESHOLD_FILE="docs/quality/thresholds/isa-capability-thresholds.json"
if [[ ! -f "$THRESHOLD_FILE" ]]; then
  echo "FAIL: missing $THRESHOLD_FILE"
  FAIL=$((FAIL + 1))
elif ! python3 -c "import json,sys; json.load(open('$THRESHOLD_FILE'))" 2>/dev/null; then
  echo "FAIL: $THRESHOLD_FILE is not valid JSON"
  FAIL=$((FAIL + 1))
else
  ENFORCEMENT_MODE=$(python3 -c "import json; d=json.load(open('$THRESHOLD_FILE')); print(d.get('enforcement_mode',''))" 2>/dev/null)
  echo "OK: threshold file present (enforcement_mode=$ENFORCEMENT_MODE)"
fi

# ---------------------------------------------------------------------------
# 2. Golden fixture registry
# ---------------------------------------------------------------------------
REGISTRY="data/evaluation/golden/registry.json"
if [[ ! -f "$REGISTRY" ]]; then
  echo "FAIL: missing $REGISTRY"
  FAIL=$((FAIL + 1))
elif ! python3 -c "import json,sys; d=json.load(open('$REGISTRY')); caps=d.get('capabilities',[]); expected=6; actual=len(caps); sys.exit(0 if actual>=expected else 1)" 2>/dev/null; then
  echo "FAIL: $REGISTRY must register >=6 capabilities"
  FAIL=$((FAIL + 1))
else
  CAP_COUNT=$(python3 -c "import json; d=json.load(open('$REGISTRY')); print(len(d.get('capabilities',[])))" 2>/dev/null)
  echo "OK: registry present ($CAP_COUNT capabilities)"
fi

# ---------------------------------------------------------------------------
# 3. Eval adapter files
# ---------------------------------------------------------------------------
ADAPTERS_DIR="scripts/eval/adapters"
EXPECTED_ADAPTERS=(advisory ask-isa catalog esrs-mapping knowledge-base news-hub)
for adapter in "${EXPECTED_ADAPTERS[@]}"; do
  if [[ ! -f "$ADAPTERS_DIR/${adapter}.cjs" ]]; then
    echo "FAIL: missing adapter $ADAPTERS_DIR/${adapter}.cjs"
    FAIL=$((FAIL + 1))
  else
    echo "OK: adapter ${adapter}.cjs"
  fi
done

# ---------------------------------------------------------------------------
# 4. At least one golden fixture exists per registered capability
# ---------------------------------------------------------------------------
GOLDEN_DIR="data/evaluation/golden"
CAPABILITY_DIRS=(advisory ask_isa catalog esrs_mapping knowledge_base news_hub)
for cap_dir in "${CAPABILITY_DIRS[@]}"; do
  DIR="$GOLDEN_DIR/$cap_dir"
  if [[ ! -d "$DIR" ]]; then
    echo "FAIL: missing golden fixture dir $DIR"
    FAIL=$((FAIL + 1))
  else
    FILE_COUNT=$(find "$DIR" -maxdepth 1 -type f \( -name "*.json" -o -name "*.jsonl" \) | wc -l)
    if [[ "$FILE_COUNT" -eq 0 ]]; then
      echo "FAIL: no fixture files in $DIR"
      FAIL=$((FAIL + 1))
    else
      echo "OK: $cap_dir has $FILE_COUNT fixture file(s)"
    fi
  fi
done

# ---------------------------------------------------------------------------
# Result
# ---------------------------------------------------------------------------
if [[ "$FAIL" -gt 0 ]]; then
  echo "STOP=parity_eval_structure_gate_failed failures=$FAIL"
  exit 1
fi

echo "DONE=parity_eval_structure_gate_pass"
