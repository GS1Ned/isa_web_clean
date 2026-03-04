---
DOC_TYPE: SPEC
CAPABILITY: NEWS_HUB
COMPONENT: runtime
FUNCTION_LABEL: "News ingestion, enrichment and operational visibility"
OWNER: gs1ned-isa
STATUS: active
LAST_VERIFIED: 2026-02-20
VERIFICATION_METHOD: repo-evidence
---

# NEWS_HUB Runtime Contract

## Canonical Role
NEWS_HUB manages regulatory/news ingestion flows, enrichment controls, and operational observability surfaces. In the target product shape it acts as the regulatory change-intelligence feed for the compliance cockpit and advisory updates, not as a standalone media product.

## Runtime Surfaces (Code Truth)
<!-- EVIDENCE:implementation:server/routers.ts -->
- Top-level `appRouter` surfaces: `hub`, `newsAdmin`, `cron`, `scraperHealth`, `pipelineObservability`, `regulatoryChangeLog`.
- Router modules:
  - `server/routers/hub.ts`
  - `server/news-admin-router.ts`
  - `server/routers/cron.ts`
  - `server/routers/scraper-health.ts`
  - `server/routers/pipeline-observability.ts`
  - `server/routers/regulatory-change-log.ts`
- Scheduling sources:
  - `server/cron-scheduler.ts`
  - `server/news-cron-scheduler.ts`

## Data Surfaces (Ownership Contract)
<!-- EVIDENCE:implementation:docs/architecture/panel/_generated/CAPABILITY_MANIFEST.json -->
- Owned tables:
  - `hub_news`
  - `hub_news_history`
  - `news_recommendations`
  - `scraper_executions`
  - `scraper_health_summary`
  - `pipeline_execution_log`
  - `regulatory_change_log`
  - `regulatory_events`
- Schema anchors:
  - `drizzle/schema_news_hub.ts`
  - `drizzle/schema_news_history.ts`
  - `drizzle/schema_news_recommendations.ts`
  - `drizzle/schema_scraper_health.ts`
  - `drizzle/schema_pipeline_observability.ts`
  - `drizzle/schema_regulatory_change_log.ts`

## Input / Output Contract (Current)
- Inputs: source definitions and scheduled/manual ingest triggers from NEWS_HUB router and scheduler modules.
- Outputs: typed news and operational telemetry payloads via tRPC surfaces and DB persistence.
- Exact field-level payloads are code-truth in router/service implementations.

## Verification
<!-- EVIDENCE:implementation:scripts/probe/news_hub_health.sh -->
- Smoke probe: `scripts/probe/news_hub_health.sh`
- Tests:
  - `server/routers/scraper-health.test.ts`
  - `server/routers/__tests__/capability-heartbeat.test.ts`
- Canonical gate alignment:
  - `bash scripts/gates/observability-contract.sh /tmp/observability.current.json`
  - `bash scripts/gates/slo-policy-check.sh /tmp/slo-policy-check.current.json`
  - `bash scripts/gates/doc-code-validator.sh --canonical-only`

## Operational Unknowns
- Source-side uptime/latency guarantees are UNKNOWN from repository-only evidence.
- Deployed cron runtime guarantees are UNKNOWN from repository-only evidence.

## Evidence
<!-- EVIDENCE:implementation:server/routers/hub.ts -->
<!-- EVIDENCE:implementation:server/news-admin-router.ts -->
<!-- EVIDENCE:implementation:server/routers/cron.ts -->
<!-- EVIDENCE:implementation:server/news-sources.ts -->

**Contract Status:** CURRENT_EVIDENCE_BACKED
