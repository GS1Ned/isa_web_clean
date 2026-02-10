# Roadmap / Evolution

**Canonical Specification**
**Status:** CURRENT (as-built)

## 1. Identity

- **Name:** Roadmap / Evolution
- **Scope:** CURRENT state of roadmap / evolution
- **Marker:** CURRENT (as-built) — not ULTIMATE

## 2. Core Sources

1. `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md`
2. `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md`
3. `./todo.md`
4. `./tasks/CHATGPT_WORK_PLAN.md`
5. `./POC_EXPLORATION_TODO.md`
6. `./docs/templates/RECOMMENDATION_TEMPLATE.md`
7. `./timeline-test-results.md`
8. `./PHASE_9_DOCUMENTATION_INVENTORY.md`
9. `./docs/STATUS.md`

## 3. Definitions

*See ISA_MASTER_SPEC.md*

## 4. Roadmap Regels (Roadmap Rules)

| Regel-ID | Regel | Bron |
|---|---|---|
| RMR-001 | De volledigheid van citaten MOET worden gemeten en 100% zijn. | `./docs/ISA_AUTONOMOUS_ROADMAP_V1.md` > Phase 2: Ask ISA RAG System (Priority: ⭐⭐⭐⭐⭐) |
| RMR-002 | Alle uitspraken MOETEN traceerbaar zijn naar datasets, regelgeving of vergrendelde adviesartefacten. | `./docs/ISA_FUTURE_DEVELOPMENT_PLAN.md` > Strategic Priorities |

## 5. Kwaliteitspoorten (Gate Definitions)

| Poort-ID | Poortnaam | Trigger | Invoercriteria | Validatiestappen | Uitvoercriteria |
|---|---|---|---|---|---|
| RMG-001 | Schema Validation Gate | Voorafgaand aan een nieuwe data-ingestie. | Een nieuw databestand. | Valideer het databestand met Zod-schema's om de aanwezigheid van vereiste velden, URL-formaat en hash-formaat te controleren. | Succes als de validatie slaagt; anders, falen. |

## 6. Interfaces / Pipelines

*See source documents.*

## 7. Governance & Change Control

1. Review source documents
2. Update TRACEABILITY_MATRIX.csv
3. Follow governance rules

## 8. Observability

**OPEN ISSUE:** Define observability hooks.

## 9. Acceptance Criteria

- AC-1: - Validate all queries from ASK_ISA_QUERY_LIBRARY.md
- AC-2: - Validate diff against schema
- AC-3: **Objective:** Validate final ISA product against mission, anti-goals, and quality standards.
- AC-4: - Validate all 30 queries from Ask ISA Query Library
- AC-5: **Objective:** Ensure ISA is production-ready with monitoring, error recovery, and operational excellence.

## 10. Traceability Annex

*This section will be updated after the finalization of the new roadmap rules and gates.*
