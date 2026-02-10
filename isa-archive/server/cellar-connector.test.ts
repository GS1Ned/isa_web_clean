/**
 * Tests for CELLAR SPARQL Connector
 * 
 * NOTE: These tests require connectivity to the EU CELLAR SPARQL endpoint.
 * They are skipped by default for CI stability. Run manually with:
 *   pnpm vitest run server/cellar-connector.test.ts --testNamePattern="CELLAR"
 * 
 * To enable: change describe.skip to describe
 */

import { describe, it, expect, beforeAll } from "vitest";
import { CellarConnector, type EULegalAct } from "./cellar-connector";

// Skip all CELLAR tests by default - they require live EU endpoint connectivity
describe.skip("CELLAR SPARQL Connector", () => {
  let connector: CellarConnector;

  beforeAll(() => {
    connector = new CellarConnector();
  });

  describe("Connection Tests", () => {
    it("should successfully connect to CELLAR endpoint", async () => {
      const isConnected = await connector.testConnection();
      expect(isConnected).toBe(true);
    }, 30000); // 30 second timeout for network request
  });

  describe("Query Tests", () => {
    it("should retrieve acts in force by year", async () => {
      const acts = await connector.getActsInForceByYear(2022);

      expect(Array.isArray(acts)).toBe(true);
      expect(acts.length).toBeGreaterThan(0);

      // Verify structure of first act
      if (acts.length > 0) {
        const act = acts[0];
        expect(act).toHaveProperty("uri");
        expect(act).toHaveProperty("inForce");
        expect(typeof act.inForce).toBe("boolean");
        if (act.dateEntryIntoForce) {
          expect(act.dateEntryIntoForce).toBeInstanceOf(Date);
        }
      }
    }, 30000);

    it("should search acts by keyword", async () => {
      const acts = await connector.searchActsByKeyword("sustainability", 10);

      expect(Array.isArray(acts)).toBe(true);

      // Verify each act has required properties
      acts.forEach(act => {
        expect(act).toHaveProperty("uri");
        expect(act).toHaveProperty("inForce");
        expect(typeof act.inForce).toBe("boolean");
      });
    }, 30000);

    it("should retrieve ESG regulations", async () => {
      const acts = await connector.getESGRegulations(3);

      expect(Array.isArray(acts)).toBe(true);

      // Verify acts are recent (within last 3 years)
      const threeYearsAgo = new Date();
      threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

      acts.forEach(act => {
        if (act.dateEntryIntoForce) {
          expect(act.dateEntryIntoForce.getTime()).toBeGreaterThanOrEqual(
            threeYearsAgo.getTime()
          );
        }
      });
    }, 30000);

    it("should retrieve act by CELEX identifier", async () => {
      // Test with a known CELEX ID (example: Directive 2013/34/EU)
      const celexId = "32013L0034";
      const act = await connector.getActByCelex(celexId);

      if (act) {
        expect(act.celexId).toBe(celexId);
        expect(act).toHaveProperty("uri");
        expect(act).toHaveProperty("inForce");
        expect(typeof act.inForce).toBe("boolean");
      }
    }, 30000);
  });

  describe("Data Parsing Tests", () => {
    it("should correctly parse date fields", async () => {
      const acts = await connector.getActsInForceByYear(2022);

      acts.forEach(act => {
        if (act.dateEntryIntoForce) {
          expect(act.dateEntryIntoForce).toBeInstanceOf(Date);
          // Date should be within reasonable range (2020-2025)
          const year = act.dateEntryIntoForce.getFullYear();
          expect(year).toBeGreaterThanOrEqual(2020);
          expect(year).toBeLessThanOrEqual(2025);
        }

        if (act.dateEndOfValidity) {
          expect(act.dateEndOfValidity).toBeInstanceOf(Date);
        }
      });
    }, 30000);

    it("should handle missing optional fields gracefully", async () => {
      const acts = await connector.searchActsByKeyword("test", 5);

      acts.forEach(act => {
        // Required fields
        expect(act.uri).toBeDefined();
        expect(typeof act.inForce).toBe("boolean");

        // Optional fields may be undefined
        if (act.title) {
          expect(typeof act.title).toBe("string");
        }
        if (act.celexId) {
          expect(typeof act.celexId).toBe("string");
        }
      });
    }, 30000);
  });

  describe("Error Handling Tests", () => {
    it("should handle invalid SPARQL query gracefully", async () => {
      const invalidConnector = new CellarConnector();

      // Inject invalid query by calling executeSPARQL directly
      await expect(
        invalidConnector.executeSPARQL("INVALID SPARQL QUERY")
      ).rejects.toThrow();
    }, 30000);

    it("should return empty array for no results", async () => {
      // Search for a very unlikely keyword
      const acts = await connector.searchActsByKeyword("xyzabc123unlikely", 10);

      expect(Array.isArray(acts)).toBe(true);
      expect(acts.length).toBe(0);
    }, 30000);
  });

  describe("Performance Tests", () => {
    it("should complete query within reasonable time", async () => {
      const startTime = Date.now();
      await connector.searchActsByKeyword("regulation", 10);
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
    }, 30000);

    it("should handle large result sets", async () => {
      const acts = await connector.getActsInForceByYear(2020);

      expect(Array.isArray(acts)).toBe(true);
      // Should be able to handle at least 100 results
      expect(acts.length).toBeLessThanOrEqual(1000); // Respects LIMIT in query
    }, 30000);
  });
});
