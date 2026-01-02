CREATE TABLE `webhook_configuration` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` enum('slack','teams') NOT NULL,
	`webhook_url` text NOT NULL,
	`channel_name` varchar(255),
	`enabled` tinyint NOT NULL DEFAULT 1,
	`created_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `webhook_delivery_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` enum('slack','teams') NOT NULL,
	`webhook_url` text NOT NULL,
	`severity` enum('info','warning','critical') NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`success` tinyint NOT NULL,
	`status_code` int,
	`attempts` int DEFAULT 1,
	`error` text,
	`delivered_at` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE INDEX `platform_idx` ON `webhook_configuration` (`platform`);--> statement-breakpoint
CREATE INDEX `enabled_idx` ON `webhook_configuration` (`enabled`);--> statement-breakpoint
CREATE INDEX `platform_idx` ON `webhook_delivery_history` (`platform`);--> statement-breakpoint
CREATE INDEX `delivered_at_idx` ON `webhook_delivery_history` (`delivered_at`);--> statement-breakpoint
CREATE INDEX `success_idx` ON `webhook_delivery_history` (`success`);