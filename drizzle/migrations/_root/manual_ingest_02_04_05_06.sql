-- Manual migration for INGEST-02, 04, 05, 06 tables
-- Created: 2025-12-12
-- Purpose: Add tables for GDSN, CTEs/KDEs, DPP Rules, CBV/Digital Link ingestion

-- ============================================================================
-- INGEST-02: GDSN Current v3.1.32 Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS `raw_gdsn_classes` (
  `id` INT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `definition` TEXT,
  `type` INT,
  `extensions` JSON,
  `raw_json` JSON,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_raw_gdsn_class_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gdsn_classes` (
  `id` INT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `definition` TEXT,
  `type` INT,
  `extensions` JSON,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_gdsn_class_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `raw_gdsn_class_attributes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `class_id` INT NOT NULL,
  `attribute_code` VARCHAR(255) NOT NULL,
  `attribute_name` VARCHAR(255),
  `data_type` VARCHAR(50),
  `required` BOOLEAN DEFAULT FALSE,
  `raw_json` JSON,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_raw_gdsn_attr_class` (`class_id`),
  INDEX `idx_raw_gdsn_attr_code` (`attribute_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gdsn_class_attributes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `class_id` INT NOT NULL,
  `attribute_code` VARCHAR(255) NOT NULL,
  `attribute_name` VARCHAR(255),
  `data_type` VARCHAR(50),
  `required` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_gdsn_attr_class` (`class_id`),
  INDEX `idx_gdsn_attr_code` (`attribute_code`),
  INDEX `unique_class_attr_idx` (`class_id`, `attribute_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `raw_gdsn_validation_rules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `rule_id` VARCHAR(255) NOT NULL,
  `class_id` INT,
  `attribute_code` VARCHAR(255),
  `rule_type` VARCHAR(50),
  `rule_expression` TEXT,
  `error_message` TEXT,
  `raw_json` JSON,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_raw_gdsn_rule_id` (`rule_id`),
  INDEX `idx_raw_gdsn_rule_class` (`class_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `gdsn_validation_rules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `rule_id` VARCHAR(255) NOT NULL UNIQUE,
  `class_id` INT,
  `attribute_code` VARCHAR(255),
  `rule_type` VARCHAR(50),
  `rule_expression` TEXT,
  `error_message` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_gdsn_rule_id` (`rule_id`),
  INDEX `idx_gdsn_rule_class` (`class_id`),
  INDEX `idx_gdsn_rule_attr` (`attribute_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- INGEST-04: CTEs and KDEs Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS `raw_ctes_kdes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `raw_json` JSON,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ctes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(100) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `category` VARCHAR(100),
  `regulation_context` VARCHAR(255),
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_cte_code` (`code`),
  INDEX `idx_cte_category` (`category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `kdes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `code` VARCHAR(100) NOT NULL UNIQUE,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `data_type` VARCHAR(50),
  `mandatory` BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_kde_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cte_kde_mappings` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `cte_id` INT NOT NULL,
  `kde_id` INT NOT NULL,
  `required` BOOLEAN DEFAULT TRUE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_cte_kde_cte` (`cte_id`),
  INDEX `idx_cte_kde_kde` (`kde_id`),
  INDEX `unique_cte_kde_idx` (`cte_id`, `kde_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- INGEST-05: DPP Identification Rules Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS `raw_dpp_identifier_components` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `raw_json` JSON,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dpp_identifier_components` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `component_code` VARCHAR(50) NOT NULL UNIQUE,
  `component_name` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `gs1_standard` VARCHAR(100),
  `format` VARCHAR(100),
  `example` VARCHAR(255),
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_dpp_comp_code` (`component_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `raw_dpp_identification_rules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `raw_json` JSON,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `dpp_identification_rules` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `rule_code` VARCHAR(100) NOT NULL UNIQUE,
  `product_category` VARCHAR(255) NOT NULL,
  `required_components` JSON,
  `optional_components` JSON,
  `description` TEXT,
  `regulation_context` VARCHAR(255),
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_dpp_rule_code` (`rule_code`),
  INDEX `idx_dpp_rule_category` (`product_category`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- INGEST-06: CBV Vocabularies & Digital Link Types Tables
-- ============================================================================

CREATE TABLE IF NOT EXISTS `raw_cbv_vocabularies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `raw_json` JSON,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `cbv_vocabularies` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `vocabulary_type` VARCHAR(100) NOT NULL,
  `code` VARCHAR(255) NOT NULL,
  `label` VARCHAR(255) NOT NULL,
  `definition` TEXT,
  `regulation_relevance` JSON,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_cbv_type` (`vocabulary_type`),
  INDEX `idx_cbv_code` (`code`),
  INDEX `unique_cbv_type_code_idx` (`vocabulary_type`, `code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `raw_digital_link_types` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `raw_json` JSON,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `digital_link_types` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `link_type` VARCHAR(100) NOT NULL UNIQUE,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT,
  `gs1_curie` VARCHAR(100),
  `schema_org_equivalent` VARCHAR(255),
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_digital_link_type` (`link_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
