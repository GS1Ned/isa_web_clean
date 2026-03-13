import { describe, expect, it } from "vitest";

import {
  buildAvailableRegulations,
  buildGapAnalyzerSampleAttributes,
  buildSampleAttributeInventory,
} from "./attribute-recommender-inventory.js";

describe("attribute recommender inventory", () => {
  it("falls back to compatibility regulations when catalog data is unavailable", () => {
    const regulations = buildAvailableRegulations([]);

    expect(regulations.map((regulation) => regulation.id)).toEqual(
      expect.arrayContaining(["CSRD", "DPP", "ESPR"])
    );
    expect(regulations[0]?.id).toBe("CSRD");
  });

  it("normalizes catalog regulations and preserves compatibility coverage", () => {
    const regulations = buildAvailableRegulations([
      {
        regulationType: "PPWR",
        title: "Packaging Regulation Catalog Title",
      },
      {
        regulationType: "EU_TAXONOMY",
        title: "EU Taxonomy Catalog Title",
      },
      {
        regulationType: "OTHER",
        title: "Ignore me",
      },
    ]);

    expect(regulations.find((regulation) => regulation.id === "PPWR")).toEqual({
      id: "PPWR",
      name: "Packaging and Packaging Waste Regulation",
      shortName: "PPWR",
    });
    expect(regulations.find((regulation) => regulation.id === "EU_TAXONOMY"))
      .toEqual({
        id: "EU_TAXONOMY",
        name: "EU Taxonomy",
        shortName: "EU Taxonomy",
      });
    expect(regulations.map((regulation) => regulation.id)).toContain("CSRD");
    expect(regulations.map((regulation) => regulation.id)).not.toContain("OTHER");
  });

  it("falls back to compatibility sample attributes when catalog mappings are unavailable", () => {
    const attributes = buildSampleAttributeInventory([]);

    expect(attributes.map((attribute) => attribute.id)).toEqual(
      expect.arrayContaining(["gtin", "gln", "productCarbonFootprint"])
    );
  });

  it("builds sample attributes from mapped catalog rows and preserves core identifiers", () => {
    const attributes = buildSampleAttributeInventory([
      {
        gs1AttributeId: "productCarbonFootprint",
        gs1AttributeName: "Product Carbon Footprint",
        confidence: "low",
      },
      {
        gs1AttributeId: "productCarbonFootprint",
        gs1AttributeName: "Product Carbon Footprint",
        confidence: "high",
      },
      {
        gs1AttributeId: "countryOfOrigin",
        gs1AttributeName: "Country of Origin",
        confidence: "medium",
      },
    ]);

    expect(attributes.find((attribute) => attribute.id === "productCarbonFootprint"))
      .toEqual({
        id: "productCarbonFootprint",
        name: "Product Carbon Footprint",
        category: "Sustainability",
      });
    expect(attributes.find((attribute) => attribute.id === "countryOfOrigin"))
      .toEqual({
        id: "countryOfOrigin",
        name: "Country of Origin",
        category: "Origin",
      });
    expect(new Set(attributes.map((attribute) => attribute.id)).size).toBe(
      attributes.length
    );
    expect(attributes.map((attribute) => attribute.id)).toEqual(
      expect.arrayContaining(["gtin", "gln"])
    );
  });

  it("builds gap-analyzer sample attributes with deduped confidence-ranked rows", () => {
    const attributes = buildGapAnalyzerSampleAttributes([
      {
        gs1AttributeId: "productCarbonFootprint",
        gs1AttributeName: "Product Carbon Footprint",
        confidence: "low",
      },
      {
        gs1AttributeId: "productCarbonFootprint",
        gs1AttributeName: "Product Carbon Footprint",
        confidence: "high",
      },
      {
        gs1AttributeId: "countryOfOrigin",
        gs1AttributeName: "Country of Origin",
        confidence: "medium",
      },
    ]);

    expect(attributes[0]).toEqual({
      gs1_attribute_id: "productCarbonFootprint",
      gs1_attribute_name: "Product Carbon Footprint",
      confidence: "high",
    });
    expect(attributes).toContainEqual({
      gs1_attribute_id: "countryOfOrigin",
      gs1_attribute_name: "Country of Origin",
      confidence: "medium",
    });
    expect(
      attributes.filter((attribute) => attribute.gs1_attribute_id === "productCarbonFootprint")
    ).toHaveLength(1);
  });
});
