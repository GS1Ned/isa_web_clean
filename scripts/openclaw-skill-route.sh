#!/usr/bin/env bash
set -euo pipefail

POLICY_FILE="${OPENCLAW_SKILL_ROUTING_POLICY_PATH:-config/openclaw/skill-routing.policy.json}"
CACHE_DIR=".openclaw/launcher"
CACHE_FILE="$CACHE_DIR/vm_skills_check.json"
VM_SSH_WRAPPER="scripts/vm/isa_vm_ssh.sh"

usage() {
  cat <<'USAGE'
Usage:
  bash scripts/openclaw-skill-route.sh --task "task summary" [--json]
  bash scripts/openclaw-skill-route.sh --profile <route_id> [--json]
  bash scripts/openclaw-skill-route.sh --default [--json]
USAGE
}

TASK_TEXT=""
PROFILE_ID=""
JSON_OUT="0"
DEFAULT_ONLY="0"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --task) TASK_TEXT="${2:-}"; shift 2 ;;
    --profile) PROFILE_ID="${2:-}"; shift 2 ;;
    --json) JSON_OUT="1"; shift ;;
    --default) DEFAULT_ONLY="1"; shift ;;
    -h|--help) usage; exit 0 ;;
    *) echo "Unknown argument: $1" >&2; usage >&2; exit 1 ;;
  esac
done

[[ -f "$POLICY_FILE" ]] || { echo "Missing policy file: $POLICY_FILE" >&2; exit 1; }
mkdir -p "$CACHE_DIR"

SKILLS_JSON="{}"
if [[ -x "$VM_SSH_WRAPPER" ]]; then
  RAW_OUT="$((bash "$VM_SSH_WRAPPER" exec --quiet --command 'openclaw skills check --json') 2>/dev/null || true)"
  JSON_BLOCK="$(printf '%s\n' "$RAW_OUT" | sed -n '/^{/,$p')"
  if [[ -n "$JSON_BLOCK" ]] && python3 - <<'PY' >/dev/null 2>&1
import json,sys
json.loads(sys.stdin.read())
PY
<<<"$JSON_BLOCK"; then
    printf '%s\n' "$JSON_BLOCK" > "$CACHE_FILE"
  fi
fi
if [[ -f "$CACHE_FILE" ]]; then
  SKILLS_JSON="$(cat "$CACHE_FILE")"
fi

RESULT="$(python3 - "$POLICY_FILE" "$TASK_TEXT" "$PROFILE_ID" "$JSON_OUT" "$DEFAULT_ONLY" <<'PY'
import json, sys
from pathlib import Path

policy_path, task_text, profile_id, json_out, default_only = sys.argv[1:]
policy = json.loads(Path(policy_path).read_text())
cache_file = Path('.openclaw/launcher/vm_skills_check.json')
skills_state = json.loads(cache_file.read_text()) if cache_file.exists() else {"summary":{},"eligible":[],"missingRequirements":[]}
eligible = set(skills_state.get('eligible', []))
missing = {item['name']: item for item in skills_state.get('missingRequirements', [])}

task_text_l = task_text.lower().strip()
default_route_id = policy['router']['default_route_id']
routes = policy['routes']

def route_by_id(route_id):
    for route in routes:
        if route['id'] == route_id:
            return route
    raise SystemExit(f'Unknown route id: {route_id}')

def score_route(route):
    raw = 0
    matched = []
    for term in route.get('match_any', []):
        t = term.lower()
        if t and t in task_text_l:
            raw += 1
            matched.append(term)
    score = raw + (0.25 if route['id'] == default_route_id else 0)
    return raw, score, matched

if profile_id:
    selected = route_by_id(profile_id)
    matched_terms = []
    reason = 'explicit_profile'
elif default_only == '1' or not task_text_l:
    selected = route_by_id(default_route_id)
    matched_terms = []
    reason = 'default_route'
else:
    scored = []
    for route in routes:
        raw, score, matched = score_route(route)
        scored.append((raw, score, route['priority'], route['id'], matched, route))
    scored.sort(key=lambda x: (-x[1], -x[2], x[3]))
    top = scored[0]
    if top[0] <= 0:
        selected = route_by_id(default_route_id)
        matched_terms = []
        reason = 'default_route_no_keyword_match'
    else:
        selected = top[5]
        matched_terms = top[4]
        reason = 'keyword_match'

preferred = selected.get('preferred_skills', [])
supporting = selected.get('supporting_skills', [])
all_skills = preferred + [s for s in supporting if s not in preferred]
ready = [s for s in all_skills if s in eligible]
unavailable = []
for s in all_skills:
    if s not in eligible:
        unavailable.append({
            'name': s,
            'missing': missing.get(s, {}).get('missing', {}),
            'install': missing.get(s, {}).get('install', [])
        })

verified_core = policy.get('core_verified_skills', [])
general_ready = [s for s in verified_core if s in eligible]
workflow = selected.get('workflow_guidance', [])
starter_lines = []
if ready:
    starter_lines.append('Use these ready OpenClaw skills autonomously when they add value and fit the task scope:')
    starter_lines.extend(f'- {s}' for s in ready)
if unavailable:
    starter_lines.append('Do not rely on these currently unavailable skills:')
    starter_lines.extend(f'- {item["name"]}' for item in unavailable)
if workflow:
    starter_lines.append('Skill workflow guidance:')
    starter_lines.extend(f'- {line}' for line in workflow)

result = {
    'selected_route_id': selected['id'],
    'alias': selected['alias'],
    'selection_reason': reason,
    'matched_terms': matched_terms,
    'preferred_skills': preferred,
    'supporting_skills': supporting,
    'ready_skills': ready,
    'unavailable_skills': unavailable,
    'general_ready_skills': general_ready,
    'best_for': selected.get('best_for', []),
    'workflow_guidance': workflow,
    'starter_prompt_lines': starter_lines,
    'ui_action': 'Use the ready skills autonomously when they add value to the task.'
}

if json_out == '1':
    print(json.dumps(result, indent=2))
else:
    print(f'ROUTE_ID={result["selected_route_id"]}')
    print(f'ALIAS={result["alias"]}')
    print(f'SELECTION_REASON={result["selection_reason"]}')
    print(f'READY_SKILLS={",".join(result["ready_skills"])}')
    print(f'GENERAL_READY_SKILLS={",".join(result["general_ready_skills"])}')
    print(f'UI_ACTION={result["ui_action"]}')
PY
)"

printf '%s\n' "$RESULT"
