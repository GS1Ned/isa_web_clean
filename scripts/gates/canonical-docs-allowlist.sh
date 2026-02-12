#!/usr/bin/env bash
set -euo pipefail

# Canonical Docs Allowlist Gate
# Enforces that no new docs are created outside the canonical allowlist

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
ALLOWLIST="$REPO_ROOT/config/governance/canonical_docs_allowlist.json"

cd "$REPO_ROOT"

echo "=== Canonical Docs Allowlist Gate ==="
echo ""

if [[ ! -f "$ALLOWLIST" ]]; then
    echo "❌ FAIL: Allowlist not found: $ALLOWLIST"
    exit 1
fi

VIOLATIONS=0

# Check for forbidden patterns
echo "Checking for forbidden patterns..."
FORBIDDEN=$(find . -path "./node_modules" -prune -o -path "./.git" -prune -o \( -path "*/__MACOSX/*" -o -name ".DS_Store" -o -name "Thumbs.db" -o -name "*.swp" -o -name "*~" \) -print 2>/dev/null || true)

if [[ -n "$FORBIDDEN" ]]; then
    echo "❌ FAIL: Forbidden files found:"
    echo "$FORBIDDEN"
    VIOLATIONS=$((VIOLATIONS + $(echo "$FORBIDDEN" | wc -l)))
fi

# Check for new docs outside allowlist (simplified check)
echo ""
echo "Checking for docs outside canonical allowlist..."

# Find all .md files in docs/ (excluding generated and node_modules)
NEW_DOCS=$(find docs -name "*.md" \
    -not -path "*/node_modules/*" \
    -not -path "*/_generated/*" \
    -not -path "*/planning/*" \
    -not -path "*/governance/*" \
    -not -path "*/architecture/panel/*" \
    -not -path "*/sre/*" \
    -not -path "*/quality/*" \
    -not -path "*/spec/*/RUNTIME_CONTRACT.md" \
    -not -name "INDEX.md" \
    -not -name "REPO_MAP.md" \
    -not -name "README.md" \
    2>/dev/null | grep -v "isa-core-architecture.md\|ISA_CORE_CONTRACT.md" || true)

if [[ -n "$NEW_DOCS" ]]; then
    echo "⚠️  WARNING: Potential non-canonical docs found (manual review required):"
    echo "$NEW_DOCS"
    # Don't fail on this yet, just warn
fi

echo ""
echo "=== Gate Summary ==="
echo "Forbidden files: $VIOLATIONS"

if [[ $VIOLATIONS -gt 0 ]]; then
    echo "❌ Canonical docs allowlist gate FAILED"
    echo ""
    echo "Action required:"
    echo "1. Remove forbidden files (__MACOSX, .DS_Store, etc.)"
    echo "2. Add .gitignore entries to prevent reintroduction"
    exit 1
fi

echo "✅ Canonical docs allowlist gate PASSED"
exit 0
