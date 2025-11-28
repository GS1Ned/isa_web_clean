CREATE TABLE `roadmap_activity_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roadmapId` int NOT NULL,
	`userId` int NOT NULL,
	`activityType` varchar(64) NOT NULL,
	`description` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roadmap_activity_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roadmap_approvals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roadmapId` int NOT NULL,
	`actionId` int,
	`requiredApproverId` int NOT NULL,
	`approverRole` varchar(64),
	`status` varchar(32) DEFAULT 'pending',
	`approvedAt` timestamp,
	`approverComments` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roadmap_approvals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roadmap_comments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roadmapId` int NOT NULL,
	`actionId` int,
	`userId` int NOT NULL,
	`content` text NOT NULL,
	`isApproval` boolean DEFAULT false,
	`approvalStatus` varchar(32),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `roadmap_comments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `team_roadmap_access` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roadmapId` int NOT NULL,
	`userId` int NOT NULL,
	`accessLevel` varchar(32) NOT NULL,
	`grantedBy` int NOT NULL,
	`grantedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `team_roadmap_access_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `roadmapId_idx` ON `roadmap_activity_log` (`roadmapId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `roadmap_activity_log` (`userId`);--> statement-breakpoint
CREATE INDEX `activityType_idx` ON `roadmap_activity_log` (`activityType`);--> statement-breakpoint
CREATE INDEX `roadmapId_idx` ON `roadmap_approvals` (`roadmapId`);--> statement-breakpoint
CREATE INDEX `requiredApproverId_idx` ON `roadmap_approvals` (`requiredApproverId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `roadmap_approvals` (`status`);--> statement-breakpoint
CREATE INDEX `roadmapId_idx` ON `roadmap_comments` (`roadmapId`);--> statement-breakpoint
CREATE INDEX `actionId_idx` ON `roadmap_comments` (`actionId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `roadmap_comments` (`userId`);--> statement-breakpoint
CREATE INDEX `roadmapId_idx` ON `team_roadmap_access` (`roadmapId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `team_roadmap_access` (`userId`);