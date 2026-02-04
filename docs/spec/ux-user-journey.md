# UX & User Journey

**Canonical Specification**
**Status:** CURRENT (as-built)

## 1. Identity

- **Name:** UX & User Journey
- **Scope:** CURRENT state of ux & user journey
- **Marker:** CURRENT (as-built) — not ULTIMATE

## 2. Core Sources

1. `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md`
2. `./docs/ISA_UX_STRATEGY.md`
3. `./docs/ISA_VISUAL_BRANDING_DEVELOPMENT_PLAN.md`
4. `./docs/autonomous-session-2025-12-17.md`
5. `./ISA_STATUS_REPORT_2025-01-11.md`
6. `./docs/ALERTING_SYSTEM_DESIGN.md`
7. `./docs/ALTERNATIVE_FUTURES_EXPLORATION.md`
8. `./docs/ASK_ISA_QUERY_LIBRARY.md`
9. `./docs/CHATGPT_INTEGRATION_WORKFLOW.md`
10. `./docs/ISA_NEWSHUB_EVOLUTION_SUMMARY.md`

## 3. Definitions

*See ISA_MASTER_SPEC.md*

## 4. Invariants (MUST-level)

**INV-1:** 4. **Assurance & Validation Framing** - Required to establish ISA's credibility as authoritative source
- Source: `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` > Key Findings

**INV-2:** **No additional dimension-specific work is required** beyond executing the existing Visual & Branding roadmap and ensuring data provenance is visible throughout the UX.
- Source: `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` > Formalization Decision

**INV-3:** - **Regulatory compliance use cases:** Users must justify their compliance strategies to auditors and regulators
- Source: `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` > Relevance to ISA's Mission

**INV-4:** No dimension-specific work required. Interoperability features can be added opportunistically as user demand emerges.
- Source: `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` > Timing & Sequencing

**INV-5:** ISA's value proposition is to **reduce manual effort** in regulatory compliance. However, if users must manually copy data from ISA into their existing tools (Excel, compliance software, ERP systems),
- Source: `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` > Relevance to ISA's Mission

**INV-6:** - **Competitive landscape:** Compliance platforms (OneTrust, Workiva) offer integrations; ISA must match
- Source: `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` > Formalization Decision

**INV-7:** **However, full integration is not required immediately.** A **minimal-impact entry point** can unblock enterprise adoption without derailing core development.
- Source: `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` > Formalization Decision

**INV-8:** - Create public API for regulation/standard queries (read-only, no authentication required)
- Source: `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` > Timing & Sequencing

**INV-9:** - Add audit trail for all user actions (required for enterprise compliance)
- Source: `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` > Timing & Sequencing

**INV-10:** - **Legal disclaimers:** ISA must clarify that it provides informational guidance, not legal advice
- Source: `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` > Relevance to ISA's Mission

**INV-11:** - **Data privacy:** ISA must comply with GDPR and other data protection regulations
- Source: `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` > Relevance to ISA's Mission

**INV-12:** - **Terms of service:** ISA must define acceptable use, liability limits, and dispute resolution
- Source: `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` > Relevance to ISA's Mission

**INV-13:** - **Risk mitigation:** ISA must help users understand the limitations and risks of relying on AI-generated content
- Source: `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` > Relevance to ISA's Mission

**INV-14:** - **Legal expertise required:** Drafting ToS, privacy policy, and liability disclaimers requires legal counsel
- Source: `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` > Formalization Decision

**INV-15:** - Data ingestion pipelines (must record provenance metadata at every step)
- Source: `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` > Why This Is a Dimension (Not a Feature)

## 5. Interfaces / Pipelines

*See source documents.*

## 6. Governance & Change Control

1. Review source documents
2. Update TRACEABILITY_MATRIX.csv
3. Follow governance rules

## 7. Observability

**OPEN ISSUE:** Define observability hooks.

## 8. Acceptance Criteria

- AC-1: The primary directive remains: **protect core ISA delivery above all else**. Dimensions should be activated only when they prevent structural failure 
- AC-2: **Formalization Decision:** Should this dimension be:
- AC-3: **Timing & Sequencing:** If formalization is recommended, when should it occur relative to ISA's development lifecycle?
- AC-4: ISA's core value proposition is **automated mapping between EU regulations and GS1 standards**. If users cannot understand or verify these mappings, I
- AC-5: - **User base is small:** Early adopters are technical users who can validate ISA's outputs independently

## 9. Traceability Annex

| Claim ID | Statement | Source |
|----------|-----------|--------|
| UX -001 | 4. **Assurance & Validation Framing** - Required to establis... | `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` |
| UX -002 | **No additional dimension-specific work is required** beyond... | `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` |
| UX -003 | - **Regulatory compliance use cases:** Users must justify th... | `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` |
| UX -004 | No dimension-specific work required. Interoperability featur... | `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` |
| UX -005 | ISA's value proposition is to **reduce manual effort** in re... | `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` |
| UX -006 | - **Competitive landscape:** Compliance platforms (OneTrust,... | `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` |
| UX -007 | **However, full integration is not required immediately.** A... | `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` |
| UX -008 | - Create public API for regulation/standard queries (read-on... | `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` |
| UX -009 | - Add audit trail for all user actions (required for enterpr... | `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` |
| UX -010 | - **Legal disclaimers:** ISA must clarify that it provides i... | `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` |
| UX -011 | - **Data privacy:** ISA must comply with GDPR and other data... | `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` |
| UX -012 | - **Terms of service:** ISA must define acceptable use, liab... | `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` |
| UX -013 | - **Risk mitigation:** ISA must help users understand the li... | `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` |
| UX -014 | - **Legal expertise required:** Drafting ToS, privacy policy... | `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` |
| UX -015 | - Data ingestion pipelines (must record provenance metadata ... | `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` |
| UX -016 | - AI processing (must log which model version, prompt, and r... | `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` |
| UX -017 | - API design (provenance metadata must be exposed to third-p... | `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` |
| UX -018 | ISA aggregates data from multiple authoritative sources (EUR... | `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` |
| UX -019 | - Query logic (all queries must filter by temporal validity)... | `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` |
| UX -020 | - Data ingestion (must preserve historical versions, not ove... | `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` |
| UX -021 | - UX design (users must be able to select "as of" date for a... | `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` |
| UX -022 | - Search functionality (must handle synonyms, acronyms, and ... | `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` |
| UX -023 | - AI processing (must use consistent terminology in prompts ... | `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` |
| UX -024 | - UX design (must present consistent terminology to users)... | `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` |
| UX -025 | As user base grows (target: 500+ active users), ISA must mai... | `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` |
| UX -026 | / **Assurance & Validation Framing** / Planned Later / **3-6... | `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` |
| UX -027 | ISA's UX must embody these seven principles:... | `./docs/ISA_UX_STRATEGY.md` |
| UX -028 | Users trust ISA because every claim cites a source. Version ... | `./docs/ISA_UX_STRATEGY.md` |
| UX -029 | Standards professionals face regulatory deadlines and audit ... | `./docs/ISA_UX_STRATEGY.md` |
| UX -030 | Every interaction should feel instant (<200ms perceived late... | `./docs/ISA_UX_STRATEGY.md` |
| UX -031 | ISA's conclusions (gap analysis, coverage scores, recommenda... | `./docs/ISA_UX_STRATEGY.md` |
| UX -032 | ISA must feel recognisably GS1 (professional, authoritative,... | `./docs/ISA_UX_STRATEGY.md` |
| UX -033 | - Forms with >5 required fields on one screen... | `./docs/ISA_UX_STRATEGY.md` |
| UX -034 | Advisory version, dataset version, and last-updated timestam... | `./docs/ISA_UX_STRATEGY.md` |
| UX -035 | Every gap, recommendation, or coverage score must cite the d... | `./docs/ISA_UX_STRATEGY.md` |
| UX -036 | If ISA v1.0 is locked and v1.1 is draft, they must be visual... | `./docs/ISA_UX_STRATEGY.md` |
| UX -037 | ISA must feel like a GS1 tool (professional, authoritative, ... | `./docs/ISA_UX_STRATEGY.md` |
| UX -038 | Don't create a dashboard with 12 metrics just because it loo... | `./docs/ISA_UX_STRATEGY.md` |
| UX -039 | - Must align with ISA Design Contract (immutability, traceab... | `./docs/ISA_UX_STRATEGY.md` |
| UX -040 | - Must not introduce speculative features... | `./docs/ISA_UX_STRATEGY.md` |
| UX -041 | ISA must respect GS1's visual identity while modernising the... | `./docs/ISA_UX_STRATEGY.md` |
| UX -042 | ISA's UI copy must align with GS1 Style Guide Release 5.6:... | `./docs/ISA_UX_STRATEGY.md` |
| UX -043 | ISA must feel noticeably more usable than existing GS1 tools... | `./docs/ISA_UX_STRATEGY.md` |
| UX -044 | The visual identity must balance three competing requirement... | `./docs/ISA_VISUAL_BRANDING_DEVELOPMENT_PLAN.md` |
| UX -045 | **Authority:** The interface must signal credibility and tru... | `./docs/ISA_VISUAL_BRANDING_DEVELOPMENT_PLAN.md` |
| UX -046 | **EU Compliance:** As a regulatory tool, ISA must reflect pu... | `./docs/ISA_VISUAL_BRANDING_DEVELOPMENT_PLAN.md` |
| UX -047 | **GS1 Orange (#F26534)** functions as the accent color for s... | `./docs/ISA_VISUAL_BRANDING_DEVELOPMENT_PLAN.md` |
| UX -048 | Per GS1 guidelines, **GS1 Link (#0097A9)** must be used excl... | `./docs/ISA_VISUAL_BRANDING_DEVELOPMENT_PLAN.md` |
| UX -049 | ISA's information architecture must serve two distinct user ... | `./docs/ISA_VISUAL_BRANDING_DEVELOPMENT_PLAN.md` |
| UX -050 | ISA must achieve WCAG 2.1 Level AA compliance to meet EU Web... | `./docs/ISA_VISUAL_BRANDING_DEVELOPMENT_PLAN.md` |
| UX -051 | The GS1 color audit reveals that GS1 Blue (#00296C) on white... | `./docs/ISA_VISUAL_BRANDING_DEVELOPMENT_PLAN.md` |
| UX -052 | **Keyboard Navigation:** All interactive elements (buttons, ... | `./docs/ISA_VISUAL_BRANDING_DEVELOPMENT_PLAN.md` |
| UX -053 | **Exit Criteria:** Color palette matches GS1 specifications,... | `./docs/ISA_VISUAL_BRANDING_DEVELOPMENT_PLAN.md` |
| UX -054 | **Phase 1 (GS1 Compliance):** 100% color palette compliance ... | `./docs/ISA_VISUAL_BRANDING_DEVELOPMENT_PLAN.md` |
| UX -055 | - **Required By:** Phase 0 completion... | `./docs/ISA_VISUAL_BRANDING_DEVELOPMENT_PLAN.md` |
| UX -056 | 2. **Must ISA display the GS1 logo?**... | `./docs/ISA_VISUAL_BRANDING_DEVELOPMENT_PLAN.md` |
| UX -057 | - **Required By:** Phase 1 start... | `./docs/ISA_VISUAL_BRANDING_DEVELOPMENT_PLAN.md` |
| UX -058 | - **Required By:** Phase 2 start... | `./docs/ISA_VISUAL_BRANDING_DEVELOPMENT_PLAN.md` |
| UX -059 | **Approval Required From:** ISA Project Stakeholders, GS1 NL... | `./docs/ISA_VISUAL_BRANDING_DEVELOPMENT_PLAN.md` |
| UX -060 | - **Between filter groups** (GS1 tags AND sectors AND high i... | `./docs/autonomous-session-2025-12-17.md` |
| UX -061 | During implementation, the `news-tags.ts` file was moved fro... | `./docs/autonomous-session-2025-12-17.md` |
| UX -062 | **Server restart was required** to clear the Node.js module ... | `./docs/autonomous-session-2025-12-17.md` |
| UX -063 | **Effort:** 2-3 weeks / **Blocker:** User decision required... | `./ISA_STATUS_REPORT_2025-01-11.md` |
| UX -064 | The platform must transition from Lane C (internal use only)... | `./ISA_STATUS_REPORT_2025-01-11.md` |
| UX -065 | Should ISA transition from Lane C (internal use only) to Lan... | `./ISA_STATUS_REPORT_2025-01-11.md` |
| UX -066 | Should Advisory v1.1 be published to GS1 NL members? The rep... | `./ISA_STATUS_REPORT_2025-01-11.md` |
| UX -067 | ISA cannot be delivered to GS1 NL members without Lane B tra... | `./ISA_STATUS_REPORT_2025-01-11.md` |
| UX -068 | 209 instances of prohibited claims exist across 38 files, vi... | `./ISA_STATUS_REPORT_2025-01-11.md` |
| UX -069 | - Minimum 100 samples required for baseline... | `./docs/ALERTING_SYSTEM_DESIGN.md` |
| UX -070 | **Key Capabilities Required:**... | `./docs/ALTERNATIVE_FUTURES_EXPLORATION.md` |
| UX -071 | │    • Identify attributes that would become required       ... | `./docs/ALTERNATIVE_FUTURES_EXPLORATION.md` |
| UX -072 | │    • List of attributes that would become required        ... | `./docs/ALTERNATIVE_FUTURES_EXPLORATION.md` |
| UX -073 | 4. **Preparation Roadmap:** ISA recommends "Start with produ... | `./docs/ALTERNATIVE_FUTURES_EXPLORATION.md` |
| UX -074 | This document provides example queries for Ask ISA (ISA quer... | `./docs/ASK_ISA_QUERY_LIBRARY.md` |
| UX -075 | / # / Query text / Category / Sector / Expected answer / Cit... | `./docs/ASK_ISA_QUERY_LIBRARY.md` |
| UX -076 | Every answer must cite:... | `./docs/ASK_ISA_QUERY_LIBRARY.md` |
| UX -077 | - [ ] All required interfaces are defined in `/docs/CHANGELO... | `./docs/CHATGPT_INTEGRATION_WORKFLOW.md` |
| UX -078 | - [ ] No secrets or credentials required... | `./docs/CHATGPT_INTEGRATION_WORKFLOW.md` |
| UX -079 | - Manual effort required to assess source effectiveness... | `./docs/ISA_NEWSHUB_EVOLUTION_SUMMARY.md` |
| UX -080 | - Manual investigation required for every issue... | `./docs/ISA_NEWSHUB_EVOLUTION_SUMMARY.md` |
| UX -081 | 2. Track event capture SLAs (e.g., "EUDR deadline must be de... | `./docs/ISA_NEWSHUB_EVOLUTION_SUMMARY.md` |
| UX -082 | / **20** / **Audit Trail & Change History** / Complete loggi... | `./docs/ISA_STRATEGIC_DISCOVERY_REPORT.md` |
| UX -083 | / **32** / **EUDR Due Diligence Statement Generator** / Auto... | `./docs/ISA_STRATEGIC_DISCOVERY_REPORT.md` |
| UX -084 | / **Compliance Officer** / Manages CSRD/ESRS reporting oblig... | `./docs/ISA_STRATEGIC_DISCOVERY_REPORT.md` |
| UX -085 | The supply chain manager role prioritizes supplier data coll... | `./docs/ISA_STRATEGIC_DISCOVERY_REPORT.md` |
| UX -086 | This section enumerates all required tasks organized by func... | `./docs/ISA_Strategic_Roadmap.md` |
| UX -087 | - Required customers for break-even (at €200/month): 10-25... | `./docs/ISA_Strategic_Roadmap.md` |
| UX -088 | 1. **Schema Validation**: Ensure all required fields present... | `./docs/ISA_Strategic_Roadmap.md` |
| UX -089 | / **Completeness** / 95%+   / % of required fields populated... | `./docs/ISA_Strategic_Roadmap.md` |
| UX -090 | 1. All regulations must have CELEX ID... | `./docs/ISA_Strategic_Roadmap.md` |
| UX -091 | 2. Effective dates must be valid and in the past/future... | `./docs/ISA_Strategic_Roadmap.md` |
| UX -092 | 3. Cross-references must point to existing documents... | `./docs/ISA_Strategic_Roadmap.md` |
| UX -093 | 4. Titles must be non-empty and < 500 characters... | `./docs/ISA_Strategic_Roadmap.md` |
| UX -094 | 5. Status must be one of: active, proposed, repealed... | `./docs/ISA_Strategic_Roadmap.md` |
| UX -095 | 6. Language codes must be valid ISO 639-1... | `./docs/ISA_Strategic_Roadmap.md` |
| UX -096 | **Automated Tasks** (No Manual Intervention Required):... | `./docs/ISA_Strategic_Roadmap.md` |
| UX -097 | - **Manual effort required:** Every advisory version require... | `./docs/ISA_V1_FORMALIZATION_TARGETS.md` |
| UX -098 | - **Manual export required:** Cannot export dataset subsets ... | `./docs/ISA_V1_FORMALIZATION_TARGETS.md` |
| UX -099 | ISA must support real decisions, not just display informatio... | `./docs/META_PHASE_STRATEGIC_EXPLORATION_PLAN.md` |
| UX -100 | AI-assisted reasoning requires explainability and trust sign... | `./docs/META_PHASE_STRATEGIC_EXPLORATION_PLAN.md` |
