#!/usr/bin/env bash
set -euo pipefail

PATH="/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${PATH:-}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$REPO_ROOT"

printf 'PREFLIGHT=openclaw_isa_autonomy_setup\n'

WAL_FILE="docs/agent/_runtime/WAL.md"
HEARTBEAT_FILE="docs/agent/_runtime/HEARTBEAT.md"
WORKING_BUFFER_FILE="docs/agent/_runtime/WORKING_BUFFER.md"
COMMAND_MAP_FILE="config/openclaw/cli-command-map.json"
TEMPLATE_FILE="config/openclaw/openclaw.isa-lab.template.json"
ENV_EXAMPLE_FILE=".env.example"
VM_SSH_WRAPPER="scripts/vm/isa_vm_ssh.sh"
SETUP_TS="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
TMP_DIR="$(mktemp -d /tmp/openclaw-isa-autonomy-setup.XXXXXX)"
trap 'rm -rf "$TMP_DIR"' EXIT

mkdir -p docs/agent/_runtime config/openclaw config/openclaw/hooks
: > /dev/null

failures=()
notes=()
skill_results_json='[]'

extract_json_payload() {
  local source_file="$1"
  python3 - "$source_file" <<'PY'
import json, sys
from pathlib import Path
text = Path(sys.argv[1]).read_text(encoding='utf-8', errors='ignore')
for idx, ch in enumerate(text):
    if ch not in '{[':
        continue
    try:
        obj = json.loads(text[idx:])
    except Exception:
        continue
    print(json.dumps(obj))
    raise SystemExit(0)
print('{}')
PY
}

append_wal() {
  local body="$1"
  {
    printf '\n### Run %s\n' "$SETUP_TS"
    printf '%s\n' "$body"
  } >> "$WAL_FILE"
}

have_cmd() {
  command -v "$1" >/dev/null 2>&1
}

capture_cmd() {
  local label="$1"
  shift
  local out rc
  set +e
  out="$($@ 2>&1)"
  rc=$?
  set -e
  printf '%s\n' "$out" > "$TMP_DIR/${label}.txt"
  return "$rc"
}

json_escape_file() {
  python3 - "$1" <<'PY'
import json, pathlib, sys
p = pathlib.Path(sys.argv[1])
text = p.read_text(encoding='utf-8', errors='ignore') if p.exists() else ''
print(json.dumps(text))
PY
}

if [[ ! -f "$HEARTBEAT_FILE" || ! -f "$WORKING_BUFFER_FILE" || ! -f "$WAL_FILE" || ! -f "$TEMPLATE_FILE" ]]; then
  printf 'STOP=required_runtime_artifacts_missing\n'
  exit 1
fi

printf 'READY=runtime_files_present\n'

RUNTIME_MODE="unknown"
OPENCLAW_CONFIG_PATH_VALUE=""
OPENCLAW_DASHBOARD_URL_FILE_VALUE=""
if [[ -f "$ENV_EXAMPLE_FILE" ]]; then
  RUNTIME_MODE="$(awk -F= '/^OPENCLAW_RUNTIME_MODE=/{print $2}' "$ENV_EXAMPLE_FILE" | tail -n1)"
  OPENCLAW_CONFIG_PATH_VALUE="$(awk -F= '/^OPENCLAW_CONFIG_PATH=/{print $2}' "$ENV_EXAMPLE_FILE" | tail -n1)"
  OPENCLAW_DASHBOARD_URL_FILE_VALUE="$(awk -F= '/^OPENCLAW_DASHBOARD_URL_FILE=/{print $2}' "$ENV_EXAMPLE_FILE" | tail -n1)"
fi

OPENCLAW_PRESENT=false
DOCTOR_CMD=null
SKILLS_LIST_CMD=null
SKILLS_CHECK_CMD=null
SECURITY_AUDIT_CMD=null
UPDATE_STATUS_CMD=null
DASHBOARD_CMD=null
HOOKS_LIST_CMD=null
HOOKS_CHECK_CMD=null
CRON_STATUS_CMD=null
CRON_LIST_CMD=null
CRON_ADD_CMD=null
CRON_EDIT_CMD=null
MEMORY_STATUS_CMD=null
PROJECT_SKILLS_CLI=null
PROJECT_SKILLS_ADD_CMD=null
PROJECT_SKILLS_UPDATE_ALL_CMD=null

if have_cmd openclaw; then
  OPENCLAW_PRESENT=true
  DOCTOR_CMD='openclaw doctor'
  SKILLS_LIST_CMD='openclaw skills list'
  SKILLS_CHECK_CMD='openclaw skills check --json'
  SECURITY_AUDIT_CMD='openclaw security audit --json'
  UPDATE_STATUS_CMD='openclaw update status --json'
  DASHBOARD_CMD='openclaw dashboard --no-open'
  HOOKS_LIST_CMD='openclaw hooks list'
  HOOKS_CHECK_CMD='openclaw hooks check'
  CRON_STATUS_CMD='openclaw cron status --json'
  CRON_LIST_CMD='openclaw cron list --json'
  CRON_ADD_CMD='openclaw cron add'
  CRON_EDIT_CMD='openclaw cron edit'
  MEMORY_STATUS_CMD='openclaw memory status --json'
fi

if have_cmd npx; then
  if capture_cmd skills_help npx -y skills --help; then
    PROJECT_SKILLS_CLI='npx -y skills'
    PROJECT_SKILLS_ADD_CMD='npx -y skills add'
    PROJECT_SKILLS_UPDATE_ALL_CMD='npx -y skills update'
  fi
fi

if capture_cmd openclaw_help openclaw --help; then :; else true; fi
if capture_cmd heartbeat_docs openclaw docs agents.defaults.heartbeat; then :; else true; fi
if capture_cmd workspace_docs openclaw docs agents.defaults.workspace; then :; else true; fi
if capture_cmd tools_profile_docs openclaw docs tools.profile; then :; else true; fi

export SETUP_TS RUNTIME_MODE OPENCLAW_PRESENT DOCTOR_CMD SKILLS_LIST_CMD SKILLS_CHECK_CMD
export PROJECT_SKILLS_CLI PROJECT_SKILLS_ADD_CMD PROJECT_SKILLS_UPDATE_ALL_CMD
export SECURITY_AUDIT_CMD UPDATE_STATUS_CMD HOOKS_LIST_CMD HOOKS_CHECK_CMD
export CRON_STATUS_CMD CRON_LIST_CMD CRON_ADD_CMD CRON_EDIT_CMD MEMORY_STATUS_CMD
export DASHBOARD_CMD OPENCLAW_DASHBOARD_URL_FILE_VALUE OPENCLAW_CONFIG_PATH_VALUE
python3 - "$COMMAND_MAP_FILE" <<'PY'
import json
import os
import sys
from collections import OrderedDict

out_path = sys.argv[1]
def nullable_env(name):
    value = os.environ.get(name, "")
    return value if value else None

m = OrderedDict()
m["generated_at"] = os.environ["SETUP_TS"]
m["runtime_mode"] = os.environ["RUNTIME_MODE"]
m["openclaw"] = os.environ["OPENCLAW_PRESENT"] == "true"
m["doctor_cmd"] = nullable_env("DOCTOR_CMD")
m["skills_list_cmd"] = nullable_env("SKILLS_LIST_CMD")
m["skills_check_cmd"] = nullable_env("SKILLS_CHECK_CMD")
m["skills_install_cmd"] = None
m["skills_update_all_cmd"] = None
m["project_skills_cli"] = nullable_env("PROJECT_SKILLS_CLI")
m["project_skills_add_cmd"] = nullable_env("PROJECT_SKILLS_ADD_CMD")
m["project_skills_update_all_cmd"] = nullable_env("PROJECT_SKILLS_UPDATE_ALL_CMD")
m["security_audit_cmd"] = nullable_env("SECURITY_AUDIT_CMD")
m["update_status_cmd"] = nullable_env("UPDATE_STATUS_CMD")
m["hooks_list_cmd"] = nullable_env("HOOKS_LIST_CMD")
m["hooks_check_cmd"] = nullable_env("HOOKS_CHECK_CMD")
m["cron_status_cmd"] = nullable_env("CRON_STATUS_CMD")
m["cron_list_cmd"] = nullable_env("CRON_LIST_CMD")
m["cron_add_cmd"] = nullable_env("CRON_ADD_CMD")
m["cron_edit_cmd"] = nullable_env("CRON_EDIT_CMD")
m["memory_status_cmd"] = nullable_env("MEMORY_STATUS_CMD")
m["dashboard_cmd"] = nullable_env("DASHBOARD_CMD")
m["dashboard_url_file"] = os.environ.get("OPENCLAW_DASHBOARD_URL_FILE_VALUE", "")
m["openclaw_config_path"] = os.environ.get("OPENCLAW_CONFIG_PATH_VALUE", "")
m["vm_exec_wrapper"] = "bash scripts/vm/isa_vm_ssh.sh exec --command" if os.environ["RUNTIME_MODE"] == "vm_only" else None
m["fallback_suggestions"] = OrderedDict([
    ("skills_install_cmd", "Use project skill installs via npx skills add or rely on VM built-in OpenClaw skills"),
    ("cron_jobs", "Use openclaw cron add/edit on the VM when OPENCLAW_RUNTIME_MODE=vm_only"),
    ("template_apply_target", "bash scripts/openclaw-config-apply.sh --target vm"),
])
with open(out_path, "w", encoding="utf-8") as handle:
    handle.write(json.dumps(m, indent=2))
PY
printf 'READY=cli_command_map_written path=%s\n' "$COMMAND_MAP_FILE"

SKILL_SPEC_FILE="$TMP_DIR/skill-specs.json"
cat > "$SKILL_SPEC_FILE" <<'JSON'
[
  {"name":"proactive-agent","mode":"project","source":"halthelobster/proactive-agent","skill":"proactive-agent"},
  {"name":"self-improving-agent","mode":"project","source":"charon-fan/agent-playbook","skill":"self-improving-agent"},
  {"name":"find-skills","mode":"project","source":"vercel-labs/skills","skill":"find-skills"},
  {"name":"skill-creator","mode":"project","source":"anthropics/skills","skill":"skill-creator"},
  {"name":"git-essentials","mode":"project","source":"sundial-org/awesome-openclaw-skills","skill":"git-essentials"},
  {"name":"debug-pro","mode":"project-fallback","source":"different-ai/agent-bank","skill":"debug-prod-issues"},
  {"name":"diagram-generator","mode":"project","source":"oimiragieo/agent-studio","skill":"diagram-generator"},
  {"name":"clawhub","mode":"vm-runtime","runtime_skill":"clawhub"},
  {"name":"github","mode":"vm-runtime","runtime_skill":"github"},
  {"name":"github-issues","mode":"vm-runtime","runtime_skill":"gh-issues"}
]
JSON

if [[ -x scripts/openclaw-enable-core-skills.sh ]]; then
  set +e
  CORE_OUT="$(bash scripts/openclaw-enable-core-skills.sh 2>&1)"
  CORE_RC=$?
  set -e
  printf '%s\n' "$CORE_OUT" > "$TMP_DIR/openclaw-enable-core-skills.log"
  if [[ $CORE_RC -ne 0 ]]; then
    failures+=("core_skill_enable_failed")
  else
    notes+=("core_skill_enable_ok")
  fi
fi

VM_SKILLS_JSON='{}'
VM_SKILLS_FILE="$TMP_DIR/vm_skills_check.json"
printf '%s\n' '{}' > "$VM_SKILLS_FILE"
if [[ "$RUNTIME_MODE" == "vm_only" && -x "$VM_SSH_WRAPPER" ]]; then
  set +e
  VM_DOCTOR_OUT="$(bash "$VM_SSH_WRAPPER" exec --quiet --command 'openclaw doctor --fix' 2>&1)"
  VM_DOCTOR_RC=$?
  set -e
  printf '%s\n' "$VM_DOCTOR_OUT" > "$TMP_DIR/vm-doctor-fix.log"
  if [[ $VM_DOCTOR_RC -ne 0 ]]; then
    failures+=("vm_doctor_fix_failed")
  else
    notes+=("vm_doctor_fix_ok")
  fi
  set +e
  VM_RAW="$(bash "$VM_SSH_WRAPPER" exec --quiet --command 'openclaw skills check --json' 2>/dev/null)"
  VM_RC=$?
  set -e
  if [[ $VM_RC -eq 0 && -n "$VM_RAW" ]]; then
    printf '%s\n' "$VM_RAW" > "$TMP_DIR/vm-skills-check.raw"
    VM_SKILLS_JSON="$(extract_json_payload "$TMP_DIR/vm-skills-check.raw")"
    printf '%s\n' "$VM_SKILLS_JSON" > "$VM_SKILLS_FILE"
  else
    failures+=("vm_skills_check_unavailable")
  fi
fi

set +e
INSTALL_RESULTS="$(python3 - "$SKILL_SPEC_FILE" "$PROJECT_SKILLS_ADD_CMD" "$VM_SKILLS_FILE" <<'PY'
import json, os, subprocess, sys, pathlib
spec_path, add_cmd, vm_skills_file = sys.argv[1:]
specs = json.loads(pathlib.Path(spec_path).read_text())
lock_path = pathlib.Path('skills-lock.json')
lock = json.loads(lock_path.read_text()) if lock_path.exists() else {'version':1,'skills':{}}
installed = set((lock.get('skills') or {}).keys())
vm_ready = set()
try:
    vm = json.loads(pathlib.Path(vm_skills_file).read_text())
    vm_ready = set(vm.get('eligible', []))
except Exception:
    vm_ready = set()
results = []
for item in specs:
    name = item['name']
    mode = item['mode']
    if mode == 'vm-runtime':
        runtime_skill = item['runtime_skill']
        status = 'ensured_runtime' if runtime_skill in vm_ready else 'missing_runtime'
        results.append({'name': name, 'status': status, 'mode': mode, 'runtime_skill': runtime_skill})
        continue
    if name in installed:
        results.append({'name': name, 'status': 'already_installed', 'mode': mode, 'source': item['source'], 'skill': item['skill']})
        continue
    if not add_cmd:
        results.append({'name': name, 'status': 'install_command_unavailable', 'mode': mode, 'source': item['source'], 'skill': item['skill']})
        continue
    cmd = add_cmd.split() + [item['source'], '--skill', item['skill'], '-y']
    try:
        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, timeout=90)
        out = proc.stdout[-1200:]
        if proc.returncode == 0:
            results.append({'name': name, 'status': 'installed', 'mode': mode, 'source': item['source'], 'skill': item['skill'], 'excerpt': out})
        else:
            results.append({'name': name, 'status': 'install_failed', 'mode': mode, 'source': item['source'], 'skill': item['skill'], 'excerpt': out})
    except subprocess.TimeoutExpired as exc:
        excerpt = (exc.stdout or '')[-1200:]
        results.append({'name': name, 'status': 'install_timeout', 'mode': mode, 'source': item['source'], 'skill': item['skill'], 'excerpt': excerpt})
print(json.dumps(results))
PY
)"
INSTALL_RC=$?
set -e
if [[ $INSTALL_RC -ne 0 || -z "$INSTALL_RESULTS" ]]; then
  skill_results_json='[]'
  failures+=("project_skill_install_probe_failed")
else
  skill_results_json="$INSTALL_RESULTS"
fi
printf '%s\n' "$skill_results_json" > "$TMP_DIR/skill-results.json"

if [[ "$RUNTIME_MODE" == "vm_only" && -x "$VM_SSH_WRAPPER" ]]; then
  REMOTE_SCRIPT="$TMP_DIR/remote-autonomy-setup.sh"
  cat > "$REMOTE_SCRIPT" <<'REMOTE'
set -euo pipefail
mkdir -p /root/.openclaw/workspace /root/.openclaw/workspace/memory
cat > /root/.openclaw/workspace/HEARTBEAT.md
cat > /root/.openclaw/workspace/WORKING_BUFFER.md
openclaw config set agents.defaults.heartbeat '{"every":"30m","suppressToolErrorWarnings":true}' --strict-json >/dev/null
CRON_RAW_FILE="/tmp/openclaw-cron-list.raw"
openclaw cron list --json > "$CRON_RAW_FILE" 2>/dev/null || true
CRON_JSON="$(python3 - "$CRON_RAW_FILE" <<'PY'
import json, sys
from pathlib import Path
text = Path(sys.argv[1]).read_text(encoding='utf-8', errors='ignore')
for idx, ch in enumerate(text):
    if ch not in '{[':
        continue
    try:
        obj = json.loads(text[idx:])
    except Exception:
        continue
    print(json.dumps(obj))
    raise SystemExit(0)
print(json.dumps({"jobs": []}))
PY
)"
CRON_JSON_FILE="/tmp/openclaw-cron-list.json"
printf '%s' "$CRON_JSON" > "$CRON_JSON_FILE"
ensure_job() {
  local name="$1"
  local add_mode="$2"
  local schedule="$3"
  local tz="$4"
  local event_text="$5"
  local reconcile_json primary_id
  reconcile_json="$(python3 - "$CRON_JSON_FILE" "$name" <<'PY'
import json, sys
path, name = sys.argv[1], sys.argv[2]
try:
    data = json.load(open(path, 'r', encoding='utf-8'))
except Exception:
    print(json.dumps({"primary_id": "", "duplicate_ids": []}))
    raise SystemExit(0)
matches = [job.get('id', '') for job in data.get('jobs', []) if job.get('name') == name and job.get('id')]
primary_id = matches[0] if matches else ""
duplicate_ids = matches[1:] if len(matches) > 1 else []
print(json.dumps({"primary_id": primary_id, "duplicate_ids": duplicate_ids}))
PY
)"
  RECONCILE_FILE="/tmp/openclaw-cron-reconcile.json"
  printf '%s' "$reconcile_json" > "$RECONCILE_FILE"
  primary_id="$(python3 - "$RECONCILE_FILE" <<'PY'
import json, sys
data = json.load(open(sys.argv[1], 'r', encoding='utf-8'))
print(data.get('primary_id', ''))
PY
)"
  while IFS= read -r duplicate_id; do
    [ -n "$duplicate_id" ] || continue
    openclaw cron disable "$duplicate_id" >/dev/null || true
  done < <(python3 - "$RECONCILE_FILE" <<'PY'
import json, sys
data = json.load(open(sys.argv[1], 'r', encoding='utf-8'))
for item in data.get('duplicate_ids', []):
    print(item)
PY
)
  if [ -n "$primary_id" ]; then
    if [ "$add_mode" = "every" ]; then
      openclaw cron edit "$primary_id" --enable --every "$schedule" --system-event "$event_text" >/dev/null
    else
      openclaw cron edit "$primary_id" --enable --cron "$schedule" --tz "$tz" --system-event "$event_text" >/dev/null
    fi
  else
    if [ "$add_mode" = "every" ]; then
      openclaw cron add --name "$name" --every "$schedule" --system-event "$event_text" >/dev/null
    else
      openclaw cron add --name "$name" --cron "$schedule" --tz "$tz" --system-event "$event_text" >/dev/null
    fi
  fi
}
HOURLY_MSG="Read HEARTBEAT.md and WORKING_BUFFER.md in the workspace if present. Run a lightweight reflect tick, review recent failures, and choose the next safe automation improvement. If nothing needs attention, record a no-op."
NIGHTLY_MSG="Run a nightly maintenance pass: doctor, update status, security audit, skills check, memory status, and clawhub/find-skills discovery when a missing capability blocks value. Record only concise, non-secret conclusions."
ensure_job "isa-hourly-reflect" every "1h" "" "$HOURLY_MSG"
ensure_job "isa-nightly-maintenance" cron "0 3 * * *" "Europe/Amsterdam" "$NIGHTLY_MSG"
printf 'HEARTBEAT='; openclaw config get agents.defaults.heartbeat || true
printf '\nCRON_STATUS\n'; openclaw cron status --json || true
printf '\nCRON_LIST\n'; openclaw cron list --json || true
REMOTE
  {
    cat "$HEARTBEAT_FILE"
    printf '\n__WORKING_BUFFER_SPLIT__\n'
    cat "$WORKING_BUFFER_FILE"
  } > "$TMP_DIR/runtime-sync-input.txt"
  PY_SPLIT="$TMP_DIR/runtime-sync-python.py"
  cat > "$PY_SPLIT" <<'PY'
from pathlib import Path
src = Path('/tmp/runtime-sync-input.txt').read_text(encoding='utf-8')
heartbeat, work = src.split('\n__WORKING_BUFFER_SPLIT__\n', 1)
Path('/tmp/heartbeat-sync.txt').write_text(heartbeat, encoding='utf-8')
Path('/tmp/work-buffer-sync.txt').write_text(work, encoding='utf-8')
PY
  python3 - <<PY
from pathlib import Path
remote = Path('$REMOTE_SCRIPT')
heartbeat = Path('$HEARTBEAT_FILE').read_text(encoding='utf-8')
working = Path('$WORKING_BUFFER_FILE').read_text(encoding='utf-8')
text = remote.read_text(encoding='utf-8')
text = text.replace('cat > /root/.openclaw/workspace/HEARTBEAT.md\ncat > /root/.openclaw/workspace/WORKING_BUFFER.md\n', f"cat > /root/.openclaw/workspace/HEARTBEAT.md <<'EOF_HEARTBEAT'\n{heartbeat}\nEOF_HEARTBEAT\ncat > /root/.openclaw/workspace/WORKING_BUFFER.md <<'EOF_WORK'\n{working}\nEOF_WORK\n")
remote.write_text(text, encoding='utf-8')
PY
  set +e
  VM_SETUP_OUT="$(bash "$VM_SSH_WRAPPER" exec --command 'bash -s' --stdin-file "$REMOTE_SCRIPT" 2>&1)"
  VM_SETUP_RC=$?
  set -e
  printf '%s\n' "$VM_SETUP_OUT" > "$TMP_DIR/vm-autonomy-setup.log"
  if [[ $VM_SETUP_RC -ne 0 ]]; then
    failures+=("vm_autonomy_setup_failed")
  else
    notes+=("vm_autonomy_setup_ok")
  fi
fi

OPENCLAW_HELP_EXCERPT="$(sed -n '1,28p' "$TMP_DIR/openclaw_help.txt" 2>/dev/null | tr '\n' ' ' | sed 's/  */ /g')"
HEARTBEAT_DOC_EXCERPT="$(sed -n '1,6p' "$TMP_DIR/heartbeat_docs.txt" 2>/dev/null | tr '\n' ' ' | sed 's/  */ /g')"
WORKSPACE_DOC_EXCERPT="$(sed -n '1,6p' "$TMP_DIR/workspace_docs.txt" 2>/dev/null | tr '\n' ' ' | sed 's/  */ /g')"
TOOLS_PROFILE_DOC_EXCERPT="$(sed -n '1,6p' "$TMP_DIR/tools_profile_docs.txt" 2>/dev/null | tr '\n' ' ' | sed 's/  */ /g')"
SKILL_RESULTS_MARKDOWN="$(python3 - "$TMP_DIR/skill-results.json" <<'PY'
import json, pathlib, sys
p = pathlib.Path(sys.argv[1])
rows = json.loads(p.read_text()) if p.exists() else []
for row in rows:
    bits = [row.get('name','unknown'), row.get('status','unknown')]
    if row.get('mode'): bits.append(f"mode={row['mode']}")
    if row.get('skill'): bits.append(f"skill={row['skill']}")
    print('- ' + ' | '.join(bits))
PY
)"
FAILURE_MARKDOWN="$(printf '%s\n' "${failures[@]:-}" | sed '/^$/d; s/^/- /')"
NOTE_MARKDOWN="$(printf '%s\n' "${notes[@]:-}" | sed '/^$/d; s/^/- /')"

append_wal "$(cat <<EOF
- Environment:
  - repo_root: \`$REPO_ROOT\`
  - runtime_mode: \`$RUNTIME_MODE\`
  - openclaw_present: \`$OPENCLAW_PRESENT\`
- Actions:
  - created/verified runtime substrate files
  - wrote CLI command map to \`$COMMAND_MAP_FILE\`
  - ensured VM core skills via existing repo helper when available
  - best-effort normalized VM runtime config with \`openclaw doctor --fix\` before proactive setup
  - best-effort ensured autonomy skills through project-level \`npx skills add\`
  - best-effort synced HEARTBEAT/WORKING_BUFFER and cron jobs to VM runtime
- Outputs:
  - openclaw help excerpt: $OPENCLAW_HELP_EXCERPT
  - heartbeat docs excerpt: $HEARTBEAT_DOC_EXCERPT
  - workspace docs excerpt: $WORKSPACE_DOC_EXCERPT
  - tools.profile docs excerpt: $TOOLS_PROFILE_DOC_EXCERPT
  - skill ensure results:
$SKILL_RESULTS_MARKDOWN
- Failures:
${FAILURE_MARKDOWN:-- none}
- Fixes:
${NOTE_MARKDOWN:-- none}
- New heuristics:
  - run \`openclaw doctor --fix\` on the VM before heartbeat/cron/skills orchestration so legacy config drift does not block proactive setup
  - use \`openclaw cron add/edit\` for proactive wake jobs; no verified cron config block was found
  - reconcile cron jobs by stable name and disable duplicate IDs before editing, so reruns stay idempotent
  - use \`npx skills add\` for project-local autonomy skills because host OpenClaw CLI exposes inspection-only skill subcommands
  - sync runtime heartbeat docs into \`/root/.openclaw/workspace\` in VM-only mode so proactive runs have local context
- Next action:
  - run \`scripts/openclaw-isa-autonomy.sh\` and record the first validation loop outcome
EOF
)"

printf 'DONE=openclaw_isa_autonomy_setup_complete\n'
