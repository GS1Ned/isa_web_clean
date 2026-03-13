ALTER TABLE `advisory_reports`
ADD COLUMN `decisionArtifacts` json NULL AFTER `gs1ImpactTags`;
