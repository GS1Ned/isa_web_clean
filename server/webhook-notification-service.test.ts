/**
 * Webhook Notification Service Tests
 * 
 * Tests for Slack/Teams webhook integration
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import { sendSlackAlert, sendTeamsAlert, broadcastAlert, getDeliveryStats, AlertPayload } from "./webhook-notification-service";
import { getDb } from "./db";

// Mock fetch globally
global.fetch = vi.fn();

// Mock getDb
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

describe("Webhook Notification Service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Slack Alert Formatting", () => {
    it("should format info alert with correct structure", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => "ok",
      });

      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue({ insertId: 1 }),
        }),
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: 1 }]),
            }),
          }),
        }),
      };
      (getDb as any).mockResolvedValue(mockDb);

      const payload: AlertPayload = {
        severity: "info",
        title: "System Update",
        message: "System updated successfully",
        timestamp: new Date("2024-01-01T12:00:00Z"),
        details: { version: "1.0.0" },
      };

      const result = await sendSlackAlert("https://hooks.slack.com/test", payload);

      expect(Boolean(result.success)).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        "https://hooks.slack.com/test",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
        })
      );

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.attachments[0].blocks[0].text.text).toContain("System Update");
      expect(callBody.attachments[0].color).toBe("#36a64f");
    });

    it("should format critical alert with correct severity", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => "ok",
      });

      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue({ insertId: 1 }),
        }),
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: 1 }]),
            }),
          }),
        }),
      };
      (getDb as any).mockResolvedValue(mockDb);

      const payload: AlertPayload = {
        severity: "critical",
        title: "Critical Error",
        message: "Database connection lost",
        timestamp: new Date(),
      };

      await sendSlackAlert("https://hooks.slack.com/test", payload);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.attachments[0].color).toBe("#ff0000");
      expect(callBody.attachments[0].blocks[0].text.text).toContain(":rotating_light:");
    });

    it("should include action button when actionUrl provided", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => "ok",
      });

      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue({ insertId: 1 }),
        }),
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: 1 }]),
            }),
          }),
        }),
      };
      (getDb as any).mockResolvedValue(mockDb);

      const payload: AlertPayload = {
        severity: "warning",
        title: "Performance Alert",
        message: "High CPU usage detected",
        timestamp: new Date(),
        actionUrl: "https://isa.manus.space/admin/monitoring",
      };

      await sendSlackAlert("https://hooks.slack.com/test", payload);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      const actionBlock = callBody.attachments[0].blocks.find((b: any) => b.type === "actions");
      expect(actionBlock).toBeDefined();
      expect(actionBlock.elements[0].url).toBe("https://isa.manus.space/admin/monitoring");
    });
  });

  describe("Teams Alert Formatting", () => {
    it("should format alert as adaptive card", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => "ok",
      });

      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue({ insertId: 1 }),
        }),
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: 1 }]),
            }),
          }),
        }),
      };
      (getDb as any).mockResolvedValue(mockDb);

      const payload: AlertPayload = {
        severity: "info",
        title: "Test Alert",
        message: "This is a test",
        timestamp: new Date(),
      };

      await sendTeamsAlert("https://outlook.office.com/webhook/test", payload);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(callBody.type).toBe("message");
      expect(callBody.attachments[0].contentType).toBe("application/vnd.microsoft.card.adaptive");
      expect(callBody.attachments[0].content.type).toBe("AdaptiveCard");
    });

    it("should include details as fact set", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => "ok",
      });

      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue({ insertId: 1 }),
        }),
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: 1 }]),
            }),
          }),
        }),
      };
      (getDb as any).mockResolvedValue(mockDb);

      const payload: AlertPayload = {
        severity: "warning",
        title: "Alert with Details",
        message: "Check these metrics",
        timestamp: new Date(),
        details: {
          "Error Count": 42,
          "Error Rate": "15%",
        },
      };

      await sendTeamsAlert("https://outlook.office.com/webhook/test", payload);

      const callBody = JSON.parse(mockFetch.mock.calls[0][1].body);
      const body = callBody.attachments[0].content.body;
      const factSet = body.find((item: any) => item.type === "FactSet");
      expect(factSet).toBeDefined();
      expect(factSet.facts).toHaveLength(2);
    });
  });

  describe("Retry Logic", () => {
    it("should retry on 5xx errors", async () => {
      const mockFetch = global.fetch as any;
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          text: async () => "Service Unavailable",
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          text: async () => "Internal Server Error",
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          text: async () => "ok",
        });

      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue({ insertId: 1 }),
        }),
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: 1 }]),
            }),
          }),
        }),
      };
      (getDb as any).mockResolvedValue(mockDb);

      const payload: AlertPayload = {
        severity: "info",
        title: "Test",
        message: "Test message",
        timestamp: new Date(),
      };

      const result = await sendSlackAlert("https://hooks.slack.com/test", payload);

      expect(Boolean(result.success)).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it("should not retry on 4xx errors", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => "Bad Request",
      });

      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue({ insertId: 1 }),
        }),
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: 1 }]),
            }),
          }),
        }),
      };
      (getDb as any).mockResolvedValue(mockDb);

      const payload: AlertPayload = {
        severity: "info",
        title: "Test",
        message: "Test message",
        timestamp: new Date(),
      };

      const result = await sendSlackAlert("https://hooks.slack.com/test", payload);

      expect(Boolean(result.success)).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it("should fail after max retries", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
        text: async () => "Service Unavailable",
      });

      const mockDb = {
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue({ insertId: 1 }),
        }),
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: 1 }]),
            }),
          }),
        }),
      };
      (getDb as any).mockResolvedValue(mockDb);

      const payload: AlertPayload = {
        severity: "info",
        title: "Test",
        message: "Test message",
        timestamp: new Date(),
      };

      const result = await sendSlackAlert("https://hooks.slack.com/test", payload);

      expect(Boolean(result.success)).toBe(false);
      expect(mockFetch).toHaveBeenCalledTimes(3); // Max 3 attempts
    });
  });

  describe("Broadcast Alert", () => {
    it("should send to all enabled webhooks", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => "ok",
      });

      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([
              {
                id: 1,
                platform: "slack",
                webhookUrl: "https://hooks.slack.com/test1",
                enabled: 1,
              },
              {
                id: 2,
                platform: "teams",
                webhookUrl: "https://outlook.office.com/webhook/test2",
                enabled: 1,
              },
            ]),
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: 1 }]),
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue({ insertId: 1 }),
        }),
      };
      (getDb as any).mockResolvedValue(mockDb);

      const payload: AlertPayload = {
        severity: "critical",
        title: "System Alert",
        message: "Critical issue detected",
        timestamp: new Date(),
      };

      const results = await broadcastAlert(payload);

      expect(results).toHaveLength(2);
      expect(Boolean(results[0].success)).toBe(true);
      expect(Boolean(results[1].success)).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("should skip disabled webhooks", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: async () => "ok",
      });

      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue([
              {
                id: 1,
                platform: "slack",
                webhookUrl: "https://hooks.slack.com/test",
                enabled: 1,
              },
            ]),
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: 1 }]),
            }),
          }),
        }),
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue({ insertId: 1 }),
        }),
      };
      (getDb as any).mockResolvedValue(mockDb);

      const payload: AlertPayload = {
        severity: "info",
        title: "Test",
        message: "Test message",
        timestamp: new Date(),
      };

      const results = await broadcastAlert(payload);

      expect(results).toHaveLength(1);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe("Delivery Tracking", () => {
    it("should track successful delivery", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: async () => "ok",
      });

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue({ insertId: 123 }),
      });

      const mockDb = {
        insert: mockInsert,
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: 123 }]),
            }),
          }),
        }),
      };
      (getDb as any).mockResolvedValue(mockDb);

      const payload: AlertPayload = {
        severity: "info",
        title: "Test",
        message: "Test message",
        timestamp: new Date(),
      };

      const result = await sendSlackAlert("https://hooks.slack.com/test", payload);

      expect(Boolean(result.success)).toBe(true);
      expect(result.deliveryId).toBe(123);
      expect(mockInsert).toHaveBeenCalled();
    });

    it("should track failed delivery", async () => {
      const mockFetch = global.fetch as any;
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => "Bad Request",
      });

      const mockInsert = vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue({ insertId: 124 }),
      });

      const mockDb = {
        insert: mockInsert,
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: 124 }]),
            }),
          }),
        }),
      };
      (getDb as any).mockResolvedValue(mockDb);

      const payload: AlertPayload = {
        severity: "info",
        title: "Test",
        message: "Test message",
        timestamp: new Date(),
      };

      const result = await sendSlackAlert("https://hooks.slack.com/test", payload);

      expect(Boolean(result.success)).toBe(false);
      expect(result.error).toContain("400");
      expect(mockInsert).toHaveBeenCalled();
    });
  });

  describe("Delivery Statistics", () => {
    it("should calculate delivery stats correctly", async () => {
      const mockDb = {
        select: vi.fn().mockReturnValue({
          from: vi.fn().mockResolvedValue([
            { platform: "slack", success: 1 },
            { platform: "slack", success: 1 },
            { platform: "slack", success: 0 },
            { platform: "teams", success: 1 },
            { platform: "teams", success: 0 },
          ]),
        }),
      };
      (getDb as any).mockResolvedValue(mockDb);

      const stats = await getDeliveryStats(24);

      expect(stats.total).toBe(5);
      expect(stats.successful).toBe(3);
      expect(stats.failed).toBe(2);
      expect(stats.successRate).toBe(60);
      expect(stats.byPlatform.slack.total).toBe(3);
      expect(stats.byPlatform.slack.successful).toBe(2);
      expect(stats.byPlatform.teams.total).toBe(2);
      expect(stats.byPlatform.teams.successful).toBe(1);
    });
  });
});
