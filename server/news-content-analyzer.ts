/**
 * News Content Analyzer
 * Extracts key topics, entities, and themes from news articles using LLM
 */

import { invokeLLM } from "./_core/llm";
import { serverLogger } from "./_core/logger-wiring";


export interface ContentAnalysis {
  mainTopics: string[];
  regulationMentions: string[];
  standardMentions: string[];
  keyEntities: string[];
  themes: string[];
  impactAreas: string[];
  deadlineMentions: string[];
  actionableInsights: string[];
}

export async function analyzeNewsContent(
  title: string,
  summary: string,
  content: string
): Promise<ContentAnalysis> {
  const fullText = `${title}\n\n${summary}\n\n${content}`.substring(0, 4000);

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are an expert analyst specializing in EU sustainability regulations and GS1 supply chain standards. Extract structured information from news articles. Return JSON only.",
        },
        {
          role: "user",
          content: `Analyze this news article:\n\n${fullText}\n\nReturn JSON with: mainTopics, regulationMentions, standardMentions, keyEntities, themes, impactAreas, deadlineMentions, actionableInsights`,
        },
      ],
    });

    const content_str = response.choices[0].message.content;
    const analysis = JSON.parse(
      typeof content_str === "string" ? content_str : "{}"
    );

    return {
      mainTopics: analysis.mainTopics || [],
      regulationMentions: analysis.regulationMentions || [],
      standardMentions: analysis.standardMentions || [],
      keyEntities: analysis.keyEntities || [],
      themes: analysis.themes || [],
      impactAreas: analysis.impactAreas || [],
      deadlineMentions: analysis.deadlineMentions || [],
      actionableInsights: analysis.actionableInsights || [],
    };
  } catch (error) {
    serverLogger.error("[news-content-analyzer] LLM failed:", error);
    return fallbackAnalysis(title, summary, content);
  }
}

function fallbackAnalysis(
  title: string,
  summary: string,
  content: string
): ContentAnalysis {
  const fullText = `${title} ${summary} ${content}`.toLowerCase();
  const regulationKeywords = ["csrd", "esrs", "eudr", "dpp", "ppwr", "espr"];
  const standardKeywords = ["gtin", "gln", "epcis"];

  return {
    mainTopics: [],
    regulationMentions: regulationKeywords.filter(k => fullText.includes(k)),
    standardMentions: standardKeywords.filter(k => fullText.includes(k)),
    keyEntities: [],
    themes: [],
    impactAreas: [],
    deadlineMentions: [],
    actionableInsights: [],
  };
}
