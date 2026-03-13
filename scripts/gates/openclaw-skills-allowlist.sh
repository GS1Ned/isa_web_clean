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
    (.approval_date|type=="string" and test("^[0-9]{4}-[0-9]{2}-[0-9]{2}$")) and
    (.scope|type=="string") and
    (.status|type=="string" and (. == "approved" or . == "pending" or . == "revoked"))
  )
' "$FILE" >/dev/null || {
  echo "❌ FAIL: one or more allowlist entries are malformed"
  exit 1
}

jq -e '
  all(.entries[]?;
    if .status == "approved"
    then (.source | test("^(https://.+|ssh://.+|git@.+|file://.+|local://.+|github:[^[:space:]]+/.+)$"))
    else true
    end
  )
' "$FILE" >/dev/null || {
  echo "❌ FAIL: approved entries must have a valid provenance source format"
  exit 1
}

DUP_CHECKSUMS="$(jq -r '.entries[]?.checksum_sha256' "$FILE" | sort | uniq -d)"
if [[ -n "$DUP_CHECKSUMS" ]]; then
  echo "❌ FAIL: duplicate checksums detected"
  echo "$DUP_CHECKSUMS"
  exit 1
fi

DUP_APPROVED_NAMES="$(jq -r '.entries[]? | select(.status == "approved") | .name' "$FILE" | sort | uniq -d)"
if [[ -n "$DUP_APPROVED_NAMES" ]]; then
  echo "❌ FAIL: duplicate approved skill names detected"
  echo "$DUP_APPROVED_NAMES"
  exit 1
fi

echo "✅ OpenClaw skills allowlist gate PASSED"
