import { describe, it, expect } from "vitest";
import type { GPCToGS1MappingResult, GS1AttributeMappingResult } from "./gpc-to-gs1-mapper";
import { mapGPCToGS1, findMappingRules, parseNetContent, mergeGS1Attributes } from "./gpc-to-gs1-mapper";

function getAttribute(result: GPCToGS1MappingResult, code: string): GS1AttributeMappingResult | undefined {
  return result.gs1Attributes.find(item => item.gs1AttributeCode == code);
}

describe("mapGPCToGS1", () => {
  it("maps netContent, allergenInfo and brandName for cheese brick with exact mappings", () => {
    const result = mapGPCToGS1({
      gpcBrick: "10000123",
      attributes: {
        netContent: "500ml",
        allergenInfo: "Contains milk",
        brandName: "Example Brand"
      }
    });

    const valueAttr = getAttribute(result, "NET_CONTENT_VALUE");
    const unitAttr = getAttribute(result, "NET_CONTENT_UOM");
    const allergenAttr = getAttribute(result, "ALLERGEN_STATEMENT");
    const brandAttr = getAttribute(result, "BRAND_NAME");

    expect(valueAttr?.value).toBe(500);
    expect(unitAttr?.value).toBe("ml");
    expect(allergenAttr?.value).toBe("Contains milk");
    expect(brandAttr?.value).toBe("Example Brand");
  });

  it("uses wildcard brandName mapping when no brick specific rule exists", () => {
    const result = mapGPCToGS1({
      gpcBrick: "99999999",
      attributes: {
        brandName: "Generic Brand"
      }
    });

    const brandAttr = getAttribute(result, "BRAND_NAME");
    expect(brandAttr?.value).toBe("Generic Brand");
    expect(brandAttr?.confidence).toBe("partial");
  });

  it("adds unmapped attributes to unmappedAttributes list", () => {
    const result = mapGPCToGS1({
      gpcBrick: "10000123",
      attributes: {
        unknownField: "value"
      }
    });

    expect(result.gs1Attributes.length).toBe(0);
    expect(result.unmappedAttributes.length).toBe(1);
    expect(result.unmappedAttributes[0].gpcAttribute).toBe("unknownField");
  });

  it("supports multi value mapping for netContent in different bricks", () => {
    const result = mapGPCToGS1({
      gpcBrick: "10000234",
      attributes: {
        netContent: "1.5 L"
      }
    });

    const valueAttr = getAttribute(result, "NET_CONTENT_VALUE");
    const unitAttr = getAttribute(result, "NET_CONTENT_UOM");

    expect(valueAttr?.value).toBe(1.5);
    expect(unitAttr?.value).toBe("L");
  });

  it("parses netContent gracefully when value cannot be parsed", () => {
    const parsed = parseNetContent("not a quantity");
    expect(parsed.amount).toBeNull();
    expect(parsed.unit).toBeNull();
  });

  it("finds brick specific rules before wildcard rules", () => {
    const rules = findMappingRules("10000123", "brandName");
    expect(rules.length).toBe(1);
    expect(rules[0].gpcBrick).toBe("10000123");
  });

  it("falls back to wildcard rules when brick specific rule is missing", () => {
    const rules = findMappingRules("99999999", "brandName");
    expect(rules.length).toBe(1);
    expect(rules[0].gpcBrick).toBe("*");
  });

  it("merges GS1 attributes keeping the highest confidence per code", () => {
    const input: GS1AttributeMappingResult[] = [
      {
        gpcAttribute: "netContent",
        gs1AttributeCode: "NET_CONTENT_VALUE",
        gs1Standard: "GDSN",
        confidence: "partial",
        value: 400
      },
      {
        gpcAttribute: "netContent",
        gs1AttributeCode: "NET_CONTENT_VALUE",
        gs1Standard: "GDSN",
        confidence: "exact",
        value: 500
      }
    ];

    const merged = mergeGS1Attributes(input);
    expect(merged.length).toBe(1);
    expect(merged[0].value).toBe(500);
    expect(merged[0].confidence).toBe("exact");
  });

  it("does not mutate the original attributes object", () => {
    const attributes = {
      netContent: "500 ml",
      brandName: "Immutable Brand"
    };

    const copy = { ...attributes };
    mapGPCToGS1({
      gpcBrick: "10000123",
      attributes
    });

    expect(attributes).toEqual(copy);
  });

  it("handles empty attributes map without failure", () => {
    const result = mapGPCToGS1({
      gpcBrick: "10000123",
      attributes: {}
    });

    expect(result.gs1Attributes.length).toBe(0);
    expect(result.unmappedAttributes.length).toBe(0);
  });
});

