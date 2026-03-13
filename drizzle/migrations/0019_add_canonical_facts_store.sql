-- ISA v2 Wave 5: canonical facts store (additive)

CREATE TABLE IF NOT EXISTS `canonical_facts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `source_id` INT NOT NULL,
  `source_chunk_id` INT NOT NULL,
  `evidence_key` VARCHAR(255) NOT NULL,
  `fact_type` VARCHAR(64) NOT NULL,
  `subject` VARCHAR(512) NOT NULL,
  `predicate` VARCHAR(128) NOT NULL,
  `object_value` TEXT NOT NULL,
  `confidence` DECIMAL(5,4) NOT NULL DEFAULT 0.5000,
  `metadata` JSON NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_canonical_facts_source_id` (`source_id`),
  INDEX `idx_canonical_facts_source_chunk_id` (`source_chunk_id`),
  INDEX `idx_canonical_facts_fact_type` (`fact_type`),
  INDEX `idx_canonical_facts_evidence_key` (`evidence_key`)
);

CREATE TABLE IF NOT EXISTS `canonical_fact_relations` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `source_id` INT NOT NULL,
  `source_chunk_id` INT NOT NULL,
  `from_fact_id` INT NOT NULL,
  `to_fact_id` INT NOT NULL,
  `relation_type` VARCHAR(64) NOT NULL,
  `evidence_key` VARCHAR(255) NOT NULL,
  `confidence` DECIMAL(5,4) NOT NULL DEFAULT 0.5000,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_canonical_relations_source_id` (`source_id`),
  INDEX `idx_canonical_relations_from_fact` (`from_fact_id`),
  INDEX `idx_canonical_relations_to_fact` (`to_fact_id`),
  INDEX `idx_canonical_relations_type` (`relation_type`)
);
