/**
 * CELLAR Data Normalization Pipeline
 *
 * Transforms EU legal acts from CELLAR SPARQL format into ISA database schema.
 * Maps CELEX identifiers, regulation types, dates, and metadata.
 */

import type { EULegalAct } from "./cellar-connector";
import type { InsertRegulation } from "../drizzle/schema";

/**
 * Regulation type mapping from CELEX patterns to ISA enum
 *
 * CELEX format: XYYYY[A-Z]NNNN
 * - X: Sector (3=EU law, 6=case law, etc.)
 * - YYYY: Year
 * - [A-Z]: Document type (L=Directive, R=Regulation, D=Decision, etc.)
 * - NNNN: Sequential number
 */
const CELEX_TO_REGULATION_TYPE: Record<string, string> = {
  // Known ESG regulations by CELEX pattern
  "32013L0034": "CSRD", // Accounting Directive (amended by CSRD)
  "32022L2464": "CSRD", // Corporate Sustainability Reporting Directive
  "32023R2772": "ESRS", // European Sustainability Reporting Standards
  "32024R1252": "DPP", // Digital Product Passport
  "32023R1115": "EUDR", // EU Deforestation Regulation
  "32024R1781": "ESPR", // Ecodesign for Sustainable Products Regulation
  "32024R1157": "PPWR", // Packaging and Packaging Waste Regulation
  "32020R0852": "EU_TAXONOMY", // EU Taxonomy Regulation
};

/**
 * ESG-related keywords for classification
 */
const ESG_KEYWORDS = {
  CSRD: [
    "corporate sustainability reporting",
    "csrd",
    "non-financial reporting",
    "sustainability reporting directive",
  ],
  ESRS: [
    "european sustainability reporting standards",
    "esrs",
    "sustainability standards",
  ],
  DPP: [
    "digital product passport",
    "dpp",
    "product passport",
    "digital passport",
  ],
  EUDR: [
    "deforestation",
    "eudr",
    "deforestation-free",
    "forest risk commodities",
  ],
  ESPR: ["ecodesign", "espr", "sustainable products", "circular economy"],
  PPWR: ["packaging", "ppwr", "packaging waste", "packaging regulation"],
  EU_TAXONOMY: [
    "taxonomy",
    "sustainable finance",
    "green investment",
    "taxonomy regulation",
  ],
};

/**
 * Normalize CELLAR legal act to ISA regulation schema
 */
export function normalizeEULegalAct(act: EULegalAct): InsertRegulation | null {
  // Skip acts without CELEX ID
  if (!act.celexId) {
    return null;
  }

  // Determine regulation type
  const regulationType = determineRegulationType(act);

  // Skip if not an ESG-related regulation
  if (regulationType === "OTHER" && !isESGRelated(act)) {
    return null;
  }

  // Extract effective date (convert Date to string for schema compatibility)
  const effectiveDate = act.dateEntryIntoForce ? act.dateEntryIntoForce.toISOString() : null;

  // Build source URL (EUR-Lex)
  const sourceUrl = `https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:${act.celexId}`;

  // Normalize title
  const title = normalizeTitle(act.title || act.celexId);

  // Generate description from available metadata
  const description = generateDescription(act);

  return {
    celexId: act.celexId,
    title,
    description,
    regulationType: regulationType as any,
    effectiveDate,
    sourceUrl,
  };
}

/**
 * Determine regulation type from CELEX ID and title
 */
function determineRegulationType(act: EULegalAct): string {
  // Check explicit CELEX mapping
  if (act.celexId && CELEX_TO_REGULATION_TYPE[act.celexId]) {
    return CELEX_TO_REGULATION_TYPE[act.celexId];
  }

  // Check title keywords
  if (act.title) {
    const titleLower = act.title.toLowerCase();

    for (const [type, keywords] of Object.entries(ESG_KEYWORDS)) {
      if (keywords.some(keyword => titleLower.includes(keyword))) {
        return type;
      }
    }
  }

  return "OTHER";
}

/**
 * Check if act is ESG-related based on keywords
 */
function isESGRelated(act: EULegalAct): boolean {
  if (!act.title) return false;

  const titleLower = act.title.toLowerCase();

  const esgTerms = [
    "sustainability",
    "environmental",
    "social",
    "governance",
    "esg",
    "climate",
    "carbon",
    "green",
    "circular economy",
    "due diligence",
    "reporting",
    "disclosure",
    "taxonomy",
    "deforestation",
    "packaging",
    "ecodesign",
    "product passport",
  ];

  return esgTerms.some(term => titleLower.includes(term));
}

/**
 * Normalize title by removing redundant prefixes and cleaning up
 */
function normalizeTitle(title: string): string {
  // Remove common prefixes
  let normalized = title
    .replace(
      /^(Regulation|Directive|Decision|Recommendation|Opinion)\s+\(EU\)\s+/i,
      ""
    )
    .replace(/^(Commission|Council|Parliament)\s+/i, "")
    .trim();

  // Truncate if too long (max 255 chars for database)
  if (normalized.length > 255) {
    normalized = normalized.substring(0, 252) + "...";
  }

  return normalized;
}

/**
 * Generate description from available metadata
 */
function generateDescription(act: EULegalAct): string | null {
  const parts: string[] = [];

  if (act.celexId) {
    parts.push(`CELEX: ${act.celexId}`);
  }

  if (act.dateEntryIntoForce) {
    const dateStr = act.dateEntryIntoForce.toISOString().split("T")[0];
    parts.push(`Entry into force: ${dateStr}`);
  }

  if (act.dateEndOfValidity) {
    const dateStr = act.dateEndOfValidity.toISOString().split("T")[0];
    parts.push(`End of validity: ${dateStr}`);
  }

  if (act.inForce) {
    parts.push("Currently in force");
  } else {
    parts.push("No longer in force");
  }

  if (act.resourceType) {
    parts.push(`Type: ${act.resourceType}`);
  }

  return parts.length > 0 ? parts.join(" | ") : null;
}

/**
 * Batch normalize multiple legal acts
 */
export function normalizeEULegalActsBatch(
  acts: EULegalAct[]
): InsertRegulation[] {
  return acts
    .map(normalizeEULegalAct)
    .filter((reg): reg is InsertRegulation => reg !== null);
}

/**
 * Deduplicate regulations by CELEX ID
 */
export function deduplicateRegulations(
  regulations: InsertRegulation[]
): InsertRegulation[] {
  const seen = new Set<string>();
  const unique: InsertRegulation[] = [];

  for (const reg of regulations) {
    if (reg.celexId && !seen.has(reg.celexId)) {
      seen.add(reg.celexId);
      unique.push(reg);
    }
  }

  return unique;
}

/**
 * Merge new regulation data with existing database record
 * Preserves manual edits while updating automated fields
 */
export function mergeRegulationData(
  existing: InsertRegulation,
  incoming: InsertRegulation
): InsertRegulation {
  return {
    ...existing,
    // Update automated fields
    effectiveDate: incoming.effectiveDate || existing.effectiveDate,
    sourceUrl: incoming.sourceUrl || existing.sourceUrl,
    // Preserve manual edits to title and description
    title: existing.title,
    description: existing.description || incoming.description,
    regulationType: existing.regulationType,
    celexId: existing.celexId,
  };
}

/**
 * Validate regulation data before database insertion
 */
export function validateRegulation(regulation: InsertRegulation): boolean {
  // Required fields
  if (!regulation.title || regulation.title.trim().length === 0) {
    return false;
  }

  if (!regulation.regulationType) {
    return false;
  }

  // CELEX ID format validation (if provided)
  if (regulation.celexId) {
    const celexPattern = /^3\d{4}[A-Z]\d{4}$/;
    if (!celexPattern.test(regulation.celexId)) {
      return false;
    }
  }

  // URL validation (if provided)
  if (regulation.sourceUrl) {
    try {
      new URL(regulation.sourceUrl);
    } catch {
      return false;
    }
  }

  return true;
}

/**
 * Extract regulation statistics from normalized data
 */
export interface RegulationStats {
  total: number;
  byType: Record<string, number>;
  inForce: number;
  withCelex: number;
  withDates: number;
}

export function calculateRegulationStats(
  regulations: InsertRegulation[]
): RegulationStats {
  const stats: RegulationStats = {
    total: regulations.length,
    byType: {},
    inForce: 0,
    withCelex: 0,
    withDates: 0,
  };

  for (const reg of regulations) {
    // Count by type
    const type = reg.regulationType || "UNKNOWN";
    stats.byType[type] = (stats.byType[type] || 0) + 1;

    // Count with CELEX
    if (reg.celexId) {
      stats.withCelex++;
    }

    // Count with dates
    if (reg.effectiveDate) {
      stats.withDates++;
    }
  }

  return stats;
}
