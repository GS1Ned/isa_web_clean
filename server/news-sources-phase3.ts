/**
 * Phase 3 News Sources
 *
 * This module is intentionally self-contained and deterministic:
 * - Provides a curated list of Phase 3 sources with authority tiers and coverage areas.
 * - Provides keyword detectors used for lightweight news intelligence.
 *
 * Tests for this module live in `server/news-sources-phase3.test.ts`.
 */

export type AuthorityTier = "TIER_1" | "TIER_2" | "TIER_3";
export type CoverageArea =
  | "CSDDD"
  | "GREEN_CLAIMS"
  | "ESPR"
  | "NL_SPECIFIC"
  | "GENERAL";

export interface Phase3NewsSource {
  id: string;
  name: string;
  type: "official" | "industry" | "national";
  url: string;
  enabled: boolean;
  priority: number;
  description: string;

  authorityTier: AuthorityTier;
  coverageArea: CoverageArea;
  credibilityScore: 1.0 | 0.9 | 0.8;
  keywords: string[];
  addedInPhase: 3;
}

function tierCredibilityScore(tier: AuthorityTier): 1.0 | 0.9 | 0.8 {
  if (tier === "TIER_1") return 1.0;
  if (tier === "TIER_2") return 0.9;
  return 0.8;
}

function src(p: Omit<Phase3NewsSource, "credibilityScore" | "addedInPhase">): Phase3NewsSource {
  return {
    ...p,
    credibilityScore: tierCredibilityScore(p.authorityTier),
    addedInPhase: 3,
  };
}

// Minimum set to satisfy Phase 3 coverage requirements (see tests).
export const PHASE3_SOURCES: Phase3NewsSource[] = [
  // CSDDD
  src({
    id: "ec-dg-just-csddd",
    name: "European Commission - DG JUST (CSDDD)",
    type: "official",
    url: "https://commission.europa.eu/",
    enabled: true,
    priority: 10,
    description: "Primary EU source for CSDDD updates and implementation details.",
    authorityTier: "TIER_1",
    coverageArea: "CSDDD",
    keywords: ["csddd", "due diligence", "supply chain", "corporate sustainability"],
  }),
  src({
    id: "eu-parliament-csddd",
    name: "European Parliament (CSDDD)",
    type: "official",
    url: "https://www.europarl.europa.eu/",
    enabled: true,
    priority: 9,
    description: "EU legislative updates and reports relevant to CSDDD.",
    authorityTier: "TIER_1",
    coverageArea: "CSDDD",
    keywords: ["csddd", "directive", "amendment", "plenary"],
  }),
  src({
    id: "eu-council-csddd",
    name: "Council of the EU (CSDDD)",
    type: "official",
    url: "https://www.consilium.europa.eu/",
    enabled: true,
    priority: 8,
    description: "Council positions and adoption timeline signals for CSDDD.",
    authorityTier: "TIER_2",
    coverageArea: "CSDDD",
    keywords: ["csddd", "council", "general approach", "adoption"],
  }),

  // Green Claims
  src({
    id: "ec-dg-env-green-claims",
    name: "European Commission - DG ENV (Green Claims)",
    type: "official",
    url: "https://commission.europa.eu/",
    enabled: true,
    priority: 10,
    description: "Primary EU source for Green Claims / consumer information policy.",
    authorityTier: "TIER_1",
    coverageArea: "GREEN_CLAIMS",
    keywords: ["green claims", "substantiation", "verification", "consumer"],
  }),
  src({
    id: "eu-parliament-green-claims",
    name: "European Parliament (Green Claims)",
    type: "official",
    url: "https://www.europarl.europa.eu/",
    enabled: true,
    priority: 8,
    description: "Legislative updates for Green Claims directive.",
    authorityTier: "TIER_2",
    coverageArea: "GREEN_CLAIMS",
    keywords: ["green claims", "directive", "committee", "report"],
  }),

  // ESPR
  src({
    id: "ec-dg-grow-espr",
    name: "European Commission - DG GROW (ESPR)",
    type: "official",
    url: "https://commission.europa.eu/",
    enabled: true,
    priority: 10,
    description: "Primary EU source for ESPR and delegated acts signals.",
    authorityTier: "TIER_1",
    coverageArea: "ESPR",
    keywords: ["espr", "ecodesign", "delegated act", "dpp"],
  }),
  src({
    id: "eu-parliament-espr",
    name: "European Parliament (ESPR)",
    type: "official",
    url: "https://www.europarl.europa.eu/",
    enabled: true,
    priority: 8,
    description: "Parliament updates relevant to ESPR implementation.",
    authorityTier: "TIER_2",
    coverageArea: "ESPR",
    keywords: ["espr", "ecodesign", "implementation", "amendment"],
  }),

  // NL-specific
  src({
    id: "nl-rvo-sustainability",
    name: "RVO (Netherlands Enterprise Agency)",
    type: "national",
    url: "https://www.rvo.nl/",
    enabled: true,
    priority: 7,
    description: "Dutch implementation guidance and national initiatives signals.",
    authorityTier: "TIER_2",
    coverageArea: "NL_SPECIFIC",
    keywords: ["netherlands", "guidance", "implementation", "subsidy"],
  }),
  src({
    id: "gs1-nl-news",
    name: "GS1 Netherlands (News)",
    type: "industry",
    url: "https://www.gs1.nl/",
    enabled: true,
    priority: 6,
    description: "GS1 NL member-facing updates and implementation notes.",
    authorityTier: "TIER_3",
    coverageArea: "NL_SPECIFIC",
    keywords: ["gs1", "dpp", "eudr", "csrd", "esrs"],
  }),
];

export const CSDDD_SOURCES = PHASE3_SOURCES.filter((s) => s.coverageArea === "CSDDD");
export const GREEN_CLAIMS_SOURCES = PHASE3_SOURCES.filter(
  (s) => s.coverageArea === "GREEN_CLAIMS"
);
export const ESPR_SOURCES = PHASE3_SOURCES.filter((s) => s.coverageArea === "ESPR");
export const NL_SPECIFIC_SOURCES = PHASE3_SOURCES.filter(
  (s) => s.coverageArea === "NL_SPECIFIC"
);

export const PHASE3_SOURCE_STATS = {
  total: PHASE3_SOURCES.length,
  byTier: {
    TIER_1: PHASE3_SOURCES.filter((s) => s.authorityTier === "TIER_1").length,
    TIER_2: PHASE3_SOURCES.filter((s) => s.authorityTier === "TIER_2").length,
    TIER_3: PHASE3_SOURCES.filter((s) => s.authorityTier === "TIER_3").length,
  },
  byCoverage: {
    CSDDD: CSDDD_SOURCES.length,
    GREEN_CLAIMS: GREEN_CLAIMS_SOURCES.length,
    ESPR: ESPR_SOURCES.length,
    NL_SPECIFIC: NL_SPECIFIC_SOURCES.length,
  },
} as const;

export function getPhase3SourceById(id: string) {
  return PHASE3_SOURCES.find((s) => s.id === id);
}

export function getPhase3SourcesByCoverage(coverage: CoverageArea) {
  return PHASE3_SOURCES.filter((s) => s.coverageArea === coverage);
}

export function getPhase3SourcesByTier(tier: AuthorityTier) {
  return PHASE3_SOURCES.filter((s) => s.authorityTier === tier);
}

export const EXTENDED_OBLIGATION_KEYWORDS = [
  "shall",
  "shall not",
  "must",
  "must not",
  "required",
  "mandatory",
  "obliged",
  "obligation",
  "prohibited",
  "ban",
  "enforce",
  "enforcement",
  "comply",
  "compliance",
  "deadline",
  "report",
  "disclose",
  "verify",
  "audit",
  "penalty",
  "fine",
] as const;

export function detectObligations(text: string): {
  hasObligation: boolean;
  keywords: string[];
  strength: "weak" | "moderate" | "strong";
} {
  const hay = text.toLowerCase();
  const matches = EXTENDED_OBLIGATION_KEYWORDS.filter((k) => hay.includes(k));
  const hasObligation = matches.length > 0;

  const strong = ["shall", "shall not", "must", "must not", "mandatory", "required", "prohibited"];
  const strength: "weak" | "moderate" | "strong" = !hasObligation
    ? "weak"
    : matches.some((m) => strong.includes(m))
      ? "strong"
      : "moderate";

  return { hasObligation, keywords: matches, strength };
}

export const EXTENDED_NEGATIVE_SIGNAL_KEYWORDS = {
  DELAY: ["delay", "delayed", "postpone", "postponed", "extended", "extension"],
  EXEMPTION: ["exemption", "exempt", "waiver", "derogation", "opt-out"],
  SOFTENING: ["softened", "relaxed", "watered down", "reduced", "less stringent"],
  ROLLBACK: ["withdrawn", "repealed", "reversal", "roll back"],
  UNCERTAINTY: ["unclear", "pending clarification", "under discussion", "subject to change"],
} as const;

export function detectExtendedNegativeSignals(text: string): {
  isNegative: boolean;
  categories: (keyof typeof EXTENDED_NEGATIVE_SIGNAL_KEYWORDS)[];
  keywords: string[];
  severity: "low" | "medium" | "high";
} {
  const hay = text.toLowerCase();
  const categories: (keyof typeof EXTENDED_NEGATIVE_SIGNAL_KEYWORDS)[] = [];
  const keywords: string[] = [];

  for (const [cat, list] of Object.entries(EXTENDED_NEGATIVE_SIGNAL_KEYWORDS) as Array<
    [keyof typeof EXTENDED_NEGATIVE_SIGNAL_KEYWORDS, readonly string[]]
  >) {
    const hits = list.filter((k) => hay.includes(k));
    if (hits.length > 0) {
      categories.push(cat);
      keywords.push(...hits);
    }
  }

  const isNegative = categories.length > 0;
  let severity: "low" | "medium" | "high" = "low";

  if (isNegative) {
    severity = "medium";
    if (categories.includes("ROLLBACK")) {
      severity = "high";
    } else if (categories.includes("EXEMPTION") && keywords.some((k) => k === "waiver")) {
      severity = "high";
    } else if (categories.includes("DELAY") && keywords.some((k) => k === "postponed")) {
      severity = "medium";
    }
  }

  return { isNegative, categories, keywords, severity };
}

