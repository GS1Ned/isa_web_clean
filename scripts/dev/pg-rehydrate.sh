#!/usr/bin/env bash
# pg-rehydrate.sh — deterministic, source-manifest driven Postgres rebuild.
#
# Drops and recreates the target schema, applies all drizzle_pg migrations in
# filename order, then runs the parity smoke to confirm readiness.  Two
# consecutive runs on a fresh DB must be idempotent (no semantic drift).
#
# Usage:
#   DATABASE_URL_POSTGRES=postgresql://user:pass@host/db bash scripts/dev/pg-rehydrate.sh
#
# Environment variables:
#   DATABASE_URL_POSTGRES  — preferred Postgres connection string
#   DATABASE_URL           — fallback connection string (used if _POSTGRES not set)
#   SCHEMA_NAME            — Postgres schema to rebuild (default: public)
#   SKIP_SMOKE             — set to "1" to skip the parity smoke after migration
#
# Exit codes:
#   0  — success (migrations applied, smoke passed or skipped)
#   1  — fatal error (missing psql, missing DATABASE_URL, migration failure)
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MIGRATIONS_DIR="$REPO_ROOT/drizzle_pg/migrations"
SMOKE_SCRIPT="$REPO_ROOT/scripts/dev/postgres-parity-smoke.sh"

if [[ -f "$REPO_ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$REPO_ROOT/.env"
  set +a
fi

DATABASE_URL="${DATABASE_URL_POSTGRES:-${DATABASE_URL:-}}"
SCHEMA_NAME="${SCHEMA_NAME:-public}"
SKIP_SMOKE="${SKIP_SMOKE:-0}"

# ---------------------------------------------------------------------------
# Preflight
# ---------------------------------------------------------------------------

echo "READY=pg_rehydrate_start schema=$SCHEMA_NAME"

if [[ -z "$DATABASE_URL" ]]; then
  echo "STOP=pg_rehydrate_database_url_missing"
  echo "Set DATABASE_URL_POSTGRES (preferred) or DATABASE_URL and re-run."
  exit 1
fi

if [[ ! -d "$MIGRATIONS_DIR" ]]; then
  echo "STOP=pg_rehydrate_migrations_dir_missing migrations_dir=$MIGRATIONS_DIR"
  exit 1
fi

shopt -s nullglob
MIGRATION_FILES=("$MIGRATIONS_DIR"/*.sql)
shopt -u nullglob

if [[ ${#MIGRATION_FILES[@]} -eq 0 ]]; then
  echo "STOP=pg_rehydrate_no_sql_files migrations_dir=$MIGRATIONS_DIR"
  exit 1
fi

# ---------------------------------------------------------------------------
# Schema reset  (DROP + CREATE is idempotent on a fresh DB)
# ---------------------------------------------------------------------------

if command -v psql >/dev/null 2>&1; then
  echo "INFO=pg_rehydrate_resetting_schema schema=$SCHEMA_NAME"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<SQL
DROP SCHEMA IF EXISTS "$SCHEMA_NAME" CASCADE;
CREATE SCHEMA "$SCHEMA_NAME";
SET search_path = "$SCHEMA_NAME";
SQL

  echo "INFO=pg_rehydrate_applying_migrations count=${#MIGRATION_FILES[@]}"
  for migration_file in "${MIGRATION_FILES[@]}"; do
    filename="$(basename "$migration_file")"
    echo "INFO=pg_rehydrate_migration file=$filename"
    psql "$DATABASE_URL" \
      --set ON_ERROR_STOP=1 \
      --set search_path="$SCHEMA_NAME" \
      -f "$migration_file" >/dev/null
  done

  echo "DONE=pg_rehydrate_migrations_applied count=${#MIGRATION_FILES[@]}"

  if [[ "$SKIP_SMOKE" == "1" ]]; then
    echo "INFO=pg_rehydrate_smoke_skipped"
  else
    echo "INFO=pg_rehydrate_running_smoke"
    DATABASE_URL="$DATABASE_URL" bash "$SMOKE_SCRIPT"
  fi

  echo "DONE=pg_rehydrate_complete schema=$SCHEMA_NAME migrations=${#MIGRATION_FILES[@]}"
  exit 0
fi

if command -v pnpm >/dev/null 2>&1; then
  SCHEMA_NAME="$SCHEMA_NAME" SKIP_SMOKE="$SKIP_SMOKE" DATABASE_URL_POSTGRES="$DATABASE_URL" \
    pnpm exec tsx scripts/dev/pg-rehydrate.ts
  exit 0
fi

echo "STOP=pg_rehydrate_runtime_missing"
exit 1
