#!/usr/bin/env bash
set -euo pipefail

# Canonical Contract Drift Gate
# Ensures canonical machine-readable contracts are refreshed against current repo state.
# Commit matching allows HEAD or HEAD^ to support pre-commit generation semantics.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$REPO_ROOT"

echo "READY=canonical_contract_drift_start"

if ! command -v jq >/dev/null 2>&1; then
  echo "STOP=missing_jq"
  exit 1
fi

HEAD_FULL="$(git rev-parse HEAD)"
HEAD_SHORT="$(git rev-parse --short HEAD)"
PARENT_FULL="$(git rev-parse HEAD^ 2>/dev/null || true)"
PARENT_SHORT=""
if [[ -n "$PARENT_FULL" ]]; then
  PARENT_SHORT="$(git rev-parse --short HEAD^)"
fi

EXPECTED_BRANCH="${CANONICAL_EXPECTED_BRANCH:-}"
if [[ -n "${GITHUB_REF_NAME:-}" ]]; then
  EXPECTED_BRANCH="${GITHUB_REF_NAME#refs/heads/}"
fi
if [[ -z "$EXPECTED_BRANCH" ]]; then
  EXPECTED_BRANCH="main"
fi

CANONICAL_CONTRACT_FILES=(
  "docs/architecture/panel/_generated/CAPABILITY_MANIFEST.json"
  "docs/architecture/panel/_generated/CAPABILITY_GRAPH.json"
  "docs/architecture/panel/_generated/PRIMITIVE_DICTIONARY.json"
  "docs/architecture/panel/_generated/EVIDENCE_INDEX.json"
  "docs/architecture/panel/_generated/MINIMAL_VALIDATION_BUNDLE.json"
  "docs/planning/refactoring/EXECUTION_STATE.json"
)

EXPECTED_COMMITS="$HEAD_SHORT"
if [[ -n "$PARENT_SHORT" ]]; then
  EXPECTED_COMMITS="$HEAD_SHORT|$PARENT_SHORT"
fi

violations=0
details=()

for file in "${CANONICAL_CONTRACT_FILES[@]}"; do
  if [[ ! -f "$file" ]]; then
    details+=("$file :: missing file")
    violations=$((violations + 1))
    continue
  fi

  repo_branch="$(jq -r '.meta.repo_ref.branch // empty' "$file")"
  repo_commit="$(jq -r '.meta.repo_ref.commit // empty' "$file")"

  if [[ -z "$repo_branch" || -z "$repo_commit" ]]; then
    details+=("$file :: missing .meta.repo_ref.branch/.commit")
    violations=$((violations + 1))
    continue
  fi

  if [[ "$repo_branch" != "$EXPECTED_BRANCH" ]]; then
    details+=("$file :: branch mismatch (expected=$EXPECTED_BRANCH, found=$repo_branch)")
    violations=$((violations + 1))
  fi

  commit_ok=false
  if [[ "$repo_commit" == "$HEAD_FULL" || "$repo_commit" == "$HEAD_SHORT" ]]; then
    commit_ok=true
  fi
  if [[ -n "$PARENT_FULL" ]]; then
    if [[ "$repo_commit" == "$PARENT_FULL" || "$repo_commit" == "$PARENT_SHORT" ]]; then
      commit_ok=true
    fi
  fi

  if [[ "$commit_ok" == false ]]; then
    details+=("$file :: commit mismatch (expected one of $EXPECTED_COMMITS, found=$repo_commit)")
    violations=$((violations + 1))
  fi
done

if (( violations > 0 )); then
  echo "Canonical contract drift violations: $violations"
  printf '%s\n' "${details[@]}"
  echo "STOP=canonical_contract_drift_detected"
  exit 1
fi

echo "DONE=canonical_contract_drift_clean"
