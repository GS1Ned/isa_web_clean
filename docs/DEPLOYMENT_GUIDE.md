# ISA Deployment Guide

## Overview

This guide covers deploying ISA (Intelligent Standards Architect) to production on Manus hosting platform with custom domain support.

## Prerequisites

- ISA project initialized with `webdev_init_project`
- All features tested locally
- Database migrations applied (`pnpm db:push`)
- Environment secrets configured
- Latest checkpoint saved

## Deployment Steps

### 1. Pre-Deployment Checklist

**Code Quality:**
- [ ] TypeScript errors ≤ 2 (known non-blocking issues)
- [ ] Test pass rate ≥ 90%
- [ ] No console errors in browser
- [ ] All critical features tested manually

**Database:**
- [ ] Schema migrations applied (`pnpm db:push`)
- [ ] Seed data loaded (if applicable)
- [ ] Database backups configured
- [ ] Connection string uses SSL

**Environment:**
- [ ] All required secrets configured in Settings → Secrets
- [ ] `VITE_APP_TITLE` set to "ISA - Intelligent Standards Architect"
- [ ] `VITE_APP_LOGO` points to valid logo URL
- [ ] `DATABASE_URL` configured with production credentials
- [ ] `OPENAI_API_KEY` configured for Ask ISA feature

**Security:**
- [ ] Authentication working (Manus OAuth)
- [ ] Admin routes protected (`adminProcedure`)
- [ ] API rate limiting configured
- [ ] CORS settings reviewed
- [ ] Security headers configured

### 2. Create Deployment Checkpoint

```bash
# From Manus chat interface
"Create a checkpoint for production deployment"
```

This creates a versioned snapshot that can be:
- Published to production
- Rolled back if issues arise
- Shared with team members

### 3. Publish to Production

**Via Manus UI:**
1. Open Management UI (right panel)
2. Navigate to latest checkpoint card
3. Click **"Publish"** button in header
4. Confirm deployment

**Deployment Process:**
- Builds production assets (`pnpm run build`)
- Deploys to Manus hosting infrastructure
- Assigns auto-generated domain: `xxx.manus.space`
- Enables HTTPS automatically
- Starts production server

### 4. Configure Custom Domain (Optional)

**Option A: Modify Auto-Generated Domain**
1. Open Management UI → Settings → Domains
2. Modify prefix: `isa.manus.space`
3. Save changes (instant activation)

**Option B: Purchase New Domain**
1. Open Management UI → Settings → Domains
2. Click "Purchase Domain"
3. Search for available domains
4. Complete purchase in-app
5. Domain automatically registered and assigned

**Option C: Bind Existing Domain**
1. Open Management UI → Settings → Domains
2. Click "Add Custom Domain"
3. Enter your domain: `isa.example.com`
4. Add DNS records to your domain provider:
   ```
   Type: CNAME
   Name: isa (or @ for root)
   Value: [provided by Manus]
   ```
5. Wait for DNS propagation (5-60 minutes)
6. Verify in Manus UI (auto-checks)

### 5. Post-Deployment Verification

**Smoke Tests:**
```bash
# Check homepage loads
curl https://isa.manus.space/

# Check API health
curl https://isa.manus.space/api/health

# Check authentication
# Visit https://isa.manus.space/ and test login
```

**Manual Tests:**
- [ ] Homepage loads without errors
- [ ] Login/logout works
- [ ] News Hub displays articles
- [ ] Coverage Analytics shows data
- [ ] Ask ISA responds to queries
- [ ] Admin dashboard accessible (admin users only)
- [ ] News pipeline executes successfully
- [ ] Database queries return data

**Performance Tests:**
- [ ] Homepage loads in <2 seconds
- [ ] API responses <500ms
- [ ] No console errors
- [ ] Images load correctly
- [ ] Mobile responsive

### 6. Monitoring Setup

**Built-in Analytics:**
- Management UI → Dashboard shows UV/PV metrics
- Automatic tracking (no setup required)

**Database Monitoring:**
- Management UI → Database shows table stats
- Query performance metrics
- Connection pool status

**Error Monitoring:**
- Check browser console for client errors
- Check server logs in Management UI
- Set up alerts for critical errors

**News Pipeline Monitoring:**
- Admin Dashboard → News Pipeline
- Shows execution history, success/failure rates
- Alerts for failed pipeline runs

### 7. Rollback Procedure

If issues arise after deployment:

**Via Manus UI:**
1. Open Management UI
2. Navigate to previous checkpoint
3. Click **"Rollback"** button
4. Confirm rollback

**What gets rolled back:**
- Application code
- Database schema (if migrations included)
- Environment configuration
- Static assets

**What persists:**
- User data in database
- Uploaded files in S3
- User sessions

### 8. Scaling Considerations

**Database:**
- Current: TiDB Serverless (auto-scaling)
- Upgrade: TiDB Dedicated for >10k users
- Monitoring: Watch connection pool usage

**Storage:**
- Current: S3 (unlimited)
- Optimization: Add CDN for static assets
- Monitoring: Track storage costs

**Compute:**
- Current: Manus managed (auto-scaling)
- Optimization: Review slow API endpoints
- Monitoring: Track response times

## Environment Variables

### Required for Production

```bash
# Database
DATABASE_URL=mysql://user:pass@host:4000/isa_prod?ssl=true

# Authentication (auto-configured by Manus)
JWT_SECRET=<auto-generated>
OAUTH_SERVER_URL=<auto-configured>
VITE_OAUTH_PORTAL_URL=<auto-configured>

# AI Features
OPENAI_API_KEY=<your-key>

# Application
VITE_APP_TITLE="ISA - Intelligent Standards Architect"
VITE_APP_LOGO="https://storage.example.com/isa-logo.png"

# Manus Built-in Services (auto-configured)
BUILT_IN_FORGE_API_URL=<auto-configured>
BUILT_IN_FORGE_API_KEY=<auto-configured>
```

### Optional Configuration

```bash
# Analytics (auto-configured by Manus)
VITE_ANALYTICS_ENDPOINT=<auto-configured>
VITE_ANALYTICS_WEBSITE_ID=<auto-configured>

# Cron Jobs
CRON_SECRET=<auto-generated>

# Owner Info (auto-configured)
OWNER_OPEN_ID=<auto-configured>
OWNER_NAME=<auto-configured>
```

## Scheduled Tasks (Cron Jobs)

ISA uses scheduled tasks for automated operations:

### News Pipeline (Daily)
```
Schedule: 0 0 2 * * * (2 AM daily)
Endpoint: POST /api/cron/news-pipeline
Purpose: Fetch and process latest news from sources
```

### Regulatory Sync (Weekly)
```
Schedule: 0 0 3 * * 0 (3 AM Sunday)
Endpoint: POST /api/cron/regulatory-sync
Purpose: Sync latest regulations from CELLAR
```

**Monitoring:**
- Check Admin Dashboard → Cron Jobs
- View execution history and logs
- Alerts for failed executions

## Database Migrations

### Schema Changes

```bash
# 1. Update schema
vim drizzle/schema.ts

# 2. Generate migration
pnpm db:push

# 3. Test locally
pnpm test

# 4. Create checkpoint
# (via Manus chat)

# 5. Deploy
# (via Manus UI)
```

### Data Migrations

For complex data transformations:

```typescript
// server/migrations/2025-01-02-add-sector-tags.ts
import { db } from './db';
import { hubNews } from '../drizzle/schema';

export async function migrate() {
  // Fetch all news items
  const news = await db.select().from(hubNews);
  
  // Transform data
  for (const item of news) {
    const sectorTags = extractSectorTags(item.content);
    await db.update(hubNews)
      .set({ sectorTags })
      .where(eq(hubNews.id, item.id));
  }
}
```

Run via admin interface or tRPC procedure.

## Backup and Recovery

### Database Backups

**Automatic:**
- TiDB provides point-in-time recovery
- Retention: 7 days (default)
- No manual setup required

**Manual Backup:**
```bash
# Export via Management UI → Database
# Or use mysqldump
mysqldump -h host -P 4000 -u user -p isa_prod > backup.sql
```

### Application Backups

**Checkpoints:**
- Every checkpoint is a full backup
- Includes code, config, dependencies
- Retained indefinitely
- Instant rollback capability

### File Storage Backups

**S3:**
- Versioning enabled (automatic)
- Cross-region replication (optional)
- Lifecycle policies (archive old files)

## Security Hardening

### Authentication

- ✅ Manus OAuth (production-ready)
- ✅ Session cookies (httpOnly, secure)
- ✅ JWT tokens (signed, short-lived)
- ✅ Protected routes (`protectedProcedure`)

### Authorization

- ✅ Role-based access control (admin/user)
- ✅ Admin routes gated (`adminProcedure`)
- ✅ User-scoped data queries

### API Security

- ✅ tRPC input validation (Zod schemas)
- ✅ Rate limiting (TODO: implement)
- ✅ CORS configuration
- ✅ Error sanitization (no stack traces in prod)

### Database Security

- ✅ SSL/TLS connections required
- ✅ Parameterized queries (Drizzle ORM)
- ✅ Least privilege access
- ✅ Connection pooling

### Recommendations

1. **Add rate limiting:**
   ```typescript
   // server/_core/rate-limit.ts
   import rateLimit from 'express-rate-limit';
   
   export const apiLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100 // limit each IP to 100 requests per windowMs
   });
   ```

2. **Add security headers:**
   ```typescript
   // server/index.ts
   import helmet from 'helmet';
   app.use(helmet());
   ```

3. **Monitor failed login attempts:**
   ```typescript
   // Track in database, alert on threshold
   ```

## Performance Optimization

### Frontend

- ✅ Code splitting (React.lazy)
- ✅ Image optimization (WebP, lazy loading)
- ✅ Bundle size optimization (tree shaking)
- ⏳ CDN for static assets (TODO)

### Backend

- ✅ Database indexing (on frequently queried fields)
- ✅ Query optimization (select only needed fields)
- ✅ Connection pooling
- ⏳ Redis caching (TODO for high-traffic endpoints)

### Database

- ✅ Indexes on foreign keys
- ✅ Indexes on frequently filtered fields
- ⏳ Query result caching (TODO)

### Monitoring

```bash
# Check slow queries
SELECT * FROM information_schema.processlist 
WHERE time > 1 
ORDER BY time DESC;

# Check database size
SELECT 
  table_schema,
  SUM(data_length + index_length) / 1024 / 1024 AS size_mb
FROM information_schema.tables
GROUP BY table_schema;
```

## Troubleshooting

### Deployment Fails

**Symptom:** Publish button shows error

**Solutions:**
1. Check TypeScript errors: `npx tsc --noEmit`
2. Check build locally: `pnpm run build`
3. Check database connectivity
4. Review error logs in Management UI

### Site Not Loading

**Symptom:** 502/504 errors

**Solutions:**
1. Check server status in Management UI
2. Restart server: Management UI → Restart
3. Check database connection
4. Review recent code changes
5. Rollback to previous checkpoint

### Database Connection Errors

**Symptom:** "Connection refused" or "Too many connections"

**Solutions:**
1. Verify `DATABASE_URL` in secrets
2. Check SSL requirement: `?ssl=true`
3. Check connection pool settings
4. Upgrade database tier if needed

### Authentication Not Working

**Symptom:** Login redirects fail

**Solutions:**
1. Check OAuth configuration (auto-configured by Manus)
2. Verify `JWT_SECRET` exists
3. Check cookie settings (httpOnly, secure)
4. Clear browser cookies and retry

### News Pipeline Failing

**Symptom:** No new articles appearing

**Solutions:**
1. Check Admin Dashboard → News Pipeline
2. Review execution logs
3. Test scrapers individually
4. Check external source availability
5. Verify `OPENAI_API_KEY` for AI processing

## Support and Resources

- **Manus Help:** https://help.manus.im
- **ISA Documentation:** `/docs` directory
- **Test Failure Analysis:** `docs/test-failure-analysis-2025-12-17.md`
- **Architecture Overview:** `docs/ARCHITECTURE.md`
- **News Pipeline Guide:** `docs/NEWS_PIPELINE.md`

## Deployment Checklist

**Pre-Deployment:**
- [ ] All tests passing (≥90%)
- [ ] TypeScript errors ≤2
- [ ] Database migrations applied
- [ ] Environment secrets configured
- [ ] Manual testing complete
- [ ] Checkpoint created

**Deployment:**
- [ ] Published via Manus UI
- [ ] Custom domain configured (if applicable)
- [ ] DNS propagated and verified
- [ ] HTTPS working

**Post-Deployment:**
- [ ] Smoke tests passed
- [ ] Authentication working
- [ ] Critical features tested
- [ ] Performance acceptable
- [ ] Monitoring configured
- [ ] Team notified

**Ongoing:**
- [ ] Monitor error logs daily
- [ ] Review analytics weekly
- [ ] Check database performance weekly
- [ ] Test backup/rollback monthly
- [ ] Security audit quarterly
