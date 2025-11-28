import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, regulations, gs1Standards, regulationStandardMappings, userAnalyses, regulatoryChangeAlerts, userPreferences, InsertContact, contacts, hubNews, userAlerts } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
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
    console.warn("[Database] Cannot upsert user: database not available");
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
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

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
      return await db.select().from(regulations).where(eq(regulations.regulationType, type as any));
    }
    return await db.select().from(regulations).orderBy(desc(regulations.createdAt));
  } catch (error) {
    console.error("[Database] Failed to get regulations:", error);
    return [];
  }
}

/**
 * Get a single regulation by ID with its mapped standards
 */
export async function getRegulationWithStandards(regulationId: number) {
  const db = await getDb();
  if (!db) return null;

  try {
    const regulation = await db.select().from(regulations).where(eq(regulations.id, regulationId)).limit(1);
    if (!regulation.length) return null;

    const mappings = await db
      .select()
      .from(regulationStandardMappings)
      .where(eq(regulationStandardMappings.regulationId, regulationId));

    const standardIds = mappings.map(m => m.standardId);
    const standards: typeof gs1Standards.$inferSelect[] = [];
    if (standardIds.length > 0) {
      const result = await db.select().from(gs1Standards).where(eq(gs1Standards.id, standardIds[0]));
      standards.push(...result);
    }

    return {
      regulation: regulation[0],
      mappings,
      standards
    };
  } catch (error) {
    console.error("[Database] Failed to get regulation with standards:", error);
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
    return await db.select().from(gs1Standards).orderBy(gs1Standards.standardCode);
  } catch (error) {
    console.error("[Database] Failed to get GS1 standards:", error);
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
    console.error("[Database] Failed to get regulatory changes:", error);
    return [];
  }
}

/**
 * Get user's analysis history
 */
export async function getUserAnalysisHistory(userId: number, limit: number = 20) {
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
    console.error("[Database] Failed to get user analysis history:", error);
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
    console.error("[Database] Failed to create user analysis:", error);
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
      notificationsEnabled: true,
    });

    const result = await db
      .select()
      .from(userPreferences)
      .where(eq(userPreferences.userId, userId))
      .limit(1);
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get user preferences:", error);
    return null;
  }
}

/**
 * Create a new contact submission
 */
export async function createContact(contact: InsertContact) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create contact: database not available");
    return null;
  }

  try {
    const result = await db.insert(contacts).values(contact);
    const newContact = await db
      .select()
      .from(contacts)
      .where(eq(contacts.id, Number(result[0].insertId)))
      .limit(1);
    return newContact.length > 0 ? newContact[0] : null;
  } catch (error) {
    console.error("[Database] Failed to create contact:", error);
    throw error;
  }
}

/**
 * Get contacts with optional filtering
 */
export async function getContacts(limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get contacts: database not available");
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
    console.error("[Database] Failed to get contacts:", error);
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
    console.error("[Database] Failed to get dashboard stats:", error);
    return null;
  }
}


/**
 * Create a new hub news item
 */
export async function createHubNews(news: {
  title: string;
  content: string;
  newsType: "NEW_LAW" | "AMENDMENT" | "ENFORCEMENT" | "COURT_DECISION" | "GUIDANCE" | "PROPOSAL";
  sourceUrl?: string;
  sourceTitle?: string;
  relatedRegulationIds?: number[];
  summary?: string;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create hub news: database not available");
    return null;
  }

  try {
    const result = await db.insert(hubNews).values({
      title: news.title,
      content: news.content,
      newsType: news.newsType,
      sourceUrl: news.sourceUrl,
      sourceTitle: news.sourceTitle,
      relatedRegulationIds: news.relatedRegulationIds ? JSON.stringify(news.relatedRegulationIds) : null,
      summary: news.summary,
      publishedDate: new Date(),
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to create hub news:", error);
    return null;
  }
}

/**
 * Get recent hub news items
 */
export async function getRecentHubNews(limit: number = 20) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get hub news: database not available");
    return [];
  }

  try {
    return await db
      .select()
      .from(hubNews)
      .orderBy(desc(hubNews.publishedDate))
      .limit(limit);
  } catch (error) {
    console.error("[Database] Failed to get hub news:", error);
    return [];
  }
}

/**
 * Create a user alert preference
 */
export async function createUserAlert(alert: {
  userId: number;
  regulationId?: number;
  alertType: "REGULATION_UPDATE" | "DEADLINE_APPROACHING" | "NEW_REGULATION" | "ENFORCEMENT_ACTION";
  isActive?: boolean;
  daysBeforeDeadline?: number;
}) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create user alert: database not available");
    return null;
  }

  try {
    const result = await db.insert(userAlerts).values({
      userId: alert.userId,
      regulationId: alert.regulationId,
      alertType: alert.alertType,
      isActive: alert.isActive ?? true,
      daysBeforeDeadline: alert.daysBeforeDeadline,
    });
    return result;
  } catch (error) {
    console.error("[Database] Failed to create user alert:", error);
    return null;
  }
}

/**
 * Get user alerts
 */
export async function getUserAlerts(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user alerts: database not available");
    return [];
  }

  try {
    return await db.select().from(userAlerts).where(eq(userAlerts.userId, userId));
  } catch (error) {
    console.error("[Database] Failed to get user alerts:", error);
    return [];
  }
}

/**
 * Get users with active alerts for daily digest
 */
export async function getUsersWithActiveAlerts() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get users with alerts: database not available");
    return [];
  }

  try {
    return await db
      .selectDistinct({ userId: userAlerts.userId })
      .from(userAlerts)
      .where(eq(userAlerts.isActive, true));
  } catch (error) {
    console.error("[Database] Failed to get users with active alerts:", error);
    return [];
  }
}


/**
 * Get ESRS datapoint mappings for a regulation
 */
export async function getRegulationEsrsMappings(regulationId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get regulation ESRS mappings: database not available");
    return [];
  }

  try {
    const { regulationEsrsMappings, esrsDatapoints } = await import("../drizzle/schema");
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
          datapointId: esrsDatapoints.datapointId,
          esrsStandard: esrsDatapoints.esrsStandard,
          disclosureRequirement: esrsDatapoints.disclosureRequirement,
          name: esrsDatapoints.name,
          dataType: esrsDatapoints.dataType,
          voluntary: esrsDatapoints.voluntary,
        },
      })
      .from(regulationEsrsMappings)
      .leftJoin(esrsDatapoints, eq(regulationEsrsMappings.datapointId, esrsDatapoints.id))
      .where(eq(regulationEsrsMappings.regulationId, regulationId))
      .orderBy(regulationEsrsMappings.relevanceScore);
  } catch (error) {
    console.error("[Database] Failed to get regulation ESRS mappings:", error);
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
    console.warn("[Database] Cannot upsert regulation ESRS mapping: database not available");
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
          updatedAt: new Date(),
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
      return { id: Number(result.insertId), ...mapping };
    }
  } catch (error) {
    console.error("[Database] Failed to upsert regulation ESRS mapping:", error);
    return null;
  }
}

/**
 * Delete all ESRS mappings for a regulation (for re-generation)
 */
export async function deleteRegulationEsrsMappings(regulationId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete regulation ESRS mappings: database not available");
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
    console.error("[Database] Failed to delete regulation ESRS mappings:", error);
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
    console.warn("[Database] Cannot submit mapping feedback: database not available");
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
        .set({ vote: params.vote })
        .where(eq(mappingFeedback.id, existing[0].id));
      return { ...existing[0], vote: params.vote };
    } else {
      // Insert new vote
      const result = await db.insert(mappingFeedback).values(params);
      return { id: Number(result.insertId), ...params };
    }
  } catch (error) {
    console.error("[Database] Failed to submit mapping feedback:", error);
    return null;
  }
}

/**
 * Get user's feedback for a specific mapping
 */
export async function getUserMappingFeedback(userId: number, mappingId: number) {
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
    console.error("[Database] Failed to get user mapping feedback:", error);
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
    console.error("[Database] Failed to get mapping feedback stats:", error);
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

    stats.forEach((stat) => {
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
    console.error("[Database] Failed to get batch mapping feedback stats:", error);
    return {};
  }
}
