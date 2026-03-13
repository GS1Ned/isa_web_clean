import { publicProcedure, router } from "../_core/trpc";
import { z } from "zod";

export const dutchInitiativesRouter = router({
  /**
   * Get all Dutch initiatives with optional filtering.
   */
  list: publicProcedure
    .input(
      z.object({
        sector: z.string().optional(),
        status: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      const { getDutchInitiatives } = await import("../db");
      return await getDutchInitiatives(input);
    }),

  /**
   * Get a single Dutch initiative with all mappings.
   */
  getWithMappings: publicProcedure
    .input(z.object({ initiativeId: z.number() }))
    .query(async ({ input }) => {
      const { getDutchInitiativeWithMappings } = await import("../db");
      return await getDutchInitiativeWithMappings(input.initiativeId);
    }),

  /**
   * Get unique sectors for filtering.
   */
  getSectors: publicProcedure.query(async () => {
    const { getDutchInitiativeSectors } = await import("../db");
    return await getDutchInitiativeSectors();
  }),
});
