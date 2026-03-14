# ISA User Value Execution

Date: 2026-03-14
Current branch: `codex/ask-isa-v2-eval-reranking`
Base branch: `main`
Merged groundwork: `#326`, `#328`, `#329`, `#330`
Current PR: `#331`
Target branch: `main`

## 7. Execution Log

### Slice 1: Promote the richer Ask ISA route

- Objective: Make the smarter Ask ISA experience the default route while preserving a low-risk fallback path.
- Files changed: `client/src/App.tsx`, `client/src/pages/AskISAEnhanced.tsx`
- Implementation summary:
  - FACT: `/ask` now routes to `AskISAEnhanced`.
  - FACT: `/ask/classic` preserves the previous `AskISA` chat flow.
  - FACT: The new shell defaults to an expert reasoning tab and keeps advanced search and classic chat as explicit alternatives.
- Expected user-value gain:
  - INTERPRETATION: Users reach the stronger route without needing to discover an internal alternate surface.
- Expected intelligence gain:
  - INTERPRETATION: The product now exposes deeper structured reasoning by default instead of burying it behind the older flow.
- Validation:
  - FACT: `client/src/pages/AskISAEnhanced.test.tsx` verifies the new default route shell and the advanced-search knowledge-stats panel.
- Result: Completed

### Slice 2: Make `askISAV2` retrieval intent-aware and mapping-context aware

- Objective: Improve v2 answer quality by matching retrieval and prompt context to the question type.
- Files changed: `server/routers/ask-isa-v2.ts`, `server/routers/ask-isa-v2-intelligence.ts`, `server/routers/__tests__/ask-isa-v2-intent.test.ts`
- Implementation summary:
  - FACT: Added reusable intent helpers for query classification, retrieval planning, mapping-signal extraction, result merging, and authority-level mapping.
  - FACT: `askISAV2.enhancedSearch` now returns `queryIntent` and `retrievalStrategy`, and uses intent-aware defaults when explicit filters are absent.
  - FACT: `askISAV2.askEnhanced` now combines primary/fallback retrieval, recent-news augmentation, mapping-context lookup, canonical facts, authority/confidence summaries, and gap-analysis inference for gap-oriented questions.
- Expected user-value gain:
  - INTERPRETATION: Change, mapping, gap, and news questions should pull more relevant evidence with less user steering.
- Expected intelligence gain:
  - INTERPRETATION: Answers can now synthesize retrieved text with structured mapping signals and canonical facts instead of relying on generic retrieval alone.
- Validation:
  - FACT: `server/routers/__tests__/ask-isa-v2-intent.test.ts` verifies intent classification, ESRS extraction, retrieval plans, mapping signals, result dedupe, and authority mapping.
  - FACT: `server/hybrid-search.test.ts` remained green after the v2 changes.
- Result: Completed

### Slice 3: Expose trust and structured evidence on the main expert surface

- Objective: Make the smarter answer path legible and trustworthy to users.
- Files changed: `client/src/components/AskISAExpertMode.tsx`, `client/src/components/EnhancedSearchPanel.tsx`, `client/src/components/AuthorityBadge.tsx`, `client/src/components/AskISAExpertMode.test.tsx`
- Implementation summary:
  - FACT: Added an expert answer surface showing intent, retrieval strategy, confidence, authority, explainers, inline GS1 recommendations, gap snapshot, mapping context, canonical facts, and evidence sources.
  - FACT: Enhanced Search now surfaces intent and retrieval-strategy badges plus whether smart defaults or explicit filters are in effect.
  - FACT: Restored the missing React import in `AuthorityBadge.tsx` so the authority score panel renders safely under the current runtime/test setup.
- Expected user-value gain:
  - INTERPRETATION: Users can understand why the system answered the way it did and inspect the evidence shape without leaving `/ask`.
- Expected intelligence gain:
  - INTERPRETATION: The product feels more expert because evidence, structure, and applicability cues are visible instead of implicit.
- Validation:
  - FACT: `client/src/components/AskISAExpertMode.test.tsx` verifies the structured result surface and evidence cards.
- Result: Completed

### Slice 4: Repair live Ask ISA v2 retrieval and add scenario-eval-driven reranking

- Objective: Make Ask ISA v2 retrieve and order evidence correctly on real production-shaped scenarios before expanding the route further.
- Files changed:
  - `server/routers/ask-isa-v2.ts`
  - `server/routers/ask-isa-v2-retrieval.ts`
  - `server/db-esrs-gs1-mapping.ts`
  - `server/services/canonical-facts/index.ts`
  - `server/routers/__tests__/ask-isa-v2-retrieval.test.ts`
  - `scripts/eval/run-ask-isa-v2-scenario-eval.ts`
  - `data/evaluation/golden/ask_isa/scenario_cases_v2_live.json`
- Implementation summary:
  - FACT: Replaced the broken pgvector-only retrieval assumption with query embeddings plus JSONB cosine similarity over the live `knowledge_embeddings` pool.
  - FACT: Normalized live `source_type`, `authority_level`, and `semantic_layer` values into the Ask ISA v2 ranking taxonomy before filtering or reranking.
  - FACT: Added intent-aware reranking that rescues exact ESRS clause matches, promotes GS1 support for mapping prompts, and improves regulation-first ordering for change and applicability queries.
  - FACT: Added GS1 mapping candidate augmentation for ESRS mapping scenarios and a deterministic structured fallback answer to avoid blind abstention when exact ESRS and GS1 support both exist.
  - FACT: Added a six-scenario live eval suite for Ask ISA v2 and used it to compare legacy ranking versus the new reranking slice.
- Expected user-value gain:
  - INTERPRETATION: Users now get relevant evidence instead of empty or weakly ordered results on exact ESRS and GS1 mapping prompts.
- Expected intelligence gain:
  - INTERPRETATION: Ask ISA v2 now reasons over a more faithful evidence set, which improves correctness, applicability, and decision usefulness.
- Validation:
  - FACT: `server/routers/__tests__/ask-isa-v2-retrieval.test.ts` verifies exact ESRS rescue and GS1 promotion behavior.
  - FACT: `pnpm exec tsx scripts/eval/run-ask-isa-v2-scenario-eval.ts` improved the average score from `0.9167` to `1.0000`.
  - FACT: `ASK-V2-SCEN-004` and `ASK-V2-SCEN-005` now return non-abstaining answers with `12` sources and active mapping signals.
- Result: Completed

#### Slice 4 Before / After Highlights

| Scenario ID | Before | After | User-visible effect |
| ----------- | ------ | ----- | ------------------- |
| `ASK-V2-SCEN-004` | Generic ESRS neighbors outranked `E1-6_*` datapoints | Exact `E1-6_*` datapoints now lead the evidence set | Clause-specific ESRS questions are grounded in the correct disclosure cluster |
| `ASK-V2-SCEN-005` | Top-5 contained only `esrs_datapoint` results | Top-5 now includes `SSCC enables logistics emissions tracking for E1` as a `gs1_standard` support signal | Mapping questions now show both disclosure and implementation evidence |

## 8. Validation Results

| Check                                                       | Result              | Notes                                                                                   |
| ----------------------------------------------------------- | ------------------- | --------------------------------------------------------------------------------------- |
| Focused Ask ISA v2 Vitest suite                             | Pass                | `4` files, `29` tests passed                                                            |
| `server/hybrid-search.test.ts`                              | Pass                | Included in the focused suite to catch retrieval regressions                            |
| Touched-file compiler isolation                             | Pass                | `pnpm exec tsc --noEmit --pretty false` produced no matches for edited Ask ISA v2 files |
| `bash scripts/gates/doc-code-validator.sh --canonical-only` | Pass                | Canonical doc-code validator passed after runtime-contract and evidence updates          |
| `python3 scripts/validate_planning_and_traceability.py`     | Pass                | Canonical planning/traceability validator passed after evidence updates                  |
| `pnpm vitest run server/routers/__tests__/ask-isa-v2-intent.test.ts server/routers/__tests__/ask-isa-v2-retrieval.test.ts --reporter=verbose --no-coverage` | Pass | `20` tests passed for intent and reranking coverage |
| `pnpm exec tsx scripts/eval/run-ask-isa-v2-scenario-eval.ts` | Pass | Scenario suite improved from `0.9167` to `1.0000` |
| `pnpm exec tsx scripts/eval/probe-ask-isa-v2-runtime.ts` | Pass | Confirmed `jsonb` embeddings, no `vector` type, live taxonomy drift, and optional-table absence |
| `bash scripts/gates/canonical-contract-drift.sh`            | Pass after follow-up | Generated `repo_ref.commit` values refreshed to the active branch head so canonical drift stays clean |
| Repo-wide `pnpm check`                                      | Known baseline fail | Existing repo-wide TypeScript debt outside this slice                                   |
| Repo-wide `no-console` gate                                 | Known baseline fail | Existing `scripts/*.mjs` console usage outside this slice                               |

### Issues Encountered And Resolved

- FACT: The new expert-mode test initially failed on `streamdown` CSS loading under Vitest.
- FACT: The test harness was updated to mock `streamdown` rather than weakening component behavior.
- FACT: `AuthorityBadge.tsx` surfaced a real runtime/test issue because `AuthorityScore` rendered without a React import in the current environment.
- FACT: `AskISAEnhanced` and expert-mode tests required React 19-safe assertions because hooks/components can be invoked more than once during render.
- FACT: Touched-file type checking surfaced implicit `any` usage in the new page and iterator patterns that were not safe under the repo compiler target; both were corrected.
- FACT: The live `askISAV2` retrieval path was still assuming pgvector operators even though `knowledge_embeddings.embedding` is `jsonb` and the current Postgres environment does not expose the `vector` type.
- FACT: Current corpus metadata values did not match the v2 ranking/filter taxonomy, so `standard`, `regulation`, `normative`, and `juridical` rows needed normalization before intent-aware ranking would behave correctly.
- FACT: `hub_news` and `canonical_facts` are optional in the current environment and needed existence guards to avoid repeated query failures on the expert route.

## 9. Pull Request Readiness

- Branch name: `codex/ask-isa-v2-eval-reranking`
- Base branch: `main`
- Repository: `GS1Ned/isa_web_clean`
- Proposed PR title: `Add scenario-eval-driven Ask ISA v2 reranking`
- Proposed PR summary:
  - Add a live Ask ISA v2 scenario-eval suite covering regulation, GS1, ESRS clause, mapping, and traceability prompts.
  - Repair Ask ISA v2 retrieval for the current Postgres corpus by replacing pgvector-only assumptions with JSONB cosine scoring and metadata normalization.
  - Add targeted reranking so exact ESRS clauses and GS1 support signals surface correctly on mapping-heavy prompts.
  - Prevent avoidable Ask ISA v2 degradation when `hub_news` or `canonical_facts` are absent in the current environment.
- Check status:
  - FACT: Focused retrieval tests passed locally.
  - FACT: The live scenario-eval suite passed locally with a measured improvement from `0.9167` to `1.0000`.
  - FACT: Touched-file compiler isolation passed.
  - FACT: Canonical doc, planning, and contract drift gates passed locally after follow-up refresh.
  - FACT: PR `#330` for the route-promotion slice is already merged into `main`.
  - FACT: PR `#331` is open against `main` for the reranking/eval follow-up slice.
  - FACT: `no-console` remains a repo-wide baseline failure outside this slice.
- Merge / automerge status: Not enabled; GitHub had not yet reported check runs at PR creation time.

## 10. Unknowns And Next Improvements

### UNKNOWN-01

- UNKNOWN: Whether current v2 route behavior is already sufficient to retire the classic Ask ISA route after a short soak period.
- Why it matters: Keeping both routes indefinitely increases maintenance surface area.
- How to verify: Add route-level scenario evals and inspect runtime usage/feedback after the expert-first route ships.

### NEXT-01

- FACT: Completed in `scripts/eval/run-ask-isa-v2-scenario-eval.ts` and `data/evaluation/golden/ask_isa/scenario_cases_v2_live.json`.

### NEXT-02

- RECOMMENDATION: Inspect whether additional freshness/conflict-aware reranking is warranted now that v2 route evals exist.

### NEXT-03

- RECOMMENDATION: Run a separate repo-wide TypeScript and `no-console` cleanup program so branch readiness does not depend on touched-file filtering.
