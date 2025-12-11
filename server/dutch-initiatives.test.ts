import { describe, it, expect } from "vitest";
import {
  getDutchInitiatives,
  getDutchInitiativeWithMappings,
  getDutchInitiativeSectors,
} from "./db";

describe("Dutch Initiatives Database Functions", () => {
  describe("getDutchInitiatives", () => {
    it("should return all Dutch initiatives without filters", async () => {
      const initiatives = await getDutchInitiatives();

      expect(Array.isArray(initiatives)).toBe(true);
      expect(initiatives.length).toBeGreaterThan(0);

      // Verify structure of first initiative
      if (initiatives.length > 0) {
        const initiative = initiatives[0];
        expect(initiative).toHaveProperty("id");
        expect(initiative).toHaveProperty("shortName");
        expect(initiative).toHaveProperty("sector");
        expect(initiative).toHaveProperty("status");
        expect(initiative).toHaveProperty("initiativeType");
      }
    });

    it("should filter initiatives by sector", async () => {
      const initiatives = await getDutchInitiatives({ sector: "Textiles" });

      expect(Array.isArray(initiatives)).toBe(true);

      // All returned initiatives should be in Textiles sector
      initiatives.forEach(initiative => {
        expect(initiative.sector).toBe("Textiles");
      });
    });

    it("should filter initiatives by status", async () => {
      const initiatives = await getDutchInitiatives({ status: "Active" });

      expect(Array.isArray(initiatives)).toBe(true);

      // All returned initiatives should have Active status
      initiatives.forEach(initiative => {
        expect(initiative.status).toBe("Active");
      });
    });

    it("should filter initiatives by both sector and status", async () => {
      const initiatives = await getDutchInitiatives({
        sector: "Textiles",
        status: "Active",
      });

      expect(Array.isArray(initiatives)).toBe(true);

      // All returned initiatives should match both filters
      initiatives.forEach(initiative => {
        expect(initiative.sector).toBe("Textiles");
        expect(initiative.status).toBe("Active");
      });
    });

    it("should return empty array for non-existent sector", async () => {
      const initiatives = await getDutchInitiatives({
        sector: "NonExistentSector",
      });

      expect(Array.isArray(initiatives)).toBe(true);
      expect(initiatives.length).toBe(0);
    });
  });

  describe("getDutchInitiativeWithMappings", () => {
    it("should return initiative with regulation and standard mappings", async () => {
      // First get an initiative ID
      const initiatives = await getDutchInitiatives();
      expect(initiatives.length).toBeGreaterThan(0);

      const initiativeId = initiatives[0].id;
      const result = await getDutchInitiativeWithMappings(initiativeId);

      expect(result).not.toBeNull();
      expect(result).toHaveProperty("initiative");
      expect(result).toHaveProperty("regulationMappings");
      expect(result).toHaveProperty("standardMappings");

      // Verify initiative structure
      expect(result!.initiative.id).toBe(initiativeId);
      expect(result!.initiative).toHaveProperty("shortName");
      expect(result!.initiative).toHaveProperty("sector");

      // Verify mappings are arrays
      expect(Array.isArray(result!.regulationMappings)).toBe(true);
      expect(Array.isArray(result!.standardMappings)).toBe(true);
    });

    it("should return regulation mappings with regulation details", async () => {
      const initiatives = await getDutchInitiatives();
      const initiativeId = initiatives[0].id;

      const result = await getDutchInitiativeWithMappings(initiativeId);

      if (result && result.regulationMappings.length > 0) {
        const mapping = result.regulationMappings[0];

        expect(mapping).toHaveProperty("id");
        expect(mapping).toHaveProperty("relationshipType");
        expect(mapping).toHaveProperty("regulation");

        // Verify regulation details are included
        if (mapping.regulation) {
          expect(mapping.regulation).toHaveProperty("id");
          expect(mapping.regulation).toHaveProperty("title");
        }
      }
    });

    it("should return standard mappings with standard details", async () => {
      const initiatives = await getDutchInitiatives();
      const initiativeId = initiatives[0].id;

      const result = await getDutchInitiativeWithMappings(initiativeId);

      if (result && result.standardMappings.length > 0) {
        const mapping = result.standardMappings[0];

        expect(mapping).toHaveProperty("id");
        expect(mapping).toHaveProperty("criticality");
        expect(mapping).toHaveProperty("standard");

        // Verify standard details are included
        if (mapping.standard) {
          expect(mapping.standard).toHaveProperty("id");
          expect(mapping.standard).toHaveProperty("standardName");
        }
      }
    });

    it("should return null for non-existent initiative ID", async () => {
      const result = await getDutchInitiativeWithMappings(999999);

      expect(result).toBeNull();
    });

    it("should handle initiative with no mappings", async () => {
      const initiatives = await getDutchInitiatives();
      const initiativeId = initiatives[0].id;

      const result = await getDutchInitiativeWithMappings(initiativeId);

      expect(result).not.toBeNull();
      expect(result!.regulationMappings).toBeDefined();
      expect(result!.standardMappings).toBeDefined();
      expect(Array.isArray(result!.regulationMappings)).toBe(true);
      expect(Array.isArray(result!.standardMappings)).toBe(true);
    });
  });

  describe("getDutchInitiativeSectors", () => {
    it("should return array of unique sectors", async () => {
      const sectors = await getDutchInitiativeSectors();

      expect(Array.isArray(sectors)).toBe(true);
      expect(sectors.length).toBeGreaterThan(0);

      // Verify all sectors are strings
      sectors.forEach(sector => {
        expect(typeof sector).toBe("string");
        expect(sector.length).toBeGreaterThan(0);
      });
    });

    it("should return unique sectors (no duplicates)", async () => {
      const sectors = await getDutchInitiativeSectors();

      const uniqueSectors = [...new Set(sectors)];
      expect(sectors.length).toBe(uniqueSectors.length);
    });

    it("should match sectors from getDutchInitiatives", async () => {
      const sectors = await getDutchInitiativeSectors();
      const initiatives = await getDutchInitiatives();

      const initiativeSectors = [...new Set(initiatives.map(i => i.sector))];

      // All sectors from initiatives should be in the sectors list
      initiativeSectors.forEach(sector => {
        expect(sectors).toContain(sector);
      });
    });
  });

  describe("Integration Tests", () => {
    it("should have at least 5 Dutch initiatives seeded", async () => {
      const initiatives = await getDutchInitiatives();

      expect(initiatives.length).toBeGreaterThanOrEqual(5);
    });

    it("should have initiatives across multiple sectors", async () => {
      const sectors = await getDutchInitiativeSectors();

      expect(sectors.length).toBeGreaterThanOrEqual(3);
    });

    it("should have at least one initiative with regulation mappings", async () => {
      const initiatives = await getDutchInitiatives();

      let hasRegulationMappings = false;

      for (const initiative of initiatives) {
        const result = await getDutchInitiativeWithMappings(initiative.id);
        if (result && result.regulationMappings.length > 0) {
          hasRegulationMappings = true;
          break;
        }
      }

      expect(hasRegulationMappings).toBe(true);
    });

    it("should have at least one initiative with standard mappings", async () => {
      const initiatives = await getDutchInitiatives();

      let hasStandardMappings = false;

      for (const initiative of initiatives) {
        const result = await getDutchInitiativeWithMappings(initiative.id);
        if (result && result.standardMappings.length > 0) {
          hasStandardMappings = true;
          break;
        }
      }

      expect(hasStandardMappings).toBe(true);
    });
  });
});
