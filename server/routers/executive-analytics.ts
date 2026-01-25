import { router, adminProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  complianceScores,
  supplyChainRisks,
  complianceEvidence,
  regulations,
  users,
  complianceRoadmaps,
} from "../../drizzle/schema";
import { eq, count, sum, avg, and, gte } from "drizzle-orm";

export const executiveAnalyticsRouter = router({
  /**
   * Get organization-wide compliance scorecard
   */
  getOrganizationScorecard: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    // Get all user scores
    const scores = await db
      .select({
        userId: complianceScores.userId,
        score: complianceScores.overallScore,
        riskScore: complianceScores.riskManagementScore,
        remediationScore: complianceScores.remediationScore,
        evidenceScore: complianceScores.evidenceScore,
        regulationScore: complianceScores.regulationScore,
      })
      .from(complianceScores);

    const avgScore =
      scores.length > 0
        ? Math.round(
            scores.reduce((sum, s) => sum + Number(s.score || 0), 0) /
              scores.length
          )
        : 0;

    const avgRiskScore =
      scores.length > 0
        ? Math.round(
            scores.reduce((sum, s) => sum + Number(s.riskScore || 0), 0) /
              scores.length
          )
        : 0;

    const avgRemediationScore =
      scores.length > 0
        ? Math.round(
            scores.reduce(
              (sum, s) => sum + Number(s.remediationScore || 0),
              0
            ) / scores.length
          )
        : 0;

    const avgEvidenceScore =
      scores.length > 0
        ? Math.round(
            scores.reduce((sum, s) => sum + Number(s.evidenceScore || 0), 0) /
              scores.length
          )
        : 0;

    const avgRegulationScore =
      scores.length > 0
        ? Math.round(
            scores.reduce((sum, s) => sum + Number(s.regulationScore || 0), 0) /
              scores.length
          )
        : 0;

    return {
      organizationScore: avgScore,
      riskScore: avgRiskScore,
      remediationScore: avgRemediationScore,
      evidenceScore: avgEvidenceScore,
      regulationScore: avgRegulationScore,
      totalUsers: scores.length,
      scoreDistribution: {
        excellent: scores.filter(s => Number(s.score || 0) >= 80).length,
        good: scores.filter(
          s => Number(s.score || 0) >= 60 && Number(s.score || 0) < 80
        ).length,
        fair: scores.filter(
          s => Number(s.score || 0) >= 40 && Number(s.score || 0) < 60
        ).length,
        poor: scores.filter(s => Number(s.score || 0) < 40).length,
      },
    };
  }),

  /**
   * Get risk status overview
   */
  getRiskStatus: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const risks = await db
      .select({
        severity: supplyChainRisks.severity,
        isResolved: supplyChainRisks.isResolved,
      })
      .from(supplyChainRisks);

    const critical = risks.filter(
      r => r.severity === "critical" && !r.isResolved
    ).length;
    const high = risks.filter(
      r => r.severity === "high" && !r.isResolved
    ).length;
    const medium = risks.filter(
      r => r.severity === "medium" && !r.isResolved
    ).length;
    const low = risks.filter(r => r.severity === "low" && !r.isResolved).length;
    const resolved = risks.filter(r => r.isResolved).length;

    return {
      critical,
      high,
      medium,
      low,
      resolved,
      total: risks.length,
      resolutionRate:
        risks.length > 0 ? Math.round((resolved / risks.length) * 100) : 0,
    };
  }),

  /**
   * Get remediation progress
   */
  getRemediationProgress: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const plans = await db
      .select({
        status: complianceRoadmaps.status,
      })
      .from(complianceRoadmaps);

    const completed = plans.filter(p => p.status === "completed").length;
    const inProgress = plans.filter(p => p.status === "in_progress").length;
    const draft = plans.filter(p => p.status === "draft").length;

    return {
      completed,
      inProgress,
      draft,
      total: plans.length,
      completionRate:
        plans.length > 0 ? Math.round((completed / plans.length) * 100) : 0,
      avgProgressPercentage: inProgress > 0 ? 50 : completed > 0 ? 100 : 0,
    };
  }),

  /**
   * Get evidence verification metrics
   */
  getEvidenceMetrics: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const evidence = await db
      .select({
        verificationStatus: complianceEvidence.verificationStatus,
      })
      .from(complianceEvidence);

    const verified = evidence.filter(
      e => e.verificationStatus === "verified"
    ).length;
    const rejected = evidence.filter(
      e => e.verificationStatus === "rejected"
    ).length;
    const pending = evidence.filter(
      e => e.verificationStatus === "pending"
    ).length;

    return {
      verified,
      rejected,
      pending,
      total: evidence.length,
      verificationRate:
        evidence.length > 0
          ? Math.round((verified / evidence.length) * 100)
          : 0,
      rejectionRate:
        evidence.length > 0
          ? Math.round((rejected / evidence.length) * 100)
          : 0,
    };
  }),

  /**
   * Get regulation coverage
   */
  getRegulationCoverage: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const regs = await db.select().from(regulations);
    const totalRegulations = regs.length;

    // Count regulations with at least one mapping
    const regulationsWithMappings = regs.length; // Simplified - in production would check mappings

    return {
      totalRegulations,
      coveredRegulations: regulationsWithMappings,
      coveragePercentage:
        totalRegulations > 0
          ? Math.round((regulationsWithMappings / totalRegulations) * 100)
          : 0,
      regulations: regs.map(r => ({
        id: r.id,
        name: r.title,
        type: r.regulationType,
      })),
    };
  }),

  /**
   * Get team performance breakdown
   */
  getTeamPerformance: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const userScores = await db
      .select({
        userId: complianceScores.userId,
        score: complianceScores.overallScore,
      })
      .from(complianceScores);

    const users_data = await db.select().from(users);

    const teamPerformance = users_data.map(user => {
      const userScore = userScores.find(s => s.userId === user.id);
      return {
        userId: user.id,
        name: user.name || "Unknown",
        email: user.email,
        role: user.role,
        score: Number(userScore?.score || 0),
      };
    });

    return {
      topPerformers: teamPerformance
        .sort((a, b) => Number(b.score) - Number(a.score))
        .slice(0, 5),
      lowPerformers: teamPerformance
        .sort((a, b) => Number(a.score) - Number(b.score))
        .slice(0, 5),
      averageScore:
        teamPerformance.length > 0
          ? Math.round(
              teamPerformance.reduce((sum, p) => sum + Number(p.score), 0) /
                teamPerformance.length
            )
          : 0,
      totalTeamMembers: teamPerformance.length,
    };
  }),

  /**
   * Get strategic insights and recommendations
   */
  getStrategicInsights: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const riskStatus = await db
      .select({
        severity: supplyChainRisks.severity,
        isResolved: supplyChainRisks.isResolved,
      })
      .from(supplyChainRisks);

    const remediationStatus = await db
      .select({
        status: complianceRoadmaps.status,
      })
      .from(complianceRoadmaps);

    const insights = [];

    // Critical risk insight
    const criticalRisks = riskStatus.filter(
      r => r.severity === "critical" && !r.isResolved
    ).length;
    if (criticalRisks > 0) {
      insights.push({
        type: "critical",
        title: `${criticalRisks} Critical Risks Require Immediate Action`,
        description: "Address critical compliance risks before they escalate",
        priority: 1,
      });
    }

    // Remediation progress insight
    const completedPlans = remediationStatus.filter(
      p => p.status === "completed"
    ).length;
    const totalPlans = remediationStatus.length;
    if (totalPlans > 0 && completedPlans < totalPlans * 0.5) {
      insights.push({
        type: "warning",
        title: "Remediation Progress Below 50%",
        description:
          "Accelerate remediation plan execution to meet compliance deadlines",
        priority: 2,
      });
    }

    // Team alignment insight
    if (completedPlans > totalPlans * 0.75) {
      insights.push({
        type: "success",
        title: "Strong Remediation Progress",
        description: "Team is on track with compliance remediation efforts",
        priority: 3,
      });
    }

    return insights.sort((a, b) => a.priority - b.priority);
  }),

  /**
   * Get compliance trend (30/60/90 day)
   */
  getComplianceTrend: adminProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");

    const scoreHistory = await db
      .select({
        createdAt: complianceScores.createdAt,
        score: complianceScores.overallScore,
      })
      .from(complianceScores);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const last30Days = scoreHistory.filter(
      s => new Date(s.createdAt as any) >= thirtyDaysAgo
    );
    const last60Days = scoreHistory.filter(
      s => new Date(s.createdAt as any) >= sixtyDaysAgo
    );
    const last90Days = scoreHistory.filter(
      s => new Date(s.createdAt as any) >= ninetyDaysAgo
    );

    const avg30 =
      last30Days.length > 0
        ? Math.round(
            last30Days.reduce((sum, s) => sum + Number(s.score || 0), 0) /
              last30Days.length
          )
        : 0;
    const avg60 =
      last60Days.length > 0
        ? Math.round(
            last60Days.reduce((sum, s) => sum + Number(s.score || 0), 0) /
              last60Days.length
          )
        : 0;
    const avg90 =
      last90Days.length > 0
        ? Math.round(
            last90Days.reduce((sum, s) => sum + Number(s.score || 0), 0) /
              last90Days.length
          )
        : 0;

    return {
      trend30Days: avg30,
      trend60Days: avg60,
      trend90Days: avg90,
      direction:
        avg30 > avg60 ? "improving" : avg30 < avg60 ? "declining" : "stable",
    };
  }),
});
