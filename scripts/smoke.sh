#!/usr/bin/env bash
# ISA Smoke Test — runs typecheck + unit tests + build in sequence.
# Usage: pnpm run smoke
set -euo pipefail

echo "=== ISA Smoke Test ==="
echo ""

echo "[1/3] TypeScript check..."
pnpm check
echo "  OK"
echo ""

echo "[2/3] Unit tests..."
pnpm test-unit
echo "  OK"
echo ""

echo "[3/3] Build..."
pnpm build
echo "  OK"
echo ""

echo "=== Smoke test passed ==="
