#!/usr/bin/env bash
set -euo pipefail

echo "PREFLIGHT=openclaw_dashboard_url"

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

if ! command -v openclaw >/dev/null 2>&1; then
  echo "STOP=openclaw_cli_missing"
  exit 1
fi

ACTION="dashboard_url_fetch"
RAW_OUTPUT="$(openclaw dashboard --no-open 2>&1 || true)"
URL="$(printf '%s\n' "$RAW_OUTPUT" | grep -Eo 'https?://[^[:space:]]+' | head -n 1 || true)"

if [ -z "$URL" ]; then
  echo "STOP=dashboard_url_not_found"
  echo "HINT=$(printf '%s' "$RAW_OUTPUT" | head -c 160 | tr '\n' ' ')"
  exit 1
fi

URL_LEN="$(printf '%s' "$URL" | wc -c | tr -d ' ')"
TOKENIZED=0
if printf '%s' "$URL" | grep -Eiq '([?#&](token|auth|key|session)=|#token=|/token/|/auth/)'; then
  TOKENIZED=1
fi

if [ "$TOKENIZED" -eq 1 ]; then
  ACTION="dashboard_url_store_secure"
  URL_FILE="${OPENCLAW_DASHBOARD_URL_FILE:-${HOME:-/root}/.openclaw/dashboard-url.latest}"
  umask 077
  mkdir -p "$(dirname "$URL_FILE")"
  printf '%s\n' "$URL" > "$URL_FILE"
  chmod 600 "$URL_FILE"

  SAFE_PREFIX="$(printf '%s' "$URL" | sed -E 's#([?#&](token|auth|key|session)=)[^&#]*#\1<redacted>#Ig; s#(/token/)[^/?#]+#\1<redacted>#Ig')"
  echo "READY=dashboard_url_tokenized"
  echo "URL_PREFIX=${SAFE_PREFIX}"
  echo "URL_LEN=${URL_LEN}"
  echo "URL_FILE=${URL_FILE}"
  echo "DONE=openclaw_dashboard_url"
else
  echo "READY=dashboard_url_not_tokenized"
  echo "URL=${URL}"
  echo "URL_LEN=${URL_LEN}"
  echo "DONE=openclaw_dashboard_url"
fi
