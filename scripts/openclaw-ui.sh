#!/usr/bin/env bash
set -euo pipefail

echo "PREFLIGHT=openclaw_ui"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

ACTION=""
on_err() {
  local exit_code="$?"
  if [ -n "$ACTION" ]; then
    echo "STOP=failed action=${ACTION} exit=${exit_code}"
  else
    echo "STOP=failed exit=${exit_code}"
  fi
  exit "$exit_code"
}
trap on_err ERR

for cmd in bash grep sed; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "STOP=missing_command name=${cmd}"
    exit 1
  fi
done

if [ -f ".env" ]; then
  ACTION="load_env"
  set -a
  source .env >/dev/null 2>&1 || { echo "STOP=.env_not_sourceable"; exit 1; }
  set +a
fi

DO_OPEN=1
if [ "${1:-}" = "--no-open" ]; then
  DO_OPEN=0
  shift
fi
if [ "$#" -gt 0 ]; then
  echo "STOP=usage openclaw-ui.sh [--no-open]"
  exit 1
fi

LOCAL_BIND_HOST="${OPENCLAW_TUNNEL_BIND_HOST:-127.0.0.1}"
LOCAL_PORT="${OPENCLAW_TUNNEL_LOCAL_PORT:-18789}"
REMOTE_PORT="${OPENCLAW_GATEWAY_PORT:-18789}"

ACTION="tunnel_up"
bash scripts/openclaw-tunnel.sh up

TMP_FETCH_SCRIPT="$(mktemp /tmp/openclaw_vm_dashboard_fetch.XXXXXX.sh)"
cleanup() {
  rm -f "$TMP_FETCH_SCRIPT"
}
trap cleanup EXIT

cat >"$TMP_FETCH_SCRIPT" <<'EOF'
#!/usr/bin/env bash
set -euo pipefail

if [ -f /root/.openclaw/dashboard-url.latest ]; then
  cat /root/.openclaw/dashboard-url.latest
  exit 0
fi

if command -v openclaw >/dev/null 2>&1; then
  RAW_OUTPUT="$(openclaw dashboard --no-open 2>&1 || true)"
  printf '%s\n' "$RAW_OUTPUT" | grep -Eo 'https?://[^[:space:]]+' | head -n 1 || true
fi
EOF
chmod +x "$TMP_FETCH_SCRIPT"

ACTION="fetch_vm_dashboard_url"
RAW_VM_OUTPUT="$(bash scripts/vm-run.sh "$TMP_FETCH_SCRIPT" || true)"
URL="$(printf '%s\n' "$RAW_VM_OUTPUT" | grep -Eo 'https?://[^[:space:]]+' | tail -n 1 || true)"

if [ -z "$URL" ]; then
  echo "STOP=dashboard_url_unavailable"
  echo "HINT=$(printf '%s' "$RAW_VM_OUTPUT" | head -c 160 | tr '\n' ' ')"
  exit 1
fi

URL="$(printf '%s' "$URL" | sed -E "s#https?://127\\.0\\.0\\.1:${REMOTE_PORT}#http://${LOCAL_BIND_HOST}:${LOCAL_PORT}#")"
URL="$(printf '%s' "$URL" | sed -E "s#https?://localhost:${REMOTE_PORT}#http://${LOCAL_BIND_HOST}:${LOCAL_PORT}#")"

ACTION="store_local_url_file"
LOCAL_URL_FILE="${OPENCLAW_LOCAL_DASHBOARD_URL_FILE:-$HOME/.openclaw/dashboard-url.latest}"
umask 077
mkdir -p "$(dirname "$LOCAL_URL_FILE")"
printf '%s\n' "$URL" > "$LOCAL_URL_FILE"
chmod 600 "$LOCAL_URL_FILE"

ACTION="open_browser"
if [ "$DO_OPEN" -eq 1 ] && command -v open >/dev/null 2>&1; then
  open "$URL" >/dev/null 2>&1 || true
fi

ACTION="copy_clipboard"
COPIED_TO_CLIPBOARD=0
if command -v pbcopy >/dev/null 2>&1; then
  printf '%s' "$URL" | pbcopy
  COPIED_TO_CLIPBOARD=1
fi

URL_SAFE="$(printf '%s' "$URL" | sed -E 's@([?#&](token|auth|key|session)=)[^&#]*@\1***REDACTED***@Ig; s@(#token=)[^&#]*@\1***REDACTED***@Ig; s@(/token/)[^/?#]+@\1***REDACTED***@Ig')"

echo "READY=openclaw_ui_ready"
echo "URL=${URL_SAFE}"
echo "URL_FILE=${LOCAL_URL_FILE}"
if [ "$COPIED_TO_CLIPBOARD" -eq 1 ]; then
  echo "READY=url_copied_to_clipboard"
fi
echo "DONE=openclaw_ui_opened"
