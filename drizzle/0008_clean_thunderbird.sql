CREATE TABLE `regulation_esrs_mappings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`regulationId` int NOT NULL,
	`datapointId` int NOT NULL,
	`relevanceScore` int NOT NULL DEFAULT 5,
	`reasoning` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `regulation_esrs_mappings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `regulationId_idx` ON `regulation_esrs_mappings` (`regulationId`);--> statement-breakpoint
CREATE INDEX `datapointId_idx` ON `regulation_esrs_mappings` (`datapointId`);--> statement-breakpoint
CREATE INDEX `unique_mapping_idx` ON `regulation_esrs_mappings` (`regulationId`,`datapointId`);