# Program Plan

Date: 2026-03-14
Status: EXECUTED_FOR_ACTIVE_SLICE

## Prioritization Method

- FACT: Opportunities were scored 1-5 on user-value impact, intelligence upside, confidence, feasibility, time-to-value, strategic leverage, and risk.
- INTERPRETATION: After PRs `#326`, `#328`, and `#329`, the next highest-upside safe move was no longer another legacy `/ask` hardening tweak. It was promoting the richer `askISAV2` path to the primary route and then using live scenario evals to strengthen the v2 intelligence loop itself.
- RECOMMENDATION: Prefer route promotion and retrieval enrichment when the richer runtime already exists in-repo, has focused tests, and can be exposed with a classic fallback.

## Ranked Portfolio

| Rank | Opportunity                                                             | Rationale                                                                                              | Planned action                                                                                                                     | Status   |
| ---- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 1    | Scope Ask ISA cache correctly                                           | Wrong-context answers are a top trust breaker                                                          | Add sector-aware keys, bypass cache for conversation-scoped queries, keep cached payload parity                                    | Done     |
| 2    | Normalize confidence semantics                                          | `500% confidence` degrades trust and analytics quality                                                 | Replace raw source-count score with normalized score plus explicit `sourceCount`                                                   | Done     |
| 3    | Repair history loading                                                  | Repeated-use UX depends on reliable history retrieval                                                  | Move `trpc.useUtils()` to component scope                                                                                          | Done     |
| 4    | Fix similarity display inflation                                        | Overstated match percentages undermine source trust                                                    | Stop multiplying already-percent similarity values                                                                                 | Done     |
| 5    | Correct Gap Analyzer sector-scoped summary math                         | Non-general sectors could see understated coverage and inflated requirement counts                     | Count only the requirements actually evaluated and clarify the sector-scoped denominator in the UI                                 | Done     |
| 6    | Remove placeholder/dead-end timeline UX on live regulation detail pages | Visible `TODO` copy and an inert button reduce trust                                                   | Replace milestone fallback copy and remove the unwired timeline button                                                             | Done     |
| 7    | Refresh canonical contract metadata on the current PR branch            | Stale repo-ref metadata blocks the canonical drift gate even when the feature slice is otherwise ready | Update generated contract `repo_ref.commit` values before the final branch commit so local and PR-merge validation stay green      | Done     |
| 8    | Promote `askISAV2` to the primary `/ask` route with a classic fallback  | The richer Ask ISA runtime already existed but users were still defaulting into the legacy path        | Route `/ask` to `AskISAEnhanced`, preserve `/ask/classic`, and keep expert, search, and classic workflows reviewable               | Done     |
| 9    | Make `askISAV2` retrieval intent-aware and mapping-context aware        | V2 had deeper assets, but retrieval defaults and prompt assembly were still generic                    | Add intent-specific retrieval plans, mapping-context enrichment, authority/confidence summaries, and smarter gap-analysis triggers | Done     |
| 10   | Expose the intelligence gain directly in the UI                         | Intelligence only matters if users can see and steer it                                                | Add expert answer surface, retrieval-strategy badges, knowledge stats, and evidence/trust panels                                   | Done     |
| 11   | Add `/ask` parity eval coverage for the v2 route                        | Route promotion increases the need for measurable scenario coverage                                    | Add scenario evals and before/after comparisons for v2 expert flows                                                                | Done     |
| 12   | Repair live v2 retrieval drift and expand targeted reranking depth      | Material answer-quality gains remained blocked by runtime/schema drift and weak exact-match rescue     | Replace pgvector-only assumptions, normalize live metadata, and rerank exact ESRS / GS1 mapping scenarios                         | Done     |
| 13   | Expand Ask ISA v2 into a decision-grade route                           | The first v2 eval slice still left trust, cautious-confidence, and gap-trigger behavior under-specified | Expand the live eval suite, add authority-first reranking for trust/gap prompts, and expose decision-basis and gap-trigger posture | Done     |
| 14   | Expand Ask ISA v2 into freshness/conflict scenario evals and ranking policy | The decision-grade slice still left freshness/source-selection failures and weak explicit conflict posture | Add freshness/conflict scenarios, lexical recall rescue, delegated-act tie-breaks, and explicit evidence-choice summaries          | Done     |
| 15   | Expand broader conflict/freshness-aware reranking beyond current v2 plans | More upside remains, but it requires wider policy/runtime review than this slice                       | Defer until the new scenario suite is extended and conflict/freshness tradeoffs are measured                                       | Deferred |

## Execution Slices

### Slice A

- FACT: Cache safety and cache-hit response parity
- Files: `server/ask-isa-cache.ts`, `server/routers/ask-isa.ts`, `server/ask-isa-cache.test.ts`

### Slice B

- FACT: Confidence model normalization across runtime, UI, and analytics
- Files: `shared/ask-isa-confidence.ts`, `server/ask-isa-guardrails.ts`, `server/routers/ask-isa.ts`, `client/src/pages/AskISA.tsx`, `client/src/pages/AdminFeedbackDashboard.tsx`

### Slice C

- FACT: Ask ISA UX trust cleanup
- Files: `client/src/pages/AskISA.tsx`, `client/src/components/AskISAWidget.tsx`

### Slice D

- FACT: Gap Analyzer sector-scoped summary correction and UI trust copy
- Files: `server/routers/gap-analyzer.ts`, `server/routers/gap-analyzer.test.ts`, `client/src/pages/GapAnalyzer.tsx`, `client/src/pages/GapAnalyzer.test.tsx`

### Slice E

- FACT: Regulation timeline placeholder/dead-end cleanup on live regulation detail pages
- Files: `client/src/components/RegulationTimeline.tsx`, `client/src/components/RegulationTimeline.test.tsx`

### Slice F

- FACT: Canonical contract metadata refresh for the current Gap Analyzer PR branch
- Files: `docs/architecture/panel/_generated/CAPABILITY_MANIFEST.json`, `docs/architecture/panel/_generated/CAPABILITY_GRAPH.json`, `docs/architecture/panel/_generated/PRIMITIVE_DICTIONARY.json`, `docs/architecture/panel/_generated/EVIDENCE_INDEX.json`, `docs/architecture/panel/_generated/MINIMAL_VALIDATION_BUNDLE.json`, `docs/planning/refactoring/EXECUTION_STATE.json`

### Slice G

- FACT: `askISAV2` intelligence upgrade
- Files: `server/routers/ask-isa-v2.ts`, `server/routers/ask-isa-v2-intelligence.ts`, `server/routers/__tests__/ask-isa-v2-intent.test.ts`

### Slice H

- FACT: Expert-first `/ask` route exposure with classic fallback and retrieval transparency
- Files: `client/src/App.tsx`, `client/src/pages/AskISAEnhanced.tsx`, `client/src/components/AskISAExpertMode.tsx`, `client/src/components/EnhancedSearchPanel.tsx`, `client/src/components/AuthorityBadge.tsx`, `client/src/components/AskISAExpertMode.test.tsx`, `client/src/pages/AskISAEnhanced.test.tsx`

### Slice I

- FACT: Scenario-eval-driven retrieval repair and reranking for Ask ISA v2
- Files: `server/routers/ask-isa-v2.ts`, `server/routers/ask-isa-v2-retrieval.ts`, `server/db-esrs-gs1-mapping.ts`, `server/services/canonical-facts/index.ts`, `server/routers/__tests__/ask-isa-v2-retrieval.test.ts`, `scripts/eval/run-ask-isa-v2-scenario-eval.ts`, `data/evaluation/golden/ask_isa/scenario_cases_v2_live.json`

### Slice J

- FACT: Decision-grade Ask ISA v2 ranking and expert evidence posture
- Files: `server/routers/ask-isa-v2.ts`, `server/routers/ask-isa-v2-intelligence.ts`, `server/routers/ask-isa-v2-retrieval.ts`, `server/routers/__tests__/ask-isa-v2-intent.test.ts`, `server/routers/__tests__/ask-isa-v2-retrieval.test.ts`, `client/src/components/AskISAExpertMode.tsx`, `client/src/components/AskISAExpertMode.test.tsx`, `scripts/eval/run-ask-isa-v2-scenario-eval.ts`, `data/evaluation/golden/ask_isa/scenario_cases_v2_live.json`

### Slice K

- FACT: Freshness/conflict eval expansion, lexical retrieval rescue, and decision-basis fallback for Ask ISA v2
- Files: `server/routers/ask-isa-v2.ts`, `server/routers/ask-isa-v2-intelligence.ts`, `server/routers/ask-isa-v2-retrieval.ts`, `server/routers/__tests__/ask-isa-v2-intent.test.ts`, `server/routers/__tests__/ask-isa-v2-retrieval.test.ts`, `client/src/components/AskISAExpertMode.tsx`, `client/src/components/AskISAExpertMode.test.tsx`, `scripts/eval/run-ask-isa-v2-scenario-eval.ts`, `data/evaluation/golden/ask_isa/scenario_cases_v2_live.json`

## Validation Plan

1. FACT: Run focused Ask ISA v2 server/client tests plus `server/hybrid-search.test.ts`.
2. FACT: Run touched-file compiler isolation via `pnpm exec tsc --noEmit --pretty false` and filter for edited files.
3. FACT: Keep canonical doc/planning validation in scope after updating repo artifacts.
4. FACT: Run the live scenario-eval harness at `scripts/eval/run-ask-isa-v2-scenario-eval.ts` after reranking changes.
5. FACT: Re-run the live runtime probe at `scripts/eval/probe-ask-isa-v2-runtime.ts` when retrieval/runtime assumptions are part of the diagnosis.
6. RECOMMENDATION: Treat repo-wide `pnpm check` and repo-wide `no-console` debt as baseline cleanup programs unless the edited files contribute new failures.

## Deferred Next Steps

- FACT: Scenario eval coverage for `askISAV2.askEnhanced` now exists at `data/evaluation/golden/ask_isa/scenario_cases_v2_live.json`.
- FACT: Explicit freshness/conflict scenarios, lexical rescue, delegated-act tie-breaks, and deterministic decision-basis fallbacks are now implemented on the v2 route.
- RECOMMENDATION: Inspect whether `askEnhanced` should incorporate contradiction-aware summaries or stronger freshness/version conflict scoring now that the live frontier is broader.
- RECOMMENDATION: Run a separate repo-wide TypeScript and `no-console` cleanup program instead of folding that broad baseline work into the Ask ISA intelligence PR.
