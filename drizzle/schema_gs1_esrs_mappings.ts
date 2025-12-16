/**
 * GS1-ESRS Data Point Mappings Schema
 * 
 * Source: GS1 Europe CSRD White Paper v1.0 (March 2025)
 * Authority: GS1 in Europe (Rank 2 - Official standards body)
 * Purpose: Store authoritative mappings between GS1 standards and ESRS disclosure requirements
 * 
 * This schema captures the 15 official GS1-ESRS data point mappings identified by GS1 Europe
 * for efficient CSRD compliance using GS1 standards as the common data exchange framework.
 */

import { mysqlTable, int, varchar, text, mysqlEnum, timestamp } from 'drizzle-orm/mysql-core';

/**
 * GS1-ESRS Data Point Mappings
 * 
 * Stores the authoritative mappings between GS1 standards and ESRS disclosure requirements
 * as defined in the GS1 Europe CSRD White Paper (March 2025).
 */
export const gs1EsrsMappings = mysqlTable('gs1_esrs_mappings', {
  // Primary key
  mappingId: int('mapping_id').primaryKey(),
  
  // Mapping level (product or company)
  level: mysqlEnum('level', ['product', 'company']).notNull(),
  
  // ESRS reference
  esrsStandard: varchar('esrs_standard', { length: 50 }).notNull(), // e.g., 'ESRS E1', 'ESRS E2', 'ESRS E5', 'ESRS S2'
  esrsTopic: varchar('esrs_topic', { length: 255 }).notNull(), // e.g., 'Climate change', 'Pollution', 'Resource use and circular economy'
  
  // Data point details
  dataPointName: text('data_point_name').notNull(), // Full ESRS data point name
  shortName: varchar('short_name', { length: 512 }).notNull(), // Short/common name for the data point
  definition: text('definition').notNull(), // Full definition from ESRS
  
  // GS1 relevance
  gs1Relevance: text('gs1_relevance').notNull(), // How GS1 standards enable this data point
  
  // Provenance
  sourceDocument: varchar('source_document', { length: 255 }).default('GS1 Europe CSRD White Paper v1.0'),
  sourceDate: varchar('source_date', { length: 20 }).default('2025-03-21'),
  sourceAuthority: varchar('source_authority', { length: 100 }).default('GS1 in Europe'),
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
});

/**
 * GS1 WebVoc Attribute to ESRS Mapping
 * 
 * Links specific GS1 WebVoc attributes/properties to ESRS data points.
 * This enables automated mapping from product master data to ESRS disclosures.
 */
export const gs1AttributeEsrsMapping = mysqlTable('gs1_attribute_esrs_mapping', {
  // Primary key
  id: int('id').autoincrement().primaryKey(),
  
  // GS1 WebVoc reference
  gs1AttributeId: varchar('gs1_attribute_id', { length: 255 }).notNull(), // GS1 WebVoc term ID (e.g., 'gs1:netWeight')
  gs1AttributeName: varchar('gs1_attribute_name', { length: 255 }).notNull(), // Human-readable name
  
  // ESRS mapping reference
  esrsMappingId: int('esrs_mapping_id').notNull(),
  
  // Mapping details
  mappingType: mysqlEnum('mapping_type', ['direct', 'calculated', 'aggregated']).notNull(),
  mappingNotes: text('mapping_notes'), // Implementation notes
  
  // Confidence and validation
  confidence: mysqlEnum('confidence', ['high', 'medium', 'low']).notNull(),
  validatedBy: varchar('validated_by', { length: 255 }), // Who validated this mapping
  validatedAt: timestamp('validated_at'), // When validated
  
  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow().notNull()
});

/**
 * Export all GS1-ESRS mapping tables
 */
export const gs1EsrsMappingTables = {
  gs1EsrsMappings,
  gs1AttributeEsrsMapping
};
