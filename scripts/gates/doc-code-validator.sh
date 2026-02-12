#!/usr/bin/env bash
set -euo pipefail

# Doc-Code Validator Gate
# Validates that all referenced paths exist and EVIDENCE markers are valid

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
INBOUND_LINKS="$REPO_ROOT/docs/architecture/panel/_generated/INBOUND_LINKS.json"

cd "$REPO_ROOT"

echo "=== Doc-Code Validator Gate ==="
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

FAIL_COUNT=0

# Check for broken references
echo "Checking for broken references..."
BROKEN=$(jq -r '.inbound_links[] | select(.exists == false) | .referenced_path' "$INBOUND_LINKS" 2>/dev/null || echo "")

if [[ -n "$BROKEN" ]]; then
    BROKEN_COUNT=$(echo "$BROKEN" | wc -l | tr -d ' ')
    echo "❌ FAIL: $BROKEN_COUNT broken references found:"
    echo "$BROKEN" | head -20
    if [[ $BROKEN_COUNT -gt 20 ]]; then
        echo "... and $((BROKEN_COUNT - 20)) more"
    fi
    FAIL_COUNT=$((FAIL_COUNT + BROKEN_COUNT))
fi

# Check EVIDENCE markers in RUNTIME_CONTRACT files
echo ""
echo "Checking EVIDENCE markers in RUNTIME_CONTRACT files..."
EVIDENCE_ERRORS=0

for contract in docs/spec/*/RUNTIME_CONTRACT.md; do
    if [[ ! -f "$contract" ]]; then
        continue
    fi
    
    # Extract EVIDENCE:implementation paths
    EVIDENCE_PATHS=$(grep -o 'EVIDENCE:implementation:[^[:space:]]*' "$contract" | cut -d: -f3 || true)
    
    for evidence_path in $EVIDENCE_PATHS; do
        if [[ ! -f "$evidence_path" ]] && [[ ! -d "$evidence_path" ]]; then
            echo "  ❌ $contract: Missing evidence path: $evidence_path"
            EVIDENCE_ERRORS=$((EVIDENCE_ERRORS + 1))
        fi
    done
done

if [[ $EVIDENCE_ERRORS -gt 0 ]]; then
    echo "❌ FAIL: $EVIDENCE_ERRORS invalid EVIDENCE markers"
    FAIL_COUNT=$((FAIL_COUNT + EVIDENCE_ERRORS))
fi

# Check REPO_MAP entrypoints
echo ""
echo "Checking REPO_MAP entrypoints..."
if [[ -f "docs/REPO_MAP.md" ]]; then
    REPO_MAP_ERRORS=0
    
    # Extract markdown links from REPO_MAP
    REPO_MAP_LINKS=$(grep -o '\[.*\]([^)]*\.md)' docs/REPO_MAP.md | sed 's/.*(\([^)]*\)).*/\1/' || true)
    
    for link in $REPO_MAP_LINKS; do
        # Remove anchors
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

echo ""
echo "=== Validation Summary ==="
echo "Total failures: $FAIL_COUNT"

if [[ $FAIL_COUNT -gt 0 ]]; then
    echo "❌ Doc-code validator gate FAILED"
    echo ""
    echo "Action required:"
    echo "1. Fix broken references"
    echo "2. Update EVIDENCE markers to point to existing files"
    echo "3. Update REPO_MAP links"
    exit 1
fi

echo "✅ Doc-code validator gate PASSED"
exit 0
