CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`riskDetected` boolean DEFAULT true,
	`remediationUpdated` boolean DEFAULT true,
	`commentAdded` boolean DEFAULT true,
	`approvalRequested` boolean DEFAULT true,
	`approvalDecision` boolean DEFAULT true,
	`templateUpdated` boolean DEFAULT true,
	`scoreChanged` boolean DEFAULT true,
	`milestoneAchieved` boolean DEFAULT true,
	`minSeverity` varchar(32) DEFAULT 'low',
	`inAppNotifications` boolean DEFAULT true,
	`emailNotifications` boolean DEFAULT false,
	`quietHoursEnabled` boolean DEFAULT false,
	`quietHoursStart` varchar(5),
	`quietHoursEnd` varchar(5),
	`batchNotifications` boolean DEFAULT false,
	`batchInterval` int DEFAULT 60,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE INDEX `userId_idx` ON `notification_preferences` (`userId`);