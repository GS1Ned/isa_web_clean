-- Schema Extensions for Manus Best Practices Implementation
-- Version: 1.0
-- Date: December 17, 2025
-- Purpose: Add tables for error tracking, user feedback, and prompt A/B testing

-- ============================================================================
-- Ingestion Error Tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS ingestion_errors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ingestion_run_id VARCHAR(255) NOT NULL COMMENT 'Unique identifier for ingestion batch',
  source_file VARCHAR(255) NOT NULL COMMENT 'Source file path or URL',
  source_type VARCHAR(50) NOT NULL COMMENT 'Type of source (gdsn, esrs, cbv, etc.)',
  row_number INT COMMENT 'Row number in source file (if applicable)',
  field_name VARCHAR(255) COMMENT 'Field that caused error',
  error_message TEXT NOT NULL COMMENT 'Error description',
  error_type VARCHAR(50) COMMENT 'Error category (parsing, validation, schema, etc.)',
  attempted_value TEXT COMMENT 'Value that caused error',
  context_data JSON COMMENT 'Additional context for debugging',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_ingestion_run (ingestion_run_id),
  INDEX idx_source_file (source_file),
  INDEX idx_source_type (source_type),
  INDEX idx_error_type (error_type),
  INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tracks ingestion errors for error recovery and debugging';

-- ============================================================================
-- Ask ISA User Feedback
-- ============================================================================

CREATE TABLE IF NOT EXISTS ask_isa_feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id VARCHAR(255) NOT NULL COMMENT 'Unique identifier for Q&A pair',
  user_id INT COMMENT 'User who provided feedback (FK to user table)',
  question_text TEXT NOT NULL COMMENT 'Original question',
  answer_text TEXT NOT NULL COMMENT 'Generated answer',
  feedback_type ENUM('positive', 'negative') NOT NULL COMMENT 'Thumbs up or down',
  feedback_comment TEXT COMMENT 'Optional user comment',
  prompt_variant VARCHAR(50) COMMENT 'Prompt version used (for A/B testing)',
  confidence_score DECIMAL(3,2) COMMENT 'AI confidence score (0-1)',
  sources_count INT COMMENT 'Number of sources cited',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_question_id (question_id),
  INDEX idx_user_id (user_id),
  INDEX idx_feedback_type (feedback_type),
  INDEX idx_prompt_variant (prompt_variant),
  INDEX idx_timestamp (timestamp),
  
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='User feedback on Ask ISA responses for quality tracking';

-- ============================================================================
-- Ask ISA Query Log (for A/B testing and analytics)
-- ============================================================================

CREATE TABLE IF NOT EXISTS ask_isa_queries (
  id INT AUTO_INCREMENT PRIMARY KEY,
  question_id VARCHAR(255) NOT NULL UNIQUE COMMENT 'Unique identifier for Q&A pair',
  user_id INT COMMENT 'User who asked question',
  question_text TEXT NOT NULL COMMENT 'Original question',
  answer_text TEXT COMMENT 'Generated answer',
  prompt_variant VARCHAR(50) NOT NULL COMMENT 'Prompt version used',
  prompt_version VARCHAR(20) NOT NULL COMMENT 'Semantic version (e.g., 2.0)',
  confidence_score DECIMAL(3,2) COMMENT 'AI confidence score (0-1)',
  sources_retrieved INT COMMENT 'Number of sources retrieved',
  sources_cited INT COMMENT 'Number of sources actually cited',
  processing_time_ms INT COMMENT 'Time to generate answer (milliseconds)',
  token_count INT COMMENT 'Total tokens used (input + output)',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_question_id (question_id),
  INDEX idx_user_id (user_id),
  INDEX idx_prompt_variant (prompt_variant),
  INDEX idx_timestamp (timestamp),
  
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Query log for A/B testing and performance analytics';

-- ============================================================================
-- Prompt Evaluation Metrics
-- ============================================================================

CREATE TABLE IF NOT EXISTS prompt_evaluations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  evaluation_id VARCHAR(255) NOT NULL UNIQUE COMMENT 'Unique identifier for evaluation run',
  prompt_variant VARCHAR(50) NOT NULL COMMENT 'Prompt version being evaluated',
  prompt_version VARCHAR(20) NOT NULL COMMENT 'Semantic version',
  test_set_name VARCHAR(100) NOT NULL COMMENT 'Name of test set used',
  test_cases_total INT NOT NULL COMMENT 'Total test cases',
  test_cases_passed INT NOT NULL COMMENT 'Passed test cases',
  precision_score DECIMAL(5,4) COMMENT 'Precision metric (0-1)',
  recall_score DECIMAL(5,4) COMMENT 'Recall metric (0-1)',
  f1_score DECIMAL(5,4) COMMENT 'F1 score (0-1)',
  avg_confidence DECIMAL(3,2) COMMENT 'Average confidence score',
  avg_processing_time_ms INT COMMENT 'Average processing time',
  evaluation_notes TEXT COMMENT 'Additional notes or observations',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_evaluation_id (evaluation_id),
  INDEX idx_prompt_variant (prompt_variant),
  INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Evaluation metrics for prompt A/B testing and optimization';

-- ============================================================================
-- Advisory Evaluation Baselines
-- ============================================================================

CREATE TABLE IF NOT EXISTS advisory_evaluations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  advisory_version VARCHAR(20) NOT NULL COMMENT 'Advisory version (e.g., 1.1, 1.2)',
  evaluation_criteria JSON NOT NULL COMMENT 'Evaluation criteria used',
  evaluation_results JSON NOT NULL COMMENT 'Detailed results',
  mappings_cite_sources BOOLEAN COMMENT 'All mappings cite authoritative sources',
  gaps_have_recommendations BOOLEAN COMMENT 'All gaps have actionable recommendations',
  coverage_metrics_accurate BOOLEAN COMMENT 'Coverage % matches actual mapping count',
  no_hallucinated_ids BOOLEAN COMMENT 'No made-up GS1 attribute IDs',
  overall_pass BOOLEAN COMMENT 'Overall evaluation passed',
  evaluator VARCHAR(100) COMMENT 'Who/what performed evaluation (human/automated)',
  notes TEXT COMMENT 'Additional notes',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  INDEX idx_advisory_version (advisory_version),
  INDEX idx_overall_pass (overall_pass),
  INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Evaluation baselines for advisory report quality tracking';
