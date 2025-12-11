import {
  mysqlTable,
  int,
  varchar,
  text,
  mysqlEnum,
  json,
  decimal,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/mysql-core";

/**
 * ESG Hub News History - Archive for news items older than 200 days
 * Keeps main hubNews table lean while preserving historical data
 */
export const hubNewsHistory = mysqlTable(
  "hub_news_history",
  {
    id: int("id").autoincrement().primaryKey(),
    originalId: int("originalId").notNull(), // Reference to original hubNews id
    title: varchar("title", { length: 512 }).notNull(),
    summary: text("summary"),
    content: text("content"),
    newsType: mysqlEnum("newsType", [
      "NEW_LAW",
      "AMENDMENT",
      "ENFORCEMENT",
      "COURT_DECISION",
      "GUIDANCE",
      "PROPOSAL",
    ]).notNull(),
    relatedRegulationIds: json("relatedRegulationIds"),
    regulationTags: json("regulationTags").$type<string[]>(),
    impactLevel: mysqlEnum("impactLevel", ["LOW", "MEDIUM", "HIGH"]).default(
      "MEDIUM"
    ),
    sourceUrl: varchar("sourceUrl", { length: 512 }),
    sourceTitle: varchar("sourceTitle", { length: 255 }),
    sourceType: mysqlEnum("sourceType", [
      "EU_OFFICIAL",
      "GS1_OFFICIAL",
      "INDUSTRY",
      "MEDIA",
    ]).default("EU_OFFICIAL"),
    credibilityScore: decimal("credibilityScore", {
      precision: 3,
      scale: 2,
    }).default("0.00"),
    publishedDate: timestamp("publishedDate"),
    retrievedAt: timestamp("retrievedAt").notNull(),
    isAutomated: boolean("isAutomated").default(false),
    archivedAt: timestamp("archivedAt").defaultNow().notNull(), // when moved to history
    originalCreatedAt: timestamp("originalCreatedAt").notNull(),
    originalUpdatedAt: timestamp("originalUpdatedAt").notNull(),
  },
  table => ({
    originalIdIdx: index("originalId_idx").on(table.originalId),
    publishedDateIdx: index("publishedDate_idx").on(table.publishedDate),
    archivedAtIdx: index("archivedAt_idx").on(table.archivedAt),
  })
);

export type HubNewsHistory = typeof hubNewsHistory.$inferSelect;
export type InsertHubNewsHistory = typeof hubNewsHistory.$inferInsert;
