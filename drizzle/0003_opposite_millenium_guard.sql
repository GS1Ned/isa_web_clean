CREATE TABLE `hub_news` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(512) NOT NULL,
	`summary` text,
	`content` text,
	`newsType` enum('NEW_LAW','AMENDMENT','ENFORCEMENT','COURT_DECISION','GUIDANCE','PROPOSAL') NOT NULL,
	`relatedRegulationIds` json,
	`sourceUrl` varchar(512),
	`sourceTitle` varchar(255),
	`credibilityScore` decimal(3,2) DEFAULT '0.00',
	`publishedDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hub_news_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hub_resources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(512) NOT NULL,
	`description` text,
	`resourceType` enum('GUIDE','CHECKLIST','TEMPLATE','CASE_STUDY','WHITEPAPER','TOOL') NOT NULL,
	`relatedRegulationIds` json,
	`relatedStandardIds` json,
	`fileUrl` varchar(512),
	`downloadCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hub_resources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`alertType` enum('REGULATION_UPDATE','DEADLINE_APPROACHING','NEW_REGULATION','ENFORCEMENT_ACTION') NOT NULL,
	`regulationId` int,
	`standardId` int,
	`daysBeforeDeadline` int,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_saved_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`itemType` enum('REGULATION','NEWS','RESOURCE') NOT NULL,
	`itemId` int NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_saved_items_id` PRIMARY KEY(`id`)
);
