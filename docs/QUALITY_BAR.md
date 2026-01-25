# ISA Quality Bar

**Version:** 1.0  
**Date:** 14 January 2025  
**Purpose:** Define quality standards for ISA advisory outputs and documentation  
**Authority:** ISA Governance Board

---

## Overview

The Intelligent Standards Architect (ISA) quality bar ensures that all advisory outputs, documentation, and technical artifacts meet professional standards for accuracy, clarity, traceability, and GS1 compliance. This document establishes the minimum quality requirements for ISA deliverables and the validation process to ensure compliance.

---

## Quality Dimensions

ISA quality is measured across five dimensions:

1. **Analytical Rigour:** Accuracy, completeness, and traceability of advisory findings
2. **Technical Correctness:** Schema validity, API compatibility, and data integrity
3. **GS1 Style Compliance:** Adherence to GS1 Style Guide Release 5.6 for human-readable outputs
4. **Accessibility:** Compliance with accessibility standards (alt text, colour usage, etc.)
5. **Reproducibility:** Ability to reproduce advisory outputs from frozen datasets and documented processes

---

## 1. Analytical Rigour

### Requirements

**Advisory Reports MUST:**
- Reference only datasets registered in frozen dataset registry
- Include SHA256 hashes for all source artifacts
- Document mapping methodology and confidence scoring logic
- Provide traceability from ESRS datapoints to GS1 attributes
- Classify gaps with clear severity criteria (critical, moderate, low-priority)
- Prioritise recommendations with implementation timeframes (short-term, medium-term, long-term)

**Validation:**
- [ ] All dataset IDs exist in dataset_registry_v1.0_FROZEN.json
- [ ] All source artifact SHA256 hashes are documented
- [ ] Mapping methodology is explicitly stated
- [ ] Gap classifications follow documented taxonomy
- [ ] Recommendations include actionable next steps

**Tools:**
- `pnpm validate:advisory` – Validates advisory JSON against schema and dataset registry
- `pnpm canonicalize:advisory` – Ensures deterministic ordering for version comparison

---

## 2. Technical Correctness

### Requirements

**JSON Schemas MUST:**
- Validate against JSON Schema Draft 2020-12
- Include `$schema`, `$id`, `title`, `description`, and `type` fields
- Define all required fields explicitly
- Use appropriate data types (string, number, boolean, array, object)
- Include format constraints where applicable (date-time, uri, email, etc.)

**JSON Data Files MUST:**
- Validate against their corresponding schemas
- Use deterministic ordering (sorted by stable IDs)
- Include provenance metadata (generatedAt, sourceArtifacts)
- Use RFC3339 format for timestamps (with timezone)
- Reference only valid dataset IDs from frozen registry

**APIs MUST:**
- Follow tRPC conventions for type safety
- Include input validation (Zod schemas)
- Return typed responses with error handling
- Document all endpoints in API documentation
- Include Vitest regression tests for critical procedures

**Validation:**
- [ ] JSON validates against schema (ajv validation)
- [ ] All timestamps are RFC3339 with timezone
- [ ] All dataset IDs exist in frozen registry
- [ ] tRPC procedures have input validation
- [ ] Vitest tests pass for all critical procedures

**Tools:**
- `pnpm validate:advisory` – JSON schema validation
- `pnpm test` – Vitest regression tests
- `pnpm typecheck` – TypeScript type checking

---

## 3. GS1 Style Compliance

### Requirements

**Human-Readable Outputs MUST:**
- Follow GS1 Style Guide Release 5.6
- Use British English spelling (analyse, organisation, standardise)
- Use sentence case for headings
- Spell out abbreviations on first use
- Use date format DD MM YYYY (e.g., 14 December 2024)
- NOT capitalise "standard" when used with GS1 (except in document titles)
- Include alt text for all images
- NOT use only colour to convey meaning
- Use GS1 glossary (www.gs1.org/glossary) for terminology

**Machine-Readable Outputs MUST NOT:**
- Be modified for GS1 Style Guide compliance
- Use British English spelling in field names
- Change stable API field names for style reasons

**Validation:**
- [ ] British English spelling (no "analyze", "organization", "standardize")
- [ ] Sentence case headings (no "Gap Analysis for ESRS E1")
- [ ] Abbreviations spelled out on first use
- [ ] Date format DD MM YYYY (no "December 14, 2024")
- [ ] "standard" not capitalised (except in document titles)
- [ ] All images have alt text
- [ ] Colour not used exclusively to convey meaning
- [ ] Terminology from GS1 glossary

**Tools:**
- `pnpm lint:style` – Markdownlint + British English spell-checker (✅ IMPLEMENTED)
- Manual review against Top 20 Style Rules checklist

**Templates:**
- `/docs/templates/ADVISORY_REPORT_TEMPLATE.md` – GS1-compliant advisory report template
- `/docs/templates/GAP_ANALYSIS_TEMPLATE.md` – GS1-compliant gap analysis template
- `/docs/templates/RECOMMENDATION_TEMPLATE.md` – GS1-compliant recommendation template

**Reference:**
- `/docs/STYLE_GUIDE_ADOPTION.md` – ISA style adoption guide
- `/docs/references/gs1/ISA_TOP_20_STYLE_RULES.md` – Top 20 GS1 style rules for ISA

---

## 4. Accessibility

### Requirements

**All Outputs MUST:**
- Include alt text for images (descriptive, not decorative)
- NOT use colour as the only way to convey meaning
- Use sufficient colour contrast (WCAG AA minimum)
- Provide text alternatives for flowcharts and diagrams
- Use semantic HTML headings (h1, h2, h3) in web outputs
- Support keyboard navigation in interactive UIs

**Validation:**
- [ ] All images have descriptive alt text
- [ ] Charts use patterns/line styles in addition to colour
- [ ] Colour contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text
- [ ] Flowcharts have text descriptions
- [ ] HTML uses semantic headings
- [ ] Interactive UIs support keyboard navigation

**Tools:**
- Manual review for alt text
- Colour contrast checker (e.g., WebAIM Contrast Checker)
- Accessibility audit tools (e.g., axe DevTools)

**Reference:**
- GS1 Style Guide Section 2.8.2: Accessibility for All
- EAA European Accessibility Act regulation

---

## 5. Reproducibility

### Requirements

**Advisory Outputs MUST:**
- Be reproducible from frozen datasets and documented processes
- Include complete provenance metadata
- Reference specific dataset versions (not "latest")
- Document all analysis scripts and tools used
- Include SHA256 hashes for all source artifacts

**Validation:**
- [ ] All datasets referenced by frozen registry version
- [ ] Source artifact SHA256 hashes documented
- [ ] Analysis scripts stored in `/scripts` directory
- [ ] Provenance metadata includes generatedAt timestamp
- [ ] Advisory can be regenerated from frozen inputs

**Tools:**
- `sha256sum` – Compute and verify file hashes
- `pnpm validate:advisory` – Verify dataset references

---

## Style Compliance Checklist

Use this checklist before delivering advisory outputs:

### Critical Checks (MUST comply)

- [ ] "standard" is NOT capitalised (except in document titles)
- [ ] All abbreviations spelled out on first use
- [ ] All images have alt text
- [ ] Colour is NOT the only way to convey meaning

### High-Priority Checks (SHOULD comply)

- [ ] British English spelling (analyse, organisation, etc.)
- [ ] Sentence case for all headings
- [ ] GS1 glossary used for terminology
- [ ] Date format: DD MM YYYY

### Medium-Priority Checks (RECOMMENDED)

- [ ] Document titles italicised (unlinked)
- [ ] "e.g." has comma after second full stop
- [ ] No Oxford comma (unless needed for clarity)
- [ ] Registered trademarks (®) used correctly

### Low-Priority Checks (OPTIONAL)

- [ ] Single space after full stop
- [ ] No "&" or "+" in running text
- [ ] Hyphens in compound adjectives

---

## Quality Gates

### Pre-Checkpoint Quality Gate

Before creating a checkpoint, verify:

1. **Analytical Rigour:**
   - [ ] All dataset references validated
   - [ ] Source artifact hashes documented
   - [ ] Mapping methodology documented

2. **Technical Correctness:**
   - [ ] JSON validates against schema
   - [ ] Vitest tests pass
   - [ ] TypeScript compiles without errors

3. **GS1 Style Compliance:**
   - [ ] Critical style checks passed
   - [ ] High-priority style checks passed

4. **Accessibility:**
   - [ ] All images have alt text
   - [ ] Colour not used exclusively

5. **Reproducibility:**
   - [ ] Frozen dataset references
   - [ ] Provenance metadata complete

### Pre-Delivery Quality Gate

Before delivering advisory outputs to stakeholders, verify:

1. **All Pre-Checkpoint checks passed**
2. **Peer review completed** (if applicable)
3. **Stakeholder feedback incorporated** (if applicable)
4. **Documentation SHA256 hashes updated**
5. **Changelog updated** (if applicable)

---

## Continuous Improvement

### Quality Metrics

Track the following metrics over time:

1. **Style Compliance Rate:** % of documents passing style checklist
2. **Schema Validation Pass Rate:** % of JSON files validating against schema
3. **Test Coverage:** % of tRPC procedures with Vitest tests
4. **Accessibility Score:** % of images with alt text, % of charts with patterns

**Target:** 100% compliance for all metrics

### Quality Review Cadence

- **Weekly:** Review new advisory outputs against quality bar
- **Monthly:** Review quality metrics and identify improvement areas
- **Quarterly:** Update quality bar based on lessons learned
- **Annually:** Review GS1 Style Guide for updates and revise adoption guide

---

## Exceptions and Waivers

### When to Request an Exception

Request a quality bar exception when:

1. GS1 Style Guide conflicts with regulatory document conventions
2. Accessibility requirements conflict with GS1 style preferences
3. Technical constraints prevent full compliance
4. Stakeholder feedback requires deviation from quality bar

### Exception Request Process

1. Document the exception in `/docs/QUALITY_BAR_EXCEPTIONS.md`
2. Include rationale and impact assessment
3. Propose mitigation measures
4. Obtain approval from ISA governance board
5. Review exception annually for continued validity

---

## Tools and Automation

### Implemented Tools

1. **`pnpm validate:advisory`** – Validates advisory JSON against schema and dataset registry
2. **`pnpm canonicalize:advisory`** – Ensures deterministic ordering
3. **`pnpm diff:advisory`** – Computes version-to-version diffs
4. **`pnpm test`** – Runs Vitest regression tests
5. **`pnpm typecheck`** – TypeScript type checking

### Planned Tools

1. **`pnpm lint:style`** – Markdownlint + British English spell-checker
2. **`pnpm check:accessibility`** – Automated accessibility checks
3. **`pnpm check:provenance`** – Verify source artifact hashes
4. **`pnpm check:quality`** – Run all quality checks in one command

---

## References

1. **GS1 Style Guide Release 5.6**, Approved, Jul 2025  
   Location: `/docs/references/gs1/GS1-Style-Guide.pdf`

2. **ISA Style Guide Adoption**  
   Location: `/docs/STYLE_GUIDE_ADOPTION.md`

3. **ISA Top 20 Style Rules**  
   Location: `/docs/references/gs1/ISA_TOP_20_STYLE_RULES.md`

4. **Advisory Diff Metrics**  
   Location: `/docs/ADVISORY_DIFF_METRICS.md`

5. **EAA European Accessibility Act**  
   Referenced in GS1 Style Guide Section 2.8.2

---

## Revision History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 14 January 2025 | Initial quality bar with GS1 style compliance | ISA Development Team |

---

**Document Status:** APPROVED  
**Next Review:** Quarterly or upon GS1 Style Guide update
