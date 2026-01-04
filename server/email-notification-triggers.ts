import { notifyOwner } from "./_core/notification";
import { getDb } from "./db";
import { eq, and, lt } from "drizzle-orm";
import { userAlerts, regulations, hubNews } from "../drizzle/schema";
import { serverLogger } from "./_core/logger-wiring";


// Hardcoded recipient list
const NOTIFICATION_RECIPIENTS = ["frisowempe@gmail.com", "friso.wempe@gs1.nl"];

/**
 * Check for approaching deadlines and send email alerts
 * Called by cron job daily at 8 AM
 */
export async function sendDeadlineAlerts() {
  const db = await getDb();
  if (!db) {
    serverLogger.warn("[Email Triggers] Database not available");
    return;
  }

  try {
    // Get all active alerts
    const activeAlerts = await db
      .select()
      .from(userAlerts)
      .where(eq(userAlerts.alertType, "REGULATION_UPDATE"));

    if (activeAlerts.length === 0) {
      console.log("[Email Triggers] No active alerts found");
      return;
    }

    // Check for regulations with approaching deadlines (within 30 days)
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingRegulations = await db
      .select()
      .from(regulations)
      .where(
        and(
          lt(regulations.effectiveDate, thirtyDaysFromNow.toISOString()),
          eq(regulations.regulationType, "CSRD")
        )
      );

    if (upcomingRegulations.length === 0) {
      console.log("[Email Triggers] No upcoming deadlines found");
      return;
    }

    // Send alerts for each upcoming regulation
    for (const reg of upcomingRegulations) {
      const relevantAlerts = activeAlerts.filter(
        alert => alert.regulationId === reg.id
      );

      if (relevantAlerts.length > 0) {
        const daysUntilDeadline = Math.ceil(
          (new Date(reg.effectiveDate!).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
        );

        const emailContent = `
Regulatory Deadline Alert

Regulation: ${reg.title}
Implementation Date: ${reg.effectiveDate ? new Date(reg.effectiveDate).toLocaleDateString() : 'N/A'}
Days Until Deadline: ${daysUntilDeadline}

Description: ${reg.description}

Regulation Type: ${reg.regulationType}

Action Required: Review compliance requirements and ensure your organization is prepared for implementation.

View Details: https://isa.example.com/hub/regulations/${reg.id}
        `;

        // Send notification to owner with email details
        await notifyOwner({
          title: `Deadline Alert: ${reg.title} (${daysUntilDeadline} days)`,
          content: `Email recipients: ${NOTIFICATION_RECIPIENTS.join(", ")}\n\n${emailContent}`,
        });

        console.log(
          `[Email Triggers] Sent deadline alert for ${reg.title} to ${NOTIFICATION_RECIPIENTS.length} recipients`
        );
      }
    }
  } catch (error) {
    serverLogger.error("[Email Triggers] Error sending deadline alerts:", error);
  }
}

/**
 * Send daily digest of new regulations and news
 * Called by cron job daily at 8 AM
 */
export async function sendDailyDigest() {
  const db = await getDb();
  if (!db) {
    serverLogger.warn("[Email Triggers] Database not available");
    return;
  }

  try {
    // Get news from last 24 hours
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const recentNews = await db
      .select()
      .from(hubNews)
      .where(eq(hubNews.publishedDate, oneDayAgo.toISOString()));

    if (recentNews.length === 0) {
      console.log("[Email Triggers] No new news for digest");
      return;
    }

    // Build digest content
    let digestContent = "Daily ESG Regulatory Update\n\n";
    digestContent += `Date: ${new Date().toLocaleDateString()}\n`;
    digestContent += `New Articles: ${recentNews.length}\n\n`;

    for (const article of recentNews) {
      digestContent += `- ${article.title}\n`;
      digestContent += `  ${article.summary}\n`;
      digestContent += `  Type: ${article.newsType}\n\n`;
    }

    digestContent += `View Full Hub: https://isa.example.com/hub/news`;

    // Send notification to owner with email details
    await notifyOwner({
      title: "Daily ESG Regulatory Digest",
      content: `Email recipients: ${NOTIFICATION_RECIPIENTS.join(", ")}\n\n${digestContent}`,
    });

    console.log(
      `[Email Triggers] Sent daily digest with ${recentNews.length} articles to ${NOTIFICATION_RECIPIENTS.length} recipients`
    );
  } catch (error) {
    serverLogger.error("[Email Triggers] Error sending daily digest:", error);
  }
}

/**
 * Send notification when a new regulation is added
 */
export async function notifyNewRegulation(regulationId: number) {
  const db = await getDb();
  if (!db) {
    serverLogger.warn("[Email Triggers] Database not available");
    return;
  }

  try {
    const regulation = await db
      .select()
      .from(regulations)
      .where(eq(regulations.id, regulationId))
      .limit(1);

    if (regulation.length === 0) {
      serverLogger.warn("[Email Triggers] Regulation not found");
      return;
    }

    const reg = regulation[0];

    const emailContent = `
New Regulation Added to ISA Hub

Regulation: ${reg.title}
Type: ${reg.regulationType}
Effective Date: ${reg.effectiveDate ? new Date(reg.effectiveDate).toLocaleDateString() : 'N/A'}

Description: ${reg.description}

View Details: https://isa.example.com/hub/regulations/${reg.id}
    `;

    await notifyOwner({
      title: `New Regulation: ${reg.title}`,
      content: `Email recipients: ${NOTIFICATION_RECIPIENTS.join(", ")}\n\n${emailContent}`,
    });

    console.log(
      `[Email Triggers] Notified ${NOTIFICATION_RECIPIENTS.length} recipients about new regulation: ${reg.title}`
    );
  } catch (error) {
    serverLogger.error("[Email Triggers] Error notifying new regulation:", error);
  }
}

/**
 * Send notification when a regulation is updated
 */
export async function notifyRegulationChange(
  regulationId: number,
  changeType: string,
  details: string
) {
  const db = await getDb();
  if (!db) {
    serverLogger.warn("[Email Triggers] Database not available");
    return;
  }

  try {
    const regulation = await db
      .select()
      .from(regulations)
      .where(eq(regulations.id, regulationId))
      .limit(1);

    if (regulation.length === 0) {
      serverLogger.warn("[Email Triggers] Regulation not found");
      return;
    }

    const reg = regulation[0];

    const emailContent = `
Regulation Update: ${reg.title}

Change Type: ${changeType}
Details: ${details}

Current Type: ${reg.regulationType}
Effective Date: ${reg.effectiveDate ? new Date(reg.effectiveDate).toLocaleDateString() : 'N/A'}

View Details: https://isa.example.com/hub/regulations/${reg.id}
    `;

    await notifyOwner({
      title: `Update: ${reg.title} - ${changeType}`,
      content: `Email recipients: ${NOTIFICATION_RECIPIENTS.join(", ")}\n\n${emailContent}`,
    });

    console.log(
      `[Email Triggers] Notified ${NOTIFICATION_RECIPIENTS.length} recipients about ${changeType} for ${reg.title}`
    );
  } catch (error) {
    serverLogger.error("[Email Triggers] Error notifying regulation change:", error);
  }
}
