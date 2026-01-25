import { getDb } from "./db";
import {
  complianceScores,
  scoreHistory,
  scoreMilestones,
  supplyChainRisks,
  riskRemediationPlans,
  complianceEvidence,
  regulations,
  regulationEsrsMappings,
} from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Compliance Scoring Engine
 * Calculates real-time compliance metrics based on user activity
 */

export interface ComplianceScoringMetrics {
  overallScore: number;
  riskManagementScore: number;
  remediationScore: number;
  evidenceScore: number;
  regulationScore: number;
  totalRisks: number;
  resolvedRisks: number;
  totalRemediationPlans: number;
  completedPlans: number;
  totalEvidence: number;
  verifiedEvidence: number;
  regulationsCovered: number;
}

/**
 * Calculate risk management score based on risk resolution
 */
async function calculateRiskManagementScore(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const risks = await db
    .select()
    .from(supplyChainRisks)
    .where(eq(supplyChainRisks.userId, userId));

  if (risks.length === 0) return 100; // No risks = perfect score

  const resolvedRisks = risks.filter(r => r.isResolved).length;
  const score = (resolvedRisks / risks.length) * 100;

  return Math.round(score * 100) / 100;
}

/**
 * Calculate remediation score based on plan completion
 */
async function calculateRemediationScore(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const plans = await db
    .select()
    .from(riskRemediationPlans)
    .where(eq(riskRemediationPlans.userId, userId));

  if (plans.length === 0) return 100; // No plans = perfect score

  const completedPlans = plans.filter(p => p.status === "completed").length;
  const score = (completedPlans / plans.length) * 100;

  return Math.round(score * 100) / 100;
}

/**
 * Calculate evidence score based on verification
 */
async function calculateEvidenceScore(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  const evidence = await db
    .select()
    .from(complianceEvidence)
    .where(eq(complianceEvidence.userId, userId));

  if (evidence.length === 0) return 100; // No evidence = perfect score

  const verifiedEvidence = evidence.filter(
    e => e.verificationStatus === "verified"
  ).length;
  const score = (verifiedEvidence / evidence.length) * 100;

  return Math.round(score * 100) / 100;
}

/**
 * Calculate regulation coverage score
 */
async function calculateRegulationScore(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;

  // Get all regulations
  const allRegulations = await db.select().from(regulations);

  if (allRegulations.length === 0) return 100;

  // Get regulations with mappings
  const userMappings = await db.select().from(regulationEsrsMappings);

  const uniqueRegulationIds = new Set(userMappings.map(m => m.regulationId));
  const regulationsCovered = uniqueRegulationIds.size;

  const score = (regulationsCovered / allRegulations.length) * 100;

  return Math.round(score * 100) / 100;
}

/**
 * Calculate overall compliance score (weighted average)
 */
function calculateOverallScore(
  riskScore: number,
  remediationScore: number,
  evidenceScore: number,
  regulationScore: number
): number {
  // Weights: Risk 30%, Remediation 25%, Evidence 25%, Regulation 20%
  const overall =
    riskScore * 0.3 +
    remediationScore * 0.25 +
    evidenceScore * 0.25 +
    regulationScore * 0.2;

  return Math.round(overall * 100) / 100;
}

/**
 * Calculate all compliance metrics for a user
 */
export async function calculateComplianceMetrics(
  userId: number
): Promise<ComplianceScoringMetrics> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Calculate individual scores
  const riskManagementScore = await calculateRiskManagementScore(userId);
  const remediationScore = await calculateRemediationScore(userId);
  const evidenceScore = await calculateEvidenceScore(userId);
  const regulationScore = await calculateRegulationScore(userId);

  // Calculate overall score
  const overallScore = calculateOverallScore(
    riskManagementScore,
    remediationScore,
    evidenceScore,
    regulationScore
  );

  // Get counts
  const risks = await db
    .select()
    .from(supplyChainRisks)
    .where(eq(supplyChainRisks.userId, userId));

  const resolvedRisks = risks.filter(r => r.isResolved).length;

  const plans = await db
    .select()
    .from(riskRemediationPlans)
    .where(eq(riskRemediationPlans.userId, userId));

  const completedPlans = plans.filter(p => p.status === "completed").length;

  const evidence = await db
    .select()
    .from(complianceEvidence)
    .where(eq(complianceEvidence.userId, userId));

  const verifiedEvidence = evidence.filter(
    e => e.verificationStatus === "verified"
  ).length;

  const allRegulations = await db.select().from(regulations);
  const userMappings = await db.select().from(regulationEsrsMappings);

  const uniqueRegulationIds = new Set(userMappings.map(m => m.regulationId));

  return {
    overallScore,
    riskManagementScore,
    remediationScore,
    evidenceScore,
    regulationScore,
    totalRisks: risks.length,
    resolvedRisks,
    totalRemediationPlans: plans.length,
    completedPlans,
    totalEvidence: evidence.length,
    verifiedEvidence,
    regulationsCovered: uniqueRegulationIds.size,
  };
}

/**
 * Update compliance score and record history
 */
export async function updateComplianceScore(
  userId: number,
  changeReason?: string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Calculate new metrics
  const metrics = await calculateComplianceMetrics(userId);

  // Get existing score
  const existingScores = await db
    .select()
    .from(complianceScores)
    .where(eq(complianceScores.userId, userId))
    .limit(1);

  if (existingScores.length === 0) {
    // Create new score record
    await db.insert(complianceScores).values({
      userId,
      overallScore: metrics.overallScore.toString() as any,
      riskManagementScore: metrics.riskManagementScore.toString() as any,
      remediationScore: metrics.remediationScore.toString() as any,
      evidenceScore: metrics.evidenceScore.toString() as any,
      regulationScore: metrics.regulationScore.toString() as any,
      totalRisks: metrics.totalRisks,
      resolvedRisks: metrics.resolvedRisks,
      totalRemediationPlans: metrics.totalRemediationPlans,
      completedPlans: metrics.completedPlans,
      totalEvidence: metrics.totalEvidence,
      verifiedEvidence: metrics.verifiedEvidence,
      regulationsCovered: metrics.regulationsCovered,
    });
  } else {
    // Update existing score
    await db
      .update(complianceScores)
      .set({
        overallScore: metrics.overallScore.toString() as any,
        riskManagementScore: metrics.riskManagementScore.toString() as any,
        remediationScore: metrics.remediationScore.toString() as any,
        evidenceScore: metrics.evidenceScore.toString() as any,
        regulationScore: metrics.regulationScore.toString() as any,
        totalRisks: metrics.totalRisks,
        resolvedRisks: metrics.resolvedRisks,
        totalRemediationPlans: metrics.totalRemediationPlans,
        completedPlans: metrics.completedPlans,
        totalEvidence: metrics.totalEvidence,
        verifiedEvidence: metrics.verifiedEvidence,
        regulationsCovered: metrics.regulationsCovered,
      })
      .where(eq(complianceScores.userId, userId));
  }

  // Record history
  await db.insert(scoreHistory).values({
    userId,
    overallScore: metrics.overallScore.toString() as any,
    riskManagementScore: metrics.riskManagementScore.toString() as any,
    remediationScore: metrics.remediationScore.toString() as any,
    evidenceScore: metrics.evidenceScore.toString() as any,
    regulationScore: metrics.regulationScore.toString() as any,
    changeReason: changeReason || "manual_update",
  });

  // Check for milestones
  await checkAndAwardMilestones(userId, metrics);
}

/**
 * Check and award achievement milestones
 */
async function checkAndAwardMilestones(
  userId: number,
  metrics: ComplianceScoringMetrics
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const existingMilestones = await db
    .select()
    .from(scoreMilestones)
    .where(eq(scoreMilestones.userId, userId));

  const awardedMilestones = new Set(
    existingMilestones.map(m => m.milestoneType)
  );

  // Define milestone thresholds
  const milestonesToCheck = [
    {
      type: "score_25",
      condition: () => metrics.overallScore >= 25,
      title: "Getting Started",
      description: "Achieved 25% compliance score",
      badge: "🚀",
    },
    {
      type: "score_50",
      condition: () => metrics.overallScore >= 50,
      title: "Halfway There",
      description: "Achieved 50% compliance score",
      badge: "⭐",
    },
    {
      type: "score_75",
      condition: () => metrics.overallScore >= 75,
      title: "Compliance Champion",
      description: "Achieved 75% compliance score",
      badge: "🏆",
    },
    {
      type: "score_100",
      condition: () => metrics.overallScore >= 100,
      title: "Perfect Compliance",
      description: "Achieved 100% compliance score",
      badge: "👑",
    },
    {
      type: "all_risks_resolved",
      condition: () =>
        metrics.totalRisks > 0 && metrics.totalRisks === metrics.resolvedRisks,
      title: "Risk Master",
      description: "Resolved all identified risks",
      badge: "🛡️",
    },
    {
      type: "all_evidence_verified",
      condition: () =>
        metrics.totalEvidence > 0 &&
        metrics.totalEvidence === metrics.verifiedEvidence,
      title: "Evidence Expert",
      description: "All evidence verified",
      badge: "✅",
    },
    {
      type: "all_plans_completed",
      condition: () =>
        metrics.totalRemediationPlans > 0 &&
        metrics.totalRemediationPlans === metrics.completedPlans,
      title: "Remediation Master",
      description: "Completed all remediation plans",
      badge: "🎯",
    },
    {
      type: "regulations_covered",
      condition: () => metrics.regulationsCovered >= 10,
      title: "Regulation Expert",
      description: "Covered 10+ regulations",
      badge: "📚",
    },
  ];

  // Award new milestones
  for (const milestone of milestonesToCheck) {
    if (!awardedMilestones.has(milestone.type) && milestone.condition()) {
      await db.insert(scoreMilestones).values({
        userId,
        milestoneType: milestone.type,
        milestoneTitle: milestone.title,
        description: milestone.description,
        badge: milestone.badge,
        achievedAt: new Date().toISOString(),
      });
    }
  }
}

/**
 * Get user's compliance score
 */
export async function getUserComplianceScore(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const scores = await db
    .select()
    .from(complianceScores)
    .where(eq(complianceScores.userId, userId))
    .limit(1);

  return scores[0] || null;
}

/**
 * Get user's score history
 */
export async function getUserScoreHistory(userId: number, days: number = 30) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const history = await db
    .select()
    .from(scoreHistory)
    .where(eq(scoreHistory.userId, userId));

  return history.filter(h => new Date(h.createdAt) >= cutoffDate);
}

/**
 * Get user's milestones
 */
export async function getUserMilestones(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .select()
    .from(scoreMilestones)
    .where(eq(scoreMilestones.userId, userId));
}
