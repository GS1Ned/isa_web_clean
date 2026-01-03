# ISA Implementation-Ready Execution Plan

**Document Version:** 1.0  
**Date:** 3 January 2026  
**Author:** Manus AI  
**Classification:** Implementation Planning - Execution Ready

---

## Executive Summary

This document presents an **Implementation-Ready Execution Plan** for the Intelligent Standards Architect (ISA) platform, derived from the Strategic Evaluation and Quality Mapping outputs. The plan prioritises the top 10 improvements by combined user value, implementation feasibility, and strategic alignment, organising them into three execution phases with explicit dependencies, acceptance criteria, demo scenarios, and risk mitigation strategies.

The execution plan transforms ISA from an information repository into an **actionable compliance advisor** by implementing capabilities that directly answer the primary user question: "What do I need to do?" The phased approach ensures that foundational capabilities are established before dependent features are built, while parallelisable work streams maximise development velocity.

**Key Deliverables by Phase:**

| Phase | Duration | Key Deliverables | Exit Gate |
|-------|----------|------------------|-----------|
| **Phase 1** | 4-6 weeks | Compliance Gap Analyzer, GS1 Attribute Recommender, Advisory Report PDF Export | First integration test passes; user study script validated |
| **Phase 2** | 6-8 weeks | Personalized Dashboard, Multi-Regulation Simulator, Sector-Specific Roadmaps, Deadline Alerting | All Phase 1 features stable; Phase 2 acceptance criteria met |
| **Phase 3** | 8-10 weeks | Supplier Data Generator, Ask ISA Pro Mode, Compliance Evidence Vault | Full regression suite passes; production deployment validated |

---

## Work Item Overviews

### Work Item 1: Compliance Gap Analyzer

**Title:** Compliance Gap Analyzer  
**Priority Score:** 95/100  
**Phase:** 1 (Foundation)

**Description:**  
The Compliance Gap Analyzer transforms ISA from an information repository into an actionable advisor by directly answering the primary user question: "What do I need to do?" Users describe their organisation profile (sector, size, geography, current GS1 implementations) and receive a prioritised gap list with specific remediation steps. The analyzer compares current GS1 implementations against required capabilities for applicable regulations, classifying gaps by severity and providing estimated implementation effort for each remediation action.

**Expected Value:**  
This feature delivers transformational value by eliminating the manual gap analysis work that currently consumes 8-12 hours per engagement. Sustainability directors gain immediate clarity on compliance obligations, while consultants can deliver client assessments in hours rather than days. The feature establishes ISA's unique competitive position as the only platform bridging regulatory requirements to GS1 implementation guidance.

**Quality Dimensions Addressed:**

| Quality Dimension | Impact Level | Implementation Requirements |
|-------------------|--------------|----------------------------|
| Analytical Rigour | ⭐⭐⭐⭐⭐ High | Reference frozen datasets; include confidence scoring; provide traceability from user profile to identified gaps |
| Technical Correctness | ⭐⭐⭐⭐ High | Validated schemas; tested procedures; accurate ESRS-GS1 mappings |
| GS1 Style Compliance | ⭐⭐⭐ Moderate | Gap reports follow GS1 Style Guide for terminology and formatting |
| Accessibility | ⭐⭐⭐ Moderate | Gap visualisations must not rely solely on colour; provide text alternatives |
| Reproducibility | ⭐⭐⭐⭐⭐ High | Users can regenerate gap analysis with same inputs and receive identical results |

---

### Work Item 2: GS1 Attribute Recommender

**Title:** GS1 Attribute Recommender  
**Priority Score:** 93/100  
**Phase:** 1 (Foundation)

**Description:**  
The GS1 Attribute Recommender bridges the regulation-to-action gap by specifying exactly which GS1 attributes to implement for each regulatory requirement. Users select one or more regulations and receive a comprehensive list of required GS1 attributes, grouped by standard (GDSN, EPCIS, Digital Link), with implementation priority indicators and regulatory basis for each recommendation. This feature addresses the critical user pain point of manual regulation-to-standard mapping, which currently requires 4-6 hours of expert analysis per engagement.

**Expected Value:**  
ISA becomes the only platform that answers "Which GDSN attributes do I need to populate to comply with ESRS E1-5?" This represents a significant competitive moat, as no benchmark platform provides specific data attribute recommendations for regulatory compliance. The feature eliminates guesswork in implementation planning and ensures organisations capture the right data from the outset.

**Quality Dimensions Addressed:**

| Quality Dimension | Impact Level | Implementation Requirements |
|-------------------|--------------|----------------------------|
| Analytical Rigour | ⭐⭐⭐⭐⭐ High | Attribute recommendations traceable to specific regulation clauses and ESRS datapoints |
| Technical Correctness | ⭐⭐⭐⭐⭐ High | GS1 attribute IDs accurate and current; recommendations align with latest GDSN version |
| GS1 Style Compliance | ⭐⭐⭐⭐ High | Attribute names and descriptions use official GS1 terminology |
| Accessibility | ⭐⭐ Low | Primarily technical output; accessibility less critical than accuracy |
| Reproducibility | ⭐⭐⭐⭐⭐ High | Same regulation input always produces same attribute recommendations |

---

### Work Item 3: Advisory Report PDF Export

**Title:** Advisory Report PDF Export  
**Priority Score:** 90/100  
**Phase:** 1 (Foundation)

**Description:**  
The Advisory Report PDF Export creates tangible deliverables that users can share with stakeholders, boards, and auditors. The feature transforms ephemeral web interactions into permanent, shareable artifacts that demonstrate ISA's value beyond the platform. Reports include executive summaries, gap analysis findings, prioritised recommendations, implementation roadmaps, and appendices with supporting data and methodology documentation.

**Expected Value:**  
This feature extends ISA's value beyond platform users by enabling sustainability directors to communicate compliance status to executive leadership and board members who may never log into ISA directly. Consultants can deliver branded, professional reports to clients, increasing the perceived value of ISA-powered engagements. The feature also creates audit-ready documentation that organisations can reference during regulatory examinations.

**Quality Dimensions Addressed:**

| Quality Dimension | Impact Level | Implementation Requirements |
|-------------------|--------------|----------------------------|
| Analytical Rigour | ⭐⭐⭐⭐ High | Reports include methodology documentation and source citations |
| Technical Correctness | ⭐⭐⭐ Moderate | PDF generation reliable; formatting consistent across browsers |
| GS1 Style Compliance | ⭐⭐⭐⭐⭐ High | Reports follow GS1 Style Guide Release 5.6 for all human-readable content |
| Accessibility | ⭐⭐⭐⭐ High | PDFs include proper heading structure, alt text, and readable fonts |
| Reproducibility | ⭐⭐⭐⭐ High | Same inputs produce visually identical PDF outputs |

---

### Work Item 4: Personalized Compliance Dashboard

**Title:** Personalized Compliance Dashboard  
**Priority Score:** 85/100  
**Phase:** 2 (Enhancement)

**Description:**  
The Personalized Compliance Dashboard aggregates each user's specific regulatory exposure, deadlines, and progress into a single actionable view. The dashboard displays organisation-specific compliance status rather than generic information, creating ongoing engagement through personalised alerts, progress tracking, and prioritised action items. Users see their compliance posture at a glance, with drill-down capabilities to specific regulations, gaps, and remediation tasks.

**Expected Value:**  
This feature transforms ISA from a point-in-time analysis tool into an ongoing compliance management platform. Users return regularly to monitor progress, check upcoming deadlines, and verify that remediation actions are on track. The dashboard creates stickiness by becoming the central hub for compliance visibility, reducing the risk of users churning after initial gap analysis.

**Quality Dimensions Addressed:**

| Quality Dimension | Impact Level | Implementation Requirements |
|-------------------|--------------|----------------------------|
| Analytical Rigour | ⭐⭐⭐⭐ High | Dashboard data derived from validated gap analysis and user profile |
| Technical Correctness | ⭐⭐⭐⭐ High | Real-time data synchronisation; accurate progress calculations |
| GS1 Style Compliance | ⭐⭐⭐ Moderate | Dashboard labels and descriptions follow GS1 terminology |
| Accessibility | ⭐⭐⭐⭐ High | Dashboard fully navigable by keyboard; charts have text alternatives |
| Reproducibility | ⭐⭐⭐ Moderate | Dashboard state reproducible from user profile and gap analysis data |

---

### Work Item 5: Multi-Regulation Impact Simulator

**Title:** Multi-Regulation Impact Simulator  
**Priority Score:** 80/100  
**Phase:** 2 (Enhancement)

**Description:**  
The Multi-Regulation Impact Simulator enables "what if" scenario planning for upcoming regulations, which is critical for strategic investment decisions. Users can model the combined impact of multiple regulatory changes, compare different compliance pathways, and identify synergies where a single implementation addresses multiple requirements. The simulator supports time-based projections showing how compliance obligations evolve as regulations phase in.

**Expected Value:**  
Sustainability directors can make informed investment decisions by understanding the cumulative impact of regulatory changes before committing resources. The simulator reveals opportunities to consolidate compliance efforts across regulations, potentially reducing implementation costs by 20-30% through strategic sequencing. The feature also supports board-level presentations by visualising future compliance scenarios.

**Quality Dimensions Addressed:**

| Quality Dimension | Impact Level | Implementation Requirements |
|-------------------|--------------|----------------------------|
| Analytical Rigour | ⭐⭐⭐⭐⭐ High | Simulations based on validated regulation timelines and requirement mappings |
| Technical Correctness | ⭐⭐⭐⭐ High | Accurate calculation of cumulative requirements; no double-counting |
| GS1 Style Compliance | ⭐⭐⭐ Moderate | Simulation outputs follow GS1 terminology |
| Accessibility | ⭐⭐⭐ Moderate | Simulation visualisations accessible; text alternatives provided |
| Reproducibility | ⭐⭐⭐⭐⭐ High | Same scenario inputs produce identical simulation outputs |

---

### Work Item 6: Sector-Specific Compliance Roadmaps

**Title:** Sector-Specific Compliance Roadmaps  
**Priority Score:** 78/100  
**Phase:** 2 (Enhancement)

**Description:**  
Sector-Specific Compliance Roadmaps provide pre-built implementation paths for Food, Healthcare, Retail, and DIY sectors, reducing time-to-value dramatically. Each roadmap includes sector-relevant regulations, prioritised implementation steps, typical timelines, and common pitfalls to avoid. Roadmaps are customisable based on organisation size and current GS1 implementation maturity.

**Expected Value:**  
Consultants can deliver client roadmaps in hours rather than days by starting from sector-specific templates. Organisations new to GS1 compliance gain immediate guidance tailored to their industry context, reducing the learning curve and accelerating implementation. The feature also establishes ISA as a sector-aware platform rather than a generic compliance tool.

**Quality Dimensions Addressed:**

| Quality Dimension | Impact Level | Implementation Requirements |
|-------------------|--------------|----------------------------|
| Analytical Rigour | ⭐⭐⭐⭐ High | Roadmaps based on validated sector-regulation mappings |
| Technical Correctness | ⭐⭐⭐⭐ High | Implementation steps accurate and actionable |
| GS1 Style Compliance | ⭐⭐⭐⭐ High | Roadmap content follows GS1 Style Guide |
| Accessibility | ⭐⭐⭐ Moderate | Roadmap visualisations accessible |
| Reproducibility | ⭐⭐⭐⭐ High | Same sector and profile inputs produce consistent roadmaps |

---

### Work Item 7: Deadline Alerting and Calendar Integration

**Title:** Deadline Alerting and Calendar Integration  
**Priority Score:** 75/100  
**Phase:** 2 (Enhancement)

**Description:**  
Deadline Alerting provides proactive notifications that prevent compliance failures by alerting users before regulatory deadlines. The feature integrates with enterprise calendars (Outlook, Google) to embed ISA into existing workflows, ensuring that compliance milestones appear alongside other business commitments. Users can configure alert timing (e.g., 90 days, 30 days, 7 days before deadline) and notification channels (email, in-app, calendar).

**Expected Value:**  
This feature addresses the critical risk of missed compliance deadlines, which can result in regulatory penalties and reputational damage. By integrating with existing calendar systems, ISA becomes part of users' daily workflows rather than a separate tool to remember. The feature also supports delegation by allowing users to share deadline alerts with team members.

**Quality Dimensions Addressed:**

| Quality Dimension | Impact Level | Implementation Requirements |
|-------------------|--------------|----------------------------|
| Analytical Rigour | ⭐⭐⭐ Moderate | Deadline data sourced from validated regulation records |
| Technical Correctness | ⭐⭐⭐⭐⭐ High | Calendar integration reliable; notifications delivered on time |
| GS1 Style Compliance | ⭐⭐ Low | Alert content follows GS1 terminology |
| Accessibility | ⭐⭐⭐ Moderate | Alerts accessible via multiple channels |
| Reproducibility | ⭐⭐⭐ Moderate | Alert schedules reproducible from user preferences |

---

### Work Item 8: Supplier Data Requirements Generator

**Title:** Supplier Data Requirements Generator  
**Priority Score:** 72/100  
**Phase:** 3 (Advanced)

**Description:**  
The Supplier Data Requirements Generator specifies exactly what data to request from suppliers for EUDR and DPP compliance. The feature generates supplier data collection templates, communication materials, and validation checklists based on the organisation's regulatory obligations and product categories. Templates include GS1 attribute specifications, data format requirements, and submission deadlines.

**Expected Value:**  
This feature addresses the critical supply chain data collection challenge that organisations face when implementing EUDR and DPP compliance. Rather than manually researching supplier requirements, users receive ready-to-send specifications that suppliers can act upon immediately. The feature reduces supplier onboarding time and improves data quality by providing clear, standardised requirements.

**Quality Dimensions Addressed:**

| Quality Dimension | Impact Level | Implementation Requirements |
|-------------------|--------------|----------------------------|
| Analytical Rigour | ⭐⭐⭐⭐⭐ High | Requirements derived from validated regulation-attribute mappings |
| Technical Correctness | ⭐⭐⭐⭐⭐ High | Attribute specifications accurate; data formats correct |
| GS1 Style Compliance | ⭐⭐⭐⭐ High | Supplier communications follow GS1 Style Guide |
| Accessibility | ⭐⭐⭐ Moderate | Generated templates accessible |
| Reproducibility | ⭐⭐⭐⭐⭐ High | Same inputs produce identical supplier requirements |

---

### Work Item 9: Ask ISA Pro Mode

**Title:** Ask ISA Pro Mode  
**Priority Score:** 70/100  
**Phase:** 3 (Advanced)

**Description:**  
Ask ISA Pro Mode enables complex, context-aware advisory conversations with multi-turn dialogue and document upload for company-specific analysis. Users can upload their existing compliance documentation, product data, or supplier information, and Ask ISA Pro provides tailored recommendations based on the uploaded context. The feature supports extended conversations that build on previous exchanges, maintaining context across multiple queries.

**Expected Value:**  
This feature elevates Ask ISA from a Q&A tool to an advisory assistant capable of providing company-specific guidance. Users can receive recommendations that account for their unique circumstances rather than generic best practices. The feature also supports complex analysis scenarios where multiple factors must be considered together.

**Quality Dimensions Addressed:**

| Quality Dimension | Impact Level | Implementation Requirements |
|-------------------|--------------|----------------------------|
| Analytical Rigour | ⭐⭐⭐⭐⭐ High | Recommendations traceable to uploaded documents and ISA knowledge base |
| Technical Correctness | ⭐⭐⭐⭐ High | Document processing accurate; context maintained across turns |
| GS1 Style Compliance | ⭐⭐⭐ Moderate | Responses follow GS1 terminology |
| Accessibility | ⭐⭐⭐ Moderate | Chat interface accessible |
| Reproducibility | ⭐⭐⭐ Moderate | Similar queries with same context produce consistent responses |

---

### Work Item 10: Compliance Evidence Vault

**Title:** Compliance Evidence Vault  
**Priority Score:** 65/100  
**Phase:** 3 (Advanced)

**Description:**  
The Compliance Evidence Vault provides a centralised repository for audit evidence with verification status tracking. Users can upload compliance documentation, link evidence to specific regulatory requirements, and track verification status (pending, verified, expired). The vault maintains an audit trail of all evidence submissions and status changes, supporting regulatory examination preparation.

**Expected Value:**  
This feature is essential for organisations preparing for regulatory audits and demonstrating compliance. The vault reduces audit preparation time by centralising evidence and providing clear traceability from requirements to supporting documentation. The feature also supports ongoing compliance management by tracking evidence expiration and renewal requirements.

**Quality Dimensions Addressed:**

| Quality Dimension | Impact Level | Implementation Requirements |
|-------------------|--------------|----------------------------|
| Analytical Rigour | ⭐⭐⭐⭐ High | Evidence linked to specific regulatory requirements |
| Technical Correctness | ⭐⭐⭐⭐⭐ High | Secure storage; reliable upload/download; audit trail integrity |
| GS1 Style Compliance | ⭐⭐ Low | Vault interface follows GS1 terminology |
| Accessibility | ⭐⭐⭐ Moderate | Vault interface accessible |
| Reproducibility | ⭐⭐⭐⭐ High | Evidence retrieval consistent; audit trail immutable |

---

## Dependencies and Preconditions

### Data Dependencies

The following data assets must be available and validated before implementation begins:

| Data Asset | Required For | Current Status | Validation Required |
|------------|--------------|----------------|---------------------|
| ESRS-GS1 Mappings | Gap Analyzer, Attribute Recommender | 449 mappings in production | Verify completeness for all ESRS datapoints |
| GS1 Attribute Registry | Attribute Recommender, Supplier Generator | GDSN v3.1.32 (4,293 records) | Verify attribute IDs current |
| Regulation Timeline Data | Dashboard, Deadline Alerting, Simulator | Partial coverage | Complete deadline data for all monitored regulations |
| Sector-Regulation Mappings | Sector Roadmaps, Dashboard | Partial coverage | Complete mappings for Food, Healthcare, Retail, DIY |
| User Profile Schema | All features | Basic implementation | Extend to capture GS1 implementation status |

### Schema and Dependency Readiness

| Component | Dependency | Status | Action Required |
|-----------|------------|--------|-----------------|
| User Profile Table | Extended fields for GS1 implementations | Partial | Add fields: currentGS1Implementations, sector, geography, organisationSize |
| Gap Analysis Table | Store gap analysis results | Not implemented | Create table with fields: userId, regulationId, gapType, severity, confidence, remediationSteps |
| Attribute Recommendations Table | Store recommendation history | Not implemented | Create table with fields: regulationId, attributeId, priority, regulatoryBasis |
| Dashboard Preferences Table | Store user dashboard configuration | Not implemented | Create table with fields: userId, widgetLayout, alertPreferences |
| Evidence Vault Tables | Store evidence metadata and links | Not implemented | Create tables: evidenceItems, evidenceRequirementLinks, evidenceAuditLog |

### Integration Points Between Improvements

The following diagram illustrates the dependency relationships between work items:

```
Phase 1 (Foundation)
├── Compliance Gap Analyzer ──────────────────┐
│   └── Requires: ESRS-GS1 Mappings           │
│   └── Produces: Gap Analysis Results        │
├── GS1 Attribute Recommender ────────────────┤
│   └── Requires: GS1 Attribute Registry      │
│   └── Produces: Attribute Recommendations   │
└── Advisory Report PDF Export                │
    └── Requires: Advisory Report Data        │
    └── Produces: PDF Documents               │
                                              │
Phase 2 (Enhancement)                         │
├── Personalized Dashboard ◄──────────────────┤
│   └── Requires: Gap Analyzer, User Profile  │
├── Multi-Regulation Simulator ◄──────────────┤
│   └── Requires: Gap Analyzer, Recommender   │
├── Sector-Specific Roadmaps ◄────────────────┘
│   └── Requires: Gap Analyzer, Sector Data
└── Deadline Alerting
    └── Requires: Deadline Data, User Profile

Phase 3 (Advanced)
├── Supplier Data Generator
│   └── Requires: Attribute Recommender
├── Ask ISA Pro Mode
│   └── Requires: Ask ISA Core, Document Processing
└── Compliance Evidence Vault
    └── Requires: User Profile, Security Infrastructure
```

---

## Sequence and Prioritisation Logic

### Phase Breakdown

**Phase 1: Foundation (Weeks 1-6)**

Phase 1 establishes the core capabilities that all subsequent features depend upon. The Compliance Gap Analyzer and GS1 Attribute Recommender form the analytical foundation, while Advisory Report PDF Export creates the first tangible deliverable that users can share externally.

| Week | Work Item | Milestone |
|------|-----------|-----------|
| 1-2 | Gap Analyzer: Schema and data layer | Database tables created; ESRS-GS1 mappings validated |
| 2-3 | Gap Analyzer: Analysis engine | Gap identification algorithm implemented and tested |
| 3-4 | Attribute Recommender: Core logic | Attribute recommendation engine implemented |
| 4-5 | Gap Analyzer + Recommender: UI | User-facing interfaces complete |
| 5-6 | PDF Export: Template and generation | PDF export functional; GS1 style compliance verified |

**Phase 2: Enhancement (Weeks 7-14)**

Phase 2 builds upon the foundation to create ongoing engagement through personalised experiences and proactive notifications. Features in this phase can be developed in parallel once Phase 1 is stable.

| Week | Work Item | Milestone |
|------|-----------|-----------|
| 7-8 | Dashboard: Core framework | Dashboard layout and widget system implemented |
| 8-9 | Dashboard: Gap integration | Gap analysis results displayed in dashboard |
| 9-10 | Simulator: Scenario engine | Multi-regulation simulation logic implemented |
| 10-11 | Sector Roadmaps: Templates | Food and Healthcare roadmaps complete |
| 11-12 | Deadline Alerting: Core | Alert scheduling and delivery implemented |
| 12-14 | Integration and polish | All Phase 2 features integrated and tested |

**Phase 3: Advanced (Weeks 15-24)**

Phase 3 introduces advanced capabilities that extend ISA's value proposition to supply chain management and enterprise compliance workflows.

| Week | Work Item | Milestone |
|------|-----------|-----------|
| 15-17 | Supplier Generator: Core | Template generation logic implemented |
| 17-19 | Ask ISA Pro: Document processing | Document upload and context extraction working |
| 19-21 | Ask ISA Pro: Multi-turn dialogue | Context maintained across conversation turns |
| 21-23 | Evidence Vault: Storage and linking | Evidence upload and requirement linking functional |
| 23-24 | Integration and validation | Full regression testing; production deployment |

### Order Rationale

The sequencing follows three principles:

1. **Foundation First:** Gap Analyzer and Attribute Recommender must be implemented first because all Phase 2 features depend on their outputs. The Dashboard cannot display compliance status without gap analysis results; the Simulator cannot model regulation impacts without attribute mappings.

2. **Quick Wins Early:** PDF Export is included in Phase 1 despite being lower priority because it provides immediate tangible value with low implementation risk. Users can share ISA outputs externally within weeks of development starting.

3. **Parallel Streams in Phase 2:** Once Phase 1 is stable, Dashboard, Simulator, Roadmaps, and Alerting can be developed in parallel by different team members. These features share dependencies on Phase 1 outputs but do not depend on each other.

### Parallelisable Streams

| Stream | Work Items | Team Composition |
|--------|------------|------------------|
| **Stream A: Core Analysis** | Gap Analyzer, Attribute Recommender | 2 backend engineers, 1 frontend engineer |
| **Stream B: Reporting** | PDF Export, Dashboard visualisations | 1 frontend engineer, 1 designer |
| **Stream C: Simulation** | Multi-Regulation Simulator, Sector Roadmaps | 1 backend engineer, 1 domain expert |
| **Stream D: Notifications** | Deadline Alerting, Calendar Integration | 1 full-stack engineer |
| **Stream E: Advanced** | Supplier Generator, Ask ISA Pro, Evidence Vault | 2 backend engineers, 1 frontend engineer |

---

## Acceptance and Quality Criteria

### Work Item 1: Compliance Gap Analyzer

**Functional Acceptance Criteria:**

| ID | Criterion | Pass/Fail Check |
|----|-----------|-----------------|
| GA-01 | User can input organisation profile (sector, size, geography, current GS1 implementations) | Profile form validates and saves successfully |
| GA-02 | System identifies applicable regulations based on profile | Regulation list matches expected regulations for profile |
| GA-03 | System compares current GS1 implementations against required capabilities | Comparison algorithm produces correct gap identification |
| GA-04 | Gap list is generated with severity classification (critical, moderate, low-priority) | All gaps have valid severity classification |
| GA-05 | Each gap includes remediation steps with estimated effort | Remediation steps present and effort estimates reasonable |
| GA-06 | Gap analysis can be exported as PDF or JSON | Export produces valid PDF/JSON files |

**Quality Checkpoints:**

| Checkpoint | Target | Measurement Method |
|------------|--------|-------------------|
| Confidence score accuracy | >0.7 for "confirmed" gaps | Compare against expert-validated gap list |
| Data freshness | Mappings <90 days old | Check mapping timestamps |
| Traceability | 100% of gaps traceable to ESRS datapoints | Audit trail verification |
| Reproducibility | Identical results from same inputs | Regression test with frozen inputs |
| Performance | Gap analysis completes in <5 seconds | Load testing |

**Artifact Evidence Required:**

- [ ] Screenshot of gap analysis results page
- [ ] Exported PDF report sample
- [ ] Exported JSON file sample
- [ ] Vitest test suite with 100% procedure coverage
- [ ] Performance test results showing <5 second response time

---

### Work Item 2: GS1 Attribute Recommender

**Functional Acceptance Criteria:**

| ID | Criterion | Pass/Fail Check |
|----|-----------|-----------------|
| AR-01 | User can select one or more regulations | Multi-select interface functional |
| AR-02 | System returns list of GS1 attributes required for compliance | Attribute list populated for selected regulations |
| AR-03 | Each attribute includes: attribute ID, name, description, data type, regulatory basis | All fields present for each attribute |
| AR-04 | Attributes grouped by GS1 standard (GDSN, EPCIS, Digital Link) | Grouping correct and consistent |
| AR-05 | Implementation priority indicated (required vs. recommended) | Priority classification present |
| AR-06 | Export to CSV/JSON for integration with data management systems | Export produces valid CSV/JSON files |

**Quality Checkpoints:**

| Checkpoint | Target | Measurement Method |
|------------|--------|-------------------|
| Attribute ID accuracy | 100% valid GS1 attribute IDs | Cross-reference with GDSN registry |
| Coverage completeness | >90% of regulation requirements mapped | Coverage analysis against regulation text |
| Regulatory basis accuracy | 100% traceable to regulation clauses | Audit trail verification |
| GDSN version currency | Aligned with latest GDSN version | Version check against GS1 registry |

**Artifact Evidence Required:**

- [ ] Screenshot of attribute recommendation results
- [ ] Exported CSV file sample
- [ ] Vitest test suite with 100% procedure coverage
- [ ] Attribute accuracy validation report

---

### Work Item 3: Advisory Report PDF Export

**Functional Acceptance Criteria:**

| ID | Criterion | Pass/Fail Check |
|----|-----------|-----------------|
| PE-01 | User can generate PDF from gap analysis results | PDF generation completes successfully |
| PE-02 | PDF includes executive summary | Executive summary section present |
| PE-03 | PDF includes gap analysis findings with severity | Gap findings formatted correctly |
| PE-04 | PDF includes prioritised recommendations | Recommendations section present |
| PE-05 | PDF includes methodology documentation | Methodology appendix present |
| PE-06 | PDF follows GS1 Style Guide Release 5.6 | Style compliance checklist passes |

**Quality Checkpoints:**

| Checkpoint | Target | Measurement Method |
|------------|--------|-------------------|
| GS1 Style compliance | 100% critical checks pass | Style checklist verification |
| Accessibility | WCAG AA compliance | Accessibility audit |
| Visual consistency | Identical rendering across browsers | Cross-browser testing |
| File size | <5MB for typical report | File size measurement |

**Artifact Evidence Required:**

- [ ] Sample PDF report (full content)
- [ ] GS1 Style compliance checklist (completed)
- [ ] Accessibility audit report
- [ ] Cross-browser rendering screenshots

---

### Work Item 4: Personalized Compliance Dashboard

**Functional Acceptance Criteria:**

| ID | Criterion | Pass/Fail Check |
|----|-----------|-----------------|
| PD-01 | Dashboard displays user-specific compliance status | Status reflects user's gap analysis |
| PD-02 | Dashboard shows upcoming deadlines | Deadlines displayed with countdown |
| PD-03 | Dashboard shows progress on remediation tasks | Progress indicators functional |
| PD-04 | Dashboard supports drill-down to specific gaps | Navigation to gap details works |
| PD-05 | Dashboard layout is customisable | Widget arrangement persists |

**Quality Checkpoints:**

| Checkpoint | Target | Measurement Method |
|------------|--------|-------------------|
| Data freshness | Real-time synchronisation | Verify updates appear within 5 seconds |
| Keyboard accessibility | Full navigation via keyboard | Accessibility testing |
| Mobile responsiveness | Functional on tablet/mobile | Responsive design testing |

**Artifact Evidence Required:**

- [ ] Dashboard screenshot (desktop view)
- [ ] Dashboard screenshot (mobile view)
- [ ] Vitest test suite for dashboard components
- [ ] Accessibility audit report

---

### Work Item 5: Multi-Regulation Impact Simulator

**Functional Acceptance Criteria:**

| ID | Criterion | Pass/Fail Check |
|----|-----------|-----------------|
| MS-01 | User can select multiple regulations for simulation | Multi-select interface functional |
| MS-02 | Simulator shows combined impact of selected regulations | Impact calculation correct |
| MS-03 | Simulator identifies synergies across regulations | Synergy detection functional |
| MS-04 | Simulator supports time-based projections | Timeline visualisation accurate |
| MS-05 | Simulation results can be exported | Export produces valid files |

**Quality Checkpoints:**

| Checkpoint | Target | Measurement Method |
|------------|--------|-------------------|
| Calculation accuracy | No double-counting of requirements | Manual verification against regulation text |
| Timeline accuracy | Deadlines match official sources | Cross-reference with regulation documents |
| Performance | Simulation completes in <10 seconds | Load testing |

**Artifact Evidence Required:**

- [ ] Simulation results screenshot
- [ ] Timeline visualisation screenshot
- [ ] Vitest test suite for simulation logic
- [ ] Accuracy validation report

---

### Work Items 6-10: Summary Acceptance Criteria

| Work Item | Key Acceptance Criteria | Quality Target |
|-----------|------------------------|----------------|
| Sector Roadmaps | Pre-built roadmaps for 4 sectors; customisable by org size | 100% GS1 Style compliance |
| Deadline Alerting | Configurable alerts; calendar integration working | 100% alert delivery reliability |
| Supplier Generator | Template generation for EUDR/DPP; export functional | 100% attribute accuracy |
| Ask ISA Pro | Document upload working; multi-turn context maintained | >0.8 response relevance score |
| Evidence Vault | Secure upload; requirement linking; audit trail | 100% audit trail integrity |

---

## Demo Scenarios

### Demo Scenario 1: Compliance Gap Analyzer

**Narrative (2-3 minutes):**

> "Meet Sarah, a Sustainability Director at a mid-sized food manufacturer in the Netherlands. Sarah needs to understand her company's CSRD compliance gaps before the January 2026 reporting deadline.
>
> Sarah logs into ISA and navigates to the Compliance Gap Analyzer. She enters her organisation profile: Food Manufacturing sector, 500 employees, Netherlands headquarters, currently using GDSN for product data but no EPCIS implementation.
>
> Within seconds, ISA identifies 12 compliance gaps across ESRS E1 (Climate), E2 (Pollution), and S1 (Workforce). The most critical gap is 'Scope 3 emissions data collection' - ISA shows this requires EPCIS implementation for supply chain traceability.
>
> Sarah clicks on the gap to see remediation steps: (1) Implement EPCIS for key suppliers, (2) Configure GS1 Digital Link for product carbon footprints, (3) Establish data collection processes for Scope 3 categories.
>
> Sarah exports the gap analysis as a PDF to share with her CFO before the next board meeting. The report includes an executive summary, prioritised gap list, and implementation roadmap."

**Example Flow:**

| Step | User Action | System Behaviour | Output |
|------|-------------|------------------|--------|
| 1 | Navigate to Gap Analyzer | Display profile input form | Profile form visible |
| 2 | Enter organisation details | Validate and save profile | Profile saved confirmation |
| 3 | Click "Analyse Gaps" | Run gap analysis algorithm | Loading indicator |
| 4 | View results | Display gap list with severity | 12 gaps identified |
| 5 | Click on critical gap | Show gap details and remediation | Remediation steps displayed |
| 6 | Click "Export PDF" | Generate PDF report | PDF download initiated |

---

### Demo Scenario 2: GS1 Attribute Recommender

**Narrative (2-3 minutes):**

> "Tom is a GS1 consultant helping a healthcare client prepare for DPP compliance. The client needs to know exactly which GDSN attributes to populate for their medical device products.
>
> Tom opens ISA and selects the GS1 Attribute Recommender. He chooses 'ESPR - Digital Product Passport' and 'MDR - Medical Device Regulation' from the regulation list.
>
> ISA returns a comprehensive list of 47 required GS1 attributes, grouped by standard. For GDSN, Tom sees attributes like 'productCarbonFootprint', 'recyclablePackagingPercentage', and 'hazardousSubstancePresence'. Each attribute shows its regulatory basis - for example, 'productCarbonFootprint' is required by ESPR Article 7(2)(a).
>
> Tom exports the attribute list as CSV and sends it to his client's IT team for integration with their PIM system. The client now has a clear specification of exactly what data to capture."

**Example Flow:**

| Step | User Action | System Behaviour | Output |
|------|-------------|------------------|--------|
| 1 | Navigate to Attribute Recommender | Display regulation selector | Regulation list visible |
| 2 | Select ESPR and MDR | Highlight selected regulations | 2 regulations selected |
| 3 | Click "Get Recommendations" | Query attribute mappings | Loading indicator |
| 4 | View results | Display attribute list grouped by standard | 47 attributes shown |
| 5 | Expand GDSN group | Show GDSN-specific attributes | 32 GDSN attributes visible |
| 6 | Click "Export CSV" | Generate CSV file | CSV download initiated |

---

### Demo Scenario 3: Personalized Dashboard

**Narrative (2-3 minutes):**

> "Maria is a Compliance Officer at a retail chain. She uses ISA daily to monitor her company's compliance status across multiple regulations.
>
> Maria logs into ISA and sees her personalised dashboard. The compliance score widget shows 72% overall compliance, with CSRD at 85% and EUDR at 45%. A red alert indicates that the EUDR due diligence deadline is in 30 days.
>
> Maria clicks on the EUDR widget to drill down. She sees 5 open gaps, with 'Supplier geolocation data collection' marked as critical. The progress bar shows 2 of 5 gaps have been addressed since last month.
>
> Maria adds a reminder to follow up with the procurement team about supplier data collection. The reminder appears in her Outlook calendar, linked back to the specific gap in ISA."

**Example Flow:**

| Step | User Action | System Behaviour | Output |
|------|-------------|------------------|--------|
| 1 | Log into ISA | Display personalised dashboard | Dashboard with user-specific data |
| 2 | View compliance score | Show overall and per-regulation scores | 72% overall, CSRD 85%, EUDR 45% |
| 3 | Click EUDR widget | Drill down to EUDR gaps | 5 gaps displayed |
| 4 | View gap progress | Show progress indicators | 2/5 gaps addressed |
| 5 | Click "Add Reminder" | Open reminder configuration | Reminder form visible |
| 6 | Save reminder | Sync with Outlook calendar | Calendar event created |

---

### Demo Scenario 4: Multi-Regulation Impact Simulator

**Narrative (2-3 minutes):**

> "Henrik is a Strategy Director planning his company's compliance investments for the next 3 years. He needs to understand the combined impact of CSRD, EUDR, and DPP regulations.
>
> Henrik opens the Multi-Regulation Impact Simulator and selects all three regulations. The simulator shows a timeline view with key milestones: CSRD reporting starts January 2026, EUDR due diligence required by December 2025, DPP for batteries by February 2027.
>
> The 'Synergies' panel highlights that EPCIS implementation addresses requirements across all three regulations. Henrik sees that investing in EPCIS now would reduce total compliance effort by 25%.
>
> Henrik exports the simulation as a board presentation, showing the investment timeline and expected ROI from consolidated compliance efforts."

**Example Flow:**

| Step | User Action | System Behaviour | Output |
|------|-------------|------------------|--------|
| 1 | Navigate to Simulator | Display regulation selector | Regulation list visible |
| 2 | Select CSRD, EUDR, DPP | Highlight selected regulations | 3 regulations selected |
| 3 | Click "Simulate" | Calculate combined impact | Loading indicator |
| 4 | View timeline | Display milestone timeline | Key dates visualised |
| 5 | View synergies | Show synergy analysis | EPCIS synergy highlighted |
| 6 | Click "Export Presentation" | Generate presentation file | Download initiated |

---

## Risk and Mitigation Plans

### Work Item 1: Compliance Gap Analyzer

| Risk | Likelihood | Impact | Mitigation Strategy | Trigger | Rollback Condition |
|------|------------|--------|---------------------|---------|-------------------|
| **Incomplete user profile data** | High | Medium | Provide progressive disclosure—show partial gaps with prompts to complete profile; implement smart defaults based on sector | >30% of users abandon profile completion | Revert to simplified profile with fewer required fields |
| **Outdated regulation-standard mappings** | Medium | High | Display data freshness indicators; flag gaps based on mappings older than 90 days; implement automated mapping update pipeline | Mappings >90 days old | Pause gap analysis until mappings updated |
| **Overconfidence in gap identification** | Medium | High | Show confidence scores with methodology explanation; distinguish "confirmed gaps" from "potential gaps"; implement user feedback loop | User reports >10% false positive rate | Add manual review step for low-confidence gaps |

### Work Item 2: GS1 Attribute Recommender

| Risk | Likelihood | Impact | Mitigation Strategy | Trigger | Rollback Condition |
|------|------------|--------|---------------------|---------|-------------------|
| **GS1 standard version drift** | Medium | High | Track GDSN version; alert when recommendations based on outdated standard version; implement version-aware recommendation logic | GDSN version update released | Pause recommendations until mappings updated |
| **Incomplete attribute coverage** | Medium | Medium | Show coverage percentage; flag regulations with <50% attribute mapping; prioritise mapping completion for high-impact regulations | Coverage <50% for any regulation | Display warning to users; prioritise mapping work |
| **User implementation confusion** | Medium | Medium | Provide implementation priority order; link to GS1 documentation; add contextual help for complex attributes | User support tickets >5 per week | Add guided implementation wizard |

### Work Item 3: Advisory Report PDF Export

| Risk | Likelihood | Impact | Mitigation Strategy | Trigger | Rollback Condition |
|------|------------|--------|---------------------|---------|-------------------|
| **PDF rendering inconsistencies** | Medium | Medium | Use server-side PDF generation; test across browsers; implement fallback to HTML export | Rendering issues reported by >5% of users | Offer HTML download as alternative |
| **GS1 Style non-compliance** | Low | High | Implement automated style checking; manual review for first 10 reports; create style-compliant templates | Style violations found in audit | Pause PDF export until templates corrected |
| **Large file sizes** | Low | Medium | Implement image compression; paginate large reports; offer summary-only export option | File sizes >10MB | Implement progressive loading |

### Work Item 4: Personalized Dashboard

| Risk | Likelihood | Impact | Mitigation Strategy | Trigger | Rollback Condition |
|------|------------|--------|---------------------|---------|-------------------|
| **Performance degradation with many users** | Medium | High | Implement caching; use incremental updates; optimise database queries | Response time >3 seconds | Scale infrastructure; implement query optimisation |
| **Data synchronisation delays** | Medium | Medium | Use real-time subscriptions where possible; show last-updated timestamps; implement retry logic | Sync delay >5 minutes | Display warning; offer manual refresh |
| **Widget configuration complexity** | Low | Medium | Provide sensible defaults; limit customisation options initially; add guided setup wizard | >20% of users don't customise | Simplify configuration interface |

### Work Item 5: Multi-Regulation Impact Simulator

| Risk | Likelihood | Impact | Mitigation Strategy | Trigger | Rollback Condition |
|------|------------|--------|---------------------|---------|-------------------|
| **Calculation errors in combined impact** | Medium | High | Implement comprehensive unit tests; validate against expert-calculated scenarios; add sanity checks | Calculation errors found in testing | Pause simulator until algorithm corrected |
| **Timeline data inaccuracy** | Medium | High | Source deadlines from official regulation documents; implement automated deadline monitoring; display data sources | Deadline discrepancy reported | Correct timeline data; add source citations |
| **Simulation performance issues** | Low | Medium | Optimise algorithm for common scenarios; implement caching for repeated simulations; add progress indicators | Simulation time >30 seconds | Limit number of regulations per simulation |

### Work Items 6-10: Summary Risk Matrix

| Work Item | Top Risk | Mitigation | Trigger |
|-----------|----------|------------|---------|
| Sector Roadmaps | Sector data incompleteness | Start with 2 sectors; expand based on demand | <80% coverage for any sector |
| Deadline Alerting | Alert delivery failures | Multi-channel delivery; retry logic; delivery confirmation | >1% alert delivery failure |
| Supplier Generator | Template accuracy issues | Expert review of templates; user feedback loop | >5% template error reports |
| Ask ISA Pro | Context loss in multi-turn | Implement robust context management; limit conversation length | Context errors in >10% of conversations |
| Evidence Vault | Security vulnerabilities | Security audit before launch; encryption at rest; access logging | Any security incident |

---

## Execution Roadmap Table

| Phase | Work Items | Dependencies | Acceptance Criteria | Validation Approach | Demo Scenario |
|-------|------------|--------------|---------------------|---------------------|---------------|
| **Phase 1: Foundation** | Gap Analyzer, Attribute Recommender, PDF Export | ESRS-GS1 mappings validated; GS1 attribute registry current | GA-01 to GA-06; AR-01 to AR-06; PE-01 to PE-06 | Vitest test suite; manual validation against expert analysis; style compliance checklist | Scenarios 1, 2 |
| **Phase 2: Enhancement** | Dashboard, Simulator, Sector Roadmaps, Deadline Alerting | Phase 1 features stable; deadline data complete; sector mappings complete | PD-01 to PD-05; MS-01 to MS-05; roadmap coverage >80%; alert delivery >99% | Integration testing; user acceptance testing; performance testing | Scenarios 3, 4 |
| **Phase 3: Advanced** | Supplier Generator, Ask ISA Pro, Evidence Vault | Attribute Recommender stable; document processing infrastructure; security audit complete | Template accuracy >95%; context retention >90%; audit trail integrity 100% | Security audit; user study; regression testing | Extended demos |

---

## Milestone Checkpoints

### Phase 1 Milestones

| Milestone | Target Date | Exit Criteria | Validation Method |
|-----------|-------------|---------------|-------------------|
| **M1.1: Schema Complete** | Week 2 | All database tables created; migrations applied | Database inspection; TypeScript compilation |
| **M1.2: Gap Analyzer MVP** | Week 4 | Gap identification functional; basic UI complete | Vitest tests pass; manual testing |
| **M1.3: Attribute Recommender MVP** | Week 5 | Attribute recommendations functional; export working | Vitest tests pass; accuracy validation |
| **M1.4: PDF Export Complete** | Week 6 | PDF generation functional; GS1 style compliant | Style checklist; cross-browser testing |
| **M1.5: Phase 1 Integration Test** | Week 6 | All Phase 1 features integrated and tested | Full regression suite passes |
| **M1.6: User Study Script Validated** | Week 6 | User study protocol ready; test users identified | Protocol review; user recruitment confirmed |

### Phase 2 Milestones

| Milestone | Target Date | Exit Criteria | Validation Method |
|-----------|-------------|---------------|-------------------|
| **M2.1: Dashboard Framework** | Week 8 | Widget system functional; layout customisable | Component testing; accessibility audit |
| **M2.2: Simulator MVP** | Week 10 | Multi-regulation simulation functional | Calculation validation; performance testing |
| **M2.3: Sector Roadmaps (2 sectors)** | Week 11 | Food and Healthcare roadmaps complete | Expert review; user feedback |
| **M2.4: Deadline Alerting MVP** | Week 12 | Alert scheduling functional; email delivery working | Delivery testing; calendar integration testing |
| **M2.5: Phase 2 Integration Test** | Week 14 | All Phase 2 features integrated and tested | Full regression suite passes |

### Phase 3 Milestones

| Milestone | Target Date | Exit Criteria | Validation Method |
|-----------|-------------|---------------|-------------------|
| **M3.1: Supplier Generator MVP** | Week 17 | Template generation functional; export working | Template accuracy validation |
| **M3.2: Ask ISA Pro Document Processing** | Week 19 | Document upload functional; context extraction working | Processing accuracy testing |
| **M3.3: Ask ISA Pro Multi-turn** | Week 21 | Context maintained across turns | Conversation testing |
| **M3.4: Evidence Vault MVP** | Week 23 | Upload, linking, and audit trail functional | Security audit; integrity testing |
| **M3.5: Production Deployment** | Week 24 | All features deployed; monitoring active | Production validation; load testing |

---

## Exit Gates

### Phase 1 Exit Gate

Before advancing to Phase 2, the following criteria must be met:

| Category | Criterion | Verification Method |
|----------|-----------|---------------------|
| **Functional** | All Phase 1 acceptance criteria (GA-01 to GA-06, AR-01 to AR-06, PE-01 to PE-06) pass | Acceptance test execution |
| **Quality** | Vitest test coverage >90% for Phase 1 procedures | Coverage report |
| **Performance** | Gap analysis completes in <5 seconds; PDF generation <10 seconds | Performance test results |
| **Style** | All PDF exports pass GS1 Style compliance checklist | Style audit |
| **Accessibility** | PDF exports meet WCAG AA | Accessibility audit |
| **User Validation** | User study script validated with 3+ test users | User study report |

### Phase 2 Exit Gate

Before advancing to Phase 3, the following criteria must be met:

| Category | Criterion | Verification Method |
|----------|-----------|---------------------|
| **Functional** | All Phase 2 acceptance criteria pass | Acceptance test execution |
| **Integration** | Dashboard displays accurate data from Gap Analyzer | Integration testing |
| **Performance** | Dashboard loads in <3 seconds; Simulator completes in <10 seconds | Performance test results |
| **Reliability** | Alert delivery success rate >99% | Delivery monitoring |
| **User Adoption** | >50% of test users return to Dashboard within 7 days | Analytics |

### Phase 3 Exit Gate

Before production deployment, the following criteria must be met:

| Category | Criterion | Verification Method |
|----------|-----------|---------------------|
| **Functional** | All Phase 3 acceptance criteria pass | Acceptance test execution |
| **Security** | Evidence Vault passes security audit | Security audit report |
| **Performance** | All features meet performance targets under load | Load test results |
| **Regression** | Full regression suite passes | Regression test execution |
| **Documentation** | All features documented in user guide | Documentation review |

---

## Data, Credential, and Tooling Needs

### Data Requirements

| Data Asset | Source | Format | Refresh Frequency | Owner |
|------------|--------|--------|-------------------|-------|
| ESRS-GS1 Mappings | ISA canonical data | JSON | Quarterly | ISA Data Team |
| GS1 Attribute Registry | GS1 Global Registry | JSON | Monthly | GS1 Global |
| Regulation Timeline Data | EUR-Lex, official sources | JSON | As regulations update | ISA Data Team |
| Sector-Regulation Mappings | Expert curation | JSON | Quarterly | ISA Domain Experts |
| User Profile Data | User input | Database | Real-time | Users |

### Credential Requirements

| Credential | Purpose | Storage | Rotation |
|------------|---------|---------|----------|
| Database connection | Gap analysis storage | Environment variable | Quarterly |
| Email service API key | Deadline alert delivery | Secrets manager | Annually |
| Calendar API credentials | Outlook/Google integration | OAuth tokens | Per user session |
| PDF generation service | Advisory report export | Environment variable | Annually |
| S3 storage credentials | Evidence vault storage | Environment variable | Quarterly |

### Tooling Requirements

| Tool | Purpose | Status | Action Required |
|------|---------|--------|-----------------|
| Vitest | Unit and integration testing | Installed | None |
| PDF generation library | Advisory report export | Not installed | Evaluate react-pdf vs. puppeteer |
| Calendar integration SDK | Outlook/Google calendar | Not installed | Evaluate Microsoft Graph API, Google Calendar API |
| Document processing library | Ask ISA Pro document upload | Not installed | Evaluate pdf-parse, mammoth |
| S3 SDK | Evidence vault storage | Installed | None |

---

## References

[1] Workiva CSRD Compliance Platform. https://www.workiva.com/solutions/csrd-compliance

[2] Datamaran ESG Regulatory Intelligence. https://www.datamaran.com/

[3] Compliance.ai Regulatory Change Management. https://www.compliance.ai/

[4] GS1 Style Guide Release 5.6. Internal reference: `/docs/references/gs1/GS1-Style-Guide.pdf`

[5] ISA Quality Bar Document. Internal reference: `/docs/QUALITY_BAR.md`

[6] ISA Strategic Discovery Report. Internal reference: `/docs/ISA_STRATEGIC_DISCOVERY_REPORT.md`

[7] ISA Strategic Evaluation and Quality Mapping Report. Internal reference: `/docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md`

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 3 January 2026 | Initial implementation-ready execution plan | Manus AI |

---

**Document Status:** APPROVED FOR EXECUTION  
**Next Review:** After Phase 1 completion or upon significant scope change
