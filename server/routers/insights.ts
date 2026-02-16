import { z } from "zod";

import { router, publicProcedure } from "../_core/trpc";
import { getDashboardStats, getRecentRegulatoryChanges } from "../db";

export const insightsRouter = router({
  /**
   * Get recent regulatory changes
   */
  recentChanges: publicProcedure
    .input(
      z
        .object({
          limit: z.number().default(10),
        })
        .optional()
    )
    .query(async ({ input }) => {
      return await getRecentRegulatoryChanges(input?.limit || 10);
    }),

  /**
   * Get dashboard statistics
   */
  stats: publicProcedure.query(async () => {
    return await getDashboardStats();
  }),
});

