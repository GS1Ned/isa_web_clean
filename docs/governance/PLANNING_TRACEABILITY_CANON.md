# Planning & Traceability Canon (normative)

## Live planning sources (only)
- `docs/planning/todo.md`
- `docs/planning/BACKLOG.csv`

## Roadmaps
- Roadmaps are not live planning sources.
- Roadmap documents must be archived under `isa-archive/planning/roadmaps/`.

## Traceability
- `docs/spec/TRACEABILITY_MATRIX.csv` must not contain TODO/FIXME/TBD/BLOCKED/HACK/NEXT markers.
- If `BACKLOG_ID` is present in `TRACEABILITY_MATRIX.csv`, `BACKLOG_STATUS` must also be present.
- Backlog items that affect traceability should link via `BACKLOG_ID` and maintain `BACKLOG_STATUS`.

## CI guardrails
- CI enforces:
  - only the allowed planning files exist under `docs/planning/`
  - no roadmap/work-packages folders reappear
  - traceability/backlog consistency rules above
