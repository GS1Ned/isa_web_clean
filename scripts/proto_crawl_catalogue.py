#!/usr/bin/env python3
import os, sys

EVIDENCE_OUT_DIR = os.environ.get("ISA_EVIDENCE_OUT_DIR", "docs/evidence/generated/_generated")
OUT_JSON = f"{EVIDENCE_OUT_DIR}/GS1_EFRAG_CATALOGUE.json"
OUT_CSV = f"{EVIDENCE_OUT_DIR}/GS1_EFRAG_CATALOGUE.csv"
OUT_MD  = f"{EVIDENCE_OUT_DIR}/GS1_EFRAG_CATALOGUE_INDEX.md"

def main():
    print("proto_crawl_catalogue: placeholder/legacy helper")
    print("ISA_EVIDENCE_OUT_DIR=", EVIDENCE_OUT_DIR)
    print("OUT_JSON=", OUT_JSON)
    print("OUT_CSV=", OUT_CSV)
    print("OUT_MD=", OUT_MD)

if __name__ == "__main__":
    main()
