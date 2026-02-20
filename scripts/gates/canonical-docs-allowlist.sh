#!/usr/bin/env bash
set -euo pipefail

# Canonical Docs Allowlist Gate
# Enforces canonical doc policy and forbidden file hygiene.
# Deterministic CI behavior: fail only on forbidden tracked files.
# Local untracked forbidden files are warning-only.

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

echo "Checking tracked files for forbidden patterns..."
TRACKED_FORBIDDEN=$(git ls-files | grep -E '(^|/)(__MACOSX/|\.DS_Store$|Thumbs\.db$|[^/]+\.swp$|[^/]+~$)' || true)

if [[ -n "$TRACKED_FORBIDDEN" ]]; then
    echo "❌ FAIL: Forbidden tracked files found:"
    echo "$TRACKED_FORBIDDEN"
    VIOLATIONS=$((VIOLATIONS + $(echo "$TRACKED_FORBIDDEN" | wc -l | tr -d ' ')))
fi

echo ""
echo "Checking untracked local filesystem noise (warning-only)..."
LOCAL_FORBIDDEN=$(find . \
    -path "./node_modules" -prune -o \
    -path "./.git" -prune -o \
    \( -path "*/__MACOSX/*" -o -name ".DS_Store" -o -name "Thumbs.db" -o -name "*.swp" -o -name "*~" \) \
    -print 2>/dev/null | sed 's#^\./##' || true)

if [[ -n "$LOCAL_FORBIDDEN" ]]; then
    if [[ -n "$TRACKED_FORBIDDEN" ]]; then
        UNTRACKED_FORBIDDEN=$(printf '%s\n' "$LOCAL_FORBIDDEN" | grep -vxFf <(printf '%s\n' "$TRACKED_FORBIDDEN") || true)
    else
        UNTRACKED_FORBIDDEN="$LOCAL_FORBIDDEN"
    fi
    if [[ -n "${UNTRACKED_FORBIDDEN:-}" ]]; then
        echo "⚠️  WARNING: Untracked forbidden files present locally (non-blocking):"
        echo "$UNTRACKED_FORBIDDEN"
    fi
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
echo "Forbidden tracked files: $VIOLATIONS"

if [[ $VIOLATIONS -gt 0 ]]; then
    echo "❌ Canonical docs allowlist gate FAILED"
    echo ""
    echo "Action required:"
    echo "1. Remove forbidden tracked files (__MACOSX, .DS_Store, etc.)"
    echo "2. Add .gitignore entries to prevent reintroduction"
    exit 1
fi

echo "✅ Canonical docs allowlist gate PASSED"
exit 0
