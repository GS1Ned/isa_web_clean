---
DOC_TYPE: SRE_ARTIFACT
ARTIFACT_TYPE: ERROR_BUDGET_POLICY
STATUS: draft
CREATED: 2026-02-12
FRAMEWORK: Google SRE Workbook
---

# ISA Error Budget Policy

## Purpose

Define actions to take when error budgets are exhausted, balancing feature velocity with reliability.

## Policy Principles

1. **Error budgets are shared resources** between development and operations
2. **Exhausted budgets trigger automatic restrictions** on risky changes
3. **Budget restoration requires demonstrated reliability improvements**
4. **Policy is enforced by CI gates**, not manual oversight

---

## Error Budget States

### 🟢 HEALTHY (Budget > 50% remaining)
**Status:** Normal operations

**Allowed Actions:**
- ✅ Deploy new features
- ✅ Refactor existing code
- ✅ Experiment with new technologies
- ✅ Performance optimizations
- ✅ Schema migrations

**Restrictions:**
- None

**Review Cadence:**
- Weekly SLO review in team sync

---

### 🟡 CAUTION (Budget 10-50% remaining)
**Status:** Elevated risk

**Allowed Actions:**
- ✅ Deploy bug fixes
- ✅ Deploy reliability improvements
- ✅ Deploy security patches
- ⚠️ Deploy new features (requires reliability review)
- ❌ Experimental changes

**Restrictions:**
- New features require:
  - Rollback plan documented
  - Feature flag for instant disable
  - Monitoring/alerting in place
  - Load testing completed

**Review Cadence:**
- Daily SLO review
- Incident retrospectives for all budget burns

---

### 🔴 EXHAUSTED (Budget ≤ 10% remaining)
**Status:** Reliability freeze

**Allowed Actions:**
- ✅ Deploy critical bug fixes (P0/P1 only)
- ✅ Deploy security patches
- ✅ Deploy reliability improvements
- ❌ Deploy new features
- ❌ Refactoring
- ❌ Experimental changes

**Restrictions:**
- **Release freeze** on all non-critical changes
- All deployments require:
  - Incident commander approval
  - Explicit reliability justification
  - Rollback tested in staging

**Review Cadence:**
- Daily SLO review
- Daily incident review
- Weekly reliability postmortem

**Exit Criteria:**
- Budget restored to > 10% for 7 consecutive days
- Root cause analysis completed for all major incidents
- Reliability improvements deployed and validated

---

## SLO-Specific Policies

### UF-1: Ask ISA Latency (p95 < 3000ms)
**Error Budget:** 5% of queries may exceed 3000ms

**Burn Rate Thresholds:**
- 🟢 HEALTHY: < 2.5% over 28 days
- 🟡 CAUTION: 2.5-4.5% over 28 days
- 🔴 EXHAUSTED: ≥ 4.5% over 28 days

**Actions on Exhaustion:**
1. Freeze new RAG features
2. Profile slow queries
3. Optimize embedding search
4. Add query result caching
5. Consider LLM model downgrade for speed

---

### UF-2: Ask ISA Availability (≥ 99.5%)
**Error Budget:** 0.5% of queries may fail

**Burn Rate Thresholds:**
- 🟢 HEALTHY: < 0.25% failure rate
- 🟡 CAUTION: 0.25-0.45% failure rate
- 🔴 EXHAUSTED: ≥ 0.45% failure rate

**Actions on Exhaustion:**
1. Freeze all Ask ISA changes
2. Analyze error logs for patterns
3. Add retry logic for transient failures
4. Implement circuit breakers
5. Add graceful degradation

---

### P-1: News Pipeline Freshness (< 24h)
**Error Budget:** 1% of time may exceed 24h

**Burn Rate Thresholds:**
- 🟢 HEALTHY: < 12h staleness
- 🟡 CAUTION: 12-20h staleness
- 🔴 EXHAUSTED: ≥ 20h staleness

**Actions on Exhaustion:**
1. Freeze pipeline changes
2. Investigate scraper failures
3. Add fallback sources
4. Implement retry with exponential backoff
5. Add staleness alerts

---

### RQ-1: Citation Precision (≥ 0.90)
**Error Budget:** 10% of citations may be imprecise

**Burn Rate Thresholds:**
- 🟢 HEALTHY: ≥ 0.95 precision
- 🟡 CAUTION: 0.90-0.94 precision
- 🔴 EXHAUSTED: < 0.90 precision

**Actions on Exhaustion:**
1. Freeze RAG prompt changes
2. Manual review of imprecise citations
3. Improve citation extraction logic
4. Add citation validation checks
5. Consider prompt engineering improvements

---

## Enforcement Mechanisms

### CI Gates
**Location:** `.github/workflows/slo-policy-check.yml`

**Checks:**
1. Read `docs/sre/_generated/error_budget_status.json`
2. For each SLO in EXHAUSTED state:
   - Block deployment if change is not in allowed list
   - Require `RELIABILITY_OVERRIDE=true` label on PR
   - Post comment with policy violation details
3. For each SLO in CAUTION state:
   - Require reliability review checklist
   - Post warning comment on PR

### Manual Override
**Process:**
1. Add `RELIABILITY_OVERRIDE=true` label to PR
2. Document justification in PR description
3. Obtain approval from Principal Software Architect or SRE lead
4. Deploy with extra monitoring

**Audit:**
- All overrides logged in `docs/sre/override_log.md`
- Monthly review of override patterns

---

## Budget Restoration

### Automatic Restoration
- Error budgets reset at the start of each measurement window (28 days for most SLOs)
- Continuous SLOs (freshness) restore as soon as metric returns to acceptable range

### Accelerated Restoration
- Deploy reliability improvements that demonstrably reduce error rate
- Run extended soak tests showing sustained improvement
- Request budget reset from SRE lead with evidence

---

## Monitoring & Alerting

### Dashboard
**Location:** TBD (Grafana/CloudWatch)

**Panels:**
- Current error budget status (per SLO)
- Burn rate trends (7-day, 28-day)
- Recent incidents impacting budgets
- Policy state (HEALTHY/CAUTION/EXHAUSTED)

### Alerts
- **CAUTION threshold:** Slack notification to #isa-reliability
- **EXHAUSTED threshold:** PagerDuty alert to on-call + Slack
- **Fast burn (> 10% budget in 1 hour):** Immediate PagerDuty alert

---

## Validation Checklist

- [ ] All SLOs have defined error budget policies
- [ ] CI gate enforces policy automatically
- [ ] Override process documented and tested
- [ ] Monitoring dashboard exists
- [ ] Alerts configured and tested
- [ ] Team trained on policy

---

**Status:** DRAFT - Requires CI implementation  
**Owner:** SRE/Platform Architect  
**Next Review:** TBD
