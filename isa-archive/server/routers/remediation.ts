import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  riskRemediationPlans,
  remediationSteps,
  complianceEvidence,
  remediationTemplates,
  remediationProgress,
  supplyChainRisks,
} from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Risk Remediation Router
 * Manages remediation workflows, steps, and evidence tracking
 */

export const remediationRouter = router({
  /**
   * Create remediation plan from risk
   */
  createPlan: protectedProcedure
    .input(
      z.object({
        riskId: z.number(),
        title: z.string(),
        description: z.string().optional(),
        targetCompletionDate: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify risk ownership
      const risks = await db
        .select()
        .from(supplyChainRisks)
        .where(eq(supplyChainRisks.id, input.riskId))
        .limit(1);

      if (!risks[0] || risks[0].userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      // Create remediation plan
      const [plan] = await db.insert(riskRemediationPlans).values({
        userId: ctx.user.id,
        riskId: input.riskId,
        title: input.title,
        description: input.description,
        targetCompletionDate: input.targetCompletionDate?.toISOString(),
        status: "draft",
      });

      // Initialize progress tracking
      await db.insert(remediationProgress).values({
        userId: ctx.user.id,
        planId: plan.insertId as number,
        totalSteps: 0,
        completedSteps: 0,
        evidenceSubmitted: 0,
        evidenceVerified: 0,
        progressPercentage: 0,
      });

      return { planId: plan.insertId, status: "draft" };
    }),

  /**
   * Add remediation step to plan
   */
  addStep: protectedProcedure
    .input(
      z.object({
        planId: z.number(),
        stepNumber: z.number(),
        title: z.string(),
        description: z.string().optional(),
        requiredEvidence: z.array(z.string()).optional(),
        assignedTo: z.string().optional(),
        dueDate: z.date().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify plan ownership
      const plans = await db
        .select()
        .from(riskRemediationPlans)
        .where(eq(riskRemediationPlans.id, input.planId))
        .limit(1);

      if (!plans[0] || plans[0].userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      // Add step
      const [step] = await db.insert(remediationSteps).values({
        planId: input.planId,
        stepNumber: input.stepNumber,
        title: input.title,
        description: input.description,
        requiredEvidence: input.requiredEvidence
          ? JSON.stringify(input.requiredEvidence)
          : null,
        assignedTo: input.assignedTo,
        dueDate: input.dueDate?.toISOString(),
        status: "pending",
      });

      // Update progress
      const progress = await db
        .select()
        .from(remediationProgress)
        .where(eq(remediationProgress.planId, input.planId))
        .limit(1);

      if (progress[0]) {
        await db
          .update(remediationProgress)
          .set({ totalSteps: (progress[0].totalSteps || 0) + 1 })
          .where(eq(remediationProgress.planId, input.planId));
      }

      return { stepId: step.insertId, status: "pending" };
    }),

  /**
   * Update step status
   */
  updateStepStatus: protectedProcedure
    .input(
      z.object({
        stepId: z.number(),
        status: z.enum(["pending", "in_progress", "completed", "skipped"]),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership through plan
      const steps = await db
        .select()
        .from(remediationSteps)
        .where(eq(remediationSteps.id, input.stepId))
        .limit(1);

      if (!steps[0]) throw new Error("Step not found");

      const plans = await db
        .select()
        .from(riskRemediationPlans)
        .where(eq(riskRemediationPlans.id, steps[0].planId))
        .limit(1);

      if (!plans[0] || plans[0].userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      // Update step
      await db
        .update(remediationSteps)
        .set({
          status: input.status,
          notes: input.notes,
          completedAt: input.status === "completed" ? new Date().toISOString() : null,
        })
        .where(eq(remediationSteps.id, input.stepId));

      // Update progress
      const allSteps = await db
        .select()
        .from(remediationSteps)
        .where(eq(remediationSteps.planId, steps[0].planId));

      const completedCount = allSteps.filter(
        s => s.status === "completed"
      ).length;
      const progressPercentage = Math.round(
        (completedCount / allSteps.length) * 100
      );

      await db
        .update(remediationProgress)
        .set({
          completedSteps: completedCount,
          progressPercentage,
        })
        .where(eq(remediationProgress.planId, steps[0].planId));

      return { success: true };
    }),

  /**
   * Upload compliance evidence
   */
  uploadEvidence: protectedProcedure
    .input(
      z.object({
        stepId: z.number(),
        evidenceType: z.string(),
        title: z.string(),
        description: z.string().optional(),
        fileUrl: z.string(),
        fileKey: z.string(),
        mimeType: z.string().optional(),
        fileSize: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const steps = await db
        .select()
        .from(remediationSteps)
        .where(eq(remediationSteps.id, input.stepId))
        .limit(1);

      if (!steps[0]) throw new Error("Step not found");

      const plans = await db
        .select()
        .from(riskRemediationPlans)
        .where(eq(riskRemediationPlans.id, steps[0].planId))
        .limit(1);

      if (!plans[0] || plans[0].userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      // Upload evidence
      const [evidence] = await db.insert(complianceEvidence).values({
        userId: ctx.user.id,
        stepId: input.stepId,
        evidenceType: input.evidenceType,
        title: input.title,
        description: input.description,
        fileUrl: input.fileUrl,
        fileKey: input.fileKey,
        mimeType: input.mimeType,
        fileSize: input.fileSize,
        uploadedBy: ctx.user.name || "Unknown",
        verificationStatus: "pending",
      });

      // Update progress
      const evidence_list = await db
        .select()
        .from(complianceEvidence)
        .where(eq(complianceEvidence.stepId, input.stepId));

      const progress = await db
        .select()
        .from(remediationProgress)
        .where(eq(remediationProgress.planId, steps[0].planId))
        .limit(1);

      if (progress[0]) {
        await db
          .update(remediationProgress)
          .set({ evidenceSubmitted: evidence_list.length })
          .where(eq(remediationProgress.planId, steps[0].planId));
      }

      return { evidenceId: evidence.insertId, status: "pending" };
    }),

  /**
   * Get remediation plan with steps
   */
  getPlan: protectedProcedure
    .input(z.object({ planId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const plans = await db
        .select()
        .from(riskRemediationPlans)
        .where(eq(riskRemediationPlans.id, input.planId))
        .limit(1);

      if (!plans[0] || plans[0].userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      const steps = await db
        .select()
        .from(remediationSteps)
        .where(eq(remediationSteps.planId, input.planId));

      const progress = await db
        .select()
        .from(remediationProgress)
        .where(eq(remediationProgress.planId, input.planId))
        .limit(1);

      return {
        id: plans[0].id,
        title: plans[0].title,
        description: plans[0].description,
        status: plans[0].status,
        targetCompletionDate: plans[0].targetCompletionDate,
        createdAt: plans[0].createdAt,
        steps: steps.map(s => ({
          id: s.id,
          stepNumber: s.stepNumber,
          title: s.title,
          description: s.description,
          status: s.status,
          assignedTo: s.assignedTo,
          dueDate: s.dueDate,
          completedAt: s.completedAt,
        })),
        progress: progress[0]
          ? {
              totalSteps: progress[0].totalSteps,
              completedSteps: progress[0].completedSteps,
              progressPercentage: progress[0].progressPercentage,
              evidenceSubmitted: progress[0].evidenceSubmitted,
              evidenceVerified: progress[0].evidenceVerified,
            }
          : null,
      };
    }),

  /**
   * List user's remediation plans
   */
  listPlans: protectedProcedure
    .input(
      z.object({
        status: z
          .enum(["draft", "in_progress", "completed", "cancelled"])
          .optional(),
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const conditions = [eq(riskRemediationPlans.userId, ctx.user.id)];
      if (input.status) {
        conditions.push(eq(riskRemediationPlans.status, input.status));
      }

      const plans = await db
        .select()
        .from(riskRemediationPlans)
        .where(conditions.length > 1 ? and(...conditions) : conditions[0])
        .orderBy(desc(riskRemediationPlans.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return plans.map(p => ({
        id: p.id,
        title: p.title,
        status: p.status,
        targetCompletionDate: p.targetCompletionDate,
        createdAt: p.createdAt,
      }));
    }),

  /**
   * Get evidence for step
   */
  getStepEvidence: protectedProcedure
    .input(z.object({ stepId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const evidence = await db
        .select()
        .from(complianceEvidence)
        .where(eq(complianceEvidence.stepId, input.stepId));

      return evidence.map(e => ({
        id: e.id,
        evidenceType: e.evidenceType,
        title: e.title,
        description: e.description,
        fileUrl: e.fileUrl,
        mimeType: e.mimeType,
        uploadedBy: e.uploadedBy,
        verificationStatus: e.verificationStatus,
        verifiedAt: e.verifiedAt,
        verificationNotes: e.verificationNotes,
        createdAt: e.createdAt,
      }));
    }),

  /**
   * Verify evidence (admin only)
   */
  verifyEvidence: protectedProcedure
    .input(
      z.object({
        evidenceId: z.number(),
        verified: z.boolean(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Check if user is admin
      if (ctx.user.role !== "admin") {
        throw new Error("Only admins can verify evidence");
      }

      const status = input.verified ? "verified" : "rejected";

      await db
        .update(complianceEvidence)
        .set({
          verificationStatus: status,
          verifiedAt: new Date().toISOString(),
          verifiedBy: ctx.user.name || "Unknown",
          verificationNotes: input.notes,
        })
        .where(eq(complianceEvidence.id, input.evidenceId));

      return { success: true };
    }),

  /**
   * Complete remediation plan
   */
  completePlan: protectedProcedure
    .input(z.object({ planId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const plans = await db
        .select()
        .from(riskRemediationPlans)
        .where(eq(riskRemediationPlans.id, input.planId))
        .limit(1);

      if (!plans[0] || plans[0].userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      // Mark plan as completed
      await db
        .update(riskRemediationPlans)
        .set({
          status: "completed",
          completedAt: new Date().toISOString(),
        })
        .where(eq(riskRemediationPlans.id, input.planId));

      // Mark associated risk as resolved
      await db
        .update(supplyChainRisks)
        .set({
          isResolved: 1,
          resolvedAt: new Date().toISOString(),
        })
        .where(eq(supplyChainRisks.id, plans[0].riskId));

      return { success: true };
    }),
});
