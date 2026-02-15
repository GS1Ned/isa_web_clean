# ISA Baseline (Repo-Extracted)

Last verified date: 2026-02-15

## FACT

### Canonical Entrypoints (Server + Client)
- Server runtime entrypoint: `server/_core/index.ts` (used by `package.json` scripts `dev` and `build`).
- Client runtime entrypoint: `client/src/main.tsx` (React root and tRPC client wiring).
- Client routing shell: `client/src/App.tsx` (route graph and lazy-loading strategy).

### Runtime Shape
- Server: Node.js + Express HTTP server with tRPC middleware mounted at `/api/trpc` and explicit health/readiness endpoints (`/health`, `/ready`). Paths: `server/_core/index.ts`.
- Client: React + TanStack Query + tRPC client using HTTP batching. Path: `client/src/main.tsx`.

### API Layer + Typing Boundaries
- tRPC router composition is defined in `server/routers.ts` with multiple sub-routers under `server/routers/`.
- Shared constants are imported from `shared/` (example: `shared/const`).
- Type boundary note: `server/routers.ts` is annotated `// @ts-nocheck` (typing is not fully enforced in that module).

### Data Layer + Migrations
- ORM/migrations: Drizzle. Config: `drizzle.config.ts`.
- Schema sources: `drizzle/schema.ts` and feature schemas `drizzle/schema_*.ts`.
- SQL migrations live under `drizzle/` and `drizzle/migrations/`.
- DB connectivity helpers: `server/db-connection.ts` (MySQL URL parsing and SSL normalisation).

### Existing Tracing / Metrics / Logging (and Where)
- Structured logging shim: `server/utils/server-logger.ts` (JSON lines to stdout/stderr; optional persistence hook).
- Persisted error ledger wiring: `server/_core/logger-wiring.ts` (inserts into `error_ledger` when DB is available).
- Pipeline execution metrics/logging: `server/utils/pipeline-logger.ts` + DB schema `drizzle/schema_pipeline_observability.ts`.
- Performance monitoring utilities: `server/_core/performance-monitoring.ts` and routers `server/router-performance-tracking.ts`.
- Error tracking utilities: `server/_core/error-tracking.ts` and router `server/router-error-tracking.ts`.

### CI Gates + Validation Scripts
- GitHub Actions workflows present (selection):
  - Schema validation for JSON artefacts: `.github/workflows/schema-validation.yml`.
  - Docs/planning validation: `.github/workflows/validate-docs.yml` which runs `scripts/validate_planning_and_traceability.py`.
  - Refactoring gates: `.github/workflows/refactoring-validation.yml` which runs `scripts/refactor/validate_gates.sh`.
  - Additional workflow inventory: `ask-isa-runtime-smoke.yml, ask-isa-smoke.yml, catalogue-checks.yml.disabled, console-check.yml.disabled, generate-embeddings-optimized.yml.disabled, generate-embeddings.yml.disabled, iron-gate.yml.disabled, q-branch-ci.yml, refactoring-validation.yml, repo-tree.yml, schema-validation.yml, update-gs1-efrag-catalogue.yml.disabled, validate-docs.yml`.

### No-Output-API (Strict) Enforcement Locations
- ESLint rule configuration: `.eslintrc.server.json` (scripts are exempted; server rule exists).
- CI workflow present but disabled: `.github/workflows/console-check.yml.disabled`.
- Validation gate in existing benchmark validator: `scripts/validate_oss_benchmarks_2026_02_15.sh`.

## INTERPRETATION
- ISA already has governance-grade elements (schema validation workflow, planning/traceability validation, refactoring gates), but enforcement is uneven across the full repo (not all workflows are enabled; some are scoped to `main`).
- Observability is implemented primarily via a custom logger and DB-backed ledgers rather than standard tracing stacks.

## RECOMMENDATION
- N/A (baseline-only). See `ISA_ACTION_PLAN.md` for minimal-change recommendations.

## NOT FOUND (with searches attempted)
- OpenTelemetry / Prometheus / Sentry integration: NOT FOUND.
  - Searches attempted:
    - rg -n "openTelemetry|opentelemetry|otel|sentry|prometheus" server shared .github/workflows config scripts
- Dedicated docs site generator config (MkDocs/Docusaurus): NOT FOUND.
  - Searches attempted:
    - rg -n "mkdocs|docusaurus" docs .github/workflows
