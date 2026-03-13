# ISA OpenClaw Heartbeat

Follow this checklist on each heartbeat tick.

## Always-On Checklist
- Run `openclaw doctor` when the command is available and capture only actionable failures.
- Run `openclaw update status` when available and note pending upgrades without auto-upgrading.
- Run `openclaw security audit` when available and classify any findings by severity.
- Run `openclaw skills check` and compare missing requirements against recent WAL failures.
- If a capability gap blocks user value, use `clawhub` and `find-skills` to search for a safer skill before inventing a workflow.
- If the same failure recurs twice in WAL, propose one deterministic fix and record it before retrying.
- Only choose next actions that are aligned with canonical ISA repo evidence; do not invent new roadmap items.
- When a validation bundle references a package script as `pnpm <name>` and pnpm returns usage output, retry it as `pnpm run <name>` and record the correction in WAL.
- When autonomy-managed project skills exist under `.agents/skills`, do not run `scripts/validate_planning_and_traceability.py` as part of the lightweight runtime heartbeat, because that validator is scoped to canonical markdown paths rather than runtime skill bundles.

## Daily Maintenance Checklist
- Review cron job health and last run status.
- Review runtime memory status and ensure workspace memory paths exist.
- Review session logs for repeated operational regressions.
- Refresh the working buffer with one next-best automation experiment.

## Constraints
- No secrets in WAL or runtime notes.
- No destructive actions.
- Prefer additive changes, deterministic scripts, and existing repo automation surfaces.
