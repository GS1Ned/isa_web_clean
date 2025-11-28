CREATE TABLE `epcis_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`eventType` enum('ObjectEvent','AggregationEvent','TransactionEvent','TransformationEvent','AssociationEvent') NOT NULL,
	`eventTime` timestamp NOT NULL,
	`eventTimeZoneOffset` varchar(10),
	`action` enum('OBSERVE','ADD','DELETE'),
	`bizStep` varchar(255),
	`disposition` varchar(255),
	`readPoint` varchar(255),
	`bizLocation` varchar(255),
	`epcList` json,
	`quantityList` json,
	`sensorElementList` json,
	`sourceList` json,
	`destinationList` json,
	`ilmd` json,
	`rawEvent` json NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `epcis_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `eudr_geolocation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`productGtin` varchar(14) NOT NULL,
	`originLat` decimal(10,8) NOT NULL,
	`originLng` decimal(11,8) NOT NULL,
	`geofenceGeoJSON` json,
	`deforestationRisk` enum('low','medium','high'),
	`riskAssessmentDate` timestamp,
	`dueDiligenceStatement` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `eudr_geolocation_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supply_chain_edges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fromNodeId` int NOT NULL,
	`toNodeId` int NOT NULL,
	`productGtin` varchar(14),
	`relationshipType` enum('supplies','manufactures','distributes','retails') NOT NULL,
	`lastTransactionDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `supply_chain_edges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `supply_chain_nodes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nodeType` enum('supplier','manufacturer','distributor','retailer','recycler') NOT NULL,
	`gln` varchar(13),
	`name` varchar(255) NOT NULL,
	`tierLevel` int,
	`locationLat` decimal(10,8),
	`locationLng` decimal(11,8),
	`riskLevel` enum('low','medium','high'),
	`riskFactors` json,
	`certifications` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `supply_chain_nodes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `userId_idx` ON `epcis_events` (`userId`);--> statement-breakpoint
CREATE INDEX `eventTime_idx` ON `epcis_events` (`eventTime`);--> statement-breakpoint
CREATE INDEX `eventType_idx` ON `epcis_events` (`eventType`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `eudr_geolocation` (`userId`);--> statement-breakpoint
CREATE INDEX `productGtin_idx` ON `eudr_geolocation` (`productGtin`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `supply_chain_edges` (`userId`);--> statement-breakpoint
CREATE INDEX `fromNode_idx` ON `supply_chain_edges` (`fromNodeId`);--> statement-breakpoint
CREATE INDEX `toNode_idx` ON `supply_chain_edges` (`toNodeId`);--> statement-breakpoint
CREATE INDEX `userId_idx` ON `supply_chain_nodes` (`userId`);--> statement-breakpoint
CREATE INDEX `gln_idx` ON `supply_chain_nodes` (`gln`);