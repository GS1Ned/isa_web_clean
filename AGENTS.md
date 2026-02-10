# ISA — Agent Instructions (Canonical)

## Non-negotiables (evidence-first)
- Repo contents are the only source of truth. Documentation is a claim unless backed by code/config/tests.
- Label outputs explicitly as: FACT / INTERPRETATION / RECOMMENDATION.
- No secrets in code, logs, prompts, or commits.

## Autonomy & safety
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
- Do not commit to the default branch.
- Make minimal, reviewable commits with governance-grade messages.
- Prefer small diffs; avoid refactors unless necessary for the task.

## ISA-specific
- Prefer authoritative sources for regulatory/standards facts (EU institutions, GS1, official specs).
- If currency cannot be verified live, state it explicitly and downgrade confidence.
