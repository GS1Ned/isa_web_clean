-- Migration: 0023_add_staleness_and_verification
-- Adds advisory report staleness tracking (E-01) and regulation verification flag (E-02)
-- Part of ISA v2 capability integration enhancements

ALTER TABLE advisory_reports ADD COLUMN stale_since TIMESTAMP NULL DEFAULT NULL;

ALTER TABLE regulations ADD COLUMN needs_verification TINYINT(1) NOT NULL DEFAULT 0;
