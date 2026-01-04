import { notifyOwner } from "./_core/notification";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { serverLogger } from "./_core/logger-wiring";


/**
 * Collaboration Notification Service
 * Sends notifications for comments, approvals, and team activities
 */

export async function notifyComment(
  _roadmapId: number,
  roadmapTitle: string,
  commenterName: string,
  commentContent: string,
  recipientId: number
) {
  try {
    const db = await getDb();
    if (!db) return false;

    // Get recipient user
    const recipient = await db
      .select()
      .from(users)
      .where(eq(users.id, recipientId))
      .limit(1);

    if (recipient.length === 0) return false;

    // Send notification
    return await notifyOwner({
      title: `New comment on roadmap: ${roadmapTitle}`,
      content: `${commenterName} commented: "${commentContent.substring(0, 100)}..."`,
    });
  } catch (error) {
    serverLogger.error("Error sending comment notification:", error);
    return false;
  }
}

export async function notifyApprovalRequested(
  _roadmapId: number,
  roadmapTitle: string,
  requesterName: string,
  approverRole: string,
  recipientId: number
) {
  try {
    const db = await getDb();
    if (!db) return false;

    // Get recipient user
    const recipient = await db
      .select()
      .from(users)
      .where(eq(users.id, recipientId))
      .limit(1);

    if (recipient.length === 0) return false;

    // Send notification
    return await notifyOwner({
      title: `Approval requested: ${roadmapTitle}`,
      content: `${requesterName} requested your approval (${approverRole}) for roadmap: ${roadmapTitle}`,
    });
  } catch (error) {
    serverLogger.error("Error sending approval request notification:", error);
    return false;
  }
}

export async function notifyApprovalDecision(
  _roadmapId: number,
  roadmapTitle: string,
  approverName: string,
  decision: "approved" | "rejected",
  comments: string | null,
  recipientId: number
) {
  try {
    const db = await getDb();
    if (!db) return false;

    // Get recipient user
    const recipient = await db
      .select()
      .from(users)
      .where(eq(users.id, recipientId))
      .limit(1);

    if (recipient.length === 0) return false;

    // Send notification
    const decisionText =
      decision === "approved" ? "✅ Approved" : "❌ Rejected";
    const commentText = comments ? ` - "${comments.substring(0, 100)}..."` : "";

    return await notifyOwner({
      title: `${decisionText}: ${roadmapTitle}`,
      content: `${approverName} ${decision} your roadmap${commentText}`,
    });
  } catch (error) {
    serverLogger.error("Error sending approval decision notification:", error);
    return false;
  }
}

export async function notifyTeamAccessGranted(
  _roadmapId: number,
  roadmapTitle: string,
  grantedByName: string,
  accessLevel: string,
  recipientId: number
) {
  try {
    const db = await getDb();
    if (!db) return false;

    // Get recipient user
    const recipient = await db
      .select()
      .from(users)
      .where(eq(users.id, recipientId))
      .limit(1);

    if (recipient.length === 0) return false;

    // Send notification
    return await notifyOwner({
      title: `Team access granted: ${roadmapTitle}`,
      content: `${grantedByName} granted you ${accessLevel} access to roadmap: ${roadmapTitle}`,
    });
  } catch (error) {
    serverLogger.error("Error sending team access notification:", error);
    return false;
  }
}

export async function notifyRoadmapCompleted(
  _roadmapId: number,
  roadmapTitle: string,
  completedByName: string,
  projectedScore: number,
  recipientId: number
) {
  try {
    const db = await getDb();
    if (!db) return false;

    // Get recipient user
    const recipient = await db
      .select()
      .from(users)
      .where(eq(users.id, recipientId))
      .limit(1);

    if (recipient.length === 0) return false;

    // Send notification
    return await notifyOwner({
      title: `🎉 Roadmap completed: ${roadmapTitle}`,
      content: `${completedByName} completed roadmap with projected score of ${projectedScore}%`,
    });
  } catch (error) {
    serverLogger.error("Error sending roadmap completion notification:", error);
    return false;
  }
}

export async function notifyActionCompleted(
  _roadmapId: number,
  roadmapTitle: string,
  actionTitle: string,
  completedByName: string,
  recipientId: number
) {
  try {
    const db = await getDb();
    if (!db) return false;

    // Get recipient user
    const recipient = await db
      .select()
      .from(users)
      .where(eq(users.id, recipientId))
      .limit(1);

    if (recipient.length === 0) return false;

    // Send notification
    return await notifyOwner({
      title: `Action completed: ${actionTitle}`,
      content: `${completedByName} completed action in roadmap: ${roadmapTitle}`,
    });
  } catch (error) {
    serverLogger.error("Error sending action completion notification:", error);
    return false;
  }
}

export async function notifyMilestoneReached(
  _roadmapId: number,
  roadmapTitle: string,
  milestoneTitle: string,
  targetScore: number,
  recipientId: number
) {
  try {
    const db = await getDb();
    if (!db) return false;

    // Get recipient user
    const recipient = await db
      .select()
      .from(users)
      .where(eq(users.id, recipientId))
      .limit(1);

    if (recipient.length === 0) return false;

    // Send notification
    return await notifyOwner({
      title: `🎯 Milestone reached: ${milestoneTitle}`,
      content: `Roadmap "${roadmapTitle}" reached milestone with target score of ${targetScore}%`,
    });
  } catch (error) {
    serverLogger.error("Error sending milestone notification:", error);
    return false;
  }
}
