import { getDb } from "./db";
import {
  advisoryReports,
  advisoryReportVersions,
} from "../drizzle/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";

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
 * Create a new advisory report
 */
export async function createAdvisoryReport(data: typeof advisoryReports.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(advisoryReports).values(data);
  return result;
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
  
  return {
    total: totalCount[0]?.count || 0,
    byReviewStatus,
    byPublicationStatus,
  };
}

/**
 * Get reports by regulation IDs
 */
export async function getReportsByRegulationIds(regulationIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (regulationIds.length === 0) return [];
  
  const results = await db
    .select()
    .from(advisoryReports)
    .where(
      sql`JSON_CONTAINS(${advisoryReports.targetRegulationIds}, ${JSON.stringify(regulationIds)})`
    )
    .orderBy(desc(advisoryReports.generatedDate));
  
  return results;
}

/**
 * Get reports by standard IDs
 */
export async function getReportsByStandardIds(standardIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (standardIds.length === 0) return [];
  
  const results = await db
    .select()
    .from(advisoryReports)
    .where(
      sql`JSON_CONTAINS(${advisoryReports.targetStandardIds}, ${JSON.stringify(standardIds)})`
    )
    .orderBy(desc(advisoryReports.generatedDate));
  
  return results;
}
