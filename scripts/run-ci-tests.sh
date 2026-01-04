#!/usr/bin/env bash
set -euo pipefail

coverage=false
report_dir="test-results/ci"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --coverage)
      coverage=true
      ;;
    --report-dir=*)
      report_dir="${1#*=}"
      ;;
    --report-dir)
      shift
      report_dir="${1:-}"
      ;;
    *)
      printf "Unknown argument: %s\n" "$1" >&2
      exit 2
      ;;
  esac
  shift
done

if [[ -z "$report_dir" ]]; then
  printf "Report directory is required.\n" >&2
  exit 2
fi

mkdir -p "$report_dir"
unit_report="$report_dir/unit.json"
integration_report="$report_dir/integration.json"
summary_report="$report_dir/summary.json"

coverage_args=()
if [[ "$coverage" == "true" ]]; then
  coverage_args=(--coverage)
fi

start_time=$(date +%s)

unit_status=0
if ! bash scripts/run-unit-tests.sh --report-file "$unit_report" "${coverage_args[@]}"; then
  unit_status=$?
fi

integration_status=0
if ! bash scripts/run-integration-tests.sh --report-file "$integration_report" "${coverage_args[@]}"; then
  integration_status=$?
fi

printf "Aggregating CI test report...\n"
pnpm tsx scripts/test-report.ts \
  --input "unit:$unit_report" \
  --input "integration:$integration_report" \
  --output "$summary_report"

end_time=$(date +%s)
run_seconds=$((end_time - start_time))
printf "CI test run completed in %s seconds.\n" "$run_seconds"

if [[ $unit_status -ne 0 || $integration_status -ne 0 ]]; then
  exit 1
fi
