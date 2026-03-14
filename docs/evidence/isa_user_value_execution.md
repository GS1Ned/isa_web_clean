# ISA User Value Execution

Date: 2026-03-14
Current branch: `codex/ask-isa-v2-decision-grade`
Base branch: `main`
Merged groundwork: `#326`, `#328`, `#329`, `#330`
Current PR: Pending creation for the decision-grade slice
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

### Slice 5: Make Ask ISA v2 more decision-grade on trust and gap-analysis prompts

- Objective: Improve authority-aware ranking, explicit decision basis, cautious confidence, and gap-trigger quality on realistic expert scenarios.
- Files changed:
  - `server/routers/ask-isa-v2.ts`
  - `server/routers/ask-isa-v2-retrieval.ts`
  - `server/routers/ask-isa-v2-intelligence.ts`
  - `server/routers/__tests__/ask-isa-v2-intent.test.ts`
  - `server/routers/__tests__/ask-isa-v2-retrieval.test.ts`
  - `client/src/components/AskISAExpertMode.tsx`
  - `client/src/components/AskISAExpertMode.test.tsx`
  - `scripts/eval/run-ask-isa-v2-scenario-eval.ts`
  - `data/evaluation/golden/ask_isa/scenario_cases_v2_live.json`
- Implementation summary:
  - FACT: Expanded the live eval suite from six to ten scenarios, adding fresh-vs-supporting source choice, plural gap wording, cautious-confidence mapping prompts, and useful full-coverage gap snapshots.
  - FACT: Fixed plural `gap`/`gaps` intent detection so natural gap questions classify into `GAP_ANALYSIS`.
  - FACT: Added provenance-aware reranking and decision metadata, including `authorityTier`, `publicationStatus`, `needsVerification`, `evidenceKey`, `evidenceRole`, and `selectionReasons`.
  - FACT: Pinned binding regulations ahead of GS1 implementation guidance for trust and gap-analysis prompts while retaining GS1 support as supporting evidence.
  - FACT: Added `decisionSummary` and `gapTrigger` payloads so the expert UI explains why a source was chosen and whether gap analysis was explicitly requested, auto-triggered, suppressed, or not relevant.
  - FACT: Calibrated mapping/gap confidence and uncertainty output so proxy-heavy or stale-evidence answers surface caution flags instead of overstating certainty.
- Expected user-value gain:
  - INTERPRETATION: Users get more decision-useful answers because the system now shows the binding basis, supporting implementation context, and gap-trigger posture explicitly.
- Expected intelligence gain:
  - INTERPRETATION: Ask ISA v2 now handles authority-sensitive and ambiguity-sensitive prompts more like an expert assistant and less like a semantic search wrapper.
- Validation:
  - FACT: `server/routers/__tests__/ask-isa-v2-retrieval.test.ts` now verifies trust-question regulation preference and gap-analysis regulation pinning.
  - FACT: `pnpm exec tsx scripts/eval/run-ask-isa-v2-scenario-eval.ts` on the expanded suite measured `legacy: 0.9167`, `current: 1.0000`, `answer: 0.6000`.
  - FACT: `ASK-V2-SCEN-007`, `ASK-V2-SCEN-008`, and `ASK-V2-SCEN-009` all improved to `1.0000`.
- Result: Completed

#### Slice 5 Before / After Highlights

| Scenario ID | Before | After | User-visible effect |
| ----------- | ------ | ----- | ------------------- |
| `ASK-V2-SCEN-007` | GS1 implementation guidance led the result set and gap analysis did not reliably auto-trigger on plural wording | EU Battery Regulation now leads, GS1 support stays adjacent, and gap analysis auto-triggers | Gap questions are now grounded in binding evidence instead of support guidance |
| `ASK-V2-SCEN-008` | GS1 DPP guidance outranked the binding delegated act and no decision summary explained the choice | Binding delegated act is primary, GS1 is supporting, and the expert UI shows the decision basis | Trust-sensitive prompts now explain which source is binding and why |
| `ASK-V2-SCEN-009` | Current-evidence mapping prompts could overstate certainty around stale/proxy support | Confidence is capped to low and caution flags are surfaced in the answer payload | Users get a more honest answer when evidence is only partially current or proxy-backed |

## 8. Validation Results

| Check                                                       | Result              | Notes                                                                                   |
| ----------------------------------------------------------- | ------------------- | --------------------------------------------------------------------------------------- |
| Focused Ask ISA v2 Vitest suite                             | Pass                | `4` files, `29` tests passed                                                            |
| `server/hybrid-search.test.ts`                              | Pass                | Included in the focused suite to catch retrieval regressions                            |
| Decision-grade Ask ISA v2 Vitest suite                      | Pass                | `3` files, `25` tests passed                                                            |
| Touched-file compiler isolation                             | Pass                | `pnpm exec tsc --noEmit --pretty false` produced no matches for edited Ask ISA v2 files |
| `bash scripts/gates/doc-code-validator.sh --canonical-only` | Pass                | Canonical doc-code validator passed after runtime-contract and evidence updates          |
| `python3 scripts/validate_planning_and_traceability.py`     | Pass                | Canonical planning/traceability validator passed after evidence updates                  |
| `pnpm vitest run server/routers/__tests__/ask-isa-v2-intent.test.ts server/routers/__tests__/ask-isa-v2-retrieval.test.ts --reporter=verbose --no-coverage` | Pass | `20` tests passed for intent and reranking coverage |
| `pnpm exec tsx scripts/eval/run-ask-isa-v2-scenario-eval.ts` | Pass | Expanded scenario suite measured `legacy: 0.9167`, `current: 1.0000`, `answer: 0.6000` |
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
- FACT: One expanded-scenario eval run transiently abstained on `ASK-V2-SCEN-004`, but a direct route call and a confirming second full eval both returned the expected grounded, non-abstaining answer; this is recorded as live-model variance rather than a routing regression.

## 9. Pull Request Readiness

- Branch name: `codex/ask-isa-v2-decision-grade`
- Base branch: `main`
- Repository: `GS1Ned/isa_web_clean`
- Proposed PR title: `Make Ask ISA v2 more decision-grade with eval-driven evidence ranking`
- Proposed PR summary:
  - Expand the live Ask ISA v2 scenario-eval suite to ten decision-grade prompts covering trust, cautious confidence, gap triggers, and useful gap snapshots.
  - Add provenance-aware reranking so binding regulations lead trust and gap-analysis prompts while GS1 guidance remains supporting context.
  - Return explicit decision-basis and gap-trigger payloads on the expert route and surface them in the UI.
  - Calibrate uncertainty and confidence when answers depend on stale or proxy evidence.
- Check status:
  - FACT: Focused retrieval tests passed locally.
  - FACT: The expanded live scenario-eval suite passed locally with a measured improvement from `0.9167` to `1.0000` and `0.6000` answer-quality coverage on the ten-scenario frontier.
  - FACT: Touched-file compiler isolation passed.
  - FACT: Canonical doc, planning, and contract drift gates passed locally after follow-up refresh.
  - FACT: PR `#330` for the route-promotion slice is already merged into `main`.
  - FACT: PR `#331` remains open against `main` for the prior reranking/eval slice that this branch builds on.
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

- RECOMMENDATION: Inspect whether additional freshness/conflict-aware reranking is warranted now that decision-grade v2 route evals exist.

### NEXT-03

- RECOMMENDATION: Run a separate repo-wide TypeScript and `no-console` cleanup program so branch readiness does not depend on touched-file filtering.
