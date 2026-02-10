# Repo Structure / Change Control / Release Discipline

**Canonical Specification**
**Status:** CURRENT (as-built)

## 1. Identity

- **Name:** Repo Structure / Change Control / Release Discipline
- **Scope:** CURRENT state of repo structure / change control / release discipline
- **Marker:** CURRENT (as-built) — not ULTIMATE

## 2. Core Sources

1. `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md`
2. `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md`
3. `./ISA_DEVELOPMENT_PLAYBOOK.md`
4. `./ROADMAP_GITHUB_INTEGRATION.md`
5. `./docs/GITHUB_PROVISIONING_REPORT.md`
6. `./docs/GOVERNANCE_PHASE_2_3_REPORT.md`
7. `./docs/GS1_ARTEFACTS_ALIGNMENT_VALIDATION.md`
8. `./docs/ISA_First_Advisory_Report_GS1NL.md`
9. `./docs/ISA_Strategic_Insights_from_Reports.md`
10. `./docs/ISA_WORKFLOW_IMPROVEMENTS.md`

## 3. Definitions

*See ISA_MASTER_SPEC.md*

## 4. Retrieval and Embeddings

*See [Retrieval and Embeddings](./retrieval-and-embeddings.md) for all definitions, rules, and gates related to embedding models and retrieval strategies.*

## 5. Database Governance

*See [Database Governance](./database-governance.md) for all definitions, rules, and gates related to database configuration, schema management, and data access.*

## 6. Change Control Regels (Change Control Rules)

| Regel-ID | Regel | Bron |
|---|---|---|
| CCR-001 | Het aanmaken van een third-party connectie VEREIST escalatie. | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Action 1: Created GitHub Repository (GS1-ISA/isa) |
| CCR-002 | Er is geen escalatie vereist bij het uitvoeren van directe gebruikersinstructies. | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Action 6: Created ISA_GOVERNANCE.md |

## 7. Kwaliteitspoorten (Gate Definitions)

| Poort-ID | Poortnaam | Trigger | Invoercriteria | Validatiestappen | Uitvoercriteria |
|---|---|---|---|---|---|
| CCG-001 | Code Review Gate | Voorafgaand aan het mergen van een Pull Request. | Een Pull Request. | Verifieer dat de Pull Request is beoordeeld en goedgekeurd door de `CODEOWNERS`. | Succes als de Pull Request is goedgekeurd; anders, falen. |

## 8. Interfaces / Pipelines

*See source documents.*

## 9. Governance & Change Control

1. Review source documents
2. Update TRACEABILITY_MATRIX.csv
3. Follow governance rules

## 10. Observability

**OPEN ISSUE:** Define observability hooks.

## 11. Acceptance Criteria

- AC-1: - Ensure procedures are comprehensive and current
- AC-2: - Validate security monitoring is working
- AC-3: - **Testing** - Run tests, validate data quality, ensure production readiness
- AC-4: 2. Verify data files exist in `/data/` directories
- AC-5: 2. Validate structure and completeness

## 12. Traceability Annex

*This section will be updated after the finalization of the new change control rules and gates.*
