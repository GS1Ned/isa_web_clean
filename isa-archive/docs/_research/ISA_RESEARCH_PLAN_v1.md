# ISA Critical-Path Evaluation — Research Plan (v1)

Last verified: 2026-01-28

This plan is optimized for:
- high completeness (avoid missing key repo knowledge),
- low overhead (deterministic first, LLM second),
- evidence binding (repo paths + external citations).

---

## Phase 0 — Inventory & location control (DONE in this workspace)

Artefacts:
- `CENSUS.json` (repo-wide counts)
- `SUBDIR_SUMMARY.md` (top-level directory summary)
- `LARGE_ASSETS.md` (large files)
- `ENTRYPOINTS.md` (entrypoints)
- `DOC_AUTHORITY_MAP.md` (doc authority tiers)
- `CRITICAL_FILES_CANDIDATES.md` (candidate critical files)
- `ISA_EXECUTION_MAP.md` + `EXEC_GRAPH.mmd` (initial execution graph)

Acceptance gate: satisfies items A1–A3 of `ISA_ACCEPTANCE_CRITERIA_v1.md`.

---

## Phase 1 — Close execution traces for all 5 primary journeys (NEXT)

Goal: turn “candidate” maps into fully traceable chains:
UI → client → tRPC → server → DB modules → schema tables.

Method (deterministic):
1. From `client/src/App.tsx`, list routes for each journey.
2. For each page, grep for `trpc.*` usage; record procedures.
3. Locate the procedure definitions in `server/routers/*.ts` and `server/routers.ts`.
4. Follow imports to DB modules (e.g., `server/db*.ts`) and then to `drizzle/schema.ts`.
5. Record line-ranged evidence for each hop.

Deliverable: `ISA_JOURNEY_TRACES_v1.md` (with all UNKNOWNs closed).

---

## Phase 2 — Architecture quality baseline (repo evidence)

Goal: establish “current architecture” as ground truth.

Tasks:
- Identify runtime entrypoints, server wiring, auth middleware, DB connection strategy, ingestion runners.
- Identify “immutability boundaries” vs mutable operational data.
- Extract operational gates: CI workflows and governance enforcement.

Deliverable: `ISA_CURRENT_ARCHITECTURE_BRIEF_v0.md` (evidence-bound, <300 lines).

---

## Phase 3 — External benchmarking (currency-verified)

Goal: compare ISA’s approach against current best practices for:
- RAG evaluation and continuous validation,
- agent/tool design and context engineering,
- grounding and citation/verification techniques.

Initial authoritative sources to anchor:
- OpenAI Evals guide and API reference. (verified 2026-01-28) citeturn0search0turn0search4
- OpenAI open-source Evals framework. (verified 2026-01-28) citeturn0search1turn0search2
- Anthropic engineering guidance on tool-writing and context engineering for agents. (verified 2026-01-28) citeturn0search5turn0search9
- RAGAS docs and LangSmith RAG evaluation tutorial. (verified 2026-01-28) citeturn0search7turn0search15
- Google/Vertex grounding documentation (for “freshness” and citations). (verified 2026-01-28) citeturn0search6

Deliverable: `ISA_EXTERNAL_BENCHMARK_NOTES_v0.md` (short, evidence + links, with “what to adopt” bullets).

---

## Phase 4 — Critical Path decision doc (after Phases 1–3)

Goal: pick the “highest-leverage, lowest-risk” development sequence aligned with Manus + IRON.

Inputs:
- Current execution traces (Phase 1)
- Current architecture brief (Phase 2)
- Benchmark adoption candidates (Phase 3)

Deliverable: `ISA_CRITICAL_PATH_DECISION_v1.md` (options + rationale + acceptance tests + risks).

