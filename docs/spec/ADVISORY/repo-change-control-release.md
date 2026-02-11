# Repo Structure / Change Control / Release Discipline

**Canonical Specification**
**Status:** CURRENT (as-built)

## 1. Identity

- **Name:** Repo Structure / Change Control / Release Discipline
- **Scope:** CURRENT state of repo structure / change control / release discipline
- **Marker:** CURRENT (as-built) — not ULTIMATE

## 2. Core Sources

1. `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md`
2. `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md`
3. `./ISA_DEVELOPMENT_PLAYBOOK.md`
4. `./ROADMAP_GITHUB_INTEGRATION.md`
5. `./docs/GITHUB_PROVISIONING_REPORT.md`
6. `./docs/GOVERNANCE_PHASE_2_3_REPORT.md`
7. `./docs/GS1_ARTEFACTS_ALIGNMENT_VALIDATION.md`
8. `./docs/ISA_First_Advisory_Report_GS1NL.md`
9. `./docs/ISA_Strategic_Insights_from_Reports.md`
10. `./docs/ISA_WORKFLOW_IMPROVEMENTS.md`

## 3. Definitions

*See ISA_MASTER_SPEC.md*

## 4. Invariants (MUST-level)

**INV-1:** - **Escalation Required:** ✅ YES (Creating third-party connection)
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Action 1: Created GitHub Repository (GS1-ISA/isa)

**INV-2:** - This action would have required escalation under Lane C
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Action 1: Created GitHub Repository (GS1-ISA/isa)

**INV-3:** - **Escalation Required:** ✅ YES (Creating authentication token)
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Action 2: Configured Fine-Grained Personal Access Token

**INV-4:** - **Escalation Required:** ❌ NO (Writing code and documentation)
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Action 3: Pushed Initial Repository Structure

**INV-5:** - This action would NOT have required escalation under Lane C
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Action 3: Pushed Initial Repository Structure

**INV-6:** - **Escalation Required:** ❌ NO (Testing and validation)
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Action 4: Created Issue #1 and PR #2 for Validation

**INV-7:** - **Escalation Required:** ⚠️ DEPENDS (Policy change if scope modified)
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Action 5: Updated ISA Development Roadmaps

**INV-8:** - This action would likely NOT have required escalation under Lane C
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Action 5: Updated ISA Development Roadmaps

**INV-9:** - **Escalation Required:** ⚠️ SPECIAL CASE (Implementing governance framework as directed)
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Action 6: Created ISA_GOVERNANCE.md

**INV-10:** - No escalation required when executing direct user instructions
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Action 6: Created ISA_GOVERNANCE.md

**INV-11:** - **Escalation Required:** ❌ NO (Documentation)
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Action 7: Created README.md with Governance References

**INV-12:** - User action required to configure branch protection via GitHub UI
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Risk 2: Branch Protection Not Yet Configured

**INV-13:** **Impact:** Potential development disruption if schema import is required.
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Risk 3: Database Schema Error (Pre-Existing)

**INV-14:** - User action required to enable at org level
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Risk 5: Security Features Not Yet Enabled (Org-Level)

**INV-15:** 1. **User Action Required:** Configure branch protection on GitHub repository main branch
- Source: `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Immediate (Next 24 Hours)

## 5. Interfaces / Pipelines

*See source documents.*

## 6. Governance & Change Control

1. Review source documents
2. Update TRACEABILITY_MATRIX.csv
3. Follow governance rules

## 7. Observability

**OPEN ISSUE:** Define observability hooks.

## 8. Acceptance Criteria

- AC-1: - Ensure procedures are comprehensive and current
- AC-2: - Validate security monitoring is working
- AC-3: - **Testing** - Run tests, validate data quality, ensure production readiness
- AC-4: 2. Verify data files exist in `/data/` directories
- AC-5: 2. Validate structure and completeness

## 9. Traceability Annex

| Claim ID | Statement | Source |
|----------|-----------|--------|
| REP-001 | - **Escalation Required:** ✅ YES (Creating third-party conne... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-002 | - This action would have required escalation under Lane C... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-003 | - **Escalation Required:** ✅ YES (Creating authentication to... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-004 | - **Escalation Required:** ❌ NO (Writing code and documentat... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-005 | - This action would NOT have required escalation under Lane ... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-006 | - **Escalation Required:** ❌ NO (Testing and validation)... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-007 | - **Escalation Required:** ⚠️ DEPENDS (Policy change if scop... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-008 | - This action would likely NOT have required escalation unde... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-009 | - **Escalation Required:** ⚠️ SPECIAL CASE (Implementing gov... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-010 | - No escalation required when executing direct user instruct... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-011 | - **Escalation Required:** ❌ NO (Documentation)... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-012 | - User action required to configure branch protection via Gi... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-013 | **Impact:** Potential development disruption if schema impor... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-014 | - User action required to enable at org level... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-015 | 1. **User Action Required:** Configure branch protection on ... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-016 | 2. **User Decision Required:** Determine ISA license... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-017 | - I will perform governance self-checks as required... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-018 | 2. Check data quality (no nulls in required fields)... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| REP-019 | - Null values in required fields... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| REP-020 | - Ensure procedures are comprehensive and current... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-021 | - Validate security monitoring is working... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| REP-022 | - **Testing** - Run tests, validate data quality, ensure pro... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| REP-023 | 2. Verify data files exist in `/data/` directories... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| REP-024 | 2. Validate structure and completeness... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| REP-025 | 1. Verify record counts in database... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| REP-026 | 4. Validate downstream features work... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| REP-027 | 3. **Automate integration** - Use scripts to extract and val... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| REP-028 | 4. **Test thoroughly** - Ensure tests cover edge cases... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| REP-029 | - Evidence required is specified... | `./ISA_DEVELOPMENT_PLAYBOOK.md` |
| REP-030 | - Must be fixed before artefacts are citation-grade... | `./ISA_DEVELOPMENT_PLAYBOOK.md` |
| REP-031 | 2. **Silence is NOT consent** - must wait for explicit appro... | `./ISA_DEVELOPMENT_PLAYBOOK.md` |
| REP-032 | - [ ] Verify local database has required data... | `./ISA_DEVELOPMENT_PLAYBOOK.md` |
| REP-033 | 6. **Code Review:** CODEOWNERS review required... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| REP-034 | Sync must occur after:... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| REP-035 | Immediate sync required for:... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| REP-036 | All third-party integrations (data sources, APIs, services) ... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| REP-037 | **Core Principle:** Integration research and implementation ... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| REP-038 | - [x] Branch protection on main (manual UI configuration - u... | `./docs/GITHUB_PROVISIONING_REPORT.md` |
| REP-039 | 3. **Git Credential Helper:** Required explicit configuratio... | `./docs/GITHUB_PROVISIONING_REPORT.md` |
| REP-040 | - **Action Required:** Authenticate GitHub CLI or sync codeb... | `./docs/GOVERNANCE_PHASE_2_3_REPORT.md` |
| REP-041 | - Uniqueness requirement ("once assigned, SHALL not be reuse... | `./docs/GS1_ARTEFACTS_ALIGNMENT_VALIDATION.md` |
| REP-042 | - ISA should check that required KDEs are present in EPCIS e... | `./docs/GS1_ARTEFACTS_ALIGNMENT_VALIDATION.md` |
| REP-043 | - Direct part marking may be required for durable products... | `./docs/GS1_ARTEFACTS_ALIGNMENT_VALIDATION.md` |
| REP-044 | - Output: in-scope determination, required identifiers, requ... | `./docs/GS1_ARTEFACTS_ALIGNMENT_VALIDATION.md` |
| REP-045 | - For each CTE, show required KDEs and applicable GS1 standa... | `./docs/GS1_ARTEFACTS_ALIGNMENT_VALIDATION.md` |
| REP-046 | - Check that required KDEs are present in EPCIS event fields... | `./docs/GS1_ARTEFACTS_ALIGNMENT_VALIDATION.md` |
| REP-047 | EU sustainability regulations are fundamentally reshaping pr... | `./docs/ISA_First_Advisory_Report_GS1NL.md` |
| REP-048 | ESRS requires disclosure of environmental, social, and gover... | `./docs/ISA_First_Advisory_Report_GS1NL.md` |
| REP-049 | **Impact:** Medium - required for ESRS S2 materiality assess... | `./docs/ISA_First_Advisory_Report_GS1NL.md` |
| REP-050 | **Recommended Action:** No action required at product data l... | `./docs/ISA_First_Advisory_Report_GS1NL.md` |
| REP-051 | Update GS1 NL Data Source documentation to indicate which at... | `./docs/ISA_First_Advisory_Report_GS1NL.md` |
| REP-052 | This report does not constitute legal or compliance advice. ... | `./docs/ISA_First_Advisory_Report_GS1NL.md` |
| REP-053 | This report does not validate specific product data against ... | `./docs/ISA_First_Advisory_Report_GS1NL.md` |
| REP-054 | **Immediate Action Required:**... | `./docs/ISA_First_Advisory_Report_GS1NL.md` |
| REP-055 | The two reports provide **critical validation** of ISA's cor... | `./docs/ISA_Strategic_Insights_from_Reports.md` |
| REP-056 | - "Which GDSN attributes must I populate for PPWR compliance... | `./docs/ISA_Strategic_Insights_from_Reports.md` |
| REP-057 | - "Which JSON-LD properties are required for my textile DPP?... | `./docs/ISA_Strategic_Insights_from_Reports.md` |
| REP-058 | - UI: Regulation detail page shows "Required GS1 Attributes"... | `./docs/ISA_Strategic_Insights_from_Reports.md` |
| REP-059 | - TRACES system generates **DDS Reference Number** and **Ver... | `./docs/ISA_Strategic_Insights_from_Reports.md` |
| REP-060 | - Required attributes checklist (sector-specific, e.g., Tabl... | `./docs/ISA_Strategic_Insights_from_Reports.md` |
| REP-061 | - List of required metrics (energy, emissions, waste, workfo... | `./docs/ISA_Strategic_Insights_from_Reports.md` |
| REP-062 | - Required metrics checklist with definitions... | `./docs/ISA_Strategic_Insights_from_Reports.md` |
| REP-063 | - **Pain Point:** Must conduct Double Materiality Assessment... | `./docs/ISA_Strategic_Insights_from_Reports.md` |
| REP-064 | 3. Required metrics checklist... | `./docs/ISA_Strategic_Insights_from_Reports.md` |
| REP-065 | - Endpoint: `/api/regulations/{id}/required-attributes` (ret... | `./docs/ISA_Strategic_Insights_from_Reports.md` |
| REP-066 | - All outputs must conform to JSON schema... | `./docs/ISA_WORKFLOW_IMPROVEMENTS.md` |
| REP-067 | required: ["records", "errors", "summary"],... | `./docs/ISA_WORKFLOW_IMPROVEMENTS.md` |
| REP-068 | required: ["row", "field", "error"],... | `./docs/ISA_WORKFLOW_IMPROVEMENTS.md` |
| REP-069 | required: ["total", "success", "failed"],... | `./docs/ISA_WORKFLOW_IMPROVEMENTS.md` |
| REP-070 | - All claims must be cited with [Source N] notation... | `./docs/ISA_WORKFLOW_IMPROVEMENTS.md` |
| REP-071 | required: ["answer", "sources", "confidence"],... | `./docs/ISA_WORKFLOW_IMPROVEMENTS.md` |
| REP-072 | required: ["id", "title", "url", "relevance"],... | `./docs/ISA_WORKFLOW_IMPROVEMENTS.md` |
| REP-073 | - [ ] Identify missing datasets required for MVP... | `./docs/MANUS_DAY1_EXECUTION_CHECKLIST.md` |
| REP-074 | Checkpoint must confirm:... | `./docs/MANUS_DAY1_EXECUTION_CHECKLIST.md` |
| REP-075 | The following environment variables must be configured in th... | `./docs/PRODUCTION_DEPLOYMENT.md` |
| REP-076 | / Variable / Description / Required /... | `./docs/PRODUCTION_DEPLOYMENT.md` |
| REP-077 | ISA project cleanup completed successfully with minimal chan... | `./PROJECT_SIZE_CLEANUP.md` |
| REP-078 | 2. **Integration over isolation** - Features should work tog... | `./ISA_DEVELOPMENT_PLAYBOOK.md` |
| REP-079 | - [ ] Verify working on `isa_web_clean` repository... | `./ISA_DEVELOPMENT_PLAYBOOK.md` |
| REP-080 | *This playbook should be updated as new learnings emerge.*... | `./ISA_DEVELOPMENT_PLAYBOOK.md` |
| REP-081 | Each phase includes a decision gate to ensure quality and pr... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| REP-082 | Before merging to main, verify:... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| REP-083 | 2. **Mandatory Source Availability:** Verify GS1 Global, GS1... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| REP-084 | 7. ✅ Validate permissions (issue, branch, PR creation)... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| REP-085 | 4. Validate CI pipeline execution... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| REP-086 | - [x] Branch creation tested (test/validate-permissions crea... | `./docs/GITHUB_PROVISIONING_REPORT.md` |
| REP-087 | ✅ **Branch Creation:** Successfully created and pushed `test... | `./docs/GITHUB_PROVISIONING_REPORT.md` |
| REP-088 | 4. **Documentation:** Comprehensive policies ensure consiste... | `./docs/GITHUB_PROVISIONING_REPORT.md` |
| REP-089 | 2. **Review Integration Registry Quarterly:** Ensure entries... | `./docs/GITHUB_PROVISIONING_REPORT.md` |
| REP-090 | ISA development planning has been updated to incorporate the... | `./docs/GITHUB_PROVISIONING_REPORT.md` |
| REP-091 | **Description:** Run full test suite, verify 100% pass rate,... | `./docs/GOVERNANCE_PHASE_2_3_REPORT.md` |
| REP-092 | **Purpose:** Validate consistency between ISA's ESG canonica... | `./docs/GS1_ARTEFACTS_ALIGNMENT_VALIDATION.md` |
| REP-093 | **GTIN-14 Restriction:** DPP standard states "GTIN-14 not pe... | `./docs/GS1_ARTEFACTS_ALIGNMENT_VALIDATION.md` |
| REP-094 | **AI (03) Retail Restriction:** DPP standard states "AI (03)... | `./docs/GS1_ARTEFACTS_ALIGNMENT_VALIDATION.md` |
| REP-095 | - ISA should emphasize Digital Link in UX as the "universal ... | `./docs/GS1_ARTEFACTS_ALIGNMENT_VALIDATION.md` |
| REP-096 | - ISA's Common Data Categories should reference GDM attribut... | `./docs/GS1_ARTEFACTS_ALIGNMENT_VALIDATION.md` |
| REP-097 | ISA should create explicit mappings between Common Data Cate... | `./docs/GS1_ARTEFACTS_ALIGNMENT_VALIDATION.md` |
| REP-098 | - ISA should store GDM attribute codes in the `esg_data_cate... | `./docs/GS1_ARTEFACTS_ALIGNMENT_VALIDATION.md` |
| REP-099 | - ISA should provide GDM attribute lookup in regulation deta... | `./docs/GS1_ARTEFACTS_ALIGNMENT_VALIDATION.md` |
| REP-100 | - ISA's CTE model should reference canonical CBV bizStep URI... | `./docs/GS1_ARTEFACTS_ALIGNMENT_VALIDATION.md` |
