import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";

export const esrsRouter = router({
  /**
   * Get all ESRS datapoints with pagination and filtering
   */
  list: publicProcedure
    .input(
      z
        .object({
          page: z.number().default(1),
          pageSize: z.number().default(50),
          search: z.string().optional(),
          standard: z.string().optional(), // e.g., "ESRS E1", "ESRS S1"
          data_type: z.string().optional(), // e.g., "narrative", "quantitative"
          voluntary: z.boolean().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return { datapoints: [], total: 0, page: 1, pageSize: 50 };

      const { esrsDatapoints } = await import("../../drizzle_pg/schema");
      const { like, and, eq, sql } = await import("drizzle-orm");

      const page = input?.page || 1;
      const pageSize = input?.pageSize || 50;
      const offset = (page - 1) * pageSize;

      // Build filter conditions
      const conditions = [];
      if (input?.search) {
        conditions.push(
          sql`(
              ${esrsDatapoints.code} LIKE ${`%${input.search}%`} OR
              ${esrsDatapoints.name} LIKE ${`%${input.search}%`} OR
              ${esrsDatapoints.disclosureRequirement} LIKE ${`%${input.search}%`}
            )`
        );
      }
      if (input?.standard) {
        conditions.push(eq(esrsDatapoints.esrsStandard, input.standard));
      }
      if (input?.data_type) {
        conditions.push(like(esrsDatapoints.dataType, `%${input.data_type}%`));
      }
      if (input?.voluntary !== undefined) {
        conditions.push(eq(esrsDatapoints.voluntary, input.voluntary ? 1 : 0));
      }

      // Get total count
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(esrsDatapoints)
        .where(conditions.length > 0 ? and(...conditions) : undefined);
      const total = Number(countResult[0]?.count || 0);

      // Get paginated results
      const datapoints = await db
        .select()
        .from(esrsDatapoints)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .limit(pageSize)
        .offset(offset);

      return {
        datapoints,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }),

  /**
   * Get unique ESRS standards for filter dropdown
   */
  getStandards: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    const { esrsDatapoints } = await import("../../drizzle_pg/schema");

    const standards = await db
      .select({ standard: esrsDatapoints.esrsStandard })
      .from(esrsDatapoints)
      .groupBy(esrsDatapoints.esrsStandard)
      .orderBy(esrsDatapoints.esrsStandard);

    return standards.map(s => s.standard).filter(Boolean);
  }),

  /**
   * Get statistics about ESRS datapoints
   */
  getStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { total: 0, byStandard: {}, byDataType: {} };

    const { esrsDatapoints } = await import("../../drizzle_pg/schema");
    const { sql } = await import("drizzle-orm");

    // Total count
    const totalResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(esrsDatapoints);
    const total = Number(totalResult[0]?.count || 0);

    // Count by standard
    const byStandardResult = await db
      .select({
        standard: esrsDatapoints.esrsStandard,
        count: sql<number>`count(*)`,
      })
      .from(esrsDatapoints)
      .groupBy(esrsDatapoints.esrsStandard);

    const byStandard = Object.fromEntries(
      byStandardResult.map(r => [r.standard, Number(r.count)])
    );

    // Count by data type
    const byDataTypeResult = await db
      .select({
        data_type: esrsDatapoints.dataType,
        count: sql<number>`count(*)`,
      })
      .from(esrsDatapoints)
      .groupBy(esrsDatapoints.dataType);

    const byDataType = Object.fromEntries(
      byDataTypeResult.map(r => [r.data_type || "unknown", Number(r.count)])
    );

    return { total, byStandard, byDataType };
  }),
});
