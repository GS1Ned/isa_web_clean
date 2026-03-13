#!/usr/bin/env bash
set -euo pipefail

echo "=== OpenClaw Browser Policy Gate ==="

FILE="config/openclaw/browser.policy.json"
if [[ ! -f "$FILE" ]]; then
  echo "❌ FAIL: Missing $FILE"
  exit 1
fi

jq -e '
  .version | type == "string"
' "$FILE" >/dev/null

jq -e '
  .mode == "fallback_only"
  and (.require_explicit_opt_in_env | type == "string")
  and (.allow_unsafe_launch_flags == false)
  and (.unsafe_launch_flags_env | type == "string")
  and (.prohibited_actions | type == "array" and length > 0)
' "$FILE" >/dev/null || {
  echo "❌ FAIL: browser policy must enforce fallback_only and deny unsafe flags"
  exit 1
}

for required_action in \
  autonomous_login_submission \
  unchecked_file_downloads \
  background_navigation_without_user_intent; do
  if ! jq -e --arg action "$required_action" '.prohibited_actions | index($action) != null' "$FILE" >/dev/null; then
    echo "❌ FAIL: browser policy missing prohibited action: $required_action"
    exit 1
  fi
done

SCRAPER_FILES=(
  "server/news-scraper-playwright.ts"
  "server/news-scraper-efrag.ts"
  "server/news/news-scraper-gs1eu.ts"
  "server/news/news-scraper-greendeal.ts"
  "server/news/news-scraper-zes.ts"
  "server/news/news-scraper-eurlex.ts"
)

for scraper in "${SCRAPER_FILES[@]}"; do
  if ! rg -n "isBrowserAutomationAllowed|browserLaunchArgs" "$scraper" >/dev/null 2>&1; then
    echo "❌ FAIL: browser policy helper missing in $scraper"
    exit 1
  fi
done

if rg -n -- "--no-sandbox|--disable-setuid-sandbox" \
  "${SCRAPER_FILES[@]}" >/dev/null 2>&1; then
  echo "❌ FAIL: browser scrapers must not hardcode unsafe launch flags"
  exit 1
fi

echo "✅ OpenClaw browser policy gate PASSED"
