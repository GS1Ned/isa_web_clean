#!/opt/homebrew/bin/bash
IRON_BASH="${IRON_BASH:-bash}"
#!/usr/bin/env bash
# =============================================================================
# IRON Protocol: Context Ingestion
# =============================================================================
# This script is the canonical entry point for any ISA development task.
# It ensures the developer/agent has the latest context before starting work.
#
# Usage: ./scripts/iron-context.sh
# =============================================================================

# Prefer Homebrew bash on macOS if available (for bash 4+ compatibility)
if [[ -x /opt/homebrew/bin/bash ]] && [[ "$BASH" != "/opt/homebrew/bin/bash" ]]; then
  exec /opt/homebrew/bin/bash "$0" "$@"
fi

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

echo "=============================================="
echo "IRON Protocol: Context Ingestion"
echo "=============================================="
echo ""

# =============================================================================
# STEP 1: Safe sync with origin/main (non-destructive)
# =============================================================================
echo "[1/4] Syncing with origin/main (safe, non-destructive)..."
if [[ -n "$(git status --porcelain)" ]]; then
  echo "STOP=working tree is dirty; commit/stash/discard changes before running iron-context.sh"
  exit 1
fi

git fetch origin --prune
CURRENT_BRANCH="$(git rev-parse --abbrev-ref HEAD)"

if [[ "$CURRENT_BRANCH" == "HEAD" ]]; then
  echo "STOP=detached HEAD; checkout a branch before running iron-context.sh"
  exit 1
fi

if [[ "$CURRENT_BRANCH" == "main" ]]; then
  git pull --ff-only origin main
else
  if git merge-base --is-ancestor HEAD origin/main; then
    git merge --ff-only origin/main
  elif git merge-base --is-ancestor origin/main HEAD; then
    echo "      Branch is ahead of origin/main; no fast-forward needed."
  else
    echo "STOP=branch has diverged from origin/main; resolve manually (rebase or merge) before running this script"
    exit 1
  fi
fi

GIT_HASH=$(git rev-parse HEAD)
echo "      Current commit: $GIT_HASH"
echo ""

# =============================================================================
# STEP 2: Generate fresh inventory
# =============================================================================
echo "[2/4] Generating fresh inventory..."
if "${IRON_BASH}" ./scripts/iron-inventory.sh; then
  echo "      Inventory generated successfully."
else
  echo ""
  echo "      ⚠️  WARNING: Inventory generation reported unknown scope."
  echo "      Review the warnings above and update iron-inventory.sh if needed."
fi
echo ""

# =============================================================================
# STEP 3: Display planning summary
# =============================================================================
echo "[3/4] Current planning priorities:"
echo "----------------------------------------------"
if [[ -f "docs/planning/NEXT_ACTIONS.json" ]]; then
  grep -E '"id"|"status"|"title"' docs/planning/NEXT_ACTIONS.json | head -20 || true
else
  echo "      ⚠️  docs/planning/NEXT_ACTIONS.json not found!"
fi
echo "----------------------------------------------"
echo ""

# =============================================================================
# STEP 4: Display IRON Protocol summary
# =============================================================================
echo "[4/4] IRON Protocol status:"
echo "----------------------------------------------"
if [[ -f "docs/governance/IRON_PROTOCOL.md" ]]; then
  echo "      docs/governance/IRON_PROTOCOL.md found."
  echo "      Last modified: $(stat -c %y docs/governance/IRON_PROTOCOL.md 2>/dev/null || stat -f %Sm docs/governance/IRON_PROTOCOL.md 2>/dev/null || echo 'unknown')"
else
  echo "      ⚠️  docs/governance/IRON_PROTOCOL.md not found!"
fi
echo "----------------------------------------------"
echo ""

# =============================================================================
# OUTPUT: Context Acknowledgement Block
# =============================================================================
echo "=============================================="
echo "CONTEXT ACKNOWLEDGEMENT (copy this to your PR)"
echo "=============================================="
echo ""
echo "Context-Commit-Hash: $GIT_HASH"
echo ""
echo "**Context Acknowledgement:**"
echo "- **Inventory:** Reviewed \`isa.inventory.json\` (commit: \`$GIT_HASH\`)"
echo "- **Planning:** [Fill in current priority from docs/planning/NEXT_ACTIONS.json]"
echo "- **Protocol:** This task adheres to the IRON Protocol."
echo ""
echo "=============================================="
echo "Context ingestion complete. You may now begin work."
echo "=============================================="
