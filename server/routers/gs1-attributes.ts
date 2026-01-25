/**
 * GS1 Attributes Router
 *
 * Provides tRPC procedures for fetching GS1 Data Source Benelux attributes
 * and GS1 Web Vocabulary terms mapped to regulations.
 */

import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  gs1Attributes,
  gs1AttributeCodeLists,
  gs1WebVocabulary,
  attributeRegulationMappings,
  regulations,
} from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const gs1AttributesRouter = router({
  /**
   * Get GS1 Data Source Benelux attributes for a regulation
   */
  getAttributesByRegulation: publicProcedure
    .input(
      z.object({
        regulationId: z.number(),
        sector: z.enum(["food_hb", "diy_garden_pet", "healthcare"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Fetch attributes with mappings
      const mappings = await db
        .select({
          attribute: gs1Attributes,
          mapping: attributeRegulationMappings,
        })
        .from(attributeRegulationMappings)
        .innerJoin(
          gs1Attributes,
          eq(attributeRegulationMappings.attributeId, gs1Attributes.id)
        )
        .where(eq(attributeRegulationMappings.regulationId, input.regulationId))
        .orderBy(desc(attributeRegulationMappings.relevanceScore));

      // Filter by sector if specified
      const filteredMappings = input.sector
        ? mappings.filter(m => m.attribute.sector === input.sector)
        : mappings;

      // Fetch code lists for each attribute
      const attributesWithCodeLists = await Promise.all(
        filteredMappings.map(async ({ attribute, mapping }) => {
          const codeLists = await db
            .select()
            .from(gs1AttributeCodeLists)
            .where(eq(gs1AttributeCodeLists.attributeId, attribute.id))
            .orderBy(gs1AttributeCodeLists.sortOrder);

          return {
            ...attribute,
            codeLists,
            mappingReason: mapping.mappingReason,
            relevanceScore: mapping.relevanceScore,
            verifiedByAdmin: mapping.verifiedByAdmin,
          };
        })
      );

      return attributesWithCodeLists;
    }),

  /**
   * Get GS1 Web Vocabulary terms for a regulation
   */
  getWebVocabularyByRegulation: publicProcedure
    .input(
      z.object({
        regulationId: z.number(),
        termType: z.enum(["class", "property"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Fetch regulation to determine relevance flags
      const [regulation] = await db
        .select()
        .from(regulations)
        .where(eq(regulations.id, input.regulationId))
        .limit(1);

      if (!regulation) {
        throw new Error("Regulation not found");
      }

      // Determine which relevance flag to filter by
      let relevanceFilter;
      if (regulation.regulationType === "DPP") {
        relevanceFilter = eq(gs1WebVocabulary.dppRelevant, 1);
      } else if (
        regulation.regulationType === "ESRS" ||
        regulation.regulationType === "CSRD"
      ) {
        relevanceFilter = eq(gs1WebVocabulary.esrsRelevant, 1);
      } else if (regulation.regulationType === "EUDR") {
        relevanceFilter = eq(gs1WebVocabulary.eudrRelevant, 1);
      } else if (regulation.regulationType === "PPWR") {
        relevanceFilter = eq(gs1WebVocabulary.packagingRelated, 1);
      } else {
        // Default: show sustainability-related terms
        relevanceFilter = eq(gs1WebVocabulary.sustainabilityRelated, 1);
      }

      // Build query conditions
      const conditions = [
        relevanceFilter,
        eq(gs1WebVocabulary.isDeprecated, 0),
      ];
      if (input.termType) {
        conditions.push(eq(gs1WebVocabulary.termType, input.termType));
      }

      const terms = await db
        .select()
        .from(gs1WebVocabulary)
        .where(and(...conditions));

      return terms;
    }),

  /**
   * Get all GS1 attributes (for admin/exploration)
   */
  getAllAttributes: publicProcedure
    .input(
      z.object({
        sector: z.enum(["food_hb", "diy_garden_pet", "healthcare"]).optional(),
        packagingRelated: z.boolean().optional(),
        sustainabilityRelated: z.boolean().optional(),
        limit: z.number().default(100),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const conditions = [];
      if (input.sector) {
        conditions.push(eq(gs1Attributes.sector, input.sector));
      }
      if (input.packagingRelated !== undefined) {
        conditions.push(
          eq(gs1Attributes.packagingRelated, input.packagingRelated ? 1 : 0)
        );
      }
      if (input.sustainabilityRelated !== undefined) {
        conditions.push(
          eq(gs1Attributes.sustainabilityRelated, input.sustainabilityRelated ? 1 : 0)
        );
      }

      const attributes = await db
        .select()
        .from(gs1Attributes)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .limit(input.limit);

      return attributes;
    }),

  /**
   * Get attribute statistics
   */
  getAttributeStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const [attributes, webVocabTerms, mappings] = await Promise.all([
      db.select().from(gs1Attributes),
      db.select().from(gs1WebVocabulary),
      db.select().from(attributeRegulationMappings),
    ]);

    return {
      totalAttributes: attributes.length,
      packagingAttributes: attributes.filter(a => a.packagingRelated).length,
      sustainabilityAttributes: attributes.filter(a => a.sustainabilityRelated)
        .length,
      sectorBreakdown: {
        food_hb: attributes.filter(a => a.sector === "food_hb").length,
        diy_garden_pet: attributes.filter(a => a.sector === "diy_garden_pet")
          .length,
        healthcare: attributes.filter(a => a.sector === "healthcare").length,
      },
      webVocabulary: {
        totalTerms: webVocabTerms.length,
        classes: webVocabTerms.filter(t => t.termType === "class").length,
        properties: webVocabTerms.filter(t => t.termType === "property").length,
        dppRelevant: webVocabTerms.filter(t => t.dppRelevant).length,
        esrsRelevant: webVocabTerms.filter(t => t.esrsRelevant).length,
        eudrRelevant: webVocabTerms.filter(t => t.eudrRelevant).length,
      },
      totalMappings: mappings.length,
    };
  }),
});
