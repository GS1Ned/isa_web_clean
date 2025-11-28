CREATE TABLE `epcis_batch_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileSize` int NOT NULL,
	`status` enum('queued','processing','completed','failed') NOT NULL DEFAULT 'queued',
	`totalEvents` int DEFAULT 0,
	`processedEvents` int DEFAULT 0,
	`failedEvents` int DEFAULT 0,
	`errorMessage` text,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `epcis_batch_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supply_chain_analytics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`metricDate` timestamp NOT NULL,
	`totalEvents` int DEFAULT 0,
	`totalNodes` int DEFAULT 0,
	`totalEdges` int DEFAULT 0,
	`highRiskNodes` int DEFAULT 0,
	`averageTraceabilityScore` decimal(5,2),
	`complianceScore` decimal(5,2),
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supply_chain_analytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supply_chain_risks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`eventId` int NOT NULL,
	`nodeId` int,
	`riskType` enum('deforestation','labor','environmental','traceability','certification','geolocation') NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL,
	`description` text NOT NULL,
	`regulationId` int,
	`recommendedAction` text,
	`isResolved` boolean DEFAULT false,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supply_chain_risks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `userId_idx` ON `epcis_batch_jobs` (`userId`);--> statement-breakpoint
CREATE INDEX `status_idx` ON `epcis_batch_jobs` (`status`);--> statement-breakpoint
CREATE INDEX `createdAt_idx` ON `epcis_batch_jobs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `supply_chain_analytics` (`userId`);--> statement-breakpoint
CREATE INDEX `metricDate_idx` ON `supply_chain_analytics` (`metricDate`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `supply_chain_risks` (`userId`);--> statement-breakpoint
CREATE INDEX `eventId_idx` ON `supply_chain_risks` (`eventId`);--> statement-breakpoint
CREATE INDEX `nodeId_idx` ON `supply_chain_risks` (`nodeId`);--> statement-breakpoint
CREATE INDEX `severity_idx` ON `supply_chain_risks` (`severity`);--> statement-breakpoint
CREATE INDEX `riskType_idx` ON `supply_chain_risks` (`riskType`);