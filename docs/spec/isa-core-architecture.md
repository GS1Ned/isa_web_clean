# ISA Core Architecture

**Canonical Specification**
**Status:** CURRENT (as-built)

## 1. Identity

- **Name:** ISA Core Architecture
- **Scope:** CURRENT state of isa core architecture
- **Marker:** CURRENT (as-built) — not ULTIMATE

## 2. Core Sources

1. `./ARCHITECTURE.md`
2. `./docs/FILE_SYSTEM_MEMORY_ARCHITECTURE.md`
3. `./docs/ISA_INFORMATION_ARCHITECTURE.md`
4. `./ROADMAP_GITHUB_INTEGRATION.md`
5. `./docs/ISA_VISUAL_BRANDING_ROADMAP.md`
6. `./docs/ISA_STRATEGIC_CONTEXT_SYNTHESIS.md`
7. `./PROJECT_SIZE_CLEANUP.md`
8. `./docs/ALERTING_SYSTEM_DESIGN.md`
9. `./tasks/for_chatgpt/CGPT-15_user_guide.md`
10. `./docs/MANUS_OPTIMIZATION_IMPLEMENTATION_SUMMARY.md`

## 3. Definitions

*See ISA_MASTER_SPEC.md*

## 4. Invariants (MUST-level)

**INV-1:** Enable GS1 Netherlands members to understand which GS1 standards and data attributes are required for compliance with EU regulations (CSRD, EUDR, DPP, ESRS) through structured mappings, versioned advi
- Source: `./ARCHITECTURE.md` > Core Mission

**INV-2:** - **Advisory Publication:** Lane C review required, no automated publication
- Source: `./ARCHITECTURE.md` > Data Limitations

**INV-3:** - 🔴 **Critical:** Must-have for MVP, core user journeys
- Source: `./docs/ISA_INFORMATION_ARCHITECTURE.md` > 4. Page-Type Priority Matrix

**INV-4:** 6. **Code Review:** CODEOWNERS review required
- Source: `./ROADMAP_GITHUB_INTEGRATION.md` > New Workflow (GitHub-First)

**INV-5:** Sync must occur after:
- Source: `./ROADMAP_GITHUB_INTEGRATION.md` > Additional Triggers

**INV-6:** Immediate sync required for:
- Source: `./ROADMAP_GITHUB_INTEGRATION.md` > Emergency Sync

**INV-7:** All third-party integrations (data sources, APIs, services) must follow the systematic evaluation framework defined in `INTEGRATIONS_RESEARCH_PROTOCOL.md`.
- Source: `./ROADMAP_GITHUB_INTEGRATION.md` > Integration Research Framework

**INV-8:** **Core Principle:** Integration research and implementation must not interrupt or delay core ISA development.
- Source: `./ROADMAP_GITHUB_INTEGRATION.md` > Non-Interruption Rule

**INV-9:** - Must ISA display the GS1 logo?
- Source: `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` > 1. Clarify ISA's Official Status

**INV-10:** - Is "Powered by GS1" attribution required?
- Source: `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` > 1. Clarify ISA's Official Status

**INV-11:** - Determine if GS1 logo is required and where
- Source: `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` > 3. Audit Current ISA Visual Implementation

**INV-12:** - ✅ GS1 logo is displayed (if required) with proper attribution
- Source: `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` > Exit Criteria

**INV-13:** - Determines level of GS1 branding required
- Source: `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` > Critical Decisions (Block Phase 0 → Phase 1 Transition)

**INV-14:** 2. **Must ISA display the GS1 logo?**
- Source: `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` > Critical Decisions (Block Phase 0 → Phase 1 Transition)

**INV-15:** - ✅ GS1 logo displayed (if required) with proper attribution
- Source: `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` > Phase 1: GS1 Brand Compliance

## 5. Interfaces / Pipelines

*See source documents.*

## 6. Governance & Change Control

1. Review source documents
2. Update TRACEABILITY_MATRIX.csv
3. Follow governance rules

## 7. Observability

**OPEN ISSUE:** Define observability hooks.

## 8. Acceptance Criteria

- AC-1: - Verify Lane C authorization
- AC-2: - **Tested:** Unit tests ensure correctness
- AC-3: **Solution:** Use `sort-keys` to ensure consistent JSON output.
- AC-4: **Recommendation:** ISA should have **two distinct navigation patterns**:
- AC-5: **Goal:** Complete the website, ensure legal compliance

## 9. Traceability Annex

| Claim ID | Statement | Source |
|----------|-----------|--------|
| ISA-001 | Enable GS1 Netherlands members to understand which GS1 stand... | `./ARCHITECTURE.md` |
| ISA-002 | - **Advisory Publication:** Lane C review required, no autom... | `./ARCHITECTURE.md` |
| ISA-003 | - 🔴 **Critical:** Must-have for MVP, core user journeys... | `./docs/ISA_INFORMATION_ARCHITECTURE.md` |
| ISA-004 | - Verify Lane C authorization... | `./ARCHITECTURE.md` |
| ISA-005 | - **Tested:** Unit tests ensure correctness... | `./docs/FILE_SYSTEM_MEMORY_ARCHITECTURE.md` |
| ISA-006 | **Solution:** Use `sort-keys` to ensure consistent JSON outp... | `./docs/FILE_SYSTEM_MEMORY_ARCHITECTURE.md` |
| ISA-007 | **Recommendation:** ISA should have **two distinct navigatio... | `./docs/ISA_INFORMATION_ARCHITECTURE.md` |
| ISA-008 | **Goal:** Complete the website, ensure legal compliance... | `./docs/ISA_INFORMATION_ARCHITECTURE.md` |
| ISA-009 | 6. **Code Review:** CODEOWNERS review required... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ISA-010 | Sync must occur after:... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ISA-011 | Immediate sync required for:... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ISA-012 | All third-party integrations (data sources, APIs, services) ... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ISA-013 | **Core Principle:** Integration research and implementation ... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ISA-014 | - Must ISA display the GS1 logo?... | `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` |
| ISA-015 | - Is "Powered by GS1" attribution required?... | `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` |
| ISA-016 | - Determine if GS1 logo is required and where... | `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` |
| ISA-017 | - ✅ GS1 logo is displayed (if required) with proper attribut... | `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` |
| ISA-018 | - Determines level of GS1 branding required... | `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` |
| ISA-019 | 2. **Must ISA display the GS1 logo?**... | `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` |
| ISA-020 | - ✅ GS1 logo displayed (if required) with proper attribution... | `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` |
| ISA-021 | **Decision:** All automated processes must be monitorable an... | `./docs/ISA_STRATEGIC_CONTEXT_SYNTHESIS.md` |
| ISA-022 | ISA project cleanup completed successfully with minimal chan... | `./PROJECT_SIZE_CLEANUP.md` |
| ISA-023 | - Minimum 100 samples required for baseline... | `./docs/ALERTING_SYSTEM_DESIGN.md` |
| ISA-024 | **This is a DOCUMENTATION task - NO CODE required**... | `./tasks/for_chatgpt/CGPT-15_user_guide.md` |
| ISA-025 | 4. Fill in required attributes... | `./tasks/for_chatgpt/CGPT-15_user_guide.md` |
| ISA-026 | 2. Identify required CTEs (harvest, processing, shipping)... | `./tasks/for_chatgpt/CGPT-15_user_guide.md` |
| ISA-027 | 1. Use ESG Hub to identify required ESRS datapoints... | `./tasks/for_chatgpt/CGPT-15_user_guide.md` |
| ISA-028 | 2. Identify required attributes per category... | `./tasks/for_chatgpt/CGPT-15_user_guide.md` |
| ISA-029 | Must include:... | `./tasks/for_chatgpt/CGPT-15_user_guide.md` |
| ISA-030 | Each phase includes a decision gate to ensure quality and pr... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ISA-031 | Before merging to main, verify:... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ISA-032 | 2. **Mandatory Source Availability:** Verify GS1 Global, GS1... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ISA-033 | 7. ✅ Validate permissions (issue, branch, PR creation)... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ISA-034 | 4. Validate CI pipeline execution... | `./ROADMAP_GITHUB_INTEGRATION.md` |
| ISA-035 | 5. **Validation Checkpoints:** Review and validate at each p... | `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` |
| ISA-036 | - Color palette (verify hex codes, accessible alternatives)... | `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` |
| ISA-037 | - [ ] **Check for updated brand manual:** Verify if Version ... | `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` |
| ISA-038 | Align ISA's visual identity with GS1 brand guidelines to ens... | `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` |
| ISA-039 | - Ensure accessible color alternatives for text on white... | `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` |
| ISA-040 | - Verify WCAG 2.1 AA compliance (4.5:1 for normal text)... | `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` |
| ISA-041 | - Ensure proper sizing, clearance, and alignment per GS1 gui... | `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` |
| ISA-042 | - Ensure logo works on light and dark backgrounds... | `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` |
| ISA-043 | - Verify tokens work across all components... | `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` |
| ISA-044 | - [ ] **Validate with stakeholders:**... | `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` |
| ISA-045 | **Rationale:** Validate IA and navigation before building ma... | `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` |
| ISA-046 | **Rationale:** Ensure designs are validated before investing... | `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` |
| ISA-047 | - [ ] **Visual regression testing:** Compare to designs, ens... | `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` |
| ISA-048 | 1. **Design Review:** Compare implementation to designs, ens... | `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` |
| ISA-049 | 4. **Should ISA use the GS1 Web Design System components?**... | `./docs/ISA_VISUAL_BRANDING_ROADMAP.md` |
| ISA-050 | **Decision:** News and regulations should reference each oth... | `./docs/ISA_STRATEGIC_CONTEXT_SYNTHESIS.md` |
| ISA-051 | **Rationale:** Users arriving at a regulation page should se... | `./docs/ISA_STRATEGIC_CONTEXT_SYNTHESIS.md` |
| ISA-052 | - Verify that removed files (debug scripts, unused XLSX) are... | `./PROJECT_SIZE_CLEANUP.md` |
| ISA-053 | - Confirm that large datasets in /upload should remain there... | `./PROJECT_SIZE_CLEANUP.md` |
| ISA-054 | - Simulate error spike → verify alert triggered... | `./docs/ALERTING_SYSTEM_DESIGN.md` |
| ISA-055 | - Simulate performance degradation → verify alert triggered... | `./docs/ALERTING_SYSTEM_DESIGN.md` |
| ISA-056 | - Verify cooldown prevents duplicate alerts... | `./docs/ALERTING_SYSTEM_DESIGN.md` |
| ISA-057 | - Verify alert acknowledgment updates database... | `./docs/ALERTING_SYSTEM_DESIGN.md` |
| ISA-058 | - Update thresholds → verify new thresholds applied... | `./docs/ALERTING_SYSTEM_DESIGN.md` |
| ISA-059 | - Disable notifications → verify no emails sent... | `./docs/ALERTING_SYSTEM_DESIGN.md` |
| ISA-060 | - **Validate inputs:** Check GTINs with check digit validato... | `./tasks/for_chatgpt/CGPT-15_user_guide.md` |
| ISA-061 | - Test with intentional errors to verify logging... | `./docs/MANUS_OPTIMIZATION_IMPLEMENTATION_SUMMARY.md` |
| ISA-062 | / `README.md` / Project overview and setup / The first docum... | `./REPO_MAP.md` |
| ISA-063 | 2. Verify notification system:... | `./docs/NEWS_HEALTH_MONITORING.md` |
| ISA-064 | 2. Verify `updateHealthSummary()` is being called after `rec... | `./docs/NEWS_HEALTH_MONITORING.md` |
| ISA-065 | 6. Test and validate... | `./INGESTION_DELIVERABLES_INDEX.md` |
