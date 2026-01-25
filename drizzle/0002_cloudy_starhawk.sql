CREATE TABLE `attribute_regulation_mappings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`attributeId` int NOT NULL,
	`regulationId` int NOT NULL,
	`esrsDatapointId` int,
	`mappingReason` text,
	`relevanceScore` decimal(3,2) DEFAULT '0.00',
	`verifiedByAdmin` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `attribute_regulation_mappings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `epcis_event_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`templateName` varchar(255) NOT NULL,
	`eventType` enum('object','aggregation','transformation','transaction','association') NOT NULL,
	`useCase` varchar(255),
	`regulationId` int,
	`esrsDatapointId` int,
	`eventSchema` json NOT NULL,
	`cbvVocabulary` json,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `epcis_event_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gs1_attribute_code_lists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`attributeId` int NOT NULL,
	`code` varchar(50) NOT NULL,
	`description` text,
	`sortOrder` int DEFAULT 0,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `gs1_attribute_code_lists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `gs1_attributes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`attributeCode` varchar(100) NOT NULL,
	`attributeName` varchar(255) NOT NULL,
	`sector` enum('food_hb','diy_garden_pet','healthcare','agriculture') NOT NULL,
	`description` text,
	`datatype` enum('text','number','boolean','date','code_list') NOT NULL,
	`codeListId` int,
	`isMandatory` boolean DEFAULT false,
	`esrsRelevance` text,
	`dppRelevance` text,
	`packagingRelated` boolean DEFAULT false,
	`sustainabilityRelated` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gs1_attributes_id` PRIMARY KEY(`id`),
	CONSTRAINT `gs1_attributes_attributeCode_unique` UNIQUE(`attributeCode`)
);
--> statement-breakpoint
CREATE TABLE `gs1_web_vocabulary` (
	`id` int AUTO_INCREMENT NOT NULL,
	`propertyName` varchar(255) NOT NULL,
	`propertyUri` varchar(500) NOT NULL,
	`className` varchar(255),
	`description` text,
	`datatype` varchar(100),
	`dppRequirementId` int,
	`esrsDatapointId` int,
	`exampleValue` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `gs1_web_vocabulary_id` PRIMARY KEY(`id`),
	CONSTRAINT `gs1_web_vocabulary_propertyName_unique` UNIQUE(`propertyName`)
);
--> statement-breakpoint
CREATE INDEX `attribute_id_idx` ON `attribute_regulation_mappings` (`attributeId`);--> statement-breakpoint
CREATE INDEX `regulation_id_idx` ON `attribute_regulation_mappings` (`regulationId`);--> statement-breakpoint
CREATE INDEX `use_case_idx` ON `epcis_event_templates` (`useCase`);--> statement-breakpoint
CREATE INDEX `regulation_id_idx` ON `epcis_event_templates` (`regulationId`);--> statement-breakpoint
CREATE INDEX `attribute_id_idx` ON `gs1_attribute_code_lists` (`attributeId`);--> statement-breakpoint
CREATE INDEX `sector_idx` ON `gs1_attributes` (`sector`);--> statement-breakpoint
CREATE INDEX `packaging_idx` ON `gs1_attributes` (`packagingRelated`);--> statement-breakpoint
CREATE INDEX `sustainability_idx` ON `gs1_attributes` (`sustainabilityRelated`);--> statement-breakpoint
CREATE INDEX `class_name_idx` ON `gs1_web_vocabulary` (`className`);