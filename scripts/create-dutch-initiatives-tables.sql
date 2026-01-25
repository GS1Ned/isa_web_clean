-- Create Dutch Initiatives tables manually
-- This script creates the 3 new tables for Dutch compliance initiatives

CREATE TABLE IF NOT EXISTS `dutch_initiatives` (
  `id` int AUTO_INCREMENT NOT NULL,
  `initiativeName` varchar(255) NOT NULL,
  `shortName` varchar(100) NOT NULL,
  `initiativeType` varchar(100) NOT NULL,
  `status` varchar(100) NOT NULL,
  `sector` varchar(255) NOT NULL,
  `scope` text NOT NULL,
  `startDate` timestamp NULL,
  `endDate` timestamp NULL,
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
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `dutch_initiatives_id` PRIMARY KEY(`id`),
  INDEX `sector_idx` (`sector`),
  INDEX `status_idx` (`status`)
);

CREATE TABLE IF NOT EXISTS `initiative_regulation_mappings` (
  `id` int AUTO_INCREMENT NOT NULL,
  `initiativeId` int NOT NULL,
  `regulationId` int NOT NULL,
  `relationshipType` varchar(100) NOT NULL,
  `description` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `initiative_regulation_mappings_id` PRIMARY KEY(`id`),
  INDEX `initiativeId_idx` (`initiativeId`),
  INDEX `regulationId_idx` (`regulationId`),
  FOREIGN KEY (`initiativeId`) REFERENCES `dutch_initiatives`(`id`),
  FOREIGN KEY (`regulationId`) REFERENCES `regulations`(`id`)
);

CREATE TABLE IF NOT EXISTS `initiative_standard_mappings` (
  `id` int AUTO_INCREMENT NOT NULL,
  `initiativeId` int NOT NULL,
  `standardId` int NOT NULL,
  `criticality` varchar(50) NOT NULL,
  `implementationNotes` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `initiative_standard_mappings_id` PRIMARY KEY(`id`),
  INDEX `initiativeId_idx` (`initiativeId`),
  INDEX `standardId_idx` (`standardId`),
  FOREIGN KEY (`initiativeId`) REFERENCES `dutch_initiatives`(`id`),
  FOREIGN KEY (`standardId`) REFERENCES `gs1_standards`(`id`)
);
