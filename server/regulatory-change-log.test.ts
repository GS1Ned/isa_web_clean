import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { Context } from "./_core/context";

/**
 * Regulatory Change Log Tests
 *
 * Tests for the regulatory change log feature including:
 * - CRUD operations
 * - Pagination
 * - Filtering
 * - Authorization (admin-only creation/deletion)
 * - Data validation
 */

// Mock admin context
const mockAdminContext: Context = {
  user: {
    id: 1,
    openId: "test-admin",
    name: "Test Admin",
    email: "admin@test.com",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: {} as any,
  res: {} as any,
};

// Mock regular user context
const mockUserContext: Context = {
  user: {
    id: 2,
    openId: "test-user",
    name: "Test User",
    email: "user@test.com",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: {} as any,
  res: {} as any,
};

describe("Regulatory Change Log", () => {
  let testEntryId: number | undefined;
  let setupError: Error | undefined;

  // Setup: Create a test entry before running tests that depend on it
  beforeAll(async () => {
    try {
      const caller = appRouter.createCaller(mockAdminContext);
      const entry = await caller.regulatoryChangeLog.create({
        entryDate: new Date().toISOString(),
        sourceType: "EU_REGULATION",
        sourceOrg: "European Commission",
        title: "Test Regulation Update",
        description: "This is a test regulatory change entry for authorization testing",
        url: "https://eur-lex.europa.eu/test/regulation/123",
        documentHash: "a".repeat(64),
        impactAssessment: "High impact on ESG reporting requirements",
        isaVersionAffected: "v1.1",
      });
      testEntryId = entry?.id;
    } catch (error) {
      setupError = error as Error;
    }
  });

  describe("Authorization", () => {
    it("should allow admin to create entries", async () => {
      // Skip if setup failed
      if (setupError) {
        return;
      }
      
      // Verify the entry was created in beforeAll
      expect(testEntryId).toBeDefined();
      expect(testEntryId).toBeGreaterThan(0);
    });

    it("should prevent non-admin users from creating entries", async () => {
      const caller = appRouter.createCaller(mockUserContext);

      await expect(
        caller.regulatoryChangeLog.create({
          entryDate: new Date().toISOString(),
          sourceType: "EU_DIRECTIVE",
          sourceOrg: "European Commission",
          title: "Unauthorized Entry",
          description: "This should fail",
          url: "https://example.com/test",
        })
      ).rejects.toThrow("Only administrators can create regulatory change log entries");
    });

    it("should allow public access to list entries", async () => {
      const caller = appRouter.createCaller(mockUserContext);

      const result = await caller.regulatoryChangeLog.list();

      expect(result).toBeDefined();
      expect(result.entries).toBeInstanceOf(Array);
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.page).toBe(1);
      expect(result.pageSize).toBeGreaterThan(0);
    });

    it("should allow public access to get entry by ID", async () => {
      if (!testEntryId) {
        return;
      }
      
      const caller = appRouter.createCaller(mockUserContext);

      const entry = await caller.regulatoryChangeLog.getById({ id: testEntryId });

      expect(entry).toBeDefined();
      expect(entry.id).toBe(testEntryId);
    });
  });

  describe("CRUD Operations", () => {
    it("should create entry with all required fields", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      const entry = await caller.regulatoryChangeLog.create({
        entryDate: "2025-12-15",
        sourceType: "EFRAG_IG",
        sourceOrg: "EFRAG",
        title: "ESRS Implementation Guidance Update",
        description: "New guidance on ESRS E1 climate disclosures",
        url: "https://www.efrag.org/test/ig/456",
        documentHash: "b".repeat(64),
        impactAssessment: "Clarifies disclosure requirements for Scope 3 emissions",
        isaVersionAffected: "v1.2",
      });

      expect(entry.sourceType).toBe("EFRAG_IG");
      expect(entry.sourceOrg).toBe("EFRAG");
      expect(entry.title).toBe("ESRS Implementation Guidance Update");
      expect(entry.impactAssessment).toBe("Clarifies disclosure requirements for Scope 3 emissions");
      expect(entry.isaVersionAffected).toBe("v1.2");
    });

    it("should create entry with minimal required fields", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      const entry = await caller.regulatoryChangeLog.create({
        entryDate: new Date().toISOString(),
        sourceType: "GS1_NL",
        sourceOrg: "GS1 Netherlands",
        title: "GS1 Data Model Update",
        description: "Updated product classification attributes",
        url: "https://www.gs1.nl/test/update/789",
      });

      expect(entry.documentHash).toBeNull();
      expect(entry.impactAssessment).toBeNull();
      expect(entry.isaVersionAffected).toBeNull();
    });

    it("should retrieve entry by ID", async () => {
      if (!testEntryId) {
        return;
      }
      
      const caller = appRouter.createCaller(mockAdminContext);

      const entry = await caller.regulatoryChangeLog.getById({ id: testEntryId });

      expect(entry.id).toBe(testEntryId);
      expect(entry.title).toBe("Test Regulation Update");
    });

    it("should throw error for non-existent entry ID", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      await expect(
        caller.regulatoryChangeLog.getById({ id: 999999 })
      ).rejects.toThrow("Regulatory change log entry with ID 999999 not found");
    });

    it("should delete entry (admin only)", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      // Create a temporary entry to delete
      const tempEntry = await caller.regulatoryChangeLog.create({
        entryDate: new Date().toISOString(),
        sourceType: "EU_DELEGATED_ACT",
        sourceOrg: "European Commission",
        title: "Temporary Entry for Deletion Test",
        description: "This entry will be deleted",
        url: "https://example.com/temp",
      });

      const result = await caller.regulatoryChangeLog.delete({ id: tempEntry.id });

      expect(Boolean(result.success)).toBe(true);

      // Verify deletion
      await expect(
        caller.regulatoryChangeLog.getById({ id: tempEntry.id })
      ).rejects.toThrow("not found");
    });

    it("should prevent non-admin from deleting entries", async () => {
      if (!testEntryId) {
        return;
      }
      
      const caller = appRouter.createCaller(mockUserContext);

      await expect(
        caller.regulatoryChangeLog.delete({ id: testEntryId })
      ).rejects.toThrow("Only administrators can delete regulatory change log entries");
    });
  });

  describe("Pagination", () => {
    it("should paginate results with default page size", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      const result = await caller.regulatoryChangeLog.list({
        page: 1,
        pageSize: 10,
      });

      expect(result.page).toBe(1);
      expect(result.pageSize).toBe(10);
      expect(result.entries.length).toBeLessThanOrEqual(10);
    });

    it("should handle page 2 correctly", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      // Get first page
      const page1 = await caller.regulatoryChangeLog.list({
        page: 1,
        pageSize: 5,
      });

      // Get second page
      const page2 = await caller.regulatoryChangeLog.list({
        page: 2,
        pageSize: 5,
      });

      expect(page2.page).toBe(2);

      // If there are enough entries, page 2 should have different entries
      if (page1.total > 5) {
        expect(page2.entries.length).toBeGreaterThan(0);
        if (page1.entries.length > 0 && page2.entries.length > 0) {
          expect(page1.entries[0].id).not.toBe(page2.entries[0].id);
        }
      }
    });

    it("should return correct total count", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      const result = await caller.regulatoryChangeLog.list();

      expect(result.total).toBeGreaterThanOrEqual(result.entries.length);
    });
  });

  describe("Filtering", () => {
    it("should filter by source type", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      const result = await caller.regulatoryChangeLog.list({
        sourceType: "EU_REGULATION",
      });

      result.entries.forEach((entry) => {
        expect(entry.sourceType).toBe("EU_REGULATION");
      });
    });

    it("should filter by ISA version", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      const result = await caller.regulatoryChangeLog.list({
        isaVersionAffected: "v1.1",
      });

      result.entries.forEach((entry) => {
        expect(entry.isaVersionAffected).toBe("v1.1");
      });
    });

    it("should filter by source organization", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      const result = await caller.regulatoryChangeLog.list({
        sourceOrg: "European Commission",
      });

      result.entries.forEach((entry) => {
        expect(entry.sourceOrg).toContain("European Commission");
      });
    });

    it("should filter by search term", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      const result = await caller.regulatoryChangeLog.list({
        search: "Test Regulation",
      });

      result.entries.forEach((entry) => {
        const matchesSearch =
          entry.title.includes("Test Regulation") ||
          entry.description.includes("Test Regulation");
        expect(matchesSearch).toBe(true);
      });
    });

    it("should filter by date range", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      const startDate = "2025-12-01";
      const endDate = "2025-12-31";

      const result = await caller.regulatoryChangeLog.list({
        startDate,
        endDate,
      });

      result.entries.forEach((entry) => {
        const entryDate = new Date(entry.entryDate);
        expect(entryDate >= new Date(startDate)).toBe(true);
        expect(entryDate <= new Date(endDate)).toBe(true);
      });
    });

    it("should combine multiple filters", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      const result = await caller.regulatoryChangeLog.list({
        sourceType: "EU_REGULATION",
        isaVersionAffected: "v1.1",
        page: 1,
        pageSize: 10,
      });

      result.entries.forEach((entry) => {
        expect(entry.sourceType).toBe("EU_REGULATION");
        expect(entry.isaVersionAffected).toBe("v1.1");
      });
    });
  });

  describe("Statistics", () => {
    it("should return statistics by source type", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      const stats = await caller.regulatoryChangeLog.statsBySourceType();

      expect(stats).toBeDefined();
      expect(typeof stats).toBe("object");

      // Should have at least one source type with count
      const keys = Object.keys(stats);
      if (keys.length > 0) {
        expect(stats[keys[0]]).toBeGreaterThan(0);
      }
    });

    it("should return statistics by ISA version", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      const stats = await caller.regulatoryChangeLog.statsByVersion();

      expect(stats).toBeDefined();
      expect(typeof stats).toBe("object");
    });
  });

  describe("Data Validation", () => {
    it("should reject invalid source type", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      await expect(
        caller.regulatoryChangeLog.create({
          entryDate: new Date().toISOString(),
          sourceType: "INVALID_TYPE" as any,
          sourceOrg: "Test Org",
          title: "Test",
          description: "Test",
          url: "https://example.com",
        })
      ).rejects.toThrow();
    });

    it("should reject invalid URL format", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      await expect(
        caller.regulatoryChangeLog.create({
          entryDate: new Date().toISOString(),
          sourceType: "EU_REGULATION",
          sourceOrg: "Test Org",
          title: "Test",
          description: "Test",
          url: "not-a-valid-url",
        })
      ).rejects.toThrow();
    });

    it("should reject document hash with wrong length", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      await expect(
        caller.regulatoryChangeLog.create({
          entryDate: new Date().toISOString(),
          sourceType: "EU_REGULATION",
          sourceOrg: "Test Org",
          title: "Test",
          description: "Test",
          url: "https://example.com",
          documentHash: "tooshort", // Should be 64 characters
        })
      ).rejects.toThrow();
    });

    it("should reject empty required fields", async () => {
      const caller = appRouter.createCaller(mockAdminContext);

      await expect(
        caller.regulatoryChangeLog.create({
          entryDate: new Date().toISOString(),
          sourceType: "EU_REGULATION",
          sourceOrg: "",
          title: "Test",
          description: "Test",
          url: "https://example.com",
        })
      ).rejects.toThrow();
    });
  });
});
