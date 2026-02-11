# ESG-Regulation News Pipeline Documentation

## Overview

The ISA News Pipeline is a fully automated system that fetches, processes, and displays ESG regulatory news from authoritative sources. It combines RSS feed aggregation with AI-powered summarization to provide curated, high-quality news updates.

## Architecture

### Components

1. **News Sources** (`server/news-sources.ts`)
   - Configuration for 6 authoritative sources
   - 3 EU official sources (EUR-Lex, EU Commission, EFRAG)
   - 3 GS1 official sources (GS1 NL, GS1 Global, GS1 EU)
   - Keyword-based relevance filtering

2. **News Fetcher** (`server/news-fetcher.ts`)
   - RSS feed parsing with 10-second timeout
   - Keyword filtering for ESG relevance
   - URL-based deduplication
   - Age-based filtering (configurable, default 30 days)

3. **AI Processor** (`server/news-ai-processor.ts`)
   - LLM-based structured extraction
   - Generates: headline, what happened, why it matters
   - Extracts regulation tags (CSRD, PPWR, EUDR, etc.)
   - Scores impact level (HIGH/MEDIUM/LOW)
   - Classifies news type (NEW_LAW, AMENDMENT, etc.)
   - **NEW:** GS1 impact analysis (2-3 sentences on standards relevance)
   - **NEW:** Suggested actions (2-4 actionable steps for members)
   - **NEW:** GS1 impact tags (12 categories: DPP, ESG_REPORTING, TRACEABILITY, etc.)
   - **NEW:** Sector tags (12 sectors: FOOD, HEALTHCARE, TEXTILES, etc.)
   - **NEW:** AI quality scoring (0.0-1.0 composite metric)
   - Fallback keyword-based processing

4. **Pipeline Orchestrator** (`server/news-pipeline.ts`)
   - Coordinates fetch → process → store workflow
   - Database deduplication check
   - Batch processing with rate limiting
   - Error handling and logging

5. **Archival System** (`server/news-archival.ts`)
   - Moves news older than 200 days to history table
   - Preserves all metadata
   - Keeps main table lean for performance

6. **Cron Scheduler** (`server/news-cron-scheduler.ts`)
   - Daily ingestion: 2 AM
   - Weekly archival: Sunday 3 AM
   - Manual trigger support for testing

## Database Schema

### `hub_news` Table (Active News)

| Column           | Type         | Description                                |
| ---------------- | ------------ | ------------------------------------------ |
| id               | INT          | Primary key                                |
| title            | VARCHAR(512) | News headline                              |
| summary          | TEXT         | AI-generated summary                       |
| content          | TEXT         | Full article content                       |
| newsType         | ENUM         | NEW_LAW, AMENDMENT, ENFORCEMENT, etc.      |
| regulationTags   | JSON         | Array of regulation acronyms               |
| impactLevel      | ENUM         | HIGH, MEDIUM, LOW                          |
| sourceUrl        | VARCHAR(512) | Original article URL                       |
| sourceTitle      | VARCHAR(255) | Source name                                |
| sourceType       | ENUM         | EU_OFFICIAL, GS1_OFFICIAL, INDUSTRY, MEDIA |
| credibilityScore | DECIMAL(3,2) | Source credibility (0.00-1.00)             |
| publishedDate    | TIMESTAMP    | Original publication date                  |
| retrievedAt      | TIMESTAMP    | When fetched by automation                 |
| isAutomated      | BOOLEAN      | True if AI-generated                       |
| gs1ImpactAnalysis | TEXT        | **NEW:** AI-generated GS1 relevance explanation |
| suggestedActions | JSON         | **NEW:** Array of actionable steps for members |
| gs1ImpactTags    | JSON         | **NEW:** Array of GS1 impact categories    |
| sectorTags       | JSON         | **NEW:** Array of affected industry sectors |
| relatedStandardIds | JSON       | **NEW:** Array of related GS1 standard IDs |
| createdAt        | TIMESTAMP    | Database insertion time                    |
| updatedAt        | TIMESTAMP    | Last update time                           |

**Indexes:**

- `sourceUrl` (deduplication)
- `publishedDate` (chronological queries)
- `impactLevel` (filtering)

### `hub_news_history` Table (Archived News)

Same schema as `hub_news` plus:

- `originalId` - Reference to original hub_news ID
- `archivedAt` - Archival timestamp
- `originalCreatedAt` - Original creation timestamp
- `originalUpdatedAt` - Original update timestamp

## News Sources

### EU Official Sources (Credibility: 1.0)

1. **EUR-Lex Press Releases**
   - URL: https://eur-lex.europa.eu/EN/display-rss.html
   - Coverage: All EU legislation and legal documents
   - Keywords: CSRD, ESRS, EUDR, DPP, PPWR, ESPR, sustainability

2. **European Commission - Environment**
   - URL: https://ec.europa.eu/newsroom/env/rss-feeds/...
   - Coverage: Environmental policy and regulations
   - Keywords: Green Deal, circular economy, sustainability

3. **EFRAG - Sustainability Reporting**
   - URL: https://www.efrag.org/rss
   - Coverage: ESRS standards and CSRD implementation
   - Keywords: ESRS, CSRD, disclosure, datapoint

### GS1 Official Sources (Credibility: 0.9)

4. **GS1 Netherlands News**
   - URL: https://www.gs1.nl/rss.xml
   - Coverage: Dutch market ESG initiatives and GS1 solutions
   - Keywords: CSRD, DPP, traceability, EPCIS

5. **GS1 Global News**
   - URL: https://www.gs1.org/news-events/news/rss
   - Coverage: Global GS1 standards and sustainability
   - Keywords: sustainability, traceability, Digital Product Passport

6. **GS1 in Europe Updates**
   - URL: https://www.gs1.eu/news-events/rss
   - Coverage: European GS1 activities and EU regulation responses
   - Keywords: EU regulation, sustainability, traceability

## AI Summarization

### Structured Output

```json
{
  "headline": "Clear, concise headline (max 100 chars)",
  "whatHappened": "2 sentences describing the regulatory change",
  "whyItMatters": "1 sentence explaining impact on companies",
  "regulationTags": ["CSRD", "ESRS"],
  "impactLevel": "HIGH",
  "newsType": "NEW_LAW"
}
```

### Impact Level Criteria

- **HIGH**: Final adoption, enforcement deadlines, mandatory requirements, penalties
- **MEDIUM**: Proposals, draft amendments, updated guidance, implementation details
- **LOW**: Preliminary discussions, workshops, stakeholder consultations

### News Type Classification

- **NEW_LAW**: New regulation adopted/published
- **AMENDMENT**: Changes to existing regulation
- **ENFORCEMENT**: Enforcement actions, penalties, compliance deadlines
- **COURT_DECISION**: Legal rulings affecting regulations
- **GUIDANCE**: Official guidance, FAQs, implementation support
- **PROPOSAL**: Draft regulations, consultation documents

## Frontend Components

### 1. NewsCard (`client/src/components/NewsCard.tsx`)

Displays individual news items with:

- Title and publication date
- Impact level indicator (color-coded)
- Regulation tags as badges
- Summary text
- Source attribution
- Link to original article

### 2. LatestNewsPanel (`client/src/components/LatestNewsPanel.tsx`)

Homepage section showing:

- Top 6 most recent news items
- "View All News" button
- Responsive grid layout

### 3. NewsHub Page (`client/src/pages/NewsHub.tsx`)

Full news feed with:

- Search by title/summary
- Filter by regulation (CSRD, EUDR, etc.)
- Filter by impact level
- Sort by date or impact
- Active filter badges
- Pagination support

## API Endpoints (tRPC)

### Public Procedures

```typescript
// Get recent news items
trpc.hub.getRecentNews.useQuery({ limit: 20 });
```

### Admin Procedures

```typescript
// Manually trigger news ingestion
trpc.newsAdmin.triggerIngestion.useMutation();

// Manually trigger archival
trpc.newsAdmin.triggerArchival.useMutation();

// Get pipeline statistics
trpc.newsAdmin.getStats.useQuery();
```

## Automation Schedule

### Daily News Ingestion (2 AM)

1. Fetch from all 6 RSS sources
2. Filter by ESG keywords
3. Deduplicate by URL
4. Filter to last 30 days
5. Check database for existing items
6. Process new items with AI (batch of 5)
7. Insert into `hub_news` table

**Expected duration:** 30-60 seconds for 10-20 new items

### Weekly Archival (Sunday 3 AM)

1. Find news older than 200 days
2. Copy to `hub_news_history` table
3. Delete from `hub_news` table

**Expected duration:** 5-10 seconds for 50-100 items

## Manual Testing

### Trigger News Ingestion

```bash
# Via admin UI (requires admin role)
# Navigate to /admin/news-pipeline
# Click "Run Ingestion Now"

# Or via tRPC mutation
await trpc.newsAdmin.triggerIngestion.mutate()
```

### Trigger Archival

```bash
# Via admin UI
# Navigate to /admin/news-pipeline
# Click "Run Archival Now"

# Or via tRPC mutation
await trpc.newsAdmin.triggerArchival.mutate()
```

### View Statistics

```bash
# Via admin UI
# Navigate to /admin/news-pipeline
# View "Pipeline Statistics" panel

# Or via tRPC query
const stats = await trpc.newsAdmin.getStats.query()
```

## Error Handling

### RSS Fetch Failures

- 10-second timeout per source
- Continues with other sources if one fails
- Logs errors to console
- Returns partial results

### AI Processing Failures

- Falls back to keyword-based extraction
- Continues processing other items
- Logs errors to console
- Inserts with fallback metadata

### Database Failures

- Logs errors to console
- Skips failed items
- Returns success count and error list
- Does not halt entire pipeline

## Performance Considerations

### Database Indexes

- `sourceUrl` index enables fast deduplication checks
- `publishedDate` index optimizes chronological queries
- `impactLevel` index speeds up filtering

### Batch Processing

- AI processing in batches of 5 items
- 1-second delay between batches
- Prevents rate limiting

### Archival Strategy

- Keeps main table under 200 days (≈ 1,200-2,400 items)
- History table grows indefinitely (acceptable for read-only data)
- Consider partitioning history table if > 50,000 items

## Monitoring

### Key Metrics

- **Ingestion success rate**: Should be > 95%
- **New items per day**: Expected 10-20
- **Processing time**: Should be < 60 seconds
- **Archival items per week**: Expected 50-100

### Logging

All operations log to console with prefix:

- `[news-fetcher]` - RSS fetch operations
- `[news-ai-processor]` - AI processing
- `[news-pipeline]` - Pipeline orchestration
- `[news-archival]` - Archival operations
- `[news-cron]` - Cron job execution

## Phase 8 Enhancements (December 2025)

### 8.1 Coverage Analytics Dashboard

**Location:** `/admin/coverage-analytics`

**Features:**
- News distribution by regulation (monthly trends)
- News distribution by sector (monthly trends)
- Source health monitoring (uptime, error rates)
- Coverage gaps identification
- Interactive Recharts visualizations

**Metrics:**
- Total articles ingested
- Unique regulations covered
- Coverage rate (% of monitored regulations with recent news)
- Top regulations by news volume
- Top sectors by news volume
- Top sources by article count
- GS1 impact area distribution

**Use Cases:**
- Identify under-covered regulations
- Monitor source reliability
- Track regulatory activity trends
- Validate ingestion strategy

### 8.2 Pipeline Observability

**Location:** `/admin/pipeline-observability`

**Database:** `pipeline_execution_log` table tracks:
- Execution ID (unique per run)
- Pipeline type (news_ingestion, archival, etc.)
- Status (success, partial_success, failed)
- Items processed/saved
- Duration (ms)
- Error count/messages
- Structured event log (JSON)

**Structured Logging Events:**
- `pipeline_start` - Execution begins
- `source_fetch` - RSS source fetched (success/failure, item count)
- `ai_process` - AI processing (success/failure, quality score)
- `pipeline_complete` - Execution ends (status, duration, metrics)

**AI Quality Metrics:**
- Summary coherence (0.0-1.0)
- Tag accuracy (0.0-1.0)
- Citation completeness (0.0-1.0)
- Composite quality score (average of above)

**Dashboard Features:**
- Execution history (last 100 runs)
- Success rate trends
- AI quality trends
- Source reliability trends
- Performance metrics (duration, throughput)
- Error analysis

**Use Cases:**
- Debug pipeline failures
- Monitor AI quality degradation
- Identify slow/unreliable sources
- Track operational costs
- Validate SLA compliance

### 8.3 Ingestion Window Configuration

**Modes:**
- **Normal Mode:** 30-60 day window (default)
- **Backfill Mode:** 200 day window (manual trigger)

**Configuration:** `server/news-fetcher.ts` `filterByAge` parameter

**Use Cases:**
- Normal: Daily incremental updates
- Backfill: Initial ingestion or gap filling

**Admin UI:** `/admin/news-pipeline` includes backfill trigger button

## Future Enhancements

1. **Critical Events Tracking**: Automated detection and alerts for compliance deadlines, consultation periods, and enforcement actions (design complete in `docs/CRITICAL_EVENTS_TAXONOMY.md`)
2. **Email Notifications**: Alert users to high-impact news
3. **Regulation Cross-Linking**: Enhanced bidirectional linking (partially implemented)
4. **User Preferences**: Personalized news feed based on saved regulations
5. **RSS Export**: Allow users to subscribe to ISA news feed
6. **Sentiment Analysis**: Track regulatory sentiment trends
7. **Multi-Language Support**: Translate summaries to Dutch
8. **Mobile App**: Push notifications for breaking news

## Troubleshooting

### No news appearing

1. Check if cron job is running
2. Manually trigger ingestion via admin UI
3. Check console logs for errors
4. Verify RSS source URLs are accessible

### Duplicate news items

1. Check `sourceUrl` index exists
2. Verify deduplication logic in `news-fetcher.ts`
3. Check for URL variations (http vs https, trailing slashes)

### AI summaries are poor quality

1. Check LLM API key is configured
2. Verify prompt in `news-ai-processor.ts`
3. Review fallback keyword extraction
4. Consider adjusting temperature/model parameters

### Archival not working

1. Check cron schedule configuration
2. Manually trigger archival via admin UI
3. Verify `hub_news_history` table exists
4. Check for database permission issues

## Support

For issues or questions, contact the ISA development team or submit a ticket at https://help.manus.im
