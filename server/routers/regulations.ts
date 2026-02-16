import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { getRegulationWithStandards, getRegulations } from "../db";

export const regulationsRouter = router({
  /**
   * Get all regulations, optionally filtered by type
   */
  list: publicProcedure
    .input(
      z
        .object({
          type: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return await getRegulations(input?.type);
    }),

  /**
   * Get a specific regulation with its mapped standards
   */
  getWithStandards: publicProcedure
    .input(z.object({ regulationId: z.number() }))
    .query(async ({ input }) => {
      return await getRegulationWithStandards(input.regulationId);
    }),

  /**
   * Get ESRS datapoint mappings for a regulation
   */
  getEsrsMappings: publicProcedure
    .input(z.object({ regulationId: z.number() }))
    .query(async ({ input }) => {
      const { getRegulationEsrsMappings } = await import("../db");
      return await getRegulationEsrsMappings(input.regulationId);
    }),

  /**
   * Generate ESRS datapoint mappings for a regulation using LLM (admin only)
   */
  generateEsrsMappings: protectedProcedure
    .input(z.object({ regulationId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const { generateRegulationEsrsMappings } = await import(
        "../regulation-esrs-mapper"
      );
      return await generateRegulationEsrsMappings(input.regulationId);
    }),

  /**
   * Submit or update user feedback on an ESRS mapping
   */
  submitMappingFeedback: protectedProcedure
    .input(
      z.object({
        mappingId: z.number(),
        vote: z.boolean(), // true = thumbs up, false = thumbs down
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { submitMappingFeedback } = await import("../db");
      return await submitMappingFeedback({
        userId: ctx.user.id,
        mappingId: input.mappingId,
        vote: input.vote,
      });
    }),

  /**
   * Get user's feedback for a specific mapping
   */
  getUserMappingFeedback: protectedProcedure
    .input(z.object({ mappingId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { getUserMappingFeedback } = await import("../db");
      return await getUserMappingFeedback(ctx.user.id, input.mappingId);
    }),

  /**
   * Get aggregated feedback stats for a mapping
   */
  getMappingFeedbackStats: publicProcedure
    .input(z.object({ mappingId: z.number() }))
    .query(async ({ input }) => {
      const { getMappingFeedbackStats } = await import("../db");
      return await getMappingFeedbackStats(input.mappingId);
    }),

  /**
   * Get feedback stats for multiple mappings (batch)
   */
  getBatchMappingFeedbackStats: publicProcedure
    .input(z.object({ mappingIds: z.array(z.number()) }))
    .query(async ({ input }) => {
      const { getBatchMappingFeedbackStats } = await import("../db");
      return await getBatchMappingFeedbackStats(input.mappingIds);
    }),

  getLowScoredMappings: protectedProcedure
    .input(z.object({ minVotes: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const { getLowScoredMappings } = await import("../db");
      return await getLowScoredMappings(input.minVotes || 3);
    }),

  getVoteDistributionByStandard: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user?.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    const { getVoteDistributionByStandard } = await import("../db");
    return await getVoteDistributionByStandard();
  }),

  getMostVotedMappings: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ input, ctx }) => {
      if (ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const { getMostVotedMappings } = await import("../db");
      return await getMostVotedMappings(input.limit || 10);
    }),
});

