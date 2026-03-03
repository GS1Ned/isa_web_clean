#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_agent_fabric_lib.sh
source "$SCRIPT_DIR/_agent_fabric_lib.sh"

echo "PREFLIGHT=sync_keychain_secrets"

af_require_cmd jq
af_require_cmd security
af_require_repo_file "$AGENT_FABRIC_SECRET_MAP"

LANE="scm_only"
DOTENV_PATH="$AGENT_FABRIC_REPO_ROOT/.env"
FORCE=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --lane)
      LANE="$(af_normalize_lane "${2:-}")"
      shift 2
      ;;
    --dotenv)
      DOTENV_PATH="${2:-}"
      shift 2
      ;;
    --force)
      FORCE=1
      shift
      ;;
    *)
      af_stop "usage_unknown_arg arg=$1"
      ;;
  esac
done

resolve_secret_value() {
  local env_key="$1"
  local service="$2"
  local value=""
  local source=""

  if [[ -n "${!env_key:-}" ]] && ! af_is_placeholder_value "${!env_key}"; then
    value="${!env_key}"
    source="process_env"
  elif [[ -f "$DOTENV_PATH" ]]; then
    if value="$(af_dotenv_get "$DOTENV_PATH" "$env_key")" && ! af_is_placeholder_value "$value"; then
      source="dotenv"
    else
      value=""
    fi
  fi

  if [[ -z "$value" && "$env_key" == "GH_TOKEN" ]] && command -v gh >/dev/null 2>&1; then
    if value="$(gh auth token 2>/dev/null)" && [[ -n "$value" ]] && ! af_is_placeholder_value "$value"; then
      source="gh_cli"
    else
      value=""
    fi
  fi

  if [[ -z "$value" ]] && af_keychain_has "$service"; then
    value="$(af_keychain_get "$service")"
    source="keychain"
  fi

  [[ -n "$value" ]] || return 1
  printf '%s\t%s\n' "$source" "$value"
}

entries_json="$(af_secret_entries_json "$LANE")"
count="$(jq 'length' <<<"$entries_json")"
[[ "$count" -gt 0 ]] || af_stop "no_keychain_entries_for_lane lane=${LANE}"

synced=0
missing=0

for row in $(jq -r '.[] | @base64' <<<"$entries_json"); do
  _jq() {
    printf '%s' "$row" | base64 --decode | jq -r "$1"
  }

  secret_id="$(_jq '.secret_id')"
  env_key="$(_jq '.env_key')"
  backend="$(_jq '.storage_backend')"
  service="$(af_keychain_service_from_backend "$backend")" || af_stop "invalid_keychain_backend secret_id=${secret_id}"

  resolved="$(resolve_secret_value "$env_key" "$service" || true)"
  if [[ -z "$resolved" ]]; then
    echo "WARN=keychain_secret_source_missing secret_id=${secret_id} env_key=${env_key}"
    missing=1
    continue
  fi

  source_name="${resolved%%$'\t'*}"
  value="${resolved#*$'\t'}"

  if [[ "$FORCE" -eq 0 && "$source_name" == "keychain" ]]; then
    echo "READY=keychain_secret_retained secret_id=${secret_id} env_key=${env_key}"
    continue
  fi

  security delete-generic-password -s "$service" -a "$env_key" >/dev/null 2>&1 || true
  security add-generic-password -U -s "$service" -a "$env_key" -w "$value" >/dev/null
  echo "READY=keychain_secret_synced secret_id=${secret_id} env_key=${env_key} source=${source_name}"
  synced=1
done

if [[ "$missing" -ne 0 ]]; then
  af_stop "keychain_sync_incomplete lane=${LANE}"
fi

if [[ "$synced" -eq 0 ]]; then
  echo "READY=keychain_sync_noop lane=${LANE}"
fi

af_done "sync_keychain_secrets_complete lane=${LANE}"
