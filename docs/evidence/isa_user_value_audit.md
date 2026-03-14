# ISA User Value Audit

Date: 2026-03-14
Branch: `codex/ask-isa-v2-decision-grade`
Status: VALIDATED_LOCAL_CHANGES

## 1. Executive Summary

- FACT: `/ask` now routes to `client/src/pages/AskISAEnhanced.tsx`, while the legacy chat path remains available at `/ask/classic`. Evidence: `client/src/App.tsx`.
- FACT: `askISAV2` already existed in-repo, but the primary user route was not exposing it and key intelligence helpers such as mapping-context enrichment were not active on the main answer path. Evidence: `server/routers/ask-isa-v2.ts`, `client/src/pages/AskISAEnhanced.tsx`, `server/routers/ask-isa-v2-intelligence.ts`.
- FACT: Ask ISA v2 now has a ten-scenario live eval harness plus decision-grade ranking logic that prefers binding regulation evidence for trust and gap-analysis prompts while exposing explicit decision basis and gap-trigger posture to the user. Evidence: `data/evaluation/golden/ask_isa/scenario_cases_v2_live.json`, `scripts/eval/run-ask-isa-v2-scenario-eval.ts`, `server/routers/ask-isa-v2-retrieval.ts`, `server/routers/ask-isa-v2.ts`, `client/src/components/AskISAExpertMode.tsx`.
- INTERPRETATION: The highest-upside improvement was to promote the richer v2 runtime and deepen its retrieval/grounding behavior, rather than keep adding narrow fixes to the legacy `/ask` route.
- RECOMMENDATION: Keep the classic fallback route until v2 scenario eval coverage is broader and the remaining freshness/conflict frontier is measured.

## 2. Repository-Derived Product Model

### Main subsystems

- FACT: ASK_ISA spans `askISA`, `askISAV2`, and `evaluation` routers with the knowledge base and ESRS mapping capabilities as its evidence/decision backplane.
- FACT: The primary Ask ISA user surfaces are now:
  - `/ask` -> `client/src/pages/AskISAEnhanced.tsx`
  - `/ask/classic` -> `client/src/pages/AskISA.tsx`
  - `client/src/components/AskISAExpertMode.tsx`
  - `client/src/components/EnhancedSearchPanel.tsx`

### Current answer flow

1. FACT: The expert surface calls `trpc.askISAV2.askEnhanced.useMutation()`.
2. FACT: `askISAV2.askEnhanced` now performs query-intent classification, intent-aware retrieval planning, optional recent-news augmentation, structured mapping-context lookup, canonical-facts lookup, Stage-A validation, and structured answer packaging.
3. FACT: The legacy chat surface remains reachable at `/ask/classic` and still uses `trpc.askISA.ask`.

### Retrieval and grounding flow

1. FACT: `askISAV2` uses embedding-driven retrieval from `knowledge_embeddings`.
2. FACT: Retrieval defaults are now intent-specific for source type, semantic layer, and authority posture.
3. FACT: Mapping-sensitive flows can now add structured regulation/ESRS/GS1 context to the prompt before generation.

### UI and navigation flow

1. FACT: The Ask ISA landing page now exposes expert reasoning, advanced search, and classic chat as explicit tabs.
2. FACT: Advanced search now shows detected intent and retrieval-strategy labels.
3. FACT: The expert answer surface now shows structured context, authority/confidence, inline GS1 recommendations, canonical facts, gap summary, and evidence sources.

### Key bottlenecks

- FACT: Route-level scenario eval coverage now exists at ten live cases, including trust, cautious-confidence, and gap-trigger scenarios.
- FACT: Live answer-eval runs still have some model variance; a transient abstention appeared once on `ASK-V2-SCEN-004`, while the direct rerun and a confirming second full eval both returned the expected grounded answer.
- FACT: Repo-wide `pnpm check` and repo-wide `no-console` debt remain outside this slice.
- INTERPRETATION: The product intelligence layer improved materially, but branch confidence still depends on focused test evidence rather than a fully clean global baseline.

## 3. Current Capacity Analysis

| Capacity ID | Current capacity                                                                                                                        | Evidence                                                                                                                                            | User relevance | Confidence | Notes                                                                    |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ---------- | ------------------------------------------------------------------------ |
| CAP-01      | `/ask` now exposes expert reasoning, advanced evidence search, and classic fallback                                                     | `client/src/App.tsx`; `client/src/pages/AskISAEnhanced.tsx`                                                                                         | High           | High       | Primary Ask ISA route changed materially                                 |
| CAP-02      | `askISAV2.askEnhanced` now returns intent, retrieval profile, mapping context, confidence, authority, facts, decision summary, and gap-trigger enrichment | `server/routers/ask-isa-v2.ts`; `server/routers/ask-isa-v2-retrieval.ts`                                                                            | High           | High       | Users get deeper structured output instead of a thin answer-only payload |
| CAP-03      | `askISAV2.enhancedSearch` applies smart retrieval defaults and exposes retrieval strategy                                               | `server/routers/ask-isa-v2.ts`; `client/src/components/EnhancedSearchPanel.tsx`                                                                     | High           | High       | Makes the retrieval layer inspectable                                    |
| CAP-04      | Expert UI now exposes trust signals and evidence panels directly on the main route                                                      | `client/src/components/AskISAExpertMode.tsx`; `client/src/components/AuthorityBadge.tsx`                                                            | High           | High       | Improves perceived intelligence and trust                                |
| CAP-05      | Focused server/client coverage plus a ten-scenario live Ask ISA v2 eval suite now exist                                                 | `server/routers/__tests__/ask-isa-v2-intent.test.ts`; `server/routers/__tests__/ask-isa-v2-retrieval.test.ts`; `scripts/eval/run-ask-isa-v2-scenario-eval.ts` | High           | High       | Coverage now includes trust, cautious-confidence, and gap-trigger behavior |

## 4. User Value Framework

| Dimension           | Definition                                                             | Current state           | Why it matters                                                                                  | Evidence                                                                                         |
| ------------------- | ---------------------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Answer depth        | Ability to explain applicability, mappings, and next-step implications | Improved                | Expert outputs now include mapping context, explainers, gap summary, and inline recommendations | `server/routers/ask-isa-v2.ts`; `client/src/components/AskISAExpertMode.tsx`                     |
| Retrieval relevance | Ability to pull the right evidence set for the question type           | Improved                | Intent-aware retrieval defaults reduce generic one-size-fits-all retrieval                      | `server/routers/ask-isa-v2-intelligence.ts`; `server/routers/ask-isa-v2.ts`                      |
| Trustworthiness     | Visibility into why the answer should be believed                      | Improved                | Confidence, authority, evidence cards, and canonical facts are surfaced directly                | `client/src/components/AskISAExpertMode.tsx`; `client/src/components/AuthorityBadge.tsx`         |
| Discovery           | Ease of reaching the smarter path                                      | Improved                | `/ask` now lands on the expert-first shell instead of only the legacy chat                      | `client/src/App.tsx`; `client/src/pages/AskISAEnhanced.tsx`                                      |
| Regression safety   | Ability to prove the intelligence change still works                   | Improved                | Focused tests and a live ten-scenario eval suite now exist, though broader scenario expansion is still valuable | `server/routers/__tests__/ask-isa-v2-intent.test.ts`; `server/routers/__tests__/ask-isa-v2-retrieval.test.ts`; `scripts/eval/run-ask-isa-v2-scenario-eval.ts` |

## 5. Opportunity Inventory

| Opportunity ID | Title                                                 | Category                          | User benefit                                                                   | Effort | Risk | Impact | Time-to-value | Dependencies                      | Score | Evidence                                                                    |
| -------------- | ----------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------ | ------ | ---- | ------ | ------------- | --------------------------------- | ----- | --------------------------------------------------------------------------- |
| OPP-01         | Promote `askISAV2` to the primary `/ask` route        | Discovery / intelligence exposure | Users reach the stronger Ask ISA flow by default                               | 3      | 2    | 5      | 5             | Existing v2 UI/runtime            | 33    | `client/src/App.tsx`; `client/src/pages/AskISAEnhanced.tsx`                 |
| OPP-02         | Make v2 retrieval intent-aware                        | Retrieval quality                 | Better candidate selection for change, mapping, gap, and news questions        | 3      | 2    | 5      | 4             | Existing embeddings/search path   | 32    | `server/routers/ask-isa-v2-intelligence.ts`; `server/routers/ask-isa-v2.ts` |
| OPP-03         | Activate mapping-context enrichment in expert answers | Answer depth                      | Stronger cross-linking between regulations, ESRS datapoints, and GS1 standards | 3      | 2    | 5      | 4             | Existing `getMappingContext()`    | 31    | `server/routers/ask-isa-v2.ts`                                              |
| OPP-04         | Expose expert trust and evidence panels               | UX / trust                        | Makes the intelligence gain legible to users                                   | 2      | 1    | 4      | 5             | Existing source/confidence models | 31    | `client/src/components/AskISAExpertMode.tsx`                                |
| OPP-05         | Add route-level v2 scenario evals                     | Evaluation                        | Raises confidence in the new default route                                     | 3      | 2    | 4      | 3             | Eval fixture design               | 27    | `data/evaluation/golden/ask_isa/scenario_cases_v2_live.json`; `scripts/eval/run-ask-isa-v2-scenario-eval.ts` |
| OPP-06         | Expand targeted reranking for exact ESRS and GS1 mapping scenarios | Retrieval / synthesis             | Improves correctness and applicability on the highest-value weak cases          | 3      | 2    | 5      | 4             | Scenario diagnostics              | 30    | `server/routers/ask-isa-v2-retrieval.ts`; `server/routers/ask-isa-v2.ts`    |

## 6. Chosen Implementation Portfolio

### Selected

- FACT: Selected OPP-01 through OPP-04.
- INTERPRETATION: These four items compound: they improve what `askISAV2` does, make the product route users into that stronger path, and expose why the new behavior is smarter.

### Deferred

- FACT: Route-level v2 scenario evals and targeted reranking improvements are now implemented in the current branch.
- FACT: Broader freshness/conflict-resolution reranking is still deferred.
- INTERPRETATION: The next frontier now moves beyond measurement scaffolding into broader policy work on conflict handling and freshness.

## 6A. 2026-03-14 Ask ISA v2 Follow-Up

- FACT: The live Ask ISA v2 retrieval path was still assuming pgvector semantics even though the current corpus stores `knowledge_embeddings.embedding` as `jsonb` and the `vector` type is unavailable.
- FACT: The live corpus taxonomy also drifted from v2 assumptions, with `standard`/`regulation`/`normative`/`juridical` values needing normalization before ranking and filtering behaved as intended.
- FACT: A ten-scenario live eval suite now exists and improved from a `0.9167` legacy average to a `1.0000` reranked average, with a confirmed answer-quality average of `0.6000` on the expanded decision-grade checks.
- INTERPRETATION: The biggest remaining user-value limiter after the route promotion slice was real retrieval fidelity, not UI structure.

### 6A.1 Current Ask ISA v2 Intelligence Model

- FACT: `askISAV2.askEnhanced` classifies intent, retrieves evidence, optionally enriches with mapping context and canonical facts, applies Stage-A validation, and returns a structured payload to the expert route.
- FACT: `server/routers/ask-isa-v2-retrieval.ts` is now the shared retrieval seam for both `askISAV2.enhancedSearch` and `askISAV2.askEnhanced`.
- FACT: The retrieval layer now generates a query embedding, loads the live `knowledge_embeddings` pool, scores cosine similarity in application code, normalizes metadata, and reranks results by intent plus decision-grade provenance signals.
- FACT: The returned payload now includes `decisionSummary`, `gapTrigger`, source-level `evidenceRole`, `sourceRole`, `authorityTier`, `publicationStatus`, and `selectionReasons`.
- INTERPRETATION: Ask ISA v2 is no longer dependent on one storage-specific vector operator to produce grounded answers.

### 6A.2 Scenario Suite

| Scenario ID | User question | Expected intent | What success looks like | Main failure modes |
| ----------- | ------------- | --------------- | ----------------------- | ------------------ |
| `ASK-V2-SCEN-001` | What changed in ESPR for Digital Product Passports? | `REGULATORY_CHANGE` | ESPR regulation in top results with regulation-first ordering | `zero_results`, `missing_espr_regulation`, `no_regulation_in_top_results` |
| `ASK-V2-SCEN-002` | Which GS1 identifiers are relevant for a Digital Product Passport? | `ESRS_MAPPING` | GS1-first ordering and GS1 support coverage | `no_gs1_standard_in_top_results`, `regulation_only_answer_context` |
| `ASK-V2-SCEN-003` | What regulation applies to deforestation due diligence? | `GENERAL_QA` | `EUDR` preferred as top regulation | `wrong_regulation_top1`, `weak_due_diligence_grounding` |
| `ASK-V2-SCEN-004` | Explain ESRS E1-6 at a high level. | `GENERAL_QA` | Exact `E1-6_*` datapoints in the top set and non-abstaining answer | `generic_esrs_neighbors_dominate`, `exact_clause_not_in_top_results` |
| `ASK-V2-SCEN-005` | Map GS1 attributes to ESRS E1-6 emissions disclosures. | `ESRS_MAPPING` | Mixed ESRS + GS1 top results and non-abstaining answer | `esrs_only_context`, `mapping_answer_abstains`, `no_gs1_support_signal` |
| `ASK-V2-SCEN-006` | Which traceability standards support the EU Battery Regulation? | `GENERAL_QA` | Regulation + GS1 support sources both present | `no_battery_standard_support`, `missing_traceability_context` |
| `ASK-V2-SCEN-007` | What gaps remain between GS1 standards and the EU Battery Regulation? | `GAP_ANALYSIS` | Gap analysis auto-triggers and the binding regulation leads the evidence set | `plural_gap_query_misclassified`, `gap_analysis_not_triggered`, `regulation_not_used_for_gap_trigger` |
| `ASK-V2-SCEN-008` | Which source should I trust for Digital Product Passport identifiers? | `GENERAL_QA` | Binding regulation is primary, GS1 is supporting, and the decision basis is explicit | `implementation_guidance_ranked_above_binding_source`, `no_primary_supporting_distinction`, `trust_query_lacks_decision_summary` |
| `ASK-V2-SCEN-009` | Map GS1 attributes to ESRS E1-6 emissions disclosures using only current verified evidence. | `ESRS_MAPPING` | Mapping answer stays useful but drops to cautious confidence and flags proxy evidence | `proxy_support_not_demoted`, `confidence_overstates_evidence`, `decision_summary_missing` |
| `ASK-V2-SCEN-010` | Do we have coverage gaps for EUDR traceability requirements? | `GAP_ANALYSIS` | Gap analysis activates only when useful and returns a meaningful “full tracked coverage” snapshot | `gap_trigger_missing`, `full_coverage_guidance_unhelpful`, `recommendation_is_blank` |

### 6A.3 Baseline Findings

- FACT: The legacy ranking baseline missed exact ESRS clause rescue on `ASK-V2-SCEN-004`, scoring `0.75` and surfacing `SBM-1_24 - ESRS 2` above `E1-6_*` datapoints.
- FACT: The legacy ranking baseline missed GS1 support coverage on `ASK-V2-SCEN-005`, scoring `0.75` because the top-5 contained only `esrs_datapoint` rows.
- FACT: The first expanded decision-grade baseline missed plural gap wording on `ASK-V2-SCEN-007`, ranking GS1 implementation guidance above the EU Battery Regulation and failing to auto-trigger gap analysis.
- FACT: The first expanded decision-grade baseline missed trust-source ordering on `ASK-V2-SCEN-008`, ranking GS1 implementation guidance above the binding DPP delegated act and omitting a primary-versus-supporting evidence summary.
- FACT: The first expanded decision-grade baseline overstated confidence on `ASK-V2-SCEN-009`, even when the answer depended on stale EFRAG datapoints and proxy GS1 support.
- FACT: `hub_news` is absent in the current environment and needed a safe no-table path.
- FACT: `canonical_facts` can be absent in some environments and needed the same reliability treatment.
- INTERPRETATION: The highest-value fixes were retrieval compatibility, metadata normalization, exact ESRS rescue, GS1 support promotion, regulation-first authority handling for trust/gap prompts, and cautious-confidence output for proxy-heavy mappings.

### 6A.4 Before / After Scenario Results

| Scenario ID | Legacy score | Current score | Key gain |
| ----------- | ------------ | ------------- | -------- |
| `ASK-V2-SCEN-001` | `1.0000` | `1.0000` | Preserved correct regulation-first ordering |
| `ASK-V2-SCEN-002` | `1.0000` | `1.0000` | Preserved GS1-first ordering while reducing regulation bleed |
| `ASK-V2-SCEN-003` | `1.0000` | `1.0000` | Preserved `EUDR` as top regulation |
| `ASK-V2-SCEN-004` | `0.7500` | `1.0000` | Exact `E1-6_*` datapoints rescued into the top results |
| `ASK-V2-SCEN-005` | `0.7500` | `1.0000` | GS1 support signal surfaced in the top-5 for mapping |
| `ASK-V2-SCEN-006` | `1.0000` | `1.0000` | Preserved regulation + standards support mix |
| `ASK-V2-SCEN-007` | `0.8333` | `1.0000` | Gap-analysis prompts now classify correctly, trigger analysis, and lead with the binding regulation |
| `ASK-V2-SCEN-008` | `0.8333` | `1.0000` | Trust prompts now select the delegated act as primary evidence and GS1 as supporting context |
| `ASK-V2-SCEN-009` | `0.8333` | `1.0000` | “Current verified evidence” prompts now surface cautious confidence, uncertainty, and decision summary cues |
| `ASK-V2-SCEN-010` | `1.0000` | `1.0000` | Gap-analysis still returns useful guidance when tracked coverage is already full |

### 6A.5 Selected Reranking Opportunities

| Opportunity ID | Title | User-value upside | Intelligence upside | Feasibility | Risk | Decision |
| -------------- | ----- | ----------------- | ------------------- | ----------- | ---- | -------- |
| `OPP-RERANK-01` | Replace pgvector-only retrieval assumption | High | High | High | Low | Selected |
| `OPP-RERANK-02` | Normalize live taxonomy before ranking/filtering | High | High | High | Low | Selected |
| `OPP-RERANK-03` | Rescue exact ESRS clause matches | High | High | High | Low | Selected |
| `OPP-RERANK-04` | Promote GS1 support for mapping prompts | High | High | High | Low | Selected |
| `OPP-RERANK-05` | Expand the scenario-eval suite into trust, cautious-confidence, and gap-trigger cases | High | High | High | Low | Selected |
| `OPP-RERANK-06` | Pin binding regulations ahead of GS1 implementation guidance for trust and gap-analysis prompts | High | High | High | Low | Selected |
| `OPP-RERANK-07` | Add decision-summary, caution-flag, and gap-trigger payloads to the expert route | High | High | High | Low | Selected |
| `OPP-RERANK-08` | Add freshness/conflict-aware reranking beyond bounded authority rules | Medium | Medium | Medium | Medium | Deferred |

## 6B. 2026-03-14 Ask ISA v2 Freshness / Conflict Frontier

- FACT: The next live frontier after PR `#332` was not generic retrieval quality; it was freshness-sensitive source selection, conflict posture between binding regulation and GS1 guidance, and the tendency to abstain even when the decision basis was already clear in the payload.
- FACT: The live scenario suite now covers 14 cases, adding explicit freshness/source-selection, conflict, and delegated-act tie-break prompts.
- FACT: The current live eval now measures `legacy: 0.9405`, `current: 1.0000`, `answer: 0.7143`, and `answerEligible: 1.0000`.
- INTERPRETATION: Ask ISA v2 is now materially better at choosing current binding evidence and explaining why it won, not just surfacing the right documents.

### 6B.1 Key Improvements

- FACT: Source-selection/freshness prompts now classify as `GENERAL_QA` instead of falling into `ESRS_MAPPING` purely because `GS1` was mentioned.
- FACT: `server/routers/ask-isa-v2-retrieval.ts` now adds bounded lexical rescue across the live `knowledge_embeddings` pool so specific DPP and delegated-act evidence can be recovered even when semantic recall underperforms.
- FACT: Freshness-sensitive ranking now adds specificity tie-breaks for delegated acts and other recent change artifacts instead of over-favoring broader base regulations.
- FACT: `decisionSummary` now carries `evidenceChoice`, `freshnessSummary`, `conflictSummary`, and `nextStep`.
- FACT: When the freeform model answer fails Stage-A but the decision basis is already strong and evidence-ready, `askISAV2.askEnhanced` can now return a deterministic cited fallback answer instead of a blind abstention.

### 6B.2 Expanded Scenario Frontier

| Scenario ID | User question | What it probes | Current result |
| ----------- | ------------- | -------------- | -------------- |
| `ASK-V2-SCEN-011` | What is the newest authoritative source for DPP identifiers? | Freshness-sensitive source selection with DPP acronym expansion | `0.8333 -> 1.0000` |
| `ASK-V2-SCEN-012` | Which source is more current for Digital Product Passport requirements, ESPR or GS1 guidance? | Binding-vs-guidance freshness comparison with explicit explanation posture | `1.0000 -> 1.0000` retrieval preserved, answer behavior now fully passes |
| `ASK-V2-SCEN-013` | Should I follow ESPR delegated act requirements or GS1 guidance when they differ on DPP identifiers? | Conflict handling and binding-vs-supporting policy | `1.0000 -> 1.0000` retrieval preserved, answer posture now fully passes |
| `ASK-V2-SCEN-014` | What changed most recently for battery passport carbon footprint requirements? | Delegated-act tie-break over broader base regulation | `1.0000 -> 1.0000` retrieval preserved with explicit freshness summary |

### 6B.3 Highest-Value Failure Modes Resolved

- FACT: Freshness/source-selection prompts could previously return only stale ESRS datapoints or broader regulations instead of the DPP delegated act and GS1 support evidence.
- FACT: Conflict prompts could still rank GS1 implementation guidance above binding regulation evidence if the query mentioned GS1 strongly enough to trip mapping heuristics.
- FACT: Even when retrieval and decision metadata were correct, some source-selection answers still dropped to abstention because the freeform model output failed Stage-A despite a valid cited fallback being possible.
- RESULT: Those failures are now covered by the live eval frontier and addressed with classification fixes, lexical rescue, delegated-act tie-breaks, explicit decision posture fields, and deterministic cited fallback behavior.

## Evidence Register

### EVD-20260313-101

- Type: file
- Path or command: `client/src/App.tsx`
- Short excerpt: `/ask` -> `AskISAEnhanced`; `/ask/classic` -> `AskISA`
- Claim supported: Primary Ask ISA route now exposes the enhanced shell

### EVD-20260313-102

- Type: file
- Path or command: `server/routers/ask-isa-v2-intelligence.ts`
- Short excerpt: `classifyQueryIntent`, `buildIntentRetrievalPlan`, `deriveMappingSignals`, `mergeKnowledgeResults`
- Claim supported: V2 retrieval and mapping decisions are now intent-aware and reusable

### EVD-20260313-103

- Type: file
- Path or command: `server/routers/ask-isa-v2.ts`
- Short excerpt: `askEnhanced` now assembles primary/fallback/news retrieval, mapping context, confidence, authority, and structured payload fields
- Claim supported: V2 answer generation is materially richer and more grounded

### EVD-20260313-104

- Type: file
- Path or command: `client/src/components/AskISAExpertMode.tsx`
- Short excerpt: expert answer surface renders confidence, authority, mapping context, facts, gap summary, and evidence sources
- Claim supported: The user-facing surface now makes the intelligence upgrade visible

### EVD-20260313-105

- Type: file
- Path or command: `client/src/components/EnhancedSearchPanel.tsx`
- Short excerpt: intent and retrieval-strategy badges plus smart-default indicator
- Claim supported: Retrieval transparency is now exposed to users

### EVD-20260313-106

- Type: file
- Path or command: `client/src/components/AuthorityBadge.tsx`
- Short excerpt: React import restored for authority score rendering
- Claim supported: The new trust surface no longer crashes under the current runtime/test setup

### EVD-20260313-107

- Type: test
- Path or command: `pnpm vitest run server/routers/__tests__/ask-isa-v2-intent.test.ts client/src/components/AskISAExpertMode.test.tsx client/src/pages/AskISAEnhanced.test.tsx server/hybrid-search.test.ts --reporter=verbose --no-coverage`
- Short excerpt: `4 passed`, `29 passed`
- Claim supported: Focused v2 backend/UI behavior passes locally

### EVD-20260313-108

- Type: command
- Path or command: `pnpm exec tsc --noEmit --pretty false` filtered for touched files
- Short excerpt: no touched-file matches for edited Ask ISA v2 files
- Claim supported: This slice did not introduce touched-file TypeScript regressions under the repo compiler

### EVD-20260314-109

- Type: command
- Path or command: `pnpm exec tsx scripts/eval/probe-ask-isa-v2-runtime.ts`
- Short excerpt: `"data_type": "jsonb"` and `"table_name": null`
- Claim supported: Ask ISA v2 had live retrieval/schema drift against the current Postgres environment

### EVD-20260314-110

- Type: command
- Path or command: `pnpm exec tsx scripts/eval/run-ask-isa-v2-scenario-eval.ts`
- Short excerpt: `"legacy": 0.9167`, `"current": 1`
- Claim supported: Scenario-driven reranking work improved measured Ask ISA v2 quality

### EVD-20260314-111

- Type: file
- Path or command: `scripts/eval/probe-ask-isa-v2-runtime.ts`
- Short excerpt: runtime probe checks `embeddingType`, `vectorTypeAvailable`, corpus taxonomy values, and optional-table presence
- Claim supported: Ask ISA v2 now has a durable inspection script for the live runtime assumptions behind retrieval

### EVD-20260314-112

- Type: file
- Path or command: `data/evaluation/golden/ask_isa/scenario_cases_v2_live.json`
- Short excerpt: ten scenario cases covering regulation change, GS1 identifiers, exact ESRS clauses, trust-source choice, cautious confidence, gap triggers, and traceability
- Claim supported: Route-level Ask ISA v2 scenario coverage now exists

### EVD-20260314-113

- Type: file
- Path or command: `server/routers/ask-isa-v2-retrieval.ts`
- Short excerpt: `pinFirstMatchingResult`, `decisionSummary`, `cautionFlags`, and provenance-aware score shaping for `authorityTier`, `publicationStatus`, `needsVerification`, and `evidenceKey`
- Claim supported: Ask ISA v2 now applies decision-grade authority/provenance policy during reranking and payload assembly

### EVD-20260314-114

- Type: test
- Path or command: `pnpm vitest run server/routers/__tests__/ask-isa-v2-intent.test.ts server/routers/__tests__/ask-isa-v2-retrieval.test.ts client/src/components/AskISAExpertMode.test.tsx --reporter=verbose --no-coverage`
- Short excerpt: `3 passed`, `25 passed`
- Claim supported: Decision-grade intent, reranking, and expert-surface behavior pass locally

### EVD-20260314-115

- Type: command
- Path or command: `pnpm exec tsx scripts/eval/run-ask-isa-v2-scenario-eval.ts`
- Short excerpt: `"legacy": 0.9167`, `"current": 1`, `"answer": 0.6`
- Claim supported: The expanded decision-grade scenario suite improved retrieval and answer behavior on the current Ask ISA v2 route

### EVD-20260314-116

- Type: command
- Path or command: `pnpm exec tsx -e "... askEnhanced({ question: 'Explain ESRS E1-6 at a high level.' }) ..."`
- Short excerpt: direct runtime call returned a grounded non-abstaining answer with `European Sustainability Reporting Standards (ESRS)` as primary evidence
- Claim supported: The transient `ASK-V2-SCEN-004` abstention observed in one full eval run was model variance rather than a retrieval-policy regression
