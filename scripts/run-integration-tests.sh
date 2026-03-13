#!/usr/bin/env bash
set -euo pipefail

coverage=false
report_file="test-results/integration.json"
quarantine_file=""
quarantine_only=false

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

quarantine_patterns=()
if [[ -n "$quarantine_file" ]]; then
  if [[ ! -f "$quarantine_file" ]]; then
    printf "Quarantine file not found: %s\n" "$quarantine_file" >&2
    exit 2
  fi
  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%%#*}"
    line="$(printf '%s' "$line" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
    [[ -z "$line" ]] && continue
    pattern="${line%%|*}"
    pattern="$(printf '%s' "$pattern" | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')"
    [[ -z "$pattern" ]] && continue
    quarantine_patterns+=("$pattern")
  done < "$quarantine_file"
fi

if [[ "$quarantine_only" == "true" ]]; then
  if [[ ${#quarantine_patterns[@]} -gt 0 ]]; then
    vitest_args+=(--passWithNoTests)
    for pattern in "${quarantine_patterns[@]}"; do
      vitest_args+=("$pattern")
    done
  else
    printf "No quarantine patterns configured; skipping integration quarantine run.\n"
    cat > "$report_file" <<'EOF'
{"numTotalTests":0,"numPassedTests":0,"numFailedTests":0,"numPendingTests":0,"testResults":[]}
EOF
    exit 0
  fi
elif [[ ${#quarantine_patterns[@]} -gt 0 ]]; then
  for pattern in "${quarantine_patterns[@]}"; do
    vitest_args+=(--exclude "$pattern")
  done
fi

printf "Running integration tests...\n"
RUN_DB_TESTS=true pnpm vitest "${vitest_args[@]}"

end_time=$(date +%s)
run_seconds=$((end_time - start_time))
printf "Integration tests completed in %s seconds.\n" "$run_seconds"
