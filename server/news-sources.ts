/**
 * News Sources Configuration
 * Defines authoritative sources for ESG regulatory news
 *
 * Primary Sources: EU official regulatory bodies
 * Secondary Sources: GS1 organizations (high relevance to target audience)
 */

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

export const NEWS_SOURCES: NewsSource[] = [
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
