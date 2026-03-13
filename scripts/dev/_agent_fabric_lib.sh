#!/usr/bin/env bash
set -euo pipefail

export PATH="${HOME}/.local/bin:/opt/homebrew/bin:/opt/homebrew/sbin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${PATH:-}"

AGENT_FABRIC_LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
AGENT_FABRIC_REPO_ROOT="$(cd "$AGENT_FABRIC_LIB_DIR/../.." && pwd)"
AGENT_FABRIC_CONFIG_DIR="$AGENT_FABRIC_REPO_ROOT/config/agent-platform"
AGENT_FABRIC_CATALOG="$AGENT_FABRIC_REPO_ROOT/config/mcp/servers.catalog.json"
AGENT_FABRIC_SECRET_MAP="$AGENT_FABRIC_CONFIG_DIR/secret-authority.map.json"
AGENT_FABRIC_NONSECRET_TEMPLATE="$AGENT_FABRIC_CONFIG_DIR/nonsecret.local.template.env"
AGENT_FABRIC_USER_HOME="${HOME}"
AGENT_FABRIC_USER_CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/isa-agent-fabric"
AGENT_FABRIC_NONSECRET_FILE="$AGENT_FABRIC_USER_CONFIG_DIR/nonsecret.env"

af_info() {
  printf 'INFO: %s\n' "$*"
}

af_warn() {
  printf 'WARN: %s\n' "$*" >&2
}

af_stop() {
  printf 'STOP=%s\n' "$1" >&2
  exit 1
}

af_done() {
  printf 'DONE=%s\n' "$1"
}

af_require_cmd() {
  local cmd="$1"
  command -v "$cmd" >/dev/null 2>&1 || af_stop "missing_command name=${cmd}"
}

af_repo_root() {
  printf '%s\n' "$AGENT_FABRIC_REPO_ROOT"
}

af_require_repo_file() {
  local path="$1"
  [[ -f "$path" ]] || af_stop "missing_file path=${path}"
}

af_normalize_lane() {
  case "${1:-}" in
    scm-only|scm_only) printf 'scm_only\n' ;;
    app-dev|app_dev) printf 'app_dev\n' ;;
    all) printf 'all\n' ;;
    none) printf 'none\n' ;;
    *) af_stop "invalid_lane value=${1:-empty}" ;;
  esac
}

af_keychain_service_from_backend() {
  local backend="$1"
  if [[ "$backend" == keychain:* ]]; then
    printf '%s\n' "${backend#keychain:}"
    return 0
  fi
  return 1
}

af_keychain_has() {
  local service="$1"
  security find-generic-password -s "$service" >/dev/null 2>&1
}

af_keychain_get() {
  local service="$1"
  security find-generic-password -w -s "$service"
}

af_ensure_user_config_dir() {
  mkdir -p "$AGENT_FABRIC_USER_CONFIG_DIR"
}

af_mktemp() {
  local prefix="$1"
  local suffix="${2:-}"
  local base
  base="$(mktemp "${TMPDIR:-/tmp}/${prefix}.XXXXXX")" || af_stop "mktemp_failed prefix=${prefix}"
  if [[ -n "$suffix" ]]; then
    local target="${base}${suffix}"
    mv "$base" "$target"
    printf '%s\n' "$target"
  else
    printf '%s\n' "$base"
  fi
}

af_load_nonsecret_env() {
  if [[ -f "$AGENT_FABRIC_NONSECRET_FILE" ]]; then
    set +e
    set -a
    # shellcheck disable=SC1090
    source "$AGENT_FABRIC_NONSECRET_FILE"
    local rc=$?
    set +a
    set -e
    if [[ "$rc" -ne 0 ]]; then
      af_warn "nonsecret_env_source_failed path=$AGENT_FABRIC_NONSECRET_FILE"
    fi
  fi
}

af_trim() {
  local value="${1:-}"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  printf '%s\n' "$value"
}

af_strip_wrapping_quotes() {
  local value="${1:-}"
  if [[ "$value" == \"*\" && "$value" == *\" ]]; then
    value="${value:1:${#value}-2}"
  elif [[ "$value" == \'*\' && "$value" == *\' ]]; then
    value="${value:1:${#value}-2}"
  fi
  printf '%s\n' "$value"
}

af_dotenv_get() {
  local dotenv_path="$1"
  local env_key="$2"
  [[ -f "$dotenv_path" ]] || return 1

  local line value
  line="$(
    awk -v key="$env_key" -F= '
      $0 ~ "^[[:space:]]*" key "=" {
        sub(/^[[:space:]]*/, "", $0)
        print substr($0, index($0, "=") + 1)
        exit
      }
    ' "$dotenv_path"
  )"
  [[ -n "$line" ]] || return 1

  value="$(af_trim "$line")"
  value="$(af_strip_wrapping_quotes "$value")"
  printf '%s\n' "$value"
}

af_is_placeholder_value() {
  local value lower
  value="$(af_trim "${1:-}")"
  [[ -z "$value" ]] && return 0
  lower="$(printf '%s' "$value" | tr '[:upper:]' '[:lower:]')"

  case "$lower" in
    changeme|change_me|placeholder|example|example_value|your_value|your-token|your_token|your-key|your_key|replace_me)
      return 0
      ;;
  esac

  return 1
}

af_secret_entries_json() {
  local lane="$1"
  if [[ "$lane" == "all" ]]; then
    jq -c '[.[] | select(.authority == "macos_keychain")]' "$AGENT_FABRIC_SECRET_MAP"
  else
    jq -c --arg lane "$lane" '[.[] | select(.authority == "macos_keychain" and (.allowed_lanes | index($lane) != null))]' "$AGENT_FABRIC_SECRET_MAP"
  fi
}

af_lane_has_secret_lane() {
  local lane="$1"
  local secret_lane="$2"
  [[ "$lane" == "all" || "$lane" == "$secret_lane" ]]
}
