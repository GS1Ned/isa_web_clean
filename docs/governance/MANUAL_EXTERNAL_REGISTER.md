# Manual & External Register (Canonical)
Status: CANONICAL

## Purpose
This register tracks planning items that are external/manual by nature and therefore not suitable for deterministic repo gates.

## Snapshot (2026-03-05)
### Completed external action
- `TM-002` (`GOV-068`) is completed.
- Action executed: branch protection enabled on `main` in GitHub.
- Verification:
  - `gh api repos/GS1Ned/isa_web_clean/branches/main | jq '{name, protected, protection}'`
  - Expected state: `"protected": true`

### Cancelled as external/manual-only backlog
- `TM-018` (`ING-044`): Desktop browser QA check (human visual test), not CI-deterministic.
- `TM-026` (`ING-087`): UI rendering verification (human visual test), not CI-deterministic.
- `TM-055` (`OBS-011`): Cookie banner depends on legal decision gate; legal trigger not active in this tranche.
- `TM-056` (`OBS-017`): Load-testing campaign is an ops exercise, outside this repo's deterministic planning lane.

## Reopen criteria
- Reopen any item above if one of the following becomes true:
  - A deterministic automated test/gate is introduced in-repo.
  - A legal/policy decision is made that changes required implementation scope.
  - A release-plan milestone explicitly requires execution evidence in this repo.
