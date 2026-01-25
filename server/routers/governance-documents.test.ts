import { describe, expect, it } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";
import { getDb } from "../db";
import { governanceDocuments } from "../../drizzle/schema";

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

describe("governanceDocuments router", () => {
  describe("list", () => {
    it("returns empty array when no documents exist", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.governanceDocuments.list();

      expect(Array.isArray(result)).toBe(true);
    });

    it("supports filtering by document type", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.governanceDocuments.list({
        documentType: "GS1_STANDARD",
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("supports filtering by category", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.governanceDocuments.list({
        category: "IDENTIFICATION",
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("supports filtering by status", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.governanceDocuments.list({
        status: "PUBLISHED",
      });

      expect(Array.isArray(result)).toBe(true);
    });

    it("supports search term filtering", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.governanceDocuments.list({
        searchTerm: "EPCIS",
      });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("stats", () => {
    it("returns governance document statistics", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.governanceDocuments.stats();

      expect(result).toHaveProperty("total");
      expect(result).toHaveProperty("byDocumentType");
      expect(result).toHaveProperty("byCategory");
      expect(result).toHaveProperty("byStatus");
      expect(typeof result.total).toBe("number");
      expect(Array.isArray(result.byDocumentType)).toBe(true);
    });
  });

  describe("search", () => {
    it("performs full-text search on documents", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.governanceDocuments.search({
        searchTerm: "traceability",
      });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("needingVerification", () => {
    it("returns documents needing verification (90+ days)", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.governanceDocuments.needingVerification();

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("create (admin only)", () => {
    it("allows admin to create governance document", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const docData = {
        title: "Test GS1 Standard",
        documentType: "GS1_STANDARD" as const,
        category: "IDENTIFICATION" as const,
        url: "https://test.gs1.org/standard",
        description: "Test standard for unit testing",
        documentCode: "TEST-001",
      };

      const result = await caller.governanceDocuments.create(docData);

      expect(result).toBeDefined();

      // Clean up
      const db = await getDb();
      if (db && result.insertId) {
        await db.delete(governanceDocuments).where({ id: Number(result.insertId) } as any);
      }
    });

    it("rejects non-admin user from creating document", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      const docData = {
        title: "Unauthorized Document",
        documentType: "GS1_STANDARD" as const,
        category: "IDENTIFICATION" as const,
        url: "https://test.gs1.org/standard",
      };

      await expect(caller.governanceDocuments.create(docData)).rejects.toThrow(
        "Admin access required"
      );
    });

    it("enforces Lane C governance on created documents", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const docData = {
        title: "Lane C Test Document",
        documentType: "EU_REGULATION" as const,
        category: "ESG_REPORTING" as const,
        url: "https://test.europa.eu/regulation",
        documentCode: "EU-TEST-001",
      };

      const result = await caller.governanceDocuments.create(docData);

      expect(result).toBeDefined();

      // Verify Lane C status was applied
      const db = await getDb();
      if (db && result.insertId) {
        const created = await db
          .select()
          .from(governanceDocuments)
          .where({ id: Number(result.insertId) } as any)
          .limit(1);

        expect(created[0]?.laneStatus).toBe("LANE_C");

        // Clean up
        await db.delete(governanceDocuments).where({ id: Number(result.insertId) } as any);
      }
    });
  });

  describe("update (admin only)", () => {
    it("allows admin to update document metadata", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // Create test document
      const createResult = await caller.governanceDocuments.create({
        title: "Update Test Document",
        documentType: "GS1_GUIDELINE" as const,
        category: "CAPTURE" as const,
        url: "https://test.gs1.org/guideline",
        description: "Original description",
      });

      const docId = Number(createResult.insertId);

      // Update it
      const updateResult = await caller.governanceDocuments.update({
        id: docId,
        description: "Updated description",
        version: "2.0",
      });

      expect(updateResult).toBeDefined();

      // Verify update
      const db = await getDb();
      if (db) {
        const updated = await db
          .select()
          .from(governanceDocuments)
          .where({ id: docId } as any)
          .limit(1);

        expect(updated[0]?.description).toBe("Updated description");
        expect(updated[0]?.version).toBe("2.0");

        // Clean up
        await db.delete(governanceDocuments).where({ id: docId } as any);
      }
    });

    it("rejects non-admin from updating document", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.governanceDocuments.update({
          id: 999,
          description: "Should fail",
        })
      ).rejects.toThrow("Admin access required");
    });
  });

  describe("updateVerification (admin only)", () => {
    it("allows admin to update document verification", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // Create test document
      const createResult = await caller.governanceDocuments.create({
        title: "Verification Test Document",
        documentType: "GS1_WHITE_PAPER" as const,
        category: "TRACEABILITY" as const,
        url: "https://test.gs1.org/whitepaper",
      });

      const docId = Number(createResult.insertId);

      // Update verification
      const updateResult = await caller.governanceDocuments.updateVerification({
        id: docId,
      });

      expect(updateResult).toBeDefined();

      // Verify the update
      const db = await getDb();
      if (db) {
        const updated = await db
          .select()
          .from(governanceDocuments)
          .where({ id: docId } as any)
          .limit(1);

        expect(updated[0]?.lastVerifiedDate).toBeDefined();
        expect(updated[0]?.verifiedBy).toBe("Admin User");

        // Clean up
        await db.delete(governanceDocuments).where({ id: docId } as any);
      }
    });

    it("rejects non-admin from updating verification", async () => {
      const ctx = createUserContext();
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.governanceDocuments.updateVerification({
          id: 999,
        })
      ).rejects.toThrow("Admin access required");
    });
  });

  describe("getByCode", () => {
    it("retrieves document by document code", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      // Create test document with unique code
      const uniqueCode = `TEST-${Date.now()}`;
      const createResult = await caller.governanceDocuments.create({
        title: "Code Lookup Test",
        documentType: "TECHNICAL_SPECIFICATION" as const,
        category: "DIGITAL_PRODUCT_PASSPORT" as const,
        url: "https://test.gs1.org/spec",
        documentCode: uniqueCode,
      });

      const docId = Number(createResult.insertId);

      // Retrieve by code
      const retrieved = await caller.governanceDocuments.getByCode({
        documentCode: uniqueCode,
      });

      expect(retrieved).toBeDefined();
      expect(retrieved?.documentCode).toBe(uniqueCode);
      expect(retrieved?.title).toBe("Code Lookup Test");

      // Clean up
      const db = await getDb();
      if (db) {
        await db.delete(governanceDocuments).where({ id: docId } as any);
      }
    });

    it("returns null for non-existent document code", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const retrieved = await caller.governanceDocuments.getByCode({
        documentCode: "NON-EXISTENT-CODE",
      });

      expect(retrieved).toBeNull();
    });
  });

  describe("byRegulations", () => {
    it("retrieves documents by regulation IDs", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.governanceDocuments.byRegulations({
        regulationIds: [1, 2, 3],
      });

      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("byStandards", () => {
    it("retrieves documents by standard IDs", async () => {
      const ctx = createAdminContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.governanceDocuments.byStandards({
        standardIds: [1, 2, 3],
      });

      expect(Array.isArray(result)).toBe(true);
    });
  });
});
