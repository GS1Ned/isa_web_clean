#!/usr/bin/env bash
set -euo pipefail

coverage=false
report_file="test-results/unit.json"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --coverage)
      coverage=true
      ;;
    --report-file=*)
      report_file="${1#*=}"
      ;;
    --report-file)
      shift
      report_file="${1:-}"
      ;;
    *)
      printf "Unknown argument: %s\n" "$1" >&2
      exit 2
      ;;
  esac
  shift
done

if [[ -z "$report_file" ]]; then
  printf "Report file path is required.\n" >&2
  exit 2
fi

start_time=$(date +%s)
mkdir -p "$(dirname "$report_file")"

vitest_args=(run --reporter=verbose --reporter=json --outputFile "$report_file")
if [[ "$coverage" == "true" ]]; then
  vitest_args+=(--coverage)
fi

printf "Running unit tests...\n"
pnpm vitest "${vitest_args[@]}"

end_time=$(date +%s)
run_seconds=$((end_time - start_time))
printf "Unit tests completed in %s seconds.\n" "$run_seconds"
