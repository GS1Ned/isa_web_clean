# Document Value Scorecard (for Manus → ISA improvement)

Scoring: 1 (low) – 5 (very high)

| Document / Artefact | Value for Manus | Why it matters |
|---|---:|---|
| MANUS_HANDOFF.md | 5 | Defines exact work to do next, with hard gates and outputs. |
| data/corpus.json | 5 | ISA’s authoritative “what counts” baseline; drives every downstream step. |
| data/obligations.json | 5 | Legal traceability anchor; without evidence-grade obligations the mapping collapses. |
| data/atomic_requirements.json | 4 | Converts obligations into computable requirements; enables deterministic data derivation. |
| data/data_requirements.json | 4 | Turns law into data objects; directly connectable to GS1 solution space. |
| data/gs1_mapping.json | 4 | ISA-facing mapping layer; identifies where GS1 is strong vs optional vs irrelevant. |
| data/scoring.json | 3 | Prioritisation for roadmap; secondary to correctness of legal + mapping layers. |
| schemas/*.schema.json | 5 | Allows automation, CI validation, and prevents drift/regressions. |
| VALIDATION_REPORT.md | 5 | Evidence of completeness + flags remaining legal traceability gaps. |
| backlog.json | 4 | Converts improvements into executable work items with DoD + evidence needs. |
