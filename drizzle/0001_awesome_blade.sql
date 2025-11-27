CREATE TABLE `gs1_standards` (
	`id` int AUTO_INCREMENT NOT NULL,
	`standardCode` varchar(64) NOT NULL,
	`standardName` varchar(255) NOT NULL,
	`description` text,
	`category` varchar(128),
	`scope` text,
	`referenceUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gs1_standards_id` PRIMARY KEY(`id`),
	CONSTRAINT `gs1_standards_standardCode_unique` UNIQUE(`standardCode`)
);
--> statement-breakpoint
CREATE TABLE `regulation_standard_mappings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`regulationId` int NOT NULL,
	`standardId` int NOT NULL,
	`relevanceScore` decimal(3,2) DEFAULT '0.00',
	`mappingReason` text,
	`detectedAt` timestamp NOT NULL DEFAULT (now()),
	`verifiedByAdmin` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `regulation_standard_mappings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `regulations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`celexId` varchar(64),
	`title` varchar(255) NOT NULL,
	`description` text,
	`regulationType` enum('CSRD','ESRS','DPP','EUDR','ESPR','PPWR','EU_TAXONOMY','OTHER') NOT NULL,
	`effectiveDate` timestamp,
	`sourceUrl` varchar(512),
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `regulations_id` PRIMARY KEY(`id`),
	CONSTRAINT `regulations_celexId_unique` UNIQUE(`celexId`)
);
--> statement-breakpoint
CREATE TABLE `regulatory_change_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`regulationId` int NOT NULL,
	`changeType` enum('NEW','UPDATED','EFFECTIVE_DATE_CHANGED','SCOPE_EXPANDED','DEPRECATED') NOT NULL,
	`changeDescription` text,
	`affectedStandardsCount` int DEFAULT 0,
	`severity` enum('LOW','MEDIUM','HIGH','CRITICAL') DEFAULT 'MEDIUM',
	`detectedAt` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `regulatory_change_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_analyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`regulationId` int,
	`documentTitle` varchar(255),
	`documentUrl` varchar(512),
	`analysisType` enum('CELEX','DOCUMENT_UPLOAD','URL','TEXT') NOT NULL,
	`detectedStandardsCount` int DEFAULT 0,
	`analysisResult` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_analyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`interestedRegulations` json,
	`interestedStandards` json,
	`notificationsEnabled` boolean DEFAULT true,
	`industryFocus` varchar(128),
	`companySize` enum('STARTUP','SME','ENTERPRISE','OTHER'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_preferences_userId_unique` UNIQUE(`userId`)
);
