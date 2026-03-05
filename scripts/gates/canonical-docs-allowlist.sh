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
    -path "./dist" -prune -o \
    -path "./test-results" -prune -o \
    \( -path "*/__MACOSX/*" -o -name ".DS_Store" -o -name "Thumbs.db" -o -name "*.swp" -o -name "*~" \) \
    -print 2>/dev/null | sed 's#^\./##' || true)

if [[ -n "$LOCAL_FORBIDDEN" ]]; then
    if [[ -n "$TRACKED_FORBIDDEN" ]]; then
        UNTRACKED_FORBIDDEN=$(printf '%s\n' "$LOCAL_FORBIDDEN" | grep -vxFf <(printf '%s\n' "$TRACKED_FORBIDDEN") || true)
    else
        UNTRACKED_FORBIDDEN="$LOCAL_FORBIDDEN"
    fi
    if [[ -n "${UNTRACKED_FORBIDDEN:-}" ]]; then
        UNTRACKED_COUNT=$(printf '%s\n' "$UNTRACKED_FORBIDDEN" | wc -l | tr -d ' ')
        echo "⚠️  WARNING: Untracked forbidden files present locally (non-blocking):"
        printf '%s\n' "$UNTRACKED_FORBIDDEN" | head -n 40
        if [[ "$UNTRACKED_COUNT" -gt 40 ]]; then
            echo "... and $((UNTRACKED_COUNT - 40)) more"
        fi
    fi
fi

# Check for new docs outside allowlist (simplified check)
echo ""
echo "Checking for docs outside canonical allowlist..."

# Candidate docs are newly added docs only:
# - Added in latest commit (if available)
# - Untracked in current worktree
ADDED_DOCS_HEAD=""
if git rev-parse --verify HEAD^ >/dev/null 2>&1; then
    ADDED_DOCS_HEAD=$(git diff --name-only --diff-filter=A HEAD^ HEAD | grep -E '^docs/.*\.md$' || true)
fi
ADDED_DOCS_WORKTREE=$(git ls-files --others --exclude-standard | grep -E '^docs/.*\.md$' || true)

NEW_DOCS=$(printf '%s\n%s\n' "$ADDED_DOCS_HEAD" "$ADDED_DOCS_WORKTREE" \
    | sed '/^$/d' \
    | sort -u \
    | grep -vE '(^docs/.*/_generated/|^docs/planning/|^docs/governance/|^docs/decisions/|^docs/architecture/panel/|^docs/sre/|^docs/quality/|/RUNTIME_CONTRACT\.md$|/INDEX\.md$|/README\.md$|/REPO_MAP\.md$|isa-core-architecture\.md$|ISA_CORE_CONTRACT\.md$)' \
    || true)

if [[ -n "$NEW_DOCS" ]]; then
    NEW_DOCS_COUNT=$(printf '%s\n' "$NEW_DOCS" | wc -l | tr -d ' ')
    echo "⚠️  WARNING: Potential non-canonical docs found (manual review required):"
    printf '%s\n' "$NEW_DOCS" | head -n 60
    if [[ "$NEW_DOCS_COUNT" -gt 60 ]]; then
        echo "... and $((NEW_DOCS_COUNT - 60)) more"
    fi
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
