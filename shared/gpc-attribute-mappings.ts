export type MappingConfidenceLevel = "exact" | "partial" | "none";

export interface GPCAttributeMappingTarget {
  gs1AttributeCode: string;
  gs1Standard: string;
  confidence: MappingConfidenceLevel;
  notes?: string;
}

export interface GPCAttributeMappingRule {
  gpcBrick: string;
  gpcAttribute: string;
  targets: GPCAttributeMappingTarget[];
}

export const GPC_ATTRIBUTE_MAPPINGS: GPCAttributeMappingRule[] = [
  {
    gpcBrick: "10000123",
    gpcAttribute: "netContent",
    targets: [
      {
        gs1AttributeCode: "NET_CONTENT_VALUE",
        gs1Standard: "GDSN",
        confidence: "exact",
        notes: "Numeric part of the GPC netContent field."
      },
      {
        gs1AttributeCode: "NET_CONTENT_UOM",
        gs1Standard: "GDSN",
        confidence: "exact",
        notes: "Unit of measure parsed from the GPC netContent field."
      }
    ]
  },
  {
    gpcBrick: "10000123",
    gpcAttribute: "allergenInfo",
    targets: [
      {
        gs1AttributeCode: "ALLERGEN_STATEMENT",
        gs1Standard: "GDSN",
        confidence: "exact",
        notes: "Free text allergen statement for dairy cheese products."
      }
    ]
  },
  {
    gpcBrick: "10000123",
    gpcAttribute: "brandName",
    targets: [
      {
        gs1AttributeCode: "BRAND_NAME",
        gs1Standard: "GDSN",
        confidence: "exact",
        notes: "Consumer facing brand name for cheese."
      }
    ]
  },
  {
    gpcBrick: "10000234",
    gpcAttribute: "netContent",
    targets: [
      {
        gs1AttributeCode: "NET_CONTENT_VALUE",
        gs1Standard: "GDSN",
        confidence: "partial",
        notes: "Net content mapped without product form specific adjustments."
      },
      {
        gs1AttributeCode: "NET_CONTENT_UOM",
        gs1Standard: "GDSN",
        confidence: "partial",
        notes: "Unit of measure mapped without form specific adjustments."
      }
    ]
  },
  {
    gpcBrick: "10000234",
    gpcAttribute: "brandName",
    targets: [
      {
        gs1AttributeCode: "BRAND_NAME",
        gs1Standard: "GDSN",
        confidence: "exact",
        notes: "Brand mapping for ambient foods."
      }
    ]
  },
  {
    gpcBrick: "10000345",
    gpcAttribute: "netContent",
    targets: [
      {
        gs1AttributeCode: "NET_CONTENT_VALUE",
        gs1Standard: "GDSN",
        confidence: "partial",
        notes: "Net content for beverage products."
      },
      {
        gs1AttributeCode: "NET_CONTENT_UOM",
        gs1Standard: "GDSN",
        confidence: "partial",
        notes: "Unit of measure for beverage products."
      }
    ]
  },
  {
    gpcBrick: "10000345",
    gpcAttribute: "brandName",
    targets: [
      {
        gs1AttributeCode: "BRAND_NAME",
        gs1Standard: "GDSN",
        confidence: "exact",
        notes: "Brand mapping for beverages."
      }
    ]
  },
  {
    gpcBrick: "*",
    gpcAttribute: "brandName",
    targets: [
      {
        gs1AttributeCode: "BRAND_NAME",
        gs1Standard: "GDSN",
        confidence: "partial",
        notes: "Generic brand name mapping for bricks without specific rule."
      }
    ]
  },
  {
    gpcBrick: "*",
    gpcAttribute: "allergenInfo",
    targets: [
      {
        gs1AttributeCode: "ALLERGEN_STATEMENT",
        gs1Standard: "GDSN",
        confidence: "partial",
        notes: "Generic allergen information mapping."
      }
    ]
  },
  {
    gpcBrick: "*",
    gpcAttribute: "netContent",
    targets: [
      {
        gs1AttributeCode: "NET_CONTENT_VALUE",
        gs1Standard: "GDSN",
        confidence: "none",
        notes: "Fallback net content mapping when brick specific rules are missing."
      },
      {
        gs1AttributeCode: "NET_CONTENT_UOM",
        gs1Standard: "GDSN",
        confidence: "none",
        notes: "Fallback unit of measure mapping."
      }
    ]
  }
];

