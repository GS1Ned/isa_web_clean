import datetime
import pathlib
import subprocess

def sh(*args: str) -> str:
    return subprocess.check_output(list(args), text=True).strip()

root = sh("git", "rev-parse", "--show-toplevel")
pathlib.Path(root).resolve()
date = datetime.datetime.now(datetime.timezone.utc).date().isoformat()
out = f"docs/reports/MANUS_READINESS_PRECHECK_{date}.md"

req = [
    "AGENT_START_HERE.md",
    "REPO_TREE.md",
    "todo.md",
    "docs/planning/TODO.md",
    "docs/spec/DEPRECATION_MAP.md",
]
missing = [p for p in req if not pathlib.Path(p).exists()]

find_cmd = r"""find . -maxdepth 4 -type f \( -iname '*todo*.md' -o -iname '*backlog*.md' -o -iname '*roadmap*.md' \) ! -path './todo.md' ! -path './docs/planning/*' ! -path './isa-archive/*' ! -path './.git/*' 2>/dev/null || true"""
shadow = sorted([s.lstrip("./") for s in sh("bash", "-lc", find_cmd).splitlines() if s.strip()])

forbidden_pats = [
    "docs/evidence/generated/_generated/isa_catalogue_latest",
    "docs/evidence/generated/_generated/isa_catalogue_runs",
]
hits = []
for pat in forbidden_pats:
    try:
        r = subprocess.check_output(["rg", "-n", pat, ".", "-S"], text=True, stderr=subprocess.DEVNULL).strip()
        if r:
            hits.append(r)
    except subprocess.CalledProcessError:
        pass

md = []
md.append("# Manus Readiness Precheck\n\n")
md.append(f"- Date (UTC): {date}\n\n")

md.append("## 1) Required anchors presence\n\n")
if missing:
    md.append("**FAIL** Missing required files:\n\n")
    for m in missing:
        md.append(f"- `{m}`\n")
else:
    md.append("**PASS** All required anchor files present.\n")
md.append("\n")

md.append("## 2) Shadow TODO/backlog/roadmap files outside canonical planning\n\n")
if shadow:
    md.append("Found files that may confuse agents:\n\n")
    for s in shadow:
        md.append(f"- `{s}`\n")
else:
    md.append("None found.\n")
md.append("\n")

md.append("## 3) Forbidden strings / fragile contracts\n\n")
md.append("```\n")
md.append("\n\n".join(hits) if hits else "(none)")
md.append("\n```\n")

pathlib.Path(out).write_text("".join(md), encoding="utf-8")
print(out)
