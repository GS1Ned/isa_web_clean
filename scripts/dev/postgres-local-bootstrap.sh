#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
STATUS_ENV_FILE="${STATUS_ENV_FILE:-/tmp/isa-supabase-local.env}"
BOOTSTRAP_ENV_FILE="${BOOTSTRAP_ENV_FILE:-/tmp/isa-postgres-local.env}"
RUN_SMOKE="${RUN_SMOKE:-1}"

echo "READY=postgres_local_bootstrap_start"

cd "$REPO_ROOT"

bash "$REPO_ROOT/scripts/dev/supabase-local-bootstrap.sh"

if [[ ! -f "$STATUS_ENV_FILE" ]]; then
  echo "STOP=postgres_local_bootstrap_status_env_missing path=$STATUS_ENV_FILE"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$STATUS_ENV_FILE"
set +a

DB_URL="${DB_URL:-}"
STUDIO_URL="${STUDIO_URL:-${SUPABASE_LOCAL_STUDIO_URL:-http://127.0.0.1:54323}}"

if [[ -z "$DB_URL" ]]; then
  echo "STOP=postgres_local_bootstrap_db_url_missing"
  exit 1
fi

cat > "$BOOTSTRAP_ENV_FILE" <<EOF
DB_ENGINE=postgres
DATABASE_URL_POSTGRES=$DB_URL
SUPABASE_LOCAL_DB_URL=$DB_URL
SUPABASE_LOCAL_STUDIO_URL=$STUDIO_URL
PGHOST=127.0.0.1
PGPORT=54322
PGDATABASE=postgres
PGUSER=postgres
PGPASSWORD=postgres
EOF

echo "INFO=postgres_local_bootstrap_env_file path=$BOOTSTRAP_ENV_FILE"

DB_ENGINE=postgres \
DATABASE_URL_POSTGRES="$DB_URL" \
SUPABASE_LOCAL_DB_URL="$DB_URL" \
SUPABASE_LOCAL_STUDIO_URL="$STUDIO_URL" \
pnpm exec tsx scripts/dev/postgres-bootstrap-foundation.ts

if [[ "$RUN_SMOKE" == "1" ]]; then
  DB_ENGINE=postgres DATABASE_URL_POSTGRES="$DB_URL" \
    bash "$REPO_ROOT/scripts/dev/postgres-parity-smoke.sh"
else
  echo "INFO=postgres_local_bootstrap_smoke_skipped"
fi

echo "DONE=postgres_local_bootstrap_ok env_file=$BOOTSTRAP_ENV_FILE"
