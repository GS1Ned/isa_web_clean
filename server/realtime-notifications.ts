import { EventEmitter } from "events";

/**
 * Real-time notification event types
 */
export enum NotificationEventType {
  RISK_DETECTED = "risk_detected",
  REMEDIATION_UPDATED = "remediation_updated",
  COMMENT_ADDED = "comment_added",
  APPROVAL_REQUESTED = "approval_requested",
  APPROVAL_DECISION = "approval_decision",
  TEMPLATE_UPDATED = "template_updated",
  SCORE_CHANGED = "score_changed",
  MILESTONE_ACHIEVED = "milestone_achieved",
}

/**
 * Notification payload structure
 */
export interface NotificationPayload {
  type: NotificationEventType;
  userId: number;
  title: string;
  message: string;
  data?: Record<string, any>;
  severity?: "low" | "medium" | "high" | "critical";
  actionUrl?: string;
  timestamp: number;
}

/**
 * Global event emitter for real-time notifications
 */
class RealtimeNotificationService extends EventEmitter {
  private userConnections: Map<number, Set<string>> = new Map();
  private notificationQueue: NotificationPayload[] = [];
  private maxQueueSize = 1000;

  /**
   * Register a user connection (WebSocket)
   */
  registerConnection(userId: number, connectionId: string): void {
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId)!.add(connectionId);
  }

  /**
   * Unregister a user connection
   */
  unregisterConnection(userId: number, connectionId: string): void {
    const connections = this.userConnections.get(userId);
    if (connections) {
      connections.delete(connectionId);
      if (connections.size === 0) {
        this.userConnections.delete(userId);
      }
    }
  }

  /**
   * Check if user is currently connected
   */
  isUserConnected(userId: number): boolean {
    return (
      this.userConnections.has(userId) &&
      this.userConnections.get(userId)!.size > 0
    );
  }

  /**
   * Emit notification to specific user
   */
  notifyUser(payload: NotificationPayload): void {
    // Add to queue for offline users
    this.notificationQueue.push(payload);
    if (this.notificationQueue.length > this.maxQueueSize) {
      this.notificationQueue.shift();
    }

    // Emit to connected clients
    this.emit(`user:${payload.userId}`, payload);
  }

  /**
   * Emit notification to multiple users
   */
  notifyUsers(
    userIds: number[],
    payload: Omit<NotificationPayload, "userId">
  ): void {
    userIds.forEach(userId => {
      this.notifyUser({
        ...payload,
        userId,
      });
    });
  }

  /**
   * Emit notification to all users (broadcast)
   */
  broadcast(payload: Omit<NotificationPayload, "userId">): void {
    this.emit("broadcast", payload);
  }

  /**
   * Get pending notifications for user
   */
  getPendingNotifications(userId: number): NotificationPayload[] {
    return this.notificationQueue.filter(n => n.userId === userId);
  }

  /**
   * Clear pending notifications for user
   */
  clearPendingNotifications(userId: number): void {
    const index = this.notificationQueue.findIndex(n => n.userId === userId);
    if (index !== -1) {
      this.notificationQueue.splice(index, 1);
    }
  }
}

/**
 * Singleton instance
 */
export const realtimeNotifications = new RealtimeNotificationService();

/**
 * Helper functions for common notification scenarios
 */

export async function notifyRiskDetected(
  userId: number,
  riskType: string,
  severity: string,
  description: string
): Promise<void> {
  realtimeNotifications.notifyUser({
    type: NotificationEventType.RISK_DETECTED,
    userId,
    title: `New ${severity.toUpperCase()} Risk Detected`,
    message: `${riskType}: ${description}`,
    severity: (severity as "low" | "medium" | "high" | "critical") || "medium",
    actionUrl: "/supply-chain/risks",
    timestamp: Date.now(),
    data: { riskType, severity },
  });
}

export async function notifyRemediationUpdated(
  userId: number,
  planName: string,
  status: string
): Promise<void> {
  realtimeNotifications.notifyUser({
    type: NotificationEventType.REMEDIATION_UPDATED,
    userId,
    title: "Remediation Plan Updated",
    message: `${planName} is now ${status}`,
    severity: "medium",
    actionUrl: "/risk-remediation",
    timestamp: Date.now(),
    data: { planName, status },
  });
}

export async function notifyCommentAdded(
  userId: number,
  commenterName: string,
  roadmapName: string
): Promise<void> {
  realtimeNotifications.notifyUser({
    type: NotificationEventType.COMMENT_ADDED,
    userId,
    title: "New Comment",
    message: `${commenterName} commented on ${roadmapName}`,
    severity: "low",
    actionUrl: "/compliance/roadmap",
    timestamp: Date.now(),
    data: { commenterName, roadmapName },
  });
}

export async function notifyApprovalRequested(
  userId: number,
  requesterName: string,
  roadmapName: string
): Promise<void> {
  realtimeNotifications.notifyUser({
    type: NotificationEventType.APPROVAL_REQUESTED,
    userId,
    title: "Approval Requested",
    message: `${requesterName} is requesting your approval on ${roadmapName}`,
    severity: "high",
    actionUrl: "/roadmap-collaboration",
    timestamp: Date.now(),
    data: { requesterName, roadmapName },
  });
}

export async function notifyApprovalDecision(
  userId: number,
  approverName: string,
  roadmapName: string,
  decision: "approved" | "rejected"
): Promise<void> {
  realtimeNotifications.notifyUser({
    type: NotificationEventType.APPROVAL_DECISION,
    userId,
    title: `Roadmap ${decision === "approved" ? "Approved" : "Rejected"}`,
    message: `${approverName} ${decision} your roadmap: ${roadmapName}`,
    severity: decision === "approved" ? "low" : "high",
    actionUrl: "/compliance/roadmap",
    timestamp: Date.now(),
    data: { approverName, roadmapName, decision },
  });
}

export async function notifyTemplateUpdated(
  userId: number,
  templateName: string,
  updateType: string
): Promise<void> {
  realtimeNotifications.notifyUser({
    type: NotificationEventType.TEMPLATE_UPDATED,
    userId,
    title: "Template Updated",
    message: `${templateName} has been ${updateType}`,
    severity: "low",
    actionUrl: "/templates",
    timestamp: Date.now(),
    data: { templateName, updateType },
  });
}

export async function notifyScoreChanged(
  userId: number,
  scoreType: string,
  oldScore: number,
  newScore: number
): Promise<void> {
  const change = newScore - oldScore;
  const direction = change > 0 ? "improved" : "declined";
  const severity = change > 0 ? "low" : "high";

  realtimeNotifications.notifyUser({
    type: NotificationEventType.SCORE_CHANGED,
    userId,
    title: `${scoreType} Score ${direction}`,
    message: `Your ${scoreType} score ${direction} from ${oldScore} to ${newScore}`,
    severity: severity as "low" | "high",
    actionUrl: "/scoreboard",
    timestamp: Date.now(),
    data: { scoreType, oldScore, newScore, change },
  });
}

export async function notifyMilestoneAchieved(
  userId: number,
  milestoneName: string,
  scoreThreshold: number
): Promise<void> {
  realtimeNotifications.notifyUser({
    type: NotificationEventType.MILESTONE_ACHIEVED,
    userId,
    title: "🎉 Milestone Achieved!",
    message: `Congratulations! You've reached ${milestoneName} (${scoreThreshold}% compliance)`,
    severity: "low",
    actionUrl: "/scoreboard",
    timestamp: Date.now(),
    data: { milestoneName, scoreThreshold },
  });
}
