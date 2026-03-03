#!/usr/bin/env bash
set -euo pipefail

POLICY_FILE="${OPENCLAW_MODEL_ROUTING_POLICY_PATH:-config/openclaw/model-routing.policy.json}"

usage() {
  cat <<'EOF'
Usage:
  bash scripts/openclaw-model-route.sh --task "task summary" [--json] [--clipboard]
  bash scripts/openclaw-model-route.sh --profile <route_id> [--json] [--clipboard]
  bash scripts/openclaw-model-route.sh --default [--json] [--clipboard]
EOF
}

TASK_TEXT=""
PROFILE_ID=""
JSON_OUT="0"
DEFAULT_ONLY="0"
CLIPBOARD="0"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --task)
      TASK_TEXT="${2:-}"
      shift 2
      ;;
    --profile)
      PROFILE_ID="${2:-}"
      shift 2
      ;;
    --json)
      JSON_OUT="1"
      shift
      ;;
    --default)
      DEFAULT_ONLY="1"
      shift
      ;;
    --clipboard)
      CLIPBOARD="1"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ ! -f "$POLICY_FILE" ]]; then
  echo "Missing policy file: $POLICY_FILE" >&2
  exit 1
fi

RESULT="$(python3 - "$POLICY_FILE" "$TASK_TEXT" "$PROFILE_ID" "$JSON_OUT" "$DEFAULT_ONLY" <<'PY'
import json
import sys

policy_path, task_text, profile_id, json_out, default_only = sys.argv[1:]
policy = json.loads(open(policy_path, "r", encoding="utf-8").read())

task_text_l = task_text.lower().strip()
routes = policy["routes"]
default_route_id = policy["router"]["default_route_id"]

def route_by_id(route_id: str):
    for route in routes:
        if route["id"] == route_id:
            return route
    raise SystemExit(f"Unknown route id: {route_id}")

def score_route(route):
    raw_score = 0
    matched = []
    for term in route.get("match_any", []):
        term_l = term.lower()
        if term_l and term_l in task_text_l:
            raw_score += 1
            matched.append(term)
    score = raw_score
    if route["id"] == default_route_id:
        score += 0.25
    return raw_score, score, matched

if profile_id:
    selected = route_by_id(profile_id)
    matched_terms = []
    reason = "explicit_profile"
elif default_only == "1" or not task_text_l:
    selected = route_by_id(default_route_id)
    matched_terms = []
    reason = "default_route"
else:
    scored = []
    for route in routes:
        raw_score, score, matched_terms = score_route(route)
        scored.append((raw_score, score, route["priority"], route["id"], matched_terms, route))
    scored.sort(key=lambda x: (-x[1], -x[2], x[3]))
    top = scored[0]
    if top[0] <= 0:
        selected = route_by_id(default_route_id)
        matched_terms = []
        reason = "default_route_no_keyword_match"
    else:
        selected = top[5]
        matched_terms = top[4]
        reason = "keyword_match"

result = {
    "selected_route_id": selected["id"],
    "alias": selected["alias"],
    "model": selected["model"],
    "cost_profile": selected["cost_profile"],
    "best_for": selected["best_for"],
    "better_options_when": selected["better_options_when"],
    "cost_benefit": selected["cost_benefit"],
    "selection_reason": reason,
    "matched_terms": matched_terms,
    "ui_action": f"Select '{selected['alias']}' in the OpenClaw UI model picker."
}

if json_out == "1":
    print(json.dumps(result, indent=2))
else:
    print(f"ROUTE_ID={result['selected_route_id']}")
    print(f"ALIAS={result['alias']}")
    print(f"MODEL={result['model']}")
    print(f"SELECTION_REASON={result['selection_reason']}")
    if matched_terms:
        print(f"MATCHED_TERMS={','.join(matched_terms)}")
    else:
        print("MATCHED_TERMS=")
    print(f"UI_ACTION={result['ui_action']}")
PY
)"

if [[ "$CLIPBOARD" == "1" ]]; then
  ALIAS_VALUE="$(python3 -c 'import json,sys,re; s=sys.stdin.read(); print(json.loads(s)["alias"] if s.lstrip().startswith("{") else next((line.split("=",1)[1] for line in s.splitlines() if line.startswith("ALIAS=")), ""))' <<<"$RESULT")"
  if [[ -n "$ALIAS_VALUE" ]] && command -v pbcopy >/dev/null 2>&1; then
    printf '%s' "$ALIAS_VALUE" | pbcopy
  fi
fi

printf '%s\n' "$RESULT"
