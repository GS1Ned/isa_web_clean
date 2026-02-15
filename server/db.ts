import { eq, desc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  regulations,
  gs1Standards,
  regulationStandardMappings,
  userAnalyses,
  regulatoryChangeAlerts,
  userPreferences,
  InsertContact,
  contacts,
  hubNews,
  userAlerts,
} from "../drizzle/schema";
import { ENV } from "./_core/env";
import { createMysqlPool } from "./db-connection";
import { serverLogger } from "./_core/logger-wiring";


let _db: Awaited<ReturnType<typeof drizzle>> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    serverLogger.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
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

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
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

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
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

  try {
    if (type) {
      return await db
        .select()
        .from(regulations)
        .where(eq(regulations.regulationType, type as any));
    }
    return await db
      .select()
      .from(regulations)
      .orderBy(desc(regulations.createdAt));
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

  try {
    // Check if regulation exists by celexId
    let existing = null;
    if (regulation.celexId) {
      const results = await db
        .select()
        .from(regulations)
        .where(eq(regulations.celexId, regulation.celexId))
        .limit(1);
      existing = results.length > 0 ? results[0] : null;
    }

    if (existing) {
      // Update existing regulation
      await db
        .update(regulations)
        .set({
          title: regulation.title,
          description: regulation.description,
          effectiveDate: regulation.effectiveDate ? (typeof regulation.effectiveDate === 'string' ? regulation.effectiveDate : regulation.effectiveDate.toISOString()) : null,
          sourceUrl: regulation.sourceUrl,
          regulationType: regulation.regulationType as any,
        })
        .where(eq(regulations.id, existing.id));

      return { id: existing.id, inserted: false, updated: true };
    } else {
      // Insert new regulation
      const result = await db.insert(regulations).values({
        title: regulation.title,
        celexId: regulation.celexId,
        description: regulation.description,
        effectiveDate: regulation.effectiveDate ? (typeof regulation.effectiveDate === 'string' ? regulation.effectiveDate : regulation.effectiveDate.toISOString()) : null,
        sourceUrl: regulation.sourceUrl,
        regulationType: regulation.regulationType as any,
      });

      const insertId = (result as any).insertId;
      return { id: Number(insertId), inserted: true, updated: false };
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

  try {
    const regulation = await db
      .select()
      .from(regulations)
      .where(eq(regulations.id, regulationId))
      .limit(1);
    if (!regulation.length) return null;

    const mappings = await db
      .select()
      .from(regulationStandardMappings)
      .where(eq(regulationStandardMappings.regulationId, regulationId));

    const standardIds = mappings.map(m => m.standardId);
    const standards: (typeof gs1Standards.$inferSelect)[] = [];
    if (standardIds.length > 0) {
      // Fetch all standards by their IDs
      for (const standardId of standardIds) {
        const result = await db
          .select()
          .from(gs1Standards)
          .where(eq(gs1Standards.id, standardId));
        if (result.length > 0) {
          standards.push(result[0]);
        }
      }
    }

    const result = {
      regulation: regulation[0],
      mappings,
      standards,
    };

    return result;
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

  try {
    return await db
      .select()
      .from(gs1Standards)
      .orderBy(gs1Standards.standardCode);
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

  try {
    return await db
      .select()
      .from(regulatoryChangeAlerts)
      .orderBy(desc(regulatoryChangeAlerts.detectedAt))
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

  try {
    return await db
      .select()
      .from(userAnalyses)
      .where(eq(userAnalyses.userId, userId))
      .orderBy(desc(userAnalyses.createdAt))
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
  analysisType: "CELEX" | "DOCUMENT_UPLOAD" | "URL" | "TEXT";
  detectedStandardsCount?: number;
  analysisResult?: any;
}) {
  const db = await getDb();
  if (!db) return null;

  try {
    const result = await db.insert(userAnalyses).values({
      userId: data.userId,
      regulationId: data.regulationId,
      documentTitle: data.documentTitle,
      documentUrl: data.documentUrl,
      analysisType: data.analysisType,
      detectedStandardsCount: data.detectedStandardsCount || 0,
      analysisResult: data.analysisResult,
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

  try {
    const existing = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);

    if (existing.length) {
      return existing[0];
    }

    // Create default preferences
    await db.insert(userPreferences).values({
      userId,
      notificationsEnabled: 1,
    });

    const result = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
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
export async function createContact(contact: InsertContact) {
  const db = await getDb();
  if (!db) {
    serverLogger.warn("[Database] Cannot create contact: database not available");
    return null;
  }

  try {
    const result = await db.insert(contacts).values(contact);
    const newContact = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, Number((result[0] as any).insertId)))
      .limit(1);
    return newContact.length > 0 ? newContact[0] : null;
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

  try {
    return await db
      .select()
      .from(contacts)
      .orderBy(desc(contacts.createdAt))
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

  try {
    const regulationCount = await db.select().from(regulations);
    const standardCount = await db.select().from(gs1Standards);
    const mappingCount = await db.select().from(regulationStandardMappings);
    const recentChanges = await db
      .select()
      .from(regulatoryChangeAlerts)
      .orderBy(desc(regulatoryChangeAlerts.detectedAt))
      .limit(5);

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
  newsType:
    | "NEW_LAW"
    | "AMENDMENT"
    | "ENFORCEMENT"
    | "COURT_DECISION"
    | "GUIDANCE"
    | "PROPOSAL";
  sourceUrl?: string;
  sourceTitle?: string;
  sourceType?:
    | "EU_OFFICIAL"
    | "GS1_OFFICIAL"
    | "DUTCH_NATIONAL"
    | "INDUSTRY"
    | "MEDIA";
  relatedRegulationIds?: number[];
  regulationTags?: string[];
  impactLevel?: "LOW" | "MEDIUM" | "HIGH";
  credibilityScore?: string;
  publishedDate?: Date | string;
  retrievedAt?: Date | string;
  isAutomated?: boolean | number;
  summary?: string;

  // GS1-specific fields
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

  try {
    const result = await db.insert(hubNews).values({
      title: news.title,
      content: news.content,
      newsType: news.newsType,
      sourceUrl: news.sourceUrl,
      sourceTitle: news.sourceTitle,
      sourceType: news.sourceType,
      relatedRegulationIds: news.relatedRegulationIds
        ? JSON.stringify(news.relatedRegulationIds)
        : null,
      regulationTags: news.regulationTags || null,
      impactLevel: news.impactLevel,
      credibilityScore: news.credibilityScore,
      publishedDate: news.publishedDate ? (typeof news.publishedDate === 'string' ? news.publishedDate : news.publishedDate.toISOString()) : new Date().toISOString(),
      retrievedAt: news.retrievedAt ? (typeof news.retrievedAt === 'string' ? news.retrievedAt : news.retrievedAt.toISOString()) : new Date().toISOString(),
      isAutomated: news.isAutomated ? 1 : 0,
      summary: news.summary,

      // GS1-specific fields
      gs1ImpactTags: news.gs1ImpactTags || null,
      sectorTags: news.sectorTags || null,
      relatedStandardIds: news.relatedStandardIds || null,
      gs1ImpactAnalysis: news.gs1ImpactAnalysis || null,
      suggestedActions: news.suggestedActions || null,
      sources: news.sources || null,
    });
    const insertId = (result as any).insertId;
    return { id: Number(insertId) };
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

  try {
    return await db
      .select()
      .from(hubNews)
      .orderBy(desc(hubNews.publishedDate))
      .limit(limit);
  } catch (error) {
    serverLogger.error("[Database] Failed to get hub news:", error);
    return [];
  }
}

/**
 * Create a user alert preference
 */
export async function createUserAlert(alert: {
  userId: number;
  regulationId?: number;
  alertType:
    | "REGULATION_UPDATE"
    | "DEADLINE_APPROACHING"
    | "NEW_REGULATION"
    | "ENFORCEMENT_ACTION";
  isActive?: boolean;
  daysBeforeDeadline?: number;
}) {
  const db = await getDb();
  if (!db) {
    serverLogger.warn("[Database] Cannot create user alert: database not available");
    return null;
  }

  try {
    const result = await db.insert(userAlerts).values({
      userId: alert.userId,
      regulationId: alert.regulationId,
      alertType: alert.alertType,
      isActive: alert.isActive ? 1 : 0,
      daysBeforeDeadline: alert.daysBeforeDeadline,
    });
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

  try {
    return await db
      .select()
      .from(userAlerts)
      .where(eq(userAlerts.userId, userId));
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

  try {
    return await db
      .selectDistinct({ userId: userAlerts.userId })
      .from(userAlerts)
      .where(eq(userAlerts.isActive, 1));
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

  try {
    const { regulationEsrsMappings, esrsDatapoints } = await import(
      "../drizzle/schema"
    );
    const { eq } = await import("drizzle-orm");

    return await db
      .select({
        id: regulationEsrsMappings.id,
        regulationId: regulationEsrsMappings.regulationId,
        datapointId: regulationEsrsMappings.datapointId,
        relevanceScore: regulationEsrsMappings.relevanceScore,
        reasoning: regulationEsrsMappings.reasoning,
        createdAt: regulationEsrsMappings.createdAt,
        // Join with datapoint details
        datapoint: {
          id: esrsDatapoints.id,
          datapointId: esrsDatapoints.code,
          esrs_standard: esrsDatapoints.esrsStandard,
          disclosure_requirement: esrsDatapoints.disclosureRequirement,
          datapointName: esrsDatapoints.name,
          data_type: esrsDatapoints.dataType,
          mayVoluntary: esrsDatapoints.voluntary,
        },
      })
      .from(regulationEsrsMappings)
      .leftJoin(
        esrsDatapoints,
        eq(regulationEsrsMappings.datapointId, esrsDatapoints.id)
      )
      .where(eq(regulationEsrsMappings.regulationId, regulationId))
      .orderBy(regulationEsrsMappings.relevanceScore);
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

  try {
    const { regulationEsrsMappings } = await import("../drizzle/schema");
    const { eq, and } = await import("drizzle-orm");

    // Check if mapping already exists
    const existing = await db
      .select()
      .from(regulationEsrsMappings)
      .where(
        and(
          eq(regulationEsrsMappings.regulationId, mapping.regulationId),
          eq(regulationEsrsMappings.datapointId, mapping.datapointId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing mapping
      await db
        .update(regulationEsrsMappings)
        .set({
          relevanceScore: mapping.relevanceScore,
          reasoning: mapping.reasoning,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(regulationEsrsMappings.id, existing[0].id));
      return existing[0];
    } else {
      // Insert new mapping
      const result = await db.insert(regulationEsrsMappings).values({
        regulationId: mapping.regulationId,
        datapointId: mapping.datapointId,
        relevanceScore: mapping.relevanceScore,
        reasoning: mapping.reasoning,
      });
      return { id: Number((result as any).insertId), ...mapping };
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
    serverLogger.warn(
      "[Database] Cannot delete regulation ESRS mappings: database not available"
    );
    return false;
  }

  try {
    const { regulationEsrsMappings } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");

    await db
      .delete(regulationEsrsMappings)
      .where(eq(regulationEsrsMappings.regulationId, regulationId));
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

  try {
    const { mappingFeedback } = await import("../drizzle/schema");
    const { eq, and } = await import("drizzle-orm");

    // Check if user already voted on this mapping
    const existing = await db
      .select()
      .from(mappingFeedback)
      .where(
        and(
          eq(mappingFeedback.userId, params.userId),
          eq(mappingFeedback.mappingId, params.mappingId)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      // Update existing vote
      await db
        .update(mappingFeedback)
        .set({ vote: params.vote ? 1 : 0 })
        .where(eq(mappingFeedback.id, existing[0].id));
      return { ...existing[0], vote: params.vote ? 1 : 0 };
    } else {
      // Insert new vote
      const result = await db.insert(mappingFeedback).values({
        userId: params.userId,
        mappingId: params.mappingId,
        vote: params.vote ? 1 : 0,
      });
      return { id: Number((result as any).insertId), userId: params.userId, mappingId: params.mappingId, vote: params.vote ? 1 : 0 };
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

  try {
    const { mappingFeedback } = await import("../drizzle/schema");
    const { eq, and } = await import("drizzle-orm");

    const result = await db
      .select()
      .from(mappingFeedback)
      .where(
        and(
          eq(mappingFeedback.userId, userId),
          eq(mappingFeedback.mappingId, mappingId)
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
 * Get aggregated feedback stats for a mapping (total votes, % positive)
 */
export async function getMappingFeedbackStats(mappingId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const { mappingFeedback } = await import("../drizzle/schema");
    const { eq, count, sql } = await import("drizzle-orm");

    const stats = await db
      .select({
        totalVotes: count(),
        positiveVotes: sql<number>`SUM(CASE WHEN ${mappingFeedback.vote} = 1 THEN 1 ELSE 0 END)`,
      })
      .from(mappingFeedback)
      .where(eq(mappingFeedback.mappingId, mappingId));

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
 * Get feedback stats for multiple mappings (batch operation)
 */
export async function getBatchMappingFeedbackStats(mappingIds: number[]) {
  const db = await getDb();
  if (!db || mappingIds.length === 0) return {};

  try {
    const { mappingFeedback } = await import("../drizzle/schema");
    const { inArray, count, sql } = await import("drizzle-orm");

    const stats = await db
      .select({
        mappingId: mappingFeedback.mappingId,
        totalVotes: count(),
        positiveVotes: sql<number>`SUM(CASE WHEN ${mappingFeedback.vote} = 1 THEN 1 ELSE 0 END)`,
      })
      .from(mappingFeedback)
      .where(inArray(mappingFeedback.mappingId, mappingIds))
      .groupBy(mappingFeedback.mappingId);

    // Convert to map for easy lookup
    const statsMap: Record<
      number,
      { totalVotes: number; positiveVotes: number; positivePercentage: number }
    > = {};

    stats.forEach(stat => {
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
 * Get low-scored ESRS mappings (< 50% approval)
 */
export async function getLowScoredMappings(minVotes: number = 3) {
  const db = await getDb();
  if (!db) return [];

  try {
    const { regulationEsrsMappings, esrsDatapoints, mappingFeedback } =
      await import("../drizzle/schema");
    const { count, sql, desc, gte } = await import("drizzle-orm");

    const lowScored = await db
      .select({
        mappingId: regulationEsrsMappings.id,
        regulationId: regulationEsrsMappings.regulationId,
        datapointId: regulationEsrsMappings.datapointId,
        datapointName: esrsDatapoints.name,
        esrs_standard: esrsDatapoints.esrsStandard,
        relevanceScore: regulationEsrsMappings.relevanceScore,
        reasoning: regulationEsrsMappings.reasoning,
        totalVotes: count(mappingFeedback.id),
        positiveVotes: sql<number>`SUM(CASE WHEN ${mappingFeedback.vote} = 1 THEN 1 ELSE 0 END)`,
      })
      .from(regulationEsrsMappings)
      .innerJoin(
        esrsDatapoints,
        sql`${regulationEsrsMappings.datapointId} = ${esrsDatapoints.id}`
      )
      .leftJoin(
        mappingFeedback,
        sql`${regulationEsrsMappings.id} = ${mappingFeedback.mappingId}`
      )
      .groupBy(regulationEsrsMappings.id)
      .having(
        sql`COUNT(${mappingFeedback.id}) >= ${minVotes} AND (SUM(CASE WHEN ${mappingFeedback.vote} = 1 THEN 1 ELSE 0 END) / COUNT(${mappingFeedback.id})) < 0.5`
      )
      .orderBy(desc(sql`COUNT(${mappingFeedback.id})`));

    return lowScored.map(m => ({
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

  try {
    const { regulationEsrsMappings, esrsDatapoints, mappingFeedback } =
      await import("../drizzle/schema");
    const { count, sql } = await import("drizzle-orm");

    const distribution = await db
      .select({
        esrs_standard: esrsDatapoints.esrsStandard,
        totalMappings: count(regulationEsrsMappings.id),
        totalVotes: count(mappingFeedback.id),
        positiveVotes: sql<number>`SUM(CASE WHEN ${mappingFeedback.vote} = 1 THEN 1 ELSE 0 END)`,
      })
      .from(regulationEsrsMappings)
      .innerJoin(
        esrsDatapoints,
        sql`${regulationEsrsMappings.datapointId} = ${esrsDatapoints.id}`
      )
      .leftJoin(
        mappingFeedback,
        sql`${regulationEsrsMappings.id} = ${mappingFeedback.mappingId}`
      )
      .groupBy(esrsDatapoints.esrsStandard);

    return distribution.map(d => ({
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

  try {
    const { regulationEsrsMappings, esrsDatapoints, mappingFeedback } =
      await import("../drizzle/schema");
    const { count, sql, desc } = await import("drizzle-orm");

    const mostVoted = await db
      .select({
        mappingId: regulationEsrsMappings.id,
        regulationId: regulationEsrsMappings.regulationId,
        datapointId: regulationEsrsMappings.datapointId,
        datapointName: esrsDatapoints.name,
        esrs_standard: esrsDatapoints.esrsStandard,
        relevanceScore: regulationEsrsMappings.relevanceScore,
        totalVotes: count(mappingFeedback.id),
        positiveVotes: sql<number>`SUM(CASE WHEN ${mappingFeedback.vote} = 1 THEN 1 ELSE 0 END)`,
      })
      .from(regulationEsrsMappings)
      .innerJoin(
        esrsDatapoints,
        sql`${regulationEsrsMappings.datapointId} = ${esrsDatapoints.id}`
      )
      .leftJoin(
        mappingFeedback,
        sql`${regulationEsrsMappings.id} = ${mappingFeedback.mappingId}`
      )
      .groupBy(regulationEsrsMappings.id)
      .having(sql`COUNT(${mappingFeedback.id}) > 0`)
      .orderBy(desc(count(mappingFeedback.id)))
      .limit(limit);

    return mostVoted.map(m => ({
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
// User Onboarding Progress Helpers
// ============================================================================

/**
 * TEMPORARILY DISABLED
 * userOnboardingProgress helpers were previously implemented here but relied on a
 * commented-out table/schema. Keeping the commented block caused churn and made
 * ongoing DB work harder to review.
 */
// If onboarding is re-enabled, reintroduce these helpers alongside the table/schema,
// and add tests or a migration to prevent regressions.

// ============================================================================
// DUTCH INITIATIVES
// ============================================================================

/**
 * Get all Dutch initiatives with optional filtering
 */
export async function getDutchInitiatives(filters?: {
  sector?: string;
  status?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  try {
    const { dutchInitiatives } = await import("../drizzle/schema");
    const { eq, and } = await import("drizzle-orm");

    let query = db.select().from(dutchInitiatives);

    const conditions = [];
    if (filters?.sector) {
      conditions.push(eq(dutchInitiatives.sector, filters.sector));
    }
    if (filters?.status) {
      conditions.push(eq(dutchInitiatives.status, filters.status));
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

/**
 * Get a single Dutch initiative with all its mappings
 */
export async function getDutchInitiativeWithMappings(initiativeId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const {
      dutchInitiatives,
      initiativeRegulationMappings,
      initiativeStandardMappings,
      regulations,
      gs1Standards,
    } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");

    // Get initiative
    const [initiative] = await db
      .select()
      .from(dutchInitiatives)
      .where(eq(dutchInitiatives.id, initiativeId));

    if (!initiative) return null;

    // Get regulation mappings
    const regMappings = await db
      .select({
        id: initiativeRegulationMappings.id,
        relationshipType: initiativeRegulationMappings.relationshipType,
        description: initiativeRegulationMappings.description,
        regulation: regulations,
      })
      .from(initiativeRegulationMappings)
      .leftJoin(
        regulations,
        eq(initiativeRegulationMappings.regulationId, regulations.id)
      )
      .where(eq(initiativeRegulationMappings.initiativeId, initiativeId));

    // Get standard mappings
    const stdMappings = await db
      .select({
        id: initiativeStandardMappings.id,
        criticality: initiativeStandardMappings.criticality,
        implementationNotes: initiativeStandardMappings.implementationNotes,
        standard: gs1Standards,
      })
      .from(initiativeStandardMappings)
      .leftJoin(
        gs1Standards,
        eq(initiativeStandardMappings.standardId, gs1Standards.id)
      )
      .where(eq(initiativeStandardMappings.initiativeId, initiativeId));

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

/**
 * Get unique sectors from Dutch initiatives
 */
export async function getDutchInitiativeSectors() {
  const db = await getDb();
  if (!db) return [];

  try {
    const { dutchInitiatives } = await import("../drizzle/schema");
    const { sql } = await import("drizzle-orm");

    const result = await db
      .selectDistinct({ sector: dutchInitiatives.sector })
      .from(dutchInitiatives);

    return result.map(r => r.sector);
  } catch (error) {
    serverLogger.error("[Database] Failed to get Dutch initiative sectors:", error);
    return [];
  }
}

// ============================================================================
// KNOWLEDGE EMBEDDINGS (MOVED)
// ============================================================================
// Deprecated embeddings helpers previously lived in this file; the active
// implementation is now in db-knowledge.ts and db-knowledge-vector.ts.

/**
 * Create a new Q&A conversation
 */
export async function createQAConversation(userId?: number, title?: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const { qaConversations } = await import("../drizzle/schema");

    const [result] = await db.insert(qaConversations).values({
      userId,
      title,
      messageCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return {
      id: result.insertId,
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

  try {
    const { qaMessages, qaConversations } = await import("../drizzle/schema");

    // Insert message
    const [result] = await db.insert(qaMessages).values({
      conversationId: data.conversationId,
      role: data.role,
      content: data.content,
      sources: data.sources as any,
      retrievedChunks: data.retrievedChunks,
      createdAt: new Date().toISOString(),
    });

    // Update conversation message count
    await db
      .update(qaConversations)
      .set({
        messageCount: sql`${qaConversations.messageCount} + 1`,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(qaConversations.id, data.conversationId));

    return {
      id: result.insertId,
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

  try {
    const { qaConversations, qaMessages } = await import("../drizzle/schema");

    // Get conversation
    const conversation = await db
      .select()
      .from(qaConversations)
      .where(eq(qaConversations.id, conversationId))
      .limit(1);

    if (conversation.length === 0) {
      return null;
    }

    // Get messages
    const messages = await db
      .select()
      .from(qaMessages)
      .where(eq(qaMessages.conversationId, conversationId))
      .orderBy(qaMessages.createdAt);

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

  try {
    const { qaConversations } = await import("../drizzle/schema");

    return await db
      .select()
      .from(qaConversations)
      .where(eq(qaConversations.userId, userId))
      .orderBy(desc(qaConversations.updatedAt))
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

  try {
    const { qaConversations, qaMessages } = await import("../drizzle/schema");

    // Verify ownership
    const conversation = await db
      .select()
      .from(qaConversations)
      .where(eq(qaConversations.id, conversationId))
      .limit(1);

    if (conversation.length === 0 || conversation[0].userId !== userId) {
      return false;
    }

    // Delete messages first
    await db
      .delete(qaMessages)
      .where(eq(qaMessages.conversationId, conversationId));

    // Delete conversation
    await db
      .delete(qaConversations)
      .where(eq(qaConversations.id, conversationId));

    return true;
  } catch (error) {
    serverLogger.error("[Database] Failed to delete conversation:", error);
    return false;
  }
}
