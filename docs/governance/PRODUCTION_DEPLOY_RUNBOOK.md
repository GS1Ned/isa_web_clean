# ISA Production Deploy Runbook

Status: CANONICAL
Last reviewed: 2026-03-06
Scope: Manus-centered production authority, repo-proven deployment/runtime facts, and the remaining unresolved production-mechanics gap register.

## Production authority model

### Maintainer-confirmed current production truth

- Manus is the production host for ISA.
- Manus is the production publish/deploy authority.
- Manus is the central production operations hub for ISA.
- `main` is the canonical production source branch.
- Manus GitHub integration syncs with `main`.
- Manus live preview is the pre-publish verification surface.
- The Manus publish flow is preview/test first, then Publish.
- No separate staging environment is currently canonized.
- `https://www.gs1isa.com` is the canonical public production domain.
- `https://isa-standards-cozu6eot.manus.space` is the current Manus-hosted production/platform endpoint and is not automatically a staging environment.
- Friso is the project/business owner of `gs1isa.com` and `www.gs1isa.com`.
- Domain registration and operational domain management are currently handled through Manus.
- In the current live setup, Manus shows `gs1isa.com` registered with Manus and `www.gs1isa.com` connected.
- Production secrets, OAuth, and platform-side operational ownership belong to Manus.
- Manus handles hosting, deployment, custom-domain setup, and SSL/TLS.
- Manus Scheduled Tasks are the intended production scheduler for recurring ISA tasks.
- Production recurring task timezone is `Europe/Amsterdam`.
- Initial recurring schedule policy:
  - daily ingestion-style task: every weekday at `07:00` `Europe/Amsterdam`
  - weekly archival/cleanup-style task: every Sunday at `03:00` `Europe/Amsterdam`
- Scheduled tasks must be tested manually before they are enabled on a recurring schedule.

### Repo-proven current implementation truth

- The application builds with `pnpm build` and starts with `NODE_ENV=production pnpm start`. (`package.json`)
- The main server exposes `/health`, `/ready`, `/api/trpc`, and `/cron/*`. (`server/_core/index.ts`)
- `DB_ENGINE` is the canonical runtime engine selector. (`server/_core/env.ts`)
- GitHub Actions in this repository are validation-oriented; no repo workflow currently proves a production Manus deploy trigger. (`.github/workflows/`)

### Repo-first integration rule

- Repository code, config, scripts, and canonical docs remain the leading source of truth for ISA runtime behavior.
- Manus input is used here only for hosting/platform-boundary facts that the repository does not already own: hosting role, deploy/publish ownership, public production domain, Manus endpoint, and platform-side secret/OAuth ownership.
- Do not treat external Manus-side references to working branch names, staging labels, CLI commands, or unpublished platform mechanics as current repo truth unless they are codified in this repository.

## Operating boundary

- Repo-side agents may update code, docs, validation, and repo-side deployment narratives.
- Repo-side agents must not invent or silently assume Manus-side publish mechanics.
- Any change that alters production deployment behavior, live OAuth, production-only secrets, domain routing, or platform ingress belongs to Manus.

## Current production verification targets

- Canonical production source branch: `main`
- Pre-publish verification surface: Manus live preview
- Canonical public domain: `https://www.gs1isa.com`
- Manus platform endpoint: `https://isa-standards-cozu6eot.manus.space`
- App health endpoints:
  - `/health`
  - `/ready`
  - `/cron/health`

## Canonical production publish procedure

1. Ensure the desired production state is in `main`.
2. Verify the candidate release in Manus live preview.
3. Publish through Manus.
4. Verify production on:
   - `https://isa-standards-cozu6eot.manus.space`
   - `https://www.gs1isa.com`
   - documented app checks such as `/health`, `/ready`, and `/cron/health`

## Canonical production rollback policy

Primary rollback remains repo-first:

1. revert or fix on `main`
2. validate in Manus live preview
3. publish again through Manus

Do not treat Manus checkpoint/version-restore behavior as the primary rollback path unless it is later codified in this repository.

## Monitoring and ownership boundary

- Repo/app-side operational guidance owns application/runtime checks such as `/health`, `/ready`, `/cron/health`, and other checks documented in `docs/ops/RUNBOOK.md`.
- Manus owns the platform hosting/domain/publish surface for production.
- Do not infer a richer incident-management model from this boundary unless it is later documented in this repository.

## Unresolved production-mechanics gaps

| Gap ID | Gap | Why it matters | Current evidence | Recommended next action | Priority |
| --- | --- | --- | --- | --- | --- |
| MPG-001 | Exact Manus publish trigger mechanism is not codified in-repo | Without it, release and rollback steps stay guesswork | Manus ownership is confirmed; repo workflows do not show deploy automation | Document the exact live publish path used by the maintainer or Manus operator | high |

## Related current docs

- `docs/ops/DEPLOYMENT.md`
- `docs/ops/RUNBOOK.md`
- `docs/ops/CRON.md`
- `docs/governance/ISA_AGENT_PLATFORM_OPERATING_MODEL.md`
- `docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md`
