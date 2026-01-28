#!/usr/bin/env bash
# =============================================================================
# IRON Protocol: Inventory Generator
# =============================================================================
# This script generates a deterministic inventory of the ISA repository.
# It detects new/unknown scope and forces explicit decisions.
#
# Usage: ./scripts/iron-inventory.sh
# Output: isa.inventory.json (root of repository)
# =============================================================================

# Bash version check (requires bash 4+ for associative arrays)
BASH_MAJOR_VERSION="${BASH_VERSINFO[0]}"
if [[ "$BASH_MAJOR_VERSION" -lt 4 ]]; then
  echo "ERROR: This script requires bash 4 or higher (current: bash $BASH_MAJOR_VERSION)." >&2
  echo "" >&2
  echo "macOS default bash is version 3.2. To fix:" >&2
  echo "  1. Install Homebrew bash: brew install bash" >&2
  echo "  2. Rerun with: /opt/homebrew/bin/bash ./scripts/iron-inventory.sh" >&2
  echo "" >&2
  exit 1
fi

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_FILE="$REPO_ROOT/isa.inventory.json"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
GIT_HASH=$(git -C "$REPO_ROOT" rev-parse HEAD 2>/dev/null || echo "unknown")

# =============================================================================
# SCOPE DEFINITION
# =============================================================================

# Core application directories
IN_SCOPE_DIRS=(
  "client"
  "server"
  "drizzle"
  "scripts"
  "data"
  ".github"
  "public"
  "EU_ESG_to_GS1_Mapping_v1.1"
  "shared"
  "migrations"
  "docs"
  "codemods"
  "cron-configs"
  "patches"
  "research"
  "tasks"
  "test-results"
)

# Configuration and build files
IN_SCOPE_FILES=(
  "package.json"
  "tsconfig.json"
  ".env.example"
  ".env"
  "pnpm-lock.yaml"
  "pnpm-workspace.yaml"
  "vite.config.ts"
  "tailwind.config.ts"
  "postcss.config.js"
  "components.json"
  "drizzle.config.ts"
  "vitest.config.ts"
  "vitest.setup.ts"
  ".eslintrc.server.json"
  ".markdownlint.json"
  ".prettierignore"
  ".prettierrc"
  "cspell.json"
  "cspell-gs1-terms.txt"
  "cspell-isa-terms.txt"
  "isa.inventory.json"
)

# Script files at root level (utility scripts)
IN_SCOPE_SCRIPT_PATTERNS=(
  "*.ts"
  "*.mjs"
  "*.sql"
  "*.txt"
)

# Patterns that are explicitly OUT OF SCOPE (ignored entirely)
OUT_OF_SCOPE_PATTERNS=(
  "node_modules"
  ".git"
  "dist"
  "build"
  ".next"
  ".xlsx"
  ".zip"
  "Archive"
  ".DS_Store"
)

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

log_info() {
  echo "[IRON-INVENTORY] $1"
}

log_warn() {
  echo "[IRON-INVENTORY] WARNING: $1" >&2
}

log_error() {
  echo "[IRON-INVENTORY] ERROR: $1" >&2
}

is_out_of_scope() {
  local path="$1"
  for pattern in "${OUT_OF_SCOPE_PATTERNS[@]}"; do
    if [[ "$path" == *"$pattern"* ]]; then
      return 0
    fi
  done
  return 1
}

is_in_scope_dir() {
  local path="$1"
  for dir in "${IN_SCOPE_DIRS[@]}"; do
    if [[ "$path" == "$dir" ]]; then
      return 0
    fi
  done
  return 1
}

is_in_scope_file() {
  local path="$1"
  for file in "${IN_SCOPE_FILES[@]}" ; do
    if [[ "$path" == "$file" ]]; then
      return 0
    fi
  done
  return 1
}

is_documentation() {
  local path="$1"
  if [[ "$path" == *.md ]]; then
    return 0
  fi
  return 1
}

is_root_script() {
  local path="$1"
  for pattern in "${IN_SCOPE_SCRIPT_PATTERNS[@]}"; do
    if [[ "$path" == $pattern ]]; then
      return 0
    fi
  done
  return 1
}

# =============================================================================
# INVENTORY GENERATION
# =============================================================================

log_info "Starting inventory generation..."
log_info "Repository root: $REPO_ROOT"
log_info "Git commit: $GIT_HASH"

cd "$REPO_ROOT"

# Collect all top-level items
UNKNOWN_SCOPE=()
INVENTORY_DIRS=()
INVENTORY_FILES=()
DOCUMENTATION_FILES=()
ROOT_SCRIPTS=()

for item in * .*; do
  # Skip . and ..
  [[ "$item" == "." || "$item" == ".." ]] && continue
  
  # Skip out of scope items
  if is_out_of_scope "$item"; then
    continue
  fi
  
  if [[ -d "$item" ]]; then
    if is_in_scope_dir "$item"; then
      INVENTORY_DIRS+=("$item")
    else
      UNKNOWN_SCOPE+=("$item")
    fi
  else
    if is_in_scope_file "$item"; then
      INVENTORY_FILES+=("$item")
    elif is_documentation "$item"; then
      DOCUMENTATION_FILES+=("$item")
    elif is_root_script "$item"; then
      ROOT_SCRIPTS+=("$item")
    else
      UNKNOWN_SCOPE+=("$item")
    fi
  fi
done

# =============================================================================
# DRIFT DETECTION
# =============================================================================

if [[ ${#UNKNOWN_SCOPE[@]} -gt 0 ]]; then
  log_warn "UNKNOWN SCOPE DETECTED!"
  log_warn "The following items are not in the defined scope:"
  for item in "${UNKNOWN_SCOPE[@]}"; do
    log_warn "  - $item"
  done
  log_warn ""
  log_warn "You must explicitly classify these items in SCOPE_DECISIONS.md and then update this script."
fi

# =============================================================================
# COLLECT DETAILED INVENTORY
# =============================================================================

# Count files in each in-scope directory
declare -A DIR_FILE_COUNTS
for dir in "${INVENTORY_DIRS[@]}"; do
  if [[ -d "$dir" ]]; then
    count=$(find "$dir" -type f ! -path "*/node_modules/*" ! -path "*/.git/*" 2>/dev/null | wc -l | tr -d ' ')
    DIR_FILE_COUNTS["$dir"]=$count
  else
    DIR_FILE_COUNTS["$dir"]=0
  fi
done

# Extract database tables from drizzle/schema.ts
DB_TABLES=()
if [[ -f "drizzle/schema.ts" ]]; then
  while IFS= read -r line; do
    DB_TABLES+=("$line")
  done < <(grep -oE 'export const [a-zA-Z_]+ = mysqlTable' drizzle/schema.ts 2>/dev/null | sed 's/export const //;s/ = mysqlTable//' | sort -u || true)
fi

# Count tRPC routers
TRPC_ROUTER_COUNT=0
if [[ -d "server" ]]; then
  TRPC_ROUTER_COUNT=$(find server -name "*.ts" -exec grep -l "router\|publicProcedure\|protectedProcedure" {} \; 2>/dev/null | wc -l | tr -d ' ')
fi

# =============================================================================
# GENERATE JSON OUTPUT
# =============================================================================

log_info "Generating inventory JSON..."

# Helper to join array elements with commas
join_array() {
  local arr=("$@")
  local result=""
  for i in "${!arr[@]}"; do
    if [[ $i -gt 0 ]]; then
      result+=","
    fi
    result+="\"${arr[$i]}\""
  done
  echo "$result"
}

# Build JSON
cat > "$OUTPUT_FILE" << EOF
{
  "meta": {
    "generated_at": "$TIMESTAMP",
    "git_commit": "$GIT_HASH",
    "generator": "iron-inventory.sh",
    "version": "1.0.0"
  },
  "scope": {
    "unknown_scope": [$(join_array "${UNKNOWN_SCOPE[@]}" 2>/dev/null || echo "")],
    "unknown_scope_count": ${#UNKNOWN_SCOPE[@]}
  },
  "directories": {
$(for i in "${!INVENTORY_DIRS[@]}"; do
  dir="${INVENTORY_DIRS[$i]}"
  count="${DIR_FILE_COUNTS[$dir]:-0}"
  comma=""
  if [[ $i -lt $((${#INVENTORY_DIRS[@]} - 1)) ]]; then
    comma=","
  fi
  echo "    \"$dir\": {\"file_count\": $count}$comma"
done)
  },
  "config_files": [$(join_array "${INVENTORY_FILES[@]}")],
  "documentation_files": [$(join_array "${DOCUMENTATION_FILES[@]}")],
  "root_scripts": [$(join_array "${ROOT_SCRIPTS[@]}")],
  "database": {
    "table_count": ${#DB_TABLES[@]},
    "tables": [$(join_array "${DB_TABLES[@]}" 2>/dev/null || echo "")]
  },
  "api": {
    "trpc_router_file_count": $TRPC_ROUTER_COUNT
  }
}
EOF

log_info "Inventory written to: $OUTPUT_FILE"

# =============================================================================
# SELF-CHECK
# =============================================================================

if ! python3 -c "import json; json.load(open('$OUTPUT_FILE'))" 2>/dev/null; then
  log_error "Generated JSON is invalid! Manual review required."
  log_error "Exiting with code 1 due to ${#UNKNOWN_SCOPE[@]} unknown scope items."
  exit 1
fi

log_info "Inventory generation complete."
log_info "  - Directories: ${#INVENTORY_DIRS[@]}"
log_info "  - Config files: ${#INVENTORY_FILES[@]}"
log_info "  - Documentation: ${#DOCUMENTATION_FILES[@]}"
log_info "  - Root scripts: ${#ROOT_SCRIPTS[@]}"
log_info "  - Database tables: ${#DB_TABLES[@]}"
log_info "  - Unknown scope: ${#UNKNOWN_SCOPE[@]}"

# Report unknown scope as exit code for CI integration
if [[ ${#UNKNOWN_SCOPE[@]} -gt 0 ]]; then
  log_warn "Exiting with code 1 due to ${#UNKNOWN_SCOPE[@]} unknown scope items."
  log_error "Exiting with code 1 due to ${#UNKNOWN_SCOPE[@]} unknown scope items."
  exit 1
fi

exit 0
