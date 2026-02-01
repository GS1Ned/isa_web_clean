#!/bin/bash
#
# ISA Embedding Generation Cron Job
#
# This script is designed to be run as a cron job on the ISA server.
# It generates embeddings for new documents in the database.
#
# Setup:
#   1. Make executable: chmod +x scripts/cron-generate-embeddings.sh
#   2. Add to crontab: crontab -e
#   3. Add line: 0 2 * * * /path/to/isa_web_clean/scripts/cron-generate-embeddings.sh >> /var/log/isa-embeddings.log 2>&1
#
# This will run daily at 2 AM and log output to /var/log/isa-embeddings.log
#

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="${LOG_FILE:-/var/log/isa-embeddings.log}"
LOCK_FILE="/tmp/isa-embeddings.lock"

# Logging function
log() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# Error handler
error_exit() {
  log "ERROR: $1"
  rm -f "$LOCK_FILE"
  exit 1
}

# Check if already running
if [ -f "$LOCK_FILE" ]; then
  PID=$(cat "$LOCK_FILE")
  if ps -p "$PID" > /dev/null 2>&1; then
    log "Embedding generation already running (PID: $PID). Exiting."
    exit 0
  else
    log "Stale lock file found. Removing."
    rm -f "$LOCK_FILE"
  fi
fi

# Create lock file
echo $$ > "$LOCK_FILE"

log "=========================================="
log "ISA Embedding Generation Started"
log "=========================================="

# Change to project directory
cd "$PROJECT_ROOT" || error_exit "Failed to change to project directory"

# Load environment variables
if [ -f ".env" ]; then
  log "Loading environment variables from .env"
  export $(grep -v '^#' .env | xargs)
else
  log "WARNING: .env file not found. Using system environment variables."
fi

# Verify required environment variables
if [ -z "${DATABASE_URL:-}" ]; then
  error_exit "DATABASE_URL environment variable not set"
fi

if [ -z "${OPENAI_API_KEY:-}" ]; then
  error_exit "OPENAI_API_KEY environment variable not set"
fi

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
  error_exit "pnpm not found. Please install pnpm."
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
  error_exit "Node.js not found. Please install Node.js."
fi

log "Node version: $(node --version)"
log "pnpm version: $(pnpm --version)"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  log "Installing dependencies..."
  pnpm install --frozen-lockfile || error_exit "Failed to install dependencies"
fi

# Run embedding generation
log "Running optimized embedding generation..."
START_TIME=$(date +%s)

if pnpm exec tsx server/generate-embeddings-optimized.ts; then
  END_TIME=$(date +%s)
  DURATION=$((END_TIME - START_TIME))
  log "✅ Embedding generation completed successfully in ${DURATION}s"
  EXIT_CODE=0
else
  END_TIME=$(date +%s)
  DURATION=$((END_TIME - START_TIME))
  log "❌ Embedding generation failed after ${DURATION}s"
  EXIT_CODE=1
fi

# Cleanup
rm -f "$LOCK_FILE"

log "=========================================="
log "ISA Embedding Generation Finished"
log "=========================================="

exit $EXIT_CODE
