# Pipeline Observability Specification

**Version:** 1.0  
**Date:** 2025-12-17  
**Status:** Design Complete

## Overview

This document specifies the observability infrastructure for ISA's news ingestion pipeline, enabling systematic monitoring of AI processing quality, source reliability, and data pipeline health.

## Design Principles

1. **Structured Logging** - All pipeline events logged with consistent schema for queryability
2. **Quality Metrics** - Quantifiable measures of AI output quality and data completeness
3. **Actionable Alerts** - Metrics tied to thresholds that trigger owner notifications
4. **Performance Tracking** - Duration and resource usage monitoring for optimization
5. **Historical Analysis** - Retain execution logs for trend analysis and debugging

## Database Schema

### pipeline_execution_log Table

Tracks individual pipeline executions with detailed metrics.

```typescript
{
  id: serial('id').primaryKey(),
  execution_id: varchar('execution_id', { length: 50 }).notNull().unique(),
  pipeline_type: varchar('pipeline_type', { length: 50 }).notNull(), // 'news_ingestion', 'news_archival'
  triggered_by: varchar('triggered_by', { length: 50 }).notNull(), // 'cron', 'manual', 'api'
  started_at: timestamp('started_at').notNull(),
  completed_at: timestamp('completed_at'),
  duration_ms: integer('duration_ms'),
  status: varchar('status', { length: 20 }).notNull(), // 'running', 'success', 'partial_success', 'failed'
  
  // Source metrics
  sources_attempted: integer('sources_attempted').notNull(),
  sources_succeeded: integer('sources_succeeded').notNull(),
  sources_failed: integer('sources_failed').notNull(),
  
  // Item metrics
  items_fetched: integer('items_fetched').notNull(),
  items_deduplicated: integer('items_deduplicated').notNull(),
  items_processed: integer('items_processed').notNull(),
  items_saved: integer('items_saved').notNull(),
  items_failed: integer('items_failed').notNull(),
  
  // AI processing metrics
  ai_calls_made: integer('ai_calls_made').notNull(),
  ai_calls_succeeded: integer('ai_calls_succeeded').notNull(),
  ai_calls_failed: integer('ai_calls_failed').notNull(),
  ai_avg_quality_score: real('ai_avg_quality_score'), // 0.0-1.0
  
  // Quality metrics
  items_with_summary: integer('items_with_summary').notNull(),
  items_with_regulation_tags: integer('items_with_regulation_tags').notNull(),
  items_with_gs1_impact_tags: integer('items_with_gs1_impact_tags').notNull(),
  items_with_sector_tags: integer('items_with_sector_tags').notNull(),
  items_with_recommendations: integer('items_with_recommendations').notNull(),
  
  // Error tracking
  error_count: integer('error_count').notNull().default(0),
  error_messages: text('error_messages'), // JSON array of error objects
  warnings: text('warnings'), // JSON array of warning messages
  
  // Metadata
  config_snapshot: text('config_snapshot'), // JSON snapshot of pipeline config
  created_at: timestamp('created_at').defaultNow().notNull(),
}
```

### Indexes

```sql
CREATE INDEX idx_pipeline_execution_log_started_at ON pipeline_execution_log(started_at DESC);
CREATE INDEX idx_pipeline_execution_log_status ON pipeline_execution_log(status);
CREATE INDEX idx_pipeline_execution_log_pipeline_type ON pipeline_execution_log(pipeline_type);
CREATE INDEX idx_pipeline_execution_log_execution_id ON pipeline_execution_log(execution_id);
```

## Metrics Specification

### 1. Source Reliability Metrics

**Purpose:** Track which news sources are consistently available and returning content.

**Metrics:**
- `source_success_rate`: Percentage of successful fetches per source (24h rolling window)
- `source_avg_items`: Average items returned per successful fetch
- `source_avg_duration_ms`: Average fetch duration per source
- `source_consecutive_failures`: Count of consecutive failures (triggers alert at 3)

**Alert Thresholds:**
- Success rate < 80% over 24h → Warning
- Success rate < 50% over 24h → Critical
- 3+ consecutive failures → Critical (already implemented in scraper health)

### 2. AI Processing Quality Metrics

**Purpose:** Detect degradation in AI summarization and tagging quality.

**Metrics:**
- `ai_quality_score`: Composite score (0.0-1.0) based on:
  - Summary coherence (0.0-1.0): Length 100-500 chars, no truncation, grammatical
  - Tag accuracy (0.0-1.0): Regulation tags present, GS1 impact tags present, sector tags present
  - Citation completeness (0.0-1.0): Recommendations generated, related standards linked
- `ai_success_rate`: Percentage of AI calls that succeed without errors
- `ai_avg_duration_ms`: Average AI processing time per article

**Quality Score Calculation:**
```typescript
ai_quality_score = (
  summary_coherence_score * 0.4 +
  tag_accuracy_score * 0.4 +
  citation_completeness_score * 0.2
)

summary_coherence_score = (
  (summary.length >= 100 && summary.length <= 500 ? 1.0 : 0.5) * 0.5 +
  (!summary.includes('...') ? 1.0 : 0.0) * 0.3 +
  (summary.split('.').length >= 2 ? 1.0 : 0.5) * 0.2
)

tag_accuracy_score = (
  (regulationTags.length > 0 ? 1.0 : 0.0) * 0.4 +
  (gs1ImpactTags.length > 0 ? 1.0 : 0.0) * 0.3 +
  (sectorTags.length > 0 ? 1.0 : 0.0) * 0.3
)

citation_completeness_score = (
  (recommendations.length > 0 ? 1.0 : 0.0) * 0.6 +
  (relatedStandardIds.length > 0 ? 1.0 : 0.0) * 0.4
)
```

**Alert Thresholds:**
- AI quality score < 0.7 for 3+ consecutive executions → Warning
- AI quality score < 0.5 for 1 execution → Critical
- AI success rate < 90% → Warning

### 3. Pipeline Health Metrics

**Purpose:** Monitor overall pipeline execution health and performance.

**Metrics:**
- `pipeline_success_rate`: Percentage of executions completing successfully
- `pipeline_avg_duration_ms`: Average pipeline execution time
- `pipeline_items_per_execution`: Average items processed per run
- `pipeline_error_rate`: Percentage of items failing to process

**Alert Thresholds:**
- Pipeline success rate < 95% over 7 days → Warning
- Pipeline avg duration > 120,000ms (2 minutes) → Warning
- Pipeline error rate > 5% → Warning

### 4. Coverage Metrics

**Purpose:** Track how well the pipeline is capturing expected regulatory events.

**Metrics:**
- `coverage_rate`: Percentage of regulations with at least 1 news item in past 30 days
- `items_per_regulation_avg`: Average news items per regulation
- `critical_event_capture_rate`: Percentage of expected milestones captured (future enhancement)

**Alert Thresholds:**
- Coverage rate < 20% → Warning
- Coverage rate < 10% → Critical

## Structured Logging Format

All pipeline events logged with consistent JSON structure:

```typescript
{
  timestamp: string, // ISO 8601
  execution_id: string, // Unique execution identifier
  pipeline_type: 'news_ingestion' | 'news_archival',
  event_type: 'pipeline_start' | 'source_fetch' | 'ai_process' | 'item_save' | 'pipeline_complete' | 'error',
  level: 'info' | 'warn' | 'error',
  message: string,
  data: {
    // Event-specific data
  },
  duration_ms?: number,
  error?: {
    message: string,
    stack: string,
    code: string
  }
}
```

## Implementation Plan

### Phase 1: Database Schema (Current Phase)
- [x] Design pipeline_execution_log table schema
- [ ] Create Drizzle schema definition
- [ ] Run database migration
- [ ] Create TypeScript types

### Phase 2: Structured Logging Infrastructure
- [ ] Create logging utility module (server/utils/pipeline-logger.ts)
- [ ] Implement execution context tracking
- [ ] Add logging calls to news-pipeline.ts
- [ ] Add logging calls to news-fetcher.ts
- [ ] Add logging calls to news-ai-processor.ts

### Phase 3: AI Quality Metrics
- [ ] Implement quality score calculation functions
- [ ] Integrate quality scoring into AI processor
- [ ] Store quality metrics in pipeline_execution_log
- [ ] Add alert logic for quality degradation

### Phase 4: Database Helpers & tRPC Router
- [ ] Create db-pipeline-observability.ts with query helpers
- [ ] Create pipelineObservabilityRouter with tRPC procedures
- [ ] Integrate router into main routers.ts

### Phase 5: Admin Dashboard UI
- [ ] Create AdminPipelineObservability.tsx page
- [ ] Add execution history table
- [ ] Add quality metrics charts
- [ ] Add alert status indicators
- [ ] Add route to App.tsx and navigation menu

### Phase 6: Testing & Validation
- [ ] Write vitest tests for quality score calculation
- [ ] Write vitest tests for logging infrastructure
- [ ] Write vitest tests for tRPC procedures
- [ ] Verify dashboard UI rendering
- [ ] Test alert triggering logic

## Success Criteria

1. **Observability Coverage:** 100% of pipeline executions logged with complete metrics
2. **Quality Detection:** AI quality degradation detected within 1 execution cycle
3. **Performance Impact:** Logging overhead < 5% of total pipeline execution time
4. **Alert Accuracy:** Zero false positive alerts, < 1% false negative rate
5. **Historical Analysis:** 30 days of execution logs retained for trend analysis

## Future Enhancements

1. **Critical Event Tracking:** Define expected milestones per regulation and track capture rate
2. **Anomaly Detection:** ML-based detection of unusual patterns in metrics
3. **Cost Tracking:** Track LLM API costs per execution for budget monitoring
4. **A/B Testing:** Support for testing different AI prompts and comparing quality scores
5. **Real-time Dashboards:** WebSocket-based live updates during pipeline execution

## References

- NEWS_PIPELINE.md - Current pipeline architecture
- NEWS_HEALTH_MONITORING.md - Scraper health monitoring (complementary system)
- ARCHITECTURE.md - Overall ISA system architecture
