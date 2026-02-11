# ISA Style Guide Adoption

**Version:** 1.0  
**Date:** 14 January 2025  
**Purpose:** Define how ISA adopts GS1 Style Guide Release 5.6 for advisory outputs  
**Authority:** GS1 Style Guide Release 5.6, Approved, Jul 2025

---

## Executive Summary

The Intelligent Standards Architect (ISA) is an advisory and mapping platform that analyzes EU ESG regulations against GS1 Netherlands sector standards. ISA's credibility depends on GS1 stakeholders trusting its outputs. This document establishes how ISA adopts the GS1 Style Guide to reduce review friction, improve clarity, and make ISA advisory deliverables "GS1-grade" for leadership and standards development audiences.

The adoption follows a clear principle: **human-readable outputs follow GS1 documentation conventions; machine-readable artifacts follow developer conventions**. This ensures ISA outputs are professionally consistent with GS1 publications while maintaining technical best practices for APIs, schemas, and code.

---

## Scope of Application

### Human-Readable Outputs (GS1 Style Guide APPLIES)

The following ISA outputs **MUST** follow GS1 Style Guide Release 5.6:

1. **Advisory Reports**
   - ISA_First_Advisory_Report_GS1NL.md and all future advisory Markdown files
   - PDF exports of advisory reports
   - HTML presentations of advisory findings

2. **Governance Documentation**
   - ISA_V1_LOCK_RECORD.md
   - ISA_V1_FORMALIZATION_COMPLETE.md
   - ADVISORY_OUTPUTS.md
   - ADVISORY_DIFF_METRICS.md

3. **Gap Analysis Documents**
   - Gap classification reports
   - Gap prioritization documents
   - Gap closure recommendations

4. **Dataset Documentation**
   - Dataset registry descriptions
   - Data source attribution documents
   - Metadata explanations

5. **Recommendation Reports**
   - Short-term, medium-term, and long-term recommendations
   - Implementation guidance documents
   - Stakeholder communication materials

### Machine-Readable Artifacts (GS1 Style Guide DOES NOT APPLY)

The following ISA outputs **MUST NOT** be modified for GS1 Style Guide compliance:

1. **JSON Schemas**
   - advisory-output.schema.json
   - All future JSON Schema definitions
   - **Rationale:** JSON Schema follows schema.org and W3C conventions (US English, camelCase)

2. **JSON Data Files**
   - ISA_ADVISORY_v1.0.json
   - dataset_registry_v1.0_FROZEN.json
   - All advisory JSON outputs
   - **Rationale:** Stable field names required for API compatibility and version comparison

3. **API Endpoints**
   - tRPC router definitions (server/routers/advisory.ts)
   - API parameter names
   - API response structures
   - **Rationale:** Developer conventions (US English, camelCase) for consistency with JavaScript/TypeScript ecosystem

4. **Database Schemas**
   - drizzle/schema.ts table and column names
   - SQL query field names
   - **Rationale:** Database conventions (US English, snake_case) for SQL compatibility

5. **Code and Scripts**
   - TypeScript/JavaScript variable names
   - Function names
   - Class names
   - **Rationale:** Programming language conventions (US English, camelCase/PascalCase)

---

## Top 20 GS1 Style Rules for ISA

ISA adopts the following 20 highest-impact rules from GS1 Style Guide Release 5.6. Full details available in `/docs/references/gs1/ISA_TOP_20_STYLE_RULES.md`.

### Critical Rules (MUST comply)

1. **Do NOT capitalise "standard"** (Section 2.3.1)
   - ✅ GS1 standards help companies
   - ❌ GS1 Standards help companies
   - Exception: Specific document titles (*GS1 Digital Link Standard*)

### High-Priority Rules (SHOULD comply)

2. **British English spelling** (Section 2.1)
   - Use: analyse, artefact, organisation, standardise
   - Exception: Machine-readable artifacts use US English

3. **Sentence case for headings** (Section 2.3)
   - ✅ Gap analysis for ESRS E1
   - ❌ Gap Analysis for ESRS E1

4. **Spell out abbreviations on first use** (Section 2.3.2)
   - ✅ European Sustainability Reporting Standards (ESRS)
   - ❌ ESRS (without spelling out first)

5. **Alt text for images** (Section 2.8.2.1)
   - All images MUST have descriptive alt text

6. **Do NOT use only colour to convey meaning** (Section 2.8.2.2)
   - Use patterns, line styles, or labels in addition to colour

7. **Use GS1 glossary for terminology** (Section 2.2)
   - Reference: www.gs1.org/glossary

### Medium-Priority Rules (RECOMMENDED)

8. **Registered trademark symbol ®** (Section 2.2)
   - Use once on first occurrence: GS1 DataBar®

9. **Date format: DD MM YYYY** (Section 2.5.2)
   - ✅ 1 December 2024 or 1 Dec 2024
   - ❌ December 1, 2024 or 01 Dec 2024

10. **Document titles in italics** (Section 2.4)
    - ✅ See the *GS1 General Specifications*
    - ✅ See the GS1 General Specifications (hyperlinked)

11. **Use "e.g." correctly** (Section 2.6.6)
    - ✅ (e.g., CSRD, EUDR, DPP)
    - ❌ (e.g. CSRD, EUDR, DPP)

12. **No comma before "and" in series** (Section 2.6.8)
    - ✅ CSRD, EUDR and DPP
    - ❌ CSRD, EUDR, and DPP
    - Exception: Use Oxford comma for clarity

13. **"that" vs. "which"** (Section 2.6.5)
    - "that" for essential clauses, "which" for non-essential

14. **"may" vs. "can"** (Section 2.6.4)
    - "can" = ability, "may" = permission

15. **Hyphens in compound words** (Section 2.6.1)
    - ✅ end-user requirements, point-of-sale systems

16. **Single space after full stop** (Section 2.6.3)
    - Do NOT use double-space

17. **Figure and table numbering** (Section 2.7)
    - Figures: Number and title below, centred
    - Tables: Number and title above, flush left

18. **Bulleted lists format** (Section 2.9)
    - Minimum two bullets
    - Lead-in sentence with colon
    - Capitalise first word

19. **No abbreviation of "and" or "plus"** (Section 2.5.1)
    - ✅ efficiency and safety
    - ❌ efficiency & safety (except in tables)

20. **Prefixes without hyphens** (Section 2.6.2)
    - ✅ recovered, untie
    - ✅ re-covered (when meaning could be confused)

---

## Implementation Strategy

### Phase 1: Immediate Compliance (Completed)

1. ✅ Ingest GS1 Style Guide Release 5.6
2. ✅ Extract top 20 rules for ISA
3. ✅ Create style adoption guide (this document)
4. ✅ Register style guide in metadata registry

### Phase 2: Alignment Review (Next)

1. Review existing ISA advisory reports for compliance
2. Propose minimal, non-disruptive edits
3. Do NOT alter analytical conclusions
4. Focus on presentation and clarity improvements

### Phase 3: Quality Bar Integration (Next)

1. Add style compliance checklist to QUALITY_BAR.md
2. Implement lightweight CI checks (markdownlint + custom rules)
3. Flag obvious violations without blocking development

### Phase 4: Ongoing Maintenance

1. Apply style guide to all new advisory outputs
2. Review style compliance before checkpoints
3. Update style guide adoption when GS1 releases new versions

---

## Style Compliance Checklist

Use this checklist before delivering advisory outputs:

### Critical Checks

- [ ] "standard" is NOT capitalised (except in document titles)
- [ ] All abbreviations spelled out on first use
- [ ] All images have alt text
- [ ] Colour is NOT the only way to convey meaning

### High-Priority Checks

- [ ] British English spelling (analyse, organisation, etc.)
- [ ] Sentence case for all headings
- [ ] GS1 glossary used for terminology

### Medium-Priority Checks

- [ ] Date format: DD MM YYYY
- [ ] Document titles italicised (unlinked)
- [ ] "e.g." has comma after second full stop
- [ ] No Oxford comma (unless needed for clarity)
- [ ] Registered trademarks (®) used correctly

### Low-Priority Checks

- [ ] Single space after full stop
- [ ] No "&" or "+" in running text
- [ ] Hyphens in compound adjectives

---

## Examples: Before and After

### Example 1: Capitalisation

**Before:**
> GS1 Standards help companies implement EU Regulations like CSRD and EUDR.

**After:**
> GS1 standards help companies implement EU regulations like the Corporate Sustainability Reporting Directive (CSRD) and the EU Deforestation Regulation (EUDR).

**Changes:**
- "Standards" → "standards" (Rule 1)
- "Regulations" → "regulations" (sentence case)
- Abbreviations spelled out on first use (Rule 4)

### Example 2: Date Format

**Before:**
> The advisory was published on December 14, 2024.

**After:**
> The advisory was published on 14 December 2024.

**Changes:**
- "December 14, 2024" → "14 December 2024" (Rule 9)

### Example 3: Terminology

**Before:**
> The data-base contains 11,197 records from the GS1 NL data pool.

**After:**
> The database contains 11,197 records from the GS1 NL data pool.

**Changes:**
- "data-base" → "database" (one word, Rule 18)

### Example 4: Lists

**Before:**
> ISA covers the following regulations: CSRD, EUDR, and DPP.

**After:**
> ISA covers the following regulations: CSRD, EUDR and DPP.

**Changes:**
- Removed Oxford comma before "and" (Rule 12)

---

## Exceptions and Edge Cases

### Exception 1: Machine-Readable Field Names

**Scenario:** JSON schema field names like "datapointId", "esrsStandard", "confidenceScore"

**Decision:** Do NOT change to British English or add hyphens. These are stable API contracts.

**Rationale:** GS1 Style Guide Section 2.1.1 explicitly exempts machine-readable artefacts.

### Exception 2: Existing Dataset IDs

**Scenario:** Dataset IDs like "ESRS_DATAPOINTS_v1.0", "GS1_NL_DIY_v1.0"

**Decision:** Do NOT change existing IDs. Use GS1 conventions for new IDs.

**Rationale:** Changing IDs breaks traceability and version comparison.

### Exception 3: Technical Terms

**Scenario:** Industry-standard terms like "JSON", "API", "tRPC", "Drizzle ORM"

**Decision:** Use standard capitalisation and spelling for technical terms.

**Rationale:** These are proper nouns or established technical brands.

### Exception 4: Regulatory Document Titles

**Scenario:** Official EU regulation titles like "Corporate Sustainability Reporting Directive"

**Decision:** Use official capitalisation from source documents.

**Rationale:** Regulatory titles are proper nouns with official capitalisation.

---

## Conflict Resolution

When GS1 Style Guide conflicts with other standards:

1. **GS1 vs. EU Regulatory Style:** Use EU official style for regulation titles and terminology; use GS1 style for ISA narrative.

2. **GS1 vs. ISO Standards:** When referencing ISO standards, use ISO official titles and formatting; use GS1 style for ISA analysis.

3. **GS1 vs. Developer Conventions:** Machine-readable artifacts follow developer conventions (US English, camelCase); human-readable outputs follow GS1 conventions.

4. **GS1 vs. Accessibility Standards:** Accessibility requirements (alt text, colour usage) take precedence over GS1 style preferences.

---

## Maintenance and Updates

### Version Control

- This adoption guide is versioned alongside ISA releases
- Current version: 1.0 (aligned with ISA v1.0)
- Updates required when GS1 releases new style guide versions

### Review Triggers

1. GS1 publishes new style guide version
2. ISA adds new output types (e.g., interactive dashboards)
3. Stakeholder feedback on style compliance
4. Regulatory changes affecting terminology

### Approval Process

1. Style guide updates proposed by ISA development team
2. Review by GS1 NL stakeholders
3. Approval by ISA governance board
4. Implementation in next ISA release

---

## References

1. **GS1 Style Guide Release 5.6**, Approved, Jul 2025  
   Location: `/docs/references/gs1/GS1-Style-Guide.pdf`  
   SHA256: `3ed3ca677a41a6c1883937160ba3652b9c892167f587641fb8f587ead9b28ca3`

2. **ISA Top 20 Style Rules**  
   Location: `/docs/references/gs1/ISA_TOP_20_STYLE_RULES.md`

3. **GS1 Style Guide Extract**  
   Location: `/docs/references/gs1/GS1_STYLE_GUIDE_EXTRACT.md`

4. **GS1 Glossary of Terms**  
   URL: https://www.gs1.org/glossary

5. **EAA European Accessibility Act Regulation**  
   Referenced in GS1 Style Guide Section 2.8.2

---

## Contact and Support

For questions about ISA style guide adoption:

- **Technical questions:** Review `/docs/references/gs1/ISA_TOP_20_STYLE_RULES.md`
- **Compliance questions:** Check this document's checklist section
- **Exceptions:** Document in `/docs/STYLE_GUIDE_EXCEPTIONS.md` (to be created)
- **Feedback:** Submit via ISA governance process

---

**Document Status:** APPROVED  
**Next Review:** Upon GS1 Style Guide version update or ISA v2.0 release
