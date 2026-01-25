import { int, real, serial, text, timestamp, varchar } from 'drizzle-orm/mysql-core';
import { mysqlTable } from 'drizzle-orm/mysql-core';

/**
 * Pipeline Execution Log
 * 
 * Tracks individual news pipeline executions with detailed metrics for:
 * - Source reliability monitoring
 * - AI processing quality assessment
 * - Pipeline health tracking
 * - Error diagnosis and debugging
 * 
 * Retention: 30 days of execution history
 */
export const pipelineExecutionLog = mysqlTable('pipeline_execution_log', {
  id: serial('id').primaryKey(),
  executionId: varchar('execution_id', { length: 50 }).notNull().unique(),
  pipelineType: varchar('pipeline_type', { length: 50 }).notNull(), // 'news_ingestion', 'news_archival'
  triggeredBy: varchar('triggered_by', { length: 50 }).notNull(), // 'cron', 'manual', 'api'
  startedAt: timestamp('started_at').notNull(),
  completedAt: timestamp('completed_at'),
  durationMs: int('duration_ms'),
  status: varchar('status', { length: 20 }).notNull(), // 'running', 'success', 'partial_success', 'failed'
  
  // Source metrics
  sourcesAttempted: int('sources_attempted').notNull(),
  sourcesSucceeded: int('sources_succeeded').notNull(),
  sourcesFailed: int('sources_failed').notNull(),
  
  // Item metrics
  itemsFetched: int('items_fetched').notNull(),
  itemsDeduplicated: int('items_deduplicated').notNull(),
  itemsProcessed: int('items_processed').notNull(),
  itemsSaved: int('items_saved').notNull(),
  itemsFailed: int('items_failed').notNull(),
  
  // AI processing metrics
  aiCallsMade: int('ai_calls_made').notNull(),
  aiCallsSucceeded: int('ai_calls_succeeded').notNull(),
  aiCallsFailed: int('ai_calls_failed').notNull(),
  aiAvgQualityScore: real('ai_avg_quality_score'), // 0.0-1.0
  
  // Quality metrics
  itemsWithSummary: int('items_with_summary').notNull(),
  itemsWithRegulationTags: int('items_with_regulation_tags').notNull(),
  itemsWithGs1ImpactTags: int('items_with_gs1_impact_tags').notNull(),
  itemsWithSectorTags: int('items_with_sector_tags').notNull(),
  itemsWithRecommendations: int('items_with_recommendations').notNull(),
  
  // Error tracking
  errorCount: int('error_count').notNull().default(0),
  errorMessages: text('error_messages'), // JSON array of error objects
  warnings: text('warnings'), // JSON array of warning messages
  
  // Metadata
  configSnapshot: text('config_snapshot'), // JSON snapshot of pipeline config
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export type PipelineExecutionLog = typeof pipelineExecutionLog.$inferSelect;
export type NewPipelineExecutionLog = typeof pipelineExecutionLog.$inferInsert;
