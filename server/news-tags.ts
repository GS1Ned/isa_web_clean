/**
 * GS1 Impact Tags and Sector Tags
 * Standardized enums for categorizing news by GS1 relevance and business sector
 */

/**
 * GS1 Impact Tags - Categories of how regulations affect GS1 standards and data models
 */
export const GS1_IMPACT_TAGS = {
  IDENTIFICATION: "IDENTIFICATION", // GTIN, GLN, SSCC, GRAI, GIAI, etc.
  PACKAGING_ATTRIBUTES: "PACKAGING_ATTRIBUTES", // Material, recyclability, dimensions, weight
  ESG_REPORTING: "ESG_REPORTING", // CSRD/ESRS data requirements, sustainability metrics
  DUE_DILIGENCE: "DUE_DILIGENCE", // Supply chain transparency, EUDR compliance
  TRACEABILITY: "TRACEABILITY", // EPCIS, batch tracking, origin verification
  DPP: "DPP", // Digital Product Passport requirements, QR codes, Digital Link
  BATTERY_PASSPORT: "BATTERY_PASSPORT", // Battery-specific DPP, lifecycle data
  HEALTHCARE_SUSTAINABILITY: "HEALTHCARE_SUSTAINABILITY", // Green Deal Healthcare, medical waste
  FOOD_SAFETY: "FOOD_SAFETY", // Food traceability, allergens, origin
  LOGISTICS_OPTIMIZATION: "LOGISTICS_OPTIMIZATION", // Zero-emission zones, route optimization
  CIRCULAR_ECONOMY: "CIRCULAR_ECONOMY", // Reuse, repair, recycling, take-back schemes
  PRODUCT_MASTER_DATA: "PRODUCT_MASTER_DATA", // GDSN, data quality, attribute enrichment
} as const;

export type GS1ImpactTag = keyof typeof GS1_IMPACT_TAGS;

/**
 * Human-readable labels for GS1 Impact Tags
 */
export const GS1_IMPACT_TAG_LABELS: Record<GS1ImpactTag, string> = {
  IDENTIFICATION: "Product & Location Identification",
  PACKAGING_ATTRIBUTES: "Packaging Data & Attributes",
  ESG_REPORTING: "ESG Reporting & Disclosure",
  DUE_DILIGENCE: "Supply Chain Due Diligence",
  TRACEABILITY: "Traceability & Track-and-Trace",
  DPP: "Digital Product Passport",
  BATTERY_PASSPORT: "Battery Passport",
  HEALTHCARE_SUSTAINABILITY: "Healthcare Sustainability",
  FOOD_SAFETY: "Food Safety & Traceability",
  LOGISTICS_OPTIMIZATION: "Logistics & Distribution",
  CIRCULAR_ECONOMY: "Circular Economy & Recycling",
  PRODUCT_MASTER_DATA: "Product Master Data Management",
};

/**
 * Sector Tags - Business sectors affected by regulations
 */
export const SECTOR_TAGS = {
  RETAIL: "RETAIL", // General retail, e-commerce, consumer goods
  HEALTHCARE: "HEALTHCARE", // Hospitals, pharma, medical devices, healthcare services
  FOOD: "FOOD", // Food production, processing, distribution, grocery retail
  LOGISTICS: "LOGISTICS", // Transport, warehousing, 3PL, freight forwarding
  DIY: "DIY", // Home improvement, construction retail, hardware stores
  CONSTRUCTION: "CONSTRUCTION", // Building materials, contractors, construction services
  TEXTILES: "TEXTILES", // Apparel, fashion, fabrics, textile manufacturing
  ELECTRONICS: "ELECTRONICS", // Consumer electronics, IT hardware, electrical equipment
  AUTOMOTIVE: "AUTOMOTIVE", // Vehicles, parts, batteries, automotive manufacturing
  CHEMICALS: "CHEMICALS", // Industrial chemicals, REACH compliance, chemical manufacturing
  PACKAGING: "PACKAGING", // Packaging manufacturers, converters, packaging materials
  GENERAL: "GENERAL", // Cross-sector or not sector-specific
} as const;

export type SectorTag = keyof typeof SECTOR_TAGS;

/**
 * Human-readable labels for Sector Tags
 */
export const SECTOR_TAG_LABELS: Record<SectorTag, string> = {
  RETAIL: "Retail & E-commerce",
  HEALTHCARE: "Healthcare & Pharmaceuticals",
  FOOD: "Food & Beverage",
  LOGISTICS: "Logistics & Transport",
  DIY: "DIY & Home Improvement",
  CONSTRUCTION: "Construction & Building",
  TEXTILES: "Textiles & Apparel",
  ELECTRONICS: "Electronics & IT",
  AUTOMOTIVE: "Automotive & Batteries",
  CHEMICALS: "Chemicals & Materials",
  PACKAGING: "Packaging Industry",
  GENERAL: "Cross-Sector",
};

/**
 * Keyword mappings for fallback heuristic tagging
 */
export const GS1_IMPACT_KEYWORDS: Record<GS1ImpactTag, string[]> = {
  IDENTIFICATION: [
    "GTIN",
    "GLN",
    "SSCC",
    "GRAI",
    "GIAI",
    "barcode",
    "identification",
    "unique identifier",
  ],
  PACKAGING_ATTRIBUTES: [
    "packaging",
    "recyclability",
    "material",
    "recycled content",
    "packaging waste",
    "PPWR",
  ],
  ESG_REPORTING: [
    "CSRD",
    "ESRS",
    "sustainability reporting",
    "ESG disclosure",
    "double materiality",
  ],
  DUE_DILIGENCE: [
    "EUDR",
    "due diligence",
    "supply chain transparency",
    "CSDDD",
    "CS3D",
    "human rights",
  ],
  TRACEABILITY: [
    "traceability",
    "track and trace",
    "EPCIS",
    "supply chain visibility",
    "origin",
    "batch",
  ],
  DPP: [
    "digital product passport",
    "DPP",
    "ESPR",
    "product data",
    "QR code",
    "Digital Link",
    "2D barcode",
  ],
  BATTERY_PASSPORT: [
    "battery passport",
    "battery regulation",
    "EV battery",
    "battery lifecycle",
  ],
  HEALTHCARE_SUSTAINABILITY: [
    "Green Deal",
    "healthcare",
    "medical",
    "hospital",
    "pharmaceutical waste",
  ],
  FOOD_SAFETY: [
    "food safety",
    "allergen",
    "food traceability",
    "farm to fork",
    "food waste",
  ],
  LOGISTICS_OPTIMIZATION: [
    "zero-emission",
    "ZES",
    "city logistics",
    "urban delivery",
    "last mile",
    "emissions",
  ],
  CIRCULAR_ECONOMY: [
    "circular economy",
    "reuse",
    "repair",
    "recycling",
    "take-back",
    "refurbishment",
  ],
  PRODUCT_MASTER_DATA: [
    "GDSN",
    "product data",
    "master data",
    "data quality",
    "attribute",
    "product information",
  ],
};

export const SECTOR_KEYWORDS: Record<SectorTag, string[]> = {
  RETAIL: [
    "retail",
    "store",
    "consumer",
    "e-commerce",
    "shopping",
    "supermarket",
  ],
  HEALTHCARE: [
    "hospital",
    "medical",
    "pharma",
    "pharmaceutical",
    "healthcare",
    "patient",
    "clinical",
    "doctor",
  ],
  FOOD: [
    "food",
    "beverage",
    "agriculture",
    "farm",
    "grocery",
    "restaurant",
    "catering",
  ],
  LOGISTICS: [
    "logistics",
    "transport",
    "delivery",
    "warehouse",
    "3PL",
    "freight",
    "shipping",
    "distribution",
  ],
  DIY: ["DIY", "home improvement", "hardware store", "building supplies"],
  CONSTRUCTION: [
    "construction",
    "building",
    "contractor",
    "infrastructure",
    "building materials",
  ],
  TEXTILES: ["textile", "apparel", "fashion", "clothing", "fabric", "garment"],
  ELECTRONICS: [
    "electronics",
    "consumer electronics",
    "IT hardware",
    "electrical equipment",
    "appliances",
  ],
  AUTOMOTIVE: [
    "automotive",
    "vehicle",
    "car",
    "EV",
    "electric vehicle",
    "auto parts",
  ],
  CHEMICALS: [
    "chemical",
    "REACH",
    "hazardous substances",
    "chemical manufacturing",
  ],
  PACKAGING: [
    "packaging manufacturer",
    "packaging converter",
    "packaging materials",
    "packaging industry",
  ],
  GENERAL: [], // No specific keywords, default fallback
};

/**
 * Helper function to infer GS1 impact tags from text using keywords
 */
export function inferGS1ImpactTags(
  text: string,
  maxTags: number = 3
): GS1ImpactTag[] {
  const lowerText = text.toLowerCase();
  const scores: Map<GS1ImpactTag, number> = new Map();

  for (const [tag, keywords] of Object.entries(GS1_IMPACT_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }
    if (score > 0) {
      scores.set(tag as GS1ImpactTag, score);
    }
  }

  // Sort by score descending and take top N
  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxTags)
    .map(([tag]) => tag);
}

/**
 * Helper function to infer sector tags from text using keywords
 */
export function inferSectorTags(
  text: string,
  maxTags: number = 3
): SectorTag[] {
  const lowerText = text.toLowerCase();
  const scores: Map<SectorTag, number> = new Map();

  for (const [tag, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    if (keywords.length === 0) continue; // Skip GENERAL

    let score = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        score += 1;
      }
    }
    if (score > 0) {
      scores.set(tag as SectorTag, score);
    }
  }

  // If no sectors found, default to GENERAL
  if (scores.size === 0) {
    return ["GENERAL"];
  }

  // Sort by score descending and take top N
  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxTags)
    .map(([tag]) => tag);
}
