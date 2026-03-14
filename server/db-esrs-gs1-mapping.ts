/**
 * Database Helper Functions for ESRS-GS1 Mapping
 *
 * Provides data access layer for ESRS-GS1 compliance mapping queries.
 * E-03: Applies confidence decay to mappings whose source material is stale or
 * whose underlying regulation has been flagged for re-verification.
 */

import { getDb } from './db.js';
import { sql } from 'drizzle-orm';

// ---------------------------------------------------------------------------
// E-03: Confidence decay helpers
// ---------------------------------------------------------------------------

type ConfidenceLevel = 'high' | 'medium' | 'low';

interface ConfidenceDecayResult {
  effectiveConfidence: ConfidenceLevel;
  decayReason: string | null;
}

const DECAY_90_DAYS_MS = 90 * 24 * 60 * 60 * 1000;
const DECAY_180_DAYS_MS = 180 * 24 * 60 * 60 * 1000;

/**
 * Computes an effective confidence level that may be lower than the stored
 * confidence when the source material is stale or the regulation is flagged
 * for verification.
 *
 * @param confidence - Original stored confidence level
 * @param sourceDateStr - ISO date string of the source document (nullable)
 * @param regulationNeedsVerification - Whether any linked regulation is flagged
 */
function computeEffectiveConfidence(
  confidence: string,
  sourceDateStr: string | null | undefined,
  regulationNeedsVerification: boolean = false
): ConfidenceDecayResult {
  const base = (confidence || 'low') as ConfidenceLevel;
  const reasons: string[] = [];

  let decayed = base;

  if (sourceDateStr) {
    const ageDays = Date.now() - new Date(sourceDateStr).getTime();
    if (ageDays >= DECAY_180_DAYS_MS) {
      if (decayed === 'high') decayed = 'low';
      else if (decayed === 'medium') decayed = 'low';
      reasons.push('source_age_180d');
    } else if (ageDays >= DECAY_90_DAYS_MS) {
      if (decayed === 'high') decayed = 'medium';
      reasons.push('source_age_90d');
    }
  }

  if (regulationNeedsVerification) {
    if (decayed === 'high') decayed = 'medium';
    reasons.push('regulation_needs_verification');
  }

  return {
    effectiveConfidence: decayed,
    decayReason: reasons.length > 0 ? reasons.join(', ') : null,
  };
}

/**
 * Applies confidence decay to an array of mapping rows returned from the DB.
 * Expects rows that may have `confidence` and `source_date` fields.
 */
function applyDecayToRows<T extends Record<string, unknown>>(
  rows: T[],
  regulationNeedsVerification: boolean = false
): (T & ConfidenceDecayResult)[] {
  return rows.map((row) => {
    const { effectiveConfidence, decayReason } = computeEffectiveConfidence(
      row.confidence as string,
      row.source_date as string | null,
      regulationNeedsVerification
    );
    return { ...row, effectiveConfidence, decayReason };
  });
}

function extractRows(result: unknown): Record<string, unknown>[] {
  if (Array.isArray(result)) {
    if (result.length === 0) return [];
    if (
      result[0] &&
      typeof result[0] === "object" &&
      !Array.isArray(result[0])
    ) {
      return result as Record<string, unknown>[];
    }
    const maybeRows = result[0];
    return Array.isArray(maybeRows) ? (maybeRows as Record<string, unknown>[]) : [];
  }

  if (
    result &&
    typeof result === "object" &&
    "rows" in result &&
    Array.isArray((result as { rows?: unknown }).rows)
  ) {
    return ((result as { rows: unknown[] }).rows ?? []) as Record<string, unknown>[];
  }

  return [];
}

function normalizeEsrsStandardInput(esrsStandard: string): string {
  const normalized = String(esrsStandard || "")
    .trim()
    .toUpperCase()
    .replace(/^ESRS\s+/, "");

  if (normalized === "2" || normalized === "ESRS 2") {
    return "ESRS 2";
  }

  const match = normalized.match(/^([ESAG]\d+)(?:-\d+)?$/);
  return match ? match[1] : normalized;
}

/**
 * Get all GS1-ESRS data point mappings
 */
export async function getAllEsrsGs1Mappings() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.execute(sql`
    SELECT
      mapping_id,
      level,
      esrs_standard,
      esrs_standard as esrsStandard,
      esrs_topic,
      data_point_name,
      short_name,
      definition,
      gs1_relevance,
      source_document,
      source_date,
      source_authority
    FROM gs1_esrs_mappings
    ORDER BY esrs_standard, mapping_id
  `);

  return applyDecayToRows(extractRows(result));
}

/**
 * Get mappings for a specific ESRS standard (e.g., "ESRS E1", "ESRS E5")
 */
export async function getEsrsGs1MappingsByStandard(esrs_standard: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  const normalizedStandard = normalizeEsrsStandardInput(esrs_standard);

  const result = await db.execute(sql`
    SELECT
      m.mapping_id,
      m.level,
      m.esrs_standard,
      m.esrs_standard as esrsStandard,
      m.esrs_topic,
      m.data_point_name,
      m.short_name,
      m.definition,
      m.gs1_relevance,
      m.source_date,
      COALESCE(BOOL_OR(r.needs_verification), FALSE) as regulation_needs_verification
    FROM gs1_esrs_mappings m
    LEFT JOIN esrs_datapoints ed ON ed.esrs_standard = m.esrs_standard
    LEFT JOIN regulation_esrs_mappings rem ON rem.datapoint_id = ed.id
    LEFT JOIN regulations r ON r.id = rem.regulation_id
    WHERE m.esrs_standard = ${normalizedStandard}
    GROUP BY m.mapping_id, m.level, m.esrs_standard, m.esrs_topic, m.data_point_name,
             m.short_name, m.definition, m.gs1_relevance, m.source_date
    ORDER BY m.mapping_id
  `);

  const rows = extractRows(result);
  return rows.map((row) => {
    const regulationNeedsVerification = Boolean(row.regulation_needs_verification);
    const { effectiveConfidence, decayReason } = computeEffectiveConfidence(
      row.confidence as string,
      row.source_date as string | null,
      regulationNeedsVerification
    );
    return { ...row, effectiveConfidence, decayReason };
  });
}

/**
 * Get GS1 attributes that map to a specific ESRS requirement
 */
export async function getGs1AttributesForEsrsMapping(esrsMappingId: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.execute(sql`
    SELECT
      a.id,
      a.gs1_attribute_id,
      a.gs1_attribute_name,
      a.mapping_type,
      a.mapping_notes,
      a.confidence,
      m.short_name as esrs_short_name,
      m.esrs_standard,
      m.esrs_standard as esrsStandard,
      m.esrs_topic,
      m.source_date,
      COALESCE(BOOL_OR(r.needs_verification), FALSE) as regulation_needs_verification
    FROM gs1_attribute_esrs_mapping a
    JOIN gs1_esrs_mappings m ON a.esrs_mapping_id = m.mapping_id
    LEFT JOIN esrs_datapoints ed ON ed.esrs_standard = m.esrs_standard
    LEFT JOIN regulation_esrs_mappings rem ON rem.datapoint_id = ed.id
    LEFT JOIN regulations r ON r.id = rem.regulation_id
    WHERE a.esrs_mapping_id = ${esrsMappingId}
    GROUP BY a.id, a.gs1_attribute_id, a.gs1_attribute_name, a.mapping_type,
             a.mapping_notes, a.confidence, m.short_name, m.esrs_standard,
             m.esrs_topic, m.source_date
    ORDER BY a.confidence DESC, a.gs1_attribute_name
  `);

  const rows = extractRows(result);
  return rows.map((row) => {
    const { effectiveConfidence, decayReason } = computeEffectiveConfidence(
      row.confidence as string,
      row.source_date as string | null,
      Boolean(row.regulation_needs_verification)
    );
    return { ...row, effectiveConfidence, decayReason };
  });
}

/**
 * Get all ESRS requirements that a specific GS1 attribute can satisfy
 */
export async function getEsrsRequirementsForGs1Attribute(gs1AttributeId: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const result = await db.execute(sql`
    SELECT 
      m.mapping_id,
      m.esrs_standard,
      m.esrs_standard as esrsStandard,
      m.esrs_topic,
      m.short_name,
      m.definition,
      a.mapping_type,
      a.mapping_notes,
      a.confidence
    FROM gs1_attribute_esrs_mapping a
    JOIN gs1_esrs_mappings m ON a.esrs_mapping_id = m.mapping_id
    WHERE a.gs1_attribute_id = ${gs1AttributeId}
    ORDER BY m.esrs_standard, m.mapping_id
  `);
  
  return extractRows(result);
}

/**
 * Get compliance coverage summary by ESRS standard
 */
export async function getComplianceCoverageSummary() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const result = await db.execute(sql`
    SELECT 
      m.esrs_standard,
      m.esrs_standard as esrsStandard,
      m.esrs_topic,
      COUNT(DISTINCT m.mapping_id) as total_requirements,
      COUNT(DISTINCT a.gs1_attribute_id) as mapped_attributes,
      SUM(CASE WHEN a.confidence = 'high' THEN 1 ELSE 0 END) as high_confidence_mappings,
      SUM(CASE WHEN a.confidence = 'medium' THEN 1 ELSE 0 END) as medium_confidence_mappings,
      SUM(CASE WHEN a.confidence = 'low' THEN 1 ELSE 0 END) as low_confidence_mappings
    FROM gs1_esrs_mappings m
    LEFT JOIN gs1_attribute_esrs_mapping a ON m.mapping_id = a.esrs_mapping_id
    GROUP BY m.esrs_standard, m.esrs_topic
    ORDER BY m.esrs_standard
  `);
  
  return extractRows(result);
}

/**
 * Get unmapped ESRS requirements (requirements without any GS1 attribute mappings)
 */
export async function getUnmappedEsrsRequirements() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const result = await db.execute(sql`
    SELECT 
      m.mapping_id,
      m.esrs_standard,
      m.esrs_standard as esrsStandard,
      m.esrs_topic,
      m.short_name,
      m.definition,
      m.gs1_relevance
    FROM gs1_esrs_mappings m
    LEFT JOIN gs1_attribute_esrs_mapping a ON m.mapping_id = a.esrs_mapping_id
    WHERE a.id IS NULL
    ORDER BY m.esrs_standard, m.mapping_id
  `);
  
  return extractRows(result);
}

/**
 * Search mappings by keyword
 */
export async function searchEsrsGs1Mappings(keyword: string) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const searchTerm = `%${keyword}%`;
  const result = await db.execute(sql`
    SELECT 
      m.mapping_id,
      m.esrs_standard as esrsStandard,
      m.esrs_topic,
      m.short_name,
      m.definition,
      m.gs1_relevance,
      COUNT(a.id) as attribute_count
    FROM gs1_esrs_mappings m
    LEFT JOIN gs1_attribute_esrs_mapping a ON m.mapping_id = a.esrs_mapping_id
    WHERE 
      m.short_name LIKE ${searchTerm}
      OR m.definition LIKE ${searchTerm}
      OR m.esrs_topic LIKE ${searchTerm}
      OR m.gs1_relevance LIKE ${searchTerm}
    GROUP BY m.mapping_id
    ORDER BY m.esrs_standard, m.mapping_id
  `);
  
  return extractRows(result);
}

/**
 * Get mapping statistics
 */
export async function getEsrsGs1MappingStatistics() {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  
  const stats = await db.execute(sql`
    SELECT 
      (SELECT COUNT(*) FROM gs1_esrs_mappings) as total_esrs_mappings,
      (SELECT COUNT(*) FROM gs1_esrs_mappings WHERE level = 'product') as product_level_mappings,
      (SELECT COUNT(*) FROM gs1_esrs_mappings WHERE level = 'company') as company_level_mappings,
      (SELECT COUNT(*) FROM gs1_attribute_esrs_mapping) as total_attribute_mappings,
      (SELECT COUNT(DISTINCT gs1_attribute_id) FROM gs1_attribute_esrs_mapping) as unique_gs1_attributes,
      (SELECT COUNT(*) FROM gs1_attribute_esrs_mapping WHERE confidence = 'high') as high_confidence,
      (SELECT COUNT(*) FROM gs1_attribute_esrs_mapping WHERE confidence = 'medium') as medium_confidence,
      (SELECT COUNT(*) FROM gs1_attribute_esrs_mapping WHERE confidence = 'low') as low_confidence
  `);
  
  const standardCoverage = await db.execute(sql`
    SELECT 
      esrs_standard,
      COUNT(*) as mapping_count
    FROM gs1_esrs_mappings
    GROUP BY esrs_standard
    ORDER BY esrs_standard
  `);
  
  return {
    overall: extractRows(stats)[0] ?? null,
    byStandard: extractRows(standardCoverage)
  };
}
