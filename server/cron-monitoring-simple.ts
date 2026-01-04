/**
 * Simplified Cron Job Monitoring
 * File-based logging and alerting for cron job executions
 */

import fs from "fs";
import path from "path";
import { notifyOwner } from "./_core/notification";
import { serverLogger } from "./_core/logger-wiring";


const LOG_DIR = path.join(process.cwd(), "logs", "cron");
const MAX_LOG_FILES = 30; // Keep last 30 days of logs

interface CronExecutionLog {
  jobName: string;
  status: "success" | "failure";
  duration: number;
  stats?: Record<string, any>;
  error?: string;
  timestamp: string;
}

/**
 * Ensure log directory exists
 */
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

/**
 * Get log file path for today
 */
function getLogFilePath(date: Date = new Date()): string {
  const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD
  return path.join(LOG_DIR, `cron-${dateStr}.log`);
}

/**
 * Log cron job execution to file
 */
export function logCronExecution(log: CronExecutionLog) {
  ensureLogDir();

  const logEntry = JSON.stringify(log) + "\n";
  const logFile = getLogFilePath();

  try {
    fs.appendFileSync(logFile, logEntry);
    console.log(`[cron-monitoring] Logged: ${log.jobName} - ${log.status}`);
  } catch (error) {
    serverLogger.error("[cron-monitoring] Failed to write log:", error);
  }
}

/**
 * Get recent execution logs for a job
 */
export function getExecutionHistory(
  jobName: string,
  days: number = 7
): CronExecutionLog[] {
  const logs: CronExecutionLog[] = [];
  const now = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    const logFile = getLogFilePath(date);
    if (!fs.existsSync(logFile)) continue;

    try {
      const content = fs.readFileSync(logFile, "utf-8");
      const lines = content.trim().split("\n").filter(Boolean);

      for (const line of lines) {
        try {
          const entry = JSON.parse(line) as CronExecutionLog;
          if (entry.jobName === jobName) {
            logs.push(entry);
          }
        } catch {
          // Skip invalid JSON lines
        }
      }
    } catch (error) {
      serverLogger.error(`[cron-monitoring] Failed to read log file ${logFile}:`, error);
    }
  }

  // Sort by timestamp descending (most recent first)
  return logs.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Get execution statistics for a job
 */
export function getExecutionStats(jobName: string, days: number = 7) {
  const logs = getExecutionHistory(jobName, days);

  if (logs.length === 0) {
    return null;
  }

  const successful = logs.filter(l => l.status === "success").length;
  const failed = logs.filter(l => l.status === "failure").length;
  const avgDuration =
    logs.reduce((sum, l) => sum + l.duration, 0) / logs.length;

  return {
    total: logs.length,
    successful,
    failed,
    avgDuration: Math.round(avgDuration),
    successRate: Math.round((successful / logs.length) * 100),
  };
}

/**
 * Check for consecutive failures and send alert
 */
export async function checkAndAlertOnFailures(
  jobName: string,
  threshold: number = 3
) {
  const history = getExecutionHistory(jobName, 1); // Check today's logs

  if (history.length < threshold) {
    return; // Not enough history yet
  }

  // Get the most recent executions
  const recentExecutions = history.slice(0, threshold);

  // Check if all recent executions failed
  const allFailed = recentExecutions.every(log => log.status === "failure");

  if (allFailed) {
    serverLogger.error(
      `[cron-monitoring] ⚠️  ${jobName} has failed ${threshold} times consecutively!`
    );

    // Send notification to owner
    const lastError = recentExecutions[0].error || "Unknown error";
    const message = `
**Cron Job Alert: ${jobName}**

The cron job has failed ${threshold} times consecutively.

**Last Error:**
\`\`\`
${lastError}
\`\`\`

**Recent Execution History:**
${recentExecutions.map((log, i) => `${i + 1}. ${log.timestamp} - ${log.status} (${log.duration}ms)`).join("\n")}

**Action Required:**
1. Check server logs for detailed error messages
2. Verify external services are accessible (news sources may be rate-limiting)
3. Check CRON_SECRET is correctly configured
4. Review cron service dashboard for execution logs

**Endpoints:**
- Health: /cron/health
- Daily News: /cron/daily-news-ingestion
- Weekly Archival: /cron/weekly-news-archival

**Troubleshooting:**
- Test manually: \`curl -H "Authorization: Bearer \$CRON_SECRET" https://your-domain/cron/health\`
- Check logs: \`tail -f logs/cron/cron-$(date +%Y-%m-%d).log\`
`;

    try {
      await notifyOwner({
        title: `⚠️ Cron Job Failure: ${jobName}`,
        content: message,
      });
      console.log(`[cron-monitoring] Alert sent to owner`);
    } catch (error) {
      serverLogger.error("[cron-monitoring] Failed to send alert:", error);
    }
  }
}

/**
 * Clean up old log files (keep last MAX_LOG_FILES days)
 */
export function cleanupOldLogs() {
  ensureLogDir();

  try {
    const files = fs.readdirSync(LOG_DIR);
    const logFiles = files
      .filter(f => f.startsWith("cron-") && f.endsWith(".log"))
      .sort()
      .reverse(); // Most recent first

    // Delete files beyond MAX_LOG_FILES
    const filesToDelete = logFiles.slice(MAX_LOG_FILES);

    for (const file of filesToDelete) {
      const filepath = path.join(LOG_DIR, file);
      fs.unlinkSync(filepath);
      console.log(`[cron-monitoring] Deleted old log file: ${file}`);
    }

    if (filesToDelete.length > 0) {
      console.log(
        `[cron-monitoring] Cleaned up ${filesToDelete.length} old log files`
      );
    }
  } catch (error) {
    serverLogger.error("[cron-monitoring] Failed to cleanup logs:", error);
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
  const timestamp = new Date().toISOString();

  try {
    const result = await job();
    const duration = Date.now() - startTime;

    // Log successful execution
    logCronExecution({
      jobName,
      status: "success",
      duration,
      stats:
        typeof result === "object" && result !== null
          ? (result as any)
          : undefined,
      timestamp,
    });

    // Cleanup old logs periodically (1% chance on each execution)
    if (Math.random() < 0.01) {
      cleanupOldLogs();
    }

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);

    // Log failed execution
    logCronExecution({
      jobName,
      status: "failure",
      duration,
      error: errorMessage,
      timestamp,
    });

    // Check for consecutive failures and alert
    await checkAndAlertOnFailures(jobName, alertThreshold);

    throw error;
  }
}

/**
 * Get monitoring dashboard data
 */
export function getMonitoringDashboard() {
  const jobs = ["daily-news-ingestion", "weekly-news-archival"];

  return jobs.map(jobName => {
    const stats = getExecutionStats(jobName, 7);
    const recentHistory = getExecutionHistory(jobName, 1).slice(0, 5);

    return {
      jobName,
      stats,
      recentHistory,
    };
  });
}
