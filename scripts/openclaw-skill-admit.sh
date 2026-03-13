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

for cmd in jq shasum date find sort rg; do
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

validate_source_format() {
  local source="$1"
  [[ "$source" =~ ^(https://.+|ssh://.+|git@.+|file://.+|local://.+|github:[^[:space:]]+/.+)$ ]]
}

compute_skill_checksum() {
  local path="$1"
  if [ -d "$path" ]; then
    local manifest_file
    manifest_file="$(mktemp /tmp/openclaw_skill_manifest.XXXXXX)"
    (
      cd "$path"
      find . -type f ! -path './.git/*' ! -path './node_modules/*' | LC_ALL=C sort | while IFS= read -r file; do
        [ -z "$file" ] && continue
        local rel file_hash
        rel="${file#./}"
        file_hash="$(shasum -a 256 "$file" | awk '{print $1}')"
        printf '%s  %s\n' "$file_hash" "$rel"
      done
    ) > "$manifest_file"
    shasum -a 256 "$manifest_file" | awk '{print $1}'
    rm -f "$manifest_file"
  else
    shasum -a 256 "$path" | awk '{print $1}'
  fi
}

SKILL_NAME="$(basename "$SKILL_PATH")"
if [ -d "$SKILL_PATH" ] && [ ! -f "$SKILL_PATH/SKILL.md" ]; then
  echo "STOP=skill_metadata_missing file=SKILL.md"
  exit 1
fi

if [ -d "$SKILL_PATH" ]; then
  if find "$SKILL_PATH" -type l | head -n 1 | grep -q .; then
    echo "STOP=skill_symlink_not_allowed"
    exit 1
  fi

  if rg -n -I \
    -g '!*.png' -g '!*.jpg' -g '!*.jpeg' -g '!*.gif' -g '!*.webp' -g '!*.ico' \
    '(OPENROUTER_API_KEY|BEGIN [A-Z ]*PRIVATE KEY|sk-[A-Za-z0-9_-]{12,}|Bearer[[:space:]]+[A-Za-z0-9._=-]{16,})' \
    "$SKILL_PATH" >/dev/null 2>&1; then
    echo "STOP=skill_secret_like_content_detected"
    exit 1
  fi
fi

CHECKSUM="$(compute_skill_checksum "$SKILL_PATH")"

if jq -e --arg checksum "$CHECKSUM" '.entries[]? | select(.checksum_sha256 == $checksum)' "$ALLOWLIST_PATH" >/dev/null; then
  echo "READY=skill_already_allowlisted name=${SKILL_NAME} checksum=${CHECKSUM}"
  echo "DONE=openclaw_skill_admit_complete"
  exit 0
fi

if [ -n "$SOURCE" ] && ! validate_source_format "$SOURCE"; then
  echo "STOP=invalid_source_format"
  exit 1
fi

if [ "$APPROVE" -eq 1 ]; then
  if [ -z "$SOURCE" ] || [ -z "$REVIEWER" ]; then
    echo "STOP=approve_requires_source_and_reviewer"
    exit 1
  fi
  if ! validate_source_format "$SOURCE"; then
    echo "STOP=invalid_source_format"
    exit 1
  fi

  EXISTING_APPROVED_CHECKSUM="$(jq -r --arg name "$SKILL_NAME" '.entries[]? | select(.name == $name and .status == "approved") | .checksum_sha256' "$ALLOWLIST_PATH" | head -n 1)"
  if [ -n "$EXISTING_APPROVED_CHECKSUM" ] && [ "$EXISTING_APPROVED_CHECKSUM" != "$CHECKSUM" ]; then
    echo "STOP=skill_name_conflict_existing_approved name=${SKILL_NAME}"
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
