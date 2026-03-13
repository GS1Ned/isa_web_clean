# ISA User Value Execution
Date: 2026-03-13
Branch: `codex/ask-isa-user-value-reliability`
Target branch: `main`

## 7. Execution Log
### Slice 1: Ask ISA cache safety
- Objective: Prevent wrong-context cache hits and keep cache-hit responses feature-complete.
- Files changed: `server/ask-isa-cache.ts`, `server/routers/ask-isa.ts`, `server/ask-isa-cache.test.ts`
- Rationale:
  - FACT: Pre-change cache lookup used only question text.
  - FACT: Ask ISA behavior also depends on `sector` and conversation context.
  - INTERPRETATION: Cache reuse across those scopes could return a materially wrong answer.
- Validation:
  - FACT: `server/ask-isa-cache.test.ts` verifies sector scoping, conversation bypass, and cached metadata parity.
- Result: Completed

### Slice 2: Confidence normalization and analytics repair
- Objective: Replace raw source-count confidence scores with normalized scores plus explicit `sourceCount`.
- Files changed: `shared/ask-isa-confidence.ts`, `server/ask-isa-guardrails.ts`, `server/routers/ask-isa.ts`, `server/ask-isa-guardrails.test.ts`, `server/ask-isa-integration.test.ts`, `client/src/pages/AdminFeedbackDashboard.tsx`
- Rationale:
  - FACT: Pre-change `calculateConfidence()` returned `score=sourceCount`.
  - FACT: UI and analytics rendered that field as a percentage.
  - INTERPRETATION: The product could tell users `500% confidence`, which is a trust failure.
- Validation:
  - FACT: `shared/ask-isa-confidence.test.ts` verifies normalized scoring and legacy-score normalization.
  - FACT: Ask ISA guardrail and integration tests were updated and pass.
- Result: Completed

### Slice 3: Ask ISA UI reliability and trust cleanup
- Objective: Fix history loading and remove double-scaled similarity percentages.
- Files changed: `client/src/pages/AskISA.tsx`, `client/src/components/AskISAWidget.tsx`
- Rationale:
  - FACT: Pre-change history loading called `trpc.useUtils()` inside an event handler.
  - FACT: Pre-change export and widget views multiplied already-percent similarity values by 100 again.
- Validation:
  - FACT: Focused Ask ISA tests remain green.
  - FACT: No touched-file matches were found when filtering `pnpm exec tsc --noEmit --pretty false` output for the edited files.
- Result: Completed

## 8. Validation Results
| Check | Result | Notes |
| --- | --- | --- |
| Focused Vitest suite | Pass | `7` files, `91` tests passed |
| `pnpm check` | Fail | Repo-wide pre-existing TypeScript debt unrelated to this slice |
| Touched-file compiler isolation | Pass | No `tsc` matches for edited Ask ISA files |

### Issues Encountered And Resolved
- FACT: `pnpm check` failed on many unrelated client, server, and schema files outside the Ask ISA slice.
- INTERPRETATION: The repo is not currently in a globally type-clean state, so branch readiness must rely on scoped regression evidence plus explicit blocker logging.
- RECOMMENDATION: Treat repo-wide type debt as a separate cleanup program, not as a blocker for reviewing this targeted Ask ISA hardening change.

## 9. Pull Request Readiness
- Branch name: `codex/ask-isa-user-value-reliability`
- Base branch: `main`
- Repository: `GS1Ned/isa_web_clean`
- Proposed PR title: `Improve Ask ISA cache safety, confidence semantics, and trust signals`
- Proposed PR summary:
  - Scope Ask ISA caching by sector and bypass it for conversation-scoped prompts.
  - Normalize confidence to a real 0-1 score while preserving explicit source counts.
  - Repair Ask ISA history loading hook usage.
  - Remove double-scaled similarity percentages from Ask ISA export/widget surfaces.
- Check status:
  - FACT: Focused tests passed locally.
  - FACT: Global `pnpm check` remains blocked by unrelated pre-existing errors.
- Merge / automerge status: UNKNOWN until branch is pushed and PR checks are created.

## 10. Unknowns And Next Improvements
### UNKNOWN-01
- UNKNOWN: Whether repository CI policy will accept this branch without also addressing the unrelated repo-wide TypeScript failures.
- How to verify: Push the branch and inspect PR-required checks.

### NEXT-01
- RECOMMENDATION: Design a compatibility plan to move `/ask` from `askISA.ask` to `askISAV2`.

### NEXT-02
- RECOMMENDATION: Add retrieval evaluation cases for sector-specific Ask ISA prompts so cache and retrieval changes can be measured against golden sets.

### NEXT-03
- RECOMMENDATION: Run a dedicated repo-wide TypeScript debt reduction pass so `pnpm check` becomes a meaningful merge gate again.
