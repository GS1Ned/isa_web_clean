# Catalogue Obligation & Source Registry

**Canonical Specification**
**Status:** CURRENT (as-built)

## 1. Identity

- **Name:** Catalogue Obligation & Source Registry
- **Scope:** CURRENT state of catalogue obligation & source registry
- **Marker:** CURRENT (as-built) — not ULTIMATE

## 2. Core Sources

1. `./docs/evidence/ISA_SOURCES_REGISTRY_v0.md`
2. `./ISA_GS1_ARTIFACT_INVENTORY.md`
3. `./docs/DATASETS_CATALOG.md`
4. `./DATASET_INVENTORY.md`
5. `./PRODUCTION_READINESS.md`
6. `./docs/evidence/EVIDENCE_INDEX.md`
7. `./docs/evidence/_benchmarks/ISA_EXTERNAL_BENCHMARK_NOTES_v2.md`
8. `./docs/GOVERNANCE_FINAL_SUMMARY.md`
9. `./docs/evidence/ENTRYPOINTS.md`
10. `./docs/evidence/_generated/CATALOGUE_ENTRYPOINTS_STATUS.md`

## 3. Definitions

*See ISA_MASTER_SPEC.md*

## 4. Retrieval and Embeddings

*See [Retrieval and Embeddings](./retrieval-and-embeddings.md) for all definitions, rules, and gates related to embedding models and retrieval strategies.*

## 5. Database Governance

*See [Database Governance](./database-governance.md) for all definitions, rules, and gates related to database configuration, schema management, and data access.*

## 6. Catalogusregels (Catalogue Rules)

| Regel-ID | Regel | Bron |
|---|---|---|
| CR-001 | De bronnencatalogus MOET zowel de huidige als de toekomstige versies van een dataset ondersteunen en naast elkaar laten bestaan. | `./docs/DATASETS_CATALOG.md` > Versioning Policy |
| CR-002 | GS1 is nooit wettelijk verplicht; een disclaimer MOET worden opgenomen in alle API-antwoorden. | `./PRODUCTION_READINESS.md` > Governance Constraints Enforced |
| CR-003 | Een traceerbaarheidsketen is vereist voor alle GS1-relevantieclaims. | `./PRODUCTION_READINESS.md` > Governance Constraints Enforced |
| CR-004 | Het "change detection → recompute pipeline" MOET deterministisch en testbaar zijn. | `./docs/evidence/_benchmarks/ISA_EXTERNAL_BENCHMARK_NOTES_v2.md` > 3) Regulatory source harvesting patterns (EU) |
| CR-005 | De ontwikkelaar/agent MOET een expliciete beslissing nemen: **IN**, **OUT**, of **IGNORE** voor elke nieuwe bron. | `./SCOPE_DECISIONS.md` > Process |

## 7. Kwaliteitspoorten (Gate Definitions)

| Poort-ID | Poortnaam | Trigger | Invoercriteria | Validatiestappen | Uitvoercriteria |
|---|---|---|---|---|---|
| CG-001 | Human Review Gate | Bij elke wijziging in de bronnencatalogus. | Een voorgestelde wijziging in de bronnencatalogus. | Een menselijke beoordelaar MOET de voorgestelde wijziging beoordelen en goedkeuren. | Succes als de wijziging is goedgekeurd; anders, falen. |
| CG-002 | Authentication Gate | Bij toegang tot een bron die authenticatie vereist. | Een verzoek om toegang tot een beveiligde bron. | Verifieer dat de gebruiker over de juiste authenticatiegegevens beschikt. | Succes als de authenticatie slaagt; anders, falen. |

## 8. Interfaces / Pipelines

*See source documents.*

## 9. Governance & Change Control

1. Review source documents
2. Update TRACEABILITY_MATRIX.csv
3. Follow governance rules

## 10. Observability

**OPEN ISSUE:** Define observability hooks.

## 11. Acceptance Criteria

- AC-1: - Should inform `dutch_initiatives` table
- AC-2: - Should inform `gs1_standards` table (currently has 60 standards)
- AC-3: - Should inform `gs1_standards` table
- AC-4: - Should inform DPP-related regulation mappings
- AC-5: - Should inform traceability-related regulation mappings

## 12. Traceability Annex

*This section will be updated after the finalization of the new catalogue rules and gates.*
