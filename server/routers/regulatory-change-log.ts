import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createRegulatoryChangeLogEntry,
  getRegulatoryChangeLogEntries,
  getRegulatoryChangeLogEntryById,
  getRegulatoryChangeLogEntriesByVersion,
  getRegulatoryChangeLogStatsBySourceType,
  getRegulatoryChangeLogStatsByVersion,
  deleteRegulatoryChangeLogEntry,
} from "../db-regulatory-change-log";

/**
 * tRPC router for Regulatory Change Log
 *
 * Adheres to ISA Design Contract:
 * - Admin-only creation (protectedProcedure with role check)
 * - Public read access for transparency
 * - Immutable entries (no update/delete procedures)
 * - Traceable to source documents
 */

const sourceTypeEnum = z.enum([
  "EU_DIRECTIVE",
  "EU_REGULATION",
  "EU_DELEGATED_ACT",
  "EU_IMPLEMENTING_ACT",
  "EFRAG_IG",
  "EFRAG_QA",
  "EFRAG_TAXONOMY",
  "GS1_AISBL",
  "GS1_EUROPE",
  "GS1_NL",
]);

export const regulatoryChangeLogRouter = router({
  /**
   * Create a new regulatory change log entry (admin-only)
   */
  create: protectedProcedure
    .input(
      z.object({
        entryDate: z.string(), // ISO 8601 date string
        sourceType: sourceTypeEnum,
        sourceOrg: z.string().min(1).max(255),
        title: z.string().min(1).max(512),
        description: z.string().min(1),
        url: z.string().url().max(512),
        documentHash: z.string().length(64).optional(),
        impactAssessment: z.string().optional(),
        isaVersionAffected: z.string().max(16).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Admin-only authorization
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only administrators can create regulatory change log entries",
        });
      }

      // Keep entryDate as string (schema uses timestamp with mode: 'string')
      const entry = await createRegulatoryChangeLogEntry({
        ...input,
        entryDate: input.entryDate,
      });

      return entry;
    }),

  /**
   * Get all regulatory change log entries with optional filters and pagination (public)
   */
  list: publicProcedure
    .input(
      z
        .object({
          sourceType: sourceTypeEnum.optional(),
          isaVersionAffected: z.string().optional(),
          sourceOrg: z.string().optional(),
          search: z.string().optional(),
          startDate: z.string().optional(), // ISO date string
          endDate: z.string().optional(), // ISO date string
          page: z.number().min(1).optional(),
          pageSize: z.number().min(1).max(100).optional(),
          limit: z.number().min(1).max(200).optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const filters = {
        ...input,
        startDate: input?.startDate ? new Date(input.startDate) : undefined,
        endDate: input?.endDate ? new Date(input.endDate) : undefined,
      };
      return await getRegulatoryChangeLogEntries(filters);
    }),

  /**
   * Get a single regulatory change log entry by ID (public)
   */
  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const entry = await getRegulatoryChangeLogEntryById(input.id);

      if (!entry) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Regulatory change log entry with ID ${input.id} not found`,
        });
      }

      return entry;
    }),

  /**
   * Get regulatory change log entries by ISA version (public)
   */
  getByVersion: publicProcedure
    .input(z.object({ isaVersion: z.string() }))
    .query(async ({ input }) => {
      return await getRegulatoryChangeLogEntriesByVersion(input.isaVersion);
    }),

  /**
   * Get statistics on regulatory change log entries by source type (public)
   */
  statsBySourceType: publicProcedure.query(async () => {
    return await getRegulatoryChangeLogStatsBySourceType();
  }),

  /**
   * Get statistics on regulatory change log entries by ISA version (public)
   */
  statsByVersion: publicProcedure.query(async () => {
    return await getRegulatoryChangeLogStatsByVersion();
  }),

  /**
   * Bulk import regulatory change log entries from high-impact news (admin-only)
   */
  bulkImportFromNews: protectedProcedure
    .input(
      z.object({
        newsIds: z.array(z.number()).optional(),
        impactThreshold: z.enum(["HIGH", "CRITICAL"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Admin-only authorization
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only administrators can bulk import change log entries",
        });
      }

      const { bulkCreateChangeLogEntriesFromNews } = await import("../news-regulatory-integration");
      const { getHighImpactNews, getNewsByIds } = await import("../db-news-helpers-additions");

      // Get news items to process
      let newsItems;
      if (input.newsIds && input.newsIds.length > 0) {
        // Import specific news items by ID
        newsItems = await getNewsByIds(input.newsIds);
      } else {
        // Import all high-impact news
        const threshold = input.impactThreshold || "HIGH";
        newsItems = await getHighImpactNews(threshold);
      }

      // Bulk create change log entries
      const result = await bulkCreateChangeLogEntriesFromNews(newsItems);

      return result;
    }),

  /**
   * Delete a regulatory change log entry (admin-only)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      // Admin-only authorization
      if (ctx.user.role !== "admin") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only administrators can delete regulatory change log entries",
        });
      }

      const deleted = await deleteRegulatoryChangeLogEntry(input.id);

      if (!deleted) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Regulatory change log entry with ID ${input.id} not found`,
        });
      }

      return { success: true };
    }),
});
