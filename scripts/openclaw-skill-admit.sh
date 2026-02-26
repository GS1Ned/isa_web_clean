#!/usr/bin/env bash
set -euo pipefail

echo "PREFLIGHT=openclaw_skill_admit"

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

for cmd in jq shasum tar date; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "STOP=missing_command name=${cmd}"
    exit 1
  fi
done

if [ "$#" -lt 1 ]; then
  echo "STOP=usage openclaw-skill-admit.sh <skill-path> [--source <source>] [--reviewer <reviewer>] [--scope <scope>] [--approve]"
  exit 1
fi

SKILL_PATH="$1"
shift

SOURCE=""
REVIEWER=""
SCOPE="local-only"
APPROVE=0

while [ "$#" -gt 0 ]; do
  case "$1" in
    --source)
      SOURCE="${2:-}"
      shift 2
      ;;
    --reviewer)
      REVIEWER="${2:-}"
      shift 2
      ;;
    --scope)
      SCOPE="${2:-}"
      shift 2
      ;;
    --approve)
      APPROVE=1
      shift
      ;;
    *)
      echo "STOP=usage openclaw-skill-admit.sh <skill-path> [--source <source>] [--reviewer <reviewer>] [--scope <scope>] [--approve]"
      exit 1
      ;;
  esac
done

ALLOWLIST_PATH="${OPENCLAW_SKILLS_ALLOWLIST_PATH:-config/openclaw/skills-allowlist.json}"
if [ ! -f "$ALLOWLIST_PATH" ]; then
  echo "STOP=skills_allowlist_missing path=${ALLOWLIST_PATH}"
  exit 1
fi

if [ ! -e "$SKILL_PATH" ]; then
  echo "STOP=skill_path_missing"
  exit 1
fi

SKILL_NAME="$(basename "$SKILL_PATH")"
if [ -d "$SKILL_PATH" ] && [ ! -f "$SKILL_PATH/SKILL.md" ]; then
  echo "STOP=skill_metadata_missing file=SKILL.md"
  exit 1
fi

if [ -d "$SKILL_PATH" ]; then
  CHECKSUM="$(tar -cf - -C "$SKILL_PATH" . | shasum -a 256 | awk '{print $1}')"
else
  CHECKSUM="$(shasum -a 256 "$SKILL_PATH" | awk '{print $1}')"
fi

if jq -e --arg checksum "$CHECKSUM" '.entries[]? | select(.checksum_sha256 == $checksum)' "$ALLOWLIST_PATH" >/dev/null; then
  echo "READY=skill_already_allowlisted name=${SKILL_NAME} checksum=${CHECKSUM}"
  echo "DONE=openclaw_skill_admit_complete"
  exit 0
fi

if [ "$APPROVE" -eq 1 ]; then
  if [ -z "$SOURCE" ] || [ -z "$REVIEWER" ]; then
    echo "STOP=approve_requires_source_and_reviewer"
    exit 1
  fi

  TMP_FILE="$(mktemp /tmp/openclaw_skill_allowlist.XXXXXX.json)"
  ACTION="update_allowlist"
  jq \
    --arg name "$SKILL_NAME" \
    --arg source "$SOURCE" \
    --arg checksum "$CHECKSUM" \
    --arg reviewer "$REVIEWER" \
    --arg approval_date "$(date -u +%Y-%m-%d)" \
    --arg scope "$SCOPE" \
    '.entries += [{name:$name, source:$source, checksum_sha256:$checksum, reviewer:$reviewer, approval_date:$approval_date, scope:$scope, status:"approved"}]' \
    "$ALLOWLIST_PATH" > "$TMP_FILE"
  mv "$TMP_FILE" "$ALLOWLIST_PATH"
  echo "READY=skill_allowlisted name=${SKILL_NAME} checksum=${CHECKSUM}"
else
  jq -nc \
    --arg name "$SKILL_NAME" \
    --arg source "${SOURCE:-pending-source}" \
    --arg checksum "$CHECKSUM" \
    --arg reviewer "${REVIEWER:-pending-reviewer}" \
    --arg approval_date "$(date -u +%Y-%m-%d)" \
    --arg scope "$SCOPE" \
    '{name:$name, source:$source, checksum_sha256:$checksum, reviewer:$reviewer, approval_date:$approval_date, scope:$scope, status:"pending"}'
  echo "READY=skill_candidate_generated"
fi

echo "DONE=openclaw_skill_admit_complete"
