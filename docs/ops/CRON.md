# ISA Cron Operations

Status: CURRENT (as-built)
Last reviewed: 2026-03-06
Scope: Current operational guidance for ISA cron endpoints and external scheduler setup.

## Production authority boundary

- Production cron secrets are Manus-owned production secrets.
- Manus Scheduled Tasks are the intended production scheduler for recurring ISA tasks.
- Use `https://www.gs1isa.com` as the canonical public production host for scheduler targeting unless Manus-specific verification requires the platform endpoint.
- Use `https://isa-standards-cozu6eot.manus.space` only as the Manus production/platform endpoint; it is not a separate canonized staging environment.
- Production recurring task timezone is `Europe/Amsterdam`.

## Confirmed current endpoints

These routes are mounted in `server/_core/index.ts` and implemented in `server/cron-endpoint.ts`.

| Method | Endpoint | Auth | Purpose |
| --- | --- | --- | --- |
| `GET` | `/cron/health` | No | health check for scheduler verification |
| `GET` | `/cron/daily-news-ingestion` | `Bearer <CRON_SECRET>` | trigger daily news ingestion |
| `GET` | `/cron/weekly-news-archival` | `Bearer <CRON_SECRET>` | trigger weekly archival |

## Required secret

Set `CRON_SECRET` in the runtime secrets store or local `.env`.

Do not:

- commit the secret
- reuse an old shared value
- copy historical token values from legacy docs

If any prior cron token was ever committed or shared, rotate it before using these endpoints.

## Canonical production scheduler contract

For production recurring tasks, configure Manus Scheduled Tasks to:

1. send an HTTP `GET` request
2. add the header `Authorization: Bearer <CRON_SECRET>`
3. target the canonical public host `https://www.gs1isa.com`
4. use timezone `Europe/Amsterdam`
5. be tested manually before enabling recurrence

## Safe manual test

```bash
BASE_URL="https://<your-public-isa-host>"
CRON_SECRET="<your-current-cron-secret>"

curl "$BASE_URL/cron/health"

curl -X GET \
  -H "Authorization: Bearer $CRON_SECRET" \
  "$BASE_URL/cron/daily-news-ingestion"

curl -X GET \
  -H "Authorization: Bearer $CRON_SECRET" \
  "$BASE_URL/cron/weekly-news-archival"
```

## Scheduling guidance

Current production schedule policy is:

- daily ingestion-style task: every weekday at `07:00` `Europe/Amsterdam`
- weekly archival/cleanup-style task: every Sunday at `03:00` `Europe/Amsterdam`

If the production schedule changes, update this file and `docs/governance/PRODUCTION_DEPLOY_RUNBOOK.md` together.

## Important current limits

- The repository does not currently contain a live `.github/workflows/isa-news-cron.yml` workflow. Older GitHub Actions cron instructions are preserved only as deprecated redirects.
- Production scheduler configuration belongs here, not in architecture docs.
- The in-process alert monitor started by `scheduleAlertMonitoring()` is separate from the external cron endpoints.

## Legacy paths

Older cron setup files under `ops/cron/` and `docs/CRON_QUICK_START.md` are now redirects or support files only. Use this document for current setup guidance.

## Related documents

- `docs/ops/DEPLOYMENT.md`
- `docs/ops/RUNBOOK.md`
- `docs/governance/PRODUCTION_DEPLOY_RUNBOOK.md`
- `docs/spec/NEWS_HUB/RUNTIME_CONTRACT.md`
