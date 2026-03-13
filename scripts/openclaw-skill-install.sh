#!/usr/bin/env bash
set -euo pipefail

echo "PREFLIGHT=openclaw_skill_install"

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

for cmd in jq shasum date find sort; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "STOP=missing_command name=${cmd}"
    exit 1
  fi
done

if [ "$#" -ne 1 ]; then
  echo "STOP=usage openclaw-skill-install.sh <skill-path>"
  exit 1
fi

SKILL_PATH="$1"
if [ ! -d "$SKILL_PATH" ]; then
  echo "STOP=skill_directory_required"
  exit 1
fi
if [ ! -f "$SKILL_PATH/SKILL.md" ]; then
  echo "STOP=skill_metadata_missing file=SKILL.md"
  exit 1
fi

ALLOWLIST_PATH="${OPENCLAW_SKILLS_ALLOWLIST_PATH:-config/openclaw/skills-allowlist.json}"
if [ ! -f "$ALLOWLIST_PATH" ]; then
  echo "STOP=skills_allowlist_missing path=${ALLOWLIST_PATH}"
  exit 1
fi

SKILL_NAME="$(basename "$SKILL_PATH")"
compute_skill_checksum() {
  local path="$1"
  local manifest_file
  manifest_file="$(mktemp /tmp/openclaw_skill_manifest.XXXXXX)"
  (
    cd "$path"
    find . -type f ! -path './.git/*' ! -path './node_modules/*' | LC_ALL=C sort | while IFS= read -r file; do
      [ -z "$file" ] && continue
      rel="${file#./}"
      file_hash="$(shasum -a 256 "$file" | awk '{print $1}')"
      printf '%s  %s\n' "$file_hash" "$rel"
    done
  ) > "$manifest_file"
  shasum -a 256 "$manifest_file" | awk '{print $1}'
  rm -f "$manifest_file"
}

CHECKSUM="$(compute_skill_checksum "$SKILL_PATH")"

ENTRY_JSON="$(jq -c --arg checksum "$CHECKSUM" --arg name "$SKILL_NAME" '.entries[]? | select(.checksum_sha256 == $checksum and .name == $name and .status == "approved")' "$ALLOWLIST_PATH" | head -n 1)"
if [ -z "$ENTRY_JSON" ]; then
  echo "STOP=skill_not_allowlisted name=${SKILL_NAME} checksum=${CHECKSUM}"
  exit 1
fi

ENTRY_SCOPE="$(printf '%s' "$ENTRY_JSON" | jq -r '.scope // ""')"
if ! printf '%s' "$ENTRY_SCOPE" | grep -Eiq '(quarantine|local)'; then
  echo "STOP=skill_scope_not_quarantine_compatible scope=${ENTRY_SCOPE}"
  exit 1
fi

QUARANTINE_DIR="$(jq -r '.quarantine_install_dir // "~/.openclaw/skills-quarantine"' "$ALLOWLIST_PATH")"
if [[ "$QUARANTINE_DIR" == ~* ]]; then
  QUARANTINE_DIR="${QUARANTINE_DIR/#\~/$HOME}"
fi

DEST_DIR="$QUARANTINE_DIR/$SKILL_NAME"
mkdir -p "$QUARANTINE_DIR"

if command -v rsync >/dev/null 2>&1; then
  ACTION="sync_skill"
  rsync -a --delete "$SKILL_PATH/" "$DEST_DIR/"
else
  ACTION="copy_skill"
  rm -rf "$DEST_DIR"
  mkdir -p "$DEST_DIR"
  cp -R "$SKILL_PATH/." "$DEST_DIR/"
fi

ACTION="write_manifest"
MANIFEST_PATH="$DEST_DIR/.isa-skill-install.json"
jq -nc \
  --arg name "$SKILL_NAME" \
  --arg checksum "$CHECKSUM" \
  --arg installed_at "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
  --arg source "$(printf '%s' "$ENTRY_JSON" | jq -r '.source')" \
  '{name:$name, checksum_sha256:$checksum, source:$source, installed_at:$installed_at, profile:"quarantine"}' > "$MANIFEST_PATH"
chmod 600 "$MANIFEST_PATH"

echo "READY=skill_installed_quarantine name=${SKILL_NAME} path=${DEST_DIR}"
echo "DONE=openclaw_skill_install_complete"
