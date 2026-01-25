# ISA Development Roadmap to Final Product

**Document Type:** Strategic Roadmap  
**Date:** 15 January 2025  
**ISA Version:** 1.0  
**Registry Version:** v1.3.0  
**Author:** ISA Execution Agent  
**Status:** Binding Development Plan

---

## Executive summary

This document defines the complete development roadmap for the Intelligent Standards Architect (ISA) from current state (v1.0) to final production-grade product delivery. The roadmap adheres strictly to the **ISA Design Contract** (December 2025), which establishes binding constraints for two sensitive capabilities: **Regulatory Change Log** and **"Ask ISA" Advisory Query Interface**.

**ISA Core Mission:**

> ISA is an advisory + mapping platform that explains how ESG regulatory change impacts GS1 standards and guides standards evolution.

**Strategic Priorities:**

1. **Traceability first:** All statements must trace to datasets, regulations or advisory artifacts
2. **Version discipline:** No altering advisory conclusions without explicit version bumps
3. **Automation:** Design for autonomous operation with minimal manual overhead
4. **Data quality:** Ensure comprehensive coverage with automated validation
5. **Restraint:** No scope expansion beyond core mission

**Roadmap Structure:**

- **Short-term (Q1-Q2 2025):** Foundation hardening, GS1 EU PCF adoption, regulatory change log MVP
- **Medium-term (Q3-Q4 2025):** Ask ISA query interface, advisory regeneration automation, GS1 NL v3.1.34 alignment
- **Long-term (2026+):** Production-grade deployment, multi-tenant support, continuous regulatory monitoring

---

## Current state assessment (ISA v1.0, January 2025)

### Completed capabilities

**Core advisory engine:**
- ✅ 9 canonical datasets ingested (11,234 records)
- ✅ ESRS datapoints mapped to GS1 NL attributes (1,186 datapoints → 3,667 attributes)
- ✅ ISA First Advisory Report for GS1 NL delivered (December 2025)
- ✅ Gap analysis with 5 critical gaps identified
- ✅ Recommendation framework with short/medium/long-term actions

**Data infrastructure:**
- ✅ Dataset registry v1.3.0 (15 GS1 standards registered)
- ✅ Frozen dataset provenance with SHA256 hashes
- ✅ Database schema for ESRS, GS1 NL, GS1 EU, DPP, EUDR
- ✅ GS1 EU Carbon Footprint Guideline v1.0 ingested (37 records)

**Quality assurance:**
- ✅ GS1 Style Guide Release 5.6 compliance (98%)
- ✅ Automated style enforcement (`pnpm lint:style`)
- ✅ 3 GS1-compliant templates (Advisory Report, Gap Analysis, Recommendation)
- ✅ Quality Bar with 5 quality dimensions

**Technical foundation:**
- ✅ tRPC API with type-safe procedures
- ✅ Drizzle ORM with TiDB database
- ✅ React 19 + Tailwind 4 frontend
- ✅ Vitest regression tests for auth procedures

### Identified gaps

**Data coverage:**
- ❌ No automated regulatory monitoring (CELLAR, EUR-Lex)
- ❌ No GS1 NL API integration (Basic Product Data IN API)
- ❌ No real-time regulatory change detection
- ❌ Missing 6 GS1 standards (DPP, Resolver, etc.)

**Advisory automation:**
- ❌ No automated advisory regeneration
- ❌ No diff tracking between advisory versions
- ❌ No change impact analysis

**User interface:**
- ❌ No query interface over advisory artifacts
- ❌ No regulatory change log UI
- ❌ No compliance calendar or deadline tracking

**Operational:**
- ❌ No CI/CD pipeline
- ❌ No automated testing in production
- ❌ No monitoring or alerting

---

## Short-term roadmap (Q1-Q2 2025)

### Phase 1.1: Foundation hardening (January-February 2025)

**Objective:** Stabilise ISA v1.0 and resolve pre-existing technical debt

**Deliverables:**

1. **Fix TypeScript schema mismatches** (1 week)
   - Resolve `esrs_datapoints` table column name conflicts (`datapointId` → `code`, `datapointName` → `name`, `mayVoluntary` → `voluntary`)
   - Update all server-side code references
   - Run full TypeScript type-check with 0 errors
   - **Success criteria:** `pnpm check` passes with 0 errors

2. **Complete Vitest test coverage** (2 weeks)
   - Write regression tests for all tRPC procedures
   - Achieve 80%+ code coverage for server-side logic
   - Test advisory generation, mapping logic, gap classification
   - **Success criteria:** `pnpm test` passes with 80%+ coverage

3. **Implement advisory diff tracking** (1 week)
   - Build `compute_advisory_diff.cjs` script (already exists, needs validation)
   - Track changes between ISA v1.0 and v1.1 (GS1 EU PCF update)
   - Store diff metadata in database
   - **Success criteria:** Advisory diffs computed and stored for v1.0 → v1.1

4. **Create CI/CD pipeline** (1 week)
   - Set up GitHub Actions for automated testing
   - Add `pnpm lint:style` to pre-merge checks
   - Add `pnpm test` to pre-merge checks
   - Add `pnpm check` to pre-merge checks
   - **Success criteria:** All PRs require passing CI checks

**Timeline:** 5 weeks (January-February 2025)  
**Effort:** 1 FTE developer  
**Risk:** Low (technical debt resolution)

---

### Phase 1.2: GS1 EU PCF adoption tracking (March 2025)

**Objective:** Monitor GS1 NL adoption of GS1 EU Carbon Footprint Guideline v1.0

**Deliverables:**

1. **Create GS1 NL v3.1.34 adoption tracker** (1 week)
   - Build database table for GS1 NL sector model versions
   - Track adoption status of GS1 EU PCF attributes (DIY, FMCG, Healthcare)
   - Create dashboard showing adoption progress
   - **Success criteria:** Dashboard shows GS1 NL v3.1.34 adoption status

2. **Prepare ISA v1.2 advisory update** (2 weeks)
   - Update Gap #1 (Product Carbon Footprint) if GS1 NL adopts GS1 EU PCF
   - Revise recommendations based on GS1 NL adoption decisions
   - Generate advisory diff (v1.1 → v1.2)
   - **Success criteria:** ISA v1.2 advisory ready for delivery (conditional on GS1 NL adoption)

**Timeline:** 3 weeks (March 2025)  
**Effort:** 0.5 FTE developer  
**Risk:** Medium (depends on GS1 NL release schedule)

---

### Phase 1.3: Regulatory Change Log MVP (April-June 2025)

**Objective:** Implement governed signal layer for regulatory change tracking (adhering to ISA Design Contract)

**Design constraints (from ISA Design Contract):**

- ✅ Track only authoritative EU/Dutch sources (proposals, delegated acts, consultations, draft standards, guidance updates)
- ✅ Versioned, immutable, machine-readable entries
- ✅ Traceable to source documents
- ✅ Linkable to advisory regeneration decisions
- ❌ NO news feed, NO generic ESG alerts, NO content aggregation
- ❌ NO UI-first implementation, NO free-text commentary

**Deliverables:**

1. **Design regulatory change log schema** (1 week)
   - Create database table: `regulatory_change_log`
   - Fields: `id`, `source_authority`, `publication_date`, `regulatory_status`, `effective_window`, `confidence_indicator`, `impact_domains`, `source_document_url`, `source_document_hash`, `version`, `created_at`
   - Define allowed values for `source_authority` (EU Commission, EFRAG, GS1 EU, GS1 NL, etc.)
   - Define allowed values for `regulatory_status` (proposal, adopted, guidance, draft)
   - Define allowed values for `impact_domains` (traceability, PCF, circularity, packaging, deforestation, etc.)
   - **Success criteria:** Schema validated against ISA Design Contract constraints

2. **Implement manual entry workflow** (2 weeks)
   - Create tRPC procedure: `regulatoryChangeLog.create` (admin-only)
   - Validate all required fields
   - Generate immutable version ID
   - Store source document hash for traceability
   - **Success criteria:** Admin can create regulatory change log entries via tRPC

3. **Build regulatory change log UI** (2 weeks)
   - Create admin-only page: `/admin/regulatory-change-log`
   - Display entries in reverse chronological order
   - Filter by `regulatory_status`, `impact_domains`, `source_authority`
   - Show traceability to source documents
   - **Success criteria:** Admin can view and filter regulatory change log entries

4. **Link change log to advisory regeneration** (1 week)
   - Add `regulatory_change_log_ids` field to advisory metadata
   - Document which change log entries triggered advisory updates
   - Display in advisory diff reports
   - **Success criteria:** Advisory regeneration decisions are traceable to change log entries

5. **Seed initial entries** (2 weeks)
   - Add GS1 EU Carbon Footprint Guideline v1.0 (February 2025)
   - Add GS1 Provisional DPP Standard (April 2025)
   - Add GS1 Conformant Resolver Standard v1.1.0 (February 2025)
   - Add ESRS Implementation Guidance 4 (if published Q2 2025)
   - **Success criteria:** 4-6 regulatory change log entries seeded

**Timeline:** 8 weeks (April-June 2025)  
**Effort:** 1 FTE developer  
**Risk:** Low (manual entry workflow, no automation yet)

**Compliance validation:**
- ✅ Versioned, immutable, machine-readable
- ✅ Traceable to source documents
- ✅ Linkable to advisory regeneration decisions
- ✅ No free-text commentary or opinionated analysis
- ✅ No UI-first implementation (schema and procedures first)

---

## Medium-term roadmap (Q3-Q4 2025)

### Phase 2.1: "Ask ISA" query interface MVP (July-September 2025)

**Objective:** Implement read-only query interface over locked ISA artifacts (adhering to ISA Design Contract)

**Design constraints (from ISA Design Contract):**

- ✅ Read-only query interface over locked ISA artifacts
- ✅ Navigate complexity, retrieve structured answers, explain existing advisory conclusions
- ✅ Every answer MUST cite advisory IDs (MAP-, GAP-, REC-*), dataset IDs, versions, exact advisory sections
- ✅ Reproducible from locked inputs
- ❌ NO conversational ESG assistant, NO reasoning engine, NO speculative/predictive system
- ❌ NO general ESG explanations, NO hypothetical "what should GS1 do?"
- ❌ NO answering beyond current advisory scope

**Allowed question types:**
- "Which gaps exist for EUDR in FMCG?"
- "Which GS1 NL attributes partially cover ESRS E1?"
- "What changed between ISA advisory v1.0 and v1.1 for DIY?"
- "Which datasets underpin this recommendation?"

**Deliverables:**

1. **Design query interface architecture** (2 weeks)
   - Create vector embeddings for advisory artifacts (mappings, gaps, recommendations)
   - Store embeddings in database with metadata (advisory_id, dataset_id, version, section)
   - Build retrieval-augmented generation (RAG) pipeline
   - Implement citation extraction and validation
   - **Success criteria:** Architecture design validated against ISA Design Contract constraints

2. **Implement query processing pipeline** (3 weeks)
   - Create tRPC procedure: `askISA.query` (authenticated users)
   - Parse user question and extract intent
   - Retrieve relevant advisory artifacts via vector similarity search
   - Generate answer with citations (advisory IDs, dataset IDs, section links)
   - Validate answer against reproducibility criteria
   - **Success criteria:** Query pipeline returns answers with valid citations

3. **Build query interface UI** (2 weeks)
   - Create page: `/ask-isa`
   - Input: User question (text box)
   - Output: Structured answer with citations (advisory IDs, dataset IDs, section links)
   - Display "Cannot answer" message if reproducibility criteria not met
   - **Success criteria:** Users can query ISA and receive cited answers

4. **Implement query logging and analytics** (1 week)
   - Log all queries with timestamps, user IDs, questions, answers, citations
   - Track query success rate (% of queries with valid answers)
   - Identify common query patterns
   - **Success criteria:** Query logs stored and analysable

5. **Test with GS1 NL stakeholders** (2 weeks)
   - Invite GS1 NL to test "Ask ISA" interface
   - Collect feedback on answer quality, citation clarity, usability
   - Iterate based on feedback
   - **Success criteria:** GS1 NL validates "Ask ISA" interface

**Timeline:** 10 weeks (July-September 2025)  
**Effort:** 1 FTE developer + 0.5 FTE ML engineer  
**Risk:** Medium (RAG pipeline complexity, citation validation)

**Compliance validation:**
- ✅ Read-only query interface
- ✅ Answers cite advisory IDs, dataset IDs, versions, sections
- ✅ Reproducible from locked inputs
- ✅ No conversational ESG assistant framing
- ✅ No general ESG explanations or hypothetical questions
- ✅ Named "Query Advisory" or "Explain This Advisory" (not "AI assistant")

---

### Phase 2.2: Advisory regeneration automation (October-December 2025)

**Objective:** Automate advisory regeneration when regulatory change log entries trigger updates

**Deliverables:**

1. **Design advisory regeneration workflow** (2 weeks)
   - Define triggers: New regulatory change log entry with high confidence + high impact
   - Define regeneration logic: Re-run mapping analysis, gap classification, recommendation prioritisation
   - Define version bump logic: Increment advisory version (v1.2 → v1.3)
   - Define diff computation: Compare old vs. new advisory artifacts
   - **Success criteria:** Workflow design validated

2. **Implement regeneration engine** (4 weeks)
   - Create tRPC procedure: `advisory.regenerate` (admin-only)
   - Re-run ESRS → GS1 NL mapping analysis
   - Re-classify gaps (critical, moderate, low-priority)
   - Re-prioritise recommendations (short-term, medium-term, long-term)
   - Generate advisory diff (old → new)
   - Store new advisory version in database
   - **Success criteria:** Advisory regeneration produces valid v1.3 advisory

3. **Build regeneration UI** (2 weeks)
   - Create admin page: `/admin/advisory-regeneration`
   - Display regulatory change log entries eligible for regeneration
   - Show preview of advisory diff before committing
   - Approve/reject regeneration decision
   - **Success criteria:** Admin can trigger and approve advisory regeneration

4. **Test regeneration with GS1 EU PCF update** (2 weeks)
   - Simulate regulatory change log entry: GS1 EU PCF v1.1 (hypothetical)
   - Trigger advisory regeneration
   - Validate advisory diff (v1.2 → v1.3)
   - Confirm Gap #1 status updated correctly
   - **Success criteria:** Advisory regeneration produces accurate v1.3 advisory

**Timeline:** 10 weeks (October-December 2025)  
**Effort:** 1 FTE developer  
**Risk:** Medium (complex regeneration logic, diff validation)

---

### Phase 2.3: GS1 NL v3.1.34 alignment (Q4 2025)

**Objective:** Update ISA advisory to reflect GS1 NL v3.1.34 release (if GS1 NL adopts GS1 EU PCF)

**Deliverables:**

1. **Ingest GS1 NL v3.1.34 sector models** (2 weeks)
   - Download GS1 NL DIY/Garden/Pet v3.1.34
   - Download GS1 NL FMCG v3.1.34
   - Download GS1 NL Healthcare v3.1.34
   - Ingest into ISA database
   - **Success criteria:** GS1 NL v3.1.34 sector models ingested

2. **Re-run mapping analysis** (2 weeks)
   - Map ESRS datapoints to GS1 NL v3.1.34 attributes
   - Compare mapping results with v3.1.33 (identify changes)
   - Update Gap #1 (Product Carbon Footprint) if GS1 EU PCF adopted
   - **Success criteria:** Mapping analysis complete for v3.1.34

3. **Generate ISA v1.3 advisory** (2 weeks)
   - Update ISA First Advisory Report with v3.1.34 findings
   - Generate advisory diff (v1.2 → v1.3)
   - Deliver to GS1 NL
   - **Success criteria:** ISA v1.3 advisory delivered to GS1 NL

**Timeline:** 6 weeks (Q4 2025)  
**Effort:** 1 FTE developer  
**Risk:** High (depends on GS1 NL release schedule and adoption decisions)

---

## Long-term roadmap (2026+)

### Phase 3.1: Automated regulatory monitoring (Q1-Q2 2026)

**Objective:** Automate regulatory change detection from authoritative sources

**Deliverables:**

1. **Implement CELLAR SPARQL integration** (4 weeks)
   - Build SPARQL client for EUR-Lex CELLAR endpoint
   - Query for new regulations, delegated acts, consultations (daily)
   - Extract metadata: CELEX ID, title, publication date, status, effective date
   - Store in regulatory change log (pending admin review)
   - **Success criteria:** CELLAR integration detects new regulations automatically

2. **Implement EUR-Lex RSS feed monitoring** (2 weeks)
   - Subscribe to EUR-Lex RSS feeds for ESG-related topics
   - Parse feed entries and extract metadata
   - Deduplicate against CELLAR data
   - Store in regulatory change log (pending admin review)
   - **Success criteria:** RSS feed monitoring detects new regulations automatically

3. **Implement GS1 standards monitoring** (2 weeks)
   - Monitor GS1 EU website for new standards/guidelines
   - Monitor GS1 NL website for new sector model releases
   - Extract metadata: title, version, publication date, status
   - Store in regulatory change log (pending admin review)
   - **Success criteria:** GS1 standards monitoring detects new standards automatically

4. **Build admin review workflow** (2 weeks)
   - Create admin page: `/admin/regulatory-change-review`
   - Display pending regulatory change log entries
   - Admin approves/rejects entries (with rationale)
   - Approved entries trigger advisory regeneration decision
   - **Success criteria:** Admin can review and approve regulatory change log entries

**Timeline:** 10 weeks (Q1-Q2 2026)  
**Effort:** 1 FTE developer  
**Risk:** Medium (SPARQL query complexity, RSS feed parsing)

---

### Phase 3.2: Production-grade deployment (Q2-Q3 2026)

**Objective:** Deploy ISA as production-grade platform with high availability and scalability

**Deliverables:**

1. **Set up production infrastructure** (4 weeks)
   - Deploy to cloud provider (AWS, Azure, GCP)
   - Set up load balancer, auto-scaling, CDN
   - Configure database replication and backups
   - Set up monitoring, logging, alerting (Datadog, Sentry, etc.)
   - **Success criteria:** Production infrastructure operational with 99.9% uptime

2. **Implement security hardening** (3 weeks)
   - Enable HTTPS with TLS 1.3
   - Implement rate limiting and DDoS protection
   - Enable database encryption at rest and in transit
   - Implement security headers (CSP, HSTS, X-Frame-Options, etc.)
   - Run security audit (OWASP Top 10)
   - **Success criteria:** Security audit passes with 0 critical vulnerabilities

3. **Implement performance optimisation** (3 weeks)
   - Enable database query caching
   - Implement CDN for static assets
   - Optimise database indexes
   - Enable gzip compression
   - Run load testing (1000+ concurrent users)
   - **Success criteria:** Load testing passes with <500ms p95 response time

4. **Set up disaster recovery** (2 weeks)
   - Implement automated database backups (daily)
   - Test backup restoration process
   - Document disaster recovery procedures
   - Set up failover to secondary region
   - **Success criteria:** Disaster recovery tested and documented

**Timeline:** 12 weeks (Q2-Q3 2026)  
**Effort:** 1 FTE DevOps engineer + 0.5 FTE developer  
**Risk:** Medium (infrastructure complexity, security audit)

---

### Phase 3.3: Multi-tenant support (Q3-Q4 2026)

**Objective:** Enable ISA to serve multiple organisations (GS1 NL, GS1 EU, GS1 Global, etc.)

**Deliverables:**

1. **Design multi-tenant architecture** (2 weeks)
   - Define tenant isolation model (database-per-tenant vs. schema-per-tenant)
   - Define tenant-specific configuration (branding, datasets, advisory scope)
   - Define tenant-specific access control (admin, user, viewer roles)
   - **Success criteria:** Multi-tenant architecture design validated

2. **Implement tenant management** (4 weeks)
   - Create database table: `tenants`
   - Create tRPC procedures: `tenant.create`, `tenant.update`, `tenant.delete`
   - Implement tenant-specific data isolation
   - Implement tenant-specific access control
   - **Success criteria:** Tenant management operational

3. **Build tenant onboarding workflow** (3 weeks)
   - Create admin page: `/admin/tenants`
   - Admin creates new tenant with configuration
   - Admin assigns datasets to tenant
   - Admin assigns users to tenant
   - **Success criteria:** Tenant onboarding workflow operational

4. **Test multi-tenant deployment** (3 weeks)
   - Create test tenants: GS1 NL, GS1 EU, GS1 Global
   - Validate data isolation between tenants
   - Validate tenant-specific advisory scope
   - **Success criteria:** Multi-tenant deployment validated

**Timeline:** 12 weeks (Q3-Q4 2026)  
**Effort:** 1 FTE developer  
**Risk:** High (multi-tenant complexity, data isolation)

---

### Phase 3.4: Continuous regulatory monitoring (2027+)

**Objective:** Achieve fully autonomous regulatory monitoring and advisory regeneration

**Deliverables:**

1. **Implement confidence scoring for regulatory changes** (4 weeks)
   - Build ML model to predict impact of regulatory changes on GS1 standards
   - Train model on historical regulatory change log entries
   - Assign confidence scores (high, medium, low) to new entries
   - **Success criteria:** Confidence scoring model achieves 80%+ accuracy

2. **Implement automated advisory regeneration triggers** (4 weeks)
   - Define triggers: High-confidence + high-impact regulatory changes
   - Automatically trigger advisory regeneration (no admin approval required)
   - Send notification to admin after regeneration
   - **Success criteria:** Automated advisory regeneration operational

3. **Implement continuous monitoring dashboard** (3 weeks)
   - Create dashboard: `/dashboard/regulatory-monitoring`
   - Display regulatory change log entries (pending, approved, rejected)
   - Display advisory regeneration status (triggered, in-progress, completed)
   - Display query analytics ("Ask ISA" usage, success rate)
   - **Success criteria:** Continuous monitoring dashboard operational

4. **Achieve full automation** (ongoing)
   - Monitor system health and performance
   - Iterate on ML models for confidence scoring
   - Expand regulatory sources (national regulations, industry standards)
   - **Success criteria:** ISA operates autonomously with minimal manual intervention

**Timeline:** Ongoing (2027+)  
**Effort:** 0.5 FTE developer + 0.5 FTE ML engineer  
**Risk:** Medium (ML model accuracy, automation reliability)

---

## Success criteria and metrics

### Short-term (Q1-Q2 2025)

**Foundation hardening:**
- ✅ TypeScript type-check passes with 0 errors
- ✅ Vitest test coverage ≥80%
- ✅ Advisory diff tracking operational
- ✅ CI/CD pipeline operational

**Regulatory Change Log MVP:**
- ✅ 4-6 regulatory change log entries seeded
- ✅ Admin can create and view entries
- ✅ Entries linked to advisory regeneration decisions

**Metrics:**
- Time to resolve TypeScript errors: <1 week
- Test coverage: ≥80%
- CI/CD pipeline success rate: ≥95%

---

### Medium-term (Q3-Q4 2025)

**"Ask ISA" query interface:**
- ✅ Query pipeline returns answers with valid citations
- ✅ Query success rate ≥70% (% of queries with valid answers)
- ✅ GS1 NL validates "Ask ISA" interface

**Advisory regeneration automation:**
- ✅ Advisory regeneration produces valid v1.3 advisory
- ✅ Advisory diff computation accurate
- ✅ Admin can trigger and approve regeneration

**GS1 NL v3.1.34 alignment:**
- ✅ GS1 NL v3.1.34 sector models ingested
- ✅ Mapping analysis complete for v3.1.34
- ✅ ISA v1.3 advisory delivered to GS1 NL

**Metrics:**
- Query success rate: ≥70%
- Advisory regeneration accuracy: ≥90%
- Time to regenerate advisory: <1 week

---

### Long-term (2026+)

**Automated regulatory monitoring:**
- ✅ CELLAR integration detects new regulations automatically
- ✅ RSS feed monitoring detects new regulations automatically
- ✅ GS1 standards monitoring detects new standards automatically
- ✅ Admin review workflow operational

**Production-grade deployment:**
- ✅ Production infrastructure operational with 99.9% uptime
- ✅ Security audit passes with 0 critical vulnerabilities
- ✅ Load testing passes with <500ms p95 response time
- ✅ Disaster recovery tested and documented

**Multi-tenant support:**
- ✅ Tenant management operational
- ✅ Tenant onboarding workflow operational
- ✅ Multi-tenant deployment validated

**Continuous regulatory monitoring:**
- ✅ Confidence scoring model achieves 80%+ accuracy
- ✅ Automated advisory regeneration operational
- ✅ Continuous monitoring dashboard operational

**Metrics:**
- Regulatory change detection rate: ≥95%
- Advisory regeneration automation rate: ≥80%
- System uptime: ≥99.9%
- Query success rate: ≥85%

---

## Risk management

### Critical risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| GS1 NL does not adopt GS1 EU PCF in v3.1.34 | Medium | High | Prepare alternative advisory update (Gap #1 remains PARTIAL) |
| Regulatory monitoring automation fails | Medium | High | Maintain manual entry workflow as fallback |
| "Ask ISA" query interface produces inaccurate answers | Medium | High | Implement strict citation validation and reproducibility checks |
| Multi-tenant data isolation breach | Low | Critical | Implement comprehensive security audit and penetration testing |
| Advisory regeneration produces incorrect conclusions | Medium | High | Implement human-in-the-loop approval workflow |

### Mitigation strategies

**For GS1 NL adoption uncertainty:**
- Maintain regular communication with GS1 NL standards team
- Prepare alternative advisory updates for both adoption scenarios (adopted vs. not adopted)

**For automation failures:**
- Implement comprehensive error handling and retry logic
- Maintain manual entry workflows as fallback
- Set up monitoring and alerting for automation failures

**For query interface accuracy:**
- Implement strict citation validation (all answers must cite advisory IDs, dataset IDs, sections)
- Implement reproducibility checks (all answers must be reproducible from locked inputs)
- Log all queries and answers for quality review

**For data isolation breaches:**
- Implement comprehensive security audit before multi-tenant deployment
- Conduct penetration testing with third-party security firm
- Implement tenant-specific access control and data encryption

**For advisory regeneration errors:**
- Implement human-in-the-loop approval workflow
- Display advisory diff preview before committing
- Validate regeneration logic with GS1 NL stakeholders

---

## Resource requirements

### Short-term (Q1-Q2 2025)

**Personnel:**
- 1 FTE developer (foundation hardening, regulatory change log MVP)
- 0.5 FTE developer (GS1 EU PCF adoption tracking)

**Total effort:** 1.5 FTE × 6 months = 9 person-months

**Budget:**
- Personnel: €90,000 (1.5 FTE × €60,000/year × 6/12)
- Infrastructure: €1,000 (staging environment)
- Tools: €500 (CI/CD, testing tools)
- **Total:** €91,500

---

### Medium-term (Q3-Q4 2025)

**Personnel:**
- 1 FTE developer ("Ask ISA" query interface, advisory regeneration automation)
- 0.5 FTE ML engineer ("Ask ISA" RAG pipeline)
- 1 FTE developer (GS1 NL v3.1.34 alignment)

**Total effort:** 2.5 FTE × 6 months = 15 person-months

**Budget:**
- Personnel: €150,000 (2.5 FTE × €60,000/year × 6/12)
- Infrastructure: €2,000 (production environment)
- Tools: €1,000 (vector database, ML tools)
- **Total:** €153,000

---

### Long-term (2026+)

**Personnel:**
- 1 FTE developer (automated regulatory monitoring, continuous monitoring)
- 0.5 FTE ML engineer (confidence scoring, model training)
- 1 FTE DevOps engineer (production deployment, security hardening)

**Total effort:** 2.5 FTE × 12 months = 30 person-months

**Budget:**
- Personnel: €300,000 (2.5 FTE × €60,000/year × 12/12)
- Infrastructure: €12,000 (production environment, multi-tenant support)
- Tools: €3,000 (monitoring, security, ML tools)
- Security audit: €10,000 (third-party penetration testing)
- **Total:** €325,000

---

### Total budget (2025-2026)

**Personnel:** €540,000 (54 person-months)  
**Infrastructure:** €15,000  
**Tools:** €4,500  
**Security audit:** €10,000  
**Total:** €569,500

---

## Governance and decision-making

### Approval process

**Short-term roadmap (Q1-Q2 2025):**
- **Technical review:** ISA development team
- **Business review:** GS1 NL standards team
- **Final approval:** ISA governance board

**Medium-term roadmap (Q3-Q4 2025):**
- **Technical review:** ISA development team + ML engineer
- **Business review:** GS1 NL standards team
- **Final approval:** ISA governance board

**Long-term roadmap (2026+):**
- **Technical review:** ISA development team + DevOps engineer
- **Business review:** GS1 NL, GS1 EU, GS1 Global stakeholders
- **Final approval:** ISA governance board

### Steering committee

| Role | Responsibility |
|------|----------------|
| Executive sponsor | Strategic direction, budget approval |
| Product lead | Roadmap prioritisation, stakeholder alignment |
| Technical lead | Architecture design, technical feasibility |
| ML lead | RAG pipeline design, confidence scoring |
| DevOps lead | Infrastructure design, production deployment |

### Reporting cadence

- **Weekly:** Progress updates to product lead
- **Monthly:** Status reports to steering committee
- **Quarterly:** Executive briefings to sponsor

---

## Conclusion

This roadmap defines a clear path from ISA v1.0 (January 2025) to final production-grade product delivery (2026+). The roadmap adheres strictly to the **ISA Design Contract**, which establishes binding constraints for **Regulatory Change Log** and **"Ask ISA" Advisory Query Interface**.

**Key principles:**

1. **Traceability first:** All statements must trace to datasets, regulations or advisory artifacts
2. **Version discipline:** No altering advisory conclusions without explicit version bumps
3. **Restraint:** No scope expansion beyond core mission (advisory + mapping platform)
4. **Automation:** Design for autonomous operation with minimal manual overhead
5. **Quality:** Ensure comprehensive coverage with automated validation

**Strategic milestones:**

- **Q2 2025:** Regulatory Change Log MVP operational
- **Q3 2025:** "Ask ISA" query interface MVP operational
- **Q4 2025:** Advisory regeneration automation operational
- **Q2 2026:** Automated regulatory monitoring operational
- **Q3 2026:** Production-grade deployment operational
- **Q4 2026:** Multi-tenant support operational
- **2027+:** Continuous regulatory monitoring operational

**Expected impact:**

- **Time savings:** 20-40 hours per month per organisation in regulatory monitoring
- **Compliance improvement:** 80%+ coverage of ESG regulatory requirements
- **Standards evolution:** Proactive GS1 standards alignment with regulatory changes
- **Stakeholder confidence:** Transparent, traceable, reproducible advisory outputs

---

**Roadmap generated by:** ISA Execution Agent  
**ISA version:** 1.0  
**Registry version:** v1.3.0  
**Date:** 15 January 2025  
**Status:** Binding Development Plan  
**Contact:** ISA Development Team

---

## Appendix A: ISA Design Contract compliance checklist

### Regulatory Change Log

- [x] Tracks only authoritative EU/Dutch sources
- [x] Versioned, immutable, machine-readable entries
- [x] Traceable to source documents
- [x] Linkable to advisory regeneration decisions
- [x] No news feed, no generic ESG alerts, no content aggregation
- [x] No UI-first implementation, no free-text commentary

### "Ask ISA" Query Interface

- [x] Read-only query interface over locked ISA artifacts
- [x] Answers cite advisory IDs, dataset IDs, versions, sections
- [x] Reproducible from locked inputs
- [x] No conversational ESG assistant, no reasoning engine
- [x] No general ESG explanations, no hypothetical questions
- [x] Named "Query Advisory" or "Explain This Advisory"

### Shared Guardrails

- [x] Version discipline: No altering advisory conclusions without version bumps
- [x] Traceability first: All statements trace to datasets, regulations or advisory artifacts
- [x] No scope expansion beyond core mission

---

## Appendix B: Timeline visualisation

```
2025 Q1-Q2 (Short-term)
├── January-February: Foundation hardening (5 weeks)
├── March: GS1 EU PCF adoption tracking (3 weeks)
└── April-June: Regulatory Change Log MVP (8 weeks)

2025 Q3-Q4 (Medium-term)
├── July-September: "Ask ISA" query interface MVP (10 weeks)
├── October-December: Advisory regeneration automation (10 weeks)
└── Q4: GS1 NL v3.1.34 alignment (6 weeks)

2026+ (Long-term)
├── Q1-Q2: Automated regulatory monitoring (10 weeks)
├── Q2-Q3: Production-grade deployment (12 weeks)
├── Q3-Q4: Multi-tenant support (12 weeks)
└── 2027+: Continuous regulatory monitoring (ongoing)
```

---

## Appendix C: Dependencies and constraints

### External dependencies

- **GS1 NL release schedule:** GS1 NL v3.1.34 release date (Q3-Q4 2025)
- **GS1 EU standards:** GS1 EU PCF v1.1, GS1 DPP Standard ratification
- **EU regulatory updates:** ESRS Implementation Guidance 4, PPWR delegated acts
- **Cloud provider:** AWS/Azure/GCP availability and pricing

### Internal dependencies

- **ISA v1.0 completion:** All current ISA v1.0 deliverables must be complete
- **TypeScript schema fixes:** Must resolve schema mismatches before Phase 1.1
- **Vitest test coverage:** Must achieve 80%+ coverage before Phase 1.2
- **CI/CD pipeline:** Must be operational before Phase 1.3

### Constraints

- **Budget:** €569,500 total (2025-2026)
- **Personnel:** 2.5 FTE average (peak 3 FTE in Q3-Q4 2025)
- **Timeline:** 24 months (Q1 2025 - Q4 2026)
- **ISA Design Contract:** Strict adherence to Regulatory Change Log and "Ask ISA" constraints
