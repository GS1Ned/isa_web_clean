/**
 * Database Helper Functions for ESRS-GS1 Mapping
 * 
 * Provides data access layer for ESRS-GS1 compliance mapping queries.
 */

import { getDb } from './db.js';
import { sql } from 'drizzle-orm';

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
  
  return result[0];
}

/**
 * Get mappings for a specific ESRS standard (e.g., "ESRS E1", "ESRS E5")
 */
export async function getEsrsGs1MappingsByStandard(esrs_standard: string) {
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
      gs1_relevance
    FROM gs1_esrs_mappings
    WHERE esrs_standard = ${esrs_standard}
    ORDER BY mapping_id
  `);
  
  return result[0];
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
      m.esrs_topic
    FROM gs1_attribute_esrs_mapping a
    JOIN gs1_esrs_mappings m ON a.esrs_mapping_id = m.mapping_id
    WHERE a.esrs_mapping_id = ${esrsMappingId}
    ORDER BY a.confidence DESC, a.gs1_attribute_name
  `);
  
  return result[0];
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
  
  return result[0];
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
  
  return result[0];
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
  
  return result[0];
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
  
  return result[0];
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
    overall: (stats[0] as any)[0],
    byStandard: standardCoverage[0]
  };
}
