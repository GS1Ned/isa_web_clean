/**
 * Data Quality Helper Functions
 * Track B Priority 1: Data Quality Foundation
 * 
 * Uses existing schema fields only (no new fields added due to schema migration blocker)
 */

import { getDb } from "./db";
import { regulations, gs1Standards, regulationStandardMappings, esrsDatapoints } from "../drizzle/schema";
import { sql, count, isNull, and, or, eq } from "drizzle-orm";

/**
 * Get orphaned regulations (regulations with no standard mappings)
 */
export async function getOrphanedRegulations() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select({
      id: regulations.id,
      title: regulations.title,
      regulationType: regulations.regulationType,
      celexId: regulations.celexId,
    })
    .from(regulations)
    .leftJoin(
      regulationStandardMappings,
      eq(regulations.id, regulationStandardMappings.regulationId)
    )
    .where(isNull(regulationStandardMappings.id))
    .execute();

  return result;
}

/**
 * Get orphaned standards (standards with no regulation mappings)
 */
export async function getOrphanedStandards() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select({
      id: gs1Standards.id,
      standardName: gs1Standards.standardName,
      standardCode: gs1Standards.standardCode,
      category: gs1Standards.category,
    })
    .from(gs1Standards)
    .leftJoin(
      regulationStandardMappings,
      eq(gs1Standards.id, regulationStandardMappings.standardId)
    )
    .where(isNull(regulationStandardMappings.id))
    .execute();

  return result;
}

/**
 * Get regulations with missing critical metadata
 * Note: lifecycleStatus, publisher, jurisdiction fields not yet added to schema
 */
export async function getRegulationsWithMissingMetadata() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select({
      id: regulations.id,
      title: regulations.title,
      regulationType: regulations.regulationType,
      celexId: regulations.celexId,
      missingDescription: sql<boolean>`${regulations.description} IS NULL OR ${regulations.description} = ''`,
      missingSourceUrl: sql<boolean>`${regulations.sourceUrl} IS NULL OR ${regulations.sourceUrl} = ''`,
      missingEffectiveDate: sql<boolean>`${regulations.effectiveDate} IS NULL`,
    })
    .from(regulations)
    .where(
      or(
        isNull(regulations.description),
        eq(regulations.description, ""),
        isNull(regulations.sourceUrl),
        eq(regulations.sourceUrl, ""),
        isNull(regulations.effectiveDate)
      )
    )
    .execute();

  return result;
}

/**
 * Get standards with missing critical metadata
 * Note: lifecycleStatus, publisher fields not yet added to schema
 */
export async function getStandardsWithMissingMetadata() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select({
      id: gs1Standards.id,
      standardName: gs1Standards.standardName,
      standardCode: gs1Standards.standardCode,
      missingDescription: sql<boolean>`${gs1Standards.description} IS NULL OR ${gs1Standards.description} = ''`,
      missingCategory: sql<boolean>`${gs1Standards.category} IS NULL OR ${gs1Standards.category} = ''`,
      missingReferenceUrl: sql<boolean>`${gs1Standards.referenceUrl} IS NULL OR ${gs1Standards.referenceUrl} = ''`,
    })
    .from(gs1Standards)
    .where(
      or(
        isNull(gs1Standards.description),
        eq(gs1Standards.description, ""),
        isNull(gs1Standards.category),
        eq(gs1Standards.category, ""),
        isNull(gs1Standards.referenceUrl),
        eq(gs1Standards.referenceUrl, "")
      )
    )
    .execute();

  return result;
}

/**
 * Get data quality summary statistics
 */
export async function getDataQualitySummary() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Count total records
  const [totalRegulations] = await db.select({ count: count() }).from(regulations).execute();
  const [totalStandards] = await db.select({ count: count() }).from(gs1Standards).execute();
  const [totalMappings] = await db.select({ count: count() }).from(regulationStandardMappings).execute();
  const [totalEsrsDatapoints] = await db.select({ count: count() }).from(esrsDatapoints).execute();

  // Count orphaned records
  const orphanedRegs = await getOrphanedRegulations();
  const orphanedStds = await getOrphanedStandards();

  // Count records with missing metadata
  const regsWithMissingMetadata = await getRegulationsWithMissingMetadata();
  const stdsWithMissingMetadata = await getStandardsWithMissingMetadata();

  // Calculate quality scores (0-100)
  const regulationQualityScore = totalRegulations.count > 0
    ? Math.round(((totalRegulations.count - regsWithMissingMetadata.length) / totalRegulations.count) * 100)
    : 100;

  const standardQualityScore = totalStandards.count > 0
    ? Math.round(((totalStandards.count - stdsWithMissingMetadata.length) / totalStandards.count) * 100)
    : 100;

  const mappingCoverageScore = totalRegulations.count > 0
    ? Math.round(((totalRegulations.count - orphanedRegs.length) / totalRegulations.count) * 100)
    : 100;

  // Overall quality score (average of all scores)
  const overallQualityScore = Math.round(
    (regulationQualityScore + standardQualityScore + mappingCoverageScore) / 3
  );

  return {
    totalRecords: {
      regulations: totalRegulations.count,
      standards: totalStandards.count,
      mappings: totalMappings.count,
      esrsDatapoints: totalEsrsDatapoints.count,
    },
    orphanedRecords: {
      regulations: orphanedRegs.length,
      standards: orphanedStds.length,
    },
    missingMetadata: {
      regulations: regsWithMissingMetadata.length,
      standards: stdsWithMissingMetadata.length,
    },
    qualityScores: {
      regulationQuality: regulationQualityScore,
      standardQuality: standardQualityScore,
      mappingCoverage: mappingCoverageScore,
      overall: overallQualityScore,
    },
  };
}

/**
 * Get duplicate regulations (same celexId)
 */
export async function getDuplicateRegulations() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select({
      celexId: regulations.celexId,
      count: count(),
    })
    .from(regulations)
    .where(sql`${regulations.celexId} IS NOT NULL`)
    .groupBy(regulations.celexId)
    .having(sql`COUNT(*) > 1`)
    .execute();

  return result;
}

/**
 * Get duplicate standards (same standardCode)
 */
export async function getDuplicateStandards() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db
    .select({
      standardCode: gs1Standards.standardCode,
      count: count(),
    })
    .from(gs1Standards)
    .groupBy(gs1Standards.standardCode)
    .having(sql`COUNT(*) > 1`)
    .execute();

  return result;
}
