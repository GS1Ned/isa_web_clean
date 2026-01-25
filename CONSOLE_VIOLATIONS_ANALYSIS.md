# Console Usage Violations Analysis

## Summary
Found 100+ console.* violations across the codebase. These need to be replaced with serverLogger.

## Files with violations (by priority):

### High Priority (Core infrastructure):
1. `server/_core/error-tracking.ts` - 1 violation (console.error)
2. `server/_core/index.ts` - 3 violations (console.log, console.error)
3. `server/_core/logger-wiring.ts` - 2 violations (console.error, console.log)
4. `server/_core/performance-monitoring.ts` - 1 violation (console.error)
5. `server/_core/sdk.ts` - 1 violation (console.log)
6. `server/utils/server-logger.ts` - 8 violations (console.error, console.warn, console.log)
7. `server/utils/pipeline-logger.ts` - 1 violation (console.error, console.warn, console.log)

### Medium Priority (Services & Crons):
8. `server/alert-monitoring-cron.ts` - 8 violations
9. `server/automated-cellar-sync.ts` - 4 violations
10. `server/weekly-cellar-ingestion.ts` - 15 violations
11. `server/evaluation-history.ts` - 2 violations

### Lower Priority (Scrapers):
12. `server/services/news/scrapers/efrag-scraper.ts` - 15 violations
13. `server/services/news/scrapers/eu-commission-scraper.ts` - 15 violations
14. `server/services/news/scrapers/eurlex-scraper.ts` - 15 violations
15. `server/services/news/scrapers/gs1-scraper.ts` - 8 violations
16. `server/services/news/scrapers/osha-scraper.ts` - 8 violations
17. `server/services/news/scrapers/unfccc-scraper.ts` - 8 violations

### Test Utilities:
18. `server/test-helpers/db-test-utils.ts` - 1 violation

## Strategy:
1. Replace all `console.log()` with `serverLogger.info()`
2. Replace all `console.error()` with `serverLogger.error()`
3. Replace all `console.warn()` with `serverLogger.warn()`
4. Keep comments that mention console.log() as examples
5. Import serverLogger where needed

## Files to update (in order):
1. Core infrastructure files first (highest impact)
2. Then services and crons
3. Then scrapers
4. Then test utilities
