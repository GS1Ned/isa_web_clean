# Program Plan
Date: 2026-03-13
Status: EXECUTED_FOR_SELECTED_SLICE

## Prioritization Method
- FACT: Opportunities were scored 1-5 on user-value impact, confidence, feasibility, time-to-value, strategic leverage, risk-reduction, and dependency unlock.
- RECOMMENDATION: Prefer slices with high user impact, high confidence, and low migration risk before attempting architectural route swaps.

## Ranked Portfolio
| Rank | Opportunity | Rationale | Planned action | Status |
| --- | --- | --- | --- | --- |
| 1 | Scope Ask ISA cache correctly | Wrong-context answers are a top trust breaker | Add sector-aware keys, bypass cache for conversation-scoped queries, keep cached payload parity | Done |
| 2 | Normalize confidence semantics | `500% confidence` degrades trust and analytics quality | Replace raw source-count score with normalized score plus explicit `sourceCount` | Done |
| 3 | Repair history loading | Repeated-use UX depends on reliable history retrieval | Move `trpc.useUtils()` to component scope | Done |
| 4 | Fix similarity display inflation | Overstated match percentages undermine source trust | Stop multiplying already-percent similarity values | Done |
| 5 | Correct Gap Analyzer sector-scoped summary math | Non-general sectors could see understated coverage and inflated requirement counts | Count only the requirements actually evaluated and clarify the sector-scoped denominator in the UI | Done |
| 6 | Remove placeholder/dead-end timeline UX on live regulation detail pages | Visible `TODO` copy and an inert button reduce trust | Replace milestone fallback copy and remove the unwired timeline button | Done |
| 7 | Migrate `/ask` to `askISAV2` | Higher long-term upside but wider compatibility risk | Defer until a dedicated compatibility pass and eval plan exists | Deferred |
| 8 | Expand legacy retrieval breadth | Could raise recall, but schema and ranking review are needed | Defer until after Ask ISA runtime parity is measured | Deferred |

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

## Validation Plan
1. FACT: Run targeted Ask ISA, hybrid-search, source-posture, gap-analyzer, and touched live-component tests.
2. FACT: Run `pnpm check`.
3. RECOMMENDATION: If `pnpm check` fails, separate pre-existing repo-wide type debt from touched-file regressions.

## Deferred Next Steps
- RECOMMENDATION: Add a compatibility plan for moving `/ask` to `askISAV2` without breaking current payload consumers.
- RECOMMENDATION: Expand retrieval evaluation around entity-type coverage before changing ranking behavior in the legacy path.
