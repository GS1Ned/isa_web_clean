#!/usr/bin/env python3
import os, sys, json, csv, datetime
from pathlib import Path

REPO_ROOT = os.environ.get("REPO_ROOT")
if not REPO_ROOT:
    try:
        import subprocess
        REPO_ROOT = subprocess.check_output(["git","rev-parse","--show-toplevel"], text=True).strip()
    except Exception:
        print("ERROR: REPO_ROOT not set and git root not found"); sys.exit(2)

EVIDENCE_OUT_DIR = os.environ.get("ISA_EVIDENCE_OUT_DIR", "docs/evidence/generated/_generated")
latest_dir = Path(REPO_ROOT) / EVIDENCE_OUT_DIR / "isa_catalogue_latest"

OUT_CSV = Path(REPO_ROOT) / EVIDENCE_OUT_DIR / "GS1_EFRAG_CATALOGUE.csv"
OUT_JSON = Path(REPO_ROOT) / EVIDENCE_OUT_DIR / "GS1_EFRAG_CATALOGUE.json"
OUT_INDEX = Path(REPO_ROOT) / EVIDENCE_OUT_DIR / "GS1_EFRAG_CATALOGUE_INDEX.md"
OUT_STATUS_JSON = Path(REPO_ROOT) / EVIDENCE_OUT_DIR / "CATALOGUE_ENTRYPOINTS_STATUS.json"
OUT_STATUS_MD = Path(REPO_ROOT) / EVIDENCE_OUT_DIR / "CATALOGUE_ENTRYPOINTS_STATUS.md"

def main():
    print("generate_legacy_artefacts: legacy artefact generator")
    print("REPO_ROOT=", REPO_ROOT)
    print("ISA_EVIDENCE_OUT_DIR=", EVIDENCE_OUT_DIR)
    print("latest_dir=", str(latest_dir))

    summary_path = latest_dir / "summary.json"
    items_csv = latest_dir / "files" / "items.csv"
    if not summary_path.is_file() or not items_csv.is_file():
        print("ERROR: missing latest snapshot inputs:", str(summary_path), str(items_csv))
        sys.exit(1)

    with summary_path.open("r", encoding="utf-8") as f:
        summary = json.load(f)

    OUT_CSV.parent.mkdir(parents=True, exist_ok=True)

    rows = []
    with items_csv.open(newline="", encoding="utf-8") as fh:
        reader = csv.DictReader(fh)
        for row in reader:
            rows.append(row)

    with OUT_JSON.open("w", encoding="utf-8") as f:
        json.dump({"generated_at": datetime.datetime.now(datetime.timezone.utc).isoformat().replace("+00:00","Z"),
                   "source_latest": str(latest_dir),
                   "rows": rows}, f, ensure_ascii=False, indent=2)

    with OUT_CSV.open("w", newline="", encoding="utf-8") as fh:
        if rows:
            writer = csv.DictWriter(fh, fieldnames=list(rows[0].keys()))
            writer.writeheader()
            writer.writerows(rows)
        else:
            fh.write("")

    OUT_INDEX.write_text(
        "# GS1/EFRAG catalogue (legacy export)\n\n"
        f"- generated_at: `{datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00','Z')}`\n"
        f"- source_latest: `{latest_dir}`\n"
        f"- rows: `{len(rows)}`\n",
        encoding="utf-8"
    )

    OUT_STATUS_JSON.write_text(json.dumps({"ok": True, "note": "legacy status placeholder"}, indent=2), encoding="utf-8")
    OUT_STATUS_MD.write_text("# Catalogue Entrypoints Status\n\n- ok: true\n- note: legacy status placeholder\n", encoding="utf-8")

    print("OK")
    print("WROTE", str(OUT_JSON))
    print("WROTE", str(OUT_CSV))
    print("WROTE", str(OUT_INDEX))
    print("WROTE", str(OUT_STATUS_JSON))
    print("WROTE", str(OUT_STATUS_MD))

if __name__ == "__main__":
    main()
