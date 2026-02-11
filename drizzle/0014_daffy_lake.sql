CREATE TABLE `esg_atomic_requirements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`atomic_id` varchar(32) NOT NULL,
	`obligation_id` varchar(32) NOT NULL,
	`obligation_ref_instrument_id` varchar(32),
	`obligation_ref_article` varchar(128),
	`subject` varchar(255) NOT NULL,
	`action` text NOT NULL,
	`object` varchar(255),
	`scope` varchar(128),
	`timing` varchar(128),
	`enforcement` text,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `esg_corpus` (
	`id` int AUTO_INCREMENT NOT NULL,
	`instrument_id` varchar(32) NOT NULL,
	`name` varchar(512) NOT NULL,
	`status` varchar(32) NOT NULL,
	`scope` text NOT NULL,
	`authority_source` varchar(128),
	`authority_reference` varchar(128),
	`eli_url` varchar(512),
	`celex` varchar(32),
	`last_verified` varchar(16),
	`formats` json,
	`effect_status` varchar(64),
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `esg_data_requirements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`data_id` varchar(32) NOT NULL,
	`atomic_id` varchar(32) NOT NULL,
	`obligation_id` varchar(32) NOT NULL,
	`data_class` varchar(128) NOT NULL,
	`data_elements` json NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `esg_gs1_mappings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`data_id` varchar(32) NOT NULL,
	`gs1_capability` varchar(64) NOT NULL,
	`gs1_standards` json NOT NULL,
	`mapping_strength` varchar(32) NOT NULL,
	`justification` text NOT NULL,
	`sector_relevance` varchar(255),
	`regulatory_force` int,
	`information_inevitability` int,
	`interoperability_dependency` int,
	`gs1_solution_fitness` int,
	`sector_exposure` int,
	`time_criticality` int,
	`total_score` int,
	`score_rationale` text,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `esg_obligations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`obligation_id` varchar(32) NOT NULL,
	`instrument_id` varchar(32) NOT NULL,
	`article` varchar(128) NOT NULL,
	`obligation_text` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE INDEX `esg_atomic_requirements_atomic_id_unique` ON `esg_atomic_requirements` (`atomic_id`);--> statement-breakpoint
CREATE INDEX `esg_atomic_requirements_obligation_id_idx` ON `esg_atomic_requirements` (`obligation_id`);--> statement-breakpoint
CREATE INDEX `esg_corpus_instrument_id_unique` ON `esg_corpus` (`instrument_id`);--> statement-breakpoint
CREATE INDEX `esg_data_requirements_data_id_unique` ON `esg_data_requirements` (`data_id`);--> statement-breakpoint
CREATE INDEX `esg_data_requirements_atomic_id_idx` ON `esg_data_requirements` (`atomic_id`);--> statement-breakpoint
CREATE INDEX `esg_data_requirements_obligation_id_idx` ON `esg_data_requirements` (`obligation_id`);--> statement-breakpoint
CREATE INDEX `esg_gs1_mappings_data_id_unique` ON `esg_gs1_mappings` (`data_id`);--> statement-breakpoint
CREATE INDEX `esg_gs1_mappings_mapping_strength_idx` ON `esg_gs1_mappings` (`mapping_strength`);--> statement-breakpoint
CREATE INDEX `esg_gs1_mappings_total_score_idx` ON `esg_gs1_mappings` (`total_score`);--> statement-breakpoint
CREATE INDEX `esg_obligations_obligation_id_unique` ON `esg_obligations` (`obligation_id`);--> statement-breakpoint
CREATE INDEX `esg_obligations_instrument_id_idx` ON `esg_obligations` (`instrument_id`);