/**
 * Advisory Diff Router
 *
 * Provides API for computing and retrieving ISA advisory version diffs.
 * Implements metrics from docs/ADVISORY_DIFF_METRICS.md
 */

import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { computeAdvisoryDiffPayload } from "../advisory-diff-runtime";
import {
  listAdvisoryVersionsWithSnapshots,
  loadLegacyAdvisorySummary,
} from "../advisory-legacy-compat";

export const advisoryDiffRouter = router({
  /**
   * Compute diff between two advisory versions
   */
  computeDiff: publicProcedure
    .input(
      z.object({
        version1: z.string().regex(/^v\d+\.\d+$/), // e.g., "v1.0"
        version2: z.string().regex(/^v\d+\.\d+$/), // e.g., "v1.1"
      })
    )
    .query(async ({ input }) => computeAdvisoryDiffPayload(input.version1, input.version2)),

  /**
   * List available advisory versions
   */
  listVersions: publicProcedure.query(async () => {
    return await listAdvisoryVersionsWithSnapshots();
  }),

  /**
   * Get advisory summary
   */
  getAdvisorySummary: publicProcedure
    .input(z.object({ version: z.string().regex(/^v\d+\.\d+$/) }))
    .query(async ({ input }) => {
      return loadLegacyAdvisorySummary(input.version);
    }),
});
