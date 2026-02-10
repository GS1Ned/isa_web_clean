# ISA Core Architecture

**Canonical Specification**
**Status:** CURRENT (as-built)

## 1. Identity

- **Name:** ISA Core Architecture
- **Scope:** CURRENT state of isa core architecture
- **Marker:** CURRENT (as-built) — not ULTIMATE

## 2. Core Sources

1. `./ARCHITECTURE.md`
2. `./docs/FILE_SYSTEM_MEMORY_ARCHITECTURE.md`
3. `./docs/ISA_INFORMATION_ARCHITECTURE.md`
4. `./ROADMAP_GITHUB_INTEGRATION.md`
5. `./docs/ISA_VISUAL_BRANDING_ROADMAP.md`
6. `./docs/ISA_STRATEGIC_CONTEXT_SYNTHESIS.md`
7. `./PROJECT_SIZE_CLEANUP.md`
8. `./docs/ALERTING_SYSTEM_DESIGN.md`
9. `./tasks/for_chatgpt/CGPT-15_user_guide.md`
10. `./docs/MANUS_OPTIMIZATION_IMPLEMENTATION_SUMMARY.md`

## 3. Definitions

*See ISA_MASTER_SPEC.md*

## 4. Retrieval and Embeddings

*See [Retrieval and Embeddings](./retrieval-and-embeddings.md) for all definitions, rules, and gates related to embedding models and retrieval strategies.*

## 5. Database Governance

*See [Database Governance](./database-governance.md) for all definitions, rules, and gates related to database configuration, schema management, and data access.*

## 6. Normatieve Regels (Normative Rules)

| Regel-ID | Regel | Bron |
|---|---|---|
| AR-001 | Alle adviespublicaties MOETEN een handmatige beoordeling en goedkeuring door een Lane C-vertegenwoordiger ondergaan voordat ze worden gepubliceerd. Geautomatiseerde publicatie van adviezen is verboden. | `./ARCHITECTURE.md` > Data Limitations |
| AR-002 | Synchronisatie van de repository MOET plaatsvinden na een succesvolle merge naar de `main` branch. | `./ROADMAP_GITHUB_INTEGRATION.md` > Additional Triggers |
| AR-003 | Een onmiddellijke synchronisatie van de repository is vereist in geval van een gedetecteerd beveiligingsincident. | `./ROADMAP_GITHUB_INTEGRATION.md` > Emergency Sync |
| AR-004 | Alle integraties met derden (gegevensbronnen, API's, services) MOETEN het systematische evaluatiekader volgen dat is gedefinieerd in `INTEGRATIONS_RESEARCH_PROTOCOL.md`. | `./ROADMAP_GITHUB_INTEGRATION.md` > Integration Research Framework |
| AR-005 | Integratieonderzoek en -implementatie mogen de kernontwikkeling van ISA niet onderbreken of vertragen. | `./ROADMAP_GITHUB_INTEGRATION.md` > Non-Interruption Rule |

## 7. Kwaliteitspoorten (Gate Definitions)

| Poort-ID | Poortnaam | Trigger | Invoercriteria | Validatiestappen | Uitvoercriteria |
|---|---|---|---|---|---|
| AG-001 | GS1 Brand Compliance Gate | Voorafgaand aan een nieuwe productie-release. | Een release candidate met alle visuele componenten. | Verifieer dat het GS1-logo correct wordt weergegeven (indien vereist), met de juiste attributie, op alle relevante pagina's en componenten. | Succes als aan alle validatiestappen is voldaan; anders, falen. |
| AG-002 | MVP Feature Gate | Voorafgaand aan de MVP-release. | Een release candidate met alle MVP-features. | Verifieer dat alle als "kritiek" gemarkeerde features voor de MVP aanwezig en functioneel zijn. | Succes als alle kritieke features aanwezig en functioneel zijn; anders, falen. |

## 8. Interfaces / Pipelines

*See source documents.*

## 9. Governance & Change Control

1. Review source documents
2. Update TRACEABILITY_MATRIX.csv
3. Follow governance rules

## 10. Observability

**OPEN ISSUE:** Define observability hooks.

## 11. Acceptance Criteria

- AC-1: - Verify Lane C authorization
- AC-2: - **Tested:** Unit tests ensure correctness
- AC-3: **Solution:** Use `sort-keys` to ensure consistent JSON output.
- AC-4: **Recommendation:** ISA should have **two distinct navigation patterns**:
- AC-5: **Goal:** Complete the website, ensure legal compliance

## 12. Traceability Annex

*This section will be updated after the finalization of the new rules and gates.*
