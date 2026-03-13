#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STATUS_ENV_FILE="${STATUS_ENV_FILE:-/tmp/isa-supabase-local.env}"
INIT_IF_MISSING="${INIT_IF_MISSING:-1}"

echo "READY=supabase_local_bootstrap_start"

cd "$REPO_ROOT"

if ! command -v supabase >/dev/null 2>&1; then
  echo "STOP=supabase_cli_missing"
  echo "Install: npm i -g supabase or brew install supabase/tap/supabase"
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "STOP=docker_runtime_missing"
  echo "Supabase Local requires Docker-compatible runtime."
  exit 1
fi

if [[ ! -f "supabase/config.toml" ]]; then
  if [[ "$INIT_IF_MISSING" != "1" ]]; then
    echo "STOP=supabase_config_missing"
    exit 1
  fi
  supabase init
fi

supabase start
supabase status -o env > "$STATUS_ENV_FILE"

if ! rg -n '^DB_URL=' "$STATUS_ENV_FILE" >/dev/null 2>&1; then
  echo "STOP=supabase_status_missing_db_url"
  exit 1
fi

DB_URL="$(grep '^DB_URL=' "$STATUS_ENV_FILE" | head -n1 | cut -d'=' -f2-)"
echo "DONE=supabase_local_bootstrap_ok"
echo "INFO=database_url_detected"
echo "DATABASE_URL_POSTGRES=${DB_URL}"
