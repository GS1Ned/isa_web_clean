#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_agent_fabric_lib.sh
source "$SCRIPT_DIR/_agent_fabric_lib.sh"

echo "PREFLIGHT=render_codex_user_config"

TEMPLATE_PATH="$AGENT_FABRIC_REPO_ROOT/config/ide/codex/user-config.template.toml"
OUTPUT_PATH="${HOME}/.codex/config.toml"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --output)
      OUTPUT_PATH="${2:-}"
      shift 2
      ;;
    --template)
      TEMPLATE_PATH="${2:-}"
      shift 2
      ;;
    *)
      af_stop "usage_unknown_arg arg=$1"
      ;;
  esac
done

af_require_repo_file "$TEMPLATE_PATH"
mkdir -p "$(dirname "$OUTPUT_PATH")"

managed_block="$(awk '
  /# BEGIN ISA MANAGED MCP SECTION/ {capture=1}
  capture {print}
  /# END ISA MANAGED MCP SECTION/ {capture=0}
' "$TEMPLATE_PATH")"

[[ -n "$managed_block" ]] || af_stop "missing_managed_codex_block"

if [[ ! -f "$OUTPUT_PATH" ]]; then
  cp "$TEMPLATE_PATH" "$OUTPUT_PATH"
  chmod 600 "$OUTPUT_PATH"
  echo "READY=codex_user_config_created path=${OUTPUT_PATH}"
  af_done "render_codex_user_config_complete"
  exit 0
fi

backup_path="${OUTPUT_PATH}.bak.$(date +%Y%m%d%H%M%S)"
cp "$OUTPUT_PATH" "$backup_path"

tmp_file="$(af_mktemp isa-codex-config .toml)"
prefix_file="$(af_mktemp isa-codex-prefix .toml)"
suffix_file="$(af_mktemp isa-codex-suffix .toml)"
trap 'rm -f "$tmp_file" "$prefix_file" "$suffix_file"' EXIT

if rg -n '^# BEGIN ISA MANAGED MCP SECTION$' "$OUTPUT_PATH" >/dev/null 2>&1; then
  awk '
    /^# BEGIN ISA MANAGED MCP SECTION$/ {exit}
    {print}
  ' "$OUTPUT_PATH" >"$prefix_file"

  awk '
    found {print}
    /^# END ISA MANAGED MCP SECTION$/ {found=1; next}
  ' "$OUTPUT_PATH" >"$suffix_file"

  cat "$prefix_file" >"$tmp_file"
  if [[ -s "$tmp_file" ]]; then
    printf '\n' >>"$tmp_file"
  fi
  printf '%s\n' "$managed_block" >>"$tmp_file"
  if [[ -s "$suffix_file" ]]; then
    printf '\n' >>"$tmp_file"
    cat "$suffix_file" >>"$tmp_file"
  fi
else
  cat "$OUTPUT_PATH" >"$tmp_file"
  printf '\n%s\n' "$managed_block" >>"$tmp_file"
fi

mv "$tmp_file" "$OUTPUT_PATH"
chmod 600 "$OUTPUT_PATH"
echo "READY=codex_user_config_rendered path=${OUTPUT_PATH} backup=${backup_path}"
af_done "render_codex_user_config_complete"
