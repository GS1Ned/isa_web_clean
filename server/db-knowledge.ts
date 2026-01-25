/**
 * Knowledge Base Database Helpers
 *
 * Simplified storage without vector embeddings.
 * Uses LLM-based relevance scoring for semantic search.
 */

import { getDb } from "./db";
import { eq, desc, sql } from "drizzle-orm";
import { generateContentHash, scoreRelevance } from "./embedding";
import { serverLogger } from "./_core/logger-wiring";


/**
 * Store knowledge chunk (without embeddings)
 */
export async function storeKnowledgeChunk(data: {
  sourceType: "regulation" | "standard" | "esrs_datapoint" | "dutch_initiative" | "esrs_gs1_mapping";
  sourceId: number;
  content: string;
  title: string;
  url?: string;
  datasetId?: string;
  datasetVersion?: string;
  lastVerifiedDate?: Date;
}) {
  const db = await getDb();
  if (!db) return null;

  try {
    const { knowledgeEmbeddings } = await import("../drizzle/schema");

    const contentHash = generateContentHash(data.content);

    // Check if chunk already exists
    const existing = await db
      .select()
      .from(knowledgeEmbeddings)
      .where(eq(knowledgeEmbeddings.contentHash, contentHash))
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    // Insert new chunk (embedding field will be null)
    const [result] = await db.insert(knowledgeEmbeddings).values({
      sourceType: data.sourceType,
      sourceId: data.sourceId,
      content: data.content,
      contentHash,
      embedding: [] as any, // Empty array instead of null for type compatibility
      embeddingModel: "llm-scoring",
      title: data.title,
      url: data.url,
      datasetId: data.datasetId,
      datasetVersion: data.datasetVersion,
      lastVerifiedDate: data.lastVerifiedDate ? (typeof data.lastVerifiedDate === 'string' ? data.lastVerifiedDate : data.lastVerifiedDate.toISOString()) : null,
      isDeprecated: 0,
      deprecationReason: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return result;
  } catch (error) {
    serverLogger.error("[Database] Failed to store knowledge chunk:", error);
    return null;
  }
}

/**
 * Search knowledge chunks using LLM-based relevance scoring
 */
export async function searchKnowledgeChunks(
  query: string,
  limit: number = 10,
  sourceTypes?: Array<
    "regulation" | "standard" | "esrs_datapoint" | "dutch_initiative" | "esrs_gs1_mapping"
  >
) {
  const db = await getDb();
  if (!db) return [];

  try {
    const { knowledgeEmbeddings } = await import("../drizzle/schema");

    // Fetch all chunks (or filtered by source type)
    let dbQuery = db.select().from(knowledgeEmbeddings);

    if (sourceTypes && sourceTypes.length > 0) {
      // Filter by source types
      dbQuery = dbQuery.where(
        sql`${knowledgeEmbeddings.sourceType} IN (${sql.join(
          sourceTypes.map(t => sql`${t}`),
          sql`, `
        )})`
      ) as any;
    }

    const chunks = await dbQuery;

    if (chunks.length === 0) {
      return [];
    }

    // Score relevance using LLM (in batches to avoid rate limits)
    const batchSize = 10;
    const scoredChunks = [];

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);

      const scoredBatch = await Promise.all(
        batch.map(async chunk => {
          const relevance = await scoreRelevance(query, chunk.content);
          return {
            ...chunk,
            similarity: relevance / 10, // Normalize to 0-1 for compatibility
          };
        })
      );

      scoredChunks.push(...scoredBatch);
    }

    // Sort by relevance and return top results
    return scoredChunks
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  } catch (error) {
    serverLogger.error("[Database] Failed to search knowledge chunks:", error);
    return [];
  }
}

/**
 * Get knowledge base statistics
 */
export async function getKnowledgeStats() {
  const db = await getDb();
  if (!db) return [];

  try {
    const { knowledgeEmbeddings } = await import("../drizzle/schema");

    const stats = await db
      .select({
        sourceType: knowledgeEmbeddings.sourceType,
        count: sql<number>`COUNT(*)`,
      })
      .from(knowledgeEmbeddings)
      .groupBy(knowledgeEmbeddings.sourceType);

    return stats;
  } catch (error) {
    serverLogger.error("[Database] Failed to get knowledge stats:", error);
    return [];
  }
}

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
