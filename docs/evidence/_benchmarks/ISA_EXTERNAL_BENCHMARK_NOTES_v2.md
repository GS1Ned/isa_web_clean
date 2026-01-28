# ISA_EXTERNAL_BENCHMARK_NOTES_v2
Last verified: 2026-01-28

Purpose: curated external reference points (authoritative, current) to benchmark ISA’s:
- grounding and evidence binding
- RAG pipeline design
- evaluation (offline + online)
- agent governance and “stop conditions”
- document/dataset catalog patterns

## 1) Evaluation frameworks (must-have for ISA critical path)

- OpenAI Evals (open-source eval framework + registry of evals) — GitHub `openai/evals`
- OpenAI “Working with evals” guide (API docs)
- OpenAI cookbook “Getting Started with OpenAI Evals”
- LangSmith Evaluation (datasets + evaluators + online monitoring)
- RAGAS (open-source RAG evaluation framework)
- Haystack “Evaluating RAG Pipelines” tutorial (retrieval + faithfulness metrics)
- OpenEvals (LangChain evaluators package; readymade evaluators)

ISA implication:
- ISA should treat evals as first-class artefacts alongside corpus/obligations/mappings.
- A “golden set” of questions + expected citations should exist per journey.

## 2) Document/catalog governance patterns

- DataHub / OpenMetadata-style separation of:
  - metadata registry
  - lineage / provenance
  - version history
  - ownership and responsibility

ISA implication:
- treat every document/dataset as a canonical record with version, status, last_verified, and retrieval method.

## 3) Regulatory source harvesting patterns (EU)

- Prefer official EU endpoints (CELLAR/EUR-Lex APIs) for legal texts and metadata.
- Keep a diff-based change log and trigger re-computation of derived artefacts only when relevant fields change.

ISA implication:
- “change detection → recompute pipeline” must be deterministic and testable.

## 4) Agent governance patterns

- Convert “skills” into testable units (agent capabilities become evals).
- Enforce explicit stop conditions when evidence conflicts or scope is unknown.

ISA implication:
- IRON CONFLICT + scope decisions should be mechanically enforced and visible.

