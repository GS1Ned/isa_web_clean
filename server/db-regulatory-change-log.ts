import { getDb } from "./db";
import {
  regulatoryChangeLog,
  type RegulatoryChangeLogEntry,
  type InsertRegulatoryChangeLogEntry,
} from "../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";

/**
 * Database helper functions for Regulatory Change Log
 *
 * Adheres to ISA Design Contract:
 * - Immutable entries (no update function provided)
 * - Traceable to source documents
 * - Machine-readable with structured metadata
 */

/**
 * Create a new regulatory change log entry
 * @param entry - Entry data to insert
 * @returns The created entry with generated ID
 */
export async function createRegulatoryChangeLogEntry(
  entry: InsertRegulatoryChangeLogEntry
): Promise<RegulatoryChangeLogEntry> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const [created] = await db
    .insert(regulatoryChangeLog)
    .values(entry)
    .$returningId();

  // Fetch the complete entry
  const [fullEntry] = await db
    .select()
    .from(regulatoryChangeLog)
    .where(eq(regulatoryChangeLog.id, created.id));

  return fullEntry;
}

/**
 * Get all regulatory change log entries with optional filters and pagination
 * @param filters - Optional filters for sourceType, isaVersionAffected, search, date range
 * @param limit - Maximum number of entries to return (default: 100)
 * @returns Array of regulatory change log entries with pagination metadata
 */
export async function getRegulatoryChangeLogEntries(filters?: {
  sourceType?: string;
  isaVersionAffected?: string;
  sourceOrg?: string;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  pageSize?: number;
  limit?: number;
}): Promise<{
  entries: RegulatoryChangeLogEntry[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const db = await getDb();
  if (!db) {
    return { entries: [], total: 0, page: 1, pageSize: 20 };
  }

  const page = filters?.page || 1;
  const pageSize = filters?.pageSize || 20;
  const offset = (page - 1) * pageSize;

  const conditions = [];

  if (filters?.sourceType) {
    conditions.push(eq(regulatoryChangeLog.sourceType, filters.sourceType as any));
  }

  if (filters?.isaVersionAffected) {
    conditions.push(
      eq(regulatoryChangeLog.isaVersionAffected, filters.isaVersionAffected)
    );
  }

  if (filters?.sourceOrg) {
    conditions.push(sql`${regulatoryChangeLog.sourceOrg} LIKE ${`%${filters.sourceOrg}%`}`);
  }

  if (filters?.search) {
    conditions.push(
      sql`(${regulatoryChangeLog.title} LIKE ${`%${filters.search}%`} OR ${regulatoryChangeLog.description} LIKE ${`%${filters.search}%`})`
    );
  }

  if (filters?.startDate) {
    conditions.push(sql`${regulatoryChangeLog.entryDate} >= ${filters.startDate}`);
  }

  if (filters?.endDate) {
    conditions.push(sql`${regulatoryChangeLog.entryDate} <= ${filters.endDate}`);
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(regulatoryChangeLog)
    .where(whereClause);

  const total = Number(countResult[0]?.count || 0);

  // Get entries
  const entries = await db
    .select()
    .from(regulatoryChangeLog)
    .where(whereClause)
    .orderBy(desc(regulatoryChangeLog.entryDate))
    .limit(pageSize)
    .offset(offset);

  return {
    entries,
    total,
    page,
    pageSize,
  };
}

/**
 * Get a single regulatory change log entry by ID
 * @param id - Entry ID
 * @returns The entry or null if not found
 */
export async function getRegulatoryChangeLogEntryById(
  id: number
): Promise<RegulatoryChangeLogEntry | null> {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const [entry] = await db
    .select()
    .from(regulatoryChangeLog)
    .where(eq(regulatoryChangeLog.id, id));

  return entry ?? null;
}

/**
 * Get regulatory change log entries by ISA version
 * @param isaVersion - ISA version (e.g., "v1.1", "v1.2")
 * @returns Array of entries affecting this version
 */
export async function getRegulatoryChangeLogEntriesByVersion(
  isaVersion: string
): Promise<RegulatoryChangeLogEntry[]> {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return db
    .select()
    .from(regulatoryChangeLog)
    .where(eq(regulatoryChangeLog.isaVersionAffected, isaVersion))
    .orderBy(desc(regulatoryChangeLog.entryDate));
}

/**
 * Get count of regulatory change log entries by source type
 * @returns Object mapping source types to counts
 */
export async function getRegulatoryChangeLogStatsBySourceType(): Promise<
  Record<string, number>
> {
  const db = await getDb();
  if (!db) {
    return {};
  }

  const results = await db
    .select({
      sourceType: regulatoryChangeLog.sourceType,
      count: sql<number>`count(*)`.as("count"),
    })
    .from(regulatoryChangeLog)
    .groupBy(regulatoryChangeLog.sourceType);

  return results.reduce(
    (acc, row) => {
      acc[row.sourceType] = Number(row.count);
      return acc;
    },
    {} as Record<string, number>
  );
}

/**
 * Get count of regulatory change log entries by ISA version
 * @returns Object mapping ISA versions to counts
 */
export async function getRegulatoryChangeLogStatsByVersion(): Promise<
  Record<string, number>
> {
  const db = await getDb();
  if (!db) {
    return {};
  }

  const results = await db
    .select({
      isaVersion: regulatoryChangeLog.isaVersionAffected,
      count: sql<number>`count(*)`.as("count"),
    })
    .from(regulatoryChangeLog)
    .where(sql`${regulatoryChangeLog.isaVersionAffected} IS NOT NULL`)
    .groupBy(regulatoryChangeLog.isaVersionAffected);

  return results.reduce(
    (acc, row) => {
      if (row.isaVersion) {
        acc[row.isaVersion] = Number(row.count);
      }
      return acc;
    },
    {} as Record<string, number>
  );
}

/**
 * Delete a regulatory change log entry (admin only)
 * @param id - Entry ID to delete
 * @returns True if deleted successfully
 */
export async function deleteRegulatoryChangeLogEntry(
  id: number
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    return false;
  }

  await db
    .delete(regulatoryChangeLog)
    .where(eq(regulatoryChangeLog.id, id));

  return true;
}
