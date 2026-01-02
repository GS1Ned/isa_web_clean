import { router, adminProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  roadmapTemplates,
  templateActions,
  templateMilestones,
} from "../../drizzle/schema";
import { desc, sql, eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const adminTemplatesRouter = router({
  /**
   * Create a new template (admin only)
   */
  createTemplate: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        category: z.enum(["csrd", "eudr", "esrs", "custom"]),
        strategy: z.enum([
          "risk_first",
          "quick_wins",
          "balanced",
          "comprehensive",
        ]),
        estimatedEffort: z.number().int().positive(),
        estimatedImpact: z.number().optional(),
        targetScore: z.number().optional(),
        isPublic: z.boolean().default(true),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      const result = await db.insert(roadmapTemplates).values({
        name: input.name,
        description: input.description,
        category: input.category,
        strategy: input.strategy,
        estimatedEffort: input.estimatedEffort,
        estimatedImpact: (input.estimatedImpact
          ? parseFloat(input.estimatedImpact.toString())
          : 0) as any,
        targetScore: (input.targetScore
          ? parseFloat(input.targetScore.toString())
          : 0) as any,
        isPublic: input.isPublic ? 1 : 0,
        createdBy: ctx.user.id,
        tags: input.tags ? JSON.stringify(input.tags) : null,
      });

      return {
        id: (result as any).insertId,
        message: "Template created successfully",
      };
    }),

  /**
   * Update template (admin only)
   */
  updateTemplate: adminProcedure
    .input(
      z.object({
        templateId: z.number().int(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        strategy: z
          .enum(["risk_first", "quick_wins", "balanced", "comprehensive"])
          .optional(),
        estimatedEffort: z.number().int().positive().optional(),
        estimatedImpact: z.number().optional(),
        targetScore: z.number().optional(),
        isPublic: z.boolean().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      // Verify ownership or admin
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

      const updateData: any = {};
      if (input.name !== undefined) updateData.name = input.name;
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.strategy !== undefined) updateData.strategy = input.strategy;
      if (input.estimatedEffort !== undefined)
        updateData.estimatedEffort = input.estimatedEffort;
      if (input.estimatedImpact !== undefined)
        updateData.estimatedImpact = parseFloat(
          input.estimatedImpact.toString()
        );
      if (input.targetScore !== undefined)
        updateData.targetScore = parseFloat(input.targetScore.toString());
      if (input.isPublic !== undefined) updateData.isPublic = input.isPublic;
      if (input.tags !== undefined)
        updateData.tags = JSON.stringify(input.tags);

      await db
        .update(roadmapTemplates)
        .set(updateData)
        .where(eq(roadmapTemplates.id, input.templateId));

      return { message: "Template updated successfully" };
    }),

  /**
   * Delete template (admin only)
   */
  deleteTemplate: adminProcedure
    .input(z.object({ templateId: z.number().int() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      // Delete associated actions and milestones
      await db
        .delete(templateActions)
        .where(eq(templateActions.templateId, input.templateId));

      await db
        .delete(templateMilestones)
        .where(eq(templateMilestones.templateId, input.templateId));

      // Delete template
      await db
        .delete(roadmapTemplates)
        .where(eq(roadmapTemplates.id, input.templateId));

      return { message: "Template deleted successfully" };
    }),

  /**
   * Add action to template (admin only)
   */
  addTemplateAction: adminProcedure
    .input(
      z.object({
        templateId: z.number().int(),
        sequenceNumber: z.number().int(),
        title: z.string().min(1).max(255),
        description: z.string().optional(),
        actionType: z.string(),
        priority: z.enum(["critical", "high", "medium", "low"]),
        estimatedEffort: z.number().int(),
        estimatedImpact: z.number().optional(),
        successCriteria: z.string().optional(),
        relatedStandards: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      const result = await db.insert(templateActions).values({
        templateId: input.templateId,
        sequenceNumber: input.sequenceNumber,
        title: input.title,
        description: input.description,
        actionType: input.actionType,
        priority: input.priority,
        estimatedEffort: input.estimatedEffort,
        estimatedImpact: (input.estimatedImpact
          ? parseFloat(input.estimatedImpact.toString())
          : 0) as any,
        successCriteria: input.successCriteria,
        relatedStandards: input.relatedStandards
          ? JSON.stringify(input.relatedStandards)
          : null,
      });

      return {
        id: (result as any).insertId,
        message: "Action added to template",
      };
    }),

  /**
   * Update template action (admin only)
   */
  updateTemplateAction: adminProcedure
    .input(
      z.object({
        actionId: z.number().int(),
        title: z.string().optional(),
        description: z.string().optional(),
        priority: z.enum(["critical", "high", "medium", "low"]).optional(),
        estimatedEffort: z.number().int().optional(),
        estimatedImpact: z.number().optional(),
        successCriteria: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      const updateData: any = {};
      if (input.title !== undefined) updateData.title = input.title;
      if (input.description !== undefined)
        updateData.description = input.description;
      if (input.priority !== undefined) updateData.priority = input.priority;
      if (input.estimatedEffort !== undefined)
        updateData.estimatedEffort = input.estimatedEffort;
      if (input.estimatedImpact !== undefined)
        updateData.estimatedImpact = parseFloat(
          input.estimatedImpact.toString()
        );
      if (input.successCriteria !== undefined)
        updateData.successCriteria = input.successCriteria;

      await db
        .update(templateActions)
        .set(updateData)
        .where(eq(templateActions.id, input.actionId));

      return { message: "Action updated successfully" };
    }),

  /**
   * Delete template action (admin only)
   */
  deleteTemplateAction: adminProcedure
    .input(z.object({ actionId: z.number().int() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      await db
        .delete(templateActions)
        .where(eq(templateActions.id, input.actionId));

      return { message: "Action deleted successfully" };
    }),

  /**
   * List templates for admin management
   */
  listAdminTemplates: adminProcedure
    .input(
      z.object({
        category: z.string().optional(),
        search: z.string().optional(),
        limit: z.number().int().default(20),
        offset: z.number().int().default(0),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      let conditions: any[] = [];
      if (input.category) {
        conditions.push(eq(roadmapTemplates.category, input.category));
      }
      if (input.search) {
        conditions.push(
          sql`${roadmapTemplates.name} LIKE ${`%${input.search}%`}`
        );
      }

      const whereCondition =
        conditions.length > 0 ? and(...conditions) : undefined;

      const templates = await db
        .select()
        .from(roadmapTemplates)
        .where(whereCondition)
        .orderBy(desc(roadmapTemplates.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return templates;
    }),

  /**
   * Get template details for editing
   */
  getTemplateForEdit: adminProcedure
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

      const actions = await db
        .select()
        .from(templateActions)
        .where(eq(templateActions.templateId, input.templateId));

      const milestones = await db
        .select()
        .from(templateMilestones)
        .where(eq(templateMilestones.templateId, input.templateId));

      return {
        template: template[0],
        actions,
        milestones,
      };
    }),

  /**
   * Publish template (make public)
   */
  publishTemplate: adminProcedure
    .input(z.object({ templateId: z.number().int() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      await db
        .update(roadmapTemplates)
        .set({ isPublic: 1 })
        .where(eq(roadmapTemplates.id, input.templateId));

      return { message: "Template published successfully" };
    }),

  /**
   * Unpublish template (make private)
   */
  unpublishTemplate: adminProcedure
    .input(z.object({ templateId: z.number().int() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database unavailable",
        });

      await db
        .update(roadmapTemplates)
        .set({ isPublic: 0 })
        .where(eq(roadmapTemplates.id, input.templateId));

      return { message: "Template unpublished successfully" };
    }),

  /**
   * Get template statistics
   */
  getTemplateStats: adminProcedure
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

      return {
        templateId: input.templateId,
        name: template[0].name,
        usageCount: template[0].usageCount,
        rating: template[0].rating,
        createdAt: template[0].createdAt,
        updatedAt: template[0].updatedAt,
        isPublic: template[0].isPublic,
      };
    }),
});
