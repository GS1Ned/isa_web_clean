/**
 * Alert System Tests
 * 
 * Comprehensive tests for alert detection, notification, and history tracking
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getDb } from "./db";
import { errorLog, performanceLog, alertHistory, alertCooldowns } from "../drizzle/schema";
import {
  checkErrorRateThreshold,
  checkCriticalErrorThreshold,
  checkPerformanceDegradation,
  isInCooldown,
  createCooldown,
  DEFAULT_THRESHOLDS,
} from "./alert-detection";
import {
  processAlert,
  getAlertHistory,
  acknowledgeAlert,
  getUnacknowledgedCount,
} from "./alert-notification-service";
import { eq } from "drizzle-orm";

describe("Alert Detection System", () => {
  beforeEach(async () => {
    // Clean up test data before each test
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.delete(errorLog);
    await db.delete(performanceLog);
    await db.delete(alertHistory);
    await db.delete(alertCooldowns);
  });

  afterEach(async () => {
    // Clean up test data after each test
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    await db.delete(errorLog);
    await db.delete(performanceLog);
    await db.delete(alertHistory);
    await db.delete(alertCooldowns);
  });

  describe("Error Rate Detection", () => {
    it("should detect high error rate and trigger warning alert", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Insert 15 errors (exceeds warning threshold of 10)
      const now = new Date();
      for (let i = 0; i < 15; i++) {
        await db.insert(errorLog).values({
          timestamp: new Date(now.getTime() - i * 60000).toISOString(), // Spread over last hour
          severity: "error",
          message: `Test error ${i}`,
          operation: "test.operation",
        });
      }

      const result = await checkErrorRateThreshold(DEFAULT_THRESHOLDS);

      expect(result).toBeDefined();
      expect(Boolean(result?.shouldAlert)).toBe(true);
      expect(result?.alertType).toBe("error_rate");
      expect(result?.severity).toBe("warning");
      expect(result?.metadata.errorCount).toBe(15);
    });

    it("should detect critical error rate and trigger critical alert", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Insert 60 errors (exceeds critical threshold of 50)
      const now = new Date();
      for (let i = 0; i < 60; i++) {
        await db.insert(errorLog).values({
          timestamp: new Date(now.getTime() - i * 60000).toISOString(),
          severity: "error",
          message: `Test error ${i}`,
          operation: "test.operation",
        });
      }

      const result = await checkErrorRateThreshold(DEFAULT_THRESHOLDS);

      expect(result).toBeDefined();
      expect(result?.severity).toBe("critical");
      expect(result?.metadata.errorCount).toBe(60);
    });

    it("should not trigger alert when error rate is below threshold", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Insert only 5 errors (below warning threshold)
      const now = new Date();
      for (let i = 0; i < 5; i++) {
        await db.insert(errorLog).values({
          timestamp: new Date(now.getTime() - i * 60000).toISOString(),
          severity: "error",
          message: `Test error ${i}`,
          operation: "test.operation",
        });
      }

      const result = await checkErrorRateThreshold(DEFAULT_THRESHOLDS);

      expect(result).toBeNull();
    });
  });

  describe("Critical Error Detection", () => {
    it("should detect critical error spike", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Insert 7 critical errors in last 15 minutes (exceeds threshold of 5)
      const now = new Date();
      for (let i = 0; i < 7; i++) {
        await db.insert(errorLog).values({
          timestamp: new Date(now.getTime() - i * 60000).toISOString(),
          severity: "critical",
          message: `Critical error ${i}`,
          operation: "critical.operation",
        });
      }

      const result = await checkCriticalErrorThreshold(DEFAULT_THRESHOLDS);

      expect(result).toBeDefined();
      expect(Boolean(result?.shouldAlert)).toBe(true);
      expect(result?.alertType).toBe("critical_error");
      expect(result?.severity).toBe("critical");
      expect(result?.metadata.criticalCount).toBe(7);
    });

    it("should not trigger alert for non-critical errors", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Insert 10 warning-level errors
      const now = new Date();
      for (let i = 0; i < 10; i++) {
        await db.insert(errorLog).values({
          timestamp: new Date(now.getTime() - i * 60000).toISOString(),
          severity: "warning",
          message: `Warning ${i}`,
          operation: "test.operation",
        });
      }

      const result = await checkCriticalErrorThreshold(DEFAULT_THRESHOLDS);

      expect(result).toBeNull();
    });
  });

  describe("Performance Degradation Detection", () => {
    it("should detect performance degradation when p95 exceeds baseline", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const operation = "slow.operation";

      // Insert baseline data (7 days ago, p95 ~100ms)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      for (let i = 0; i < 150; i++) {
        await db.insert(performanceLog).values({
          timestamp: new Date(sevenDaysAgo.getTime() + i * 60000).toISOString(),
          operation,
          duration: 80 + Math.random() * 40, // 80-120ms
          success: 1,
        });
      }

      // Insert recent slow data (p95 ~500ms, 5x baseline)
      const now = new Date();
      for (let i = 0; i < 50; i++) {
        await db.insert(performanceLog).values({
          timestamp: new Date(now.getTime() - i * 60000).toISOString(),
          operation,
          duration: 400 + Math.random() * 200, // 400-600ms
          success: 1,
        });
      }

      const result = await checkPerformanceDegradation(operation, DEFAULT_THRESHOLDS);

      expect(result).toBeDefined();
      expect(Boolean(result?.shouldAlert)).toBe(true);
      expect(result?.alertType).toBe("performance_degradation");
      // The multiplier should trigger at least warning level (2x baseline)
      expect(result?.severity).toMatch(/warning|critical/);
      expect(result?.metadata.multiplier).toBeGreaterThan(2);
    }, 60000); // 60s timeout for inserting 200 records

    it("should not trigger alert with insufficient baseline samples", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const operation = "new.operation";

      // Insert only 50 baseline samples (need 100+)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      for (let i = 0; i < 50; i++) {
        await db.insert(performanceLog).values({
          timestamp: new Date(sevenDaysAgo.getTime() + i * 60000).toISOString(),
          operation,
          duration: 100,
          success: 1,
        });
      }

      const result = await checkPerformanceDegradation(operation, DEFAULT_THRESHOLDS);

      expect(result).toBeNull();
    });
  });

  describe("Cooldown Management", () => {
    it("should create cooldown and prevent duplicate alerts", async () => {
      const alertType = "error_rate";
      const alertKey = "error_rate";
      const cooldownMinutes = 60;

      // Initially no cooldown
      const beforeCooldown = await isInCooldown(alertType, alertKey);
      expect(beforeCooldown).toBe(false);

      // Create cooldown
      await createCooldown(alertType, alertKey, cooldownMinutes);

      // Now in cooldown
      const afterCooldown = await isInCooldown(alertType, alertKey);
      expect(afterCooldown).toBe(true);
    });

    it("should respect cooldown expiration", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const alertType = "error_rate";
      const alertKey = "error_rate";

      // Create expired cooldown (1 minute ago)
      const expiredTime = new Date(Date.now() - 60000);
      await db.insert(alertCooldowns).values({
        alertType,
        alertKey,
        lastTriggeredAt: new Date(Date.now() - 120000).toISOString(),
        expiresAt: expiredTime.toISOString(),
      });

      // Should not be in cooldown (expired)
      const inCooldown = await isInCooldown(alertType, alertKey);
      expect(inCooldown).toBe(false);
    });
  });

  describe("Alert Notification Service", () => {
    it("should process alert and save to history", async () => {
      const alert = {
        shouldAlert: true,
        alertType: "error_rate" as const,
        severity: "warning" as const,
        title: "Test Alert",
        message: "This is a test alert",
        metadata: {
          errorCount: 15,
          threshold: 10,
        },
      };

      const result = await processAlert(alert);

      expect(Boolean(result.success)).toBe(true);
      expect(result.alertId).toBeGreaterThan(0);

      // Verify alert was saved to history
      const history = await getAlertHistory(10);
      expect(history.length).toBe(1);
      expect(history[0].title).toBe("Test Alert");
      expect(history[0].alertType).toBe("error_rate");
    });

    it("should track unacknowledged alerts", async () => {
      const alert = {
        shouldAlert: true,
        alertType: "critical_error" as const,
        severity: "critical" as const,
        title: "Critical Test Alert",
        message: "This is a critical test alert",
        metadata: {},
      };

      await processAlert(alert);

      const count = await getUnacknowledgedCount();
      expect(count).toBe(1);
    });

    it("should acknowledge alerts", async () => {
      const alert = {
        shouldAlert: true,
        alertType: "error_rate" as const,
        severity: "warning" as const,
        title: "Test Alert",
        message: "Test",
        metadata: {},
      };

      const result = await processAlert(alert);
      const alertId = result.alertId;

      // Initially unacknowledged
      let count = await getUnacknowledgedCount();
      expect(count).toBe(1);

      // Acknowledge alert
      const ackSuccess = await acknowledgeAlert(alertId, 1);
      expect(ackSuccess).toBe(true);

      // Now acknowledged
      count = await getUnacknowledgedCount();
      expect(count).toBe(0);

      // Verify acknowledgment in history
      const history = await getAlertHistory(10);
      expect(history[0].acknowledgedAt).toBeDefined();
      expect(history[0].acknowledgedBy).toBe(1);
    });
  });

  describe("Alert Filtering", () => {
    it("should filter alerts by type", async () => {
      // Create alerts of different types
      await processAlert({
        shouldAlert: true,
        alertType: "error_rate",
        severity: "warning",
        title: "Error Rate Alert",
        message: "Test",
        metadata: {},
      });

      await processAlert({
        shouldAlert: true,
        alertType: "critical_error",
        severity: "critical",
        title: "Critical Error Alert",
        message: "Test",
        metadata: {},
      });

      // Filter by error_rate
      const errorRateAlerts = await getAlertHistory(10, "error_rate");
      expect(errorRateAlerts.length).toBe(1);
      expect(errorRateAlerts[0].alertType).toBe("error_rate");

      // Filter by critical_error
      const criticalAlerts = await getAlertHistory(10, "critical_error");
      expect(criticalAlerts.length).toBe(1);
      expect(criticalAlerts[0].alertType).toBe("critical_error");
    });

    it("should filter alerts by severity", async () => {
      await processAlert({
        shouldAlert: true,
        alertType: "error_rate",
        severity: "warning",
        title: "Warning Alert",
        message: "Test",
        metadata: {},
      });

      await processAlert({
        shouldAlert: true,
        alertType: "critical_error",
        severity: "critical",
        title: "Critical Alert",
        message: "Test",
        metadata: {},
      });

      // Filter by warning severity
      const warningAlerts = await getAlertHistory(10, undefined, "warning");
      expect(warningAlerts.length).toBe(1);
      expect(warningAlerts[0].severity).toBe("warning");

      // Filter by critical severity
      const criticalAlerts = await getAlertHistory(10, undefined, "critical");
      expect(criticalAlerts.length).toBe(1);
      expect(criticalAlerts[0].severity).toBe("critical");
    });

    it("should filter unacknowledged alerts only", async () => {
      // Create two alerts
      const result1 = await processAlert({
        shouldAlert: true,
        alertType: "error_rate",
        severity: "warning",
        title: "Alert 1",
        message: "Test",
        metadata: {},
      });

      const result2 = await processAlert({
        shouldAlert: true,
        alertType: "error_rate",
        severity: "warning",
        title: "Alert 2",
        message: "Test",
        metadata: {},
      });

      // Acknowledge first alert
      await acknowledgeAlert(result1.alertId, 1);

      // Filter unacknowledged only
      const unacknowledged = await getAlertHistory(10, undefined, undefined, true);
      expect(unacknowledged.length).toBe(1);
      expect(unacknowledged[0].id).toBe(result2.alertId);
    });
  });
});
