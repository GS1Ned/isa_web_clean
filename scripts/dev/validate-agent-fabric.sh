#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=./_agent_fabric_lib.sh
source "$SCRIPT_DIR/_agent_fabric_lib.sh"

echo "PREFLIGHT=validate_agent_fabric"

for cmd in bash jq rg awk node; do
  af_require_cmd "$cmd"
done

validate_jsonc_file() {
  local path="$1"
  node - "$path" <<'NODE'
const fs = require("fs");
const path = process.argv[2];
const src = fs.readFileSync(path, "utf8");

let out = "";
let inString = false;
let escape = false;
let inLineComment = false;
let inBlockComment = false;

for (let i = 0; i < src.length; i += 1) {
  const ch = src[i];
  const next = src[i + 1];

  if (inLineComment) {
    if (ch === "\n") {
      inLineComment = false;
      out += ch;
    }
    continue;
  }

  if (inBlockComment) {
    if (ch === "*" && next === "/") {
      inBlockComment = false;
      i += 1;
    }
    continue;
  }

  if (inString) {
    out += ch;
    if (escape) {
      escape = false;
    } else if (ch === "\\") {
      escape = true;
    } else if (ch === "\"") {
      inString = false;
    }
    continue;
  }

  if (ch === "\"") {
    inString = true;
    out += ch;
    continue;
  }

  if (ch === "/" && next === "/") {
    inLineComment = true;
    i += 1;
    continue;
  }

  if (ch === "/" && next === "*") {
    inBlockComment = true;
    i += 1;
    continue;
  }

  out += ch;
}

JSON.parse(out);
NODE
}

required_files=(
  "docs/governance/ISA_AGENT_PLATFORM_OPERATING_MODEL.md"
  "config/agent-platform/dependency.inventory.json"
  "config/agent-platform/task-routing.matrix.json"
  "config/agent-platform/permissions.matrix.json"
  "config/agent-platform/secret-authority.map.json"
  "config/agent-platform/nonsecret.local.template.env"
  "config/agent-platform/handoff.contract.json"
  "config/agent-platform/github-label-map.json"
  "config/agent-platform/capability-delivery.workflow.json"
  "config/mcp/servers.catalog.json"
  "config/ide/gemini/settings.template.json"
  "config/ide/codex/user-config.template.toml"
  "GEMINI.md"
  ".vscode/mcp.json"
  ".vscode/settings.json"
  "docs/governance/ISA_AGENT_HANDOFF_PROTOCOL.md"
  "docs/governance/ISA_CAPABILITY_DELIVERY_WORKFLOW.md"
  "docs/planning/agent-handoffs/README.md"
  "scripts/dev/check-keychain-secrets.sh"
  "scripts/dev/sync-keychain-secrets.sh"
  "scripts/dev/render-agent-env.sh"
  "scripts/dev/render-gemini-settings.sh"
  "scripts/dev/render-codex-user-config.sh"
  "scripts/dev/provision-agent-fabric-macos.sh"
  "scripts/dev/launch-isa-vscode.sh"
  "scripts/dev/validate-agent-fabric.sh"
  "scripts/dev/resolve-agent-task-routing.sh"
  "scripts/dev/create-agent-handoff.sh"
  "scripts/dev/create-manus-handoff.sh"
  "scripts/dev/resolve-capability-workflow.sh"
)

for rel in "${required_files[@]}"; do
  [[ -f "$AGENT_FABRIC_REPO_ROOT/$rel" ]] || af_stop "missing_required_file path=${rel}"
done

json_files=(
  "config/agent-platform/dependency.inventory.json"
  "config/agent-platform/task-routing.matrix.json"
  "config/agent-platform/permissions.matrix.json"
  "config/agent-platform/secret-authority.map.json"
  "config/agent-platform/handoff.contract.json"
  "config/agent-platform/github-label-map.json"
  "config/agent-platform/capability-delivery.workflow.json"
  "config/mcp/servers.catalog.json"
  "config/ide/gemini/settings.template.json"
  ".vscode/mcp.json"
)

for rel in "${json_files[@]}"; do
  jq -e . "$AGENT_FABRIC_REPO_ROOT/$rel" >/dev/null || af_stop "invalid_json path=${rel}"
done

validate_jsonc_file "$AGENT_FABRIC_REPO_ROOT/.vscode/settings.json" || af_stop "invalid_jsonc path=.vscode/settings.json"

if rg -n '"Authorization"[[:space:]]*:[[:space:]]*"Bearer ' "$AGENT_FABRIC_REPO_ROOT/.vscode/mcp.json" >/dev/null 2>&1; then
  af_stop "workspace_mcp_contains_bearer_token"
fi

if rg -n 'GITHUB_TOKEN|GITHUB_PERSONAL_ACCESS_TOKEN|ACCESS_TOKEN' "$AGENT_FABRIC_REPO_ROOT/.vscode/mcp.json" >/dev/null 2>&1; then
  af_stop "workspace_mcp_contains_secret_placeholder"
fi

TMP_GEMINI="$(af_mktemp isa-gemini-validate .json)"
TMP_CODEX="$(af_mktemp isa-codex-validate .toml)"
trap 'rm -f "$TMP_GEMINI" "$TMP_CODEX"' EXIT

bash "$SCRIPT_DIR/render-gemini-settings.sh" --lane scm-only --output "$TMP_GEMINI" >/dev/null || af_stop "render_gemini_settings_failed"
jq -e . "$TMP_GEMINI" >/dev/null || af_stop "generated_gemini_settings_invalid_json"

bash "$SCRIPT_DIR/render-codex-user-config.sh" --output "$TMP_CODEX" >/dev/null || af_stop "render_codex_user_config_failed"
rg -n '^# BEGIN ISA MANAGED MCP SECTION$' "$TMP_CODEX" >/dev/null || af_stop "generated_codex_config_missing_managed_block"

bash "$AGENT_FABRIC_REPO_ROOT/scripts/validate_mcp_agent_readiness.sh"

af_done "validate_agent_fabric_complete"
