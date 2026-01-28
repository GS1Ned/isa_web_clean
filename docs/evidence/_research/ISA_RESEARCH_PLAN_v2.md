# ISA Critical-Path Evaluation — Research Plan (v2)
Last verified: 2026-01-28

Objective: assemble complete, evidence-bound facts (repo + external) to validate the highest-quality, feasible ISA critical path before locking it.

## Phase 0 — Inventory & location control (DONE)
Artifacts already produced:
- CENSUS.json
- SUBDIR_SUMMARY.md
- LARGE_ASSETS.md
- ENTRYPOINTS.md
- DOC_AUTHORITY_MAP.md
- CRITICAL_FILES_CANDIDATES.md
- ISA_EXECUTION_MAP.md + EXEC_GRAPH.mmd

## Phase 1 — Close execution traces for all 5 primary journeys (DONE)
Deliverable:
- ISA_JOURNEY_TRACES_v1.md

Acceptance gate:
- Each journey has trace evidence across: UI → tRPC → server router → DB module → drizzle schema.

## Phase 2 — Architecture quality baseline (NEXT)
Deliverable:
- ISA_CURRENT_ARCHITECTURE_BRIEF_v0.md (evidence-bound, ≤300 lines)

Tasks:
- Confirm runtime entrypoints and wiring (server bootstrap + router registration)
- Confirm auth strategy (OAuth flow, middleware, session/token model)
- Confirm DB strategy (drizzle config, connection lifecycle, migrations)
- Confirm ingestion/extraction pipelines (scripts + schedulers)
- Confirm IRON enforcement touchpoints (workflows + scripts)

## Phase 3 — External benchmarking (NEXT)
Deliverable:
- ISA_EXTERNAL_BENCHMARK_NOTES_v1.md

Acceptance gate:
- Only official vendor docs and primary docs for frameworks; include publication dates when present; record “Last verified: 2026-01-28”.

## Phase 4 — Critical Path decision doc (after Phases 2–3)
Deliverable:
- ISA_CRITICAL_PATH_DECISION_v1.md

Inputs:
- ISA_JOURNEY_TRACES_v1.md
- ISA_CURRENT_ARCHITECTURE_BRIEF_v0.md
- ISA_EXTERNAL_BENCHMARK_NOTES_v1.md

Outputs:
- 2–3 options max
- clear acceptance tests
- explicit risks and mitigations
- cost controls (what NOT to scan with Manus)
