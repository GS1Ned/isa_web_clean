# CENSUS_DIFF (inventory ↔ zip)

Generated: 2026-01-28

## Mismatches

| path | inventory_file_count | zip_file_count |
|---|---|---|
| .github | None | 4 |
| scripts | 77 | 75 |

## Interpretation (evidence-bound)

- `.github/` is present in the zip but absent from `isa.inventory.json` directory list → inventory scope likely excludes dot-directories.
- `scripts/` differs by 2 files (inventory=77 vs zip=75) → inventory and zip are not identical snapshots, or inventory includes extra paths not present in this zip.
