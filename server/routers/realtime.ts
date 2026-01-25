import { router, protectedProcedure, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import {
  realtimeNotifications,
  NotificationEventType,
} from "../realtime-notifications";

export const realtimeRouter = router({
  /**
   * Get pending notifications for current user
   */
  getPendingNotifications: protectedProcedure.query(({ ctx }) => {
    const notifications = realtimeNotifications.getPendingNotifications(
      ctx.user.id
    );
    realtimeNotifications.clearPendingNotifications(ctx.user.id);
    return notifications;
  }),

  /**
   * Check if user is currently connected
   */
  isConnected: protectedProcedure.query(({ ctx }) => {
    return realtimeNotifications.isUserConnected(ctx.user.id);
  }),

  /**
   * Register user connection (called when WebSocket connects)
   */
  registerConnection: protectedProcedure
    .input(z.object({ connectionId: z.string() }))
    .mutation(({ ctx, input }) => {
      realtimeNotifications.registerConnection(ctx.user.id, input.connectionId);
      return { success: true };
    }),

  /**
   * Unregister user connection (called when WebSocket disconnects)
   */
  unregisterConnection: protectedProcedure
    .input(z.object({ connectionId: z.string() }))
    .mutation(({ ctx, input }) => {
      realtimeNotifications.unregisterConnection(
        ctx.user.id,
        input.connectionId
      );
      return { success: true };
    }),

  /**
   * Poll for new notifications (alternative to WebSocket)
   */
  pollNotifications: protectedProcedure.query(({ ctx }) => {
    const notifications = realtimeNotifications.getPendingNotifications(
      ctx.user.id
    );
    return notifications;
  }),

  /**
   * Get notification statistics (for admin/analytics)
   */
  getNotificationStats: adminProcedure.query(({ ctx }) => {
    const notifications = realtimeNotifications.getPendingNotifications(
      ctx.user.id
    );

    const stats = {
      total: notifications.length,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
    };

    notifications.forEach(n => {
      stats.byType[n.type] = (stats.byType[n.type] || 0) + 1;
      stats.bySeverity[n.severity || "medium"] =
        (stats.bySeverity[n.severity || "medium"] || 0) + 1;
    });

    return stats;
  }),
});
