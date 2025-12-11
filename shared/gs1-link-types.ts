/**
 * GS1 Digital Link Types
 *
 * Source: linktypes.json (GS1 Digital Link standard)
 * Version: December 2025
 *
 * These link types define the semantic meaning of links in GS1 Digital Link URIs,
 * enabling standardized navigation from product identifiers to various types of
 * information (product pages, sustainability info, EPCIS data, DPPs, etc.)
 */

export type GS1LinkTypeStatus = "stable" | "deprecated";

export type GS1LinkTypeRestriction = "resolver" | "validatedHealthcare";

export interface GS1LinkType {
  title: string;
  description: string;
  status: GS1LinkTypeStatus;
  restricted?: GS1LinkTypeRestriction[];
}

export interface GS1LinkTypesRegistry {
  [key: string]: GS1LinkType;
}

/**
 * ESG-Relevant Link Types
 *
 * These link types are particularly relevant for ESG compliance and sustainability:
 * - dpp: Digital Product Passport (PPWR, ESPR)
 * - epcis: Traceability data (CSRD, EUDR, PPWR)
 * - sustainabilityInfo: Sustainability and recycling information
 * - certificationInfo: Certification information (FSC, organic, etc.)
 * - productSustainabilityInfo: (deprecated, use sustainabilityInfo)
 */
export const ESG_RELEVANT_LINK_TYPES = [
  "dpp",
  "epcis",
  "sustainabilityInfo",
  "certificationInfo",
  "traceability",
  "recyclingInfo",
  "safetyInfo",
  "ingredientsInfo",
  "allergenInfo",
  "nutritionalInfo",
] as const;

export type ESGRelevantLinkType = (typeof ESG_RELEVANT_LINK_TYPES)[number];

/**
 * DPP-Specific Link Types
 *
 * Link types specifically required or recommended for Digital Product Passports
 * under PPWR and ESPR regulations.
 */
export const DPP_LINK_TYPES = [
  "dpp", // Primary DPP link
  "sustainabilityInfo", // Sustainability and recycling
  "epcis", // Traceability events
  "certificationInfo", // Product certifications
  "safetyInfo", // Safety information
  "ingredientsInfo", // Ingredients/materials
  "recyclingInfo", // Recycling instructions
] as const;

export type DPPLinkType = (typeof DPP_LINK_TYPES)[number];

/**
 * B2B Link Types
 *
 * Link types primarily used in business-to-business contexts.
 */
export const B2B_LINK_TYPES = [
  "masterData", // Structured master data (GDSN)
  "epcis", // Supply chain visibility events
  "logisticsInfo", // B2B logistics information
  "traceability", // Traceability information
] as const;

export type B2BLinkType = (typeof B2B_LINK_TYPES)[number];

/**
 * Consumer-Facing Link Types
 *
 * Link types primarily used in business-to-consumer contexts.
 */
export const B2C_LINK_TYPES = [
  "pip", // Product Information Page
  "sustainabilityInfo", // Sustainability information
  "allergenInfo", // Allergen information
  "nutritionalInfo", // Nutritional facts
  "ingredientsInfo", // Ingredients information
  "recipeInfo", // Recipe website
  "instructions", // Usage instructions
  "safetyInfo", // Safety information
  "review", // Product reviews
  "leaveReview", // Leave a review
] as const;

export type B2CLinkType = (typeof B2C_LINK_TYPES)[number];

/**
 * Load GS1 Link Types Registry
 *
 * Loads the complete GS1 link types registry from linktypes.json.
 * This function should be called server-side to load the registry.
 */
export async function loadGS1LinkTypes(): Promise<GS1LinkTypesRegistry> {
  // Server-side: read from file system
  if (typeof window === "undefined") {
    const fs = await import("fs/promises");
    const path = await import("path");
    const filePath = path.join(
      process.cwd(),
      "data",
      "gs1_link_types",
      "linktypes.json"
    );
    const content = await fs.readFile(filePath, "utf-8");
    return JSON.parse(content);
  }

  // Client-side: fetch from API (if needed)
  throw new Error("loadGS1LinkTypes() is server-side only");
}

/**
 * Get Link Type Information
 *
 * Returns information about a specific GS1 link type.
 *
 * @param linkType - The link type key (e.g., "dpp", "epcis", "pip")
 * @param registry - The loaded GS1 link types registry
 * @returns Link type information or undefined if not found
 */
export function getLinkTypeInfo(
  linkType: string,
  registry: GS1LinkTypesRegistry
): GS1LinkType | undefined {
  return registry[linkType];
}

/**
 * Is ESG Relevant Link Type
 *
 * Checks if a link type is relevant for ESG compliance.
 *
 * @param linkType - The link type key
 * @returns True if the link type is ESG-relevant
 */
export function isESGRelevantLinkType(
  linkType: string
): linkType is ESGRelevantLinkType {
  return ESG_RELEVANT_LINK_TYPES.includes(linkType as ESGRelevantLinkType);
}

/**
 * Is DPP Link Type
 *
 * Checks if a link type is required/recommended for Digital Product Passports.
 *
 * @param linkType - The link type key
 * @returns True if the link type is DPP-relevant
 */
export function isDPPLinkType(linkType: string): linkType is DPPLinkType {
  return DPP_LINK_TYPES.includes(linkType as DPPLinkType);
}

/**
 * Filter Link Types by Status
 *
 * Filters the registry to only include link types with a specific status.
 *
 * @param registry - The loaded GS1 link types registry
 * @param status - The status to filter by ("stable" or "deprecated")
 * @returns Filtered registry
 */
export function filterLinkTypesByStatus(
  registry: GS1LinkTypesRegistry,
  status: GS1LinkTypeStatus
): GS1LinkTypesRegistry {
  return Object.fromEntries(
    Object.entries(registry).filter(
      ([_, linkType]) => linkType.status === status
    )
  );
}

/**
 * Get All Link Type Keys
 *
 * Returns all link type keys from the registry.
 *
 * @param registry - The loaded GS1 link types registry
 * @returns Array of link type keys
 */
export function getAllLinkTypeKeys(registry: GS1LinkTypesRegistry): string[] {
  return Object.keys(registry);
}
