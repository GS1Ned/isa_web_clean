#!/usr/bin/env bash
set -euo pipefail

coverage=false
report_dir="test-results/ci"
quarantine_file="config/testing/vitest.quarantine.txt"
quarantine_only=false

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
    --quarantine-file=*)
      quarantine_file="${1#*=}"
      ;;
    --quarantine-file)
      shift
      quarantine_file="${1:-}"
      ;;
    --quarantine-only)
      quarantine_only=true
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

if [[ -n "$quarantine_file" && ! -f "$quarantine_file" ]]; then
  printf "Quarantine file not found: %s\n" "$quarantine_file" >&2
  exit 2
fi

mkdir -p "$report_dir"
unit_report="$report_dir/unit.json"
integration_report="$report_dir/integration.json"
summary_report="$report_dir/summary.json"

start_time=$(date +%s)

unit_status=0
unit_cmd=(bash scripts/run-unit-tests.sh --report-file "$unit_report")
if [[ "$coverage" == "true" ]]; then
  unit_cmd+=(--coverage)
fi
if [[ -n "$quarantine_file" ]]; then
  unit_cmd+=(--quarantine-file "$quarantine_file")
fi
if [[ "$quarantine_only" == "true" ]]; then
  unit_cmd+=(--quarantine-only)
fi
if "${unit_cmd[@]}"; then
  unit_status=0
else
  unit_status=$?
fi

integration_status=0
integration_cmd=(bash scripts/run-integration-tests.sh --report-file "$integration_report")
if [[ "$coverage" == "true" ]]; then
  integration_cmd+=(--coverage)
fi
if [[ -n "$quarantine_file" ]]; then
  integration_cmd+=(--quarantine-file "$quarantine_file")
fi
if [[ "$quarantine_only" == "true" ]]; then
  integration_cmd+=(--quarantine-only)
fi
if "${integration_cmd[@]}"; then
  integration_status=0
else
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
