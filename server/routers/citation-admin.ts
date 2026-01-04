/**
 * Citation Administration Router
 *
 * Admin procedures for managing citation provenance and deprecation
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  markChunkDeprecated,
  updateVerificationDate,
} from "../citation-validation";
import { getDb } from "../db";
import { eq } from "drizzle-orm";
import { serverLogger } from "../_core/logger-wiring";


export const citationAdminRouter = router({
  /**
   * Mark a knowledge chunk as deprecated
   */
  markDeprecated: protectedProcedure
    .input(
      z.object({
        chunkId: z.number(),
        reason: z.string().min(10).max(500),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Only admins can deprecate sources
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can deprecate sources",
        });
      }

      const success = await markChunkDeprecated(input.chunkId, input.reason);

      if (!success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to mark chunk as deprecated",
        });
      }

      return { success: true };
    }),

  /**
   * Update verification date for a knowledge chunk
   */
  updateVerification: protectedProcedure
    .input(
      z.object({
        chunkId: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Only admins can update verification dates
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can update verification dates",
        });
      }

      const success = await updateVerificationDate(input.chunkId);

      if (!success) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update verification date",
        });
      }

      return { success: true };
    }),

  /**
   * Bulk update dataset provenance for knowledge chunks
   */
  bulkUpdateProvenance: protectedProcedure
    .input(
      z.object({
        sourceType: z.enum([
          "regulation",
          "standard",
          "esrs_datapoint",
          "dutch_initiative",
          "esrs_gs1_mapping",
        ]),
        datasetId: z.string(),
        datasetVersion: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Only admins can bulk update provenance
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can bulk update provenance",
        });
      }

      const db = await getDb();
      if (!db) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database connection failed",
        });
      }

      try {
        const { knowledgeEmbeddings } = await import("../../drizzle/schema");

        const result = await db
          .update(knowledgeEmbeddings)
          .set({
            datasetId: input.datasetId,
            datasetVersion: input.datasetVersion,
            lastVerifiedDate: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })
          .where(eq(knowledgeEmbeddings.sourceType, input.sourceType));

        return {
          success: true,
          message: `Updated provenance for all ${input.sourceType} chunks`,
        };
      } catch (error) {
        serverLogger.error("[CitationAdmin] Bulk update failed:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to bulk update provenance",
        });
      }
    }),

  /**
   * Get chunks needing verification
   */
  getChunksNeedingVerification: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      // Only admins can view verification status
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only admins can view verification status",
        });
      }

      const db = await getDb();
      if (!db) return [];

      try {
        const { knowledgeEmbeddings } = await import("../../drizzle/schema");

        // Get chunks with no verification date or >90 days old
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

        const chunks = await db
          .select({
            id: knowledgeEmbeddings.id,
            sourceType: knowledgeEmbeddings.sourceType,
            sourceId: knowledgeEmbeddings.sourceId,
            title: knowledgeEmbeddings.title,
            lastVerifiedDate: knowledgeEmbeddings.lastVerifiedDate,
            datasetId: knowledgeEmbeddings.datasetId,
            datasetVersion: knowledgeEmbeddings.datasetVersion,
          })
          .from(knowledgeEmbeddings)
          .where(eq(knowledgeEmbeddings.isDeprecated, 0))
          .limit(input.limit);

        // Filter in memory for verification date check
        const needsVerification = chunks.filter(chunk => {
          if (!chunk.lastVerifiedDate) return true;
          const verifiedDate = new Date(chunk.lastVerifiedDate);
          return verifiedDate < ninetyDaysAgo;
        });

        return needsVerification;
      } catch (error) {
        serverLogger.error("[CitationAdmin] Failed to get chunks:", error);
        return [];
      }
    }),
});
