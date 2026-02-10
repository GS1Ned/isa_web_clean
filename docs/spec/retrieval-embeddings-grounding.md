# Retrieval / Embeddings / Grounding

**Canonical Specification**
**Status:** CURRENT (as-built)

## 1. Identity

- **Name:** Retrieval / Embeddings / Grounding
- **Scope:** CURRENT state of retrieval / embeddings / grounding
- **Marker:** CURRENT (as-built) — not ULTIMATE

## 2. Core Sources

1. `./docs/architecture/ISA_ULTIMATE_ARCHITECTURE.md`
2. `./docs/ultimate_architecture_docs/ISA_ULTIMATE_ARCHITECTURE.md`
3. `./ISA_CAPABILITY_MAP.md`
4. `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md`
5. `./docs/ENHANCED_EMBEDDING_SCHEMA.md`
6. `./research/ASK_ISA_IMPLEMENTATION_PLAN.md`
7. `./docs/ISA_COMPARATIVE_REFACTOR_GATE_PLAN.md`
8. `./docs/evidence/_benchmarks/ISA_EXTERNAL_BENCHMARK_NOTES_v1.md`
9. `./research/ASK_ISA_ANALYSIS_REPORT.md`
10. `./AUTONOMOUS_DEVELOPMENT_SUMMARY.md`

## 3. Definitions

*See ISA_MASTER_SPEC.md*

## 4. Retrieval and Embeddings

*See [Retrieval and Embeddings](./retrieval-and-embeddings.md) for all definitions, rules, and gates related to embedding models and retrieval strategies.*

## 5. Database Governance

*See [Database Governance](./database-governance.md) for all definitions, rules, and gates related to database configuration, schema management, and data access.*

## 6. Retrieval Regels (Retrieval Rules)

| Regel-ID | Regel | Bron |
|---|---|---|
| RR-001 | Nieuwe systemen MOETEN monitoring, logging, foutafhandeling en runbooks bevatten voordat ze in productie worden genomen. | `./ISA_CAPABILITY_MAP.md` > Principle 3: Start Simple, Add Complexity Judiciously |
| RR-002 | Alle JSON-serialisatie in de data-pipeline MOET deterministisch zijn door een stabiele sleutelvolgorde te gebruiken. | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` > 1.1 The KV-Cache Imperative |
| RR-003 | De context MOET alleen-toevoegen zijn; agent-loops mogen de context nooit overschrijven of verwijderen. | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` > 3. Make context append-only |
| RR-004 | Cache-breekpunten MOETEN expliciet worden gemarkeerd. | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` > 4. Mark cache breakpoints explicitly |
| RR-005 | Mislukte ingestion-pogingen MOETEN in de context blijven. | `./docs/MANUS_BEST_PRACTICES_FOR_ISA.md` > 1. Leave failed ingestion attempts in context |

## 7. Kwaliteitspoorten (Gate Definitions)

| Poort-ID | Poortnaam | Trigger | Invoercriteria | Validatiestappen | Uitvoercriteria |
|---|---|---|---|---|---|
| RG-001 | Baseline Performance Gate | Voorafgaand aan de deployment van een nieuwe prompt. | Een nieuwe prompt en de bijbehorende evaluatiemetrieken. | Verifieer dat de RAG-precisie van de nieuwe prompt ≥ 85% is. | Succes als de prestatie de baseline overtreft; anders, falen. |
| RG-002 | Verification Gate | Na elke data-transformatie. | Getransformeerde data. | Verifieer dat aan de post-condities (bijv. "Alle ESRS-datapunten moeten een geldige datapointId hebben") is voldaan. | Succes als aan de post-condities is voldaan; anders, falen en escaleren. |

## 8. Interfaces / Pipelines

*See source documents.*

## 9. Governance & Change Control

1. Review source documents
2. Update TRACEABILITY_MATRIX.csv
3. Follow governance rules

## 10. Observability

**OPEN ISSUE:** Define observability hooks.

## 11. Acceptance Criteria

- AC-1: - Build PDF processing pipeline (upload → parse → validate → store)
- AC-2: - **Mitigation:** Validate graph query value with simpler property graph (Domain 3A only) before adding GNN and reasoning layers
- AC-3: Given the breadth of capability options explored above, this section provides a decision framework to guide which approaches to validate first based o
- AC-4: Each exploration phase should have clear success criteria and off-ramps to avoid sunk cost fallacy.
- AC-5: As ISA explores next-generation capabilities, certain architectural principles and constraints should guide implementation decisions to ensure the pla

## 12. Traceability Annex

*This section will be updated after the finalization of the new retrieval rules and gates.*
