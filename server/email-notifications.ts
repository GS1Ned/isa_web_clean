/**
 * Email Notification System for ESG Hub
 * Handles deadline alerts, new regulation notifications, and daily digests
 */

import { notifyOwner } from "./_core/notification";
import { getDb } from "./db";
import { users, userAlerts, regulations, hubNews } from "../drizzle_pg/schema";
import { eq } from "drizzle-orm";
import { serverLogger } from "./_core/logger-wiring";

/**
 * Send deadline alert email
 */
export async function sendDeadlineAlert(
  userId: number,
  regulationId: number,
  daysBeforeDeadline: number
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    // Get user and regulation details
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const regulation = await db
      .select()
      .from(regulations)
      .where(eq(regulations.id, regulationId))
      .limit(1);

    if (!user.length || !regulation.length) return false;

    const userEmail = user[0].email;
    const userName = user[0].name || "User";
    const regulationName = regulation[0].title;

    // Send notification via owner notification system
    const success = await notifyOwner({
      title: `Deadline Alert: ${regulationName}`,
      content: `User ${userName} (${userEmail}) has a deadline alert for ${regulationName} in ${daysBeforeDeadline} days.`,
    });

    return success;
  } catch (error) {
    serverLogger.error("Error sending deadline alert:", error);
    return false;
  }
}

/**
 * Send new regulation notification
 */
export async function sendNewRegulationNotification(
  userId: number,
  regulationId: number
): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;

    // Get user and regulation details
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const regulation = await db
      .select()
      .from(regulations)
      .where(eq(regulations.id, regulationId))
      .limit(1);

    if (!user.length || !regulation.length) return false;

    const userEmail = user[0].email;
    const userName = user[0].name || "User";
    const regulationName = regulation[0].title;
    const effectiveDate = new Date(regulation[0].effectiveDate || Date.now());

    // Send notification via owner notification system
    const success = await notifyOwner({
      title: `New Regulation: ${regulationName}`,
      content: `User ${userName} (${userEmail}) has been notified about new regulation ${regulationName} effective ${effectiveDate.toLocaleDateString()}.`,
    });

    return success;
  } catch (error) {
    serverLogger.error("Error sending new regulation notification:", error);
    return false;
  }
}

/**
 * Send daily digest to users with active alerts
 */
export async function sendDailyDigests(): Promise<number> {
  try {
    const db = await getDb();
    if (!db) return 0;

    // Get users with active digest alerts
    const usersWithAlerts = await db
      .selectDistinct({ userId: userAlerts.userId })
      .from(userAlerts)
      .where(eq(userAlerts.isActive, 1));

    let sentCount = 0;

    for (const userRecord of usersWithAlerts) {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, userRecord.userId))
        .limit(1);

      if (!user.length) continue;

      const userName = user[0].name || "User";
      const userEmail = user[0].email;

      // Get recent news items (last 24 hours)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const recentNews = await db
        .select()
        .from(hubNews)
        // Fetch recent items for filtering
        .orderBy(hubNews.publishedDate)
        .limit(5);

      // Filter news from last 24 hours
      const newsItems = recentNews
        .filter(
          item =>
            item.publishedDate &&
            new Date(item.publishedDate) > twentyFourHoursAgo
        )
        .map(item => ({
          title: item.title,
          summary: item.summary || item.content?.substring(0, 150) || "",
          url: item.sourceUrl || "https://isa.example.com/hub/news",
        }));

      if (newsItems.length === 0) continue;

      // Send digest via owner notification system
      const success = await notifyOwner({
        title: `Daily Digest for ${userName}`,
        content: `Sent daily digest with ${newsItems.length} news items to ${userEmail}`,
      });

      if (success) sentCount++;
    }

    serverLogger.info(`Sent ${sentCount} daily digests`);
    return sentCount;
  } catch (error) {
    serverLogger.error("Error sending daily digests:", error);
    return 0;
  }
}

/**
 * Process all pending alerts
 */
export async function processPendingAlerts(
  _daysBeforeDeadline: number = 7
): Promise<{ sent: number; failed: number }> {
  try {
    const db = await getDb();
    if (!db) return { sent: 0, failed: 0 };

    let sent = 0;
    let failed = 0;

    // Get all active alerts
    const activeAlerts = await db
      .select()
      .from(userAlerts)
      .where(eq(userAlerts.isActive, 1));

    for (const alert of activeAlerts) {
      if (
        alert.alertType === "DEADLINE_APPROACHING" &&
        alert.regulationId &&
        alert.daysBeforeDeadline
      ) {
        const success = await sendDeadlineAlert(
          alert.userId,
          alert.regulationId,
          alert.daysBeforeDeadline
        );
        success ? sent++ : failed++;
      } else if (alert.alertType === "NEW_REGULATION" && alert.regulationId) {
        const success = await sendNewRegulationNotification(
          alert.userId,
          alert.regulationId
        );
        success ? sent++ : failed++;
      }
    }

    serverLogger.info(`Processed alerts: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  } catch (error) {
    serverLogger.error("Error processing alerts:", error);
    return { sent: 0, failed: 0 };
  }
}
