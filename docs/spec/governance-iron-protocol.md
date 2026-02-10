# Governance & IRON Protocol

**Canonical Specification**
**Status:** CURRENT (as-built)

## 1. Identity

- **Name:** Governance & IRON Protocol
- **Scope:** CURRENT state of governance & iron protocol
- **Marker:** CURRENT (as-built) — not ULTIMATE

## 2. Core Sources

1. `./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md`
2. `./GOVERNANCE.md`
3. `./ISA_GOVERNANCE.md`
4. `./IRON_PROTOCOL.md`
5. `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md`
6. `./docs/PIPELINE_OBSERVABILITY_SPEC.md`
7. `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md`
8. `./docs/GOVERNANCE_PHASE_2_3_REPORT.md`
9. `./docs/evidence/ISA_IRON_DOCSET_AND_CRITICAL_PATH_DECISION_DRAFT_v0.md`
10. `./docs/governance/TEMPORAL_GUARDRAILS.md`

## 3. Definitions

*See ISA_MASTER_SPEC.md*

## 4. Retrieval and Embeddings

*See [Retrieval and Embeddings](./retrieval-and-embeddings.md) for all definitions, rules, and gates related to embedding models and retrieval strategies.*

## 5. Retrieval and Embeddings

*See [Retrieval and Embeddings](./retrieval-and-embeddings.md) for all definitions, rules, and gates related to embedding models and retrieval strategies.*

## 6. Database Governance

*See [Database Governance](./database-governance.md) for all definitions, rules, and gates related to database configuration, schema management, and data access.*

## 7. Governance Regels (Governance Rules)

| Regel-ID | Regel | Bron |
|---|---|---|
| GR-001 | Elke nieuwe ISA-taak MOET worden aangemaakt door de `ISA_ROOT_RUNTIME_TASK` (Taak-ID: `XsS2SbpYk0TBf9gWDsxsiX`) voort te zetten. Het aanmaken van "lege" taken voor ISA-werk is verboden. | `./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md` > 6. Task Creation and Continuation Rules |
| GR-002 | De `ISA_ROOT_RUNTIME_TASK` mag niet worden verwijderd, gearchiveerd, gedupliceerd of vervangen. | `./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md` > 4.3 Immutability Rules |
| GR-003 | Alle configuratie-aannames MOETEN worden gedocumenteerd. | `./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md` > 2. Governance Principles |
| GR-004 | Elke niet-root taak moet veilig kunnen worden verwijderd zonder verlies van configuratie. | `./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md` > 2. Governance Principles |
| GR-005 | De AI-agent MOET alle potentieel impactvolle beslissingen escaleren naar de gebruiker (Lane C). | `./GOVERNANCE.md` > Lane C: User-Decision Mode (ACTIVE) |
| GR-006 | Stilte van de gebruiker is GEEN toestemming; expliciete goedkeuring is vereist voor Lane C-triggers. | `./GOVERNANCE.md` > Red-Line Principles (Inviolable) |

## 8. Kwaliteitspoorten (Gate Definitions)

| Poort-ID | Poortnaam | Trigger | Invoercriteria | Validatiestappen | Uitvoercriteria |
|---|---|---|---|---|---|
| GG-001 | IRON Gate | Bij elke pull request naar de `main` branch. | Een pull request met een of meer commits. | Voer de `iron-gate.yml` CI-workflow uit om te valideren dat de pull request voldoet aan alle IRON Protocol-vereisten (bijv. context-acknowledgement, context-freshness, inventory-integrity). | Succes als de `iron-gate.yml` workflow slaagt; anders, falen. |
| GG-002 | Lane C Escalation Gate | Wanneer een Lane C-trigger wordt gedetecteerd. | Een actie of beslissing die voldoet aan de Lane C-criteria. | Verifieer dat de AI-agent het verplichte escalatieformaat gebruikt en wacht op expliciete goedkeuring van de gebruiker. | Succes als de escalatie correct wordt afgehandeld en goedgekeurd; anders, falen. |

## 9. Interfaces / Pipelines

*See source documents.*

## 10. Governance & Change Control

1. Review source documents
2. Update TRACEABILITY_MATRIX.csv
3. Follow governance rules

## 11. Observability

**OPEN ISSUE:** Define observability hooks.

## 12. Acceptance Criteria

- AC-1: - Validate claims of completeness, compliance, or currency
- AC-2: - Recommend governance mode transitions when appropriate
- AC-3: - Recommend governance improvements
- AC-4: 3. Run full validation suite (`validate-esg-artefacts.mjs`)
- AC-5: 3.  The `iron-gate` CI check will validate compliance.

## 13. Traceability Annex

*This section will be updated after the finalization of the new governance rules and gates.*

| GR-007 | Documenten die binnen taken worden gemaakt, MOETEN worden geëxporteerd naar de `docs/` directory in de repository. | `./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md` > 10. Manus Task Document Exports |
| GR-008 | Als een vereiste variabele ontbreekt, MOET de AI-agent pauzeren en dit rapporteren. Een menselijke tussenkomst is vereist. | `./docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md` > 7. External Trust Boundaries |
| GR-009 | De AI-agent MOET governance self-checks uitvoeren zoals vereist door de `ISA_GOVERNANCE.md` specificatie. | `./ISA_GOVERNANCE.md` > Governance Self-Checks |
| GR-010 | Bij een governance-overtreding MOET de AI-agent de overtreding onmiddellijk stoppen, rapporteren aan de gebruiker en een corrigerende actie voorstellen. | `./ISA_GOVERNANCE.md` > Violation Protocol |
