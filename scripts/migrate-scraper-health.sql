-- Migration: Add scraper health monitoring tables
-- Date: 2025-12-17
-- Purpose: Enable persistent health tracking for news scrapers

-- Create scraper_executions table
CREATE TABLE IF NOT EXISTS `scraper_executions` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `source_id` VARCHAR(64) NOT NULL,
  `source_name` VARCHAR(255) NOT NULL,
  `success` BOOLEAN NOT NULL,
  `items_fetched` INT NOT NULL DEFAULT 0,
  `error_message` TEXT,
  `attempts` INT NOT NULL DEFAULT 1,
  `duration_ms` INT,
  `triggered_by` ENUM('cron', 'manual', 'api') NOT NULL DEFAULT 'cron',
  `execution_id` VARCHAR(64),
  `started_at` TIMESTAMP NOT NULL,
  `completed_at` TIMESTAMP NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_source_id` (`source_id`),
  INDEX `idx_execution_id` (`execution_id`),
  INDEX `idx_started_at` (`started_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create scraper_health_summary table
CREATE TABLE IF NOT EXISTS `scraper_health_summary` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `source_id` VARCHAR(64) NOT NULL UNIQUE,
  `source_name` VARCHAR(255) NOT NULL,
  `success_rate_24h` INT NOT NULL DEFAULT 100,
  `total_executions_24h` INT NOT NULL DEFAULT 0,
  `failed_executions_24h` INT NOT NULL DEFAULT 0,
  `avg_items_fetched_24h` INT NOT NULL DEFAULT 0,
  `avg_duration_ms_24h` INT,
  `last_execution_success` BOOLEAN,
  `last_execution_at` TIMESTAMP,
  `last_success_at` TIMESTAMP,
  `last_error_message` TEXT,
  `consecutive_failures` INT NOT NULL DEFAULT 0,
  `alert_sent` BOOLEAN NOT NULL DEFAULT FALSE,
  `alert_sent_at` TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_source_id` (`source_id`),
  INDEX `idx_last_execution_at` (`last_execution_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Verify tables created
SELECT 'Migration complete - tables created:' as status;
SHOW TABLES LIKE 'scraper_%';
