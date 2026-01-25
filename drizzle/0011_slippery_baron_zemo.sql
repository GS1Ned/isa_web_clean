CREATE TABLE `evaluation_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT 'CURRENT_TIMESTAMP',
	`totalTests` int NOT NULL,
	`passedTests` int NOT NULL,
	`failedTests` int NOT NULL,
	`averageScore` decimal(4,3) NOT NULL,
	`keywordCoverage` decimal(4,3) NOT NULL,
	`citationCount` decimal(4,2) NOT NULL,
	`authorityScore` decimal(4,3) NOT NULL,
	`claimVerificationRate` decimal(4,3) NOT NULL,
	`averageResponseTime` int NOT NULL,
	`categoryBreakdown` json NOT NULL,
	`difficultyBreakdown` json NOT NULL,
	`regressions` json NOT NULL,
	`improvements` json NOT NULL,
	`results` json NOT NULL,
	`runBy` varchar(255)
);
--> statement-breakpoint
CREATE INDEX `idx_timestamp` ON `evaluation_reports` (`timestamp`);--> statement-breakpoint
CREATE INDEX `idx_average_score` ON `evaluation_reports` (`averageScore`);