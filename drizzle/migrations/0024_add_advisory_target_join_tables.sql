-- Migration: 0024_add_advisory_target_join_tables
-- Purpose: normalize advisory report target filters for portability + hot-path performance
-- Scope: MySQL runtime path (CURRENT), additive only

CREATE TABLE IF NOT EXISTS advisory_report_target_regulations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  regulation_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY advisory_report_target_regulations_report_regulation_uq (report_id, regulation_id),
  KEY advisory_report_target_regulations_regulation_id_idx (regulation_id),
  KEY advisory_report_target_regulations_report_id_idx (report_id)
);

CREATE TABLE IF NOT EXISTS advisory_report_target_standards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  report_id INT NOT NULL,
  standard_id INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY advisory_report_target_standards_report_standard_uq (report_id, standard_id),
  KEY advisory_report_target_standards_standard_id_idx (standard_id),
  KEY advisory_report_target_standards_report_id_idx (report_id)
);

-- Best-effort backfill from JSON arrays when legacy columns are present.
-- Safe no-op if those columns are not part of the active advisory_reports schema.
SET @has_target_reg_ids := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'advisory_reports'
    AND column_name = 'targetRegulationIds'
);

SET @has_target_std_ids := (
  SELECT COUNT(*)
  FROM information_schema.columns
  WHERE table_schema = DATABASE()
    AND table_name = 'advisory_reports'
    AND column_name = 'targetStandardIds'
);

SET @sql_backfill_reg := IF(
  @has_target_reg_ids > 0,
  "INSERT INTO advisory_report_target_regulations (report_id, regulation_id)
   SELECT ar.id, jt.regulation_id
   FROM advisory_reports ar
   JOIN JSON_TABLE(
     ar.targetRegulationIds,
     '$[*]' COLUMNS (
       regulation_id INT PATH '$'
     )
   ) jt
   ON TRUE
   ON DUPLICATE KEY UPDATE regulation_id = VALUES(regulation_id)",
  "SELECT 1"
);

PREPARE backfill_reg_stmt FROM @sql_backfill_reg;
EXECUTE backfill_reg_stmt;
DEALLOCATE PREPARE backfill_reg_stmt;

SET @sql_backfill_std := IF(
  @has_target_std_ids > 0,
  "INSERT INTO advisory_report_target_standards (report_id, standard_id)
   SELECT ar.id, jt.standard_id
   FROM advisory_reports ar
   JOIN JSON_TABLE(
     ar.targetStandardIds,
     '$[*]' COLUMNS (
       standard_id INT PATH '$'
     )
   ) jt
   ON TRUE
   ON DUPLICATE KEY UPDATE standard_id = VALUES(standard_id)",
  "SELECT 1"
);

PREPARE backfill_std_stmt FROM @sql_backfill_std;
EXECUTE backfill_std_stmt;
DEALLOCATE PREPARE backfill_std_stmt;
