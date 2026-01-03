/**
 * GS1 Attributes Router Tests
 *
 * Tests for GS1 Data Source Benelux attributes and Web Vocabulary procedures.
 */

import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "../routers";
import type { Context } from "../_core/context";
import { getDb } from "../db";

// Mock context for testing
const mockContext: Context = {
  user: null,
  req: {} as any,
  res: {} as any,
};

const caller = appRouter.createCaller(mockContext);

describe("GS1 Attributes Router", () => {
  beforeAll(async () => {
    // Ensure database is available
    const db = await getDb();
    expect(db).toBeDefined();
  });

  describe("getAttributeStats", () => {
    it("should return GS1 attribute statistics", async () => {
      const stats = await caller.gs1Attributes.getAttributeStats();

      expect(stats).toBeDefined();
      expect(stats.totalAttributes).toBeGreaterThan(0);
      expect(stats.packagingAttributes).toBeGreaterThanOrEqual(0);
      expect(stats.sustainabilityAttributes).toBeGreaterThanOrEqual(0);
      expect(stats.sectorBreakdown).toBeDefined();
      expect(stats.sectorBreakdown.food_hb).toBeGreaterThan(0); // We ingested Food/H&B
      expect(stats.webVocabulary).toBeDefined();
      expect(stats.webVocabulary.totalTerms).toBeGreaterThan(0);
      expect(stats.totalMappings).toBeGreaterThan(0);
    });

    it("should have correct web vocabulary breakdown", async () => {
      const stats = await caller.gs1Attributes.getAttributeStats();

      expect(stats.webVocabulary.classes).toBeGreaterThan(0);
      expect(stats.webVocabulary.properties).toBeGreaterThan(0);
      expect(stats.webVocabulary.dppRelevant).toBeGreaterThan(0);
      expect(stats.webVocabulary.esrsRelevant).toBeGreaterThan(0);
      expect(stats.webVocabulary.eudrRelevant).toBeGreaterThan(0);
    });
  });

  describe("getAllAttributes", () => {
    it("should return all attributes without filters", async () => {
      const attributes = await caller.gs1Attributes.getAllAttributes({});

      expect(attributes).toBeDefined();
      expect(Array.isArray(attributes)).toBe(true);
      expect(attributes.length).toBeGreaterThan(0);
      expect(attributes.length).toBeLessThanOrEqual(100); // Default limit
    });

    it("should filter by sector", async () => {
      const attributes = await caller.gs1Attributes.getAllAttributes({
        sector: "food_hb",
      });

      expect(attributes).toBeDefined();
      expect(attributes.every(attr => attr.sector === "food_hb")).toBe(true);
    });

    it("should filter by packaging-related flag", async () => {
      const attributes = await caller.gs1Attributes.getAllAttributes({
        packagingRelated: true,
      });

      expect(attributes).toBeDefined();
      expect(attributes.every(attr => attr.packagingRelated == 1 || attr.packagingRelated === true)).toBe(
        true
      );
    });

    it("should filter by sustainability-related flag", async () => {
      const attributes = await caller.gs1Attributes.getAllAttributes({
        sustainabilityRelated: true,
      });

      expect(attributes).toBeDefined();
      expect(
        attributes.every(attr => attr.sustainabilityRelated == 1 || attr.sustainabilityRelated === true)
      ).toBe(true);
    });

    it("should respect limit parameter", async () => {
      const attributes = await caller.gs1Attributes.getAllAttributes({
        limit: 10,
      });

      expect(attributes).toBeDefined();
      expect(attributes.length).toBeLessThanOrEqual(10);
    });
  });

  describe("getAttributesByRegulation", () => {
    it("should return attributes for PPWR regulation", async () => {
      // PPWR should have packaging-related attributes
      const db = await getDb();
      const [ppwr] = await db!
        .select()
        .from((await import("../../drizzle/schema")).regulations)
        .where(
          (await import("drizzle-orm")).eq(
            (await import("../../drizzle/schema")).regulations.regulationType,
            "PPWR"
          )
        )
        .limit(1);

      if (ppwr) {
        const attributes = await caller.gs1Attributes.getAttributesByRegulation(
          {
            regulationId: ppwr.id,
          }
        );

        expect(attributes).toBeDefined();
        expect(Array.isArray(attributes)).toBe(true);

        if (attributes.length > 0) {
          // Verify attribute structure
          const attr = attributes[0];
          expect(attr).toHaveProperty("attributeName");
          expect(attr).toHaveProperty("attributeCode");
          expect(attr).toHaveProperty("mappingReason");
          expect(attr).toHaveProperty("relevanceScore");
          expect(attr).toHaveProperty("codeLists");
        }
      }
    });

    it("should return attributes for DPP regulation", async () => {
      const db = await getDb();
      const [dpp] = await db!
        .select()
        .from((await import("../../drizzle/schema")).regulations)
        .where(
          (await import("drizzle-orm")).eq(
            (await import("../../drizzle/schema")).regulations.regulationType,
            "DPP"
          )
        )
        .limit(1);

      if (dpp) {
        const attributes = await caller.gs1Attributes.getAttributesByRegulation(
          {
            regulationId: dpp.id,
          }
        );

        expect(attributes).toBeDefined();
        expect(Array.isArray(attributes)).toBe(true);
      }
    });

    it("should filter by sector when specified", async () => {
      const db = await getDb();
      const [regulation] = await db!
        .select()
        .from((await import("../../drizzle/schema")).regulations)
        .limit(1);

      if (regulation) {
        const attributes = await caller.gs1Attributes.getAttributesByRegulation(
          {
            regulationId: regulation.id,
            sector: "food_hb",
          }
        );

        expect(attributes).toBeDefined();
        expect(attributes.every(attr => attr.sector === "food_hb")).toBe(true);
      }
    });
  });

  describe("getWebVocabularyByRegulation", () => {
    it("should return DPP-relevant terms for DPP regulation", async () => {
      const db = await getDb();
      const [dpp] = await db!
        .select()
        .from((await import("../../drizzle/schema")).regulations)
        .where(
          (await import("drizzle-orm")).eq(
            (await import("../../drizzle/schema")).regulations.regulationType,
            "DPP"
          )
        )
        .limit(1);

      if (dpp) {
        const terms = await caller.gs1Attributes.getWebVocabularyByRegulation({
          regulationId: dpp.id,
        });

        expect(terms).toBeDefined();
        expect(Array.isArray(terms)).toBe(true);

        if (terms.length > 0) {
          // All terms should be DPP-relevant
          expect(terms.every(t => t.dppRelevant == 1 || t.dppRelevant === true)).toBe(true);
          // No deprecated terms
          expect(terms.every(t => t.isDeprecated == 0 || t.isDeprecated === false)).toBe(true);
        }
      }
    });

    it("should return ESRS-relevant terms for ESRS regulation", async () => {
      const db = await getDb();
      const [esrs] = await db!
        .select()
        .from((await import("../../drizzle/schema")).regulations)
        .where(
          (await import("drizzle-orm")).eq(
            (await import("../../drizzle/schema")).regulations.regulationType,
            "ESRS"
          )
        )
        .limit(1);

      if (esrs) {
        const terms = await caller.gs1Attributes.getWebVocabularyByRegulation({
          regulationId: esrs.id,
        });

        expect(terms).toBeDefined();
        expect(Array.isArray(terms)).toBe(true);

        if (terms.length > 0) {
          expect(terms.every(t => t.esrsRelevant == 1 || t.esrsRelevant === true)).toBe(true);
        }
      }
    });

    it("should return EUDR-relevant terms for EUDR regulation", async () => {
      const db = await getDb();
      const [eudr] = await db!
        .select()
        .from((await import("../../drizzle/schema")).regulations)
        .where(
          (await import("drizzle-orm")).eq(
            (await import("../../drizzle/schema")).regulations.regulationType,
            "EUDR"
          )
        )
        .limit(1);

      if (eudr) {
        const terms = await caller.gs1Attributes.getWebVocabularyByRegulation({
          regulationId: eudr.id,
        });

        expect(terms).toBeDefined();
        expect(Array.isArray(terms)).toBe(true);

        if (terms.length > 0) {
          expect(terms.every(t => t.eudrRelevant == 1 || t.eudrRelevant === true)).toBe(true);
        }
      }
    });

    it("should filter by term type when specified", async () => {
      const db = await getDb();
      const [regulation] = await db!
        .select()
        .from((await import("../../drizzle/schema")).regulations)
        .limit(1);

      if (regulation) {
        const properties =
          await caller.gs1Attributes.getWebVocabularyByRegulation({
            regulationId: regulation.id,
            termType: "property",
          });

        expect(properties).toBeDefined();
        expect(properties.every(t => t.termType === "property")).toBe(true);

        const classes = await caller.gs1Attributes.getWebVocabularyByRegulation(
          {
            regulationId: regulation.id,
            termType: "class",
          }
        );

        expect(classes).toBeDefined();
        expect(classes.every(t => t.termType === "class")).toBe(true);
      }
    });
  });
});
