/**
 * News AI Processor
 * Uses LLM to generate structured summaries and extract metadata from news articles
 * Implements regulation tagging and impact scoring
 */

import { invokeLLM } from "./_core/llm";
import { REGULATION_KEYWORDS, IMPACT_KEYWORDS } from "./news-sources";
import type { RawNewsItem } from "./news-fetcher";

export interface ProcessedNews {
  headline: string; // Concise, clear headline (max 100 chars)
  summary: string; // 2-3 sentence summary
  whatHappened: string; // 2 sentences: what changed
  whyItMatters: string; // 1 sentence: impact/relevance
  regulationTags: string[]; // CSRD, PPWR, EUDR, etc.
  impactLevel: "LOW" | "MEDIUM" | "HIGH";
  newsType: "NEW_LAW" | "AMENDMENT" | "ENFORCEMENT" | "COURT_DECISION" | "GUIDANCE" | "PROPOSAL";
}

/**
 * Process a single news item with AI summarization
 */
export async function processNewsItem(item: RawNewsItem): Promise<ProcessedNews> {
  const content = item.content || item.contentSnippet || "";
  const fullText = `${item.title}\n\n${content}`;
  
  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an ESG regulatory intelligence analyst. Extract structured information from news articles about EU sustainability regulations.

Focus on regulations: CSRD, ESRS, EUDR, DPP, PPWR, ESPR, CSDDD, EU Taxonomy, Battery Regulation, REACH.

Return JSON with this exact structure:
{
  "headline": "Clear, concise headline (max 100 chars)",
  "whatHappened": "2 sentences describing the regulatory change or event",
  "whyItMatters": "1 sentence explaining impact on companies/supply chains",
  "regulationTags": ["CSRD", "ESRS"] // array of relevant regulation acronyms,
  "impactLevel": "HIGH" | "MEDIUM" | "LOW",
  "newsType": "NEW_LAW" | "AMENDMENT" | "ENFORCEMENT" | "COURT_DECISION" | "GUIDANCE" | "PROPOSAL"
}

Impact level criteria:
- HIGH: Final adoption, enforcement deadlines, mandatory requirements, penalties
- MEDIUM: Proposals, draft amendments, updated guidance, implementation details
- LOW: Preliminary discussions, workshops, stakeholder consultations

News type criteria:
- NEW_LAW: New regulation adopted/published
- AMENDMENT: Changes to existing regulation
- ENFORCEMENT: Enforcement actions, penalties, compliance deadlines
- COURT_DECISION: Legal rulings affecting regulations
- GUIDANCE: Official guidance, FAQs, implementation support
- PROPOSAL: Draft regulations, consultation documents`,
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
              headline: { type: "string", description: "Concise headline max 100 chars" },
              whatHappened: { type: "string", description: "2 sentences describing the change" },
              whyItMatters: { type: "string", description: "1 sentence explaining impact" },
              regulationTags: { 
                type: "array", 
                items: { type: "string" },
                description: "Array of regulation acronyms (CSRD, ESRS, EUDR, etc.)"
              },
              impactLevel: { 
                type: "string", 
                enum: ["HIGH", "MEDIUM", "LOW"],
                description: "Impact level based on criteria"
              },
              newsType: {
                type: "string",
                enum: ["NEW_LAW", "AMENDMENT", "ENFORCEMENT", "COURT_DECISION", "GUIDANCE", "PROPOSAL"],
                description: "Type of regulatory news"
              },
            },
            required: ["headline", "whatHappened", "whyItMatters", "regulationTags", "impactLevel", "newsType"],
            additionalProperties: false,
          },
        },
      },
    });

    const content = response.choices[0].message.content;
    const result = JSON.parse(typeof content === 'string' ? content : "{}");
    
    // Combine into summary
    const summary = `${result.whatHappened} ${result.whyItMatters}`;
    
    return {
      headline: result.headline || item.title.slice(0, 100),
      summary,
      whatHappened: result.whatHappened,
      whyItMatters: result.whyItMatters,
      regulationTags: result.regulationTags || [],
      impactLevel: result.impactLevel || "MEDIUM",
      newsType: result.newsType || "GUIDANCE",
    };
  } catch (error) {
    console.error("[news-ai-processor] Error processing news item:", error);
    
    // Fallback to keyword-based extraction
    return fallbackProcessing(item);
  }
}

/**
 * Fallback processing using keyword matching (no LLM)
 */
function fallbackProcessing(item: RawNewsItem): ProcessedNews {
  const text = `${item.title} ${item.content || item.contentSnippet || ""}`.toLowerCase();
  
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
  if (text.includes("adopted") || text.includes("enters into force")) {
    newsType = "NEW_LAW";
  } else if (text.includes("amendment") || text.includes("revised")) {
    newsType = "AMENDMENT";
  } else if (text.includes("enforcement") || text.includes("penalty")) {
    newsType = "ENFORCEMENT";
  } else if (text.includes("court") || text.includes("ruling")) {
    newsType = "COURT_DECISION";
  } else if (text.includes("proposal") || text.includes("draft")) {
    newsType = "PROPOSAL";
  }
  
  return {
    headline: item.title.slice(0, 100),
    summary: (item.contentSnippet || item.content || "").slice(0, 500),
    whatHappened: (item.contentSnippet || item.content || "").slice(0, 250),
    whyItMatters: "This regulatory update may affect compliance requirements.",
    regulationTags,
    impactLevel,
    newsType,
  };
}

/**
 * Batch process multiple news items
 */
export async function processNewsBatch(items: RawNewsItem[]): Promise<ProcessedNews[]> {
  console.log(`[news-ai-processor] Processing ${items.length} news items...`);
  
  const results: ProcessedNews[] = [];
  
  // Process in batches of 5 to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(item => processNewsItem(item))
    );
    results.push(...batchResults);
    
    // Small delay between batches
    if (i + batchSize < items.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`[news-ai-processor] Completed processing ${results.length} items`);
  return results;
}
