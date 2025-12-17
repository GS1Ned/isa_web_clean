/**
 * ESRS-GS1 Mapping Router
 * 
 * Provides intelligent queries for ESRS-GS1 compliance mapping:
 * - Which GS1 attributes satisfy a specific ESRS requirement?
 * - What ESRS requirements can be met with available GS1 data?
 * - Compliance gap analysis
 * - Advisory recommendations
 */

import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import {
  getAllEsrsGs1Mappings,
  getEsrsGs1MappingsByStandard,
  getGs1AttributesForEsrsMapping,
  getEsrsRequirementsForGs1Attribute,
  getComplianceCoverageSummary,
  getUnmappedEsrsRequirements,
  searchEsrsGs1Mappings,
  getEsrsGs1MappingStatistics
} from '../db-esrs-gs1-mapping.js';

export const esrsGs1MappingRouter = router({
  /**
   * Get all GS1-ESRS data point mappings
   */
  getAllMappings: publicProcedure.query(async () => {
    return await getAllEsrsGs1Mappings();
  }),

  /**
   * Get mappings for a specific ESRS standard (e.g., "ESRS E1", "ESRS E5")
   */
  getMappingsByStandard: publicProcedure
    .input(z.object({
      esrs_standard: z.string()
    }))
    .query(async ({ input }) => {
      return await getEsrsGs1MappingsByStandard(input.esrs_standard);
    }),

  /**
   * Get GS1 attributes that map to a specific ESRS requirement
   */
  getGs1AttributesForEsrsMapping: publicProcedure
    .input(z.object({
      esrsMappingId: z.number()
    }))
    .query(async ({ input }) => {
      return await getGs1AttributesForEsrsMapping(input.esrsMappingId);
    }),

  /**
   * Get all ESRS requirements that a specific GS1 attribute can satisfy
   */
  getEsrsRequirementsForGs1Attribute: publicProcedure
    .input(z.object({
      gs1AttributeId: z.string()
    }))
    .query(async ({ input }) => {
      return await getEsrsRequirementsForGs1Attribute(input.gs1AttributeId);
    }),

  /**
   * Get compliance coverage summary by ESRS standard
   */
  getComplianceCoverageSummary: publicProcedure.query(async () => {
    return await getComplianceCoverageSummary();
  }),

  /**
   * Get unmapped ESRS requirements (requirements without any GS1 attribute mappings)
   */
  getUnmappedEsrsRequirements: publicProcedure.query(async () => {
    return await getUnmappedEsrsRequirements();
  }),

  /**
   * Search mappings by keyword
   */
  searchMappings: publicProcedure
    .input(z.object({
      keyword: z.string().min(2)
    }))
    .query(async ({ input }) => {
      return await searchEsrsGs1Mappings(input.keyword);
    }),

  /**
   * Get mapping statistics
   */
  getMappingStatistics: publicProcedure.query(async () => {
    return await getEsrsGs1MappingStatistics();
  })
});
