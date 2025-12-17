# ISA GitHub Integration & Workflow Update

**Date:** 2025-12-17  
**Status:** Active  
**Purpose:** Document integration of GitHub repository workflow into ISA development planning

---

## Overview

ISA development now operates with a **GitHub-first workflow** backed by the repository at https://github.com/GS1-ISA/isa. This document outlines how the GitHub workflow integrates with existing ISA development processes and modifies the roadmap accordingly.

---

## GitHub Repository Structure

**Repository:** https://github.com/GS1-ISA/isa  
**Visibility:** Private  
**Default Branch:** main  
**Organization:** GS1-ISA

### Core Components

1. **Governance Files**
   - README.md - Project purpose and automation rules
   - SECURITY.md - Security policy and reporting procedures
   - CODEOWNERS - Review automation (@GS1Ned)
   - .gitignore - Exclusion rules for large datasets and restricted documents

2. **Documentation (`docs/`)**
   - REPO_SYNC_POLICY.md - Sync cadence and workflow requirements
   - RESEARCH_INGESTION_POLICY.md - Data provenance and integrity rules
   - INTEGRATIONS_PLAN.md - Phased integration roadmap
   - INTEGRATIONS_RESEARCH_PROTOCOL.md - Systematic evaluation framework

3. **Integration Registry (`isa/registry/`)**
   - integrations_registry.json - Machine-readable catalog of all third-party integrations

4. **CI/CD Workflows (`.github/workflows/`)**
   - ci.yml - Lint, test, security checks, registry validation
   - scheduled_checks.yml - Weekly registry refresh and source availability checks

---

## Development Workflow Changes

### Previous Workflow (Pre-GitHub)

- Development occurred in Manus sandbox environment
- Checkpoints saved via `webdev_save_checkpoint`
- No external version control
- Manual documentation updates
- Ad-hoc integration decisions

### New Workflow (GitHub-First)

**Daily Development Cycle:**

1. **Morning Sync:** Pull latest changes from GitHub main branch
2. **Feature Development:** Work in feature branches (`feature/`, `fix/`, `docs/`, etc.)
3. **Incremental Commits:** Commit work-in-progress to feature branch daily
4. **Pull Request:** Open PR when feature is ready for review
5. **CI Validation:** Automated checks (lint, test, security, registry validation)
6. **Code Review:** CODEOWNERS review required
7. **Merge:** Merge to main after approval and passing CI
8. **End-of-Day Sync:** Push all changes before closing development session

**Branch Strategy:**

- `main` - Protected branch, validated working state
- `feature/*` - New features or enhancements
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring
- `integration/*` - Third-party integration work
- `data/*` - Dataset updates or ingestion changes

**Commit Standards:**

```
<type>: <short summary>

<optional detailed description>

<optional references>
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `data`

---

## Sync Cadence

### Minimum Frequency

**At least once per development day** when active development is occurring.

### Additional Triggers

Sync must occur after:

- Feature completion
- Schema changes
- Ingestion pipeline changes
- Integration additions
- Bug fixes
- Configuration changes
- End of development session

### Emergency Sync

Immediate sync required for:

- Security vulnerabilities
- Critical bugs affecting production
- Breaking changes to dependencies
- Data integrity issues

---

## Integration Research Framework

All third-party integrations (data sources, APIs, services) must follow the systematic evaluation framework defined in `INTEGRATIONS_RESEARCH_PROTOCOL.md`.

### Integration Phases

**Phase 1: Mandatory Source Monitoring (Q1 2026)**
- GS1 Global, GS1 NL, GS1 EU, EFRAG
- Non-negotiable obligations
- Automated weekly refresh
- Priority Score: 37-40

**Phase 2: EU Institutional Data (Q2 2026)**
- CELLAR (SPARQL), EUR-Lex (REST API), DG GROW
- Authoritative regulatory sources
- Weekly refresh cadence
- Priority Score: 18-24

**Phase 3: Development Workflow Integration (Q2 2026)**
- Enhanced GitHub Actions
- Dependabot security scanning
- Automation layer (Zapier/n8n/webhooks)
- Priority Score: 12-15

**Phase 4: Opportunistic Integrations (Q3 2026+)**
- Industry associations
- Research institutions
- Standards bodies (non-GS1)
- Commercial data providers
- Evaluated case-by-case

### Decision Gates

Each phase includes a decision gate to ensure quality and prevent scope creep:

- **Go:** All success criteria met, feasibility validated, resources available
- **No-Go:** Feasibility concerns, legal barriers, effort exceeds benefit
- **Defer:** Promising but not urgent, awaiting dependencies, resource constraints

### Non-Interruption Rule

**Core Principle:** Integration research and implementation must not interrupt or delay core ISA development.

- Integration work occurs on separate feature branches
- Integration tasks limited to ≤20% of development time per sprint
- Core features (standards mapping, advisory logic) always take precedence
- Incremental delivery in small, testable increments

---

## Integration Registry

All integrations tracked in `isa/registry/integrations_registry.json`:

**Current Seeded Entries:**

| Service | Category | Type | Status | Priority |
|---------|----------|------|--------|----------|
| GS1 Global Standards | Mandatory | API | Candidate | 40 |
| GS1 Netherlands Publications | Mandatory | Web Scraping | Candidate | 38 |
| GS1 Europe/EU Publications | Mandatory | RSS | Candidate | 39 |
| EFRAG ESRS Taxonomy | Mandatory | Manual | Candidate | 37 |
| CELLAR (EU Publications) | Authoritative | SPARQL | Candidate | 22 |
| EUR-Lex | Authoritative | API | Candidate | 24 |
| DG GROW | Authoritative | Web Scraping | Candidate | 18 |
| GitHub | Supplementary | API | Active | 15 |
| Automation Layer | Supplementary | API | Candidate | 12 |

**Status Definitions:**

- **Active:** Currently integrated and operational
- **Candidate:** Approved for research/implementation
- **Research:** Under investigation, feasibility unknown
- **Not Feasible:** Technical or legal barriers prevent integration
- **Rejected:** Evaluated and determined not valuable

---

## Roadmap Integration

### Updated Q1 2026 Priorities

**Original Q1 2026 Plan:**
- Automated data pipeline monitoring
- Change detection and alerts
- Conversation history sidebar
- Export to PDF

**Revised Q1 2026 Plan (GitHub Integration):**

1. **GitHub Workflow Adoption** (NEW - Critical)
   - Migrate all development to GitHub-first workflow
   - Train team on PR discipline and CI gates
   - Establish daily sync cadence
   - Document workflow in team handbook
   - **ETA:** January 15, 2026

2. **Phase 1: Mandatory Source Monitoring** (NEW - Critical)
   - Implement GS1 Global API monitoring
   - Implement GS1 NL web scraping
   - Implement GS1 EU RSS feed monitoring
   - Implement EFRAG XBRL quarterly ingestion
   - **ETA:** March 31, 2026

3. **Automated Data Pipeline Monitoring** (EXISTING)
   - Integrate with GitHub Actions for CI/CD
   - Add pipeline health checks to scheduled workflows
   - **ETA:** February 28, 2026

4. **Change Detection and Alerts** (EXISTING)
   - Build on Phase 1 monitoring infrastructure
   - **ETA:** March 31, 2026

5. **Conversation History Sidebar** (DEFERRED to Q2)
   - Deferred to allow focus on GitHub integration and mandatory sources

6. **Export to PDF** (DEFERRED to Q2)
   - Deferred to allow focus on GitHub integration and mandatory sources

### Updated Q2 2026 Priorities

**Original Q2 2026 Plan:**
- Digital Product Passport integration
- Multi-language support
- Public API

**Revised Q2 2026 Plan (GitHub Integration):**

1. **Phase 2: EU Institutional Data** (NEW - High Priority)
   - CELLAR SPARQL integration
   - EUR-Lex REST API integration
   - DG GROW web scraping
   - **ETA:** May 31, 2026

2. **Phase 3: Development Workflow Integration** (NEW - High Priority)
   - Enhanced GitHub Actions workflows
   - Dependabot security scanning
   - Webhook automation layer
   - **ETA:** June 30, 2026

3. **Conversation History Sidebar** (MOVED from Q1)
   - **ETA:** May 15, 2026

4. **Export to PDF** (MOVED from Q1)
   - **ETA:** May 31, 2026

5. **Digital Product Passport Integration** (EXISTING)
   - **ETA:** June 30, 2026

6. **Multi-language Support** (DEFERRED to Q3)
   - Deferred to allow focus on integration phases

7. **Public API** (DEFERRED to Q3)
   - Deferred to allow focus on integration phases

### Updated Q3 2026 Priorities

**Original Q3 2026 Plan:**
- Blockchain verification
- Advanced analytics
- Enterprise features

**Revised Q3 2026 Plan (GitHub Integration):**

1. **Phase 4: Opportunistic Integrations** (NEW - Medium Priority)
   - Evaluate and implement 3+ supplementary sources
   - **ETA:** September 30, 2026

2. **Multi-language Support** (MOVED from Q2)
   - **ETA:** August 31, 2026

3. **Public API** (MOVED from Q2)
   - **ETA:** September 30, 2026

4. **Advanced Analytics** (EXISTING)
   - **ETA:** September 30, 2026

5. **Blockchain Verification** (DEFERRED to Q4)
   - Deferred to allow focus on integrations and API

6. **Enterprise Features** (DEFERRED to Q4)
   - Deferred to allow focus on integrations and API

---

## Quality Gates

Before merging to main, verify:

- [ ] All tests pass
- [ ] No secrets or credentials committed
- [ ] No copyrighted PDFs or restricted documents
- [ ] Large files (>10MB) stored externally
- [ ] Documentation updated if needed
- [ ] Integration registry updated if new connections added
- [ ] Provenance tracked for any new datasets

---

## CI/CD Pipeline

### Automated Checks (Every PR)

1. **Linting:** Code style and formatting
2. **Type Checking:** TypeScript/Python type validation
3. **Unit Tests:** Core logic validation
4. **Integration Tests:** API and database interactions
5. **Security Scanning:** Dependency vulnerabilities and secrets
6. **Registry Validation:** JSON schema validation for integrations_registry.json

### Scheduled Checks (Weekly)

1. **Registry Refresh Reminder:** Check for stale integration entries (>90 days)
2. **Mandatory Source Availability:** Verify GS1 Global, GS1 NL, GS1 EU, EFRAG are reachable
3. **Dependency Audit:** Security vulnerability scanning

---

## Success Metrics

### GitHub Workflow Adoption (Q1 2026)

- [ ] 100% of development activity committed to GitHub
- [ ] Zero direct pushes to main (all via PR)
- [ ] <48 hour PR review time
- [ ] 100% CI pass rate on main branch
- [ ] Zero secrets exposed in commit history

### Phase 1: Mandatory Sources (Q1 2026)

- [ ] 100% coverage of GS1 Global, GS1 NL, GS1 EU, EFRAG
- [ ] Zero missed updates over 90-day period
- [ ] <24 hour latency from source update to ISA ingestion
- [ ] SHA256 hashes tracked for all ingested files
- [ ] Provenance metadata complete for all datasets

### Phase 2: EU Institutional Data (Q2 2026)

- [ ] CELLAR and EUR-Lex operational
- [ ] Weekly refresh cadence
- [ ] <5% data quality issues
- [ ] DG GROW change detection functional

### Phase 3: Development Workflow (Q2 2026)

- [ ] 100% CI/CD coverage
- [ ] <10 minute CI pipeline execution time
- [ ] Zero security vulnerabilities in dependencies
- [ ] Webhook automation operational

### Phase 4: Opportunistic (Q3 2026)

- [ ] ≥3 supplementary sources evaluated per quarter
- [ ] ≥1 new integration per year (if valuable)

---

## Risk Mitigation

### Risk: GitHub Workflow Disrupts Development Velocity

**Mitigation:**
- Incremental adoption over 2-week period
- Pair programming for first PRs
- Document common workflows
- Automate repetitive tasks (PR templates, CI configs)

### Risk: Integration Work Delays Core Features

**Mitigation:**
- Strict 20% time allocation for integrations
- Separate feature branches for integration work
- Decision gates with go/no-go criteria
- Defer low-priority integrations without hesitation

### Risk: Mandatory Source Monitoring Fails

**Mitigation:**
- Redundant monitoring mechanisms (API + RSS + manual)
- Automated health checks with alerting
- Fallback to manual ingestion if automation fails
- Weekly review of monitoring status

### Risk: CI/CD Pipeline Becomes Flaky

**Mitigation:**
- Keep CI checks minimal and stable
- Avoid external dependencies in tests
- Use mocking for third-party APIs
- Monitor CI execution time and reliability

---

## Next Steps

### Immediate Actions (Week of 2025-12-17)

1. ✅ Create GitHub repository (https://github.com/GS1-ISA/isa)
2. ✅ Initialize governance files (README, SECURITY, CODEOWNERS, .gitignore)
3. ✅ Add integration planning documentation
4. ✅ Seed integrations_registry.json
5. ✅ Set up CI workflows
6. ⏳ Configure branch protection (manual UI configuration)
7. ✅ Validate permissions (issue, branch, PR creation)
8. ⏳ Update ISA development roadmaps (this document)

### Week of 2025-12-23

1. Sync current ISA codebase to GitHub
2. Create feature branch for first GitHub-based development
3. Open first PR following new workflow
4. Validate CI pipeline execution
5. Document lessons learned

### January 2026

1. Complete GitHub workflow adoption
2. Begin Phase 1: Mandatory Source Monitoring implementation
3. Update team handbook with GitHub workflow
4. Conduct quarterly integration registry review

---

## Appendix: GitHub Repository URLs

- **Repository:** https://github.com/GS1-ISA/isa
- **Issues:** https://github.com/GS1-ISA/isa/issues
- **Pull Requests:** https://github.com/GS1-ISA/isa/pulls
- **Actions:** https://github.com/GS1-ISA/isa/actions
- **Security:** https://github.com/GS1-ISA/isa/security

---

## Document History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-17 | Initial document created after GitHub repository provisioning |
