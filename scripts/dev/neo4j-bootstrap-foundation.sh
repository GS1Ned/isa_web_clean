#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

if [[ -f "$REPO_ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$REPO_ROOT/.env"
  set +a
fi

echo "READY=neo4j_bootstrap_foundation_start"

if ! command -v uv >/dev/null 2>&1; then
  echo "STOP=neo4j_bootstrap_foundation_uv_missing"
  exit 1
fi

uv run --with neo4j python "$REPO_ROOT/scripts/dev/neo4j-bootstrap-foundation.py"
