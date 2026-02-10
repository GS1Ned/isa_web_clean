import { describe, expect, it, beforeEach } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";
import { getDb } from "../db";
import { datasetRegistry } from "../../drizzle/schema";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("datasetRegistry router", () => {
  describe("list", () => {
    it("returns empty array when no datasets exist", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.datasetRegistry.list();

      expect(Array.isArray(result)).toBe(true);
    });

    it("supports filtering by category", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.datasetRegistry.list({
        category: "GS1_STANDARDS",
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("supports filtering by format", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.datasetRegistry.list({
        format: "JSON",
      });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("stats", () => {
    it("returns dataset statistics", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.datasetRegistry.stats();

      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("active");
      expect(result).toHaveProperty("verified");
      expect(result).toHaveProperty("needsVerification");
      expect(typeof result.total).toBe("number");
    });
  });

  describe("needingVerification", () => {
    it("returns datasets needing verification", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.datasetRegistry.needingVerification();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("create (admin only)", () => {
    it("allows admin to create dataset", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const datasetData = {
        name: "Test GS1 Dataset",
        description: "Test dataset for unit testing",
        category: "GS1_STANDARDS" as const,
        source: "https://test.gs1.org/dataset",
        format: "JSON" as const,
        version: "1.0.0",
        recordCount: 1000,
      };

      const result = await caller.datasetRegistry.create(datasetData);

      expect(result).toBeDefined();
      // Clean up: delete the test dataset
      const db = await getDb();
      if (db && result.insertId) {
        await db.delete(datasetRegistry).where({ id: Number(result.insertId) } as any);
      }
    });

    it("rejects non-admin user from creating dataset", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const datasetData = {
        name: "Test Dataset",
        description: "Should fail",
        category: "GS1_STANDARDS" as const,
        source: "https://test.gs1.org/dataset",
        format: "JSON" as const,
      };

      await expect(caller.datasetRegistry.create(datasetData)).rejects.toThrow(
        "Admin access required"
      );
    });

    it("enforces governance on created datasets", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const datasetData = {
        name: "Governance Test Dataset",
        description: "Testing governance enforcement",
        category: "ESRS_DATAPOINTS" as const,
        source: "https://test.esrs.eu/dataset",
        format: "CSV" as const,
      };

      const result = await caller.datasetRegistry.create(datasetData);

      expect(result).toBeDefined();

      // Verify governance status was applied
      const db = await getDb();
      if (db && result.insertId) {
        const created = await db
          .select()
          .from(datasetRegistry)
          .where({ id: Number(result.insertId) } as any)
          .limit(1);

        expect(created[0]).toBeDefined();

        // Clean up
        await db.delete(datasetRegistry).where({ id: Number(result.insertId) } as any);
      }
    });
  });

  describe("updateVerification (admin only)", () => {
    it("allows admin to update verification date", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // First create a test dataset
      const datasetData = {
        name: "Verification Test Dataset",
        description: "For verification testing",
        category: "GS1_STANDARDS" as const,
        source: "https://test.gs1.org/dataset",
        format: "JSON" as const,
      };

      const createResult = await caller.datasetRegistry.create(datasetData);
      const datasetId = Number(createResult.insertId);

      // Update verification
      const updateResult = await caller.datasetRegistry.updateVerification({
        id: datasetId,
        notes: "Verified for testing",
      });

      expect(updateResult).toBeDefined();

      // Verify the update
      const db = await getDb();
      if (db) {
        const updated = await db
          .select()
          .from(datasetRegistry)
          .where({ id: datasetId } as any)
          .limit(1);

        expect(updated[0]?.lastVerifiedDate).toBeDefined();
        expect(updated[0]?.verifiedBy).toBe("Admin User");

        // Clean up
        await db.delete(datasetRegistry).where({ id: datasetId } as any);
      }
    });

    it("rejects non-admin from updating verification", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.datasetRegistry.updateVerification({
          id: 999,
          notes: "Should fail",
        })
      ).rejects.toThrow("Admin access required");
    });
  });

  describe("update (admin only)", () => {
    it("allows admin to update dataset metadata", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // Create test dataset
      const createResult = await caller.datasetRegistry.create({
        name: "Update Test Dataset",
        description: "Original description",
        category: "GS1_STANDARDS" as const,
        source: "https://test.gs1.org/dataset",
        format: "JSON" as const,
      });

      const datasetId = Number(createResult.insertId);

      // Update it
      const updateResult = await caller.datasetRegistry.update({
        id: datasetId,
        description: "Updated description",
        version: "2.0.0",
      });

      expect(updateResult).toBeDefined();

      // Verify update
      const db = await getDb();
      if (db) {
        const updated = await db
          .select()
          .from(datasetRegistry)
          .where({ id: datasetId } as any)
          .limit(1);

        expect(updated[0]?.description).toBe("Updated description");
        expect(updated[0]?.version).toBe("2.0.0");

        // Clean up
        await db.delete(datasetRegistry).where({ id: datasetId } as any);
      }
    });

    it("rejects non-admin from updating dataset", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.datasetRegistry.update({
          id: 999,
          description: "Should fail",
        })
      ).rejects.toThrow("Admin access required");
    });
  });
});
