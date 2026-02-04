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

## 4. Invariants (MUST-level)

**INV-1:** **Canonical URL:** GS1 Netherlands member portal (authentication required)
- Source: `./ISA_GS1_ARTIFACT_INVENTORY.md` > 2. GS1 NL Data Attribute System (DAS) Explanations

**INV-2:** - Required for understanding GS1 barcode and Digital Link syntax
- Source: `./ISA_GS1_ARTIFACT_INVENTORY.md` > A1. GS1 General Specifications Standard

**INV-3:** - Required for CSRD Scope 3 emissions, EUDR, PPWR compliance
- Source: `./ISA_GS1_ARTIFACT_INVENTORY.md` > C1. EPCIS & CBV Standard Version 2.0

**INV-4:** **Authentication Required:**
- Source: `./ISA_GS1_ARTIFACT_INVENTORY.md` > Canonical Sources

**INV-5:** - Auth Required: Yes (GS1 membership or license agreement)
- Source: `./docs/DATASETS_CATALOG.md` > 2. GDSN Current v3.1.32

**INV-6:** Per MANUS_EXECUTION_BRIEF Section 5.1, every dataset must include:
- Source: `./docs/DATASETS_CATALOG.md` > Dataset Metadata Requirements

**INV-7:** - Current and future versions must coexist in catalog
- Source: `./docs/DATASETS_CATALOG.md` > Versioning Policy

**INV-8:** | Human review required | ✅ Enforced in governance |
- Source: `./PRODUCTION_READINESS.md` > Change Detection

**INV-9:** | **Artefact drift** | Medium | EUR-Lex sources may change; periodic manual re-verification required |
- Source: `./PRODUCTION_READINESS.md` > Residual Risks

**INV-10:** 1. ✅ GS1 is never legally required (disclaimer in all API responses)
- Source: `./PRODUCTION_READINESS.md` > Governance Constraints Enforced

**INV-11:** 6. ✅ Traceability chain required for all GS1 relevance claims
- Source: `./PRODUCTION_READINESS.md` > Governance Constraints Enforced

**INV-12:** - “change detection → recompute pipeline” must be deterministic and testable.
- Source: `./docs/evidence/_benchmarks/ISA_EXTERNAL_BENCHMARK_NOTES_v2.md` > 3) Regulatory source harvesting patterns (EU)

**INV-13:** 2.  The developer/agent must make an explicit decision: **IN**, **OUT**, or **IGNORE**.
- Source: `./SCOPE_DECISIONS.md` > Process

**INV-14:** This document provides example queries for Ask ISA (ISA query interface). Ask ISA is read-only and must answer using locked advisory artefacts and the frozen dataset registry.
- Source: `./docs/ASK_ISA_QUERY_LIBRARY_v1.md` > Purpose

**INV-15:** Every answer must cite:
- Source: `./docs/ASK_ISA_QUERY_LIBRARY_v1.md` > Expected answer format

## 5. Interfaces / Pipelines

*See source documents.*

## 6. Governance & Change Control

1. Review source documents
2. Update TRACEABILITY_MATRIX.csv
3. Follow governance rules

## 7. Observability

**OPEN ISSUE:** Define observability hooks.

## 8. Acceptance Criteria

- AC-1: - Should inform `dutch_initiatives` table
- AC-2: - Should inform `gs1_standards` table (currently has 60 standards)
- AC-3: - Should inform `gs1_standards` table
- AC-4: - Should inform DPP-related regulation mappings
- AC-5: - Should inform traceability-related regulation mappings

## 9. Traceability Annex

| Claim ID | Statement | Source |
|----------|-----------|--------|
| CAT-001 | **Canonical URL:** GS1 Netherlands member portal (authentica... | `./ISA_GS1_ARTIFACT_INVENTORY.md` |
| CAT-002 | - Required for understanding GS1 barcode and Digital Link sy... | `./ISA_GS1_ARTIFACT_INVENTORY.md` |
| CAT-003 | - Required for CSRD Scope 3 emissions, EUDR, PPWR compliance... | `./ISA_GS1_ARTIFACT_INVENTORY.md` |
| CAT-004 | **Authentication Required:**... | `./ISA_GS1_ARTIFACT_INVENTORY.md` |
| CAT-005 | - Auth Required: Yes (GS1 membership or license agreement)... | `./docs/DATASETS_CATALOG.md` |
| CAT-006 | Per MANUS_EXECUTION_BRIEF Section 5.1, every dataset must in... | `./docs/DATASETS_CATALOG.md` |
| CAT-007 | - Current and future versions must coexist in catalog... | `./docs/DATASETS_CATALOG.md` |
| CAT-008 | / Human review required / ✅ Enforced in governance /... | `./PRODUCTION_READINESS.md` |
| CAT-009 | / **Artefact drift** / Medium / EUR-Lex sources may change; ... | `./PRODUCTION_READINESS.md` |
| CAT-010 | 1. ✅ GS1 is never legally required (disclaimer in all API re... | `./PRODUCTION_READINESS.md` |
| CAT-011 | 6. ✅ Traceability chain required for all GS1 relevance claim... | `./PRODUCTION_READINESS.md` |
| CAT-012 | - “change detection → recompute pipeline” must be determinis... | `./docs/evidence/_benchmarks/ISA_EXTERNAL_BENCHMARK_NOTES_v2.md` |
| CAT-013 | 2.  The developer/agent must make an explicit decision: **IN... | `./SCOPE_DECISIONS.md` |
| CAT-014 | This document provides example queries for Ask ISA (ISA quer... | `./docs/ASK_ISA_QUERY_LIBRARY_v1.md` |
| CAT-015 | Every answer must cite:... | `./docs/ASK_ISA_QUERY_LIBRARY_v1.md` |
| CAT-016 | - **Action Required:** Add registry entry or mark as future/... | `./docs/CLEANUP_REPORT.md` |
| CAT-017 | - Should inform `dutch_initiatives` table... | `./ISA_GS1_ARTIFACT_INVENTORY.md` |
| CAT-018 | - Should inform `gs1_standards` table (currently has 60 stan... | `./ISA_GS1_ARTIFACT_INVENTORY.md` |
| CAT-019 | - Should inform `gs1_standards` table... | `./ISA_GS1_ARTIFACT_INVENTORY.md` |
| CAT-020 | - Should inform DPP-related regulation mappings... | `./ISA_GS1_ARTIFACT_INVENTORY.md` |
| CAT-021 | - Should inform traceability-related regulation mappings... | `./ISA_GS1_ARTIFACT_INVENTORY.md` |
| CAT-022 | - Should inform AI-related regulation mappings... | `./ISA_GS1_ARTIFACT_INVENTORY.md` |
| CAT-023 | This catalog documents all canonical datasets used by ISA fo... | `./docs/DATASETS_CATALOG.md` |
| CAT-024 | - ISA should treat evals as first-class artefacts alongside ... | `./docs/evidence/_benchmarks/ISA_EXTERNAL_BENCHMARK_NOTES_v2.md` |
| CAT-025 | - A “golden set” of questions + expected citations should ex... | `./docs/evidence/_benchmarks/ISA_EXTERNAL_BENCHMARK_NOTES_v2.md` |
| CAT-026 | - IRON CONFLICT + scope decisions should be mechanically enf... | `./docs/evidence/_benchmarks/ISA_EXTERNAL_BENCHMARK_NOTES_v2.md` |
| CAT-027 | / verify:data / tsx scripts/verify-data-files.ts /... | `./docs/evidence/ENTRYPOINTS.md` |
| CAT-028 | / validate:advisory / node scripts/validate_advisory_schema.... | `./docs/evidence/ENTRYPOINTS.md` |
