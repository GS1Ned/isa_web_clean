# EU_ESG_to_GS1_Mapping_v1.0
Date: 2026-01-25
Package: EU ESG obligations → GS1 mapping (frozen baseline)

## What this is
A frozen, structured export of the mapping artefacts generated in-chat:
- corpus (EU instruments)
- explicit obligations (as stated)
- atomic requirements
- data requirements
- GS1 mappings
- scoring

## Validation performed
- JSON Schema validation for all JSON artefacts
- Reference integrity checks (IDs / dangling refs)
- Completeness matrix export (instrument→obligations→atomic→data, plus mapping/scoring coverage)
- Placeholder scan (TODO/TBD/example/placeholder/ellipsis)

Results:
- validation/placeholder_scan.txt
- validation/consistency_report.txt
- validation/completeness_matrix.csv

## Checksums
- checksums/SHA256SUMS.txt

## Caveats
- This package is validated for internal consistency.
- It does not claim that every legal citation is complete beyond the “baseline” content used here.
