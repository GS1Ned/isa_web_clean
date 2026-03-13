ALTER TABLE `advisory_report_versions`
ADD COLUMN `decisionArtifacts` json NULL AFTER `content`;
