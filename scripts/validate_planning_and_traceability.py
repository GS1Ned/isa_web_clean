import csv, pathlib, re, sys

errors = []

allowed_planning = {
    "docs/planning/BACKLOG.csv",
    "docs/planning/INDEX.md",
    "docs/planning/NEXT_ACTIONS.json",
    "docs/planning/NEXT_ACTIONS.md",
    "docs/planning/PLANNING_POLICY.md",
    "docs/planning/PROGRAM_PLAN.md",
    "todo.md",
}

planning_dir = pathlib.Path("docs/planning")
if planning_dir.exists():
    for p in sorted(planning_dir.rglob("*")):
        if p.is_dir():
            continue
        rel = p.as_posix()
        if rel.startswith("docs/planning/work-packages/"):
            errors.append(f"Disallowed planning folder exists: {rel}")
        if rel.startswith("docs/planning/_root/"):
            errors.append(f"Disallowed legacy planning folder exists: {rel}")
        if rel not in allowed_planning:
            errors.append(f"Disallowed planning file (canonical planning is docs/planning/NEXT_ACTIONS.json + docs/planning/PROGRAM_PLAN.md): {rel}")

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

if errors:
    print("\n".join(errors))
    sys.exit(1)
print("OK")
