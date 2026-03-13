#!/bin/bash
# ISA Q Branch Setup
# One-time setup for Q branch workflow

set -e

REPO_DIR="/Users/frisowempe/isa_web_clean"
BRANCH="isa_web_clean_Q_branch"
REMOTE="origin"
REPO="GS1Ned/isa_web_clean"

cd "$REPO_DIR" || exit 1

echo "=== ISA Q Branch Setup ==="
echo ""

# 1. Ensure on main and up to date
echo "1. Updating main branch..."
git checkout main
git pull origin main
echo "✓ Main branch updated"
echo ""

# 2. Create Q branch
echo "2. Creating Q branch: $BRANCH"
if git show-ref --verify --quiet "refs/heads/$BRANCH"; then
  echo "   Branch already exists locally"
  git checkout "$BRANCH"
else
  git checkout -b "$BRANCH"
  echo "✓ Branch created"
fi
echo ""

# 3. Push Q branch to GitHub
echo "3. Pushing Q branch to GitHub..."
git push -u origin "$BRANCH" || echo "   Branch already exists on remote"
echo "✓ Q branch pushed"
echo ""

# 4. Configure git aliases
echo "4. Configuring git aliases..."
git config alias.qsync '!git add -A && git commit -m "Q: Auto-sync $(date +%Y-%m-%d_%H:%M:%S)" && git push origin isa_web_clean_Q_branch'
git config alias.qcommit '!f() { git add -A && git commit -m "Q: $1" && git push origin isa_web_clean_Q_branch; }; f'
git config alias.qpull 'pull origin isa_web_clean_Q_branch --rebase'
echo "✓ Git aliases configured"
echo ""

# 5. Verify setup
echo "5. Verifying setup..."
echo "   Current branch: $(git branch --show-current)"
echo "   Remote tracking: $(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo 'Not set')"
echo ""

# 6. Instructions
echo "=== Setup Complete! ==="
echo ""
echo "Quick commands:"
echo "  git qsync              # Quick sync with auto-timestamp"
echo "  git qcommit 'message'  # Commit with custom message"
echo "  git qpull              # Pull latest from Q branch"
echo ""
echo "Start auto-sync (optional):"
echo "  nohup scripts/dev/auto-sync-q-branch.sh > /tmp/q-branch-sync.log 2>&1 &"
echo ""
echo "View auto-sync logs:"
echo "  tail -f /tmp/q-branch-sync.log"
echo ""
echo "Stop auto-sync:"
echo "  pkill -f auto-sync-q-branch"
echo ""
echo "Create PR to main:"
echo "  gh pr create --base main --head $BRANCH"
echo ""
