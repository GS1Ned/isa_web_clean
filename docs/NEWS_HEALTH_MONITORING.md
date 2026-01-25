# News Scraper Health Monitoring

**Status:** Production-ready with database persistence  
**Last Updated:** 2025-12-17  
**Test Coverage:** 15/15 tests passing

## Overview

The News Scraper Health Monitoring system tracks the reliability and performance of all news scrapers in the ISA News Hub. It provides persistent health metrics, automatic alerting, and historical analysis capabilities.

## Architecture

### Components

1. **Retry Logic** (`news-retry-util.ts`)
   - Exponential backoff with jitter
   - Configurable retry attempts (default: 3)
   - Automatic delay calculation between retries

2. **Health Monitor** (`news-health-monitor.ts`)
   - Database-backed health tracking
   - 24-hour rolling metrics
   - Consecutive failure detection
   - Owner alerting on persistent failures

3. **Database Schema** (`schema_scraper_health.ts`)
   - `scraper_executions`: Individual run logs
   - `scraper_health_summary`: Aggregated metrics per source

### Data Flow

```
News Fetcher
    ↓
Retry Logic (retryWithBackoff)
    ↓
Health Monitor (recordScraperExecution)
    ↓
Database (scraper_executions + scraper_health_summary)
    ↓
Alert System (3+ consecutive failures → owner notification)
```

## Database Schema

### scraper_executions

Tracks every scraper execution with full metadata.

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Auto-increment primary key |
| `source_id` | VARCHAR(64) | Unique scraper identifier (e.g., "gs1-nl") |
| `source_name` | VARCHAR(255) | Human-readable name |
| `success` | BOOLEAN | Whether execution succeeded |
| `items_fetched` | INT | Number of news items retrieved |
| `error_message` | TEXT | Error details if failed |
| `attempts` | INT | Number of retry attempts |
| `duration_ms` | INT | Total execution time |
| `triggered_by` | ENUM | 'cron', 'manual', or 'api' |
| `execution_id` | VARCHAR(64) | Groups scrapers from same pipeline run |
| `started_at` | TIMESTAMP | Execution start time |
| `completed_at` | TIMESTAMP | Execution completion time |
| `created_at` | TIMESTAMP | Record creation time |

**Indexes:**
- `idx_source_id` on `source_id`
- `idx_execution_id` on `execution_id`
- `idx_started_at` on `started_at`

### scraper_health_summary

Aggregated health metrics per source (24-hour rolling window).

| Column | Type | Description |
|--------|------|-------------|
| `id` | INT | Auto-increment primary key |
| `source_id` | VARCHAR(64) | Unique scraper identifier (UNIQUE) |
| `source_name` | VARCHAR(255) | Human-readable name |
| `success_rate_24h` | INT | Success rate percentage (0-100) |
| `total_executions_24h` | INT | Total runs in last 24 hours |
| `failed_executions_24h` | INT | Failed runs in last 24 hours |
| `avg_items_fetched_24h` | INT | Average items per successful run |
| `avg_duration_ms_24h` | INT | Average execution time |
| `last_execution_success` | BOOLEAN | Whether last run succeeded |
| `last_execution_at` | TIMESTAMP | Last execution time |
| `last_success_at` | TIMESTAMP | Last successful execution time |
| `last_error_message` | TEXT | Most recent error message |
| `consecutive_failures` | INT | Current failure streak |
| `alert_sent` | BOOLEAN | Whether alert notification sent |
| `alert_sent_at` | TIMESTAMP | When alert was sent |
| `updated_at` | TIMESTAMP | Last update time |
| `created_at` | TIMESTAMP | Record creation time |

**Indexes:**
- `idx_source_id` on `source_id`
- `idx_last_execution_at` on `last_execution_at`

## Usage

### Recording Scraper Execution

```typescript
import { recordScraperExecution } from "./news-health-monitor";

const startTime = Date.now();

try {
  const items = await fetchNewsFromSource();
  
  await recordScraperExecution({
    sourceId: "gs1-nl",
    sourceName: "GS1 Netherlands",
    success: true,
    itemsFetched: items.length,
    attempts: 1,
    durationMs: Date.now() - startTime,
    timestamp: new Date(),
  });
} catch (error) {
  await recordScraperExecution({
    sourceId: "gs1-nl",
    sourceName: "GS1 Netherlands",
    success: false,
    itemsFetched: 0,
    error: error.message,
    attempts: 3, // After retries
    durationMs: Date.now() - startTime,
    timestamp: new Date(),
  });
}
```

### Querying Health Metrics

```typescript
import { getSourceHealth, getAllSourcesHealth } from "./news-health-monitor";

// Get health for specific source
const health = await getSourceHealth("gs1-nl");
console.log(`Success rate: ${health.successRate}%`);
console.log(`Consecutive failures: ${health.consecutiveFailures}`);

// Get health for all sources
const allHealth = await getAllSourcesHealth();
for (const [sourceId, health] of allHealth.entries()) {
  console.log(`${sourceId}: ${health.successRate}% (${health.totalExecutions} runs)`);
}
```

### Printing Health Summary

```typescript
import { printHealthSummary } from "./news-health-monitor";

// Print formatted health summary to console
await printHealthSummary();
```

Output:
```
=== News Scraper Health Summary ===
✅ gs1-nl: 100% success (10 runs, 0 consecutive failures)
⚠️ efrag: 67% success (12 runs, 2 consecutive failures)
===================================
```

## Alerting System

### Alert Trigger

Alerts are sent to the project owner when a scraper has **3 or more consecutive failures**.

### Alert Deduplication

- Alerts are only sent once per failure streak
- `alert_sent` flag prevents spam
- Flag is reset when scraper succeeds again

### Alert Content

```
Title: News Scraper Alert: [Source Name] Failing

Content:
The [Source Name] news scraper has failed [N] times in a row.

Last error: [Error message]

Success rate: [X]%
Total executions: [N]

Please investigate the scraper configuration and source availability.
```

### Manual Alert Reset

If you fix a scraper and want to clear the alert state:

```sql
UPDATE scraper_health_summary
SET alert_sent = FALSE, alert_sent_at = NULL
WHERE source_id = 'gs1-nl';
```

## Metrics Calculation

### Success Rate (24h)

```
success_rate_24h = (successful_runs / total_runs) * 100
```

Only includes executions from the last 24 hours.

### Consecutive Failures

Counts failures from most recent execution backward until a success is found.

**Example:**
- Run 1: Success
- Run 2: Failure
- Run 3: Failure
- Run 4: Failure

→ `consecutive_failures = 3`

### Average Items Fetched

```
avg_items_fetched_24h = sum(items_fetched) / successful_runs
```

Only includes successful executions from the last 24 hours.

## Monitoring & Observability

### Console Logging

Every scraper execution logs to console:

```
[scraper-health] ✅ SUCCESS GS1 Netherlands - 15 items - 2500ms
[scraper-health] ❌ FAILED EFRAG (3 attempts) - Error: Connection timeout - 8000ms
```

### Database Queries

**Get recent failures:**
```sql
SELECT source_name, error_message, started_at
FROM scraper_executions
WHERE success = FALSE
ORDER BY started_at DESC
LIMIT 10;
```

**Get sources with high failure rates:**
```sql
SELECT source_name, success_rate_24h, consecutive_failures
FROM scraper_health_summary
WHERE success_rate_24h < 80
ORDER BY success_rate_24h ASC;
```

**Get execution history for a source:**
```sql
SELECT success, items_fetched, attempts, duration_ms, started_at
FROM scraper_executions
WHERE source_id = 'gs1-nl'
ORDER BY started_at DESC
LIMIT 20;
```

## Testing

### Unit Tests (`news-health-monitor.test.ts`)

- Database persistence
- Health summary creation/updates
- Consecutive failure tracking
- Failure reset after success
- 24-hour metrics calculation
- Multi-source health retrieval
- Database unavailability handling
- Retry attempt persistence
- Error message storage

**Run tests:**
```bash
pnpm test news-health-monitor.test.ts
```

### Integration Tests (`news-pipeline-db-integration.test.ts`)

- End-to-end pipeline with retry logic
- Health tracking across multiple runs
- Separate tracking for different sources
- Duration metrics persistence

**Run tests:**
```bash
pnpm test news-pipeline-db-integration.test.ts
```

## Troubleshooting

### Scraper showing 0% success rate

1. Check recent executions:
   ```sql
   SELECT * FROM scraper_executions
   WHERE source_id = 'your-source-id'
   ORDER BY started_at DESC LIMIT 5;
   ```

2. Check error messages:
   ```sql
   SELECT error_message, COUNT(*) as count
   FROM scraper_executions
   WHERE source_id = 'your-source-id' AND success = FALSE
   GROUP BY error_message;
   ```

3. Common issues:
   - Source website changed structure → update scraper
   - Network connectivity issues → check firewall/proxy
   - Rate limiting → add delays between requests
   - Authentication expired → refresh credentials

### Alert not received despite failures

1. Check alert status:
   ```sql
   SELECT alert_sent, alert_sent_at, consecutive_failures
   FROM scraper_health_summary
   WHERE source_id = 'your-source-id';
   ```

2. Verify notification system:
   - Check owner notification settings
   - Test with manual `notifyOwner()` call
   - Check notification service logs

### Health summary not updating

1. Check if executions are being recorded:
   ```sql
   SELECT COUNT(*) FROM scraper_executions
   WHERE source_id = 'your-source-id'
   AND started_at > NOW() - INTERVAL 1 HOUR;
   ```

2. Verify `updateHealthSummary()` is being called after `recordScraperExecution()`

3. Check database connection:
   ```typescript
   const db = await getDb();
   console.log("Database available:", db !== null);
   ```

## Future Enhancements

### Planned Features

- [ ] Admin dashboard for health monitoring UI
- [ ] Historical trend analysis (beyond 24 hours)
- [ ] Configurable alert thresholds per source
- [ ] Slack/email integration for alerts
- [ ] Performance regression detection
- [ ] Automatic scraper recovery attempts

### Potential Improvements

- [ ] Add execution_id grouping for pipeline runs
- [ ] Track scraper version/configuration changes
- [ ] Add cost tracking (API calls, compute time)
- [ ] Implement health score algorithm
- [ ] Add predictive failure detection

## Related Documentation

- [News Pipeline Architecture](./NEWS_PIPELINE.md)
- [News Sources Configuration](./NEWS_SOURCES.md)
- [Database Schema](./DATA_MODEL.md)
- [Testing Guide](./TESTING.md)
