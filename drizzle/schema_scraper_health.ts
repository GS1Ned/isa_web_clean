/**
 * Scraper Health Monitoring Schema
 * Tracks news scraper execution results for observability and alerting
 */

import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
} from "drizzle-orm/mysql-core";

/**
 * Scraper execution log - tracks each scraper run
 */
export const scraperExecutions = mysqlTable("scraper_executions", {
  id: int("id").autoincrement().primaryKey(),
  
  // Scraper identification
  sourceId: varchar("source_id", { length: 64 }).notNull(),
  sourceName: varchar("source_name", { length: 255 }).notNull(),
  
  // Execution results
  success: boolean("success").notNull(),
  itemsFetched: int("items_fetched").notNull().default(0),
  errorMessage: text("error_message"),
  
  // Retry information
  attempts: int("attempts").notNull().default(1),
  
  // Performance metrics
  durationMs: int("duration_ms"),
  
  // Execution context
  triggeredBy: mysqlEnum("triggered_by", ["cron", "manual", "api"]).notNull().default("cron"),
  executionId: varchar("execution_id", { length: 64 }), // Groups scrapers from same pipeline run
  
  // Timestamps
  startedAt: timestamp("started_at").notNull(),
  completedAt: timestamp("completed_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ScraperExecution = typeof scraperExecutions.$inferSelect;
export type InsertScraperExecution = typeof scraperExecutions.$inferInsert;

/**
 * Scraper health summary - aggregated health metrics per source
 * Updated after each execution for quick dashboard queries
 */
export const scraperHealthSummary = mysqlTable("scraper_health_summary", {
  id: int("id").autoincrement().primaryKey(),
  
  // Scraper identification
  sourceId: varchar("source_id", { length: 64 }).notNull().unique(),
  sourceName: varchar("source_name", { length: 255 }).notNull(),
  
  // Health metrics (last 24 hours)
  successRate24h: int("success_rate_24h").notNull().default(100), // 0-100
  totalExecutions24h: int("total_executions_24h").notNull().default(0),
  failedExecutions24h: int("failed_executions_24h").notNull().default(0),
  avgItemsFetched24h: int("avg_items_fetched_24h").notNull().default(0),
  avgDurationMs24h: int("avg_duration_ms_24h"),
  
  // Last execution
  lastExecutionSuccess: boolean("last_execution_success"),
  lastExecutionAt: timestamp("last_execution_at"),
  lastSuccessAt: timestamp("last_success_at"),
  lastErrorMessage: text("last_error_message"),
  
  // Alert state
  consecutiveFailures: int("consecutive_failures").notNull().default(0),
  alertSent: boolean("alert_sent").notNull().default(false),
  alertSentAt: timestamp("alert_sent_at"),
  
  // Timestamps
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ScraperHealthSummary = typeof scraperHealthSummary.$inferSelect;
export type InsertScraperHealthSummary = typeof scraperHealthSummary.$inferInsert;
