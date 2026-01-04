-- Migration: add durable error_ledger for structured error preservation
-- MySQL / TiDB compatible (adjusted for TiDB limitations)

CREATE TABLE IF NOT EXISTS error_ledger (
  id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  trace_id VARCHAR(36) NOT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  error_code VARCHAR(255),
  classification VARCHAR(50),
  commit_sha VARCHAR(255),
  branch VARCHAR(255),
  environment VARCHAR(50),
  affected_files JSON,
  error_payload JSON NOT NULL,
  failing_inputs JSON,
  remediation_attempts JSON,
  resolved TINYINT(1) DEFAULT 0,
  resolved_at DATETIME(6) NULL,
  INDEX idx_error_ledger_trace_id (trace_id),
  INDEX idx_error_ledger_error_code (error_code),
  INDEX idx_error_ledger_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
