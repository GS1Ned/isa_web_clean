import csv, json, os, datetime, hashlib
from collections import defaultdict

repo_root = os.environ["REPO_ROOT"]
latest_dir = os.path.join(repo_root, "docs/evidence/_generated/isa_catalogue_latest")
files_dir = os.path.join(latest_dir, "files")
items_csv = os.path.join(files_dir, "items.csv")
index_md = os.path.join(latest_dir, "index.md")
summary_json = os.path.join(latest_dir, "summary.json")

if not os.path.isfile(items_csv):
    raise SystemExit(f"missing {items_csv}")

out_csv = os.path.join(repo_root, "docs/evidence/_generated/GS1_EFRAG_CATALOGUE.csv")
out_json = os.path.join(repo_root, "docs/evidence/_generated/GS1_EFRAG_CATALOGUE.json")
out_index = os.path.join(repo_root, "docs/evidence/_generated/GS1_EFRAG_CATALOGUE_INDEX.md")
out_status_json = os.path.join(repo_root, "docs/evidence/_generated/CATALOGUE_ENTRYPOINTS_STATUS.json")
out_status_md = os.path.join(repo_root, "docs/evidence/_generated/CATALOGUE_ENTRYPOINTS_STATUS.md")

rows = []
with open(items_csv, newline="", encoding="utf-8") as fh:
    r = csv.DictReader(fh)
    for row in r:
        rows.append(row)

with open(items_csv, "rb") as fh:
    csv_bytes = fh.read()
csv_sha = hashlib.sha256(csv_bytes).hexdigest()

with open(out_csv, "wb") as fh:
    fh.write(csv_bytes)

with open(out_json, "w", encoding="utf-8") as fh:
    json.dump(rows, fh, ensure_ascii=False, indent=2)

if os.path.isfile(index_md):
    with open(index_md, "r", encoding="utf-8") as fh:
        md = fh.read()
else:
    md = "# GS1/EFRAG catalogue index\n"
with open(out_index, "w", encoding="utf-8") as fh:
    fh.write(md)

now = datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00", "Z")
sources = defaultdict(int)
entrypoints = defaultdict(int)
http = defaultdict(int)
content_types = defaultdict(int)
max_last_verified = None
bad_last_verified = 0

def parse_dt(s):
    s = (s or "").strip()
    if not s:
        return None
    try:
        if s.endswith("Z"):
            s = s[:-1] + "+00:00"
        dt = datetime.datetime.fromisoformat(s)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=datetime.timezone.utc)
        return dt
    except Exception:
        return None

for row in rows:
    src = (row.get("source") or "").strip()
    sources[src] += 1
    su = (row.get("source_url") or "").strip()
    entrypoints[su] += 1
    hs = (row.get("http_status") or "").strip()
    http[hs] += 1
    ct = (row.get("content_type") or "").strip()
    content_types[ct] += 1
    lv = (row.get("last_verified_date") or "").strip()
    dt = parse_dt(lv)
    if dt is None and lv:
        bad_last_verified += 1
    if dt is not None and (max_last_verified is None or dt > max_last_verified):
        max_last_verified = dt

status = {
    "generated_at": now,
    "source_of_truth": {
        "items_csv": os.path.relpath(items_csv, repo_root),
        "items_csv_sha256": csv_sha,
        "rows": len(rows),
    },
    "max_last_verified_date": (max_last_verified.isoformat().replace("+00:00", "Z") if max_last_verified else None),
    "note_bad_last_verified_date_rows": bad_last_verified,
    "by_source": dict(sorted(sources.items(), key=lambda x: (-x[1], x[0]))),
    "by_source_url": dict(sorted(entrypoints.items(), key=lambda x: (-x[1], x[0]))),
    "by_http_status": dict(sorted(http.items(), key=lambda x: (-x[1], x[0]))),
    "by_content_type": dict(sorted(content_types.items(), key=lambda x: (-x[1], x[0]))),
    "latest_summary_json_present": os.path.isfile(summary_json),
}

with open(out_status_json, "w", encoding="utf-8") as fh:
    json.dump(status, fh, ensure_ascii=False, indent=2)

md_lines = []
md_lines.append("# Catalogue Entrypoints Status\n\n")
md_lines.append(f"- generated_at: `{status['generated_at']}`\n")
md_lines.append(f"- rows: `{status['source_of_truth']['rows']}`\n")
md_lines.append(f"- items_csv_sha256: `{status['source_of_truth']['items_csv_sha256']}`\n")
md_lines.append(f"- max_last_verified_date: `{status['max_last_verified_date']}`\n\n")
md_lines.append("## By source\n")
for k,v in status["by_source"].items():
    md_lines.append(f"- `{k}`: `{v}`\n")
md_lines.append("\n## By entrypoint (source_url)\n")
for k,v in status["by_source_url"].items():
    md_lines.append(f"- `{k}`: `{v}`\n")
md_lines.append("\n## By http_status\n")
for k,v in status["by_http_status"].items():
    md_lines.append(f"- `{k}`: `{v}`\n")
with open(out_status_md, "w", encoding="utf-8") as fh:
    fh.write("".join(md_lines))
