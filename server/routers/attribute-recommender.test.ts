/**
 * Attribute Recommender Router Tests
 * 
 * Tests for the AI-powered GS1 attribute recommendation feature:
 * - Get available sectors
 * - Get available regulations
 * - Get company size options
 * - Get sample attributes
 * - Generate recommendations
 */

import { describe, it, expect } from "vitest";
import { appRouter } from "../routers";
import type { Context } from "../_core/context";

// Mock public context
const mockPublicContext: Context = {
  user: null,
  req: {} as any,
  res: {} as any,
};

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

describe("Attribute Recommender Router", () => {
  describe("getAvailableSectors", () => {
    it("should return list of available sectors", async () => {
      const caller = appRouter.createCaller(mockPublicContext);
      const sectors = await caller.attributeRecommender.getAvailableSectors();

      expect(sectors).toBeInstanceOf(Array);
      expect(sectors.length).toBeGreaterThan(0);
      
      // Check structure
      const sector = sectors[0];
      expect(sector).toHaveProperty("id");
      expect(sector).toHaveProperty("name");
      expect(sector).toHaveProperty("description");
    });

    it("should include common sectors", async () => {
      const caller = appRouter.createCaller(mockPublicContext);
      const sectors = await caller.attributeRecommender.getAvailableSectors();

      const sectorIds = sectors.map((s) => s.id);
      expect(sectorIds).toContain("food_beverage");
      expect(sectorIds).toContain("retail");
      expect(sectorIds).toContain("manufacturing");
    });
  });

  describe("getAvailableRegulations", () => {
    it("should return list of available regulations", async () => {
      const caller = appRouter.createCaller(mockPublicContext);
      const regulations = await caller.attributeRecommender.getAvailableRegulations();

      expect(regulations).toBeInstanceOf(Array);
      expect(regulations.length).toBeGreaterThan(0);
      
      // Check structure
      const regulation = regulations[0];
      expect(regulation).toHaveProperty("id");
      expect(regulation).toHaveProperty("name");
      expect(regulation).toHaveProperty("shortName");
    });

    it("should include key EU regulations", async () => {
      const caller = appRouter.createCaller(mockPublicContext);
      const regulations = await caller.attributeRecommender.getAvailableRegulations();

      const regIds = regulations.map((r) => r.id);
      expect(regIds).toContain("CSRD");
      expect(regIds).toContain("DPP");
      expect(regIds).toContain("ESPR");
    });
  });

  describe("getCompanySizeOptions", () => {
    it("should return company size options", async () => {
      const caller = appRouter.createCaller(mockPublicContext);
      const sizes = await caller.attributeRecommender.getCompanySizeOptions();

      expect(sizes).toBeInstanceOf(Array);
      expect(sizes.length).toBe(3);
      
      const sizeIds = sizes.map((s) => s.id);
      expect(sizeIds).toContain("small");
      expect(sizeIds).toContain("medium");
      expect(sizeIds).toContain("large");
    });
  });

  describe("getSampleAttributes", () => {
    it("should return sample GS1 attributes", async () => {
      const caller = appRouter.createCaller(mockPublicContext);
      const attributes = await caller.attributeRecommender.getSampleAttributes();

      expect(attributes).toBeInstanceOf(Array);
      expect(attributes.length).toBeGreaterThan(0);
      
      // Check structure
      const attr = attributes[0];
      expect(attr).toHaveProperty("id");
      expect(attr).toHaveProperty("name");
      expect(attr).toHaveProperty("category");
    });

    it("should include core GS1 identifiers", async () => {
      const caller = appRouter.createCaller(mockPublicContext);
      const attributes = await caller.attributeRecommender.getSampleAttributes();

      const attrIds = attributes.map((a) => a.id);
      expect(attrIds).toContain("gtin");
      expect(attrIds).toContain("gln");
    });
  });

  describe("recommend", () => {
    it("should generate recommendations for valid input", async () => {
      const caller = appRouter.createCaller(mockPublicContext);
      
      const result = await caller.attributeRecommender.recommend({
        sector: "food_beverage",
        targetRegulations: ["CSRD", "DPP"],
        companySize: "medium",
      });

      expect(result).toBeDefined();
      expect(result).toHaveProperty("recommendations");
      expect(result).toHaveProperty("summary");
      expect(result).toHaveProperty("epistemic");
      
      expect(result.recommendations).toBeInstanceOf(Array);
    }, 30000); // Increase timeout for AI call

    it("should include confidence scoring in recommendations", async () => {
      const caller = appRouter.createCaller(mockPublicContext);
      
      const result = await caller.attributeRecommender.recommend({
        sector: "retail",
      });

      expect(result.recommendations).toBeInstanceOf(Array);
      
      if (result.recommendations.length > 0) {
        const rec = result.recommendations[0];
        expect(rec).toHaveProperty("confidenceScore");
        expect(rec).toHaveProperty("confidenceLevel");
        expect(rec).toHaveProperty("epistemic");
      }
    }, 30000);

    it("should include epistemic markers", async () => {
      const caller = appRouter.createCaller(mockPublicContext);
      
      const result = await caller.attributeRecommender.recommend({
        sector: "electronics",
        targetRegulations: ["WEEE"],
      });

      expect(result.epistemic).toBeDefined();
      expect(result.epistemic).toHaveProperty("status");
      expect(result.epistemic).toHaveProperty("confidence");
    }, 30000);
  });
});
