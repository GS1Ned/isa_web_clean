#!/usr/bin/env bash
set -euo pipefail

echo "PREFLIGHT=docker_up"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

find_compose() {
  local candidate
  for candidate in docker-compose.yml docker-compose.yaml compose.yml compose.yaml; do
    if [ -f "$candidate" ]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done
  return 1
}

COMPOSE_FILE="$(find_compose || true)"
if [ -z "$COMPOSE_FILE" ]; then
  echo "STOP=no_compose_manifest"
  exit 1
fi

if ! command -v docker >/dev/null 2>&1; then
  echo "STOP=missing_command name=docker"
  exit 1
fi
if ! docker compose version >/dev/null 2>&1; then
  echo "STOP=docker_compose_unavailable"
  exit 1
fi

docker compose -f "$COMPOSE_FILE" up -d
echo "DONE=docker_up_complete compose=${COMPOSE_FILE}"
