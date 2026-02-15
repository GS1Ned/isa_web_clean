/**
 * Tests for GS1 Mapping Engine
 */

import { describe, it, expect, beforeAll } from "vitest";
import {
  mapRegulationToStandards,
  saveMappings,
  getMappingsForRegulation,
} from "./gs1-mapping-engine";
import { getDb } from "./db";
import { regulations, gs1Standards } from "../drizzle/schema";
import { eq } from "drizzle-orm";

describe("GS1 Mapping Engine", () => {
  describe("mapRegulationToStandards", () => {
    it("should map CSRD regulation to sustainability standards", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Find a CSRD regulation
      const csrdRegulations = await db
        .select()
        .from(regulations)
        .where(eq(regulations.regulationType, "CSRD"))
        .limit(1);

      if (csrdRegulations.length === 0) {
        return;
      }

      const regulation = csrdRegulations[0];
      const mappings = await mapRegulationToStandards(regulation.id);

      // CSRD should map to sustainability-related standards
      expect(mappings.length).toBeGreaterThan(0);
      expect(
        mappings.some(m => m.standardCode.includes("Sustainability"))
      ).toBe(true);
    });

    it("should map DPP regulation to Digital Link and QR Code standards", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Find a DPP regulation
      const dppRegulations = await db
        .select()
        .from(regulations)
        .where(eq(regulations.regulationType, "DPP"))
        .limit(1);

      if (dppRegulations.length === 0) {
        return;
      }

      const regulation = dppRegulations[0];
      const mappings = await mapRegulationToStandards(regulation.id);

      // DPP should map to Digital Link, QR Code, and related standards
      expect(mappings.length).toBeGreaterThan(0);
      const standardCodes = mappings.map(m => m.standardCode);
      expect(
        standardCodes.some(
          code => code === "GS1_Digital_Link" || code === "GS1_QR_Code"
        )
      ).toBe(true);
    });

    it("should map EUDR regulation to traceability standards", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Find an EUDR regulation
      const eudrRegulations = await db
        .select()
        .from(regulations)
        .where(eq(regulations.regulationType, "EUDR"))
        .limit(1);

      if (eudrRegulations.length === 0) {
        return;
      }

      const regulation = eudrRegulations[0];
      const mappings = await mapRegulationToStandards(regulation.id);

      // EUDR should map to EPCIS, Origin Information, and traceability standards
      expect(mappings.length).toBeGreaterThan(0);
      const standardCodes = mappings.map(m => m.standardCode);
      expect(
        standardCodes.some(
          code => code === "EPCIS" || code === "GS1_Origin_Information"
        )
      ).toBe(true);
    });

    it("should map PPWR regulation to packaging standards", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Find a PPWR regulation
      const ppwrRegulations = await db
        .select()
        .from(regulations)
        .where(eq(regulations.regulationType, "PPWR"))
        .limit(1);

      if (ppwrRegulations.length === 0) {
        return;
      }

      const regulation = ppwrRegulations[0];
      const mappings = await mapRegulationToStandards(regulation.id);

      // PPWR should map to packaging-related standards
      expect(mappings.length).toBeGreaterThan(0);
      const standardCodes = mappings.map(m => m.standardCode);
      expect(
        standardCodes.some(
          code =>
            code === "GS1_Packaging_Attributes" ||
            code === "GS1_Circular_Economy_Attributes"
        )
      ).toBe(true);
    });

    it("should return mappings sorted by relevance score", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const allRegulations = await db.select().from(regulations).limit(1);
      if (allRegulations.length === 0) return;

      const mappings = await mapRegulationToStandards(allRegulations[0].id);

      if (mappings.length > 1) {
        // Check that mappings are sorted in descending order
        for (let i = 0; i < mappings.length - 1; i++) {
          expect(mappings[i].relevanceScore).toBeGreaterThanOrEqual(
            mappings[i + 1].relevanceScore
          );
        }
      }
    });

    it("should only return standards with relevance > 0.3", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const allRegulations = await db.select().from(regulations).limit(1);
      if (allRegulations.length === 0) return;

      const mappings = await mapRegulationToStandards(allRegulations[0].id);

      // All returned mappings should have relevance > 0.3
      for (const mapping of mappings) {
        expect(mapping.relevanceScore).toBeGreaterThan(0.3);
      }
    });

    it("should include mapping reason for each standard", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const allRegulations = await db.select().from(regulations).limit(1);
      if (allRegulations.length === 0) return;

      const mappings = await mapRegulationToStandards(allRegulations[0].id);

      // All mappings should have a reason
      for (const mapping of mappings) {
        expect(mapping.mappingReason).toBeDefined();
        expect(mapping.mappingReason.length).toBeGreaterThan(0);
      }
    });
  });

  describe("saveMappings and getMappingsForRegulation", () => {
    it("should save and retrieve mappings correctly", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const allRegulations = await db.select().from(regulations).limit(1);
      if (allRegulations.length === 0) return;

      const regulationId = allRegulations[0].id;

      // Generate mappings
      const mappings = await mapRegulationToStandards(regulationId);

      // Save mappings
      await saveMappings(regulationId, mappings);

      // Retrieve mappings
      const retrievedMappings = await getMappingsForRegulation(regulationId);

      // Should have same number of mappings
      expect(retrievedMappings.length).toBe(mappings.length);

      // Check that standard codes match
      const originalCodes = mappings.map(m => m.standardCode).sort();
      const retrievedCodes = retrievedMappings.map(m => m.standardCode).sort();
      expect(retrievedCodes).toEqual(originalCodes);
    });

    it("should replace existing mappings when saving", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const allRegulations = await db.select().from(regulations).limit(1);
      if (allRegulations.length === 0) return;

      const regulationId = allRegulations[0].id;

      // Generate and save mappings first time
      const mappings1 = await mapRegulationToStandards(regulationId);
      await saveMappings(regulationId, mappings1);

      // Generate and save mappings second time
      const mappings2 = await mapRegulationToStandards(regulationId);
      await saveMappings(regulationId, mappings2);

      // Should only have mappings from second save
      const retrievedMappings = await getMappingsForRegulation(regulationId);
      expect(retrievedMappings.length).toBe(mappings2.length);
    });
  });

  describe("Keyword matching", () => {
    it("should detect traceability keywords", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Find regulations with "traceability" in title or description
      const allRegulations = await db.select().from(regulations);
      const traceabilityRegulations = allRegulations.filter(
        r =>
          r.title.toLowerCase().includes("traceability") ||
          (r.description &&
            r.description.toLowerCase().includes("traceability"))
      );

      if (traceabilityRegulations.length === 0) {
        return;
      }

      const mappings = await mapRegulationToStandards(
        traceabilityRegulations[0].id
      );

      // Should map to EPCIS or other traceability standards
      const standardCodes = mappings.map(m => m.standardCode);
      expect(
        standardCodes.some(
          code => code === "EPCIS" || code === "GS1_Track_and_Trace"
        )
      ).toBe(true);
    });

    it("should detect packaging keywords", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Find regulations with "packaging" in title or description
      const allRegulations = await db.select().from(regulations);
      const packagingRegulations = allRegulations.filter(
        r =>
          r.title.toLowerCase().includes("packaging") ||
          (r.description && r.description.toLowerCase().includes("packaging"))
      );

      if (packagingRegulations.length === 0) {
        return;
      }

      const mappings = await mapRegulationToStandards(
        packagingRegulations[0].id
      );

      // Should map to packaging standards
      const standardCodes = mappings.map(m => m.standardCode);
      expect(standardCodes.some(code => code.includes("Packaging"))).toBe(true);
    });
  });

  describe("GS1 Standards catalog", () => {
    it("should have standards in database", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const standards = await db.select().from(gs1Standards);

      expect(standards.length).toBeGreaterThan(0);
      expect(standards.length).toBeGreaterThanOrEqual(20); // Should have at least 20 standards
    });

    it("should have key identification standards", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const standards = await db.select().from(gs1Standards);
      const standardCodes = standards.map(s => s.standardCode);

      // Check for key identification standards
      expect(standardCodes).toContain("GTIN");
      expect(standardCodes).toContain("GLN");
      expect(standardCodes).toContain("SSCC");
    });

    it("should have key traceability standards", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const standards = await db.select().from(gs1Standards);
      const standardCodes = standards.map(s => s.standardCode);

      // Check for key traceability standards
      expect(standardCodes).toContain("EPCIS");
      expect(standardCodes).toContain("GS1_Digital_Link");
    });

    it("should have sustainability-related standards", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const standards = await db.select().from(gs1Standards);
      const standardCodes = standards.map(s => s.standardCode);

      // Check for sustainability standards
      expect(
        standardCodes.some(
          code =>
            code.includes("Sustainability") || code.includes("Circular_Economy")
        )
      ).toBe(true);
    });

    it("should have all standards with required fields", async () => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const standards = await db.select().from(gs1Standards);

      for (const standard of standards) {
        expect(standard.standardCode).toBeDefined();
        expect(standard.standardCode.length).toBeGreaterThan(0);
        expect(standard.standardName).toBeDefined();
        expect(standard.standardName.length).toBeGreaterThan(0);
        expect(standard.category).toBeDefined();
      }
    });
  });
});
