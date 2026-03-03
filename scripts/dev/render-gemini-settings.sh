#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_agent_fabric_lib.sh
source "$SCRIPT_DIR/_agent_fabric_lib.sh"

echo "PREFLIGHT=render_gemini_settings"

af_require_cmd jq
af_require_repo_file "$AGENT_FABRIC_CATALOG"

LANE="scm_only"
OUTPUT_PATH="${HOME}/.gemini/settings.json"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --lane)
      LANE="$(af_normalize_lane "${2:-}")"
      shift 2
      ;;
    --output)
      OUTPUT_PATH="${2:-}"
      shift 2
      ;;
    *)
      af_stop "usage_unknown_arg arg=$1"
      ;;
  esac
done

mkdir -p "$(dirname "$OUTPUT_PATH")"
tmp_file="$(af_mktemp isa-gemini-settings .json)"

gh_token="${GH_TOKEN:-}"
if [[ -z "$gh_token" ]] && af_lane_has_secret_lane "$LANE" "scm_only" && af_keychain_has "isa/github/pat"; then
  gh_token="$(af_keychain_get "isa/github/pat")"
fi

jq -n \
  --argjson catalog "$(cat "$AGENT_FABRIC_CATALOG")" \
  --arg gh_token "$gh_token" \
  '
  {
    mcpServers:
      (reduce $catalog[] as $server ({};
        if ($server.default_enabled != true or (($server.consumers // []) | index("gemini_vscode")) == null) then .
        elif ($server.server_id == "github") then
          if ($gh_token == "") then .
          else . + {
            ($server.server_id): {
              httpUrl: $server.command_or_url,
              headers: {
                Authorization: ("Bearer " + $gh_token)
              }
            }
          } end
        elif ($server.transport == "http") then
          . + {
            ($server.server_id): {
              httpUrl: $server.command_or_url
            }
          }
        else
          . + {
            ($server.server_id): {
              command: $server.command_or_url,
              args: $server.args
            }
          }
        end))
  }
  ' >"$tmp_file"

mv "$tmp_file" "$OUTPUT_PATH"
chmod 600 "$OUTPUT_PATH"

if [[ -n "$gh_token" ]]; then
  echo "READY=gemini_github_mcp_enabled lane=${LANE}"
else
  echo "READY=gemini_github_mcp_skipped lane=${LANE}"
fi

echo "READY=gemini_settings_rendered path=${OUTPUT_PATH}"
af_done "render_gemini_settings_complete"
