#!/usr/bin/env bash
set -euo pipefail

echo "PREFLIGHT=openclaw_sync_skills_allowlist"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

TOP_FILE="${1:-}"
ALLOWLIST_PATH="${OPENCLAW_SKILLS_ALLOWLIST_PATH:-config/openclaw/skills-allowlist.json}"
REVIEWER="${OPENCLAW_SKILLS_ALLOWLIST_REVIEWER:-isa-kernel-sync}"
APPROVAL_DATE="${OPENCLAW_SKILLS_ALLOWLIST_DATE:-$(date -u +%Y-%m-%d)}"
QUARANTINE_DIR="${OPENCLAW_SKILLS_ALLOWLIST_QUARANTINE_DIR:-~/.openclaw/skills-quarantine}"

LATEST_KERNEL_TOP="$(ls -1 .openclaw/kernel/runs/*/artifacts/TOP_40_ISA_OPTIMAL_SKILLS_POST_REPAIR.json 2>/dev/null | tail -n 1 || true)"
if [ -z "$TOP_FILE" ]; then
  if [ -n "$LATEST_KERNEL_TOP" ]; then
    TOP_FILE="$LATEST_KERNEL_TOP"
  elif [ -f TOP_40_ISA_OPTIMAL_SKILLS.json ]; then
    TOP_FILE="TOP_40_ISA_OPTIMAL_SKILLS.json"
  fi
fi

if [ -z "$TOP_FILE" ] || [ ! -f "$TOP_FILE" ]; then
  echo "STOP=top_skills_file_missing"
  exit 1
fi

python3 - "$TOP_FILE" "$ALLOWLIST_PATH" "$REVIEWER" "$APPROVAL_DATE" "$QUARANTINE_DIR" "$LATEST_KERNEL_TOP" <<'PY'
import hashlib
import json
import sys
from pathlib import Path


def load_rows(path: Path):
    obj = json.loads(path.read_text())
    if isinstance(obj, list):
        return obj
    if isinstance(obj, dict) and isinstance(obj.get('skills'), list):
        return obj['skills']
    raise SystemExit('STOP=top_skills_shape_invalid')


def checksum_for_path(path: Path) -> str:
    manifest = []
    if path.is_dir():
        for item in sorted(p for p in path.rglob('*') if p.is_file()):
            rel = item.relative_to(path)
            if '.git' in rel.parts or 'node_modules' in rel.parts:
                continue
            rel_str = rel.as_posix()
            h = hashlib.sha256(item.read_bytes()).hexdigest()
            manifest.append(f'{h}  {rel_str}')
        blob = '\n'.join(manifest).encode('utf-8')
        return hashlib.sha256(blob).hexdigest()
    return hashlib.sha256(path.read_bytes()).hexdigest()


def path_rank(path: str) -> tuple[int, str]:
    candidates = [
        ('/skills/', 0),
        ('/.agents/skills/', 1),
        ('/lib/node_modules/openclaw/skills/', 2),
        ('openclaw_audit/source/openclaw-main/skills/', 3),
    ]
    norm = path.replace('\\', '/')
    for token, rank in candidates:
        if token in norm:
            return (rank, norm)
    return (99, norm)


def synth_source(path: Path) -> str:
    return f'local://{path.resolve().as_posix()}'


top_file = Path(sys.argv[1])
allowlist_path = Path(sys.argv[2])
reviewer = sys.argv[3]
approval_date = sys.argv[4]
quarantine_dir = sys.argv[5]
latest_kernel_top = Path(sys.argv[6]) if sys.argv[6] else None
rows = load_rows(top_file)
kernel_rows = load_rows(latest_kernel_top) if latest_kernel_top and latest_kernel_top.exists() else []
kernel_by_name = {}
for row in kernel_rows:
    name = row.get('skill_name') or row.get('name')
    if name:
        kernel_by_name.setdefault(name, []).append(row)

selected = {}
for row in rows:
    name = row.get('skill_name') or row.get('name')
    skill_id = row.get('skill_id')
    if not name:
        continue
    candidate_paths = []
    if isinstance(skill_id, str):
        candidate_paths.append(Path(skill_id).expanduser())
    for extra in kernel_by_name.get(name, []):
        extra_skill_id = extra.get('skill_id')
        if isinstance(extra_skill_id, str):
            candidate_paths.append(Path(extra_skill_id).expanduser())
    if not candidate_paths:
        candidate_paths = [None]
    key = name
    current = selected.get(key)
    for candidate_path in candidate_paths:
        candidate = {
            'name': name,
            'path': candidate_path,
            'rank': path_rank(str(candidate_path)) if candidate_path is not None else (100, name),
        }
        if current is None or candidate['rank'] < current['rank']:
            selected[key] = candidate
            current = candidate

entries = []
for name in sorted(selected):
    path = selected[name]['path']
    if path is None or not path.exists():
        checksum = hashlib.sha256(name.encode('utf-8')).hexdigest()
        source = f'local://unresolved/{name}'
        status = 'pending'
        scope = 'quarantine-review'
    else:
        checksum = checksum_for_path(path)
        source = synth_source(path)
        status = 'approved'
        scope = 'quarantine-local'
    entries.append({
        'approval_date': approval_date,
        'checksum_sha256': checksum,
        'name': name,
        'reviewer': reviewer,
        'scope': scope,
        'source': source,
        'status': status,
    })

payload = {
    'entries': entries,
    'quarantine_install_dir': quarantine_dir,
    'version': '1.1.0',
}
allowlist_path.write_text(json.dumps(payload, indent=2, sort_keys=False) + '\n', encoding='utf-8')
print(f'READY=skills_allowlist_synced count={len(entries)} source={top_file}')
print(f'DONE=skills_allowlist_written path={allowlist_path}')
PY
