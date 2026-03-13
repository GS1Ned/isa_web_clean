# ISA Delivery Model

**Document Type:** Execution Framework (Canonical)  
**Date:** 17 December 2025  
**ISA Version:** 1.1 (Active)  
**Author:** Manus AI (Technical Program Manager)  
**Status:** Canonical Delivery Model

---

## Executive Summary

This document defines how ISA development work is executed, reviewed, versioned, and validated. It establishes clear division of responsibilities between Manus AI (orchestrator), ChatGPT (executor), and human reviewers (GS1 NL stakeholders), ensuring consistent quality, traceability, and scope discipline across all development activities.

The ISA Delivery Model consolidates and supersedes previous execution protocols (MANUS_CHATGPT_PROTOCOL.md, CHATGPT_INTEGRATION_CONTRACT.md, MANUS_EXECUTION_BRIEF.md), providing a single source of truth for development workflows, quality gates, and governance processes.

---

## Delivery Principles

### Principle 1: Advisory-First Development

All ISA development work must support advisory generation, mapping quality, or stakeholder decision-making. Features that do not directly contribute to advisory correctness, regulation-to-standard mappings, or GS1 stakeholder value are rejected.

**Enforcement:** Feature proposals must explicitly state how they support ISA's mission (advisory and mapping platform for ESG → GS1 standards). Proposals that drift toward data ingestion, validation services, or ESG reporting tools are rejected with reference to anti-goals.

### Principle 2: Traceability Always

Every data point, mapping, and recommendation must trace to authoritative sources (datasets, regulations, advisory artifacts). Untraceable AI outputs, hallucinations, and speculation are prohibited.

**Enforcement:** All features must implement citation tracking (dataset ID + version, regulation URL + document hash, advisory section + version ID). Quality gates require 100% citation completeness before deployment.

### Principle 3: Version Discipline

ISA advisory conclusions are locked and immutable once published. Changes require explicit version bumps (v1.0 → v1.1) with diff computation showing what changed and why. No silent updates or retroactive edits.

**Enforcement:** Advisory versioning rules (major/minor/patch) are enforced via database schema (version ID, locked flag, published date). Diff computation is mandatory for all version changes.

### Principle 4: Scope Discipline

ISA remains an advisory and mapping platform. Features that drift toward customer data ingestion, validation services, ESG reporting tools, or compliance certification are explicitly rejected.

**Enforcement:** Anti-goals list (ISA Product Vision) is referenced in all feature reviews. Roadmap approval process requires alignment with mission statement. Quarterly scope reviews identify and reject scope creep.

### Principle 5: GS1 Style Guide Compliance

All human-readable outputs (advisory reports, gap analyses, recommendations, UI text) must comply with GS1 Style Guide Release 5.6.

**Enforcement:** Automated lint checks (`pnpm lint:style`) run on all Markdown files. Manual review by GS1 NL standards team for advisory content. Quality gates require 98%+ compliance before deployment.

---

## Agent Responsibilities

### Manus AI (Orchestrator)

**Role:** Strategic planning, task delegation, integration, and quality assurance.

**Responsibilities:**

**Strategic Planning:**
- Analyze ISA requirements and prioritize features based on ISA Future Development Plan (Now/Next/Later)
- Design system architecture, data models, and integration patterns
- Identify dependencies, risks, and blockers
- Propose roadmap updates when priorities change or blockers emerge

**Task Delegation:**
- Prepare context packages for ChatGPT work parcels (requirements, schemas, examples, constraints)
- Delegate well-defined, bounded tasks to ChatGPT (UI components, data ingestion scripts, documentation)
- Monitor ChatGPT progress and provide clarifications when needed
- Escalate to human reviewers when ChatGPT outputs require validation

**Integration:**
- Integrate ChatGPT deliverables into ISA codebase
- Fix mechanical issues (TypeScript errors, schema mismatches, lint violations)
- Validate that ChatGPT outputs meet quality gates (correctness, traceability, GS1 Style Guide compliance)
- Reject ChatGPT outputs that violate scope discipline or anti-goals

**Quality Assurance:**
- Run automated tests (Vitest, TypeScript compiler, lint checks)
- Conduct manual testing for user-facing features
- Validate citation completeness and traceability
- Ensure GS1 Style Guide compliance

**Constraints:**
- Manus AI does not alter locked ISA advisory content (v1.0 is immutable)
- Manus AI does not introduce features not aligned with ISA Product Vision
- Manus AI does not implement code beyond integration and mechanical fixes (complex features are delegated to ChatGPT)

### ChatGPT (Executor)

**Role:** Execution of well-defined, bounded tasks delegated by Manus AI.

**Responsibilities:**

**Code Implementation:**
- Implement UI components, tRPC procedures, database queries, and data ingestion scripts based on Manus AI specifications
- Follow TypeScript best practices, Drizzle ORM patterns, and tRPC conventions
- Ensure code is type-safe, testable, and maintainable

**Documentation Generation:**
- Generate advisory reports, gap analyses, and recommendations based on Manus AI-provided datasets and templates
- Follow GS1 Style Guide Release 5.6 (British English, sentence case, no Oxford commas)
- Ensure all statements cite source datasets, regulations, or advisory artifacts

**Data Processing:**
- Ingest datasets (ESRS datapoints, GS1 attributes, regulations) into ISA database
- Validate data quality (completeness, format, consistency)
- Generate embeddings for vector search (Ask ISA RAG pipeline)

**Testing:**
- Write Vitest tests for implemented features (CRUD operations, validation logic, edge cases)
- Ensure minimum 80% code coverage for new features
- Write regression tests to prevent breaking changes

**Constraints:**
- ChatGPT does not make strategic decisions (roadmap prioritization, architecture design, scope boundaries)
- ChatGPT does not alter locked ISA advisory content (v1.0 is immutable)
- ChatGPT does not introduce features not specified in Manus AI work parcels
- ChatGPT outputs are reviewed and validated by Manus AI before integration

### Human Reviewers (GS1 NL Stakeholders)

**Role:** Validation of advisory content, business requirements, and strategic decisions.

**Responsibilities:**

**Advisory Content Review:**
- Validate gap analyses, recommendations, and regulation-to-standard mappings for correctness
- Confirm that ISA advisory conclusions align with GS1 NL standards evolution priorities
- Approve advisory version bumps (v1.0 → v1.1) and diff reports

**Business Requirements Validation:**
- Confirm that proposed features align with GS1 NL stakeholder needs
- Prioritize features based on member organization demand and strategic value
- Reject features that do not deliver GS1 stakeholder value

**Strategic Decision Approval:**
- Approve roadmap updates (Now/Next/Later prioritization)
- Approve scope changes (e.g., adding Dutch initiatives, expanding to GS1 Global)
- Approve anti-goal exceptions (e.g., conditional capabilities requiring explicit approval)

**Quality Assurance:**
- Validate that ISA outputs meet GS1 NL quality standards
- Confirm GS1 Style Guide compliance for advisory reports
- Approve production deployments

**Constraints:**
- Human reviewers do not implement code or write documentation (delegated to Manus AI and ChatGPT)
- Human reviewers do not make technical architecture decisions (delegated to Manus AI)
- Human reviewers focus on advisory correctness, business value, and strategic alignment

---

## Development Workflows

### Workflow 1: Feature Development (Manus AI-Led)

**Trigger:** Feature prioritized in ISA Future Development Plan (Now phase).

**Steps:**

**1. Requirements Analysis (Manus AI):**
- Analyze feature requirements from ISA Future Development Plan
- Identify dependencies, risks, and blockers
- Design system architecture and data models
- Prepare feature specification (scope, deliverables, quality gates, effort estimate)

**2. Implementation (Manus AI or ChatGPT):**
- **Simple features (1-2 days):** Implemented directly by Manus AI
- **Complex features (3+ days):** Delegated to ChatGPT via work parcel
- Follow TypeScript best practices, Drizzle ORM patterns, tRPC conventions
- Ensure code is type-safe, testable, and maintainable

**3. Testing (Manus AI or ChatGPT):**
- Write Vitest tests (CRUD operations, validation logic, edge cases)
- Run automated tests (TypeScript compiler, lint checks, Vitest)
- Conduct manual testing for user-facing features

**4. Integration (Manus AI):**
- Integrate feature into ISA codebase
- Fix mechanical issues (TypeScript errors, schema mismatches, lint violations)
- Validate quality gates (correctness, traceability, GS1 Style Guide compliance)

**5. Review (Human Reviewers):**
- Validate feature meets business requirements
- Confirm GS1 Style Guide compliance
- Approve production deployment

**6. Deployment:**
- Deploy to staging environment
- Conduct final testing
- Deploy to production environment
- Monitor for errors (first 24 hours)

### Workflow 2: Advisory Generation (ChatGPT-Led)

**Trigger:** New datasets available, regulatory updates detected, or GS1 standards evolution.

**Steps:**

**1. Dataset Preparation (Manus AI):**
- Ingest new datasets (ESRS datapoints, GS1 attributes, regulations) into ISA database
- Validate data quality (completeness, format, consistency)
- Generate embeddings for vector search (if needed for Ask ISA)

**2. Context Package Preparation (Manus AI):**
- Prepare ChatGPT work parcel with datasets, templates, and constraints
- Specify advisory scope (which regulations, which GS1 standards, which gaps to analyze)
- Provide examples from previous advisory reports (ISA v1.0)

**3. Advisory Generation (ChatGPT):**
- Generate gap analysis (identify where GS1 standards need evolution)
- Generate recommendations (short/medium/long-term actions)
- Generate regulation-to-standard mappings (ESRS datapoints → GDSN attributes)
- Ensure all statements cite source datasets, regulations, or advisory artifacts

**4. Validation (Manus AI):**
- Validate citation completeness (100% of statements trace to sources)
- Validate GS1 Style Guide compliance (British English, sentence case, no Oxford commas)
- Validate traceability (all data points cite dataset ID + version)

**5. Review (Human Reviewers):**
- Validate advisory correctness (gap analyses, recommendations, mappings)
- Confirm alignment with GS1 NL standards evolution priorities
- Approve advisory version bump (v1.0 → v1.1)

**6. Diff Computation (Manus AI):**
- Compute diff between previous advisory version and new version
- Highlight added/removed/modified gaps, recommendations, and mappings
- Generate diff report for GS1 NL stakeholders

**7. Publication:**
- Lock new advisory version (immutable)
- Publish advisory report, gap analysis, and recommendations
- Notify GS1 NL stakeholders

### Workflow 3: Regulatory Change Monitoring (Manus AI-Led)

**Trigger:** News pipeline detects high-impact regulatory update.

**Steps:**

**1. Change Detection (Manus AI):**
- News pipeline monitors 7 sources (EUR-Lex, EFRAG, GS1 publications, industry news)
- AI processing identifies high-impact regulatory updates (amendments, delegated acts, implementation guidelines)
- Deduplication logic prevents duplicate entries

**2. Change Log Entry Creation (Manus AI):**
- Create regulatory change log entry (sourceType, sourceOrg, title, description, url, documentHash, impactAssessment, isaVersionAffected)
- Validate entry completeness (all required fields present)
- Link to related regulations and news articles

**3. Impact Assessment (Manus AI):**
- Analyze impact on existing ISA advisory conclusions
- Identify affected gaps, recommendations, and mappings
- Determine if advisory version bump is required

**4. Notification (Manus AI):**
- Notify GS1 NL stakeholders of regulatory change
- Provide impact assessment summary
- Recommend next steps (advisory regeneration, standards evolution, member organization communication)

**5. Advisory Regeneration (If Required):**
- Follow Workflow 2 (Advisory Generation) if regulatory change requires advisory update
- Compute diff between previous and new advisory version
- Publish updated advisory with version bump

---

## Quality Gates

### Quality Gate 1: Correctness

**Criteria:**
- All statements trace to datasets, regulations, or advisory artifacts
- 0 hallucinations or untraceable claims
- Manual review by GS1 NL standards team (for advisory content)

**Enforcement:**
- Automated citation validation (check that all claims cite dataset ID + version or regulation URL)
- Manual review checklist for human reviewers
- Rejection of outputs that fail correctness criteria

### Quality Gate 2: Traceability

**Criteria:**
- Every data point cites source dataset ID + version or source URL
- Every regulatory change cites source document + SHA256 hash
- Every mapping cites reasoning and confidence score

**Enforcement:**
- Database schema enforces traceability fields (sourceId, sourceUrl, documentHash)
- Automated validation checks for missing citations
- Quality dashboard shows citation completeness metrics

### Quality Gate 3: GS1 Style Guide Compliance

**Criteria:**
- British English spelling (colour, organisation, analyse)
- Sentence case for headings (not title case)
- No Oxford commas (A, B and C, not A, B, and C)
- Automated lint checks pass (`pnpm lint:style`)

**Enforcement:**
- Automated lint checks run on all Markdown files
- Manual review by GS1 NL standards team for advisory content
- Rejection of outputs with <98% compliance

### Quality Gate 4: TypeScript Compliance

**Criteria:**
- 0 TypeScript errors
- All procedures have type-safe inputs/outputs
- Drizzle schema matches database schema

**Enforcement:**
- TypeScript compiler runs on all code changes
- Automated schema validation in CI/CD pipeline
- Rejection of code with TypeScript errors

### Quality Gate 5: Test Coverage

**Criteria:**
- Vitest tests cover all CRUD operations, validation logic, and edge cases
- Minimum 80% code coverage for new features
- Regression tests prevent breaking changes

**Enforcement:**
- Vitest runs on all code changes
- Code coverage reports generated automatically
- Rejection of features with <80% coverage

---

## Versioning Rules

### Advisory Versioning

**Major Version (v1.0 → v2.0):**
- **Triggered by:** Fundamental methodology change, new regulatory framework, major dataset additions
- **Requires:** Full advisory regeneration, GS1 NL stakeholder review, formal approval
- **Example:** ISA expands from CSRD/ESPR focus to include CSDDD, Batteries Regulation, CPR

**Minor Version (v1.0 → v1.1):**
- **Triggered by:** New datasets, regulatory updates, gap closure, recommendation implementation
- **Requires:** Partial advisory regeneration, diff computation, GS1 NL notification
- **Example:** GS1 NL releases GDSN v3.1.34, ISA regenerates ESRS-to-GDSN mappings

**Patch Version (v1.1.0 → v1.1.1):**
- **Triggered by:** Typo fixes, formatting improvements, citation corrections
- **Requires:** Minimal changes, no stakeholder review required
- **Example:** Fix typo in gap analysis, correct citation format

### Code Versioning

**Semantic Versioning (MAJOR.MINOR.PATCH):**
- **MAJOR:** Breaking changes (database schema changes, API contract changes)
- **MINOR:** New features (regulatory change log UI, Ask ISA query interface)
- **PATCH:** Bug fixes, performance improvements, refactoring

**Git Workflow:**
- **Main branch:** Production-ready code, always deployable
- **Feature branches:** Development work, merged to main after review
- **Tags:** Mark production releases (v1.1.0, v1.2.0)

---

## Governance Processes

### Roadmap Approval

**Quarterly Roadmap Reviews (January, April, July, October):**
- Manus AI proposes roadmap updates based on progress, blockers, and stakeholder feedback
- Human reviewers (GS1 NL stakeholders) validate business priorities
- Approval required for Now/Next/Later reprioritization

**Ad-Hoc Roadmap Updates:**
- Triggered by major regulatory changes, GS1 standards evolution, or technical blockers
- Manus AI documents proposed changes in roadmap update proposal
- Human reviewers approve or reject within 1 week

### Scope Change Approval

**Anti-Goal Exceptions:**
- Conditional capabilities (GS1 standards evolution guidance, sector-specific advisory reports, Dutch initiatives, GS1 Global expansion) require explicit approval
- Proposal must include business case, effort estimate, and stakeholder demand evidence
- Approval: ISA governance board + GS1 NL executive sponsor

**Scope Creep Rejection:**
- Features that violate anti-goals (customer data ingestion, validation services, ESG reporting tools, compliance certification) are rejected with reference to ISA Product Vision
- Rejection documented in roadmap update proposal
- Stakeholders notified of rejection rationale

### Quality Assurance Reviews

**Pre-Deployment Reviews:**
- All features must pass quality gates (correctness, traceability, GS1 Style Guide compliance, TypeScript compliance, test coverage)
- Human reviewers validate advisory content and business value
- Approval required for production deployment

**Post-Deployment Monitoring:**
- Monitor for errors (first 24 hours after deployment)
- Rollback if critical issues detected
- Post-mortem analysis for production incidents

---

## Work Parcel Protocol (Manus AI ↔ ChatGPT)

### Work Parcel Structure

**Parcel ID:** Unique identifier (e.g., CGPT-01, CGPT-02)

**Title:** Concise description of task (e.g., "Implement Regulatory Change Log UI")

**Context:**
- Background information (why this task is needed)
- Dependencies (what must be completed first)
- Constraints (what must not be changed)

**Requirements:**
- Functional requirements (what the feature must do)
- Non-functional requirements (performance, security, usability)
- Quality gates (correctness, traceability, GS1 Style Guide compliance)

**Deliverables:**
- Code files (TypeScript, React components, tRPC procedures)
- Documentation (Markdown files, inline comments)
- Tests (Vitest test files)

**Examples:**
- Reference implementations from ISA codebase
- Templates from previous work parcels
- Sample data for testing

**Validation Criteria:**
- How Manus AI will validate ChatGPT outputs
- Acceptance criteria (what "done" looks like)

### Work Parcel Lifecycle

**1. Preparation (Manus AI):**
- Identify task suitable for delegation (well-defined, bounded, low strategic risk)
- Prepare context package (requirements, schemas, examples, constraints)
- Assign parcel ID and title

**2. Delegation (Manus AI → ChatGPT):**
- Send work parcel to ChatGPT
- Provide clarifications if ChatGPT requests
- Monitor progress

**3. Execution (ChatGPT):**
- Implement code, documentation, and tests based on work parcel
- Follow TypeScript best practices, Drizzle ORM patterns, tRPC conventions
- Ensure quality gates are met

**4. Delivery (ChatGPT → Manus AI):**
- Submit deliverables (code files, documentation, tests)
- Provide summary of what was implemented
- Flag any issues or deviations from requirements

**5. Validation (Manus AI):**
- Review deliverables against validation criteria
- Run automated tests (TypeScript compiler, lint checks, Vitest)
- Conduct manual testing for user-facing features

**6. Integration (Manus AI):**
- Integrate deliverables into ISA codebase
- Fix mechanical issues (TypeScript errors, schema mismatches, lint violations)
- Reject deliverables that fail quality gates

**7. Feedback (Manus AI → ChatGPT):**
- Provide feedback on deliverables (what worked, what needs improvement)
- Document lessons learned for future work parcels

---

## Escalation Paths

### Technical Blockers

**Trigger:** Manus AI or ChatGPT encounters technical blocker (dependency unavailable, performance issue, schema conflict).

**Escalation:**
- Manus AI documents blocker in roadmap update proposal
- Proposes mitigation (defer feature, change approach, request external support)
- Human reviewers approve mitigation within 1 week

### Scope Ambiguity

**Trigger:** Feature proposal does not clearly align with ISA Product Vision or anti-goals.

**Escalation:**
- Manus AI requests clarification from human reviewers
- Human reviewers provide guidance (approve, reject, or modify feature scope)
- Decision documented in roadmap update proposal

### Quality Gate Failures

**Trigger:** Feature fails quality gates (correctness, traceability, GS1 Style Guide compliance, TypeScript compliance, test coverage).

**Escalation:**
- Manus AI rejects feature and documents failure reasons
- ChatGPT revises deliverables to meet quality gates
- If repeated failures, Manus AI escalates to human reviewers for guidance

### Production Incidents

**Trigger:** Critical issue detected in production (data corruption, system downtime, security vulnerability).

**Escalation:**
- Manus AI initiates rollback to previous stable version
- Documents incident in post-mortem analysis
- Human reviewers approve remediation plan

---

## Conclusion

The ISA Delivery Model establishes a clear, disciplined execution framework for ISA development work. Manus AI orchestrates strategic planning, task delegation, integration, and quality assurance. ChatGPT executes well-defined, bounded tasks (code implementation, documentation generation, data processing, testing). Human reviewers validate advisory content, business requirements, and strategic decisions.

Quality gates (correctness, traceability, GS1 Style Guide compliance, TypeScript compliance, test coverage) ensure consistent quality across all development activities. Versioning rules (advisory versioning, code versioning) maintain discipline and prevent silent updates. Governance processes (roadmap approval, scope change approval, quality assurance reviews) ensure alignment with ISA Product Vision and stakeholder priorities.

This Delivery Model consolidates and supersedes all previous execution protocols, providing a single source of truth for development workflows, agent responsibilities, and quality standards.

---

**Document Status:** Canonical Delivery Model  
**Next Review:** March 2025 (Quarterly Review)  
**Document Owner:** ISA Technical Program Manager  
**Contact:** ISA Development Team
