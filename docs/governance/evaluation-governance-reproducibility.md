# Evaluation Governance & Reproducibility

**Canonical Specification**
**Status:** CURRENT (as-built)

## 1. Identity

- **Name:** Evaluation Governance & Reproducibility
- **Scope:** CURRENT state of evaluation governance & reproducibility
- **Marker:** CURRENT (as-built) — not ULTIMATE

## 2. Core Sources

1. `./docs/PIPELINE_OBSERVABILITY_SPEC.md`
2. `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md`
3. `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md`
4. `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md`
5. `./docs/evidence/ISA_IRON_DOCSET_AND_CRITICAL_PATH_DECISION_DRAFT_v0.md`
6. `./docs/gs1_research/feasibility_assessment.md`
7. `./EXTERNAL_REFERENCES.md`
8. `./ISA_DEVELOPMENT_PLAYBOOK.md`
9. `./README.md`
10. `./docs/CRITICAL_EVENTS_TAXONOMY.md`

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

*See source documents.*

## 8. Acceptance Criteria

- AC-1: - [ ] Verify dashboard UI rendering
- AC-2: - Ensure procedures are comprehensive and current
- AC-3: - Validate security monitoring is working
- AC-4: - **Testing** - Run tests, validate data quality, ensure production readiness
- AC-5: 2. Verify data files exist in `/data/` directories

## 9. Traceability Annex

| Claim ID | Statement | Source |
|----------|-----------|--------|
| EVA-001 | - **Escalation Required:** ✅ YES (Creating third-party conne... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-002 | - This action would have required escalation under Lane C... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-003 | - **Escalation Required:** ✅ YES (Creating authentication to... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-004 | - **Escalation Required:** ❌ NO (Writing code and documentat... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-005 | - This action would NOT have required escalation under Lane ... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-006 | - **Escalation Required:** ❌ NO (Testing and validation)... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-007 | - **Escalation Required:** ⚠️ DEPENDS (Policy change if scop... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-008 | - This action would likely NOT have required escalation unde... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-009 | - **Escalation Required:** ⚠️ SPECIAL CASE (Implementing gov... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-010 | - No escalation required when executing direct user instruct... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-011 | - **Escalation Required:** ❌ NO (Documentation)... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-012 | - User action required to configure branch protection via Gi... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-013 | **Impact:** Potential development disruption if schema impor... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-014 | - User action required to enable at org level... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-015 | 1. **User Action Required:** Configure branch protection on ... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-016 | 2. **User Decision Required:** Determine ISA license... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-017 | - I will perform governance self-checks as required... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-018 | 2. Check data quality (no nulls in required fields)... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| EVA-019 | - Null values in required fields... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| EVA-020 | - [ ] Verify dashboard UI rendering... | `./docs/PIPELINE_OBSERVABILITY_SPEC.md` |
| EVA-021 | - Ensure procedures are comprehensive and current... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-022 | - Validate security monitoring is working... | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` |
| EVA-023 | - **Testing** - Run tests, validate data quality, ensure pro... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| EVA-024 | 2. Verify data files exist in `/data/` directories... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| EVA-025 | 2. Validate structure and completeness... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| EVA-026 | 1. Verify record counts in database... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| EVA-027 | 4. Validate downstream features work... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| EVA-028 | 3. **Automate integration** - Use scripts to extract and val... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| EVA-029 | 4. **Test thoroughly** - Ensure tests cover edge cases... | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` |
| EVA-030 | / **Analytical Rigour** / ⭐⭐⭐⭐⭐ High / Gap analysis must ref... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-031 | / **Accessibility** / ⭐⭐⭐ Moderate / Gap visualisations must... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-032 | / **Reproducibility** / ⭐⭐⭐⭐⭐ High / Users must be able to r... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-033 | - [ ] System compares current GS1 implementations against re... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-034 | / **Datamaran** / Material topic identification with regulat... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-035 | / **Analytical Rigour** / ⭐⭐⭐⭐⭐ High / Attribute recommendat... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-036 | / **Technical Correctness** / ⭐⭐⭐⭐⭐ High / GS1 attribute IDs... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-037 | / **GS1 Style Compliance** / ⭐⭐⭐⭐ High / Attribute names and... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-038 | / **Reproducibility** / ⭐⭐⭐⭐⭐ High / Same regulation input m... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-039 | / **Over-recommendation** / Medium / Low / Distinguish "requ... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-040 | - [ ] System returns list of GS1 attributes required for com... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-041 | - [ ] Implementation priority indicated (required vs. recomm... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-042 | / **Analytical Rigour** / ⭐⭐⭐⭐ High / Dashboard metrics must... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-043 | / **Accessibility** / ⭐⭐⭐⭐ High / Dashboard must be usable b... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-044 | / **Analytical Rigour** / ⭐⭐⭐⭐⭐ High / PDF content must matc... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-045 | / **Technical Correctness** / ⭐⭐⭐⭐ High / PDF generation mus... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-046 | / **GS1 Style Compliance** / ⭐⭐⭐⭐⭐ High / PDF must follow GS... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-047 | / **Accessibility** / ⭐⭐⭐⭐⭐ High / PDF must be accessible (t... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-048 | / **Reproducibility** / ⭐⭐⭐⭐⭐ High / Same advisory input mus... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-049 | / **Analytical Rigour** / ⭐⭐⭐⭐⭐ High / Simulation logic must... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-050 | / **Technical Correctness** / ⭐⭐⭐⭐⭐ High / Calculations must... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-051 | / **Accessibility** / ⭐⭐⭐ Moderate / Simulation interface mu... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-052 | / **Reproducibility** / ⭐⭐⭐⭐⭐ High / Same scenario inputs mu... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-053 | / **Analytical Rigour** / ⭐⭐⭐⭐ High / Roadmaps must be based... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-054 | / **Technical Correctness** / ⭐⭐⭐⭐ High / Implementation ste... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-055 | / **GS1 Style Compliance** / ⭐⭐⭐⭐ High / Sector terminology ... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-056 | / **Accessibility** / ⭐⭐⭐ Moderate / Roadmap visualisations ... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-057 | / **Reproducibility** / ⭐⭐⭐⭐ High / Same sector selection mu... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-058 | **Key Insight:** Compliance.ai's task management approach de... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-059 | / **Analytical Rigour** / ⭐⭐⭐⭐ High / Deadline data must be ... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-060 | / **Technical Correctness** / ⭐⭐⭐⭐⭐ High / Calendar integrat... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-061 | / **Accessibility** / ⭐⭐⭐ Moderate / Alerts must be accessib... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-062 | **Differentiation Opportunity:** ISA can generate supplier d... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-063 | / **Analytical Rigour** / ⭐⭐⭐⭐⭐ High / Data requirements mus... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-064 | / **Accessibility** / ⭐⭐⭐ Moderate / Templates must be usabl... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-065 | / **Reproducibility** / ⭐⭐⭐⭐ High / Same regulation input mu... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-066 | - [ ] System generates list of required data fields... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-067 | / **Analytical Rigour** / ⭐⭐⭐⭐⭐ High / Pro Mode responses mu... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-068 | / **Technical Correctness** / ⭐⭐⭐⭐ High / Document processin... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-069 | / **Accessibility** / ⭐⭐⭐ Moderate / Conversation interface ... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-070 | / **Analytical Rigour** / ⭐⭐⭐⭐⭐ High / Evidence must be trac... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-071 | / **Technical Correctness** / ⭐⭐⭐⭐⭐ High / Evidence storage ... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-072 | / **Accessibility** / ⭐⭐⭐ Moderate / Evidence vault interfac... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-073 | / **Reproducibility** / ⭐⭐⭐⭐⭐ High / Evidence retrieval must... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-074 | **Decision Required:** Which sectors should receive priority... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-075 | **Decision Required:** Should Ask ISA Pro Mode be included i... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-076 | **Decision Required:** Where should compliance evidence be s... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-077 | / **Analytical Rigour** / Accuracy, completeness, and tracea... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-078 | / **Technical Correctness** / Schema validity, API compatibi... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-079 | / **Reproducibility** / Ability to reproduce advisory output... | `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md` |
| EVA-080 | - The **canonical document set** that constitutes “IRON in p... | `./docs/evidence/ISA_IRON_DOCSET_AND_CRITICAL_PATH_DECISION_DRAFT_v0.md` |
| EVA-081 | 7. `scripts/iron-context.sh` — context acknowledgement gener... | `./docs/evidence/ISA_IRON_DOCSET_AND_CRITICAL_PATH_DECISION_DRAFT_v0.md` |
| EVA-082 | **NOTE:** Whether they are already located in the *correct r... | `./docs/evidence/ISA_IRON_DOCSET_AND_CRITICAL_PATH_DECISION_DRAFT_v0.md` |
| EVA-083 | When Manus is asked to “operate under IRON”, it must:... | `./docs/evidence/ISA_IRON_DOCSET_AND_CRITICAL_PATH_DECISION_DRAFT_v0.md` |
| EVA-084 | 1. **Core Hypothesis:** What must be true for this to delive... | `./docs/gs1_research/feasibility_assessment.md` |
| EVA-085 | **What Must Be True:**... | `./docs/gs1_research/feasibility_assessment.md` |
| EVA-086 | Standards documents contain specialized terminology where su... | `./docs/gs1_research/feasibility_assessment.md` |
| EVA-087 | **Conceptual Validation (No Development Required):**... | `./docs/gs1_research/feasibility_assessment.md` |
| EVA-088 | Stakeholder preferences are rarely explicitly documented. Th... | `./docs/gs1_research/feasibility_assessment.md` |
| EVA-089 | Multi-stakeholder governance research emphasizes that legiti... | `./docs/gs1_research/feasibility_assessment.md` |
| EVA-090 | The governance constraint is severe: if AI appears to certif... | `./docs/gs1_research/feasibility_assessment.md` |
| EVA-091 | [5]: https://www.deloitte.com/ch/en/services/consulting/pers... | `./docs/gs1_research/feasibility_assessment.md` |
| EVA-092 | - **Material Topics:** Topics companies must report on based... | `./EXTERNAL_REFERENCES.md` |
| EVA-093 | - **Mandatory Datapoints:** Required for all companies (e.g.... | `./EXTERNAL_REFERENCES.md` |
| EVA-094 | - **Voluntary Datapoints:** Required only if material (e.g.,... | `./EXTERNAL_REFERENCES.md` |
| EVA-095 | **Canonical URL:** GS1 Netherlands member portal (authentica... | `./EXTERNAL_REFERENCES.md` |
| EVA-096 | - Evidence required is specified... | `./ISA_DEVELOPMENT_PLAYBOOK.md` |
| EVA-097 | - Must be fixed before artefacts are citation-grade... | `./ISA_DEVELOPMENT_PLAYBOOK.md` |
| EVA-098 | 2. **Silence is NOT consent** - must wait for explicit appro... | `./ISA_DEVELOPMENT_PLAYBOOK.md` |
| EVA-099 | - [ ] Verify local database has required data... | `./ISA_DEVELOPMENT_PLAYBOOK.md` |
| EVA-100 | 3. **User Authority:** Silence is NOT consent; explicit appr... | `./README.md` |
