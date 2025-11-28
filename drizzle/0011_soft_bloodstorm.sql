CREATE TABLE `compliance_evidence` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`stepId` int NOT NULL,
	`evidenceType` varchar(128) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`fileUrl` varchar(512),
	`fileKey` varchar(512),
	`mimeType` varchar(128),
	`fileSize` int,
	`uploadedBy` varchar(255),
	`verificationStatus` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
	`verifiedAt` timestamp,
	`verifiedBy` varchar(255),
	`verificationNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `compliance_evidence_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `remediation_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`planId` int NOT NULL,
	`totalSteps` int NOT NULL,
	`completedSteps` int DEFAULT 0,
	`evidenceSubmitted` int DEFAULT 0,
	`evidenceVerified` int DEFAULT 0,
	`progressPercentage` int DEFAULT 0,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `remediation_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `remediation_steps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planId` int NOT NULL,
	`stepNumber` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`requiredEvidence` text,
	`status` enum('pending','in_progress','completed','skipped') NOT NULL DEFAULT 'pending',
	`assignedTo` varchar(255),
	`dueDate` timestamp,
	`completedAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `remediation_steps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `remediation_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`riskType` varchar(128) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`steps` json NOT NULL,
	`estimatedDays` int,
	`isActive` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `remediation_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `risk_remediation_plans` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`riskId` int NOT NULL,
	`status` enum('draft','in_progress','completed','cancelled') NOT NULL DEFAULT 'draft',
	`title` varchar(255) NOT NULL,
	`description` text,
	`targetCompletionDate` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `risk_remediation_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `userId_idx` ON `compliance_evidence` (`userId`);--> statement-breakpoint
CREATE INDEX `stepId_idx` ON `compliance_evidence` (`stepId`);--> statement-breakpoint
CREATE INDEX `verificationStatus_idx` ON `compliance_evidence` (`verificationStatus`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `remediation_progress` (`userId`);--> statement-breakpoint
CREATE INDEX `planId_idx` ON `remediation_progress` (`planId`);--> statement-breakpoint
CREATE INDEX `planId_idx` ON `remediation_steps` (`planId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `remediation_steps` (`status`);--> statement-breakpoint
CREATE INDEX `riskType_idx` ON `remediation_templates` (`riskType`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `risk_remediation_plans` (`userId`);--> statement-breakpoint
CREATE INDEX `riskId_idx` ON `risk_remediation_plans` (`riskId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `risk_remediation_plans` (`status`);