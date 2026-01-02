import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import {
  supplyChainRisks,
  epcisEvents,
  supplyChainNodes,
} from "../../drizzle/schema";
import { eq, and, desc, SQL } from "drizzle-orm";

/**
 * Compliance Risk Detection Router
 * Identifies and manages compliance risks in supply chain events
 */

export const complianceRisksRouter = router({
  /**
   * Get all risks for current user
   */
  listRisks: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        offset: z.number().default(0),
        severity: z.enum(["low", "medium", "high", "critical"]).optional(),
        resolved: z.boolean().optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const conditions: SQL[] = [eq(supplyChainRisks.userId, ctx.user.id)];

      if (input.severity) {
        conditions.push(eq(supplyChainRisks.severity, input.severity as any));
      }

      if (input.resolved !== undefined) {
        conditions.push(eq(supplyChainRisks.isResolved, input.resolved ? 1 : 0));
      }

      const risks = await db
        .select()
        .from(supplyChainRisks)
        .where(conditions.length > 1 ? and(...conditions) : conditions[0])
        .orderBy(desc(supplyChainRisks.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      return risks.map(risk => ({
        id: risk.id,
        riskType: risk.riskType,
        severity: risk.severity,
        description: risk.description,
        recommendedAction: risk.recommendedAction,
        isResolved: risk.isResolved,
        createdAt: risk.createdAt,
        resolvedAt: risk.resolvedAt,
      }));
    }),

  /**
   * Get risk statistics
   */
  getRiskStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const allRisks = await db
      .select()
      .from(supplyChainRisks)
      .where(eq(supplyChainRisks.userId, ctx.user.id));

    const criticalRisks = allRisks.filter(
      r => r.severity === "critical"
    ).length;
    const highRisks = allRisks.filter(r => r.severity === "high").length;
    const mediumRisks = allRisks.filter(r => r.severity === "medium").length;
    const lowRisks = allRisks.filter(r => r.severity === "low").length;
    const unresolvedRisks = allRisks.filter(r => !r.isResolved).length;

    // Risk types breakdown
    const riskTypeBreakdown: Record<string, number> = {};
    allRisks.forEach(risk => {
      riskTypeBreakdown[risk.riskType] =
        (riskTypeBreakdown[risk.riskType] || 0) + 1;
    });

    return {
      total: allRisks.length,
      critical: criticalRisks,
      high: highRisks,
      medium: mediumRisks,
      low: lowRisks,
      unresolved: unresolvedRisks,
      riskTypeBreakdown,
    };
  }),

  /**
   * Resolve a risk
   */
  resolveRisk: protectedProcedure
    .input(
      z.object({
        riskId: z.number(),
        resolutionNotes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify ownership
      const risk = await db
        .select()
        .from(supplyChainRisks)
        .where(eq(supplyChainRisks.id, input.riskId))
        .limit(1);

      if (!risk[0] || risk[0].userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      await db
        .update(supplyChainRisks)
        .set({
          isResolved: 1,
          resolvedAt: new Date().toISOString(),
        })
        .where(eq(supplyChainRisks.id, input.riskId));

      return { success: true };
    }),

  /**
   * Get risks by type
   */
  getRisksByType: protectedProcedure
    .input(z.object({ riskType: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const risks = await db
        .select()
        .from(supplyChainRisks)
        .where(
          and(
            eq(supplyChainRisks.userId, ctx.user.id),
            eq(supplyChainRisks.riskType, input.riskType as any)
          )
        )
        .orderBy(desc(supplyChainRisks.severity));

      return risks.map(risk => ({
        id: risk.id,
        severity: risk.severity,
        description: risk.description,
        recommendedAction: risk.recommendedAction,
        isResolved: risk.isResolved,
        createdAt: risk.createdAt,
      }));
    }),

  /**
   * Get critical risks requiring immediate action
   */
  getCriticalRisks: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const risks = await db
      .select()
      .from(supplyChainRisks)
      .where(
        and(
          eq(supplyChainRisks.userId, ctx.user.id),
          eq(supplyChainRisks.severity, "critical" as any),
          eq(supplyChainRisks.isResolved, 0)
        )
      )
      .orderBy(desc(supplyChainRisks.createdAt))
      .limit(10);

    return risks.map(risk => ({
      id: risk.id,
      riskType: risk.riskType,
      description: risk.description,
      recommendedAction: risk.recommendedAction,
      createdAt: risk.createdAt,
    }));
  }),

  /**
   * Get risks associated with a specific node
   */
  getNodeRisks: protectedProcedure
    .input(z.object({ nodeId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Verify node ownership
      const node = await db
        .select()
        .from(supplyChainNodes)
        .where(eq(supplyChainNodes.id, input.nodeId))
        .limit(1);

      if (!node[0] || node[0].userId !== ctx.user.id) {
        throw new Error("Unauthorized");
      }

      const risks = await db
        .select()
        .from(supplyChainRisks)
        .where(eq(supplyChainRisks.nodeId, input.nodeId))
        .orderBy(desc(supplyChainRisks.severity));

      return risks.map(risk => ({
        id: risk.id,
        riskType: risk.riskType,
        severity: risk.severity,
        description: risk.description,
        recommendedAction: risk.recommendedAction,
        isResolved: risk.isResolved,
      }));
    }),

  /**
   * Get risk trends over time
   */
  getRiskTrends: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const risks = await db
      .select()
      .from(supplyChainRisks)
      .where(eq(supplyChainRisks.userId, ctx.user.id))
      .orderBy(supplyChainRisks.createdAt);

    // Group by date
    const trendsByDate: Record<
      string,
      { critical: number; high: number; medium: number; low: number }
    > = {};

    risks.forEach(risk => {
      const date = new Date(risk.createdAt).toISOString().split("T")[0];
      if (!trendsByDate[date]) {
        trendsByDate[date] = { critical: 0, high: 0, medium: 0, low: 0 };
      }
      trendsByDate[date][
        risk.severity as keyof (typeof trendsByDate)[string]
      ]++;
    });

    return Object.entries(trendsByDate).map(([date, counts]) => ({
      date,
      ...counts,
    }));
  }),

  /**
   * Generate compliance report
   */
  generateComplianceReport: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const risks = await db
      .select()
      .from(supplyChainRisks)
      .where(eq(supplyChainRisks.userId, ctx.user.id));

    const events = await db
      .select()
      .from(epcisEvents)
      .where(eq(epcisEvents.userId, ctx.user.id));

    const nodes = await db
      .select()
      .from(supplyChainNodes)
      .where(eq(supplyChainNodes.userId, ctx.user.id));

    const unresolvedRisks = risks.filter(r => !r.isResolved);
    const riskScore =
      risks.length > 0
        ? Math.round(
            ((risks.length - unresolvedRisks.length) / risks.length) * 100
          )
        : 100;

    return {
      reportDate: new Date().toISOString(),
      summary: {
        totalEvents: events.length,
        totalNodes: nodes.length,
        totalRisks: risks.length,
        unresolvedRisks: unresolvedRisks.length,
        riskScore,
      },
      riskBreakdown: {
        critical: risks.filter(r => r.severity === "critical").length,
        high: risks.filter(r => r.severity === "high").length,
        medium: risks.filter(r => r.severity === "medium").length,
        low: risks.filter(r => r.severity === "low").length,
      },
      topRisks: unresolvedRisks
        .sort((a, b) => {
          const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return (
            severityOrder[a.severity as keyof typeof severityOrder] -
            severityOrder[b.severity as keyof typeof severityOrder]
          );
        })
        .slice(0, 5)
        .map(r => ({
          type: r.riskType,
          severity: r.severity,
          description: r.description,
          action: r.recommendedAction,
        })),
      recommendations: generateRecommendations(risks, unresolvedRisks),
    };
  }),
});

/**
 * Generate actionable recommendations based on risks
 */
function generateRecommendations(
  allRisks: any[],
  unresolvedRisks: any[]
): string[] {
  const recommendations: string[] = [];

  const criticalCount = unresolvedRisks.filter(
    r => r.severity === "critical"
  ).length;
  const highCount = unresolvedRisks.filter(r => r.severity === "high").length;

  if (criticalCount > 0) {
    recommendations.push(
      `URGENT: Address ${criticalCount} critical risk(s) immediately to maintain compliance.`
    );
  }

  if (highCount > 0) {
    recommendations.push(
      `Prioritize resolving ${highCount} high-severity risk(s) within the next 30 days.`
    );
  }

  const deforestationRisks = unresolvedRisks.filter(
    r => r.riskType === "deforestation"
  );
  if (deforestationRisks.length > 0) {
    recommendations.push(
      "Verify geolocation data and certifications for all suppliers to ensure EUDR compliance."
    );
  }

  const traceabilityRisks = unresolvedRisks.filter(
    r => r.riskType === "traceability"
  );
  if (traceabilityRisks.length > 0) {
    recommendations.push(
      "Ensure all EPCIS events include complete EPC identifiers for full supply chain visibility."
    );
  }

  const certificationRisks = unresolvedRisks.filter(
    r => r.riskType === "certification"
  );
  if (certificationRisks.length > 0) {
    recommendations.push(
      "Update supplier certifications and conduct compliance audits for all tier-1 suppliers."
    );
  }

  if (unresolvedRisks.length === 0) {
    recommendations.push(
      "Excellent! Your supply chain is in full compliance. Continue monitoring for new risks."
    );
  }

  return recommendations;
}
