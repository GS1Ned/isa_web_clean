/**
 * GS1 Standards tRPC Router
 *
 * Procedures for accessing GS1 standards catalog and regulation-to-standard mappings
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import {
  gs1Standards,
  regulationStandardMappings,
  regulations,
} from "../drizzle/schema";
import { eq, like, or } from "drizzle-orm";
import {
  mapRegulationToStandards,
  saveMappings,
  getMappingsForRegulation,
  mapAllRegulations,
} from "./gs1-mapping-engine";

export const gs1StandardsRouter = router({
  /**
   * List all GS1 standards with optional filtering
   */
  list: publicProcedure
    .input(
      z
        .object({
          category: z
            .enum([
              "Identification",
              "Traceability",
              "Packaging",
              "Data_Exchange",
              "Quality",
            ])
            .optional(),
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      let query = db.select().from(gs1Standards);

      // Apply filters
      if (input?.category) {
        query = query.where(eq(gs1Standards.category, input.category)) as any;
      }

      if (input?.search) {
        const searchTerm = `%${input.search}%`;
        query = query.where(
          or(
            like(gs1Standards.standardName, searchTerm),
            like(gs1Standards.standardCode, searchTerm),
            like(gs1Standards.description, searchTerm)
          )
        ) as any;
      }

      const standards = await query;

      return {
        standards,
        total: standards.length,
      };
    }),

  /**
   * Get a single GS1 standard by ID
   */
  getById: publicProcedure
    .input(
      z.object({
        id: z.number(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const [standard] = await db
        .select()
        .from(gs1Standards)
        .where(eq(gs1Standards.id, input.id));

      if (!standard) {
        throw new Error(`Standard ${input.id} not found`);
      }

      return standard;
    }),

  /**
   * Get standards applicable to a regulation
   */
  getByRegulation: publicProcedure
    .input(
      z.object({
        regulationId: z.number(),
      })
    )
    .query(async ({ input }) => {
      const mappings = await getMappingsForRegulation(input.regulationId);
      return mappings;
    }),

  /**
   * Generate mappings for a regulation (admin only)
   */
  generateMappings: protectedProcedure
    .input(
      z.object({
        regulationId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const mappings = await mapRegulationToStandards(input.regulationId);
      await saveMappings(input.regulationId, mappings);

      return {
        regulationId: input.regulationId,
        mappingsGenerated: mappings.length,
        mappings,
      };
    }),

  /**
   * Generate mappings for all regulations (admin only)
   */
  generateAllMappings: protectedProcedure.mutation(async () => {
    const results = await mapAllRegulations();

    const totalMappings = results.reduce((sum, r) => sum + r.mappingsCount, 0);

    return {
      regulationsProcessed: results.length,
      totalMappings,
      results,
    };
  }),

  /**
   * Get mapping statistics
   */
  getStatistics: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const [standardsCount] = await db
      .select({ count: gs1Standards.id })
      .from(gs1Standards);
    const [mappingsCount] = await db
      .select({ count: regulationStandardMappings.id })
      .from(regulationStandardMappings);
    const [regulationsCount] = await db
      .select({ count: regulations.id })
      .from(regulations);

    // Get mappings by category
    const mappingsByCategory = await db
      .select({
        category: gs1Standards.category,
        count: regulationStandardMappings.id,
      })
      .from(regulationStandardMappings)
      .leftJoin(
        gs1Standards,
        eq(regulationStandardMappings.standardId, gs1Standards.id)
      )
      .groupBy(gs1Standards.category);

    return {
      totalStandards: standardsCount?.count || 0,
      totalMappings: mappingsCount?.count || 0,
      totalRegulations: regulationsCount?.count || 0,
      mappingsByCategory,
    };
  }),
});
