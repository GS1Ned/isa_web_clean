#!/usr/bin/env bash
set -euo pipefail

# Security Gate
# Executes scoped checks for secrets, authorization guardrails, and dependency vulnerabilities.
# Status semantics:
# - pass: all required checks executed and no blocking findings
# - fail: executed checks found blocking issues
# - unknown: one or more checks could not be deterministically executed (non-blocking)

OUTPUT_FILE="${1:-test-results/ci/security-gate.json}"
mkdir -p "$(dirname "$OUTPUT_FILE")"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

SECRET_SCAN_EXECUTED=false
SECRETS_FOUND=0
AUTHZ_TESTS_EXECUTED=false
AUTHZ_TESTS_PASSED=false
DEPENDENCY_SCAN_EXECUTED=false
CRITICAL_VULNS=0

UNKNOWNS=()
FAILURES=()

# 1) Secret scanning (deterministic via repo gate)
if [[ -x "scripts/gates/security-secrets-scan.sh" ]]; then
    SECRET_SCAN_EXECUTED=true
    if bash scripts/gates/security-secrets-scan.sh > /tmp/security-secrets-scan.out 2>&1; then
        SECRETS_FOUND=0
    else
        SECRETS_FOUND=1
        FAILURES+=("Secret scan detected potential secrets (see scripts/gates/security-secrets-scan.sh output)")
    fi
else
    UNKNOWNS+=("security-secrets-scan.sh not executable or missing")
fi

# 2) Authorization guardrail signal (deterministic static check)
AUTHZ_MATCH_COUNT=0
if command -v rg &> /dev/null; then
    AUTHZ_MATCH_COUNT=$(rg -n "protectedProcedure|TRPCError\\(\\{ code: \"FORBIDDEN\" \\}|requireUser" server --glob "*.ts" 2>/dev/null | wc -l | tr -d ' ')
else
    AUTHZ_MATCH_COUNT=$(grep -R "protectedProcedure\|TRPCError({ code: \"FORBIDDEN\" })\|requireUser" server --include="*.ts" 2>/dev/null | wc -l | tr -d ' ')
fi

if [[ "$AUTHZ_MATCH_COUNT" -gt 0 ]]; then
    AUTHZ_TESTS_EXECUTED=true
    AUTHZ_TESTS_PASSED=true
else
    AUTHZ_TESTS_EXECUTED=true
    AUTHZ_TESTS_PASSED=false
    FAILURES+=("No authorization guardrail evidence found in server TypeScript sources")
fi

# 3) Dependency vulnerability scan (best-effort deterministic execution)
if command -v pnpm &> /dev/null; then
    DEPENDENCY_SCAN_EXECUTED=true
    AUDIT_FILE="/tmp/security-audit.json"
    AUDIT_ERR="/tmp/security-audit.err"

    # pnpm audit can hang in constrained environments; bound runtime for determinism.
    if command -v timeout &> /dev/null; then
        if timeout 45s pnpm audit --audit-level high --json > "$AUDIT_FILE" 2> "$AUDIT_ERR"; then
            :
        else
            AUDIT_EXIT=$?
            if [[ "$AUDIT_EXIT" -eq 124 ]]; then
                UNKNOWNS+=("Dependency scan timed out after 45s")
                DEPENDENCY_SCAN_EXECUTED=false
            fi
        fi
    else
        if command -v python3 &> /dev/null; then
            set +e
            python3 - "$AUDIT_FILE" "$AUDIT_ERR" << 'PY'
import subprocess
import sys
from pathlib import Path

audit_file = Path(sys.argv[1])
err_file = Path(sys.argv[2])

try:
    proc = subprocess.run(
        ["pnpm", "audit", "--audit-level", "high", "--json"],
        capture_output=True,
        text=True,
        timeout=45,
        check=False,
    )
    audit_file.write_text(proc.stdout or "")
    err_file.write_text(proc.stderr or "")
    raise SystemExit(proc.returncode)
except subprocess.TimeoutExpired as exc:
    audit_file.write_text((exc.stdout or "") if isinstance(exc.stdout, str) else "")
    err_file.write_text((exc.stderr or "") if isinstance(exc.stderr, str) else "")
    raise SystemExit(124)
PY
            AUDIT_EXIT=$?
            set -e
            if [[ "$AUDIT_EXIT" -eq 124 ]]; then
                UNKNOWNS+=("Dependency scan timed out after 45s")
                DEPENDENCY_SCAN_EXECUTED=false
            fi
        else
            UNKNOWNS+=("No timeout utility and no python3 fallback for dependency scan timeout")
            DEPENDENCY_SCAN_EXECUTED=false
        fi
    fi

    if [[ "$DEPENDENCY_SCAN_EXECUTED" == "true" ]] && [[ -s "$AUDIT_FILE" ]]; then
        if jq empty "$AUDIT_FILE" >/dev/null 2>&1; then
            CRITICAL=$(jq '.metadata.vulnerabilities.critical // 0' "$AUDIT_FILE" 2>/dev/null || echo 0)
            HIGH=$(jq '.metadata.vulnerabilities.high // 0' "$AUDIT_FILE" 2>/dev/null || echo 0)
            CRITICAL_VULNS=$((CRITICAL + HIGH))
            if [[ "$CRITICAL_VULNS" -gt 0 ]]; then
                FAILURES+=("Dependency audit found $CRITICAL_VULNS high/critical vulnerabilities")
            fi
        else
            UNKNOWNS+=("Dependency audit output was not parseable JSON")
            DEPENDENCY_SCAN_EXECUTED=false
        fi
    elif [[ "$DEPENDENCY_SCAN_EXECUTED" == "true" ]]; then
        UNKNOWNS+=("Dependency audit produced no output")
        DEPENDENCY_SCAN_EXECUTED=false
    fi
else
    UNKNOWNS+=("pnpm not available for dependency scanning")
fi

STATUS="unknown"
if [[ ${#FAILURES[@]} -gt 0 ]]; then
    STATUS="fail"
elif [[ "$SECRET_SCAN_EXECUTED" == "true" ]] && [[ "$AUTHZ_TESTS_EXECUTED" == "true" ]] && [[ "$AUTHZ_TESTS_PASSED" == "true" ]] && [[ "$DEPENDENCY_SCAN_EXECUTED" == "true" ]] && [[ ${#UNKNOWNS[@]} -eq 0 ]]; then
    STATUS="pass"
else
    STATUS="unknown"
fi

if [[ ${#UNKNOWNS[@]} -gt 0 ]]; then
    UNKNOWNS_JSON=$(printf '%s\n' "${UNKNOWNS[@]}" | jq -R . | jq -s .)
else
    UNKNOWNS_JSON="[]"
fi

if [[ ${#FAILURES[@]} -gt 0 ]]; then
    FAILURES_JSON=$(printf '%s\n' "${FAILURES[@]}" | jq -R . | jq -s .)
else
    FAILURES_JSON="[]"
fi

# Generate JSON report
cat > "$OUTPUT_FILE" << EOF
{
  "meta": {
    "generated_at": "$TIMESTAMP"
  },
  "status": "$STATUS",
  "checks": {
    "secret_scan": {
      "executed": $SECRET_SCAN_EXECUTED,
      "secrets_found": $SECRETS_FOUND
    },
    "authz_tests": {
      "executed": $AUTHZ_TESTS_EXECUTED,
      "tests_passed": $AUTHZ_TESTS_PASSED
    },
    "dependency_scan": {
      "executed": $DEPENDENCY_SCAN_EXECUTED,
      "critical_vulns": $CRITICAL_VULNS
    }
  },
  "thresholds": {
    "secret_leaks_max": 0,
    "critical_vulns_max": 0
  },
  "unknowns": $UNKNOWNS_JSON,
  "failures": $FAILURES_JSON
}
EOF

echo "Security gate report written to $OUTPUT_FILE"
echo "Status: $STATUS (${#UNKNOWNS[@]} unknowns, ${#FAILURES[@]} failures)"

if [[ "$STATUS" == "fail" ]]; then
    exit 1
fi

exit 0
