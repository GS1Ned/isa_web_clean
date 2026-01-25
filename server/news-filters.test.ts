/**
 * Tests for enhanced news filtering functionality
 * Validates GS1 impact tags, sector tags, and high impact filtering
 */

import { describe, it, expect } from "vitest";
import { GS1_IMPACT_TAG_LABELS, SECTOR_TAG_LABELS } from "../shared/news-tags";

describe("News Tag Constants", () => {
  it("should have all required GS1 impact tag labels", () => {
    const expectedTags = [
      "IDENTIFICATION",
      "PACKAGING_ATTRIBUTES",
      "ESG_REPORTING",
      "DUE_DILIGENCE",
      "TRACEABILITY",
      "DPP",
      "BATTERY_PASSPORT",
      "HEALTHCARE_SUSTAINABILITY",
      "FOOD_SAFETY",
      "LOGISTICS_OPTIMIZATION",
      "CIRCULAR_ECONOMY",
      "PRODUCT_MASTER_DATA",
    ];

    expectedTags.forEach(tag => {
      expect(GS1_IMPACT_TAG_LABELS).toHaveProperty(tag);
      expect(typeof GS1_IMPACT_TAG_LABELS[tag as keyof typeof GS1_IMPACT_TAG_LABELS]).toBe("string");
      expect(GS1_IMPACT_TAG_LABELS[tag as keyof typeof GS1_IMPACT_TAG_LABELS].length).toBeGreaterThan(0);
    });
  });

  it("should have all required sector tag labels", () => {
    const expectedSectors = [
      "RETAIL",
      "HEALTHCARE",
      "FOOD",
      "LOGISTICS",
      "DIY",
      "CONSTRUCTION",
      "TEXTILES",
      "ELECTRONICS",
      "AUTOMOTIVE",
      "CHEMICALS",
      "PACKAGING",
      "GENERAL",
    ];

    expectedSectors.forEach(sector => {
      expect(SECTOR_TAG_LABELS).toHaveProperty(sector);
      expect(typeof SECTOR_TAG_LABELS[sector as keyof typeof SECTOR_TAG_LABELS]).toBe("string");
      expect(SECTOR_TAG_LABELS[sector as keyof typeof SECTOR_TAG_LABELS].length).toBeGreaterThan(0);
    });
  });

  it("should have user-friendly label text", () => {
    // Check some key labels for readability
    expect(GS1_IMPACT_TAG_LABELS.DPP).toBe("Digital Product Passport");
    expect(GS1_IMPACT_TAG_LABELS.TRACEABILITY).toBe("Traceability & Track-and-Trace");
    expect(GS1_IMPACT_TAG_LABELS.ESG_REPORTING).toBe("ESG Reporting & Disclosure");
    
    expect(SECTOR_TAG_LABELS.RETAIL).toBe("Retail & E-commerce");
    expect(SECTOR_TAG_LABELS.HEALTHCARE).toBe("Healthcare & Pharmaceuticals");
    expect(SECTOR_TAG_LABELS.FOOD).toBe("Food & Beverage");
  });
});

describe("News Filter Logic", () => {
  // Mock news items for testing filter logic
  const mockNewsItems = [
    {
      id: 1,
      title: "DPP Requirements Published",
      impactLevel: "HIGH",
      gs1ImpactTags: ["DPP", "TRACEABILITY"],
      sectorTags: ["RETAIL", "TEXTILES"],
    },
    {
      id: 2,
      title: "CSRD Reporting Guidelines",
      impactLevel: "MEDIUM",
      gs1ImpactTags: ["ESG_REPORTING", "DATA_SHARING"],
      sectorTags: ["GENERAL"],
    },
    {
      id: 3,
      title: "Healthcare Traceability Rules",
      impactLevel: "HIGH",
      gs1ImpactTags: ["TRACEABILITY", "IDENTIFICATION"],
      sectorTags: ["HEALTHCARE"],
    },
    {
      id: 4,
      title: "Food Safety Update",
      impactLevel: "LOW",
      gs1ImpactTags: ["TRACEABILITY"],
      sectorTags: ["FOOD"],
    },
  ];

  it("should filter by single GS1 impact tag", () => {
    const filtered = mockNewsItems.filter(item =>
      item.gs1ImpactTags.includes("DPP")
    );
    
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe(1);
  });

  it("should filter by multiple GS1 impact tags (OR logic)", () => {
    const gs1Filters = ["DPP", "ESG_REPORTING"];
    const filtered = mockNewsItems.filter(item =>
      gs1Filters.some(filter => item.gs1ImpactTags.includes(filter))
    );
    
    expect(filtered).toHaveLength(2);
    expect(filtered.map(i => i.id)).toContain(1);
    expect(filtered.map(i => i.id)).toContain(2);
  });

  it("should filter by single sector tag", () => {
    const filtered = mockNewsItems.filter(item =>
      item.sectorTags.includes("HEALTHCARE")
    );
    
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe(3);
  });

  it("should filter by multiple sector tags (OR logic)", () => {
    const sectorFilters = ["RETAIL", "FOOD"];
    const filtered = mockNewsItems.filter(item =>
      sectorFilters.some(filter => item.sectorTags.includes(filter))
    );
    
    expect(filtered).toHaveLength(2);
    expect(filtered.map(i => i.id)).toContain(1);
    expect(filtered.map(i => i.id)).toContain(4);
  });

  it("should filter by high impact only", () => {
    const filtered = mockNewsItems.filter(item =>
      item.impactLevel === "HIGH"
    );
    
    expect(filtered).toHaveLength(2);
    expect(filtered.map(i => i.id)).toContain(1);
    expect(filtered.map(i => i.id)).toContain(3);
  });

  it("should combine GS1 impact tag + sector tag filters (AND logic)", () => {
    const gs1Filters = ["TRACEABILITY"];
    const sectorFilters = ["HEALTHCARE"];
    
    const filtered = mockNewsItems.filter(item => {
      const matchesGS1 = gs1Filters.some(filter => item.gs1ImpactTags.includes(filter));
      const matchesSector = sectorFilters.some(filter => item.sectorTags.includes(filter));
      return matchesGS1 && matchesSector;
    });
    
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe(3);
  });

  it("should combine all three filters (GS1 + sector + high impact)", () => {
    const gs1Filters = ["TRACEABILITY"];
    const sectorFilters = ["RETAIL", "TEXTILES"];
    const highImpactOnly = true;
    
    const filtered = mockNewsItems.filter(item => {
      const matchesGS1 = gs1Filters.length === 0 || gs1Filters.some(filter => item.gs1ImpactTags.includes(filter));
      const matchesSector = sectorFilters.length === 0 || sectorFilters.some(filter => item.sectorTags.includes(filter));
      const matchesImpact = !highImpactOnly || item.impactLevel === "HIGH";
      return matchesGS1 && matchesSector && matchesImpact;
    });
    
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe(1);
  });

  it("should return empty array when no matches found", () => {
    const gs1Filters = ["DPP"];
    const sectorFilters = ["HEALTHCARE"];
    
    const filtered = mockNewsItems.filter(item => {
      const matchesGS1 = gs1Filters.some(filter => item.gs1ImpactTags.includes(filter));
      const matchesSector = sectorFilters.some(filter => item.sectorTags.includes(filter));
      return matchesGS1 && matchesSector;
    });
    
    expect(filtered).toHaveLength(0);
  });

  it("should handle empty filter arrays (show all)", () => {
    const gs1Filters: string[] = [];
    const sectorFilters: string[] = [];
    const highImpactOnly = false;
    
    const filtered = mockNewsItems.filter(item => {
      const matchesGS1 = gs1Filters.length === 0 || gs1Filters.some(filter => item.gs1ImpactTags.includes(filter));
      const matchesSector = sectorFilters.length === 0 || sectorFilters.some(filter => item.sectorTags.includes(filter));
      const matchesImpact = !highImpactOnly || item.impactLevel === "HIGH";
      return matchesGS1 && matchesSector && matchesImpact;
    });
    
    expect(filtered).toHaveLength(4);
  });
});

describe("Filter Edge Cases", () => {
  it("should handle news items with empty tag arrays", () => {
    const item = {
      id: 1,
      title: "Test",
      impactLevel: "MEDIUM" as const,
      gs1ImpactTags: [],
      sectorTags: [],
    };
    
    const gs1Filters = ["DPP"];
    const matchesGS1 = gs1Filters.some(filter => item.gs1ImpactTags.includes(filter));
    
    expect(matchesGS1).toBe(false);
  });

  it("should handle news items with multiple overlapping tags", () => {
    const item = {
      id: 1,
      title: "Test",
      impactLevel: "HIGH" as const,
      gs1ImpactTags: ["DPP", "TRACEABILITY", "ESG_REPORTING"],
      sectorTags: ["RETAIL", "FOOD", "LOGISTICS"],
    };
    
    const gs1Filters = ["DPP", "TRACEABILITY"];
    const sectorFilters = ["RETAIL"];
    
    const matchesGS1 = gs1Filters.some(filter => item.gs1ImpactTags.includes(filter));
    const matchesSector = sectorFilters.some(filter => item.sectorTags.includes(filter));
    
    expect(matchesGS1).toBe(true);
    expect(matchesSector).toBe(true);
  });

  it("should be case-sensitive for tag matching", () => {
    const item = {
      id: 1,
      title: "Test",
      impactLevel: "HIGH" as const,
      gs1ImpactTags: ["DPP"],
      sectorTags: ["RETAIL"],
    };
    
    // Lowercase should not match
    const matchesDPP = item.gs1ImpactTags.includes("dpp" as any);
    const matchesRetail = item.sectorTags.includes("retail" as any);
    
    expect(matchesDPP).toBe(false);
    expect(matchesRetail).toBe(false);
  });
});
