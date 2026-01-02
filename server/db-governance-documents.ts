import { getDb } from "./db";
import {
  governanceDocuments,
} from "../drizzle/schema";
import { eq, and, desc, sql, like, or, InferSelectModel } from "drizzle-orm";

type GovernanceDocument = InferSelectModel<typeof governanceDocuments>;

/**
 * Get all governance documents with optional filtering
 */
export async function getGovernanceDocuments(filters?: {
  documentType?: string;
  category?: string;
  status?: string;
  laneStatus?: string;
  searchTerm?: string;
}): Promise<GovernanceDocument[]> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  let query = db.select().from(governanceDocuments);

  const conditions = [];
  
  if (filters?.documentType) {
    conditions.push(eq(governanceDocuments.documentType, filters.documentType as any));
  }
  
  if (filters?.category) {
    conditions.push(eq(governanceDocuments.category, filters.category as any));
  }
  
  if (filters?.status) {
    conditions.push(eq(governanceDocuments.status, filters.status as any));
  }
  
  if (filters?.laneStatus) {
    conditions.push(eq(governanceDocuments.laneStatus, filters.laneStatus as any));
  }
  
  if (filters?.searchTerm) {
    conditions.push(
      or(
        like(governanceDocuments.title, `%${filters.searchTerm}%`),
        like(governanceDocuments.description, `%${filters.searchTerm}%`),
        like(governanceDocuments.documentCode, `%${filters.searchTerm}%`)
      )!
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const results = await query.orderBy(desc(governanceDocuments.publishedDate));
  return results;
}

/**
 * Get a single governance document by ID
 */
export async function getGovernanceDocumentById(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const results = await db
    .select()
    .from(governanceDocuments)
    .where(eq(governanceDocuments.id, id))
    .limit(1);
  
  return results[0] || null;
}

/**
 * Get governance document by document code
 */
export async function getGovernanceDocumentByCode(documentCode: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const results = await db
    .select()
    .from(governanceDocuments)
    .where(eq(governanceDocuments.documentCode, documentCode))
    .limit(1);
  
  return results[0] || null;
}

/**
 * Create a new governance document
 */
export async function createGovernanceDocument(data: typeof governanceDocuments.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const [result] = await db.insert(governanceDocuments).values(data);
  return result;
}

/**
 * Update governance document
 */
export async function updateGovernanceDocument(
  id: number,
  updates: Partial<typeof governanceDocuments.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .update(governanceDocuments)
    .set({
      ...updates,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(governanceDocuments.id, id));
  
  return result;
}

/**
 * Update document verification (Lane C governance)
 */
export async function updateDocumentVerification(
  id: number,
  verifiedBy: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db
    .update(governanceDocuments)
    .set({
      lastVerifiedDate: new Date().toISOString(),
      verifiedBy,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(governanceDocuments.id, id));
  
  return result;
}

/**
 * Get documents needing verification (older than 90 days or never verified)
 */
export async function getDocumentsNeedingVerification() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  
  const results = await db
    .select()
    .from(governanceDocuments)
    .where(
      and(
        eq(governanceDocuments.status, "PUBLISHED"),
        sql`(${governanceDocuments.lastVerifiedDate} IS NULL OR ${governanceDocuments.lastVerifiedDate} < ${ninetyDaysAgo})`
      )
    )
    .orderBy(governanceDocuments.lastVerifiedDate);
  
  return results;
}

/**
 * Get governance document statistics
 */
export async function getGovernanceDocumentStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const totalCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(governanceDocuments);
  
  const byDocumentType = await db
    .select({
      type: governanceDocuments.documentType,
      count: sql<number>`count(*)`,
    })
    .from(governanceDocuments)
    .groupBy(governanceDocuments.documentType);
  
  const byCategory = await db
    .select({
      category: governanceDocuments.category,
      count: sql<number>`count(*)`,
    })
    .from(governanceDocuments)
    .groupBy(governanceDocuments.category);
  
  const byStatus = await db
    .select({
      status: governanceDocuments.status,
      count: sql<number>`count(*)`,
    })
    .from(governanceDocuments)
    .groupBy(governanceDocuments.status);
  
  return {
    total: totalCount[0]?.count || 0,
    byDocumentType,
    byCategory,
    byStatus,
  };
}

/**
 * Search governance documents by keywords
 */
export async function searchGovernanceDocuments(searchTerm: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const results = await db
    .select()
    .from(governanceDocuments)
    .where(
      or(
        like(governanceDocuments.title, `%${searchTerm}%`),
        like(governanceDocuments.description, `%${searchTerm}%`),
        like(governanceDocuments.documentCode, `%${searchTerm}%`),
        sql`JSON_SEARCH(${governanceDocuments.keywords}, 'one', ${`%${searchTerm}%`}) IS NOT NULL`
      )!
    )
    .orderBy(desc(governanceDocuments.publishedDate));
  
  return results;
}

/**
 * Get documents by regulation IDs
 */
export async function getDocumentsByRegulationIds(regulationIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (regulationIds.length === 0) return [];
  
  const results = await db
    .select()
    .from(governanceDocuments)
    .where(
      sql`JSON_CONTAINS(${governanceDocuments.relatedRegulationIds}, ${JSON.stringify(regulationIds)})`
    )
    .orderBy(desc(governanceDocuments.publishedDate));
  
  return results;
}

/**
 * Get documents by standard IDs
 */
export async function getDocumentsByStandardIds(standardIds: number[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  if (standardIds.length === 0) return [];
  
  const results = await db
    .select()
    .from(governanceDocuments)
    .where(
      sql`JSON_CONTAINS(${governanceDocuments.relatedStandardIds}, ${JSON.stringify(standardIds)})`
    )
    .orderBy(desc(governanceDocuments.publishedDate));
  
  return results;
}
