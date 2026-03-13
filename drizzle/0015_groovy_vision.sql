CREATE TABLE `advisory_report_target_regulations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`report_id` int NOT NULL,
	`regulation_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	CONSTRAINT `advisory_report_target_regulations_report_regulation_uq` UNIQUE(`report_id`,`regulation_id`)
);
--> statement-breakpoint
CREATE TABLE `advisory_report_target_standards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`report_id` int NOT NULL,
	`standard_id` int NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	CONSTRAINT `advisory_report_target_standards_report_standard_uq` UNIQUE(`report_id`,`standard_id`)
);
--> statement-breakpoint
CREATE TABLE `automation_request_ledger` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source` varchar(128) NOT NULL,
	`idempotency_key` varchar(191) NOT NULL,
	`request_timestamp` timestamp,
	`signature` varchar(255),
	`actor` varchar(255),
	`trace_id` varchar(128),
	`decision` enum('allow','deny') NOT NULL DEFAULT 'allow',
	`reason_code` varchar(128),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `automation_request_ledger_source_key_uq` UNIQUE(`source`,`idempotency_key`)
);
--> statement-breakpoint
CREATE TABLE `ingest_item_provenance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`pipeline_type` varchar(64) NOT NULL,
	`item_key` varchar(255) NOT NULL,
	`source_locator` varchar(512),
	`retrieved_at` timestamp,
	`content_hash` varchar(64),
	`parser_version` varchar(64),
	`last_ingested_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`trace_id` varchar(64),
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `policy_action_audit` (
	`id` int AUTO_INCREMENT NOT NULL,
	`source` varchar(128) NOT NULL,
	`actor` varchar(255),
	`trace_id` varchar(128),
	`decision` enum('allow','deny') NOT NULL,
	`reason_code` varchar(128) NOT NULL,
	`category` enum('transient','config','permission','logic') NOT NULL,
	`strict_mode` tinyint NOT NULL DEFAULT 0,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE `advisory_report_versions` ADD `decisionArtifacts` json;--> statement-breakpoint
ALTER TABLE `advisory_reports` ADD `decisionArtifacts` json;--> statement-breakpoint
ALTER TABLE `advisory_reports` ADD `stale_since` timestamp;--> statement-breakpoint
ALTER TABLE `dataset_registry` ADD `authority_tier` varchar(64);--> statement-breakpoint
ALTER TABLE `dataset_registry` ADD `license_type` varchar(64);--> statement-breakpoint
ALTER TABLE `dataset_registry` ADD `publication_status` varchar(64);--> statement-breakpoint
ALTER TABLE `dataset_registry` ADD `immutable_uri` varchar(1024);--> statement-breakpoint
ALTER TABLE `knowledge_embeddings` ADD `source_chunk_id` int;--> statement-breakpoint
ALTER TABLE `regulations` ADD `needs_verification` tinyint DEFAULT 0;--> statement-breakpoint
CREATE INDEX `advisory_report_target_regulations_regulation_id_idx` ON `advisory_report_target_regulations` (`regulation_id`);--> statement-breakpoint
CREATE INDEX `advisory_report_target_regulations_report_id_idx` ON `advisory_report_target_regulations` (`report_id`);--> statement-breakpoint
CREATE INDEX `advisory_report_target_standards_standard_id_idx` ON `advisory_report_target_standards` (`standard_id`);--> statement-breakpoint
CREATE INDEX `advisory_report_target_standards_report_id_idx` ON `advisory_report_target_standards` (`report_id`);--> statement-breakpoint
CREATE INDEX `automation_request_ledger_created_at_idx` ON `automation_request_ledger` (`created_at`);--> statement-breakpoint
CREATE INDEX `automation_request_ledger_trace_id_idx` ON `automation_request_ledger` (`trace_id`);--> statement-breakpoint
CREATE INDEX `ingest_item_provenance_unique` ON `ingest_item_provenance` (`pipeline_type`,`item_key`);--> statement-breakpoint
CREATE INDEX `idx_ingest_item_provenance_pipeline_type` ON `ingest_item_provenance` (`pipeline_type`);--> statement-breakpoint
CREATE INDEX `idx_ingest_item_provenance_last_ingested_at` ON `ingest_item_provenance` (`last_ingested_at`);--> statement-breakpoint
CREATE INDEX `idx_ingest_item_provenance_trace_id` ON `ingest_item_provenance` (`trace_id`);--> statement-breakpoint
CREATE INDEX `policy_action_audit_source_idx` ON `policy_action_audit` (`source`);--> statement-breakpoint
CREATE INDEX `policy_action_audit_decision_idx` ON `policy_action_audit` (`decision`);--> statement-breakpoint
CREATE INDEX `policy_action_audit_trace_id_idx` ON `policy_action_audit` (`trace_id`);--> statement-breakpoint
CREATE INDEX `policy_action_audit_created_at_idx` ON `policy_action_audit` (`created_at`);--> statement-breakpoint
CREATE INDEX `source_chunk_id_idx` ON `knowledge_embeddings` (`source_chunk_id`);