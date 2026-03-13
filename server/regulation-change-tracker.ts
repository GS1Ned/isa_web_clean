/**
 * Regulation Change Tracking System
 * Detects changes in regulations (deadline, scope, enforcement date) and notifies users
 */

import { getDb } from "./db";
import {
  regulations,
  regulatoryChangeAlerts,
  userAlerts,
} from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";
import { serverLogger } from "./_core/logger-wiring";


/**
 * Change detection result
 */
interface RegulationChange {
  regulationId: number;
  changeType:
    | "NEW"
    | "UPDATED"
    | "EFFECTIVE_DATE_CHANGED"
    | "SCOPE_EXPANDED"
    | "DEPRECATED";
  oldValue: string;
  newValue: string;
  description: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

/**
 * Detect changes in regulation by comparing with previous version
 */
export async function detectRegulationChanges(
  regulationId: number,
  newData: {
    title?: string;
    description?: string;
    effectiveDate?: Date;
  }
): Promise<RegulationChange[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    // Get current regulation data
    const currentReg = await db
      .select()
      .from(regulations)
      .where(eq(regulations.id, regulationId))
      .limit(1);

    if (!currentReg.length) return [];

    const changes: RegulationChange[] = [];
    const current = currentReg[0];

    // Check for title changes
    if (newData.title && newData.title !== current.title) {
      changes.push({
        regulationId,
        changeType: "UPDATED",
        oldValue: current.title,
        newValue: newData.title,
        description: `Regulation title updated from "${current.title}" to "${newData.title}"`,
        severity: "MEDIUM",
      });
    }

    // Check for effective date changes
    if (newData.effectiveDate && current.effectiveDate) {
      const oldDate = new Date(current.effectiveDate).getTime();
      const newDate = new Date(newData.effectiveDate).getTime();

      if (oldDate !== newDate) {
        const daysDifference = Math.floor(
          (newDate - oldDate) / (1000 * 60 * 60 * 24)
        );
        const severity = Math.abs(daysDifference) > 90 ? "CRITICAL" : "HIGH";

        changes.push({
          regulationId,
          changeType: "EFFECTIVE_DATE_CHANGED",
          oldValue: new Date(oldDate).toISOString().split("T")[0],
          newValue: new Date(newDate).toISOString().split("T")[0],
          description: `Enforcement date changed by ${daysDifference} days (from ${new Date(oldDate).toLocaleDateString()} to ${new Date(newDate).toLocaleDateString()})`,
          severity,
        });
      }
    }

    // Check for description/scope changes
    if (newData.description && newData.description !== current.description) {
      changes.push({
        regulationId,
        changeType: "SCOPE_EXPANDED",
        oldValue: current.description?.substring(0, 100) || "N/A",
        newValue: newData.description.substring(0, 100),
        description: "Regulation scope or requirements have been updated",
        severity: "HIGH",
      });
    }

    return changes;
  } catch (error) {
    serverLogger.error("Error detecting regulation changes:", error);
    return [];
  }
}

/**
 * Notify users about regulation changes
 */
export async function notifyUsersOfChanges(
  regulationId: number,
  changes: RegulationChange[]
): Promise<number> {
  const db = await getDb();
  if (!db || changes.length === 0) return 0;

  try {
    // Get users with alerts for this regulation
    const usersWithAlerts = await db
      .select({ userId: userAlerts.userId })
      .from(userAlerts)
      .where(
        and(
          eq(userAlerts.regulationId, regulationId),
          eq(userAlerts.isActive, 1)
        )
      );

    if (usersWithAlerts.length === 0) return 0;

    // Create a change alert record
    const changeDescription = changes
      .map(c => `${c.changeType}: ${c.description}`)
      .join("\n");

    // Notify owner (in production, this would send emails to users)
    const maxSeverity = changes.reduce((max, c) => {
      const severityOrder = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 };
      return severityOrder[c.severity] > severityOrder[max.severity] ? c : max;
    });

    await notifyOwner({
      title: `⚠️ Regulation Update: ${changes.length} change(s) detected`,
      content: `Regulation ID ${regulationId} has been updated:\n\n${changeDescription}\n\n${usersWithAlerts.length} users have been notified.`,
    });

    // Log the change alert
    await db.insert(regulatoryChangeAlerts).values({
      regulationId,
      changeType: maxSeverity.changeType,
      changeDescription: changeDescription,
      severity: maxSeverity.severity,
      affectedStandardsCount: usersWithAlerts.length,
    });

    return usersWithAlerts.length;
  } catch (error) {
    serverLogger.error("Error notifying users of changes:", error);
    return 0;
  }
}

/**
 * Scan all regulations for changes (periodic job)
 */
export async function scanForRegulationChanges(): Promise<{
  scanned: number;
  changesFound: number;
  usersNotified: number;
}> {
  const db = await getDb();
  if (!db) return { scanned: 0, changesFound: 0, usersNotified: 0 };

  try {
    // Get all regulations
    const allRegulations = await db.select().from(regulations);

    let scanned = 0;
    let changesFound = 0;
    let usersNotified = 0;

    for (const reg of allRegulations) {
      scanned++;

      // Check if regulation is approaching deadline (within 30 days)
      if (reg.effectiveDate) {
        const daysUntilDeadline = Math.floor(
          (new Date(reg.effectiveDate).getTime() - Date.now()) /
            (1000 * 60 * 60 * 24)
        );

        if (daysUntilDeadline > 0 && daysUntilDeadline <= 30) {
          // Create a change alert for approaching deadline
          const changes: RegulationChange[] = [
            {
              regulationId: reg.id,
              changeType: "EFFECTIVE_DATE_CHANGED",
              oldValue: "N/A",
              newValue: new Date(reg.effectiveDate).toISOString().split("T")[0],
              description: `⏰ Deadline approaching: ${daysUntilDeadline} days remaining`,
              severity: daysUntilDeadline <= 7 ? "CRITICAL" : "HIGH",
            },
          ];

          changesFound++;
          const notified = await notifyUsersOfChanges(reg.id, changes);
          usersNotified += notified;
        }
      }
    }

    serverLogger.info(`Regulation scan complete: ${scanned} scanned, ${changesFound} changes found, ${usersNotified} users notified`);
    return { scanned, changesFound, usersNotified };
  } catch (error) {
    serverLogger.error("Error scanning for regulation changes:", error);
    return { scanned: 0, changesFound: 0, usersNotified: 0 };
  }
}

/**
 * Get regulation change history
 */
export async function getRegulationChangeHistory(regulationId: number) {
  const db = await getDb();
  if (!db) return [];

  try {
    return await db
      .select()
      .from(regulatoryChangeAlerts)
      .where(eq(regulatoryChangeAlerts.regulationId, regulationId))
      .orderBy(regulatoryChangeAlerts.detectedAt);
  } catch (error) {
    serverLogger.error("Error getting change history:", error);
    return [];
  }
}
