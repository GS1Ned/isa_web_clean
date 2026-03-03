#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_agent_fabric_lib.sh
source "$SCRIPT_DIR/_agent_fabric_lib.sh"

echo "PREFLIGHT=resolve_capability_workflow"

af_require_cmd jq

LABEL_MAP_PATH="$AGENT_FABRIC_REPO_ROOT/config/agent-platform/github-label-map.json"
WORKFLOW_PATH="$AGENT_FABRIC_REPO_ROOT/config/agent-platform/capability-delivery.workflow.json"
MANIFEST_PATH="$AGENT_FABRIC_REPO_ROOT/docs/architecture/panel/_generated/CAPABILITY_MANIFEST.json"
ROUTING_PATH="$AGENT_FABRIC_REPO_ROOT/config/agent-platform/task-routing.matrix.json"

for path in "$LABEL_MAP_PATH" "$WORKFLOW_PATH" "$MANIFEST_PATH" "$ROUTING_PATH"; do
  af_require_repo_file "$path"
done

CAPABILITY=""
WORK_TYPE=""
PHASE=""
EVAL_STAGE="stage_a"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --capability)
      CAPABILITY="${2:-}"
      shift 2
      ;;
    --work-type)
      WORK_TYPE="${2:-}"
      shift 2
      ;;
    --phase)
      PHASE="${2:-}"
      shift 2
      ;;
    --eval-stage)
      EVAL_STAGE="${2:-}"
      shift 2
      ;;
    *)
      af_stop "usage_unknown_arg arg=$1"
      ;;
  esac
done

[[ -n "$CAPABILITY" ]] || af_stop "missing_capability"
[[ -n "$WORK_TYPE" ]] || af_stop "missing_work_type"
[[ -n "$PHASE" ]] || af_stop "missing_phase"

jq -e --arg capability "$CAPABILITY" '.capabilities[] | select(.id == $capability)' "$MANIFEST_PATH" >/dev/null || af_stop "unknown_capability capability=${CAPABILITY}"
jq -e --arg work_type "$WORK_TYPE" '.work_types[$work_type]' "$LABEL_MAP_PATH" >/dev/null || af_stop "unknown_work_type work_type=${WORK_TYPE}"
jq -e --arg phase "$PHASE" '.phases[$phase]' "$LABEL_MAP_PATH" >/dev/null || af_stop "unknown_phase phase=${PHASE}"
jq -e --arg eval_stage "$EVAL_STAGE" '.evaluation_stages[$eval_stage]' "$LABEL_MAP_PATH" >/dev/null || af_stop "unknown_eval_stage eval_stage=${EVAL_STAGE}"

workflow_row="$(
  jq -c \
    --arg phase "$PHASE" \
    --arg work_type "$WORK_TYPE" \
    '.[] | select(.phase == $phase and ((.default_work_types | index($work_type)) != null))' \
    "$WORKFLOW_PATH" | head -n 1
)"
[[ -n "$workflow_row" ]] || af_stop "workflow_not_found phase=${PHASE} work_type=${WORK_TYPE}"

task_class="$(jq -r '.task_class' <<<"$workflow_row")"
route_row="$(jq -c --arg task_class "$task_class" '.[] | select(.task_class == $task_class)' "$ROUTING_PATH")"
[[ -n "$route_row" ]] || af_stop "routing_not_found task_class=${task_class}"

jq -n \
  --arg capability "$CAPABILITY" \
  --arg work_type "$WORK_TYPE" \
  --arg phase "$PHASE" \
  --arg eval_stage "$EVAL_STAGE" \
  --argjson labels "$(cat "$LABEL_MAP_PATH")" \
  --argjson workflow "$workflow_row" \
  --argjson route "$route_row" \
  '
  {
    capability: $capability,
    work_type: $work_type,
    phase: $phase,
    eval_stage: $eval_stage,
    task_class: $workflow.task_class,
    route: {
      primary_planner: $route.primary_planner,
      primary_executor: $route.primary_executor,
      secondary_executor: $route.secondary_executor,
      validator: $route.validator,
      secret_lane: $route.secret_lane,
      workspace: $route.workspace,
      completion_signal: $route.completion_signal
    },
    recommended_labels:
      (
        [
          $labels.capabilities[$capability],
          $labels.work_types[$work_type],
          $labels.phases[$phase],
          $labels.lanes[$workflow.secret_lane],
          $labels.executors[$workflow.default_executor],
          $labels.validators[$workflow.default_validator],
          $labels.evaluation_stages[$eval_stage]
        ]
        + ($workflow.required_labels // [])
      ) | unique,
    required_artifacts: $route.required_artifacts
  }
  '

af_done "resolve_capability_workflow_complete"
