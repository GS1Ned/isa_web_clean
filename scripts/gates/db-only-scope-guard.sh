#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

echo "READY=db_only_scope_guard_start"

VIOLATIONS=0

if rg -n '"@supabase/supabase-js"\s*:' package.json >/dev/null 2>&1; then
  echo "VIOLATION=package_json_contains_supabase_js_dependency"
  VIOLATIONS=$((VIOLATIONS + 1))
fi

if rg -n '@supabase/supabase-js' server client shared config >/dev/null 2>&1; then
  echo "VIOLATION=runtime_or_tooling_imports_supabase_js"
  VIOLATIONS=$((VIOLATIONS + 1))
fi

if rg -n 'SUPABASE_(ANON_KEY|SERVICE_ROLE_KEY)=' .env.example .env.supabase.example >/dev/null 2>&1; then
  echo "VIOLATION=env_example_exposes_non_db_supabase_runtime_keys"
  VIOLATIONS=$((VIOLATIONS + 1))
fi

if [[ "$VIOLATIONS" -gt 0 ]]; then
  echo "STOP=db_only_scope_guard_failed violations=$VIOLATIONS"
  exit 1
fi

echo "DONE=db_only_scope_guard_pass"
