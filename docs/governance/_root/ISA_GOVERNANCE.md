# ISA Governance Framework

**Version:** 2.0  
**Last Updated:** 2026-02-10  
**Status:** ACTIVE

---

## Overview

ISA operates under a governance framework that prioritizes data integrity, citation accuracy, and version control. This document defines the principles, processes, and requirements for maintaining ISA's quality and reliability.

---

## Core Principles

<!-- EVIDENCE:requirement:data/metadata/dataset_registry.json -->
### 1. Data Integrity
All datasets must include complete provenance metadata:
- **Source:** Publisher, URL, and authoritative reference
- **Version:** Semantic versioning (e.g., 1.0.0)
- **Release Date:** When the data was published
- **Last Verified Date:** When ISA last verified the data
- **SHA256 Checksum:** For file integrity verification
- **Lineage:** How the data was obtained and processed
- **Ingestion Method:** Manual, automated, or API

<!-- EVIDENCE:constraint:server/routers/ask-isa.ts -->
**Requirement:** No dataset may be used in ISA without complete metadata.

<!-- EVIDENCE:implementation:server/routers/ask-isa.ts -->
### 2. Citation Accuracy
All AI-generated content must include mandatory citations:
- **Source Documents:** Specific documents used for generation
- **Confidence Scores:** Epistemic confidence levels (high/medium/low)
- **Fact vs. Inference:** Clear distinction between facts and inferences
- **Verification Status:** Whether claims have been verified

<!-- EVIDENCE:constraint:server/routers/ask-isa.ts -->
**Requirement:** All Ask ISA responses, advisory reports, and AI-generated mappings must include citations.

<!-- EVIDENCE:implementation:.git/config -->
### 3. Version Control
All changes must be tracked in Git with conventional commits:
- **Commit Format:** `<type>: <description>` (feat, fix, docs, refactor, test, chore, data)
- **Branch Strategy:** Feature branches merged to main via pull requests
- **Code Review:** All changes require review before merge
- **Rollback Capability:** All changes must be reversible via Git

<!-- EVIDENCE:constraint:.github/PULL_REQUEST_TEMPLATE.md -->
**Requirement:** All code, data, and documentation changes must be committed to version control.

### 4. Transparency
All decisions must be documented with rationale:
- **Decision Log:** Record of all significant decisions
- **Alternatives Considered:** What other options were evaluated
- **Rationale:** Why the chosen approach was selected
- **Impact Assessment:** What the decision affects

**Requirement:** Critical decisions must be documented before implementation.

### 5. Reversibility
All changes must be reversible:
- **Git History:** Complete history of all changes
- **Database Migrations:** Forward and backward migrations
- **Data Backups:** Regular backups of all datasets
- **Rollback Procedures:** Documented procedures for reverting changes

**Requirement:** No irreversible changes without explicit approval.

---

## Critical Changes Requiring Review

The following changes require review and approval before implementation:

### Schema Changes
- Database schema modifications affecting data integrity
- New tables or columns that store critical data
- Changes to existing data structures
- Migration scripts that modify production data

**Review Process:** Submit pull request with schema change documentation, impact assessment, and rollback plan.

### Data Sources
- Adding new data sources or ingestion pipelines
- Modifying existing ingestion logic
- Changing data transformation rules
- Updating data validation rules

**Review Process:** Document data source provenance, validation approach, and quality checks.

### AI Prompts & Mapping Logic
- Changes to Ask ISA system prompts
- Modifications to advisory generation prompts
- Updates to ESRS-GS1 mapping algorithms
- Changes to confidence scoring logic

**Review Process:** Test changes with golden set, document performance impact, include before/after examples.

### Advisory Report Publication
- Publishing advisory reports externally
- Sharing reports with GS1 members
- Making reports publicly accessible
- Claiming official status for reports

**Review Process:** Verify data accuracy, review citations, confirm legal disclaimers, obtain stakeholder approval.

### Governance Framework
- Modifications to this governance document
- Changes to review processes
- Updates to quality standards
- New compliance requirements

**Review Process:** Propose changes via pull request, document rationale, allow review period.

### External Integrations
- New API endpoints for external access
- Third-party data sharing
- Integration with external systems
- Public-facing features

**Review Process:** Security review, data privacy assessment, legal review, stakeholder approval.

---

## Development Workflow

### 1. Planning
- Create issue or task in project tracker
- Document requirements and acceptance criteria
- Identify if change requires governance review
- Estimate effort and timeline

### 2. Implementation
- Create feature branch from main
- Implement changes following code standards
- Write tests for new functionality
- Update documentation

### 3. Testing
- Run unit tests (pnpm test)
- Run integration tests (pnpm test-integration)
- Verify TypeScript compilation (pnpm tsc)
- Manual testing of functionality

### 4. Review
- Commit changes with conventional commit messages
- Push to GitHub
- Open pull request with description
- Request review from code owners
- Address review feedback

### 5. Merge
- Ensure all CI checks pass
- Obtain approval from reviewers
- Squash merge to main
- Delete feature branch
- Verify deployment

### 6. Verification
- Monitor production for issues
- Verify functionality works as expected
- Update documentation if needed
- Close related issues

---

## Quality Standards

### Code Quality
- **TypeScript:** Strict mode enabled, no `any` types
- **Testing:** 90%+ test coverage, all tests passing
- **Linting:** ESLint and Prettier configured
- **Documentation:** JSDoc comments for public APIs

### Data Quality
- **Completeness:** All required metadata fields populated
- **Accuracy:** Data verified against authoritative sources
- **Freshness:** Last verified date within 90 days
- **Integrity:** SHA256 checksums match source files

### Documentation Quality
- **Clarity:** Clear, concise, and accurate
- **Completeness:** All features documented
- **Currency:** Updated with code changes
- **Accessibility:** Easy to find and understand

---

## Compliance Verification

### Self-Check Before Work
Before starting any work, verify:
- [ ] Is this a critical change requiring review?
- [ ] Do I have the necessary permissions?
- [ ] Are there existing standards or patterns to follow?
- [ ] What is the rollback plan if something goes wrong?

### Self-Check After Work
After completing work, verify:
- [ ] Are all tests passing?
- [ ] Is documentation updated?
- [ ] Are changes committed with proper messages?
- [ ] Is the pull request ready for review?
- [ ] Are governance requirements met?

### Periodic Reviews
- **Weekly:** Review open pull requests and issues
- **Monthly:** Review data verification status
- **Quarterly:** Review governance compliance
- **Annually:** Review and update governance framework

---

## Escalation Process

### When to Escalate
Escalate when:
- Unsure if change requires review
- Change has significant impact
- Conflict with governance principles
- Security or privacy concerns
- Legal or compliance questions

### How to Escalate
1. Document the issue clearly
2. Identify the governance principle affected
3. Propose alternatives if possible
4. Tag appropriate stakeholders
5. Wait for guidance before proceeding

### Escalation Contacts
- **Technical Issues:** Development team lead
- **Data Issues:** Data governance steward
- **Governance Issues:** Project owner
- **Security Issues:** Security team
- **Legal Issues:** Legal counsel

---

## Governance Violations

### Types of Violations
- **Minor:** Missing documentation, incomplete commit messages
- **Moderate:** Skipped tests, inadequate review
- **Major:** Bypassed review process, data integrity issues
- **Critical:** Security vulnerabilities, data loss, compliance violations

### Response Process
1. **Identify:** Detect violation through review or monitoring
2. **Assess:** Determine severity and impact
3. **Contain:** Stop further impact if needed
4. **Remediate:** Fix the issue and restore compliance
5. **Document:** Record violation and remediation
6. **Prevent:** Update processes to prevent recurrence

---

## Continuous Improvement

### Feedback Mechanisms
- Pull request reviews
- Issue discussions
- Retrospectives
- User feedback
- Monitoring and alerts

### Process Updates
- Governance framework reviewed quarterly
- Updates proposed via pull request
- Changes require team consensus
- Documentation updated immediately

### Learning from Issues
- Document all governance violations
- Analyze root causes
- Update processes to prevent recurrence
- Share learnings with team

---

## Appendix: Conventional Commit Types

- **feat:** New feature
- **fix:** Bug fix
- **docs:** Documentation changes
- **refactor:** Code refactoring
- **test:** Test additions or changes
- **chore:** Build/tooling changes
- **data:** Dataset updates

**Example:**
```
feat: Add EUDR geolocation validation

Implement geolocation validation for EUDR compliance.
Validates plot coordinates against deforestation risk data.

Closes #123
```

---

## Document History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 2.0 | 2026-02-10 | Simplified governance, removed Lane system | Development Team |
| 1.0 | 2025-12-17 | Initial Lane-based governance framework | Development Team |

---

**For questions or clarifications, contact the project owner or development team lead.**
