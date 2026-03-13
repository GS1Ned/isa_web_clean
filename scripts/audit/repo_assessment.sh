#!/usr/bin/env bash
set -euo pipefail
set +H 2>/dev/null || true

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || true)"
[ -n "${ROOT}" ] || { echo "ERROR: not inside a git repository (git rev-parse failed)" >&2; exit 2; }
cd "${ROOT}"

DATE_UTC="$(date -u +%Y-%m-%d)"
TS_UTC="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_DIR="${ROOT}/docs/reports/repo_assessment_${TS_UTC}"
mkdir -p "${OUT_DIR}"

export ROOT DATE_UTC TS_UTC OUT_DIR

python3 - <<'PY'
import os, re, json, hashlib, datetime, subprocess
from pathlib import Path

root = Path(os.environ["ROOT"])
out_dir = Path(os.environ["OUT_DIR"])
date_utc = os.environ["DATE_UTC"]
ts_utc = os.environ["TS_UTC"]

IGNORE_DIRS = {".git",".next","node_modules","dist","build",".turbo",".cache",".vercel",".idea",".vscode",".pnpm-store",".yarn","coverage",".output",".pytest_cache",".mypy_cache",".DS_Store"}
BINARY_EXT = {".png",".jpg",".jpeg",".gif",".webp",".mp4",".mov",".zip",".tgz",".tar.gz",".7z",".pdf",".dmg",".pkg",".ico",".icns",".woff",".woff2",".ttf",".eot",".otf"}

def run(cmd):
    p = subprocess.run(cmd, cwd=root, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    return p.returncode, (p.stdout or "").strip(), (p.stderr or "").strip()

def sha256_bytes(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()

def safe_read_bytes(p: Path, max_bytes=2_000_000):
    try:
        b = p.read_bytes()
        if len(b) > max_bytes:
            return b[:max_bytes], True, len(b)
        return b, False, len(b)
    except Exception:
        return b"", False, 0

def file_meta(p: Path):
    try:
        b, truncated, total = safe_read_bytes(p, max_bytes=2_000_000)
        st = p.stat()
        return {
            "path": str(p.relative_to(root)),
            "bytes": total,
            "sha256": sha256_bytes(p.read_bytes()) if total <= 5_000_000 else sha256_bytes(b),
            "mtime_utc": datetime.datetime.fromtimestamp(st.st_mtime, tz=datetime.timezone.utc).isoformat().replace("+00:00","Z"),
            "truncated_for_text_ops": bool(truncated),
        }
    except Exception as e:
        return {"path": str(p.relative_to(root)), "error": repr(e)}

def is_ignored(rel: Path):
    return any(part in IGNORE_DIRS for part in rel.parts)

def is_probably_binary(rel: Path):
    s = str(rel).lower()
    if s.endswith(".tar.gz"):
        return True
    return rel.suffix.lower() in BINARY_EXT

def iter_files():
    for p in root.rglob("*"):
        if not p.is_file():
            continue
        rel = p.relative_to(root)
        if is_ignored(rel):
            continue
        yield p, rel

def read_text(p: Path, max_bytes=400_000):
    b, truncated, _ = safe_read_bytes(p, max_bytes=max_bytes)
    try:
        return b.decode("utf-8", errors="replace"), truncated
    except Exception:
        return "", False

def write_json(name, obj):
    (out_dir / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

def write_txt(name, text):
    (out_dir / name).write_text(text, encoding="utf-8")

meta = {
    "last_verified_date": date_utc,
    "generated_at_utc": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00","Z"),
    "repo_root": str(root),
    "run_id_utc": ts_utc,
}

_, git_status, _ = run(["git","status","--porcelain=v1"])
_, git_branch, _ = run(["git","rev-parse","--abbrev-ref","HEAD"])
_, git_head, _ = run(["git","rev-parse","HEAD"])
_, recent_commits, _ = run(["git","log","-n","30","--date=iso-strict","--pretty=format:%h\t%ad\t%an\t%s"])
_, remotes, _ = run(["git","remote","-v"])
_, tags, _ = run(["git","tag","--list"])
_, top_level, _ = run(["git","rev-parse","--show-toplevel"])

repo_state = {
    "branch": git_branch,
    "head": git_head,
    "status_porcelain": git_status.splitlines()[:500],
    "remotes": remotes.splitlines(),
    "tags_count": len(tags.splitlines()) if tags else 0,
    "recent_commits_30": recent_commits.splitlines(),
    "top_level": top_level,
}

tree_full = []
tree_pruned = []
ext_counts = {}
size_total = 0
largest = []

for p, rel in iter_files():
    rel_s = str(rel)
    tree_full.append(rel_s)
    ext = rel.suffix.lower()
    ext_counts[ext] = ext_counts.get(ext, 0) + 1
    try:
        sz = p.stat().st_size
    except Exception:
        sz = 0
    size_total += sz
    largest.append((sz, rel_s))
    if not is_probably_binary(rel):
        tree_pruned.append(rel_s)

tree_full.sort()
tree_pruned.sort()
largest.sort(reverse=True)
largest_50 = [{"path": r, "bytes": b} for b, r in [(x[0], x[1]) for x in largest[:50]]]

write_txt(f"REPO_TREE_FULL_{date_utc}.txt", "\n".join(tree_full) + "\n")
write_txt(f"REPO_TREE_PRUNED_{date_utc}.txt", "\n".join(tree_pruned) + "\n")

entry_candidates = [
    "README.md",
    "START_HERE.md",
    "todo.md",
    "TODO.md",
    "docs/README.md",
    "docs/START_HERE.md",
    "docs/spec/ISA_MASTER_SPEC.md",
    "docs/reference/ISA_REFERENCE_DOSSIER.md",
    "docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md",
]
entrypoints = []
for rel in entry_candidates:
    p = root / rel
    if p.exists() and p.is_file():
        entrypoints.append(file_meta(p))

root_md = sorted([str(p.relative_to(root)) for p in root.glob("*.md") if p.is_file()])

planning_rx = re.compile(r"\b(todo|backlog|roadmap|next[-_ ]?steps?|next[-_ ]?actions?)\b", re.I)
planning_hits = []
for rel_s in tree_pruned:
    if not rel_s.lower().endswith(".md"):
        continue
    p = root / rel_s
    t, _ = read_text(p, max_bytes=200_000)
    if planning_rx.search(t):
        planning_hits.append(rel_s)
planning_hits = sorted(set(planning_hits))

governance_paths = []
for rel_s in tree_pruned:
    if rel_s.startswith("docs/governance/") or rel_s.startswith(".github/") or rel_s.startswith("config/") or rel_s.startswith("configs/"):
        if rel_s.lower().endswith((".md",".json",".yml",".yaml",".toml",".txt")):
            governance_paths.append(rel_s)
governance_paths = sorted(set(governance_paths))

policy_candidates = [p for p in governance_paths if p.lower().endswith(".json") and ("policy" in p.lower() or "gate" in p.lower())]

workflows = []
wf_dir = root / ".github/workflows"
if wf_dir.exists() and wf_dir.is_dir():
    for p in sorted(list(wf_dir.glob("*.yml")) + list(wf_dir.glob("*.yaml"))):
        rel_s = str(p.relative_to(root))
        txt, _ = read_text(p, max_bytes=400_000)
        name = None
        m = re.search(r"(?m)^\s*name:\s*(.+?)\s*$", txt)
        if m:
            name = m.group(1).strip().strip("'\"")
        triggers = []
        for k in ["pull_request","push","workflow_dispatch","schedule","workflow_call","release"]:
            if re.search(rf"(?m)^\s*{k}\s*:", txt):
                triggers.append(k)
        workflows.append({"path": rel_s, "name": name, "triggers": sorted(set(triggers)), "meta": file_meta(p)})
workflows = sorted(workflows, key=lambda x: x["path"])

package_jsons = sorted([p for p in tree_pruned if p.endswith("package.json")])
lockfiles = [p for p in ["pnpm-lock.yaml","package-lock.json","yarn.lock","bun.lockb"] if (root/p).exists()]
tsconfigs = sorted([str(p.relative_to(root)) for p in root.glob("tsconfig*.json") if p.is_file()])
pyproject = "pyproject.toml" if (root/"pyproject.toml").exists() else None
requirements = sorted([str(p.relative_to(root)) for p in root.glob("requirements*.txt") if p.is_file()])

env_templates = []
for cand in [".env.example",".env.template",".env.sample","env.example","env.template","env.sample"]:
    p = root / cand
    if p.exists() and p.is_file():
        env_templates.append(file_meta(p))

code_stats = {"ts_files":0,"tsx_files":0,"js_files":0,"py_files":0,"sh_files":0,"md_files":0,"json_files":0,"yaml_files":0}
for rel_s in tree_pruned:
    ext = Path(rel_s).suffix.lower()
    if ext == ".ts": code_stats["ts_files"] += 1
    elif ext == ".tsx": code_stats["tsx_files"] += 1
    elif ext in [".js",".mjs",".cjs"]: code_stats["js_files"] += 1
    elif ext == ".py": code_stats["py_files"] += 1
    elif ext in [".sh",".bash",".zsh"]: code_stats["sh_files"] += 1
    elif ext == ".md": code_stats["md_files"] += 1
    elif ext == ".json": code_stats["json_files"] += 1
    elif ext in [".yml",".yaml"]: code_stats["yaml_files"] += 1

risk_notes = []
if (root/"isa.inventory.json").exists():
    risk_notes.append("isa.inventory.json exists at repo root; ensure CI rules match desired behavior.")
if not (root/"docs").exists():
    risk_notes.append("docs/ not found; documentation anchors may be missing.")
if not (root/".github/workflows").exists():
    risk_notes.append(".github/workflows/ not found; CI visibility reduced.")
if (root/"docs/evidence").exists():
    risk_notes.append("docs/evidence/ exists; ensure generated outputs policy is consistent (keep vs ignore).")

assessment = {
    "meta": meta,
    "repo_state": repo_state,
    "inventory": {
        "tree_files_full_count": len(tree_full),
        "tree_files_pruned_count": len(tree_pruned),
        "total_bytes_all_files": size_total,
        "extensions_count": dict(sorted(ext_counts.items(), key=lambda x: (-x[1], x[0]))),
        "largest_files_top50": largest_50,
        "root_md_count": len(root_md),
        "root_md_files": root_md,
        "entrypoints_found": entrypoints,
        "planning_keyword_hits_md": planning_hits,
    },
    "governance": {
        "governance_files_count": len(governance_paths),
        "governance_files": [{"path": p, **file_meta(root/p)} for p in governance_paths[:500]],
        "policy_candidates": policy_candidates,
    },
    "ci_cd": {
        "workflows_count": len(workflows),
        "workflows": workflows,
    },
    "build_tooling": {
        "package_jsons": package_jsons,
        "lockfiles": lockfiles,
        "tsconfigs": tsconfigs,
        "pyproject": pyproject,
        "requirements": requirements,
        "env_templates": env_templates,
    },
    "code_stats": code_stats,
    "risks_notes": risk_notes,
}

write_json("REPO_ASSESSMENT_SUMMARY.json", assessment)

md = []
md.append("# ISA Repository Assessment (automated)\n\n")
md.append(f"- last_verified_date: `{meta['last_verified_date']}`\n")
md.append(f"- generated_at_utc: `{meta['generated_at_utc']}`\n")
md.append(f"- run_id_utc: `{meta['run_id_utc']}`\n")
md.append(f"- repo_root: `{meta['repo_root']}`\n\n")
md.append("## Repo state\n\n")
md.append(f"- branch: `{repo_state['branch']}`\n")
md.append(f"- head: `{repo_state['head']}`\n")
md.append(f"- remotes: `{len(repo_state['remotes'])}`\n")
md.append(f"- tags_count: `{repo_state['tags_count']}`\n")
md.append(f"- dirty_paths_count: `{len(repo_state['status_porcelain'])}`\n\n")
md.append("## Inventory\n\n")
inv = assessment["inventory"]
md.append(f"- pruned_tree_files: `{inv['tree_files_pruned_count']}`\n")
md.append(f"- full_tree_files: `{inv['tree_files_full_count']}`\n")
md.append(f"- total_bytes_all_files: `{inv['total_bytes_all_files']}`\n")
md.append(f"- root_md_count: `{inv['root_md_count']}`\n")
md.append(f"- planning_keyword_hits_md_count: `{len(inv['planning_keyword_hits_md'])}`\n\n")
md.append("### Entrypoints found\n\n")
for e in inv["entrypoints_found"]:
    md.append(f"- `{e['path']}` (sha256 `{e.get('sha256','')[:12]}…`, mtime `{e.get('mtime_utc','')}`)\n")
if not inv["entrypoints_found"]:
    md.append("- (none)\n")
md.append("\n### Planning keyword hits (md)\n\n")
for p in inv["planning_keyword_hits_md"][:200]:
    md.append(f"- `{p}`\n")
if len(inv["planning_keyword_hits_md"]) > 200:
    md.append(f"- … ({len(inv['planning_keyword_hits_md'])-200} more)\n")
md.append("\n## Governance\n\n")
gov = assessment["governance"]
md.append(f"- governance_files_count: `{gov['governance_files_count']}`\n")
md.append("### Policy candidates\n\n")
for p in gov["policy_candidates"]:
    md.append(f"- `{p}`\n")
if not gov["policy_candidates"]:
    md.append("- (none)\n")
md.append("\n## CI/CD\n\n")
ci = assessment["ci_cd"]
md.append(f"- workflows_count: `{ci['workflows_count']}`\n\n")
for w in ci["workflows"]:
    md.append(f"- `{w['path']}` — name: `{w.get('name')}` — triggers: `{', '.join(w.get('triggers',[]))}`\n")
md.append("\n## Build tooling\n\n")
bt = assessment["build_tooling"]
md.append(f"- package_jsons: `{len(bt['package_jsons'])}`\n")
for p in bt["package_jsons"][:50]:
    md.append(f"  - `{p}`\n")
if len(bt["package_jsons"]) > 50:
    md.append(f"  - … ({len(bt['package_jsons'])-50} more)\n")
md.append(f"- lockfiles: `{', '.join(bt['lockfiles']) if bt['lockfiles'] else '(none)'}`\n")
md.append(f"- tsconfigs: `{len(bt['tsconfigs'])}`\n")
md.append(f"- env_templates: `{len(bt['env_templates'])}`\n")
md.append("\n## Code stats (counts)\n\n")
for k,v in assessment["code_stats"].items():
    md.append(f"- {k}: `{v}`\n")
md.append("\n## Notes / potential risks\n\n")
for r in assessment["risks_notes"]:
    md.append(f"- {r}\n")
if not assessment["risks_notes"]:
    md.append("- (none)\n")

(out_dir / "REPO_ASSESSMENT_SUMMARY.md").write_text("".join(md), encoding="utf-8")
PY

printf "%s\n" "${OUT_DIR}/REPO_ASSESSMENT_SUMMARY.md" "${OUT_DIR}/REPO_ASSESSMENT_SUMMARY.json" "${OUT_DIR}/REPO_TREE_FULL_${DATE_UTC}.txt" "${OUT_DIR}/REPO_TREE_PRUNED_${DATE_UTC}.txt"
