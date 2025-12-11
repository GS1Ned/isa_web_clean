import { describe, it, expect } from "vitest";
import {
  mapESRSToGS1Attributes,
  type ESRSToGS1Mapping,
  type MappingOptions,
} from "./esrs-to-gs1-mapper";
import { ESRS_GS1_MAPPING_RULES } from "./esrs-gs1-mapping-data";

describe("mapESRSToGS1Attributes", () => {
  it("returns mappings for a known E1 datapoint with default options", async () => {
    const ids = ["E1-1_01"];
    const result = await mapESRSToGS1Attributes(ids);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(1);

    const mapping: ESRSToGS1Mapping = result[0];

    expect(mapping.esrsDatapointId).toBe("E1-1_01");
    expect(mapping.esrsStandard).toBe("E1");
    expect(mapping.gs1Attributes.length).toBeGreaterThan(0);
    expect(
      mapping.gs1Attributes.every(attr => attr.mappingConfidence >= 0.7)
    ).toBe(true);
  });

  it("applies filterByStandard and only returns attributes for that GS1 standard", async () => {
    const options: MappingOptions = { filterByStandard: "GDSN" };
    const [mapping] = await mapESRSToGS1Attributes(["E1-1_01"], options);

    expect(mapping.gs1Attributes.length).toBeGreaterThan(0);
    expect(
      mapping.gs1Attributes.every(attr => attr.gs1Standard === "GDSN")
    ).toBe(true);
  });

  it("respects maxAttributesPerDatapoint after filtering", async () => {
    const options: MappingOptions = {
      includeLowConfidence: true,
      maxAttributesPerDatapoint: 1,
    };

    const [mapping] = await mapESRSToGS1Attributes(["E1-1_01"], options);

    expect(mapping.gs1Attributes.length).toBeLessThanOrEqual(1);
  });

  it("excludes low-confidence mappings by default and includes them when requested", async () => {
    const lowConfidenceRule = ESRS_GS1_MAPPING_RULES.find(
      rule => rule.esrsPattern === "E5-2_*"
    );

    expect(lowConfidenceRule).toBeTruthy();

    const attributeHasLowConfidence = lowConfidenceRule?.gs1Attributes.some(
      attr => attr.mappingConfidence < 0.7
    );

    expect(attributeHasLowConfidence).toBe(true);

    const [defaultMapping] = await mapESRSToGS1Attributes(["E5-2_01"]);
    const [fullMapping] = await mapESRSToGS1Attributes(["E5-2_01"], {
      includeLowConfidence: true,
    });

    const defaultHasLowConfidence = defaultMapping.gs1Attributes.some(
      attr => attr.mappingConfidence < 0.7
    );
    const fullHasLowConfidence = fullMapping.gs1Attributes.some(
      attr => attr.mappingConfidence < 0.7
    );

    expect(defaultHasLowConfidence).toBe(false);
    expect(fullHasLowConfidence).toBe(true);
    expect(fullMapping.gs1Attributes.length).toBeGreaterThanOrEqual(
      defaultMapping.gs1Attributes.length
    );
  });

  it("returns an empty mapping for unknown datapoint IDs", async () => {
    const [mapping] = await mapESRSToGS1Attributes(["UNKNOWN_ID"]);

    expect(mapping.esrsDatapointId).toBe("UNKNOWN_ID");
    expect(mapping.esrsStandard).toBe("Unknown");
    expect(mapping.gs1Attributes).toEqual([]);
  });

  it("returns an empty array when called with an empty input array", async () => {
    const result = await mapESRSToGS1Attributes([]);

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(0);
  });
});
