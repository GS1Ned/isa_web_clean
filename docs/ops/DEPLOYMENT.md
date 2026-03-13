# ISA Deployment

Status: CURRENT (as-built)
Last reviewed: 2026-03-06
Scope: Current deployment/runtime guidance. Architecture authority remains `docs/spec/ARCHITECTURE.md` and `docs/spec/ISA_DATA_PLANE_ARCHITECTURE.md`.

## Manus-confirmed production authority

- Manus is the production host, publish/deploy authority, and central production operations hub for ISA.
- `main` is the canonical production source branch.
- Manus GitHub integration syncs with `main`.
- Manus live preview is the pre-publish verification surface.
- The Manus publish flow is preview/test first, then Publish.
- No separate staging environment is currently canonized.
- `https://www.gs1isa.com` is the canonical public production domain.
- `https://isa-standards-cozu6eot.manus.space` is the live Manus-hosted production/platform endpoint and is not automatically a staging environment.
- Friso is the project/business owner of `gs1isa.com` and `www.gs1isa.com`.
- Domain registration and operational domain management are currently handled through Manus.
- Production secrets, OAuth, and platform-side operational ownership belong to Manus.
- Manus handles hosting, deployment, custom-domain setup, and SSL/TLS.

## Repo-proven current runtime facts

- Build the application with `pnpm build`. (`package.json`)
- Start the production server with `NODE_ENV=production pnpm start`. (`package.json`)
- The server exposes `/health`, `/ready`, `/api/trpc`, and the `/cron/*` endpoints from the main Express entrypoint. (`server/_core/index.ts`)
- Runtime database routing is engine-aware:
  - `DB_ENGINE=mysql` (default) uses `DATABASE_URL`
  - `DB_ENGINE=postgres` uses `DATABASE_URL_POSTGRES`
  (`server/_core/env.ts`, `server/db.ts`)
- CI validates a Postgres parity path on `main` via the `postgres-parity-foundation` job. (`.github/workflows/tiered-tests.yml`)

## Explicitly unresolved in-repo

The repository still does **not** codify:

- the exact Manus publish trigger mechanism

Track those gaps in `docs/governance/PRODUCTION_DEPLOY_RUNBOOK.md`.

## Deployment preflight

1. Install dependencies with `pnpm install --frozen-lockfile`.
2. Materialize local env from `.env.example` or `.env.supabase.example`.
3. Run `pnpm run env:check`.
4. Run `pnpm check`.
5. If validating the Postgres path, run:
   - `pnpm db:pg:bootstrap-local`
   - or, for split-step diagnostics:
     - `pnpm db:pg:migrate`
     - `pnpm db:pg:smoke`
6. Build with `pnpm build`.
7. Start with `NODE_ENV=production pnpm start`.
8. Verify:
   - `GET /health`
   - `GET /ready`
   - `GET /cron/health`
9. Validate the candidate release in Manus live preview before publish.
10. Publish through Manus only after preview verification passes.
11. Verify production on:
    - `https://isa-standards-cozu6eot.manus.space`
    - `https://www.gs1isa.com`
    - the documented app health/readiness checks above

## Canonical rollback policy

Primary rollback remains repo-first:

1. revert or fix on `main`
2. validate in Manus live preview
3. publish again through Manus

Do not treat checkpoint/version-restore behavior as the canonical rollback path unless it is later documented in this repository.

## Runtime surface to verify after deploy

| Surface | Purpose | Source |
| --- | --- | --- |
| `/health` | overall health | `server/_core/index.ts` |
| `/ready` | readiness | `server/_core/index.ts` |
| `/api/trpc` | application API | `server/_core/index.ts` |
| `/cron/health` | cron health check | `server/_core/index.ts` |
| `/cron/daily-news-ingestion` | protected cron trigger | `server/_core/index.ts` |
| `/cron/weekly-news-archival` | protected cron trigger | `server/_core/index.ts` |

## Production authority boundary

- Repo-side work may prepare deployment-ready code, docs, validation, and release notes.
- Production deployment changes, platform-side secret handling, OAuth changes, and live ingress/domain changes remain Manus-owned work.
- Repo-side operational guidance owns application/runtime verification; Manus owns the platform hosting/domain/publish surface.
- External Manus-side material may confirm hosting/platform ownership, but it does not define repo-side deploy mechanics beyond the policy recorded here and in `docs/governance/PRODUCTION_DEPLOY_RUNBOOK.md`.
- `.github/workflows/release-artifacts.yml` is a manual release-artifact workflow, not a deploy workflow.
- `.github/workflows/q-branch-ci.yml` targets `isa_web_clean_Q_branch` and should be treated as historical/stale, not as current deployment authority.
- `vite.config.ts` still includes Manus runtime plugin/host allowances, which is consistent with Manus-centered production hosting.

## Related documents

- `docs/ops/RUNBOOK.md`
- `docs/ops/CRON.md`
- `docs/governance/PRODUCTION_DEPLOY_RUNBOOK.md`
- `AGENT_START_HERE.md`
