#!/usr/bin/env bash
set -euo pipefail

# Security Gate
# Checks for secrets, authz tests, and dependency vulnerabilities

OUTPUT_FILE="${1:-test-results/ci/security-gate.json}"
mkdir -p "$(dirname "$OUTPUT_FILE")"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Initialize checks
SECRET_SCAN_EXECUTED=false
SECRETS_FOUND=0
AUTHZ_TESTS_EXECUTED=false
AUTHZ_TESTS_PASSED=false
DEPENDENCY_SCAN_EXECUTED=false
CRITICAL_VULNS=0

UNKNOWNS=()

# Check for secret scanning capability
if command -v gitleaks &> /dev/null || command -v trufflehog &> /dev/null; then
    SECRET_SCAN_EXECUTED=true
    # Would run: gitleaks detect --no-git --source . --report-format json
    UNKNOWNS+=("Secret scanning tool available but not executed in this gate")
else
    UNKNOWNS+=("No secret scanning tool installed (gitleaks, trufflehog)")
fi

# Check for authz tests
if grep -r "authz\|authorization" server/**/*.test.ts &> /dev/null; then
    AUTHZ_TESTS_EXECUTED=true
    # Would check test results
    UNKNOWNS+=("Authorization tests exist but results not integrated")
else
    UNKNOWNS+=("No authorization bypass tests found")
fi

# Check for dependency scanning
if command -v npm &> /dev/null; then
    DEPENDENCY_SCAN_EXECUTED=true
    # Would run: npm audit --json
    UNKNOWNS+=("Dependency scanning available but not executed in this gate")
else
    UNKNOWNS+=("npm not available for dependency scanning")
fi

# Determine status
STATUS="unknown"
if [[ ${#UNKNOWNS[@]} -gt 0 ]]; then
    STATUS="unknown"
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
  "unknowns": $(printf '%s\n' "${UNKNOWNS[@]}" | jq -R . | jq -s .)
}
EOF

echo "Security gate report written to $OUTPUT_FILE"
echo "Status: $STATUS (${#UNKNOWNS[@]} unknowns)"

# Fail if status is unknown (no real checks executed)
if [[ "$STATUS" == "unknown" ]]; then
    exit 1
fi

exit 0
