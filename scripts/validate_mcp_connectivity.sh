#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

echo "ISA MCP Connectivity Validation"
echo "==============================="

fail() {
  echo ""
  echo "STOP=$1"
  exit 1
}

warn() {
  echo "WARN: $1"
}

for cmd in jq pnpm curl; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    fail "${cmd}_not_found"
  fi
done

if [[ ! -f ".mcp.json" ]]; then
  fail "missing_.mcp.json"
fi

if ! jq -e . ".mcp.json" >/dev/null; then
  fail "invalid_.mcp.json"
fi

tmp_cfg="$(mktemp /tmp/isa-mcp-stdio-XXXXXX.json)"
cleanup() {
  rm -f "$tmp_cfg" /tmp/isa_mcp_*.json /tmp/isa_mcp_*.err || true
}
trap cleanup EXIT

jq '{
  mcpServers: {
    filesystem: .mcpServers.filesystem,
    git: .mcpServers.git,
    fetch: .mcpServers.fetch,
    playwright: .mcpServers.playwright
  }
}' .mcp.json > "$tmp_cfg"

run_stdio_tools_list() {
  local server="$1"
  local out="/tmp/isa_mcp_${server}.json"
  local err="/tmp/isa_mcp_${server}.err"
  local start_ts
  local end_ts
  local duration
  local count

  start_ts="$(date +%s)"
  if ! pnpm -s dlx @modelcontextprotocol/inspector@0.20.0 \
    --cli \
    --config "$tmp_cfg" \
    --server "$server" \
    --method tools/list >"$out" 2>"$err"; then
    echo "ERROR: tools/list failed for $server"
    sed -n '1,40p' "$err" || true
    fail "mcp_${server}_connect_failed"
  fi

  count="$(jq -r '.tools | length' "$out" 2>/dev/null || echo "0")"
  if [[ ! "$count" =~ ^[0-9]+$ ]] || [[ "$count" -le 0 ]]; then
    echo "ERROR: tools/list returned no tools for $server"
    sed -n '1,40p' "$out" || true
    fail "mcp_${server}_no_tools"
  fi

  end_ts="$(date +%s)"
  duration=$((end_ts - start_ts))
  echo "OK: $server tools=$count duration_s=$duration"
}

run_stdio_tools_list "filesystem"
run_stdio_tools_list "git"
run_stdio_tools_list "fetch"
run_stdio_tools_list "playwright"

check_http_status() {
  local name="$1"
  local url="$2"
  local code

  code="$(curl -sS -o /dev/null -w "%{http_code}" "$url" || true)"
  if [[ "$code" =~ ^(200|301|302|307|308|401|403|405)$ ]]; then
    echo "OK: $name http_status=$code"
  else
    echo "ERROR: $name unexpected_http_status=$code"
    fail "mcp_${name}_http_unreachable"
  fi
}

check_http_status "openai_docs" "https://developers.openai.com/mcp"

if [[ -n "${GH_TOKEN:-}" ]]; then
  github_code="$(curl -sS -o /dev/null -w "%{http_code}" -H "Authorization: Bearer ${GH_TOKEN}" "https://api.githubcopilot.com/mcp/" || true)"
  if [[ "$github_code" =~ ^(200|301|302|307|308|403|405)$ ]]; then
    echo "OK: github http_status=$github_code auth=provided"
  else
    echo "ERROR: github unexpected_http_status=$github_code auth=provided"
    fail "mcp_github_auth_failed"
  fi
else
  check_http_status "github" "https://api.githubcopilot.com/mcp/"
  warn "GH_TOKEN is unset; github MCP auth was not validated."
fi

echo ""
echo "DONE=mcp_connectivity_ready"
