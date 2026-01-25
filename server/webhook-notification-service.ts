/**
 * Webhook Notification Service
 * 
 * Sends real-time alerts to Slack and Microsoft Teams via webhooks.
 * Supports rich formatting, retry logic, and delivery tracking.
 */

import { eq, desc } from "drizzle-orm";
import { getDb } from "./db";
import { webhookDeliveryHistory, webhookConfiguration } from "../drizzle/schema";

// Webhook delivery result
export interface WebhookDeliveryResult {
  success: boolean;
  statusCode?: number;
  error?: string;
  deliveryId?: number;
}

// Alert payload structure
export interface AlertPayload {
  severity: "info" | "warning" | "critical";
  title: string;
  message: string;
  timestamp: Date;
  details?: Record<string, unknown>;
  actionUrl?: string;
}

// Retry configuration
const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
};

/**
 * Send alert to Slack webhook
 */
export async function sendSlackAlert(
  webhookUrl: string,
  payload: AlertPayload
): Promise<WebhookDeliveryResult> {
  const slackMessage = formatSlackMessage(payload);
  
  return sendWebhookWithRetry(
    "slack",
    webhookUrl,
    slackMessage,
    payload
  );
}

/**
 * Send alert to Microsoft Teams webhook
 */
export async function sendTeamsAlert(
  webhookUrl: string,
  payload: AlertPayload
): Promise<WebhookDeliveryResult> {
  const teamsMessage = formatTeamsMessage(payload);
  
  return sendWebhookWithRetry(
    "teams",
    webhookUrl,
    teamsMessage,
    payload
  );
}

/**
 * Send alert to all configured webhooks
 */
export async function broadcastAlert(payload: AlertPayload): Promise<WebhookDeliveryResult[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const configs = await db
    .select()
    .from(webhookConfiguration)
    .where(eq(webhookConfiguration.enabled, 1));

  const results: WebhookDeliveryResult[] = [];

  for (const config of configs) {
    if (config.platform === "slack" && config.webhookUrl) {
      const result = await sendSlackAlert(config.webhookUrl, payload);
      results.push(result);
    } else if (config.platform === "teams" && config.webhookUrl) {
      const result = await sendTeamsAlert(config.webhookUrl, payload);
      results.push(result);
    }
  }

  return results;
}

/**
 * Format alert for Slack Blocks API
 * https://api.slack.com/block-kit
 */
function formatSlackMessage(payload: AlertPayload): unknown {
  const severityEmoji = {
    info: ":information_source:",
    warning: ":warning:",
    critical: ":rotating_light:",
  };

  const severityColor = {
    info: "#36a64f",
    warning: "#ff9900",
    critical: "#ff0000",
  };

  const blocks: unknown[] = [
    {
      type: "header",
      text: {
        type: "plain_text",
        text: `${severityEmoji[payload.severity]} ${payload.title}`,
        emoji: true,
      },
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: payload.message,
      },
    },
  ];

  // Add details section if present
  if (payload.details && Object.keys(payload.details).length > 0) {
    const fields = Object.entries(payload.details).map(([key, value]) => ({
      type: "mrkdwn",
      text: `*${key}:*\n${String(value)}`,
    }));

    blocks.push({
      type: "section",
      fields: fields.slice(0, 10), // Slack limits to 10 fields
    });
  }

  // Add action button if URL provided
  if (payload.actionUrl) {
    blocks.push({
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "View Dashboard",
            emoji: true,
          },
          url: payload.actionUrl,
          style: payload.severity === "critical" ? "danger" : "primary",
        },
      ],
    });
  }

  // Add timestamp context
  blocks.push({
    type: "context",
    elements: [
      {
        type: "mrkdwn",
        text: `<!date^${Math.floor(payload.timestamp.getTime() / 1000)}^{date_num} {time_secs}|${payload.timestamp.toISOString()}>`,
      },
    ],
  });

  return {
    attachments: [
      {
        color: severityColor[payload.severity],
        blocks,
      },
    ],
  };
}

/**
 * Format alert for Microsoft Teams Adaptive Cards
 * https://adaptivecards.io/
 */
function formatTeamsMessage(payload: AlertPayload): unknown {
  const severityColor = {
    info: "good",
    warning: "warning",
    critical: "attention",
  };

  const severityIcon = {
    info: "ℹ️",
    warning: "⚠️",
    critical: "🚨",
  };

  const card: Record<string, unknown> = {
    type: "message",
    attachments: [
      {
        contentType: "application/vnd.microsoft.card.adaptive",
        content: {
          type: "AdaptiveCard",
          version: "1.4",
          body: [
            {
              type: "TextBlock",
              text: `${severityIcon[payload.severity]} ${payload.title}`,
              weight: "bolder",
              size: "large",
              wrap: true,
            },
            {
              type: "TextBlock",
              text: payload.message,
              wrap: true,
              spacing: "medium",
            },
          ],
        },
      },
    ],
  };

  const attachments = card.attachments as Array<{ contentType: string; content: Record<string, unknown> }>;
  const cardContent = attachments[0].content;
  const body = cardContent.body as unknown[];

  // Add details as fact set
  if (payload.details && Object.keys(payload.details).length > 0) {
    const facts = Object.entries(payload.details).map(([key, value]) => ({
      title: key,
      value: String(value),
    }));

    body.push({
      type: "FactSet",
      facts: facts.slice(0, 10), // Limit to 10 facts
      spacing: "medium",
    });
  }

  // Add action button
  const actions: unknown[] = [];
  if (payload.actionUrl) {
    actions.push({
      type: "Action.OpenUrl",
      title: "View Dashboard",
      url: payload.actionUrl,
    });
  }

  if (actions.length > 0) {
    (cardContent as Record<string, unknown>).actions = actions;
  }

  // Add timestamp and severity indicator
  body.push({
    type: "Container",
    items: [
      {
        type: "TextBlock",
        text: `Severity: ${payload.severity.toUpperCase()} | ${payload.timestamp.toLocaleString()}`,
        size: "small",
        color: severityColor[payload.severity],
        wrap: true,
      },
    ],
    spacing: "medium",
  });

  return card;
}

/**
 * Send webhook with exponential backoff retry
 */
async function sendWebhookWithRetry(
  platform: "slack" | "teams",
  webhookUrl: string,
  message: unknown,
  originalPayload: AlertPayload
): Promise<WebhookDeliveryResult> {
  let lastError: string | undefined;
  let lastStatusCode: number | undefined;

  for (let attempt = 1; attempt <= RETRY_CONFIG.maxAttempts; attempt++) {
    try {
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      lastStatusCode = response.status;

      // Success
      if (response.ok) {
        const deliveryId = await trackDelivery(
          platform,
          webhookUrl,
          originalPayload,
          true,
          response.status,
          attempt
        );

        return {
          success: true,
          statusCode: response.status,
          deliveryId,
        };
      }

      // Non-retryable error (4xx)
      if (response.status >= 400 && response.status < 500) {
        const errorText = await response.text().catch(() => "Unknown error");
        lastError = `HTTP ${response.status}: ${errorText}`;
        
        await trackDelivery(
          platform,
          webhookUrl,
          originalPayload,
          false,
          response.status,
          attempt,
          lastError
        );

        return {
          success: false,
          statusCode: response.status,
          error: lastError,
        };
      }

      // Retryable error (5xx)
      lastError = `HTTP ${response.status}: ${await response.text().catch(() => "Unknown error")}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }

    // Wait before retry (exponential backoff)
    if (attempt < RETRY_CONFIG.maxAttempts) {
      const delay = Math.min(
        RETRY_CONFIG.baseDelayMs * Math.pow(2, attempt - 1),
        RETRY_CONFIG.maxDelayMs
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // All retries failed
  await trackDelivery(
    platform,
    webhookUrl,
    originalPayload,
    false,
    lastStatusCode,
    RETRY_CONFIG.maxAttempts,
    lastError
  );

  return {
    success: false,
    statusCode: lastStatusCode,
    error: lastError || "Unknown error after all retries",
  };
}

/**
 * Track webhook delivery in database
 */
async function trackDelivery(
  platform: "slack" | "teams",
  webhookUrl: string,
  payload: AlertPayload,
  success: boolean,
  statusCode?: number,
  attempts?: number,
  error?: string
): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(webhookDeliveryHistory).values({
    platform,
    webhookUrl: maskWebhookUrl(webhookUrl),
    severity: payload.severity,
    title: payload.title,
    message: payload.message,
    success: success ? 1 : 0,
    statusCode,
    attempts,
    error,
  });

  // Get the inserted ID from the result
  const insertId = (result as any).insertId || (result as any)[0]?.insertId;
  
  if (!insertId) {
    // Fallback: query for the most recent delivery
    const [latest] = await db
      .select({ id: webhookDeliveryHistory.id })
      .from(webhookDeliveryHistory)
      .orderBy(desc(webhookDeliveryHistory.deliveredAt))
      .limit(1);
    return latest?.id || 0;
  }
  
  return insertId;
}

/**
 * Mask webhook URL for security (hide sensitive tokens)
 */
function maskWebhookUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    
    // Mask the last path segment (usually contains the token)
    if (pathParts.length > 0) {
      pathParts[pathParts.length - 1] = "***";
    }
    
    urlObj.pathname = pathParts.join("/");
    return urlObj.toString();
  } catch {
    return "***";
  }
}

/**
 * Get recent webhook delivery history
 */
export async function getDeliveryHistory(limit = 50) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db
    .select()
    .from(webhookDeliveryHistory)
    .orderBy(desc(webhookDeliveryHistory.deliveredAt))
    .limit(limit);
}

/**
 * Get webhook delivery statistics
 */
export async function getDeliveryStats(hoursBack = 24) {
  const since = new Date(Date.now() - hoursBack * 60 * 60 * 1000);
  
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const deliveries = await db
    .select()
    .from(webhookDeliveryHistory);

  const total = deliveries.length;
  const successful = deliveries.filter((d: typeof deliveries[0]) => d.success).length;
  const failed = total - successful;
  const successRate = total > 0 ? (successful / total) * 100 : 0;

  const byPlatform = deliveries.reduce((acc: Record<string, { total: number; successful: number; failed: number }>, d: typeof deliveries[0]) => {
    if (!acc[d.platform]) {
      acc[d.platform] = { total: 0, successful: 0, failed: 0 };
    }
    acc[d.platform].total++;
    if (d.success) {
      acc[d.platform].successful++;
    } else {
      acc[d.platform].failed++;
    }
    return acc;
  }, {} as Record<string, { total: number; successful: number; failed: number }>);

  return {
    total,
    successful,
    failed,
    successRate,
    byPlatform,
  };
}
