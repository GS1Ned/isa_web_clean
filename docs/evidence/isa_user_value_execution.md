# ISA User Value Execution

Date: 2026-03-13
Current branch: `codex/ask-isa-v2-intelligence`
Base branch: `main`
Merged groundwork: `#326`, `#328`, `#329`
Current PR: `#330`
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

## 8. Validation Results

| Check                                                       | Result              | Notes                                                                                   |
| ----------------------------------------------------------- | ------------------- | --------------------------------------------------------------------------------------- |
| Focused Ask ISA v2 Vitest suite                             | Pass                | `4` files, `29` tests passed                                                            |
| `server/hybrid-search.test.ts`                              | Pass                | Included in the focused suite to catch retrieval regressions                            |
| Touched-file compiler isolation                             | Pass                | `pnpm exec tsc --noEmit --pretty false` produced no matches for edited Ask ISA v2 files |
| `bash scripts/gates/doc-code-validator.sh --canonical-only` | Pass                | Canonical doc-code validator passed after runtime-contract and evidence updates          |
| `python3 scripts/validate_planning_and_traceability.py`     | Pass                | Canonical planning/traceability validator passed after evidence updates                  |
| `bash scripts/gates/canonical-contract-drift.sh`            | Pass after follow-up | Generated `repo_ref.commit` values refreshed to the current `main` base SHA for PR `#330` |
| Repo-wide `pnpm check`                                      | Known baseline fail | Existing repo-wide TypeScript debt outside this slice                                   |
| Repo-wide `no-console` gate                                 | Known baseline fail | Existing `scripts/*.mjs` console usage outside this slice                               |

### Issues Encountered And Resolved

- FACT: The new expert-mode test initially failed on `streamdown` CSS loading under Vitest.
- FACT: The test harness was updated to mock `streamdown` rather than weakening component behavior.
- FACT: `AuthorityBadge.tsx` surfaced a real runtime/test issue because `AuthorityScore` rendered without a React import in the current environment.
- FACT: `AskISAEnhanced` and expert-mode tests required React 19-safe assertions because hooks/components can be invoked more than once during render.
- FACT: Touched-file type checking surfaced implicit `any` usage in the new page and iterator patterns that were not safe under the repo compiler target; both were corrected.

## 9. Pull Request Readiness

- Branch name: `codex/ask-isa-v2-intelligence`
- Base branch: `main`
- Repository: `GS1Ned/isa_web_clean`
- Proposed PR title: `Promote Ask ISA v2 to the primary expert route`
- Proposed PR summary:
  - Route `/ask` to the expert-first Ask ISA shell and preserve the legacy chat at `/ask/classic`.
  - Make `askISAV2` retrieval intent-aware, mapping-context aware, and more explicit about authority/confidence.
  - Expose structured expert answers, retrieval strategy, evidence cards, and knowledge stats on the primary Ask ISA surface.
  - Add focused server/client regression coverage for the new v2 path and repair the authority-score runtime issue.
- Check status:
  - FACT: Focused tests passed locally.
  - FACT: Touched-file compiler isolation passed.
  - FACT: PR `#330` is open against `main`.
  - FACT: `secrets-scan`, both `smoke` checks, and both `validate` checks passed on the initial PR run.
  - FACT: `canonical-contract-drift` failed on the initial PR run because six generated `repo_ref.commit` values still referenced `b63e3a98ca526e3f62d1462b1921d520d1168948`; this follow-up refresh fixes that branch-local drift.
  - FACT: `no-console` remains a repo-wide baseline failure outside this slice.
- Merge / automerge status: Not enabled; PR `#330` remains subject to branch checks.

## 10. Unknowns And Next Improvements

### UNKNOWN-01

- UNKNOWN: Whether current v2 route behavior is already sufficient to retire the classic Ask ISA route after a short soak period.
- Why it matters: Keeping both routes indefinitely increases maintenance surface area.
- How to verify: Add route-level scenario evals and inspect runtime usage/feedback after the expert-first route ships.

### NEXT-01

- RECOMMENDATION: Add scenario evals for `askISAV2.askEnhanced` covering change, mapping, gap, and news prompts.

### NEXT-02

- RECOMMENDATION: Inspect whether additional freshness/conflict-aware reranking is warranted once v2 route evals exist.

### NEXT-03

- RECOMMENDATION: Run a separate repo-wide TypeScript and `no-console` cleanup program so branch readiness does not depend on touched-file filtering.
