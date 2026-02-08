# Planning Policy (canonical)

## Canonical "live" planning sources
- `docs/planning/todo.md` — short, human-readable next actions
- `docs/planning/BACKLOG.csv` — structured backlog with status/priority/owner

## Rules
- Do not create new planning files elsewhere in the repo.
- If a planning document is discovered in other locations, either:
  - migrate its content into `todo.md` or `BACKLOG.csv`, or
  - archive it under `isa-archive/` and add a superseded banner.

## Backlog workflow
- New work starts as a row in `BACKLOG.csv` with `status=OPEN`.
- When completed: set `status=DONE`.
- If invalid/outdated: set `status=CANCELLED` with a short explanation in `next_action` or `acceptance`.

## Roadmaps
- Roadmaps are not live planning sources.
- Roadmap documents must be archived under `isa-archive/planning/roadmaps/`.

## Traceability coupling
- `docs/spec/TRACEABILITY_MATRIX.csv` must not contain TODO/FIXME/TBD/BLOCKED/HACK/NEXT markers.
- If `BACKLOG_ID` is present, `BACKLOG_STATUS` must also be present.

## CI guardrails
- CI enforces the rules above (validate-docs workflow).
- If CI fails, fix the policy violation before any other changes.
