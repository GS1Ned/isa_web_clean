#!/bin/bash
# ISA Q Branch Auto-Sync
# Automatically syncs local changes to GitHub Q branch every 15 minutes

set -e

REPO_DIR="/Users/frisowempe/isa_web_clean"
BRANCH="isa_web_clean_Q_branch"
INTERVAL=900  # 15 minutes in seconds
LOG_FILE="/tmp/q-branch-sync.log"

cd "$REPO_DIR" || exit 1

echo "[$(date)] Q Branch Auto-Sync started (interval: ${INTERVAL}s)" | tee -a "$LOG_FILE"

while true; do
  CURRENT_BRANCH=$(git branch --show-current)
  
  if [ "$CURRENT_BRANCH" = "$BRANCH" ]; then
    if ! git diff-index --quiet HEAD --; then
      echo "[$(date)] Changes detected, syncing..." | tee -a "$LOG_FILE"
      git add -A
      git commit -m "Q: Auto-sync $(date +%Y-%m-%d_%H:%M:%S)" || true
      git push origin "$BRANCH" 2>&1 | tee -a "$LOG_FILE"
      echo "[$(date)] ✓ Sync complete" | tee -a "$LOG_FILE"
    else
      echo "[$(date)] No changes to sync" | tee -a "$LOG_FILE"
    fi
  else
    echo "[$(date)] Not on Q branch ($CURRENT_BRANCH), skipping sync" | tee -a "$LOG_FILE"
  fi
  
  sleep $INTERVAL
done
