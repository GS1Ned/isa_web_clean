CREATE TABLE `ingestion_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`syncStartTime` timestamp NOT NULL,
	`syncEndTime` timestamp,
	`status` enum('pending','success','failed') NOT NULL DEFAULT 'pending',
	`regulationsInserted` int NOT NULL DEFAULT 0,
	`regulationsUpdated` int NOT NULL DEFAULT 0,
	`regulationsTotal` int NOT NULL DEFAULT 0,
	`errors` int NOT NULL DEFAULT 0,
	`errorDetails` text,
	`durationSeconds` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ingestion_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `status_idx` ON `ingestion_logs` (`status`);--> statement-breakpoint
CREATE INDEX `syncStartTime_idx` ON `ingestion_logs` (`syncStartTime`);