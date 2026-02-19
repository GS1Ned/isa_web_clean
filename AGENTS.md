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

## Tooling: MCP
- Canonical policy: `docs/agent/MCP_POLICY.md`
- Default behavior:
  - Use `filesystem` + `git` for repo-truth claims and edits.
  - Use `fetch` first for external evidence; escalate to `playwright` for JS-rendered sources.

## Documentation Hygiene (Global)
- Use integrate-first mode for all work, not only MCP.
- Do not create ad-hoc report artifacts by default.
- Classify findings as `INTEGRATE_NOW`, `RESOLVE_NOW`, or `DROP_NOW` per `docs/agent/MCP_POLICY.md`.
- Resolve uncertainty in the same run or drop it; do not commit unresolved documentation claims.
- Run `python scripts/validate_planning_and_traceability.py` before finalizing doc-heavy changes.

## ISA-specific
- Prefer authoritative sources for regulatory/standards facts (EU institutions, GS1, official specs).
- If currency cannot be verified live, state it explicitly and downgrade confidence.
