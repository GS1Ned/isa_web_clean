#!/usr/bin/env bash
set -euo pipefail

# Observability Contract Check
# Deterministic pass/fail verification for logging, tracing, and metrics infrastructure

OUTPUT_FILE="${1:-test-results/ci/observability.json}"
mkdir -p "$(dirname "$OUTPUT_FILE")"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

collect_runtime_router_modules() {
    local import_map refs runtime_files id src path
    import_map="$(mktemp)"

    # Build identifier -> import path map for local imports.
    awk '
/^import / {
  n=split($0,a,"\"");
  if (n>=3 && index(a[2],"./")==1) {
    src=a[2];
    sub(/\.js$/, "", src);
    line=$0;
    if (line ~ /import \{[^}]+\}/) {
      s=index(line, "{");
      e=index(line, "}");
      ids=substr(line, s+1, e-s-1);
      gsub(/ /, "", ids);
      split(ids, arr, ",");
      for (i in arr) {
        id=arr[i];
        sub(/as.*/, "", id);
        if (id != "") print id "\t" src;
      }
    } else {
      split(line, parts, /[ ]+/);
      if (parts[2] != "") print parts[2] "\t" src;
    }
  }
}
' server/routers.ts > "$import_map"

    refs="$(
        awk '
BEGIN { in_app_router=0 }
/export const appRouter = router\(\{/ { in_app_router=1; next }
in_app_router && /^\}\);/ { in_app_router=0 }
in_app_router {
  if ($0 ~ /^[[:space:]]*[A-Za-z0-9_]+:[[:space:]]*[A-Za-z0-9_]+,?[[:space:]]*$/) {
    line=$0;
    gsub(/^[[:space:]]+/, "", line);
    split(line, parts, ":");
    val=parts[2];
    gsub(/[ ,]/, "", val);
    if (val != "router" && val != "publicProcedure" && val != "protectedProcedure") {
      print val;
    }
  }
}
' server/routers.ts | sort -u
    )"

    runtime_files=("server/routers.ts")
    while IFS= read -r id; do
        [[ -z "$id" ]] && continue
        src="$(awk -F'\t' -v k="$id" '$1==k{print $2; exit}' "$import_map")"
        [[ -z "$src" ]] && continue
        path="server/${src#./}.ts"
        [[ -f "$path" ]] && runtime_files+=("$path")
    done <<< "$refs"

    rm -f "$import_map"
    printf '%s\n' "${runtime_files[@]}" | sort -u
}

STRUCTURED_LOGGING=false
LOGGING_COVERAGE=0
RUNTIME_MODULES_TOTAL=0
ERROR_BOUNDARY_MODULES=0
LOGGER_COVERED_MODULES=0
MISSING_LOGGER_MODULES=()

if [[ -f "server/_core/logger-wiring.ts" ]]; then
    STRUCTURED_LOGGING=true
fi

if command -v rg &> /dev/null && command -v awk &> /dev/null; then
    runtime_modules="$(collect_runtime_router_modules)"
    RUNTIME_MODULES_TOTAL="$(printf '%s\n' "$runtime_modules" | sed '/^$/d' | wc -l | tr -d ' ')"

    while IFS= read -r module_path; do
        [[ -z "$module_path" ]] && continue
        if rg -q "try\\s*\\{" "$module_path"; then
            ERROR_BOUNDARY_MODULES=$((ERROR_BOUNDARY_MODULES + 1))
            if rg -q "serverLogger" "$module_path"; then
                LOGGER_COVERED_MODULES=$((LOGGER_COVERED_MODULES + 1))
            else
                MISSING_LOGGER_MODULES+=("$module_path")
            fi
        fi
    done <<< "$runtime_modules"

    if [[ "$ERROR_BOUNDARY_MODULES" -gt 0 ]]; then
        LOGGING_COVERAGE="$(awk "BEGIN {printf \"%.1f\", ($LOGGER_COVERED_MODULES / $ERROR_BOUNDARY_MODULES) * 100}")"
    fi
fi

# Check for trace propagation
TRACE_PROPAGATION=false
if grep -r "trace.*id\|traceId" server --include="*.ts" &> /dev/null; then
    TRACE_PROPAGATION=true
fi

# Check for metrics collection
METRICS_COLLECTION=false
if grep -r "metrics\|prometheus\|statsd" server --include="*.ts" &> /dev/null; then
    METRICS_COLLECTION=true
fi

FAIL_REASONS=()
if [[ "$STRUCTURED_LOGGING" == "false" ]]; then
    FAIL_REASONS+=("Structured logging wiring not found (server/_core/logger-wiring.ts missing)")
fi
if ! command -v rg &> /dev/null; then
    FAIL_REASONS+=("rg not available for runtime observability coverage checks")
fi
if ! command -v awk &> /dev/null; then
    FAIL_REASONS+=("awk not available for numeric threshold comparison")
fi
if [[ "$RUNTIME_MODULES_TOTAL" -eq 0 ]]; then
    FAIL_REASONS+=("No runtime router modules discovered from server/routers.ts")
fi
if [[ "$ERROR_BOUNDARY_MODULES" -eq 0 ]]; then
    FAIL_REASONS+=("No runtime modules with local try/catch boundaries discovered for scoped logging coverage")
fi
if [[ "$TRACE_PROPAGATION" == "false" ]]; then
    FAIL_REASONS+=("No distributed tracing signal found in server TypeScript sources")
fi
if [[ "$METRICS_COLLECTION" == "false" ]]; then
    FAIL_REASONS+=("No metrics collection signal found in server TypeScript sources")
fi

if [[ "$ERROR_BOUNDARY_MODULES" -gt 0 ]]; then
    if [[ $(awk "BEGIN {print ($LOGGING_COVERAGE >= 80) ? 1 : 0}") -ne 1 ]]; then
        FAIL_REASONS+=("Structured logging coverage below threshold (${LOGGING_COVERAGE}% < 80%)")
    fi
    if [[ "${#MISSING_LOGGER_MODULES[@]}" -gt 0 ]]; then
        FAIL_REASONS+=("Runtime modules with local error boundaries but no serverLogger: $(IFS=', '; echo "${MISSING_LOGGER_MODULES[*]}")")
    fi
fi

STATUS="pass"
if [[ ${#FAIL_REASONS[@]} -gt 0 ]]; then
    STATUS="fail"
fi

if [[ ${#FAIL_REASONS[@]} -gt 0 ]]; then
    FAIL_REASONS_JSON=$(printf '%s\n' "${FAIL_REASONS[@]}" | jq -R . | jq -s .)
else
    FAIL_REASONS_JSON="[]"
fi

cat > "$OUTPUT_FILE" << EOF
{
  "meta": {
    "generated_at": "$TIMESTAMP"
  },
  "status": "$STATUS",
  "checks": {
    "structured_logging": {
      "implemented": $STRUCTURED_LOGGING,
      "coverage_pct": $LOGGING_COVERAGE,
      "runtime_modules_total": $RUNTIME_MODULES_TOTAL,
      "error_boundary_modules": $ERROR_BOUNDARY_MODULES,
      "logger_covered_modules": $LOGGER_COVERED_MODULES
    },
    "trace_propagation": {
      "implemented": $TRACE_PROPAGATION
    },
    "metrics_collection": {
      "implemented": $METRICS_COLLECTION
    }
  },
  "thresholds": {
    "structured_logging_coverage_min": 80
  },
  "unknowns": [],
  "fail_reasons": $FAIL_REASONS_JSON
}
EOF

echo "Observability report written to $OUTPUT_FILE"
echo "Status: $STATUS"
echo "Logging coverage: ${LOGGING_COVERAGE}%"

if [[ "$STATUS" != "pass" ]]; then
    exit 1
fi

exit 0
