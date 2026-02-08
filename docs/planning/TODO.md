# ISA — Planning TODO (canonical)

- status: live
- last_verified_date: `2026-02-08`
- canonical: yes (this is the single canonical TODO for ISA planning)

## How to use (for Manus + humans)

- Add only short, actionable next steps here.
- For larger work items, add/update `docs/planning/BACKLOG.csv` and reference the `BACKLOG_ID` here.
- Keep this file small (prefer ≤ 30 open items). Archive completed items to `docs/planning/_archive/TODO_DONE_<YYYY-MM>.md` if needed.

## Current next actions

- [ ] (P0) Confirm `todo.md` (root) links to this file and is treated as the lightweight daily checklist.
- [ ] (P0) Ensure `.gitignore` covers both evidence output dirs: `docs/evidence/_generated/` and `docs/evidence/generated/_generated/`.
- [ ] (P0) Ensure repo-assessment outputs under `docs/reports/` remain gitignored and reproducible via `scripts/audit/repo_assessment.sh`.
- [ ] (P1) Golden Gate: add a rule to fail if a duplicate root `TODO.md` appears again.
- [ ] (P1) Consolidate planning/roadmap documents: all non-live roadmaps must be archived under `isa-archive/planning/roadmaps/` (per planning canon).

## Links

- Backlog: `docs/planning/BACKLOG.csv`
- Planning policy: `docs/planning/PLANNING_POLICY.md`
- Normative canon: `docs/governance/PLANNING_TRACEABILITY_CANON.md`
