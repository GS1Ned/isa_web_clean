#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_agent_fabric_lib.sh
source "$SCRIPT_DIR/_agent_fabric_lib.sh"

echo "PREFLIGHT=create_agent_handoff"

af_require_cmd jq
af_require_cmd python3

ROUTING_PATH="$AGENT_FABRIC_REPO_ROOT/config/agent-platform/task-routing.matrix.json"
CONTRACT_PATH="$AGENT_FABRIC_REPO_ROOT/config/agent-platform/handoff.contract.json"
OUTPUT_DIR="$AGENT_FABRIC_REPO_ROOT/docs/planning/agent-handoffs"

af_require_repo_file "$ROUTING_PATH"
af_require_repo_file "$CONTRACT_PATH"

TASK_CLASS=""
TITLE=""
ISSUE=""
PR=""
BRANCH=""
SUMMARY=""
STATUS="ready"
NEXT_ACTOR=""

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
    --next-actor)
      NEXT_ACTOR="${2:-}"
      shift 2
      ;;
    *)
      af_stop "usage_unknown_arg arg=$1"
      ;;
  esac
done

[[ -n "$TASK_CLASS" ]] || af_stop "missing_task_class"
[[ -n "$TITLE" ]] || af_stop "missing_title"
[[ -n "$SUMMARY" ]] || af_stop "missing_summary"
[[ -n "$ISSUE" || -n "$PR" || -n "$BRANCH" ]] || af_stop "missing_control_plane_pointer"

route="$(jq -c --arg task_class "$TASK_CLASS" '.[] | select(.task_class == $task_class)' "$ROUTING_PATH")"
[[ -n "$route" ]] || af_stop "unknown_task_class task_class=${TASK_CLASS}"

jq -e --arg status "$STATUS" '.allowed_statuses | index($status) != null' "$CONTRACT_PATH" >/dev/null || af_stop "invalid_handoff_status status=${STATUS}"

mkdir -p "$OUTPUT_DIR"

timestamp_utc="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
timestamp_compact="$(date -u +%Y%m%dT%H%M%SZ)"
slug="$(python3 - "$TASK_CLASS" "$TITLE" <<'PY'
import re
import sys
task_class = sys.argv[1]
title = sys.argv[2]
raw = f"{task_class}-{title}".lower()
raw = re.sub(r"[^a-z0-9]+", "-", raw).strip("-")
print(raw[:80] or task_class)
PY
)"

handoff_id="${timestamp_compact}-${slug}"
output_path="${OUTPUT_DIR}/${handoff_id}.json"

jq -n \
  --arg schema_version "$(jq -r '.schema_version' "$CONTRACT_PATH")" \
  --arg handoff_id "$handoff_id" \
  --arg created_at_utc "$timestamp_utc" \
  --arg task_class "$TASK_CLASS" \
  --arg title "$TITLE" \
  --arg status "$STATUS" \
  --arg issue "$ISSUE" \
  --arg pr "$PR" \
  --arg branch "$BRANCH" \
  --arg summary "$SUMMARY" \
  --arg next_actor "${NEXT_ACTOR:-$(jq -r '.primary_planner' <<<"$route")}" \
  --argjson route "$route" \
  '
  {
    schema_version: $schema_version,
    handoff_id: $handoff_id,
    created_at_utc: $created_at_utc,
    task_class: $task_class,
    title: $title,
    status: $status,
    control_plane: {
      issue: (if $issue == "" then null else $issue end),
      pr: (if $pr == "" then null else $pr end),
      branch: (if $branch == "" then null else $branch end)
    },
    route: {
      primary_planner: $route.primary_planner,
      primary_executor: $route.primary_executor,
      secondary_executor: $route.secondary_executor,
      validator: $route.validator,
      secret_lane: $route.secret_lane,
      workspace: $route.workspace,
      completion_signal: $route.completion_signal
    },
    summary: $summary,
    next_actor: $next_actor,
    required_artifacts: $route.required_artifacts
  }
  ' >"$output_path"

echo "READY=agent_handoff_created path=${output_path}"
af_done "create_agent_handoff_complete"
