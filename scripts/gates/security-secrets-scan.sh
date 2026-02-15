#!/usr/bin/env bash
set -euo pipefail

# Scoped, low-noise secret regression scan.
# Prints only file paths (never matched content) to avoid leaking sensitive values in CI logs.

cd "$(git rev-parse --show-toplevel)"

echo "READY=security_secrets_scan_start"

scopes=(
  server
  scripts
  client
  shared
)

# Pattern format: "NAME:::REGEX"
patterns=(
  "private_key_block:::BEGIN (RSA|OPENSSH|EC) PRIVATE KEY"
  "mysql_url_with_creds:::\\bmysql:\\/\\/[^:\\s/]+:[^@\\s/]{12,}@"
  "hardcoded_password:::password\\s*[:=]\\s*['\\\"][^'\\\"]{6,}['\\\"]"
  "hardcoded_api_key:::api[_-]?key\\s*[:=]\\s*['\\\"][^'\\\"]{10,}['\\\"]"
  "openai_like_key:::\\bsk-[A-Za-z0-9]{20,}\\b"
  "aws_access_key:::\\bAKIA[0-9A-Z]{16}\\b"
  "github_classic_token:::\\bghp_[A-Za-z0-9]{30,}\\b"
  "github_pat_token:::\\bgithub_pat_[A-Za-z0-9_]{20,}\\b"
  "slack_token:::\\bxox[baprs]-[A-Za-z0-9-]{10,}\\b"
)

fail=0

for entry in "${patterns[@]}"; do
  name="${entry%%:::*}"
  re="${entry##*:::}"

  files=""
  if command -v rg >/dev/null 2>&1; then
    # --files-with-matches keeps output secret-safe.
    files="$(rg -S -l "$re" "${scopes[@]}" 2>/dev/null || true)"
  else
    files="$(grep -RIlE "$re" "${scopes[@]}" 2>/dev/null || true)"
  fi

  if [[ -n "$files" ]]; then
    echo "STOP=secret_pattern:${name}"
    echo "$files" | sed 's/^/ - /'
    fail=1
  fi
done

if [[ "$fail" -ne 0 ]]; then
  exit 1
fi

echo "DONE=security_secrets_scan_ok"
