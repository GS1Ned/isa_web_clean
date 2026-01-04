/**
 * Tests for enhanced news AI processor with GS1-specific fields
 */

import { describe, it, expect } from "vitest";
import { processNewsItem } from "./news-ai-processor";
import { inferGS1ImpactTags, inferSectorTags } from "../shared/news-tags";
import type { RawNewsItem } from "./news-fetcher";

describe("News AI Processor - GS1 Enhancement", () => {
  it("should process CSRD news with GS1 impact analysis", async () => {
    const mockItem: RawNewsItem = {
      title: "EFRAG publishes final ESRS standards for CSRD reporting",
      content: `The European Financial Reporting Advisory Group (EFRAG) has published the final European Sustainability Reporting Standards (ESRS). 
      Companies will need to report on environmental, social and governance (ESG) matters including supply chain due diligence, 
      product lifecycle data, and packaging recyclability. The standards require detailed product-level information including 
      material composition, carbon footprint, and traceability data. GS1 standards like GTIN, GDSN, and EPCIS can help companies 
      collect and share this data efficiently.`,
      contentSnippet: "EFRAG publishes ESRS standards for CSRD reporting",
      link: "https://www.efrag.org/news/esrs-final",
      pubDate: "2024-12-10T10:00:00Z",
      source: {
        id: "efrag_news",
        name: "EFRAG",
        type: "EU_OFFICIAL" as const,
        url: "https://www.efrag.org",
        credibilityScore: 5,
      },
    };

    const result = await processNewsItem(mockItem, { testMode: true });

    // Basic fields
    expect(result.headline).toBeTruthy();
    expect(result.headline.length).toBeLessThanOrEqual(100);
    expect(result.whatHappened).toBeTruthy();
    expect(result.whyItMatters).toBeTruthy();
    expect(result.regulationTags).toContain("CSRD");
    expect(result.regulationTags).toContain("ESRS");
    expect(result.impactLevel).toMatch(/^(LOW|MEDIUM|HIGH)$/);
    expect(result.newsType).toMatch(
      /^(NEW_LAW|AMENDMENT|ENFORCEMENT|COURT_DECISION|GUIDANCE|PROPOSAL)$/
    );

    // GS1-specific fields
    expect(result.gs1ImpactTags).toBeInstanceOf(Array);
    expect(result.gs1ImpactTags.length).toBeGreaterThan(0);
    expect(result.sectorTags).toBeInstanceOf(Array);
    expect(result.sectorTags.length).toBeGreaterThan(0);
    expect(result.gs1ImpactAnalysis).toBeTruthy();
    expect(result.gs1ImpactAnalysis.length).toBeGreaterThan(50); // At least 2-3 sentences
    expect(result.suggestedActions).toBeInstanceOf(Array);
    expect(result.suggestedActions.length).toBeGreaterThanOrEqual(2);
    expect(result.suggestedActions.length).toBeLessThanOrEqual(4);

    console.log("✅ Processed CSRD news:", {
      headline: result.headline,
      gs1ImpactTags: result.gs1ImpactTags,
      sectorTags: result.sectorTags,
      gs1ImpactAnalysis: result.gs1ImpactAnalysis.slice(0, 100) + "...",
      suggestedActions: result.suggestedActions,
    });
  }, 30000); // 30s timeout for LLM call

  it("should process DPP news with relevant GS1 tags", async () => {
    const mockItem: RawNewsItem = {
      title: "EU Digital Product Passport requirements published",
      content: `The European Commission has published detailed requirements for Digital Product Passports (DPP) under the Ecodesign for Sustainable Products Regulation (ESPR). 
      Products must carry a QR code or 2D barcode linking to sustainability information including material composition, repair instructions, and end-of-life handling. 
      GS1 Digital Link and GS1 Web Vocabulary are recommended standards for implementing DPPs.`,
      contentSnippet: "EU publishes DPP requirements",
      link: "https://ec.europa.eu/dpp",
      pubDate: "2024-12-10T10:00:00Z",
      source: {
        id: "ec_news",
        name: "European Commission",
        type: "EU_OFFICIAL" as const,
        url: "https://ec.europa.eu",
        credibilityScore: 5,
      },
    };

    const result = await processNewsItem(mockItem, { testMode: true });

    expect(result.gs1ImpactTags).toContain("DPP");
    expect(result.gs1ImpactTags).toContain("IDENTIFICATION");
    expect(result.gs1ImpactTags).toContain("PACKAGING_ATTRIBUTES");
    expect(result.gs1ImpactAnalysis).toContain("DPP");
    expect(result.suggestedActions.length).toBeGreaterThanOrEqual(3);

    console.log("✅ Processed DPP news:", {
      gs1ImpactTags: result.gs1ImpactTags,
      suggestedActions: result.suggestedActions,
    });
  }, 30000);

  it("should use fallback processing when LLM fails", async () => {
    const mockItem: RawNewsItem = {
      title: "Invalid content to trigger fallback",
      content: "", // Empty content should trigger fallback
      contentSnippet: "",
      link: "https://example.com/test",
      pubDate: "2024-12-10T10:00:00Z",
      source: {
        id: "test",
        name: "Test Source",
        type: "INDUSTRY" as const,
        url: "https://example.com",
        credibilityScore: 3,
      },
    };

    const result = await processNewsItem(mockItem, { testMode: true });

    // Fallback should still return valid structure
    expect(result.headline).toBeTruthy();
    expect(result.gs1ImpactTags).toBeInstanceOf(Array);
    expect(result.sectorTags).toBeInstanceOf(Array);
    expect(result.gs1ImpactAnalysis).toBeTruthy();
    expect(result.suggestedActions).toBeInstanceOf(Array);
    expect(result.suggestedActions.length).toBeGreaterThanOrEqual(2);
  }, 30000);
});

describe("GS1 Impact Tag Inference", () => {
  it("should infer DPP and TRACEABILITY tags from DPP content", () => {
    const text =
      "Digital Product Passport requirements include QR codes, traceability data, and supply chain transparency using EPCIS events.";
    const tags = inferGS1ImpactTags(text, 3);

    expect(tags).toContain("DPP");
    expect(tags).toContain("TRACEABILITY");
  });

  it("should infer PACKAGING_ATTRIBUTES from PPWR content", () => {
    const text =
      "Packaging and Packaging Waste Regulation (PPWR) requires recyclability data and material composition information in GDSN.";
    const tags = inferGS1ImpactTags(text, 3);

    expect(tags).toContain("PACKAGING_ATTRIBUTES");
  });

  it("should infer ESG_REPORTING from CSRD content", () => {
    const text =
      "CSRD and ESRS require companies to report sustainability data including carbon emissions and ESG metrics.";
    const tags = inferGS1ImpactTags(text, 3);

    expect(tags).toContain("ESG_REPORTING");
  });
});

describe("Sector Tag Inference", () => {
  it("should infer RETAIL sector from retail keywords", () => {
    const text =
      "New regulations affect supermarkets, retail stores, and e-commerce platforms selling consumer goods.";
    const tags = inferSectorTags(text, 3);

    expect(tags).toContain("RETAIL");
  });

  it("should infer HEALTHCARE sector from medical keywords", () => {
    const text =
      "Hospitals and pharmaceutical companies must comply with new medical device traceability requirements.";
    const tags = inferSectorTags(text, 3);

    expect(tags).toContain("HEALTHCARE");
  });

  it("should infer FOOD sector from food keywords", () => {
    const text =
      "Food safety regulations require farm-to-fork traceability for all food and beverage products.";
    const tags = inferSectorTags(text, 3);

    expect(tags).toContain("FOOD");
  });

  it("should default to GENERAL when no sector keywords found", () => {
    const text = "Generic regulatory update with no specific sector mentions.";
    const tags = inferSectorTags(text, 3);

    expect(tags).toContain("GENERAL");
  });
});
