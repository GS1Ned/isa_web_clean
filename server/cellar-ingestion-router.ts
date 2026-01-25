/**
 * CELLAR Ingestion tRPC Router
 *
 * Provides admin procedures for managing automated regulation ingestion from CELLAR.
 */

import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { cellarConnector } from "./cellar-connector";
import {
  normalizeEULegalActsBatch,
  deduplicateRegulations,
  validateRegulation,
  calculateRegulationStats,
  mergeRegulationData,
} from "./cellar-normalizer";
import { getDb } from "./db";
import { regulations, ingestionLogs } from "../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { notifyOwner } from "./_core/notification";
import { serverLogger } from "./_core/logger-wiring";


/**
 * Admin-only procedure (requires admin role)
 */
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({ ctx });
});

/**
 * Log ingestion operation to database
 */
async function logIngestion(
  status: "success" | "failed",
  inserted: number,
  updated: number,
  total: number,
  errors: number,
  errorDetails?: string,
  durationSeconds?: number
) {
  const db = await getDb();
  if (!db) return;

  const startTime = new Date(
    Date.now() - (durationSeconds ? durationSeconds * 1000 : 0)
  );

  await db.insert(ingestionLogs).values({
    syncStartTime: startTime.toISOString(),
    syncEndTime: new Date().toISOString(),
    status,
    regulationsInserted: inserted,
    regulationsUpdated: updated,
    regulationsTotal: total,
    errors,
    errorDetails,
    durationSeconds,
  });
}

export const cellarIngestionRouter = router({
  /**
   * Test CELLAR connection
   */
  testConnection: adminProcedure.query(async () => {
    const isConnected = await cellarConnector.testConnection();
    return {
      success: isConnected,
      endpoint: "https://publications.europa.eu/webapi/rdf/sparql",
    };
  }),

  /**
   * Get sync history (ingestion logs)
   */
  getSyncHistory: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const logs = await db
      .select()
      .from(ingestionLogs)
      .orderBy(desc(ingestionLogs.syncStartTime))
      .limit(50);

    return {
      logs,
      totalSyncs: logs.length,
      lastSync: logs[0] || null,
      successCount: logs.filter(l => l.status === "success").length,
      failureCount: logs.filter(l => l.status === "failed").length,
    };
  }),

  /**
   * Get latest sync status
   */
  getLatestSyncStatus: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const [latest] = await db
      .select()
      .from(ingestionLogs)
      .orderBy(desc(ingestionLogs.syncStartTime))
      .limit(1);

    return latest || null;
  }),

  /**
   * Fetch ESG regulations from CELLAR (preview only, no database write)
   */
  previewRegulations: adminProcedure
    .input(
      z.object({
        yearsBack: z.number().min(1).max(10).default(5),
        limit: z.number().min(1).max(500).default(100),
      })
    )
    .query(async ({ input }) => {
      // Fetch from CELLAR
      const acts = await cellarConnector.getESGRegulations(input.yearsBack);

      // Normalize
      let normalized = normalizeEULegalActsBatch(acts);
      normalized = deduplicateRegulations(normalized);

      // Validate
      const valid = normalized.filter(validateRegulation);

      // Calculate stats
      const stats = calculateRegulationStats(valid);

      // Limit results for preview
      const preview = valid.slice(0, input.limit);

      return {
        stats,
        preview,
        total: valid.length,
      };
    }),

  /**
   * Run manual ingestion (fetch and store regulations)
   */
  runIngestion: adminProcedure
    .input(
      z.object({
        yearsBack: z.number().min(1).max(10).default(5),
        dryRun: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const startTime = Date.now();

      try {
        // Fetch from CELLAR
        const acts = await cellarConnector.getESGRegulations(input.yearsBack);

        // Normalize
        let normalized = normalizeEULegalActsBatch(acts);
        normalized = deduplicateRegulations(normalized);

        // Validate
        const valid = normalized.filter(validateRegulation);

        // Calculate stats
        const stats = calculateRegulationStats(valid);

        if (input.dryRun) {
          return {
            dryRun: true,
            stats,
            total: valid.length,
            inserted: 0,
            updated: 0,
            errors: 0,
            duration: Date.now() - startTime,
          };
        }

        // Process each regulation
        const db = await getDb();
        if (!db) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Database connection not available",
          });
        }

        let inserted = 0;
        let updated = 0;
        let errors = 0;

        for (const regulation of valid) {
          try {
            // Check if exists
            const existing = await db
              .select()
              .from(regulations)
              .where(eq(regulations.celexId, regulation.celexId!))
              .limit(1);

            if (existing.length > 0) {
              // Merge and update
              const merged = mergeRegulationData(existing[0], regulation);
              await db
                .update(regulations)
                .set(merged)
                .where(eq(regulations.celexId, regulation.celexId!));
              updated++;
            } else {
              // Insert new
              await db.insert(regulations).values(regulation);
              inserted++;
            }
          } catch (error) {
            errors++;
            serverLogger.error(`Failed to process ${regulation.celexId}:`, error);
          }
        }

        const durationSeconds = Math.round((Date.now() - startTime) / 1000);

        // Log the ingestion operation
        await logIngestion(
          "success",
          inserted,
          updated,
          valid.length,
          errors,
          errors > 0 ? `${errors} regulations failed to process` : undefined,
          durationSeconds
        );

        // Notify owner if significant new regulations detected
        if (inserted > 5) {
          await notifyOwner({
            title: `🔔 CELLAR Sync: ${inserted} New Regulations Detected`,
            content: `The automated CELLAR sync has successfully imported ${inserted} new EU regulations into ISA.\n\nSync Summary:\n- New regulations: ${inserted}\n- Updated regulations: ${updated}\n- Total processed: ${valid.length}\n- Duration: ${durationSeconds}s\n\nView details in Admin → CELLAR Sync Monitor.`,
          });
        }

        return {
          dryRun: false,
          stats,
          total: valid.length,
          inserted,
          updated,
          errors,
          duration: Date.now() - startTime,
        };
      } catch (error) {
        // Log the failed ingestion
        const durationSeconds = Math.round((Date.now() - startTime) / 1000);
        await logIngestion(
          "failed",
          0,
          0,
          0,
          1,
          error instanceof Error ? error.message : "Unknown error",
          durationSeconds
        );

        // Notify owner of sync failure
        await notifyOwner({
          title: `⚠️ CELLAR Sync Failed`,
          content: `The automated CELLAR sync has failed.\n\nError Details:\n${error instanceof Error ? error.message : "Unknown error"}\n\nDuration: ${durationSeconds}s\n\nPlease check Admin → CELLAR Sync Monitor for details and retry manually if needed.`,
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Ingestion failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        });
      }
    }),

  /**
   * Get ingestion history/logs
   */
  getIngestionHistory: adminProcedure.query(async () => {
    // TODO: Implement ingestion log table
    // For now, return placeholder
    return {
      runs: [],
      lastRun: null,
    };
  }),

  /**
   * Search CELLAR by keyword
   */
  searchCellar: adminProcedure
    .input(
      z.object({
        keyword: z.string().min(1),
        limit: z.number().min(1).max(100).default(20),
      })
    )
    .query(async ({ input }) => {
      const acts = await cellarConnector.searchActsByKeyword(
        input.keyword,
        input.limit
      );
      const normalized = normalizeEULegalActsBatch(acts);
      return {
        results: normalized,
        total: normalized.length,
      };
    }),

  /**
   * Get regulation by CELEX ID from CELLAR
   */
  getRegulationByCelex: adminProcedure
    .input(
      z.object({
        celexId: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const act = await cellarConnector.getActByCelex(input.celexId);
      if (!act) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Regulation with CELEX ID ${input.celexId} not found`,
        });
      }

      const normalized = normalizeEULegalActsBatch([act]);
      return normalized.length > 0 ? normalized[0] : null;
    }),
});
