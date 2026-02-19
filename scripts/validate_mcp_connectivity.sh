#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

echo "ISA MCP Connectivity Validation"
echo "==============================="

SCRIPT_START_TS="$(date +%s)"
MCP_CONNECTIVITY_MODE="${MCP_CONNECTIVITY_MODE:-strict}"
MCP_INSPECTOR_VERSION="${MCP_INSPECTOR_VERSION:-0.20.0}"

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

case "$MCP_CONNECTIVITY_MODE" in
  strict|fast)
    ;;
  *)
    fail "invalid_mcp_connectivity_mode"
    ;;
esac

if [[ ! -f ".mcp.json" ]]; then
  fail "missing_.mcp.json"
fi

if ! jq -e . ".mcp.json" >/dev/null; then
  fail "invalid_.mcp.json"
fi

tmp_cfg="$(mktemp /tmp/isa-mcp-stdio-XXXXXX)"
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
  if ! pnpm -s dlx "@modelcontextprotocol/inspector@${MCP_INSPECTOR_VERSION}" \
    --cli \
    --config "$tmp_cfg" \
    --server "$server" \
    --method tools/list >"$out" 2>"$err"; then
    echo "ERROR: tools/list failed for $server"
    sed -n '1,40p' "$err" || true
    return 1
  fi

  count="$(jq -r '.tools | length' "$out" 2>/dev/null || echo "0")"
  if [[ ! "$count" =~ ^[0-9]+$ ]] || [[ "$count" -le 0 ]]; then
    echo "ERROR: tools/list returned no tools for $server"
    sed -n '1,40p' "$out" || true
    return 1
  fi

  end_ts="$(date +%s)"
  duration=$((end_ts - start_ts))
  echo "OK: $server tools=$count duration_s=$duration"
}

run_stdio_tools_list_parallel() {
  local servers=("$@")
  local pids=()
  local names=()
  local failures=0
  local idx

  for server in "${servers[@]}"; do
    run_stdio_tools_list "$server" &
    pids+=("$!")
    names+=("$server")
  done

  for idx in "${!pids[@]}"; do
    if ! wait "${pids[$idx]}"; then
      echo "ERROR: stdio connectivity failed for ${names[$idx]}"
      failures=1
    fi
  done

  if [[ "$failures" -ne 0 ]]; then
    fail "mcp_stdio_connect_failed"
  fi
}

if [[ "$MCP_CONNECTIVITY_MODE" == "fast" ]]; then
  run_stdio_tools_list_parallel "filesystem" "git" "fetch"
else
  run_stdio_tools_list_parallel "filesystem" "git" "fetch" "playwright"
fi

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

GITHUB_AUTH_SOURCE=""
GITHUB_AUTH_TOKEN=""

resolve_github_token() {
  if [[ -n "${GH_TOKEN:-}" ]]; then
    GITHUB_AUTH_SOURCE="GH_TOKEN"
    GITHUB_AUTH_TOKEN="${GH_TOKEN}"
    return 0
  fi

  if command -v gh >/dev/null 2>&1; then
    if gh auth status >/dev/null 2>&1; then
      local gh_token
      gh_token="$(gh auth token 2>/dev/null || true)"
      if [[ -n "$gh_token" ]]; then
        GITHUB_AUTH_SOURCE="gh"
        GITHUB_AUTH_TOKEN="$gh_token"
        return 0
      fi
    fi
  fi

  return 1
}

if resolve_github_token; then
  github_code="$(curl -sS -o /dev/null -w "%{http_code}" -H "Authorization: Bearer ${GITHUB_AUTH_TOKEN}" "https://api.githubcopilot.com/mcp/" || true)"
  if [[ "$github_code" =~ ^(200|301|302|307|308|403|405)$ ]]; then
    echo "OK: github http_status=$github_code auth=$GITHUB_AUTH_SOURCE"
  else
    echo "ERROR: github unexpected_http_status=$github_code auth=$GITHUB_AUTH_SOURCE"
    fail "mcp_github_auth_failed"
  fi
else
  check_http_status "github" "https://api.githubcopilot.com/mcp/"
  warn "GitHub token unavailable (GH_TOKEN unset and gh auth token unavailable); github MCP auth was not validated."
fi

SCRIPT_END_TS="$(date +%s)"
SCRIPT_DURATION=$((SCRIPT_END_TS - SCRIPT_START_TS))
echo "INFO: mode=$MCP_CONNECTIVITY_MODE inspector=$MCP_INSPECTOR_VERSION duration_s=$SCRIPT_DURATION"

echo ""
echo "DONE=mcp_connectivity_ready"
