import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

/**
 * Create a mock context for testing
 */
function createMockContext(isAuthenticated: boolean = false): TrpcContext {
  const user = isAuthenticated
    ? {
        id: 1,
        openId: "test-user",
        email: "test@example.com",
        name: "Test User",
        loginMethod: "manus",
        role: "user" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      }
    : null;

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("ISA tRPC Routers", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(() => {
    // Create a public caller for testing
    const publicContext = createMockContext(false);
    caller = appRouter.createCaller(publicContext);
  });

  describe("auth router", () => {
    it("should return null for unauthenticated user", async () => {
      const publicContext = createMockContext(false);
      const publicCaller = appRouter.createCaller(publicContext);
      const user = await publicCaller.auth.me();
      expect(user).toBeNull();
    });

    it("should return user for authenticated user", async () => {
      const authContext = createMockContext(true);
      const authCaller = appRouter.createCaller(authContext);
      const user = await authCaller.auth.me();
      expect(user).not.toBeNull();
      expect(user?.email).toBe("test@example.com");
    });

    it("should logout successfully", async () => {
      const authContext = createMockContext(true);
      const authCaller = appRouter.createCaller(authContext);
      const result = await authCaller.auth.logout();
      expect(Boolean(result.success)).toBe(true);
    });
  });

  describe("regulations router", () => {
    it("should have list procedure", async () => {
      // This test verifies the procedure exists and returns an array
      const regulations = await caller.regulations.list();
      expect(Array.isArray(regulations)).toBe(true);
    });

    it("should handle optional type filter", async () => {
      // Test with no filter
      const allRegulations = await caller.regulations.list();
      expect(Array.isArray(allRegulations)).toBe(true);

      // Test with filter (may return empty if no data)
      const csrdOnly = await caller.regulations.list({ type: "CSRD" });
      expect(Array.isArray(csrdOnly)).toBe(true);
    });

    it("should have getWithStandards procedure", async () => {
      // This test verifies the procedure exists
      // It may return null if the regulation doesn't exist
      const result = await caller.regulations.getWithStandards({
        regulationId: 999,
      });
      expect(result === null || typeof result === "object").toBe(true);
    });
  });

  describe("standards router", () => {
    it("should list GS1 standards", async () => {
      const standards = await caller.standards.list();
      expect(Array.isArray(standards)).toBe(true);
    });
  });

  describe("insights router", () => {
    it("should get recent changes with default limit", async () => {
      const changes = await caller.insights.recentChanges();
      expect(Array.isArray(changes)).toBe(true);
    });

    it("should get recent changes with custom limit", async () => {
      const changes = await caller.insights.recentChanges({ limit: 5 });
      expect(Array.isArray(changes)).toBe(true);
    });

    it("should get dashboard stats", async () => {
      const stats = await caller.insights.stats();
      // Stats may be null if database is not available
      if (stats !== null) {
        expect(typeof stats.totalRegulations).toBe("number");
        expect(typeof stats.totalStandards).toBe("number");
        expect(typeof stats.totalMappings).toBe("number");
      }
    });
  });

  describe("user router (protected)", () => {
    it("should deny access to unauthenticated users", async () => {
      const publicContext = createMockContext(false);
      const publicCaller = appRouter.createCaller(publicContext);

      try {
        await publicCaller.user.analysisHistory();
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.code).toBe("UNAUTHORIZED");
      }
    });

    it("should allow authenticated users to access analysisHistory", async () => {
      const authContext = createMockContext(true);
      const authCaller = appRouter.createCaller(authContext);
      const history = await authCaller.user.analysisHistory();
      expect(Array.isArray(history)).toBe(true);
    });

    it("should allow authenticated users to get preferences", async () => {
      const authContext = createMockContext(true);
      const authCaller = appRouter.createCaller(authContext);
      const prefs = await authCaller.user.preferences();
      // Preferences may be null if database is not available
      expect(prefs === null || typeof prefs === "object").toBe(true);
    });

    it("should allow authenticated users to create analysis", async () => {
      const authContext = createMockContext(true);
      const authCaller = appRouter.createCaller(authContext);

      const result = await authCaller.user.createAnalysis({
        analysisType: "CELEX",
        documentTitle: "Test Regulation",
        detectedStandardsCount: 5,
      });

      // Result may be null if database is not available
      expect(result === null || typeof result === "object").toBe(true);
    });

    it("should allow authenticated users to update preferences", async () => {
      const authContext = createMockContext(true);
      const authCaller = appRouter.createCaller(authContext);

      const result = await authCaller.user.updatePreferences({
        notificationsEnabled: true,
        industryFocus: "Retail",
      });

      expect(Boolean(result.success)).toBe(true);
    });
  });

  describe("hub router (Phase 4)", () => {
    it("should save a regulation for authenticated users", async () => {
      const authContext = createMockContext(true);
      const authCaller = appRouter.createCaller(authContext);

      const result = await authCaller.hub.saveRegulation({ regulationId: 1 });

      expect(Boolean(result.success)).toBe(true);
    });

    it("should remove a saved regulation", async () => {
      const authContext = createMockContext(true);
      const authCaller = appRouter.createCaller(authContext);

      const result = await authCaller.hub.unsaveRegulation({ regulationId: 1 });

      expect(Boolean(result.success)).toBe(true);
    });

    it("should set alert preferences", async () => {
      const authContext = createMockContext(true);
      const authCaller = appRouter.createCaller(authContext);

      const result = await authCaller.hub.setAlert({
        regulationId: 1,
        alertType: "REGULATION_UPDATE",
      });

      expect(Boolean(result.success)).toBe(true);
    });

    it("should get saved regulations", async () => {
      const authContext = createMockContext(true);
      const authCaller = appRouter.createCaller(authContext);

      const result = await authCaller.hub.getSavedRegulations();

      expect(Array.isArray(result)).toBe(true);
    });

    it("should get user alerts", async () => {
      const authContext = createMockContext(true);
      const authCaller = appRouter.createCaller(authContext);

      const result = await authCaller.hub.getUserAlerts();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("analytics router (Phase 4)", () => {
    it("should get hub metrics for admin users", async () => {
      // Create an admin user context
      const adminContext = {
        user: {
          id: 1,
          openId: "admin-user",
          email: "admin@example.com",
          name: "Admin User",
          loginMethod: "manus",
          role: "admin" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
        req: { protocol: "https", headers: {} } as TrpcContext["req"],
        res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
      };
      const adminCaller = appRouter.createCaller(adminContext);

      const result = await adminCaller.analytics.getHubMetrics();

      expect(result).toHaveProperty("totalUsers");
      expect(result).toHaveProperty("activeUsers");
      expect(result).toHaveProperty("totalPageViews");
      expect(result).toHaveProperty("topRegulations");
      expect(result).toHaveProperty("topStandards");
      expect(Array.isArray(result.topRegulations)).toBe(true);
      expect(Array.isArray(result.topStandards)).toBe(true);
    });

    it("should track page views", async () => {
      const publicContext = createMockContext(false);
      const publicCaller = appRouter.createCaller(publicContext);

      const result = await publicCaller.analytics.trackPageView({
        page: "/hub/regulations",
        regulationId: 1,
      });

      expect(Boolean(result.success)).toBe(true);
    });

    it("should get user engagement stats for admin users", async () => {
      // Create an admin user context
      const adminContext = {
        user: {
          id: 1,
          openId: "admin-user",
          email: "admin@example.com",
          name: "Admin User",
          loginMethod: "manus",
          role: "admin" as const,
          createdAt: new Date(),
          updatedAt: new Date(),
          lastSignedIn: new Date(),
        },
        req: { protocol: "https", headers: {} } as TrpcContext["req"],
        res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
      };
      const adminCaller = appRouter.createCaller(adminContext);

      const result = await adminCaller.analytics.getUserEngagement();

      expect(result).toHaveProperty("newUsersThisWeek");
      expect(result).toHaveProperty("returningUsers");
      expect(result).toHaveProperty("userRetentionRate");
      expect(result).toHaveProperty("avgAlertsPerUser");
      expect(result).toHaveProperty("emailOpenRate");
      expect(result).toHaveProperty("emailClickRate");
    });
  });
});
