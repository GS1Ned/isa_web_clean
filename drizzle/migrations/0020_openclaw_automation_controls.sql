-- OpenClaw automation governance controls
-- Adds replay/idempotency ledger and policy decision audit log.

CREATE TABLE IF NOT EXISTS automation_request_ledger (
  id INT NOT NULL AUTO_INCREMENT,
  source VARCHAR(128) NOT NULL,
  idempotency_key VARCHAR(191) NOT NULL,
  request_timestamp TIMESTAMP NULL,
  signature VARCHAR(255) NULL,
  actor VARCHAR(255) NULL,
  trace_id VARCHAR(128) NULL,
  decision ENUM('allow','deny') NOT NULL DEFAULT 'allow',
  reason_code VARCHAR(128) NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY automation_request_ledger_source_key_uq (source, idempotency_key),
  INDEX automation_request_ledger_created_at_idx (created_at),
  INDEX automation_request_ledger_trace_id_idx (trace_id)
);

CREATE TABLE IF NOT EXISTS policy_action_audit (
  id INT NOT NULL AUTO_INCREMENT,
  source VARCHAR(128) NOT NULL,
  actor VARCHAR(255) NULL,
  trace_id VARCHAR(128) NULL,
  decision ENUM('allow','deny') NOT NULL,
  reason_code VARCHAR(128) NOT NULL,
  category ENUM('transient','config','permission','logic') NOT NULL,
  strict_mode TINYINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX policy_action_audit_source_idx (source),
  INDEX policy_action_audit_decision_idx (decision),
  INDEX policy_action_audit_trace_id_idx (trace_id),
  INDEX policy_action_audit_created_at_idx (created_at)
);
