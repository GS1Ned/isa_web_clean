import { z } from "zod";
import { and, desc, eq, sql } from "drizzle-orm";

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { serverLogger } from "../_core/logger-wiring";
import { getDb } from "../db";
import {
  hubNews,
  pipelineExecutionLog,
  regulatoryEvents,
  userAlerts,
  userSavedItems,
} from "../../drizzle_pg/schema";

export const hubRouter = router({
  // Save a regulation for the user
  saveRegulation: protectedProcedure
    .input(z.object({ regulationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) return { success: false };

        await db.insert(userSavedItems).values({
          userId: ctx.user.id,
          itemId: input.regulationId,
          itemType: "REGULATION",
          createdAt: new Date().toISOString(),
        });

        return { success: true };
      } catch (error) {
        serverLogger.error("[tRPC] Save regulation failed:", error);
        return { success: false };
      }
    }),

  // Remove a saved regulation
  unsaveRegulation: protectedProcedure
    .input(z.object({ regulationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) return { success: false };

        await db
          .delete(userSavedItems)
          .where(
            and(
              eq(userSavedItems.userId, ctx.user.id),
              eq(userSavedItems.itemId, input.regulationId)
            )
          );

        return { success: true };
      } catch (error) {
        serverLogger.error("[tRPC] Unsave regulation failed:", error);
        return { success: false };
      }
    }),

  // Set alert preferences for a regulation
  setAlert: protectedProcedure
    .input(z.object({ regulationId: z.number(), alertType: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) return { success: false };

        await db.insert(userAlerts).values({
          userId: ctx.user.id,
          regulationId: input.regulationId,
          alertType: input.alertType as any,
          isActive: 1,
          createdAt: new Date().toISOString(),
        });

        return { success: true };
      } catch (error) {
        serverLogger.error("[tRPC] Set alert failed:", error);
        return { success: false };
      }
    }),

  // Remove alert
  removeAlert: protectedProcedure
    .input(z.object({ regulationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const db = await getDb();
        if (!db) return { success: false };

        await db
          .delete(userAlerts)
          .where(
            and(
              eq(userAlerts.userId, ctx.user.id),
              eq(userAlerts.regulationId, input.regulationId)
            )
          );

        return { success: true };
      } catch (error) {
        serverLogger.error("[tRPC] Remove alert failed:", error);
        return { success: false };
      }
    }),

  // Get user's saved regulations
  getSavedRegulations: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return [];

      const saved = await db
        .select()
        .from(userSavedItems)
        .where(
          and(
            eq(userSavedItems.userId, ctx.user.id),
            eq(userSavedItems.itemType, "REGULATION" as any)
          )
        );

      return saved;
    } catch (error) {
      serverLogger.error("[tRPC] Get saved regulations failed:", error);
      return [];
    }
  }),

  // Get user's alerts
  getUserAlerts: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return [];

      const alerts = await db
        .select()
        .from(userAlerts)
        .where(eq(userAlerts.userId, ctx.user.id));

      return alerts;
    } catch (error) {
      serverLogger.error("[tRPC] Get user alerts failed:", error);
      return [];
    }
  }),

  // Get recent news items (public)
  getRecentNews: publicProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        const limit = input?.limit || 20;
        const news = await db
          .select()
          .from(hubNews)
          .orderBy(desc(hubNews.publishedDate))
          .limit(limit);

        return news;
      } catch (error) {
        serverLogger.error("[tRPC] Get recent news failed:", error);
        return [];
      }
    }),

  // Get last pipeline run status (public)
  getLastPipelineRun: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) return null;

      const lastRun = await db
        .select()
        .from(pipelineExecutionLog)
        .where(eq(pipelineExecutionLog.pipelineType, "news_ingestion"))
        .orderBy(desc(pipelineExecutionLog.startedAt))
        .limit(1);

      return lastRun[0] || null;
    } catch (error) {
      serverLogger.error("[tRPC] Get last pipeline run failed:", error);
      return null;
    }
  }),

  // Get AI recommendations for a news article
  getNewsRecommendations: publicProcedure
    .input(z.object({ newsId: z.number() }))
    .query(async ({ input }) => {
      try {
        const { getRecommendationsByNewsId } = await import(
          "../db-recommendations"
        );
        const recommendations = await getRecommendationsByNewsId(input.newsId);
        return recommendations;
      } catch (error) {
        serverLogger.error("[tRPC] Get news recommendations failed:", error);
        return [];
      }
    }),

  // Get regulatory events (Phase 2: Check 5 - Event-Based Aggregation)
  getEvents: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(20),
        status: z
          .enum(["COMPLETE", "INCOMPLETE", "DRAFT", "all"])
          .default("all"),
        regulation: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        let query = db.select().from(regulatoryEvents);

        // Apply filters
        const conditions = [];
        if (input.status !== "all") {
          conditions.push(eq(regulatoryEvents.status, input.status));
        }
        if (input.regulation) {
          conditions.push(
            eq(regulatoryEvents.primaryRegulation, input.regulation)
          );
        }

        if (conditions.length > 0) {
          query = query.where(and(...conditions)) as typeof query;
        }

        const events = await query
          .orderBy(desc(regulatoryEvents.eventDateLatest))
          .limit(input.limit);

        return events;
      } catch (error) {
        serverLogger.error("[tRPC] Get events failed:", error);
        return [];
      }
    }),

  // Get single event with linked articles
  getEventById: publicProcedure
    .input(z.object({ eventId: z.number() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return null;

        const events = await db
          .select()
          .from(regulatoryEvents)
          .where(eq(regulatoryEvents.id, input.eventId))
          .limit(1);

        if (!events[0]) return null;

        // Get linked articles
        const articleIds = (events[0].sourceArticleIds as number[]) || [];
        let linkedArticles: typeof hubNews.$inferSelect[] = [];

        if (articleIds.length > 0) {
          linkedArticles = await db
            .select()
            .from(hubNews)
            .where(sql`${hubNews.id} IN (${articleIds.join(",")})`);
        }

        return {
          ...events[0],
          linkedArticles,
        };
      } catch (error) {
        serverLogger.error("[tRPC] Get event by ID failed:", error);
        return null;
      }
    }),

  // Get event statistics
  getEventStats: publicProcedure.query(async () => {
    try {
      const { getEventStats } = await import("../news-event-processor");
      return await getEventStats();
    } catch (error) {
      serverLogger.error("[tRPC] Get event stats failed:", error);
      return {
        total: 0,
        complete: 0,
        incomplete: 0,
        draft: 0,
        byRegulation: {},
        byEventType: {},
      };
    }
  }),

  // Get news articles related to a specific regulation
  getNewsByRegulation: publicProcedure
    .input(z.object({ regulationId: z.number(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        const limit = input.limit || 10;
        const news = await db
          .select()
          .from(hubNews)
          .where(
            sql`JSON_CONTAINS(${hubNews.relatedRegulationIds}, ${String(input.regulationId)}, '$')`
          )
          .orderBy(desc(hubNews.publishedDate))
          .limit(limit);

        return news;
      } catch (error) {
        serverLogger.error("[tRPC] Get news by regulation failed:", error);
        return [];
      }
    }),

  // Get event for a specific article
  getEventForArticle: publicProcedure
    .input(z.object({ articleId: z.number() }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return null;

        // Get the article's event ID
        const articles = await db
          .select({ regulatoryEventId: hubNews.regulatoryEventId })
          .from(hubNews)
          .where(eq(hubNews.id, input.articleId))
          .limit(1);

        if (!articles[0]?.regulatoryEventId) return null;

        // Get the event
        const events = await db
          .select()
          .from(regulatoryEvents)
          .where(eq(regulatoryEvents.id, articles[0].regulatoryEventId))
          .limit(1);

        return events[0] || null;
      } catch (error) {
        serverLogger.error("[tRPC] Get event for article failed:", error);
        return null;
      }
    }),
});

