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
MCP_SUMMARY_JSON_PATH="${MCP_SUMMARY_JSON_PATH:-}"
MCP_SUMMARY_STDOUT="${MCP_SUMMARY_STDOUT:-0}"
FAIL_REASON=""
SUMMARY_TMP="$(mktemp /tmp/isa-mcp-summary-XXXXXX)"
CHECK_DIR="$(mktemp -d /tmp/isa-mcp-checks-XXXXXX)"
TMP_CFG=""
CLEANUP_FILES=("$SUMMARY_TMP" "$CHECK_DIR")

fail() {
  FAIL_REASON="$1"
  echo ""
  echo "STOP=$1"
  exit 1
}

warn() {
  echo "WARN: $1"
}

record_check() {
  local name="$1"
  local check_type="$2"
  local status="$3"
  local details_json="${4:-"{}"}"
  local out="$CHECK_DIR/${name}-${check_type}.json"

  if ! jq -e 'type == "object"' >/dev/null 2>&1 <<<"$details_json"; then
    details_json='{"error":"invalid_details_json"}'
  fi

  jq -n \
    --arg name "$name" \
    --arg type "$check_type" \
    --arg status "$status" \
    --argjson details "$details_json" \
    '{name:$name,type:$type,status:$status} + $details' > "$out"
}

emit_summary() {
  local rc="$1"
  local script_end_ts
  local script_duration
  local run_status
  local checks_json
  local -a check_files=()

  script_end_ts="$(date +%s)"
  script_duration=$((script_end_ts - SCRIPT_START_TS))

  if [[ "$rc" -eq 0 ]]; then
    run_status="pass"
  else
    run_status="fail"
  fi

  while IFS= read -r -d '' path; do
    check_files+=("$path")
  done < <(find "$CHECK_DIR" -maxdepth 1 -type f -name '*.json' -print0)

  if [[ "${#check_files[@]}" -gt 0 ]]; then
    checks_json="$(jq -s '.' "${check_files[@]}")"
  else
    checks_json="[]"
  fi

  jq -n \
    --arg timestamp_utc "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg mode "$MCP_CONNECTIVITY_MODE" \
    --arg inspector "$MCP_INSPECTOR_VERSION" \
    --arg status "$run_status" \
    --arg fail_reason "$FAIL_REASON" \
    --argjson duration_s "$script_duration" \
    --argjson checks "$checks_json" \
    '{
      timestamp_utc: $timestamp_utc,
      mode: $mode,
      inspector_version: $inspector,
      status: $status,
      fail_reason: (if $fail_reason == "" then null else $fail_reason end),
      duration_s: $duration_s,
      checks: $checks
    }' > "$SUMMARY_TMP"

  if [[ -n "$MCP_SUMMARY_JSON_PATH" ]]; then
    mkdir -p "$(dirname "$MCP_SUMMARY_JSON_PATH")"
    cp "$SUMMARY_TMP" "$MCP_SUMMARY_JSON_PATH"
  fi

  if [[ "$MCP_SUMMARY_STDOUT" == "1" ]]; then
    echo "MCP_SUMMARY_JSON=$(jq -c . "$SUMMARY_TMP")"
  fi
}

cleanup() {
  if [[ "${#CLEANUP_FILES[@]}" -gt 0 ]]; then
    rm -rf "${CLEANUP_FILES[@]}" || true
  fi
}

on_exit() {
  local rc="$1"
  emit_summary "$rc"
  cleanup
}

trap 'on_exit $?' EXIT

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

TMP_CFG="$(mktemp /tmp/isa-mcp-stdio-XXXXXX)"
CLEANUP_FILES+=("$TMP_CFG")

jq '{
  mcpServers: {
    filesystem: .mcpServers.filesystem,
    git: .mcpServers.git,
    fetch: .mcpServers.fetch,
    playwright: .mcpServers.playwright
  }
}' .mcp.json > "$TMP_CFG"

run_stdio_tools_list() {
  local server="$1"
  local out="/tmp/isa_mcp_${server}.json"
  local err="/tmp/isa_mcp_${server}.err"
  local start_ts
  local end_ts
  local duration
  local count
  local details
  local err_preview

  CLEANUP_FILES+=("$out" "$err")
  start_ts="$(date +%s)"
  if ! pnpm -s dlx "@modelcontextprotocol/inspector@${MCP_INSPECTOR_VERSION}" \
    --cli \
    --config "$TMP_CFG" \
    --server "$server" \
    --method tools/list >"$out" 2>"$err"; then
    err_preview="$(sed -n '1,5p' "$err" 2>/dev/null | tr '\n' ' ' | sed 's/[[:space:]]\+/ /g')"
    details="$(jq -n --arg error "$err_preview" '{error:$error}')"
    record_check "$server" "stdio" "fail" "$details"
    echo "ERROR: tools/list failed for $server"
    sed -n '1,40p' "$err" || true
    return 1
  fi

  count="$(jq -r '.tools | length' "$out" 2>/dev/null || echo "0")"
  if [[ ! "$count" =~ ^[0-9]+$ ]] || [[ "$count" -le 0 ]]; then
    details="$(jq -n --arg error "no_tools_returned" '{error:$error}')"
    record_check "$server" "stdio" "fail" "$details"
    echo "ERROR: tools/list returned no tools for $server"
    sed -n '1,40p' "$out" || true
    return 1
  fi

  end_ts="$(date +%s)"
  duration=$((end_ts - start_ts))
  details="$(jq -n --argjson tools "$count" --argjson duration_s "$duration" '{tools:$tools,duration_s:$duration_s}')"
  record_check "$server" "stdio" "pass" "$details"
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
  record_check "playwright" "stdio" "skipped" "$(jq -n --arg reason "skipped_in_fast_mode" '{reason:$reason}')"
else
  run_stdio_tools_list_parallel "filesystem" "git" "fetch" "playwright"
fi

check_http_status() {
  local name="$1"
  local url="$2"
  local auth="${3:-none}"
  local code
  local details

  code="$(curl -sS -o /dev/null -w "%{http_code}" "$url" || true)"
  details="$(jq -n --arg http_status "$code" --arg auth "$auth" '{http_status:$http_status,auth:$auth}')"

  if [[ "$code" =~ ^(200|301|302|307|308|401|403|405)$ ]]; then
    record_check "$name" "http" "pass" "$details"
    echo "OK: $name http_status=$code"
  else
    record_check "$name" "http" "fail" "$details"
    echo "ERROR: $name unexpected_http_status=$code"
    fail "mcp_${name}_http_unreachable"
  fi
}

check_http_status "openai_docs" "https://developers.openai.com/mcp" "none"

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
  github_details="$(jq -n --arg http_status "$github_code" --arg auth "$GITHUB_AUTH_SOURCE" '{http_status:$http_status,auth:$auth}')"

  if [[ "$github_code" =~ ^(200|301|302|307|308|403|405)$ ]]; then
    record_check "github" "http" "pass" "$github_details"
    echo "OK: github http_status=$github_code auth=$GITHUB_AUTH_SOURCE"
  else
    record_check "github" "http" "fail" "$github_details"
    echo "ERROR: github unexpected_http_status=$github_code auth=$GITHUB_AUTH_SOURCE"
    fail "mcp_github_auth_failed"
  fi
else
  check_http_status "github" "https://api.githubcopilot.com/mcp/" "none"
  warn "GitHub token unavailable (GH_TOKEN unset and gh auth token unavailable); github MCP auth was not validated."
fi

SCRIPT_END_TS="$(date +%s)"
SCRIPT_DURATION=$((SCRIPT_END_TS - SCRIPT_START_TS))
echo "INFO: mode=$MCP_CONNECTIVITY_MODE inspector=$MCP_INSPECTOR_VERSION duration_s=$SCRIPT_DURATION"

echo ""
echo "DONE=mcp_connectivity_ready"
