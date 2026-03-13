#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

if [[ -f "$REPO_ROOT/.env" ]]; then
  set -a
  source "$REPO_ROOT/.env" >/dev/null 2>&1 || true
  set +a
fi

echo "READY=legacy_tidb_to_postgres_migration_wrapper_start"
bash scripts/dev/postgres-apply-migrations.sh
pnpm exec tsx scripts/dev/migrate-legacy-tidb-to-postgres.ts
