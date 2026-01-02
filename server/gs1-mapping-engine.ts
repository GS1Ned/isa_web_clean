/**
 * GS1 Mapping Engine
 *
 * Automated algorithm for mapping EU regulations to applicable GS1 standards.
 * Uses keyword analysis, regulation type matching, and relevance scoring.
 */

import { getDb } from "./db";
import {
  regulations,
  gs1Standards,
  regulationStandardMappings,
  type Regulation,
  type GS1Standard,
} from "../drizzle/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Keyword mappings: regulation keywords → GS1 standard codes
 */
const KEYWORD_MAPPINGS: Record<
  string,
  { standards: string[]; weight: number }
> = {
  // Traceability keywords
  traceability: {
    standards: [
      "EPCIS",
      "CBV",
      "GS1_Track_and_Trace",
      "GS1_Origin_Information",
    ],
    weight: 0.9,
  },
  "supply chain": {
    standards: ["EPCIS", "GLN", "SSCC", "GS1_Track_and_Trace"],
    weight: 0.8,
  },
  "due diligence": {
    standards: ["EPCIS", "GS1_Origin_Information", "GS1_Track_and_Trace"],
    weight: 0.9,
  },
  provenance: { standards: ["EPCIS", "GS1_Origin_Information"], weight: 0.9 },
  origin: { standards: ["GS1_Origin_Information", "EPCIS"], weight: 0.8 },

  // Sustainability keywords
  sustainability: {
    standards: [
      "GS1_Sustainability_Attributes",
      "GS1_Circular_Economy_Attributes",
      "EPCIS",
    ],
    weight: 0.9,
  },
  environmental: {
    standards: [
      "GS1_Sustainability_Attributes",
      "GS1_Circular_Economy_Attributes",
    ],
    weight: 0.8,
  },
  carbon: { standards: ["GS1_Sustainability_Attributes"], weight: 0.9 },
  emissions: { standards: ["GS1_Sustainability_Attributes"], weight: 0.8 },
  "circular economy": {
    standards: ["GS1_Circular_Economy_Attributes", "GRAI"],
    weight: 0.9,
  },
  recycling: {
    standards: ["GS1_Circular_Economy_Attributes", "GS1_Packaging_Attributes"],
    weight: 0.8,
  },
  reuse: {
    standards: ["GS1_Circular_Economy_Attributes", "GRAI"],
    weight: 0.8,
  },

  // Packaging keywords
  packaging: {
    standards: [
      "GS1_Packaging_Attributes",
      "GS1_Net_Content",
      "GS1_Circular_Economy_Attributes",
    ],
    weight: 0.9,
  },
  waste: {
    standards: ["GS1_Packaging_Attributes", "GS1_Circular_Economy_Attributes"],
    weight: 0.8,
  },
  recyclable: {
    standards: ["GS1_Packaging_Attributes", "GS1_Circular_Economy_Attributes"],
    weight: 0.9,
  },
  "material composition": {
    standards: ["GS1_Packaging_Attributes"],
    weight: 0.9,
  },

  // Product identification keywords
  "product identification": {
    standards: ["GTIN", "GS1_Digital_Link", "GS1_QR_Code"],
    weight: 0.9,
  },
  barcode: {
    standards: ["GTIN", "GS1_128", "GS1_DataMatrix", "GS1_QR_Code"],
    weight: 0.8,
  },
  "unique identifier": { standards: ["GTIN", "GLN", "SSCC"], weight: 0.8 },

  // Digital Product Passport keywords
  "digital product passport": {
    standards: ["GS1_Digital_Link", "GS1_QR_Code", "GTIN", "EPCIS"],
    weight: 1.0,
  },
  "product information": {
    standards: ["GS1_Digital_Link", "GS1_Global_Data_Model", "GDSN"],
    weight: 0.7,
  },
  "consumer information": {
    standards: ["GS1_Digital_Link", "GS1_SmartSearch", "GS1_QR_Code"],
    weight: 0.8,
  },

  // Deforestation keywords
  deforestation: {
    standards: ["EPCIS", "GS1_Origin_Information", "GS1_Track_and_Trace"],
    weight: 1.0,
  },
  forest: { standards: ["GS1_Origin_Information", "EPCIS"], weight: 0.8 },
  timber: { standards: ["GS1_Origin_Information", "EPCIS"], weight: 0.9 },

  // Reporting keywords
  reporting: {
    standards: [
      "GS1_Sustainability_Attributes",
      "GS1_Regulatory_Information",
      "EPCIS",
    ],
    weight: 0.7,
  },
  disclosure: {
    standards: ["GS1_Sustainability_Attributes", "GS1_Regulatory_Information"],
    weight: 0.7,
  },
  transparency: {
    standards: ["GS1_Digital_Link", "GS1_SmartSearch", "EPCIS"],
    weight: 0.8,
  },

  // Compliance keywords
  compliance: {
    standards: [
      "GS1_Regulatory_Information",
      "GS1_Certification_Information",
      "Verified_by_GS1",
    ],
    weight: 0.8,
  },
  certification: {
    standards: ["GS1_Certification_Information", "Verified_by_GS1"],
    weight: 0.9,
  },
  verification: {
    standards: ["Verified_by_GS1", "GS1_Certification_Information"],
    weight: 0.9,
  },

  // Data exchange keywords
  "data exchange": {
    standards: ["GDSN", "GS1_Global_Data_Model", "EPCIS"],
    weight: 0.8,
  },
  "data synchronization": {
    standards: ["GDSN", "GS1_Global_Data_Model"],
    weight: 0.9,
  },
  "master data": { standards: ["GDSN", "GS1_Global_Data_Model"], weight: 0.8 },
};

/**
 * Regulation type to GS1 standards mappings
 */
const REGULATION_TYPE_MAPPINGS: Record<
  string,
  { standards: string[]; weight: number }
> = {
  CSRD: {
    standards: [
      "GS1_Sustainability_Attributes",
      "EPCIS",
      "GS1_Regulatory_Information",
    ],
    weight: 0.9,
  },
  ESRS: {
    standards: [
      "GS1_Sustainability_Attributes",
      "EPCIS",
      "GS1_Origin_Information",
    ],
    weight: 0.9,
  },
  DPP: {
    standards: [
      "GS1_Digital_Link",
      "GS1_QR_Code",
      "GTIN",
      "EPCIS",
      "GS1_Circular_Economy_Attributes",
    ],
    weight: 1.0,
  },
  EUDR: {
    standards: ["EPCIS", "GS1_Origin_Information", "GS1_Track_and_Trace"],
    weight: 1.0,
  },
  PPWR: {
    standards: [
      "GS1_Packaging_Attributes",
      "GS1_Circular_Economy_Attributes",
      "GS1_Net_Content",
    ],
    weight: 1.0,
  },
  CSDDD: {
    standards: ["EPCIS", "GS1_Origin_Information", "GS1_Track_and_Trace"],
    weight: 0.9,
  },
};

export interface MappingResult {
  standardId: number;
  standardCode: string;
  standardName: string;
  relevanceScore: number;
  mappingReason: string;
}

/**
 * Calculate relevance score for a regulation-standard pair
 */
function calculateRelevanceScore(
  regulation: Regulation,
  standard: GS1Standard,
  keywordMatches: string[],
  typeMatch: boolean
): number {
  let score = 0;

  // Base score from keyword matches
  for (const keyword of keywordMatches) {
    const mapping = KEYWORD_MAPPINGS[keyword];
    if (mapping && mapping.standards.includes(standard.standardCode)) {
      score += mapping.weight * 0.3; // Keyword contributes 30% max
    }
  }

  // Bonus for regulation type match
  if (typeMatch) {
    const typeMapping = REGULATION_TYPE_MAPPINGS[regulation.regulationType];
    if (typeMapping && typeMapping.standards.includes(standard.standardCode)) {
      score += typeMapping.weight * 0.4; // Type match contributes 40% max
    }
  }

  // Bonus for category relevance
  const categoryBonus = getCategoryBonus(regulation, standard);
  score += categoryBonus * 0.3; // Category contributes 30% max

  // Normalize to 0-1 range
  return Math.min(score, 1.0);
}

/**
 * Get category-based bonus score
 */
function getCategoryBonus(
  regulation: Regulation,
  standard: GS1Standard
): number {
  const regType = regulation.regulationType;
  const stdCategory = standard.category;

  // High relevance combinations
  if (regType === "DPP" && stdCategory === "Data_Exchange") return 0.9;
  if (regType === "EUDR" && stdCategory === "Traceability") return 1.0;
  if (regType === "PPWR" && stdCategory === "Packaging") return 1.0;
  if (regType === "CSRD" && stdCategory === "Quality") return 0.8;

  // Medium relevance combinations
  if (regType === "CSRD" && stdCategory === "Traceability") return 0.6;
  if (regType === "DPP" && stdCategory === "Identification") return 0.7;

  // Default: some relevance for all standards
  return 0.3;
}

/**
 * Extract keywords from regulation text
 */
function extractKeywords(regulation: Regulation): string[] {
  const text =
    `${regulation.title} ${regulation.description || ""}`.toLowerCase();
  const matches: string[] = [];

  for (const keyword of Object.keys(KEYWORD_MAPPINGS)) {
    if (text.includes(keyword.toLowerCase())) {
      matches.push(keyword);
    }
  }

  return matches;
}

/**
 * Generate mapping reason text
 */
function generateMappingReason(
  regulation: Regulation,
  standard: GS1Standard,
  keywordMatches: string[],
  typeMatch: boolean
): string {
  const reasons: string[] = [];

  if (typeMatch) {
    reasons.push(`${regulation.regulationType} regulation type`);
  }

  if (keywordMatches.length > 0) {
    const topKeywords = keywordMatches.slice(0, 3).join(", ");
    reasons.push(`keyword matches: ${topKeywords}`);
  }

  if (standard.category) {
    reasons.push(`${standard.category} category relevance`);
  }

  return reasons.join("; ");
}

/**
 * Map a single regulation to applicable GS1 standards
 */
export async function mapRegulationToStandards(
  regulationId: number
): Promise<MappingResult[]> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  // Get regulation
  const [regulation] = await db
    .select()
    .from(regulations)
    .where(eq(regulations.id, regulationId));
  if (!regulation) throw new Error(`Regulation ${regulationId} not found`);

  // Get all standards
  const allStandards = await db.select().from(gs1Standards);

  // Extract keywords and check type match
  const keywordMatches = extractKeywords(regulation);
  const typeMatch = regulation.regulationType in REGULATION_TYPE_MAPPINGS;

  // Calculate relevance for each standard
  const results: MappingResult[] = [];

  for (const standard of allStandards) {
    const relevanceScore = calculateRelevanceScore(
      regulation,
      standard,
      keywordMatches,
      typeMatch
    );

    // Only include standards with relevance > 0.3 (30%)
    if (relevanceScore > 0.3) {
      results.push({
        standardId: standard.id,
        standardCode: standard.standardCode,
        standardName: standard.standardName,
        relevanceScore: Math.round(relevanceScore * 100) / 100, // Round to 2 decimals
        mappingReason: generateMappingReason(
          regulation,
          standard,
          keywordMatches,
          typeMatch
        ),
      });
    }
  }

  // Sort by relevance score (descending)
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return results;
}

/**
 * Save mappings to database
 */
export async function saveMappings(
  regulationId: number,
  mappings: MappingResult[]
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  // Delete existing mappings for this regulation
  await db
    .delete(regulationStandardMappings)
    .where(eq(regulationStandardMappings.regulationId, regulationId));

  // Insert new mappings
  for (const mapping of mappings) {
    await db.insert(regulationStandardMappings).values({
      regulationId,
      standardId: mapping.standardId,
      relevanceScore: mapping.relevanceScore.toString(), // Convert to decimal string
      mappingReason: mapping.mappingReason,
      verifiedByAdmin: 0,
    });
  }
}

/**
 * Map all regulations to standards
 */
export async function mapAllRegulations(): Promise<
  { regulationId: number; mappingsCount: number }[]
> {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const allRegulations = await db.select().from(regulations);
  const results: { regulationId: number; mappingsCount: number }[] = [];

  for (const regulation of allRegulations) {
    const mappings = await mapRegulationToStandards(regulation.id);
    await saveMappings(regulation.id, mappings);
    results.push({
      regulationId: regulation.id,
      mappingsCount: mappings.length,
    });
  }

  return results;
}

/**
 * Get mappings for a regulation
 */
export async function getMappingsForRegulation(regulationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const mappings = await db
    .select({
      id: regulationStandardMappings.id,
      regulationId: regulationStandardMappings.regulationId,
      standardId: regulationStandardMappings.standardId,
      standardCode: gs1Standards.standardCode,
      standardName: gs1Standards.standardName,
      standardCategory: gs1Standards.category,
      relevanceScore: regulationStandardMappings.relevanceScore,
      mappingReason: regulationStandardMappings.mappingReason,
      verifiedByAdmin: regulationStandardMappings.verifiedByAdmin,
    })
    .from(regulationStandardMappings)
    .leftJoin(
      gs1Standards,
      eq(regulationStandardMappings.standardId, gs1Standards.id)
    )
    .where(eq(regulationStandardMappings.regulationId, regulationId));

  return mappings;
}
