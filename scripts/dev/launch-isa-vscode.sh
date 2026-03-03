#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_agent_fabric_lib.sh
source "$SCRIPT_DIR/_agent_fabric_lib.sh"

echo "PREFLIGHT=launch_isa_vscode"

af_require_cmd bash
af_require_cmd jq

LANE_RAW="${ISA_AGENT_FABRIC_DEFAULT_LAUNCH_LANE:-scm-only}"
NO_OPEN=0
CHECK_ONLY=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --lane)
      LANE_RAW="${2:-}"
      shift 2
      ;;
    --no-open)
      NO_OPEN=1
      shift
      ;;
    --check-only)
      CHECK_ONLY=1
      shift
      ;;
    *)
      af_stop "usage_unknown_arg arg=$1"
      ;;
  esac
done

LANE="$(af_normalize_lane "$LANE_RAW")"
af_load_nonsecret_env

if [[ "$LANE" == "app_dev" ]]; then
  bash "$SCRIPT_DIR/check-keychain-secrets.sh" app-dev
else
  bash "$SCRIPT_DIR/check-keychain-secrets.sh" scm-only
fi

TMP_ENV_FILE="$(af_mktemp isa-agent-launch-env .sh)"
trap 'rm -f "$TMP_ENV_FILE"' EXIT
chmod 600 "$TMP_ENV_FILE"
bash "$SCRIPT_DIR/render-agent-env.sh" --lane "$LANE" --output "$TMP_ENV_FILE" >/dev/null
bash "$SCRIPT_DIR/render-gemini-settings.sh" --lane "$LANE" >/dev/null
bash "$SCRIPT_DIR/render-codex-user-config.sh" >/dev/null

echo "READY=lane_materialized lane=${LANE} env_file=${TMP_ENV_FILE}"
echo "READY=repo=$(af_repo_root)"

if [[ "$CHECK_ONLY" -eq 1 ]]; then
  af_done "launch_isa_vscode_check_only"
  exit 0
fi

if [[ "$NO_OPEN" -eq 1 ]]; then
  af_done "launch_isa_vscode_prepared"
  exit 0
fi

af_require_cmd code
bash -lc "source '$TMP_ENV_FILE'; code -n '$(af_repo_root)'"
af_done "launch_isa_vscode_complete lane=${LANE}"
