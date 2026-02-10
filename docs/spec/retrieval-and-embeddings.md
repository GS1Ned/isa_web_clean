# Retrieval and Embeddings Governance

**Canonical Specification**
**Status:** CURRENT (as-built)

## 1. Identity

- **Name:** Retrieval and Embeddings Governance
- **Scope:** Defines the rules, quality gates, and interfaces for all retrieval and embedding model interactions within the ISA project.
- **Marker:** CURRENT (as-built)

## 2. Core Sources

- `docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md`
- `docs/spec/isa-core-architecture.md`
- `docs/spec/data-knowledge-model.md`
- `docs/spec/governance-iron-protocol.md`

## 3. Definitions

*See ISA_MASTER_SPEC.md*

## 4. Retrieval and Embeddings Regels (Rules)

| Regel-ID | Regel | Bron |
|---|---|---|
| RE-RULE-001 | All embedding models MUST be version-controlled. | Inferred Best Practice |
| RE-RULE-002 | The choice of retrieval strategy MUST be justified and documented. | Inferred Best Practice |
| RE-RULE-003 | All retrieval and embedding operations MUST be logged for observability. | ISA_MANUS_PROJECT_GOVERNANCE.md |
| RE-RULE-004 | Het embedding model MOET configureerbaar zijn en de standaardwaarde MOET `text-embedding-ada-002` zijn. | `docs/spec/isa-core-architecture.md` |
| RE-RULE-005 | De retrieval strategie MOET een hybride aanpak ondersteunen, waarbij zowel keyword-based search als vector-based search wordt gecombineerd. | `docs/spec/data-knowledge-model.md` |

## 5. Kwaliteitspoorten (Gate Definitions)

| Poort-ID | Poortnaam | Trigger | Invoercriteria | Validatiestappen | Uitvoercriteria |
|---|---|---|---|---|---|
| RE-GATE-001 | Embedding Model Validation | `git push` to `main` | A new embedding model is introduced. | 1. The model is benchmarked against the existing model.<br>2. The model is tested for bias.<br>3. Verify that the new model is compatible with the existing infrastructure. | A successful validation report. |
| RE-GATE-002 | Retrieval Strategy Validation | `git push` to `main` | A new retrieval strategy is introduced. | 1. The strategy is benchmarked against the existing strategy.<br>2. The strategy is tested for performance.<br>3. Verify that the new strategy improves the accuracy of the search results. | A successful validation report. |

## 6. Interfaces / Pipelines

- **Model Training and Deployment Pipeline:** An automated pipeline for training, validating, and deploying new embedding models.

## 7. Governance & Change Control

1.  Any changes to this specification require a formal proposal and approval from the ISA Core Team.
2.  All changes must be documented in the `CONFLICT_REGISTER.md` if they introduce or resolve a conflict.

## 8. Observability

- All retrieval and embedding operations MUST be logged.
- Model performance metrics (e.g., accuracy, latency) MUST be monitored.

## 9. Acceptance Criteria

- All retrieval and embedding operations comply with the rules and gates defined in this specification.
- The embedding model is configurable.
- The retrieval strategy supports a hybrid approach.

## 10. Traceability Annex

*This section will be updated as new rules and gates are added.*
