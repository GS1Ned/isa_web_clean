# ISA Operations Runbook

**Version:** 1.0  
**Last Updated:** January 2, 2026  
**Audience:** Operations Team, Administrators

---

## Overview

This runbook provides operational procedures for maintaining ISA (Intelligent Standards Architect) in a proof-of-concept environment supporting up to 5 concurrent users. It covers routine operations, incident response, and system maintenance.

---

## System Health Checks

### Health Endpoint

The primary health check is available at `/health`:

```bash
curl https://[your-domain]/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-01-02T20:34:09.519Z",
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "ok",
      "responseTime": 5
    },
    "server": {
      "status": "ok",
      "uptime": 8471.24,
      "memory": {
        "used": 125587640,
        "total": 139550720,
        "percentage": 90
      }
    }
  }
}
```

**Status Values:**
- `healthy` - All systems operational
- `degraded` - Memory usage >90% or non-critical issues
- `unhealthy` - Database connection failed

### Daily Health Verification

Perform these checks daily:

| Check | Method | Expected Result |
|-------|--------|-----------------|
| Health endpoint | `curl /health` | `status: healthy` |
| Homepage load | Browser visit | Page loads <2s |
| Login flow | Manual test | OAuth completes |
| News Hub | Browser visit | Articles display |
| Admin dashboard | Admin login | Dashboard accessible |

---

## Monitoring Systems

### Built-in Monitoring

ISA includes several monitoring subsystems:

**Error Tracking** (`/admin/system-monitoring`)
- Recent errors with severity levels
- Error statistics and trends
- Error acknowledgment workflow

**Performance Monitoring** (`/admin/system-monitoring`)
- API response time percentiles (p50, p95, p99)
- Operation-level metrics
- Performance summaries

**Alert System**
- Error rate alerts (>10/hour warning, >50/hour critical)
- Critical error alerts (≥5 in 15 minutes)
- Performance degradation alerts (p95 >2x baseline)
- Cooldown periods prevent alert fatigue

**News Pipeline Health** (`/admin/news-pipeline`)
- Scraper execution status
- Source health indicators
- Retry statistics

### Accessing Monitoring

1. Log in as admin user
2. Navigate to Admin Dashboard
3. Select "System Monitoring" from sidebar
4. View tabs: Errors, Performance, Alerts

---

## Incident Response

### Severity Levels

| Level | Description | Response Time | Examples |
|-------|-------------|---------------|----------|
| P1 - Critical | Service unavailable | 15 minutes | Database down, auth broken |
| P2 - High | Major feature broken | 1 hour | News pipeline failing, Ask ISA errors |
| P3 - Medium | Minor feature degraded | 4 hours | Slow queries, UI glitches |
| P4 - Low | Cosmetic issues | 24 hours | Styling bugs, typos |

### P1 Response Procedure

1. **Assess** - Check health endpoint and error logs
2. **Communicate** - Notify stakeholders
3. **Mitigate** - Apply immediate fix or rollback
4. **Resolve** - Implement permanent solution
5. **Review** - Document incident and lessons learned

### Rollback Procedure

When issues require immediate rollback:

1. Open Management UI (right panel)
2. Navigate to previous checkpoint
3. Click "Rollback" button
4. Confirm rollback
5. Verify system health after rollback

**What gets rolled back:**
- Application code
- Database schema (if migrations included)
- Environment configuration

**What persists:**
- User data in database
- Uploaded files in S3
- User sessions

---

## Routine Maintenance

### Weekly Tasks

| Task | Frequency | Procedure |
|------|-----------|-----------|
| Review error logs | Weekly | Admin → System Monitoring → Errors |
| Check test suite | Weekly | `pnpm test --run` |
| Review news pipeline | Weekly | Admin → News Pipeline |
| Acknowledge alerts | Weekly | Admin → System Monitoring → Alerts |

### Monthly Tasks

| Task | Frequency | Procedure |
|------|-----------|-----------|
| Dependency audit | Monthly | `pnpm audit` |
| Performance review | Monthly | Review p95 response times |
| Database cleanup | Monthly | Remove old logs if needed |
| Documentation review | Monthly | Update runbook as needed |

---

## Common Issues and Solutions

### Issue: Site Not Loading (502/504 errors)

**Symptoms:** Browser shows gateway error

**Solutions:**
1. Check health endpoint: `curl /health`
2. If unhealthy, check database connectivity
3. Restart server via Management UI → Restart
4. If persists, rollback to previous checkpoint

### Issue: Authentication Failing

**Symptoms:** Login redirects fail, session lost

**Solutions:**
1. Clear browser cookies
2. Verify OAuth configuration (auto-managed by Manus)
3. Check JWT_SECRET exists in secrets
4. Test in incognito window

### Issue: News Pipeline Not Running

**Symptoms:** No new articles appearing

**Solutions:**
1. Check Admin → News Pipeline for execution history
2. Review scraper health status
3. Verify OPENAI_API_KEY is configured
4. Test individual scrapers manually
5. Check external source availability

### Issue: Slow API Responses

**Symptoms:** Pages load slowly, timeouts

**Solutions:**
1. Check performance metrics in Admin → System Monitoring
2. Identify slow operations
3. Review database query performance
4. Check memory usage in health endpoint
5. Consider database indexing improvements

### Issue: High Memory Usage

**Symptoms:** Health shows >90% memory, degraded status

**Solutions:**
1. Restart server via Management UI
2. Review recent code changes for memory leaks
3. Check for large data processing operations
4. Consider scaling if persistent

---

## Database Operations

### Connection Information

Access database connection details:
1. Management UI → Database
2. Click settings icon (bottom-left)
3. Enable SSL for connections

### Common Queries

**Check table sizes:**
```sql
SELECT 
  table_name,
  ROUND((data_length + index_length) / 1024 / 1024, 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = DATABASE()
ORDER BY size_mb DESC;
```

**Check recent news count:**
```sql
SELECT COUNT(*) FROM hub_news WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY);
```

**Check user count:**
```sql
SELECT COUNT(*) FROM user;
```

### Schema Migrations

Apply schema changes:
```bash
pnpm db:push
```

This command generates and applies migrations using Drizzle ORM.

---

## Scheduled Tasks (Cron Jobs)

### Active Schedules

| Job | Schedule | Endpoint | Purpose |
|-----|----------|----------|---------|
| News Pipeline | 2 AM daily | `/api/cron/news-pipeline` | Fetch and process news |
| Alert Detection | Every 5 min | `/api/cron/alert-monitoring` | Check alert thresholds |
| Health Check | Every 5 min | `/cron/health` | System health verification |

### Monitoring Cron Jobs

1. Admin Dashboard → Cron Jobs
2. View execution history
3. Check success/failure rates
4. Review error logs for failures

---

## Security Operations

### Access Control

**User Roles:**
- `user` - Standard access to public features
- `admin` - Full access including admin dashboard

**Promoting to Admin:**
1. Management UI → Database
2. Find user in `user` table
3. Update `role` field to `admin`

### Security Checklist

| Item | Status | Notes |
|------|--------|-------|
| OAuth authentication | ✅ Active | Manus OAuth |
| Session cookies | ✅ Secure | httpOnly, secure flags |
| Input validation | ✅ Active | Zod schemas on all procedures |
| SQL injection prevention | ✅ Active | Drizzle ORM parameterized queries |
| Rate limiting | ⚠️ Pending | Recommended for production |
| Security headers | ⚠️ Pending | Recommended for production |

---

## Backup and Recovery

### Automatic Backups

**Database:**
- TiDB provides automatic backups
- Retention: 7 days
- Point-in-time recovery available

**Application:**
- Checkpoints serve as application backups
- Retained indefinitely
- Instant rollback capability

**Files:**
- S3 versioning enabled
- Files recoverable from previous versions

### Manual Backup

Export database via Management UI → Database → Export

---

## Escalation Contacts

| Role | Responsibility |
|------|----------------|
| Primary Admin | First response, routine issues |
| Technical Lead | Complex issues, architecture decisions |
| Manus Support | Platform issues, infrastructure |

**Manus Support:** https://help.manus.im

---

## Appendix: Key Metrics

### Performance Targets

| Metric | Target | Alert Threshold |
|--------|--------|-----------------|
| Health check response | <100ms | >500ms |
| API response (p95) | <500ms | >2s |
| Homepage load | <2s | >5s |
| Test pass rate | ≥85% | <85% |
| Error rate | <10/hour | >50/hour |

### Current Baseline (January 2026)

| Metric | Value |
|--------|-------|
| Test suite | 751 tests, 86.5% pass rate |
| TypeScript errors | 2 (known, non-blocking) |
| Build time | ~37 seconds |
| Health check | Database 5ms response |

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-02 | Initial operational runbook |
