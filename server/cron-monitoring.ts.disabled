/**
 * Cron Job Monitoring and Alerting
 * Tracks execution history and sends alerts on failures
 */

import { getDb } from "./db";
import { notifyOwner } from "./_core/notification";

interface CronExecutionLog {
  jobName: string;
  status: "success" | "failure";
  duration: number;
  stats?: Record<string, any>;
  error?: string;
  timestamp: Date;
}

/**
 * Log cron job execution to database
 */
export async function logCronExecution(log: CronExecutionLog) {
  const db = await getDb();
  if (!db) {
    console.error("[cron-monitoring] Database not available");
    return;
  }

  try {
    const { cronExecutionLogs } = await import("../drizzle/schema");

    await db.insert(cronExecutionLogs).values({
      jobName: log.jobName,
      status: log.status,
      duration: log.duration,
      stats: JSON.stringify(log.stats || {}),
      error: log.error,
      executedAt: log.timestamp,
    });

    console.log(
      `[cron-monitoring] Logged execution: ${log.jobName} - ${log.status}`
    );
  } catch (error) {
    console.error("[cron-monitoring] Failed to log execution:", error);
  }
}

/**
 * Get recent execution history for a job
 */
export async function getExecutionHistory(jobName: string, limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  try {
    const { cronExecutionLogs } = await import("../drizzle/schema");
    const { desc, eq } = await import("drizzle-orm");

    const logs = await db
      .select()
      .from(cronExecutionLogs)
      .where(eq(cronExecutionLogs.jobName, jobName))
      .orderBy(desc(cronExecutionLogs.executedAt))
      .limit(limit);

    return logs;
  } catch (error) {
    console.error("[cron-monitoring] Failed to get execution history:", error);
    return [];
  }
}

/**
 * Get execution statistics for a job
 */
export async function getExecutionStats(jobName: string, days: number = 7) {
  const db = await getDb();
  if (!db) return null;

  try {
    const { cronExecutionLogs } = await import("../drizzle/schema");
    const { sql, gte, eq, and } = await import("drizzle-orm");

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const stats = await db
      .select({
        total: sql<number>`count(*)`,
        successful: sql<number>`sum(case when ${cronExecutionLogs.status} = 'success' then 1 else 0 end)`,
        failed: sql<number>`sum(case when ${cronExecutionLogs.status} = 'failure' then 1 else 0 end)`,
        avgDuration: sql<number>`avg(${cronExecutionLogs.duration})`,
      })
      .from(cronExecutionLogs)
      .where(
        and(
          eq(cronExecutionLogs.jobName, jobName),
          gte(cronExecutionLogs.executedAt, cutoffDate)
        )
      );

    return stats[0];
  } catch (error) {
    console.error("[cron-monitoring] Failed to get execution stats:", error);
    return null;
  }
}

/**
 * Check for consecutive failures and send alert
 */
export async function checkAndAlertOnFailures(
  jobName: string,
  threshold: number = 3
) {
  const history = await getExecutionHistory(jobName, threshold);

  if (history.length < threshold) {
    return; // Not enough history yet
  }

  // Check if all recent executions failed
  const allFailed = history.every(log => log.status === "failure");

  if (allFailed) {
    console.error(
      `[cron-monitoring] ⚠️  ${jobName} has failed ${threshold} times consecutively!`
    );

    // Send notification to owner
    const lastError = history[0].error || "Unknown error";
    const message = `
**Cron Job Alert: ${jobName}**

The cron job has failed ${threshold} times consecutively.

**Last Error:**
${lastError}

**Recent Execution History:**
${history.map((log, i) => `${i + 1}. ${log.executedAt.toISOString()} - ${log.status} (${log.duration}ms)`).join("\n")}

**Action Required:**
1. Check server logs for detailed error messages
2. Verify external services are accessible
3. Check CRON_SECRET is correctly configured
4. Review cron service dashboard for execution logs

**Endpoints:**
- Health: /cron/health
- Daily News: /cron/daily-news-ingestion
- Weekly Archival: /cron/weekly-news-archival
`;

    try {
      await notifyOwner({
        title: `⚠️ Cron Job Failure: ${jobName}`,
        content: message,
      });
      console.log(`[cron-monitoring] Alert sent to owner`);
    } catch (error) {
      console.error("[cron-monitoring] Failed to send alert:", error);
    }
  }
}

/**
 * Clean up old execution logs (keep last 100 per job)
 */
export async function cleanupOldLogs() {
  const db = await getDb();
  if (!db) return;

  try {
    const { cronExecutionLogs } = await import("../drizzle/schema");
    const { sql } = await import("drizzle-orm");

    // Keep only the most recent 100 logs per job
    await db.execute(sql`
      DELETE FROM ${cronExecutionLogs}
      WHERE id NOT IN (
        SELECT id FROM (
          SELECT id, ROW_NUMBER() OVER (PARTITION BY job_name ORDER BY executed_at DESC) as rn
          FROM ${cronExecutionLogs}
        ) t
        WHERE rn <= 100
      )
    `);

    console.log("[cron-monitoring] Cleaned up old execution logs");
  } catch (error) {
    console.error("[cron-monitoring] Failed to cleanup logs:", error);
  }
}

/**
 * Wrapper function to monitor cron job execution
 */
export async function monitoredCronJob<T>(
  jobName: string,
  job: () => Promise<T>,
  alertThreshold: number = 3
): Promise<T> {
  const startTime = Date.now();

  try {
    const result = await job();
    const duration = Date.now() - startTime;

    // Log successful execution
    await logCronExecution({
      jobName,
      status: "success",
      duration,
      stats:
        typeof result === "object" && result !== null
          ? (result as any)
          : undefined,
      timestamp: new Date(),
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Log failed execution
    await logCronExecution({
      jobName,
      status: "failure",
      duration,
      error: errorMessage,
      timestamp: new Date(),
    });

    // Check for consecutive failures and alert
    await checkAndAlertOnFailures(jobName, alertThreshold);

    throw error;
  }
}
