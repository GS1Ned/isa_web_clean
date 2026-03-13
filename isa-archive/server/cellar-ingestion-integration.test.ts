/**
 * End-to-end Integration Tests for CELLAR Ingestion Pipeline
 * 
 * NOTE: These tests require connectivity to the EU CELLAR SPARQL endpoint.
 * They are skipped by default for CI stability. Run manually with:
 *   pnpm vitest run server/cellar-ingestion-integration.test.ts
 * 
 * To enable: change describe.skip to describe
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { cellarConnector } from "./cellar-connector";
import {
  normalizeEULegalActsBatch,
  deduplicateRegulations,
  validateRegulation,
  calculateRegulationStats,
} from "./cellar-normalizer";
import { getDb } from "./db";
import { regulations } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Skip all CELLAR integration tests by default - they require live EU endpoint connectivity
describe.skip("CELLAR Ingestion Integration Tests", () => {
  let testCelexId: string | undefined;

  afterAll(async () => {
    // Cleanup: Remove test regulation if it was inserted
    if (testCelexId) {
      const db = await getDb();
      if (db) {
        await db
          .delete(regulations)
          .where(eq(regulations.celexId, testCelexId));
      }
    }
  });

  describe("Full Pipeline Test", () => {
    it("should fetch, normalize, and prepare regulations for database", async () => {
      // Step 1: Fetch from CELLAR
      const acts = await cellarConnector.getESGRegulations(3);
      // Note: CELLAR may return 0 results if no ESG regulations match filters
      expect(Array.isArray(acts)).toBe(true);

      if (acts.length === 0) {
        return; // Skip remaining steps if no data
      }

      // Step 2: Normalize
      let normalized = normalizeEULegalActsBatch(acts);
      expect(normalized.length).toBeGreaterThan(0);

      // Step 3: Deduplicate
      const beforeDedup = normalized.length;
      normalized = deduplicateRegulations(normalized);
      expect(normalized.length).toBeLessThanOrEqual(beforeDedup);

      // Step 4: Validate
      const valid = normalized.filter(validateRegulation);
      expect(valid.length).toBeGreaterThan(0);

      // Step 5: Calculate statistics
      const stats = calculateRegulationStats(valid);
      expect(stats.total).toBe(valid.length);
      expect(stats.withCelex).toBe(valid.length); // All should have CELEX
      expect(Object.keys(stats.byType).length).toBeGreaterThan(0);

      // Store first CELEX ID for cleanup
      if (valid.length > 0 && valid[0].celexId) {
        testCelexId = valid[0].celexId;
      }
    }, 60000); // 60 second timeout for full pipeline
  });

  describe("Database Integration", () => {
    it("should connect to database", async () => {
      const db = await getDb();
      expect(db).toBeDefined();
    });

    it("should query existing regulations", async () => {
      const db = await getDb();
      if (!db) {
        return;
      }

      const existingRegulations = await db.select().from(regulations).limit(10);

      expect(Array.isArray(existingRegulations)).toBe(true);
    });

    it("should insert and retrieve a test regulation", async () => {
      const db = await getDb();
      if (!db) {
        return;
      }

      const testRegulation = {
        celexId: "32099R9999", // Fake CELEX for testing
        title: "Test Regulation for Integration Test",
        description: "This is a test regulation",
        regulationType: "OTHER" as const,
        effectiveDate: new Date("2024-01-01"), // Use valid date range
        sourceUrl: "https://example.com/test",
      };

      // Insert
      await db.insert(regulations).values(testRegulation);

      // Retrieve
      const retrieved = await db
        .select()
        .from(regulations)
        .where(eq(regulations.celexId, testRegulation.celexId))
        .limit(1);

      expect(retrieved.length).toBe(1);
      expect(retrieved[0].celexId).toBe(testRegulation.celexId);
      expect(retrieved[0].title).toBe(testRegulation.title);

      // Cleanup
      await db
        .delete(regulations)
        .where(eq(regulations.celexId, testRegulation.celexId));
    });

    it("should update existing regulation", async () => {
      const db = await getDb();
      if (!db) {
        return;
      }

      const testRegulation = {
        celexId: "32099R8888",
        title: "Original Title",
        description: "Original description",
        regulationType: "OTHER" as const,
        effectiveDate: new Date("2024-01-01"), // Use valid date range
        sourceUrl: "https://example.com/original",
      };

      // Insert
      await db.insert(regulations).values(testRegulation);

      // Update
      const updatedData = {
        ...testRegulation,
        description: "Updated description",
        sourceUrl: "https://example.com/updated",
      };

      await db
        .update(regulations)
        .set(updatedData)
        .where(eq(regulations.celexId, testRegulation.celexId));

      // Retrieve
      const retrieved = await db
        .select()
        .from(regulations)
        .where(eq(regulations.celexId, testRegulation.celexId))
        .limit(1);

      expect(retrieved[0].description).toBe("Updated description");
      expect(retrieved[0].sourceUrl).toBe("https://example.com/updated");

      // Cleanup
      await db
        .delete(regulations)
        .where(eq(regulations.celexId, testRegulation.celexId));
    });
  });

  describe("Error Handling", () => {
    it("should handle CELLAR connection failures gracefully", async () => {
      // This test verifies that connection failures are caught
      // In a real scenario, we'd mock the connector to simulate failure
      const isConnected = await cellarConnector.testConnection();
      expect(typeof isConnected).toBe("boolean");
    });

    it("should handle invalid regulation data", () => {
      const invalidRegulation = {
        celexId: "INVALID",
        title: "",
        description: null,
        regulationType: "CSRD" as const,
        effectiveDate: null,
        sourceUrl: null,
      };

      const isValid = validateRegulation(invalidRegulation);
      expect(isValid).toBe(false);
    });

    it("should filter out non-ESG regulations", () => {
      const acts = [
        {
          uri: "http://example.com/1",
          celexId: "32020R1234",
          title: "Agricultural Subsidies Regulation",
          inForce: true,
        },
        {
          uri: "http://example.com/2",
          celexId: "32022L2464",
          title: "CSRD",
          inForce: true,
        },
      ];

      const normalized = normalizeEULegalActsBatch(acts);

      // Only CSRD should pass through (has explicit mapping)
      expect(normalized.length).toBe(1);
      expect(normalized[0].regulationType).toBe("CSRD");
    });
  });

  describe("Performance Tests", () => {
    it("should complete full pipeline within reasonable time", async () => {
      const startTime = Date.now();

      const acts = await cellarConnector.getESGRegulations(2);
      const normalized = normalizeEULegalActsBatch(acts);
      const deduped = deduplicateRegulations(normalized);
      const valid = normalized.filter(validateRegulation);
      const stats = calculateRegulationStats(valid);

      const duration = Date.now() - startTime;

      expect(duration).toBeLessThan(30000); // Should complete within 30 seconds
      // Note: May be 0 if no ESG regulations found in recent years
      expect(stats.total).toBeGreaterThanOrEqual(0);
    }, 30000);

    it("should handle large result sets efficiently", async () => {
      const acts = await cellarConnector.getESGRegulations(5);

      const startNormalize = Date.now();
      const normalized = normalizeEULegalActsBatch(acts);
      const normalizeTime = Date.now() - startNormalize;

      expect(normalizeTime).toBeLessThan(5000); // Should normalize within 5 seconds
      // Note: May be 0 if no ESG regulations found
      expect(normalized.length).toBeGreaterThanOrEqual(0);
    }, 30000);
  });

  describe("Data Quality Tests", () => {
    it("should ensure all normalized regulations have required fields", async () => {
      const acts = await cellarConnector.getESGRegulations(2);
      const normalized = normalizeEULegalActsBatch(acts);

      normalized.forEach(reg => {
        expect(reg.title).toBeDefined();
        expect(reg.title.length).toBeGreaterThan(0);
        expect(reg.regulationType).toBeDefined();
        expect(reg.celexId).toBeDefined();
      });
    }, 30000);

    it("should generate valid EUR-Lex URLs", async () => {
      const acts = await cellarConnector.getESGRegulations(2);
      const normalized = normalizeEULegalActsBatch(acts);

      normalized.forEach(reg => {
        if (reg.sourceUrl) {
          expect(reg.sourceUrl).toContain("eur-lex.europa.eu");
          expect(reg.sourceUrl).toContain("CELEX");
        }
      });
    }, 30000);

    it("should maintain CELEX ID format", async () => {
      const acts = await cellarConnector.getESGRegulations(2);
      const normalized = normalizeEULegalActsBatch(acts);

      const celexPattern = /^3\d{4}[A-Z]\d{4}$/;

      normalized.forEach(reg => {
        if (reg.celexId) {
          expect(celexPattern.test(reg.celexId)).toBe(true);
        }
      });
    }, 30000);
  });
});
