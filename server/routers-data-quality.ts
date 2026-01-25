/**
 * Data Quality tRPC Procedures
 * Track B Priority 1: Data Quality Foundation
 */

import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import {
  getDataQualitySummary,
  getOrphanedRegulations,
  getOrphanedStandards,
  getRegulationsWithMissingMetadata,
  getStandardsWithMissingMetadata,
  getDuplicateRegulations,
  getDuplicateStandards,
} from "./db-data-quality";

export const dataQualityRouter = router({
  /**
   * Get overall data quality summary
   */
  getSummary: publicProcedure.query(async () => {
    return await getDataQualitySummary();
  }),

  /**
   * Get orphaned regulations (no standard mappings)
   */
  getOrphanedRegulations: publicProcedure.query(async () => {
    return await getOrphanedRegulations();
  }),

  /**
   * Get orphaned standards (no regulation mappings)
   */
  getOrphanedStandards: publicProcedure.query(async () => {
    return await getOrphanedStandards();
  }),

  /**
   * Get regulations with missing metadata
   */
  getRegulationsWithMissingMetadata: publicProcedure.query(async () => {
    return await getRegulationsWithMissingMetadata();
  }),

  /**
   * Get standards with missing metadata
   */
  getStandardsWithMissingMetadata: publicProcedure.query(async () => {
    return await getStandardsWithMissingMetadata();
  }),

  /**
   * Get duplicate regulations
   */
  getDuplicateRegulations: publicProcedure.query(async () => {
    return await getDuplicateRegulations();
  }),

  /**
   * Get duplicate standards
   */
  getDuplicateStandards: publicProcedure.query(async () => {
    return await getDuplicateStandards();
  }),
});
