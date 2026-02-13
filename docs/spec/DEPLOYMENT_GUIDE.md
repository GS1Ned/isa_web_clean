# ISA Deployment Guide
## End-to-End Deployment for All Capabilities

**Version:** 1.0.0  
**Created:** 2026-02-12  
**Status:** AUTHORITATIVE  
**Purpose:** Complete deployment procedures for ISA platform

---

## Prerequisites

### Required Software

- **Node.js**: 22.13.0 (exact version required)
- **pnpm**: 10.4.1+
- **Git**: 2.0+
- **MySQL Client**: 8.0+ (for database verification)

### Required Access

- **GitHub**: Write access to `GS1Ned/isa_web_clean`
- **Manus Platform**: Deployment credentials
- **TiDB Cloud**: Database connection string
- **OpenAI API**: Manus Forge API key

### Environment Variables

Create `.env` file with:

```bash
# Database
DATABASE_URL="mysql://user:pass@host:port/database?ssl=true"

# Authentication
MANUS_OAUTH_CLIENT_ID="your-client-id"
MANUS_OAUTH_CLIENT_SECRET="your-client-secret"

# AI/ML
OPENAI_API_KEY="your-manus-forge-key"

# Cron Jobs
CRON_SECRET="your-cron-secret"

# Optional
NODE_ENV="production"
PORT="3000"
```

---

## Deployment Order

### Phase 1: Database Setup

**Order:** Must be first

**Steps:**

1. **Verify Database Connection**
```bash
# Test connection
mysql -h <host> -u <user> -p<password> -e "SELECT 1"
```

2. **Run Migrations**
```bash
# Generate and apply migrations
pnpm db:push
```

3. **Verify Schema**
```bash
# Check tables exist
mysql -h <host> -u <user> -p<password> -D <database> -e "SHOW TABLES"

# Expected tables (partial list):
# - regulations
# - gs1_standards
# - esrs_datapoints
# - hub_news
# - knowledge_embeddings
# - users
```

4. **Seed Initial Data** (if fresh install)
```bash
# Load regulations
pnpm ingest:regulations

# Load GS1 standards
pnpm ingest:standards

# Load ESRS datapoints
pnpm ingest:esrs
```

**Verification:**
```bash
# Check record counts
mysql -h <host> -u <user> -p<password> -D <database> -e "
  SELECT 'regulations' as table_name, COUNT(*) as count FROM regulations
  UNION ALL
  SELECT 'gs1_standards', COUNT(*) FROM gs1_standards
  UNION ALL
  SELECT 'esrs_datapoints', COUNT(*) FROM esrs_datapoints;
"

# Expected:
# regulations: 38
# gs1_standards: 60+
# esrs_datapoints: 1184
```

---

### Phase 2: CATALOG Deployment

**Order:** After database, before all other capabilities

**Dependencies:** Database only

**Steps:**

1. **Build Application**
```bash
pnpm build
```

2. **Deploy to Manus**
```bash
# Push to GitHub (triggers CI/CD)
git push origin main
```

3. **Verify Deployment**
```bash
# Test catalog endpoints
curl https://your-app.manus.app/api/trpc/catalog.getRegulations

# Expected: JSON array of 38 regulations
```

**Rollback:**
```bash
# Revert to previous commit
git revert HEAD
git push origin main
```

---

### Phase 3: KNOWLEDGE_BASE Deployment

**Order:** After CATALOG

**Dependencies:** CATALOG (for source data)

**Steps:**

1. **Generate Knowledge Base**
```bash
# Via admin UI or API
curl -X POST https://your-app.manus.app/api/trpc/knowledgeBase.generate \
  -H "Authorization: Bearer <admin-token>"
```

2. **Verify Generation**
```bash
# Check embedding count
mysql -h <host> -u <user> -p<password> -D <database> -e "
  SELECT COUNT(*) as chunk_count FROM knowledge_embeddings;
"

# Expected: 155+ chunks
```

3. **Test Search**
```bash
# Test semantic search
curl -X POST https://your-app.manus.app/api/trpc/knowledgeBase.search \
  -H "Authorization: Bearer <token>" \
  -d '{"query": "CSRD compliance", "topK": 5}'

# Expected: 5 relevant chunks
```

**Rollback:**
```bash
# Delete embeddings
mysql -h <host> -u <user> -p<password> -D <database> -e "
  TRUNCATE TABLE knowledge_embeddings;
"

# Regenerate from previous version
```

---

### Phase 4: ASK_ISA Deployment

**Order:** After KNOWLEDGE_BASE

**Dependencies:** KNOWLEDGE_BASE (for retrieval), CATALOG (for metadata)

**Steps:**

1. **Deploy Application** (already done in Phase 2)

2. **Run Smoke Test**
```bash
# Test Q&A endpoint
python scripts/probe/ask_isa_smoke.py

# Expected: 30/30 queries pass
```

3. **Verify Citations**
```bash
# Test query with citation check
curl -X POST https://your-app.manus.app/api/trpc/askISA.ask \
  -H "Authorization: Bearer <token>" \
  -d '{"question": "What is CSRD?"}'

# Expected: Answer with sources array
```

**Rollback:**
- No data to rollback (stateless except conversations)
- Revert code deployment if needed

---

### Phase 5: NEWS_HUB Deployment

**Order:** After CATALOG (parallel with ASK_ISA)

**Dependencies:** CATALOG (for regulation tagging)

**Steps:**

1. **Deploy Application** (already done in Phase 2)

2. **Configure Cron Job**
```bash
# Verify cron secret
echo $CRON_SECRET

# Test cron endpoint
curl -X POST https://your-app.manus.app/api/cron/news-pipeline \
  -H "X-Cron-Secret: $CRON_SECRET"

# Expected: Pipeline execution starts
```

3. **Run Initial Pipeline**
```bash
# Trigger manual execution
curl -X POST https://your-app.manus.app/api/trpc/newsHub.runPipeline \
  -H "Authorization: Bearer <admin-token>"
```

4. **Verify News Articles**
```bash
# Check article count
mysql -h <host> -u <user> -p<password> -D <database> -e "
  SELECT COUNT(*) as article_count FROM hub_news;
"

# Expected: 50+ articles
```

5. **Check Scraper Health**
```bash
# View health dashboard
curl https://your-app.manus.app/api/trpc/newsHub.getScraperHealth \
  -H "Authorization: Bearer <admin-token>"

# Expected: 7/7 sources healthy
```

**Rollback:**
```bash
# Disable cron job
# Delete recent articles if needed
mysql -h <host> -u <user> -p<password> -D <database> -e "
  DELETE FROM hub_news WHERE createdAt > '<deployment-time>';
"
```

---

### Phase 6: ESRS_MAPPING Deployment

**Order:** After CATALOG (parallel with ASK_ISA, NEWS_HUB)

**Dependencies:** CATALOG (for regulations, standards, datapoints)

**Steps:**

1. **Deploy Application** (already done in Phase 2)

2. **Verify Mappings**
```bash
# Check mapping count
mysql -h <host> -u <user> -p<password> -D <database> -e "
  SELECT COUNT(*) as mapping_count FROM regulation_esrs_mappings;
"

# Expected: 450+ mappings
```

3. **Test Mapping API**
```bash
# Get mappings for regulation
curl https://your-app.manus.app/api/trpc/esrsMapping.getMappings?regulationId=1 \
  -H "Authorization: Bearer <token>"

# Expected: Array of mappings with scores
```

**Rollback:**
- No deployment-specific rollback needed
- Mappings are static data

---

### Phase 7: ADVISORY Deployment

**Order:** Last (after all other capabilities)

**Dependencies:** ALL capabilities

**Steps:**

1. **Deploy Application** (already done in Phase 2)

2. **Validate Advisory Schema**
```bash
# Run schema validation
pnpm validate:advisory

# Expected: Schema validation passes
```

3. **Generate Test Advisory** (optional)
```bash
# Generate advisory report
curl -X POST https://your-app.manus.app/api/trpc/advisory.generate \
  -H "Authorization: Bearer <admin-token>" \
  -d '{"version": "test"}'

# Expected: Advisory report generated
```

4. **Verify Advisory Data**
```bash
# Check advisory count
mysql -h <host> -u <user> -p<password> -D <database> -e "
  SELECT COUNT(*) as advisory_count FROM advisory_reports;
"

# Expected: 2+ reports (v1.0, v1.1)
```

**Rollback:**
```bash
# Delete test advisory
mysql -h <host> -u <user> -p<password> -D <database> -e "
  DELETE FROM advisory_reports WHERE version = 'test';
"
```

---

## Post-Deployment Verification

### Smoke Tests

**Run All Smoke Tests:**
```bash
# ASK_ISA
python scripts/probe/ask_isa_smoke.py

# NEWS_HUB
bash scripts/probe/news_hub_health.sh

# KNOWLEDGE_BASE
bash scripts/probe/knowledge_base_health.sh

# Expected: All tests pass
```

### Health Check

**System Health:**
```bash
curl https://your-app.manus.app/health

# Expected:
# {
#   "status": "healthy",
#   "capabilities": {
#     "catalog": "healthy",
#     "knowledgeBase": "healthy",
#     "askISA": "healthy",
#     "newsHub": "healthy",
#     "esrsMapping": "healthy",
#     "advisory": "healthy"
#   }
# }
```

### Integration Tests

**Run Integration Test Suite:**
```bash
pnpm test-integration

# Expected: All integration tests pass
```

---

## Rollback Procedures

### Full Rollback

**Steps:**

1. **Revert Code Deployment**
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Wait for CI/CD to deploy
```

2. **Rollback Database** (if schema changed)
```bash
# Revert migration
pnpm db:rollback

# Or restore from backup
mysql -h <host> -u <user> -p<password> -D <database> < backup.sql
```

3. **Verify Rollback**
```bash
# Run smoke tests
pnpm test-smoke

# Check health
curl https://your-app.manus.app/health
```

### Partial Rollback

**Capability-Specific:**

```bash
# Disable specific capability via feature flag
# (requires feature flag implementation)

# Or rollback specific data
mysql -h <host> -u <user> -p<password> -D <database> -e "
  DELETE FROM <capability_table> WHERE createdAt > '<deployment-time>';
"
```

---

## Monitoring

### Key Metrics

**Application:**
- Response time (p50, p90, p99)
- Error rate (%)
- Request rate (req/s)

**Database:**
- Connection pool usage
- Query latency
- Slow queries

**External APIs:**
- OpenAI API latency
- OpenAI API error rate
- Scraper success rate

### Dashboards

**Manus Platform:**
- Application logs
- Performance metrics
- Error tracking

**Custom Dashboards:**
- Scraper health: `/admin/pipeline-observability`
- Knowledge base stats: `/admin/knowledge-base`
- Advisory status: `/admin/advisory`

### Alerts

**Critical Alerts:**
- Database connection failure
- OpenAI API failure
- Scraper health <80%
- Error rate >5%

**Warning Alerts:**
- Response time >5s (p90)
- Scraper health <95%
- Error rate >1%

---

## Troubleshooting

### Common Issues

**Issue 1: Database Connection Failure**

**Symptoms:**
- 500 errors on all endpoints
- "Database not available" in logs

**Diagnosis:**
```bash
# Test connection
mysql -h <host> -u <user> -p<password> -e "SELECT 1"
```

**Solution:**
1. Check DATABASE_URL environment variable
2. Verify TiDB Cloud status
3. Check connection pool settings
4. Restart application

---

**Issue 2: Knowledge Base Empty**

**Symptoms:**
- ASK_ISA returns "no relevant information"
- 0 chunks in database

**Diagnosis:**
```bash
# Check chunk count
mysql -h <host> -u <user> -p<password> -D <database> -e "
  SELECT COUNT(*) FROM knowledge_embeddings;
"
```

**Solution:**
1. Regenerate knowledge base
2. Check OpenAI API key
3. Verify source data exists

---

**Issue 3: News Pipeline Failure**

**Symptoms:**
- No new articles
- Scraper health <100%

**Diagnosis:**
```bash
# Check scraper health
curl https://your-app.manus.app/api/trpc/newsHub.getScraperHealth \
  -H "Authorization: Bearer <admin-token>"
```

**Solution:**
1. Check Playwright installation
2. Verify source URLs accessible
3. Check OpenAI API quota
4. Review scraper logs

---

## Maintenance

### Regular Tasks

**Daily:**
- Monitor scraper health
- Check error logs
- Verify cron jobs running

**Weekly:**
- Review performance metrics
- Check database size
- Update knowledge base (if needed)

**Monthly:**
- Generate advisory report
- Review and archive old news
- Database optimization

### Backup Strategy

**Database Backups:**
- Automated daily backups (TiDB Cloud)
- Retention: 7 days
- Manual backup before major changes

**Code Backups:**
- Git repository (GitHub)
- Tagged releases for each deployment

---

## Emergency Procedures

### System Down

**Steps:**

1. **Check Manus Platform Status**
2. **Check Database Status**
3. **Check External APIs**
4. **Review Recent Deployments**
5. **Rollback if Needed**
6. **Escalate to Manus Support**

### Data Corruption

**Steps:**

1. **Stop Application**
2. **Assess Damage**
3. **Restore from Backup**
4. **Verify Data Integrity**
5. **Restart Application**
6. **Run Smoke Tests**

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing (`pnpm test`)
- [ ] TypeScript compiles (`pnpm check`)
- [ ] Code formatted (`pnpm format`)
- [ ] Environment variables configured
- [ ] Database backup created
- [ ] Deployment plan reviewed

### Deployment

- [ ] Database migrations applied
- [ ] Code deployed to Manus
- [ ] Smoke tests passing
- [ ] Health check passing
- [ ] Integration tests passing
- [ ] Monitoring configured

### Post-Deployment

- [ ] All capabilities healthy
- [ ] No error spikes
- [ ] Performance within SLA
- [ ] Cron jobs running
- [ ] Documentation updated
- [ ] Team notified

---

**Document Status:** AUTHORITATIVE  
**Last Updated:** 2026-02-12  
**Next Review:** After first production deployment
