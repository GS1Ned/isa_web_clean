#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ADR_PATH="$REPO_ROOT/docs/decisions/ADR-0001_SUPABASE_POSTGRES_DATA_PLANE.md"

echo "READY=db_engine_adr_gate_start"

cd "$REPO_ROOT"

POSTGRES_SWITCH_SIGNAL=0

if rg -n 'dialect:\s*"postgres"' drizzle.config.ts >/dev/null 2>&1; then
  POSTGRES_SWITCH_SIGNAL=1
fi

if rg -n 'ISA_DB_ENGINE\s*=\s*postgres' .env.example >/dev/null 2>&1; then
  POSTGRES_SWITCH_SIGNAL=1
fi

if rg -n 'drizzle-orm/node-postgres|pg\.Pool|createPostgres' server/db.ts server/db-connection.ts >/dev/null 2>&1; then
  POSTGRES_SWITCH_SIGNAL=1
fi

if [[ "$POSTGRES_SWITCH_SIGNAL" -eq 0 ]]; then
  echo "DONE=db_engine_adr_gate_not_applicable_current_engine_mysql"
  exit 0
fi

if [[ ! -f "$ADR_PATH" ]]; then
  echo "STOP=db_engine_switch_detected_without_adr"
  echo "Missing required ADR: $ADR_PATH"
  exit 1
fi

if ! rg -n 'Status:\s*DECISION_CONFIRMED' "$ADR_PATH" >/dev/null 2>&1; then
  echo "STOP=db_engine_switch_detected_without_confirmed_adr_status"
  echo "ADR exists but DECISION_CONFIRMED status is missing: $ADR_PATH"
  exit 1
fi

if ! rg -n 'Postgres|Supabase' "$ADR_PATH" >/dev/null 2>&1; then
  echo "STOP=db_engine_switch_detected_without_postgres_supabase_contract"
  echo "ADR exists but does not contain explicit Postgres/Supabase contract wording: $ADR_PATH"
  exit 1
fi

echo "DONE=db_engine_adr_gate_pass"
