# Conflict Plan Decisions (2026-02-10)

Status: DECISION_PROPOSED only
Date: 2026-02-10
Baseline evidence commit: c8a032adc197a41bdcde1d2ae5605a5f6caaca72

---

## DECISION_PROPOSED: D-2026-02-10-SSOT

### Title
Planning single source of truth (SSoT) canonicalization

### Proposal
Canonical planning SSoT is exactly:
- `docs/planning/NEXT_ACTIONS.json`
- `docs/planning/BACKLOG.csv`

`todo.md` is DEPRECATED and must point to the canonical pair above.

`docs/planning/PROGRAM_PLAN.md` is SUPPORT only (narrative, optional) and not a canonical planning anchor.

### Evidence
- `AGENT_START_HERE.md:10`
- `AGENT_START_HERE.md:19`
- `docs/planning/PLANNING_POLICY.md:4`
- `docs/planning/INDEX.md:4`
- `docs/governance/PLANNING_TRACEABILITY_CANON.md:3`
- `docs/agent/AGENT_MAP.md:7`
- `docs/INDEX.md:17`
- `scripts/validate_planning_and_traceability.py:5`
- `scripts/validate_planning_and_traceability.py:26`

### Impact
Removes contradictory planning authority and aligns docs, validator messaging, and agent navigation.

---

## DECISION_PROPOSED: D-2026-02-10-PLANNING-CLASSIFICATION

### Title
Classification of planning backbone artifacts for governance usage

### Proposal
- `CAPABILITY_INVENTORY.md` classification: `DERIVED` (planning-recon output, rewrite-on-refresh).
- `EXECUTION_LOG.md` classification: `ENFORCEMENT_SUPPORT` (planning-audit log, append-only).

Permanence is marked as `INSUFFICIENT EVIDENCE` because both files are absent on `origin/main` at the baseline commit.

### Evidence
- `git ls-tree -r --name-only origin/main docs/planning`
- `git cat-file -e origin/main:docs/planning/CAPABILITY_INVENTORY.md` (missing)
- `git cat-file -e origin/main:docs/planning/EXECUTION_LOG.md` (missing)

### Impact
Defines governance handling for planning artifacts without falsely asserting canonical permanence.

---

## DECISION_PROPOSED: D-2026-02-10-CI-PRECEDENCE

### Title
Policy precedence for CI activity vs blocking-gate claims

### Proposal
`NO_GATES` policy governs blocking status. Documentation must separate:
- active workflows (fact, repository-tracked file state)
- blocking gates (policy)

Claims of "enforced" are allowed only when mapped to:
- active tracked workflow files in `origin/main`, or
- deterministic manual commands in canonical preflight docs.

### Evidence
- `docs/governance/NO_GATES_WINDOW.md:7`
- `docs/governance/NO_GATES_WINDOW.md:10`
- `docs/spec/README.md:116`
- `git ls-tree -r --name-only origin/main .github/workflows`
- `gh workflow list`
- `gh api repos/GS1Ned/isa_web_clean/actions/workflows`

### Impact
Prevents false enforcement claims and keeps policy language compatible with NO_GATES operation.
