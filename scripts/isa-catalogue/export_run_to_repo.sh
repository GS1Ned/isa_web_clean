#!/usr/bin/env bash
set -euo pipefail
set +H 2>/dev/null || true

KEEP_SUCCESS="${KEEP_SUCCESS:?set KEEP_SUCCESS=/path/to/isa_out_...}"
REPO_ROOT="${REPO_ROOT:-$(git rev-parse --show-toplevel)}"

ts="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_RUNS="$REPO_ROOT/docs/evidence/generated/_generated/isa_catalogue_runs"
OUT_SNAP="$OUT_RUNS/$ts"
OUT_LATEST="$REPO_ROOT/docs/evidence/generated/_generated/isa_catalogue_latest"

mkdir -p "$OUT_SNAP/files"

DATAFILES=()
for f in items.csv items.jsonl summary.json state.json urls.csv; do
  [ -f "$KEEP_SUCCESS/$f" ] && DATAFILES+=("$KEEP_SUCCESS/$f")
done
[ "${#DATAFILES[@]}" -gt 0 ] || { echo "ERROR: no data files in $KEEP_SUCCESS"; exit 1; }

for f in "${DATAFILES[@]}"; do
  cp -f "$f" "$OUT_SNAP/files/$(basename "$f")"
done

export OUT_SNAP KEEP_SUCCESS REPO_ROOT

python3 - <<'PY'
import os, json, hashlib, datetime, csv
out_snap = os.environ["OUT_SNAP"]
files_dir = os.path.join(out_snap, "files")
items = []
for name in sorted(os.listdir(files_dir)):
    p = os.path.join(files_dir, name)
    if not os.path.isfile(p):
        continue
    with open(p, "rb") as fh:
        data = fh.read()
    items.append({"filename": name, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()})
summary = {
    "generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00","Z"),
    "snapshot_dir": out_snap,
    "source_run_dir": os.environ["KEEP_SUCCESS"],
    "repo_root": os.environ["REPO_ROOT"],
    "files": items
}
with open(os.path.join(out_snap, "summary.json"), "w", encoding="utf-8") as f:
    json.dump(summary, f, ensure_ascii=False, indent=2)
md = []
md.append("# ISA catalogue export (snapshot)\n\n")
md.append(f"- generated_at: `{summary['generated_at']}`\n")
md.append(f"- snapshot: `{summary['snapshot_dir']}`\n")
md.append(f"- source_run_dir: `{summary['source_run_dir']}`\n")
md.append(f"- file_count: `{len(items)}`\n\n")
md.append("## Files\n")
for it in items:
    md.append(f"- `{it['filename']}` — bytes: `{it['bytes']}` — sha256: `{it['sha256']}`\n")
with open(os.path.join(out_snap, "index.md"), "w", encoding="utf-8") as f:
    f.write("".join(md))
csv_path = os.path.join(files_dir, "items.csv")
if os.path.exists(csv_path):
    with open(csv_path, newline="", encoding="utf-8") as fh:
        r = csv.reader(fh)
        header = next(r, [])
    required = ["source","source_url","resource_url","format","title","date_published","version","status","discovered_via","http_status","content_type","content_length","etag","last_modified","last_verified_date"]
    missing = [c for c in required if c not in header]
    if missing:
        print("WARNING: items.csv missing expected columns:", ", ".join(missing))
PY

rm -rf "$OUT_LATEST"
mkdir -p "$OUT_LATEST"
cp -R "$OUT_SNAP/"* "$OUT_LATEST/"

echo "OK export"
echo "Snapshot: $OUT_SNAP"
echo "Latest:   $OUT_LATEST"
