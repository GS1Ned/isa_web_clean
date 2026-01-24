CREATE TABLE `regulatory_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`dedup_key` varchar(255) NOT NULL,
	`event_type` enum('PROPOSAL','POLITICAL_AGREEMENT','ADOPTION','DELEGATED_ACT_DRAFT','DELEGATED_ACT_ADOPTION','IMPLEMENTING_ACT','GUIDANCE_PUBLICATION','ENFORCEMENT_START','DEADLINE_MILESTONE','POSTPONEMENT','AMENDMENT') NOT NULL,
	`primary_regulation` varchar(64) NOT NULL,
	`affected_regulations` json NOT NULL,
	`lifecycle_state` enum('PROPOSAL','POLITICAL_AGREEMENT','ADOPTED','DELEGATED_ACT_DRAFT','DELEGATED_ACT_ADOPTED','GUIDANCE','ENFORCEMENT_SIGNAL','POSTPONED_OR_SOFTENED') NOT NULL,
	`event_date_earliest` timestamp,
	`event_date_latest` timestamp,
	`event_quarter` varchar(7) NOT NULL,
	`previous_assumption` text,
	`new_information` text,
	`what_changed` text,
	`what_did_not_change` text,
	`decision_impact` text,
	`event_title` varchar(512) NOT NULL,
	`event_summary` text,
	`source_article_ids` json NOT NULL,
	`confidence_level` enum('CONFIRMED_LAW','DRAFT_PROPOSAL','GUIDANCE_INTERPRETATION','MARKET_PRACTICE') DEFAULT 'GUIDANCE_INTERPRETATION',
	`confidence_source` varchar(255),
	`status` enum('COMPLETE','INCOMPLETE','DRAFT') NOT NULL DEFAULT 'DRAFT',
	`completeness_score` int DEFAULT 0,
	`delta_validation_passed` tinyint DEFAULT 0,
	`missing_delta_fields` json,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE `hub_news` ADD `regulatory_state` enum('PROPOSAL','POLITICAL_AGREEMENT','ADOPTED','DELEGATED_ACT_DRAFT','DELEGATED_ACT_ADOPTED','GUIDANCE','ENFORCEMENT_SIGNAL','POSTPONED_OR_SOFTENED') DEFAULT 'ADOPTED';--> statement-breakpoint
ALTER TABLE `hub_news` ADD `is_negative_signal` tinyint DEFAULT 0;--> statement-breakpoint
ALTER TABLE `hub_news` ADD `confidence_level` enum('CONFIRMED_LAW','DRAFT_PROPOSAL','GUIDANCE_INTERPRETATION','MARKET_PRACTICE') DEFAULT 'GUIDANCE_INTERPRETATION';--> statement-breakpoint
ALTER TABLE `hub_news` ADD `negative_signal_keywords` json;--> statement-breakpoint
CREATE INDEX `dedup_key_idx` ON `regulatory_events` (`dedup_key`);--> statement-breakpoint
CREATE INDEX `event_type_idx` ON `regulatory_events` (`event_type`);--> statement-breakpoint
CREATE INDEX `primary_regulation_idx` ON `regulatory_events` (`primary_regulation`);--> statement-breakpoint
CREATE INDEX `lifecycle_state_idx` ON `regulatory_events` (`lifecycle_state`);--> statement-breakpoint
CREATE INDEX `event_quarter_idx` ON `regulatory_events` (`event_quarter`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `regulatory_events` (`status`);--> statement-breakpoint
CREATE INDEX `completeness_score_idx` ON `regulatory_events` (`completeness_score`);--> statement-breakpoint
ALTER TABLE `hub_news` DROP COLUMN `regulatoryState`;--> statement-breakpoint
ALTER TABLE `hub_news` DROP COLUMN `isNegativeSignal`;--> statement-breakpoint
ALTER TABLE `hub_news` DROP COLUMN `confidenceLevel`;--> statement-breakpoint
ALTER TABLE `hub_news` DROP COLUMN `negativeSignalKeywords`;