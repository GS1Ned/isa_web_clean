# ASK_ISA Troubleshooting Guide

**Capability:** ASK_ISA  
**Version:** 1.0  
**Last Updated:** 2026-02-12  
**Status:** Production

---

## Overview

This guide provides troubleshooting procedures for common ASK_ISA issues, including error codes, diagnostic steps, and solutions.

---

## Quick Diagnostics

### Health Check

```bash
# Check overall health
curl https://your-app.com/health

# Check knowledge base stats
curl https://your-app.com/trpc/askISA.getEmbeddingStats

# Check cache stats (admin only)
curl https://your-app.com/trpc/askISA.getCacheStats \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Common Issues Checklist

- [ ] Server running?
- [ ] Database connected?
- [ ] Knowledge base populated?
- [ ] BM25 index built?
- [ ] OpenAI API accessible?
- [ ] Cache operational?

---

## Error Codes

### Client Errors (4xx)

#### 400 Bad Request

**Symptoms:** Invalid input error

**Causes:**
- Question too short (<3 characters)
- Question too long (>1000 characters)
- Invalid sector value
- Malformed JSON

**Solution:**

```typescript
// Validate input before sending
const question = userInput.trim();
if (question.length < 3) {
  throw new Error("Question must be at least 3 characters");
}
if (question.length > 1000) {
  throw new Error("Question must be less than 1000 characters");
}
```

#### 401 Unauthorized

**Symptoms:** Missing or invalid authentication

**Causes:**
- No auth token provided
- Expired token
- Invalid token format

**Solution:**

```bash
# Refresh OAuth token
curl -X POST https://auth.manus.com/oauth/token \
  -d "grant_type=refresh_token" \
  -d "refresh_token=$REFRESH_TOKEN"

# Use new token
curl https://your-app.com/trpc/askISA.submitFeedback \
  -H "Authorization: Bearer $NEW_TOKEN"
```

#### 403 Forbidden

**Symptoms:** Insufficient permissions

**Causes:**
- Non-admin accessing admin endpoint
- User not authorized for resource

**Solution:**

```typescript
// Check user role before calling admin endpoints
if (user.role !== 'admin') {
  throw new Error('Admin access required');
}
```

#### 404 Not Found

**Symptoms:** Conversation not found

**Causes:**
- Invalid conversation ID
- Conversation deleted
- User doesn't own conversation

**Solution:**

```typescript
// Verify conversation exists before accessing
const conversation = await trpc.askISA.getConversation.query({
  conversationId: id
});
if (!conversation) {
  throw new Error('Conversation not found');
}
```

#### 429 Too Many Requests

**Symptoms:** Rate limit exceeded

**Causes:**
- >100 requests/hour (authenticated)
- >20 requests/hour (anonymous)

**Solution:**

```typescript
// Implement client-side rate limiting
const rateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 3600000, // 1 hour
});

await rateLimiter.checkLimit(userId);
```

### Server Errors (5xx)

#### 500 Internal Server Error

**Symptoms:** Generic server error

**Causes:**
- LLM API timeout
- Database connection failure
- Unexpected exception

**Diagnostic Steps:**

```bash
# Check server logs
tail -f /var/log/isa-web/server.log | grep "ERROR.*AskISA"

# Check database connection
pnpm tsx scripts/check-db-connection.ts

# Check OpenAI API status
curl https://status.openai.com/api/v2/status.json
```

**Solution:**

```bash
# Restart server
pm2 restart isa-web

# If database issue, check connection pool
# If LLM issue, verify API key and quota
```

#### 503 Service Unavailable

**Symptoms:** Service temporarily unavailable

**Causes:**
- Knowledge base not ready
- BM25 index not built
- External API down

**Diagnostic Steps:**

```bash
# Check knowledge base
SELECT COUNT(*) FROM knowledge_embeddings;
# Expected: 155+

# Check BM25 status
pnpm tsx scripts/verify-bm25.ts
# Expected: BM25 Ready: true
```

**Solution:**

```bash
# Regenerate knowledge base
pnpm tsx scripts/generate-knowledge-base.ts

# Rebuild BM25 index
pnpm tsx scripts/build-bm25-index.ts
```

---

## Common Issues

### Issue 1: No Search Results

**Symptoms:**
- Empty sources array
- "No relevant information found" message

**Causes:**
- Knowledge base empty
- Query too specific
- Embedding generation failed

**Diagnostic Steps:**

```sql
-- Check knowledge base
SELECT 
  source_type,
  COUNT(*) as count
FROM knowledge_embeddings
GROUP BY source_type;

-- Expected results:
-- regulation: 38+
-- standard: 60+
-- esrs_datapoint: 50+
```

**Solution:**

```bash
# If empty, regenerate knowledge base
pnpm tsx scripts/generate-knowledge-base.ts

# If populated, check query
# Try broader query terms
```

### Issue 2: Slow Response Times

**Symptoms:**
- P95 latency >5s
- Timeouts
- User complaints

**Causes:**
- Cache miss
- Large result set
- Database slow query
- LLM API latency

**Diagnostic Steps:**

```bash
# Check cache hit rate
curl https://your-app.com/trpc/askISA.getCacheStats

# Expected: hitRate > 0.6

# Check database performance
EXPLAIN SELECT * FROM knowledge_embeddings 
WHERE source_type = 'regulation';

# Check LLM latency
time curl -X POST https://api.openai.com/v1/chat/completions \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{"model":"gpt-4o-mini","messages":[{"role":"user","content":"test"}]}'
```

**Solution:**

```bash
# Warm up cache
pnpm tsx scripts/warm-cache.ts

# Add database indexes
CREATE INDEX idx_knowledge_source ON knowledge_embeddings(source_type, source_id);

# Reduce result limit
const results = await hybridSearch(query, { limit: 5 });
```

### Issue 3: Low Verification Rate

**Symptoms:**
- verificationRate <50%
- Many unverified claims
- Warnings in logs

**Causes:**
- Missing citations
- Weak claim-citation matching
- Low-authority sources

**Diagnostic Steps:**

```bash
# Check recent responses
curl https://your-app.com/trpc/askISA.getRecentFeedback \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Look for patterns in low-verification responses
```

**Solution:**

```typescript
// Improve prompt to include more citations
const prompt = assembleAskISAPrompt({
  question,
  relevantChunks,
  citationRequirement: 'MANDATORY', // Enforce citations
});

// Increase authority threshold
const evidenceAnalysis = analyzeEvidenceSufficiency(chunks, {
  minAuthorityLevel: 'verified', // Raise from 'guidance'
});
```

### Issue 4: High Abstention Rate

**Symptoms:**
- >20% queries abstained
- Frequent "insufficient evidence" messages

**Causes:**
- Evidence threshold too high
- Knowledge base gaps
- Query type mismatch

**Diagnostic Steps:**

```bash
# Check abstention reasons
tail -f /var/log/isa-web/server.log | grep "abstention"

# Common reasons:
# - NO_RELEVANT_EVIDENCE
# - LOW_SIMILARITY
# - INSUFFICIENT_AUTHORITY
# - CONFLICTING_EVIDENCE
```

**Solution:**

```typescript
// Lower evidence thresholds (carefully)
const THRESHOLDS = {
  MIN_AVG_SIMILARITY: 0.4,        // Lower from 0.5
  MIN_HIGH_QUALITY_CHUNKS: 2,     // Keep at 2
  MIN_AUTHORITY_LEVEL: 'guidance', // Keep at guidance
};

// Or expand knowledge base
pnpm tsx scripts/add-missing-content.ts
```

### Issue 5: Cache Not Working

**Symptoms:**
- fromCache always false
- Cache hit rate 0%
- Repeated slow queries

**Causes:**
- Cache disabled
- Cache cleared
- Query normalization issue

**Diagnostic Steps:**

```bash
# Check cache stats
curl https://your-app.com/trpc/askISA.getCacheStats

# Expected: size > 0

# Check cache configuration
echo $ASK_ISA_CACHE_TTL
# Expected: 86400 (24 hours)
```

**Solution:**

```typescript
// Verify cache enabled
const cachedResponse = getCachedResponse(question);
if (!cachedResponse) {
  print('Cache miss for:', question);
}

// Check normalization
const normalizedQuery = question.toLowerCase().trim();
print('Normalized:', normalizedQuery);

// Rebuild cache
curl -X POST https://your-app.com/trpc/askISA.invalidateCache
pnpm tsx scripts/warm-cache.ts
```

### Issue 6: Forbidden Query Not Blocked

**Symptoms:**
- Speculative query answered
- Calculation query answered
- Guardrails bypassed

**Causes:**
- Pattern not matching
- Classification logic bug
- Guardrails disabled

**Diagnostic Steps:**

```typescript
// Test classification
import { classifyQuery } from './ask-isa-guardrails';

const result = classifyQuery("What will happen in 2027?");
print('Type:', result.type);
print('Allowed:', result.allowed);
// Expected: type='forbidden', allowed=false
```

**Solution:**

```typescript
// Add missing pattern
const speculativePatterns = [
  /will.*happen/i,
  /predict/i,
  /in (2026|2027|2028)/i,
  /your-new-pattern/i, // Add here
];

// Test new pattern
const result = classifyQuery("your test query");
expect(result.type).toBe('forbidden');
```

### Issue 7: Database Connection Pool Exhausted

**Symptoms:**
- "Too many connections" error
- Queries hanging
- Timeouts

**Causes:**
- Connection leak
- Pool size too small
- Long-running queries

**Diagnostic Steps:**

```sql
-- Check active connections
SHOW PROCESSLIST;

-- Check pool configuration
SELECT @@max_connections;
```

**Solution:**

```typescript
// Increase pool size
const pool = createMysqlPool(process.env.DATABASE_URL, {
  connectionLimit: 20, // Increase from 10
  queueLimit: 0,
  waitForConnections: true,
});

// Ensure connections released
try {
  const result = await db.query(...);
  return result;
} finally {
  await db.release(); // Always release
}
```

### Issue 8: BM25 Index Out of Sync

**Symptoms:**
- Keyword search not working
- Hybrid search returns only vector results
- isBM25Ready() returns false

**Causes:**
- Index not built
- Knowledge base updated
- Index corrupted

**Diagnostic Steps:**

```typescript
import { isBM25Ready } from './bm25-search';

print('BM25 Ready:', isBM25Ready());
// Expected: true
```

**Solution:**

```bash
# Rebuild BM25 index
pnpm tsx scripts/build-bm25-index.ts

# Verify rebuild
pnpm tsx scripts/verify-bm25.ts

# Test search
pnpm tsx scripts/test-bm25-search.ts
```

---

## Diagnostic Commands

### Check Knowledge Base

```bash
# Count chunks by type
pnpm tsx -e "
import { getKnowledgeStats } from './server/db-knowledge';
const stats = await getKnowledgeStats();
printTable(stats);
"
```

### Check Cache

```bash
# Get cache stats
pnpm tsx -e "
import { getCacheStats } from './server/ask-isa-cache';
const stats = getCacheStats();
print(JSON.stringify(stats, null, 2));
"
```

### Test Query Classification

```bash
# Test specific query
pnpm tsx -e "
import { classifyQuery } from './server/ask-isa-guardrails';
const result = classifyQuery('Your test query');
print(JSON.stringify(result, null, 2));
"
```

### Test Hybrid Search

```bash
# Test search
pnpm tsx -e "
import { hybridSearch } from './server/hybrid-search';
const results = await hybridSearch('CSRD sustainability', { limit: 5 });
print('Results:', results.length);
printTable(results.map(r => ({ title: r.title, score: r.hybridScore })));
"
```

---

## Performance Tuning

### Optimize Database Queries

```sql
-- Add indexes
CREATE INDEX idx_knowledge_source ON knowledge_embeddings(source_type, source_id);
CREATE INDEX idx_knowledge_created ON knowledge_embeddings(created_at);
CREATE INDEX idx_qa_conv_user ON qa_conversations(user_id, created_at);
CREATE INDEX idx_qa_msg_conv ON qa_messages(conversation_id, timestamp);

-- Analyze query performance
EXPLAIN SELECT * FROM knowledge_embeddings 
WHERE source_type = 'regulation' 
LIMIT 10;
```

### Optimize Hybrid Search

```typescript
// Reduce vector search limit
const vectorResults = await vectorSearchKnowledge(query, 10); // Reduce from 20

// Increase vector threshold
const config = {
  vectorThreshold: 0.4, // Increase from 0.3
  bm25Threshold: 1.0,   // Increase from 0
};

// Reduce final result limit
const results = await hybridSearch(query, { limit: 5 }); // Reduce from 10
```

### Optimize Cache

```typescript
// Increase cache size
const MAX_CACHE_SIZE = 2000; // Increase from 1000

// Reduce TTL for faster updates
const CACHE_TTL = 43200; // 12 hours instead of 24

// Implement LRU eviction
import LRU from 'lru-cache';
const cache = new LRU({ max: 2000, ttl: 86400000 });
```

---

## Monitoring

### Key Metrics to Watch

```bash
# Query volume
tail -f /var/log/isa-web/server.log | grep "\[AskISA\] Query received" | wc -l

# Cache hit rate
tail -f /var/log/isa-web/server.log | grep "cache hit" | wc -l

# Error rate
tail -f /var/log/isa-web/server.log | grep "ERROR.*AskISA" | wc -l

# Abstention rate
tail -f /var/log/isa-web/server.log | grep "abstention" | wc -l
```

### Alert Conditions

- Error rate >5% for 5 minutes
- Cache hit rate <40% for 1 hour
- P95 latency >5s for 5 minutes
- Verification rate <50% for 1 hour
- Abstention rate >20% for 1 hour

---

## Emergency Procedures

### Complete Service Restart

```bash
# 1. Stop server
pm2 stop isa-web

# 2. Clear cache
rm -rf /tmp/ask-isa-cache/*

# 3. Restart database connection pool
pnpm tsx scripts/reset-db-pool.ts

# 4. Rebuild BM25 index
pnpm tsx scripts/build-bm25-index.ts

# 5. Start server
pm2 start isa-web

# 6. Verify health
curl https://your-app.com/health
```

### Knowledge Base Reset

```bash
# 1. Backup current state
mysqldump -u user -p db knowledge_embeddings > kb_backup.sql

# 2. Clear knowledge base
DELETE FROM knowledge_embeddings;

# 3. Regenerate
pnpm tsx scripts/generate-knowledge-base.ts

# 4. Verify
SELECT COUNT(*) FROM knowledge_embeddings;
# Expected: 155+
```

### Cache Reset

```bash
# 1. Invalidate cache
curl -X POST https://your-app.com/trpc/askISA.invalidateCache \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 2. Clean expired entries
curl -X POST https://your-app.com/trpc/askISA.cleanupCache \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# 3. Warm up cache
pnpm tsx scripts/warm-cache.ts
```

---

## Getting Help

### Internal Resources

- [CAPABILITY_SPEC.md](./CAPABILITY_SPEC.md) - Technical specification
- [API_REFERENCE.md](./API_REFERENCE.md) - API documentation
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Implementation guide
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing strategies
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment procedures

### External Resources

- OpenAI Status: https://status.openai.com
- Manus Support: https://support.manus.com
- TiDB Documentation: https://docs.pingcap.com

### Escalation

1. Check logs and metrics
2. Try diagnostic commands
3. Review this troubleshooting guide
4. Contact development team
5. Escalate to infrastructure team if needed

---

## Changelog

### v1.0 (2026-02-12)
- Initial troubleshooting guide
- 8 common issues documented
- Error codes (4xx, 5xx)
- Diagnostic commands
- Performance tuning
- Emergency procedures

---

## See Also

- [CAPABILITY_SPEC.md](./CAPABILITY_SPEC.md) - Technical specification
- [API_REFERENCE.md](./API_REFERENCE.md) - API documentation
- [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) - Implementation guide
- [TESTING_GUIDE.md](./TESTING_GUIDE.md) - Testing strategies
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment procedures
