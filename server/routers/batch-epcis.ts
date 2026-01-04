import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { epcisBatchJobs, supplyChainAnalytics } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { serverLogger } from "../_core/logger-wiring";

import {
  parseEPCISDocument,
  processEPCISEvents,
  detectComplianceRisks,
  updateSupplyChainAnalytics,
} from "../batch-epcis-processor";

/**
 * Batch EPCIS Processing Router
 * Handles file uploads and batch job management
 */

export const batchEpcisRouter = router({
  /**
   * Submit EPCIS file for batch processing
   */
  submitBatch: protectedProcedure
    .input(
      z.object({
        fileName: z.string(),
        fileSize: z.number(),
        fileContent: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      try {
        // Parse EPCIS document
        const document = parseEPCISDocument(input.fileContent);
        if (!document) {
          throw new Error("Invalid EPCIS document format");
        }

        if (!document.epcisBody?.eventList) {
          throw new Error("No events found in EPCIS document");
        }

        const eventCount = document.epcisBody.eventList.length;

        // Create batch job record
        const [batchJob] = await db.insert(epcisBatchJobs).values({
          userId: ctx.user.id,
          fileName: input.fileName,
          fileSize: input.fileSize,
          status: "queued",
          totalEvents: eventCount,
        });

        // Process events asynchronously (in production, use a job queue)
        setImmediate(async () => {
          try {
            // Update status to processing
            await db
              .update(epcisBatchJobs)
              .set({ status: "processing" })
              .where(eq(epcisBatchJobs.id, batchJob.insertId as number));

            // Process all events
            const result = await processEPCISEvents(
              ctx.user.id,
              batchJob.insertId as number,
              document.epcisBody.eventList
            );

            // Detect compliance risks for each event
            for (const event of document.epcisBody.eventList) {
              await detectComplianceRisks(ctx.user.id, 0, event);
            }

            // Update analytics
            await updateSupplyChainAnalytics(ctx.user.id);

            // Update batch job status
            await db
              .update(epcisBatchJobs)
              .set({
                status: "completed",
                completedAt: new Date().toISOString(),
              })
              .where(eq(epcisBatchJobs.id, batchJob.insertId as number));
          } catch (error) {
            serverLogger.error("Batch processing error:", error);
            await db
              .update(epcisBatchJobs)
              .set({
                status: "failed",
                errorMessage: (error as Error).message,
                completedAt: new Date().toISOString(),
              })
              .where(eq(epcisBatchJobs.id, batchJob.insertId as number));
          }
        });

        return {
          jobId: batchJob.insertId,
          status: "queued",
          totalEvents: eventCount,
          message: `Batch job created with ${eventCount} events`,
        };
      } catch (error) {
        throw new Error(`Failed to submit batch: ${(error as Error).message}`);
      }
    }),

  /**
   * Get batch job status
   */
  getJobStatus: protectedProcedure
    .input(z.object({ jobId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const jobs = await db
        .select()
        .from(epcisBatchJobs)
        .where(eq(epcisBatchJobs.id, input.jobId))
        .limit(1);
      const job = jobs[0];

      if (!job) {
        throw new Error("Job not found");
      }

      if (job.userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      return {
        id: job.id,
        fileName: job.fileName,
        status: job.status,
        totalEvents: job.totalEvents,
        processedEvents: job.processedEvents,
        failedEvents: job.failedEvents,
        progress: job.totalEvents
          ? Math.round((job.processedEvents! / job.totalEvents) * 100)
          : 0,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
        errorMessage: job.errorMessage,
      };
    }),

  /**
   * List batch jobs for current user
   */
  listBatches: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const jobs = await db
        .select()
        .from(epcisBatchJobs)
        .where(eq(epcisBatchJobs.userId, ctx.user.id))
        .orderBy(epcisBatchJobs.createdAt)
        .limit(input.limit)
        .offset(input.offset);

      return jobs.map((job: any) => ({
        id: job.id,
        fileName: job.fileName,
        status: job.status,
        totalEvents: job.totalEvents,
        processedEvents: job.processedEvents,
        progress: job.totalEvents
          ? Math.round((job.processedEvents! / job.totalEvents) * 100)
          : 0,
        createdAt: job.createdAt,
        completedAt: job.completedAt,
      }));
    }),

  /**
   * Get supply chain analytics for current user
   */
  getAnalytics: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const analytics = await db
      .select()
      .from(supplyChainAnalytics)
      .where(eq(supplyChainAnalytics.userId, ctx.user.id))
      .orderBy(supplyChainAnalytics.metricDate)
      .limit(1);

    const analyticsRecord = analytics[0];

    if (!analyticsRecord) {
      return {
        totalEvents: 0,
        totalNodes: 0,
        totalEdges: 0,
        highRiskNodes: 0,
        averageTraceabilityScore: 0,
        complianceScore: 0,
      };
    }

    return {
      totalEvents: analyticsRecord.totalEvents,
      totalNodes: analyticsRecord.totalNodes,
      totalEdges: analyticsRecord.totalEdges,
      highRiskNodes: analyticsRecord.highRiskNodes,
      averageTraceabilityScore:
        parseFloat(analyticsRecord.averageTraceabilityScore as any) || 0,
      complianceScore: parseFloat(analyticsRecord.complianceScore as any) || 0,
      lastUpdated: analyticsRecord.lastUpdated,
    };
  }),
});
