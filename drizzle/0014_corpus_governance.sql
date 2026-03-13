-- Migration: Corpus Governance Schema
-- Part of Gate 1: Foundation - Corpus Governance & Observability
-- 
-- This migration creates the foundational tables for ISA's compliance-grade
-- knowledge management system, including versioning, authority ranking,
-- and full auditability.

-- ============================================================================
-- Table: sources
-- Tracks every document in the ISA knowledge corpus
-- ============================================================================
CREATE TABLE IF NOT EXISTS `sources` (
  `id` INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  
  -- Identification
  `name` VARCHAR(512) NOT NULL,
  `acronym` VARCHAR(64),
  `external_id` VARCHAR(255),
  
  -- Source metadata
  `source_type` ENUM(
    'eu_regulation',
    'eu_directive',
    'gs1_global_standard',
    'gs1_regional_standard',
    'gs1_datamodel',
    'official_guidance',
    'industry_standard',
    'news_article',
    'third_party_analysis'
  ) NOT NULL,
  
  -- Authority & Trust (1=highest, 5=lowest)
  `authority_level` INT NOT NULL,
  `publisher` VARCHAR(255),
  `publisher_url` VARCHAR(512),
  
  -- Versioning
  `version` VARCHAR(64),
  `publication_date` TIMESTAMP NULL,
  `effective_date` TIMESTAMP NULL,
  `expiration_date` TIMESTAMP NULL,
  
  -- Source URLs
  `official_url` VARCHAR(1024),
  `archive_url` VARCHAR(1024),
  
  -- Status
  `status` ENUM('draft', 'active', 'superseded', 'deprecated', 'archived') NOT NULL DEFAULT 'active',
  `superseded_by` INT,
  
  -- Ingestion metadata
  `ingestion_date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `last_verified_date` TIMESTAMP NULL,
  `verification_status` ENUM('pending', 'verified', 'stale', 'failed') NOT NULL DEFAULT 'pending',
  
  -- Content summary
  `description` TEXT,
  `sector` VARCHAR(128),
  `language` VARCHAR(8) DEFAULT 'en',
  
  -- Audit trail
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` VARCHAR(255),
  
  -- Indexes
  INDEX `source_type_idx` (`source_type`),
  INDEX `authority_level_idx` (`authority_level`),
  INDEX `status_idx` (`status`),
  INDEX `sector_idx` (`sector`),
  INDEX `publication_date_idx` (`publication_date`),
  UNIQUE INDEX `external_id_unique_idx` (`external_id`)
);

-- ============================================================================
-- Table: source_chunks
-- Stores versioned, structured content chunks from source documents
-- ============================================================================
CREATE TABLE IF NOT EXISTS `source_chunks` (
  `id` INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  
  -- Link to source
  `source_id` INT NOT NULL,
  
  -- Chunk identification
  `chunk_index` INT NOT NULL,
  `chunk_type` ENUM(
    'article',
    'section',
    'paragraph',
    'table',
    'definition',
    'requirement',
    'guidance',
    'example',
    'full_document'
  ) NOT NULL DEFAULT 'paragraph',
  
  -- Structural metadata
  `section_path` VARCHAR(512),
  `heading` VARCHAR(512),
  
  -- Content
  `content` TEXT NOT NULL,
  `content_hash` VARCHAR(64) NOT NULL,
  
  -- Character range for precise citation
  `char_start` INT,
  `char_end` INT,
  
  -- Embedding
  `embedding` JSON,
  `embedding_model` VARCHAR(64),
  `embedding_generated_at` TIMESTAMP NULL,
  
  -- Versioning
  `version` VARCHAR(64),
  
  -- Status
  `is_active` TINYINT NOT NULL DEFAULT 1,
  `deprecated_at` TIMESTAMP NULL,
  `deprecation_reason` TEXT,
  
  -- Audit trail
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX `source_id_idx` (`source_id`),
  INDEX `chunk_type_idx` (`chunk_type`),
  INDEX `content_hash_idx` (`content_hash`),
  INDEX `is_active_idx` (`is_active`),
  UNIQUE INDEX `source_chunk_unique_idx` (`source_id`, `chunk_index`),
  
  -- Foreign key
  CONSTRAINT `fk_source_chunks_source` FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON DELETE CASCADE
);

-- ============================================================================
-- Table: rag_traces
-- Stores complete traces of every Ask ISA query for observability
-- ============================================================================
CREATE TABLE IF NOT EXISTS `rag_traces` (
  `id` INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  
  -- Query identification
  `trace_id` VARCHAR(64) NOT NULL,
  `conversation_id` INT,
  `user_id` INT,
  
  -- Input
  `query` TEXT NOT NULL,
  `query_embedding` JSON,
  `query_language` VARCHAR(8),
  `sector_filter` VARCHAR(64),
  
  -- Retrieval phase
  `retrieved_chunk_ids` JSON,
  `retrieval_scores` JSON,
  `rerank_scores` JSON,
  
  -- Evidence selection
  `selected_chunk_ids` JSON,
  `selected_spans` JSON,
  
  -- Generation phase
  `extracted_claims` JSON,
  `generated_answer` TEXT,
  `citations` JSON,
  
  -- Quality metrics
  `confidence_score` DECIMAL(3, 2),
  `citation_precision` DECIMAL(3, 2),
  `abstained` TINYINT NOT NULL DEFAULT 0,
  `abstention_reason` TEXT,
  
  -- Verification
  `verification_status` ENUM('pending', 'verified', 'failed', 'skipped') NOT NULL DEFAULT 'pending',
  `verification_details` JSON,
  
  -- Performance
  `total_latency_ms` INT,
  `retrieval_latency_ms` INT,
  `generation_latency_ms` INT,
  
  -- Model information
  `llm_model` VARCHAR(128),
  `embedding_model` VARCHAR(128),
  `prompt_version` VARCHAR(64),
  
  -- Cache
  `cache_hit` TINYINT NOT NULL DEFAULT 0,
  `cache_key` VARCHAR(64),
  
  -- User feedback
  `feedback_id` INT,
  
  -- Error handling
  `error_occurred` TINYINT NOT NULL DEFAULT 0,
  `error_message` TEXT,
  `error_stack` TEXT,
  
  -- Audit trail
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX `trace_id_idx` (`trace_id`),
  INDEX `conversation_id_idx` (`conversation_id`),
  INDEX `user_id_idx` (`user_id`),
  INDEX `created_at_idx` (`created_at`),
  INDEX `verification_status_idx` (`verification_status`),
  INDEX `abstained_idx` (`abstained`),
  INDEX `error_occurred_idx` (`error_occurred`)
);

-- ============================================================================
-- Table: golden_qa_pairs
-- Stores curated question-answer pairs for RAG evaluation
-- ============================================================================
CREATE TABLE IF NOT EXISTS `golden_qa_pairs` (
  `id` INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  
  -- Question
  `question` TEXT NOT NULL,
  `question_language` VARCHAR(8) DEFAULT 'en',
  `question_type` ENUM(
    'factual',
    'procedural',
    'comparative',
    'multi_hop',
    'adversarial',
    'out_of_scope'
  ) NOT NULL,
  
  -- Expected answer
  `expected_answer` TEXT NOT NULL,
  `expected_citations` JSON,
  `expected_abstain` TINYINT NOT NULL DEFAULT 0,
  
  -- Categorization
  `domain` VARCHAR(128),
  `sector` VARCHAR(128),
  `difficulty` ENUM('easy', 'medium', 'hard') DEFAULT 'medium',
  
  -- Metadata
  `notes` TEXT,
  `created_by` VARCHAR(255),
  `verified_by` VARCHAR(255),
  `verified_at` TIMESTAMP NULL,
  
  -- Status
  `is_active` TINYINT NOT NULL DEFAULT 1,
  
  -- Audit trail
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX `question_type_idx` (`question_type`),
  INDEX `domain_idx` (`domain`),
  INDEX `sector_idx` (`sector`),
  INDEX `difficulty_idx` (`difficulty`),
  INDEX `is_active_idx` (`is_active`)
);

-- ============================================================================
-- Table: evaluation_results
-- Stores results of RAG evaluation runs against the golden dataset
-- ============================================================================
CREATE TABLE IF NOT EXISTS `evaluation_results` (
  `id` INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
  
  -- Evaluation run identification
  `run_id` VARCHAR(64) NOT NULL,
  `run_type` ENUM('full', 'regression', 'targeted', 'ad_hoc') NOT NULL,
  
  -- Link to golden QA pair
  `golden_qa_id` INT NOT NULL,
  
  -- Generated answer
  `generated_answer` TEXT,
  `generated_citations` JSON,
  `abstained` TINYINT NOT NULL DEFAULT 0,
  
  -- Metrics
  `answer_correctness` DECIMAL(3, 2),
  `citation_precision` DECIMAL(3, 2),
  `citation_recall` DECIMAL(3, 2),
  `abstention_correct` TINYINT,
  
  -- Trace link
  `rag_trace_id` INT,
  
  -- Evaluation details
  `evaluator_model` VARCHAR(128),
  `evaluator_notes` TEXT,
  
  -- Audit trail
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX `run_id_idx` (`run_id`),
  INDEX `golden_qa_id_idx` (`golden_qa_id`),
  INDEX `created_at_idx` (`created_at`),
  
  -- Foreign keys
  CONSTRAINT `fk_evaluation_golden_qa` FOREIGN KEY (`golden_qa_id`) REFERENCES `golden_qa_pairs`(`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_evaluation_rag_trace` FOREIGN KEY (`rag_trace_id`) REFERENCES `rag_traces`(`id`) ON DELETE SET NULL
);
