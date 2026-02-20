#!/usr/bin/env bash
set -euo pipefail

# Security Gate
# Executes scoped checks for secrets, authorization guardrails, and dependency vulnerabilities.
# Status semantics:
# - pass: all required checks executed and no blocking findings
# - fail: executed checks found blocking issues
# Deterministic policy:
# - timeout and execution-precondition failures are FAIL

OUTPUT_FILE="${1:-test-results/ci/security-gate.json}"
mkdir -p "$(dirname "$OUTPUT_FILE")"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
START_TS=$(date +%s)
AUDIT_TIMEOUT_SEC="${SECURITY_AUDIT_TIMEOUT_SEC:-180}"
AUDIT_LEVEL="${SECURITY_AUDIT_LEVEL:-high}"
BLOCKING_LEVELS_RAW="${SECURITY_AUDIT_BLOCKING_LEVELS:-critical}"

BLOCKING_LEVELS_NORMALIZED="$(echo "$BLOCKING_LEVELS_RAW" | tr '[:upper:]' '[:lower:]' | tr -d ' ')"
if [[ -z "$BLOCKING_LEVELS_NORMALIZED" ]]; then
    BLOCKING_LEVELS_NORMALIZED="critical"
fi
IFS=',' read -r -a BLOCKING_LEVELS <<< "$BLOCKING_LEVELS_NORMALIZED"
BLOCKING_LEVELS_EFFECTIVE="$(IFS=,; echo "${BLOCKING_LEVELS[*]}")"

SECRET_SCAN_EXECUTED=false
SECRETS_FOUND=0
AUTHZ_TESTS_EXECUTED=false
AUTHZ_TESTS_PASSED=false
DEPENDENCY_SCAN_EXECUTED=false
CRITICAL_VULNS=0
HIGH_VULNS=0
MODERATE_VULNS=0
LOW_VULNS=0
INFO_VULNS=0
BLOCKING_VULNS=0

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
    FAILURES+=("security-secrets-scan.sh not executable or missing")
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
    AUDIT_FILE="/tmp/security-audit.json"
    AUDIT_ERR="/tmp/security-audit.err"

    if ! [[ "$AUDIT_TIMEOUT_SEC" =~ ^[0-9]+$ ]]; then
        FAILURES+=("SECURITY_AUDIT_TIMEOUT_SEC must be numeric, got: $AUDIT_TIMEOUT_SEC")
    fi
    if ! [[ "$AUDIT_LEVEL" =~ ^(low|moderate|high|critical)$ ]]; then
        FAILURES+=("SECURITY_AUDIT_LEVEL must be one of low|moderate|high|critical, got: $AUDIT_LEVEL")
    fi
    for level in "${BLOCKING_LEVELS[@]}"; do
        if ! [[ "$level" =~ ^(info|low|moderate|high|critical)$ ]]; then
            FAILURES+=("SECURITY_AUDIT_BLOCKING_LEVELS contains unsupported value: $level")
        fi
    done

    # pnpm audit can hang in constrained environments; bound runtime for determinism.
    AUDIT_EXIT=0
    if command -v timeout &> /dev/null; then
        set +e
        timeout "${AUDIT_TIMEOUT_SEC}s" pnpm audit --audit-level "$AUDIT_LEVEL" --json > "$AUDIT_FILE" 2> "$AUDIT_ERR"
        AUDIT_EXIT=$?
        set -e
    else
        if command -v python3 &> /dev/null; then
            set +e
            python3 - "$AUDIT_FILE" "$AUDIT_ERR" "$AUDIT_TIMEOUT_SEC" "$AUDIT_LEVEL" << 'PY'
import subprocess
import sys
from pathlib import Path

audit_file = Path(sys.argv[1])
err_file = Path(sys.argv[2])
audit_level = sys.argv[4]

try:
    proc = subprocess.run(
        ["pnpm", "audit", "--audit-level", audit_level, "--json"],
        capture_output=True,
        text=True,
        timeout=int(sys.argv[3]),
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
        else
            FAILURES+=("No timeout utility and no python3 fallback for dependency scan timeout control")
        fi
    fi

    if [[ "$AUDIT_EXIT" -eq 124 || "$AUDIT_EXIT" -eq 137 ]]; then
        FAILURES+=("Dependency scan timed out after ${AUDIT_TIMEOUT_SEC}s")
    elif [[ "$AUDIT_EXIT" -eq 0 || "$AUDIT_EXIT" -eq 1 ]]; then
        DEPENDENCY_SCAN_EXECUTED=true
    elif [[ "$AUDIT_EXIT" -ne 0 ]]; then
        FAILURES+=("Dependency scan command failed with exit code ${AUDIT_EXIT}")
    fi

    if [[ "$DEPENDENCY_SCAN_EXECUTED" == "true" ]] && [[ -s "${AUDIT_FILE:-}" ]]; then
        # pnpm emits JSON lines; use the final object's metadata as canonical summary.
        if jq -s -e 'length > 0 and (.[-1].metadata.vulnerabilities != null)' "$AUDIT_FILE" >/dev/null 2>&1; then
            CRITICAL_VULNS=$(jq -s -r '.[-1].metadata.vulnerabilities.critical // 0' "$AUDIT_FILE")
            HIGH_VULNS=$(jq -s -r '.[-1].metadata.vulnerabilities.high // 0' "$AUDIT_FILE")
            MODERATE_VULNS=$(jq -s -r '.[-1].metadata.vulnerabilities.moderate // 0' "$AUDIT_FILE")
            LOW_VULNS=$(jq -s -r '.[-1].metadata.vulnerabilities.low // 0' "$AUDIT_FILE")
            INFO_VULNS=$(jq -s -r '.[-1].metadata.vulnerabilities.info // 0' "$AUDIT_FILE")

            BLOCKING_VULNS=0
            for level in "${BLOCKING_LEVELS[@]}"; do
                case "$level" in
                    critical) BLOCKING_VULNS=$((BLOCKING_VULNS + CRITICAL_VULNS)) ;;
                    high) BLOCKING_VULNS=$((BLOCKING_VULNS + HIGH_VULNS)) ;;
                    moderate) BLOCKING_VULNS=$((BLOCKING_VULNS + MODERATE_VULNS)) ;;
                    low) BLOCKING_VULNS=$((BLOCKING_VULNS + LOW_VULNS)) ;;
                    info) BLOCKING_VULNS=$((BLOCKING_VULNS + INFO_VULNS)) ;;
                esac
            done

            if [[ "$BLOCKING_VULNS" -gt 0 ]]; then
                FAILURES+=("Dependency audit found $BLOCKING_VULNS blocking vulnerabilities for levels [$BLOCKING_LEVELS_EFFECTIVE] (critical=$CRITICAL_VULNS, high=$HIGH_VULNS, moderate=$MODERATE_VULNS, low=$LOW_VULNS, info=$INFO_VULNS)")
            fi
        else
            FAILURES+=("Dependency audit output was not parseable JSON")
            DEPENDENCY_SCAN_EXECUTED=false
        fi
    elif [[ "$DEPENDENCY_SCAN_EXECUTED" == "true" ]] && [[ ! -s "${AUDIT_FILE:-}" ]]; then
        FAILURES+=("Dependency audit produced no output")
        DEPENDENCY_SCAN_EXECUTED=false
    fi
else
    FAILURES+=("pnpm not available for dependency scanning")
fi

STATUS="pass"
if [[ ${#FAILURES[@]} -gt 0 ]]; then
    STATUS="fail"
fi

if [[ ${#FAILURES[@]} -gt 0 ]]; then
    FAILURES_JSON=$(printf '%s\n' "${FAILURES[@]}" | jq -R . | jq -s .)
else
    FAILURES_JSON="[]"
fi
END_TS=$(date +%s)
DURATION_SEC=$((END_TS - START_TS))

# Generate JSON report
cat > "$OUTPUT_FILE" << EOF
{
  "meta": {
    "generated_at": "$TIMESTAMP",
    "duration_sec": $DURATION_SEC
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
      "critical_vulns": $CRITICAL_VULNS,
      "high_vulns": $HIGH_VULNS,
      "moderate_vulns": $MODERATE_VULNS,
      "low_vulns": $LOW_VULNS,
      "info_vulns": $INFO_VULNS,
      "blocking_vulns": $BLOCKING_VULNS
    }
  },
  "thresholds": {
    "secret_leaks_max": 0,
    "critical_vulns_max": 0,
    "audit_timeout_sec": $AUDIT_TIMEOUT_SEC,
    "audit_level": "$AUDIT_LEVEL",
    "blocking_levels": "$BLOCKING_LEVELS_EFFECTIVE",
    "blocking_vulns_max": 0
  },
  "unknowns": [],
  "failures": $FAILURES_JSON
}
EOF

echo "Security gate report written to $OUTPUT_FILE"
echo "Status: $STATUS (${#FAILURES[@]} failures)"

if [[ "$STATUS" != "pass" ]]; then
    exit 1
fi

exit 0
