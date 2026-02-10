import json
import sys
from pathlib import Path

def die(msg):
    print(f"SMOKE_FAIL: {msg}", file=sys.stderr)
    sys.exit(2)

repo = Path(__file__).resolve()
while repo != repo.parent and not (repo / ".git").exists():
    repo = repo.parent

if not (repo / ".git").exists():
    die("cannot find git repo root from script location")

required = [
    "docs/spec/ASK_ISA.md",
    "docs/spec/contracts/ASK_ISA_RUNTIME_CONTRACT.md",
    "server/prompts/ask_isa/index.ts",
    "docs/planning/NEXT_ACTIONS.json",
]
missing = [p for p in required if not (repo / p).exists()]
if missing:
    die("missing required paths: " + ", ".join(missing))

d = json.loads((repo / "docs/planning/NEXT_ACTIONS.json").read_text(encoding="utf-8"))
item = next((x for x in d.get("items", []) if x.get("id") == "P1-0002"), None)
if not item:
    die("P1-0002 missing in NEXT_ACTIONS.json")

print("SMOKE_OK")
print("repo_root=" + str(repo))
print("verified_files=" + ",".join(required))
