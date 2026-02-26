-- ISA v2 Wave 2/3: ASR metadata extension (additive)
-- Adds authority/licensing/publication/immutable URI metadata to dataset_registry and sources.

ALTER TABLE `dataset_registry`
  ADD COLUMN IF NOT EXISTS `authority_tier` VARCHAR(64) NULL AFTER `source`,
  ADD COLUMN IF NOT EXISTS `license_type` VARCHAR(64) NULL AFTER `authority_tier`,
  ADD COLUMN IF NOT EXISTS `publication_status` VARCHAR(64) NULL AFTER `license_type`,
  ADD COLUMN IF NOT EXISTS `immutable_uri` VARCHAR(1024) NULL AFTER `publication_status`;

ALTER TABLE `sources`
  ADD COLUMN IF NOT EXISTS `authority_tier` VARCHAR(64) NULL AFTER `authority_level`,
  ADD COLUMN IF NOT EXISTS `license_type` VARCHAR(64) NULL AFTER `authority_tier`,
  ADD COLUMN IF NOT EXISTS `publication_status` VARCHAR(64) NULL AFTER `license_type`,
  ADD COLUMN IF NOT EXISTS `immutable_uri` VARCHAR(1024) NULL AFTER `publication_status`;

CREATE INDEX `idx_dataset_registry_authority_tier` ON `dataset_registry` (`authority_tier`);
CREATE INDEX `idx_dataset_registry_publication_status` ON `dataset_registry` (`publication_status`);
CREATE INDEX `idx_sources_authority_tier` ON `sources` (`authority_tier`);
CREATE INDEX `idx_sources_publication_status` ON `sources` (`publication_status`);
