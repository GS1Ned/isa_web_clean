# Batch 01 Retry: Missing 4 Tasks

**Context:** You previously delivered CGPT-05 successfully. I need the remaining 4 tasks from Batch 01.

**CRITICAL FORMATTING RULES:**

1. **NO visual separator characters** (⸻, ===, ---) anywhere in code files
2. **Use forEach() instead of for...of** for URLSearchParams and similar iterators
3. **Import all types** used in function signatures
4. **Test Date inputs** for all date-related fields
5. **Remove implementation notes** from test files - only include actual test code

---

## CGPT-02: GPC-to-GS1 Attribute Mapping Engine

**Full spec:** See `/tasks/for_chatgpt/CGPT-02_gpc_to_gs1_mapping.md`

**Deliverables:**

1. `/server/utils/gpc-to-gs1-mapper.ts` - Core mapping engine
2. `/server/utils/gpc-to-gs1-mapper.test.ts` - Test suite (minimum 10 tests)
3. `/shared/gpc-attribute-mappings.ts` - Mapping configuration data

**Key Requirements:**

- Map GPC attributes to GS1 attribute codes
- Support confidence scoring (exact, partial, none)
- Handle multi-value mappings
- Include fallback logic for unmapped attributes
- Test with real GPC examples (netContent, allergenInfo, brandName)

**Success Criteria:**

```typescript
const result = mapGPCToGS1({
  gpcBrick: "10000123",
  attributes: {
    netContent: "500ml",
    allergenInfo: "Contains milk",
    brandName: "Example Brand"
  }
});

// Result should include:
// - gs1Attributes with mapped codes
// - confidence scores
// - unmapped attributes list
```

---

## CGPT-13: ESRS Coverage Gap Analysis Tool

**Full spec:** See `/tasks/for_chatgpt/CGPT-13_esrs_coverage_gap_analysis.md`

**Deliverables:**

1. `/server/utils/esrs-coverage-analyzer.ts` - Gap analysis engine
2. `/server/utils/esrs-coverage-analyzer.test.ts` - Test suite (minimum 8 tests)
3. `/shared/esrs-datapoint-catalog.ts` - ESRS datapoint definitions

**Key Requirements:**

- Analyze which ESRS datapoints are covered by GS1 standards
- Calculate coverage percentage per ESRS topic
- Identify high-priority gaps
- Support filtering by sector and materiality
- Generate actionable recommendations

**Success Criteria:**

```typescript
const analysis = analyzeESRSCoverage({
  sector: "food",
  esrsTopics: ["E1", "E2", "S1"],
  availableStandards: ["GDSN", "EPCIS", "CBV"]
});

// Result should include:
// - coveragePercentage per topic
// - coveredDatapoints list
// - gapDatapoints list with priority
// - recommendations for each gap
```

---

## CGPT-15: ISA User Guide Documentation

**Full spec:** See `/tasks/for_chatgpt/CGPT-15_user_guide.md`

**Deliverables:**

1. `/docs/USER_GUIDE.md` - Comprehensive user documentation
2. `/docs/QUICK_START.md` - 5-minute quick start guide
3. `/docs/FAQ.md` - Frequently asked questions

**Key Requirements:**

- Cover all major ISA features (regulations, standards, news, DPP tools)
- Include screenshots placeholders with descriptive alt text
- Step-by-step tutorials for common workflows
- Troubleshooting section
- Role-based guidance (compliance officer, product manager, data specialist)

**Success Criteria:**

- New user can complete first DPP mapping in <10 minutes following guide
- All features documented with clear examples
- FAQ covers top 10 user questions
- Markdown format with proper heading hierarchy
- No broken internal links

---

## CGPT-17: Data Quality Validation Library

**Full spec:** See `/tasks/for_chatgpt/CGPT-17_data_quality_validation.md`

**Deliverables:**

1. `/server/utils/data-quality-validator.ts` - Core validation engine
2. `/server/utils/data-quality-validator.test.ts` - Test suite (minimum 12 tests)
3. `/shared/validation-rules.ts` - Validation rule definitions

**Key Requirements:**

- Validate GTINs (reuse from CGPT-05 if needed)
- Validate GLNs (similar check digit algorithm)
- Validate dates (ISO 8601, YYMMDD formats)
- Validate URLs (Digital Link format)
- Validate enums (ESRS topics, sectors, etc.)
- Support custom validation rules
- Return structured validation results with error codes

**Success Criteria:**

```typescript
const result = validateData({
  gtin: "09506000134352",
  gln: "1234567890128",
  expiryDate: "2025-12-31",
  digitalLinkUrl: "https://id.gs1.org/01/09506000134352"
});

// Result should include:
// - valid: boolean
// - errors: Array<{field, code, message}>
// - warnings: Array<{field, code, message}>
```

**Integration Note:** Can import and reuse `validateGTIN` and `computeGTINCheckDigit` from `/server/utils/digital-link.ts` (already implemented in CGPT-05).

---

## Delivery Format

For each task, provide:

```
CGPT-XX: Task Name

Files Created

⸻ (OK to use separator BETWEEN tasks, NOT in code files)

File 1: /path/to/file.ts

[COMPLETE FILE CONTENT - no truncation]

⸻

File 2: /path/to/file.test.ts

[COMPLETE FILE CONTENT - no truncation]

⸻

File 3: /path/to/file.ts (if applicable)

[COMPLETE FILE CONTENT - no truncation]
```

**IMPORTANT:** 
- Include COMPLETE file contents, not truncated
- Remove all implementation notes from test files
- No visual separators INSIDE code files
- Test all deliverables compile and run before submitting

---

## Timeline

Please deliver all 4 tasks in a single response. Estimated total: ~2000 lines of code + documentation.
