import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  roadmapTemplates,
  templateActions,
  templateMilestones,
  templateUsage,
  complianceRoadmaps,
  roadmapActions,
  roadmapMilestones,
} from "../../drizzle/schema";
import { eq, and, like, desc } from "drizzle-orm";

/**
 * Roadmap Templates Router
 * Manages template CRUD, discovery, and cloning
 */

export const templatesRouter = router({
  /**
   * List available templates with filtering
   */
  listTemplates: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db
        .select()
        .from(roadmapTemplates)
        .where(eq(roadmapTemplates.isPublic, 1));

      if (input.category) {
        query = db
          .select()
          .from(roadmapTemplates)
          .where(
            and(
              eq(roadmapTemplates.isPublic, 1),
              eq(roadmapTemplates.category, input.category)
            )
          );
      }

      if (input.search) {
        query = db
          .select()
          .from(roadmapTemplates)
          .where(
            and(
              eq(roadmapTemplates.isPublic, 1),
              like(roadmapTemplates.name, `%${input.search}%`)
            )
          );
      }

      const templates = await query
        .orderBy(desc(roadmapTemplates.rating))
        .limit(input.limit)
        .offset(input.offset);

      return templates.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        category: t.category,
        strategy: t.strategy,
        estimatedEffort: t.estimatedEffort,
        estimatedImpact: t.estimatedImpact,
        targetScore: t.targetScore,
        usageCount: t.usageCount,
        rating: t.rating,
      }));
    }),

  /**
   * Get template details with actions and milestones
   */
  getTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const template = await db
        .select()
        .from(roadmapTemplates)
        .where(eq(roadmapTemplates.id, input.templateId))
        .limit(1);

      if (template.length === 0) return null;

      const actions = await db
        .select()
        .from(templateActions)
        .where(eq(templateActions.templateId, input.templateId));

      const milestones = await db
        .select()
        .from(templateMilestones)
        .where(eq(templateMilestones.templateId, input.templateId));

      return {
        ...template[0],
        actions: actions.map(a => ({
          id: a.id,
          sequenceNumber: a.sequenceNumber,
          title: a.title,
          description: a.description,
          actionType: a.actionType,
          priority: a.priority,
          estimatedEffort: a.estimatedEffort,
          estimatedImpact: a.estimatedImpact,
          successCriteria: a.successCriteria,
          relatedStandards: a.relatedStandards
            ? JSON.parse(a.relatedStandards as any)
            : [],
        })),
        milestones: milestones.map(m => ({
          id: m.id,
          sequenceNumber: m.sequenceNumber,
          title: m.title,
          description: m.description,
          targetScore: m.targetScore,
          daysFromStart: m.daysFromStart,
        })),
      };
    }),

  /**
   * Clone template to create new roadmap
   */
  cloneTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        roadmapTitle: z.string().min(1),
        startDate: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get template with all details
      const template = await db
        .select()
        .from(roadmapTemplates)
        .where(eq(roadmapTemplates.id, input.templateId))
        .limit(1);

      if (template.length === 0) throw new Error("Template not found");

      const t = template[0];

      // Calculate dates
      const startDate = input.startDate || new Date();
      const targetCompletionDate = new Date(startDate);
      targetCompletionDate.setDate(
        targetCompletionDate.getDate() + (t.estimatedEffort / 8) * 5
      ); // Rough estimate

      // Create roadmap
      const roadmapResult = await db.insert(complianceRoadmaps).values({
        userId: ctx.user.id,
        title: input.roadmapTitle,
        description: `Created from template: ${t.name}`,
        strategy: t.strategy,
        currentScore: 0 as any,
        projectedScore: (t.targetScore
          ? parseFloat(t.targetScore.toString())
          : 0) as any,
        estimatedEffort: t.estimatedEffort,
        estimatedImpact: (t.estimatedImpact
          ? parseFloat(t.estimatedImpact.toString())
          : 0) as any,
        status: "draft",
        startDate: startDate.toISOString(),
        targetCompletionDate: targetCompletionDate.toISOString(),
      });

      const roadmapId = (roadmapResult as any).insertId;

      // Get template actions
      const templateActionsList = await db
        .select()
        .from(templateActions)
        .where(eq(templateActions.templateId, input.templateId));

      // Create roadmap actions
      for (const ta of templateActionsList) {
        await db.insert(roadmapActions).values({
          roadmapId: roadmapId as any,
          sequenceNumber: ta.sequenceNumber,
          title: ta.title,
          description: ta.description,
          actionType: ta.actionType,
          priority: ta.priority,
          estimatedEffort: ta.estimatedEffort,
          estimatedImpact: (ta.estimatedImpact
            ? parseFloat(ta.estimatedImpact.toString())
            : 0) as any,
          status: "pending",
          startDate: new Date(
            startDate.getTime() + ta.sequenceNumber * 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          targetDate: new Date(
            startDate.getTime() +
              (ta.sequenceNumber + 1) * 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          successCriteria: ta.successCriteria,
        });
      }

      // Get template milestones
      const templateMilestonesList = await db
        .select()
        .from(templateMilestones)
        .where(eq(templateMilestones.templateId, input.templateId));

      // Create roadmap milestones
      for (const tm of templateMilestonesList) {
        await db.insert(roadmapMilestones).values({
          roadmapId: roadmapId as any,
          title: tm.title,
          description: tm.description,
          targetScore: (tm.targetScore
            ? parseFloat(tm.targetScore.toString())
            : 0) as any,
          targetDate: new Date(
            startDate.getTime() + tm.daysFromStart * 24 * 60 * 60 * 1000
          ).toISOString(),
          status: "pending",
        });
      }

      // Track template usage
      await db.insert(templateUsage).values({
        templateId: input.templateId,
        userId: ctx.user.id,
        roadmapId: roadmapId as any,
      });

      // Increment usage count
      await db
        .update(roadmapTemplates)
        .set({
          usageCount: (t.usageCount || 0) + 1,
        })
        .where(eq(roadmapTemplates.id, input.templateId));

      return { success: true, roadmapId };
    }),

  /**
   * Rate template
   */
  rateTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.number(),
        rating: z.number().min(1).max(5),
        feedback: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Record rating
      await db.insert(templateUsage).values({
        templateId: input.templateId,
        userId: ctx.user.id,
        rating: input.rating,
        feedback: input.feedback,
        roadmapId: 0 as any, // No roadmap associated with just a rating
      });

      // Update template average rating
      const ratings = await db
        .select()
        .from(templateUsage)
        .where(eq(templateUsage.templateId, input.templateId));

      const avgRating =
        ratings.reduce((sum, r) => sum + ((r.rating as any) || 0), 0) /
        ratings.length;

      await db
        .update(roadmapTemplates)
        .set({
          rating: parseFloat(avgRating.toFixed(2)) as any,
        })
        .where(eq(roadmapTemplates.id, input.templateId));

      return { success: true };
    }),

  /**
   * Get template categories
   */
  getCategories: protectedProcedure.query(async () => {
    return [
      {
        id: "csrd",
        name: "CSRD Onboarding",
        description:
          "Corporate Sustainability Reporting Directive implementation",
      },
      {
        id: "eudr",
        name: "EUDR Implementation",
        description: "EU Deforestation Regulation compliance",
      },
      {
        id: "esrs",
        name: "ESRS Transition",
        description: "European Sustainability Reporting Standards adoption",
      },
      {
        id: "custom",
        name: "Custom Templates",
        description: "User-created templates",
      },
    ];
  }),

  /**
   * Get template statistics
   */
  getStats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const templates = await db.select().from(roadmapTemplates);
    const totalUsage = await db.select().from(templateUsage);

    const categories: any[] = [
      { category: "csrd", count: 0 },
      { category: "eudr", count: 0 },
      { category: "esrs", count: 0 },
    ];

    templates.forEach(t => {
      const cat = categories.find(c => c.category === t.category);
      if (cat) cat.count++;
    });

    return {
      totalTemplates: templates.length,
      totalUsage: totalUsage.length,
      byCategory: categories,
      topRated: templates
        .sort(
          (a, b) =>
            parseFloat((b.rating || 0).toString()) -
            parseFloat((a.rating || 0).toString())
        )
        .slice(0, 5),
      mostUsed: templates
        .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
        .slice(0, 5),
    };
  }),
});
