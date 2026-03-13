# ISA GitHub Workflow Strategy

**Created:** 2025-02-10  
**Repository:** https://github.com/GS1Ned/isa_web_clean.git  
**Q Branch:** `isa_web_clean_Q_branch`  
**Status:** READY FOR EXECUTION

---

## Overview

Automated GitHub workflow for Amazon Q development with continuous syncing to dedicated branch.

**Key Principles:**
- Dedicated Q branch for AI-assisted development
- Automated sync every commit
- Clean separation from main branch
- Easy merge path to main when ready

---

## Initial Setup

### 1. Create Q Branch

```bash
# Navigate to repository
cd /Users/frisowempe/isa_web_clean

# Ensure we're on latest main
git checkout main
git pull origin main

# Create and push Q branch
git checkout -b isa_web_clean_Q_branch
git push -u origin isa_web_clean_Q_branch

# Verify branch exists
gh repo view GS1Ned/isa_web_clean --web
```

### 2. Configure Git Aliases

```bash
# Add to ~/.gitconfig or run these commands:
git config alias.qsync '!git add -A && git commit -m "Q: Auto-sync $(date +%Y-%m-%d_%H:%M:%S)" && git push origin isa_web_clean_Q_branch'
git config alias.qcommit '!f() { git add -A && git commit -m "Q: $1" && git push origin isa_web_clean_Q_branch; }; f'
git config alias.qpull 'pull origin isa_web_clean_Q_branch --rebase'
```

---

## Daily Workflow

### Start of Day

```bash
# Ensure on Q branch
git checkout isa_web_clean_Q_branch

# Pull latest changes
git qpull

# Verify status
git status
```

### During Development

```bash
# Quick sync (auto-commit with timestamp)
git qsync

# Or commit with message
git qcommit "Implemented Ask ISA cache optimization"

# Check remote status
gh pr status
```

### End of Day

```bash
# Final sync
git qcommit "End of day: [summary of work]"

# Verify pushed
gh repo view GS1Ned/isa_web_clean --web
```

---

## Automated Sync Script

### Create Auto-Sync Script

```bash
# Create script
cat > /Users/frisowempe/isa_web_clean/scripts/dev/auto-sync-q-branch.sh << 'EOF'
#!/bin/bash
# Auto-sync to Q branch every 15 minutes

REPO_DIR="/Users/frisowempe/isa_web_clean"
BRANCH="isa_web_clean_Q_branch"
INTERVAL=900  # 15 minutes in seconds

cd "$REPO_DIR" || exit 1

while true; do
  # Check if on Q branch
  CURRENT_BRANCH=$(git branch --show-current)
  
  if [ "$CURRENT_BRANCH" = "$BRANCH" ]; then
    # Check for changes
    if ! git diff-index --quiet HEAD --; then
      echo "[$(date)] Changes detected, syncing..."
      git add -A
      git commit -m "Q: Auto-sync $(date +%Y-%m-%d_%H:%M:%S)"
      git push origin "$BRANCH"
      echo "[$(date)] Sync complete"
    else
      echo "[$(date)] No changes to sync"
    fi
  else
    echo "[$(date)] Not on Q branch, skipping sync"
  fi
  
  sleep $INTERVAL
done
EOF

# Make executable
chmod +x /Users/frisowempe/isa_web_clean/scripts/dev/auto-sync-q-branch.sh
```

### Run Auto-Sync in Background

```bash
# Start auto-sync (runs in background)
nohup /Users/frisowempe/isa_web_clean/scripts/dev/auto-sync-q-branch.sh > /tmp/q-branch-sync.log 2>&1 &

# Check if running
ps aux | grep auto-sync-q-branch

# View logs
tail -f /tmp/q-branch-sync.log

# Stop auto-sync
pkill -f auto-sync-q-branch
```

---

## GitHub Actions Workflow

### Create CI Workflow for Q Branch

```yaml
# .github/workflows/q-branch-ci.yml
name: Q Branch CI

on:
  push:
    branches:
      - isa_web_clean_Q_branch
  pull_request:
    branches:
      - isa_web_clean_Q_branch

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '22.13.0'
      
      - name: Install pnpm
        run: npm install -g pnpm@10.4.1
      
      - name: Install dependencies
        run: pnpm install
      
      - name: TypeScript check
        run: pnpm tsc --noEmit
      
      - name: Run tests
        run: pnpm test-ci:unit
      
      - name: Build
        run: pnpm build

  sync-status:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Check sync status
        run: |
          echo "Q Branch commits ahead of main:"
          git rev-list --count main..isa_web_clean_Q_branch
          
          echo "Files changed:"
          git diff --name-only main...isa_web_clean_Q_branch | wc -l
```

---

## Merge Strategy

### When Ready to Merge to Main

```bash
# 1. Ensure Q branch is clean and pushed
git checkout isa_web_clean_Q_branch
git qsync

# 2. Create PR via GitHub CLI
gh pr create \
  --base main \
  --head isa_web_clean_Q_branch \
  --title "Q Branch: [Feature/Phase Name]" \
  --body "## Summary
  
  [Describe changes]
  
  ## Testing
  - [ ] All tests passing
  - [ ] TypeScript compiles
  - [ ] Manual testing complete
  
  ## Checklist
  - [ ] Governance compliance verified
  - [ ] Documentation updated
  - [ ] No breaking changes
  - [ ] Ready for production"

# 3. Review and merge via GitHub UI
gh pr view --web

# 4. After merge, sync Q branch with main
git checkout main
git pull origin main
git checkout isa_web_clean_Q_branch
git merge main
git push origin isa_web_clean_Q_branch
```

### Squash Merge (Recommended)

```bash
# Squash all Q branch commits into single commit
gh pr merge --squash --delete-branch=false
```

---

## Branch Protection Rules

### Configure via GitHub CLI

```bash
# Protect main branch
gh api repos/GS1Ned/isa_web_clean/branches/main/protection \
  --method PUT \
  --field required_status_checks='{"strict":true,"contexts":["test"]}' \
  --field enforce_admins=false \
  --field required_pull_request_reviews='{"required_approving_review_count":1}' \
  --field restrictions=null

# Allow Q branch to be force-pushed (for rebasing)
gh api repos/GS1Ned/isa_web_clean/branches/isa_web_clean_Q_branch/protection \
  --method DELETE
```

---

## Monitoring & Status

### Check Branch Status

```bash
# View commits ahead/behind
git checkout isa_web_clean_Q_branch
git fetch origin
git status

# Compare with main
git log main..isa_web_clean_Q_branch --oneline

# View file changes
git diff main...isa_web_clean_Q_branch --stat
```

### GitHub CLI Status Commands

```bash
# View all branches
gh repo view GS1Ned/isa_web_clean

# Check PR status
gh pr status

# View recent commits on Q branch
gh api repos/GS1Ned/isa_web_clean/commits?sha=isa_web_clean_Q_branch | jq '.[0:5]'

# View CI status
gh run list --branch isa_web_clean_Q_branch
```

---

## Troubleshooting

### Sync Conflicts

```bash
# If push fails due to conflicts
git pull origin isa_web_clean_Q_branch --rebase

# Resolve conflicts, then
git rebase --continue
git push origin isa_web_clean_Q_branch
```

### Reset Q Branch to Main

```bash
# Nuclear option: reset Q branch to match main
git checkout isa_web_clean_Q_branch
git fetch origin
git reset --hard origin/main
git push origin isa_web_clean_Q_branch --force
```

### Recover Lost Commits

```bash
# View reflog
git reflog

# Recover commit
git cherry-pick <commit-hash>
```

---

## Quick Reference

### Essential Commands

```bash
# Daily workflow
git checkout isa_web_clean_Q_branch  # Switch to Q branch
git qpull                             # Pull latest
git qsync                             # Quick sync
git qcommit "message"                 # Commit with message

# Status checks
git status                            # Local status
gh pr status                          # PR status
gh run list --branch isa_web_clean_Q_branch  # CI status

# Merge to main
gh pr create --base main --head isa_web_clean_Q_branch
gh pr merge --squash
```

### Auto-Sync Management

```bash
# Start auto-sync
nohup scripts/dev/auto-sync-q-branch.sh > /tmp/q-branch-sync.log 2>&1 &

# Check status
tail -f /tmp/q-branch-sync.log

# Stop auto-sync
pkill -f auto-sync-q-branch
```

---

## Next Actions

- [ ] Create Q branch: `git checkout -b isa_web_clean_Q_branch && git push -u origin isa_web_clean_Q_branch`
- [ ] Configure git aliases: `git config alias.qsync '!git add -A && git commit -m "Q: Auto-sync $(date +%Y-%m-%d_%H:%M:%S)" && git push origin isa_web_clean_Q_branch'`
- [ ] Create auto-sync script: `scripts/dev/auto-sync-q-branch.sh`
- [ ] Create GitHub Actions workflow: `.github/workflows/q-branch-ci.yml`
- [ ] Start auto-sync: `nohup scripts/dev/auto-sync-q-branch.sh > /tmp/q-branch-sync.log 2>&1 &`
- [ ] Verify setup: `git qsync && gh pr status`

---

**Status:** Ready for execution  
**Estimated Setup Time:** 15 minutes  
**Maintenance:** Automated (zero manual effort)
