#!/usr/bin/env bash
set -euo pipefail
set +H 2>/dev/null || true

REPO_ROOT="${REPO_ROOT:-$(git rev-parse --show-toplevel)}"
export REPO_ROOT
POLICY="$REPO_ROOT/configs/isa-catalogue/policy.json"
LATEST="$REPO_ROOT/docs/evidence/_generated/isa_catalogue_latest"

python3 - <<'PY'
import os, json, sys, datetime, csv

repo = os.environ.get("REPO_ROOT") or sys.exit(2)
policy_path = os.path.join(repo, "configs/isa-catalogue/policy.json")
latest = os.path.join(repo, "docs/evidence/_generated/isa_catalogue_latest")
sum_path = os.path.join(latest, "summary.json")
csv_path = os.path.join(latest, "files", "items.csv")

if not os.path.isfile(policy_path):
    print("IRON FAIL: missing policy:", policy_path); sys.exit(1)
with open(policy_path, "r", encoding="utf-8") as f:
    policy = json.load(f)

staleness_days_max = int(policy.get("staleness_days_max", 14))
req_latest_files = policy.get("required_latest_files", ["items.csv"])
req_cols = policy.get("required_items_csv_columns", [])

if not os.path.isdir(latest):
    print("IRON FAIL: missing latest dir:", latest); sys.exit(1)
if not os.path.isfile(sum_path):
    print("IRON FAIL: missing summary.json:", sum_path); sys.exit(1)
for name in req_latest_files:
    p = os.path.join(latest, "files", name)
    if not os.path.isfile(p):
        print("IRON FAIL: missing required latest file:", p); sys.exit(1)

with open(sum_path, "r", encoding="utf-8") as f:
    s = json.load(f)

def parse_iso(x):
    if not x: return None
    x = x.replace("Z", "+00:00")
    return datetime.datetime.fromisoformat(x)

now = datetime.datetime.now(datetime.timezone.utc)
gen = parse_iso(s.get("generated_at"))
if gen is None:
    print("IRON FAIL: summary.json missing generated_at"); sys.exit(1)

age_gen = (now - gen).total_seconds()/86400.0
if age_gen > staleness_days_max:
    print(f"IRON FAIL: stale by generated_at: {age_gen:.2f}d > {staleness_days_max}d"); sys.exit(1)

with open(csv_path, newline="", encoding="utf-8") as fh:
    r = csv.DictReader(fh)
    header = r.fieldnames or []
missing_cols = [c for c in req_cols if c not in header]
if missing_cols:
    print("IRON FAIL: items.csv missing columns:", ", ".join(missing_cols)); sys.exit(1)

max_lv = None
bad = 0
with open(csv_path, newline="", encoding="utf-8") as fh:
    r = csv.DictReader(fh)
    for row in r:
        v = (row.get("last_verified_date") or "").strip()
        if not v: continue
        try:
            dt = parse_iso(v)
            if dt.tzinfo is None: dt = dt.replace(tzinfo=datetime.timezone.utc)
            if (max_lv is None) or (dt > max_lv): max_lv = dt
        except Exception:
            bad += 1

if max_lv is None:
    print("IRON FAIL: no parseable last_verified_date in items.csv"); sys.exit(1)

age_lv = (now - max_lv).total_seconds()/86400.0
if age_lv > staleness_days_max:
    print(f"IRON FAIL: stale by last_verified_date: {age_lv:.2f}d > {staleness_days_max}d"); sys.exit(1)

print("IRON PASS")
print(f"generated_at_age_days={age_gen:.2f}")
print(f"last_verified_age_days={age_lv:.2f}")
if bad: print(f"note_bad_last_verified_date_rows={bad}")
PY
