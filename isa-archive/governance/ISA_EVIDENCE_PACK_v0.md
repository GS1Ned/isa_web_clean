# ISA_EVIDENCE_PACK_v0

Generated: 2026-01-28

This pack is built from the uploaded repo zip: `isa_web_clean-main (9).zip` and the uploaded `isa.inventory.json` snapshot: `isa.inventory (7).json`.

## What’s included

1. **Repository census**: file/directory/type counts + sizes → `CENSUS.json`
2. **Inventory vs zip diff**: mismatches to resolve or accept as scope → `CENSUS_DIFF.md`
3. **Large assets list**: top-20 by size (dataset vs generated output vs other) → `LARGE_ASSETS.md`
4. **Entrypoints**: commands + runtime entry files → `ENTRYPOINTS.md`
5. **Directory layer summary**: count/size per top-level dir → `SUBDIR_SUMMARY.md`
6. **Candidate canonical doc set for IRON**: what exists vs what should be promoted → `DOC_AUTHORITY_MAP.md`
7. **Top-20 critical code/doc files**: responsibilities + evidence anchors → `CRITICAL_FILES_CANDIDATES.md`
8. **Execution map**: 3 primary journeys end-to-end → `ISA_EXECUTION_MAP.md`
9. **Mermaid graph**: runtime flow (client/tRPC/cron/db) → `EXEC_GRAPH.mmd`

## Immediate findings that impact “completeness checks”

- Inventory and zip disagree on scope for `.github/` and file counts in `scripts/` (details in `CENSUS_DIFF.md`).
- Large repo weight is driven by `data/standards/...` archives and spreadsheets (details in `LARGE_ASSETS.md`).

## Recommended next step (strictly deterministic, low-cost)

Decide whether the IRON “inventory scope” should:
- **Exclude dot-directories** like `.github/` (current behavior implied by mismatch), or
- Include them (requires scope + inventory script adjustment).

Then lock this as an explicit IRON decision (scope decision + inventory behavior), so the completeness checks become stable.
