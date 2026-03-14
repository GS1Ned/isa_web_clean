# ISA User Value Audit

Date: 2026-03-13
Branch: `codex/ask-isa-v2-intelligence`
Status: VALIDATED_LOCAL_CHANGES

## 1. Executive Summary

- FACT: `/ask` now routes to `client/src/pages/AskISAEnhanced.tsx`, while the legacy chat path remains available at `/ask/classic`. Evidence: `client/src/App.tsx`.
- FACT: `askISAV2` already existed in-repo, but the primary user route was not exposing it and key intelligence helpers such as mapping-context enrichment were not active on the main answer path. Evidence: `server/routers/ask-isa-v2.ts`, `client/src/pages/AskISAEnhanced.tsx`, `server/routers/ask-isa-v2-intelligence.ts`.
- INTERPRETATION: The highest-upside improvement was to promote the richer v2 runtime and deepen its retrieval/grounding behavior, rather than keep adding narrow fixes to the legacy `/ask` route.
- RECOMMENDATION: Keep the classic fallback route until v2 scenario eval coverage is broader, then decide whether the legacy route can be fully retired.

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

- FACT: Route-level scenario eval coverage for the new expert-first `/ask` surface is still limited.
- FACT: Repo-wide `pnpm check` and repo-wide `no-console` debt remain outside this slice.
- INTERPRETATION: The product intelligence layer improved materially, but branch confidence still depends on focused test evidence rather than a fully clean global baseline.

## 3. Current Capacity Analysis

| Capacity ID | Current capacity                                                                                                                        | Evidence                                                                                                                                            | User relevance | Confidence | Notes                                                                    |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ---------- | ------------------------------------------------------------------------ |
| CAP-01      | `/ask` now exposes expert reasoning, advanced evidence search, and classic fallback                                                     | `client/src/App.tsx`; `client/src/pages/AskISAEnhanced.tsx`                                                                                         | High           | High       | Primary Ask ISA route changed materially                                 |
| CAP-02      | `askISAV2.askEnhanced` now returns intent, retrieval profile, mapping context, confidence, authority, facts, and gap-summary enrichment | `server/routers/ask-isa-v2.ts`                                                                                                                      | High           | High       | Users get deeper structured output instead of a thin answer-only payload |
| CAP-03      | `askISAV2.enhancedSearch` applies smart retrieval defaults and exposes retrieval strategy                                               | `server/routers/ask-isa-v2.ts`; `client/src/components/EnhancedSearchPanel.tsx`                                                                     | High           | High       | Makes the retrieval layer inspectable                                    |
| CAP-04      | Expert UI now exposes trust signals and evidence panels directly on the main route                                                      | `client/src/components/AskISAExpertMode.tsx`; `client/src/components/AuthorityBadge.tsx`                                                            | High           | High       | Improves perceived intelligence and trust                                |
| CAP-05      | Focused server/client coverage exists for new v2 intent logic and expert route rendering                                                | `server/routers/__tests__/ask-isa-v2-intent.test.ts`; `client/src/components/AskISAExpertMode.test.tsx`; `client/src/pages/AskISAEnhanced.test.tsx` | Medium         | High       | Good targeted protection, but not full route eval coverage               |

## 4. User Value Framework

| Dimension           | Definition                                                             | Current state           | Why it matters                                                                                  | Evidence                                                                                         |
| ------------------- | ---------------------------------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Answer depth        | Ability to explain applicability, mappings, and next-step implications | Improved                | Expert outputs now include mapping context, explainers, gap summary, and inline recommendations | `server/routers/ask-isa-v2.ts`; `client/src/components/AskISAExpertMode.tsx`                     |
| Retrieval relevance | Ability to pull the right evidence set for the question type           | Improved                | Intent-aware retrieval defaults reduce generic one-size-fits-all retrieval                      | `server/routers/ask-isa-v2-intelligence.ts`; `server/routers/ask-isa-v2.ts`                      |
| Trustworthiness     | Visibility into why the answer should be believed                      | Improved                | Confidence, authority, evidence cards, and canonical facts are surfaced directly                | `client/src/components/AskISAExpertMode.tsx`; `client/src/components/AuthorityBadge.tsx`         |
| Discovery           | Ease of reaching the smarter path                                      | Improved                | `/ask` now lands on the expert-first shell instead of only the legacy chat                      | `client/src/App.tsx`; `client/src/pages/AskISAEnhanced.tsx`                                      |
| Regression safety   | Ability to prove the intelligence change still works                   | Improved but incomplete | Focused tests are in place; scenario eval coverage still needs expansion                        | `server/routers/__tests__/ask-isa-v2-intent.test.ts`; `client/src/pages/AskISAEnhanced.test.tsx` |

## 5. Opportunity Inventory

| Opportunity ID | Title                                                 | Category                          | User benefit                                                                   | Effort | Risk | Impact | Time-to-value | Dependencies                      | Score | Evidence                                                                    |
| -------------- | ----------------------------------------------------- | --------------------------------- | ------------------------------------------------------------------------------ | ------ | ---- | ------ | ------------- | --------------------------------- | ----- | --------------------------------------------------------------------------- |
| OPP-01         | Promote `askISAV2` to the primary `/ask` route        | Discovery / intelligence exposure | Users reach the stronger Ask ISA flow by default                               | 3      | 2    | 5      | 5             | Existing v2 UI/runtime            | 33    | `client/src/App.tsx`; `client/src/pages/AskISAEnhanced.tsx`                 |
| OPP-02         | Make v2 retrieval intent-aware                        | Retrieval quality                 | Better candidate selection for change, mapping, gap, and news questions        | 3      | 2    | 5      | 4             | Existing embeddings/search path   | 32    | `server/routers/ask-isa-v2-intelligence.ts`; `server/routers/ask-isa-v2.ts` |
| OPP-03         | Activate mapping-context enrichment in expert answers | Answer depth                      | Stronger cross-linking between regulations, ESRS datapoints, and GS1 standards | 3      | 2    | 5      | 4             | Existing `getMappingContext()`    | 31    | `server/routers/ask-isa-v2.ts`                                              |
| OPP-04         | Expose expert trust and evidence panels               | UX / trust                        | Makes the intelligence gain legible to users                                   | 2      | 1    | 4      | 5             | Existing source/confidence models | 31    | `client/src/components/AskISAExpertMode.tsx`                                |
| OPP-05         | Add route-level v2 scenario evals                     | Evaluation                        | Raises confidence in the new default route                                     | 3      | 2    | 4      | 3             | Eval fixture design               | 27    | `data/evaluation/golden/registry.json`; `server/routers/evaluation.ts`      |
| OPP-06         | Expand broader reranking and conflict handling        | Retrieval / synthesis             | Could improve precision further                                                | 4      | 3    | 4      | 2             | More diagnostics and evals        | 23    | `server/routers/ask-isa-v2.ts`; `server/hybrid-search.ts`                   |

## 6. Chosen Implementation Portfolio

### Selected

- FACT: Selected OPP-01 through OPP-04.
- INTERPRETATION: These four items compound: they improve what `askISAV2` does, make the product route users into that stronger path, and expose why the new behavior is smarter.

### Deferred

- FACT: Route-level v2 scenario evals were deferred.
- FACT: Deeper reranking/conflict-resolution work was deferred.
- INTERPRETATION: Both remain valuable, but they require more measurement scaffolding than this route-promotion slice justified.

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
