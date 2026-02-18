-- Add per-item ingestion provenance for idempotency and auditability
CREATE TABLE IF NOT EXISTS ingest_item_provenance (
  id int AUTO_INCREMENT NOT NULL,
  pipeline_type varchar(64) NOT NULL,
  item_key varchar(255) NOT NULL,
  source_locator varchar(512),
  retrieved_at timestamp NULL,
  content_hash varchar(64),
  parser_version varchar(64),
  last_ingested_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  trace_id varchar(64),
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY ingest_item_provenance_unique (pipeline_type, item_key),
  INDEX idx_ingest_item_provenance_pipeline_type (pipeline_type),
  INDEX idx_ingest_item_provenance_last_ingested_at (last_ingested_at),
  INDEX idx_ingest_item_provenance_trace_id (trace_id)
);

