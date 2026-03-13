#!/usr/bin/env python3
import os
from pathlib import Path

EVIDENCE_OUT_DIR = Path(os.environ.get("ISA_EVIDENCE_OUT_DIR", "docs/evidence/generated/_generated"))
OUT_JSON = EVIDENCE_OUT_DIR / "CATALOGUE_ENTRYPOINTS_STATUS.json"
OUT_MD   = EVIDENCE_OUT_DIR / "CATALOGUE_ENTRYPOINTS_STATUS.md"

def main():
    print("verify_catalogue_entrypoints: placeholder/legacy helper")
    print("ISA_EVIDENCE_OUT_DIR=", str(EVIDENCE_OUT_DIR))
    print("OUT_JSON=", str(OUT_JSON))
    print("OUT_MD=", str(OUT_MD))

if __name__ == "__main__":
    main()
