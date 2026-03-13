# ISA Operations Runbook

Status: CURRENT (as-built)
Last reviewed: 2026-03-06
Scope: Routine operational checks and maintenance actions. This file does not own system architecture truth.

## Production operations authority

- Manus is the production operations hub for live ISA.
- `main` is the canonical production source branch.
- Manus live preview is the pre-publish verification surface.
- No separate staging environment is currently canonized.
- Use `https://www.gs1isa.com` as the canonical public production domain.
- Use `https://isa-standards-cozu6eot.manus.space` as the Manus-hosted production/platform endpoint when platform-specific verification is required.
- Friso is the project/business owner of `gs1isa.com` and `www.gs1isa.com`.
- Domain registration and operational domain management are currently handled through Manus.
- Production secrets, OAuth, and deploy/publish actions remain Manus-owned.
- Repo-side operators should use this runbook for validation and diagnosis, not to invent Manus-side deployment mechanics.

## Core checks

Run these first when verifying an environment:

```bash
pnpm run env:check
node scripts/check-env.js
pnpm check
```

For an end-to-end local preflight:

```bash
bash scripts/dev/local-doctor.sh
```

## Health and readiness

These endpoints are mounted by the main server entrypoint:

- `GET /health`
- `GET /ready`
- `GET /cron/health`

Expected use:

- `/health` for service and dependency health
- `/ready` for startup/readiness confirmation
- `/cron/health` for external scheduler verification

## Build and runtime

- Development server: `pnpm dev`
- Production build: `pnpm build`
- Production start: `NODE_ENV=production pnpm start`

Build outputs:

- client bundle: `dist/public`
- server bundle: `dist/index.js`

## Database routing checks

Current engine routing is controlled by `DB_ENGINE`:

- MySQL path:
  - `DB_ENGINE=mysql` or unset
  - requires `DATABASE_URL`
- Postgres path:
  - `DB_ENGINE=postgres`
  - requires `DATABASE_URL_POSTGRES`

Useful checks:

```bash
pnpm db:pg:bootstrap-local
pnpm db:pg:migrate
pnpm db:pg:smoke
```

`pnpm db:pg:bootstrap-local` is the one-command local parity path:
- starts Supabase Local
- writes `/tmp/isa-postgres-local.env`
- applies `drizzle_pg/` migrations
- seeds the foundation dataset subset
- runs the Postgres parity smoke

Use those only when validating the Postgres path.

## Cron operations

Cron guidance is consolidated in `docs/ops/CRON.md`.

Current runtime facts:

- `/cron/daily-news-ingestion` requires `Authorization: Bearer <CRON_SECRET>`
- `/cron/weekly-news-archival` requires `Authorization: Bearer <CRON_SECRET>`
- alert monitoring is started in-process on server startup via `scheduleAlertMonitoring()`
- Manus Scheduled Tasks are the intended production scheduler for recurring cron work.

## Triage order

If the app is unhealthy:

1. Verify env materialization with `pnpm run env:check`.
2. Confirm the intended DB engine and URL variables are present.
3. Check `/ready` before deeper debugging.
4. Rebuild and restart:
   - `pnpm build`
   - `NODE_ENV=production pnpm start`
5. Re-verify `/health` and `/ready`.
6. If the issue requires production rollback, apply the repo-first policy:
   - revert or fix on `main`
   - validate in Manus live preview
   - publish again through Manus
7. If the issue requires a platform-side deploy action, live OAuth change, production secret change, or live ingress/domain change, hand it off through Manus per `docs/governance/ISA_AGENT_PLATFORM_OPERATING_MODEL.md`.

## Monitoring and ownership boundary

- Repo-side operations own application/runtime verification using the documented checks in this repository.
- Manus owns the production platform hosting/domain/publish surface.
- This runbook does not define a broader incident-management model than that boundary.

## Host ↔ VM OpenClaw operations

For VM-targeted OpenClaw runtime procedures, use the canonical workflow in `AGENT_START_HERE.md`.

Do not duplicate that host/VM operating model here.

## Related documents

- `docs/ops/DEPLOYMENT.md`
- `docs/ops/CRON.md`
- `docs/governance/PRODUCTION_DEPLOY_RUNBOOK.md`
- `AGENT_START_HERE.md`
