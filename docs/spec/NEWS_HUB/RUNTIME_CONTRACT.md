---
DOC_TYPE: SPEC
CAPABILITY: NEWS_HUB
COMPONENT: aggregation
FUNCTION_LABEL: "Aggregate and enrich ESG news"
OWNER: gs1ned-isa
STATUS: active
LAST_VERIFIED: 2026-02-12
VERIFICATION_METHOD: manual
---

# NEWS_HUB Runtime Contract

## Purpose
Aggregate and enrich ESG news

## Entry Points

<!-- EVIDENCE:implementation:server/news-admin-router.ts -->
### API Endpoints (tRPC)
- `server/news-admin-router.ts` <!-- EVIDENCE:implementation:server/news-admin-router.ts -->

### Services
- `server/_core/performance-monitoring.ts`
- `server/news-admin-router.ts`
- `server/news-pipeline-config.ts`

### UI Components
- `client/src/components/PipelineStatusBanner.tsx`
- `client/src/pages/AdminNewsPipelineManager.tsx`
- `client/src/pages/AdminPipelineObservability.tsx`

## Inputs/Outputs

### Inputs
**News Ingestion (Cron Job)**
- Source URLs (7 configured sources)
- Scraping schedule (daily 02:00 UTC)

**News Enrichment (tRPC procedure: `enrichNews`)**
- `newsId: number` - News article ID
- `force?: boolean` - Force re-enrichment

### Outputs
**News Article**
```typescript
{
  id: number,
  title: string,
  summary: string,
  url: string,
  publishedAt: Date,
  source: string,
  regulationTags: string[],
  gs1Impact: string[],
  sectors: string[],
  confidence: number
}
```

## Invariants

1. **Daily Ingestion**: News scraped daily at 02:00 UTC from 7 sources
2. **AI Enrichment**: All articles tagged with regulations, GS1 impact, sectors
3. **Deduplication**: Articles deduplicated by URL hash
4. **Health Monitoring**: Source health tracked (100% target)
5. **Bidirectional Links**: News ↔ Regulations navigation maintained

## Failure Modes

### Observable Signals
- **Scraper Timeout**: Source unreachable >30s
- **Parse Error**: HTML structure changed
- **AI Enrichment Failure**: LLM API error
- **Database Write Failure**: TiDB connection lost

### Recovery Procedures
- **Scraper Timeout**: Skip source, log failure, retry next cycle
- **Parse Error**: Alert admin, use fallback parser
- **AI Failure**: Store raw article, enrich later
- **DB Failure**: Queue for retry with exponential backoff

## Data Dependencies

### Database Tables
- `hub_news` - News articles
- `hub_news_history` - Change tracking
- `hub_news_recommendations` - AI suggestions
- `regulations` - For tagging

### External APIs
- **Playwright** - Web scraping
- **Manus Forge API** - AI enrichment (GPT-4)
- **EUR-Lex, EFRAG, GS1** - News sources

## Security/Secrets

### Required Secrets
- `OPENAI_API_KEY` - AI enrichment
- `DATABASE_URL` - TiDB connection
- `CRON_SECRET` - Cron job authentication

### Authentication
- **Cron Jobs**: Secret token validation
- **Admin UI**: Manus OAuth required

## Verification Methods

### Smoke Test
- **Location**: `scripts/probe/news_hub_health.sh`
- **Status**: ⏳ Planned
- **Frequency**: Daily after ingestion
- **Coverage**: Source health, enrichment quality, database integrity

### Integration Tests
- **Location**: `server/routers/news-hub.test.ts`
- **Coverage**: Scraping, enrichment, deduplication
- **Framework**: Vitest
- **Status**: 85%+ passing

### Manual Verification
- **Admin Dashboard**: `/admin/pipeline-observability`
- **Metrics**: Source health (100% target), enrichment success rate, article count

## Evidence

<!-- EVIDENCE:requirement:docs/planning/refactoring/FILE_INVENTORY.json -->
- Phase 0 Inventory: 41 files classified as NEWS_HUB
<!-- EVIDENCE:implementation:server/news-admin-router.ts -->
- Code entrypoints: 7 identified
<!-- EVIDENCE:decision:docs/planning/refactoring/QUALITY_SCORECARDS.json -->
- Quality grade: C (70/100)

---

**Contract Status:** DRAFT  
**Completeness:** ~30% (skeleton only, needs detailed analysis)  
**Next Steps:** Analyze code to populate all sections
