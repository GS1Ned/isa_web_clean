import { getDb } from "./db";
import { datasetRegistry } from "../drizzle/schema";
import type { InferInsertModel } from "drizzle-orm";

type InsertDatasetRegistry = InferInsertModel<typeof datasetRegistry>;
import { eq, and, desc, sql, isNull, isNotNull } from "drizzle-orm";

/**
 * Get all datasets with optional filtering
 */
export async function getDatasets(filters?: {
  category?: string;
  format?: string;
  isActive?: boolean;
  needsVerification?: boolean; // Show datasets with old or missing verification dates
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  let query = db.select().from(datasetRegistry);

  const conditions = [];
  
  if (filters?.category) {
    conditions.push(eq(datasetRegistry.category, filters.category as any));
  }
  
  if (filters?.format) {
    conditions.push(eq(datasetRegistry.format, filters.format as any));
  }
  
  if (filters?.isActive !== undefined) {
    conditions.push(eq(datasetRegistry.isActive, filters.isActive ? 1 : 0));
  }
  
  if (filters?.needsVerification) {
    // Show datasets with no verification date or verification older than 90 days
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    conditions.push(
      sql`(${datasetRegistry.lastVerifiedDate} IS NULL OR ${datasetRegistry.lastVerifiedDate} < ${ninetyDaysAgo})`
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const results = await query.orderBy(desc(datasetRegistry.updatedAt));
  return results;
}

/**
 * Get a single dataset by ID
 */
export async function getDatasetById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const results = await db
    .select()
    .from(datasetRegistry)
    .where(eq(datasetRegistry.id, id))
    .limit(1);
  
  return results[0] || null;
}

/**
 * Create a new dataset entry
 */
export async function createDataset(data: typeof datasetRegistry.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const [result] = await db.insert(datasetRegistry).values(data);
  return result;
}

/**
 * Update dataset verification date (Decision 3: additive only)
 */
export async function updateDatasetVerification(
  id: number,
  verifiedBy: string,
  notes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .update(datasetRegistry)
    .set({
      lastVerifiedDate: new Date().toISOString(),
      verifiedBy,
      verificationNotes: notes,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(datasetRegistry.id, id));
  
  return result;
}

/**
 * Update dataset metadata
 */
export async function updateDataset(
  id: number,
  updates: Partial<typeof datasetRegistry.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .update(datasetRegistry)
    .set({
      ...updates,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(datasetRegistry.id, id));
  
  return result;
}

/**
 * Get datasets needing verification (older than 90 days or never verified)
 */
export async function getDatasetsNeedingVerification() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const results = await db
    .select()
    .from(datasetRegistry)
    .where(
      and(
        eq(datasetRegistry.isActive, 1),
        sql`(${datasetRegistry.lastVerifiedDate} IS NULL OR ${datasetRegistry.lastVerifiedDate} < ${ninetyDaysAgo})`
      )
    )
    .orderBy(datasetRegistry.lastVerifiedDate);
  
  return results;
}

/**
 * Get dataset statistics
 */
export async function getDatasetStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const totalCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(datasetRegistry);
  
  const activeCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(datasetRegistry)
    .where(eq(datasetRegistry.isActive, 1));
  
  const verifiedCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(datasetRegistry)
    .where(isNotNull(datasetRegistry.lastVerifiedDate));
  
  const needsVerificationCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(datasetRegistry)
    .where(
      sql`(${datasetRegistry.lastVerifiedDate} IS NULL OR ${datasetRegistry.lastVerifiedDate} < DATE_SUB(NOW(), INTERVAL 90 DAY))`
    );
  
  return {
    total: totalCount[0]?.count || 0,
    active: activeCount[0]?.count || 0,
    verified: verifiedCount[0]?.count || 0,
    needsVerification: needsVerificationCount[0]?.count || 0,
  };
}
