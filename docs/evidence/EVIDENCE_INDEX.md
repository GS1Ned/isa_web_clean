# ISA Evidence Index (Research Outputs)

Last verified: 2026-01-28

This folder contains the research artefacts produced outside the repo during the current ISA/IRON investigation.  
Goal: make handoff/commit to GitHub deterministic and avoid divergence between local downloads, Manus, and the repo.

## Canonical precedence rules (for these artefacts)
- If multiple versions exist, the highest suffix wins (v2 > v1 > v0).
- If a file is missing from this package, treat it as **UNKNOWN (not yet handed over)** and regenerate or re-export before merging.

## Recommended commit structure (single PR)
- docs/iron/ (IRON canon: protocol + governance + scope decisions + validation plan + knowledge map + risk register; plus enforcement files elsewhere)
- docs/evidence/ (these research outputs)
- docs/evidence/generated/_generated/ (rebuildable census/summaries)
- docs/evidence/_research/ (research plans)
- docs/evidence/_benchmarks/ (external benchmarking notes)

## Contents (this package)
### Core evidence artefacts
- `docs/evidence/ISA_EVIDENCE_PACK_v0.md` — Evidence pack summary + pointers
- `docs/evidence/ISA_ACCEPTANCE_CRITERIA_v1.md` — Completeness gates + acceptance criteria
- `docs/evidence/ISA_EXECUTION_MAP.md` — Execution mapping aligned to journeys
- `docs/evidence/DOC_AUTHORITY_MAP.md` — Authority classification (normative vs informative vs data)
- `docs/evidence/ENTRYPOINTS.md` — How ISA starts (client/server entrypoints)
- `docs/evidence/CRITICAL_FILES_CANDIDATES.md` — Candidate “critical files” list
- `docs/evidence/EXEC_GRAPH.mmd` — Mermaid execution graph

### Generated / rebuildable artefacts
- `docs/evidence/generated/_generated/CENSUS.json` — Machine census of repo snapshot
- `docs/evidence/generated/_generated/CENSUS_DIFF.md` — Inventory vs snapshot diffs
- `docs/evidence/generated/_generated/SUBDIR_SUMMARY.md` — Directory summary
- `docs/evidence/generated/_generated/LARGE_ASSETS.md` — Largest assets + classification

### Research planning and traces
- `docs/evidence/_research/ISA_RESEARCH_PLAN_v1.md` — Research plan v1
- `docs/evidence/_research/ISA_RESEARCH_PLAN_v2.md` — Research plan v2 (if present)
- `docs/evidence/ISA_JOURNEY_TRACES_v0.md` — Journey traces v0 (superseded by v1 if present)
- `docs/evidence/ISA_JOURNEY_TRACES_v1.md` — Journey traces v1 (if present)
- `docs/evidence/ISA_CURRENT_ARCHITECTURE_BRIEF_v0.md` — Current architecture brief (if present)

### External benchmarks and sources
- `docs/evidence/_benchmarks/ISA_EXTERNAL_BENCHMARK_NOTES_v2.md` — External benchmark notes v2
- `docs/evidence/_benchmarks/ISA_EXTERNAL_BENCHMARK_NOTES_v1.md` — v1 (if present)
- `docs/evidence/ISA_SOURCES_REGISTRY_v0.md` — Sources registry draft (GS1 Global/NL/EU + EFRAG non-negotiable)
- `docs/evidence/ISA_IRON_DOCSET_AND_CRITICAL_PATH_DECISION_DRAFT_v0.md` — Docset consolidation + critical path pre-decision draft

## Handoff checklist (before involving Manus)
1. Put these artefacts into the repo in one PR (no code changes).
2. Confirm IRON Gate passes.
3. Then ask Manus to operate **only** on repo paths (no re-upload needed).



## Version precedence
- Prefer the highest version noted in filenames (v2 > v1 > v0) when multiple variants exist.
- For journey traces, use `ISA_JOURNEY_TRACES_v1.md` as canonical.
- For research plan, use `ISA_RESEARCH_PLAN_v2.md` as canonical.
- For external benchmarks, use `ISA_EXTERNAL_BENCHMARK_NOTES_v2.md` as canonical; keep v1 as historical.


## Newly added in this package
- `docs/evidence/ISA_JOURNEY_TRACES_v1.md`
- `docs/evidence/_research/ISA_RESEARCH_PLAN_v2.md`
- `docs/evidence/_research/ISA_CURRENT_ARCHITECTURE_BRIEF_v0.md`
- `docs/evidence/_benchmarks/ISA_EXTERNAL_BENCHMARK_NOTES_v1.md`
