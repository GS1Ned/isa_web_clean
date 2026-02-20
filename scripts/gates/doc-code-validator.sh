#!/usr/bin/env bash
set -euo pipefail

# Doc-Code Validator Gate
# Validates that referenced paths and EVIDENCE markers resolve.
# Modes:
#   - default: repository-wide checks
#   - --canonical-only: checks only canonical documentation scope

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ALLOWLIST="$REPO_ROOT/config/governance/canonical_docs_allowlist.json"
INBOUND_LINKS="$REPO_ROOT/docs/architecture/panel/_generated/INBOUND_LINKS.json"

MODE="global"
if [[ "${1:-}" == "--canonical-only" ]]; then
    MODE="canonical"
fi

cd "$REPO_ROOT"

echo "=== Doc-Code Validator Gate ==="
echo "Mode: $MODE"
echo ""

# Generate reference index if it doesn't exist
if [[ ! -f "$INBOUND_LINKS" ]]; then
    echo "Generating reference index..."
    pnpm tsx scripts/docs/ref_index.ts
fi

if [[ ! -f "$INBOUND_LINKS" ]]; then
    echo "❌ FAIL: Could not generate inbound links"
    exit 1
fi

if [[ ! -f "$ALLOWLIST" ]]; then
    echo "❌ FAIL: Allowlist not found: $ALLOWLIST"
    exit 1
fi

FAIL_COUNT=0
BROKEN=""

if [[ "$MODE" == "canonical" ]]; then
    CANONICAL_SCOPE_JSON=$(jq -c '.canonical_scope_docs // []' "$ALLOWLIST")
    if [[ "$CANONICAL_SCOPE_JSON" == "[]" ]]; then
        echo "❌ FAIL: canonical_scope_docs is empty in $ALLOWLIST"
        exit 1
    fi
    echo "Checking for broken references (canonical scope only)..."
    BROKEN=$(jq -r --argjson canon "$CANONICAL_SCOPE_JSON" '
      .inbound_links[]
      | select(.exists == false)
      | select(any(.inbound_files[]? as $f; ($canon | index($f)) != null))
      | .referenced_path
    ' "$INBOUND_LINKS" 2>/dev/null | sort -u || true)
else
    echo "Checking for broken references (global scope)..."
    BROKEN=$(jq -r '
      .inbound_links[]
      | select(.exists == false)
      | .referenced_path
    ' "$INBOUND_LINKS" 2>/dev/null | sort -u || true)
fi

if [[ -n "$BROKEN" ]]; then
    BROKEN_COUNT=$(echo "$BROKEN" | wc -l | tr -d ' ')
    echo "❌ FAIL: $BROKEN_COUNT broken references found:"
    echo "$BROKEN" | head -20
    if [[ $BROKEN_COUNT -gt 20 ]]; then
        echo "... and $((BROKEN_COUNT - 20)) more"
    fi
    FAIL_COUNT=$((FAIL_COUNT + BROKEN_COUNT))
fi

echo ""
echo "Checking EVIDENCE markers..."
EVIDENCE_ERRORS=0

check_evidence_markers_in_file() {
    local doc_file="$1"
    if [[ ! -f "$doc_file" ]]; then
        return 0
    fi

    local evidence_paths evidence_path
    evidence_paths=$(grep -o 'EVIDENCE:[^:[:space:]]\+:[^[:space:]]\+' "$doc_file" | cut -d: -f3 || true)
    for evidence_path in $evidence_paths; do
        evidence_path="${evidence_path%%-->}"
        if [[ ! -f "$evidence_path" ]] && [[ ! -d "$evidence_path" ]]; then
            echo "  ❌ $doc_file: Missing evidence path: $evidence_path"
            EVIDENCE_ERRORS=$((EVIDENCE_ERRORS + 1))
        fi
    done
}

if [[ "$MODE" == "canonical" ]]; then
    CANONICAL_DOCS=$(jq -r '.canonical_scope_docs[]' "$ALLOWLIST")
    while IFS= read -r doc; do
        [[ -z "$doc" ]] && continue
        check_evidence_markers_in_file "$doc"
    done <<< "$CANONICAL_DOCS"
else
    for contract in docs/spec/*/RUNTIME_CONTRACT.md; do
        check_evidence_markers_in_file "$contract"
    done
fi

if [[ $EVIDENCE_ERRORS -gt 0 ]]; then
    echo "❌ FAIL: $EVIDENCE_ERRORS invalid EVIDENCE markers"
    FAIL_COUNT=$((FAIL_COUNT + EVIDENCE_ERRORS))
fi

if [[ "$MODE" == "global" ]]; then
    echo ""
    echo "Checking REPO_MAP entrypoints..."
    if [[ -f "docs/REPO_MAP.md" ]]; then
        REPO_MAP_ERRORS=0

        REPO_MAP_LINKS=$(grep -o '\[.*\]([^)]*\.md)' docs/REPO_MAP.md | sed 's/.*(\([^)]*\)).*/\1/' || true)

        for link in $REPO_MAP_LINKS; do
            clean_link=$(echo "$link" | cut -d'#' -f1)
            if [[ -n "$clean_link" ]] && [[ ! -f "$clean_link" ]]; then
                echo "  ❌ REPO_MAP: Missing file: $clean_link"
                REPO_MAP_ERRORS=$((REPO_MAP_ERRORS + 1))
            fi
        done

        if [[ $REPO_MAP_ERRORS -gt 0 ]]; then
            echo "❌ FAIL: $REPO_MAP_ERRORS broken REPO_MAP links"
            FAIL_COUNT=$((FAIL_COUNT + REPO_MAP_ERRORS))
        fi
    fi
else
    echo ""
    echo "Skipping REPO_MAP global backlog check in canonical mode."
fi

echo ""
echo "=== Validation Summary ==="
echo "Total failures: $FAIL_COUNT"

if [[ $FAIL_COUNT -gt 0 ]]; then
    echo "❌ Doc-code validator gate FAILED"
    echo ""
    echo "Action required:"
    echo "1. Fix broken references in checked scope"
    echo "2. Update EVIDENCE markers to point to existing files"
    if [[ "$MODE" == "global" ]]; then
        echo "3. Update REPO_MAP links"
    fi
    exit 1
fi

echo "✅ Doc-code validator gate PASSED"
exit 0
