/**
 * Standards Directory Router Tests
 * 
 * Priority 3: Standards Discovery UI
 * 
 * Tests verify:
 * - Deterministic listing without interpretation
 * - Filtering by organization, jurisdiction, sector, lifecycle status
 * - Detail view returns authoritative metadata
 * - No reasoning or cross-standard relationships
 */

import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

describe("Standards Directory Router", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(async () => {
    // Create test caller without authentication (public procedures)
    const ctx: TrpcContext = {
      user: null,
      req: {
        protocol: "https",
        headers: {},
      } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    };
    caller = appRouter.createCaller(ctx);
  });

  describe("list procedure", () => {
    it("should return standards without filters", async () => {
      const result = await caller.standardsDirectory.list({});

      expect(result).toBeDefined();
      expect(result.standards).toBeInstanceOf(Array);
      expect(result.total).toBeGreaterThanOrEqual(0);
      expect(result.total).toBe(result.standards.length);
    });

    it("should filter by organization", async () => {
      const result = await caller.standardsDirectory.list({
        organization: "GS1_NL",
      });

      expect(result).toBeDefined();
      expect(result.standards).toBeInstanceOf(Array);
      
      // All results should match the filter
      for (const standard of result.standards) {
        expect(standard.owningOrganization).toBe("GS1_NL");
      }
    });

    it("should filter by jurisdiction", async () => {
      const result = await caller.standardsDirectory.list({
        jurisdiction: "EU",
      });

      expect(result).toBeDefined();
      expect(result.standards).toBeInstanceOf(Array);
      
      // All results should match the filter
      for (const standard of result.standards) {
        expect(standard.jurisdiction).toBe("EU");
      }
    });

    it("should filter by sector", async () => {
      const result = await caller.standardsDirectory.list({
        sector: "DIY",
      });

      expect(result).toBeDefined();
      expect(result.standards).toBeInstanceOf(Array);
      
      // All results should match the filter (or have null sector for cross-sector standards)
      for (const standard of result.standards) {
        if (standard.sector !== null) {
          expect(standard.sector).toBe("DIY");
        }
      }
    });

    it("should filter by lifecycle status", async () => {
      const result = await caller.standardsDirectory.list({
        lifecycleStatus: "ratified",
      });

      expect(result).toBeDefined();
      expect(result.standards).toBeInstanceOf(Array);
      
      // All results should match the filter
      for (const standard of result.standards) {
        if (standard.lifecycleStatus !== null) {
          expect(standard.lifecycleStatus).toBe("ratified");
        }
      }
    });

    it("should search by name or code", async () => {
      const result = await caller.standardsDirectory.list({
        search: "GS1",
      });

      expect(result).toBeDefined();
      expect(result.standards).toBeInstanceOf(Array);
      
      // All results should contain the search term in name or ID
      for (const standard of result.standards) {
        const matchesSearch = 
          standard.name.toLowerCase().includes("gs1") ||
          standard.id.toLowerCase().includes("gs1");
        expect(matchesSearch).toBe(true);
      }
    });

    it("should return standards with required fields", async () => {
      const result = await caller.standardsDirectory.list({});

      expect(result).toBeDefined();
      
      if (result.standards.length > 0) {
        const standard = result.standards[0];
        
        // Required fields
        expect(standard.id).toBeDefined();
        expect(typeof standard.id).toBe("string");
        expect(standard.name).toBeDefined();
        expect(typeof standard.name).toBe("string");
        expect(standard.owningOrganization).toBeDefined();
        expect(typeof standard.owningOrganization).toBe("string");
        expect(standard.jurisdiction).toBeDefined();
        expect(typeof standard.jurisdiction).toBe("string");
        expect(standard.sourceType).toBeDefined();
        expect(["gs1_standard", "gs1_attributes", "gs1_web_vocabulary", "esrs_datapoint"]).toContain(standard.sourceType);
        
        // Optional fields
        if (standard.sector !== null) {
          expect(typeof standard.sector).toBe("string");
        }
        if (standard.lifecycleStatus !== null) {
          expect(typeof standard.lifecycleStatus).toBe("string");
        }
        if (standard.recordCount !== undefined) {
          expect(typeof standard.recordCount).toBe("number");
          expect(standard.recordCount).toBeGreaterThan(0);
        }
      }
    });

    it("should combine multiple filters", async () => {
      const result = await caller.standardsDirectory.list({
        organization: "GS1_NL",
        jurisdiction: "Benelux",
      });

      expect(result).toBeDefined();
      expect(result.standards).toBeInstanceOf(Array);
      
      // All results should match both filters
      for (const standard of result.standards) {
        expect(standard.owningOrganization).toBe("GS1_NL");
        expect(standard.jurisdiction).toBe("Benelux");
      }
    });
  });

  describe("getDetail procedure", () => {
    it("should return detail for GS1 standard", async () => {
      // First get a list to find a valid ID
      const listResult = await caller.standardsDirectory.list({});
      
      if (listResult.standards.length === 0) {
        // Skip test if no data
        return;
      }

      const standardId = listResult.standards.find(s => s.sourceType === "gs1_standard")?.id;
      
      if (!standardId) {
        // Skip if no GS1 standard found
        return;
      }

      const detail = await caller.standardsDirectory.getDetail({
        id: standardId,
      });

      expect(detail).toBeDefined();
      expect(detail.id).toBe(standardId);
      expect(detail.name).toBeDefined();
      expect(detail.owningOrganization).toBeDefined();
      expect(detail.jurisdiction).toBeDefined();
      
      // Transparency metadata (may be null)
      expect(detail).toHaveProperty("authoritativeSourceUrl");
      expect(detail).toHaveProperty("datasetIdentifier");
      expect(detail).toHaveProperty("lastVerifiedDate");
    });

    it("should return detail for GS1 attributes", async () => {
      const listResult = await caller.standardsDirectory.list({
        organization: "GS1_NL",
      });
      
      if (listResult.standards.length === 0) {
        return;
      }

      const attributesId = listResult.standards.find(s => s.sourceType === "gs1_attributes")?.id;
      
      if (!attributesId) {
        return;
      }

      const detail = await caller.standardsDirectory.getDetail({
        id: attributesId,
      });

      expect(detail).toBeDefined();
      expect(detail.id).toBe(attributesId);
      expect(detail.name).toContain("GS1 Data Source");
      expect(detail.owningOrganization).toBe("GS1_NL");
      expect(detail.jurisdiction).toBe("Benelux");
      expect(detail.sector).toBeDefined();
      expect(detail.recordCount).toBeGreaterThan(0);
    });

    it("should return detail for ESRS datapoints", async () => {
      const listResult = await caller.standardsDirectory.list({
        organization: "EFRAG",
      });
      
      if (listResult.standards.length === 0) {
        return;
      }

      const esrsId = listResult.standards.find(s => s.sourceType === "esrs_datapoint")?.id;
      
      if (!esrsId) {
        return;
      }

      const detail = await caller.standardsDirectory.getDetail({
        id: esrsId,
      });

      expect(detail).toBeDefined();
      expect(detail.id).toBe(esrsId);
      expect(detail.name).toContain("Datapoints");
      expect(detail.owningOrganization).toBe("EFRAG");
      expect(detail.jurisdiction).toBe("EU");
      expect(detail.recordCount).toBeGreaterThan(0);
    });

    it("should throw error for invalid ID", async () => {
      await expect(
        caller.standardsDirectory.getDetail({
          id: "invalid_id_format",
        })
      ).rejects.toThrow();
    });

    it("should return transparency metadata fields", async () => {
      const listResult = await caller.standardsDirectory.list({});
      
      if (listResult.standards.length === 0) {
        return;
      }

      const standardId = listResult.standards[0].id;
      const detail = await caller.standardsDirectory.getDetail({
        id: standardId,
      });

      // Verify transparency metadata structure
      expect(detail).toHaveProperty("authoritativeSourceUrl");
      expect(detail).toHaveProperty("datasetIdentifier");
      expect(detail).toHaveProperty("lastVerifiedDate");
      
      // If present, verify types
      if (detail.authoritativeSourceUrl !== null) {
        expect(typeof detail.authoritativeSourceUrl).toBe("string");
        expect(detail.authoritativeSourceUrl).toMatch(/^https?:\/\//);
      }
      if (detail.datasetIdentifier !== null) {
        expect(typeof detail.datasetIdentifier).toBe("string");
      }
      if (detail.lastVerifiedDate !== null) {
        expect(typeof detail.lastVerifiedDate).toBe("string");
      }
    });
  });

  describe("deterministic behavior", () => {
    it("should return consistent results for same query", async () => {
      const result1 = await caller.standardsDirectory.list({
        organization: "GS1_Global",
      });
      const result2 = await caller.standardsDirectory.list({
        organization: "GS1_Global",
      });

      expect(result1.total).toBe(result2.total);
      expect(result1.standards.length).toBe(result2.standards.length);
      
      // Results should be identical
      for (let i = 0; i < result1.standards.length; i++) {
        expect(result1.standards[i].id).toBe(result2.standards[i].id);
        expect(result1.standards[i].name).toBe(result2.standards[i].name);
      }
    });

    it("should not include interpretation or reasoning fields", async () => {
      const result = await caller.standardsDirectory.list({});

      for (const standard of result.standards) {
        // Should NOT have these fields (interpretation/reasoning)
        expect(standard).not.toHaveProperty("relevanceScore");
        expect(standard).not.toHaveProperty("recommendation");
        expect(standard).not.toHaveProperty("relatedStandards");
        expect(standard).not.toHaveProperty("applicabilityAnalysis");
        expect(standard).not.toHaveProperty("comparisonScore");
      }
    });

    it("should not include cross-standard relationships", async () => {
      const listResult = await caller.standardsDirectory.list({});
      
      if (listResult.standards.length === 0) {
        return;
      }

      const standardId = listResult.standards[0].id;
      const detail = await caller.standardsDirectory.getDetail({
        id: standardId,
      });

      // Should NOT have relationship fields
      expect(detail).not.toHaveProperty("relatedStandards");
      expect(detail).not.toHaveProperty("supersedes");
      expect(detail).not.toHaveProperty("supersededBy");
      expect(detail).not.toHaveProperty("dependencies");
      expect(detail).not.toHaveProperty("similarStandards");
    });
  });
});
