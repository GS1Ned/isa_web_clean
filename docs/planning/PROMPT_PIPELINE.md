Last_verified: 2026-02-10
Scope: Canonical prompt pipeline for P0->P2 repository analysis in READ-ONLY mode.
Rules:
- Evidence-first: include file paths + short excerpts or command output for every claim.
- STOP: if conflicts or missing blocking artifacts create authority ambiguity, stop and request human decision.
- Secrets: record names only; never print values.

# PROMPT_PIPELINE

## P0 Prompt (READ-ONLY)
Objective: Determine whether execution can continue safely.

Required checks:
- G1 Coverage proof across top-level directories and risk-rated blind spots.
- G2 Canonical authority map for governance/spec/planning/agent entrypoints.
- G3 Execution safety evidence (read/write discipline, STOP, conflict lifecycle, secrets handling).
- G4 Reproducibility baseline (install/build/test/lint/dev/run commands + CI steps).
- G5 Initial 6-capability inventory with implementation entrypoints.
- G6 Drift detection: formal-but-unenforced and doc->code drift.
- G7 Knowledge gaps with severity and acquisition path.

Output targets:
- `docs/planning/EXECUTION_LOG.md`
- `docs/planning/KNOWLEDGE_GAP_REGISTER.md`
- `docs/evidence/EVIDENCE_LEDGER.md`

## P1 Prompt (READ-ONLY)
Objective: Reconstruct delivery maturity from repository reality.

Required checks:
- Extract TODO/FIXME/HACK/XXX/stubs/placeholders/commented-out code.
- Build feature inventory per capability with evidence categories: existence/completeness/usage/tests/CI.
- Score feature maturity (0-5) and summarize by capability.
- Detect half-wired pipelines, config-without-code, interface-without-implementation.

Output targets:
- `docs/planning/WORK_INVENTORY.md`
- `docs/planning/CAPABILITY_INVENTORY.md`
- `docs/evidence/EVIDENCE_LEDGER.md`
- `docs/planning/EXECUTION_LOG.md`

## P2 Prompt (READ-ONLY)
Objective: Produce canonicalization decision proposals only.

Required checks:
- Identify canonical conflicts and validator/document inconsistencies.
- Produce PROPOSED decision entries with options, evidence, impact, minimal changeset, rollback, guards.
- Update knowledge gaps for decision-required items and resolve-by phase.

Output targets:
- `docs/decisions/DECISION_LOG.md` (PROPOSED only)
- `docs/planning/KNOWLEDGE_GAP_REGISTER.md`
- `docs/planning/EXECUTION_LOG.md`

## Gate Behavior
- If P0 = `NO_GO`, do not run P1/P2.
- Human confirmation is required before any WRITE beyond backbone/evidence/decision artifact updates.
