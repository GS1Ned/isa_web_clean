# ISA User Value Execution
Date: 2026-03-13
Branch: `codex/ask-isa-user-value-reliability`
Follow-up branch: `codex/gap-analyzer-relevance-summary`
Current PR: `#329`
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

### Slice 4: Gap Analyzer sector-scoped summary correction
- Objective: Stop understating coverage for non-general sectors and clarify what the coverage denominator means.
- Files changed: `server/routers/gap-analyzer.ts`, `server/routers/gap-analyzer.test.ts`, `client/src/pages/GapAnalyzer.tsx`, `client/src/pages/GapAnalyzer.test.tsx`, `docs/spec/ESRS_MAPPING/RUNTIME_CONTRACT.md`
- Rationale:
  - FACT: Pre-change `gapAnalyzer.analyze()` counted `requirementMap.size` even when the loop skipped non-relevant sector rows.
  - FACT: The Gap Analyzer summary card displayed that count directly to users as the headline denominator.
  - INTERPRETATION: Non-general sector runs could look less complete than they actually were, which weakens trust in the tool.
- Validation:
  - FACT: Added router coverage test for sector-relevant summary totals.
  - FACT: Added page test asserting the revised sector-scoped trust copy and summary label.
  - FACT: No touched-file `tsc` matches were found for the edited Gap Analyzer files.
- Result: Completed

### Slice 5: Regulation timeline placeholder and dead-end cleanup
- Objective: Remove raw placeholder UX from the live regulation timeline surface.
- Files changed: `client/src/components/RegulationTimeline.tsx`, `client/src/components/RegulationTimeline.test.tsx`
- Rationale:
  - FACT: The live timeline card rendered `TODO: add milestone description.` when timeline annotations were missing.
  - FACT: The same card exposed a `View full timeline` button without any wired action.
  - INTERPRETATION: Placeholder text and dead controls create avoidable product friction on hub regulation detail pages.
- Validation:
  - FACT: Added a component test that verifies fallback milestone copy and confirms the dead button is removed.
- Result: Completed

### Slice 6: Canonical contract metadata refresh for the active PR branch
- Objective: Clear the canonical drift gate on the active Gap Analyzer PR without mixing in unrelated repo-wide cleanup.
- Files changed: `docs/architecture/panel/_generated/CAPABILITY_MANIFEST.json`, `docs/architecture/panel/_generated/CAPABILITY_GRAPH.json`, `docs/architecture/panel/_generated/PRIMITIVE_DICTIONARY.json`, `docs/architecture/panel/_generated/EVIDENCE_INDEX.json`, `docs/architecture/panel/_generated/MINIMAL_VALIDATION_BUNDLE.json`, `docs/planning/refactoring/EXECUTION_STATE.json`
- Rationale:
  - FACT: PR `#329` failed `canonical-contract-drift` because these files still referenced commit `fc7e38d03956d4a1892c1060984793cbd0456dd9`.
  - FACT: The active feature branch head was `0d02b0f7566de042f0ca9f9666600277f868088e`.
  - INTERPRETATION: The branch was functionally ready, but CI would stay red until the machine-readable contract metadata matched the active branch lineage.
- Validation:
  - FACT: `bash scripts/gates/canonical-contract-drift.sh` passed after refreshing the `repo_ref.commit` values.
  - FACT: `python3 scripts/gates/manifest-ownership-drift.py`, `python3 scripts/validate_planning_and_traceability.py`, and `bash scripts/gates/doc-code-validator.sh --canonical-only` all passed after the refresh.
- Result: Completed

## 8. Validation Results
| Check | Result | Notes |
| --- | --- | --- |
| Focused Vitest suite | Pass | `7` files, `91` tests passed |
| Gap / timeline follow-up Vitest suite | Pass | `3` files, `28` tests passed |
| `python3 scripts/validate_planning_and_traceability.py` | Pass | Canonical planning/doc-sprawl validator passed after moving artifacts into allowed locations |
| `bash scripts/gates/doc-code-validator.sh --canonical-only` | Pass | Canonical doc-code validator passed |
| `bash scripts/gates/canonical-contract-drift.sh` | Pass | Generated contract metadata updated to the current commit |
| `python3 scripts/gates/manifest-ownership-drift.py` | Pass after follow-up | Follow-up governance patch added missing shared-platform ownership for `error_ledger` |
| `bash scripts/gates/no-console-gate.sh` | Fail | Fails on long-standing `scripts/*.mjs` console usage outside this change set |
| `pnpm check` | Fail | Repo-wide pre-existing TypeScript debt unrelated to this slice |
| Touched-file compiler isolation | Pass | No `tsc` matches for edited Ask ISA files |

### Issues Encountered And Resolved
- FACT: `pnpm check` failed on many unrelated client, server, and schema files outside the Ask ISA slice.
- FACT: `bash scripts/gates/no-console-gate.sh` failed on pre-existing `scripts/*.mjs` console usage outside this branch.
- FACT: PR follow-up CI exposed a separate ownership-contract gap: `error_ledger` existed in runtime schema declarations but not in `CAPABILITY_MANIFEST.json`.
- FACT: `scripts/validate_oss_benchmarks_2026_02_15.sh` duplicated repo-wide no-console enforcement inside the schema-validation workflow; the follow-up narrowed that script back to benchmark-package scope so schema checks report schema problems instead of unrelated runtime-script debt.
- FACT: The Gap Analyzer follow-up surfaced a real sector-scoping denominator bug and a stale UI copy claim about company-size scoping; both were corrected with targeted tests.
- FACT: The regulation timeline follow-up removed raw placeholder UX from a live hub detail surface without changing data contracts.
- FACT: PR `#329` initially failed `canonical-contract-drift` because six machine-readable contract files still referenced stale repo metadata from commit `fc7e38d03956d4a1892c1060984793cbd0456dd9`.
- FACT: Refreshing those `repo_ref.commit` values to the active branch lineage made the local canonical drift gate pass again.
- INTERPRETATION: The repo is not currently in a globally type-clean state, so branch readiness must rely on scoped regression evidence plus explicit blocker logging.
- RECOMMENDATION: Treat repo-wide type debt and repo-wide no-console debt as separate cleanup programs, not as blockers for reviewing this targeted Ask ISA hardening change.

## 9. Pull Request Readiness
- Branch name: `codex/ask-isa-user-value-reliability` (merged) and `codex/gap-analyzer-relevance-summary` (current)
- Base branch: `main`
- Repository: `GS1Ned/isa_web_clean`
- Active PR: `#329` (`Tighten Gap Analyzer summaries and live timeline fallback UX`)
- Proposed PR title: `Tighten Gap Analyzer summaries and live timeline fallback UX`
- Proposed PR summary:
  - Count only the ESRS requirements actually evaluated for non-general Gap Analyzer sector runs.
  - Clarify sector-scoped requirement counts and company-size context in the Gap Analyzer UI.
  - Remove placeholder milestone copy and the unwired timeline CTA from the live regulation timeline card.
  - Refresh canonical contract metadata so the active feature PR no longer fails the repo-ref freshness gate because of stale generated contract commits.
- Check status:
  - FACT: Focused tests passed locally.
  - FACT: Functional Ask ISA improvements merged via PR `#326`.
  - FACT: Metadata/governance follow-up is tracked in PR `#328`.
  - FACT: Gap Analyzer and regulation timeline follow-up changes are validated locally and are already published in PR `#329`.
  - FACT: `canonical-contract-drift` on PR `#329` failed because of stale repo-ref metadata and now passes locally after the refresh.
  - FACT: `no-console` and global `pnpm check` remain blocked by unrelated pre-existing errors.
- Merge / automerge status: UNKNOWN until refreshed commits are pushed and PR checks are rerun.

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
