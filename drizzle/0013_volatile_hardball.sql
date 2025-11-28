CREATE TABLE `compliance_roadmaps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`strategy` varchar(128) NOT NULL,
	`targetScore` int DEFAULT 80,
	`currentScore` decimal(5,2) NOT NULL,
	`projectedScore` decimal(5,2) NOT NULL,
	`status` varchar(32) DEFAULT 'draft',
	`startDate` timestamp NOT NULL,
	`targetCompletionDate` timestamp NOT NULL,
	`estimatedEffort` int,
	`estimatedImpact` decimal(5,2),
	`progressPercentage` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `compliance_roadmaps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roadmap_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roadmapId` int NOT NULL,
	`actionType` varchar(128) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`priority` varchar(32) NOT NULL,
	`sequenceNumber` int NOT NULL,
	`estimatedEffort` int,
	`estimatedImpact` decimal(5,2),
	`startDate` timestamp NOT NULL,
	`targetDate` timestamp NOT NULL,
	`status` varchar(32) DEFAULT 'pending',
	`relatedRiskId` int,
	`relatedPlanId` int,
	`successCriteria` text,
	`blockers` text,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roadmap_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roadmap_dependencies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fromActionId` int NOT NULL,
	`toActionId` int NOT NULL,
	`dependencyType` varchar(64) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roadmap_dependencies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `roadmap_milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`roadmapId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`targetDate` timestamp NOT NULL,
	`targetScore` decimal(5,2) NOT NULL,
	`completedDate` timestamp,
	`status` varchar(32) DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `roadmap_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `userId_idx` ON `compliance_roadmaps` (`userId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `compliance_roadmaps` (`status`);--> statement-breakpoint
CREATE INDEX `roadmapId_idx` ON `roadmap_actions` (`roadmapId`);--> statement-breakpoint
CREATE INDEX `priority_idx` ON `roadmap_actions` (`priority`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `roadmap_actions` (`status`);--> statement-breakpoint
CREATE INDEX `fromActionId_idx` ON `roadmap_dependencies` (`fromActionId`);--> statement-breakpoint
CREATE INDEX `toActionId_idx` ON `roadmap_dependencies` (`toActionId`);--> statement-breakpoint
CREATE INDEX `roadmapId_idx` ON `roadmap_milestones` (`roadmapId`);