# ISA — Agent Instructions (Canonical)

<!-- EVIDENCE:requirement:docs/governance/_root/ISA_GOVERNANCE.md -->
<!-- EVIDENCE:constraint:AGENTS.md -->
## Non-negotiables (evidence-first)
- Repo contents are the only source of truth. Documentation is a claim unless backed by code/config/tests.
- Label outputs explicitly as: FACT / INTERPRETATION / RECOMMENDATION.
- No secrets in code, logs, prompts, or commits.

## Autonomy & safety
<!-- EVIDENCE:constraint:scripts/refactor/validate_gates.sh -->
<!-- EVIDENCE:decision:docs/governance/MANUAL_PREFLIGHT.md -->
- Prefer deterministic, reproducible steps.
- Never run destructive commands unless explicitly required; if required, print a safe alternative first.
- Prefer CI-compatible solutions; avoid local-only assumptions.

## Terminal execution (blind-paste safe)
- When providing terminal actions: deliver exactly one pasteable block that writes a script to /tmp/*.sh and executes `bash /tmp/*.sh`.
- Script must:
  - `set -euo pipefail`
  - include PREFLIGHT + ACTION in the same run
  - emit one of: STOP=... / READY=... / DONE=...

## Repo workflow
<!-- EVIDENCE:requirement:.github/PULL_REQUEST_TEMPLATE.md -->
<!-- EVIDENCE:constraint:docs/governance/PLANNING_POLICY.md -->
- Do not commit to the default branch.
- Make minimal, reviewable commits with governance-grade messages.
- Prefer small diffs; avoid refactors unless necessary for the task.

## ISA-specific
<!-- EVIDENCE:requirement:data/metadata/dataset_registry.json -->
<!-- EVIDENCE:constraint:docs/DATASETS_CATALOG.md -->
- Prefer authoritative sources for regulatory/standards facts (EU institutions, GS1, official specs).
- If currency cannot be verified live, state it explicitly and downgrade confidence.
