# Monitoring Dashboard Test Suite

## Overview

This document describes the comprehensive test suite for the ISA monitoring dashboard components, including error tracking and performance monitoring functionality.

## Test Coverage

### Error Tracking Tests (16 tests)

**File:** `server/db-error-tracking.test.ts`

#### trackError Function (3 tests)
- ✅ Tracks errors with all fields (operation, severity, message, stackTrace, context, userId)
- ✅ Tracks critical errors
- ✅ Tracks warnings

#### getErrorStats Function (2 tests)
- ✅ Returns error statistics (totalErrors, criticalCount, errorCount, warningCount, uniqueErrors, errorRate)
- ✅ Calculates error rate correctly (errors per hour)

#### getRecentErrors Function (3 tests)
- ✅ Returns recent errors with limit
- ✅ Filters errors by operation
- ✅ Orders errors by timestamp descending

#### getErrorTrends Function (2 tests)
- ✅ Returns error trends grouped by hour
- ✅ Includes all severity levels in trends (critical, error, warning)

#### getErrorsByOperation Function (3 tests)
- ✅ Returns errors grouped by operation
- ✅ Orders operations by error count descending
- ✅ Includes last error timestamp

#### Edge Cases (3 tests)
- ✅ Handles null error context
- ✅ Handles null stack trace
- ✅ Handles null user ID

### Performance Tracking Tests (13 tests)

**File:** `server/db-performance-tracking.test.ts`

#### trackPerformance Function (3 tests)
- ✅ Tracks performance with all fields (operation, duration, success, metadata, userId)
- ✅ Tracks slow operations
- ✅ Tracks failed operations

#### getPerformanceStats Function (2 tests)
- ✅ Returns performance statistics (totalOperations, avgDuration, p50/p95/p99 percentiles)
- ✅ Calculates percentiles correctly

#### getSlowOperations Function (3 tests)
- ✅ Returns operations exceeding threshold
- ✅ Orders operations by average duration descending
- ✅ Includes operation count

#### getPerformanceTrends Function (2 tests)
- ✅ Returns performance trends grouped by hour
- ✅ Includes duration statistics in trends (avg, min, max)

#### Edge Cases (3 tests)
- ✅ Handles null metadata
- ✅ Handles null user ID
- ✅ Handles zero duration

## Test Results

```
✓ server/db-error-tracking.test.ts (16 tests) 836ms
✓ server/db-performance-tracking.test.ts (13 tests) 783ms

Test Files: 2 passed (2)
Tests: 29 passed (29)
Duration: 2.51s
```

## Key Testing Strategies

### 1. Data Isolation
- Each test uses unique operation names generated with timestamps and random strings
- Tests clean up their own data in `afterEach` hooks
- No cross-test pollution or dependencies

### 2. MySQL Compatibility
- Fixed GROUP BY issues with MySQL's `only_full_group_by` mode
- Used raw SQL with aliases for complex aggregations
- Converted string values to numbers (MySQL returns strings for aggregates)

### 3. Percentile Calculations
- Implemented MySQL-compatible percentile calculation using ORDER BY + LIMIT + OFFSET
- Tests verify p50, p95, and p99 percentiles with known data distributions

### 4. Type Safety
- Tests verify correct data types for all fields
- Integer fields (userId, duration) use numeric values
- Boolean fields (success) use tinyint (0/1) values
- Timestamp fields are properly handled

## Implementation Fixes

### Error Tracking
1. **GROUP BY Compatibility**: Rewrote `getErrorTrends` to use raw SQL with alias
2. **Number Conversion**: Added conversion from MySQL string aggregates to JavaScript numbers
3. **Field Names**: Fixed `criticalErrors` → `criticalCount` mismatch

### Performance Tracking
1. **Percentile Calculation**: Replaced unsupported `PERCENTILE_CONT` with ORDER BY approach
2. **Field Schema**: Changed from `status` enum to `success` tinyint (0/1)
3. **Function Signature**: Updated `getSlowOperations` to accept hours parameter and return aggregated data
4. **Number Conversion**: Added conversion for all aggregate fields

## Running Tests

```bash
# Run all monitoring tests
pnpm test db-error-tracking.test.ts db-performance-tracking.test.ts

# Run error tracking tests only
pnpm test db-error-tracking.test.ts

# Run performance tracking tests only
pnpm test db-performance-tracking.test.ts
```

## Test Maintenance

### Adding New Tests
1. Use `generateTestOperation()` for unique operation names
2. Clean up test data in `afterEach` hook
3. Convert MySQL aggregate results to numbers
4. Test both success and edge cases

### Updating Database Schema
1. Update test data to match new schema
2. Update assertions to match new field names/types
3. Run tests to verify compatibility
4. Update this documentation

## Integration with Dashboard

These database helper functions are used by:
- **tRPC Routers**: `router-error-tracking.ts`, `router-performance-tracking.ts`
- **Dashboard UI**: `/admin/system-monitoring` page
- **Components**: ErrorOverviewCard, PerformanceOverviewCard, ErrorTrendChart, etc.

The comprehensive test coverage ensures that the monitoring dashboard provides reliable error tracking and performance metrics for the ISA application.
