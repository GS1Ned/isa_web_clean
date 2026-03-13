# EU ESG Obligations → GS1 Mapping (Canonical Baseline)
Date: 2026-01-25
Status: Frozen baseline (post-adversarial audit)

## 1. Purpose
This package represents an audit-defensible baseline mapping between:
A) EU ESG legal obligations
B) GS1 capabilities and standards (where relevant)

The mapping is obligation-driven and evidence-bounded to the artefacts in this package.
GS1 is treated as optional infrastructure, never as a legal requirement.

## 2. Artefact inventory
- data/corpus.json
- data/obligations.json
- data/atomic_requirements.json
- data/data_requirements.json
- data/gs1_mapping.json
- data/scoring.json
- validation/placeholder_scan.txt
- validation/consistency_report.txt
- validation/completeness_matrix.csv
- checksums/SHA256SUMS.txt

## 3. Frozen Regulatory Corpus
See: data/corpus.json

## 4. Legal Obligations Baseline
See: data/obligations.json

## 5. Atomic Requirements
See: data/atomic_requirements.json

## 6. Information & Data Requirements
See: data/data_requirements.json

## 7. GS1 Mapping & Scoring
See:
- data/gs1_mapping.json
- data/scoring.json

## 8. Governance note (audit posture)
Downstream use MUST:
- avoid claims of legal necessity where only operational support exists
- explicitly acknowledge non-GS1 datasets required for legal proof (e.g., geolocation/legality/risk datasets for EUDR)
- preserve separation between identity/event scaffolding and compliance assertions


## 9. Validation notes
- Structural validation: PASS (see `VALIDATION_REPORT.md`).
- Legal traceability hard-gate: obligations with placeholder article references must be tightened before treating them as citation-grade (currently: PPWR-O1, PPWR-O2, FL-O1).
