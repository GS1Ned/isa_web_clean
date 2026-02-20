import csv, pathlib, re, subprocess, sys

errors = []

allowed_planning = {
    "docs/planning/BACKLOG.csv",
    "docs/planning/INDEX.md",
    "docs/planning/NEXT_ACTIONS.json",
    "docs/planning/NEXT_ACTIONS.md",
    "docs/planning/PLANNING_POLICY.md",
    # Support-only planning narrative. Optional and non-canonical.
    "docs/planning/PROGRAM_PLAN.md",
}

allowed_planning_prefixes = (
    # Refactoring inventory/artifacts are governed by scripts/refactor/* gates.
    "docs/planning/refactoring/",
)

ignored_planning_basenames = {
    ".DS_Store",
    "Thumbs.db",
    "desktop.ini",
}

planning_dir = pathlib.Path("docs/planning")
if planning_dir.exists():
    for p in sorted(planning_dir.rglob("*")):
        if p.is_dir():
            continue
        if p.name in ignored_planning_basenames or p.name.startswith("._"):
            continue
        rel = p.as_posix()
        if rel.startswith("docs/planning/work-packages/"):
            errors.append(f"Disallowed planning folder exists: {rel}")
        if rel.startswith("docs/planning/_root/"):
            errors.append(f"Disallowed legacy planning folder exists: {rel}")
        if rel.startswith(allowed_planning_prefixes):
            continue
        if rel not in allowed_planning:
            errors.append(
                "Disallowed planning file (canonical planning is "
                "docs/planning/NEXT_ACTIONS.json + docs/planning/BACKLOG.csv; "
                "docs/planning/PROGRAM_PLAN.md is support-only if present): "
                f"{rel}"
            )

trace = pathlib.Path("docs/spec/TRACEABILITY_MATRIX.csv")
if trace.exists():
    txt = trace.read_text(encoding="utf-8", errors="replace")
    if re.search(r"(?i)\b(TODO|FIXME|TBD|BLOCKED|HACK|NEXT)\b", txt):
        errors.append("TRACEABILITY_MATRIX.csv contains TODO/FIXME/TBD/BLOCKED/HACK/NEXT markers (not allowed)")

backlog = pathlib.Path("docs/planning/BACKLOG.csv")
if backlog.exists():
    with backlog.open("r", encoding="utf-8", errors="replace", newline="") as f:
        r = csv.DictReader(f)
        for i, row in enumerate(r, start=2):
            bid = (row.get("id") or "").strip()
            st = (row.get("status") or "").strip()
            if not bid:
                errors.append(f"BACKLOG.csv missing id at line {i}")
            if not st:
                errors.append(f"BACKLOG.csv missing status for {bid or '(missing id)'} at line {i}")

if trace.exists():
    with trace.open("r", encoding="utf-8", errors="replace", newline="") as f:
        rows = list(csv.reader(f))
    if rows:
        header = rows[0]
        if "BACKLOG_ID" in header and "BACKLOG_STATUS" in header:
            ix_id = header.index("BACKLOG_ID")
            ix_st = header.index("BACKLOG_STATUS")
            for line_no, row in enumerate(rows[1:], start=2):
                if len(row) <= max(ix_id, ix_st):
                    continue
                if (row[ix_id] or "").strip() and not (row[ix_st] or "").strip():
                    errors.append(f"TRACEABILITY_MATRIX.csv line {line_no}: BACKLOG_ID present but BACKLOG_STATUS empty")


def _added_files_in_latest_commit() -> list[str]:
    try:
        subprocess.run(
            ["git", "rev-parse", "--verify", "HEAD^"],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    except Exception:
        return []

    try:
        result = subprocess.run(
            ["git", "diff", "--name-status", "--diff-filter=A", "HEAD^", "HEAD"],
            check=True,
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
    except Exception:
        return []

    added = []
    for line in result.stdout.splitlines():
        parts = line.split("\t")
        if len(parts) >= 2:
            added.append(parts[-1].strip().replace("\\", "/"))
    return added


def _added_files_in_worktree() -> list[str]:
    try:
        result = subprocess.run(
            ["git", "status", "--porcelain=v1", "--untracked-files=all"],
            check=True,
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
    except Exception:
        return []

    added = []
    for raw in result.stdout.splitlines():
        if len(raw) < 4:
            continue
        status = raw[:2]
        path = raw[3:].strip().replace("\\", "/")
        if status in {"A ", "??"} and path:
            added.append(path)
    return added


added_files = sorted(set(_added_files_in_latest_commit() + _added_files_in_worktree()))
added_markdown = [p for p in added_files if p.lower().endswith(".md")]

allowed_new_markdown_exact = {
    "README.md",
    "AGENTS.md",
    "AGENT_START_HERE.md",
    "docs/INDEX.md",
    "docs/README.md",
}

allowed_new_markdown_prefixes = (
    "docs/agent/",
    "docs/planning/",
    "docs/governance/",
    "docs/spec/",
    "docs/core/",
    "docs/decisions/",
    "docs/evidence/",
    "docs/archive/",
    "docs/misc/_root/",
    "isa-archive/",
)

artifact_name_re = re.compile(
    r"(?i)(report|summary|notes|patch|findings|results|failure[_-]?modes|drift)"
)

for rel in added_markdown:
    if rel not in allowed_new_markdown_exact and not rel.startswith(allowed_new_markdown_prefixes):
        errors.append(
            "Disallowed new markdown file path: "
            f"{rel}. Integrate content into canonical docs instead of creating ad-hoc docs."
        )

    basename = pathlib.PurePosixPath(rel).name
    if not (rel.startswith("docs/archive/") or rel.startswith("isa-archive/")) and artifact_name_re.search(basename):
        errors.append(
            "Forbidden new report-style markdown artifact: "
            f"{rel}. Use integrate-first mode (patch canonical docs) instead."
        )

if errors:
    print("\n".join(errors))
    sys.exit(1)
print("OK")
