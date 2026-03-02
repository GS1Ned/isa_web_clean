#!/usr/bin/env python3
import json
import os
import re
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

REPO_ROOT = Path.cwd()
AUDIT_ROOT = REPO_ROOT / '.openclaw' / 'audit'
TS = datetime.now(timezone.utc).strftime('%Y%m%dT%H%M%SZ')
OUT_DIR = AUDIT_ROOT / TS
OUT_DIR.mkdir(parents=True, exist_ok=True)
STABLE_OUT = REPO_ROOT / '.openclaw' / 'OPENCLAW_EXTERNAL_ANALYSIS_EXPORT.redacted.json'
OUT_FILE = OUT_DIR / 'OPENCLAW_EXTERNAL_ANALYSIS_EXPORT.redacted.json'
VM_SSH_WRAPPER = REPO_ROOT / 'scripts' / 'vm' / 'isa_vm_ssh.sh'

TEXT_REDACTIONS = [
    (re.compile(r'(OPENROUTER_API_KEY=)([^\n]+)'), r'\1***REDACTED***'),
    (re.compile(r'(GITHUB_TOKEN=)([^\n]+)'), r'\1***REDACTED***'),
    (re.compile(r'(OPENAI_API_KEY=)([^\n]+)'), r'\1***REDACTED***'),
    (re.compile(r'(GOOGLE_API_KEY=)([^\n]+)'), r'\1***REDACTED***'),
    (re.compile(r'(GEMINI_API_KEY=)([^\n]+)'), r'\1***REDACTED***'),
    (re.compile(r'(token\s*[:=]\s*["\']?)([^"\'\n]+)'), r'\1***REDACTED***'),
    (re.compile(r'(secret\s*[:=]\s*["\']?)([^"\'\n]+)', re.IGNORECASE), r'\1***REDACTED***'),
    (re.compile(r'(sk-or-v1-)[A-Za-z0-9]+'), r'\1***REDACTED***'),
]
SENSITIVE_KEYS = {'token','api_key','apikey','secret','password','private_key','public_key','access_token','refresh_token','auth','authorization'}


def now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace('+00:00', 'Z')


def run(cmd: str) -> dict[str, Any]:
    proc = subprocess.run(cmd, shell=True, cwd=REPO_ROOT, text=True, capture_output=True)
    return {
        'command': cmd,
        'exit_code': proc.returncode,
        'stdout': redact_text(proc.stdout),
        'stderr': redact_text(proc.stderr),
    }


def ssh(cmd: str) -> dict[str, Any]:
    proc = subprocess.run(
        [str(VM_SSH_WRAPPER), 'exec', '--quiet', '--command', cmd],
        cwd=REPO_ROOT,
        text=True,
        capture_output=True,
    )
    return {
        'command': f"{VM_SSH_WRAPPER} exec --quiet --command <redacted-command>",
        'exit_code': proc.returncode,
        'stdout': redact_text(proc.stdout),
        'stderr': redact_text(proc.stderr),
    }


def self_test_vm_ssh() -> dict[str, Any]:
    python_probe = ssh("python3 -c 'print(123)'")
    heredoc_probe = ssh("python3 - <<'PY'\nprint(456)\nPY")
    return {
        'python_probe': {
            'exit_code': python_probe['exit_code'],
            'stdout': python_probe['stdout'].strip(),
            'stderr': python_probe['stderr'].strip(),
        },
        'heredoc_probe': {
            'exit_code': heredoc_probe['exit_code'],
            'stdout': heredoc_probe['stdout'].strip(),
            'stderr': heredoc_probe['stderr'].strip(),
        },
    }


def redact_text(text: str) -> str:
    out = text
    for pattern, repl in TEXT_REDACTIONS:
        out = pattern.sub(repl, out)
    return out


def redact_obj(obj: Any) -> Any:
    if isinstance(obj, dict):
        redacted = {}
        for key in sorted(obj.keys()):
            lower = key.lower()
            value = obj[key]
            if lower in SENSITIVE_KEYS or lower.endswith('_token') or lower.endswith('_key') or lower.endswith('_secret'):
                redacted[key] = '***REDACTED***'
            else:
                redacted[key] = redact_obj(value)
        return redacted
    if isinstance(obj, list):
        return [redact_obj(v) for v in obj]
    if isinstance(obj, str):
        return redact_text(obj)
    return obj


def read_path(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {'path': str(path), 'exists': False}
    text = path.read_text(encoding='utf-8', errors='ignore')
    payload: dict[str, Any] = {'path': str(path), 'exists': True}
    if path.suffix == '.json':
        try:
            payload['format'] = 'json'
            payload['content'] = redact_obj(json.loads(text))
            return payload
        except Exception:
            pass
    payload['format'] = 'text'
    payload['content'] = redact_text(text)
    return payload


def vm_json(path: str) -> dict[str, Any]:
    res = ssh(f"python3 - <<'PY'\nimport json\nfrom pathlib import Path\np=Path({path!r})\nprint(p.read_text())\nPY")
    out = {'path': path, 'exit_code': res['exit_code']}
    if res['exit_code'] == 0:
        try:
            out['format'] = 'json'
            out['content'] = redact_obj(json.loads(res['stdout']))
        except Exception:
            out['format'] = 'text'
            out['content'] = res['stdout']
    else:
        out['error'] = res['stderr'] or res['stdout']
    return out


def vm_text(path: str) -> dict[str, Any]:
    res = ssh(f"cat {path}")
    out = {'path': path, 'exit_code': res['exit_code'], 'format': 'text'}
    if res['exit_code'] == 0:
        out['content'] = res['stdout']
    else:
        out['error'] = res['stderr'] or res['stdout']
    return out


def latest_audit_file(name: str) -> str | None:
    if not AUDIT_ROOT.exists():
        return None
    dirs = sorted([p for p in AUDIT_ROOT.iterdir() if p.is_dir()])
    for d in reversed(dirs):
        target = d / name
        if target.exists():
            return str(target)
    return None


repo_files = [
    'AGENTS.md',
    '.openclaw/control-plane.json',
    '.openclaw/launcher/last_model_route.json',
    'config/governance/openclaw_policy_envelope.json',
    'config/openclaw/browser.policy.json',
    'config/openclaw/exec-lane.policy.json',
    'config/openclaw/model-routing.policy.json',
    'config/openclaw/skills-allowlist.json',
    'docs/agent/OPENCLAW_UI_MODEL_QUICK_REFERENCE.md',
    'docs/governance/OPENCLAW_MODEL_ROUTING_POLICY.md',
    'scripts/openclaw-model-route.sh',
    'scripts/openclaw-isa-dev-start.sh',
    '.github/workflows/tiered-tests.yml',
    'isa_cost_optimizer/requirements.txt',
    'isa_cost_optimizer/pyproject.toml',
    'isa_cost_optimizer/middleware_api.py',
    'isa_router/policy.json',
    'isa_router/weights.json',
    'isa_router/requirements.txt',
    'isa_router/start_router.sh',
]

host_files = [
    Path.home() / '.openclaw' / 'env.sh',
    Path.home() / '.local' / 'bin' / 'openclaw-ui-dev-launcher.sh',
    Path.home() / '.local' / 'bin' / 'openclaw-ui-dev-launcher-fast.sh',
]

status_cmds = {
    'git_branch': 'git branch --show-current',
    'git_status_short': 'git status --short',
    'openclaw_status_deep_vm': 'bash scripts/openclaw-status.sh --deep --target vm',
}

export = {
    'generated_at': now_iso(),
    'repo_root': str(REPO_ROOT),
    'purpose': 'Redacted external analysis export for OpenClaw configuration, runtime setup, governance, routing, launcher behavior, skills, plugins, tools, permissions, and integration state.',
    'runtime_ssot': 'vm:/root/.openclaw/openclaw.json',
    'host_layer': {
        'files': {p.name if isinstance(p, Path) else Path(p).name: read_path(p if isinstance(p, Path) else REPO_ROOT / p) for p in host_files}
    },
    'repo_layer': {
        'files': {path: read_path(REPO_ROOT / path) for path in repo_files},
    },
    'vm_layer': {
        'openclaw_json': vm_json('/root/.openclaw/openclaw.json'),
        'vm_env': vm_text('/root/.openclaw/.env'),
        'exec_approvals': vm_json('/root/.openclaw/exec-approvals.json'),
        'auth_profiles': vm_json('/root/.openclaw/agents/main/agent/auth-profiles.json'),
        'cron_jobs': vm_json('/root/.openclaw/cron/jobs.json'),
        'devices_paired': vm_json('/root/.openclaw/devices/paired.json'),
        'identity_device': vm_json('/root/.openclaw/identity/device.json'),
    },
    'runtime_status': {name: run(cmd) for name, cmd in status_cmds.items()},
    'vm_wrapper_self_test': self_test_vm_ssh(),
    'skills': {
        'agents_md_declared_skills': redact_text((REPO_ROOT / 'AGENTS.md').read_text(encoding='utf-8', errors='ignore')),
    },
    'audit_artifacts': {
        'configuration_snapshot': latest_audit_file('OPENCLAW_CONFIGURATION_SNAPSHOT.redacted.json'),
        'configuration_field_inventory': latest_audit_file('OPENCLAW_CONFIGURATION_FIELD_INVENTORY.redacted.json'),
        'unused_conflicting_shadowed_report': latest_audit_file('OPENCLAW_UNUSED_CONFLICTING_SHADOWED_REPORT.md'),
        'unused_conflicting_shadowed_table': latest_audit_file('OPENCLAW_UNUSED_CONFLICTING_SHADOWED_TABLE.json'),
        'unused_conflicting_shadowed_summary': latest_audit_file('OPENCLAW_UNUSED_CONFLICTING_SHADOWED_SUMMARY.json'),
    },
}
export['runtime_status']['openclaw_models_status_vm'] = ssh('openclaw models status')
export['runtime_status']['openclaw_skills_list_vm'] = ssh('openclaw skills list')
export['runtime_status']['openclaw_hooks_list_vm'] = ssh('openclaw hooks list')
export['runtime_status']['openclaw_plugins_list_vm'] = ssh('openclaw plugins list')

OUT_FILE.write_text(json.dumps(export, indent=2, sort_keys=True, ensure_ascii=True) + '\n', encoding='utf-8')
STABLE_OUT.write_text(OUT_FILE.read_text(encoding='utf-8'), encoding='utf-8')
print(f'DONE=openclaw_external_analysis_export path={OUT_FILE}')
print(f'READY=stable_copy {STABLE_OUT}')
