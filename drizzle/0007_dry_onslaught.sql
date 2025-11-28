CREATE TABLE `esrs_datapoints` (
	`id` int AUTO_INCREMENT NOT NULL,
	`datapointId` varchar(50) NOT NULL,
	`esrsStandard` varchar(20) NOT NULL,
	`disclosureRequirement` varchar(50),
	`paragraph` varchar(50),
	`relatedAr` varchar(50),
	`name` text NOT NULL,
	`dataType` varchar(50),
	`conditionalOrAlternative` varchar(50),
	`voluntary` boolean DEFAULT false,
	`sfdrPillar3` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `esrs_datapoints_id` PRIMARY KEY(`id`),
	CONSTRAINT `esrs_datapoints_datapointId_unique` UNIQUE(`datapointId`)
);
--> statement-breakpoint
CREATE INDEX `esrsStandard_idx` ON `esrs_datapoints` (`esrsStandard`);--> statement-breakpoint
CREATE INDEX `disclosureRequirement_idx` ON `esrs_datapoints` (`disclosureRequirement`);