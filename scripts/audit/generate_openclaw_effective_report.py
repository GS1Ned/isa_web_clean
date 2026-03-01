#!/usr/bin/env python3
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

REPO = Path.cwd()
OUT_ROOT = REPO / '.openclaw' / 'audit'
TS = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
OUT_DIR = OUT_ROOT / TS
OUT_DIR.mkdir(parents=True, exist_ok=True)
VM_SSH_WRAPPER = REPO / 'scripts' / 'vm' / 'isa_vm_ssh.sh'


def now_iso():
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')


def run(cmd: str) -> str:
    p = subprocess.run(cmd, shell=True, cwd=REPO, text=True, capture_output=True)
    if p.returncode != 0:
        return ''
    return p.stdout.strip()


def run_wrapper(cmd: str) -> str:
    p = subprocess.run([str(VM_SSH_WRAPPER), 'exec', '--quiet', '--command', cmd], cwd=REPO, text=True, capture_output=True)
    if p.returncode != 0:
        return ''
    return p.stdout.strip()


def ssh_json(path: str):
    out = run_wrapper(f"cat {path}")
    return json.loads(out) if out else {}

control = json.loads((REPO / '.openclaw/control-plane.json').read_text())
routing = json.loads((REPO / 'config/openclaw/model-routing.policy.json').read_text())
browser = json.loads((REPO / 'config/openclaw/browser.policy.json').read_text())
exec_policy = json.loads((REPO / 'config/openclaw/exec-lane.policy.json').read_text())
skills_allow = json.loads((REPO / 'config/openclaw/skills-allowlist.json').read_text())
policy_env = json.loads((REPO / 'config/governance/openclaw_policy_envelope.json').read_text())
last_route = json.loads((REPO / '.openclaw/launcher/last_model_route.json').read_text()) if (REPO / '.openclaw/launcher/last_model_route.json').exists() else {}
vm_openclaw = ssh_json('/root/.openclaw/openclaw.json')
vm_exec = ssh_json('/root/.openclaw/exec-approvals.json')
vm_auth = ssh_json('/root/.openclaw/agents/main/agent/auth-profiles.json')
vm_cron = ssh_json('/root/.openclaw/cron/jobs.json')
vm_devices = ssh_json('/root/.openclaw/devices/paired.json')
vm_env = run_wrapper("sed -E 's/=.*/=***REDACTED***/' /root/.openclaw/.env")
status_deep = run('bash scripts/openclaw-status.sh --deep --target vm')
models_status = run_wrapper('openclaw models status')
skills_list = run_wrapper('openclaw skills list')
hooks_list = run_wrapper('openclaw hooks list')
plugins_list = run_wrapper('openclaw plugins list')

vm_primary = (((vm_openclaw.get('agents') or {}).get('defaults') or {}).get('model') or {}).get('primary')
vm_fallbacks = (((vm_openclaw.get('agents') or {}).get('defaults') or {}).get('model') or {}).get('fallbacks', [])
vm_tools_deny = (vm_openclaw.get('tools') or {}).get('deny', [])
cp_model_router = control.get('model_router', {})
cp_skill_policy = control.get('skill_policy', {})
rows = []

def add(field, source, effective, classification, risk, recommended_change, evidence):
    rows.append({
        'field': field,
        'source': source,
        'effective': effective,
        'classification': classification,
        'risk': risk,
        'recommended_change': recommended_change,
        'evidence': evidence,
    })

add('host:~/.openclaw/env.sh.OPENROUTER_API_KEY','host env',False,'shadowed_duplicate_secret','medium','Remove or minimize host-side duplicate provider secret if host runtime is not authoritative.','Active provider auth is VM-side, not host-side.')
add('repo:.openclaw/control-plane.json.cost_optimization_stack.*','repo control-plane',True,'effective','low','Keep synchronized with isa_cost_optimizer middleware tests and runtime expectations.','isa_cost_optimizer/middleware_api.py reads cost_optimization_stack from .openclaw/control-plane.json.')
add('repo:.openclaw/control-plane.json.model_router.default_model','repo control-plane',False,'shadowed_metadata','medium','Do not treat this as the OpenClaw runtime default; VM agents.defaults.model.primary remains authoritative.','VM runtime default is read from /root/.openclaw/openclaw.json.')
cp_fb_class = 'shadowed_metadata_aligned' if cp_model_router.get('fallback_models', []) == vm_fallbacks else 'conflicting'
cp_fb_risk = 'low' if cp_fb_class.endswith('aligned') else 'medium'
cp_fb_change = 'Keep aligned with VM runtime fallbacks.' if cp_fb_class.endswith('aligned') else 'Mirror these into VM fallbacks or delete them to avoid false assumptions.'
add('repo:.openclaw/control-plane.json.model_router.fallback_models','repo control-plane',False,cp_fb_class,cp_fb_risk,cp_fb_change,f"control-plane fallback_models={cp_model_router.get('fallback_models', [])}, vm fallbacks={vm_fallbacks}")
add('repo:config/governance/openclaw_policy_envelope.json.automation.*','repo governance policy',True,'effective','medium','Keep aligned with server/security/automation-auth.ts and production env flags.','server/security/automation-auth.ts reads the policy envelope.')
add('repo:config/governance/openclaw_policy_envelope.json.runtime.primary_mode','repo governance policy',True,'effective','low','Keep VM-only unless host-gateway support is intentionally implemented and validated.','Current runtime contract is VM-first.')
add('repo:config/openclaw/browser.policy.json.mode','repo browser policy',True,'shadowed_by_stronger_runtime_deny','low','Keep as defense-in-depth, but document that VM tools.deny already blocks browser and web at the gateway.','VM tools.deny includes group:web and browser.')
add('repo:config/openclaw/exec-lane.policy.json.*','repo exec policy',True,'effective_script_scope_only','medium','Treat as wrapper-policy only; do not assume native OpenClaw runtime enforcement.','scripts/openclaw-safe-exec.sh reads this policy.')
route_default_class = 'effective_launcher_scope_aligned' if routing.get('defaults', {}).get('model') == vm_primary else 'conflicting'
route_default_risk = 'low' if route_default_class.endswith('aligned') else 'high'
route_default_change = 'Keep launcher default aligned with VM runtime default.' if route_default_class.endswith('aligned') else 'Align the routing default with the VM runtime default or explicitly rename it as UI recommendation only.'
add('repo:config/openclaw/model-routing.policy.json.defaults.model','repo routing policy',True,route_default_class,route_default_risk,route_default_change,f"routing defaults.model={routing.get('defaults', {}).get('model')}, vm primary={vm_primary}")
add('repo:config/openclaw/model-routing.policy.json.routes[*]','repo routing policy',True,'effective_launcher_scope_only','medium','Keep using for launcher-assisted routing, but do not present it as automatic runtime model switching.','scripts/openclaw-model-route.sh and launcher wrappers use this file.')
entries = skills_allow.get('entries', [])
allow_class = 'effective_but_empty' if not entries else 'effective'
allow_change = 'Populate only when quarantine-based skill admission is actually needed; otherwise keep empty and document limited scope.' if not entries else 'Keep entries reviewed and checksum-pinned.'
add('repo:config/openclaw/skills-allowlist.json.entries','repo skills allowlist',True,allow_class,'low',allow_change,'scripts/openclaw-skill-admit.sh and scripts/openclaw-skill-install.sh read this file.')
add('repo:.openclaw/launcher/last_model_route.json.selected_route_id','repo launcher state',True,'effective_state','low','Safe to keep; it drives reuse-last-route launcher behavior.','Launcher wrappers read .openclaw/launcher/last_model_route.json.')
add('vm:/root/.openclaw/openclaw.json.agents.defaults.model.primary','vm runtime',True,'effective','medium','This is the authoritative default model; align UI/router policy with it or change it deliberately here.','openclaw models status reports the VM default model.')
add('vm:/root/.openclaw/openclaw.json.agents.defaults.model.fallbacks','vm runtime',True,'effective_empty' if not vm_fallbacks else 'effective','medium','Add fallbacks if runtime resilience matters, or keep empty and remove conflicting fallback declarations elsewhere.','VM runtime fallbacks currently determine actual failover behavior.')
add('vm:/root/.openclaw/openclaw.json.tools.deny','vm runtime',True,'effective','low','Retain unless you intentionally reopen browser/web capabilities and revalidate governance.','Current policy posture depends on these denies.')
add('vm:/root/.openclaw/openclaw.json.gateway.bind','vm runtime',True,'effective','low','Keep loopback unless remote exposure is required; if exposed, configure trustedProxies.','Gateway is running loopback-only.')
add('vm:/root/.openclaw/openclaw.json.gateway.auth.token','vm runtime',True,'effective_sensitive','high','Keep VM-only; never duplicate in repo or host artifacts.','Gateway auth mode is token.')
add('vm:/root/.openclaw/openclaw.json.env.vars.OPENROUTER_API_KEY','vm runtime',True,'effective_sensitive','high','Keep in VM runtime only; avoid host duplication unless host-runtime use is required.','Provider auth resolves from env OPENROUTER_API_KEY.')
add('vm:/root/.openclaw/openclaw.json.auth.profiles','vm runtime',True,'effective_empty' if not (vm_openclaw.get('auth') or {}).get('profiles') else 'effective','low','Keep empty if env-based auth remains the standard.','auth.profiles is empty in current VM runtime.')
add('vm:/root/.openclaw/exec-approvals.json.socket.token','vm exec approvals',True,'effective_sensitive','high','Treat as secret runtime socket credential; do not export or mirror.','VM exec approvals socket config contains token material.')
add('vm:/root/.openclaw/devices/paired.json.tokens.*','vm device pairing state',True,'effective_sensitive','high','Rotate and prune stale operator device tokens if not actively needed; keep strictly VM-local.','Paired devices file contains operator device tokens.')
add('vm:/root/.openclaw/cron/jobs.json.jobs','vm cron state',True,'effective_empty' if not (vm_cron.get('jobs') or []) else 'effective','low','No change unless scheduled automation is intended; current state has no jobs configured.','cron/jobs.json contains jobs=[].')

support = {
    'repo_control_plane': control,
    'repo_policy_envelope': policy_env,
    'repo_model_routing_policy': routing,
    'repo_exec_lane_policy': exec_policy,
    'repo_browser_policy': browser,
    'repo_skills_allowlist': skills_allow,
    'repo_last_route': last_route,
    'vm_openclaw_summary': {
        'primary': vm_primary,
        'fallbacks': vm_fallbacks,
        'tools_deny': vm_tools_deny,
        'gateway': {
            'bind': ((vm_openclaw.get('gateway') or {}).get('bind')),
            'mode': ((vm_openclaw.get('gateway') or {}).get('mode')),
            'port': ((vm_openclaw.get('gateway') or {}).get('port')),
            'auth_mode': (((vm_openclaw.get('gateway') or {}).get('auth') or {}).get('mode')),
        },
        'workspace': (((vm_openclaw.get('agents') or {}).get('defaults') or {}).get('workspace')),
    },
    'vm_exec_approvals_summary': {'keys': sorted(vm_exec.keys()) if isinstance(vm_exec, dict) else []},
    'vm_auth_profiles_summary': {'keys': sorted(vm_auth.keys()) if isinstance(vm_auth, dict) else []},
    'vm_cron_jobs': vm_cron,
    'vm_devices_paired_summary': {'device_count': len(vm_devices.get('items', [])) if isinstance(vm_devices, dict) else None},
    'status_deep_excerpt': status_deep,
    'models_status_excerpt': models_status,
    'skills_list_excerpt': skills_list,
    'hooks_list_excerpt': hooks_list,
    'plugins_list_excerpt': plugins_list,
}

summary = {
    'generated_at': now_iso(),
    'repo_root': str(REPO),
    'runtime_ssot': 'vm:/root/.openclaw/openclaw.json',
    'high_risk_items': [r['field'] for r in rows if r['risk'] == 'high'],
    'conflicting_items': [r['field'] for r in rows if r['classification'] == 'conflicting'],
    'unused_items': [r['field'] for r in rows if r['classification'].startswith('unused')],
    'shadowed_items': [r['field'] for r in rows if 'shadowed' in r['classification']],
}

(OUT_DIR / 'OPENCLAW_UNUSED_CONFLICTING_SHADOWED_TABLE.json').write_text(json.dumps(rows, indent=2, sort_keys=True) + '\n')
(OUT_DIR / 'OPENCLAW_UNUSED_CONFLICTING_SHADOWED_SUPPORT.redacted.json').write_text(json.dumps(support, indent=2, sort_keys=True) + '\n')
(OUT_DIR / 'OPENCLAW_UNUSED_CONFLICTING_SHADOWED_SUMMARY.json').write_text(json.dumps(summary, indent=2, sort_keys=True) + '\n')

lines = [
    '# OpenClaw Unused / Conflicting / Shadowed Fields Report',
    '',
    f'- Generated at: `{summary["generated_at"]}`',
    f'- Repo root: `{summary["repo_root"]}`',
    f'- Runtime SSOT: `{summary["runtime_ssot"]}`',
    '',
    '## FACT',
    '',
    f'- Analysed rows: `{len(rows)}`',
    f'- Conflicting items: `{len(summary["conflicting_items"])}`',
    f'- Unused items: `{len(summary["unused_items"])}`',
    f'- Shadowed items: `{len(summary["shadowed_items"])}`',
    f'- High-risk items: `{len(summary["high_risk_items"])}`',
    '',
    '## Table',
    '',
    '| Field | Source | Effective? | Classification | Risk | Recommended Change |',
    '|---|---|---:|---|---|---|',
]
for r in rows:
    lines.append(f"| `{r['field']}` | `{r['source']}` | `{str(r['effective']).lower()}` | `{r['classification']}` | `{r['risk']}` | {r['recommended_change']} |")
(OUT_DIR / 'OPENCLAW_UNUSED_CONFLICTING_SHADOWED_REPORT.md').write_text('\n'.join(lines) + '\n')
print(f'DONE=unused_conflicting_shadowed_report dir={OUT_DIR}')
