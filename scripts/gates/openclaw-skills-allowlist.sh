#!/usr/bin/env bash
set -euo pipefail

echo "=== OpenClaw Skills Allowlist Gate ==="

FILE="config/openclaw/skills-allowlist.json"
if [[ ! -f "$FILE" ]]; then
  echo "❌ FAIL: Missing $FILE"
  exit 1
fi

jq -e '
  .version | type == "string"
' "$FILE" >/dev/null

jq -e '
  (.quarantine_install_dir | type == "string")
  and (.entries | type == "array")
' "$FILE" >/dev/null || {
  echo "❌ FAIL: skills allowlist top-level shape invalid"
  exit 1
}

jq -e '
  all(.entries[]?;
    (.name|type=="string") and
    (.source|type=="string") and
    (.checksum_sha256|type=="string" and test("^[a-f0-9]{64}$")) and
    (.reviewer|type=="string") and
    (.approval_date|type=="string") and
    (.scope|type=="string") and
    (.status|type=="string")
  )
' "$FILE" >/dev/null || {
  echo "❌ FAIL: one or more allowlist entries are malformed"
  exit 1
}

DUP_CHECKSUMS="$(jq -r '.entries[]?.checksum_sha256' "$FILE" | sort | uniq -d)"
if [[ -n "$DUP_CHECKSUMS" ]]; then
  echo "❌ FAIL: duplicate checksums detected"
  echo "$DUP_CHECKSUMS"
  exit 1
fi

echo "✅ OpenClaw skills allowlist gate PASSED"
