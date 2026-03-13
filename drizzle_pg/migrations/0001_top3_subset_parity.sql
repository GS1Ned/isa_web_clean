-- ISA2-0013a + ISA2-0015a + ISA2-0016 parity addendum
-- Hot-path performance indexes for E-01/E-02 signal propagation paths.
--
-- 0000_isa_top3_subset.sql created all tables and primary indexes.
-- This migration adds the two query-path indexes that were missing:
--
--   advisory_reports(stale_since)    — E-01: filter un-stale reports in staleness check
--   regulations(needs_verification)  — E-02: filter regulations flagged for verification
--
-- Both are partial-friendly but written as full indexes for compatibility with
-- standard Postgres deployments (Supabase PG 15+).

CREATE INDEX IF NOT EXISTS advisory_reports_stale_since_idx
  ON advisory_reports (stale_since);

CREATE INDEX IF NOT EXISTS regulations_needs_verification_idx
  ON regulations (needs_verification);
