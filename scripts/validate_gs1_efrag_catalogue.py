import os
EVIDENCE_OUT_DIR = os.environ.get('ISA_EVIDENCE_OUT_DIR', 'docs/evidence/generated/_generated')
import os, json, csv, datetime, sys

repo_root = os.getcwd()
latest_dir = os.path.join(repo_root, EVIDENCE_OUT_DIR, 'isa_catalogue_latest')
files_dir = os.path.join(latest_dir, "files")
items_csv = os.path.join(files_dir, "items.csv")
summary_json = os.path.join(latest_dir, "summary.json")

required = [
os.path.join(repo_root, EVIDENCE_OUT_DIR, "GS1_EFRAG_CATALOGUE.csv"),
os.path.join(repo_root, EVIDENCE_OUT_DIR, "GS1_EFRAG_CATALOGUE.json"),
os.path.join(repo_root, EVIDENCE_OUT_DIR, "GS1_EFRAG_CATALOGUE_INDEX.md"),
os.path.join(repo_root, EVIDENCE_OUT_DIR, "CATALOGUE_ENTRYPOINTS_STATUS.json"),
os.path.join(repo_root, EVIDENCE_OUT_DIR, "CATALOGUE_ENTRYPOINTS_STATUS.md"),
]

missing = [p for p in required if not os.path.isfile(os.path.join(repo_root, p))]
if missing:
    print("FAIL: missing legacy artefacts:")
    for p in missing:
        print(" -", p)
    sys.exit(1)

if not os.path.isfile(items_csv):
    print("FAIL: missing items.csv under isa_catalogue_latest/files/")
    sys.exit(1)

rows = 0
sources = set()
with open(items_csv, newline="", encoding="utf-8") as fh:
    r = csv.DictReader(fh)
    for row in r:
        rows += 1
        sources.add((row.get("source") or "").strip().lower())

if rows < 10:
    print(f"FAIL: items.csv too small: rows={rows}")
    sys.exit(1)

joined = " ".join(sorted(sources))
need = ["gs1", "efrag"]
miss_need = [k for k in need if k not in joined]
if miss_need:
    print("FAIL: required bodies not detected in source column (case-insensitive contains):", ", ".join(miss_need))
    print("note_sources_detected_count=", len(sources))
    sys.exit(1)

if os.path.isfile(summary_json):
    with open(summary_json, "r", encoding="utf-8") as fh:
        s = json.load(fh)
    gen = s.get("generated_at")
    if gen:
        try:
            if gen.endswith("Z"):
                gen_dt = datetime.datetime.fromisoformat(gen[:-1] + "+00:00")
            else:
                gen_dt = datetime.datetime.fromisoformat(gen)
            now = datetime.datetime.now(datetime.timezone.utc)
            age_days = (now - gen_dt).total_seconds()/86400.0
            if age_days > 90:
                print(f"FAIL: latest summary.json too old: age_days={age_days:.2f}")
                sys.exit(1)
        except Exception:
            print("FAIL: summary.json generated_at not parseable")
            sys.exit(1)

print("PASS")
