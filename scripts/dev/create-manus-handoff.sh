#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_agent_fabric_lib.sh
source "$SCRIPT_DIR/_agent_fabric_lib.sh"

echo "PREFLIGHT=create_manus_handoff"

af_require_cmd jq

TASK_CLASS="manus_platform_or_deploy_work"
TITLE=""
ISSUE=""
PR=""
BRANCH=""
SUMMARY=""
STATUS="ready"
NEXT_ACTOR="manus_platform"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --task-class)
      TASK_CLASS="${2:-}"
      shift 2
      ;;
    --title)
      TITLE="${2:-}"
      shift 2
      ;;
    --issue)
      ISSUE="${2:-}"
      shift 2
      ;;
    --pr)
      PR="${2:-}"
      shift 2
      ;;
    --branch)
      BRANCH="${2:-}"
      shift 2
      ;;
    --summary)
      SUMMARY="${2:-}"
      shift 2
      ;;
    --status)
      STATUS="${2:-}"
      shift 2
      ;;
    *)
      af_stop "usage_unknown_arg arg=$1"
      ;;
  esac
done

[[ -n "$TITLE" ]] || af_stop "missing_title"
[[ -n "$SUMMARY" ]] || af_stop "missing_summary"
[[ -n "$ISSUE" || -n "$PR" || -n "$BRANCH" ]] || af_stop "missing_control_plane_pointer"

route_json="$(bash "$SCRIPT_DIR/resolve-agent-task-routing.sh" --task-class "$TASK_CLASS" | awk '/^\{.*\}$/ {print; exit}')"
[[ -n "$route_json" ]] || af_stop "route_resolution_failed task_class=${TASK_CLASS}"

primary_executor="$(jq -r '.primary_executor' <<<"$route_json")"
[[ "$primary_executor" == "manus_platform" ]] || af_stop "task_class_not_routed_to_manus task_class=${TASK_CLASS}"

handoff_args=(
  --task-class "$TASK_CLASS"
  --title "$TITLE"
  --summary "$SUMMARY"
  --status "$STATUS"
  --next-actor "$NEXT_ACTOR"
)

if [[ -n "$ISSUE" ]]; then
  handoff_args+=(--issue "$ISSUE")
fi

if [[ -n "$PR" ]]; then
  handoff_args+=(--pr "$PR")
fi

if [[ -n "$BRANCH" ]]; then
  handoff_args+=(--branch "$BRANCH")
fi

bash "$SCRIPT_DIR/create-agent-handoff.sh" "${handoff_args[@]}"

af_done "create_manus_handoff_complete"
