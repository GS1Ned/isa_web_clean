import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  roadmapComments,
  roadmapApprovals,
  roadmapActivityLog,
  teamRoadmapAccess,
  complianceRoadmaps,
} from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

/**
 * Roadmap Collaboration Router
 * Manages comments, approvals, and team access
 */

export const collaborationRouter = router({
  /**
   * Add comment to roadmap or action
   */
  addComment: protectedProcedure
    .input(
      z.object({
        roadmapId: z.number(),
        actionId: z.number().optional(),
        content: z.string().min(1).max(5000),
        isApproval: z.boolean().optional(),
        approvalStatus: z.enum(["approved", "rejected", "pending"]).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify user has access to roadmap
      const roadmap = await db
        .select()
        .from(complianceRoadmaps)
        .where(eq(complianceRoadmaps.id, input.roadmapId))
        .limit(1);

      if (roadmap.length === 0 || roadmap[0].userId !== ctx.user.id) {
        throw new Error("Roadmap not found or access denied");
      }

      // Create comment
      const result = await db.insert(roadmapComments).values({
        roadmapId: input.roadmapId,
        actionId: input.actionId,
        userId: ctx.user.id,
        content: input.content,
        isApproval: input.isApproval ? 1 : 0,
        approvalStatus: input.approvalStatus,
      });

      // Log activity
      await db.insert(roadmapActivityLog).values({
        roadmapId: input.roadmapId,
        userId: ctx.user.id,
        activityType: input.isApproval ? "approved" : "commented",
        description: input.isApproval
          ? `Approval: ${input.approvalStatus}`
          : "Added comment",
        metadata: JSON.stringify({
          actionId: input.actionId,
          commentLength: input.content.length,
        }),
      });

      return { success: true, commentId: (result as any).insertId };
    }),

  /**
   * Get comments for roadmap
   */
  getComments: protectedProcedure
    .input(
      z.object({
        roadmapId: z.number(),
        actionId: z.number().optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      let query = db
        .select()
        .from(roadmapComments)
        .where(eq(roadmapComments.roadmapId, input.roadmapId));

      if (input.actionId) {
        query = db
          .select()
          .from(roadmapComments)
          .where(
            and(
              eq(roadmapComments.roadmapId, input.roadmapId),
              eq(roadmapComments.actionId, input.actionId)
            )
          );
      }

      const comments = await query.limit(input.limit);

      return comments.map(c => ({
        id: c.id,
        content: c.content,
        userId: c.userId,
        isApproval: c.isApproval,
        approvalStatus: c.approvalStatus,
        createdAt: c.createdAt,
      }));
    }),

  /**
   * Request approval for roadmap
   */
  requestApproval: protectedProcedure
    .input(
      z.object({
        roadmapId: z.number(),
        approverIds: z.array(z.number()),
        approverRole: z.enum(["stakeholder", "manager", "admin"]),
        message: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Create approval records
      for (const approverId of input.approverIds) {
        await db.insert(roadmapApprovals).values({
          roadmapId: input.roadmapId,
          requiredApproverId: approverId,
          approverRole: input.approverRole,
          status: "pending",
        });
      }

      // Log activity
      await db.insert(roadmapActivityLog).values({
        roadmapId: input.roadmapId,
        userId: ctx.user.id,
        activityType: "updated",
        description: `Requested approval from ${input.approverIds.length} approver(s)`,
        metadata: JSON.stringify({
          approverCount: input.approverIds.length,
          approverRole: input.approverRole,
        }),
      });

      return { success: true, approvalsCreated: input.approverIds.length };
    }),

  /**
   * Approve roadmap
   */
  approveRoadmap: protectedProcedure
    .input(
      z.object({
        approvalId: z.number(),
        comments: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get approval
      const approvals = await db
        .select()
        .from(roadmapApprovals)
        .where(eq(roadmapApprovals.id, input.approvalId))
        .limit(1);

      if (approvals.length === 0) {
        throw new Error("Approval not found");
      }

      const approval = approvals[0];

      // Update approval
      await db
        .update(roadmapApprovals)
        .set({
          status: "approved",
          approvedAt: new Date().toISOString(),
          approverComments: input.comments,
        })
        .where(eq(roadmapApprovals.id, input.approvalId));

      // Log activity
      await db.insert(roadmapActivityLog).values({
        roadmapId: approval.roadmapId,
        userId: ctx.user.id,
        activityType: "approved",
        description: "Approved roadmap",
        metadata: JSON.stringify({
          approvalId: input.approvalId,
          role: approval.approverRole,
        }),
      });

      return { success: true };
    }),

  /**
   * Reject roadmap
   */
  rejectRoadmap: protectedProcedure
    .input(
      z.object({
        approvalId: z.number(),
        reason: z.string().min(1),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get approval
      const approvals = await db
        .select()
        .from(roadmapApprovals)
        .where(eq(roadmapApprovals.id, input.approvalId))
        .limit(1);

      if (approvals.length === 0) {
        throw new Error("Approval not found");
      }

      const approval = approvals[0];

      // Update approval
      await db
        .update(roadmapApprovals)
        .set({
          status: "rejected",
          approverComments: input.reason,
        })
        .where(eq(roadmapApprovals.id, input.approvalId));

      // Log activity
      await db.insert(roadmapActivityLog).values({
        roadmapId: approval.roadmapId,
        userId: ctx.user.id,
        activityType: "rejected",
        description: "Rejected roadmap",
        metadata: JSON.stringify({
          approvalId: input.approvalId,
          reason: input.reason,
        }),
      });

      return { success: true };
    }),

  /**
   * Get pending approvals for user
   */
  getPendingApprovals: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const approvals = await db
        .select()
        .from(roadmapApprovals)
        .where(
          and(
            eq(roadmapApprovals.requiredApproverId, ctx.user.id),
            eq(roadmapApprovals.status, "pending")
          )
        )
        .limit(input.limit);

      return approvals.map(a => ({
        id: a.id,
        roadmapId: a.roadmapId,
        approverRole: a.approverRole,
        createdAt: a.createdAt,
      }));
    }),

  /**
   * Get approval status for roadmap
   */
  getApprovalStatus: protectedProcedure
    .input(
      z.object({
        roadmapId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const approvals = await db
        .select()
        .from(roadmapApprovals)
        .where(eq(roadmapApprovals.roadmapId, input.roadmapId));

      const approved = approvals.filter(a => a.status === "approved").length;
      const rejected = approvals.filter(a => a.status === "rejected").length;
      const pending = approvals.filter(a => a.status === "pending").length;

      return {
        totalApprovals: approvals.length,
        approved,
        rejected,
        pending,
        approvalPercentage:
          approvals.length > 0
            ? Math.round((approved / approvals.length) * 100)
            : 0,
        status:
          rejected > 0
            ? "rejected"
            : pending > 0
              ? "pending"
              : approved === approvals.length
                ? "approved"
                : "no_approvals",
      };
    }),

  /**
   * Get activity log for roadmap
   */
  getActivityLog: protectedProcedure
    .input(
      z.object({
        roadmapId: z.number(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const activities = await db
        .select()
        .from(roadmapActivityLog)
        .where(eq(roadmapActivityLog.roadmapId, input.roadmapId))
        .limit(input.limit);

      return activities.map(a => ({
        id: a.id,
        activityType: a.activityType,
        description: a.description,
        userId: a.userId,
        createdAt: a.createdAt,
        metadata: a.metadata ? JSON.parse(a.metadata as any) : null,
      }));
    }),

  /**
   * Grant team access to roadmap
   */
  grantAccess: protectedProcedure
    .input(
      z.object({
        roadmapId: z.number(),
        userId: z.number(),
        accessLevel: z.enum(["viewer", "editor", "approver"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify user owns roadmap
      const roadmap = await db
        .select()
        .from(complianceRoadmaps)
        .where(eq(complianceRoadmaps.id, input.roadmapId))
        .limit(1);

      if (roadmap.length === 0 || roadmap[0].userId !== ctx.user.id) {
        throw new Error("Roadmap not found or access denied");
      }

      // Grant access
      await db.insert(teamRoadmapAccess).values({
        roadmapId: input.roadmapId,
        userId: input.userId,
        accessLevel: input.accessLevel,
        grantedBy: ctx.user.id,
      });

      // Log activity
      await db.insert(roadmapActivityLog).values({
        roadmapId: input.roadmapId,
        userId: ctx.user.id,
        activityType: "updated",
        description: `Granted ${input.accessLevel} access to user ${input.userId}`,
        metadata: JSON.stringify({
          grantedUserId: input.userId,
          accessLevel: input.accessLevel,
        }),
      });

      return { success: true };
    }),

  /**
   * Get team members with access
   */
  getTeamAccess: protectedProcedure
    .input(
      z.object({
        roadmapId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const access = await db
        .select()
        .from(teamRoadmapAccess)
        .where(eq(teamRoadmapAccess.roadmapId, input.roadmapId));

      return access.map(a => ({
        id: a.id,
        userId: a.userId,
        accessLevel: a.accessLevel,
        grantedAt: a.grantedAt,
      }));
    }),
});
