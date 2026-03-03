#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_agent_fabric_lib.sh
source "$SCRIPT_DIR/_agent_fabric_lib.sh"

echo "PREFLIGHT=provision_agent_fabric_macos"

INSTALL_MISSING=0
WRITE_NONSECRET_TEMPLATE=0
SYNC_KEYCHAIN=0
LANE="scm_only"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --install-missing)
      INSTALL_MISSING=1
      shift
      ;;
    --write-nonsecret-template)
      WRITE_NONSECRET_TEMPLATE=1
      shift
      ;;
    --sync-keychain)
      SYNC_KEYCHAIN=1
      shift
      ;;
    --lane)
      LANE="$(af_normalize_lane "${2:-}")"
      shift 2
      ;;
    *)
      af_stop "usage_unknown_arg arg=$1"
      ;;
  esac
done

[[ "$(uname -s)" == "Darwin" ]] || af_stop "non_macos_host"

for cmd in bash jq rg security node pnpm; do
  af_require_cmd "$cmd"
done

af_ensure_user_config_dir

if [[ "$WRITE_NONSECRET_TEMPLATE" -eq 1 && ! -f "$AGENT_FABRIC_NONSECRET_FILE" ]]; then
  cp "$AGENT_FABRIC_NONSECRET_TEMPLATE" "$AGENT_FABRIC_NONSECRET_FILE"
  chmod 600 "$AGENT_FABRIC_NONSECRET_FILE"
  echo "READY=nonsecret_template_written path=${AGENT_FABRIC_NONSECRET_FILE}"
fi

if [[ -d "/Applications/Visual Studio Code.app" || -d "$HOME/Applications/Visual Studio Code.app" ]]; then
  echo "READY=vscode_app_present"
fi

if command -v code >/dev/null 2>&1; then
  echo "READY=vscode_cli_present"
else
  af_warn "vscode_cli_missing"
fi

if command -v gh >/dev/null 2>&1; then
  echo "READY=gh_cli_present"
else
  af_warn "gh_cli_missing"
fi

if command -v gemini >/dev/null 2>&1; then
  echo "READY=gemini_cli_present"
else
  af_warn "gemini_cli_missing"
  if [[ "$INSTALL_MISSING" -eq 1 ]]; then
    npm install -g @google/gemini-cli
    command -v gemini >/dev/null 2>&1 || af_stop "gemini_cli_install_failed"
    echo "READY=gemini_cli_installed"
  fi
fi

if command -v code >/dev/null 2>&1; then
  if code --list-extensions | rg -i 'gemini|code-assist|google' >/dev/null 2>&1; then
    echo "READY=gemini_extension_detected"
  else
    af_warn "gemini_extension_not_detected"
  fi
elif ls -1 "$HOME/.vscode/extensions" 2>/dev/null | rg -i 'google\.geminicodeassist' >/dev/null 2>&1; then
  echo "READY=gemini_extension_detected_via_extensions_dir"
fi

if [[ -f "$HOME/.codex/config.toml" ]]; then
  echo "READY=codex_user_config_present"
else
  af_warn "codex_user_config_missing"
fi

if [[ -f "$HOME/.gemini/settings.json" ]]; then
  echo "READY=gemini_settings_present"
else
  af_warn "gemini_settings_missing"
fi

if [[ "$SYNC_KEYCHAIN" -eq 1 ]]; then
  bash "$SCRIPT_DIR/sync-keychain-secrets.sh" --lane "$LANE" || true
fi

bash "$SCRIPT_DIR/check-keychain-secrets.sh" "$LANE" || true

af_done "provision_agent_fabric_macos_complete"
