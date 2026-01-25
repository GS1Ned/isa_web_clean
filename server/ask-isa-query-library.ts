/**
 * Ask ISA Query Library
 *
 * 30 production queries for autocomplete and validation.
 * Based on ASK_ISA_QUERY_LIBRARY.md
 */

export interface ProductionQuery {
  id: number;
  query: string;
  category:
    | "gap"
    | "mapping"
    | "version_comparison"
    | "dataset_provenance"
    | "recommendation"
    | "coverage";
  sector: "DIY" | "FMCG" | "Healthcare" | "All";
  expectedCitations: string[];
}

export const PRODUCTION_QUERIES: ProductionQuery[] = [
  // Gap queries (5)
  {
    id: 1,
    query:
      "Which gaps exist for CSRD (Corporate Sustainability Reporting Directive) and ESRS (European Sustainability Reporting Standards) in DIY?",
    category: "gap",
    sector: "DIY",
    expectedCitations: [
      "ISA_ADVISORY_v1.1",
      "GAP-001..GAP-005",
      "gs1nl.benelux.diy_garden_pet.v3.1.33",
      "esrs.datapoints.ig3",
    ],
  },
  {
    id: 2,
    query: "Which gaps exist for EUDR (EU Deforestation Regulation) in FMCG?",
    category: "gap",
    sector: "FMCG",
    expectedCitations: [
      "ISA_ADVISORY_v1.1",
      "GAP-005",
      "gs1nl.benelux.fmcg.v3.1.33.5",
      "esrs.datapoints.ig3",
    ],
  },
  {
    id: 3,
    query:
      "What is the status of Gap #1 (Product Carbon Footprint) in healthcare?",
    category: "gap",
    sector: "Healthcare",
    expectedCitations: [
      "ISA_ADVISORY_v1.1",
      "GAP-001",
      "REC-*",
      "gs1eu.gdsn.carbon_footprint.v1.0",
      "gs1nl.benelux.healthcare.v3.1.33",
    ],
  },
  {
    id: 4,
    query:
      "Which critical gaps remain MISSING across all sectors in ISA v1.1?",
    category: "gap",
    sector: "All",
    expectedCitations: [
      "ISA_ADVISORY_v1.1",
      "GAP-004",
      "GAP-005",
      "gs1nl.benelux.*.v3.1.33*",
    ],
  },
  {
    id: 5,
    query:
      "Which gaps are PARTIAL in DIY and what evidence supports the PARTIAL classification?",
    category: "gap",
    sector: "DIY",
    expectedCitations: [
      "ISA_ADVISORY_v1.1",
      "GAP-*",
      "gs1nl.benelux.diy_garden_pet.v3.1.33",
      "gs1eu.gdsn.carbon_footprint.v1.0",
    ],
  },

  // Mapping queries (5)
  {
    id: 6,
    query:
      "Which GS1 Netherlands attributes cover ESRS E1 (Climate change) datapoints for DIY and where are the gaps?",
    category: "mapping",
    sector: "DIY",
    expectedCitations: [
      "ISA_ADVISORY_v1.1",
      "MAP-*",
      "esrs.datapoints.ig3",
      "gs1nl.benelux.diy_garden_pet.v3.1.33",
    ],
  },
  {
    id: 7,
    query:
      "Which GS1 Netherlands attributes partially cover ESRS E1-6 (Gross Scopes 1, 2 and 3 emissions) for FMCG?",
    category: "mapping",
    sector: "FMCG",
    expectedCitations: [
      "ISA_ADVISORY_v1.1",
      "MAP-E1-6-*",
      "esrs.datapoints.ig3",
      "gs1nl.benelux.fmcg.v3.1.33.5",
    ],
  },
  {
    id: 8,
    query:
      "Which healthcare attributes map to deforestation due diligence requirements relevant to EUDR?",
    category: "mapping",
    sector: "Healthcare",
    expectedCitations: [
      "ISA_ADVISORY_v1.1",
      "MAP-*",
      "GAP-005",
      "gs1nl.benelux.healthcare.v3.1.33",
    ],
  },
  {
    id: 9,
    query:
      "Which GS1 Netherlands attributes are referenced by the Digital Product Passport (DPP) gap analysis for DIY?",
    category: "mapping",
    sector: "DIY",
    expectedCitations: [
      "ISA_ADVISORY_v1.1",
      "GAP-003",
      "MAP-*",
      "eu.dpp.identification_rules",
      "gs1nl.benelux.diy_garden_pet.v3.1.33",
    ],
  },
  {
    id: 10,
    query:
      "Which mappings exist for supplier due diligence and which are missing for FMCG?",
    category: "mapping",
    sector: "FMCG",
    expectedCitations: [
      "ISA_ADVISORY_v1.1",
      "GAP-004",
      "MAP-*",
      "gs1nl.benelux.fmcg.v3.1.33.5",
    ],
  },

  // Version comparison queries (5)
  {
    id: 11,
    query:
      "What changed between ISA v1.0 and v1.1 for Gap #1 (Product Carbon Footprint)?",
    category: "version_comparison",
    sector: "All",
    expectedCitations: [
      "ISA_ADVISORY_v1.0",
      "ISA_ADVISORY_v1.1",
      "GAP-001",
      "gs1eu.gdsn.carbon_footprint.v1.0",
    ],
  },
  {
    id: 12,
    query:
      "Which gaps were upgraded from MISSING to PARTIAL in v1.1 and why?",
    category: "version_comparison",
    sector: "All",
    expectedCitations: [
      "ISA_ADVISORY_v1.0",
      "ISA_ADVISORY_v1.1",
      "GAP-*",
      "dataset registry v1.3.0",
    ],
  },
  {
    id: 13,
    query:
      "What new dataset entries were introduced in dataset registry v1.3.0 to support v1.1?",
    category: "version_comparison",
    sector: "All",
    expectedCitations: [
      "dataset registry v1.3.0",
      "gs1eu.gdsn.carbon_footprint.v1.0",
      "ISA_ADVISORY_v1.1",
    ],
  },
  {
    id: 14,
    query:
      "What changed between v1.0 and v1.1 in recommendations for FMCG regarding Product Carbon Footprint?",
    category: "version_comparison",
    sector: "FMCG",
    expectedCitations: [
      "ISA_ADVISORY_v1.0",
      "ISA_ADVISORY_v1.1",
      "REC-*",
      "gs1nl.benelux.fmcg.v3.1.33.5",
      "gs1eu.gdsn.carbon_footprint.v1.0",
    ],
  },
  {
    id: 15,
    query:
      "What changed between v1.0 and v1.1 in overall mapping coverage for DIY?",
    category: "version_comparison",
    sector: "DIY",
    expectedCitations: [
      "ISA_ADVISORY_v1.0",
      "ISA_ADVISORY_v1.1",
      "MAP-*",
      "gs1nl.benelux.diy_garden_pet.v3.1.33",
    ],
  },

  // Dataset provenance queries (5)
  {
    id: 16,
    query:
      "Which datasets underpin the Product Carbon Footprint recommendations for DIY?",
    category: "dataset_provenance",
    sector: "DIY",
    expectedCitations: [
      "ISA_ADVISORY_v1.1",
      "REC-*",
      "gs1eu.gdsn.carbon_footprint.v1.0",
      "gdsn.current.v3.1.32",
      "gs1nl.benelux.diy_garden_pet.v3.1.33",
    ],
  },
  {
    id: 17,
    query:
      "What is the authoritative source of ESRS E1 datapoint definitions used in the advisory?",
    category: "dataset_provenance",
    sector: "All",
    expectedCitations: [
      "dataset registry v1.3.0",
      "esrs.datapoints.ig3",
      "ISA_ADVISORY_v1.1",
    ],
  },
  {
    id: 18,
    query:
      "Which GS1 Netherlands sector model version is used for healthcare analysis and how many attributes were evaluated?",
    category: "dataset_provenance",
    sector: "Healthcare",
    expectedCitations: [
      "dataset registry v1.3.0",
      "gs1nl.benelux.healthcare.v3.1.33",
      "ISA_ADVISORY_v1.1",
    ],
  },
  {
    id: 19,
    query:
      "Which datasets underpin Gap #5 (Circularity data) assessment in FMCG?",
    category: "dataset_provenance",
    sector: "FMCG",
    expectedCitations: [
      "ISA_ADVISORY_v1.1",
      "GAP-005",
      "gs1nl.benelux.fmcg.v3.1.33.5",
      "gs1nl.benelux.validation_rules.v3.1.33.4",
    ],
  },
  {
    id: 20,
    query:
      "Which datasets are referenced by the Digital Product Passport gap and recommendations for healthcare?",
    category: "dataset_provenance",
    sector: "Healthcare",
    expectedCitations: [
      "ISA_ADVISORY_v1.1",
      "GAP-003",
      "REC-*",
      "eu.dpp.identification_rules",
      "gs1nl.benelux.healthcare.v3.1.33",
    ],
  },

  // Recommendation queries (5)
  {
    id: 21,
    query: "What are the short-term recommendations for DIY for 2025–2026?",
    category: "recommendation",
    sector: "DIY",
    expectedCitations: [
      "ISA_ADVISORY_v1.1",
      "REC-* (timeframe=short)",
      "gs1nl.benelux.diy_garden_pet.v3.1.33",
      "dataset registry v1.3.0",
    ],
  },
  {
    id: 22,
    query:
      "What are the short-term recommendations for FMCG to address Product Carbon Footprint?",
    category: "recommendation",
    sector: "FMCG",
    expectedCitations: [
      "ISA_ADVISORY_v1.1",
      "REC-*",
      "GAP-001",
      "gs1eu.gdsn.carbon_footprint.v1.0",
    ],
  },
  {
    id: 23,
    query:
      "Which recommendations require adoption or alignment with GS1 in Europe publications for healthcare?",
    category: "recommendation",
    sector: "Healthcare",
    expectedCitations: [
      "ISA_ADVISORY_v1.1",
      "REC-*",
      "gs1eu.gdsn.carbon_footprint.v1.0",
    ],
  },
  {
    id: 24,
    query:
      "What are the medium-term recommendations for healthcare to address supplier due diligence?",
    category: "recommendation",
    sector: "Healthcare",
    expectedCitations: [
      "ISA_ADVISORY_v1.1",
      "REC-* (timeframe=medium)",
      "GAP-004",
      "gs1nl.benelux.healthcare.v3.1.33",
    ],
  },
  {
    id: 25,
    query:
      "What are the long-term recommendations for FMCG to close Circularity data gaps?",
    category: "recommendation",
    sector: "FMCG",
    expectedCitations: [
      "ISA_ADVISORY_v1.1",
      "REC-* (timeframe=long)",
      "GAP-005",
      "gs1nl.benelux.fmcg.v3.1.33.5",
    ],
  },

  // Coverage queries (5)
  {
    id: 26,
    query:
      "What is the coverage percentage for ESRS E1 (Climate change) in DIY and which topics drive the missing coverage?",
    category: "coverage",
    sector: "DIY",
    expectedCitations: [
      "ISA_ADVISORY_v1.1",
      "MAP-*",
      "GAP-*",
      "esrs.datapoints.ig3",
      "gs1nl.benelux.diy_garden_pet.v3.1.33",
    ],
  },
  {
    id: 27,
    query:
      "What is the coverage percentage for EUDR-related requirements in FMCG and which GS1 attributes contribute to coverage?",
    category: "coverage",
    sector: "FMCG",
    expectedCitations: [
      "ISA_ADVISORY_v1.1",
      "MAP-*",
      "GAP-005",
      "gs1nl.benelux.fmcg.v3.1.33.5",
    ],
  },
  {
    id: 28,
    query:
      "Which ESRS topic has the highest coverage in healthcare in ISA v1.1?",
    category: "coverage",
    sector: "Healthcare",
    expectedCitations: [
      "ISA_ADVISORY_v1.1",
      "MAP-*",
      "esrs.datapoints.ig3",
      "gs1nl.benelux.healthcare.v3.1.33",
    ],
  },
  {
    id: 29,
    query:
      "What percentage of Digital Product Passport identification requirements are covered in DIY and what remains missing?",
    category: "coverage",
    sector: "DIY",
    expectedCitations: [
      "ISA_ADVISORY_v1.1",
      "GAP-003",
      "MAP-*",
      "eu.dpp.identification_rules",
      "gs1nl.benelux.diy_garden_pet.v3.1.33",
    ],
  },
  {
    id: 30,
    query:
      "What is the coverage percentage for supplier due diligence in healthcare and which gaps explain the missing coverage?",
    category: "coverage",
    sector: "Healthcare",
    expectedCitations: [
      "ISA_ADVISORY_v1.1",
      "GAP-004",
      "MAP-*",
      "gs1nl.benelux.healthcare.v3.1.33",
    ],
  },
];

/**
 * Get all production queries
 */
export function getAllProductionQueries(): ProductionQuery[] {
  return PRODUCTION_QUERIES;
}

/**
 * Get production queries by category
 */
export function getQueriesByCategory(
  category: ProductionQuery["category"]
): ProductionQuery[] {
  return PRODUCTION_QUERIES.filter((q) => q.category === category);
}

/**
 * Get production queries by sector
 */
export function getQueriesBySector(
  sector: ProductionQuery["sector"]
): ProductionQuery[] {
  return PRODUCTION_QUERIES.filter((q) => q.sector === sector);
}

/**
 * Search production queries
 */
export function searchProductionQueries(searchTerm: string): ProductionQuery[] {
  const lowerSearch = searchTerm.toLowerCase();
  return PRODUCTION_QUERIES.filter((q) =>
    q.query.toLowerCase().includes(lowerSearch)
  );
}
