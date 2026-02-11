# ISA Future Development Plan

**Document Type:** Strategic Roadmap (Single Source of Truth)  
**Date:** 17 December 2025  
**ISA Version:** 1.1 (Active)  
**Author:** Manus AI (Lead Delivery Architect)  
**Status:** Canonical Development Plan

---

## Executive Summary

This document defines the complete development path for the Intelligent Standards Architect (ISA) from its current state (v1.1 active, v1.0 advisory locked and immutable) to production-ready delivery. It consolidates and supersedes all previous roadmap documents, establishing a single source of truth for development priorities, sequencing, and scope boundaries.

### ISA Core Mission

ISA is an **advisory and mapping platform** that explains how ESG regulatory change impacts GS1 standards and guides standards evolution for GS1 Netherlands and Benelux markets.

**What ISA Does:**
- Analyzes EU ESG regulations (CSRD, ESPR/DPP, EUDR, PPWR, etc.) and maps requirements to GS1 standards (GDSN, EPCIS, Digital Link)
- Generates gap analyses identifying where GS1 standards need evolution to support regulatory compliance
- Provides actionable recommendations for GS1 NL standards teams and member organizations
- Monitors regulatory changes and assesses impact on existing GS1 implementations
- Answers specific questions about regulation-to-standard mappings using RAG-based query interface

**What ISA Does NOT Do (Anti-Goals):**
- Customer data ingestion or validation services
- ESG reporting tools or compliance certification
- Multi-tenant SaaS platform or white-label customization
- Untraceable AI chat or speculative compliance advice
- Automated regulatory monitoring without human validation

### Strategic Priorities

The development plan optimizes for five strategic priorities in descending order of importance:

**1. Advisory Correctness** - All statements must trace to datasets, regulations, or locked advisory artifacts. No hallucinations, no speculation, no untraceable AI outputs.

**2. Scope Discipline** - ISA remains an advisory and mapping platform. Features that drift toward data ingestion, validation services, or ESG reporting tools are explicitly rejected.

**3. Development Velocity** - Prioritize features that deliver immediate value to GS1 NL stakeholders. Defer infrastructure work that does not unblock user-facing capabilities.

**4. Long-Term Maintainability** - Design for autonomous operation with minimal manual overhead. Automate data ingestion, validation, and monitoring where feasible.

**5. GS1 Stakeholder Value** - Optimize for GS1 NL standards teams, member organizations, and consultants. Deprioritize features for general ESG compliance audiences.

### Current State (ISA v1.1, December 2025)

**ISA v1.0 Advisory (Locked & Immutable):**
- First Advisory Report for GS1 NL delivered December 2024
- Gap analysis: 3 critical, 2 moderate, 2 low-priority gaps identified
- Standards evolution signals (short/medium/long-term recommendations)
- 9 canonical datasets, 11,197 records, full traceability with SHA256 checksums

**ISA v1.1 Operationalization (Active Development):**
- Regulatory Change Log schema and backend procedures implemented
- Ask ISA query library (30 production queries) and guardrails defined
- Advisory diff computation methodology documented
- News pipeline operational (7 sources, AI processing, deduplication)

**Technical Foundation:**
- Database: 15+ tables (regulations, standards, attributes, mappings, embeddings, news, regulatory changes)
- Backend: tRPC 11 + Express 4 + Drizzle ORM + TiDB
- Frontend: React 19 + Tailwind 4 + shadcn/ui
- Vector search: OpenAI embeddings (0.6s avg query time)
- TypeScript: 0 errors, 50+ files cleaned
- GS1 Style Guide Release 5.6 compliance (98%)

**Governance Framework:**
- Dataset Registry v1.4.0 (15 canonical datasets with versioning and provenance)
- GS1 Style Guide compliance enforced via `pnpm lint:style`
- Quality Bar with 5 quality dimensions (correctness, traceability, clarity, consistency, maintainability)
- ChatGPT collaboration contracts for delegated work parcels

### Roadmap Structure

The roadmap uses a **Now/Next/Later** framework rather than calendar dates to maintain flexibility and adapt to changing priorities. Each phase includes explicit scope, deliverables, quality gates, and dependencies.

**Now (Immediate Priority):** Features required for ISA v1.1 production readiness and GS1 NL stakeholder value delivery.

**Next (Near-Term Roadmap):** Features that enhance ISA's value proposition but are not blocking production deployment.

**Later (Future Considerations):** Features deferred due to scope, complexity, or unclear stakeholder demand.

---

## Now: Immediate Priority Features

### Feature 1: Regulatory Change Log UI

**Objective:** Activate non-negotiable "Regulatory News & Updates" feature using existing Regulatory Change Log infrastructure.

**Rationale:** GS1 NL stakeholders need visibility into regulatory developments that may affect standards evolution. The backend schema and procedures are implemented; only UI is missing.

**Scope:**

The Regulatory Change Log provides a structured, auditable record of regulatory developments (amendments, delegated acts, implementation guidelines) with explicit traceability to source documents and ISA version impact assessment.

**Deliverables:**

**Public UI (`/regulatory-changes`):**
- List view with filters (source type, source organization, date range, ISA version affected)
- Detail view showing full entry metadata (title, description, source URL, document hash, impact assessment)
- Statistics dashboard (entries by source type, entries by ISA version, timeline visualization)
- GS1 Style Guide compliant formatting (British English, sentence case, no Oxford commas)

**Admin UI (`/admin/regulatory-changes`):**
- Create form with 10 fields (sourceType, sourceOrg, title, description, url, documentHash, impactAssessment, isaVersionAffected, effectiveDate, relatedRegulations)
- Edit/delete capabilities with audit trail (who changed what, when)
- Bulk import from news pipeline (auto-create entries from high-impact news articles)
- Validation with Zod schemas (enforce required fields, URL format, hash format)

**News Pipeline Integration:**
- Auto-create change log entries from news articles tagged as "high impact" or "regulatory update"
- Link news articles to regulatory change entries (bidirectional relationship)
- Deduplication logic (prevent duplicate entries for same regulation + version)

**Quality Gates:**
- GS1 Style Guide compliance (automated lint checks pass)
- Traceability (every entry cites source URL + SHA256 document hash)
- Immutability (entries are append-only, edits create new versions with audit trail)
- TypeScript: 0 errors
- Vitest: 10+ tests covering CRUD operations, validation, deduplication

**Dependencies:** None (backend schema and procedures already implemented)

**Effort Estimate:** 2-3 days

**Success Metrics:**
- 100% of regulatory changes since ISA v1.0 lock are recorded in change log
- 0 entries without source URL or document hash
- GS1 NL stakeholders can filter by ISA version to see what changed between v1.0 and v1.1

---

### Feature 2: Ask ISA RAG Query Interface

**Objective:** Implement non-negotiable "Ask ISA" query interface with strict guardrails and citation requirements.

**Rationale:** GS1 NL stakeholders need a way to query ISA's knowledge base for specific regulation-to-standard mappings, gap analyses, and recommendations without reading full advisory reports.

**Scope:**

Ask ISA provides a RAG-based query interface over ISA's locked advisory artifacts, datasets, and GS1 standards documentation. All responses must cite source datasets, advisory sections, or GS1 documents. Out-of-scope questions (general ESG explanations, hypotheticals, speculation) are explicitly refused.

**Deliverables:**

**Query Interface UI (`/ask`):**
- Query input with autocomplete from Ask ISA Query Library (30 production queries)
- Response display with citation blocks (dataset ID + version, advisory section, source URL)
- Query history (last 10 queries per user, stored in database)
- Refusal messages for out-of-scope questions (with explanation of what ISA can/cannot answer)

**RAG Pipeline:**
- Ingest GS1 Reference Portal bundle (352 documents) into vector store
- Query processing: user query → embedding → similarity search → LLM answer generation
- Citation extraction: every claim must cite dataset ID, advisory section, or source URL
- Confidence scoring: high (3+ sources), medium (2 sources), low (1 source)

**Guardrails Enforcement:**
- Allowed query types: Gap, Mapping, Version, Dataset, Recommendation, Coverage
- Forbidden query types: General ESG explanations, hypotheticals, speculation, compliance certification
- Refusal patterns: "ISA cannot answer questions about [topic] because [reason]"
- Maximum response length: 500 words (prevent wall-of-text responses)

**Testing:**
- Validate all 30 queries from Ask ISA Query Library
- Measure citation completeness (100% of responses must cite sources)
- Measure response accuracy (manual review by GS1 NL standards team)
- Performance: <2s per query (95th percentile)

**Quality Gates:**
- 100% citation completeness (every claim cites dataset ID + version or advisory section)
- 0% out-of-scope responses (refusals working correctly for forbidden query types)
- GS1 Style Guide compliance (British English, sentence case, no Oxford commas)
- Performance: <2s avg query time
- Vitest: 15+ tests covering allowed queries, forbidden queries, citation extraction, confidence scoring

**Dependencies:** 
- GS1 Reference Portal bundle ingestion (352 documents)
- Vector store setup (OpenAI embeddings already implemented)

**Effort Estimate:** 3-4 days

**Success Metrics:**
- 30/30 production queries from Query Library return correct answers with citations
- 0 hallucinations or untraceable claims
- GS1 NL stakeholders can answer "Which GS1 standard supports CSRD E1-6 emissions reporting?" in <2 seconds

---

### Feature 3: Advisory Diff Computation

**Objective:** Enable automated comparison between ISA advisory versions to show what changed and why.

**Rationale:** When ISA generates v1.1, v1.2, etc. advisories, stakeholders need to see what gaps were closed, what recommendations were implemented, and what new gaps emerged.

**Scope:**

Advisory Diff Computation provides structured comparison between two ISA advisory versions, highlighting changes in gap analyses, recommendations, and regulation-to-standard mappings.

**Deliverables:**

**Diff Computation Engine:**
- Input: ISA v1.0 advisory JSON + ISA v1.1 advisory JSON
- Output: Structured diff JSON with added/removed/modified sections
- Diff types: Gap added, Gap closed, Recommendation implemented, Recommendation deferred, Mapping added, Mapping confidence changed

**Diff Visualization UI (`/advisory-diff`):**
- Side-by-side comparison view (v1.0 left, v1.1 right)
- Highlight added content (green), removed content (red), modified content (yellow)
- Filter by diff type (show only gap changes, show only recommendation changes)
- Export diff as PDF report (for GS1 NL stakeholder presentations)

**Diff Metrics Dashboard:**
- Summary statistics (X gaps closed, Y recommendations implemented, Z new gaps identified)
- Timeline visualization (when did each change occur)
- Impact assessment (which changes affect GS1 NL standards roadmap)

**Quality Gates:**
- Diff computation is deterministic (same inputs always produce same diff)
- All changes are traceable to source datasets or regulatory updates
- GS1 Style Guide compliance in diff reports
- TypeScript: 0 errors
- Vitest: 10+ tests covering diff computation, visualization, export

**Dependencies:**
- ISA v1.1 advisory generation (requires new datasets or regulatory updates)

**Effort Estimate:** 4-5 days

**Success Metrics:**
- GS1 NL stakeholders can see exactly what changed between v1.0 and v1.1 in <5 minutes
- Diff reports are used in GS1 NL standards team meetings to prioritize evolution work
- 0 unexplained changes (every diff traces to dataset update or regulatory change)

---

## Next: Near-Term Roadmap

### Feature 4: GS1 NL v3.1.34 Integration

**Objective:** Update ISA's GS1 NL attribute mappings to reflect latest GDSN version (v3.1.34).

**Rationale:** GS1 NL releases new GDSN versions periodically. ISA must stay current to provide accurate gap analyses.

**Scope:**

Ingest GS1 NL GDSN v3.1.34 attribute catalog, compare with v3.1.32 (currently in ISA), identify added/deprecated attributes, regenerate ESRS-to-GDSN mappings, and update advisory recommendations.

**Deliverables:**
- GS1 NL v3.1.34 dataset ingestion script
- Diff report (v3.1.32 → v3.1.34 changes)
- Updated ESRS-to-GDSN mappings
- Advisory v1.1 regeneration (if significant changes detected)

**Quality Gates:**
- All v3.1.34 attributes have correct data types, enums, and descriptions
- Diff report traces all changes to GS1 NL release notes
- Mappings maintain 100% citation completeness

**Dependencies:**
- GS1 NL v3.1.34 release (availability unclear)

**Effort Estimate:** 5-7 days

**Success Metrics:**
- ISA reflects latest GS1 NL GDSN version within 1 week of release
- Gap analyses account for new attributes (e.g., if v3.1.34 adds carbon footprint attributes, ESRS E1 gap is reduced)

---

### Feature 5: Dutch Initiatives Integration

**Objective:** Expand ISA coverage to include Dutch/Benelux ESG initiatives (UPV Textiel, Green Deal Duurzame Zorg, Verpact, etc.).

**Rationale:** GS1 NL members operate in Dutch market and need guidance on local initiatives, not just EU-level regulations.

**Scope:**

Ingest 5 Dutch initiatives (UPV Textiel, Green Deal Duurzame Zorg 3.0, DSGO/DigiGO, Denim Deal 2.0, Verpact) into ISA's regulations database, map to GS1 standards, and generate localized recommendations.

**Deliverables:**
- 5 new regulation entries in database (with Dutch initiative metadata)
- Regulation-to-standard mappings for Dutch initiatives
- Dutch Initiatives Hub UI (`/dutch-initiatives`)
- Advisory addendum (Dutch market-specific recommendations)

**Quality Gates:**
- All Dutch initiatives cite official source documents (government websites, industry association publications)
- Mappings maintain 100% citation completeness
- GS1 Style Guide compliance

**Dependencies:**
- Access to official Dutch initiative documentation

**Effort Estimate:** 3-4 days

**Success Metrics:**
- GS1 NL members can find Dutch initiative guidance in ISA
- ISA differentiates from EU-only compliance platforms

---

### Feature 6: Production Hardening

**Objective:** Ensure ISA is production-ready with monitoring, error recovery, and operational excellence.

**Scope:**

Implement monitoring dashboard, error recovery mechanisms, health check endpoints, and automated alerting for system failures.

**Deliverables:**
- Monitoring dashboard (`/admin/monitoring`)
- Health check endpoint (`/api/health`)
- Error recovery mechanisms (retry logic, automatic rollback)
- Email alerts for system failures

**Quality Gates:**
- 99.9% uptime
- <2s response time for 95% of queries
- 0 data corruption incidents

**Dependencies:** None

**Effort Estimate:** 3-4 days

**Success Metrics:**
- ISA operates autonomously with minimal manual intervention
- System failures are detected and resolved within 1 hour

---

## Later: Future Considerations

### Deferred Features

The following features are **explicitly deferred** due to scope, complexity, or unclear stakeholder demand. They may be reconsidered in future roadmap revisions if user feedback or strategic priorities change.

**1. Automated Regulatory Monitoring (CELLAR SPARQL Integration)**
- **Reason for deferral:** High complexity, unclear ROI (manual monitoring sufficient for current scale)
- **Reconsider when:** ISA covers 100+ regulations and manual monitoring becomes infeasible

**2. Multi-Tenant SaaS Platform**
- **Reason for deferral:** Violates scope discipline (ISA is advisory platform, not SaaS product)
- **Reconsider when:** GS1 Global requests white-label version for other Member Organizations

**3. Compliance Certification or Scoring**
- **Reason for deferral:** Violates anti-goals (ISA does not certify compliance)
- **Reconsider when:** Never (this is a hard anti-goal)

**4. Customer Data Ingestion or Validation**
- **Reason for deferral:** Violates anti-goals (ISA does not ingest customer data)
- **Reconsider when:** Never (this is a hard anti-goal)

**5. EPCIS Tools Integration**
- **Reason for deferral:** Scope creep (ISA advises on EPCIS usage, does not provide EPCIS tools)
- **Reconsider when:** GS1 NL explicitly requests EPCIS tooling as part of advisory deliverables

**6. GS1 Visual & Branding Alignment**
- **Reason for deferral:** Blocked by Phase 0 (GS1 NL cooperation required for brand assets)
- **Reconsider when:** GS1 NL provides official brand guidelines and logo assets

**7. Internationalisation (Multi-Language Support)**
- **Reason for deferral:** GS1 NL members primarily use English/Dutch; multi-language support not requested
- **Reconsider when:** ISA expands to other GS1 Member Organizations (GS1 Germany, GS1 France)

**8. Temporal Consistency (Time-Travel Queries)**
- **Reason for deferral:** Regulations are relatively stable; historical versioning not yet required
- **Reconsider when:** ISA is used for compliance audits requiring "as of" date queries

---

## Scope Boundaries & Anti-Goals

### What ISA Will Never Do

To maintain focus and prevent scope creep, the following capabilities are **permanently out of scope**:

**1. Customer Data Ingestion**
- ISA does not ingest, store, or process customer product data, supply chain data, or ESG metrics
- Rationale: ISA is an advisory platform, not a data management system

**2. Validation Services**
- ISA does not validate customer data against GS1 standards or regulatory requirements
- Rationale: Validation requires domain-specific business logic and liability ISA cannot assume

**3. ESG Reporting Tools**
- ISA does not generate CSRD reports, ESRS disclosures, or sustainability reports for customers
- Rationale: Reporting tools are a separate product category with different user needs

**4. Compliance Certification**
- ISA does not certify that a company is compliant with regulations or GS1 standards
- Rationale: Certification requires legal authority and audit processes ISA does not possess

**5. Untraceable AI Chat**
- ISA does not provide general-purpose AI chat without citations or source traceability
- Rationale: Untraceable AI outputs undermine ISA's credibility and advisory correctness

**6. Speculative Compliance Advice**
- ISA does not answer hypothetical questions ("What if regulation X changes?") or provide legal advice
- Rationale: Speculation introduces liability and undermines ISA's evidence-based approach

### What ISA Might Do (With Explicit Approval)

The following capabilities are **conditionally in scope** if explicitly requested by GS1 NL stakeholders and aligned with ISA's mission:

**1. GS1 Standards Evolution Guidance**
- ISA can recommend new attributes, data types, or enums for GS1 standards based on regulatory requirements
- Approval required: GS1 NL standards team review

**2. Sector-Specific Advisory Reports**
- ISA can generate advisory reports for specific sectors (food, textiles, electronics) if GS1 NL requests
- Approval required: GS1 NL business case and dataset availability

**3. Dutch/Benelux Initiative Coverage**
- ISA can expand to cover Dutch/Benelux ESG initiatives if GS1 NL requests
- Approval required: GS1 NL prioritization and source document availability

**4. GS1 Global Expansion**
- ISA can be adapted for other GS1 Member Organizations if GS1 Global requests
- Approval required: GS1 Global partnership agreement and localization requirements

---

## Quality Gates & Versioning Rules

### Advisory Versioning

ISA advisory reports follow semantic versioning:

**Major Version (v1.0 → v2.0):**
- Triggered by: Fundamental methodology change, new regulatory framework, major dataset additions
- Requires: Full advisory regeneration, GS1 NL stakeholder review, formal approval

**Minor Version (v1.0 → v1.1):**
- Triggered by: New datasets, regulatory updates, gap closure, recommendation implementation
- Requires: Partial advisory regeneration, diff computation, GS1 NL notification

**Patch Version (v1.1.0 → v1.1.1):**
- Triggered by: Typo fixes, formatting improvements, citation corrections
- Requires: Minimal changes, no stakeholder review required

### Quality Gates (All Features)

Every feature must pass the following quality gates before deployment:

**1. Correctness:**
- All statements trace to datasets, regulations, or advisory artifacts
- 0 hallucinations or untraceable claims
- Manual review by GS1 NL standards team (for advisory content)

**2. Traceability:**
- Every data point cites source dataset ID + version or source URL
- Every regulatory change cites source document + SHA256 hash
- Every mapping cites reasoning and confidence score

**3. GS1 Style Guide Compliance:**
- British English spelling (colour, organisation, analyse)
- Sentence case for headings (not title case)
- No Oxford commas (A, B and C, not A, B, and C)
- Automated lint checks pass (`pnpm lint:style`)

**4. TypeScript Compliance:**
- 0 TypeScript errors
- All procedures have type-safe inputs/outputs
- Drizzle schema matches database schema

**5. Test Coverage:**
- Vitest tests cover all CRUD operations, validation logic, and edge cases
- Minimum 80% code coverage for new features
- Regression tests prevent breaking changes

### Deployment Process

**Development → Staging → Production:**

**Development:**
- Feature development in feature branches
- Local testing with Vitest
- Code review by technical lead

**Staging:**
- Deploy to staging environment
- Manual testing by GS1 NL stakeholders
- Performance testing (load, response time)

**Production:**
- Deploy to production environment
- Monitor for errors (first 24 hours)
- Rollback if critical issues detected

---

## Success Metrics

### Feature-Level Metrics

**Regulatory Change Log:**
- 100% of regulatory changes since ISA v1.0 lock are recorded
- 0 entries without source URL or document hash
- GS1 NL stakeholders use change log weekly

**Ask ISA:**
- 30/30 production queries return correct answers with citations
- <2s avg query time
- 0 hallucinations or untraceable claims

**Advisory Diff:**
- GS1 NL stakeholders can see v1.0 → v1.1 changes in <5 minutes
- Diff reports used in standards team meetings

### Platform-Level Metrics

**Operational Excellence:**
- 99.9% uptime
- <2s response time (95th percentile)
- 0 data corruption incidents

**User Engagement:**
- 50+ monthly active users (GS1 NL members)
- 10+ advisory reports downloaded per month
- 100+ Ask ISA queries per month

**Advisory Impact:**
- 3+ GS1 NL standards evolution decisions informed by ISA
- 5+ gap closures tracked between advisory versions
- 10+ GS1 NL member organizations using ISA for compliance planning

---

## Dependencies & Risks

### External Dependencies

**1. GS1 NL Cooperation:**
- Required for: GS1 NL v3.1.34 integration, Dutch initiatives access, brand assets
- Risk: Delays if GS1 NL does not prioritize ISA requests
- Mitigation: Maintain regular communication with GS1 NL standards team

**2. Regulatory Data Availability:**
- Required for: Regulatory change log, advisory updates
- Risk: EUR-Lex API changes, CELLAR SPARQL unavailability
- Mitigation: Monitor data sources weekly, maintain fallback manual ingestion

**3. GS1 Reference Portal Access:**
- Required for: Ask ISA RAG pipeline
- Risk: Access restrictions, licensing issues
- Mitigation: Confirm access rights with GS1 NL before implementation

### Technical Risks

**1. Vector Search Performance:**
- Risk: Query time exceeds 2s target as dataset grows
- Mitigation: Implement caching, optimize embeddings, monitor performance

**2. Database Schema Evolution:**
- Risk: Schema changes break existing queries or procedures
- Mitigation: Use Drizzle migrations, maintain backward compatibility

**3. TypeScript/Drizzle Mismatches:**
- Risk: Database schema diverges from TypeScript types
- Mitigation: Automated schema validation in CI/CD pipeline

### Organizational Risks

**1. Scope Creep:**
- Risk: Stakeholders request features that violate anti-goals
- Mitigation: Enforce scope boundaries, refer to this document for rejections

**2. Resource Constraints:**
- Risk: Insufficient development capacity for roadmap execution
- Mitigation: Prioritize Now features, defer Next/Later features

**3. Stakeholder Alignment:**
- Risk: GS1 NL priorities change, invalidating roadmap
- Mitigation: Quarterly roadmap reviews with GS1 NL stakeholders

---

## Roadmap Governance

### Approval Process

**Now Features:**
- Technical review: ISA development team
- Business review: GS1 NL standards team
- Final approval: ISA product lead

**Next Features:**
- Technical review: ISA development team
- Business review: GS1 NL standards team + member organizations
- Final approval: ISA governance board

**Later Features:**
- Proposal required with business case, effort estimate, and stakeholder demand evidence
- Approval: ISA governance board + GS1 NL executive sponsor

### Roadmap Updates

This roadmap is reviewed and updated quarterly (January, April, July, October) or when significant changes occur:

**Triggers for roadmap update:**
- Major regulatory changes (new EU directive, significant amendment)
- GS1 standards evolution (new GDSN version, new GS1 standard)
- Stakeholder feedback (GS1 NL requests new features or deprioritizes existing ones)
- Technical blockers (dependencies unavailable, performance issues)

**Update process:**
- Document proposed changes in roadmap update proposal
- Review with GS1 NL stakeholders
- Update this document with new priorities, sequencing, or scope boundaries
- Communicate changes to development team and stakeholders

---

## Conclusion

This Future Development Plan establishes a clear, disciplined path for ISA from its current state (v1.1 active, v1.0 advisory locked) to production-ready delivery. The roadmap prioritizes advisory correctness, scope discipline, and GS1 stakeholder value while explicitly rejecting scope creep and maintaining long-term maintainability.

**Key Principles:**

**Advisory First:** ISA is an advisory and mapping platform, not a data ingestion or validation system. All features must support advisory generation, mapping quality, or stakeholder decision-making.

**Traceability Always:** Every statement, data point, and recommendation must trace to datasets, regulations, or advisory artifacts. Untraceable AI outputs are prohibited.

**Scope Discipline:** Features that drift toward ESG reporting tools, compliance certification, or customer data management are explicitly rejected.

**Incremental Value:** The Now/Next/Later framework ensures continuous delivery of stakeholder value while maintaining flexibility to adapt to changing priorities.

**Quality Over Speed:** All features must pass quality gates (correctness, traceability, GS1 Style Guide compliance, TypeScript compliance, test coverage) before deployment.

This roadmap supersedes all previous development plans and serves as the single source of truth for ISA development priorities, sequencing, and scope boundaries.

---

**Document Status:** Canonical Development Plan  
**Next Review:** March 2025 (Quarterly Review)  
**Document Owner:** ISA Product Lead  
**Contact:** ISA Development Team
