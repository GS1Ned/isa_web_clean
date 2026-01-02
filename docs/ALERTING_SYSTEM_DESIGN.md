# Real-Time Alerting System Design

## Overview

This document defines the design for a real-time alerting system that monitors ISA's error tracking and performance metrics, automatically notifying administrators when critical thresholds are exceeded.

## Goals

1. **Proactive Issue Detection**: Identify critical errors and performance degradation before users report issues
2. **Prevent Notification Fatigue**: Use intelligent thresholds and cooldown periods to avoid alert spam
3. **Actionable Alerts**: Provide sufficient context in notifications for immediate triage
4. **Configurable Thresholds**: Allow administrators to adjust sensitivity based on operational needs

## Alert Types

### 1. Error Rate Alert

**Trigger Conditions:**
- **Warning**: >10 errors per hour (any severity)
- **Critical**: >50 errors per hour (any severity)

**Notification Content:**
- Current error rate (errors/hour)
- Breakdown by severity (critical, error, warning)
- Top 3 operations by error count
- Link to System Monitoring dashboard

**Cooldown Period:** 1 hour (prevents re-alerting for same condition)

### 2. Critical Error Alert

**Trigger Conditions:**
- **Critical**: ≥5 critical errors within 15 minutes

**Notification Content:**
- Number of critical errors in window
- Affected operations
- Most recent error message and stack trace (truncated)
- Link to Error Tracking tab

**Cooldown Period:** 30 minutes

### 3. Performance Degradation Alert

**Trigger Conditions:**
- **Warning**: p95 duration >2x baseline for any operation
- **Critical**: p95 duration >5x baseline for any operation

**Notification Content:**
- Affected operation name
- Current p95 duration vs. baseline
- Success rate (if degraded)
- Link to Performance tab

**Cooldown Period:** 1 hour

**Baseline Calculation:**
- Use 7-day rolling average of p95 duration
- Recalculate daily at midnight
- Minimum 100 samples required for baseline

## Database Schema

### alert_history Table

```typescript
{
  id: serial('id').primaryKey(),
  alertType: varchar('alert_type', { length: 50 }).notNull(), // 'error_rate', 'critical_error', 'performance_degradation'
  severity: varchar('severity', { length: 20 }).notNull(), // 'info', 'warning', 'critical'
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  metadata: json('metadata'), // { errorRate, operations, thresholds, etc. }
  notificationSent: tinyint('notification_sent').default(0).notNull(), // 0 = false, 1 = true
  acknowledgedAt: timestamp('acknowledged_at'),
  acknowledgedBy: int('acknowledged_by'), // userId
  createdAt: timestamp('created_at').defaultNow().notNull(),
}
```

### alert_cooldowns Table

```typescript
{
  id: serial('id').primaryKey(),
  alertType: varchar('alert_type', { length: 50 }).notNull(),
  alertKey: varchar('alert_key', { length: 255 }).notNull(), // e.g., 'error_rate' or 'performance_degradation:operation_name'
  lastTriggeredAt: timestamp('last_triggered_at').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}
```

**Indexes:**
- `alert_cooldowns(alertType, alertKey, expiresAt)` for cooldown checks
- `alert_history(createdAt)` for recent alerts query
- `alert_history(acknowledgedAt)` for unacknowledged alerts query

## Alert Detection Logic

### Trigger Points

1. **Real-time (on write)**: Check thresholds when errors/performance logs are written
2. **Scheduled (cron)**: Run alert detection every 5 minutes for rate-based alerts
3. **Manual**: Admin can trigger alert check from dashboard

### Detection Flow

```
1. Query recent metrics (last 15 min, 1 hour, etc.)
2. Calculate current rates/percentiles
3. Compare against thresholds
4. Check cooldown status
5. If threshold exceeded AND not in cooldown:
   a. Create alert_history record
   b. Send notification
   c. Create cooldown record
6. Return alert status
```

### Cooldown Logic

```typescript
function isInCooldown(alertType: string, alertKey: string): boolean {
  const cooldown = db.query.alertCooldowns.findFirst({
    where: and(
      eq(alertCooldowns.alertType, alertType),
      eq(alertCooldowns.alertKey, alertKey),
      gt(alertCooldowns.expiresAt, new Date())
    )
  });
  return !!cooldown;
}

function createCooldown(alertType: string, alertKey: string, durationMinutes: number) {
  const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);
  db.insert(alertCooldowns).values({
    alertType,
    alertKey,
    lastTriggeredAt: new Date(),
    expiresAt,
  });
}
```

## Notification Service

### Email Notification Format

**Subject Line:**
- `[ISA Alert - Critical] High Error Rate Detected`
- `[ISA Alert - Warning] Performance Degradation in operation_name`

**Body Template:**
```
ISA Monitoring Alert

Alert Type: {alertType}
Severity: {severity}
Time: {timestamp}

{message}

Details:
{metadata formatted as key-value pairs}

View Dashboard: {dashboardUrl}

---
This is an automated alert from ISA System Monitoring.
Acknowledge this alert: {acknowledgeUrl}
```

### Notification Channels

**Phase 1 (Current Implementation):**
- Email via `notifyOwner()` API

**Phase 2 (Future):**
- In-app notifications (bell icon in navigation)
- Slack webhook integration
- Microsoft Teams webhook integration

## Admin Configuration UI

### Alert Settings Panel

Located at `/admin/system-monitoring` → "Alert Settings" tab

**Configurable Parameters:**
1. Error Rate Thresholds
   - Warning threshold (errors/hour)
   - Critical threshold (errors/hour)
   - Cooldown period (minutes)

2. Critical Error Thresholds
   - Critical error count threshold
   - Time window (minutes)
   - Cooldown period (minutes)

3. Performance Degradation Thresholds
   - Warning multiplier (e.g., 2x baseline)
   - Critical multiplier (e.g., 5x baseline)
   - Cooldown period (minutes)

4. Notification Channels
   - Email enabled (toggle)
   - In-app enabled (toggle)
   - Slack webhook URL (future)
   - Teams webhook URL (future)

### Alert History Viewer

Located at `/admin/system-monitoring` → "Alert History" tab

**Features:**
- Table of recent alerts (last 7 days)
- Filter by alert type, severity, acknowledged status
- Acknowledge button for each alert
- View full metadata in modal
- Export alert history to CSV

## Testing Strategy

### Unit Tests

1. **Alert Detection Logic**
   - Test threshold calculations
   - Test cooldown checking
   - Test baseline calculations
   - Test edge cases (no data, insufficient samples)

2. **Notification Service**
   - Test email formatting
   - Test notification sending
   - Test error handling (API failures)

### Integration Tests

1. **End-to-End Alert Flow**
   - Simulate error spike → verify alert triggered
   - Simulate performance degradation → verify alert triggered
   - Verify cooldown prevents duplicate alerts
   - Verify alert acknowledgment updates database

2. **Configuration Changes**
   - Update thresholds → verify new thresholds applied
   - Disable notifications → verify no emails sent

## Performance Considerations

### Query Optimization

- Use indexes for time-range queries
- Cache baseline calculations (recalculate daily)
- Limit alert history queries to 7 days by default

### Scalability

- Alert detection runs in background (non-blocking)
- Cooldowns prevent notification storms
- Alert history table can be partitioned by month if needed

## Security Considerations

- Alert configuration requires admin role
- Alert acknowledgment tracks user ID
- Notification content excludes sensitive data (PII, credentials)
- Webhook URLs stored encrypted (future)

## Rollout Plan

### Phase 1: Core Alerting (Current Sprint)
- ✅ Error rate alerts
- ✅ Critical error alerts
- ✅ Performance degradation alerts
- ✅ Email notifications
- ✅ Alert history tracking
- ✅ Basic configuration UI

### Phase 2: Enhanced Features (Future)
- In-app notification center
- Slack/Teams integration
- Custom alert rules (user-defined)
- Alert escalation (if unacknowledged for X hours)
- Alert analytics (MTTD, MTTR metrics)

## Success Metrics

- **Mean Time to Detection (MTTD)**: <5 minutes from issue occurrence
- **False Positive Rate**: <10% of alerts
- **Alert Acknowledgment Rate**: >80% within 1 hour
- **Notification Delivery Success**: >99%

## References

- System Monitoring Dashboard: `/admin/system-monitoring`
- Error Tracking: `server/db-error-tracking.ts`
- Performance Tracking: `server/db-performance-tracking.ts`
- Notification API: `server/_core/notification.ts`
