# NEWS_HUB API Reference

**Capability:** NEWS_HUB  
**Version:** 1.0.0  
**Last Updated:** 2026-02-12  
**Status:** Production

---

## Overview

NEWS_HUB exposes 3 tRPC routers with 20+ procedures for news ingestion, retrieval, health monitoring, and pipeline observability.

**Routers:**
- `cron` - Scheduled task triggers (public with secret auth)
- `scraperHealth` - Health monitoring and diagnostics
- `pipelineObservability` - Pipeline execution metrics (admin-only)

**Base URL:** `/api/trpc`

---

## Authentication

### Public Procedures
No authentication required:
- `cron.health`
- `scraperHealth.getAllSourcesHealth`
- `scraperHealth.getSourceHealth`

### Secret-Protected Procedures
Require `CRON_SECRET` token in request body:
- `cron.dailyNewsIngestion`
- `cron.weeklyNewsArchival`

### Admin Procedures
Require authenticated admin user:
- All `scraperHealth` admin endpoints
- All `pipelineObservability` endpoints

---

## Cron Router

### `cron.dailyNewsIngestion`

Trigger daily news ingestion pipeline.

**Type:** Mutation  
**Auth:** Secret token required

**Input Schema:**
```typescript
{
  secret: string  // CRON_SECRET from environment
}
```

**Response Schema:**
```typescript
{
  success: boolean
  message: string
  stats?: {
    fetched: number      // Total items fetched
    inserted: number     // New items inserted
    skipped: number      // Duplicate items skipped
    errors: number       // Error count
    duration: string     // Execution time (ms)
  }
  error?: string         // Error message if failed
}
```

**Example Request:**
```typescript
const result = await trpc.cron.dailyNewsIngestion.mutate({
  secret: process.env.CRON_SECRET
});
```

**Example Response:**
```json
{
  "success": true,
  "message": "Daily news ingestion completed",
  "stats": {
    "fetched": 47,
    "inserted": 12,
    "skipped": 35,
    "errors": 0,
    "duration": "8234ms"
  }
}
```

**Error Codes:**
- `UNAUTHORIZED` - Invalid or missing secret token
- `INTERNAL_SERVER_ERROR` - Pipeline execution failed

---

### `cron.weeklyNewsArchival`

Trigger weekly news archival (moves old news to history table).

**Type:** Mutation  
**Auth:** Secret token required

**Input Schema:**
```typescript
{
  secret: string  // CRON_SECRET from environment
}
```

**Response Schema:**
```typescript
{
  success: boolean
  message: string
  stats?: {
    archived: number     // Items moved to history
    errors: number       // Error count
    duration: string     // Execution time (ms)
  }
  error?: string         // Error message if failed
}
```

**Example Request:**
```typescript
const result = await trpc.cron.weeklyNewsArchival.mutate({
  secret: process.env.CRON_SECRET
});
```

**Archival Rules:**
- News older than 90 days moved to `hub_news_history`
- Original records deleted from `hub_news`
- Preserves all metadata and AI analysis

---

### `cron.health`

Health check endpoint for cron monitoring services.

**Type:** Query  
**Auth:** Public (no auth required)

**Input:** None

**Response Schema:**
```typescript
{
  status: "ok"
  timestamp: string      // ISO 8601 timestamp
  service: "ISA News Cron"
}
```

**Example Request:**
```typescript
const health = await trpc.cron.health.query();
```

---

## Scraper Health Router

### `scraperHealth.getAllSourcesHealth`

Get health summary for all news sources.

**Type:** Query  
**Auth:** Public (no auth required)

**Input:** None

**Response Schema:**
```typescript
Array<{
  sourceId: string
  sourceName: string
  successRate24h: number           // 0-100
  totalExecutions24h: number
  failedExecutions24h: number
  avgItemsFetched24h: number
  avgDurationMs24h: number
  lastExecutionSuccess: boolean
  lastExecutionAt: string          // ISO 8601
  lastSuccessAt: string | null
  lastErrorMessage: string | null
  consecutiveFailures: number
  alertSent: boolean
  alertSentAt: string | null
}>
```

**Example Request:**
```typescript
const health = await trpc.scraperHealth.getAllSourcesHealth.query();
```

**Example Response:**
```json
[
  {
    "sourceId": "eur_lex_news",
    "sourceName": "EUR-Lex News",
    "successRate24h": 100,
    "totalExecutions24h": 24,
    "failedExecutions24h": 0,
    "avgItemsFetched24h": 3,
    "avgDurationMs24h": 1234,
    "lastExecutionSuccess": true,
    "lastExecutionAt": "2026-02-12T02:00:00Z",
    "lastSuccessAt": "2026-02-12T02:00:00Z",
    "lastErrorMessage": null,
    "consecutiveFailures": 0,
    "alertSent": false,
    "alertSentAt": null
  }
]
```

**Health Thresholds:**
- **Healthy:** successRate24h >= 95%
- **Degraded:** successRate24h 80-94%
- **Critical:** successRate24h < 80% OR consecutiveFailures >= 3

---

### `scraperHealth.getSourceHealth`

Get health summary for specific source.

**Type:** Query  
**Auth:** Public (no auth required)

**Input Schema:**
```typescript
{
  sourceId: string  // e.g., "eur_lex_news"
}
```

**Response Schema:**
```typescript
{
  sourceId: string
  sourceName: string
  successRate24h: number
  totalExecutions24h: number
  failedExecutions24h: number
  avgItemsFetched24h: number
  avgDurationMs24h: number
  lastExecutionSuccess: boolean
  lastExecutionAt: string
  lastSuccessAt: string | null
  lastErrorMessage: string | null
  consecutiveFailures: number
  alertSent: boolean
  alertSentAt: string | null
} | null  // null if source not found
```

**Example Request:**
```typescript
const health = await trpc.scraperHealth.getSourceHealth.query({
  sourceId: "eur_lex_news"
});
```

---

### `scraperHealth.getExecutionHistory`

Get recent execution history for a source (admin-only).

**Type:** Query  
**Auth:** Admin required

**Input Schema:**
```typescript
{
  sourceId: string
  limit?: number  // 1-100, default 20
}
```

**Response Schema:**
```typescript
Array<{
  id: number
  sourceId: string
  sourceName: string
  startedAt: string
  completedAt: string | null
  success: boolean
  itemsFetched: number
  durationMs: number | null
  errorMessage: string | null
  errorStack: string | null
}>
```

**Example Request:**
```typescript
const history = await trpc.scraperHealth.getExecutionHistory.query({
  sourceId: "eur_lex_news",
  limit: 50
});
```

---

### `scraperHealth.getRecentFailures`

Get recent failures across all sources (admin-only).

**Type:** Query  
**Auth:** Admin required

**Input Schema:**
```typescript
{
  limit?: number  // 1-50, default 10
}
```

**Response Schema:**
```typescript
Array<{
  id: number
  sourceId: string
  sourceName: string
  startedAt: string
  completedAt: string | null
  success: false
  itemsFetched: number
  durationMs: number | null
  errorMessage: string | null
  errorStack: string | null
}>
```

**Example Request:**
```typescript
const failures = await trpc.scraperHealth.getRecentFailures.query({
  limit: 20
});
```

---

### `scraperHealth.getExecutionStats`

Get execution statistics for time range (admin-only).

**Type:** Query  
**Auth:** Admin required

**Input Schema:**
```typescript
{
  hoursBack?: number  // 1-720 (30 days), default 24
}
```

**Response Schema:**
```typescript
{
  timeRange: {
    hoursBack: number
    startTime: Date
    endTime: string
  }
  overall: {
    totalExecutions: number
    successfulExecutions: number
    failedExecutions: number
    successRate: number           // 0-100
    totalItemsFetched: number
    avgItemsPerExecution: number
    avgDurationMs: number
  }
  bySource: Array<{
    sourceId: string
    sourceName: string
    total: number
    successful: number
    failed: number
    successRate: number           // 0-100
  }>
}
```

**Example Request:**
```typescript
const stats = await trpc.scraperHealth.getExecutionStats.query({
  hoursBack: 168  // 7 days
});
```

---

### `scraperHealth.clearAlert`

Clear alert status for a source (admin-only).

**Type:** Mutation  
**Auth:** Admin required

**Input Schema:**
```typescript
{
  sourceId: string
}
```

**Response Schema:**
```typescript
{
  success: true
}
```

**Example Request:**
```typescript
await trpc.scraperHealth.clearAlert.mutate({
  sourceId: "eur_lex_news"
});
```

**Use Case:** Manually clear alert after investigating and resolving issue.

---

### `scraperHealth.getTrendData`

Get time-bucketed metrics for visualization (admin-only).

**Type:** Query  
**Auth:** Admin required

**Input Schema:**
```typescript
{
  hoursBack?: number  // 1-720 (30 days), default 24
}
```

**Response Schema:**
```typescript
{
  bucketSizeMs: number  // Bucket size in milliseconds
  trendData: Array<{
    timestamp: number
    timestampLabel: string
    overall: {
      successRate: number
      itemsFetched: number
      avgDuration: number
    }
    bySource: Array<{
      sourceId: string
      sourceName: string
      successRate: number
      itemsFetched: number
      avgDuration: number
    }>
  }>
}
```

**Bucket Sizes:**
- 24h: 1-hour buckets (24 points)
- 48h: 2-hour buckets (24 points)
- 7d: 6-hour buckets (28 points)
- 30d: 1-day buckets (30 points)

**Example Request:**
```typescript
const trend = await trpc.scraperHealth.getTrendData.query({
  hoursBack: 168  // 7 days
});
```

**Use Case:** Power time-series charts in admin dashboard.

---

## Pipeline Observability Router

All procedures require admin authentication.

### `pipelineObservability.getRecentExecutions`

Get recent pipeline executions.

**Type:** Query  
**Auth:** Admin required

**Input Schema:**
```typescript
{
  limit?: number  // 1-100, default 50
}
```

**Response Schema:**
```typescript
Array<{
  executionId: string
  pipelineType: "news_ingestion" | "news_archival"
  startedAt: string
  completedAt: string | null
  success: boolean
  itemsProcessed: number
  itemsInserted: number
  itemsSkipped: number
  errorCount: number
  durationMs: number | null
  avgAiQualityScore: number | null
  metadata: object | null
}>
```

---

### `pipelineObservability.getExecutionById`

Get pipeline execution by ID.

**Type:** Query  
**Auth:** Admin required

**Input Schema:**
```typescript
{
  executionId: string
}
```

**Response Schema:**
```typescript
{
  executionId: string
  pipelineType: "news_ingestion" | "news_archival"
  startedAt: string
  completedAt: string | null
  success: boolean
  itemsProcessed: number
  itemsInserted: number
  itemsSkipped: number
  errorCount: number
  durationMs: number | null
  avgAiQualityScore: number | null
  metadata: object | null
  errors: Array<{
    sourceId: string
    errorMessage: string
    errorStack: string | null
  }>
} | null
```

---

### `pipelineObservability.getExecutionsByDateRange`

Get pipeline executions by date range.

**Type:** Query  
**Auth:** Admin required

**Input Schema:**
```typescript
{
  startDate: string              // ISO 8601
  endDate: string                // ISO 8601
  pipelineType?: "news_ingestion" | "news_archival"
}
```

**Response Schema:**
```typescript
Array<{
  executionId: string
  pipelineType: "news_ingestion" | "news_archival"
  startedAt: string
  completedAt: string | null
  success: boolean
  itemsProcessed: number
  itemsInserted: number
  itemsSkipped: number
  errorCount: number
  durationMs: number | null
  avgAiQualityScore: number | null
}>
```

---

### `pipelineObservability.getSuccessRate`

Get pipeline success rate over time period.

**Type:** Query  
**Auth:** Admin required

**Input Schema:**
```typescript
{
  days?: number  // 1-90, default 7
}
```

**Response Schema:**
```typescript
{
  successRate: number           // 0-100
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  timeRange: {
    days: number
    startDate: string
    endDate: string
  }
}
```

---

### `pipelineObservability.getAverageQualityScore`

Get average AI quality score over time period.

**Type:** Query  
**Auth:** Admin required

**Input Schema:**
```typescript
{
  days?: number  // 1-90, default 7
}
```

**Response Schema:**
```typescript
{
  avgQualityScore: number       // 0-100
  totalExecutions: number
  executionsWithScore: number
  timeRange: {
    days: number
    startDate: string
    endDate: string
  }
}
```

---

### `pipelineObservability.getQualityScoreTrend`

Get AI quality score trend (daily averages).

**Type:** Query  
**Auth:** Admin required

**Input Schema:**
```typescript
{
  days?: number  // 1-90, default 30
}
```

**Response Schema:**
```typescript
Array<{
  date: string                  // YYYY-MM-DD
  avgQualityScore: number
  executionCount: number
}>
```

---

### `pipelineObservability.getSourceReliability`

Get source reliability metrics.

**Type:** Query  
**Auth:** Admin required

**Input Schema:**
```typescript
{
  days?: number  // 1-90, default 7
}
```

**Response Schema:**
```typescript
Array<{
  sourceId: string
  sourceName: string
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number
  successRate: number           // 0-100
  avgItemsFetched: number
  avgDurationMs: number
  avgQualityScore: number | null
}>
```

---

### `pipelineObservability.getPerformanceMetrics`

Get pipeline performance metrics.

**Type:** Query  
**Auth:** Admin required

**Input Schema:**
```typescript
{
  days?: number  // 1-90, default 7
}
```

**Response Schema:**
```typescript
{
  avgDurationMs: number
  p50DurationMs: number
  p95DurationMs: number
  p99DurationMs: number
  avgItemsPerExecution: number
  avgItemsPerSecond: number
  timeRange: {
    days: number
    startDate: string
    endDate: string
  }
}
```

---

### `pipelineObservability.getQualityDistribution`

Get quality metrics distribution.

**Type:** Query  
**Auth:** Admin required

**Input Schema:**
```typescript
{
  days?: number  // 1-90, default 7
}
```

**Response Schema:**
```typescript
{
  distribution: Array<{
    bucket: string              // "0-20", "20-40", etc.
    count: number
    percentage: number
  }>
  avgScore: number
  medianScore: number
  timeRange: {
    days: number
    startDate: string
    endDate: string
  }
}
```

---

### `pipelineObservability.getFailedExecutions`

Get failed executions for debugging.

**Type:** Query  
**Auth:** Admin required

**Input Schema:**
```typescript
{
  limit?: number  // 1-50, default 20
}
```

**Response Schema:**
```typescript
Array<{
  executionId: string
  pipelineType: "news_ingestion" | "news_archival"
  startedAt: string
  completedAt: string | null
  errorCount: number
  durationMs: number | null
  errors: Array<{
    sourceId: string
    errorMessage: string
  }>
}>
```

---

### `pipelineObservability.getDashboardSummary`

Get observability dashboard summary (aggregated metrics).

**Type:** Query  
**Auth:** Admin required

**Input Schema:**
```typescript
{
  days?: number  // 1-90, default 7
}
```

**Response Schema:**
```typescript
{
  successRate: {
    successRate: number
    totalExecutions: number
    successfulExecutions: number
    failedExecutions: number
  }
  avgQualityScore: {
    avgQualityScore: number
    totalExecutions: number
    executionsWithScore: number
  }
  sourceReliability: Array<{
    sourceId: string
    sourceName: string
    successRate: number
    avgQualityScore: number
  }>
  performanceMetrics: {
    avgDurationMs: number
    p95DurationMs: number
    avgItemsPerExecution: number
  }
  qualityDistribution: {
    distribution: Array<{
      bucket: string
      count: number
      percentage: number
    }>
    avgScore: number
  }
  recentExecutions: Array<{
    executionId: string
    pipelineType: string
    startedAt: string
    success: boolean
  }>
}
```

**Use Case:** Power single-page admin dashboard with all key metrics.

---

## Error Handling

### Error Response Format

All procedures return errors in tRPC standard format:

```typescript
{
  error: {
    message: string
    code: string
    data?: {
      code: string
      httpStatus: number
      path: string
    }
  }
}
```

### Error Codes

**Authentication Errors:**
- `UNAUTHORIZED` - Missing or invalid authentication
- `FORBIDDEN` - Insufficient permissions (admin required)

**Validation Errors:**
- `BAD_REQUEST` - Invalid input parameters
- `PARSE_ERROR` - Malformed request body

**Server Errors:**
- `INTERNAL_SERVER_ERROR` - Database or pipeline error
- `TIMEOUT` - Request exceeded timeout limit

**Example Error Response:**
```json
{
  "error": {
    "message": "Unauthorized: Invalid cron secret",
    "code": "UNAUTHORIZED",
    "data": {
      "code": "UNAUTHORIZED",
      "httpStatus": 401,
      "path": "cron.dailyNewsIngestion"
    }
  }
}
```

---

## Rate Limiting

### Public Endpoints
- **Limit:** 100 requests per hour per IP
- **Headers:** `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Admin Endpoints
- **Limit:** 1000 requests per hour per user
- **Burst:** 50 requests per minute

### Cron Endpoints
- **Limit:** 10 requests per hour per secret token
- **Intended Usage:** 1 request per scheduled interval

---

## Caching

### Client-Side Caching

**Recommended TTL:**
- `getAllSourcesHealth`: 60 seconds
- `getSourceHealth`: 60 seconds
- `getExecutionStats`: 300 seconds (5 minutes)
- `getTrendData`: 300 seconds (5 minutes)
- `getDashboardSummary`: 300 seconds (5 minutes)

**Example with TanStack Query:**
```typescript
const { data } = trpc.scraperHealth.getAllSourcesHealth.useQuery(
  undefined,
  { staleTime: 60_000 }  // 60 seconds
);
```

### Server-Side Caching

No server-side caching implemented. All queries hit database directly.

---

## Webhooks

### Cron Job Configuration

**External Cron Service:** cron-job.org (or similar)

**Daily Ingestion:**
- **URL:** `https://isa.manus.app/api/trpc/cron.dailyNewsIngestion`
- **Method:** POST
- **Schedule:** Daily at 02:00 UTC
- **Body:** `{"secret": "YOUR_CRON_SECRET"}`
- **Headers:** `Content-Type: application/json`

**Weekly Archival:**
- **URL:** `https://isa.manus.app/api/trpc/cron.weeklyNewsArchival`
- **Method:** POST
- **Schedule:** Weekly on Sunday at 03:00 UTC
- **Body:** `{"secret": "YOUR_CRON_SECRET"}`
- **Headers:** `Content-Type: application/json`

**Health Check:**
- **URL:** `https://isa.manus.app/api/trpc/cron.health`
- **Method:** GET
- **Schedule:** Every 5 minutes
- **Expected Response:** `{"status": "ok"}`

---

## TypeScript Client Usage

### Setup

```typescript
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './server/routers';

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'https://isa.manus.app/api/trpc',
    }),
  ],
});
```

### Query Example

```typescript
// Get all sources health
const health = await trpc.scraperHealth.getAllSourcesHealth.query();

// Get specific source health
const eurLexHealth = await trpc.scraperHealth.getSourceHealth.query({
  sourceId: 'eur_lex_news'
});

// Get execution stats (admin)
const stats = await trpc.scraperHealth.getExecutionStats.query({
  hoursBack: 168  // 7 days
});
```

### Mutation Example

```typescript
// Trigger daily ingestion (requires secret)
const result = await trpc.cron.dailyNewsIngestion.mutate({
  secret: process.env.CRON_SECRET
});

// Clear alert (admin)
await trpc.scraperHealth.clearAlert.mutate({
  sourceId: 'eur_lex_news'
});
```

### React Hook Example

```typescript
import { trpc } from '@/lib/trpc';

function HealthDashboard() {
  const { data, isLoading, error } = trpc.scraperHealth.getAllSourcesHealth.useQuery();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {data.map(source => (
        <div key={source.sourceId}>
          <h3>{source.sourceName}</h3>
          <p>Success Rate: {source.successRate24h}%</p>
        </div>
      ))}
    </div>
  );
}
```

---

## Performance Considerations

### Query Optimization

**Slow Queries (>1s):**
- `getTrendData` with hoursBack > 168 (7 days)
- `getExecutionsByDateRange` with large date ranges
- `getDashboardSummary` (aggregates multiple queries)

**Optimization Strategies:**
- Use appropriate time ranges (default to 7 days)
- Implement client-side caching with TanStack Query
- Use pagination for large result sets
- Consider background refresh for dashboard metrics

### Database Indexes

**Required Indexes:**
- `scraper_executions(sourceId, startedAt)`
- `scraper_executions(success, startedAt)`
- `scraper_health_summary(sourceId)`
- `pipeline_executions(pipelineType, startedAt)`

---

## Security Considerations

### Secret Token Management

**CRON_SECRET:**
- Store in environment variables (never commit to Git)
- Rotate regularly (monthly recommended)
- Use strong random values (32+ characters)
- Monitor for unauthorized access attempts

**Example Generation:**
```bash
openssl rand -base64 32
```

### Admin Authentication

**Requirements:**
- Valid session cookie from Manus OAuth
- User role must be "admin"
- Session must not be expired

**Verification:**
```typescript
// Server-side check in protectedProcedure
if (ctx.user.role !== 'admin') {
  throw new TRPCError({ code: 'FORBIDDEN' });
}
```

### Input Validation

All inputs validated with Zod schemas:
- String length limits
- Numeric range constraints
- Enum value validation
- Required field enforcement

---

## Monitoring and Alerting

### Key Metrics to Monitor

**Health Metrics:**
- Source success rate (target: 100%, alert: <95%)
- Consecutive failures (alert: >=3)
- Average items fetched (alert: <50% of baseline)
- Average duration (alert: >2x baseline)

**Pipeline Metrics:**
- Pipeline success rate (target: 100%, alert: <95%)
- Average AI quality score (target: >70, alert: <60)
- Items processed per execution (alert: <50% of baseline)
- Execution duration (alert: >10 minutes)

### Alert Configuration

**Critical Alerts:**
- Any source with 3+ consecutive failures
- Pipeline success rate <80% over 24h
- Average AI quality score <50 over 24h

**Warning Alerts:**
- Source success rate 80-94% over 24h
- Pipeline success rate 80-94% over 24h
- Average AI quality score 50-69 over 24h

---

## Changelog

### v1.0.0 (2026-02-12)
- Initial API reference documentation
- 3 routers: cron, scraperHealth, pipelineObservability
- 20+ procedures documented
- Complete schemas and examples

---

## Related Documentation

- [CAPABILITY_SPEC.md](./CAPABILITY_SPEC.md) - NEWS_HUB architecture and design
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Setup and integration guide
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues and solutions
- [../../planning/refactoring/PHASE_3_PROGRESS.md](../../planning/refactoring/PHASE_3_PROGRESS.md) - Refactoring progress

---

**Document Status:** Complete  
**Next Document:** IMPLEMENTATION_GUIDE.md
