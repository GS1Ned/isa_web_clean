ALTER TABLE `sources`
  ADD COLUMN IF NOT EXISTS `dataset_id` varchar(255),
  ADD COLUMN IF NOT EXISTS `source_role` varchar(64),
  ADD COLUMN IF NOT EXISTS `source_locator` varchar(1024),
  ADD COLUMN IF NOT EXISTS `retrieved_at` timestamp,
  ADD COLUMN IF NOT EXISTS `content_hash` varchar(64),
  ADD COLUMN IF NOT EXISTS `admission_basis` varchar(64);
--> statement-breakpoint
CREATE INDEX `dataset_id_idx` ON `sources` (`dataset_id`);
--> statement-breakpoint
CREATE INDEX `source_role_idx` ON `sources` (`source_role`);
--> statement-breakpoint
ALTER TABLE `knowledge_embeddings`
  ADD COLUMN IF NOT EXISTS `source_chunk_id` int;
--> statement-breakpoint
CREATE INDEX `source_chunk_id_idx` ON `knowledge_embeddings` (`source_chunk_id`);
