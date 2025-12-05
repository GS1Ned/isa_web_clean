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
  type: "EU_OFFICIAL" | "GS1_OFFICIAL" | "INDUSTRY" | "MEDIA";
  rssUrl?: string;
  apiUrl?: string;
  credibilityScore: number; // 0.0 - 1.0
  keywords: string[]; // ESG-related keywords to filter relevant content
  enabled: boolean;
}

export const NEWS_SOURCES: NewsSource[] = [
  // EU Official Sources (Authoritative Regulatory News)
  {
    id: "eur-lex-press",
    name: "EUR-Lex Press Releases",
    type: "EU_OFFICIAL",
    rssUrl: "https://eur-lex.europa.eu/EN/display-rss.html",
    credibilityScore: 1.0,
    keywords: ["CSRD", "ESRS", "EUDR", "DPP", "PPWR", "ESPR", "sustainability", "ESG", "due diligence", "deforestation", "circular economy", "packaging"],
    enabled: true,
  },
  {
    id: "eu-commission-environment",
    name: "European Commission - Environment",
    type: "EU_OFFICIAL",
    rssUrl: "https://ec.europa.eu/newsroom/env/rss-feeds/specific-newsroom-rss-feed_en?newsroom=29",
    credibilityScore: 1.0,
    keywords: ["CSRD", "ESRS", "EUDR", "DPP", "PPWR", "ESPR", "Green Deal", "sustainability", "circular economy"],
    enabled: true,
  },
  {
    id: "efrag-updates",
    name: "EFRAG - Sustainability Reporting",
    type: "EU_OFFICIAL",
    rssUrl: "https://www.efrag.org/rss",
    credibilityScore: 1.0,
    keywords: ["ESRS", "CSRD", "sustainability reporting", "disclosure", "datapoint"],
    enabled: true,
  },
  
  // GS1 Official Sources (High Relevance to Target Audience)
  {
    id: "gs1-nl-news",
    name: "GS1 Netherlands News",
    type: "GS1_OFFICIAL",
    rssUrl: "https://www.gs1.nl/rss.xml",
    credibilityScore: 0.9,
    keywords: ["CSRD", "ESRS", "EUDR", "DPP", "PPWR", "sustainability", "traceability", "EPCIS", "Digital Product Passport", "supply chain"],
    enabled: true,
  },
  {
    id: "gs1-global-news",
    name: "GS1 Global News",
    type: "GS1_OFFICIAL",
    rssUrl: "https://www.gs1.org/news-events/news/rss",
    credibilityScore: 0.9,
    keywords: ["sustainability", "ESG", "traceability", "EPCIS", "Digital Product Passport", "circular economy", "supply chain transparency"],
    enabled: true,
  },
  {
    id: "gs1-eu-updates",
    name: "GS1 in Europe Updates",
    type: "GS1_OFFICIAL",
    rssUrl: "https://www.gs1.eu/news-events/rss",
    credibilityScore: 0.9,
    keywords: ["CSRD", "ESRS", "EUDR", "DPP", "PPWR", "ESPR", "EU regulation", "sustainability", "traceability"],
    enabled: true,
  },
];

/**
 * Regulation keywords for tagging news articles
 */
export const REGULATION_KEYWORDS = {
  CSRD: ["CSRD", "Corporate Sustainability Reporting Directive", "sustainability reporting directive"],
  ESRS: ["ESRS", "European Sustainability Reporting Standards", "EFRAG"],
  EUDR: ["EUDR", "EU Deforestation Regulation", "deforestation-free", "forest risk commodities"],
  DPP: ["DPP", "Digital Product Passport", "product passport", "Ecodesign"],
  PPWR: ["PPWR", "Packaging and Packaging Waste Regulation", "packaging waste"],
  ESPR: ["ESPR", "Ecodesign for Sustainable Products Regulation", "ecodesign"],
  CSDDD: ["CSDDD", "Corporate Sustainability Due Diligence Directive", "due diligence directive"],
  TAXONOMY: ["EU Taxonomy", "Taxonomy Regulation", "sustainable activities"],
  BATTERIES: ["Battery Regulation", "batteries directive", "battery passport"],
  REACH: ["REACH", "Registration, Evaluation, Authorisation and Restriction of Chemicals"],
};

/**
 * Impact level keywords for scoring news importance
 */
export const IMPACT_KEYWORDS = {
  HIGH: ["adopted", "enters into force", "mandatory", "deadline", "enforcement", "penalty", "final text", "published in Official Journal"],
  MEDIUM: ["proposal", "draft", "consultation", "amendment", "updated guidance", "implementation"],
  LOW: ["discussion", "preliminary", "workshop", "stakeholder meeting", "call for evidence"],
};
