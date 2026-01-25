/**
 * News AI Processor
 * Uses LLM to generate structured summaries and extract metadata from news articles
 * Implements regulation tagging, impact scoring, and GS1-specific analysis
 */

import { invokeLLM } from "./_core/llm";
import { 
  REGULATION_KEYWORDS, 
  IMPACT_KEYWORDS,
  detectNegativeSignals,
  detectRegulatoryState,
  detectConfidenceLevel,
} from "./news-sources";
import {
  GS1_IMPACT_TAGS,
  SECTOR_TAGS,
  inferGS1ImpactTags,
  inferSectorTags,
  type GS1ImpactTag,
  type SectorTag,
} from "../shared/news-tags";
import type { RawNewsItem } from "./news-fetcher";
import { serverLogger } from "./_core/logger-wiring";


export interface ProcessedNews {
  headline: string; // Concise, clear headline (max 100 chars)
  summary: string; // 2-3 sentence summary
  whatHappened: string; // 2 sentences: what changed
  whyItMatters: string; // 1 sentence: impact/relevance
  regulationTags: string[]; // CSRD, PPWR, EUDR, etc.
  impactLevel: "LOW" | "MEDIUM" | "HIGH";
  newsType:
    | "NEW_LAW"
    | "AMENDMENT"
    | "ENFORCEMENT"
    | "COURT_DECISION"
    | "GUIDANCE"
    | "PROPOSAL";

  // GS1-specific fields
  gs1ImpactTags: string[]; // IDENTIFICATION, PACKAGING_ATTRIBUTES, ESG_REPORTING, DUE_DILIGENCE, TRACEABILITY, DPP, etc.
  sectorTags: string[]; // RETAIL, HEALTHCARE, FOOD, LOGISTICS, DIY, CONSTRUCTION, TEXTILES, etc.
  gs1ImpactAnalysis: string; // 2-3 sentences explaining GS1 relevance and impact
  suggestedActions: string[]; // 2-4 actionable next steps for GS1 NL members

  // ChatGPT-recommended regulatory intelligence fields
  regulatoryState: "PROPOSAL" | "POLITICAL_AGREEMENT" | "ADOPTED" | "DELEGATED_ACT_DRAFT" | "DELEGATED_ACT_ADOPTED" | "GUIDANCE" | "ENFORCEMENT_SIGNAL" | "POSTPONED_OR_SOFTENED";
  isNegativeSignal: boolean;
  confidenceLevel: "CONFIRMED_LAW" | "DRAFT_PROPOSAL" | "GUIDANCE_INTERPRETATION" | "MARKET_PRACTICE";
  negativeSignalKeywords: string[] | null;
}

/**
 * Generate deterministic test response (test-only mode)
 * Returns predictable output based on input content for reliable testing
 */
function generateTestModeResponse(item: RawNewsItem): ProcessedNews {
  const text = `${item.title} ${item.content || item.contentSnippet || ""}`.toLowerCase();
  
  // Deterministic tag inference based on keywords
  const regulationTags: string[] = [];
  if (text.includes("csrd") || text.includes("esrs")) regulationTags.push("CSRD", "ESRS");
  if (text.includes("dpp") || text.includes("digital product passport")) regulationTags.push("DPP");
  if (text.includes("eudr")) regulationTags.push("EUDR");
  if (text.includes("ppwr")) regulationTags.push("PPWR");
  
  const gs1ImpactTags: string[] = [];
  if (text.includes("dpp") || text.includes("digital product passport")) {
    gs1ImpactTags.push("DPP", "IDENTIFICATION", "PACKAGING_ATTRIBUTES");
  } else if (text.includes("traceability") || text.includes("supply chain")) {
    gs1ImpactTags.push("TRACEABILITY", "ESG_REPORTING");
  } else {
    gs1ImpactTags.push("PACKAGING_ATTRIBUTES", "ESG_REPORTING", "TRACEABILITY");
  }
  
  const sectorTags: string[] = [];
  if (text.includes("automotive")) sectorTags.push("AUTOMOTIVE");
  if (text.includes("retail")) sectorTags.push("RETAIL");
  if (text.includes("healthcare")) sectorTags.push("HEALTHCARE");
  if (sectorTags.length === 0) sectorTags.push("GENERAL");
  
  // Deterministic impact level
  let impactLevel: "LOW" | "MEDIUM" | "HIGH" = "MEDIUM";
  if (text.includes("mandatory") || text.includes("deadline") || text.includes("enforcement")) {
    impactLevel = "HIGH";
  } else if (text.includes("proposal") || text.includes("draft")) {
    impactLevel = "LOW";
  }
  
  // Deterministic news type
  let newsType: ProcessedNews["newsType"] = "GUIDANCE";
  if (text.includes("published") || text.includes("adopted")) newsType = "NEW_LAW";
  else if (text.includes("amendment")) newsType = "AMENDMENT";
  else if (text.includes("proposal")) newsType = "PROPOSAL";
  
  // Detect new ChatGPT-recommended fields
  const negativeSignals = detectNegativeSignals(text);
  const regulatoryState = detectRegulatoryState(text) as ProcessedNews["regulatoryState"];
  const confidenceLevel = detectConfidenceLevel(text, "EU_OFFICIAL") as ProcessedNews["confidenceLevel"];

  return {
    headline: item.title.slice(0, 100),
    summary: `${item.title} - Test mode deterministic summary`,
    whatHappened: "This is a deterministic test response. The regulation has been published.",
    whyItMatters: "This impacts GS1 members who need to comply with new data requirements.",
    regulationTags,
    impactLevel,
    newsType,
    gs1ImpactTags,
    sectorTags,
    gs1ImpactAnalysis: `This regulation may affect GS1 standards related to ${gs1ImpactTags.join(", ")}. Companies should review their data models and processes for compliance.`,
    suggestedActions: [
      "Review the full regulation text for specific requirements",
      "Assess current GS1 data model compliance",
      "Contact GS1 Netherlands for implementation guidance",
    ],
    // ChatGPT-recommended regulatory intelligence fields
    regulatoryState,
    isNegativeSignal: negativeSignals.isNegative,
    confidenceLevel,
    negativeSignalKeywords: negativeSignals.keywords.length > 0 ? negativeSignals.keywords : null,
  };
}

/**
 * Process a single news item with AI summarization
 * @param item - Raw news item to process
 * @param options - Optional configuration
 * @param options.testMode - If true, returns deterministic mock data without calling LLM (for testing)
 */
export async function processNewsItem(
  item: RawNewsItem,
  options?: { testMode?: boolean }
): Promise<ProcessedNews> {
  // Test mode: return deterministic mock data without LLM call
  if (options?.testMode) {
    return generateTestModeResponse(item);
  }
  const content = item.content || item.contentSnippet || "";
  const fullText = `${item.title}\n\n${content}`;

  // Normal mode: use LLM

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an ESG regulatory intelligence analyst specializing in GS1 supply chain standards.

Your audience: GS1 Netherlands members (retailers, manufacturers, logistics providers, healthcare organizations).

Your task: Analyze news about EU and Dutch sustainability regulations and explain:
1. What happened (regulatory change)
2. Why it matters (business impact)
3. How GS1 standards help (specific identifiers, data models, processes)
4. What users should do next (actionable steps)

Focus on regulations: CSRD, ESRS, EUDR, DPP, PPWR, ESPR, CSDDD, CS3D, EU Taxonomy, Battery Regulation, REACH, Green Claims.

Focus on GS1 standards: GTIN, GLN, SSCC, EPCIS, GDSN, Digital Link, GS1 Web Vocabulary, packaging attributes.

Return JSON with this structure:
{
  "headline": "Clear, concise headline (max 100 chars)",
  "whatHappened": "2 sentences describing the regulatory change or event",
  "whyItMatters": "1 sentence explaining impact on companies/supply chains",
  "regulationTags": ["CSRD", "ESRS"],
  "impactLevel": "HIGH" | "MEDIUM" | "LOW",
  "newsType": "NEW_LAW" | "AMENDMENT" | "ENFORCEMENT" | "COURT_DECISION" | "GUIDANCE" | "PROPOSAL",
  
  "gs1ImpactTags": ["DPP", "TRACEABILITY"],
  "sectorTags": ["RETAIL", "HEALTHCARE"],
  "gs1ImpactAnalysis": "2-3 sentences explaining which GS1 standards/identifiers/data models are relevant and how they help companies comply. Be specific about GTIN, GLN, EPCIS, GDSN, Digital Link, packaging attributes, etc.",
  "suggestedActions": [
    "Review GDSN packaging attributes for recyclability data",
    "Implement EPCIS events for traceability",
    "Update product master data with sustainability fields"
  ]
}

Impact level criteria:
- HIGH: Final adoption, enforcement deadlines, mandatory requirements, penalties
- MEDIUM: Proposals, draft amendments, updated guidance, implementation details
- LOW: Preliminary discussions, workshops, stakeholder consultations

GS1 Impact Tags (select 1-3): ${Object.keys(GS1_IMPACT_TAGS).join(", ")}

Sector Tags (select 1-3): ${Object.keys(SECTOR_TAGS).join(", ")}`,
        },
        {
          role: "user",
          content: `Analyze this news article and extract structured information:\n\n${fullText.slice(0, 4000)}`, // Limit to 4000 chars
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "news_analysis",
          strict: true,
          schema: {
            type: "object",
            properties: {
              headline: {
                type: "string",
                description: "Concise headline max 100 chars",
              },
              whatHappened: {
                type: "string",
                description: "2 sentences describing the change",
              },
              whyItMatters: {
                type: "string",
                description: "1 sentence explaining impact",
              },
              regulationTags: {
                type: "array",
                items: { type: "string" },
                description:
                  "Array of regulation acronyms (CSRD, ESRS, EUDR, etc.)",
              },
              impactLevel: {
                type: "string",
                enum: ["HIGH", "MEDIUM", "LOW"],
                description: "Impact level based on criteria",
              },
              newsType: {
                type: "string",
                enum: [
                  "NEW_LAW",
                  "AMENDMENT",
                  "ENFORCEMENT",
                  "COURT_DECISION",
                  "GUIDANCE",
                  "PROPOSAL",
                ],
                description: "Type of regulatory news",
              },
              gs1ImpactTags: {
                type: "array",
                items: { type: "string" },
                description: "1-3 GS1 impact tags from the provided list",
              },
              sectorTags: {
                type: "array",
                items: { type: "string" },
                description: "1-3 sector tags from the provided list",
              },
              gs1ImpactAnalysis: {
                type: "string",
                description:
                  "2-3 sentences explaining GS1 relevance and how standards help compliance",
              },
              suggestedActions: {
                type: "array",
                items: { type: "string" },
                description: "2-4 actionable next steps for GS1 NL members",
              },
            },
            required: [
              "headline",
              "whatHappened",
              "whyItMatters",
              "regulationTags",
              "impactLevel",
              "newsType",
              "gs1ImpactTags",
              "sectorTags",
              "gs1ImpactAnalysis",
              "suggestedActions",
            ],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const result = JSON.parse(typeof content === "string" ? content : "{}");

    // Combine into summary
    const summary = `${result.whatHappened} ${result.whyItMatters}`;

    // Detect ChatGPT-recommended regulatory intelligence fields from full text
    const textForAnalysis = `${item.title} ${item.content || item.contentSnippet || ""}`;
    const negativeSignals = detectNegativeSignals(textForAnalysis);
    const regulatoryState = detectRegulatoryState(textForAnalysis) as ProcessedNews["regulatoryState"];
    const confidenceLevel = detectConfidenceLevel(textForAnalysis, "EU_OFFICIAL") as ProcessedNews["confidenceLevel"];

    return {
      headline: result.headline || item.title.slice(0, 100),
      summary,
      whatHappened: result.whatHappened,
      whyItMatters: result.whyItMatters,
      regulationTags: result.regulationTags || [],
      impactLevel: result.impactLevel || "MEDIUM",
      newsType: result.newsType || "GUIDANCE",
      gs1ImpactTags: result.gs1ImpactTags || [],
      sectorTags: result.sectorTags || [],
      gs1ImpactAnalysis: result.gs1ImpactAnalysis || "",
      suggestedActions: result.suggestedActions || [],
      // ChatGPT-recommended regulatory intelligence fields
      regulatoryState,
      isNegativeSignal: negativeSignals.isNegative,
      confidenceLevel,
      negativeSignalKeywords: negativeSignals.keywords.length > 0 ? negativeSignals.keywords : null,
    };
  } catch (error) {
    serverLogger.error("[news-ai-processor] Error processing news item:", error);

    // Fallback to keyword-based extraction
    return fallbackProcessing(item);
  }
}

/**
 * Fallback processing using keyword matching (no LLM)
 */
function fallbackProcessing(item: RawNewsItem): ProcessedNews {
  const text =
    `${item.title} ${item.content || item.contentSnippet || ""}`.toLowerCase();

  // Extract regulation tags
  const regulationTags: string[] = [];
  for (const [regulation, keywords] of Object.entries(REGULATION_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw.toLowerCase()))) {
      regulationTags.push(regulation);
    }
  }

  // Determine impact level
  let impactLevel: "LOW" | "MEDIUM" | "HIGH" = "MEDIUM";
  if (IMPACT_KEYWORDS.HIGH.some(kw => text.includes(kw.toLowerCase()))) {
    impactLevel = "HIGH";
  } else if (IMPACT_KEYWORDS.LOW.some(kw => text.includes(kw.toLowerCase()))) {
    impactLevel = "LOW";
  }

  // Determine news type
  let newsType: ProcessedNews["newsType"] = "GUIDANCE";
  if (
    text.includes("adopted") ||
    text.includes("published") ||
    text.includes("enters into force")
  ) {
    newsType = "NEW_LAW";
  } else if (text.includes("amendment") || text.includes("revised")) {
    newsType = "AMENDMENT";
  } else if (
    text.includes("enforcement") ||
    text.includes("penalty") ||
    text.includes("deadline")
  ) {
    newsType = "ENFORCEMENT";
  } else if (
    text.includes("court") ||
    text.includes("ruling") ||
    text.includes("judgment")
  ) {
    newsType = "COURT_DECISION";
  } else if (
    text.includes("proposal") ||
    text.includes("draft") ||
    text.includes("consultation")
  ) {
    newsType = "PROPOSAL";
  }

  // Infer GS1 impact tags using keyword matching
  const gs1ImpactTags = inferGS1ImpactTags(text, 3);

  // Infer sector tags using keyword matching
  const sectorTags = inferSectorTags(text, 3);

  // Generate basic GS1 impact analysis
  const gs1ImpactAnalysis =
    gs1ImpactTags.length > 0
      ? `This regulation may affect GS1 standards related to ${gs1ImpactTags.join(", ")}. Companies should review their data models and processes for compliance.`
      : "The GS1 impact of this regulation requires further analysis. Please consult with GS1 Netherlands for guidance.";

  // Generate basic suggested actions
  const suggestedActions = [
    "Review the full regulation text for specific requirements",
    "Assess current GS1 data model compliance",
    "Contact GS1 Netherlands for implementation guidance",
  ];

  // Detect ChatGPT-recommended regulatory intelligence fields
  const negativeSignals = detectNegativeSignals(text);
  const regulatoryState = detectRegulatoryState(text) as ProcessedNews["regulatoryState"];
  const confidenceLevel = detectConfidenceLevel(text, "EU_OFFICIAL") as ProcessedNews["confidenceLevel"];

  return {
    headline: item.title.slice(0, 100),
    summary: (item.content || item.contentSnippet || "").slice(0, 300),
    whatHappened: (item.content || item.contentSnippet || "").slice(0, 200),
    whyItMatters:
      "This regulatory development may impact supply chain operations and data requirements.",
    regulationTags,
    impactLevel,
    newsType,
    gs1ImpactTags,
    sectorTags,
    gs1ImpactAnalysis,
    suggestedActions,
    // ChatGPT-recommended regulatory intelligence fields
    regulatoryState,
    isNegativeSignal: negativeSignals.isNegative,
    confidenceLevel,
    negativeSignalKeywords: negativeSignals.keywords.length > 0 ? negativeSignals.keywords : null,
  };
}

/**
 * Process multiple news items in batch
 */
export async function processNewsBatch(
  items: RawNewsItem[]
): Promise<ProcessedNews[]> {
  const results: ProcessedNews[] = [];

  for (const item of items) {
    try {
      const processed = await processNewsItem(item);
      results.push(processed);
    } catch (error) {
      serverLogger.error(`[news-ai-processor] Failed to process item "${item.title}":`, error);
      // Use fallback processing for failed items
      const fallback = fallbackProcessing(item);
      results.push(fallback);
    }
  }

  return results;
}
