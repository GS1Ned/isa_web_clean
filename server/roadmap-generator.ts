import { getDb } from "./db";
import {
  complianceRoadmaps,
  roadmapActions,
  roadmapMilestones,
  supplyChainRisks,
  riskRemediationPlans,
  complianceEvidence,
  regulations,
} from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Compliance Roadmap Generator
 * Analyzes scoring gaps and generates strategic implementation plans
 */

export interface RoadmapGenerationInput {
  userId: number;
  strategy: "risk_first" | "quick_wins" | "balanced" | "comprehensive";
  currentScore: number;
  targetScore: number;
  timelineWeeks: number;
}

export interface GeneratedRoadmap {
  roadmapId: number;
  title: string;
  strategy: string;
  currentScore: number;
  projectedScore: number;
  estimatedEffort: number;
  estimatedImpact: number;
  startDate: Date;
  targetCompletionDate: Date;
  actions: RoadmapActionItem[];
  milestones: MilestoneItem[];
}

export interface RoadmapActionItem {
  id: number;
  title: string;
  description: string;
  actionType: string;
  priority: string;
  sequenceNumber: number;
  estimatedEffort: number;
  estimatedImpact: number;
  startDate: Date;
  targetDate: Date;
  successCriteria: string;
}

export interface MilestoneItem {
  id: number;
  title: string;
  description?: string;
  targetDate: Date;
  targetScore: number;
}

/**
 * Analyze scoring gaps and generate roadmap
 */
export async function generateComplianceRoadmap(
  input: RoadmapGenerationInput
): Promise<GeneratedRoadmap> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const scoreGap = input.targetScore - input.currentScore;
  const timelineMs = input.timelineWeeks * 7 * 24 * 60 * 60 * 1000;
  const startDate = new Date();
  const targetCompletionDate = new Date(startDate.getTime() + timelineMs);

  // Collect remediation opportunities
  const opportunities = await collectRemediationOpportunities(input.userId);

  // Prioritize and sequence actions based on strategy
  const actions = prioritizeActions(opportunities, input.strategy, scoreGap);

  // Calculate milestones
  const milestones = generateMilestones(
    input.currentScore,
    input.targetScore,
    startDate,
    targetCompletionDate,
    actions.length
  );

  // Calculate total effort and impact
  const totalEffort = actions.reduce((sum, a) => sum + a.estimatedEffort, 0);
  const totalImpact = actions.reduce((sum, a) => sum + a.estimatedImpact, 0);
  const projectedScore = Math.min(100, input.currentScore + totalImpact);

  // Create roadmap record
  const roadmapTitle = generateRoadmapTitle(input.strategy, scoreGap);
  const roadmapRecord = await db.insert(complianceRoadmaps).values({
    userId: input.userId,
    title: roadmapTitle,
    description: `Strategic compliance improvement plan using ${input.strategy} strategy`,
    strategy: input.strategy,
    targetScore: input.targetScore,
    currentScore: input.currentScore.toString() as any,
    projectedScore: projectedScore.toString() as any,
    status: "draft",
    startDate: startDate.toISOString(),
    targetCompletionDate: targetCompletionDate.toISOString(),
    estimatedEffort: totalEffort,
    estimatedImpact: totalImpact.toString() as any,
    progressPercentage: 0,
  });

  const roadmapId = (recordToArray(roadmapRecord)[0] as any).insertId || 1;

  // Create action records
  const actionRecords = [];
  for (let i = 0; i < actions.length; i++) {
    const action = actions[i];
    const actionStartDate = new Date(
      startDate.getTime() + (i * timelineMs) / actions.length
    );
    const actionTargetDate = new Date(
      startDate.getTime() + ((i + 1) * timelineMs) / actions.length
    );

    const result = await db.insert(roadmapActions).values({
      roadmapId: roadmapId as any,
      actionType: action.actionType,
      title: action.title,
      description: action.description,
      priority: action.priority,
      sequenceNumber: i + 1,
      estimatedEffort: action.estimatedEffort,
      estimatedImpact: action.estimatedImpact.toString() as any,
      startDate: actionStartDate.toISOString(),
      targetDate: actionTargetDate.toISOString(),
      status: "pending",
      successCriteria: action.successCriteria,
      relatedRiskId: action.relatedRiskId,
      relatedPlanId: action.relatedPlanId,
    });

    actionRecords.push(result);
  }

  // Create milestone records
  for (const milestone of milestones) {
    await db.insert(roadmapMilestones).values({
      roadmapId: roadmapId as any,
      title: milestone.title,
      description:
        milestone.description ||
        `Achieve ${Math.round(milestone.targetScore)}% compliance score`,
      targetDate: milestone.targetDate.toISOString(),
      targetScore: milestone.targetScore.toString() as any,
      status: "pending",
    });
  }

  return {
    roadmapId: roadmapId as any,
    title: roadmapTitle,
    strategy: input.strategy,
    currentScore: input.currentScore,
    projectedScore,
    estimatedEffort: totalEffort,
    estimatedImpact: totalImpact,
    startDate,
    targetCompletionDate,
    actions: actions.map((a, i) => ({
      ...a,
      sequenceNumber: i + 1,
      startDate: new Date(
        startDate.getTime() + (i * timelineMs) / actions.length
      ),
      targetDate: new Date(
        startDate.getTime() + ((i + 1) * timelineMs) / actions.length
      ),
    })),
    milestones,
  };
}

/**
 * Collect remediation opportunities from current state
 */
async function collectRemediationOpportunities(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const opportunities = [];

  // Unresolved risks
  const risks = await db
    .select()
    .from(supplyChainRisks)
    .where(eq(supplyChainRisks.userId, userId));

  const unresolvedRisks = risks.filter(r => !r.isResolved);
  for (const risk of unresolvedRisks) {
    opportunities.push({
      actionType: "resolve_risk",
      title: `Resolve ${risk.riskType} risk`,
      description: `Address ${risk.riskType} risk in supply chain`,
      priority: risk.severity === "critical" ? "critical" : "high",
      estimatedEffort: 16,
      estimatedImpact: 5,
      successCriteria: "Risk marked as resolved with evidence",
      relatedRiskId: risk.id,
      relatedPlanId: null,
    });
  }

  // Incomplete remediation plans
  const plans = await db
    .select()
    .from(riskRemediationPlans)
    .where(eq(riskRemediationPlans.userId, userId));

  const incompletePlans = plans.filter(p => p.status !== "completed");
  for (const plan of incompletePlans) {
    opportunities.push({
      actionType: "complete_plan",
      title: `Complete remediation plan: ${plan.title}`,
      description: plan.description || "Complete remediation plan",
      priority: "high",
      estimatedEffort: 20,
      estimatedImpact: 4,
      successCriteria: "All steps completed and verified",
      relatedRiskId: null,
      relatedPlanId: plan.id,
    });
  }

  // Unverified evidence
  const evidence = await db
    .select()
    .from(complianceEvidence)
    .where(eq(complianceEvidence.userId, userId));

  const unverifiedEvidence = evidence.filter(
    e => e.verificationStatus !== "verified"
  );
  if (unverifiedEvidence.length > 0) {
    opportunities.push({
      actionType: "verify_evidence",
      title: `Verify ${unverifiedEvidence.length} compliance documents`,
      description: "Submit and verify pending compliance evidence",
      priority: "medium",
      estimatedEffort: 8,
      estimatedImpact: 3,
      successCriteria: "All evidence verified by admin",
      relatedRiskId: null,
      relatedPlanId: null,
    });
  }

  // Regulation coverage gaps
  const allRegulations = await db.select().from(regulations);
  if (allRegulations.length > 0) {
    opportunities.push({
      actionType: "improve_coverage",
      title: `Improve regulation coverage (${allRegulations.length} total)`,
      description: "Map additional regulations and standards",
      priority: "medium",
      estimatedEffort: 12,
      estimatedImpact: 2,
      successCriteria: "Coverage increased to target percentage",
      relatedRiskId: null,
      relatedPlanId: null,
    });
  }

  return opportunities;
}

/**
 * Prioritize and sequence actions based on strategy
 */
function prioritizeActions(
  opportunities: any[],
  strategy: string,
  scoreGap: number
) {
  let actions = [...opportunities];

  switch (strategy) {
    case "risk_first":
      // Sort by severity and impact
      actions.sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        const aPriority =
          priorityOrder[a.priority as keyof typeof priorityOrder] || 3;
        const bPriority =
          priorityOrder[b.priority as keyof typeof priorityOrder] || 3;
        return aPriority - bPriority || b.estimatedImpact - a.estimatedImpact;
      });
      break;

    case "quick_wins":
      // Sort by effort/impact ratio (highest impact, lowest effort first)
      actions.sort((a, b) => {
        const aRatio = a.estimatedImpact / (a.estimatedEffort || 1);
        const bRatio = b.estimatedImpact / (b.estimatedEffort || 1);
        return bRatio - aRatio;
      });
      break;

    case "balanced":
      // Mix of quick wins and critical items
      const critical = actions.filter(a => a.priority === "critical");
      const quickWins = actions
        .filter(a => a.priority !== "critical")
        .sort(
          (a, b) =>
            b.estimatedImpact / (b.estimatedEffort || 1) -
            a.estimatedImpact / (a.estimatedEffort || 1)
        );
      actions = [...critical, ...quickWins];
      break;

    case "comprehensive":
      // All items, sorted by impact
      actions.sort((a, b) => b.estimatedImpact - a.estimatedImpact);
      break;
  }

  // Limit actions to reasonable number
  return actions.slice(0, 12);
}

/**
 * Generate milestone checkpoints
 */
function generateMilestones(
  currentScore: number,
  targetScore: number,
  startDate: Date,
  endDate: Date,
  actionCount: number
): MilestoneItem[] {
  const milestones: MilestoneItem[] = [];
  const scoreIncrement = (targetScore - currentScore) / 4;
  const timeIncrement = (endDate.getTime() - startDate.getTime()) / 4;

  for (let i = 1; i <= 4; i++) {
    const milestoneScore = Math.min(100, currentScore + scoreIncrement * i);
    const targetDate = new Date(startDate.getTime() + timeIncrement * i);

    milestones.push({
      id: i,
      title: `Milestone ${i}: Score ${Math.round(milestoneScore)}%`,
      targetDate,
      targetScore: milestoneScore,
    });
  }

  return milestones;
}

/**
 * Generate descriptive roadmap title
 */
function generateRoadmapTitle(strategy: string, scoreGap: number): string {
  const strategyNames = {
    risk_first: "Risk-First Compliance Roadmap",
    quick_wins: "Quick Wins Compliance Roadmap",
    balanced: "Balanced Compliance Roadmap",
    comprehensive: "Comprehensive Compliance Roadmap",
  };

  return (
    strategyNames[strategy as keyof typeof strategyNames] ||
    "Compliance Roadmap"
  );
}

/**
 * Helper to convert database result to array
 */
function recordToArray(record: any): any[] {
  if (Array.isArray(record)) return record;
  return [record];
}

/**
 * Get roadmap by ID
 */
export async function getRoadmapById(roadmapId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const roadmaps = await db
    .select()
    .from(complianceRoadmaps)
    .where(eq(complianceRoadmaps.id, roadmapId))
    .limit(1);

  if (roadmaps.length === 0) return null;

  const roadmap = roadmaps[0];
  const actions = await db
    .select()
    .from(roadmapActions)
    .where(eq(roadmapActions.roadmapId, roadmapId));

  const milestones = await db
    .select()
    .from(roadmapMilestones)
    .where(eq(roadmapMilestones.roadmapId, roadmapId));

  return {
    ...roadmap,
    currentScore: parseFloat(roadmap.currentScore as any),
    projectedScore: parseFloat(roadmap.projectedScore as any),
    actions,
    milestones,
  };
}

/**
 * Get user's roadmaps
 */
export async function getUserRoadmaps(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const roadmaps = await db
    .select()
    .from(complianceRoadmaps)
    .where(eq(complianceRoadmaps.userId, userId));

  return roadmaps.map(r => ({
    ...r,
    currentScore: parseFloat(r.currentScore as any),
    projectedScore: parseFloat(r.projectedScore as any),
  }));
}

/**
 * Update roadmap status
 */
export async function updateRoadmapStatus(
  roadmapId: number,
  status: string,
  progressPercentage?: number
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updates: any = { status };
  if (progressPercentage !== undefined) {
    updates.progressPercentage = progressPercentage;
  }

  await db
    .update(complianceRoadmaps)
    .set(updates)
    .where(eq(complianceRoadmaps.id, roadmapId));
}
