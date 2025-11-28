import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, regulations, gs1Standards, regulationStandardMappings, userAnalyses, regulatoryChangeAlerts, userPreferences, InsertContact, contacts } from "../drizzle/schema";
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
