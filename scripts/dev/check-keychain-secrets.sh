#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_agent_fabric_lib.sh
source "$SCRIPT_DIR/_agent_fabric_lib.sh"

echo "PREFLIGHT=check_keychain_secrets"

af_require_cmd jq
af_require_cmd security
af_require_repo_file "$AGENT_FABRIC_SECRET_MAP"

LANE_RAW="${1:-scm-only}"
LANE="$(af_normalize_lane "$LANE_RAW")"

entries_json="$(af_secret_entries_json "$LANE")"
count="$(jq 'length' <<<"$entries_json")"

if [[ "$count" -eq 0 ]]; then
  af_warn "no_keychain_entries_selected lane=$LANE"
  af_done "keychain_secret_check_empty"
  exit 0
fi

missing=0
for row in $(jq -r '.[] | @base64' <<<"$entries_json"); do
  _jq() {
    printf '%s' "$row" | base64 --decode | jq -r "$1"
  }

  secret_id="$(_jq '.secret_id')"
  env_key="$(_jq '.env_key')"
  backend="$(_jq '.storage_backend')"
  service="$(af_keychain_service_from_backend "$backend")" || af_stop "invalid_keychain_backend secret_id=${secret_id}"

  if [[ -n "${!env_key:-}" ]]; then
    echo "READY=secret_present secret_id=${secret_id} env_key=${env_key} source=process_env"
  elif af_keychain_has "$service"; then
    echo "READY=secret_present secret_id=${secret_id} env_key=${env_key} source=keychain"
  else
    echo "WARN=keychain_secret_missing secret_id=${secret_id} env_key=${env_key} service=${service}"
    missing=1
  fi
done

if [[ "$missing" -ne 0 ]]; then
  af_stop "missing_keychain_secrets lane=${LANE}"
fi

af_done "keychain_secrets_ready lane=${LANE}"
