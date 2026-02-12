#!/usr/bin/env bash
set -euo pipefail

# Schema Validation Gate
# Validates all proof artifacts against their JSON schemas

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

cd "$REPO_ROOT"

echo "=== ISA Proof Artifact Schema Validation ==="
echo ""

# Check if ajv-cli is available
if ! command -v ajv &> /dev/null; then
    echo "ERROR: ajv-cli not found. Install with: npm install -g ajv-cli"
    exit 1
fi

FAIL_COUNT=0
PASS_COUNT=0
SKIP_COUNT=0

# Define artifact-to-schema mappings (using arrays instead of associative array)
ARTIFACTS=(
    "test-results/ci/summary.json:docs/quality/schemas/test-summary.schema.json"
    "test-results/ci/security-gate.json:docs/quality/schemas/security-gate.schema.json"
    "test-results/ci/perf.json:docs/quality/schemas/perf.schema.json"
    "test-results/ci/reliability.json:docs/quality/schemas/reliability.schema.json"
    "test-results/ci/observability.json:docs/quality/schemas/observability.schema.json"
    "test-results/ci/governance.json:docs/quality/schemas/governance.schema.json"
    "test-results/ci/slo-policy-check.json:docs/quality/schemas/slo-policy-check.schema.json"
    "test-results/ci/rag-eval.json:docs/quality/schemas/rag-eval.schema.json"
    "docs/evidence/_generated/catalogue.json:docs/quality/schemas/catalogue.schema.json"
    "docs/sre/_generated/error_budget_status.json:docs/quality/schemas/error-budget-status.schema.json"
    "docs/architecture/panel/_generated/ARCHITECTURE_SCORECARD.json:docs/quality/schemas/architecture-scorecard.schema.json"
)

for mapping in "${ARTIFACTS[@]}"; do
    artifact="${mapping%%:*}"
    schema="${mapping##*:}"
    
    if [[ ! -f "$schema" ]]; then
        echo "❌ FAIL: Schema missing: $schema"
        FAIL_COUNT=$((FAIL_COUNT + 1))
        continue
    fi
    
    if [[ ! -f "$artifact" ]]; then
        echo "⏭️  SKIP: Artifact not generated: $artifact"
        SKIP_COUNT=$((SKIP_COUNT + 1))
        continue
    fi
    
    echo "Validating: $artifact"
    if ajv validate -s "$schema" -d "$artifact" --strict=false 2>&1; then
        echo "✅ PASS: $artifact"
        PASS_COUNT=$((PASS_COUNT + 1))
    else
        echo "❌ FAIL: $artifact does not conform to schema"
        FAIL_COUNT=$((FAIL_COUNT + 1))
    fi
    echo ""
done

echo "=== Validation Summary ==="
echo "PASS: $PASS_COUNT"
echo "FAIL: $FAIL_COUNT"
echo "SKIP: $SKIP_COUNT"
echo ""

if [[ $FAIL_COUNT -gt 0 ]]; then
    echo "❌ Schema validation FAILED"
    exit 1
fi

if [[ $PASS_COUNT -eq 0 ]]; then
    echo "⚠️  No artifacts validated (all skipped)"
    exit 1
fi

echo "✅ Schema validation PASSED"
exit 0
