/**
 * Cron Monitoring Schema
 * Tables for tracking cron job execution history
 */

import {
  mysqlTable,
  int,
  varchar,
  text,
  datetime,
  timestamp,
} from "drizzle-orm/mysql-core";

/**
 * Cron execution logs table
 * Tracks history of all cron job executions
 */
export const cronExecutionLogs = mysqlTable("cron_execution_logs", {
  id: int("id").primaryKey().autoincrement(),
  jobName: varchar("job_name", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull(), // 'success' or 'failure'
  duration: int("duration").notNull(), // milliseconds
  stats: text("stats"), // JSON string of execution stats
  error: text("error"), // Error message if failed
  executedAt: datetime("executed_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
