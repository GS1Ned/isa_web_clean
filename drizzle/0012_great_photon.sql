CREATE TABLE `compliance_scores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`overallScore` decimal(5,2) NOT NULL,
	`riskManagementScore` decimal(5,2) NOT NULL,
	`remediationScore` decimal(5,2) NOT NULL,
	`evidenceScore` decimal(5,2) NOT NULL,
	`regulationScore` decimal(5,2) NOT NULL,
	`totalRisks` int DEFAULT 0,
	`resolvedRisks` int DEFAULT 0,
	`totalRemediationPlans` int DEFAULT 0,
	`completedPlans` int DEFAULT 0,
	`totalEvidence` int DEFAULT 0,
	`verifiedEvidence` int DEFAULT 0,
	`regulationsCovered` int DEFAULT 0,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `compliance_scores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `score_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`overallScore` decimal(5,2) NOT NULL,
	`riskManagementScore` decimal(5,2) NOT NULL,
	`remediationScore` decimal(5,2) NOT NULL,
	`evidenceScore` decimal(5,2) NOT NULL,
	`regulationScore` decimal(5,2) NOT NULL,
	`changeReason` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `score_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `score_milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`milestoneType` varchar(128) NOT NULL,
	`milestoneTitle` varchar(255) NOT NULL,
	`description` text,
	`achievedAt` timestamp NOT NULL,
	`badge` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `score_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scoring_benchmarks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`industry` varchar(128) NOT NULL,
	`region` varchar(128) NOT NULL,
	`avgOverallScore` decimal(5,2) NOT NULL,
	`avgRiskManagementScore` decimal(5,2) NOT NULL,
	`avgRemediationScore` decimal(5,2) NOT NULL,
	`avgEvidenceScore` decimal(5,2) NOT NULL,
	`avgRegulationScore` decimal(5,2) NOT NULL,
	`percentile75` decimal(5,2) NOT NULL,
	`percentile90` decimal(5,2) NOT NULL,
	`dataPoints` int DEFAULT 0,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `scoring_benchmarks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `userId_idx` ON `compliance_scores` (`userId`);--> statement-breakpoint
CREATE INDEX `overallScore_idx` ON `compliance_scores` (`overallScore`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `score_history` (`userId`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `score_history` (`createdAt`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `score_milestones` (`userId`);--> statement-breakpoint
CREATE INDEX `achievedAt_idx` ON `score_milestones` (`achievedAt`);--> statement-breakpoint
CREATE INDEX `industry_region_idx` ON `scoring_benchmarks` (`industry`,`region`);