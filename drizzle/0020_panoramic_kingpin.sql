CREATE TABLE `dutch_initiatives` (
	`id` int AUTO_INCREMENT NOT NULL,
	`initiativeName` varchar(255) NOT NULL,
	`shortName` varchar(100) NOT NULL,
	`initiativeType` varchar(100) NOT NULL,
	`status` varchar(100) NOT NULL,
	`sector` varchar(255) NOT NULL,
	`scope` text NOT NULL,
	`startDate` timestamp,
	`endDate` timestamp,
	`reportingDeadline` varchar(255),
	`keyTargets` json NOT NULL,
	`complianceRequirements` text NOT NULL,
	`gs1Relevance` text NOT NULL,
	`requiredGS1Standards` json,
	`requiredGDSNAttributes` json,
	`relatedEURegulations` json,
	`managingOrganization` varchar(255),
	`officialUrl` varchar(500),
	`documentationUrl` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `dutch_initiatives_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `initiative_regulation_mappings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`initiativeId` int NOT NULL,
	`regulationId` int NOT NULL,
	`relationshipType` varchar(100) NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `initiative_regulation_mappings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `initiative_standard_mappings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`initiativeId` int NOT NULL,
	`standardId` int NOT NULL,
	`criticality` varchar(50) NOT NULL,
	`implementationNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `initiative_standard_mappings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `initiative_regulation_mappings` ADD CONSTRAINT `initiative_regulation_mappings_initiativeId_dutch_initiatives_id_fk` FOREIGN KEY (`initiativeId`) REFERENCES `dutch_initiatives`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `initiative_regulation_mappings` ADD CONSTRAINT `initiative_regulation_mappings_regulationId_regulations_id_fk` FOREIGN KEY (`regulationId`) REFERENCES `regulations`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `initiative_standard_mappings` ADD CONSTRAINT `initiative_standard_mappings_initiativeId_dutch_initiatives_id_fk` FOREIGN KEY (`initiativeId`) REFERENCES `dutch_initiatives`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `initiative_standard_mappings` ADD CONSTRAINT `initiative_standard_mappings_standardId_gs1_standards_id_fk` FOREIGN KEY (`standardId`) REFERENCES `gs1_standards`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `sector_idx` ON `dutch_initiatives` (`sector`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `dutch_initiatives` (`status`);--> statement-breakpoint
CREATE INDEX `initiativeId_idx` ON `initiative_regulation_mappings` (`initiativeId`);--> statement-breakpoint
CREATE INDEX `regulationId_idx` ON `initiative_regulation_mappings` (`regulationId`);--> statement-breakpoint
CREATE INDEX `initiativeId_idx` ON `initiative_standard_mappings` (`initiativeId`);--> statement-breakpoint
CREATE INDEX `standardId_idx` ON `initiative_standard_mappings` (`standardId`);