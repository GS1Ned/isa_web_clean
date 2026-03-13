#!/usr/bin/env bash
set -euo pipefail

# Canonical Contract Drift Gate
# Ensures canonical machine-readable contracts are refreshed against current repo state.
# Commit matching allows HEAD/parents to support pre-commit generation semantics
# and pull_request merge refs.

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

EXPECTED_BRANCH="${CANONICAL_EXPECTED_BRANCH:-}"
if [[ -n "${GITHUB_BASE_REF:-}" ]]; then
  EXPECTED_BRANCH="${GITHUB_BASE_REF#refs/heads/}"
elif [[ -n "${GITHUB_REF_NAME:-}" ]]; then
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

expected_commit_values=()

add_expected_commit () {
  local ref="$1"
  local full=""
  local short=""
  full="$(git rev-parse "$ref" 2>/dev/null || true)"
  if [[ -z "$full" ]]; then
    return
  fi
  short="$(git rev-parse --short "$ref" 2>/dev/null || true)"
  expected_commit_values+=("$full")
  if [[ -n "$short" ]]; then
    expected_commit_values+=("$short")
  fi
}

# Always allow current commit and direct parent.
add_expected_commit "HEAD"
add_expected_commit "HEAD^"

# On pull_request merge refs, allow second parent (PR head) and its parent if available.
if [[ -n "${GITHUB_BASE_REF:-}" ]]; then
  add_expected_commit "HEAD^2"
  add_expected_commit "HEAD^2^"
fi

EXPECTED_COMMITS="$(printf '%s\n' "${expected_commit_values[@]}" | awk 'NF' | sort -u | paste -sd'|' -)"
if [[ -z "$EXPECTED_COMMITS" ]]; then
  EXPECTED_COMMITS="$HEAD_SHORT"
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
  for expected in "${expected_commit_values[@]}"; do
    if [[ "$repo_commit" == "$expected" ]]; then
      commit_ok=true
      break
    fi
  done

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
