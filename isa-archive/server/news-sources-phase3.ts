/**
 * Phase 3 News Sources Configuration
 * Coverage Expansion: CSDDD, Green Claims, ESPR
 * 
 * This file extends the baseline news-sources.ts with additional sources
 * for improved coverage of key EU ESG regulations.
 * 
 * Authority Tiers:
 * - Tier 1: Official EU/NL government sources (credibilityScore: 1.0)
 * - Tier 2: Regulatory bodies, standards organizations (credibilityScore: 0.9)
 * - Tier 3: Industry associations, specialized media (credibilityScore: 0.8)
 */

/**
 * NewsSource interface (duplicated to avoid circular dependency)
 */
export interface NewsSource {
  id: string;
  name: string;
  type: "EU_OFFICIAL" | "GS1_OFFICIAL" | "DUTCH_NATIONAL" | "INDUSTRY" | "MEDIA";
  rssUrl?: string;
  apiUrl?: string;
  credibilityScore: number;
  keywords: string[];
  enabled: boolean;
}

/**
 * Authority Tier Classification
 */
export type AuthorityTier = "TIER_1" | "TIER_2" | "TIER_3";

export interface Phase3NewsSource extends NewsSource {
  authorityTier: AuthorityTier;
  coverageArea: "CSDDD" | "GREEN_CLAIMS" | "ESPR" | "NL_SPECIFIC" | "GENERAL";
  description: string;
  addedInPhase: 3;
}

/**
 * Phase 3 New Sources - CSDDD / CS3D Focus
 */
export const CSDDD_SOURCES: Phase3NewsSource[] = [
  {
    id: "ec-dg-just-csddd",
    name: "European Commission DG JUST - Corporate Sustainability Due Diligence",
    type: "EU_OFFICIAL",
    authorityTier: "TIER_1",
    coverageArea: "CSDDD",
    description: "Official EU source for CSDDD implementation, guidance, and delegated acts",
    rssUrl: "https://ec.europa.eu/commission/presscorner/api/rss?language=en&keywords=due%20diligence",
    credibilityScore: 1.0,
    keywords: [
      "CSDDD",
      "CS3D",
      "Corporate Sustainability Due Diligence",
      "Directive (EU) 2024/1760",
      "due diligence",
      "value chain",
      "human rights",
      "environmental due diligence",
      "supply chain responsibility",
      "adverse impacts",
      "remediation",
      "stakeholder engagement",
    ],
    enabled: true,
    addedInPhase: 3,
  },
  {
    id: "ec-dg-just-general",
    name: "European Commission DG JUST - Justice and Consumers",
    type: "EU_OFFICIAL",
    authorityTier: "TIER_1",
    coverageArea: "CSDDD",
    description: "DG Justice responsible for CSDDD oversight and enforcement coordination",
    rssUrl: "https://ec.europa.eu/info/departments/justice-and-consumers_en/rss",
    credibilityScore: 1.0,
    keywords: [
      "corporate due diligence",
      "sustainable corporate governance",
      "directors' duties",
      "stakeholder interests",
      "civil liability",
      "administrative supervision",
    ],
    enabled: true,
    addedInPhase: 3,
  },
  {
    id: "bhrrc-eu-due-diligence",
    name: "Business & Human Rights Resource Centre - EU Due Diligence",
    type: "INDUSTRY",
    authorityTier: "TIER_2",
    coverageArea: "CSDDD",
    description: "Leading NGO tracking corporate human rights due diligence globally",
    rssUrl: "https://www.business-humanrights.org/en/rss/feed/",
    credibilityScore: 0.9,
    keywords: [
      "CSDDD",
      "CS3D",
      "due diligence",
      "human rights",
      "supply chain",
      "corporate accountability",
      "EU regulation",
      "mandatory due diligence",
    ],
    enabled: true,
    addedInPhase: 3,
  },
  {
    id: "shift-project-csddd",
    name: "Shift Project - Business & Human Rights",
    type: "INDUSTRY",
    authorityTier: "TIER_2",
    coverageArea: "CSDDD",
    description: "UN Guiding Principles experts providing CSDDD implementation guidance",
    credibilityScore: 0.9,
    keywords: [
      "CSDDD",
      "UNGPs",
      "UN Guiding Principles",
      "human rights due diligence",
      "corporate responsibility",
      "salient human rights issues",
      "stakeholder engagement",
    ],
    enabled: true,
    addedInPhase: 3,
  },
];

/**
 * Phase 3 New Sources - Green Claims Directive Focus
 */
export const GREEN_CLAIMS_SOURCES: Phase3NewsSource[] = [
  {
    id: "ec-dg-env-green-claims",
    name: "European Commission DG ENV - Green Claims",
    type: "EU_OFFICIAL",
    authorityTier: "TIER_1",
    coverageArea: "GREEN_CLAIMS",
    description: "Official EU source for Green Claims Directive and environmental claims substantiation",
    rssUrl: "https://environment.ec.europa.eu/rss_en",
    credibilityScore: 1.0,
    keywords: [
      "Green Claims Directive",
      "greenwashing",
      "environmental claims",
      "substantiation",
      "Empowering Consumers",
      "Directive (EU) 2024/825",
      "misleading claims",
      "carbon neutral",
      "climate neutral",
      "eco-friendly",
      "sustainable",
      "biodegradable",
      "recyclable",
      "PEF",
      "Product Environmental Footprint",
    ],
    enabled: true,
    addedInPhase: 3,
  },
  {
    id: "beuc-green-claims",
    name: "BEUC - European Consumer Organisation",
    type: "INDUSTRY",
    authorityTier: "TIER_2",
    coverageArea: "GREEN_CLAIMS",
    description: "Consumer advocacy organization monitoring green claims enforcement",
    rssUrl: "https://www.beuc.eu/rss.xml",
    credibilityScore: 0.9,
    keywords: [
      "greenwashing",
      "green claims",
      "consumer protection",
      "environmental claims",
      "misleading advertising",
      "substantiation",
      "eco-labels",
    ],
    enabled: true,
    addedInPhase: 3,
  },
  {
    id: "ecos-green-claims",
    name: "ECOS - Environmental Coalition on Standards",
    type: "INDUSTRY",
    authorityTier: "TIER_2",
    coverageArea: "GREEN_CLAIMS",
    description: "Environmental NGO coalition focused on product standards and green claims",
    credibilityScore: 0.9,
    keywords: [
      "green claims",
      "eco-labels",
      "environmental standards",
      "product sustainability",
      "PEF",
      "LCA",
      "life cycle assessment",
    ],
    enabled: true,
    addedInPhase: 3,
  },
];

/**
 * Phase 3 New Sources - ESPR / Digital Product Passport Focus
 */
export const ESPR_SOURCES: Phase3NewsSource[] = [
  {
    id: "ec-dg-grow-espr",
    name: "European Commission DG GROW - Ecodesign for Sustainable Products",
    type: "EU_OFFICIAL",
    authorityTier: "TIER_1",
    coverageArea: "ESPR",
    description: "Official EU source for ESPR delegated acts and Digital Product Passport requirements",
    rssUrl: "https://single-market-economy.ec.europa.eu/rss_en",
    credibilityScore: 1.0,
    keywords: [
      "ESPR",
      "Ecodesign for Sustainable Products",
      "Digital Product Passport",
      "DPP",
      "product requirements",
      "delegated act",
      "textiles",
      "electronics",
      "batteries",
      "furniture",
      "circularity",
      "durability",
      "repairability",
      "recyclability",
    ],
    enabled: true,
    addedInPhase: 3,
  },
  {
    id: "digitaleurope-espr",
    name: "DIGITALEUROPE - Digital Industry Association",
    type: "INDUSTRY",
    authorityTier: "TIER_2",
    coverageArea: "ESPR",
    description: "Digital industry voice on ESPR implementation for electronics and ICT",
    rssUrl: "https://www.digitaleurope.org/feed/",
    credibilityScore: 0.9,
    keywords: [
      "ESPR",
      "Digital Product Passport",
      "electronics",
      "ICT",
      "ecodesign",
      "product sustainability",
      "data requirements",
      "interoperability",
    ],
    enabled: true,
    addedInPhase: 3,
  },
  {
    id: "ecodesign-forum",
    name: "Ecodesign Forum",
    type: "INDUSTRY",
    authorityTier: "TIER_3",
    coverageArea: "ESPR",
    description: "Industry forum tracking ESPR delegated acts and product category requirements",
    credibilityScore: 0.8,
    keywords: [
      "ESPR",
      "ecodesign",
      "product requirements",
      "delegated acts",
      "energy efficiency",
      "material efficiency",
      "circularity",
    ],
    enabled: true,
    addedInPhase: 3,
  },
];

/**
 * Phase 3 New Sources - NL-Specific ESG
 */
export const NL_SPECIFIC_SOURCES: Phase3NewsSource[] = [
  {
    id: "rijksoverheid-esg",
    name: "Rijksoverheid - ESG & Duurzaamheid",
    type: "DUTCH_NATIONAL",
    authorityTier: "TIER_1",
    coverageArea: "NL_SPECIFIC",
    description: "Dutch government official ESG policy and implementation news",
    rssUrl: "https://feeds.rijksoverheid.nl/onderwerpen/duurzame-economie/nieuws.rss",
    credibilityScore: 1.0,
    keywords: [
      "CSRD",
      "CSDDD",
      "duurzaamheid",
      "ESG",
      "ketenverantwoordelijkheid",
      "due diligence",
      "MVO",
      "maatschappelijk verantwoord ondernemen",
    ],
    enabled: true,
    addedInPhase: 3,
  },
  {
    id: "ser-imvo",
    name: "SER - Internationaal MVO",
    type: "DUTCH_NATIONAL",
    authorityTier: "TIER_1",
    coverageArea: "NL_SPECIFIC",
    description: "Dutch Social-Economic Council responsible for IMVO agreements",
    rssUrl: "https://www.ser.nl/nl/rss",
    credibilityScore: 1.0,
    keywords: [
      "IMVO",
      "internationaal MVO",
      "due diligence",
      "ketenverantwoordelijkheid",
      "CSDDD",
      "mensenrechten",
      "arbeidsomstandigheden",
      "milieu",
    ],
    enabled: true,
    addedInPhase: 3,
  },
  {
    id: "mvo-nederland",
    name: "MVO Nederland",
    type: "INDUSTRY",
    authorityTier: "TIER_2",
    coverageArea: "NL_SPECIFIC",
    description: "Dutch CSR network supporting businesses with ESG implementation",
    rssUrl: "https://www.mvonederland.nl/feed/",
    credibilityScore: 0.9,
    keywords: [
      "MVO",
      "duurzaamheid",
      "CSRD",
      "CSDDD",
      "ESG",
      "circulaire economie",
      "klimaat",
      "sociale impact",
    ],
    enabled: true,
    addedInPhase: 3,
  },
  {
    id: "imvo-convenanten",
    name: "IMVO Convenanten",
    type: "DUTCH_NATIONAL",
    authorityTier: "TIER_2",
    coverageArea: "NL_SPECIFIC",
    description: "Dutch sector agreements on international responsible business conduct",
    credibilityScore: 0.9,
    keywords: [
      "IMVO convenant",
      "sectorconvenant",
      "due diligence",
      "ketenverantwoordelijkheid",
      "textiel",
      "voedingsmiddelen",
      "banken",
      "verzekeraars",
    ],
    enabled: true,
    addedInPhase: 3,
  },
];

/**
 * All Phase 3 Sources Combined
 */
export const PHASE3_SOURCES: Phase3NewsSource[] = [
  ...CSDDD_SOURCES,
  ...GREEN_CLAIMS_SOURCES,
  ...ESPR_SOURCES,
  ...NL_SPECIFIC_SOURCES,
];

/**
 * Source Statistics
 */
export const PHASE3_SOURCE_STATS = {
  total: PHASE3_SOURCES.length,
  byTier: {
    TIER_1: PHASE3_SOURCES.filter(s => s.authorityTier === "TIER_1").length,
    TIER_2: PHASE3_SOURCES.filter(s => s.authorityTier === "TIER_2").length,
    TIER_3: PHASE3_SOURCES.filter(s => s.authorityTier === "TIER_3").length,
  },
  byCoverage: {
    CSDDD: CSDDD_SOURCES.length,
    GREEN_CLAIMS: GREEN_CLAIMS_SOURCES.length,
    ESPR: ESPR_SOURCES.length,
    NL_SPECIFIC: NL_SPECIFIC_SOURCES.length,
  },
  enabled: PHASE3_SOURCES.filter(s => s.enabled).length,
};

/**
 * Extended Obligation Keywords (Phase 3: Intelligence-Verdieping)
 * Adds 20+ new keywords for improved obligation detection
 */
export const EXTENDED_OBLIGATION_KEYWORDS = [
  // Core obligation terms
  "shall",
  "must",
  "required",
  "mandatory",
  "obliged",
  "obligation",
  "binding",
  "compulsory",
  
  // Compliance-specific
  "comply",
  "compliance",
  "compliant",
  "non-compliance",
  "in accordance with",
  "pursuant to",
  
  // Prohibition terms
  "prohibited",
  "forbidden",
  "not permitted",
  "shall not",
  "must not",
  "may not",
  
  // Enforcement terms
  "enforceable",
  "enforcement",
  "penalty",
  "sanction",
  "fine",
  "infringement",
  
  // Deadline-related
  "deadline",
  "by [date]",
  "no later than",
  "within [period]",
  "effective from",
  "enters into force",
  
  // Scope terms
  "applies to",
  "subject to",
  "covered by",
  "within scope",
  "in-scope",
];

/**
 * Extended Negative Signal Keywords (Phase 3: Intelligence-Verdieping)
 * Adds 15+ new keywords for improved negative signal detection
 */
export const EXTENDED_NEGATIVE_SIGNAL_KEYWORDS = {
  DELAY: [
    "delay",
    "delayed",
    "postpone",
    "postponed",
    "defer",
    "deferred",
    "pushed back",
    "extended timeline",
    "later implementation",
    "additional time",
  ],
  EXEMPTION: [
    "exemption",
    "exempt",
    "carve-out",
    "excluded",
    "waiver",
    "derogation",
    "opt-out",
    "exception",
    "not applicable",
    "outside scope",
  ],
  SOFTENING: [
    "softened",
    "relaxed",
    "eased",
    "simplified",
    "reduced requirements",
    "lighter regime",
    "proportionate approach",
    "flexibility",
    "less stringent",
    "modified approach",
  ],
  UNCERTAINTY: [
    "unclear",
    "ambiguous",
    "pending clarification",
    "awaiting guidance",
    "subject to interpretation",
    "not yet defined",
    "to be determined",
    "under review",
  ],
  ROLLBACK: [
    "withdrawn",
    "repealed",
    "revoked",
    "cancelled",
    "abandoned",
    "dropped",
    "removed",
    "rolled back",
  ],
};

/**
 * Helper function to get source by ID
 */
export function getPhase3SourceById(id: string): Phase3NewsSource | undefined {
  return PHASE3_SOURCES.find(s => s.id === id);
}

/**
 * Helper function to get sources by coverage area
 */
export function getPhase3SourcesByCoverage(coverage: Phase3NewsSource["coverageArea"]): Phase3NewsSource[] {
  return PHASE3_SOURCES.filter(s => s.coverageArea === coverage);
}

/**
 * Helper function to get sources by authority tier
 */
export function getPhase3SourcesByTier(tier: AuthorityTier): Phase3NewsSource[] {
  return PHASE3_SOURCES.filter(s => s.authorityTier === tier);
}

/**
 * Detect obligations in text using extended keywords
 */
export function detectObligations(text: string): {
  hasObligation: boolean;
  keywords: string[];
  strength: "strong" | "moderate" | "weak";
} {
  const lowerText = text.toLowerCase();
  const foundKeywords: string[] = [];
  
  for (const keyword of EXTENDED_OBLIGATION_KEYWORDS) {
    if (lowerText.includes(keyword.toLowerCase())) {
      foundKeywords.push(keyword);
    }
  }
  
  // Determine strength based on keyword types
  const strongKeywords = ["shall", "must", "mandatory", "required", "prohibited", "binding"];
  const hasStrong = foundKeywords.some(k => strongKeywords.includes(k.toLowerCase()));
  
  const moderateKeywords = ["comply", "compliance", "obligation", "enforceable", "deadline"];
  const hasModerate = foundKeywords.some(k => moderateKeywords.includes(k.toLowerCase()));
  
  let strength: "strong" | "moderate" | "weak" = "weak";
  if (hasStrong) strength = "strong";
  else if (hasModerate) strength = "moderate";
  
  return {
    hasObligation: foundKeywords.length > 0,
    keywords: Array.from(new Set(foundKeywords)),
    strength,
  };
}

/**
 * Detect negative signals using extended keywords
 */
export function detectExtendedNegativeSignals(text: string): {
  isNegative: boolean;
  keywords: string[];
  categories: string[];
  severity: "high" | "medium" | "low";
} {
  const lowerText = text.toLowerCase();
  const foundKeywords: string[] = [];
  const foundCategories: string[] = [];
  
  for (const [category, keywords] of Object.entries(EXTENDED_NEGATIVE_SIGNAL_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        foundKeywords.push(keyword);
        if (!foundCategories.includes(category)) {
          foundCategories.push(category);
        }
      }
    }
  }
  
  // Determine severity
  const highSeverityCategories = ["ROLLBACK", "EXEMPTION"];
  const mediumSeverityCategories = ["DELAY", "SOFTENING"];
  
  let severity: "high" | "medium" | "low" = "low";
  if (foundCategories.some(c => highSeverityCategories.includes(c))) {
    severity = "high";
  } else if (foundCategories.some(c => mediumSeverityCategories.includes(c))) {
    severity = "medium";
  }
  
  return {
    isNegative: foundKeywords.length > 0,
    keywords: Array.from(new Set(foundKeywords)),
    categories: foundCategories,
    severity,
  };
}
