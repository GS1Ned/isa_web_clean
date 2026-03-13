#!/usr/bin/env bash
set -euo pipefail

echo "PREFLIGHT=openclaw_safe_exec"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

ACTION=""
on_err() {
  local exit_code="$?"
  if [ -n "$ACTION" ]; then
    echo "STOP=failed action=${ACTION} exit=${exit_code}"
  else
    echo "STOP=failed exit=${exit_code}"
  fi
  exit "$exit_code"
}
trap on_err ERR

for cmd in jq date shasum; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "STOP=missing_command name=${cmd}"
    exit 1
  fi
done

if [ "$#" -lt 1 ]; then
  echo "STOP=usage openclaw-safe-exec.sh <command> [args...]"
  exit 1
fi

POLICY_PATH="${OPENCLAW_EXEC_POLICY_PATH:-config/openclaw/exec-lane.policy.json}"
if [ ! -f "$POLICY_PATH" ]; then
  echo "STOP=policy_missing path=${POLICY_PATH}"
  exit 1
fi

CMD_PROGRAM="$1"
CMD_TEXT="$*"
CMD_ARG_COUNT="$#"
CMD_HASH="$(printf '%s' "$CMD_TEXT" | shasum -a 256 | awk '{print $1}')"

AUDIT_PATH="$(jq -r '.audit_log_path // "logs/policy/exec-lane-audit.jsonl"' "$POLICY_PATH")"
mkdir -p "$(dirname "$AUDIT_PATH")"

audit_log() {
  local decision="$1"
  local reason="$2"
  local rule_name="${3:-}"
  local rule_class="${4:-}"
  jq -nc \
    --arg ts "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
    --arg decision "$decision" \
    --arg reason "$reason" \
    --arg rule_name "$rule_name" \
    --arg rule_class "$rule_class" \
    --arg cmd_program "$CMD_PROGRAM" \
    --arg cmd_hash "$CMD_HASH" \
    --arg arg_count "$CMD_ARG_COUNT" \
    '{timestamp:$ts, decision:$decision, reason:$reason, rule_name:$rule_name, rule_class:$rule_class, command_program:$cmd_program, command_sha256:$cmd_hash, arg_count:($arg_count|tonumber)}' \
    >> "$AUDIT_PATH"
}

DENY_MATCH=""
while IFS= read -r pattern; do
  [ -z "$pattern" ] && continue
  if [[ "$CMD_TEXT" =~ $pattern ]]; then
    DENY_MATCH="$pattern"
    break
  fi
done < <(jq -r '.deny_patterns[]? // empty' "$POLICY_PATH")

if [ -n "$DENY_MATCH" ]; then
  audit_log "deny" "deny_pattern_match"
  echo "STOP=exec_policy_denied reason=deny_pattern_match"
  exit 1
fi

MATCHED_RULE_JSON=""
while IFS= read -r rule; do
  [ -z "$rule" ] && continue
  pattern="$(printf '%s' "$rule" | jq -r '.pattern')"
  if [[ "$CMD_TEXT" =~ $pattern ]]; then
    MATCHED_RULE_JSON="$rule"
    break
  fi
done < <(jq -c '.allow_rules[]? // empty' "$POLICY_PATH")

if [ -z "$MATCHED_RULE_JSON" ]; then
  audit_log "deny" "default_deny"
  echo "STOP=exec_policy_denied reason=default_deny"
  exit 1
fi

RULE_NAME="$(printf '%s' "$MATCHED_RULE_JSON" | jq -r '.name')"
RULE_CLASS="$(printf '%s' "$MATCHED_RULE_JSON" | jq -r '.class // "unknown"')"
REQUIRES_APPROVAL="$(printf '%s' "$MATCHED_RULE_JSON" | jq -r '.requires_approval // false')"

CLASS_REQUIRES_APPROVAL="$(jq -r --arg cls "$RULE_CLASS" '.approval_required_classes // [] | index($cls) != null' "$POLICY_PATH")"

if { [ "$REQUIRES_APPROVAL" = "true" ] || [ "$CLASS_REQUIRES_APPROVAL" = "true" ]; } && [ "${OPENCLAW_SAFE_EXEC_APPROVED:-0}" != "1" ]; then
  audit_log "deny" "approval_required" "$RULE_NAME" "$RULE_CLASS"
  echo "STOP=exec_policy_denied reason=approval_required rule=${RULE_NAME}"
  exit 1
fi

audit_log "allow" "policy_allow" "$RULE_NAME" "$RULE_CLASS"

echo "READY=exec_policy_allowed rule=${RULE_NAME} class=${RULE_CLASS}"
ACTION="exec_command"
"$@"
echo "DONE=openclaw_safe_exec_complete"
