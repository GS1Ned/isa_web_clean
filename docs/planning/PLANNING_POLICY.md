# Planning Policy (canonical)

## Canonical planning sources (SSoT)
- `docs/planning/NEXT_ACTIONS.json` — next execution queue
- `docs/planning/BACKLOG.csv` — structured backlog
- `docs/planning/PROGRAM_PLAN.md` — support narrative (optional, non-canonical)

## Deprecated planning files
- `todo.md` — deprecated; point to `docs/planning/NEXT_ACTIONS.json` and `docs/planning/BACKLOG.csv`
## Rules
- Do not create new planning files elsewhere in the repo.
- If a planning document is discovered in other locations, either:
  - migrate its content into `docs/planning/NEXT_ACTIONS.json` or `docs/planning/BACKLOG.csv`, or
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
