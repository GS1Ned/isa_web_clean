/**
 * Ask ISA Feedback Schema
 * 
 * Tracks user feedback on Ask ISA responses for quality monitoring and A/B testing
 */

import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  index,
} from "drizzle-orm/mysql-core";
import { users } from "./schema";

/**
 * User feedback on Ask ISA responses
 */
export const askIsaFeedback = mysqlTable(
  "ask_isa_feedback",
  {
    id: int("id").autoincrement().primaryKey(),
    questionId: varchar("question_id", { length: 255 }).notNull(),
    userId: int("user_id").references(() => users.id, { onDelete: "set null" }),
    questionText: text("question_text").notNull(),
    answerText: text("answer_text").notNull(),
    feedbackType: mysqlEnum("feedback_type", ["positive", "negative"]).notNull(),
    feedbackComment: text("feedback_comment"),
    promptVariant: varchar("prompt_variant", { length: 50 }),
    confidenceScore: decimal("confidence_score", { precision: 3, scale: 2 }),
    sourcesCount: int("sources_count"),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (table) => ({
    questionIdIdx: index("idx_question_id").on(table.questionId),
    userIdIdx: index("idx_user_id").on(table.userId),
    feedbackTypeIdx: index("idx_feedback_type").on(table.feedbackType),
    promptVariantIdx: index("idx_prompt_variant").on(table.promptVariant),
    timestampIdx: index("idx_timestamp").on(table.timestamp),
  })
);

export type AskIsaFeedback = typeof askIsaFeedback.$inferSelect;
export type InsertAskIsaFeedback = typeof askIsaFeedback.$inferInsert;
