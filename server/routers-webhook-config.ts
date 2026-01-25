/**
 * Webhook Configuration tRPC Router
 * 
 * Provides API endpoints for managing webhook configurations
 */

import { z } from "zod";
import { getDb } from "./db";
import { webhookConfiguration } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { sendSlackAlert, sendTeamsAlert, getDeliveryHistory, getDeliveryStats, AlertPayload } from "./webhook-notification-service";

export const webhookConfigRouter = {
  /**
   * Get all webhook configurations
   */
  getConfigurations: async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    return db.select().from(webhookConfiguration);
  },

  /**
   * Create or update webhook configuration
   */
  saveConfiguration: async (input: {
    id?: number;
    platform: "slack" | "teams";
    webhookUrl: string;
    channelName?: string;
    enabled: boolean;
  }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    if (input.id) {
      // Update existing
      await db
        .update(webhookConfiguration)
        .set({
          webhookUrl: input.webhookUrl,
          channelName: input.channelName,
          enabled: input.enabled ? 1 : 0,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(webhookConfiguration.id, input.id));

      return { success: true, id: input.id };
    } else {
      // Create new
      const result = await db.insert(webhookConfiguration).values({
        platform: input.platform,
        webhookUrl: input.webhookUrl,
        channelName: input.channelName,
        enabled: input.enabled ? 1 : 0,
      });

      const insertId = (result as any).insertId || (result as any)[0]?.insertId;
      return { success: true, id: insertId };
    }
  },

  /**
   * Delete webhook configuration
   */
  deleteConfiguration: async (input: { id: number }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.delete(webhookConfiguration).where(eq(webhookConfiguration.id, input.id));

    return { success: true };
  },

  /**
   * Test webhook delivery
   */
  testWebhook: async (input: {
    platform: "slack" | "teams";
    webhookUrl: string;
  }) => {
    const testPayload: AlertPayload = {
      severity: "info",
      title: "Test Webhook Notification",
      message: "This is a test message from ISA Webhook Integration. If you see this, your webhook is configured correctly!",
      timestamp: new Date(),
      details: {
        "Test Type": "Manual webhook test",
        "Timestamp": new Date().toISOString(),
      },
    };

    if (input.platform === "slack") {
      const result = await sendSlackAlert(input.webhookUrl, testPayload);
      return result;
    } else {
      const result = await sendTeamsAlert(input.webhookUrl, testPayload);
      return result;
    }
  },

  /**
   * Get webhook delivery history
   */
  getDeliveryHistory: async (input: { limit?: number }) => {
    return getDeliveryHistory(input.limit || 50);
  },

  /**
   * Get webhook delivery statistics
   */
  getDeliveryStats: async (input: { hoursBack?: number }) => {
    return getDeliveryStats(input.hoursBack || 24);
  },
};

// Zod schemas for input validation
export const webhookConfigSchemas = {
  saveConfiguration: z.object({
    id: z.number().optional(),
    platform: z.enum(["slack", "teams"]),
    webhookUrl: z.string().url(),
    channelName: z.string().optional(),
    enabled: z.boolean(),
  }),

  deleteConfiguration: z.object({
    id: z.number(),
  }),

  testWebhook: z.object({
    platform: z.enum(["slack", "teams"]),
    webhookUrl: z.string().url(),
  }),

  getDeliveryHistory: z.object({
    limit: z.number().optional(),
  }),

  getDeliveryStats: z.object({
    hoursBack: z.number().optional(),
  }),
};
