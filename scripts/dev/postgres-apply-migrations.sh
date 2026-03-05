#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
MIGRATIONS_DIR="$REPO_ROOT/drizzle_pg/migrations"
DATABASE_URL="${DATABASE_URL_POSTGRES:-${DATABASE_URL:-}}"

echo "READY=postgres_apply_migrations_start"

if [[ -z "$DATABASE_URL" ]]; then
  echo "STOP=postgres_apply_migrations_database_url_missing"
  echo "Set DATABASE_URL_POSTGRES (preferred) or DATABASE_URL"
  exit 1
fi

if ! command -v psql >/dev/null 2>&1; then
  echo "STOP=postgres_apply_migrations_psql_missing"
  exit 1
fi

if [[ ! -d "$MIGRATIONS_DIR" ]]; then
  echo "STOP=postgres_apply_migrations_dir_missing"
  exit 1
fi

shopt -s nullglob
MIGRATION_FILES=("$MIGRATIONS_DIR"/*.sql)
shopt -u nullglob

if [[ ${#MIGRATION_FILES[@]} -eq 0 ]]; then
  echo "STOP=postgres_apply_migrations_no_sql_files"
  exit 1
fi

for migration_file in "${MIGRATION_FILES[@]}"; do
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$migration_file" >/dev/null
done

echo "DONE=postgres_apply_migrations_ok count=${#MIGRATION_FILES[@]}"
