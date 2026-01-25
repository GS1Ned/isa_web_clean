/**
 * Tests for CELLAR Data Normalizer
 */

import { describe, it, expect } from "vitest";
import {
  normalizeEULegalAct,
  normalizeEULegalActsBatch,
  deduplicateRegulations,
  mergeRegulationData,
  validateRegulation,
  calculateRegulationStats,
} from "./cellar-normalizer";
import type { EULegalAct } from "./cellar-connector";
import type { InsertRegulation } from "../drizzle/schema";

describe("CELLAR Data Normalizer", () => {
  describe("normalizeEULegalAct", () => {
    it("should normalize a CSRD regulation", () => {
      const act: EULegalAct = {
        uri: "http://publications.europa.eu/resource/celex/32022L2464",
        celexId: "32022L2464",
        title:
          "Directive (EU) 2022/2464 - Corporate Sustainability Reporting Directive",
        dateEntryIntoForce: new Date("2023-01-05"),
        inForce: true,
      };

      const result = normalizeEULegalAct(act);

      expect(result).not.toBeNull();
      expect(result?.celexId).toBe("32022L2464");
      expect(result?.regulationType).toBe("CSRD");
      expect(result?.title).toContain("Corporate Sustainability Reporting");
      expect(typeof result?.effectiveDate).toBe('string');
      expect(result?.effectiveDate).toContain('2023-01-05');
      expect(result?.sourceUrl).toContain("eur-lex.europa.eu");
    });

    it("should normalize a DPP regulation", () => {
      const act: EULegalAct = {
        uri: "http://publications.europa.eu/resource/celex/32024R1252",
        celexId: "32024R1252",
        title: "Regulation (EU) 2024/1252 - Digital Product Passport",
        dateEntryIntoForce: new Date("2024-07-18"),
        inForce: true,
      };

      const result = normalizeEULegalAct(act);

      expect(result).not.toBeNull();
      expect(result?.regulationType).toBe("DPP");
    });

    it("should classify ESG regulation by keywords", () => {
      const act: EULegalAct = {
        uri: "http://example.com/act",
        celexId: "32023R9999",
        title: "Regulation on Environmental Sustainability Reporting",
        dateEntryIntoForce: new Date("2023-01-01"),
        inForce: true,
      };

      const result = normalizeEULegalAct(act);

      expect(result).not.toBeNull();
      expect(result?.title).toContain("Environmental Sustainability");
    });

    it("should return null for non-ESG regulation without CELEX mapping", () => {
      const act: EULegalAct = {
        uri: "http://example.com/act",
        celexId: "32020R1234",
        title: "Regulation on Agricultural Subsidies",
        dateEntryIntoForce: new Date("2020-01-01"),
        inForce: true,
      };

      const result = normalizeEULegalAct(act);

      expect(result).toBeNull();
    });

    it("should return null for act without CELEX ID", () => {
      const act: EULegalAct = {
        uri: "http://example.com/act",
        title: "Some Regulation",
        inForce: true,
      };

      const result = normalizeEULegalAct(act);

      expect(result).toBeNull();
    });

    it("should handle missing dates gracefully", () => {
      const act: EULegalAct = {
        uri: "http://example.com/act",
        celexId: "32022L2464",
        title: "CSRD",
        inForce: true,
      };

      const result = normalizeEULegalAct(act);

      expect(result).not.toBeNull();
      expect(result?.effectiveDate).toBeNull();
    });

    it("should truncate long titles", () => {
      const longTitle = "A".repeat(300);
      const act: EULegalAct = {
        uri: "http://example.com/act",
        celexId: "32022L2464",
        title: longTitle,
        inForce: true,
      };

      const result = normalizeEULegalAct(act);

      expect(result).not.toBeNull();
      expect(result!.title.length).toBeLessThanOrEqual(255);
      expect(result!.title).toContain("...");
    });
  });

  describe("normalizeEULegalActsBatch", () => {
    it("should normalize multiple acts", () => {
      const acts: EULegalAct[] = [
        {
          uri: "http://example.com/1",
          celexId: "32022L2464",
          title: "CSRD",
          inForce: true,
        },
        {
          uri: "http://example.com/2",
          celexId: "32024R1252",
          title: "DPP",
          inForce: true,
        },
      ];

      const results = normalizeEULegalActsBatch(acts);

      expect(results.length).toBe(2);
      expect(results[0].regulationType).toBe("CSRD");
      expect(results[1].regulationType).toBe("DPP");
    });

    it("should filter out null results", () => {
      const acts: EULegalAct[] = [
        {
          uri: "http://example.com/1",
          celexId: "32022L2464",
          title: "CSRD",
          inForce: true,
        },
        {
          uri: "http://example.com/2",
          title: "No CELEX",
          inForce: true,
        },
      ];

      const results = normalizeEULegalActsBatch(acts);

      expect(results.length).toBe(1);
    });
  });

  describe("deduplicateRegulations", () => {
    it("should remove duplicate CELEX IDs", () => {
      const regulations: InsertRegulation[] = [
        {
          celexId: "32022L2464",
          title: "CSRD 1",
          regulationType: "CSRD",
          description: null,
          effectiveDate: null,
          sourceUrl: null,
        },
        {
          celexId: "32022L2464",
          title: "CSRD 2",
          regulationType: "CSRD",
          description: null,
          effectiveDate: null,
          sourceUrl: null,
        },
        {
          celexId: "32024R1252",
          title: "DPP",
          regulationType: "DPP",
          description: null,
          effectiveDate: null,
          sourceUrl: null,
        },
      ];

      const unique = deduplicateRegulations(regulations);

      expect(unique.length).toBe(2);
      expect(unique[0].celexId).toBe("32022L2464");
      expect(unique[1].celexId).toBe("32024R1252");
    });
  });

  describe("mergeRegulationData", () => {
    it("should preserve manual edits while updating automated fields", () => {
      const existing: InsertRegulation = {
        celexId: "32022L2464",
        title: "Manually Edited Title",
        description: "Manually edited description",
        regulationType: "CSRD",
        effectiveDate: new Date("2023-01-01"),
        sourceUrl: "https://old-url.com",
      };

      const incoming: InsertRegulation = {
        celexId: "32022L2464",
        title: "Auto-generated Title",
        description: "Auto-generated description",
        regulationType: "CSRD",
        effectiveDate: new Date("2023-01-05"),
        sourceUrl: "https://new-url.com",
      };

      const merged = mergeRegulationData(existing, incoming);

      expect(merged.title).toBe("Manually Edited Title");
      expect(merged.description).toBe("Manually edited description");
      expect(merged.effectiveDate).toEqual(new Date("2023-01-05"));
      expect(merged.sourceUrl).toBe("https://new-url.com");
    });
  });

  describe("validateRegulation", () => {
    it("should validate correct regulation", () => {
      const regulation: InsertRegulation = {
        celexId: "32022L2464",
        title: "CSRD",
        description: "Description",
        regulationType: "CSRD",
        effectiveDate: new Date("2023-01-01"),
        sourceUrl:
          "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32022L2464",
      };

      expect(validateRegulation(regulation)).toBe(true);
    });

    it("should reject regulation without title", () => {
      const regulation: InsertRegulation = {
        celexId: "32022L2464",
        title: "",
        description: null,
        regulationType: "CSRD",
        effectiveDate: null,
        sourceUrl: null,
      };

      expect(validateRegulation(regulation)).toBe(false);
    });

    it("should reject regulation without type", () => {
      const regulation: InsertRegulation = {
        celexId: "32022L2464",
        title: "CSRD",
        description: null,
        regulationType: null as any,
        effectiveDate: null,
        sourceUrl: null,
      };

      expect(validateRegulation(regulation)).toBe(false);
    });

    it("should reject invalid CELEX format", () => {
      const regulation: InsertRegulation = {
        celexId: "INVALID",
        title: "CSRD",
        description: null,
        regulationType: "CSRD",
        effectiveDate: null,
        sourceUrl: null,
      };

      expect(validateRegulation(regulation)).toBe(false);
    });

    it("should reject invalid URL", () => {
      const regulation: InsertRegulation = {
        celexId: "32022L2464",
        title: "CSRD",
        description: null,
        regulationType: "CSRD",
        effectiveDate: null,
        sourceUrl: "not-a-url",
      };

      expect(validateRegulation(regulation)).toBe(false);
    });
  });

  describe("calculateRegulationStats", () => {
    it("should calculate correct statistics", () => {
      const regulations: InsertRegulation[] = [
        {
          celexId: "32022L2464",
          title: "CSRD 1",
          regulationType: "CSRD",
          description: null,
          effectiveDate: new Date("2023-01-01"),
          sourceUrl: null,
        },
        {
          celexId: "32024R1252",
          title: "DPP",
          regulationType: "DPP",
          description: null,
          effectiveDate: new Date("2024-01-01"),
          sourceUrl: null,
        },
        {
          celexId: "32023R1115",
          title: "EUDR",
          regulationType: "EUDR",
          description: null,
          effectiveDate: null,
          sourceUrl: null,
        },
      ];

      const stats = calculateRegulationStats(regulations);

      expect(stats.total).toBe(3);
      expect(stats.byType["CSRD"]).toBe(1);
      expect(stats.byType["DPP"]).toBe(1);
      expect(stats.byType["EUDR"]).toBe(1);
      expect(stats.withCelex).toBe(3);
      expect(stats.withDates).toBe(2);
    });
  });
});
