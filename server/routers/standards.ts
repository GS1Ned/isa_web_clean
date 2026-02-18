import { router, publicProcedure } from "../_core/trpc";
import { getGS1Standards } from "../db";

export const standardsRouter = router({
  /**
   * Get all GS1 standards
   */
  list: publicProcedure.query(async () => {
    return await getGS1Standards();
  }),
});

