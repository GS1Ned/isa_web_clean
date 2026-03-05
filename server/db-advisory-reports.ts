import { getDb } from "./db";
import {
  advisoryReports,
  advisoryReportVersions,
  advisoryReportTargetRegulations,
  advisoryReportTargetStandards,
} from "../drizzle/schema";
import { eq, and, desc, sql, inArray, isNotNull } from "drizzle-orm";

function normalizeIdArray(input: unknown): number[] | undefined {
  if (!Array.isArray(input)) return undefined;
  const values = input
    .map((value) => (typeof value === "number" ? value : Number(value)))
    .filter((value) => Number.isInteger(value) && value > 0);
  return Array.from(new Set(values));
}

async function syncAdvisoryReportTargets(
  db: any,
  reportId: number,
  targetRegulationIds: unknown,
  targetStandardIds: unknown
) {
  const regulationIds = normalizeIdArray(targetRegulationIds);
  const standardIds = normalizeIdArray(targetStandardIds);

  if (regulationIds !== undefined) {
    await db
      .delete(advisoryReportTargetRegulations)
      .where(eq(advisoryReportTargetRegulations.reportId, reportId));

    if (regulationIds.length > 0) {
      await db.insert(advisoryReportTargetRegulations).values(
        regulationIds.map((regulationId) => ({
          reportId,
          regulationId,
        }))
      );
    }
  }

  if (standardIds !== undefined) {
    await db
      .delete(advisoryReportTargetStandards)
      .where(eq(advisoryReportTargetStandards.reportId, reportId));

    if (standardIds.length > 0) {
      await db.insert(advisoryReportTargetStandards).values(
        standardIds.map((standardId) => ({
          reportId,
          standardId,
        }))
      );
    }
  }
}

/**
 * Get all advisory reports with optional filtering
 */
export async function getAdvisoryReports(filters?: {
  reportType?: string;
  reviewStatus?: string;
  publicationStatus?: string;
  laneStatus?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let query = db.select().from(advisoryReports);

  const conditions = [];
  
  if (filters?.reportType) {
    conditions.push(eq(advisoryReports.reportType, filters.reportType as any));
  }
  
  if (filters?.reviewStatus) {
    conditions.push(eq(advisoryReports.reviewStatus, filters.reviewStatus as any));
  }
  
  if (filters?.publicationStatus) {
    conditions.push(eq(advisoryReports.publicationStatus, filters.publicationStatus as any));
  }
  
  if (filters?.laneStatus) {
    conditions.push(eq(advisoryReports.laneStatus, filters.laneStatus as any));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const results = await query.orderBy(desc(advisoryReports.generatedDate));
  return results;
}

/**
 * Get a single advisory report by ID
 */
export async function getAdvisoryReportById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const results = await db
    .select()
    .from(advisoryReports)
    .where(eq(advisoryReports.id, id))
    .limit(1);
  
  return results[0] || null;
}

/**
 * Get the latest advisory report by generated date.
 */
export async function getLatestAdvisoryReport() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const results = await db
    .select()
    .from(advisoryReports)
    .orderBy(desc(advisoryReports.generatedDate))
    .limit(1);

  return results[0] || null;
}

/**
 * Create a new advisory report
 */
export async function createAdvisoryReport(data: typeof advisoryReports.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const insertResult = await db.insert(advisoryReports).values(data);
  const normalizedResult = Array.isArray(insertResult)
    ? insertResult[0]
    : insertResult;
  const insertId = Number(
    (normalizedResult as any)?.insertId
  );

  if (Number.isInteger(insertId) && insertId > 0) {
    await syncAdvisoryReportTargets(
      db,
      insertId,
      data.targetRegulationIds,
      data.targetStandardIds
    );
  }

  return normalizedResult;
}

/**
 * Update advisory report
 */
export async function updateAdvisoryReport(
  id: number,
  updates: Partial<typeof advisoryReports.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .update(advisoryReports)
    .set({
      ...updates,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(advisoryReports.id, id));

  if (
    updates.targetRegulationIds !== undefined ||
    updates.targetStandardIds !== undefined
  ) {
    await syncAdvisoryReportTargets(
      db,
      id,
      updates.targetRegulationIds,
      updates.targetStandardIds
    );
  }
  
  return result;
}

/**
 * Update report review status (Decision 4: publication deferred)
 */
export async function updateReportReviewStatus(
  id: number,
  reviewStatus: string,
  reviewedBy: string,
  reviewNotes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .update(advisoryReports)
    .set({
      reviewStatus: reviewStatus as any,
      reviewedBy,
      reviewedAt: new Date().toISOString(),
      reviewNotes,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(advisoryReports.id, id));
  
  return result;
}

/**
 * Increment view count
 */
export async function incrementReportViewCount(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .update(advisoryReports)
    .set({
      viewCount: sql`${advisoryReports.viewCount} + 1`,
      lastAccessedAt: new Date().toISOString(),
    })
    .where(eq(advisoryReports.id, id));
  
  return result;
}

/**
 * Get report versions
 */
export async function getReportVersions(reportId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const results = await db
    .select()
    .from(advisoryReportVersions)
    .where(eq(advisoryReportVersions.reportId, reportId))
    .orderBy(desc(advisoryReportVersions.createdAt));
  
  return results;
}

/**
 * Create report version
 */
export async function createReportVersion(data: typeof advisoryReportVersions.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(advisoryReportVersions).values(data);
  return result;
}

/**
 * Get advisory report statistics
 */
export async function getAdvisoryReportStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const totalCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(advisoryReports);
  
  const byReviewStatus = await db
    .select({
      status: advisoryReports.reviewStatus,
      count: sql<number>`count(*)`,
    })
    .from(advisoryReports)
    .groupBy(advisoryReports.reviewStatus);
  
  const byPublicationStatus = await db
    .select({
      status: advisoryReports.publicationStatus,
      count: sql<number>`count(*)`,
    })
    .from(advisoryReports)
    .groupBy(advisoryReports.publicationStatus);

  const staleCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(advisoryReports)
    .where(isNotNull(advisoryReports.staleSince));
  
  return {
    total: totalCount[0]?.count || 0,
    byReviewStatus,
    byPublicationStatus,
    stale: {
      count: staleCount[0]?.count || 0,
    },
  };
}

/**
 * Get reports by regulation IDs
 */
export async function getReportsByRegulationIds(regulationIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (regulationIds.length === 0) return [];

  const normalizedIds = normalizeIdArray(regulationIds) ?? [];
  if (normalizedIds.length === 0) return [];

  const joined = await db
    .select({ report: advisoryReports })
    .from(advisoryReportTargetRegulations)
    .innerJoin(
      advisoryReports,
      eq(advisoryReportTargetRegulations.reportId, advisoryReports.id)
    )
    .where(inArray(advisoryReportTargetRegulations.regulationId, normalizedIds))
    .orderBy(desc(advisoryReports.generatedDate));

  const deduped = Array.from(
    new Map(joined.map((row: any) => [row.report.id, row.report])).values()
  );
  if (deduped.length > 0) return deduped;

  // Legacy fallback while historical rows are being rehydrated into join tables.
  return await db
    .select()
    .from(advisoryReports)
    .where(
      sql`JSON_CONTAINS(${advisoryReports.targetRegulationIds}, ${JSON.stringify(normalizedIds)})`
    )
    .orderBy(desc(advisoryReports.generatedDate));
}

/**
 * Get reports by standard IDs
 */
export async function getReportsByStandardIds(standardIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (standardIds.length === 0) return [];

  const normalizedIds = normalizeIdArray(standardIds) ?? [];
  if (normalizedIds.length === 0) return [];

  const joined = await db
    .select({ report: advisoryReports })
    .from(advisoryReportTargetStandards)
    .innerJoin(
      advisoryReports,
      eq(advisoryReportTargetStandards.reportId, advisoryReports.id)
    )
    .where(inArray(advisoryReportTargetStandards.standardId, normalizedIds))
    .orderBy(desc(advisoryReports.generatedDate));

  const deduped = Array.from(
    new Map(joined.map((row: any) => [row.report.id, row.report])).values()
  );
  if (deduped.length > 0) return deduped;

  // Legacy fallback while historical rows are being rehydrated into join tables.
  return await db
    .select()
    .from(advisoryReports)
    .where(
      sql`JSON_CONTAINS(${advisoryReports.targetStandardIds}, ${JSON.stringify(normalizedIds)})`
    )
    .orderBy(desc(advisoryReports.generatedDate));
}
