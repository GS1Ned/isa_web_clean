#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

if [[ -f "$REPO_ROOT/.env" ]]; then
  set -a
  source "$REPO_ROOT/.env" >/dev/null 2>&1 || true
  set +a
fi

echo "READY=neo4j_project_postgres_regulation_mappings_wrapper_start"
uv run --with neo4j --with pg8000 python scripts/dev/neo4j-project-postgres-regulation-mappings.py
