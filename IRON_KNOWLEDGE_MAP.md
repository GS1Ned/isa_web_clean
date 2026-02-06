# IRON Protocol: Knowledge Map

**Version:** 1.0.0  
**Status:** ✅ Active  
**Last Updated:** 2026-01-27

---

## 1. Purpose

This document is the **canonical index of all ISA knowledge**. It classifies every document by authority level and purpose, ensuring that no important knowledge lives "outside" IRON.

---

## 2. Authority Classification

All documents are classified according to the IRON Value Hierarchy:

| Level | Authority | Description |
|---|---|---|
| **L2** | Governance Intent | Strategic direction and rules of work |
| **L3** | System Inventory | Ground truth of what exists |
| **L4** | Explanatory Docs | Supporting context and documentation |
| **L5** | Ephemeral/Archive | Transient or historical information |

---

## 3. L2: Governance Intent (Authoritative)

These documents define **what we are building** and **how we work**:

| Document | Purpose | Owner |
|---|---|---|
| `ROADMAP.md` | Strategic direction and priorities | Human |
| `IRON_PROTOCOL.md` | Governance rules and execution loop | Human |
| `IRON_VALIDATION_PLAN.md` | Validation criteria and observation signals | Manus AI |
| `SCOPE_DECISIONS.md` | Persistent scope decision registry | Machine |

---

## 4. L3: System Inventory (Machine-Generated)

These documents are **auto-generated** and represent the current state of the system:

| Document | Purpose | Owner |
|---|---|---|
| `isa.inventory.json` | Repository inventory with drift detection | Machine |
| `ISA_CAPABILITY_MAP.md` | Inventory of implemented features | Manus AI |

---

## 5. L4: Explanatory Documentation (Supporting)

These documents provide **context and guidance** but are not authoritative:

### Architecture & Design

| Document | Purpose |
|---|---|
| `ARCHITECTURE.md` | System architecture overview |
| `DATA_MODEL.md` | Database schema and relationships |
| `ISA_DEVELOPMENT_PLAYBOOK.md` | Development guidelines and best practices |
| `PRODUCTION_READINESS.md` | Production deployment checklist |

### Feature Documentation

| Document | Purpose |
|---|---|
| `INGESTION.md` | Data ingestion pipeline documentation |
| `INGESTION_SUMMARY_REPORT.md` | Summary of ingestion results |
| `EMBEDDING_PIPELINE_IMPLEMENTATION.md` | Embedding generation documentation |
| `EPCIS_CBV_INTEGRATION_SUMMARY.md` | EPCIS/CBV integration details |

### Operations & Monitoring

| Document | Purpose |
|---|---|
| `CRON_DEPLOYMENT.md` | Scheduled task deployment |
| `HEALTH_MONITORING_ENHANCEMENTS.md` | Health check documentation |
| `MONITORING_TESTS.md` | Monitoring test results |
| `WEBHOOK_INTEGRATION.md` | Webhook integration details |

### External References

| Document | Purpose |
|---|---|
| `EXTERNAL_REFERENCES.md` | Links to external resources |
| `CHROMIUM_INSTALLATION_GUIDE.md` | Browser installation guide |

---

## 6. L5: Ephemeral/Archive (Non-Authoritative)

These documents are **historical, transient, or superseded**:

### Superseded by IRON Protocol

| Document | Status | Superseded By |
|---|---|---|
| `GOVERNANCE.md` | ⚠️ Superseded | `IRON_PROTOCOL.md` |
| `ISA_GOVERNANCE.md` | ⚠️ Superseded | `IRON_PROTOCOL.md` |
| `ISA_GOVERNANCE_OPTIMIZED.md` | ⚠️ Superseded | `IRON_PROTOCOL.md` |
| `IRON_PROTOCOL_V2.md` | ⚠️ Superseded | `IRON_PROTOCOL.md` (v2.0.0) |
| `IRON_PROTOCOL_IMPLEMENTATION_PLAN.md` | ⚠️ Superseded | Implementation complete |

### Historical/Audit

| Document | Purpose |
|---|---|
| `AUDIT_FINDINGS.md` | Historical audit results |
| `DIAGNOSTIC_REPORT.md` | Historical diagnostic results |
| `ROOT_CAUSE_DIAGNOSTIC_REPORT.md` | Historical root cause analysis |
| `ISA_STATUS_REPORT_2025-01-11.md` | Historical status report |
| `STABILIZATION_REPORT_2026-01-04.md` | Historical stabilization report |

### Delegation/Prompts (Task-Specific)

| Document | Purpose |
|---|---|
| `CHATGPT_*.md` | ChatGPT delegation prompts |
| `GEMINI_PROMPT_PACKAGE.md` | Gemini delegation prompt |
| `ORCHESTRATION_PROMPT.md` | Orchestration prompt |

### Todo/Work-in-Progress

| Document | Purpose |
|---|---|
| `todo.md` | General todo list |
| `todo_development.md` | Development todo list |
| `POC_EXPLORATION_TODO.md` | POC exploration tasks |
| `ISA_TODO_MANUAL_COMPLETION.md` | Manual completion tasks |
| `WORK_PRIORITIZATION.md` | Work prioritization notes |

---

## 7. Blind Spots Identified

| Blind Spot | Risk | Mitigation |
|---|---|---|
| **Superseded governance docs** | Confusion about authoritative source | Mark as superseded, consider deletion |
| **Multiple todo files** | Fragmented task tracking | Consolidate into ROADMAP.md |
| **Historical reports** | Clutter, outdated information | Archive or delete |

---

## 8. Recommendations

1. **Delete or archive superseded governance documents** (`GOVERNANCE.md`, `ISA_GOVERNANCE.md`, etc.)
2. **Consolidate todo files** into `ROADMAP.md`
3. **Move historical reports** to an `archive/` directory
4. **Add `.gitignore` entry** for `isa.inventory.json` to prevent accidental commits

---

**This knowledge map is now active. All ISA documentation is classified and accessible.**
