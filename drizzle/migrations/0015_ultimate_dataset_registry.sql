-- ISA Dataset Registry: Ultimate Schema Migration
-- Purpose: Transform dataset_registry into ISA's central data governance & provenance system
-- Date: 2026-02-11
-- Evidence: data/metadata/dataset_registry.json v1.4.0, external docs, ISA capability requirements

-- This migration adds rich metadata fields to support:
-- 1. Data Governance: Track dataset versions, verification status, governance compliance
-- 2. Provenance: Full lineage tracking with checksums, sources, and derivation chains
-- 3. Categorization: Domain classification, format tracking, and relationship mapping
-- 4. Intelligence: Enable Ask ISA to cite sources, track data currency, support versioning
-- 5. Observability: Monitor data quality, verification cadence, and usage patterns

-- Step 1: Add new columns to existing table (non-destructive, preserves data)
ALTER TABLE `dataset_registry` 
  -- Core Identity (richer than dataset_name)
  ADD COLUMN `name` VARCHAR(255) NULL AFTER `dataset_name`,
  ADD COLUMN `description` TEXT NULL AFTER `name`,
  ADD COLUMN `title` VARCHAR(512) NULL AFTER `description`,
  
  -- Categorization & Classification
  ADD COLUMN `category` ENUM(
    'GS1_STANDARDS',
    'GDSN_DATA',
    'ESRS_DATAPOINTS',
    'CBV_VOCABULARIES',
    'DPP_RULES',
    'EU_REGULATIONS',
    'INDUSTRY_DATASETS',
    'REFERENCE_CORPUS',
    'NEWS_SOURCES',
    'OTHER'
  ) NULL AFTER `source_type`,
  
  ADD COLUMN `canonical_domains` JSON NULL COMMENT 'Array of domain tags (e.g., ["EPCIS", "CBV", "Digital_Link"])',
  
  -- Format & Structure
  ADD COLUMN `format` ENUM(
    'JSON',
    'CSV',
    'XML',
    'XLSX',
    'PDF',
    'HTML',
    'API',
    'ZIP',
    'OTHER'
  ) NULL AFTER `category`,
  
  ADD COLUMN `formats` JSON NULL COMMENT 'Array of format objects with mediaType and count',
  
  -- Data Metrics
  ADD COLUMN `record_count` INT NULL COMMENT 'Number of records in dataset',
  ADD COLUMN `file_size` BIGINT NULL COMMENT 'Size in bytes',
  
  -- Access & Distribution
  ADD COLUMN `download_url` VARCHAR(512) NULL,
  ADD COLUMN `api_endpoint` VARCHAR(512) NULL,
  ADD COLUMN `access_method` ENUM('download', 'api', 'local_bundle', 'scraped', 'manual') NULL,
  ADD COLUMN `credentials_required` BOOLEAN DEFAULT FALSE,
  
  -- Publisher & Authority
  ADD COLUMN `publisher` VARCHAR(255) NULL COMMENT 'Organization publishing the dataset',
  ADD COLUMN `jurisdiction` VARCHAR(128) NULL COMMENT 'Geographic scope (Global, EU, NL, etc.)',
  
  -- Versioning & Temporal
  ADD COLUMN `release_date` DATE NULL COMMENT 'Official release date',
  ADD COLUMN `effective_date` DATE NULL COMMENT 'When dataset becomes effective',
  ADD COLUMN `effective_to` DATE NULL COMMENT 'When dataset is superseded',
  ADD COLUMN `status` ENUM('current', 'deprecated', 'draft', 'archived', 'mvp_critical', 'provisional') DEFAULT 'current',
  
  -- Verification & Governance (enhanced)
  ADD COLUMN `verified_by` VARCHAR(255) NULL COMMENT 'Admin user who verified',
  ADD COLUMN `verification_notes` TEXT NULL,
  ADD COLUMN `verification_cadence` ENUM('daily', 'weekly', 'monthly', 'quarterly', 'annual', 'one_time') NULL,
  
  -- Provenance & Lineage
  ADD COLUMN `lineage_hashes` JSON NULL COMMENT 'Array of hash objects (alg, value, applies_to)',
  ADD COLUMN `derived_from` JSON NULL COMMENT 'Array of source dataset IDs',
  ADD COLUMN `extraction_date` DATE NULL,
  ADD COLUMN `extraction_method` VARCHAR(512) NULL,
  ADD COLUMN `ingestion_date` DATE NULL,
  ADD COLUMN `ingestion_script` VARCHAR(255) NULL,
  
  -- Metadata & Relationships
  ADD COLUMN `metadata` JSON NULL COMMENT 'Flexible metadata storage',
  ADD COLUMN `tags` JSON NULL COMMENT 'Searchable tags array',
  ADD COLUMN `related_regulation_ids` JSON NULL COMMENT 'Array of regulation IDs',
  ADD COLUMN `related_standard_ids` JSON NULL COMMENT 'Array of standard IDs',
  ADD COLUMN `repo_assets` JSON NULL COMMENT 'Array of file paths in repo',
  
  -- Licensing
  ADD COLUMN `license_notes` TEXT NULL,
  
  -- ISA-Specific
  ADD COLUMN `isa_usage` VARCHAR(255) NULL COMMENT 'How ISA uses this dataset',
  ADD COLUMN `isa_domain_tags` JSON NULL COMMENT 'ISA-specific domain classification',
  ADD COLUMN `update_cadence` VARCHAR(128) NULL COMMENT 'Expected update frequency',
  ADD COLUMN `monitoring_url` VARCHAR(512) NULL COMMENT 'URL to monitor for updates',
  
  -- Governance & Compliance
  ADD COLUMN `governance_notes` TEXT NULL,
  ADD COLUMN `lane_status` ENUM('LANE_A', 'LANE_B', 'LANE_C') DEFAULT 'LANE_C' COMMENT 'Governance lane classification',
  ADD COLUMN `language` JSON NULL COMMENT 'Array of language codes (e.g., ["EN", "NL"])';

-- Step 2: Migrate existing data to new fields
UPDATE `dataset_registry` SET
  `name` = `dataset_name`,
  `title` = `dataset_name`,
  `category` = CASE 
    WHEN `source_type` = 'official_api' THEN 'GS1_STANDARDS'
    WHEN `source_type` = 'official_download' THEN 'GS1_STANDARDS'
    WHEN `source_type` = 'curated_list' THEN 'INDUSTRY_DATASETS'
    ELSE 'OTHER'
  END,
  `format` = CASE
    WHEN `source_url` LIKE '%.json' THEN 'JSON'
    WHEN `source_url` LIKE '%.xlsx' THEN 'XLSX'
    WHEN `source_url` LIKE '%.xml' THEN 'XML'
    WHEN `source_url` LIKE '%.pdf' THEN 'PDF'
    ELSE 'OTHER'
  END,
  `download_url` = `source_url`,
  `access_method` = `source_type`,
  `publisher` = `source_authority`,
  `release_date` = `publication_date`,
  `effective_date` = `publication_date`,
  `verified_by` = 'migration_script',
  `verification_notes` = 'Migrated from legacy schema',
  `ingestion_date` = `created_at`,
  `license_notes` = `license_disclaimer`,
  `isa_usage` = 'Legacy dataset - needs classification';

-- Step 3: Add indexes for performance
CREATE INDEX `idx_category` ON `dataset_registry` (`category`);
CREATE INDEX `idx_format` ON `dataset_registry` (`format`);
CREATE INDEX `idx_status` ON `dataset_registry` (`status`);
CREATE INDEX `idx_publisher` ON `dataset_registry` (`publisher`);
CREATE INDEX `idx_effective_date` ON `dataset_registry` (`effective_date`);
CREATE INDEX `idx_lane_status` ON `dataset_registry` (`lane_status`);

-- Step 4: Update existing indexes
DROP INDEX IF EXISTS `source_type_idx` ON `dataset_registry`;
DROP INDEX IF EXISTS `is_active_idx` ON `dataset_registry`;
CREATE INDEX `idx_source_type` ON `dataset_registry` (`source_type`);
CREATE INDEX `idx_is_active` ON `dataset_registry` (`is_active`);
CREATE INDEX `idx_last_verified` ON `dataset_registry` (`last_verified_at`);

-- Migration complete
-- Next steps:
-- 1. Update application code to use new fields
-- 2. Populate rich metadata from data/metadata/dataset_registry.json
-- 3. Enable governance tracking and verification workflows
