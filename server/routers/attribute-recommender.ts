/**
 * Attribute Recommender Router
 * 
 * Provides AI-powered GS1 attribute recommendations based on:
 * - Sector-specific requirements
 * - Target regulations (CSRD, DPP, ESPR, etc.)
 * - Current attribute coverage
 * - Company size considerations
 * 
 * Includes confidence scoring and epistemic markers for transparency.
 */

import { z } from 'zod';
import { publicProcedure, protectedProcedure, router } from '../_core/trpc';
import { getDb } from '../db.js';
import {
  generateAttributeRecommendations,
  type AttributeRecommendationInput,
  type AttributeRecommendationResult,
} from '../attribute-recommender.js';
import { regulations, gs1AttributeEsrsMapping } from '../../drizzle/schema';
import { asc } from 'drizzle-orm';
import {
  buildAvailableRegulations,
  buildSampleAttributeInventory,
  CURATED_SECTOR_DISPLAY_MAP,
  CURATED_SECTOR_OPTIONS,
} from '../attribute-recommender-inventory.js';

// =============================================================================
// INPUT SCHEMAS
// =============================================================================

const recommendationInputSchema = z.object({
  sector: z.string(),
  productCategory: z.string().optional(),
  targetRegulations: z.array(z.string()).optional(),
  currentAttributes: z.array(z.string()).optional(),
  companySize: z.enum(['small', 'medium', 'large']).optional(),
});

// =============================================================================
// ROUTER
// =============================================================================

export const attributeRecommenderRouter = router({
  /**
   * Get available sectors for recommendation
   */
  getAvailableSectors: publicProcedure.query(async () => {
    return CURATED_SECTOR_OPTIONS;
  }),

  /**
   * Get available regulations for targeting
   */
  getAvailableRegulations: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return buildAvailableRegulations([]);
    }

    try {
      const rows = await db
        .select({
          regulationType: regulations.regulationType,
          title: regulations.title,
        })
        .from(regulations)
        .orderBy(asc(regulations.regulationType), asc(regulations.title));

      return buildAvailableRegulations(rows);
    } catch {
      return buildAvailableRegulations([]);
    }
  }),

  /**
   * Get company size options
   */
  getCompanySizeOptions: publicProcedure.query(async () => {
    return [
      { id: 'small', name: 'Small Enterprise', description: 'Less than 50 employees' },
      { id: 'medium', name: 'Medium Enterprise', description: '50-250 employees' },
      { id: 'large', name: 'Large Enterprise', description: 'More than 250 employees' },
    ];
  }),

  /**
   * Get sample GS1 attributes for current coverage selection
   */
  getSampleAttributes: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return buildSampleAttributeInventory([]);
    }

    try {
      const rows = await db
        .select({
          gs1AttributeId: gs1AttributeEsrsMapping.gs1AttributeId,
          gs1AttributeName: gs1AttributeEsrsMapping.gs1AttributeName,
          confidence: gs1AttributeEsrsMapping.confidence,
        })
        .from(gs1AttributeEsrsMapping);

      return buildSampleAttributeInventory(rows);
    } catch {
      return buildSampleAttributeInventory([]);
    }
  }),

  /**
   * Generate attribute recommendations based on input parameters
   */
  recommend: publicProcedure
    .input(recommendationInputSchema)
    .mutation(async ({ input }): Promise<AttributeRecommendationResult> => {
      const recommendationInput: AttributeRecommendationInput = {
        sector: CURATED_SECTOR_DISPLAY_MAP[input.sector] || input.sector,
        productCategory: input.productCategory,
        targetRegulations: input.targetRegulations,
        currentAttributes: input.currentAttributes,
        companySize: input.companySize,
      };

      return await generateAttributeRecommendations(recommendationInput);
    }),

  /**
   * Get recommendation history for authenticated user
   */
  getHistory: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async () => {
      // For now, return empty array - can be extended to store history in DB
      return [];
    }),
});
