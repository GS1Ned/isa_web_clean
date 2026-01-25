# ISA Documentation Map

**Document Type:** Documentation Inventory (Canonical)  
**Date:** 17 December 2025  
**ISA Version:** 1.1 (Active)  
**Author:** Manus AI (Technical Program Manager)  
**Status:** Canonical Documentation Map

---

## Purpose

This Documentation Map provides a comprehensive inventory of all ISA project documentation in `/docs/`, classified by status (Current, Archived, Deprecated), purpose, owner, and update rules. It serves as the authoritative reference for navigating ISA's knowledge base and understanding which documents are binding, which are historical, and which are superseded.

---

## Canonical Documents (Single Source of Truth)

These documents define ISA's strategic direction, product vision, execution framework, and development priorities. They are actively maintained and serve as the binding reference for all ISA work.

| Document | Purpose | Owner | Update Frequency | Last Updated |
|----------|---------|-------|------------------|--------------|
| **ISA_FUTURE_DEVELOPMENT_PLAN.md** | Development roadmap (Now/Next/Later) | ISA Product Lead | Quarterly | 17 Dec 2024 |
| **ISA_PRODUCT_VISION.md** | Mission, value proposition, anti-goals | ISA Product Lead | Quarterly | 17 Dec 2024 |
| **ISA_DELIVERY_MODEL.md** | Execution framework, agent responsibilities | ISA Technical Program Manager | Quarterly | 17 Dec 2024 |
| **ISA_DOCUMENTATION_MAP.md** | Documentation inventory (this document) | ISA Technical Program Manager | Quarterly | 17 Dec 2024 |
| **CHANGELOG_SUMMARY.md** | Strategic changes since ISA v1.0 | ISA Product Lead | Per version bump | 17 Dec 2024 |

**Update Rules:**
- Quarterly reviews (January, April, July, October) to ensure alignment with current priorities
- Ad-hoc updates when major changes occur (regulatory updates, GS1 standards evolution, technical blockers)
- All updates require approval from ISA governance board

---

## Strategic Planning Documents

These documents provide strategic context, analysis, and planning frameworks for ISA development. They inform decision-making but are not binding execution plans.

| Document | Purpose | Status | Last Updated |
|----------|---------|--------|--------------|
| **ISA_Strategic_Roadmap.md** | Historical strategic roadmap (Nov 2025) | Archived | 28 Nov 2025 |
| **ISA_ESG_GS1_CANONICAL_MODEL.md** | Data architecture and canonical model | Current | 28 Nov 2025 |
| **ISA_PRODUCT_DIMENSIONS_ANALYSIS.md** | Product dimensions analysis (explainability, integration, etc.) | Current | 17 Dec 2024 |
| **ISA_VISUAL_BRANDING_DEVELOPMENT_PLAN.md** | GS1 visual and branding alignment plan | Current | 17 Dec 2024 |
| **ISA_GS1_PRE_EXECUTION_PREPARATION.md** | Pre-execution preparation for GS1 visual adoption | Current | 17 Dec 2024 |
| **GS1_BRAND_RESEARCH_NOTES.md** | GS1 brand manual research findings | Current | 17 Dec 2024 |
| **ISA_BRAND_POSITIONING.md** | ISA brand positioning and visual system | Current | 17 Dec 2024 |
| **ISA_INFORMATION_ARCHITECTURE.md** | Site structure and page-type strategies | Current | 17 Dec 2024 |
| **ISA_VISUAL_BRANDING_ROADMAP.md** | Phased visual branding implementation roadmap | Current | 17 Dec 2024 |

**Update Rules:**
- Strategic planning documents are updated when new analysis is required or priorities change
- Archived documents are retained for historical reference but not actively maintained

---

## Execution Documents

These documents define execution protocols, quality standards, and operational procedures for ISA development work.

| Document | Purpose | Status | Last Updated |
|----------|---------|--------|--------------|
| **MANUS_EXECUTION_BRIEF.md** | Execution rules and constraints | Superseded by ISA_DELIVERY_MODEL.md | 28 Nov 2025 |
| **MANUS_CHATGPT_PROTOCOL.md** | Manus ↔ ChatGPT collaboration protocol | Superseded by ISA_DELIVERY_MODEL.md | 28 Nov 2025 |
| **CHATGPT_INTEGRATION_CONTRACT.md** | ChatGPT work parcel schema and taxonomy | Superseded by ISA_DELIVERY_MODEL.md | 28 Nov 2025 |
| **MANUS_DAY1_EXECUTION_CHECKLIST.md** | Day 1 execution checklist | Archived (historical) | 28 Nov 2025 |
| **DAY1_COMPLETION_REPORT.md** | Day 1 completion report | Archived (historical) | 28 Nov 2025 |

**Update Rules:**
- Execution documents are superseded when consolidated into canonical documents (ISA_DELIVERY_MODEL.md)
- Archived documents are retained for historical reference but not actively maintained

---

## Governance Documents

These documents define quality standards, style guidelines, and governance processes for ISA development work.

| Document | Purpose | Status | Last Updated |
|----------|---------|--------|--------------|
| **GS1_STYLE_GUIDE_INGESTION_SUMMARY.md** | GS1 Style Guide Release 5.6 ingestion summary | Current | 28 Nov 2025 |
| **GS1_STYLE_COMPLIANCE_FINAL_REPORT.md** | GS1 Style Guide compliance report | Current | 28 Nov 2025 |
| **QUALITY_BAR.md** | Quality dimensions and standards | Current | 28 Nov 2025 |
| **ASK_ISA_GUARDRAILS.md** | Ask ISA query interface guardrails | Current | 28 Nov 2025 |
| **ASK_ISA_QUERY_LIBRARY.md** | Ask ISA production query library (30 queries) | Current | 28 Nov 2025 |
| **REGULATORY_CHANGE_LOG_SCHEMA.md** | Regulatory change log schema and validation rules | Current | 28 Nov 2025 |

**Update Rules:**
- Governance documents are updated when GS1 Style Guide is revised or quality standards change
- ASK_ISA_QUERY_LIBRARY.md is updated when new production queries are validated

---

## Advisory Documents

These documents define ISA advisory content, including locked advisory reports, gap analyses, and recommendations.

| Document | Purpose | Status | Last Updated |
|----------|---------|--------|--------------|
| **ISA_V1_LOCK_RECORD.md** | ISA v1.0 advisory lock record | Archived (historical) | 28 Nov 2025 |
| **ISA_V1_HARDENING_COMPLETE.md** | ISA v1.0 hardening completion report | Archived (historical) | 28 Nov 2025 |
| **ISA_FIRST_ADVISORY_REPORT.md** | ISA v1.0 advisory report (locked, immutable) | Current (locked) | Dec 2024 |
| **ISA_GAP_ANALYSIS.md** | ISA v1.0 gap analysis (locked, immutable) | Current (locked) | Dec 2024 |
| **ISA_RECOMMENDATIONS.md** | ISA v1.0 recommendations (locked, immutable) | Current (locked) | Dec 2024 |

**Update Rules:**
- Advisory documents are locked and immutable once published
- New advisory versions (v1.1, v1.2) are created as separate documents with version IDs
- Diff reports are generated to show changes between versions

---

## Dataset Registry Documents

These documents define ISA's dataset registry, including dataset metadata, provenance, and integrity verification.

| Document | Purpose | Status | Last Updated |
|----------|---------|--------|--------------|
| **DATASET_REGISTRY.md** | Dataset registry v1.4.0 (15 canonical datasets) | Current | 28 Nov 2025 |
| **DATASET_REGISTRY_SCHEMA.md** | Dataset registry schema and validation rules | Current | 28 Nov 2025 |
| **GS1_REFERENCE_PORTAL_BUNDLE.md** | GS1 Reference Portal bundle metadata (352 docs) | Current | 28 Nov 2025 |

**Update Rules:**
- Dataset registry is updated when new datasets are ingested or existing datasets are updated
- All dataset changes are versioned with SHA256 checksums for integrity verification

---

## Technical Documentation

These documents define ISA's technical architecture, database schema, and implementation details.

| Document | Purpose | Status | Last Updated |
|----------|---------|--------|--------------|
| **README.md** | Project overview and getting started guide | Current | 28 Nov 2025 |
| **REPO_MAP_BEFORE.md** | Repository structure before reorganization | Archived (historical) | 28 Nov 2025 |
| **REPO_MAP_AFTER.md** | Repository structure after reorganization | Archived (historical) | 28 Nov 2025 |
| **DATABASE_SCHEMA.md** | Database schema documentation | Current | 28 Nov 2025 |
| **TYPESCRIPT_CLEANUP_REPORT.md** | TypeScript cleanup report (0 errors achieved) | Archived (historical) | 28 Nov 2025 |

**Update Rules:**
- Technical documentation is updated when database schema changes or major refactoring occurs
- README.md is updated quarterly to reflect current project state

---

## Deprecated Documents (Superseded)

These documents are superseded by canonical documents and should no longer be referenced for current work. They are retained for historical context.

| Document | Superseded By | Reason for Deprecation |
|----------|---------------|------------------------|
| **ISA_DEVELOPMENT_ROADMAP_TO_FINAL_PRODUCT.md** | ISA_FUTURE_DEVELOPMENT_PLAN.md | Outdated timeline (Q1-Q2 2025), conflicting priorities |
| **ISA_AUTONOMOUS_ROADMAP_V1.md** | ISA_FUTURE_DEVELOPMENT_PLAN.md | Overlapping scope, phase-based vs Now/Next/Later |
| **Autonomous_Development_Plan.md** | ISA_FUTURE_DEVELOPMENT_PLAN.md | Tactical focus (hours-level tasks) vs strategic roadmap |
| **MANUS_EXECUTION_BRIEF.md** | ISA_DELIVERY_MODEL.md | Consolidated into canonical delivery model |
| **MANUS_CHATGPT_PROTOCOL.md** | ISA_DELIVERY_MODEL.md | Consolidated into canonical delivery model |
| **CHATGPT_INTEGRATION_CONTRACT.md** | ISA_DELIVERY_MODEL.md | Consolidated into canonical delivery model |
| **ESG_Hub_MVP_Polish_Plan.md** | ISA_FUTURE_DEVELOPMENT_PLAN.md | Branding inconsistency ("ESG Hub" vs "ISA") |

**Retention Policy:**
- Deprecated documents are moved to `/docs/deprecated/` directory
- Retained for historical reference but not actively maintained
- References to deprecated documents in code or other docs are updated to point to canonical documents

---

## Changelog Documents

These documents track changes to ISA over time, including version bumps, feature additions, and bug fixes.

| Document | Purpose | Status | Last Updated |
|----------|---------|--------|--------------|
| **CHANGELOG.md** | Comprehensive changelog (all versions) | Current | 28 Nov 2025 |
| **CHANGELOG_FOR_CHATGPT.md** | ChatGPT-specific changelog | Merged into CHANGELOG.md | 28 Nov 2025 |
| **CHANGELOG_SUMMARY.md** | Strategic changes since ISA v1.0 | Current | 17 Dec 2024 |

**Update Rules:**
- CHANGELOG.md is updated with every version bump (major, minor, patch)
- CHANGELOG_SUMMARY.md is updated quarterly to highlight strategic changes

---

## Audit Documents

These documents record audit findings, consolidation efforts, and documentation cleanup.

| Document | Purpose | Status | Last Updated |
|----------|---------|--------|--------------|
| **_AUDIT_FINDINGS.md** | Documentation audit findings (Dec 2024) | Archived (historical) | 17 Dec 2024 |

**Update Rules:**
- Audit documents are created when major documentation consolidation is required
- Archived after consolidation is complete

---

## Documentation Lifecycle

### Document States

**Current:**
- Actively maintained and referenced for ISA work
- Updated quarterly or when priorities change
- Binding reference for decision-making

**Archived:**
- Historical reference, not actively maintained
- Retained for context but superseded by current documents
- Moved to `/docs/archived/` directory

**Deprecated:**
- Superseded by canonical documents
- Retained for historical reference but should not be referenced for current work
- Moved to `/docs/deprecated/` directory

**Locked:**
- Immutable advisory content (ISA v1.0 advisory report, gap analysis, recommendations)
- Cannot be edited; new versions are created as separate documents
- Diff reports show changes between versions

### Document Update Process

**Quarterly Reviews (January, April, July, October):**
- Review all canonical documents for accuracy and relevance
- Update roadmap, product vision, delivery model based on progress and priorities
- Archive or deprecate outdated documents

**Ad-Hoc Updates:**
- Triggered by major changes (regulatory updates, GS1 standards evolution, technical blockers)
- Document owner proposes updates
- ISA governance board approves updates

**Version Control:**
- All documents are version-controlled in Git
- Major updates are tagged with version IDs (e.g., v1.1, v1.2)
- Diff reports are generated for significant changes

---

## Document Ownership

### ISA Product Lead
- ISA_FUTURE_DEVELOPMENT_PLAN.md
- ISA_PRODUCT_VISION.md
- CHANGELOG_SUMMARY.md

### ISA Technical Program Manager
- ISA_DELIVERY_MODEL.md
- ISA_DOCUMENTATION_MAP.md
- QUALITY_BAR.md

### ISA Standards Architect
- ISA_ESG_GS1_CANONICAL_MODEL.md
- DATABASE_SCHEMA.md
- DATASET_REGISTRY.md

### ISA Development Team
- README.md
- CHANGELOG.md
- Technical documentation (database schema, API docs)

### GS1 NL Standards Team
- ISA advisory content (advisory reports, gap analyses, recommendations)
- GS1 Style Guide compliance documents

---

## Navigation Guide

### For New Team Members

**Start here:**
1. README.md - Project overview and getting started
2. ISA_PRODUCT_VISION.md - Understand ISA's mission and anti-goals
3. ISA_FUTURE_DEVELOPMENT_PLAN.md - Understand current priorities (Now/Next/Later)
4. ISA_DELIVERY_MODEL.md - Understand execution framework and agent responsibilities

**Then explore:**
- DATASET_REGISTRY.md - Understand ISA's data sources
- DATABASE_SCHEMA.md - Understand ISA's database structure
- ASK_ISA_QUERY_LIBRARY.md - Understand ISA's query interface

### For GS1 NL Stakeholders

**Start here:**
1. ISA_PRODUCT_VISION.md - Understand ISA's value proposition
2. ISA_FUTURE_DEVELOPMENT_PLAN.md - Understand development priorities
3. ISA_FIRST_ADVISORY_REPORT.md - Review ISA v1.0 advisory content

**Then explore:**
- ISA_GAP_ANALYSIS.md - Review gap analyses
- ISA_RECOMMENDATIONS.md - Review recommendations
- REGULATORY_CHANGE_LOG_SCHEMA.md - Understand regulatory monitoring

### For Developers

**Start here:**
1. README.md - Project setup and development workflow
2. DATABASE_SCHEMA.md - Understand database structure
3. ISA_DELIVERY_MODEL.md - Understand quality gates and versioning rules

**Then explore:**
- DATASET_REGISTRY.md - Understand data ingestion
- ASK_ISA_GUARDRAILS.md - Understand query interface constraints
- QUALITY_BAR.md - Understand quality standards

---

## Maintenance Schedule

### Quarterly Reviews (January, April, July, October)

**Review canonical documents:**
- ISA_FUTURE_DEVELOPMENT_PLAN.md
- ISA_PRODUCT_VISION.md
- ISA_DELIVERY_MODEL.md
- ISA_DOCUMENTATION_MAP.md
- CHANGELOG_SUMMARY.md

**Update based on:**
- Progress against roadmap
- Stakeholder feedback
- Regulatory changes
- GS1 standards evolution
- Technical blockers

**Archive or deprecate:**
- Outdated documents
- Superseded documents
- Historical reports

### Monthly Reviews

**Review governance documents:**
- ASK_ISA_QUERY_LIBRARY.md (add new validated queries)
- DATASET_REGISTRY.md (add new datasets)
- CHANGELOG.md (update with version bumps)

### Continuous Updates

**Update as needed:**
- README.md (project setup changes)
- DATABASE_SCHEMA.md (schema changes)
- Technical documentation (code changes)

---

## Conclusion

This Documentation Map provides a comprehensive inventory of all ISA project documentation, classified by status, purpose, owner, and update rules. It serves as the authoritative reference for navigating ISA's knowledge base and understanding which documents are binding, which are historical, and which are superseded.

Canonical documents (ISA_FUTURE_DEVELOPMENT_PLAN.md, ISA_PRODUCT_VISION.md, ISA_DELIVERY_MODEL.md, ISA_DOCUMENTATION_MAP.md, CHANGELOG_SUMMARY.md) define ISA's strategic direction, product vision, execution framework, and development priorities. They are actively maintained and serve as the single source of truth for all ISA work.

Deprecated documents (ISA_DEVELOPMENT_ROADMAP_TO_FINAL_PRODUCT.md, ISA_AUTONOMOUS_ROADMAP_V1.md, Autonomous_Development_Plan.md, MANUS_EXECUTION_BRIEF.md, MANUS_CHATGPT_PROTOCOL.md, CHATGPT_INTEGRATION_CONTRACT.md) are superseded by canonical documents and retained for historical reference only.

This Documentation Map is reviewed and updated quarterly to ensure accuracy and relevance.

---

**Document Status:** Canonical Documentation Map  
**Next Review:** March 2025 (Quarterly Review)  
**Document Owner:** ISA Technical Program Manager  
**Contact:** ISA Development Team
