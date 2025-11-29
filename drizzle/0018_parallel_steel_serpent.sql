CREATE TABLE `user_onboarding_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`completedSteps` json DEFAULT ('[]'),
	`currentStep` int DEFAULT 1,
	`completionPercentage` int DEFAULT 0,
	`isCompleted` boolean DEFAULT false,
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_onboarding_progress_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_onboarding_progress_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE INDEX `userId_idx` ON `user_onboarding_progress` (`userId`);