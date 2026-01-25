/**
 * News Sources Configuration
 * Defines authoritative sources for ESG regulatory news
 *
 * Primary Sources: EU official regulatory bodies
 * Secondary Sources: GS1 organizations (high relevance to target audience)
 * Phase 3 Sources: CSDDD, Green Claims, ESPR, NL-specific
 */

import { PHASE3_SOURCES } from "./news-sources-phase3";

export interface NewsSource {
  id: string;
  name: string;
  type:
    | "EU_OFFICIAL"
    | "GS1_OFFICIAL"
    | "DUTCH_NATIONAL"
    | "INDUSTRY"
    | "MEDIA";
  rssUrl?: string;
  apiUrl?: string;
  credibilityScore: number; // 0.0 - 1.0
  keywords: string[]; // ESG-related keywords to filter relevant content
  enabled: boolean;
}

// Baseline sources (Phase 1-2)
const BASELINE_SOURCES: NewsSource[] = [
  // EU Official Sources (Authoritative Regulatory News)
  {
    id: "eurlex-oj",
    name: "EUR-Lex Official Journal",
    type: "EU_OFFICIAL",
    // No RSS - uses Playwright scraper for Official Journal L series daily view
    credibilityScore: 1.0,
    keywords: [
      "CSRD", "ESRS", "EUDR", "DPP", "PPWR", "ESPR",
      "CSDDD", "CS3D", "Green Claims", "greenwashing",
      "sustainability", "environment", "climate", "deforestation",
      "due diligence", "packaging", "battery", "taxonomy",
      "circular economy", "substantiation"
    ],
    enabled: true,
  },
  {
    id: "eur-lex-press",
    name: "EUR-Lex Press Releases",
    type: "EU_OFFICIAL",
    rssUrl: "https://eur-lex.europa.eu/rss/rss.xml",
    credibilityScore: 1.0,
    keywords: [
      "CSRD",
      "ESRS",
      "EUDR",
      "DPP",
      "PPWR",
      "ESPR",
      "sustainability",
      "ESG",
      "due diligence",
      "deforestation",
      "circular economy",
      "packaging",
    ],
    // Disabled: EUR-Lex RSS feed protected by AWS WAF CAPTCHA challenge
    // Returns HTTP 202 with empty response, causing XML parse errors
    // Coverage provided by EU Commission Press Corner source instead
    enabled: false,
  },
  {
    id: "eu-commission-environment",
    name: "European Commission Press Corner",
    type: "EU_OFFICIAL",
    rssUrl: "https://ec.europa.eu/commission/presscorner/api/rss?language=en",
    credibilityScore: 1.0,
    keywords: [
      "CSRD",
      "ESRS",
      "EUDR",
      "DPP",
      "PPWR",
      "ESPR",
      "CSDDD",
      "CS3D",
      "Green Claims",
      "greenwashing",
      "Green Deal",
      "sustainability",
      "circular economy",
      "substantiation",
      "environmental claims",
    ],
    enabled: true,
  },
  {
    id: "ec-circular-economy",
    name: "European Commission - Circular Economy",
    type: "EU_OFFICIAL",
    rssUrl: "https://environment.ec.europa.eu/node/92/rss_en?f%5B0%5D=oe_news_subject%3Ahttp%3A//data.europa.eu/uxp/1158&f%5B1%5D=oe_news_subject%3Ahttp%3A//data.europa.eu/uxp/1837&f%5B2%5D=oe_news_subject%3Ahttp%3A//data.europa.eu/uxp/c_1138d9d2",
    credibilityScore: 1.0,
    keywords: [
      "circular economy",
      "ESPR",
      "DPP",
      "PPWR",
      "waste management",
      "circularity",
      "EPR",
      "Extended Producer Responsibility",
      "product durability",
      "repairability",
      "secondary raw materials",
      "ecodesign",
    ],
    enabled: true,
  },
  {
    id: "efrag-sustainability",
    name: "EFRAG - Sustainability Reporting",
    type: "EU_OFFICIAL",
    rssUrl: "https://www.efrag.org/rss",
    credibilityScore: 1.0,
    keywords: [
      "ESRS",
      "CSRD",
      "sustainability reporting",
      "disclosure",
      "datapoint",
    ],
    enabled: true,
  },

  // GS1 Official Sources (High Relevance to Target Audience)
  {
    id: "gs1-nl-news",
    name: "GS1 Netherlands News",
    type: "GS1_OFFICIAL",
    rssUrl: "https://www.gs1.nl/rss.xml",
    credibilityScore: 0.9,
    keywords: [
      "CSRD",
      "ESRS",
      "EUDR",
      "DPP",
      "PPWR",
      "sustainability",
      "traceability",
      "EPCIS",
      "Digital Product Passport",
      "supply chain",
    ],
    enabled: true,
  },
  {
    id: "gs1-global-news",
    name: "GS1 Global News",
    type: "GS1_OFFICIAL",
    rssUrl: "https://www.gs1.org/news-events/news/rss",
    credibilityScore: 0.9,
    keywords: [
      "sustainability",
      "ESG",
      "traceability",
      "EPCIS",
      "Digital Product Passport",
      "circular economy",
      "supply chain transparency",
    ],
    enabled: false,  // Disabled: Azure WAF blocks all automated requests
  },
  {
    id: "gs1-eu-updates",
    name: "GS1 in Europe Updates",
    type: "GS1_OFFICIAL",
    rssUrl: "https://www.gs1.eu/news-events/rss",
    credibilityScore: 0.9,
    keywords: [
      "CSRD",
      "ESRS",
      "EUDR",
      "DPP",
      "PPWR",
      "ESPR",
      "EU regulation",
      "sustainability",
      "traceability",
    ],
    enabled: true,
  },

  // Dutch National Sources (Netherlands-specific ESG initiatives)
  {
    id: "greendeal-healthcare",
    name: "Green Deal Duurzame Zorg",
    type: "DUTCH_NATIONAL",
    credibilityScore: 0.95,
    keywords: [
      "healthcare",
      "sustainability",
      "circular economy",
      "medical devices",
      "green teams",
      "duurzame zorg",
      "CSRD",
      "ESRS",
    ],
    enabled: true,
  },
  {
    id: "zes-logistics",
    name: "Op weg naar ZES (Zero-Emission Zones)",
    type: "DUTCH_NATIONAL",
    credibilityScore: 0.95,
    keywords: [
      "zero-emission",
      "logistics",
      "freight",
      "electric vehicles",
      "urban mobility",
      "CO2",
      "sustainability",
      "CSRD",
      "Scope 3",
    ],
    enabled: true,
  },
  {
    id: "rijksoverheid-ienw",
    name: "Rijksoverheid - Infrastructuur en Waterstaat",
    type: "DUTCH_NATIONAL",
    rssUrl: "https://feeds.rijksoverheid.nl/ministeries/ministerie-van-infrastructuur-en-waterstaat/nieuws.rss",
    credibilityScore: 1.0,
    keywords: [
      "circulaire economie",
      "kunststof",
      "verpakkingen",
      "PPWR",
      "ESPR",
      "plastic",
      "recycling",
      "hergebruik",
      "afvalbeheer",
      "statiegeld",
      "duurzaamheid",
      "microplastics",
    ],
    enabled: true,
  },
  {
    id: "rijksoverheid-green-deals",
    name: "Rijksoverheid - Green Deals",
    type: "DUTCH_NATIONAL",
    rssUrl: "https://feeds.rijksoverheid.nl/onderwerpen/duurzame-economie/nieuws.rss",
    credibilityScore: 0.95,
    keywords: [
      "Green Deal",
      "circulaire economie",
      "duurzame economie",
      "textiel",
      "bouw",
      "voedsel",
      "Denim Deal",
      "circulair bouwen",
      "voedselverspilling",
      "sustainability",
    ],
    enabled: true,
  },
  {
    id: "afm-csrd",
    name: "AFM - CSRD Implementation",
    type: "DUTCH_NATIONAL",
    rssUrl: "https://www.afm.nl/en/rss-feed/nieuws-professionals",
    credibilityScore: 1.0,
    keywords: [
      "CSRD",
      "ESRS",
      "sustainability reporting",
      "duurzaamheidsverslaggeving",
      "ESG",
      "double materiality",
      "dubbele materialiteit",
      "supply chain",
      "ketenverantwoordelijkheid",
      "MVO",
    ],
    enabled: true,
  },
];

/**
 * Combined NEWS_SOURCES array
 * Includes baseline sources + Phase 3 expansion sources
 */
export const NEWS_SOURCES: NewsSource[] = [
  ...BASELINE_SOURCES,
  ...PHASE3_SOURCES,
];

/**
 * Regulation keywords for tagging news articles
 */
export const REGULATION_KEYWORDS = {
  CSRD: [
    "CSRD",
    "Corporate Sustainability Reporting Directive",
    "sustainability reporting directive",
  ],
  ESRS: ["ESRS", "European Sustainability Reporting Standards", "EFRAG"],
  EUDR: [
    "EUDR",
    "EU Deforestation Regulation",
    "deforestation-free",
    "forest risk commodities",
  ],
  DPP: ["DPP", "Digital Product Passport", "product passport", "Ecodesign"],
  PPWR: ["PPWR", "Packaging and Packaging Waste Regulation", "packaging waste"],
  ESPR: ["ESPR", "Ecodesign for Sustainable Products Regulation", "ecodesign"],
  CSDDD: [
    "CSDDD",
    "CS3D",
    "Corporate Sustainability Due Diligence Directive",
    "Directive (EU) 2024/1760",
    "due diligence directive",
    "value chain due diligence",
    "human rights due diligence",
    "environmental due diligence",
  ],
  GREEN_CLAIMS: [
    "Green Claims Directive",
    "greenwashing",
    "Empowering Consumers for the Green Transition",
    "Directive (EU) 2024/825",
    "environmental claims",
    "substantiation",
    "misleading claims",
  ],
  CIRCULAR_ECONOMY: [
    "Circular Economy Action Plan",
    "circulaire economie",
    "circular economy",
    "EPR",
    "Extended Producer Responsibility",
    "waste management",
    "product durability",
    "repairability",
  ],
  TAXONOMY: ["EU Taxonomy", "Taxonomy Regulation", "sustainable activities"],
  BATTERIES: ["Battery Regulation", "batteries directive", "battery passport"],
  REACH: [
    "REACH",
    "Registration, Evaluation, Authorisation and Restriction of Chemicals",
  ],
};

/**
 * Impact level keywords for scoring news importance
 */
export const IMPACT_KEYWORDS = {
  HIGH: [
    "adopted",
    "enters into force",
    "mandatory",
    "deadline",
    "enforcement",
    "penalty",
    "final text",
    "published in Official Journal",
  ],
  MEDIUM: [
    "proposal",
    "draft",
    "consultation",
    "amendment",
    "updated guidance",
    "implementation",
  ],
  LOW: [
    "discussion",
    "preliminary",
    "workshop",
    "stakeholder meeting",
    "call for evidence",
  ],
};

/**
 * Negative Signal Keywords (ChatGPT recommendation)
 * Track what disappears, weakens, or gets postponed - often where strategic insight lives
 */
export const NEGATIVE_SIGNAL_KEYWORDS = {
  POSTPONEMENT: [
    "postpone",
    "postponed",
    "postponement",
    "delay",
    "delayed",
    "defer",
    "deferred",
    "deferral",
    "extended deadline",
    "deadline extension",
    "pushed back",
    "later than expected",
  ],
  EXEMPTION: [
    "exemption",
    "exempt",
    "exempted",
    "carve-out",
    "carve out",
    "excluded",
    "exclusion",
    "waiver",
    "derogation",
    "opt-out",
  ],
  SIMPLIFICATION: [
    "simplification",
    "simplified",
    "streamlined",
    "reduced requirements",
    "lighter regime",
    "proportionality",
    "proportionate",
    "less burdensome",
    "administrative burden",
    "omnibus",
  ],
  SCOPE_REDUCTION: [
    "threshold increase",
    "raised threshold",
    "higher threshold",
    "scope reduction",
    "narrower scope",
    "limited scope",
    "fewer companies",
    "smaller scope",
    "reduced scope",
  ],
  VOLUNTARY: [
    "voluntary",
    "non-mandatory",
    "optional",
    "encouraged",
    "recommended",
    "best practice",
    "soft law",
    "guidance only",
  ],
  PHASED_IN: [
    "phased-in",
    "phased in",
    "gradual implementation",
    "transitional period",
    "transition period",
    "grace period",
    "step-by-step",
    "incremental",
  ],
};

/**
 * Regulatory Lifecycle State Keywords (ChatGPT recommendation)
 * Map news content to regulatory lifecycle states for better classification
 */
export const REGULATORY_STATE_KEYWORDS = {
  PROPOSAL: [
    "proposal",
    "proposed",
    "draft proposal",
    "legislative proposal",
    "Commission proposal",
    "initial proposal",
    "first reading",
  ],
  POLITICAL_AGREEMENT: [
    "political agreement",
    "trilogue agreement",
    "provisional agreement",
    "Council agreement",
    "Parliament agreement",
    "compromise reached",
    "deal reached",
  ],
  ADOPTED: [
    "adopted",
    "final adoption",
    "formally adopted",
    "approved",
    "passed",
    "enacted",
    "signed into law",
    "published in Official Journal",
  ],
  DELEGATED_ACT_DRAFT: [
    "delegated act draft",
    "draft delegated act",
    "delegated regulation draft",
    "implementing act draft",
    "technical standards draft",
    "RTS draft",
    "ITS draft",
  ],
  DELEGATED_ACT_ADOPTED: [
    "delegated act adopted",
    "delegated regulation adopted",
    "implementing act adopted",
    "technical standards adopted",
    "RTS adopted",
    "ITS adopted",
    "delegated act published",
  ],
  GUIDANCE: [
    "guidance",
    "guidelines",
    "FAQ",
    "Q&A",
    "interpretation",
    "clarification",
    "implementation guidance",
    "supervisory guidance",
    "staff working document",
  ],
  ENFORCEMENT_SIGNAL: [
    "enforcement",
    "supervisory action",
    "thematic review",
    "inspection",
    "penalty",
    "fine",
    "sanction",
    "infringement",
    "Dear CEO letter",
    "supervisory priorities",
  ],
  POSTPONED_OR_SOFTENED: [
    "postponed",
    "delayed",
    "softened",
    "relaxed",
    "eased",
    "simplified",
    "exemption added",
    "scope reduced",
    "threshold raised",
    "omnibus",
  ],
};

/**
 * Confidence Level Keywords (ChatGPT recommendation)
 * Determine the authority level of the news source content
 */
export const CONFIDENCE_LEVEL_KEYWORDS = {
  CONFIRMED_LAW: [
    "Official Journal",
    "entered into force",
    "legally binding",
    "mandatory",
    "regulation",
    "directive",
    "adopted text",
    "final text",
    "published law",
  ],
  DRAFT_PROPOSAL: [
    "proposal",
    "draft",
    "proposed",
    "under negotiation",
    "trilogue",
    "first reading",
    "second reading",
    "not yet adopted",
    "pending approval",
  ],
  GUIDANCE_INTERPRETATION: [
    "guidance",
    "guidelines",
    "FAQ",
    "Q&A",
    "interpretation",
    "clarification",
    "supervisory expectation",
    "recommended",
    "best practice",
  ],
  MARKET_PRACTICE: [
    "industry practice",
    "market standard",
    "common approach",
    "peer practice",
    "sector initiative",
    "voluntary standard",
    "self-regulation",
    "industry consensus",
  ],
};

/**
 * Helper function to detect negative signals in text
 */
export function detectNegativeSignals(text: string): {
  isNegative: boolean;
  keywords: string[];
  categories: string[];
} {
  const lowerText = text.toLowerCase();
  const foundKeywords: string[] = [];
  const foundCategories: string[] = [];

  for (const [category, keywords] of Object.entries(NEGATIVE_SIGNAL_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        foundKeywords.push(keyword);
        if (!foundCategories.includes(category)) {
          foundCategories.push(category);
        }
      }
    }
  }

  return {
    isNegative: foundKeywords.length > 0,
    keywords: Array.from(new Set(foundKeywords)),
    categories: foundCategories,
  };
}

/**
 * Helper function to determine regulatory state from text
 */
export function detectRegulatoryState(text: string): string {
  const lowerText = text.toLowerCase();
  
  // Check in order of specificity (most specific first)
  const stateOrder = [
    'ENFORCEMENT_SIGNAL',
    'POSTPONED_OR_SOFTENED',
    'DELEGATED_ACT_ADOPTED',
    'DELEGATED_ACT_DRAFT',
    'ADOPTED',
    'POLITICAL_AGREEMENT',
    'GUIDANCE',
    'PROPOSAL',
  ];

  for (const state of stateOrder) {
    const keywords = REGULATORY_STATE_KEYWORDS[state as keyof typeof REGULATORY_STATE_KEYWORDS];
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return state;
      }
    }
  }

  return 'ADOPTED'; // Default
}

/**
 * Helper function to determine confidence level from text and source
 */
export function detectConfidenceLevel(text: string, sourceType: string): string {
  const lowerText = text.toLowerCase();
  
  // EU Official sources get higher confidence by default
  if (sourceType === 'EU_OFFICIAL') {
    // Check for specific confidence indicators
    for (const keyword of CONFIDENCE_LEVEL_KEYWORDS.CONFIRMED_LAW) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return 'CONFIRMED_LAW';
      }
    }
    for (const keyword of CONFIDENCE_LEVEL_KEYWORDS.DRAFT_PROPOSAL) {
      if (lowerText.includes(keyword.toLowerCase())) {
        return 'DRAFT_PROPOSAL';
      }
    }
    return 'GUIDANCE_INTERPRETATION';
  }

  // Check all levels for non-EU sources
  for (const keyword of CONFIDENCE_LEVEL_KEYWORDS.CONFIRMED_LAW) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return 'CONFIRMED_LAW';
    }
  }
  for (const keyword of CONFIDENCE_LEVEL_KEYWORDS.DRAFT_PROPOSAL) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return 'DRAFT_PROPOSAL';
    }
  }
  for (const keyword of CONFIDENCE_LEVEL_KEYWORDS.GUIDANCE_INTERPRETATION) {
    if (lowerText.includes(keyword.toLowerCase())) {
      return 'GUIDANCE_INTERPRETATION';
    }
  }

  return 'MARKET_PRACTICE'; // Default for non-official sources
}
