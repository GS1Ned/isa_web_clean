#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AUDIT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$AUDIT_ROOT/.." && pwd)"

ZIP_PATH="${OPENCLAW_AUDIT_ZIP:-$HOME/Downloads/openclaw-main (1).zip}"
SRC_DIR="$AUDIT_ROOT/source/openclaw-main"
TMP_UNPACK="$AUDIT_ROOT/source/.tmp-unpack"
DOCS_DIR="$AUDIT_ROOT/docs"
LOG_DIR="$AUDIT_ROOT/exec/EXEC_LOGS"

require_cmd() {
  local cmd="$1"
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "STOP=missing_dependency:${cmd}"
    exit 1
  fi
}

# PREFLIGHT
require_cmd node
require_cmd unzip
require_cmd rg
require_cmd rsync

if [[ ! -f "$ZIP_PATH" ]]; then
  echo "STOP=zip_not_found:$ZIP_PATH"
  exit 1
fi

echo "READY=preflight_ok"

echo "INFO repo=$REPO_ROOT"
echo "INFO zip=$ZIP_PATH"

mkdir -p "$AUDIT_ROOT" "$AUDIT_ROOT/source" "$DOCS_DIR" "$LOG_DIR"

# ACTION: deterministic unzip/sync into source/openclaw-main
rm -rf "$TMP_UNPACK"
mkdir -p "$TMP_UNPACK"
unzip -oq "$ZIP_PATH" -d "$TMP_UNPACK"

UNPACK_TOP="$(find "$TMP_UNPACK" -mindepth 1 -maxdepth 1 -type d | head -n 1 || true)"
if [[ -z "$UNPACK_TOP" ]]; then
  echo "STOP=zip_unexpected_structure"
  exit 1
fi

mkdir -p "$SRC_DIR"
rsync -a --delete "$UNPACK_TOP/" "$SRC_DIR/"
rm -rf "$TMP_UNPACK"

echo "INFO source_synced=$SRC_DIR"

# Inventory + docs crawl
node "$AUDIT_ROOT/scripts/build_inventory.mjs" "$SRC_DIR" "$AUDIT_ROOT/inventory/FILE_TREE.json"
node "$AUDIT_ROOT/scripts/crawl_docs.mjs" "$DOCS_DIR"

# CLI probes (no secrets)
run_cli_log() {
  local name="$1"
  local cmd="$2"
  local out="$LOG_DIR/${name}.log"
  {
    echo "COMMAND=$cmd"
    echo "TIMESTAMP=$(date -u +%Y-%m-%dT%H:%M:%SZ)"
    if command -v openclaw >/dev/null 2>&1; then
      set +e
      bash -lc "$cmd"
      local code=$?
      set -e
      echo "EXIT_CODE=$code"
    else
      echo "openclaw CLI not found in PATH"
      echo "EXIT_CODE=127"
    fi
  } >"$out" 2>&1
}

run_cli_log "openclaw_help" "openclaw --help"
run_cli_log "openclaw_docs_browser_extension" "openclaw docs browser extension"
run_cli_log "openclaw_docs_sandbox_allowhostcontrol" "openclaw docs sandbox allowHostControl"

# Generate markdown/json artifacts
node "$AUDIT_ROOT/scripts/generate_artifacts.mjs" "$REPO_ROOT"

echo "DONE=audit_openclaw"
