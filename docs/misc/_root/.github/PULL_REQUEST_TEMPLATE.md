## Summary

<!-- Short description of what this PR does -->

## IRON Protocol Context Acknowledgement

<!-- 
REQUIRED: Run ./scripts/iron-context.sh and paste the output below.
PRs without this block will fail the IRON Gate check.
-->

Context-Commit-Hash: <!-- paste commit hash here -->

**Context Acknowledgement:**
- **Inventory:** Reviewed `isa.inventory.json` (commit: `<!-- paste hash -->`)
- **Roadmap:** <!-- current priority from ROADMAP.md -->
- **Protocol:** This task adheres to the IRON Protocol.

## Trace ID(s)
- trace_id: <!-- e.g. 123e4567-e89b-12d3-a456-426614174000 -->

## Repro test(s)
- tests/repro/<traceId>.test.ts (failing before the fix; passing after)

## Changes
- What changed (files, high-level explanation)

## Remediation plan
- Short plan and rollback instructions

## Checklist (Manus / CI must validate)
- [ ] Repro test exists and demonstrates the failure
- [ ] CI runs repro-harness and repro test passes
- [ ] serverLogger persisted (migration applied in dev)
- [ ] No server-side console.error or console.warn remain
- [ ] Trace id(s) referenced in PR body and in error_ledger remediation_attempts

## Notes for reviewers
- Pay attention to any `serverLogger` import paths
- Check multi-argument console replacements: ensure `serverLogger.error(error, { meta })` used where appropriate
