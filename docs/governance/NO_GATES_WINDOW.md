# NO_GATES WINDOW (Temporary)
Date: 2026-02-09
Status: ACTIVE (TEMPORARY)
Scope: Entire repository

## Intent (Non-negotiable)
Until the ISA Core reset reaches the "Gate Reintroduction Milestone", CI gates are disabled to avoid friction during rapid refactor and scaffold stabilization.

## Rules during the window
- Do not rely on CI for correctness.
- All canonical planning and navigation must remain consistent.
- Any drift must be recorded as evidence in PR descriptions and/or docs.

## Manual discipline (required)
- Before merging, run the local preflight command set defined in docs/planning/INDEX.md (or equivalent manual checklist).
- Keep planning canonical sources consistent (`docs/planning/NEXT_ACTIONS.json` + `docs/planning/BACKLOG.csv`).
- Treat active workflow files as advisory telemetry only until gates are explicitly reintroduced.

## Stop criteria (Gate Reintroduction Milestone)
Gates must be reintroduced and made non-negotiable when:
1) ISA Core scaffold is frozen (canonical anchors stable)
2) Planning canon is stable (NEXT_ACTIONS schema + procedures)
3) Repo hygiene baseline is defined (artefact policy, ignore rules)
4) Manus is about to start autonomous development on the core capabilities

After STOP: CI gates become mandatory for every PR.
