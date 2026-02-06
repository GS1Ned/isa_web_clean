# Planning Policy (canonical)

## Canonical "live" planning sources
- `docs/planning/TODO.md` — short, human-readable next actions
- `docs/planning/BACKLOG.csv` — structured backlog with status/priority/owner

## Rules
- Do not create new planning files elsewhere in the repo.
- If a planning document is discovered in other locations, either:
  - migrate its content into `TODO.md` or `BACKLOG.csv`, or
  - archive it under `isa-archive/` and add a superseded banner.

## Backlog workflow
- New work starts as a row in `BACKLOG.csv` with `status=OPEN`.
- When completed: set `status=DONE`.
- If invalid/outdated: set `status=CANCELLED` with a short explanation in `next_action` or `acceptance`.
