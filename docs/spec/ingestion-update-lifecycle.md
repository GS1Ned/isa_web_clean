# Ingestion & Update Lifecycle

**Canonical Specification**
**Status:** CURRENT (as-built)

## 1. Identity

- **Name:** Ingestion & Update Lifecycle
- **Scope:** CURRENT state of ingestion & update lifecycle
- **Marker:** CURRENT (as-built) — not ULTIMATE

## 2. Core Sources

1. `./docs/CODEX_DELEGATION_SPEC.md`
2. `./docs/FILE_SYSTEM_MEMORY_ARCHITECTURE.md`
3. `./docs/PIPELINE_OBSERVABILITY_SPEC.md`
4. `./CHATGPT_UPDATE_PROMPT.md`
5. `./ROADMAP_GITHUB_INTEGRATION.md`
6. `./docs/GOVERNANCE_PHASE_2_3_REPORT.md`
7. `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md`
8. `./docs/ISA_WORKFLOW_IMPROVEMENTS.md`
9. `./todo.md`
10. `./CHATGPT_PROMPT_INGEST-03.md`

## 3. Definitions

*See ISA_MASTER_SPEC.md*

## 4. Retrieval and Embeddings

*See [Retrieval and Embeddings](./retrieval-and-embeddings.md) for all definitions, rules, and gates related to embedding models and retrieval strategies.*

## 5. Database Governance

*See [Database Governance](./database-governance.md) for all definitions, rules, and gates related to database configuration, schema management, and data access.*

## 6. Ingestion Regels (Ingestion Rules)

| Regel-ID | Regel | Bron |
|---|---|---|
| IR-001 | Elke nieuwe ingestion-module MOET een `README.md`-bestand bevatten met documentatie over de installatie, configuratie en het gebruik. | `./CHATGPT_UPDATE_PROMPT.md` > ❌ DON'T: |
| IR-002 | Integration research and implementation must not interrupt or delay core ISA development. | `./ROADMAP_GITHUB_INTEGRATION.md` > Non-Interruption Rule |
| IR-003 | All third-party integrations (data sources, APIs, services) must follow the systematic evaluation framework defined in `INTEGRATIONS_RESEARCH_PROTOCOL.md`. | `./ROADMAP_GITHUB_INTEGRATION.md` > Integration Research Framework |
| IR-004 | All outputs must conform to JSON schema. | `./docs/ISA_WORKFLOW_IMPROVEMENTS.md` > Action 1.2: Refactor Ingestion Prompts to 5-Block Structure |
| IR-005 | Citation completeness must be 100%. | `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md` > Phase 2: Ask ISA RAG System (Priority: ⭐⭐⭐⭐⭐) |

## 7. Kwaliteitspoorten (Gate Definitions)

| Poort-ID | Poortnaam | Trigger | Invoercriteria | Validatiestappen | Uitvoercriteria |
|---|---|---|---|---|---|
| IG-001 | Architectural Impact Review Gate | Voorafgaand aan de delegatie van een nieuwe ingestion-taak. | Een voorstel voor een nieuwe ingestion-taak. | Bevestig dat de voorgestelde taak geen wijzigingen in de kernarchitectuur vereist. | Succes als er geen architecturale wijzigingen nodig zijn; anders, falen en escaleren naar de architectuur-reviewboard. |
| IG-002 | Code Review Gate | Bij elke pull request naar de `main` branch die een ingestion-module wijzigt. | Een pull request met een of meer commits. | Een `CODEOWNER` MOET de pull request beoordelen en goedkeuren. | Succes als de pull request is goedgekeurd; anders, falen. |
| IG-003 | Critical Path Gate | Bij de start van een nieuwe fase in de `ISA_AUTONOMOUS_ROADMAP_V1`. | De start van een nieuwe fase. | Verifieer dat de afhankelijkheden van de fase zijn voltooid. | Succes als aan de afhankelijkheden is voldaan; anders, falen. |

## 8. Interfaces / Pipelines

*See source documents.*

## 9. Governance & Change Control

1. Review source documents
2. Update TRACEABILITY_MATRIX.csv
3. Follow governance rules

## 10. Observability

**OPEN ISSUE:** Define observability hooks.

## 11. Acceptance Criteria

- AC-1: **Review Checkpoint:** Verify exports, types, and test coverage before integration.
- AC-2: Write tests in `server/test-helpers/api-mocks.test.ts` to validate:
- AC-3: **Review Checkpoint:** Verify type compatibility with production code before merging.
- AC-4: Each component should:
- AC-5: 1. [ ] Verify task is self-contained and isolated

## 12. Traceability Annex

*This section will be updated after the finalization of the new ingestion rules and gates.*
