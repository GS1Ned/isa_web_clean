-- Migration: Add Enhanced Metadata to knowledge_embeddings
-- Date: 2026-02-01
-- Author: Manus AI
-- Description: Adds authority, provenance, and semantic layer metadata to improve ASK ISA quality

-- Step 1: Add authority and governance columns
ALTER TABLE knowledge_embeddings
ADD COLUMN authority_level ENUM('law', 'regulation', 'directive', 'standard', 'guidance', 'technical') 
  DEFAULT 'guidance' AFTER embeddingModel,
ADD COLUMN legal_status ENUM('draft', 'valid', 'amended', 'repealed', 'superseded') 
  DEFAULT 'valid' AFTER authority_level;

-- Step 2: Add temporal context columns
ALTER TABLE knowledge_embeddings
ADD COLUMN effective_date DATE NULL AFTER legal_status,
ADD COLUMN expiry_date DATE NULL AFTER effective_date,
ADD COLUMN version VARCHAR(50) NULL AFTER expiry_date;

-- Step 3: Add provenance columns
ALTER TABLE knowledge_embeddings
ADD COLUMN source_authority VARCHAR(255) NULL AFTER version,
ADD COLUMN celex_id VARCHAR(50) NULL AFTER source_authority,
ADD COLUMN canonical_url VARCHAR(500) NULL AFTER celex_id;

-- Step 4: Add semantic classification columns
ALTER TABLE knowledge_embeddings
ADD COLUMN semantic_layer ENUM('legal', 'normative', 'operational') DEFAULT 'normative' AFTER canonical_url,
ADD COLUMN document_type VARCHAR(100) NULL AFTER semantic_layer;

-- Step 5: Add relationship columns
ALTER TABLE knowledge_embeddings
ADD COLUMN parent_embedding_id INT NULL AFTER document_type,
ADD COLUMN regulation_id INT NULL AFTER parent_embedding_id;

-- Step 6: Add quality and confidence columns
ALTER TABLE knowledge_embeddings
ADD COLUMN confidence_score DECIMAL(3,2) DEFAULT 1.00 AFTER regulation_id,
ADD COLUMN last_verified_at TIMESTAMP NULL AFTER confidence_score;

-- Step 7: Expand sourceType ENUM to include all data sources
ALTER TABLE knowledge_embeddings
MODIFY COLUMN sourceType ENUM(
  'regulation',
  'standard',
  'esrs_datapoint',
  'dutch_initiative',
  'esrs_gs1_mapping',
  'gdsn_attribute',
  'cbv_vocabulary',
  'dpp_component',
  'epcis_event',
  'cte_kde',
  'news',
  'guidance'
) NOT NULL;

-- Step 8: Add indexes for new columns
CREATE INDEX idx_authority_level ON knowledge_embeddings(authority_level);
CREATE INDEX idx_legal_status ON knowledge_embeddings(legal_status);
CREATE INDEX idx_semantic_layer ON knowledge_embeddings(semantic_layer);
CREATE INDEX idx_source_authority ON knowledge_embeddings(source_authority);
CREATE INDEX idx_effective_date ON knowledge_embeddings(effective_date);

-- Step 9: Add foreign key for parent relationship (optional, may fail if circular refs exist)
-- ALTER TABLE knowledge_embeddings
-- ADD CONSTRAINT fk_parent_embedding 
-- FOREIGN KEY (parent_embedding_id) REFERENCES knowledge_embeddings(id) ON DELETE SET NULL;

-- Step 10: Backfill existing data with default values based on sourceType
UPDATE knowledge_embeddings
SET 
  authority_level = CASE 
    WHEN sourceType = 'regulation' THEN 'regulation'
    WHEN sourceType = 'standard' THEN 'standard'
    WHEN sourceType = 'esrs_datapoint' THEN 'standard'
    ELSE 'guidance'
  END,
  semantic_layer = CASE 
    WHEN sourceType = 'regulation' THEN 'legal'
    WHEN sourceType IN ('standard', 'esrs_datapoint', 'esrs_gs1_mapping') THEN 'normative'
    ELSE 'operational'
  END,
  source_authority = CASE 
    WHEN sourceType = 'regulation' THEN 'European Commission'
    WHEN sourceType IN ('esrs_datapoint', 'esrs_gs1_mapping') THEN 'EFRAG'
    WHEN sourceType = 'standard' THEN 'GS1'
    WHEN sourceType = 'dutch_initiative' THEN 'Dutch Government'
    ELSE NULL
  END
WHERE authority_level IS NULL OR semantic_layer IS NULL;

-- Migration complete
