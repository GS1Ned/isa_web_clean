/**
 * News Recommendations Schema
 * Stores AI-generated recommendations linking news articles to internal resources
 */

import {
  mysqlTable,
  int,
  varchar,
  text,
  decimal,
  timestamp,
} from "drizzle-orm/mysql-core";

export const newsRecommendations = mysqlTable("news_recommendations", {
  id: int("id").primaryKey().autoincrement(),
  newsId: int("news_id").notNull(), // References hub_news.id
  resourceType: varchar("resource_type", { length: 50 }).notNull(), // 'REGULATION', 'ESRS_DATAPOINT', 'GS1_STANDARD', 'RESOURCE'
  resourceId: int("resource_id").notNull(), // ID in respective table
  resourceTitle: varchar("resource_title", { length: 512 }), // Cached for display
  relevanceScore: decimal("relevance_score", {
    precision: 3,
    scale: 2,
  }).notNull(), // 0.00 - 1.00
  reasoning: text("reasoning"), // AI-generated explanation of relevance
  matchedKeywords: text("matched_keywords"), // JSON array of keywords that triggered match
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type NewsRecommendation = typeof newsRecommendations.$inferSelect;
export type InsertNewsRecommendation = typeof newsRecommendations.$inferInsert;
