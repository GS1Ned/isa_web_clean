import { router, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  roadmapTemplates,
  complianceRoadmaps,
  complianceScores,
} from "../../drizzle/schema";
import { sql, eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const templateAnalyticsRouter = router({
  /**
   * Get overall template analytics
   */
  getOverallAnalytics: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database unavailable",
      });

    const templates = await db.select().from(roadmapTemplates);
    const totalTemplates = templates.length;
    const publicTemplates = templates.filter(t => t.isPublic).length;
    const totalUsage = templates.reduce(
      (sum, t) => sum + (t.usageCount || 0),
      0
    );
    const avgRating =
      templates.length > 0
        ? (
            templates.reduce(
              (sum, t) => sum + parseFloat(t.rating?.toString() || "0"),
              0
            ) / templates.length
          ).toFixed(2)
        : "0.00";

    return {
      totalTemplates,
      publicTemplates,
      totalUsage,
      avgRating: parseFloat(avgRating as string),
    };
  }),

  /**
   * Get template performance metrics
   */
  getTemplatePerformance: adminProcedure
    .input(z.object({ templateId: z.number().int() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      const template = await db
        .select()
        .from(roadmapTemplates)
        .where(eq(roadmapTemplates.id, input.templateId));

      if (template.length === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Template not found",
        });
      }

      // Note: complianceRoadmaps doesn't have templateId field
      // We'll calculate based on usage count and ratings
      const roadmaps: any[] = [];

      const completedRoadmaps = roadmaps.filter(
        r => r.status === "completed"
      ).length;
      const completionRate =
        roadmaps.length > 0
          ? ((completedRoadmaps / roadmaps.length) * 100).toFixed(2)
          : "0.00";

      // Calculate average score improvement
      let avgScoreImprovement = 0;
      // Calculate based on template usage and rating
      if (template[0].usageCount && template[0].usageCount > 0) {
        avgScoreImprovement = parseFloat(
          template[0].estimatedImpact?.toString() || "0"
        );
      }

      return {
        templateId: input.templateId,
        templateName: template[0].name,
        totalUsage: template[0].usageCount || 0,
        roadmapsCreated: 0,
        completedRoadmaps: 0,
        completionRate: 0,
        avgRating: parseFloat(template[0].rating?.toString() || "0"),
        avgScoreImprovement: parseFloat(avgScoreImprovement.toFixed(2)),
        isPublic: template[0].isPublic,
      };
    }),

  /**
   * Get analytics by category
   */
  getAnalyticsByCategory: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database unavailable",
      });

    const templates = await db.select().from(roadmapTemplates);

    const categories = ["csrd", "eudr", "esrs", "custom"];
    const analytics = categories.map(category => {
      const categoryTemplates = templates.filter(t => t.category === category);
      const totalUsage = categoryTemplates.reduce(
        (sum, t) => sum + (t.usageCount || 0),
        0
      );
      const avgRating =
        categoryTemplates.length > 0
          ? categoryTemplates.reduce(
              (sum, t) => sum + parseFloat(t.rating?.toString() || "0"),
              0
            ) / categoryTemplates.length
          : 0;

      return {
        category,
        templateCount: categoryTemplates.length,
        totalUsage,
        avgRating: parseFloat(avgRating.toFixed(2)),
        publicCount: categoryTemplates.filter(t => t.isPublic).length,
      };
    });

    return analytics;
  }),

  /**
   * Get analytics by strategy
   */
  getAnalyticsByStrategy: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database unavailable",
      });

    const templates = await db.select().from(roadmapTemplates);

    const strategies = [
      "risk_first",
      "quick_wins",
      "balanced",
      "comprehensive",
    ];
    const analytics = strategies.map(strategy => {
      const strategyTemplates = templates.filter(t => t.strategy === strategy);
      const totalUsage = strategyTemplates.reduce(
        (sum, t) => sum + (t.usageCount || 0),
        0
      );
      const avgRating =
        strategyTemplates.length > 0
          ? strategyTemplates.reduce(
              (sum, t) => sum + parseFloat(t.rating?.toString() || "0"),
              0
            ) / strategyTemplates.length
          : 0;

      return {
        strategy,
        templateCount: strategyTemplates.length,
        totalUsage,
        avgRating: parseFloat(avgRating.toFixed(2)),
        avgEffort:
          strategyTemplates.length > 0
            ? (
                strategyTemplates.reduce(
                  (sum, t) => sum + t.estimatedEffort,
                  0
                ) / strategyTemplates.length
              ).toFixed(0)
            : 0,
      };
    });

    return analytics;
  }),

  /**
   * Get top performing templates
   */
  getTopPerformingTemplates: adminProcedure
    .input(z.object({ limit: z.number().int().default(10) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      const templates = await db
        .select()
        .from(roadmapTemplates)
        .orderBy(desc(roadmapTemplates.usageCount))
        .limit(input.limit);

      return templates.map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        strategy: t.strategy,
        usageCount: t.usageCount || 0,
        rating: parseFloat(t.rating?.toString() || "0"),
        isPublic: t.isPublic,
      }));
    }),

  /**
   * Get lowest rated templates (for improvement)
   */
  getLowestRatedTemplates: adminProcedure
    .input(z.object({ limit: z.number().int().default(10) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      const templates = await db
        .select()
        .from(roadmapTemplates)
        .where(sql`${roadmapTemplates.usageCount} > ${0}`)
        .orderBy(roadmapTemplates.rating)
        .limit(input.limit);

      return templates.map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        strategy: t.strategy,
        usageCount: t.usageCount || 0,
        rating: parseFloat(t.rating?.toString() || "0"),
        improvementPriority:
          parseFloat(t.rating?.toString() || "0") < 3 ? "high" : "medium",
      }));
    }),

  /**
   * Get template usage trends
   */
  getUsageTrends: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database unavailable",
      });

    const templates = await db.select().from(roadmapTemplates);

    const totalUsage = templates.reduce(
      (sum, t) => sum + (t.usageCount || 0),
      0
    );
    const avgUsagePerTemplate =
      templates.length > 0
        ? (totalUsage / templates.length).toFixed(2)
        : "0.00";
    const maxUsage = Math.max(...templates.map(t => t.usageCount || 0));
    const minUsage = Math.min(...templates.map(t => t.usageCount || 0));

    const unusedTemplates = templates.filter(
      t => (t.usageCount || 0) === 0
    ).length;
    const highlyUsedTemplates = templates.filter(
      t => (t.usageCount || 0) > parseFloat(avgUsagePerTemplate as string)
    ).length;

    return {
      totalUsage,
      avgUsagePerTemplate: parseFloat(avgUsagePerTemplate as string),
      maxUsage,
      minUsage,
      unusedTemplates,
      highlyUsedTemplates,
      totalTemplates: templates.length,
    };
  }),

  /**
   * Get recommendations for template improvement
   */
  getImprovementRecommendations: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Database unavailable",
      });

    const templates = await db.select().from(roadmapTemplates);

    const recommendations: any[] = [];

    // Find unused templates
    const unusedTemplates = templates.filter(t => (t.usageCount || 0) === 0);
    if (unusedTemplates.length > 0) {
      recommendations.push({
        type: "unused_templates",
        severity: "medium",
        message: `${unusedTemplates.length} templates have never been used. Consider reviewing or removing them.`,
        templates: unusedTemplates.map(t => ({ id: t.id, name: t.name })),
      });
    }

    // Find low-rated templates
    const lowRatedTemplates = templates.filter(
      t =>
        (t.usageCount || 0) > 0 && parseFloat(t.rating?.toString() || "0") < 3
    );
    if (lowRatedTemplates.length > 0) {
      recommendations.push({
        type: "low_rated_templates",
        severity: "high",
        message: `${lowRatedTemplates.length} templates have ratings below 3. These need improvement.`,
        templates: lowRatedTemplates.map(t => ({
          id: t.id,
          name: t.name,
          rating: parseFloat(t.rating?.toString() || "0"),
        })),
      });
    }

    // Find category gaps
    const categories = ["csrd", "eudr", "esrs"];
    const categoryTemplates = categories.map(cat => ({
      category: cat,
      count: templates.filter(t => t.category === cat).length,
    }));
    const counts = categoryTemplates.map(c => c.count);
    const minCategoryCount = counts.length > 0 ? Math.min(...counts) : 0;
    if (minCategoryCount === 0) {
      recommendations.push({
        type: "category_gap",
        severity: "medium",
        message:
          "Some compliance categories lack templates. Consider creating templates for all major regulations.",
        missingCategories: categoryTemplates
          .filter(c => c.count === 0)
          .map(c => c.category),
      });
    }

    return recommendations;
  }),
});
