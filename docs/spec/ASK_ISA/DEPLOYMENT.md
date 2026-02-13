# ASK_ISA Deployment Guide

**Capability:** ASK_ISA  
**Version:** 1.0  
**Last Updated:** 2026-02-12  
**Status:** Production

---

## Overview

This guide provides step-by-step deployment procedures for the ASK_ISA capability, including prerequisites, deployment steps, verification procedures, and rollback strategies.

---

## Prerequisites

### Infrastructure

- **Node.js:** 22.13.0
- **pnpm:** 10.4.1
- **MySQL/TiDB:** 8.0+ (with vector support)
- **Manus Hosting:** Production environment access

### Access Requirements

- **GitHub:** Write access to repository
- **Manus Console:** Admin access
- **Database:** Admin credentials
- **OpenAI API:** Valid API key

### Dependencies

All dependencies must be deployed first:
- **CATALOG:** Regulations and standards data
- **KNOWLEDGE_BASE:** Embedding infrastructure

---

## Deployment Order

ASK_ISA depends on CATALOG and KNOWLEDGE_BASE. Deploy in this order:

1. CATALOG (regulations, standards)
2. KNOWLEDGE_BASE (embeddings, vector search)
3. **ASK_ISA** (Q&A, guardrails, RAG)

---

## Pre-Deployment Checklist

- [ ] All tests passing (90%+ pass rate)
- [ ] TypeScript compiles with 0 errors
- [ ] Database migrations ready
- [ ] Environment variables configured
- [ ] Knowledge base populated (155+ chunks)
- [ ] BM25 index built
- [ ] Production queries validated
- [ ] Governance review complete

---

## Deployment Steps

### Step 1: Database Migration

**Duration:** 5 minutes

```bash
# Navigate to project root
cd /path/to/isa_web_clean

# Run migrations
pnpm drizzle-kit push:mysql

# Verify tables created
pnpm tsx scripts/verify-db-schema.ts
```

**Expected Tables:**
- `knowledge_embeddings`
- `qa_conversations`
- `qa_messages`
- `ask_isa_feedback`

**Verification:**

```sql
-- Check tables exist
SHOW TABLES LIKE 'knowledge_%';
SHOW TABLES LIKE 'qa_%';
SHOW TABLES LIKE 'ask_isa_%';

-- Check schema
DESCRIBE knowledge_embeddings;
DESCRIBE qa_conversations;
DESCRIBE qa_messages;
DESCRIBE ask_isa_feedback;
```

### Step 2: Environment Configuration

**Duration:** 2 minutes

```bash
# Set environment variables
export DATABASE_URL="mysql://user:pass@host:port/db"
export OPENAI_API_KEY="sk-..."
export MANUS_OAUTH_CLIENT_ID="..."
export MANUS_OAUTH_CLIENT_SECRET="..."

# Optional configuration
export ASK_ISA_CACHE_TTL=86400  # 24 hours
export ASK_ISA_RATE_LIMIT=100   # requests/hour
```

**Verification:**

```bash
# Verify environment variables
pnpm tsx scripts/verify-env.ts
```

### Step 3: Knowledge Base Population

**Duration:** 30-60 minutes (depending on data volume)

```bash
# Generate embeddings for all sources
pnpm tsx scripts/generate-knowledge-base.ts

# Or via API (requires admin auth)
curl -X POST https://your-app.com/trpc/askISA.generateEmbeddings \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "sourceType": "regulation",
    "sourceIds": []
  }'
```

**Progress Monitoring:**

```bash
# Check embedding generation progress
pnpm tsx scripts/check-kb-status.ts

# Expected output:
# Regulations: 38/38 (100%)
# Standards: 60/60 (100%)
# ESRS Datapoints: 1184/1184 (100%)
# Total chunks: 155+
```

**Verification:**

```sql
-- Check knowledge base stats
SELECT 
  source_type,
  COUNT(*) as chunk_count,
  MAX(created_at) as last_generated
FROM knowledge_embeddings
GROUP BY source_type;

-- Expected results:
-- regulation: 38+
-- standard: 60+
-- esrs_datapoint: 50+
-- Total: 155+
```

### Step 4: BM25 Index Initialization

**Duration:** 5 minutes

```bash
# Build BM25 index
pnpm tsx scripts/build-bm25-index.ts

# Verify index ready
pnpm tsx scripts/verify-bm25.ts
```

**Verification:**

```typescript
// Test BM25 search
import { isBM25Ready, bm25Search } from './server/bm25-search';

console.log('BM25 Ready:', isBM25Ready());
const results = bm25Search('CSRD sustainability', 5);
console.log('Results:', results.length);
```

### Step 5: Code Deployment

**Duration:** 10 minutes

```bash
# Pull latest code
git pull origin main

# Install dependencies
pnpm install

# Build application
pnpm build

# Verify build
ls -la dist/
```

**Verification:**

```bash
# Check build artifacts
test -f dist/server/routers/ask-isa.js && echo "✓ Router built"
test -f dist/client/index.html && echo "✓ Client built"
```

### Step 6: Server Restart

**Duration:** 2 minutes

```bash
# Restart server (Manus hosting)
manus deploy --app isa-web --env production

# Or via PM2
pm2 restart isa-web

# Or via systemd
sudo systemctl restart isa-web
```

**Verification:**

```bash
# Check server health
curl https://your-app.com/health

# Expected response:
# {"status":"ok","timestamp":"2026-02-12T10:00:00Z"}
```

### Step 7: Cache Initialization

**Duration:** 1 minute

```bash
# Warm up cache with production queries
pnpm tsx scripts/warm-cache.ts

# Or manually via API
for query in "${PRODUCTION_QUERIES[@]}"; do
  curl -X POST https://your-app.com/trpc/askISA.ask \
    -d "{\"question\":\"$query\"}"
done
```

**Verification:**

```bash
# Check cache stats
curl https://your-app.com/trpc/askISA.getCacheStats \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Expected: size > 0, hitRate > 0
```

---

## Post-Deployment Verification

### Smoke Test

**Duration:** 5 minutes

```bash
# Run smoke test
pnpm tsx scripts/probe/ask_isa_smoke.py

# Expected output: SMOKE_OK
```

### Production Query Validation

**Duration:** 10 minutes

```bash
# Test all 30 production queries
pnpm tsx scripts/validate-production-queries.ts

# Expected: 30/30 passing
```

### Manual Testing

**Test 1: Gap Query**

```bash
curl -X POST https://your-app.com/trpc/askISA.ask \
  -d '{"question":"Which gaps exist for CSRD in DIY?"}'

# Verify:
# - answer returned
# - sources.length >= 3
# - confidence.level = "high"
# - claimVerification.verificationRate > 0.5
```

**Test 2: Forbidden Query**

```bash
curl -X POST https://your-app.com/trpc/askISA.ask \
  -d '{"question":"What will happen in 2027?"}'

# Verify:
# - answer contains "ISA cannot answer"
# - queryType = "forbidden"
# - sources.length = 0
```

**Test 3: Cache Hit**

```bash
# First call
curl -X POST https://your-app.com/trpc/askISA.ask \
  -d '{"question":"Which gaps exist for CSRD in DIY?"}'

# Second call (should be cached)
curl -X POST https://your-app.com/trpc/askISA.ask \
  -d '{"question":"Which gaps exist for CSRD in DIY?"}'

# Verify: fromCache = true
```

### Performance Verification

```bash
# Check response times
pnpm tsx scripts/benchmark-ask-isa.ts

# Expected:
# P50: < 2s
# P95: < 5s
# P99: < 10s
```

### Monitoring Setup

```bash
# Verify metrics collection
curl https://your-app.com/metrics

# Check logs
tail -f /var/log/isa-web/server.log | grep "\[AskISA\]"
```

---

## Rollback Procedures

### Scenario 1: Database Migration Failure

**Symptoms:** Tables missing, schema errors

**Rollback:**

```bash
# Revert migration
pnpm drizzle-kit drop

# Restore from backup
mysql -u user -p db < backup.sql

# Verify restoration
pnpm tsx scripts/verify-db-schema.ts
```

### Scenario 2: Knowledge Base Corruption

**Symptoms:** No search results, embedding errors

**Rollback:**

```bash
# Clear knowledge base
DELETE FROM knowledge_embeddings;

# Regenerate from source
pnpm tsx scripts/generate-knowledge-base.ts

# Verify regeneration
SELECT COUNT(*) FROM knowledge_embeddings;
```

### Scenario 3: Code Deployment Failure

**Symptoms:** Server crashes, 500 errors

**Rollback:**

```bash
# Revert to previous version
git revert HEAD
git push origin main

# Rebuild
pnpm install
pnpm build

# Restart
manus deploy --app isa-web --env production
```

### Scenario 4: Performance Degradation

**Symptoms:** Slow responses, timeouts

**Rollback:**

```bash
# Clear cache
curl -X POST https://your-app.com/trpc/askISA.invalidateCache \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Restart server
pm2 restart isa-web

# Monitor performance
pnpm tsx scripts/benchmark-ask-isa.ts
```

---

## Monitoring & Alerts

### Key Metrics

- **Query Volume:** Requests per hour
- **Cache Hit Rate:** >60% target
- **Response Time:** P95 <5s
- **Error Rate:** <1%
- **Verification Rate:** >70%
- **Abstention Rate:** <20%

### Alert Thresholds

```yaml
alerts:
  - name: High Error Rate
    condition: error_rate > 5%
    duration: 5m
    severity: critical
    
  - name: Low Cache Hit Rate
    condition: cache_hit_rate < 40%
    duration: 1h
    severity: warning
    
  - name: High Latency
    condition: p95_latency > 5s
    duration: 5m
    severity: warning
    
  - name: Low Verification Rate
    condition: verification_rate < 50%
    duration: 1h
    severity: warning
```

### Log Monitoring

```bash
# Monitor errors
tail -f /var/log/isa-web/server.log | grep "ERROR.*AskISA"

# Monitor warnings
tail -f /var/log/isa-web/server.log | grep "WARN.*AskISA"

# Monitor abstentions
tail -f /var/log/isa-web/server.log | grep "abstention"
```

---

## Maintenance Windows

### Recommended Schedule

- **Knowledge Base Updates:** Weekly, Sunday 02:00 UTC
- **Cache Cleanup:** Daily, 03:00 UTC
- **Database Maintenance:** Monthly, first Sunday 01:00 UTC

### Maintenance Procedures

**Weekly KB Update:**

```bash
# Regenerate embeddings for updated content
pnpm tsx scripts/update-knowledge-base.ts

# Invalidate cache
curl -X POST https://your-app.com/trpc/askISA.invalidateCache

# Rebuild BM25 index
pnpm tsx scripts/build-bm25-index.ts
```

**Daily Cache Cleanup:**

```bash
# Remove expired entries
curl -X POST https://your-app.com/trpc/askISA.cleanupCache \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed troubleshooting procedures.

**Quick Fixes:**

- **No results:** Check knowledge base populated
- **Slow responses:** Check cache hit rate
- **High error rate:** Check LLM API status
- **Low verification:** Check citation validation

---

## Security Considerations

### Pre-Deployment Security Checklist

- [ ] API keys rotated
- [ ] Database credentials secured
- [ ] Rate limiting configured
- [ ] CORS origins whitelisted
- [ ] OAuth configured
- [ ] Secrets not in code

### Post-Deployment Security Verification

```bash
# Verify rate limiting
for i in {1..150}; do
  curl https://your-app.com/trpc/askISA.ask \
    -d '{"question":"test"}'
done
# Expected: 429 after 100 requests

# Verify authentication
curl https://your-app.com/trpc/askISA.submitFeedback \
  -d '{"questionId":"test"}'
# Expected: 401 Unauthorized
```

---

## Deployment Checklist

### Pre-Deployment

- [ ] All tests passing
- [ ] TypeScript compiles
- [ ] Database migrations ready
- [ ] Environment variables set
- [ ] Governance review complete
- [ ] Backup created

### Deployment

- [ ] Database migrated
- [ ] Knowledge base populated
- [ ] BM25 index built
- [ ] Code deployed
- [ ] Server restarted
- [ ] Cache initialized

### Post-Deployment

- [ ] Smoke test passed
- [ ] Production queries validated
- [ ] Manual testing complete
- [ ] Performance verified
- [ ] Monitoring configured
- [ ] Alerts set up

### Rollback Plan

- [ ] Rollback procedures documented
- [ ] Backup verified
- [ ] Rollback tested in staging

---

## Changelog

### v1.0 (2026-02-12)
- Initial deployment guide
- 7-step deployment procedure
- Verification procedures
- Rollback strategies
- Monitoring setup
- Maintenance windows

---

## See Also

- [CAPABILITY_SPEC.md](./CAPABILITY_SPEC.md) - Technical specification
- [API_REFERENCE.md](./API_REFERENCE.md) - API documentation
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Implementation guide
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing strategies
- [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) - Common issues
- [../../DEPLOYMENT_GUIDE.md](../../DEPLOYMENT_GUIDE.md) - System-wide deployment
