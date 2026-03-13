import {
  flagAdvisoryReportsStaleSince,
  flagRegulationsNeedVerification,
  isVerificationTriggerState,
} from "./services/news-impact";
import { drizzle } from "drizzle-orm/mysql2";
import { eq, desc, and, inArray, count, sql } from "drizzle-orm";
import { ENV } from "./_core/env";
import { createMysqlPool } from "./db-connection";
import { serverLogger } from "./_core/logger-wiring";

let _db: any | null = null;
let _pgSql: any = null;

/**
 * Returns the raw postgres-js client for direct SQL queries.
 * Only available when DB_ENGINE=postgres.
 */
export function getRawPgSql() {
  return _pgSql;
}
let _schema: any | null = null;

/**
 * Returns the active DB engine identifier.
 * "mysql"    — default; MySQL2 pool via createMysqlPool()
 * "postgres" — Postgres path enabled by DB_ENGINE=postgres + DATABASE_URL_POSTGRES
 */
export function getDbEngine(): "mysql" | "postgres" {
  return ENV.dbEngine;
}

/**
 * Lazily load the correct schema based on engine.
 */
async function getSchema() {
  if (_schema) return _schema;
  if (ENV.dbEngine === "postgres") {
    _schema = await import("../drizzle_pg/schema");
  } else {
    _schema = await import("../drizzle_pg/schema");
  }
  return _schema;
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  // Postgres path (ISA2-0020): wire postgres-js adapter when DB_ENGINE=postgres.
  if (ENV.dbEngine === "postgres") {
    if (_db) return _db;
    const pgUrl = ENV.databaseUrlPostgres || process.env.DATABASE_URL_POSTGRES || "";
    if (!pgUrl) {
      serverLogger.warn(
        "[Database] DB_ENGINE=postgres requires DATABASE_URL_POSTGRES; falling back to null."
      );
      return null;
    }
    try {
      const { createPostgresDb } = await import("./db-connection-pg.js");
      const { db, sql } = createPostgresDb(pgUrl);
      _db = db as any;
      _pgSql = sql as any;
      serverLogger.info("[Database] Connected via Postgres (postgres-js)");
    } catch (error) {
      serverLogger.warn("[Database] Postgres connection failed:", error);
      return null;
    }
    return _db;
  }

  if (!_db && process.env.DATABASE_URL) {
    try {
      const pool = createMysqlPool(process.env.DATABASE_URL);
      _db = drizzle(pool) as any;
    } catch (error) {
      serverLogger.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ---------------------------------------------------------------------------
// Engine-aware upsert helper
// ---------------------------------------------------------------------------

/**
 * Performs an upsert: MySQL uses onDuplicateKeyUpdate, Postgres uses
 * onConflictDoUpdate. The caller provides the table, values, conflict target,
 * and the update set.
 */
async function engineUpsert(
  db: any,
  table: any,
  values: any,
  conflictTarget: any,
  updateSet: Record<string, unknown>
) {
  if (ENV.dbEngine === "postgres") {
    return db.insert(table).values(values).onConflictDoUpdate({
      target: conflictTarget,
      set: updateSet,
    });
  } else {
    return db.insert(table).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  }
}

/**
 * Extracts the inserted ID from an insert result.
 * MySQL returns insertId on the result; Postgres uses RETURNING.
 */
async function engineInsertReturningId(
  db: any,
  table: any,
  values: any
): Promise<number | null> {
  if (ENV.dbEngine === "postgres") {
    const result = await db.insert(table).values(values).returning({ id: table.id });
    return result?.[0]?.id ?? null;
  } else {
    const result = await db.insert(table).values(values);
    return Number((result as any).insertId || (result as any)?.[0]?.insertId) || null;
  }
}

// ---------------------------------------------------------------------------
// User operations
// ---------------------------------------------------------------------------

export type InsertUser = {
  openId: string;
  name?: string | null;
  email?: string | null;
  loginMethod?: string | null;
  role?: string;
  lastSignedIn?: string;
};

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    serverLogger.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  const schema = await getSchema();

  try {
    const values: any = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date().toISOString();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date().toISOString();
    }

    await engineUpsert(db, schema.users, values, schema.users.openId, updateSet);
  } catch (error) {
    serverLogger.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    serverLogger.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const schema = await getSchema();

  const result = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// ISA-specific database helpers
// ============================================================================

/**
 * Get all regulations with optional filtering
 */
export async function getRegulations(type?: string) {
  const db = await getDb();
  if (!db) return [];

  const schema = await getSchema();

  try {
    if (type) {
      return await db
        .select()
        .from(schema.regulations)
        .where(eq(schema.regulations.regulationType, type as any));
    }
    return await db
      .select()
      .from(schema.regulations)
      .orderBy(desc(schema.regulations.createdAt));
  } catch (error) {
    serverLogger.error("[Database] Failed to get regulations:", error);
    return [];
  }
}

/**
 * Upsert a regulation (insert if new, update if exists based on celexId)
 */
export async function upsertRegulation(regulation: {
  title: string;
  celexId?: string | null;
  description?: string | null;
  effectiveDate?: Date | string | null;
  sourceUrl?: string | null;
  regulationType?: string | null;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database connection failed");

  const schema = await getSchema();

  try {
    // Check if regulation exists by celexId
    let existing = null;
    if (regulation.celexId) {
      const results = await db
        .select()
        .from(schema.regulations)
        .where(eq(schema.regulations.celexId, regulation.celexId))
        .limit(1);
      existing = results.length > 0 ? results[0] : null;
    }

    if (existing) {
      await db
        .update(schema.regulations)
        .set({
          title: regulation.title,
          description: regulation.description,
          effectiveDate: regulation.effectiveDate ? (typeof regulation.effectiveDate === 'string' ? regulation.effectiveDate : regulation.effectiveDate.toISOString()) : null,
          sourceUrl: regulation.sourceUrl,
          regulationType: regulation.regulationType as any,
        })
        .where(eq(schema.regulations.id, existing.id));

      return { id: existing.id, inserted: false, updated: true };
    } else {
      const insertedId = await engineInsertReturningId(db, schema.regulations, {
        title: regulation.title,
        celexId: regulation.celexId,
        description: regulation.description,
        effectiveDate: regulation.effectiveDate ? (typeof regulation.effectiveDate === 'string' ? regulation.effectiveDate : regulation.effectiveDate.toISOString()) : null,
        sourceUrl: regulation.sourceUrl,
        regulationType: regulation.regulationType as any,
      });
      return { id: Number(insertedId), inserted: true, updated: false };
    }
  } catch (error) {
    serverLogger.error("[Database] Failed to upsert regulation:", error);
    throw error;
  }
}

/**
 * Get a single regulation by ID with its mapped standards
 */
export async function getRegulationWithStandards(regulationId: number) {
  const db = await getDb();
  if (!db) return null;

  const schema = await getSchema();

  try {
    const regulation = await db
      .select()
      .from(schema.regulations)
      .where(eq(schema.regulations.id, regulationId))
      .limit(1);
    if (!regulation.length) return null;

    // regulationStandardMappings may not exist in PG schema yet
    const mappingTable = schema.regulationStandardMappings;
    let mappings: any[] = [];
    let standards: any[] = [];

    if (mappingTable) {
      mappings = await db
        .select()
        .from(mappingTable)
        .where(eq(mappingTable.regulationId, regulationId));

      const standardIds = mappings.map((m: any) => m.standardId);
      if (standardIds.length > 0) {
        for (const standardId of standardIds) {
          const result = await db
            .select()
            .from(schema.gs1Standards)
            .where(eq(schema.gs1Standards.id, standardId));
          if (result.length > 0) {
            standards.push(result[0]);
          }
        }
      }
    }

    return {
      regulation: regulation[0],
      mappings,
      standards,
    };
  } catch (error) {
    serverLogger.error("[Database] Failed to get regulation with standards:", error);
    return null;
  }
}

/**
 * Get all GS1 standards
 */
export async function getGS1Standards() {
  const db = await getDb();
  if (!db) return [];

  const schema = await getSchema();

  try {
    return await db
      .select()
      .from(schema.gs1Standards)
      .orderBy(schema.gs1Standards.standardCode);
  } catch (error) {
    serverLogger.error("[Database] Failed to get GS1 standards:", error);
    return [];
  }
}

/**
 * Get recent regulatory changes
 */
export async function getRecentRegulatoryChanges(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const schema = await getSchema();

  try {
    if (!schema.regulatoryChangeAlerts) return [];
    return await db
      .select()
      .from(schema.regulatoryChangeAlerts)
      .orderBy(desc(schema.regulatoryChangeAlerts.createdAt))
      .limit(limit);
  } catch (error) {
    serverLogger.error("[Database] Failed to get regulatory changes:", error);
    return [];
  }
}

/**
 * Get user's analysis history
 */
export async function getUserAnalysisHistory(
  userId: number,
  limit: number = 20
) {
  const db = await getDb();
  if (!db) return [];

  const schema = await getSchema();

  try {
    if (!schema.userAnalyses) return [];
    return await db
      .select()
      .from(schema.userAnalyses)
      .where(eq(schema.userAnalyses.userId, userId))
      .orderBy(desc(schema.userAnalyses.createdAt))
      .limit(limit);
  } catch (error) {
    serverLogger.error("[Database] Failed to get user analysis history:", error);
    return [];
  }
}

/**
 * Create a new user analysis record
 */
export async function createUserAnalysis(data: {
  userId: number;
  regulationId?: number;
  documentTitle?: string;
  documentUrl?: string;
  analysisType: string;
  detectedStandardsCount?: number;
  analysisResult?: any;
}) {
  const db = await getDb();
  if (!db) return null;

  const schema = await getSchema();

  try {
    if (!schema.userAnalyses) return null;
    const result = await db.insert(schema.userAnalyses).values({
      userId: data.userId,
      analysisType: data.analysisType,
      title: data.documentTitle,
      inputData: data,
      resultData: data.analysisResult,
    });
    return result;
  } catch (error) {
    serverLogger.error("[Database] Failed to create user analysis:", error);
    return null;
  }
}

/**
 * Get or create user preferences
 */
export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const schema = await getSchema();

  try {
    if (!schema.userPreferences) return null;
    const existing = await db
      .select()
      .from(schema.userPreferences)
      .where(eq(schema.userPreferences.userId, userId))
      .limit(1);

    if (existing.length) {
      return existing[0];
    }

    // Create default preferences — engine-aware
    if (ENV.dbEngine === "postgres") {
      await db.insert(schema.userPreferences).values({
        userId,
        preferenceKey: "notifications_enabled",
        preferenceValue: "true",
      });
    } else {
      await db.insert(schema.userPreferences).values({
        userId,
        notificationsEnabled: 1,
      });
    }

    const result = await db
      .select()
      .from(schema.userPreferences)
      .where(eq(schema.userPreferences.userId, userId))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    serverLogger.error("[Database] Failed to get user preferences:", error);
    return null;
  }
}

/**
 * Create a new contact submission
 */
export async function createContact(contact: any) {
  const db = await getDb();
  if (!db) {
    serverLogger.warn("[Database] Cannot create contact: database not available");
    return null;
  }

  const schema = await getSchema();

  try {
    if (!schema.contacts) return null;
    const insertedId = await engineInsertReturningId(db, schema.contacts, contact);
    if (insertedId) {
      const newContact = await db
        .select()
        .from(schema.contacts)
        .where(eq(schema.contacts.id, insertedId))
        .limit(1);
      return newContact.length > 0 ? newContact[0] : null;
    }
    return null;
  } catch (error) {
    serverLogger.error("[Database] Failed to create contact:", error);
    throw error;
  }
}

/**
 * Get contacts with optional filtering
 */
export async function getContacts(limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) {
    serverLogger.warn("[Database] Cannot get contacts: database not available");
    return [];
  }

  const schema = await getSchema();

  try {
    if (!schema.contacts) return [];
    return await db
      .select()
      .from(schema.contacts)
      .orderBy(desc(schema.contacts.createdAt))
      .limit(limit)
      .offset(offset);
  } catch (error) {
    serverLogger.error("[Database] Failed to get contacts:", error);
    return [];
  }
}

/**
 * Get statistics for dashboard
 */
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) return null;

  const schema = await getSchema();

  try {
    const regulationCount = await db.select().from(schema.regulations);
    const standardCount = await db.select().from(schema.gs1Standards);

    const mappingTable = schema.regulationStandardMappings || schema.regulationEsrsMappings;
    let mappingCount: any[] = [];
    if (mappingTable) {
      mappingCount = await db.select().from(mappingTable);
    }

    let recentChanges: any[] = [];
    if (schema.regulatoryChangeAlerts) {
      recentChanges = await db
        .select()
        .from(schema.regulatoryChangeAlerts)
        .orderBy(desc(schema.regulatoryChangeAlerts.createdAt))
        .limit(5);
    }

    return {
      totalRegulations: regulationCount.length,
      totalStandards: standardCount.length,
      totalMappings: mappingCount.length,
      recentChanges: recentChanges,
    };
  } catch (error) {
    serverLogger.error("[Database] Failed to get dashboard stats:", error);
    return null;
  }
}

/**
 * Create a new hub news item
 */
export async function createHubNews(news: {
  title: string;
  content: string;
  newsType?: string;
  sourceUrl?: string;
  sourceTitle?: string;
  sourceType?: string;
  relatedRegulationIds?: number[];
  regulationTags?: string[];
  impactLevel?: string;
  credibilityScore?: string;
  publishedDate?: Date | string;
  retrievedAt?: Date | string;
  isAutomated?: boolean | number;
  summary?: string;
  gs1ImpactTags?: string[];
  sectorTags?: string[];
  relatedStandardIds?: string[];
  gs1ImpactAnalysis?: string;
  suggestedActions?: string[];
  sources?: Array<{ name: string; type: string; url: string }>;
}) {
  const db = await getDb();
  if (!db) {
    serverLogger.warn("[Database] Cannot create hub news: database not available");
    return null;
  }

  const schema = await getSchema();

  try {
    if (!schema.hubNews) return null;

    // Build values object — PG schema has simpler columns
    const values: any = {
      title: news.title,
      content: news.content,
      summary: news.summary,
    };

    if (ENV.dbEngine === "postgres") {
      // PG hub_news has: title, summary, content, source_url, source_name, category, tags, published_at
      values.sourceUrl = news.sourceUrl;
      values.sourceName = news.sourceTitle;
      values.category = news.newsType;
      values.tags = news.regulationTags;
      values.publishedAt = news.publishedDate ? (typeof news.publishedDate === 'string' ? news.publishedDate : news.publishedDate.toISOString()) : new Date().toISOString();
    } else {
      // MySQL hub_news has all the detailed columns
      values.newsType = news.newsType;
      values.sourceUrl = news.sourceUrl;
      values.sourceTitle = news.sourceTitle;
      values.sourceType = news.sourceType;
      values.relatedRegulationIds = news.relatedRegulationIds
        ? JSON.stringify(news.relatedRegulationIds)
        : null;
      values.regulationTags = news.regulationTags || null;
      values.impactLevel = news.impactLevel;
      values.credibilityScore = news.credibilityScore;
      values.publishedDate = news.publishedDate ? (typeof news.publishedDate === 'string' ? news.publishedDate : news.publishedDate.toISOString()) : new Date().toISOString();
      values.retrievedAt = news.retrievedAt ? (typeof news.retrievedAt === 'string' ? news.retrievedAt : news.retrievedAt.toISOString()) : new Date().toISOString();
      values.isAutomated = news.isAutomated ? 1 : 0;
      values.gs1ImpactTags = news.gs1ImpactTags || null;
      values.sectorTags = news.sectorTags || null;
      values.relatedStandardIds = news.relatedStandardIds || null;
      values.gs1ImpactAnalysis = news.gs1ImpactAnalysis || null;
      values.suggestedActions = news.suggestedActions || null;
      values.sources = news.sources || null;
    }

    const insertedId = await engineInsertReturningId(db, schema.hubNews, values);

    // E-01 + E-02: Propagate news signals
    if (news.relatedRegulationIds && news.relatedRegulationIds.length > 0) {
      const regulationIds = news.relatedRegulationIds;
      flagAdvisoryReportsStaleSince(regulationIds).catch(() => {});
      const credibilityNum = news.credibilityScore ? parseFloat(String(news.credibilityScore)) : 0;
      const isHighCredibility = credibilityNum >= 0.8;
      const hasVerificationState = isVerificationTriggerState((news as any).regulatoryState);
      if (isHighCredibility || hasVerificationState) {
        flagRegulationsNeedVerification(regulationIds).catch(() => {});
      }
    }

    return { id: Number(insertedId) };
  } catch (error) {
    serverLogger.error("[Database] Failed to create hub news:", error);
    return null;
  }
}

/**
 * Get recent hub news items
 */
export async function getRecentHubNews(limit: number = 20) {
  const db = await getDb();
  if (!db) {
    serverLogger.warn("[Database] Cannot get hub news: database not available");
    return [];
  }

  const schema = await getSchema();

  try {
    if (!schema.hubNews) return [];
    // PG uses publishedAt, MySQL uses publishedDate
    const orderCol = schema.hubNews.publishedAt || schema.hubNews.publishedDate;
    return await db
      .select()
      .from(schema.hubNews)
      .orderBy(desc(orderCol))
      .limit(limit);
  } catch (error) {
    serverLogger.error("[Database] Failed to get hub news:", error);
    return [];
  }
}

/**
 * Create a user alert
 */
export async function createUserAlert(alert: {
  userId: number;
  regulationId?: number;
  alertType: string;
  isActive?: boolean;
  daysBeforeDeadline?: number;
  title?: string;
  content?: string;
}) {
  const db = await getDb();
  if (!db) {
    serverLogger.warn("[Database] Cannot create user alert: database not available");
    return null;
  }

  const schema = await getSchema();

  try {
    if (!schema.userAlerts) return null;

    const values: any = {
      userId: alert.userId,
      alertType: alert.alertType,
    };

    if (ENV.dbEngine === "postgres") {
      values.title = alert.title || alert.alertType;
      values.content = alert.content;
    } else {
      values.regulationId = alert.regulationId;
      values.isActive = alert.isActive ? 1 : 0;
      values.daysBeforeDeadline = alert.daysBeforeDeadline;
    }

    const result = await db.insert(schema.userAlerts).values(values);
    return result;
  } catch (error) {
    serverLogger.error("[Database] Failed to create user alert:", error);
    return null;
  }
}

/**
 * Get user alerts
 */
export async function getUserAlerts(userId: number) {
  const db = await getDb();
  if (!db) {
    serverLogger.warn("[Database] Cannot get user alerts: database not available");
    return [];
  }

  const schema = await getSchema();

  try {
    if (!schema.userAlerts) return [];
    return await db
      .select()
      .from(schema.userAlerts)
      .where(eq(schema.userAlerts.userId, userId));
  } catch (error) {
    serverLogger.error("[Database] Failed to get user alerts:", error);
    return [];
  }
}

/**
 * Get users with active alerts for daily digest
 */
export async function getUsersWithActiveAlerts() {
  const db = await getDb();
  if (!db) {
    serverLogger.warn("[Database] Cannot get users with alerts: database not available");
    return [];
  }

  const schema = await getSchema();

  try {
    if (!schema.userAlerts) return [];
    if (ENV.dbEngine === "postgres") {
      // PG schema uses isRead instead of isActive
      return await db
        .selectDistinct({ userId: schema.userAlerts.userId })
        .from(schema.userAlerts)
        .where(eq(schema.userAlerts.isRead, false));
    } else {
      return await db
        .selectDistinct({ userId: schema.userAlerts.userId })
        .from(schema.userAlerts)
        .where(eq(schema.userAlerts.isActive, 1));
    }
  } catch (error) {
    serverLogger.error("[Database] Failed to get users with active alerts:", error);
    return [];
  }
}

/**
 * Get ESRS datapoint mappings for a regulation
 */
export async function getRegulationEsrsMappings(regulationId: number) {
  const db = await getDb();
  if (!db) {
    serverLogger.warn("[Database] Cannot get regulation ESRS mappings: database not available");
    return [];
  }

  const schema = await getSchema();

  try {
    if (!schema.regulationEsrsMappings || !schema.esrsDatapoints) return [];

    return await db
      .select({
        id: schema.regulationEsrsMappings.id,
        regulationId: schema.regulationEsrsMappings.regulationId,
        datapointId: schema.regulationEsrsMappings.datapointId,
        relevanceScore: schema.regulationEsrsMappings.relevanceScore,
        reasoning: schema.regulationEsrsMappings.reasoning,
        createdAt: schema.regulationEsrsMappings.createdAt,
        datapoint: {
          id: schema.esrsDatapoints.id,
          datapointId: schema.esrsDatapoints.code,
          esrs_standard: schema.esrsDatapoints.esrsStandard,
          disclosure_requirement: schema.esrsDatapoints.disclosureRequirement,
          datapointName: schema.esrsDatapoints.name,
          data_type: schema.esrsDatapoints.dataType,
          mayVoluntary: schema.esrsDatapoints.voluntary,
        },
      })
      .from(schema.regulationEsrsMappings)
      .leftJoin(
        schema.esrsDatapoints,
        eq(schema.regulationEsrsMappings.datapointId, schema.esrsDatapoints.id)
      )
      .where(eq(schema.regulationEsrsMappings.regulationId, regulationId))
      .orderBy(schema.regulationEsrsMappings.relevanceScore);
  } catch (error) {
    serverLogger.error("[Database] Failed to get regulation ESRS mappings:", error);
    return [];
  }
}

/**
 * Create or update regulation-ESRS datapoint mapping
 */
export async function upsertRegulationEsrsMapping(mapping: {
  regulationId: number;
  datapointId: number;
  relevanceScore: number;
  reasoning?: string;
}) {
  const db = await getDb();
  if (!db) {
    serverLogger.warn("[Database] Cannot upsert regulation ESRS mapping: database not available");
    return null;
  }

  const schema = await getSchema();

  try {
    if (!schema.regulationEsrsMappings) return null;

    const existing = await db
      .select()
      .from(schema.regulationEsrsMappings)
      .where(
        and(
          eq(schema.regulationEsrsMappings.regulationId, mapping.regulationId),
          eq(schema.regulationEsrsMappings.datapointId, mapping.datapointId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(schema.regulationEsrsMappings)
        .set({
          relevanceScore: mapping.relevanceScore,
          reasoning: mapping.reasoning,
        })
        .where(eq(schema.regulationEsrsMappings.id, existing[0].id));
      return existing[0];
    } else {
      const insertedId = await engineInsertReturningId(db, schema.regulationEsrsMappings, {
        regulationId: mapping.regulationId,
        datapointId: mapping.datapointId,
        relevanceScore: mapping.relevanceScore,
        reasoning: mapping.reasoning,
      });
      return { id: Number(insertedId), ...mapping };
    }
  } catch (error) {
    serverLogger.error("[Database] Failed to upsert regulation ESRS mapping:", error);
    return null;
  }
}

/**
 * Delete all ESRS mappings for a regulation (for re-generation)
 */
export async function deleteRegulationEsrsMappings(regulationId: number) {
  const db = await getDb();
  if (!db) {
    serverLogger.warn("[Database] Cannot delete regulation ESRS mappings: database not available");
    return false;
  }

  const schema = await getSchema();

  try {
    if (!schema.regulationEsrsMappings) return false;
    await db
      .delete(schema.regulationEsrsMappings)
      .where(eq(schema.regulationEsrsMappings.regulationId, regulationId));
    return true;
  } catch (error) {
    serverLogger.error("[Database] Failed to delete regulation ESRS mappings:", error);
    return false;
  }
}

/**
 * Submit or update user feedback on an ESRS mapping
 */
export async function submitMappingFeedback(params: {
  userId: number;
  mappingId: number;
  vote: boolean;
}) {
  const db = await getDb();
  if (!db) {
    serverLogger.warn("[Database] Cannot submit mapping feedback: database not available");
    return null;
  }

  const schema = await getSchema();

  try {
    if (!schema.mappingFeedback) return null;

    const existing = await db
      .select()
      .from(schema.mappingFeedback)
      .where(
        and(
          eq(schema.mappingFeedback.userId, params.userId),
          eq(schema.mappingFeedback.mappingId, params.mappingId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(schema.mappingFeedback)
        .set({ vote: params.vote ? 1 : 0 })
        .where(eq(schema.mappingFeedback.id, existing[0].id));
      return { ...existing[0], vote: params.vote ? 1 : 0 };
    } else {
      const insertedId = await engineInsertReturningId(db, schema.mappingFeedback, {
        userId: params.userId,
        mappingId: params.mappingId,
        vote: params.vote ? 1 : 0,
      });
      return { id: Number(insertedId), userId: params.userId, mappingId: params.mappingId, vote: params.vote ? 1 : 0 };
    }
  } catch (error) {
    serverLogger.error("[Database] Failed to submit mapping feedback:", error);
    return null;
  }
}

/**
 * Get user's feedback for a specific mapping
 */
export async function getUserMappingFeedback(
  userId: number,
  mappingId: number
) {
  const db = await getDb();
  if (!db) return null;

  const schema = await getSchema();

  try {
    if (!schema.mappingFeedback) return null;

    const result = await db
      .select()
      .from(schema.mappingFeedback)
      .where(
        and(
          eq(schema.mappingFeedback.userId, userId),
          eq(schema.mappingFeedback.mappingId, mappingId)
        )
      )
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    serverLogger.error("[Database] Failed to get user mapping feedback:", error);
    return null;
  }
}

/**
 * Get aggregated feedback stats for a mapping
 */
export async function getMappingFeedbackStats(mappingId: number) {
  const db = await getDb();
  if (!db) return null;

  const schema = await getSchema();

  try {
    if (!schema.mappingFeedback) return null;

    const stats = await db
      .select({
        totalVotes: count(),
        positiveVotes: sql<number>`SUM(CASE WHEN ${schema.mappingFeedback.vote} = 1 THEN 1 ELSE 0 END)`,
      })
      .from(schema.mappingFeedback)
      .where(eq(schema.mappingFeedback.mappingId, mappingId));

    if (stats.length === 0 || stats[0].totalVotes === 0) {
      return { totalVotes: 0, positiveVotes: 0, positivePercentage: 0 };
    }

    const totalVotes = Number(stats[0].totalVotes);
    const positiveVotes = Number(stats[0].positiveVotes);
    const positivePercentage = Math.round((positiveVotes / totalVotes) * 100);

    return { totalVotes, positiveVotes, positivePercentage };
  } catch (error) {
    serverLogger.error("[Database] Failed to get mapping feedback stats:", error);
    return null;
  }
}

/**
 * Get feedback stats for multiple mappings (batch)
 */
export async function getBatchMappingFeedbackStats(mappingIds: number[]) {
  const db = await getDb();
  if (!db || mappingIds.length === 0) return {};

  const schema = await getSchema();

  try {
    if (!schema.mappingFeedback) return {};

    const stats = await db
      .select({
        mappingId: schema.mappingFeedback.mappingId,
        totalVotes: count(),
        positiveVotes: sql<number>`SUM(CASE WHEN ${schema.mappingFeedback.vote} = 1 THEN 1 ELSE 0 END)`,
      })
      .from(schema.mappingFeedback)
      .where(inArray(schema.mappingFeedback.mappingId, mappingIds))
      .groupBy(schema.mappingFeedback.mappingId);

    const statsMap: Record<
      number,
      { totalVotes: number; positiveVotes: number; positivePercentage: number }
    > = {};

    stats.forEach((stat: any) => {
      const totalVotes = Number(stat.totalVotes);
      const positiveVotes = Number(stat.positiveVotes);
      const positivePercentage =
        totalVotes > 0 ? Math.round((positiveVotes / totalVotes) * 100) : 0;
      statsMap[stat.mappingId] = {
        totalVotes,
        positiveVotes,
        positivePercentage,
      };
    });

    return statsMap;
  } catch (error) {
    serverLogger.error("[Database] Failed to get batch mapping feedback stats:", error);
    return {};
  }
}

/**
 * Get low-scored ESRS mappings
 */
export async function getLowScoredMappings(minVotes: number = 3) {
  const db = await getDb();
  if (!db) return [];

  const schema = await getSchema();

  try {
    if (!schema.regulationEsrsMappings || !schema.esrsDatapoints || !schema.mappingFeedback) return [];

    const lowScored = await db
      .select({
        mappingId: schema.regulationEsrsMappings.id,
        regulationId: schema.regulationEsrsMappings.regulationId,
        datapointId: schema.regulationEsrsMappings.datapointId,
        datapointName: schema.esrsDatapoints.name,
        esrs_standard: schema.esrsDatapoints.esrsStandard,
        relevanceScore: schema.regulationEsrsMappings.relevanceScore,
        reasoning: schema.regulationEsrsMappings.reasoning,
        totalVotes: count(schema.mappingFeedback.id),
        positiveVotes: sql<number>`SUM(CASE WHEN ${schema.mappingFeedback.vote} = 1 THEN 1 ELSE 0 END)`,
      })
      .from(schema.regulationEsrsMappings)
      .innerJoin(
        schema.esrsDatapoints,
        sql`${schema.regulationEsrsMappings.datapointId} = ${schema.esrsDatapoints.id}`
      )
      .leftJoin(
        schema.mappingFeedback,
        sql`${schema.regulationEsrsMappings.id} = ${schema.mappingFeedback.mappingId}`
      )
      .groupBy(schema.regulationEsrsMappings.id)
      .having(
        sql`COUNT(${schema.mappingFeedback.id}) >= ${minVotes} AND (SUM(CASE WHEN ${schema.mappingFeedback.vote} = 1 THEN 1 ELSE 0 END) / COUNT(${schema.mappingFeedback.id})) < 0.5`
      )
      .orderBy(desc(sql`COUNT(${schema.mappingFeedback.id})`));

    return lowScored.map((m: any) => ({
      mappingId: m.mappingId,
      regulationId: m.regulationId,
      datapointId: m.datapointId,
      datapointName: m.datapointName,
      esrs_standard: m.esrs_standard,
      relevanceScore: m.relevanceScore,
      reasoning: m.reasoning,
      totalVotes: Number(m.totalVotes),
      positiveVotes: Number(m.positiveVotes || 0),
      approvalPercentage:
        Number(m.totalVotes) > 0
          ? Math.round(
              (Number(m.positiveVotes || 0) / Number(m.totalVotes)) * 100
            )
          : 0,
    }));
  } catch (error) {
    serverLogger.error("[Database] Failed to get low-scored mappings:", error);
    return [];
  }
}

/**
 * Get vote distribution by ESRS standard
 */
export async function getVoteDistributionByStandard() {
  const db = await getDb();
  if (!db) return [];

  const schema = await getSchema();

  try {
    if (!schema.regulationEsrsMappings || !schema.esrsDatapoints || !schema.mappingFeedback) return [];

    const distribution = await db
      .select({
        esrs_standard: schema.esrsDatapoints.esrsStandard,
        totalMappings: count(schema.regulationEsrsMappings.id),
        totalVotes: count(schema.mappingFeedback.id),
        positiveVotes: sql<number>`SUM(CASE WHEN ${schema.mappingFeedback.vote} = 1 THEN 1 ELSE 0 END)`,
      })
      .from(schema.regulationEsrsMappings)
      .innerJoin(
        schema.esrsDatapoints,
        sql`${schema.regulationEsrsMappings.datapointId} = ${schema.esrsDatapoints.id}`
      )
      .leftJoin(
        schema.mappingFeedback,
        sql`${schema.regulationEsrsMappings.id} = ${schema.mappingFeedback.mappingId}`
      )
      .groupBy(schema.esrsDatapoints.esrsStandard);

    return distribution.map((d: any) => ({
      esrs_standard: d.esrs_standard,
      totalMappings: Number(d.totalMappings),
      totalVotes: Number(d.totalVotes),
      positiveVotes: Number(d.positiveVotes || 0),
      approvalPercentage:
        Number(d.totalVotes) > 0
          ? Math.round(
              (Number(d.positiveVotes || 0) / Number(d.totalVotes)) * 100
            )
          : 0,
    }));
  } catch (error) {
    serverLogger.error("[Database] Failed to get vote distribution by standard:", error);
    return [];
  }
}

/**
 * Get most-voted ESRS mappings
 */
export async function getMostVotedMappings(limit: number = 10) {
  const db = await getDb();
  if (!db) return [];

  const schema = await getSchema();

  try {
    if (!schema.regulationEsrsMappings || !schema.esrsDatapoints || !schema.mappingFeedback) return [];

    const mostVoted = await db
      .select({
        mappingId: schema.regulationEsrsMappings.id,
        regulationId: schema.regulationEsrsMappings.regulationId,
        datapointId: schema.regulationEsrsMappings.datapointId,
        datapointName: schema.esrsDatapoints.name,
        esrs_standard: schema.esrsDatapoints.esrsStandard,
        relevanceScore: schema.regulationEsrsMappings.relevanceScore,
        totalVotes: count(schema.mappingFeedback.id),
        positiveVotes: sql<number>`SUM(CASE WHEN ${schema.mappingFeedback.vote} = 1 THEN 1 ELSE 0 END)`,
      })
      .from(schema.regulationEsrsMappings)
      .innerJoin(
        schema.esrsDatapoints,
        sql`${schema.regulationEsrsMappings.datapointId} = ${schema.esrsDatapoints.id}`
      )
      .leftJoin(
        schema.mappingFeedback,
        sql`${schema.regulationEsrsMappings.id} = ${schema.mappingFeedback.mappingId}`
      )
      .groupBy(schema.regulationEsrsMappings.id)
      .having(sql`COUNT(${schema.mappingFeedback.id}) > 0`)
      .orderBy(desc(count(schema.mappingFeedback.id)))
      .limit(limit);

    return mostVoted.map((m: any) => ({
      mappingId: m.mappingId,
      regulationId: m.regulationId,
      datapointId: m.datapointId,
      datapointName: m.datapointName,
      esrs_standard: m.esrs_standard,
      relevanceScore: m.relevanceScore,
      totalVotes: Number(m.totalVotes),
      positiveVotes: Number(m.positiveVotes || 0),
      approvalPercentage:
        Number(m.totalVotes) > 0
          ? Math.round(
              (Number(m.positiveVotes || 0) / Number(m.totalVotes)) * 100
            )
          : 0,
    }));
  } catch (error) {
    serverLogger.error("[Database] Failed to get most-voted mappings:", error);
    return [];
  }
}

// ============================================================================
// Q&A Conversations
// ============================================================================

/**
 * Create a new Q&A conversation
 */
export async function createQAConversation(userId?: number, title?: string) {
  const db = await getDb();
  if (!db) return null;

  const schema = await getSchema();

  try {
    if (!schema.qaConversations) return null;

    const insertedId = await engineInsertReturningId(db, schema.qaConversations, {
      userId,
      title,
      messageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return {
      id: insertedId,
      userId,
      title,
      messageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    serverLogger.error("[Database] Failed to create conversation:", error);
    return null;
  }
}

/**
 * Add message to Q&A conversation
 */
export async function addQAMessage(data: {
  conversationId: number;
  role: "user" | "assistant";
  content: string;
  sources?: any[];
  retrievedChunks?: number;
}) {
  const db = await getDb();
  if (!db) return null;

  const schema = await getSchema();

  try {
    if (!schema.qaMessages || !schema.qaConversations) return null;

    const insertedId = await engineInsertReturningId(db, schema.qaMessages, {
      conversationId: data.conversationId,
      role: data.role,
      content: data.content,
      sources: data.sources as any,
      retrievedChunks: data.retrievedChunks,
      createdAt: new Date().toISOString(),
    });

    // Update conversation message count
    await db
      .update(schema.qaConversations)
      .set({
        messageCount: sql`${schema.qaConversations.messageCount} + 1`,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(schema.qaConversations.id, data.conversationId));

    return {
      id: insertedId,
      ...data,
      createdAt: new Date().toISOString(),
    };
  } catch (error) {
    serverLogger.error("[Database] Failed to add message:", error);
    return null;
  }
}

/**
 * Get Q&A conversation with messages
 */
export async function getQAConversation(conversationId: number) {
  const db = await getDb();
  if (!db) return null;

  const schema = await getSchema();

  try {
    if (!schema.qaConversations || !schema.qaMessages) return null;

    const conversation = await db
      .select()
      .from(schema.qaConversations)
      .where(eq(schema.qaConversations.id, conversationId))
      .limit(1);

    if (conversation.length === 0) return null;

    const messages = await db
      .select()
      .from(schema.qaMessages)
      .where(eq(schema.qaMessages.conversationId, conversationId))
      .orderBy(schema.qaMessages.createdAt);

    return {
      ...conversation[0],
      messages,
    };
  } catch (error) {
    serverLogger.error("[Database] Failed to get conversation:", error);
    return null;
  }
}

/**
 * Get user's Q&A conversations
 */
export async function getUserQAConversations(
  userId: number,
  limit: number = 20
) {
  const db = await getDb();
  if (!db) return [];

  const schema = await getSchema();

  try {
    if (!schema.qaConversations) return [];

    return await db
      .select()
      .from(schema.qaConversations)
      .where(eq(schema.qaConversations.userId, userId))
      .orderBy(desc(schema.qaConversations.updatedAt))
      .limit(limit);
  } catch (error) {
    serverLogger.error("[Database] Failed to get conversations:", error);
    return [];
  }
}

/**
 * Delete Q&A conversation
 */
export async function deleteQAConversation(
  conversationId: number,
  userId: number
) {
  const db = await getDb();
  if (!db) return false;

  const schema = await getSchema();

  try {
    if (!schema.qaConversations || !schema.qaMessages) return false;

    const conversation = await db
      .select()
      .from(schema.qaConversations)
      .where(eq(schema.qaConversations.id, conversationId))
      .limit(1);

    if (conversation.length === 0 || conversation[0].userId !== userId) {
      return false;
    }

    await db
      .delete(schema.qaMessages)
      .where(eq(schema.qaMessages.conversationId, conversationId));

    await db
      .delete(schema.qaConversations)
      .where(eq(schema.qaConversations.id, conversationId));

    return true;
  } catch (error) {
    serverLogger.error("[Database] Failed to delete conversation:", error);
    return false;
  }
}

// ============================================================================
// DUTCH INITIATIVES (only available on MySQL for now)
// ============================================================================

export async function getDutchInitiatives(filters?: {
  sector?: string;
  status?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  try {
    const schema = await import("../drizzle_pg/schema");
    if (!schema.dutchInitiatives) return [];

    let query = db.select().from(schema.dutchInitiatives);

    const conditions = [];
    if (filters?.sector) {
      conditions.push(eq(schema.dutchInitiatives.sector, filters.sector));
    }
    if (filters?.status) {
      conditions.push(eq(schema.dutchInitiatives.status, filters.status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return await query;
  } catch (error) {
    serverLogger.error("[Database] Failed to get Dutch initiatives:", error);
    return [];
  }
}

export async function getDutchInitiativeWithMappings(initiativeId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const schema = await import("../drizzle_pg/schema");
    if (!schema.dutchInitiatives) return null;

    const [initiative] = await db
      .select()
      .from(schema.dutchInitiatives)
      .where(eq(schema.dutchInitiatives.id, initiativeId));

    if (!initiative) return null;

    const regMappings = schema.initiativeRegulationMappings
      ? await db
          .select({
            id: schema.initiativeRegulationMappings.id,
            relationshipType: schema.initiativeRegulationMappings.relationshipType,
            description: schema.initiativeRegulationMappings.description,
            regulation: schema.regulations,
          })
          .from(schema.initiativeRegulationMappings)
          .leftJoin(
            schema.regulations,
            eq(schema.initiativeRegulationMappings.regulationId, schema.regulations.id)
          )
          .where(eq(schema.initiativeRegulationMappings.initiativeId, initiativeId))
      : [];

    const stdMappings = schema.initiativeStandardMappings
      ? await db
          .select({
            id: schema.initiativeStandardMappings.id,
            criticality: schema.initiativeStandardMappings.criticality,
            implementationNotes: schema.initiativeStandardMappings.implementationNotes,
            standard: schema.gs1Standards,
          })
          .from(schema.initiativeStandardMappings)
          .leftJoin(
            schema.gs1Standards,
            eq(schema.initiativeStandardMappings.standardId, schema.gs1Standards.id)
          )
          .where(eq(schema.initiativeStandardMappings.initiativeId, initiativeId))
      : [];

    return {
      initiative,
      regulationMappings: regMappings,
      standardMappings: stdMappings,
    };
  } catch (error) {
    serverLogger.error("[Database] Failed to get Dutch initiative with mappings:", error);
    return null;
  }
}

export async function getDutchInitiativeSectors() {
  const db = await getDb();
  if (!db) return [];

  try {
    const schema = await import("../drizzle_pg/schema");
    if (!schema.dutchInitiatives) return [];

    const result = await db
      .selectDistinct({ sector: schema.dutchInitiatives.sector })
      .from(schema.dutchInitiatives);

    return result.map((r: any) => r.sector);
  } catch (error) {
    serverLogger.error("[Database] Failed to get Dutch initiative sectors:", error);
    return [];
  }
}
