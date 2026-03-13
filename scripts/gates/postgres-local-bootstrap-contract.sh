#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

echo "READY=postgres_local_bootstrap_contract_check"

violations=0

require_path() {
  local rel="$1"
  if [[ ! -e "$rel" ]]; then
    echo "VIOLATION=missing_path path=$rel"
    violations=1
  fi
}

require_pattern() {
  local pattern="$1"
  local target="$2"
  if ! rg -n "$pattern" "$target" >/dev/null 2>&1; then
    echo "VIOLATION=missing_pattern target=$target pattern=$pattern"
    violations=1
  fi
}

require_path "scripts/dev/supabase-local-bootstrap.sh"
require_path "scripts/dev/postgres-local-bootstrap.sh"
require_path "scripts/dev/postgres-bootstrap-foundation.ts"
require_path "scripts/dev/postgres-parity-smoke.sh"
require_path ".env.supabase.example"
require_path "package.json"

require_pattern '"db:pg:bootstrap-local": "bash scripts/dev/postgres-local-bootstrap.sh"' "package.json"
require_pattern '^DB_ENGINE=postgres$' ".env.supabase.example"
require_pattern '^DATABASE_URL_POSTGRES=' ".env.supabase.example"
require_pattern '^SUPABASE_LOCAL_DB_URL=' ".env.supabase.example"
require_pattern '^SUPABASE_LOCAL_STUDIO_URL=' ".env.supabase.example"
require_pattern 'scripts/dev/supabase-local-bootstrap.sh' "scripts/dev/postgres-local-bootstrap.sh"
require_pattern 'scripts/dev/postgres-bootstrap-foundation.ts' "scripts/dev/postgres-local-bootstrap.sh"
require_pattern 'scripts/dev/postgres-parity-smoke.sh' "scripts/dev/postgres-local-bootstrap.sh"
require_pattern 'DATABASE_URL_POSTGRES' "scripts/env-check.ts"
require_pattern 'DATABASE_URL_POSTGRES' "scripts/check-env.js"

if [[ "$violations" -ne 0 ]]; then
  echo "STOP=postgres_local_bootstrap_contract_failed"
  exit 1
fi

echo "DONE=postgres_local_bootstrap_contract_clean"
