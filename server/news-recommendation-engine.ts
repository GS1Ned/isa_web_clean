/**
 * News Recommendation Engine
 * Generates AI-powered recommendations linking news to internal resources
 */

import {
  analyzeNewsContent,
  type ContentAnalysis,
} from "./news-content-analyzer";
import { getDb } from "./db";
import {
  regulations,
  gs1Standards,
  esrsDatapoints,
  newsRecommendations,
} from "../drizzle/schema";
import { sql, or, like } from "drizzle-orm";
import { serverLogger } from "./_core/logger-wiring";


export interface Recommendation {
  resourceType: "REGULATION" | "ESRS_DATAPOINT" | "GS1_STANDARD";
  resourceId: number;
  resourceTitle: string;
  relevanceScore: number;
  reasoning: string;
  matchedKeywords: string[];
}

/**
 * Generate recommendations for a news article
 */
export async function generateRecommendations(
  newsId: number,
  title: string,
  summary: string,
  content: string
): Promise<Recommendation[]> {
  serverLogger.info(`[recommendation-engine] Generating recommendations for news ${newsId}`);

  // Step 1: Analyze content
  const analysis = await analyzeNewsContent(title, summary, content);
  serverLogger.info(`[recommendation-engine] Content analysis complete`, {
    regulations: analysis.regulationMentions.length,
    standards: analysis.standardMentions.length,
    themes: analysis.themes.length,
  });

  // Step 2: Find matching resources
  const recommendations: Recommendation[] = [];

  // Find regulations
  const regulationRecs = await findMatchingRegulations(analysis);
  recommendations.push(...regulationRecs);

  // Find GS1 standards
  const standardRecs = await findMatchingStandards(analysis);
  recommendations.push(...standardRecs);

  // Find ESRS datapoints
  const datapointRecs = await findMatchingDatapoints(analysis);
  recommendations.push(...datapointRecs);

  // Step 3: Score and rank
  const scored = scoreRecommendations(recommendations, analysis);
  const topRecommendations = scored.slice(0, 10); // Top 10

  serverLogger.info(`[recommendation-engine] Generated ${topRecommendations.length} recommendations`);

  // Step 4: Save to database
  await saveRecommendations(newsId, topRecommendations);

  return topRecommendations;
}

/**
 * Find matching regulations based on content analysis
 */
async function findMatchingRegulations(
  analysis: ContentAnalysis
): Promise<Recommendation[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const conditions = [];

    // Match by regulation mentions
    for (const reg of analysis.regulationMentions) {
      conditions.push(like(regulations.title, `%${reg}%`));
      // Match in title is sufficient
    }

    // Match by themes
    for (const theme of analysis.themes) {
      conditions.push(like(regulations.description, `%${theme}%`));
    }

    if (conditions.length === 0) return [];

    const matches = await db
      .select()
      .from(regulations)
      .where(or(...conditions))
      .limit(20);

    return matches.map(reg => ({
      resourceType: "REGULATION" as const,
      resourceId: reg.id,
      resourceTitle: reg.title,
      relevanceScore: 0, // Will be scored later
      reasoning: `Mentioned in article context`,
      matchedKeywords: analysis.regulationMentions,
    }));
  } catch (error) {
    serverLogger.error("[recommendation-engine] Regulation matching failed:", error);
    return [];
  }
}

/**
 * Find matching GS1 standards
 */
async function findMatchingStandards(
  analysis: ContentAnalysis
): Promise<Recommendation[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const conditions = [];

    // Match by standard mentions
    for (const std of analysis.standardMentions) {
      conditions.push(like(gs1Standards.standardName, `%${std}%`));
      conditions.push(like(gs1Standards.description, `%${std}%`));
    }

    // Match by impact areas
    for (const area of analysis.impactAreas) {
      conditions.push(like(gs1Standards.description, `%${area}%`));
    }

    if (conditions.length === 0) return [];

    const matches = await db
      .select()
      .from(gs1Standards)
      .where(or(...conditions))
      .limit(20);

    return matches.map(std => ({
      resourceType: "GS1_STANDARD" as const,
      resourceId: std.id,
      resourceTitle: std.standardName,
      relevanceScore: 0,
      reasoning: `Relevant to ${analysis.impactAreas.join(", ")}`,
      matchedKeywords: analysis.standardMentions,
    }));
  } catch (error) {
    serverLogger.error("[recommendation-engine] Standard matching failed:", error);
    return [];
  }
}

/**
 * Find matching ESRS datapoints
 */
async function findMatchingDatapoints(
  analysis: ContentAnalysis
): Promise<Recommendation[]> {
  const db = await getDb();
  if (!db) return [];

  try {
    const conditions = [];

    // Match by regulation mentions (ESRS is part of CSRD)
    if (
      analysis.regulationMentions.includes("CSRD") ||
      analysis.regulationMentions.includes("ESRS")
    ) {
      conditions.push(like(esrsDatapoints.name, `%`));
    }

    // Match by themes
    for (const theme of analysis.themes) {
      conditions.push(like(esrsDatapoints.name, `%${theme}%`));
    }

    if (conditions.length === 0) return [];

    const matches = await db
      .select()
      .from(esrsDatapoints)
      .where(or(...conditions))
      .limit(20);

    return matches.map(dp => ({
      resourceType: "ESRS_DATAPOINT" as const,
      resourceId: dp.id,
      resourceTitle: dp.name || "ESRS Datapoint",
      relevanceScore: 0,
      reasoning: `Related to CSRD/ESRS reporting requirements`,
      matchedKeywords: ["CSRD", "ESRS"],
    }));
  } catch (error) {
    serverLogger.error("[recommendation-engine] Datapoint matching failed:", error);
    return [];
  }
}

/**
 * Score recommendations based on relevance
 */
function scoreRecommendations(
  recommendations: Recommendation[],
  analysis: ContentAnalysis
): Recommendation[] {
  return recommendations
    .map(rec => {
      let score = 0.5; // Base score

      // Boost if explicitly mentioned
      if (rec.matchedKeywords.length > 0) {
        score += 0.3;
      }

      // Boost regulations mentioned in title/summary
      if (
        rec.resourceType === "REGULATION" &&
        analysis.regulationMentions.length > 0
      ) {
        score += 0.2;
      }

      // Boost standards if impact areas match
      if (
        rec.resourceType === "GS1_STANDARD" &&
        analysis.impactAreas.length > 0
      ) {
        score += 0.15;
      }

      // Cap at 1.0
      score = Math.min(score, 1.0);

      return {
        ...rec,
        relevanceScore: score,
      };
    })
    .sort((a, b) => b.relevanceScore - a.relevanceScore);
}

/**
 * Save recommendations to database
 */
async function saveRecommendations(
  newsId: number,
  recommendations: Recommendation[]
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    // Delete existing recommendations for this news
    await db.delete(newsRecommendations).where(sql`news_id = ${newsId}`);

    // Insert new recommendations
    if (recommendations.length > 0) {
      await db.insert(newsRecommendations).values(
        recommendations.map(rec => ({
          newsId,
          resourceType: rec.resourceType,
          resourceId: rec.resourceId,
          resourceTitle: rec.resourceTitle,
          relevanceScore: rec.relevanceScore.toFixed(2),
          reasoning: rec.reasoning,
          matchedKeywords: JSON.stringify(rec.matchedKeywords),
        }))
      );
    }

    serverLogger.info(`[recommendation-engine] Saved ${recommendations.length} recommendations for news ${newsId}`);
  } catch (error) {
    serverLogger.error("[recommendation-engine] Failed to save recommendations:", error);
  }
}
