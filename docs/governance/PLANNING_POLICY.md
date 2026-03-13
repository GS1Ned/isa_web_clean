# Planning Policy (canonical)

<!-- EVIDENCE:requirement:docs/planning/NEXT_ACTIONS.json -->
<!-- EVIDENCE:requirement:docs/planning/BACKLOG.csv -->
## Canonical planning sources (SSoT)
- `docs/planning/NEXT_ACTIONS.json` — next execution queue
- `docs/planning/BACKLOG.csv` — structured backlog

## Optional planning narrative
- A support narrative may exist under `docs/planning/` when useful.
- It is never canonical unless explicitly promoted by governance.
- No specific narrative file is required.

## Deprecated planning files
<!-- EVIDENCE:decision:todo.md -->
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
<!-- EVIDENCE:requirement:docs/spec/TRACEABILITY_MATRIX.csv -->
- `docs/spec/TRACEABILITY_MATRIX.csv` must not contain TODO/FIXME/TBD/BLOCKED/HACK/NEXT markers.
- If `BACKLOG_ID` is present, `BACKLOG_STATUS` must also be present.

## CI guardrails
<!-- EVIDENCE:requirement:docs/governance/NO_GATES_WINDOW.md -->
<!-- EVIDENCE:requirement:docs/governance/MANUAL_PREFLIGHT.md -->
<!-- EVIDENCE:implementation:.github/workflows/ -->
- During `docs/governance/NO_GATES_WINDOW.md`, workflow runs are advisory and non-blocking.
- Required pre-merge discipline is the deterministic manual checklist in `docs/governance/MANUAL_PREFLIGHT.md`.
- Only claim "enforced" when a rule maps to an active gate workflow file or a deterministic manual command in canonical preflight docs.

## Documentation sprawl guardrail (repo-wide linkage)
- Integration-first mode is mandatory across all work, not only planning/MCP (`docs/agent/MCP_POLICY.md`).
- New markdown artifacts must stay in canonical locations such as `docs/planning/`, `docs/governance/`, `docs/spec/`, `docs/ops/`, or governed archive/support locations, and must avoid ad-hoc report-style files.
- Enforced by `python scripts/validate_planning_and_traceability.py`.
