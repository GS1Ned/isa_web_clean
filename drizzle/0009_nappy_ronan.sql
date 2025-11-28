CREATE TABLE `mapping_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`mappingId` int NOT NULL,
	`vote` boolean NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mapping_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `userId_idx` ON `mapping_feedback` (`userId`);--> statement-breakpoint
CREATE INDEX `mappingId_idx` ON `mapping_feedback` (`mappingId`);--> statement-breakpoint
CREATE INDEX `unique_vote_idx` ON `mapping_feedback` (`userId`,`mappingId`);