# ISA Baseline (strict-no-console) - 2026-02-15

Baseline commit (for evidence links): `e91943c`

## FACT

### Canonical Entrypoints and Runtime Shape
- Server entrypoint: `server/_core/index.ts`
  - Evidence: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/server/_core/index.ts
  - Express server + HTTP server
  - Health endpoints: `/health`, `/ready`
  - tRPC mounted at `/api/trpc`
  - Vite dev server in development; static serving in production
- Client entrypoint: `client/src/main.tsx`
  - Evidence: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/client/src/main.tsx
  - React root + TanStack Query
  - tRPC client via `httpBatchLink` to `/api/trpc`
- Vite runtime shape: `vite.config.ts`
  - Evidence: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/vite.config.ts

### API Layer and Typing Strategy
- API transport: tRPC (Express adapter)
  - Evidence: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/server/_core/index.ts
- Router composition: `server/routers.ts`
  - Evidence: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/server/routers.ts
- tRPC initialization + middleware boundaries: `server/_core/trpc.ts`
  - Evidence: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/server/_core/trpc.ts
  - Uses `superjson` transformer
  - Procedure tiers: `publicProcedure`, `protectedProcedure`, `adminProcedure`
- Context creation (auth optional for public procedures): `server/_core/context.ts`
  - Evidence: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/server/_core/context.ts
- Request/response typing: TypeScript end-to-end; input validation observed via `zod` usage in routers
  - Example evidence: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/server/routers.ts

### Data Layer
- ORM: Drizzle ORM (MySQL driver)
  - Evidence: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/server/db.ts
- Connection: `mysql2/promise` pool with SSL normalization via DATABASE_URL query params
  - Evidence: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/server/db-connection.ts
- Schema source of truth: `drizzle/schema`
  - Evidence: https://github.com/GS1Ned/isa_web_clean/tree/e91943c/drizzle/schema

### Logging, Error Tracking, Metrics, Tracing
- Server logger facade (structured JSON; optional persistence): `server/utils/server-logger.ts`
  - Evidence: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/server/utils/server-logger.ts
- Logger wiring (persist to `error_ledger` when DB is available): `server/_core/logger-wiring.ts`
  - Evidence: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/server/_core/logger-wiring.ts
- Error tracking store + notification hooks: `server/_core/error-tracking.ts`
  - Evidence: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/server/_core/error-tracking.ts
- Performance monitoring utilities: `server/_core/performance-monitoring.ts`
  - Evidence: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/server/_core/performance-monitoring.ts

### Configuration Strategy
- Environment template: `.env.example`
  - Evidence: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/.env.example
- Fail-fast environment validation (prints variable names only): `server/_core/env.ts`
  - Evidence: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/server/_core/env.ts

### Existing CI Gates and Validation Scripts
- Docs governance validation: `.github/workflows/validate-docs.yml` -> `scripts/validate_planning_and_traceability.py`
  - Evidence: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/.github/workflows/validate-docs.yml
  - Evidence: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/scripts/validate_planning_and_traceability.py
- JSON schema validation (AJV CLI): `.github/workflows/schema-validation.yml`
  - Evidence: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/.github/workflows/schema-validation.yml
- Refactoring gates: `.github/workflows/refactoring-validation.yml` -> `scripts/refactor/validate_gates.sh`
  - Evidence: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/.github/workflows/refactoring-validation.yml
  - Evidence: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/scripts/refactor/validate_gates.sh

### Where strict-no-console Is Enforced
- ESLint server rules file present: `.eslintrc.server.json`
  - Evidence: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/.eslintrc.server.json
  - Observed rule: `no-console` error (with `log` allowed)
- CI workflow to check disallowed console methods exists but is disabled:
  - File: `.github/workflows/console-check.yml.disabled`
  - Evidence: https://github.com/GS1Ned/isa_web_clean/blob/e91943c/.github/workflows/console-check.yml.disabled
- Active CI workflow enforcing strict no-console usage:
  - NOT FOUND
  - Searches performed:
    - `rg -n "console-check" .github/workflows -S`
    - `rg -n "no-console" .github/workflows -S`
    - `rg -n "console\\." server client shared scripts -S` (scoped)

## INTERPRETATION
- ISA already has a logger facade (`serverLogger`) and an error ledger persistence path; the benchmark package should map external patterns to this mechanism rather than introducing ad-hoc output.

## RECOMMENDATION
- Treat `serverLogger` and the error ledger wiring as the default path for runtime observability changes.
- Keep strict-no-console enforcement scoped and explicit in future CI gates, to avoid false positives from non-code text.
