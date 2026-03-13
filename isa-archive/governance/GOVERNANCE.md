# ISA Governance Overview

**Last Updated:** 2025-12-17  
**Status:** Phase 9 Consolidation Complete  
**Current Mode:** Lane C (User-Decision Mode)

---

## Purpose

This document provides a high-level overview of ISA's governance framework. For the complete authoritative governance specification, see:

📄 **[ISA_GOVERNANCE.md](./ISA_GOVERNANCE.md)**

---

## Governance Philosophy

ISA operates under a strict governance framework that prioritizes **data integrity**, **citation accuracy**, and **user authority** over development velocity or convenience. The framework is designed to prevent unilateral AI decisions that could compromise data quality, introduce bias, or violate user trust.

---

## Three-Lane Governance Model

### Lane A: Autonomous Execution (NOT ACTIVE)
**Description:** AI agent operates independently within pre-approved boundaries.  
**Status:** Not active for ISA. Reserved for routine maintenance tasks only.

### Lane B: Collaborative Mode (NOT ACTIVE)
**Description:** AI agent proposes changes, user provides lightweight approval.  
**Status:** Not active for ISA. May be activated for future feature development.

### Lane C: User-Decision Mode (ACTIVE)
**Description:** AI agent MUST escalate all potentially impactful decisions to user.  
**Status:** **ACTIVE** - All ISA development operates under Lane C constraints.

**Lane C Triggers (require escalation):**
- Schema changes affecting data integrity
- New data sources or ingestion pipelines
- Changes to AI prompts or mapping logic
- Advisory report generation or publication
- Governance framework modifications
- External integrations or API exposure
- Deletion of datasets or documentation
- Changes to citation logic or source attribution

---

## Red-Line Principles (Inviolable)

These principles apply across all lanes and cannot be violated under any circumstances:

1. **Data Integrity:** All datasets include source, version, format, last_verified_date
2. **Security:** No secrets committed, no unauthorized data access
3. **Transparency:** All decisions documented with rationale and alternatives
4. **Reversibility:** All changes tracked in version control with rollback capability
5. **User Authority:** Silence is NOT consent; explicit approval required for Lane C triggers

---

## Mandatory Escalation Format

When a Lane C trigger is detected, the AI agent MUST use this format:

```
🚨 LANE C ESCALATION REQUIRED

**Trigger:** [Schema change / New data source / AI prompt modification / etc.]

**Proposed Action:**
[Clear description of what the agent wants to do]

**Rationale:**
[Why this action is necessary or beneficial]

**Impact Assessment:**
- Data integrity: [LOW / MEDIUM / HIGH]
- User trust: [LOW / MEDIUM / HIGH]
- Reversibility: [EASY / MODERATE / DIFFICULT]

**Alternatives Considered:**
1. [Alternative 1]
2. [Alternative 2]

**Recommendation:**
[Agent's recommendation with reasoning]

**Decision Required:**
- [ ] Approve as proposed
- [ ] Approve with modifications (specify below)
- [ ] Reject (provide reason below)
- [ ] Defer (schedule for later review)

**User Response:**
[User fills this in]
```

---

## Governance Self-Checks

Before and after any development work, the AI agent MUST perform a governance self-check:

**Pre-Work Self-Check:**
1. Have I read and understood ISA_GOVERNANCE.md?
2. Does this work trigger any Lane C escalations?
3. Have I prepared escalation requests for all triggers?
4. Am I operating within approved boundaries?

**Post-Work Self-Check:**
1. Did I follow the approved plan without deviation?
2. Did I document all decisions and rationale?
3. Did I escalate all Lane C triggers?
4. Are all changes reversible and tracked in version control?
5. Did I update relevant documentation?

---

## Current Governance Status (2025-12-17)

**Active Mode:** Lane C (User-Decision Mode)

**Recent Governance Decisions:**
1. **Decision 1 (2025-12-15):** Dataset registry locked at v1.4.0 - no new datasets without escalation
2. **Decision 2 (2025-12-16):** News pipeline AI prompts frozen - no modifications without escalation
3. **Decision 3 (2025-12-17):** GitHub integration approved - sync cadence minimum once per day
4. **Decision 4 (2025-12-17):** Advisory report publication deferred - Lane C review required

**Pending Governance Decisions:**
- GitHub sync timing and automation
- Lane C → Lane B transition readiness
- Advisory report publication readiness
- Licensing and open-source strategy

---

## Governance Violations

**Zero tolerance policy:** Any governance violation triggers immediate work stoppage and escalation.

**Violation Categories:**
- **Critical:** Data integrity compromise, unauthorized data access, secret exposure
- **Major:** Lane C trigger without escalation, red-line principle violation
- **Minor:** Documentation gap, missing governance self-check

**Response Protocol:**
1. Stop all work immediately
2. Document the violation
3. Assess impact and reversibility
4. Escalate to user with remediation plan
5. Implement approved remediation
6. Update governance documentation to prevent recurrence

---

## Documentation Hierarchy

**Authoritative Governance Document:**  
📄 **[ISA_GOVERNANCE.md](./ISA_GOVERNANCE.md)** - Complete governance specification

**Supporting Governance Documents:**
- `docs/governance/TEMPORAL_GUARDRAILS.md` - Date integrity rules
- `docs/governance/DATE_INTEGRITY_AUDIT.md` - Date validation results
- `docs/governance/LLM_STRUCTURAL_RISK_ASSESSMENT.md` - AI risk analysis
- `docs/GOVERNANCE_PHASE_2_3_REPORT.md` - Phase 2 governance decisions
- `docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` - Latest governance audit

---

## Contact & Escalation

**Governance Steward:** ISA Executive Steward  
**Development Agent:** Manus AI  
**Project Owner:** GS1 Netherlands

**For Governance Questions:**
1. Read [ISA_GOVERNANCE.md](./ISA_GOVERNANCE.md) first
2. Check governance self-check results
3. Review recent governance decisions
4. Escalate using mandatory escalation format

**Repository:** https://github.com/GS1-ISA/isa  
**Issues:** https://github.com/GS1-ISA/isa/issues

---

**Phase 9 Status:** Consolidation Complete  
**Governance Mode:** Lane C (User-Decision Mode)  
**Last Updated:** 2025-12-17

For complete governance specification, see [ISA_GOVERNANCE.md](./ISA_GOVERNANCE.md).
