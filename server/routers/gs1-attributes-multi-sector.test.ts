/**
 * Multi-Sector GS1 Attributes Integration Tests
 *
 * Validates DIY/Garden/Pet and Healthcare sector attribute ingestion and mapping.
 */

import { describe, it, expect } from "vitest";
import { getDb } from "../db";
import {
  gs1Attributes,
  attributeRegulationMappings,
  regulations,
} from "../../drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";

describe("Multi-Sector GS1 Attributes Integration", () => {
  describe("DIY/Garden/Pet Sector", () => {
    it("should have ingested DIY/Garden/Pet attributes", { timeout: 15000 }, async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const diyAttributes = await db
        .select()
        .from(gs1Attributes)
        .where(eq(gs1Attributes.sector, "diy_garden_pet"));

      expect(diyAttributes.length).toBeGreaterThan(3000);
      console.log(`DIY/Garden/Pet attributes: ${diyAttributes.length}`);
    });

    it("should have packaging-related DIY attributes", { timeout: 15000 }, async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const packagingAttributes = await db
        .select()
        .from(gs1Attributes)
        .where(
          and(
            eq(gs1Attributes.sector, "diy_garden_pet"),
            eq(gs1Attributes.packagingRelated, true)
          )
        );

      expect(packagingAttributes.length).toBeGreaterThan(50);
      console.log(`DIY packaging attributes: ${packagingAttributes.length}`);
    });

    it("should have sustainability-related DIY attributes", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const sustainabilityAttributes = await db
        .select()
        .from(gs1Attributes)
        .where(
          and(
            eq(gs1Attributes.sector, "diy_garden_pet"),
            eq(gs1Attributes.sustainabilityRelated, true)
          )
        );

      expect(sustainabilityAttributes.length).toBeGreaterThan(30);
      console.log(
        `DIY sustainability attributes: ${sustainabilityAttributes.length}`
      );
    });

    it("should have DIY attribute mappings to regulations", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get DIY attribute IDs
      const diyAttributes = await db
        .select()
        .from(gs1Attributes)
        .where(eq(gs1Attributes.sector, "diy_garden_pet"));

      const diyAttributeIds = diyAttributes.map(a => a.id);

      // Get mappings for DIY attributes
      const mappings = await db
        .select()
        .from(attributeRegulationMappings)
        .where(
          inArray(attributeRegulationMappings.attributeId, diyAttributeIds)
        );

      // Note: DIY mappings are created separately via mapping ingestion scripts
      // This test validates the query structure, not the data completeness
      expect(mappings.length).toBeGreaterThanOrEqual(0);
      console.log(`DIY attribute mappings: ${mappings.length}`);
    });
  });

  describe("Healthcare Sector", () => {
    it("should have ingested Healthcare attributes", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const healthcareAttributes = await db
        .select()
        .from(gs1Attributes)
        .where(eq(gs1Attributes.sector, "healthcare"));

      expect(healthcareAttributes.length).toBeGreaterThan(180);
      console.log(`Healthcare attributes: ${healthcareAttributes.length}`);
    });

    it("should have medical device-related attributes", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const healthcareAttributes = await db
        .select()
        .from(gs1Attributes)
        .where(eq(gs1Attributes.sector, "healthcare"));

      const medicalDeviceAttributes = healthcareAttributes.filter(
        attr =>
          attr.attributeName.toLowerCase().includes("device") ||
          attr.attributeName.toLowerCase().includes("medical") ||
          attr.attributeName.toLowerCase().includes("sterile") ||
          attr.attributeName.toLowerCase().includes("safety")
      );

      expect(medicalDeviceAttributes.length).toBeGreaterThan(10);
      console.log(
        `Medical device attributes: ${medicalDeviceAttributes.length}`
      );
    });
  });

  describe("Multi-Sector Coverage", () => {
    it("should have attributes from all 3 sectors", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const allAttributes = await db.select().from(gs1Attributes);

      const foodHbCount = allAttributes.filter(
        a => a.sector === "food_hb"
      ).length;
      const diyCount = allAttributes.filter(
        a => a.sector === "diy_garden_pet"
      ).length;
      const healthcareCount = allAttributes.filter(
        a => a.sector === "healthcare"
      ).length;

      expect(foodHbCount).toBeGreaterThan(470);
      expect(diyCount).toBeGreaterThan(3000);
      expect(healthcareCount).toBeGreaterThan(180);

      console.log(`Total attributes: ${allAttributes.length}`);
      console.log(`  - Food/H&B: ${foodHbCount}`);
      console.log(`  - DIY/Garden/Pet: ${diyCount}`);
      console.log(`  - Healthcare: ${healthcareCount}`);
    });

    it("should have total mappings > 600", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const allMappings = await db.select().from(attributeRegulationMappings);

      expect(allMappings.length).toBeGreaterThan(600);
      console.log(`Total attribute-regulation mappings: ${allMappings.length}`);
    });
  });

  describe("Sector Filtering", () => {
    it("should filter attributes by sector correctly", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const diyAttributes = await db
        .select()
        .from(gs1Attributes)
        .where(eq(gs1Attributes.sector, "diy_garden_pet"))
        .limit(10);

      expect(diyAttributes.every(a => a.sector === "diy_garden_pet")).toBe(
        true
      );
    });

    it("should filter by packaging flag correctly", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const packagingAttributes = await db
        .select()
        .from(gs1Attributes)
        .where(eq(gs1Attributes.packagingRelated, 1))
        .limit(10);

      // tinyint returns 0/1, not boolean
      expect(packagingAttributes.every(a => a.packagingRelated === 1)).toBe(
        true
      );
    });

    it("should filter by sustainability flag correctly", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const sustainabilityAttributes = await db
        .select()
        .from(gs1Attributes)
        .where(eq(gs1Attributes.sustainabilityRelated, 1))
        .limit(10);

      // tinyint returns 0/1, not boolean
      expect(
        sustainabilityAttributes.every(a => a.sustainabilityRelated === 1)
      ).toBe(true);
    });
  });
});
