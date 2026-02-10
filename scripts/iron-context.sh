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
# STEP 1: Pull latest code
# =============================================================================
echo "[1/4] Pulling latest code from origin/main..."
git fetch origin
git reset --hard origin/main
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
