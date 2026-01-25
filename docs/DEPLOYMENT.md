# ISA Deployment Guide

**Intelligent Standards Architect - Production Deployment Documentation**

---

## Overview

This document provides comprehensive guidance for deploying ISA to production environments. ISA is built on a modern tRPC + Express + React stack with MySQL/TiDB database backend.

**Current Status:** Lane C Governance (Testing/Demonstration - Not Official GS1 Publication)

---

## Prerequisites

### System Requirements

**Server:**
- Node.js 22.x or higher
- 2GB+ RAM (4GB+ recommended for production)
- 20GB+ disk space
- Ubuntu 22.04 LTS or compatible Linux distribution

**Database:**
- MySQL 8.0+ or TiDB Cloud
- Connection string with SSL support
- Minimum 1GB storage (10GB+ recommended for production)

**External Services:**
- Manus OAuth configured (for authentication)
- OpenAI API key (for Ask ISA feature)
- S3-compatible storage (for file uploads, optional)

### Environment Variables

Required environment variables (managed by Manus platform):

```bash
# Database
DATABASE_URL=mysql://user:password@host:port/database?ssl={"rejectUnauthorized":true}

# Authentication
JWT_SECRET=<secure-random-string>
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://auth.manus.im
VITE_APP_ID=<manus-app-id>
OWNER_OPEN_ID=<owner-id>
OWNER_NAME=<owner-name>

# AI Services
OPENAI_API_KEY=<openai-api-key>
BUILT_IN_FORGE_API_URL=<manus-api-url>
BUILT_IN_FORGE_API_KEY=<manus-api-key>
VITE_FRONTEND_FORGE_API_KEY=<frontend-api-key>
VITE_FRONTEND_FORGE_API_URL=<frontend-api-url>

# Application
VITE_APP_TITLE="ISA - Intelligent Standards Architect"
VITE_APP_LOGO=<logo-url>
CRON_SECRET=<secure-random-string>

# Analytics (optional)
VITE_ANALYTICS_ENDPOINT=<analytics-endpoint>
VITE_ANALYTICS_WEBSITE_ID=<website-id>
```

---

## Deployment Architecture

### Application Structure

```
ISA Production Stack
├── Frontend (React 19 + Tailwind 4)
│   ├── Static assets served via CDN
│   └── SPA routing with wouter
├── Backend (Express 4 + tRPC 11)
│   ├── API endpoints (/api/trpc)
│   ├── OAuth callback (/api/oauth/callback)
│   ├── Health check (/health)
│   └── Cron endpoints (/cron/*)
└── Database (MySQL/TiDB)
    ├── 15 tables (regulations, standards, news, etc.)
    └── 11,197+ regulatory records
```

### Network Architecture

```
Internet
    │
    ├─→ Load Balancer (HTTPS)
    │       │
    │       ├─→ App Server 1 (Node.js)
    │       ├─→ App Server 2 (Node.js)
    │       └─→ App Server N (Node.js)
    │
    ├─→ CDN (Static Assets)
    │
    └─→ Database Cluster (MySQL/TiDB)
            │
            └─→ Backup Storage
```

---

## Deployment Steps

### 1. Database Setup

**Initial Schema Deployment:**

```bash
# Install dependencies
pnpm install

# Push schema to database
pnpm db:push

# Verify schema
pnpm db:studio
```

**Data Migration:**

ISA includes 11,197+ pre-populated records across 15 datasets:
- EU regulations (CSRD, ESRS, DPP, EUDR, ESPR, PPWR, EU Taxonomy)
- GS1 standards (GDSN, EPCIS, CBV, etc.)
- Regulatory mappings
- News hub content

These are managed through ingestion scripts in `server/ingestion/`.

### 2. Application Build

**Production Build:**

```bash
# Install production dependencies
pnpm install --prod

# Build frontend assets
pnpm build

# Verify build output
ls -lh client/dist/
```

**Build Output:**
- `client/dist/` - Static frontend assets (HTML, CSS, JS)
- `server/` - Backend TypeScript (transpiled at runtime via tsx)

### 3. Server Deployment

**Option A: Manus Platform (Recommended)**

ISA is designed for Manus platform deployment with built-in:
- Automatic SSL/TLS certificates
- Environment variable management
- Database provisioning
- OAuth integration
- Monitoring and health checks

Deploy via Manus UI:
1. Create checkpoint: `pnpm checkpoint "Production release v1.0"`
2. Click "Publish" in Manus dashboard
3. Configure custom domain (optional)
4. Monitor deployment status

**Option B: Manual Deployment**

For self-hosted environments:

```bash
# Start production server
NODE_ENV=production pnpm start

# Or with PM2 for process management
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

**PM2 Configuration (`ecosystem.config.js`):**

```javascript
module.exports = {
  apps: [{
    name: 'isa-web',
    script: 'server/_core/index.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx',
    instances: 'max',
    exec_mode: 'cluster',
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    max_memory_restart: '1G',
    autorestart: true,
    watch: false
  }]
};
```

### 4. Health Check Verification

**Endpoint:** `GET /health`

**Expected Response (Healthy):**

```json
{
  "status": "healthy",
  "timestamp": "2026-01-02T12:00:00.000Z",
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "ok",
      "responseTime": 5
    },
    "server": {
      "status": "ok",
      "uptime": 3600,
      "memory": {
        "used": 150000000,
        "total": 200000000,
        "percentage": 75
      }
    }
  }
}
```

**Status Codes:**
- `200` - Healthy or degraded (operational)
- `503` - Unhealthy (service unavailable)

**Monitoring Integration:**

Configure your monitoring tool (Datadog, New Relic, Prometheus, etc.) to:
- Poll `/health` every 30 seconds
- Alert on `503` status or response time > 5 seconds
- Track memory percentage (alert if > 85%)

### 5. Cron Job Configuration

ISA requires scheduled tasks for data ingestion:

**Daily News Ingestion:**
```bash
# Cron: Every day at 2:00 AM UTC
0 2 * * * curl -X GET "https://isa.yourdomain.com/cron/daily-news-ingestion" \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

**Weekly News Archival:**
```bash
# Cron: Every Sunday at 3:00 AM UTC
0 3 * * 0 curl -X GET "https://isa.yourdomain.com/cron/weekly-news-archival" \
  -H "Authorization: Bearer ${CRON_SECRET}"
```

**Cron Health Check:**
```bash
# Cron: Every 5 minutes
*/5 * * * * curl -X GET "https://isa.yourdomain.com/cron/health"
```

---

## Security Considerations

### Authentication

ISA uses Manus OAuth for authentication:
- Session cookies with JWT tokens
- Secure, httpOnly, sameSite=lax
- 7-day expiration
- Role-based access control (admin/user)

### Database Security

- SSL/TLS required for all connections
- Prepared statements (SQL injection protection)
- Row-level security for user data
- Regular backups (daily recommended)

### API Security

- CORS configured for production domain only
- Rate limiting on sensitive endpoints
- Input validation via Zod schemas
- XSS protection via React's built-in escaping

### Environment Variables

**Never commit:**
- `.env` files
- API keys
- Database credentials
- JWT secrets

Use Manus platform secrets management or:
- AWS Secrets Manager
- HashiCorp Vault
- Environment-specific `.env.production` (gitignored)

---

## Performance Optimization

### Frontend Optimization

**Already Implemented:**
- React 19 with automatic batching
- Code splitting via dynamic imports
- Lazy loading for heavy components
- Tailwind CSS purging (production builds)
- Asset compression (gzip/brotli)

**CDN Configuration:**

Serve static assets from CDN:
```nginx
location /assets/ {
    proxy_pass https://cdn.yourdomain.com;
    proxy_cache_valid 200 365d;
    add_header Cache-Control "public, immutable";
}
```

### Backend Optimization

**Database Connection Pooling:**

Already configured in `server/db.ts`:
- Lazy connection initialization
- Connection reuse across requests
- Automatic reconnection on failure

**Query Optimization:**

- Indexed columns: `id`, `celexId`, `standardId`, `userId`
- Pagination for large datasets
- Selective field loading (avoid SELECT *)

**Caching Strategy:**

Consider implementing:
- Redis for session storage
- Query result caching (5-minute TTL)
- Static page caching for public routes

---

## Monitoring and Observability

### Health Monitoring

**Key Metrics:**

1. **Application Health**
   - Endpoint: `/health`
   - Frequency: Every 30 seconds
   - Alert on: `status !== "healthy"`

2. **Database Performance**
   - Response time < 100ms (p95)
   - Connection pool utilization < 80%
   - Query errors < 0.1%

3. **Server Resources**
   - Memory usage < 85%
   - CPU usage < 70% (sustained)
   - Disk usage < 80%

### Error Tracking

**Recommended Tools:**
- Sentry (application errors)
- LogRocket (user session replay)
- Datadog (infrastructure monitoring)

**Error Categories:**

1. **Critical (Page immediately)**
   - Database connection failures
   - Authentication service down
   - Memory exhaustion

2. **High (Alert within 15 minutes)**
   - API error rate > 5%
   - Response time > 3 seconds (p95)
   - Failed cron jobs

3. **Medium (Daily digest)**
   - TypeScript compilation warnings
   - Test failures
   - Deprecated API usage

### Logging

**Log Levels:**

```typescript
// Production logging configuration
const logger = {
  error: (msg, meta) => console.error(JSON.stringify({ level: 'error', msg, meta, timestamp: new Date() })),
  warn: (msg, meta) => console.warn(JSON.stringify({ level: 'warn', msg, meta, timestamp: new Date() })),
  info: (msg, meta) => console.log(JSON.stringify({ level: 'info', msg, meta, timestamp: new Date() })),
  // debug: disabled in production
};
```

**Log Aggregation:**

Ship logs to centralized service:
- AWS CloudWatch
- Google Cloud Logging
- Elasticsearch + Kibana
- Datadog Logs

---

## Backup and Disaster Recovery

### Database Backups

**Automated Backups:**

```bash
# Daily backup script (run at 1:00 AM UTC)
#!/bin/bash
BACKUP_DIR="/backups/isa-db"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/isa_backup_$DATE.sql.gz"

# Create backup
mysqldump --host=$DB_HOST \
          --user=$DB_USER \
          --password=$DB_PASSWORD \
          --single-transaction \
          --routines \
          --triggers \
          isa_production | gzip > $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE s3://isa-backups/daily/

# Retain last 30 days locally
find $BACKUP_DIR -name "isa_backup_*.sql.gz" -mtime +30 -delete
```

**Backup Retention:**
- Daily: 30 days
- Weekly: 12 weeks
- Monthly: 12 months

### Disaster Recovery Plan

**Recovery Time Objective (RTO):** 4 hours  
**Recovery Point Objective (RPO):** 24 hours

**Recovery Steps:**

1. **Database Restoration**
   ```bash
   # Download latest backup
   aws s3 cp s3://isa-backups/daily/isa_backup_latest.sql.gz .
   
   # Restore database
   gunzip < isa_backup_latest.sql.gz | mysql -h $DB_HOST -u $DB_USER -p isa_production
   ```

2. **Application Deployment**
   ```bash
   # Pull latest code
   git pull origin main
   
   # Install dependencies
   pnpm install --prod
   
   # Build application
   pnpm build
   
   # Start server
   pm2 start ecosystem.config.js --env production
   ```

3. **Verification**
   - Health check returns 200
   - User authentication works
   - Core features functional (regulations list, Ask ISA)
   - Database queries successful

---

## Rollback Procedures

### Application Rollback

**Using Manus Platform:**

1. Open Manus dashboard
2. Navigate to "Checkpoints" tab
3. Select previous stable checkpoint
4. Click "Rollback"
5. Verify deployment

**Manual Rollback:**

```bash
# Revert to previous git commit
git revert HEAD
git push origin main

# Or checkout specific version
git checkout v1.0.0
pnpm install
pnpm build
pm2 restart isa-web
```

### Database Rollback

**Schema Changes:**

```bash
# Revert migration
pnpm db:rollback

# Or restore from backup
gunzip < backup_before_migration.sql.gz | mysql -h $DB_HOST -u $DB_USER -p isa_production
```

**Data Changes:**

Use point-in-time recovery if supported by your database:

```sql
-- TiDB Cloud example
RESTORE DATABASE isa_production 
FROM 'backup-location' 
TO TIMESTAMP '2026-01-02 10:00:00';
```

---

## Troubleshooting

### Common Issues

**1. Server Won't Start**

```bash
# Check logs
pm2 logs isa-web --lines 100

# Common causes:
# - Port 3000 already in use
# - Missing environment variables
# - Database connection failure

# Solutions:
# - Change PORT in .env
# - Verify all required env vars set
# - Test database connection: pnpm db:studio
```

**2. Database Connection Errors**

```bash
# Test connection
mysql -h $DB_HOST -u $DB_USER -p isa_production

# Check SSL requirement
# Ensure DATABASE_URL includes: ?ssl={"rejectUnauthorized":true}

# Verify firewall rules allow connection from app server
```

**3. Authentication Failures**

```bash
# Verify OAuth configuration
curl https://api.manus.im/health

# Check JWT_SECRET is set
echo $JWT_SECRET

# Clear session cookies and retry
```

**4. High Memory Usage**

```bash
# Check current usage
pm2 monit

# Restart with memory limit
pm2 restart isa-web --max-memory-restart 1G

# Investigate memory leaks
node --inspect server/_core/index.ts
```

**5. Slow Database Queries**

```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 2;

-- Analyze slow queries
SELECT * FROM mysql.slow_log ORDER BY query_time DESC LIMIT 10;

-- Add missing indexes
EXPLAIN SELECT * FROM regulations WHERE celexId = '32013L0034';
```

---

## Maintenance

### Regular Maintenance Tasks

**Daily:**
- Monitor health check endpoint
- Review error logs
- Check disk space usage

**Weekly:**
- Review performance metrics
- Analyze slow queries
- Update dependencies (security patches)

**Monthly:**
- Full backup verification
- Load testing
- Security audit
- Dependency updates (minor versions)

**Quarterly:**
- Disaster recovery drill
- Capacity planning review
- Major dependency updates
- Performance optimization review

### Dependency Updates

```bash
# Check for updates
pnpm outdated

# Update to latest compatible versions
pnpm update

# Test thoroughly
pnpm test
pnpm build

# Deploy to staging first
# Then production after validation
```

---

## Lane C Governance Compliance

**Critical Reminders:**

1. **Currency Disclaimers**
   - All regulatory content must include timestamp
   - "Last updated: [ISO 8601 date]" on all pages
   - No claims of real-time accuracy

2. **Completeness Disclaimers**
   - "This is a demonstration dataset"
   - "Not an official GS1 publication"
   - "For testing purposes only"

3. **AI-Generated Content**
   - All Ask ISA responses marked as AI-generated
   - "Verify with official sources" disclaimer
   - No legal or compliance advice claims

4. **Dataset Provenance**
   - Source attribution for all regulations
   - EUR-Lex links for EU regulations
   - GS1 standards documentation links

**Compliance Verification:**

Before production deployment, verify:
- [ ] Currency disclaimers present on all regulatory pages
- [ ] Completeness disclaimers in footer
- [ ] AI-generated content warnings in Ask ISA
- [ ] Dataset provenance documented
- [ ] "Lane C" status clearly indicated

---

## Support and Escalation

### Internal Support

**Level 1 (Operations Team):**
- Health check monitoring
- Server restarts
- Log review
- Basic troubleshooting

**Level 2 (Development Team):**
- Application errors
- Database query optimization
- Feature bugs
- Performance issues

**Level 3 (Architecture Team):**
- Infrastructure changes
- Security incidents
- Major outages
- Disaster recovery

### External Support

**Manus Platform:**
- Support: https://help.manus.im
- Status: https://status.manus.im
- Documentation: https://docs.manus.im

**Database Provider (TiDB Cloud):**
- Support portal
- 24/7 emergency hotline
- Slack channel (if available)

---

## Appendix

### A. Port Configuration

- `3000` - Application server (HTTP)
- `3306` - MySQL/TiDB (default)
- `443` - HTTPS (load balancer)
- `80` - HTTP (redirect to HTTPS)

### B. File Structure

```
/home/ubuntu/isa_web/
├── client/               # Frontend React application
│   ├── dist/            # Production build output
│   ├── public/          # Static assets
│   └── src/             # Source code
├── server/              # Backend Express + tRPC
│   ├── _core/           # Framework code
│   ├── ingestion/       # Data ingestion scripts
│   ├── routers.ts       # API endpoints
│   └── db.ts            # Database client
├── drizzle/             # Database schema
│   └── schema.ts        # Table definitions
├── docs/                # Documentation
│   ├── DEPLOYMENT.md    # This file
│   └── *.md             # Other docs
└── package.json         # Dependencies
```

### C. Test Coverage

**Current Status:** 90.1% pass rate (517/574 tests)

**Test Categories:**
- Unit tests: `server/*.test.ts`
- Integration tests: `server/routers/*.test.ts`
- E2E tests: (not yet implemented)

**Running Tests:**

```bash
# All tests
pnpm test

# Specific test file
pnpm test server/health.test.ts

# Watch mode
pnpm test --watch

# Coverage report
pnpm test --coverage
```

### D. Performance Benchmarks

**Target Metrics (p95):**

- Homepage load: < 2 seconds
- API response time: < 500ms
- Database query time: < 100ms
- Time to interactive: < 3 seconds

**Load Testing:**

```bash
# Install k6
brew install k6  # or apt-get install k6

# Run load test
k6 run load-test.js

# Example: 100 VUs for 5 minutes
k6 run --vus 100 --duration 5m load-test.js
```

---

## Changelog

- **2026-01-02:** Initial deployment guide created
- **Phase 4:** Added health check endpoint and monitoring
- **Lane C:** Governance compliance requirements documented

---

## Contact

**Project Owner:** GS1 Netherlands  
**Technical Lead:** [Contact via Manus platform]  
**Emergency Contact:** [24/7 support channel]

---

*This document is maintained as part of the ISA project documentation. Last updated: 2026-01-02*
