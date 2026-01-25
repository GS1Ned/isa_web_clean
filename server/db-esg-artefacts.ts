/**
 * EU ESG to GS1 Mapping Artefact Database Helpers
 * 
 * IMMUTABILITY: These functions query frozen artefact data.
 * No interpretation, transformation, or extension is performed.
 * 
 * Source: EU_ESG_to_GS1_Mapping_v1.1 (frozen, audit-defensible baseline)
 */

import { getDb } from "./db";
import { eq, desc, sql, and, inArray } from "drizzle-orm";
import { serverLogger } from "./_core/logger-wiring";

// ============================================================================
// Corpus (Regulatory Instruments)
// ============================================================================

/**
 * Get all regulatory instruments from the corpus
 */
export async function getEsgCorpus() {
  const db = await getDb();
  if (!db) return [];

  try {
    const { esgCorpus } = await import("../drizzle/schema");
    return await db.select().from(esgCorpus);
  } catch (error) {
    serverLogger.error("[Database] Failed to get ESG corpus:", error);
    return [];
  }
}

/**
 * Get a specific instrument by ID
 */
export async function getEsgInstrument(instrumentId: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const { esgCorpus } = await import("../drizzle/schema");
    const results = await db
      .select()
      .from(esgCorpus)
      .where(eq(esgCorpus.instrumentId, instrumentId))
      .limit(1);
    return results[0] || null;
  } catch (error) {
    serverLogger.error("[Database] Failed to get ESG instrument:", error);
    return null;
  }
}

// ============================================================================
// Obligations
// ============================================================================

/**
 * Get all obligations for an instrument
 */
export async function getEsgObligations(instrumentId?: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    const { esgObligations } = await import("../drizzle/schema");
    let query = db.select().from(esgObligations);
    
    if (instrumentId) {
      query = query.where(eq(esgObligations.instrumentId, instrumentId)) as typeof query;
    }
    
    return await query;
  } catch (error) {
    serverLogger.error("[Database] Failed to get ESG obligations:", error);
    return [];
  }
}

/**
 * Get a specific obligation by ID
 */
export async function getEsgObligation(obligationId: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const { esgObligations } = await import("../drizzle/schema");
    const results = await db
      .select()
      .from(esgObligations)
      .where(eq(esgObligations.obligationId, obligationId))
      .limit(1);
    return results[0] || null;
  } catch (error) {
    serverLogger.error("[Database] Failed to get ESG obligation:", error);
    return null;
  }
}

// ============================================================================
// Atomic Requirements
// ============================================================================

/**
 * Get atomic requirements, optionally filtered by obligation
 */
export async function getEsgAtomicRequirements(obligationId?: string) {
  const db = await getDb();
  if (!db) return [];

  try {
    const { esgAtomicRequirements } = await import("../drizzle/schema");
    let query = db.select().from(esgAtomicRequirements);
    
    if (obligationId) {
      query = query.where(eq(esgAtomicRequirements.obligationId, obligationId)) as typeof query;
    }
    
    return await query;
  } catch (error) {
    serverLogger.error("[Database] Failed to get ESG atomic requirements:", error);
    return [];
  }
}

/**
 * Get a specific atomic requirement by ID
 */
export async function getEsgAtomicRequirement(atomicId: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const { esgAtomicRequirements } = await import("../drizzle/schema");
    const results = await db
      .select()
      .from(esgAtomicRequirements)
      .where(eq(esgAtomicRequirements.atomicId, atomicId))
      .limit(1);
    return results[0] || null;
  } catch (error) {
    serverLogger.error("[Database] Failed to get ESG atomic requirement:", error);
    return null;
  }
}

// ============================================================================
// Data Requirements
// ============================================================================

/**
 * Get data requirements, optionally filtered
 */
export async function getEsgDataRequirements(filters?: {
  atomicId?: string;
  obligationId?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  try {
    const { esgDataRequirements } = await import("../drizzle/schema");
    let query = db.select().from(esgDataRequirements);
    
    if (filters?.atomicId) {
      query = query.where(eq(esgDataRequirements.atomicId, filters.atomicId)) as typeof query;
    }
    if (filters?.obligationId) {
      query = query.where(eq(esgDataRequirements.obligationId, filters.obligationId)) as typeof query;
    }
    
    return await query;
  } catch (error) {
    serverLogger.error("[Database] Failed to get ESG data requirements:", error);
    return [];
  }
}

/**
 * Get a specific data requirement by ID
 */
export async function getEsgDataRequirement(dataId: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const { esgDataRequirements } = await import("../drizzle/schema");
    const results = await db
      .select()
      .from(esgDataRequirements)
      .where(eq(esgDataRequirements.dataId, dataId))
      .limit(1);
    return results[0] || null;
  } catch (error) {
    serverLogger.error("[Database] Failed to get ESG data requirement:", error);
    return null;
  }
}

// ============================================================================
// GS1 Mappings
// ============================================================================

/**
 * Get GS1 mappings, optionally filtered by strength or score
 */
export async function getEsgGs1Mappings(filters?: {
  mappingStrength?: 'none' | 'partial' | 'strong';
  minScore?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  try {
    const { esgGs1Mappings } = await import("../drizzle/schema");
    let query = db.select().from(esgGs1Mappings);
    
    if (filters?.mappingStrength) {
      query = query.where(eq(esgGs1Mappings.mappingStrength, filters.mappingStrength)) as typeof query;
    }
    
    // Order by total score descending
    query = query.orderBy(desc(esgGs1Mappings.totalScore)) as typeof query;
    
    const results = await query;
    
    // Filter by min score if specified
    if (filters?.minScore !== undefined) {
      return results.filter(r => (r.totalScore || 0) >= filters.minScore!);
    }
    
    return results;
  } catch (error) {
    serverLogger.error("[Database] Failed to get ESG GS1 mappings:", error);
    return [];
  }
}

/**
 * Get GS1 mapping for a specific data requirement
 */
export async function getEsgGs1Mapping(dataId: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const { esgGs1Mappings } = await import("../drizzle/schema");
    const results = await db
      .select()
      .from(esgGs1Mappings)
      .where(eq(esgGs1Mappings.dataId, dataId))
      .limit(1);
    return results[0] || null;
  } catch (error) {
    serverLogger.error("[Database] Failed to get ESG GS1 mapping:", error);
    return null;
  }
}

// ============================================================================
// Full Traceability Chain
// ============================================================================

/**
 * Get full traceability chain from instrument to GS1 mapping
 * This is the core function for audit-defensible claims
 */
export async function getEsgTraceabilityChain(instrumentId: string) {
  const db = await getDb();
  if (!db) return null;

  try {
    const { 
      esgCorpus, 
      esgObligations, 
      esgAtomicRequirements, 
      esgDataRequirements, 
      esgGs1Mappings 
    } = await import("../drizzle/schema");

    // Get instrument
    const instrument = await db
      .select()
      .from(esgCorpus)
      .where(eq(esgCorpus.instrumentId, instrumentId))
      .limit(1);

    if (instrument.length === 0) return null;

    // Get obligations
    const obligations = await db
      .select()
      .from(esgObligations)
      .where(eq(esgObligations.instrumentId, instrumentId));

    const obligationIds = obligations.map(o => o.obligationId);

    // Get atomic requirements
    const atomicRequirements = obligationIds.length > 0
      ? await db
          .select()
          .from(esgAtomicRequirements)
          .where(inArray(esgAtomicRequirements.obligationId, obligationIds))
      : [];

    const atomicIds = atomicRequirements.map(a => a.atomicId);

    // Get data requirements
    const dataRequirements = atomicIds.length > 0
      ? await db
          .select()
          .from(esgDataRequirements)
          .where(inArray(esgDataRequirements.atomicId, atomicIds))
      : [];

    const dataIds = dataRequirements.map(d => d.dataId);

    // Get GS1 mappings
    const gs1Mappings = dataIds.length > 0
      ? await db
          .select()
          .from(esgGs1Mappings)
          .where(inArray(esgGs1Mappings.dataId, dataIds))
      : [];

    return {
      instrument: instrument[0],
      obligations,
      atomicRequirements,
      dataRequirements,
      gs1Mappings,
    };
  } catch (error) {
    serverLogger.error("[Database] Failed to get ESG traceability chain:", error);
    return null;
  }
}

/**
 * Get GS1 relevance summary for an instrument
 * Returns aggregated mapping strengths and top recommendations
 */
export async function getEsgGs1RelevanceSummary(instrumentId: string) {
  const chain = await getEsgTraceabilityChain(instrumentId);
  if (!chain) return null;

  const { gs1Mappings } = chain;

  // Count by mapping strength
  const strengthCounts = {
    strong: gs1Mappings.filter(m => m.mappingStrength === 'strong').length,
    partial: gs1Mappings.filter(m => m.mappingStrength === 'partial').length,
    none: gs1Mappings.filter(m => m.mappingStrength === 'none').length,
  };

  // Get top scored mappings
  const topMappings = [...gs1Mappings]
    .sort((a, b) => (b.totalScore || 0) - (a.totalScore || 0))
    .slice(0, 5);

  // Collect unique GS1 standards
  const allStandards = new Set<string>();
  for (const mapping of gs1Mappings) {
    if (Array.isArray(mapping.gs1Standards)) {
      for (const std of mapping.gs1Standards as string[]) {
        allStandards.add(std);
      }
    }
  }

  return {
    instrumentId,
    instrumentName: chain.instrument.name,
    totalDataRequirements: gs1Mappings.length,
    strengthCounts,
    relevantGS1Standards: Array.from(allStandards),
    topMappings: topMappings.map(m => ({
      dataId: m.dataId,
      mappingStrength: m.mappingStrength,
      gs1Capability: m.gs1Capability,
      totalScore: m.totalScore,
      justification: m.justification,
    })),
  };
}

// ============================================================================
// Statistics
// ============================================================================

/**
 * Get artefact statistics for dashboard
 */
export async function getEsgArtefactStats() {
  const db = await getDb();
  if (!db) return null;

  try {
    const { 
      esgCorpus, 
      esgObligations, 
      esgAtomicRequirements, 
      esgDataRequirements, 
      esgGs1Mappings 
    } = await import("../drizzle/schema");

    const [
      corpusCount,
      obligationsCount,
      atomicCount,
      dataCount,
      mappingsCount,
    ] = await Promise.all([
      db.select({ count: sql<number>`COUNT(*)` }).from(esgCorpus),
      db.select({ count: sql<number>`COUNT(*)` }).from(esgObligations),
      db.select({ count: sql<number>`COUNT(*)` }).from(esgAtomicRequirements),
      db.select({ count: sql<number>`COUNT(*)` }).from(esgDataRequirements),
      db.select({ count: sql<number>`COUNT(*)` }).from(esgGs1Mappings),
    ]);

    // Get mapping strength distribution
    const strengthDist = await db
      .select({
        strength: esgGs1Mappings.mappingStrength,
        count: sql<number>`COUNT(*)`,
      })
      .from(esgGs1Mappings)
      .groupBy(esgGs1Mappings.mappingStrength);

    return {
      corpus: corpusCount[0]?.count || 0,
      obligations: obligationsCount[0]?.count || 0,
      atomicRequirements: atomicCount[0]?.count || 0,
      dataRequirements: dataCount[0]?.count || 0,
      gs1Mappings: mappingsCount[0]?.count || 0,
      mappingStrengthDistribution: Object.fromEntries(
        strengthDist.map(s => [s.strength, s.count])
      ),
    };
  } catch (error) {
    serverLogger.error("[Database] Failed to get ESG artefact stats:", error);
    return null;
  }
}
