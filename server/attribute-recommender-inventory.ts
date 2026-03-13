export interface SectorOption {
  id: string;
  name: string;
  description: string;
}

export interface RegulationOption {
  id: string;
  name: string;
  shortName: string;
}

export interface SampleAttributeOption {
  id: string;
  name: string;
  category: string;
}

export interface GapAnalyzerSampleAttributeOption {
  gs1_attribute_id: string;
  gs1_attribute_name: string;
  confidence: "high" | "medium" | "low";
}

export interface CatalogRegulationRow {
  regulationType: string | null;
  title: string | null;
}

export interface CatalogMappedAttributeRow {
  gs1AttributeId: string | null;
  gs1AttributeName: string | null;
  confidence: string | null;
}

export const CURATED_SECTOR_OPTIONS: SectorOption[] = [
  { id: "food_beverage", name: "Food & Beverage", description: "Food products, beverages, and related packaging" },
  { id: "retail", name: "Retail", description: "General retail and consumer goods" },
  { id: "manufacturing", name: "Manufacturing", description: "Industrial and manufacturing products" },
  { id: "electronics", name: "Electronics", description: "Electronic devices and components" },
  { id: "textiles", name: "Textiles & Apparel", description: "Clothing, textiles, and fashion" },
  { id: "healthcare", name: "Healthcare", description: "Medical devices and healthcare products" },
  { id: "agriculture", name: "Agriculture", description: "Agricultural products and farming" },
  { id: "construction", name: "Construction", description: "Building materials and construction" },
  { id: "automotive", name: "Automotive", description: "Vehicles and automotive parts" },
  { id: "chemicals", name: "Chemicals", description: "Chemical products and substances" },
];

export const CURATED_SECTOR_DISPLAY_MAP = Object.fromEntries(
  CURATED_SECTOR_OPTIONS.map((sector) => [sector.id, sector.name]),
) as Record<string, string>;

const COMPATIBILITY_REGULATION_OPTIONS: RegulationOption[] = [
  { id: "CSRD", name: "Corporate Sustainability Reporting Directive", shortName: "CSRD" },
  { id: "DPP", name: "Digital Product Passport", shortName: "DPP" },
  { id: "ESPR", name: "Ecodesign for Sustainable Products Regulation", shortName: "ESPR" },
  { id: "EUDR", name: "EU Deforestation Regulation", shortName: "EUDR" },
  { id: "PPWR", name: "Packaging and Packaging Waste Regulation", shortName: "PPWR" },
  { id: "CS3D", name: "Corporate Sustainability Due Diligence Directive", shortName: "CS3D" },
  { id: "BATTERY_REG", name: "EU Battery Regulation", shortName: "Battery Reg" },
  { id: "REACH", name: "Registration, Evaluation, Authorisation and Restriction of Chemicals", shortName: "REACH" },
  { id: "FIC", name: "Food Information to Consumers", shortName: "FIC" },
  { id: "WEEE", name: "Waste Electrical and Electronic Equipment", shortName: "WEEE" },
];

const REGULATION_DISPLAY_METADATA: Record<string, RegulationOption> = {
  CSRD: { id: "CSRD", name: "Corporate Sustainability Reporting Directive", shortName: "CSRD" },
  DPP: { id: "DPP", name: "Digital Product Passport", shortName: "DPP" },
  ESPR: { id: "ESPR", name: "Ecodesign for Sustainable Products Regulation", shortName: "ESPR" },
  EUDR: { id: "EUDR", name: "EU Deforestation Regulation", shortName: "EUDR" },
  PPWR: { id: "PPWR", name: "Packaging and Packaging Waste Regulation", shortName: "PPWR" },
  ESRS: { id: "ESRS", name: "European Sustainability Reporting Standards", shortName: "ESRS" },
  EU_TAXONOMY: { id: "EU_TAXONOMY", name: "EU Taxonomy", shortName: "EU Taxonomy" },
};

const REGULATION_ORDER = [
  "CSRD",
  "DPP",
  "ESPR",
  "EUDR",
  "PPWR",
  "ESRS",
  "EU_TAXONOMY",
  "CS3D",
  "BATTERY_REG",
  "REACH",
  "FIC",
  "WEEE",
] as const;

const COMPATIBILITY_SAMPLE_ATTRIBUTES: SampleAttributeOption[] = [
  { id: "gtin", name: "GTIN (Global Trade Item Number)", category: "Identification" },
  { id: "gln", name: "GLN (Global Location Number)", category: "Identification" },
  { id: "productDescription", name: "Product Description", category: "Basic" },
  { id: "brandName", name: "Brand Name", category: "Basic" },
  { id: "countryOfOrigin", name: "Country of Origin", category: "Origin" },
  { id: "netContent", name: "Net Content", category: "Measurement" },
  { id: "packagingMaterial", name: "Packaging Material", category: "Sustainability" },
  { id: "recycledContentPercentage", name: "Recycled Content Percentage", category: "Sustainability" },
  { id: "productCarbonFootprint", name: "Product Carbon Footprint", category: "Sustainability" },
  { id: "energyEfficiencyClass", name: "Energy Efficiency Class", category: "Sustainability" },
  { id: "hazardousSubstances", name: "Hazardous Substances", category: "Safety" },
  { id: "allergenInformation", name: "Allergen Information", category: "Food Safety" },
  { id: "nutritionalInformation", name: "Nutritional Information", category: "Food Safety" },
  { id: "supplierInformation", name: "Supplier Information", category: "Supply Chain" },
  { id: "batchNumber", name: "Batch/Lot Number", category: "Traceability" },
  { id: "serialNumber", name: "Serial Number", category: "Traceability" },
  { id: "expirationDate", name: "Expiration Date", category: "Lifecycle" },
  { id: "warrantyInformation", name: "Warranty Information", category: "Lifecycle" },
];

const COMPATIBILITY_CORE_ATTRIBUTE_IDS = new Set(["gtin", "gln"]);
const COMPATIBILITY_CORE_SAMPLE_ATTRIBUTES = COMPATIBILITY_SAMPLE_ATTRIBUTES.filter((attribute) =>
  COMPATIBILITY_CORE_ATTRIBUTE_IDS.has(attribute.id),
);

const ATTRIBUTE_CATEGORY_OVERRIDES: Record<string, string> = Object.fromEntries(
  COMPATIBILITY_SAMPLE_ATTRIBUTES.map((attribute) => [attribute.id, attribute.category]),
);

const CATEGORY_ORDER = [
  "Identification",
  "Basic",
  "Origin",
  "Measurement",
  "Sustainability",
  "Safety",
  "Food Safety",
  "Supply Chain",
  "Traceability",
  "Lifecycle",
] as const;

const CONFIDENCE_RANK: Record<string, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

interface NormalizedMappedAttribute {
  id: string;
  name: string;
  category: string;
  confidence: "high" | "medium" | "low";
  confidenceRank: number;
}

function regulationOrderIndex(id: string) {
  const index = REGULATION_ORDER.indexOf(id as (typeof REGULATION_ORDER)[number]);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function categoryOrderIndex(category: string) {
  const index = CATEGORY_ORDER.indexOf(category as (typeof CATEGORY_ORDER)[number]);
  return index === -1 ? CATEGORY_ORDER.length : index;
}

function inferAttributeCategory(attributeId: string, attributeName: string) {
  const override = ATTRIBUTE_CATEGORY_OVERRIDES[attributeId];
  if (override) return override;

  const text = `${attributeId} ${attributeName}`.toLowerCase();

  if (/\b(gtin|gln|identifier|id key|barcode|serial|lot)\b/.test(text)) return "Identification";
  if (/\b(origin|country|harvest)\b/.test(text)) return "Origin";
  if (/\b(carb|carbon|recycled|packag|repair|durability|material|environment|footprint|energy efficiency)\b/.test(text)) return "Sustainability";
  if (/\b(net content|content|usage|consumption|weight|percentage|score|measurement)\b/.test(text)) return "Measurement";
  if (/\b(hazard|steril|safety)\b/.test(text)) return "Safety";
  if (/\b(allergen|nutrition|nutritional|food)\b/.test(text)) return "Food Safety";
  if (/\b(supplier|vendor|manufacturer)\b/.test(text)) return "Supply Chain";
  if (/\b(batch|trace|tracking)\b/.test(text)) return "Traceability";
  if (/\b(expiration|expiry|warranty|storage|shelf|care|lifecycle)\b/.test(text)) return "Lifecycle";
  return "Basic";
}

function buildNormalizedMappedAttributes(rows: CatalogMappedAttributeRow[]): NormalizedMappedAttribute[] {
  const merged = new Map<string, NormalizedMappedAttribute>();

  for (const row of rows) {
    const id = row.gs1AttributeId?.trim();
    const name = row.gs1AttributeName?.trim();
    if (!id || !name) continue;

    const confidence = (row.confidence === "high" || row.confidence === "medium" || row.confidence === "low")
      ? row.confidence
      : "low";
    const confidenceRank = CONFIDENCE_RANK[confidence] ?? 0;
    const category = inferAttributeCategory(id, name);
    const existing = merged.get(id);

    if (
      !existing ||
      confidenceRank > existing.confidenceRank ||
      (confidenceRank === existing.confidenceRank && name.localeCompare(existing.name) < 0)
    ) {
      merged.set(id, { id, name, category, confidence, confidenceRank });
    }
  }

  return Array.from(merged.values());
}

export function buildAvailableRegulations(rows: CatalogRegulationRow[]): RegulationOption[] {
  if (rows.length === 0) {
    return [...COMPATIBILITY_REGULATION_OPTIONS];
  }

  const merged = new Map<string, RegulationOption>();

  for (const row of rows) {
    const rawId = row.regulationType?.trim();
    if (!rawId || rawId === "OTHER") continue;

    const metadata = REGULATION_DISPLAY_METADATA[rawId];
    const title = row.title?.trim();

    merged.set(rawId, {
      id: rawId,
      name: metadata?.name ?? title ?? rawId,
      shortName: metadata?.shortName ?? rawId,
    });
  }

  for (const fallback of COMPATIBILITY_REGULATION_OPTIONS) {
    if (!merged.has(fallback.id)) {
      merged.set(fallback.id, fallback);
    }
  }

  return Array.from(merged.values()).sort((a, b) => {
    const orderDelta = regulationOrderIndex(a.id) - regulationOrderIndex(b.id);
    if (orderDelta !== 0) return orderDelta;
    return a.name.localeCompare(b.name);
  });
}

export function buildSampleAttributeInventory(rows: CatalogMappedAttributeRow[]): SampleAttributeOption[] {
  if (rows.length === 0) {
    return [...COMPATIBILITY_SAMPLE_ATTRIBUTES];
  }

  const merged = new Map<string, NormalizedMappedAttribute>(
    buildNormalizedMappedAttributes(rows).map((attribute) => [attribute.id, attribute]),
  );

  for (const fallback of COMPATIBILITY_CORE_SAMPLE_ATTRIBUTES) {
    if (!merged.has(fallback.id)) {
      merged.set(fallback.id, { ...fallback, confidence: "low", confidenceRank: 0 });
    }
  }

  return Array.from(merged.values())
    .sort((a, b) => {
      const categoryDelta = categoryOrderIndex(a.category) - categoryOrderIndex(b.category);
      if (categoryDelta !== 0) return categoryDelta;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 50)
    .map(({ id, name, category }) => ({ id, name, category }));
}

export function buildGapAnalyzerSampleAttributes(
  rows: CatalogMappedAttributeRow[],
): GapAnalyzerSampleAttributeOption[] {
  return buildNormalizedMappedAttributes(rows)
    .sort((a, b) => {
      const confidenceDelta = b.confidenceRank - a.confidenceRank;
      if (confidenceDelta !== 0) return confidenceDelta;
      return a.name.localeCompare(b.name);
    })
    .slice(0, 50)
    .map(({ id, name, confidence }) => ({
      gs1_attribute_id: id,
      gs1_attribute_name: name,
      confidence,
    }));
}
