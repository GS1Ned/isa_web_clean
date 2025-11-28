CREATE TABLE `roadmap_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(64) NOT NULL,
	`strategy` varchar(32) NOT NULL,
	`estimatedEffort` int NOT NULL,
	`estimatedImpact` decimal(5,2),
	`targetScore` decimal(5,2),
	`isPublic` boolean DEFAULT true,
	`createdBy` int NOT NULL,
	`usageCount` int DEFAULT 0,
	`rating` decimal(3,2) DEFAULT 0,
	`tags` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `roadmap_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `template_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`sequenceNumber` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`actionType` varchar(64) NOT NULL,
	`priority` varchar(32) NOT NULL,
	`estimatedEffort` int NOT NULL,
	`estimatedImpact` decimal(5,2),
	`successCriteria` text,
	`relatedStandards` json,
	CONSTRAINT `template_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `template_milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`sequenceNumber` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`targetScore` decimal(5,2) NOT NULL,
	`daysFromStart` int NOT NULL,
	CONSTRAINT `template_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `template_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateId` int NOT NULL,
	`userId` int NOT NULL,
	`roadmapId` int NOT NULL,
	`rating` int,
	`feedback` text,
	`usedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `template_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `category_idx` ON `roadmap_templates` (`category`);--> statement-breakpoint
CREATE INDEX `createdBy_idx` ON `roadmap_templates` (`createdBy`);--> statement-breakpoint
CREATE INDEX `templateId_idx` ON `template_actions` (`templateId`);--> statement-breakpoint
CREATE INDEX `templateId_idx` ON `template_milestones` (`templateId`);--> statement-breakpoint
CREATE INDEX `templateId_idx` ON `template_usage` (`templateId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `template_usage` (`userId`);