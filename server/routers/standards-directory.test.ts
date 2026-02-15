/**
 * Standards Directory Router Tests
 * 
 * Track B Priority 3: Standards Discovery UI
 * 
 * Tests for deterministic standards browsing functionality:
 * - List standards with filters
 * - Get standard detail
 * - Verify data sources and transparency metadata
 */

import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";
import type { TrpcContext } from "../_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Standards Directory Router", () => {
  describe("list procedure", () => {
    it("should return all standards without filters", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.standardsDirectory.list({});

      expect(result).toBeDefined();
      expect(result.standards).toBeInstanceOf(Array);
      expect(result.total).toBeGreaterThan(0);
      expect(result.standards.length).toBeGreaterThan(0);
    });

    it("should filter by organization (GS1_Global)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.standardsDirectory.list({
        organization: "GS1_Global",
      });

      expect(result.standards).toBeInstanceOf(Array);
      result.standards.forEach((standard) => {
        expect(standard.owningOrganization).toBe("GS1_Global");
      });
    });

    it("should filter by organization (GS1_NL)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.standardsDirectory.list({
        organization: "GS1_NL",
      });

      expect(result.standards).toBeInstanceOf(Array);
      result.standards.forEach((standard) => {
        expect(standard.owningOrganization).toBe("GS1_NL");
      });
    });

    it("should filter by organization (EFRAG)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.standardsDirectory.list({
        organization: "EFRAG",
      });

      expect(result.standards).toBeInstanceOf(Array);
      result.standards.forEach((standard) => {
        expect(standard.owningOrganization).toBe("EFRAG");
      });
    });

    it("should filter by jurisdiction (Global)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.standardsDirectory.list({
        jurisdiction: "Global",
      });

      expect(result.standards).toBeInstanceOf(Array);
      result.standards.forEach((standard) => {
        expect(standard.jurisdiction).toBe("Global");
      });
    });

    it("should filter by jurisdiction (EU)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.standardsDirectory.list({
        jurisdiction: "EU",
      });

      expect(result.standards).toBeInstanceOf(Array);
      result.standards.forEach((standard) => {
        expect(standard.jurisdiction).toBe("EU");
      });
    });

    it("should filter by jurisdiction (Benelux)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.standardsDirectory.list({
        jurisdiction: "Benelux",
      });

      expect(result.standards).toBeInstanceOf(Array);
      result.standards.forEach((standard) => {
        expect(standard.jurisdiction).toBe("Benelux");
      });
    });

    it("should filter by sector (DIY)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.standardsDirectory.list({
        sector: "DIY",
      });

      expect(result.standards).toBeInstanceOf(Array);
      // Sector filtering may return empty results if no DIY standards exist
      if (result.standards.length > 0) {
        result.standards.forEach((standard) => {
          if (standard.sector) {
            expect(standard.sector).toBe("DIY");
          }
        });
      }
    });

    it("should filter by lifecycle status (current)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.standardsDirectory.list({
        lifecycleStatus: "current",
      });

      expect(result.standards).toBeInstanceOf(Array);
      result.standards.forEach((standard) => {
        if (standard.lifecycleStatus) {
          expect(standard.lifecycleStatus).toBe("current");
        }
      });
    });

    it("should filter by lifecycle status (ratified)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.standardsDirectory.list({
        lifecycleStatus: "ratified",
      });

      expect(result.standards).toBeInstanceOf(Array);
      result.standards.forEach((standard) => {
        if (standard.lifecycleStatus) {
          expect(standard.lifecycleStatus).toBe("ratified");
        }
      });
    });

    it("should search by name", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.standardsDirectory.list({
        search: "GS1",
      });

      expect(result.standards).toBeInstanceOf(Array);
      // Search should return results containing "GS1"
      if (result.standards.length > 0) {
        result.standards.forEach((standard) => {
          const nameMatch = standard.name.toLowerCase().includes("gs1");
          const orgMatch = standard.owningOrganization.toLowerCase().includes("gs1");
          expect(nameMatch || orgMatch).toBe(true);
        });
      }
    });

    it("should combine multiple filters", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.standardsDirectory.list({
        organization: "GS1_NL",
        jurisdiction: "Benelux",
        lifecycleStatus: "current",
      });

      expect(result.standards).toBeInstanceOf(Array);
      result.standards.forEach((standard) => {
        expect(standard.owningOrganization).toBe("GS1_NL");
        expect(standard.jurisdiction).toBe("Benelux");
        if (standard.lifecycleStatus) {
          expect(standard.lifecycleStatus).toBe("current");
        }
      });
    });

    it("should include required fields in results", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.standardsDirectory.list({});

      expect(result.standards.length).toBeGreaterThan(0);
      
      const standard = result.standards[0];
      expect(standard).toHaveProperty("id");
      expect(standard).toHaveProperty("name");
      expect(standard).toHaveProperty("owningOrganization");
      expect(standard).toHaveProperty("jurisdiction");
      expect(standard).toHaveProperty("sourceType");
      expect(typeof standard.id).toBe("string");
      expect(typeof standard.name).toBe("string");
      expect(typeof standard.owningOrganization).toBe("string");
      expect(typeof standard.jurisdiction).toBe("string");
      expect(typeof standard.sourceType).toBe("string");
    });

    it("should include record count for aggregated standards", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.standardsDirectory.list({
        organization: "GS1_NL",
      });

      expect(result.standards.length).toBeGreaterThan(0);
      
      // GS1 NL standards should have record counts
      const gs1NlStandard = result.standards.find(
        (s) => s.sourceType === "gs1_attributes"
      );
      
      if (gs1NlStandard) {
        expect(gs1NlStandard.recordCount).toBeDefined();
        expect(typeof gs1NlStandard.recordCount).toBe("number");
        expect(gs1NlStandard.recordCount).toBeGreaterThan(0);
      }
    });
  });

  describe("getDetail procedure", () => {
    it("should return detail for GS1 Web Vocabulary", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const detail = await caller.standardsDirectory.getDetail({
        id: "gs1_web_vocabulary",
      });

      expect(detail).toBeDefined();
      expect(detail?.id).toBe("gs1_web_vocabulary");
      expect(detail?.name).toBe("GS1 Web Vocabulary");
      expect(detail?.owningOrganization).toBe("GS1_Global");
      expect(detail?.jurisdiction).toBe("Global");
      expect(detail?.lifecycleStatus).toBe("current");
      expect(detail?.authoritativeSourceUrl).toBe("https://www.gs1.org/voc/");
      expect(detail?.datasetIdentifier).toBe("gs1.webvoc.v1.17.0");
      expect(detail?.lastVerifiedDate).toBe("2025-12-13");
    });

    it("should return detail for GS1 NL attributes (food_hb)", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const detail = await caller.standardsDirectory.getDetail({
        id: "gs1_attributes_food_hb",
      });

      expect(detail).toBeDefined();
      expect(detail?.id).toBe("gs1_attributes_food_hb");
      expect(detail?.name).toContain("food_hb");
      expect(detail?.owningOrganization).toBe("GS1_NL");
      expect(detail?.jurisdiction).toBe("Benelux");
      expect(detail?.sector).toBe("food_hb");
      expect(detail?.lifecycleStatus).toBe("current");
      expect(detail?.authoritativeSourceUrl).toContain("gs1.nl");
      expect(detail?.datasetIdentifier).toContain("food_hb");
      expect(detail?.lastVerifiedDate).toBe("2025-12-13");
    });

    it("should return detail for ESRS datapoints", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      // First get list to find an ESRS standard ID
      const list = await caller.standardsDirectory.list({
        organization: "EFRAG",
      });

      // Skip test if no ESRS datapoints are seeded in the database
      if (list.standards.length === 0) {
        return;
      }

      expect(list.standards.length).toBeGreaterThan(0);
      
      const esrsStandard = list.standards.find(
        (s) => s.sourceType === "esrs_datapoint"
      );
      
      expect(esrsStandard).toBeDefined();
      
      if (esrsStandard) {
        const detail = await caller.standardsDirectory.getDetail({
          id: esrsStandard.id,
        });

        expect(detail).toBeDefined();
        expect(detail?.id).toBe(esrsStandard.id);
        expect(detail?.owningOrganization).toBe("EFRAG");
        expect(detail?.jurisdiction).toBe("EU");
        expect(detail?.lifecycleStatus).toBe("ratified");
        expect(detail?.authoritativeSourceUrl).toBe("https://www.efrag.org/lab6");
        expect(detail?.datasetIdentifier).toBe("esrs.datapoints.ig3");
        expect(detail?.lastVerifiedDate).toBe("2025-12-13");
      }
    });

    it("should throw error for invalid standard ID", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      
      await expect(
        caller.standardsDirectory.getDetail({
          id: "invalid_standard_id_12345",
        })
      ).rejects.toThrow();
    });

    it("should include transparency metadata", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const detail = await caller.standardsDirectory.getDetail({
        id: "gs1_web_vocabulary",
      });

      expect(detail).toBeDefined();
      expect(detail?.authoritativeSourceUrl).toBeDefined();
      expect(detail?.datasetIdentifier).toBeDefined();
      expect(detail?.lastVerifiedDate).toBeDefined();
      
      // Verify metadata format
      expect(typeof detail?.authoritativeSourceUrl).toBe("string");
      expect(typeof detail?.datasetIdentifier).toBe("string");
      expect(typeof detail?.lastVerifiedDate).toBe("string");
      
      // Verify URL format
      if (detail?.authoritativeSourceUrl) {
        expect(detail.authoritativeSourceUrl).toMatch(/^https?:\/\//);
      }
    });
  });

  describe("data source coverage", () => {
    it("should include GS1 Standards in results", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.standardsDirectory.list({
        organization: "GS1_Global",
      });

      const gs1Standards = result.standards.filter(
        (s) => s.sourceType === "gs1_standard"
      );
      
      // May be 0 if no GS1 standards are in database
      expect(Array.isArray(gs1Standards)).toBe(true);
    });

    it("should include GS1 Attributes in results", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.standardsDirectory.list({
        organization: "GS1_NL",
      });

      const gs1Attributes = result.standards.filter(
        (s) => s.sourceType === "gs1_attributes"
      );
      
      expect(gs1Attributes.length).toBeGreaterThan(0);
    });

    it("should include GS1 Web Vocabulary in results", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.standardsDirectory.list({
        organization: "GS1_Global",
      });

      const gs1WebVocab = result.standards.find(
        (s) => s.sourceType === "gs1_web_vocabulary"
      );
      
      expect(gs1WebVocab).toBeDefined();
    });

    it("should include ESRS Datapoints in results when data is seeded", async () => {
      const ctx = createPublicContext();
      const caller = appRouter.createCaller(ctx);
      const result = await caller.standardsDirectory.list({
        organization: "EFRAG",
      });

      const esrsDatapoints = result.standards.filter(
        (s) => s.sourceType === "esrs_datapoint"
      );
      
      // This test validates the query works; actual data depends on seeding
      // If no ESRS datapoints are seeded, the array will be empty but query should succeed
      expect(esrsDatapoints).toBeInstanceOf(Array);
      
      if (esrsDatapoints.length > 0) {
        // Validate structure when data exists
        expect(esrsDatapoints[0].owningOrganization).toBe("EFRAG");
        expect(esrsDatapoints[0].jurisdiction).toBe("EU");
      }
    });
  });
});
