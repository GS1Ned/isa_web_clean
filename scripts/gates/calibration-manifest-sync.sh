#!/usr/bin/env bash
set -euo pipefail

echo "READY=calibration_manifest_sync_check"
pnpm exec tsx scripts/governance/build_calibration_manifest.ts --check
echo "DONE=calibration_manifest_sync_clean"
