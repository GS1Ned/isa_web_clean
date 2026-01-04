/**
 * Email Notification System for ESG Hub
 * Handles deadline alerts, new regulation notifications, and daily digests
 */

import { notifyOwner } from "./_core/notification";
import { getDb } from "./db";
import { users, userAlerts, regulations, hubNews } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { serverLogger } from "./_core/logger-wiring";


/**
 * Email template for deadline alert
 */
function getDeadlineAlertTemplate(
  userName: string,
  regulationName: string,
  deadline: Date,
  daysUntil: number
): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>⏰ Compliance Deadline Alert</h2>
        <p>Hi ${userName},</p>
        <p>This is a reminder that <strong>${regulationName}</strong> has an important deadline coming up:</p>
        <div style="background-color: #f0f0f0; padding: 15px; border-left: 4px solid #0066cc;">
          <p><strong>Deadline:</strong> ${deadline.toLocaleDateString()}</p>
          <p><strong>Time until deadline:</strong> ${daysUntil} days</p>
        </div>
        <p>Make sure your organization is prepared for compliance. Visit the ISA Hub to review the full requirements and GS1 standards that apply.</p>
        <p>
          <a href="https://isa.example.com/hub/regulations" style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Regulation Details
          </a>
        </p>
        <hr />
        <p style="font-size: 12px; color: #666;">
          You're receiving this because you have alerts enabled for this regulation. 
          <a href="https://isa.example.com/hub/dashboard">Manage your alerts</a>
        </p>
      </body>
    </html>
  `;
}

/**
 * Email template for new regulation notification
 */
function getNewRegulationTemplate(
  userName: string,
  regulationName: string,
  description: string,
  effectiveDate: Date
): string {
  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>📋 New Regulation Announced</h2>
        <p>Hi ${userName},</p>
        <p>A new ESG regulation relevant to your interests has been announced:</p>
        <div style="background-color: #f0f0f0; padding: 15px; border-left: 4px solid #00aa00;">
          <h3>${regulationName}</h3>
          <p>${description}</p>
          <p><strong>Effective Date:</strong> ${effectiveDate.toLocaleDateString()}</p>
        </div>
        <p>Learn which GS1 standards apply and what changes you need to make to your supply chain.</p>
        <p>
          <a href="https://isa.example.com/hub/regulations" style="background-color: #00aa00; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Explore Regulation
          </a>
        </p>
        <hr />
        <p style="font-size: 12px; color: #666;">
          You're receiving this because you have alerts enabled for new regulations.
          <a href="https://isa.example.com/hub/dashboard">Manage your alerts</a>
        </p>
      </body>
    </html>
  `;
}

/**
 * Email template for daily digest
 */
function getDailyDigestTemplate(
  userName: string,
  newsItems: Array<{ title: string; summary: string; url: string }>,
  regulationUpdates: Array<{ name: string; change: string }>
): string {
  const newsHtml = newsItems
    .map(
      item => `
    <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #ddd;">
      <h4 style="margin: 0 0 5px 0;">${item.title}</h4>
      <p style="margin: 0 0 10px 0; color: #666;">${item.summary}</p>
      <a href="${item.url}" style="color: #0066cc; text-decoration: none;">Read more →</a>
    </div>
  `
    )
    .join("");

  const regulationHtml = regulationUpdates
    .map(
      item => `
    <li><strong>${item.name}:</strong> ${item.change}</li>
  `
    )
    .join("");

  return `
    <html>
      <body style="font-family: Arial, sans-serif; color: #333;">
        <h2>📰 Daily ESG Regulations Digest</h2>
        <p>Hi ${userName},</p>
        <p>Here's your daily summary of ESG regulatory updates:</p>
        
        <h3>Latest News</h3>
        ${newsHtml}
        
        <h3>Regulation Updates</h3>
        <ul>
          ${regulationHtml}
        </ul>
        
        <p>
          <a href="https://isa.example.com/hub/news" style="background-color: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            View Full News Feed
          </a>
        </p>
        <hr />
        <p style="font-size: 12px; color: #666;">
          You're receiving this daily digest because you have digest alerts enabled.
          <a href="https://isa.example.com/hub/dashboard">Manage your preferences</a>
        </p>
      </body>
    </html>
  `;
}

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
    const deadline = new Date(regulation[0].effectiveDate || Date.now());

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

    console.log(`Sent ${sentCount} daily digests`);
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
  daysBeforeDeadline: number = 7
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

    console.log(`Processed alerts: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  } catch (error) {
    serverLogger.error("Error processing alerts:", error);
    return { sent: 0, failed: 0 };
  }
}
