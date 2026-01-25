ALTER TABLE `knowledge_embeddings` ADD `datasetId` varchar(255);--> statement-breakpoint
ALTER TABLE `knowledge_embeddings` ADD `datasetVersion` varchar(64);--> statement-breakpoint
ALTER TABLE `knowledge_embeddings` ADD `lastVerifiedDate` timestamp;--> statement-breakpoint
ALTER TABLE `knowledge_embeddings` ADD `isDeprecated` tinyint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `knowledge_embeddings` ADD `deprecationReason` text;