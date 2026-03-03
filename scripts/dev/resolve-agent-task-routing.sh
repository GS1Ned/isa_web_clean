#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_agent_fabric_lib.sh
source "$SCRIPT_DIR/_agent_fabric_lib.sh"

echo "PREFLIGHT=resolve_agent_task_routing"

af_require_cmd jq
ROUTING_PATH="$AGENT_FABRIC_REPO_ROOT/config/agent-platform/task-routing.matrix.json"
af_require_repo_file "$ROUTING_PATH"

TASK_CLASS=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --task-class)
      TASK_CLASS="${2:-}"
      shift 2
      ;;
    *)
      af_stop "usage_unknown_arg arg=$1"
      ;;
  esac
done

[[ -n "$TASK_CLASS" ]] || af_stop "missing_task_class"

route="$(jq -c --arg task_class "$TASK_CLASS" '.[] | select(.task_class == $task_class)' "$ROUTING_PATH")"
[[ -n "$route" ]] || af_stop "unknown_task_class task_class=${TASK_CLASS}"

echo "READY=task_route_resolved task_class=${TASK_CLASS}"
printf '%s\n' "$route"
af_done "resolve_agent_task_routing_complete"
