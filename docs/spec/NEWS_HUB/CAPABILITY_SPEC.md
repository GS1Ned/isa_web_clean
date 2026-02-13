# NEWS_HUB Capability Specification

**Capability:** NEWS_HUB  
**Version:** 1.0  
**Last Updated:** 2026-02-12  
**Status:** Production

---

## Purpose

NEWS_HUB aggregates, enriches, and monitors ESG regulatory news from authoritative sources to keep GS1 Netherlands members informed about regulatory changes, compliance deadlines, and industry developments.

---

## Scope

### In Scope
- Automated news ingestion from 14 sources (7 active baseline + 7 Phase 3)
- AI-powered content enrichment (summarization, tagging, impact analysis)
- Cross-source deduplication
- Health monitoring and retry logic
- Regulatory event detection and tracking
- Recommendation generation
- News archival and history tracking

### Out of Scope
- Real-time news alerts (scheduled ingestion only)
- User-generated content
- Social media monitoring
- Non-ESG news topics
- Multi-language support (English/Dutch only)

---

## Architecture

### Component Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        NEWS_HUB                              │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Scrapers   │───▶│   Pipeline   │───▶│  AI Processor│  │
│  │  (14 sources)│    │ Orchestrator │    │  (GPT-4)     │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                    │                    │          │
│         ▼                    ▼                    ▼          │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │Health Monitor│    │ Deduplicator │    │Event Detector│  │
│  │(Retry Logic) │    │(URL+Content) │    │(Regulatory)  │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│         │                    │                    │          │
│         └────────────────────┴────────────────────┘          │
│                              │                                │
│                              ▼                                │
│                    ┌──────────────────┐                      │
│                    │    Database      │                      │
│                    │  (hub_news,      │                      │
│                    │   scraper_health)│                      │
│                    └──────────────────┘                      │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
1. Cron Trigger (02:00 UTC daily)
   ↓
2. Fetch from 14 sources (RSS/Playwright)
   ↓
3. URL deduplication
   ↓
4. Age filtering (7-90 days based on mode)
   ↓
5. Validation
   ↓
6. Database deduplication check
   ↓
7. AI processing (GPT-4)
   - Headline generation
   - Summary generation
   - Regulation tagging
   - Impact analysis
   - GS1 relevance scoring
   ↓
8. Cross-source deduplication
   ↓
9. ESG relevance filtering
   ↓
10. Database insertion
    ↓
11. Recommendation generation
    ↓
12. Regulatory event detection
    ↓
13. Health monitoring update
```

---

## Data Model

### Tables

#### hub_news
Primary news storage table.

```sql
CREATE TABLE hub_news (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(512) NOT NULL,
  summary TEXT,
  content TEXT,
  newsType ENUM('NEW_LAW','AMENDMENT','ENFORCEMENT','COURT_DECISION','GUIDANCE','PROPOSAL') NOT NULL,
  regulationTags JSON,
  impactLevel ENUM('LOW','MEDIUM','HIGH') DEFAULT 'MEDIUM',
  sourceUrl VARCHAR(512),
  sourceTitle VARCHAR(255),
  sourceType ENUM('EU_OFFICIAL','GS1_OFFICIAL','DUTCH_NATIONAL','INDUSTRY','MEDIA') DEFAULT 'EU_OFFICIAL',
  sources JSON,  -- Multi-source attribution
  credibilityScore DECIMAL(3,2) DEFAULT 0.00,
  
  -- GS1-specific fields
  gs1ImpactTags JSON,
  sectorTags JSON,
  relatedStandardIds JSON,
  gs1ImpactAnalysis TEXT,
  suggestedActions JSON,
  
  -- Regulatory intelligence fields
  regulatoryState ENUM('PROPOSAL','POLITICAL_AGREEMENT','ADOPTED','DELEGATED_ACT_DRAFT','DELEGATED_ACT_ADOPTED','GUIDANCE','ENFORCEMENT_SIGNAL','POSTPONED_OR_SOFTENED') DEFAULT 'ADOPTED',
  isNegativeSignal TINYINT DEFAULT 0,
  confidenceLevel ENUM('CONFIRMED_LAW','DRAFT_PROPOSAL','GUIDANCE_INTERPRETATION','MARKET_PRACTICE') DEFAULT 'GUIDANCE_INTERPRETATION',
  negativeSignalKeywords JSON,
  regulatoryEventId INT,
  
  publishedDate TIMESTAMP,
  retrievedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  isAutomated TINYINT DEFAULT 0
);
```

**Record Count:** ~500+ news articles (growing)

#### hub_news_history
Archival table for news updates.

```sql
CREATE TABLE hub_news_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  originalId INT NOT NULL,
  title VARCHAR(512) NOT NULL,
  summary TEXT,
  content TEXT,
  newsType ENUM(...),
  regulationTags JSON,
  impactLevel ENUM(...),
  sourceUrl VARCHAR(512),
  sourceTitle VARCHAR(255),
  sourceType ENUM(...),
  sources JSON,
  credibilityScore DECIMAL(3,2),
  gs1ImpactTags JSON,
  sectorTags JSON,
  relatedStandardIds JSON,
  gs1ImpactAnalysis TEXT,
  suggestedActions JSON,
  publishedDate TIMESTAMP,
  retrievedAt TIMESTAMP NOT NULL,
  archivedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  originalCreatedAt TIMESTAMP NOT NULL,
  originalUpdatedAt TIMESTAMP NOT NULL,
  isAutomated TINYINT DEFAULT 0,
  
  INDEX idx_originalId (originalId),
  INDEX idx_publishedDate (publishedDate),
  INDEX idx_archivedAt (archivedAt)
);
```

#### scraper_health
Health monitoring for news sources.

```sql
CREATE TABLE scraper_health (
  id INT AUTO_INCREMENT PRIMARY KEY,
  source VARCHAR(255) NOT NULL UNIQUE,
  lastSuccessfulRun TIMESTAMP,
  lastAttemptedRun TIMESTAMP,
  consecutiveFailures INT DEFAULT 0,
  totalAttempts INT DEFAULT 0,
  totalSuccesses INT DEFAULT 0,
  totalFailures INT DEFAULT 0,
  healthStatus ENUM('HEALTHY','DEGRADED','UNHEALTHY') DEFAULT 'HEALTHY',
  lastError TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**Record Count:** 14 sources

---

## Components

### 1. News Sources (14 Active)

**Baseline Sources (7):**
- EUR-Lex Official Journal (Playwright scraper)
- European Commission Press Corner (RSS)
- EC Circular Economy (RSS)
- EFRAG Sustainability (RSS)
- GS1 Netherlands (RSS)
- GS1 Europe (RSS)
- Green Deal Healthcare (Playwright)

**Phase 3 Sources (7):**
- ZES Logistics (Playwright)
- Rijksoverheid I&W (RSS)
- Rijksoverheid Green Deals (RSS)
- AFM CSRD (RSS)
- CSDDD sources
- Green Claims sources
- ESPR sources

**Source Types:**
- `EU_OFFICIAL`: Credibility 1.0
- `GS1_OFFICIAL`: Credibility 0.9
- `DUTCH_NATIONAL`: Credibility 0.95
- `INDUSTRY`: Credibility 0.7
- `MEDIA`: Credibility 0.6

### 2. Pipeline Orchestrator

**File:** `server/news-pipeline.ts`

**Modes:**
- `normal`: Last 7 days (default)
- `backfill`: Last 30 days
- `incremental`: Last 14 days
- `full-refresh`: Last 90 days

**Steps:**
1. Fetch from all sources
2. URL deduplication
3. Age filtering
4. Validation
5. Database deduplication
6. AI processing
7. Cross-source deduplication
8. ESG relevance filtering
9. Database insertion
10. Recommendation generation
11. Event detection
12. Health monitoring

**Execution:** Cron-triggered (02:00 UTC daily)

### 3. AI Processor

**File:** `server/news-ai-processor.ts`

**Model:** GPT-4

**Outputs:**
- `headline`: Concise title
- `summary`: 2-3 sentence summary
- `newsType`: Classification (NEW_LAW, AMENDMENT, etc.)
- `regulationTags`: Array of regulation IDs
- `impactLevel`: LOW/MEDIUM/HIGH
- `gs1ImpactTags`: GS1-specific impacts
- `sectorTags`: Affected sectors
- `gs1ImpactAnalysis`: Detailed analysis
- `suggestedActions`: Recommended actions
- `regulatoryState`: Lifecycle state
- `isNegativeSignal`: Boolean
- `confidenceLevel`: Authority level
- `negativeSignalKeywords`: Detected keywords

### 4. Deduplicator

**File:** `server/news-deduplicator.ts`

**Strategy:**
- URL-based deduplication (exact match)
- Content-based deduplication (similarity threshold)
- Multi-source attribution (tracks all sources)

**Algorithm:**
1. Group by URL
2. Calculate content similarity
3. Merge duplicates
4. Preserve all source attributions

### 5. Health Monitor

**File:** `server/news-health-monitor.ts`

**Metrics:**
- Last successful run
- Consecutive failures
- Success rate
- Health status (HEALTHY/DEGRADED/UNHEALTHY)

**Thresholds:**
- HEALTHY: 0 consecutive failures
- DEGRADED: 1-2 consecutive failures
- UNHEALTHY: 3+ consecutive failures

**Retry Logic:**
- Max retries: 3
- Backoff: Exponential (1s, 2s, 4s)

### 6. Event Detector

**File:** `server/news-event-processor.ts`

**Purpose:** Detect and track regulatory events across multiple news articles

**Detection Criteria:**
- Regulation mentioned
- Significant lifecycle state
- Multiple sources reporting
- High impact level

**Event States:**
- PROPOSED
- UNDER_NEGOTIATION
- ADOPTED
- PUBLISHED
- IN_FORCE
- AMENDED

---

## Quality Attributes

### Performance
- **Pipeline Duration:** <5 minutes for normal mode
- **AI Processing:** <2s per article
- **Database Insertion:** <100ms per article
- **Throughput:** 50+ articles per run

### Reliability
- **Target Uptime:** 99.5%
- **Health Monitoring:** 100% source coverage
- **Retry Success Rate:** >80%
- **Data Integrity:** 100% (no duplicates)

### Scalability
- **Source Capacity:** 20+ sources
- **Article Volume:** 1000+ articles/month
- **Concurrent Processing:** 10 articles in parallel

### Security
- **API Keys:** Stored in environment variables
- **Rate Limiting:** Respects source limits
- **Data Validation:** All inputs sanitized
- **Access Control:** Admin-only pipeline triggers

---

## Integration Points

### Dependencies
- **CATALOG:** Regulation IDs for tagging
- **OpenAI API:** GPT-4 for content enrichment
- **Playwright:** Browser automation for scraping
- **RSS Parser:** Feed parsing

### Dependents
- **ESG Hub UI:** News display
- **Ask ISA:** News as knowledge source (future)
- **Advisory System:** Regulatory change tracking (future)

---

## Configuration

### Environment Variables

```bash
# Required
OPENAI_API_KEY=sk-...
DATABASE_URL=mysql://...

# Optional
NEWS_PIPELINE_MODE=normal  # normal|backfill|incremental|full-refresh
NEWS_CRON_SCHEDULE="0 2 * * *"  # Daily at 02:00 UTC
NEWS_MAX_AGE_DAYS=7
NEWS_BATCH_SIZE=10
```

### Pipeline Modes

```typescript
const PIPELINE_MODE_CONFIGS = {
  normal: { maxAgeDays: 7 },
  backfill: { maxAgeDays: 30 },
  incremental: { maxAgeDays: 14 },
  'full-refresh': { maxAgeDays: 90 },
};
```

---

## Operational Metrics

### Key Metrics
- **Articles Fetched:** Count per run
- **Articles Processed:** Count per run
- **Articles Inserted:** Count per run
- **Articles Skipped:** Count per run (duplicates + non-ESG)
- **Source Health:** Percentage healthy
- **Pipeline Duration:** Milliseconds
- **Error Rate:** Percentage

### Monitoring
- **Health Dashboard:** Real-time source status
- **Pipeline Logs:** Execution history
- **Error Tracking:** Failed articles
- **Quality Metrics:** AI enrichment quality

---

## Constraints

### Technical Constraints
- **AI Processing:** Rate limited by OpenAI API (60 req/min)
- **Scraping:** Some sources block automation (WAF, CAPTCHA)
- **Storage:** News articles grow indefinitely (archival needed)
- **Processing Time:** Pipeline must complete within 1 hour

### Business Constraints
- **Source Selection:** Must be authoritative (credibility >0.7)
- **ESG Relevance:** Only ESG-related news (regulation tags required)
- **Language:** English/Dutch only
- **Timeliness:** News must be <90 days old

---

## Future Enhancements

### Planned
- Real-time news alerts (webhooks)
- User subscriptions (email notifications)
- News recommendations (personalized)
- Sentiment analysis
- Trend detection

### Under Consideration
- Social media monitoring
- Multi-language support
- Custom source addition (user-defined)
- News clustering (topic modeling)

---

## Changelog

### v1.0 (2026-02-12)
- Initial capability specification
- 14 active sources documented
- Pipeline architecture defined
- Data model specified
- Quality attributes established

---

## See Also

- [API_REFERENCE.md](./API_REFERENCE.md) - API documentation
- [../../INTEGRATION_CONTRACTS.md](../../INTEGRATION_CONTRACTS.md) - Inter-capability contracts
- [../../ARCHITECTURE.md](../../ARCHITECTURE.md) - System architecture
