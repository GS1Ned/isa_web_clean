#!/usr/bin/env bash
set -euo pipefail

PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${PATH:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

printf 'PREFLIGHT=openclaw_isa_autonomy\n'

WAL_FILE="docs/agent/_runtime/WAL.md"
WORKING_BUFFER_FILE="docs/agent/_runtime/WORKING_BUFFER.md"
COMMAND_MAP_FILE="config/openclaw/cli-command-map.json"
BUNDLE_FILE="docs/architecture/panel/_generated/MINIMAL_VALIDATION_BUNDLE.json"
SETUP_SCRIPT="scripts/openclaw-isa-autonomy-setup.sh"
ENV_EXAMPLE_FILE=".env.example"
RUN_TS="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
TMP_DIR="$(mktemp -d /tmp/openclaw-isa-autonomy.XXXXXX)"
trap 'rm -rf "$TMP_DIR"' EXIT

if [[ ! -f "$COMMAND_MAP_FILE" ]]; then
  printf 'READY=bootstrap_setup_missing_map\n'
  bash "$SETUP_SCRIPT"
fi

if [[ ! -f "$COMMAND_MAP_FILE" ]]; then
  printf 'STOP=missing_command_map path=%s\n' "$COMMAND_MAP_FILE"
  exit 1
fi

RUNTIME_MODE="$(awk -F= '/^OPENCLAW_RUNTIME_MODE=/{print $2}' "$ENV_EXAMPLE_FILE" | tail -n1 2>/dev/null || true)"
DASHBOARD_FILE="$(python3 - <<'PY'
import json
from pathlib import Path
p = Path('config/openclaw/cli-command-map.json')
if p.exists():
    data = json.loads(p.read_text())
    print(data.get('dashboard_url_file') or '')
PY
)"

append_wal() {
  local body="$1"
  {
    printf '\n### Run %s\n' "$RUN_TS"
    printf '%s\n' "$body"
  } >> "$WAL_FILE"
}

safe_run() {
  local label="$1"
  shift
  local rc out
  set +e
  out="$("$@" 2>&1)"
  rc=$?
  set -e
  printf '%s\n' "$out" > "$TMP_DIR/${label}.log"
  printf '%s\n' "$rc" > "$TMP_DIR/${label}.rc"
  return 0
}

printf 'READY=setup_verified\n'

VALIDATION_RESULTS_FILE="$TMP_DIR/validation-results.json"
python3 - <<'PY' > "$VALIDATION_RESULTS_FILE"
import json
from pathlib import Path
bundle_path = Path('docs/architecture/panel/_generated/MINIMAL_VALIDATION_BUNDLE.json')
selected = []
project_skill_markdown_present = any(Path('.agents/skills').glob('*/SKILL.md'))
if bundle_path.exists():
    data = json.loads(bundle_path.read_text())
    commands = data.get('bundle', {}).get('preflight_and_action_commands', [])
    preferred = {
        'pnpm check',
        'bash scripts/gates/no-console-gate.sh',
        'bash scripts/gates/security-secrets-scan.sh',
        'bash scripts/gates/doc-code-validator.sh --canonical-only'
    }
    if not project_skill_markdown_present:
        preferred.add('python3 scripts/validate_planning_and_traceability.py')
    selected = [cmd for cmd in commands if cmd in preferred]
print(json.dumps({
    'selected_commands': selected,
    'project_skill_markdown_present': project_skill_markdown_present
}, indent=2))
PY

VALIDATION_COMMANDS=()
while IFS= read -r cmd; do
  [[ -n "$cmd" ]] && VALIDATION_COMMANDS+=("$cmd")
done < <(python3 - "$VALIDATION_RESULTS_FILE" <<'PY'
import json, pathlib, sys
p = pathlib.Path(sys.argv[1])
data = json.loads(p.read_text())
for cmd in data.get('selected_commands', []):
    print(cmd)
PY
)

if [[ ${#VALIDATION_COMMANDS[@]} -eq 0 ]]; then
  if [[ -f package.json ]]; then
    VALIDATION_COMMANDS=("pnpm check")
  fi
fi

for cmd in "${VALIDATION_COMMANDS[@]}"; do
  actual_cmd="$cmd"
  if [[ "$cmd" == "pnpm check" && -f package.json ]]; then
    actual_cmd="pnpm run check"
  fi
  label="$(printf '%s' "$cmd" | tr ' /:' '___' | tr -cd '[:alnum:]_-' | cut -c1-80)"
  printf 'READY=validation_run command=%s\n' "$actual_cmd"
  safe_run "$label" bash -lc "$actual_cmd"
done

DASHBOARD_STATUS="not_attempted"
DASHBOARD_URL=""
PROJECT_SKILL_MARKDOWN_PRESENT="$(python3 - "$VALIDATION_RESULTS_FILE" <<'PY'
import json, pathlib, sys
p = pathlib.Path(sys.argv[1])
data = json.loads(p.read_text())
print('true' if data.get('project_skill_markdown_present') else 'false')
PY
)"
if [[ "${ISA_AUTONOMY_NO_OPEN:-0}" != "1" ]]; then
  if [[ -x scripts/openclaw-ui.sh && "$RUNTIME_MODE" == "vm_only" ]]; then
    safe_run openclaw_ui bash scripts/openclaw-ui.sh
    if grep -q '^READY=openclaw_ui_ready' "$TMP_DIR/openclaw_ui.log"; then
      DASHBOARD_STATUS="opened_via_openclaw_ui"
      DASHBOARD_URL="$(grep '^URL=' "$TMP_DIR/openclaw_ui.log" | tail -n1 | cut -d= -f2-)"
    else
      DASHBOARD_STATUS="openclaw_ui_failed"
    fi
  elif [[ -n "$DASHBOARD_FILE" && -f "$DASHBOARD_FILE" ]]; then
    DASHBOARD_URL="$(head -n1 "$DASHBOARD_FILE" || true)"
    if [[ -n "$DASHBOARD_URL" ]]; then
      if command -v open >/dev/null 2>&1; then
        open "$DASHBOARD_URL" >/dev/null 2>&1 || true
        DASHBOARD_STATUS="opened_local_dashboard_file"
      elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open "$DASHBOARD_URL" >/dev/null 2>&1 || true
        DASHBOARD_STATUS="opened_local_dashboard_file"
      else
        DASHBOARD_STATUS="dashboard_url_available_no_opener"
      fi
    fi
  fi
else
  DASHBOARD_STATUS="skipped_by_env"
fi

NEXT_ACTION="Review the first failing validation and patch the smallest deterministic fix."
HAS_FAILURE=0
for rc_file in "$TMP_DIR"/*.rc; do
  [[ -f "$rc_file" ]] || continue
  if [[ "$(cat "$rc_file")" != "0" ]]; then
    HAS_FAILURE=1
    break
  fi
done
if [[ "$HAS_FAILURE" -eq 0 ]]; then
  NEXT_ACTION="Expand proactive automation safely: enable one additional verified skill or maintenance check."
fi

cat > "$WORKING_BUFFER_FILE" <<WB
# ISA OpenClaw Working Buffer

## Current Objective
Operate the ISA Max Autonomy + Self-Evolution Pack with deterministic setup, runtime learning capture, and proactive wake surfaces.

## Queue
$(for cmd in "${VALIDATION_COMMANDS[@]}"; do printf -- '- %s\n' "$cmd"; done)

## Latest Dashboard Action
- $DASHBOARD_STATUS

## Next Best Experiment
$NEXT_ACTION
WB

VALIDATION_SUMMARY="$(python3 - "$TMP_DIR" <<'PY'
import json, pathlib, sys
root = pathlib.Path(sys.argv[1])
rows = []
for rc_file in sorted(root.glob('*.rc')):
    label = rc_file.stem
    rc = rc_file.read_text().strip()
    log = root / f'{label}.log'
    excerpt = ''
    if log.exists():
        excerpt = ' '.join(log.read_text(encoding='utf-8', errors='ignore').splitlines()[:2])[:240]
    rows.append({'label': label, 'rc': rc, 'excerpt': excerpt})
print(json.dumps(rows))
PY
)"
export VALIDATION_SUMMARY
VALIDATION_BULLETS="$(python3 - <<'PY'
import json, os
rows = json.loads(os.environ['VALIDATION_SUMMARY'])
for row in rows:
    status = 'pass' if row['rc'] == '0' else 'fail'
    print(f"- {row['label']}: {status} (rc={row['rc']}) {row['excerpt']}")
PY
)"

FAILURE_BULLETS="$(python3 - <<'PY'
import json, os
rows = json.loads(os.environ['VALIDATION_SUMMARY'])
failed = [r for r in rows if r['rc'] != '0']
if not failed:
    print('- none')
else:
    for row in failed:
        print(f"- {row['label']}: rc={row['rc']}")
PY
)"

append_wal "$(cat <<EOF
- Environment:
  - repo_root: \`$REPO_ROOT\`
  - runtime_mode: \`$RUNTIME_MODE\`
- Actions:
  - verified setup and command map
  - ran selected minimal validation commands derived from \`$BUNDLE_FILE\` when available
  - attempted dashboard open best-effort
  - refreshed \`$WORKING_BUFFER_FILE\`
- Outputs:
  - validation results:
$VALIDATION_BULLETS
  - dashboard_status: \`$DASHBOARD_STATUS\`
  - dashboard_url: \`${DASHBOARD_URL:-unavailable}\`
- Failures:
$FAILURE_BULLETS
- Fixes:
  - setup auto-ran when command map was absent
  - runner limited itself to the lightest safe validation subset from the bundle
- New heuristics:
  - prefer bundle-derived validations over ad hoc checks when the bundle is present
  - keep dashboard opening optional via \`ISA_AUTONOMY_NO_OPEN=1\` for non-interactive automation
  - when autonomy-managed project skills are present under \`.agents/skills\`, skip \`validate_planning_and_traceability.py\` because it is scoped to canonical markdown paths rather than runtime skill bundles
- Next action:
  - $NEXT_ACTION
EOF
)"

printf 'DONE=openclaw_isa_autonomy_complete\n'
