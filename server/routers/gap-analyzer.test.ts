import { describe, expect, it, vi, beforeEach } from "vitest";
import type { TrpcContext } from "../_core/context";
import * as dbModule from "../db.js";

const collectEvidenceRefsForTermsMock = vi.fn();

vi.mock("../db.js", () => ({
  getDb: vi.fn(),
}));

vi.mock("../source-provenance.js", () => ({
  collectEvidenceRefsForTerms: collectEvidenceRefsForTermsMock,
}));

const mockPublicContext: TrpcContext = {
  user: null,
  req: {} as any,
  res: {} as any,
  traceId: "test-trace-id",
};

describe("gapAnalyzerRouter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    collectEvidenceRefsForTermsMock.mockResolvedValue([
      {
        sourceId: 101,
        sourceChunkId: 1001,
        evidenceKey: "ke:1001:hash",
        citationLabel: "ESRS E1 — Climate Change",
        sourceLocator: "https://example.com/esrs-e1",
      },
    ]);
  });

  it("reuses deduped mapped attribute inventory for sample attribute selection", async () => {
    const { gapAnalyzerRouter } = await import("./gap-analyzer.js");

    const mockDb = {
      execute: vi.fn().mockResolvedValue([
        [
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
        ],
      ]),
    };

    vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

    const caller = gapAnalyzerRouter.createCaller(mockPublicContext);
    const result = await caller.getSampleAttributes();

    expect(result[0]).toEqual({
      gs1_attribute_id: "productCarbonFootprint",
      gs1_attribute_name: "Product Carbon Footprint",
      confidence: "high",
    });
    expect(result).toContainEqual({
      gs1_attribute_id: "countryOfOrigin",
      gs1_attribute_name: "Country of Origin",
      confidence: "medium",
    });
    expect(
      result.filter((attribute) => attribute.gs1_attribute_id === "productCarbonFootprint")
    ).toHaveLength(1);
  });

  it("falls back to gs1_attributes when gs1_attribute_esrs_mapping is absent", async () => {
    const { gapAnalyzerRouter } = await import("./gap-analyzer.js");

    const relationMissing = Object.assign(
      new Error('relation "gs1_attribute_esrs_mapping" does not exist'),
      { code: "42P01" },
    );
    const mockDb = {
      execute: vi
        .fn()
        .mockRejectedValueOnce(relationMissing)
        .mockResolvedValueOnce([
          [
            {
              gs1AttributeId: "countryOfOrigin",
              gs1AttributeName: "Country of Origin",
              confidence: "low",
            },
          ],
        ]),
    };

    vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

    const caller = gapAnalyzerRouter.createCaller(mockPublicContext);
    const result = await caller.getSampleAttributes();

    expect(result).toEqual([
      {
        gs1_attribute_id: "countryOfOrigin",
        gs1_attribute_name: "Country of Origin",
        confidence: "low",
      },
    ]);
  });

  it("falls back to static mapping inventory when relational sample attribute surfaces are empty", async () => {
    const { gapAnalyzerRouter } = await import("./gap-analyzer.js");

    const relationMissing = Object.assign(
      new Error('relation "gs1_attribute_esrs_mapping" does not exist'),
      { code: "42P01" },
    );
    const mockDb = {
      execute: vi
        .fn()
        .mockRejectedValueOnce(relationMissing)
        .mockResolvedValueOnce([[]]),
    };

    vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

    const caller = gapAnalyzerRouter.createCaller(mockPublicContext);
    const result = await caller.getSampleAttributes();

    expect(result.length).toBeGreaterThan(0);
    expect(result).toContainEqual({
      gs1_attribute_id: "greenhouseGasEmissionsScope1",
      gs1_attribute_name: "Greenhouse Gas Emissions Scope 1",
      confidence: "high",
    });
  });

  it("emits a low-confidence decision artifact when coverage relies on weak mappings", async () => {
    const { gapAnalyzerRouter } = await import("./gap-analyzer.js");

    const mockDb = {
      execute: vi
        .fn()
        .mockResolvedValueOnce([
          [
            {
              mapping_id: 1,
              level: "topic",
              esrs_standard: "ESRS E1",
              esrs_topic: "Climate Change",
              data_point_name: "GHG emissions",
              short_name: "E1-1",
              definition: "Disclose GHG emissions.",
              gs1_relevance: "high",
              gs1_attribute_id: "productCarbonFootprint",
              gs1_attribute_name: "Product Carbon Footprint",
              mapping_type: "direct",
              mapping_notes: "Use existing carbon footprint field",
              confidence: "low",
            },
          ],
        ]),
    };

    vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

    const caller = gapAnalyzerRouter.createCaller(mockPublicContext);
    const result = await caller.analyze({
      sector: "general",
      companySize: "large",
      currentGs1Coverage: [],
    });

    expect(result.summary.gaps).toBe(1);
    expect(result.criticalGaps).toHaveLength(0);
    expect(result.highGaps).toHaveLength(1);
    expect(result.decisionArtifact.artifactType).toBe("gap_analysis");
    expect(result.decisionArtifact.confidence.level).toBe("low");
    expect(result.decisionArtifact.confidence.reviewRecommended).toBe(true);
    expect(result.decisionArtifact.confidence.uncertaintyClass).toBe(
      "insufficient_evidence"
    );
    expect(result.decisionArtifact.confidence.escalationAction).toBe(
      "human_review_required"
    );
    expect(result.decisionArtifact.evidence.evidenceRefs?.[0]?.evidenceKey).toBe(
      "ke:1001:hash"
    );
  });

  it("falls back to gs1_esrs_mappings-only analysis when attribute mapping table is absent", async () => {
    const { gapAnalyzerRouter } = await import("./gap-analyzer.js");

    const relationMissing = Object.assign(
      new Error('relation "gs1_attribute_esrs_mapping" does not exist'),
      { code: "42P01" },
    );
    const mockDb = {
      execute: vi
        .fn()
        .mockRejectedValueOnce(relationMissing)
        .mockResolvedValueOnce([
          [
            {
              mapping_id: 7,
              level: "topic",
              esrs_standard: "E1",
              esrs_topic: "Climate Change",
              data_point_name: "Scope 3 GHG emissions from value chain",
              short_name: "EPCIS enables Scope 3 tracking",
              definition: "Disclose Scope 3 emissions across the value chain.",
              gs1_relevance: "medium",
              gs1_attribute_id: null,
              gs1_attribute_name: null,
              mapping_type: null,
              mapping_notes: null,
              confidence: null,
            },
          ],
        ]),
    };

    vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

    const caller = gapAnalyzerRouter.createCaller(mockPublicContext);
    const result = await caller.analyze({
      sector: "general",
      companySize: "large",
      currentGs1Coverage: [],
    });

    const emittedGapTypes = [
      ...result.criticalGaps,
      ...result.highGaps,
      ...result.mediumGaps,
      ...result.lowGaps,
    ].map((gap) => gap.gapType);
    const suggestedGap = [
      ...result.criticalGaps,
      ...result.highGaps,
      ...result.mediumGaps,
      ...result.lowGaps,
    ].find((gap) => gap.suggestedAttributes.length > 0);

    expect(result.summary.totalRequirements).toBe(1);
    expect(result.summary.gaps).toBe(1);
    expect(emittedGapTypes).toContain("missing_attribute");
    expect(suggestedGap?.suggestedAttributes[0]).toMatchObject({
      attributeId: "greenhouseGasEmissionsScope3",
      attributeName: "Greenhouse Gas Emissions Scope 3",
      mappingConfidence: "high",
    });
    expect(result.decisionArtifact.evidence.dataSources).toContain("gs1_esrs_mappings");
    expect(result.decisionArtifact.evidence.dataSources).toContain("ESRS_GS1_CALIBRATIONS");
  });

  it("promotes descriptive E4 sourcing rows into governed calibration with certification and harvest evidence", async () => {
    const { gapAnalyzerRouter } = await import("./gap-analyzer.js");

    const relationMissing = Object.assign(
      new Error('relation "gs1_attribute_esrs_mapping" does not exist'),
      { code: "42P01" },
    );
    const mockDb = {
      execute: vi
        .fn()
        .mockRejectedValueOnce(relationMissing)
        .mockResolvedValueOnce([
          [
            {
              mapping_id: 11,
              level: "topic",
              esrs_standard: "E4",
              esrs_topic: "Biodiversity and ecosystems",
              data_point_name: "Agricultural product traceability",
              short_name: "Deforestation-free Supply Chain",
              definition:
                "GS1 Fresh Foods enables farm-to-fork traceability and supplier identification for biodiversity-sensitive sourcing.",
              gs1_relevance: "high",
              gs1_attribute_id: null,
              gs1_attribute_name: null,
              mapping_type: null,
              mapping_notes: null,
              confidence: null,
            },
          ],
        ]),
    };

    vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

    const caller = gapAnalyzerRouter.createCaller(mockPublicContext);
    const result = await caller.analyze({
      sector: "general",
      companySize: "large",
      currentGs1Coverage: [],
    });

    const suggestedGap = [
      ...result.criticalGaps,
      ...result.highGaps,
      ...result.mediumGaps,
      ...result.lowGaps,
    ].find((gap) => gap.suggestedAttributes.length > 0);

    expect(suggestedGap?.suggestedAttributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attributeId: "countryOfOrigin",
          attributeName: "Country Of Origin",
        }),
        expect.objectContaining({
          attributeId: "supplierInformation",
          attributeName: "Supplier Information",
        }),
        expect.objectContaining({
          attributeId: "organicCertification",
          attributeName: "Organic Certification",
          mappingConfidence: "medium",
          mappingType: "direct",
        }),
        expect.objectContaining({
          attributeId: "harvestDate",
          attributeName: "Harvest Date",
          mappingConfidence: "medium",
          mappingType: "calculated",
        }),
      ]),
    );
    expect(result.decisionArtifact.evidence.dataSources).toContain("ESRS_GS1_CALIBRATIONS");
  });

  it("humanizes reviewer-facing acronym attributes in static fallback suggestions", async () => {
    const { gapAnalyzerRouter } = await import("./gap-analyzer.js");

    const relationMissing = Object.assign(
      new Error('relation "gs1_attribute_esrs_mapping" does not exist'),
      { code: "42P01" },
    );
    const mockDb = {
      execute: vi
        .fn()
        .mockRejectedValueOnce(relationMissing)
        .mockResolvedValueOnce([
          [
            {
              mapping_id: 12,
              level: "topic",
              esrs_standard: "E1",
              esrs_topic: "Climate change",
              data_point_name: "Product carbon footprint disclosure",
              short_name: "Digital Link provides carbon footprint access",
              definition:
                "Battery Carbon Footprint and Digital Link access require product identity and instance-level traceability.",
              gs1_relevance: "high",
              gs1_attribute_id: null,
              gs1_attribute_name: null,
              mapping_type: null,
              mapping_notes: null,
              confidence: null,
            },
          ],
        ]),
    };

    vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

    const caller = gapAnalyzerRouter.createCaller(mockPublicContext);
    const result = await caller.analyze({
      sector: "general",
      companySize: "large",
      currentGs1Coverage: [],
    });

    const suggestedGap = [
      ...result.criticalGaps,
      ...result.highGaps,
      ...result.mediumGaps,
      ...result.lowGaps,
    ].find((gap) => gap.suggestedAttributes.length > 0);

    expect(suggestedGap?.suggestedAttributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attributeId: "productCarbonFootprint",
          attributeName: "Product Carbon Footprint",
        }),
        expect.objectContaining({
          attributeId: "gtin",
          attributeName: "GTIN",
        }),
      ]),
    );
    expect(
      suggestedGap?.suggestedAttributes.find((attribute) => attribute.attributeId === "gtin")
        ?.mappingType
    ).toBe("direct");
    expect(result.decisionArtifact.evidence.dataSources).toContain("ESRS_GS1_CALIBRATIONS");
  });

  it("uses calibrated lifecycle-identification suggestions instead of weak packaging fallbacks", async () => {
    const { gapAnalyzerRouter } = await import("./gap-analyzer.js");

    const relationMissing = Object.assign(
      new Error('relation "gs1_attribute_esrs_mapping" does not exist'),
      { code: "42P01" },
    );
    const mockDb = {
      execute: vi
        .fn()
        .mockRejectedValueOnce(relationMissing)
        .mockResolvedValueOnce([
          [
            {
              mapping_id: 13,
              level: "topic",
              esrs_standard: "E5",
              esrs_topic: "Resource use and circular economy",
              data_point_name: "Unique product identification for lifecycle tracking",
              short_name: "GTIN enables product lifecycle tracking",
              definition:
                "Digital Product Passport and lifecycle tracking require stable product and item identifiers for downstream lookup.",
              gs1_relevance: "high",
              gs1_attribute_id: null,
              gs1_attribute_name: null,
              mapping_type: null,
              mapping_notes: null,
              confidence: null,
            },
          ],
        ]),
    };

    vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

    const caller = gapAnalyzerRouter.createCaller(mockPublicContext);
    const result = await caller.analyze({
      sector: "general",
      companySize: "large",
      currentGs1Coverage: [],
    });

    const suggestedGap = [
      ...result.criticalGaps,
      ...result.highGaps,
      ...result.mediumGaps,
      ...result.lowGaps,
    ].find((gap) => gap.suggestedAttributes.length > 0);

    expect(suggestedGap?.suggestedAttributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attributeId: "gtin",
          attributeName: "GTIN",
          mappingConfidence: "high",
          mappingType: "direct",
        }),
        expect.objectContaining({
          attributeId: "serialNumber",
          attributeName: "Serial Number",
          mappingConfidence: "medium",
          mappingType: "direct",
        }),
      ]),
    );
    expect(suggestedGap?.suggestedAttributes).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ attributeId: "packagingRecyclabilityClass" }),
      ]),
    );
    expect(result.decisionArtifact.evidence.dataSources).toContain("ESRS_GS1_CALIBRATIONS");
  });

  it("uses calibrated logistics-emissions suggestions instead of default scope-1 fallback", async () => {
    const { gapAnalyzerRouter } = await import("./gap-analyzer.js");

    const relationMissing = Object.assign(
      new Error('relation "gs1_attribute_esrs_mapping" does not exist'),
      { code: "42P01" },
    );
    const mockDb = {
      execute: vi
        .fn()
        .mockRejectedValueOnce(relationMissing)
        .mockResolvedValueOnce([
          [
            {
              mapping_id: 15,
              level: "topic",
              esrs_standard: "E1",
              esrs_topic: "Climate change",
              data_point_name: "Transport and logistics emissions",
              short_name: "SSCC enables logistics emissions tracking",
              definition:
                "Supply-chain logistics emissions should be traced across value-chain movements instead of defaulting to facility-only totals.",
              gs1_relevance: "high",
              gs1_attribute_id: null,
              gs1_attribute_name: null,
              mapping_type: null,
              mapping_notes: null,
              confidence: null,
            },
          ],
        ]),
    };

    vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

    const caller = gapAnalyzerRouter.createCaller(mockPublicContext);
    const result = await caller.analyze({
      sector: "general",
      companySize: "large",
      currentGs1Coverage: [],
    });

    const suggestedGap = [
      ...result.criticalGaps,
      ...result.highGaps,
      ...result.mediumGaps,
      ...result.lowGaps,
    ].find((gap) => gap.suggestedAttributes.length > 0);

    expect(suggestedGap?.suggestedAttributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attributeId: "greenhouseGasEmissionsScope3",
          attributeName: "Greenhouse Gas Emissions Scope 3",
          mappingConfidence: "high",
          mappingType: "direct",
        }),
        expect.objectContaining({
          attributeId: "supplyChainEmissionsCategory",
          attributeName: "Supply Chain Emissions Category",
          mappingConfidence: "medium",
          mappingType: "aggregated",
        }),
      ]),
    );
    expect(suggestedGap?.suggestedAttributes).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ attributeId: "greenhouseGasEmissionsScope1" }),
      ]),
    );
    expect(result.decisionArtifact.evidence.dataSources).toContain("ESRS_GS1_CALIBRATIONS");
  });

  it("promotes product-compliance tracking into governed calibration instead of heuristic fallback", async () => {
    const { gapAnalyzerRouter } = await import("./gap-analyzer.js");

    const relationMissing = Object.assign(
      new Error('relation "gs1_attribute_esrs_mapping" does not exist'),
      { code: "42P01" },
    );
    const mockDb = {
      execute: vi
        .fn()
        .mockRejectedValueOnce(relationMissing)
        .mockResolvedValueOnce([
          [
            {
              mapping_id: 14,
              level: "topic",
              esrs_standard: "E2",
              esrs_topic: "Pollution",
              data_point_name: "Product regulatory compliance tracking",
              short_name: "GTIN links to compliance data",
              definition:
                "Compliance disclosures need hazardous-substance payloads linked to a stable product identity and responsible supplier context.",
              gs1_relevance: "high",
              gs1_attribute_id: null,
              gs1_attribute_name: null,
              mapping_type: null,
              mapping_notes: null,
              confidence: null,
            },
          ],
        ]),
    };

    vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

    const caller = gapAnalyzerRouter.createCaller(mockPublicContext);
    const result = await caller.analyze({
      sector: "general",
      companySize: "large",
      currentGs1Coverage: [],
    });

    const suggestedGap = [
      ...result.criticalGaps,
      ...result.highGaps,
      ...result.mediumGaps,
      ...result.lowGaps,
    ].find((gap) => gap.suggestedAttributes.length > 0);

    expect(suggestedGap?.suggestedAttributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attributeId: "hazardousSubstances",
          mappingConfidence: "high",
          mappingType: "direct",
        }),
        expect.objectContaining({
          attributeId: "gtin",
          attributeName: "GTIN",
          mappingConfidence: "medium",
          mappingType: "direct",
        }),
        expect.objectContaining({
          attributeId: "supplierInformation",
          attributeName: "Supplier Information",
          mappingConfidence: "medium",
          mappingType: "direct",
        }),
      ]),
    );
    expect(result.decisionArtifact.evidence.dataSources).toContain("ESRS_GS1_CALIBRATIONS");
  });

  it("promotes ESRS 2 value-chain context into governed calibration and drops weak GTIN expansion", async () => {
    const { gapAnalyzerRouter } = await import("./gap-analyzer.js");

    const relationMissing = Object.assign(
      new Error('relation "gs1_attribute_esrs_mapping" does not exist'),
      { code: "42P01" },
    );
    const mockDb = {
      execute: vi
        .fn()
        .mockRejectedValueOnce(relationMissing)
        .mockResolvedValueOnce([
          [
            {
              mapping_id: 17,
              level: "topic",
              esrs_standard: "ESRS 2",
              esrs_topic: "General disclosures",
              data_point_name: "Standardized business vocabulary",
              short_name: "CBV ensures data consistency",
              definition:
                "Value-chain documentation should prioritize party and location identity plus supplier context over product-level expansion.",
              gs1_relevance: "high",
              gs1_attribute_id: null,
              gs1_attribute_name: null,
              mapping_type: null,
              mapping_notes: null,
              confidence: null,
            },
          ],
        ]),
    };

    vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

    const caller = gapAnalyzerRouter.createCaller(mockPublicContext);
    const result = await caller.analyze({
      sector: "general",
      companySize: "large",
      currentGs1Coverage: [],
    });

    const suggestedGap = [
      ...result.criticalGaps,
      ...result.highGaps,
      ...result.mediumGaps,
      ...result.lowGaps,
    ].find((gap) => gap.suggestedAttributes.length > 0);

    expect(suggestedGap?.suggestedAttributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attributeId: "gln",
          attributeName: "GLN",
          mappingConfidence: "high",
          mappingType: "direct",
        }),
        expect.objectContaining({
          attributeId: "supplierInformation",
          attributeName: "Supplier Information",
          mappingConfidence: "medium",
          mappingType: "direct",
        }),
      ]),
    );
    expect(suggestedGap?.suggestedAttributes).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ attributeId: "gtin" }),
      ]),
    );
    expect(result.decisionArtifact.evidence.dataSources).toContain("ESRS_GS1_CALIBRATIONS");
  });

  it("promotes S1 due-diligence geography into governed calibration", async () => {
    const { gapAnalyzerRouter } = await import("./gap-analyzer.js");

    const relationMissing = Object.assign(
      new Error('relation "gs1_attribute_esrs_mapping" does not exist'),
      { code: "42P01" },
    );
    const mockDb = {
      execute: vi
        .fn()
        .mockRejectedValueOnce(relationMissing)
        .mockResolvedValueOnce([
          [
            {
              mapping_id: 25,
              level: "topic",
              esrs_standard: "S1",
              esrs_topic: "Own workforce and due diligence",
              data_point_name: "Supply chain due diligence",
              short_name: "EPCIS supports supply chain transparency",
              definition:
                "Due-diligence traceability should prioritize supplier identity and geography-sensitive sourcing context.",
              gs1_relevance: "high",
              gs1_attribute_id: null,
              gs1_attribute_name: null,
              mapping_type: null,
              mapping_notes: null,
              confidence: null,
            },
          ],
        ]),
    };

    vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

    const caller = gapAnalyzerRouter.createCaller(mockPublicContext);
    const result = await caller.analyze({
      sector: "general",
      companySize: "large",
      currentGs1Coverage: [],
    });

    const suggestedGap = [
      ...result.criticalGaps,
      ...result.highGaps,
      ...result.mediumGaps,
      ...result.lowGaps,
    ].find((gap) => gap.suggestedAttributes.length > 0);

    expect(suggestedGap?.suggestedAttributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attributeId: "supplierInformation",
          mappingConfidence: "high",
          mappingType: "direct",
        }),
        expect.objectContaining({
          attributeId: "gln",
          attributeName: "GLN",
          mappingConfidence: "high",
          mappingType: "direct",
        }),
        expect.objectContaining({
          attributeId: "countryOfOrigin",
          attributeName: "Country Of Origin",
          mappingConfidence: "medium",
          mappingType: "direct",
        }),
      ]),
    );
    expect(result.decisionArtifact.evidence.dataSources).toContain("ESRS_GS1_CALIBRATIONS");
  });

  it("promotes S2 value-chain geography into governed calibration", async () => {
    const { gapAnalyzerRouter } = await import("./gap-analyzer.js");

    const relationMissing = Object.assign(
      new Error('relation "gs1_attribute_esrs_mapping" does not exist'),
      { code: "42P01" },
    );
    const mockDb = {
      execute: vi
        .fn()
        .mockRejectedValueOnce(relationMissing)
        .mockResolvedValueOnce([
          [
            {
              mapping_id: 26,
              level: "topic",
              esrs_standard: "S2",
              esrs_topic: "Workers in the value chain",
              data_point_name: "Value chain mapping",
              short_name: "GLN enables supplier identification",
              definition:
                "Value-chain mapping should prioritize supplier identity and geography-sensitive sourcing context.",
              gs1_relevance: "high",
              gs1_attribute_id: null,
              gs1_attribute_name: null,
              mapping_type: null,
              mapping_notes: null,
              confidence: null,
            },
          ],
        ]),
    };

    vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

    const caller = gapAnalyzerRouter.createCaller(mockPublicContext);
    const result = await caller.analyze({
      sector: "general",
      companySize: "large",
      currentGs1Coverage: [],
    });

    const suggestedGap = [
      ...result.criticalGaps,
      ...result.highGaps,
      ...result.mediumGaps,
      ...result.lowGaps,
    ].find((gap) => gap.suggestedAttributes.length > 0);

    expect(suggestedGap?.suggestedAttributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attributeId: "gln",
          attributeName: "GLN",
          mappingConfidence: "high",
          mappingType: "direct",
        }),
        expect.objectContaining({
          attributeId: "supplierInformation",
          mappingConfidence: "high",
          mappingType: "direct",
        }),
        expect.objectContaining({
          attributeId: "countryOfOrigin",
          attributeName: "Country Of Origin",
          mappingConfidence: "medium",
          mappingType: "direct",
        }),
      ]),
    );
    expect(result.decisionArtifact.evidence.dataSources).toContain("ESRS_GS1_CALIBRATIONS");
  });

  it("promotes E1 value-chain emissions segmentation into governed calibration", async () => {
    const { gapAnalyzerRouter } = await import("./gap-analyzer.js");

    const relationMissing = Object.assign(
      new Error('relation "gs1_attribute_esrs_mapping" does not exist'),
      { code: "42P01" },
    );
    const mockDb = {
      execute: vi
        .fn()
        .mockRejectedValueOnce(relationMissing)
        .mockResolvedValueOnce([
          [
            {
              mapping_id: 27,
              level: "topic",
              esrs_standard: "E1",
              esrs_topic: "Climate change",
              data_point_name: "Scope 3 GHG emissions from value chain",
              short_name: "EPCIS enables Scope 3 tracking",
              definition:
                "Value-chain emissions disclosure should include the Scope 3 total and category segmentation for reviewer-facing analysis.",
              gs1_relevance: "high",
              gs1_attribute_id: null,
              gs1_attribute_name: null,
              mapping_type: null,
              mapping_notes: null,
              confidence: null,
            },
          ],
        ]),
    };

    vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

    const caller = gapAnalyzerRouter.createCaller(mockPublicContext);
    const result = await caller.analyze({
      sector: "general",
      companySize: "large",
      currentGs1Coverage: [],
    });

    const suggestedGap = [
      ...result.criticalGaps,
      ...result.highGaps,
      ...result.mediumGaps,
      ...result.lowGaps,
    ].find((gap) => gap.suggestedAttributes.length > 0);

    expect(suggestedGap?.suggestedAttributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attributeId: "greenhouseGasEmissionsScope3",
          mappingConfidence: "high",
          mappingType: "direct",
        }),
        expect.objectContaining({
          attributeId: "supplyChainEmissionsCategory",
          mappingConfidence: "medium",
          mappingType: "aggregated",
        }),
      ]),
    );
    expect(result.decisionArtifact.evidence.dataSources).toContain("ESRS_GS1_CALIBRATIONS");
  });

  it("promotes E1 energy-mix disclosure into governed calibration", async () => {
    const { gapAnalyzerRouter } = await import("./gap-analyzer.js");

    const relationMissing = Object.assign(
      new Error('relation "gs1_attribute_esrs_mapping" does not exist'),
      { code: "42P01" },
    );
    const mockDb = {
      execute: vi
        .fn()
        .mockRejectedValueOnce(relationMissing)
        .mockResolvedValueOnce([
          [
            {
              mapping_id: 29,
              level: "topic",
              esrs_standard: "E1",
              esrs_topic: "Climate change",
              data_point_name: "Energy consumption from non-renewable sources",
              short_name: "EPCIS tracks energy-intensive processes",
              definition:
                "Energy-use disclosure should be anchored in total energy consumption and renewable-energy mix rather than weak proxy fields.",
              gs1_relevance: "high",
              gs1_attribute_id: null,
              gs1_attribute_name: null,
              mapping_type: null,
              mapping_notes: null,
              confidence: null,
            },
          ],
        ]),
    };

    vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

    const caller = gapAnalyzerRouter.createCaller(mockPublicContext);
    const result = await caller.analyze({
      sector: "general",
      companySize: "large",
      currentGs1Coverage: [],
    });

    const suggestedGap = [
      ...result.criticalGaps,
      ...result.highGaps,
      ...result.mediumGaps,
      ...result.lowGaps,
    ].find((gap) => gap.suggestedAttributes.length > 0);

    expect(suggestedGap?.suggestedAttributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attributeId: "totalEnergyConsumption",
          mappingConfidence: "high",
          mappingType: "direct",
        }),
        expect.objectContaining({
          attributeId: "renewableEnergyShare",
          mappingConfidence: "medium",
          mappingType: "direct",
        }),
      ]),
    );
    expect(result.decisionArtifact.evidence.dataSources).toContain("ESRS_GS1_CALIBRATIONS");
  });

  it("promotes E3 seafood traceability into governed calibration", async () => {
    const { gapAnalyzerRouter } = await import("./gap-analyzer.js");

    const relationMissing = Object.assign(
      new Error('relation "gs1_attribute_esrs_mapping" does not exist'),
      { code: "42P01" },
    );
    const mockDb = {
      execute: vi
        .fn()
        .mockRejectedValueOnce(relationMissing)
        .mockResolvedValueOnce([
          [
            {
              mapping_id: 28,
              level: "topic",
              esrs_standard: "E3",
              esrs_topic: "Water and marine resources",
              data_point_name: "Seafood traceability",
              short_name: "GS1 Fresh Foods enables seafood traceability",
              definition:
                "Seafood traceability should prioritize provenance origin, harvest timing, and lot identity for chain-of-custody review.",
              gs1_relevance: "high",
              gs1_attribute_id: null,
              gs1_attribute_name: null,
              mapping_type: null,
              mapping_notes: null,
              confidence: null,
            },
          ],
        ]),
    };

    vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

    const caller = gapAnalyzerRouter.createCaller(mockPublicContext);
    const result = await caller.analyze({
      sector: "general",
      companySize: "large",
      currentGs1Coverage: [],
    });

    const suggestedGap = [
      ...result.criticalGaps,
      ...result.highGaps,
      ...result.mediumGaps,
      ...result.lowGaps,
    ].find((gap) => gap.suggestedAttributes.length > 0);

    expect(suggestedGap?.suggestedAttributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attributeId: "countryOfOrigin",
          mappingConfidence: "high",
          mappingType: "direct",
        }),
        expect.objectContaining({
          attributeId: "harvestDate",
          mappingConfidence: "medium",
          mappingType: "calculated",
        }),
        expect.objectContaining({
          attributeId: "batchNumber",
          mappingConfidence: "medium",
          mappingType: "direct",
        }),
      ]),
    );
    expect(result.decisionArtifact.evidence.dataSources).toContain("ESRS_GS1_CALIBRATIONS");
  });

  it("promotes S4 healthcare traceability into governed calibration and drops weak sterilization expansion", async () => {
    const { gapAnalyzerRouter } = await import("./gap-analyzer.js");

    const relationMissing = Object.assign(
      new Error('relation "gs1_attribute_esrs_mapping" does not exist'),
      { code: "42P01" },
    );
    const mockDb = {
      execute: vi
        .fn()
        .mockRejectedValueOnce(relationMissing)
        .mockResolvedValueOnce([
          [
            {
              mapping_id: 30,
              level: "topic",
              esrs_standard: "S4",
              esrs_topic: "Consumers and end-users",
              data_point_name: "Healthcare product traceability",
              short_name: "GS1 Healthcare enables patient safety",
              definition:
                "Healthcare traceability should prioritize product identity, serialisation, and expiry control for patient-safety review.",
              gs1_relevance: "high",
              gs1_attribute_id: null,
              gs1_attribute_name: null,
              mapping_type: null,
              mapping_notes: null,
              confidence: null,
            },
          ],
        ]),
    };

    vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

    const caller = gapAnalyzerRouter.createCaller(mockPublicContext);
    const result = await caller.analyze({
      sector: "general",
      companySize: "large",
      currentGs1Coverage: [],
    });

    const suggestedGap = [
      ...result.criticalGaps,
      ...result.highGaps,
      ...result.mediumGaps,
      ...result.lowGaps,
    ].find((gap) => gap.suggestedAttributes.length > 0);

    expect(suggestedGap?.suggestedAttributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attributeId: "gtin",
          attributeName: "GTIN",
          mappingConfidence: "high",
          mappingType: "direct",
        }),
        expect.objectContaining({
          attributeId: "serialNumber",
          attributeName: "Serial Number",
          mappingConfidence: "high",
          mappingType: "direct",
        }),
        expect.objectContaining({
          attributeId: "expirationDate",
          attributeName: "Expiration Date",
          mappingConfidence: "medium",
          mappingType: "direct",
        }),
      ]),
    );
    expect(suggestedGap?.suggestedAttributes).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ attributeId: "sterilizationMethod" }),
      ]),
    );
    expect(result.decisionArtifact.evidence.dataSources).toContain("ESRS_GS1_CALIBRATIONS");
  });

  it("promotes generic DPP access into governed material-composition calibration without battery leakage", async () => {
    const { gapAnalyzerRouter } = await import("./gap-analyzer.js");

    const relationMissing = Object.assign(
      new Error('relation "gs1_attribute_esrs_mapping" does not exist'),
      { code: "42P01" },
    );
    const mockDb = {
      execute: vi
        .fn()
        .mockRejectedValueOnce(relationMissing)
        .mockResolvedValueOnce([
          [
            {
              mapping_id: 18,
              level: "topic",
              esrs_standard: "E5",
              esrs_topic: "Resource use and circular economy",
              data_point_name: "Digital Product Passport data carrier",
              short_name: "Digital Link enables DPP access",
              definition:
                "Digital Product Passport access requires a stable GS1 identity and consistent core payload fields for downstream lookup.",
              gs1_relevance: "high",
              gs1_attribute_id: null,
              gs1_attribute_name: null,
              mapping_type: null,
              mapping_notes: null,
              confidence: null,
            },
          ],
        ]),
    };

    vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

    const caller = gapAnalyzerRouter.createCaller(mockPublicContext);
    const result = await caller.analyze({
      sector: "general",
      companySize: "large",
      currentGs1Coverage: [],
    });

    const suggestedGap = [
      ...result.criticalGaps,
      ...result.highGaps,
      ...result.mediumGaps,
      ...result.lowGaps,
    ].find((gap) => gap.suggestedAttributes.length > 0);

    expect(suggestedGap?.suggestedAttributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attributeId: "gtin",
          attributeName: "GTIN",
          mappingConfidence: "high",
        }),
        expect.objectContaining({
          attributeId: "serialNumber",
          attributeName: "Serial Number",
          mappingConfidence: "high",
        }),
        expect.objectContaining({
          attributeId: "materialComposition",
          attributeName: "Material Composition",
          mappingConfidence: "medium",
          mappingType: "direct",
        }),
      ]),
    );
    expect(suggestedGap?.suggestedAttributes).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ attributeId: "batteryInformation" }),
      ]),
    );
    expect(result.decisionArtifact.evidence.dataSources).toContain("ESRS_GS1_CALIBRATIONS");
  });

  it("promotes textile DPP payload semantics into governed material-composition calibration", async () => {
    const { gapAnalyzerRouter } = await import("./gap-analyzer.js");

    const relationMissing = Object.assign(
      new Error('relation "gs1_attribute_esrs_mapping" does not exist'),
      { code: "42P01" },
    );
    const mockDb = {
      execute: vi
        .fn()
        .mockRejectedValueOnce(relationMissing)
        .mockResolvedValueOnce([
          [
            {
              mapping_id: 19,
              level: "topic",
              esrs_standard: "E5",
              esrs_topic: "Resource use and circular economy",
              data_point_name: "Digital Product Passport - Textile",
              short_name: "Textile DPP",
              definition:
                "Textile passports require product identity and material composition for circularity and recycling review.",
              gs1_relevance: "high",
              gs1_attribute_id: null,
              gs1_attribute_name: null,
              mapping_type: null,
              mapping_notes: null,
              confidence: null,
            },
          ],
        ]),
    };

    vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

    const caller = gapAnalyzerRouter.createCaller(mockPublicContext);
    const result = await caller.analyze({
      sector: "general",
      companySize: "large",
      currentGs1Coverage: [],
    });

    const suggestedGap = [
      ...result.criticalGaps,
      ...result.highGaps,
      ...result.mediumGaps,
      ...result.lowGaps,
    ].find((gap) => gap.suggestedAttributes.length > 0);

    expect(suggestedGap?.suggestedAttributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attributeId: "gtin",
          attributeName: "GTIN",
          mappingConfidence: "high",
        }),
        expect.objectContaining({
          attributeId: "serialNumber",
          attributeName: "Serial Number",
          mappingConfidence: "high",
        }),
        expect.objectContaining({
          attributeId: "materialComposition",
          attributeName: "Material Composition",
          mappingConfidence: "high",
          mappingType: "direct",
        }),
      ]),
    );
    expect(suggestedGap?.suggestedAttributes).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ attributeId: "batteryInformation" }),
      ]),
    );
    expect(result.decisionArtifact.evidence.dataSources).toContain("ESRS_GS1_CALIBRATIONS");
  });

  it("promotes electronics DPP payload semantics and keeps battery information only where justified", async () => {
    const { gapAnalyzerRouter } = await import("./gap-analyzer.js");

    const relationMissing = Object.assign(
      new Error('relation "gs1_attribute_esrs_mapping" does not exist'),
      { code: "42P01" },
    );
    const mockDb = {
      execute: vi
        .fn()
        .mockRejectedValueOnce(relationMissing)
        .mockResolvedValueOnce([
          [
            {
              mapping_id: 20,
              level: "topic",
              esrs_standard: "E5",
              esrs_topic: "Resource use and circular economy",
              data_point_name: "Digital Product Passport - Electronics",
              short_name: "Electronics DPP",
              definition:
                "Electronics passports require product identity, material composition, and battery-relevant payload details for downstream compliance review.",
              gs1_relevance: "high",
              gs1_attribute_id: null,
              gs1_attribute_name: null,
              mapping_type: null,
              mapping_notes: null,
              confidence: null,
            },
          ],
        ]),
    };

    vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

    const caller = gapAnalyzerRouter.createCaller(mockPublicContext);
    const result = await caller.analyze({
      sector: "general",
      companySize: "large",
      currentGs1Coverage: [],
    });

    const suggestedGap = [
      ...result.criticalGaps,
      ...result.highGaps,
      ...result.mediumGaps,
      ...result.lowGaps,
    ].find((gap) => gap.suggestedAttributes.length > 0);

    expect(suggestedGap?.suggestedAttributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attributeId: "gtin",
          attributeName: "GTIN",
          mappingConfidence: "high",
        }),
        expect.objectContaining({
          attributeId: "serialNumber",
          attributeName: "Serial Number",
          mappingConfidence: "high",
        }),
        expect.objectContaining({
          attributeId: "materialComposition",
          attributeName: "Material Composition",
          mappingConfidence: "high",
          mappingType: "direct",
        }),
        expect.objectContaining({
          attributeId: "batteryInformation",
          attributeName: "Battery Information",
          mappingConfidence: "medium",
          mappingType: "direct",
        }),
      ]),
    );
    expect(result.decisionArtifact.evidence.dataSources).toContain("ESRS_GS1_CALIBRATIONS");
  });

  it("promotes repair and recycling access into governed calibration with warranty support", async () => {
    const { gapAnalyzerRouter } = await import("./gap-analyzer.js");

    const relationMissing = Object.assign(
      new Error('relation "gs1_attribute_esrs_mapping" does not exist'),
      { code: "42P01" },
    );
    const mockDb = {
      execute: vi
        .fn()
        .mockRejectedValueOnce(relationMissing)
        .mockResolvedValueOnce([
          [
            {
              mapping_id: 21,
              level: "topic",
              esrs_standard: "E5",
              esrs_topic: "Resource use and circular economy",
              data_point_name: "Repair and recycling information access",
              short_name: "Digital Link enables repair/recycle info",
              definition:
                "Circularity disclosures need direct repair guidance plus durability support fields for downstream product access.",
              gs1_relevance: "high",
              gs1_attribute_id: null,
              gs1_attribute_name: null,
              mapping_type: null,
              mapping_notes: null,
              confidence: null,
            },
          ],
        ]),
    };

    vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

    const caller = gapAnalyzerRouter.createCaller(mockPublicContext);
    const result = await caller.analyze({
      sector: "general",
      companySize: "large",
      currentGs1Coverage: [],
    });

    const suggestedGap = [
      ...result.criticalGaps,
      ...result.highGaps,
      ...result.mediumGaps,
      ...result.lowGaps,
    ].find((gap) => gap.suggestedAttributes.length > 0);

    expect(suggestedGap?.suggestedAttributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attributeId: "repairabilityScore",
          mappingConfidence: "high",
          mappingType: "direct",
        }),
        expect.objectContaining({
          attributeId: "endOfLifeInstructions",
          mappingConfidence: "high",
          mappingType: "direct",
        }),
        expect.objectContaining({
          attributeId: "warrantyInformation",
          mappingConfidence: "medium",
          mappingType: "direct",
        }),
      ]),
    );
    expect(result.decisionArtifact.evidence.dataSources).toContain("ESRS_GS1_CALIBRATIONS");
  });

  it("tightens product recyclability by dropping weak warranty expansion", async () => {
    const { gapAnalyzerRouter } = await import("./gap-analyzer.js");

    const relationMissing = Object.assign(
      new Error('relation "gs1_attribute_esrs_mapping" does not exist'),
      { code: "42P01" },
    );
    const mockDb = {
      execute: vi
        .fn()
        .mockRejectedValueOnce(relationMissing)
        .mockResolvedValueOnce([
          [
            {
              mapping_id: 22,
              level: "topic",
              esrs_standard: "E5",
              esrs_topic: "Resource use and circular economy",
              data_point_name: "Resource Outflows - Recyclability",
              short_name: "Product Recyclability",
              definition:
                "Recyclability disclosures should prioritise direct repairability and end-of-life guidance over weaker durability proxies.",
              gs1_relevance: "high",
              gs1_attribute_id: null,
              gs1_attribute_name: null,
              mapping_type: null,
              mapping_notes: null,
              confidence: null,
            },
          ],
        ]),
    };

    vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

    const caller = gapAnalyzerRouter.createCaller(mockPublicContext);
    const result = await caller.analyze({
      sector: "general",
      companySize: "large",
      currentGs1Coverage: [],
    });

    const suggestedGap = [
      ...result.criticalGaps,
      ...result.highGaps,
      ...result.mediumGaps,
      ...result.lowGaps,
    ].find((gap) => gap.suggestedAttributes.length > 0);

    expect(suggestedGap?.suggestedAttributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ attributeId: "repairabilityScore" }),
        expect.objectContaining({ attributeId: "endOfLifeInstructions" }),
      ]),
    );
    expect(suggestedGap?.suggestedAttributes).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ attributeId: "warrantyInformation" }),
      ]),
    );
    expect(result.decisionArtifact.evidence.dataSources).toContain("ESRS_GS1_CALIBRATIONS");
  });

  it("promotes circular asset tracking into governed calibration with serialized support", async () => {
    const { gapAnalyzerRouter } = await import("./gap-analyzer.js");

    const relationMissing = Object.assign(
      new Error('relation "gs1_attribute_esrs_mapping" does not exist'),
      { code: "42P01" },
    );
    const mockDb = {
      execute: vi
        .fn()
        .mockRejectedValueOnce(relationMissing)
        .mockResolvedValueOnce([
          [
            {
              mapping_id: 23,
              level: "topic",
              esrs_standard: "E5",
              esrs_topic: "Resource use and circular economy",
              data_point_name: "Returnable asset tracking",
              short_name: "GRAI enables circular asset management",
              definition:
                "Returnable asset workflows need stable material context and serialized identity for circular asset tracking.",
              gs1_relevance: "high",
              gs1_attribute_id: null,
              gs1_attribute_name: null,
              mapping_type: null,
              mapping_notes: null,
              confidence: null,
            },
          ],
        ]),
    };

    vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

    const caller = gapAnalyzerRouter.createCaller(mockPublicContext);
    const result = await caller.analyze({
      sector: "general",
      companySize: "large",
      currentGs1Coverage: [],
    });

    const suggestedGap = [
      ...result.criticalGaps,
      ...result.highGaps,
      ...result.mediumGaps,
      ...result.lowGaps,
    ].find((gap) => gap.suggestedAttributes.length > 0);

    expect(suggestedGap?.suggestedAttributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attributeId: "materialComposition",
          mappingConfidence: "high",
          mappingType: "direct",
        }),
        expect.objectContaining({
          attributeId: "recycledContentPercentage",
          mappingConfidence: "high",
          mappingType: "direct",
        }),
        expect.objectContaining({
          attributeId: "serialNumber",
          mappingConfidence: "medium",
          mappingType: "direct",
        }),
      ]),
    );
    expect(result.decisionArtifact.evidence.dataSources).toContain("ESRS_GS1_CALIBRATIONS");
  });

  it("tightens recycled-content disclosure by dropping weak serial-number expansion", async () => {
    const { gapAnalyzerRouter } = await import("./gap-analyzer.js");

    const relationMissing = Object.assign(
      new Error('relation "gs1_attribute_esrs_mapping" does not exist'),
      { code: "42P01" },
    );
    const mockDb = {
      execute: vi
        .fn()
        .mockRejectedValueOnce(relationMissing)
        .mockResolvedValueOnce([
          [
            {
              mapping_id: 24,
              level: "topic",
              esrs_standard: "E5",
              esrs_topic: "Resource use and circular economy",
              data_point_name: "Resource Inflows - Recycled Content",
              short_name: "Recycled Content",
              definition:
                "Recycled-content disclosure should be anchored in composition and percentage payloads rather than item serialisation.",
              gs1_relevance: "high",
              gs1_attribute_id: null,
              gs1_attribute_name: null,
              mapping_type: null,
              mapping_notes: null,
              confidence: null,
            },
          ],
        ]),
    };

    vi.mocked(dbModule.getDb).mockResolvedValue(mockDb as any);

    const caller = gapAnalyzerRouter.createCaller(mockPublicContext);
    const result = await caller.analyze({
      sector: "general",
      companySize: "large",
      currentGs1Coverage: [],
    });

    const suggestedGap = [
      ...result.criticalGaps,
      ...result.highGaps,
      ...result.mediumGaps,
      ...result.lowGaps,
    ].find((gap) => gap.suggestedAttributes.length > 0);

    expect(suggestedGap?.suggestedAttributes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          attributeId: "materialComposition",
          mappingConfidence: "high",
          mappingType: "direct",
        }),
        expect.objectContaining({
          attributeId: "recycledContentPercentage",
          mappingConfidence: "high",
          mappingType: "direct",
        }),
      ]),
    );
    expect(suggestedGap?.suggestedAttributes).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({ attributeId: "serialNumber" }),
      ]),
    );
    expect(result.decisionArtifact.evidence.dataSources).toContain("ESRS_GS1_CALIBRATIONS");
  });
});
