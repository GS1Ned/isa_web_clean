# ISA User Value Audit
Date: 2026-03-13
Branch: `codex/ask-isa-user-value-reliability`
Status: REVIEW_READY

## 1. Executive Summary
- FACT: ISA is a broad six-capability product, but the primary user-facing Q&A surface is still `askISA.ask` on the `/ask` route, not `askISAV2`. Evidence: `docs/spec/ARCHITECTURE.md`, `server/routers.ts`, `client/src/pages/AskISA.tsx`.
- FACT: The highest-confidence user-value defects were concentrated in Ask ISA reliability and trust presentation, not in missing top-level product surface area.
- INTERPRETATION: The largest immediate value gain was to harden the existing Ask ISA path rather than attempt a speculative migration to `askISAV2`.
- RECOMMENDATION: Prioritize correctness-preserving fixes that stop context bleed, remove misleading trust signals, and keep cached responses behaviorally identical to fresh responses.

## 2. Repository-Derived Product Model
### Main subsystems
- FACT: Canonical architecture defines ISA as six capabilities with ASK_ISA and NEWS_HUB as the user operating surface, ESRS_MAPPING as the decision core, and KNOWLEDGE_BASE as the evidence backbone.
- FACT: The active Ask ISA request path is `client/src/pages/AskISA.tsx` -> `trpc.askISA.ask` -> `server/routers/ask-isa.ts`.
- FACT: Gap analysis is served separately through `server/routers/gap-analyzer.ts` and already has strong deterministic test coverage.

### Answer flow
1. FACT: `/ask` uses `trpc.askISA.ask` from the legacy router.
2. FACT: `askISA.ask` performs hybrid retrieval, citation validation, evidence sufficiency checks, LLM generation, stage-A validation, persistence, and caching.
3. FACT: The main Ask ISA UI exposes answers, sources, source-posture cues, history, export, and feedback capture.

### Retrieval and data flow
1. FACT: Hybrid retrieval combines vector and BM25 search through `server/hybrid-search.ts`.
2. FACT: The router applies citation validation and stage-A abstention before returning compliance-grade answers.
3. FACT: Query caching sits in `server/ask-isa-cache.ts` and is user-visible because `/ask` reuses cached answers.

### UI and navigation flow
1. FACT: `client/src/App.tsx` routes `/ask` to `client/src/pages/AskISA.tsx`.
2. FACT: Conversation history is loaded from the same page through `askISA.getConversation`.
3. FACT: Ask ISA answer export and the compact Ask ISA widget both display source similarity cues.

### Key bottlenecks
- FACT: Pre-change caching keyed only on normalized question text, while the router behavior also depended on `sector` and conversation history.
- FACT: Pre-change confidence scores were raw source counts, which made some UI and analytics surfaces display values like `500%`.
- FACT: Pre-change conversation loading called `trpc.useUtils()` inside an event handler instead of at component top level.
- INTERPRETATION: These issues reduce trust faster than they reduce feature breadth, because they can make correct answers look unreliable or inconsistent.

## 3. Current Capacity Analysis
| Capacity ID | Current capacity | Evidence | User relevance | Confidence | Notes |
| --- | --- | --- | --- | --- | --- |
| CAP-01 | Ask ISA can retrieve, ground, abstain, persist conversations, and collect feedback | `server/routers/ask-isa.ts`; `docs/spec/ASK_ISA/RUNTIME_CONTRACT.md` | High | High | Main `/ask` path is production-relevant |
| CAP-02 | Ask ISA UI exposes sources, verification posture, export, and history | `client/src/pages/AskISA.tsx` | High | High | Trust signals matter as much as raw answer text |
| CAP-03 | Gap Analyzer provides deterministic ESRS-to-GS1 decision artifacts | `server/routers/gap-analyzer.ts`; `server/routers/gap-analyzer.test.ts` | Medium | High | Strong current behavior; not the top blocker |
| CAP-04 | Hybrid retrieval and citation validation are covered by focused tests | `server/hybrid-search.test.ts`; `server/ask-isa-guardrails.test.ts` | High | High | Good leverage for a small Ask ISA fix set |
| CAP-05 | Governance, architecture, and validation policy are unusually strong | `AGENT_START_HERE.md`; `docs/governance/MANUAL_PREFLIGHT.md` | Medium | High | Lowers change risk for targeted improvements |

## 4. User Value Framework
| Dimension | Definition | Current state | Why it matters | Evidence |
| --- | --- | --- | --- | --- |
| Answer quality | Correct answers for the current request context | Constrained by cache context bleed risk | Wrong-context reuse is worse than a slower answer | `HEAD:server/routers/ask-isa.ts`; `server/ask-isa-cache.ts` |
| Trustworthiness | Signals match actual evidence quality | Constrained by source-count-as-confidence semantics and double-scaled similarity display | Trust cues shape whether users believe the answer | `HEAD:server/ask-isa-guardrails.ts`; `HEAD:client/src/pages/AskISA.tsx`; `HEAD:client/src/components/AskISAWidget.tsx` |
| Reliability | Core interactions work repeatedly | Constrained by invalid hook placement in history loader | Broken history retrieval harms repeated use | `HEAD:client/src/pages/AskISA.tsx` |
| Speed | Fast repeated queries | Good candidate for caching, but only if scope-safe | Unsafe cache hits trade latency for incorrectness | `server/ask-isa-cache.ts`; `server/routers/ask-isa.ts` |
| Evolution quality | Metrics and feedback loops reflect reality | Constrained by malformed confidence analytics | Bad telemetry slows future product improvement | `server/routers/ask-isa.ts`; `client/src/pages/AdminFeedbackDashboard.tsx` |

## 5. Opportunity Inventory
| Opportunity ID | Title | Category | User benefit | Effort | Risk | Impact | Time-to-value | Dependencies | Score | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| OPP-01 | Scope Ask ISA cache by sector and bypass it for conversation-scoped prompts | Reliability | Prevents wrong-context answers | 2 | 1 | 5 | 5 | None | 31 | `HEAD:server/routers/ask-isa.ts`; `HEAD:server/ask-isa-cache.ts` |
| OPP-02 | Normalize confidence semantics and feedback analytics | Trust / observability | Removes misleading `>100%` confidence and repairs analytics | 2 | 1 | 4 | 5 | None | 30 | `HEAD:server/ask-isa-guardrails.ts`; `client/src/pages/AdminFeedbackDashboard.tsx` |
| OPP-03 | Fix Ask ISA history loader invalid hook + similarity inflation | Reliability / UX | Restores conversation revisit flow and removes exaggerated trust cues | 1 | 1 | 4 | 5 | None | 29 | `HEAD:client/src/pages/AskISA.tsx`; `HEAD:client/src/components/AskISAWidget.tsx` |
| OPP-04 | Migrate `/ask` from `askISA.ask` to `askISAV2` | Product architecture | Could unlock richer structured output | 4 | 4 | 5 | 2 | Wider compatibility review | 22 | `client/src/pages/AskISA.tsx`; `server/routers/ask-isa-v2.ts` |
| OPP-05 | Expand legacy hybrid retrieval coverage across more content types | Retrieval depth | Could improve recall | 4 | 3 | 4 | 2 | Schema/runtime review | 21 | `server/hybrid-search.ts`; `server/db-knowledge-vector.ts` |

## 6. Chosen Implementation Portfolio
### Selected
- FACT: Selected OPP-01, OPP-02, and OPP-03.
- INTERPRETATION: These items shared one theme: Ask ISA was already feature-rich, but some reliability and trust cues were internally inconsistent.
- RECOMMENDATION: Treat this as a reviewable quality hardening slice rather than a new feature branch.

### Deferred
- FACT: `askISAV2` migration was deferred.
- FACT: Retrieval-surface expansion in the legacy path was deferred.
- INTERPRETATION: Both deferred items are strategically interesting but require broader compatibility and evaluation work than this safe slice justified.

## Evidence Register
### EVD-20260313-001
- Type: file
- Path or command: `AGENT_START_HERE.md:73-94`
- Short excerpt: code entrypoints plus six-capability table
- Claim supported: ISA architecture is broad; Ask ISA is only one but highly user-visible capability

### EVD-20260313-002
- Type: file
- Path or command: `docs/spec/ARCHITECTURE.md:37-56`
- Short excerpt: ASK_ISA, KNOWLEDGE_BASE, and ESRS_MAPPING ownership rows
- Claim supported: Ask ISA sits directly on the evidence and decision backbone

### EVD-20260313-003
- Type: file
- Path or command: `git show HEAD:server/routers/ask-isa.ts | nl -ba | sed -n '115,155p'`
- Short excerpt: `getCachedResponse(question)` with no sector or conversation scope
- Claim supported: Pre-change cache behavior could not distinguish request context

### EVD-20260313-004
- Type: file
- Path or command: `git show HEAD:server/ask-isa-guardrails.ts | nl -ba | sed -n '304,320p'`
- Short excerpt: confidence `score` returned as raw `sourceCount`
- Claim supported: Pre-change confidence contract could overstate percentages and analytics

### EVD-20260313-005
- Type: file
- Path or command: `git show HEAD:client/src/pages/AskISA.tsx | nl -ba | sed -n '588,602p'`
- Short excerpt: `const utils = trpc.useUtils();` inside `handleLoadConversation`
- Claim supported: Pre-change history loader violated React hook placement rules

### EVD-20260313-006
- Type: file
- Path or command: `git show HEAD:client/src/pages/AskISA.tsx | nl -ba | sed -n '372,382p'`
- Short excerpt: PDF export multiplies `source.similarity * 100`
- Claim supported: Pre-change Ask ISA export could display exaggerated similarity percentages

### EVD-20260313-007
- Type: file
- Path or command: `git show HEAD:client/src/components/AskISAWidget.tsx | nl -ba | sed -n '150,160p'`
- Short excerpt: widget multiplies `source.similarity * 100`
- Claim supported: Pre-change compact Ask ISA surface also overstated similarity

### EVD-20260313-008
- Type: file
- Path or command: `server/ask-isa-cache.ts:11-199`
- Short excerpt: cache context now includes sector, conversation bypass, and response metadata parity
- Claim supported: Cache now avoids cross-context reuse and preserves richer cached payloads

### EVD-20260313-009
- Type: file
- Path or command: `shared/ask-isa-confidence.ts:1-86`
- Short excerpt: normalized confidence model plus legacy-score normalization helpers
- Claim supported: Confidence semantics are now explicit and backwards-compatible for stored feedback

### EVD-20260313-010
- Type: file
- Path or command: `server/routers/ask-isa.ts:930-1045`
- Short excerpt: feedback persistence and stats now normalize confidence values before storage and aggregation
- Claim supported: Admin analytics now reflect normalized confidence rather than raw source counts

### EVD-20260313-011
- Type: file
- Path or command: `client/src/pages/AskISA.tsx:212-215`, `client/src/pages/AskISA.tsx:392-403`, `client/src/pages/AskISA.tsx:615-618`
- Short excerpt: `useUtils()` moved to component scope; confidence and similarity formatting corrected
- Claim supported: Main Ask ISA UI now avoids hook misuse and presents trust signals coherently

### EVD-20260313-012
- Type: test
- Path or command: `pnpm vitest run shared/ask-isa-confidence.test.ts server/ask-isa-cache.test.ts server/ask-isa-guardrails.test.ts server/ask-isa-integration.test.ts server/hybrid-search.test.ts server/routers/gap-analyzer.test.ts client/src/lib/ask-isa-citation.test.ts client/src/lib/ask-isa-source-posture.test.ts --reporter=verbose --no-coverage`
- Short excerpt: `7 passed`, `91 passed`
- Claim supported: The implemented Ask ISA slice and adjacent critical coverage pass locally
