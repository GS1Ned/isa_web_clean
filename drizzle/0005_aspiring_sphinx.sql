CREATE TABLE `alert_cooldowns` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alert_type` varchar(50) NOT NULL,
	`alert_key` varchar(255) NOT NULL,
	`last_triggered_at` timestamp NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `alert_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`alert_type` varchar(50) NOT NULL,
	`severity` varchar(20) NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`metadata` json,
	`notification_sent` tinyint NOT NULL DEFAULT 0,
	`acknowledged_at` timestamp,
	`acknowledged_by` int,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `error_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`severity` enum('critical','error','warning','info') NOT NULL,
	`message` text NOT NULL,
	`operation` varchar(255) NOT NULL,
	`stackTrace` text,
	`context` json,
	`userId` int,
	`requestId` varchar(128),
	`resolved` tinyint NOT NULL DEFAULT 0,
	`resolvedAt` timestamp,
	`resolvedBy` varchar(255),
	`notes` text
);
--> statement-breakpoint
CREATE TABLE `performance_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`operation` varchar(255) NOT NULL,
	`duration` int NOT NULL,
	`success` tinyint NOT NULL DEFAULT 1,
	`userId` int,
	`requestId` varchar(128),
	`metadata` json
);
--> statement-breakpoint
ALTER TABLE `dutch_initiatives` ADD `requiredGS1Standards` json;--> statement-breakpoint
ALTER TABLE `dutch_initiatives` ADD `requiredGDSNAttributes` json;--> statement-breakpoint
ALTER TABLE `dutch_initiatives` ADD `relatedEURegulations` json;--> statement-breakpoint
CREATE INDEX `alert_type_key_idx` ON `alert_cooldowns` (`alert_type`,`alert_key`);--> statement-breakpoint
CREATE INDEX `expires_at_idx` ON `alert_cooldowns` (`expires_at`);--> statement-breakpoint
CREATE INDEX `alert_type_idx` ON `alert_history` (`alert_type`);--> statement-breakpoint
CREATE INDEX `severity_idx` ON `alert_history` (`severity`);--> statement-breakpoint
CREATE INDEX `created_at_idx` ON `alert_history` (`created_at`);--> statement-breakpoint
CREATE INDEX `acknowledged_at_idx` ON `alert_history` (`acknowledged_at`);--> statement-breakpoint
CREATE INDEX `timestamp_idx` ON `error_log` (`timestamp`);--> statement-breakpoint
CREATE INDEX `severity_idx` ON `error_log` (`severity`);--> statement-breakpoint
CREATE INDEX `operation_idx` ON `error_log` (`operation`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `error_log` (`userId`);--> statement-breakpoint
CREATE INDEX `timestamp_idx` ON `performance_log` (`timestamp`);--> statement-breakpoint
CREATE INDEX `operation_idx` ON `performance_log` (`operation`);--> statement-breakpoint
CREATE INDEX `duration_idx` ON `performance_log` (`duration`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `performance_log` (`userId`);--> statement-breakpoint
ALTER TABLE `dutch_initiatives` DROP COLUMN `requiredGs1Standards`;--> statement-breakpoint
ALTER TABLE `dutch_initiatives` DROP COLUMN `requiredGdsnAttributes`;--> statement-breakpoint
ALTER TABLE `dutch_initiatives` DROP COLUMN `relatedEuRegulations`;