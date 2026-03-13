#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

echo "ISA MCP Agent Readiness Validation"
echo "=================================="

fail() {
  echo ""
  echo "STOP=$1"
  exit 1
}

required_files=(
  "docs/agent/MCP_POLICY.md"
  "docs/agent/MCP_RECIPES.md"
  ".codex/config.toml"
  ".amazonq/default.json"
  ".amazonq/rules/mcp-usage.md"
  ".amazonq/rules/agent-context.md"
  ".mcp.json"
  "scripts/validate_mcp_connectivity.sh"
  "AGENTS.md"
  "AGENT_START_HERE.md"
)

missing=0
for f in "${required_files[@]}"; do
  if [[ ! -f "$f" ]]; then
    echo "MISSING: $f"
    missing=1
  fi
done

if [[ "$missing" -ne 0 ]]; then
  fail "missing_required_files"
fi

if ! command -v jq >/dev/null 2>&1; then
  fail "jq_not_found"
fi

json_files=(
  ".amazonq/default.json"
  ".mcp.json"
)

for jf in "${json_files[@]}"; do
  if ! jq -e . "$jf" >/dev/null; then
    echo "INVALID_JSON: $jf"
    fail "invalid_json"
  fi
done

if [[ -f ".vscode/mcp.json" ]]; then
  if ! jq -e . ".vscode/mcp.json" >/dev/null; then
    echo "INVALID_JSON: .vscode/mcp.json"
    fail "invalid_json"
  fi
else
  echo "WARN: .vscode/mcp.json missing (optional)"
fi

if command -v rg >/dev/null 2>&1; then
  if rg -n "TODO_UNVERIFIED" -S . --glob '!scripts/validate_mcp_agent_readiness.sh' >/dev/null; then
    echo "FOUND: TODO_UNVERIFIED"
    rg -n "TODO_UNVERIFIED" -S . --glob '!scripts/validate_mcp_agent_readiness.sh' || true
    fail "todo_unverified_present"
  fi
else
  if grep -R -n "TODO_UNVERIFIED" . --exclude="validate_mcp_agent_readiness.sh" >/dev/null 2>&1; then
    echo "FOUND: TODO_UNVERIFIED"
    grep -R -n "TODO_UNVERIFIED" . --exclude="validate_mcp_agent_readiness.sh" || true
    fail "todo_unverified_present"
  fi
fi

for doc in "AGENTS.md" "AGENT_START_HERE.md"; do
  if command -v rg >/dev/null 2>&1; then
    if ! rg -n "docs/agent/MCP_POLICY.md" "$doc" >/dev/null; then
      echo "MISSING_REFERENCE: docs/agent/MCP_POLICY.md in $doc"
      fail "missing_policy_reference"
    fi
  else
    if ! grep -n "docs/agent/MCP_POLICY.md" "$doc" >/dev/null 2>&1; then
      echo "MISSING_REFERENCE: docs/agent/MCP_POLICY.md in $doc"
      fail "missing_policy_reference"
    fi
  fi
done

if [[ "${MCP_VALIDATE_CONNECTIVITY:-0}" == "1" ]]; then
  echo ""
  echo "Running optional MCP connectivity checks..."
  if ! bash "scripts/validate_mcp_connectivity.sh"; then
    fail "mcp_connectivity_validation_failed"
  fi
fi

echo ""
echo "DONE=mcp_agent_ready"
