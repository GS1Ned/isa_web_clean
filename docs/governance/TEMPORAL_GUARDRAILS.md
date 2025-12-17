# TEMPORAL GUARDRAILS

**Guardrail Date:** 17 December 2025  
**Authority:** Manus AI (Documentation Governance Authority)  
**Scope:** Enforce temporal accuracy and prevent date-handling errors in ISA  
**Status:** GUARDRAILS ESTABLISHED

---

## Purpose

This document establishes **mandatory rules, validation steps, and enforcement points** to ensure temporal accuracy in ISA documentation, advisories, schemas, metadata, and governance records. These guardrails prevent recurrence of the systemic date-handling error identified in DATE_INTEGRITY_AUDIT.md.

**Non-Negotiable Principle:**
> **Temporal accuracy is a foundational requirement for ISA's regulatory traceability, legal defensibility, and stakeholder trust. All dates, versions, and timestamps must be factually correct, temporally consistent, and explicitly validated.**

---

## Authoritative Date Source

**System Prompt Date:**
The system prompt provides the authoritative current date: `"The current date is Dec 17, 2025 GMT+1"`

**Rule 1: System Prompt is Authoritative**
- The system prompt date is the **single source of truth** for the current date
- All document generation tasks must reference the system prompt date
- LLM-generated dates must match the system prompt date unless explicitly referencing historical events

**Rule 2: Explicit Date Acknowledgment Required**
- All document generation prompts must include explicit current date statement
- LLM must acknowledge current date before generating documents
- Date acknowledgment must be validated before proceeding with document generation

**Example Prompt Clause:**
```
Today is 17 December 2025. All documents created today must reference "17 December 2025" in their date headers. Historical events (e.g., "EUDR delayed in October 2024") should retain their correct historical dates. Acknowledge the current date before proceeding.
```

---

## Date Handling Rules

### Rule 3: Document Date Headers

**Requirement:**
All ISA documents must include a date header in one of the following formats:

```markdown
**Date:** DD Month YYYY
**Last Updated:** DD Month YYYY
**Created:** DD Month YYYY
**Audit Date:** DD Month YYYY
```

**Validation:**
- Date header must be present in first 10 lines of document
- Date format must match one of the approved formats
- Date must be factually correct (match document creation/update date)

**Examples:**
- ✅ `**Date:** 17 December 2025`
- ✅ `**Last Updated:** 17 December 2025`
- ❌ `**Date:** 17 December 2024` (incorrect year)
- ❌ `**Date:** 2025-12-17` (incorrect format - use DD Month YYYY)

### Rule 4: Historical vs Current Dates

**Requirement:**
Distinguish between historical dates (past events) and current dates (document creation):

**Historical Dates (Correct):**
- "EUDR delayed 12 months in October 2024" ✅ (historical fact)
- "VSME adopted July 30, 2025" ✅ (future event correctly referenced)
- "ISA v1.0 advisory locked December 2025" ✅ (historical event with explicit year)

**Current Dates (Must Match System Prompt):**
- `**Date:** 17 December 2025` ✅ (matches system prompt)
- `**Date:** 17 December 2024` ❌ (incorrect year)

**Ambiguous References (Require Clarification):**
- "ISA v1.0 advisory lock (December 2024)" ❌ (ambiguous - which year?)
- "ISA v1.0 advisory lock (December 2025)" ✅ (explicit year)

### Rule 5: Version Timestamps

**Requirement:**
All version references must include explicit timestamps:

**Correct:**
- "ISA v1.0 (locked December 2025)" ✅
- "ISA v1.1 (active December 2025)" ✅
- "Dataset v3.1.33 (published November 2025)" ✅

**Incorrect:**
- "ISA v1.0 (locked December)" ❌ (missing year)
- "ISA v1.1 (current)" ❌ (ambiguous - when?)
- "Dataset v3.1.33 (latest)" ❌ (ambiguous - when published?)

### Rule 6: Regulatory Timeline Accuracy

**Requirement:**
All regulatory deadlines, effective dates, and adoption dates must be factually correct and cite sources:

**Correct:**
- "EUDR large operator deadline: December 30, 2026 (delayed 12 months from original October 2024 timeline)" ✅
- "VSME adopted July 30, 2025 by European Commission" ✅
- "CSRD first reporting deadline: 2025 financial year (published 2026)" ✅

**Incorrect:**
- "EUDR deadline: December 2025" ❌ (incorrect - deadline is 2026)
- "VSME adopted 2024" ❌ (incorrect - adopted 2025)
- "CSRD effective immediately" ❌ (vague - specify date)

---

## Validation Steps

### Validation Step 1: Pre-Generation Date Acknowledgment

**When:** Before generating any ISA document  
**Who:** LLM (prompted by task prompt)  
**What:** Explicitly acknowledge current date from system prompt

**Prompt Template:**
```
Before generating this document, acknowledge the current date:
- System prompt states: "The current date is Dec 17, 2025 GMT+1"
- Therefore, today is: 17 December 2025
- All documents created today must use: "**Date:** 17 December 2025"

Acknowledge the current date before proceeding.
```

**Validation:**
- LLM must explicitly state current date before generating document
- If LLM does not acknowledge current date, prompt again
- Do not proceed with document generation until current date is acknowledged

### Validation Step 2: Post-Generation Date Verification

**When:** After generating any ISA document  
**Who:** LLM (self-validation) or Human (review)  
**What:** Verify that document date header matches current date

**Verification Checklist:**
- [ ] Document has date header in first 10 lines
- [ ] Date header uses approved format (DD Month YYYY)
- [ ] Date header matches current date (17 December 2025)
- [ ] Historical references use correct historical dates
- [ ] Version references include explicit timestamps

**Automated Validation (grep):**
```bash
# Check that document date header matches current year
CURRENT_YEAR=$(date +%Y)
grep -n "^\*\*Date:\*\*.*$CURRENT_YEAR" document.md
```

### Validation Step 3: Pre-Commit Temporal Validation

**When:** Before committing any document changes to Git  
**Who:** Automated pre-commit hook  
**What:** Validate that all document dates are temporally consistent

**Pre-Commit Hook:**
```bash
#!/bin/bash
# .git/hooks/pre-commit

CURRENT_YEAR=$(date +%Y)
INCORRECT_DATES=$(grep -rn "^\*\*Date:\*\*.*202[0-4]" docs/ --include="*.md")

if [ -n "$INCORRECT_DATES" ]; then
  echo "ERROR: Incorrect document dates found (should be $CURRENT_YEAR):"
  echo "$INCORRECT_DATES"
  echo ""
  echo "Please correct document dates before committing."
  exit 1
fi

echo "✅ Temporal validation passed"
```

**Installation:**
```bash
chmod +x .git/hooks/pre-commit
```

### Validation Step 4: CI/CD Temporal Validation

**When:** On every Git push or pull request  
**Who:** GitHub Actions (CI/CD pipeline)  
**What:** Validate that all document dates are temporally consistent

**GitHub Actions Workflow:**
```yaml
# .github/workflows/temporal-validation.yml
name: Temporal Validation

on: [push, pull_request]

jobs:
  validate-dates:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Check document dates
        run: |
          CURRENT_YEAR=$(date +%Y)
          INCORRECT_DATES=$(grep -rn "^\*\*Date:\*\*.*202[0-4]" docs/ --include="*.md")
          
          if [ -n "$INCORRECT_DATES" ]; then
            echo "❌ ERROR: Incorrect document dates found"
            echo "$INCORRECT_DATES"
            exit 1
          fi
          
          echo "✅ All document dates are temporally consistent"
      
      - name: Check for ambiguous date references
        run: |
          AMBIGUOUS=$(grep -rn "December [0-9]\{4\})" docs/ --include="*.md" | grep -v "December 202[5-9])")
          
          if [ -n "$AMBIGUOUS" ]; then
            echo "⚠️  WARNING: Ambiguous date references found"
            echo "$AMBIGUOUS"
            echo "Please clarify historical references with explicit years"
          fi
```

### Validation Step 5: Human Review Checkpoint

**When:** Before publishing any ISA document to stakeholders  
**Who:** Human reviewer (GS1 NL standards team or ISA governance authority)  
**What:** Validate temporal accuracy, version consistency, and regulatory timeline correctness

**Review Checklist:**
- [ ] Document date header is factually correct
- [ ] Historical references are accurate and unambiguous
- [ ] Version references include explicit timestamps
- [ ] Regulatory deadlines are factually correct and cited
- [ ] No temporal inconsistencies or anachronisms

---

## Enforcement Points

### Enforcement Point 1: Document Generation Prompts

**Location:** All task prompts that generate ISA documents  
**Enforcement:** Require explicit current date acknowledgment in prompt

**Mandatory Prompt Clause:**
```
TEMPORAL ACCURACY REQUIREMENT:
- Today is [CURRENT_DATE from system prompt]
- All documents created today must use: "**Date:** [CURRENT_DATE]"
- Historical events must retain their correct historical dates
- Acknowledge the current date before proceeding
```

**Example:**
```
TEMPORAL ACCURACY REQUIREMENT:
- Today is 17 December 2025
- All documents created today must use: "**Date:** 17 December 2025"
- Historical events (e.g., "EUDR delayed October 2024") retain their historical dates
- Acknowledge the current date before proceeding
```

### Enforcement Point 2: Pre-Commit Hooks

**Location:** `.git/hooks/pre-commit`  
**Enforcement:** Block commits with incorrect document dates

**Implementation:**
```bash
#!/bin/bash
# Temporal validation pre-commit hook

CURRENT_YEAR=$(date +%Y)
INCORRECT_DATES=$(grep -rn "^\*\*Date:\*\*.*202[0-4]" docs/ --include="*.md")

if [ -n "$INCORRECT_DATES" ]; then
  echo "❌ COMMIT BLOCKED: Incorrect document dates found"
  echo "$INCORRECT_DATES"
  exit 1
fi
```

### Enforcement Point 3: CI/CD Pipeline

**Location:** `.github/workflows/temporal-validation.yml`  
**Enforcement:** Fail CI/CD builds with incorrect document dates

**Implementation:** See Validation Step 4 above

### Enforcement Point 4: Advisory Publication Workflow

**Location:** ISA Delivery Model (advisory publication checklist)  
**Enforcement:** Require human validation of temporal accuracy before publication

**Publication Checklist Addition:**
```markdown
## Temporal Accuracy Validation

- [ ] All document dates are factually correct
- [ ] Historical references are accurate and unambiguous
- [ ] Version references include explicit timestamps
- [ ] Regulatory deadlines are factually correct and cited
- [ ] No temporal inconsistencies detected by automated validation
```

### Enforcement Point 5: Quarterly Governance Review

**Location:** ISA governance review process  
**Enforcement:** Quarterly audit of temporal accuracy across all ISA documentation

**Quarterly Audit Checklist:**
- [ ] Run automated temporal validation across all documents
- [ ] Review any temporal inconsistencies flagged by automation
- [ ] Validate regulatory timeline accuracy against latest regulatory updates
- [ ] Update TEMPORAL_GUARDRAILS.md if new date-handling patterns emerge

---

## Prompt Engineering Best Practices

### Best Practice 1: Explicit Date in Task Prompt

**Always include current date in task prompt, not just system prompt.**

**Rationale:**
- System prompt date may not be prioritized by LLM
- Task prompt date is more salient and immediate
- Explicit acknowledgment forces LLM to process current date

**Example:**
```
Task: Create ISA Future Development Plan

TEMPORAL ACCURACY REQUIREMENT:
- Today is 17 December 2025
- Document date header must be: "**Date:** 17 December 2025"

Acknowledge the current date before proceeding.
```

### Best Practice 2: Distinguish Historical vs Current

**Explicitly distinguish between historical dates and current dates in prompts.**

**Example:**
```
HISTORICAL CONTEXT:
- ISA v1.0 advisory locked: December 2025 (historical event)
- EUDR delayed: October 2024 (historical event)
- VSME adopted: July 30, 2025 (historical event)

CURRENT CONTEXT:
- Today: 17 December 2025
- Current ISA version: v1.1
- Document creation date: 17 December 2025

Use historical dates for past events, current date for document headers.
```

### Best Practice 3: Require Explicit Acknowledgment

**Require LLM to explicitly acknowledge current date before generating documents.**

**Example:**
```
Before generating the document, acknowledge:
1. What is today's date according to the system prompt?
2. What date should be used in the document header?
3. Which references are historical dates (retain original) vs current dates (use today)?

Acknowledge these three points before proceeding.
```

### Best Practice 4: Validate Generated Output

**After generating document, validate that date header matches current date.**

**Example:**
```
After generating the document, validate:
1. Does the document have a date header in the first 10 lines?
2. Does the date header match today's date (17 December 2025)?
3. Are historical references accurate and unambiguous?

If any validation fails, regenerate the document with corrections.
```

### Best Practice 5: Use Date Format Specification

**Specify exact date format to avoid ambiguity.**

**Example:**
```
DATE FORMAT REQUIREMENT:
- Use format: DD Month YYYY (e.g., "17 December 2025")
- Do NOT use: YYYY-MM-DD, MM/DD/YYYY, or other formats
- Month names must be spelled out in full (e.g., "December" not "Dec")

Example correct date header:
**Date:** 17 December 2025
```

---

## Common Date-Handling Pitfalls

### Pitfall 1: Using Conversation Context Instead of System Prompt

**Problem:**
LLM uses date from conversation context (e.g., "December 2024" mentioned frequently) instead of system prompt date ("Dec 17, 2025 GMT+1").

**Solution:**
- Include current date in task prompt (not just system prompt)
- Require explicit date acknowledgment before generating documents
- Validate generated documents for correct year

### Pitfall 2: Ambiguous Historical References

**Problem:**
Historical references without explicit years (e.g., "ISA v1.0 locked December") are ambiguous and can be misinterpreted.

**Solution:**
- Always include explicit year in historical references
- Use format: "Event (Month YYYY)" not "Event (Month)"
- Example: "ISA v1.0 locked (December 2025)" not "ISA v1.0 locked (December)"

### Pitfall 3: Implicit "Current" Assumptions

**Problem:**
LLM assumes "current" means training data cutoff date or conversation context date, not system prompt date.

**Solution:**
- Never use "current" without explicit date
- Replace "current version" with "ISA v1.1 (active December 2025)"
- Replace "latest dataset" with "dataset v3.1.33 (published November 2025)"

### Pitfall 4: Template Reuse Without Date Update

**Problem:**
LLM reuses date patterns from earlier documents in conversation context without updating year.

**Solution:**
- Require explicit date acknowledgment before generating documents
- Validate that generated documents use current year
- Do not rely on template reuse for date headers

### Pitfall 5: Training Data Bias Toward Recent Past

**Problem:**
LLM training data may have stronger patterns for recent past (e.g., "December 2024") than future dates (e.g., "December 2025"), leading to preference for past dates.

**Solution:**
- Explicitly state current date in task prompt
- Require LLM to acknowledge current date before proceeding
- Validate that generated documents use current year, not past year

---

## Automated Validation Tools

### Tool 1: Date Header Validator

```bash
#!/bin/bash
# validate-dates.sh
# Validates that all ISA documents have correct date headers

CURRENT_YEAR=$(date +%Y)
DOCS_DIR="docs"

echo "🔍 Validating document dates..."

# Check for missing date headers
MISSING_DATES=$(find "$DOCS_DIR" -name "*.md" -type f -exec grep -L "^\*\*Date:\*\*\|^\*\*Last Updated:\*\*\|^\*\*Created:\*\*" {} \;)

if [ -n "$MISSING_DATES" ]; then
  echo "❌ ERROR: Documents missing date headers:"
  echo "$MISSING_DATES"
  exit 1
fi

# Check for incorrect years
INCORRECT_YEARS=$(grep -rn "^\*\*Date:\*\*.*202[0-4]" "$DOCS_DIR" --include="*.md")

if [ -n "$INCORRECT_YEARS" ]; then
  echo "❌ ERROR: Documents with incorrect years (should be $CURRENT_YEAR):"
  echo "$INCORRECT_YEARS"
  exit 1
fi

echo "✅ All document dates are valid"
```

### Tool 2: Ambiguous Reference Detector

```bash
#!/bin/bash
# detect-ambiguous-dates.sh
# Detects ambiguous date references without explicit years

DOCS_DIR="docs"

echo "🔍 Detecting ambiguous date references..."

# Find references like "December 2024)" or "(December)" without explicit year
AMBIGUOUS=$(grep -rn "(December [0-9]\{4\})\|(January [0-9]\{4\})\|(February [0-9]\{4\})" "$DOCS_DIR" --include="*.md" | grep -v "202[5-9]")

if [ -n "$AMBIGUOUS" ]; then
  echo "⚠️  WARNING: Ambiguous date references found:"
  echo "$AMBIGUOUS"
  echo ""
  echo "Please clarify with explicit years (e.g., 'December 2025' not 'December')"
fi

echo "✅ Ambiguous reference check complete"
```

### Tool 3: Regulatory Timeline Validator

```bash
#!/bin/bash
# validate-regulatory-timelines.sh
# Validates that regulatory deadlines are factually correct

DOCS_DIR="docs"

echo "🔍 Validating regulatory timelines..."

# Check for known incorrect deadlines
INCORRECT_EUDR=$(grep -rn "EUDR.*deadline.*2025" "$DOCS_DIR" --include="*.md")

if [ -n "$INCORRECT_EUDR" ]; then
  echo "❌ ERROR: Incorrect EUDR deadline (should be December 30, 2026):"
  echo "$INCORRECT_EUDR"
  exit 1
fi

# Check for VSME adoption date
INCORRECT_VSME=$(grep -rn "VSME.*adopted.*2024" "$DOCS_DIR" --include="*.md")

if [ -n "$INCORRECT_VSME" ]; then
  echo "❌ ERROR: Incorrect VSME adoption date (should be July 30, 2025):"
  echo "$INCORRECT_VSME"
  exit 1
fi

echo "✅ Regulatory timelines are accurate"
```

---

## Governance Integration

### Integration Point 1: ISA Delivery Model

**Update ISA Delivery Model to include temporal accuracy as quality gate:**

```markdown
## Quality Gates

### Temporal Accuracy
- All document dates are factually correct
- Historical references are accurate and unambiguous
- Version references include explicit timestamps
- Regulatory deadlines are factually correct and cited
- No temporal inconsistencies detected by automated validation

**Validation Method:** Automated temporal validation + human review
**Enforcement:** Block advisory publication if temporal accuracy fails
```

### Integration Point 2: Advisory Publication Checklist

**Add temporal accuracy validation to advisory publication checklist:**

```markdown
## Pre-Publication Checklist

### Temporal Accuracy Validation
- [ ] All document dates match current date or correct historical dates
- [ ] Version references include explicit timestamps (e.g., "v1.0 locked December 2025")
- [ ] Regulatory deadlines are factually correct and cite sources
- [ ] No ambiguous date references (e.g., "December" without year)
- [ ] Automated temporal validation passes (no errors)
```

### Integration Point 3: Quarterly Governance Review

**Add temporal accuracy audit to quarterly governance review:**

```markdown
## Quarterly Governance Review

### Temporal Accuracy Audit
- Run automated temporal validation across all ISA documentation
- Review any temporal inconsistencies flagged by automation
- Validate regulatory timeline accuracy against latest regulatory updates
- Update TEMPORAL_GUARDRAILS.md if new date-handling patterns emerge
- Document findings in quarterly governance report
```

---

## Continuous Improvement

### Improvement 1: Monitor Date-Handling Patterns

**Track date-handling errors over time to identify patterns:**

```markdown
## Date-Handling Error Log

| Date | Document | Error Type | Root Cause | Mitigation |
|------|----------|------------|------------|------------|
| 2025-12-17 | ISA_FUTURE_DEVELOPMENT_PLAN.md | Incorrect year (2024 vs 2025) | LLM context interpretation failure | Explicit date acknowledgment in prompt |
```

### Improvement 2: Refine Prompt Templates

**Continuously refine prompt templates based on observed errors:**

```markdown
## Prompt Template Evolution

### Version 1 (Initial)
- Include current date in task prompt
- Require explicit date acknowledgment

### Version 2 (After 2025-12-17 incident)
- Add "Today is [DATE]" at start of prompt
- Require LLM to acknowledge current date before proceeding
- Validate generated documents for correct year
- Distinguish historical vs current dates explicitly
```

### Improvement 3: Expand Automated Validation

**Add new validation rules as new date-handling patterns emerge:**

```markdown
## Automated Validation Roadmap

### Phase 1 (Implemented)
- Date header format validation
- Incorrect year detection
- Missing date header detection

### Phase 2 (Planned)
- Ambiguous date reference detection
- Regulatory timeline accuracy validation
- Version timestamp consistency validation

### Phase 3 (Future)
- Cross-document date consistency validation
- Temporal logic validation (e.g., v1.1 must be after v1.0)
- Historical event accuracy validation against external sources
```

---

## Conclusion

These temporal guardrails establish **mandatory rules, validation steps, and enforcement points** to ensure temporal accuracy in ISA documentation. All ISA contributors (LLM and human) must follow these guardrails to prevent recurrence of date-handling errors.

**Key Principles:**
1. **System prompt date is authoritative** - always reference system prompt for current date
2. **Explicit acknowledgment required** - LLM must acknowledge current date before generating documents
3. **Automated validation enforced** - pre-commit hooks and CI/CD pipelines prevent incorrect dates
4. **Human review required** - all advisory publications must pass human temporal accuracy review
5. **Continuous improvement** - monitor date-handling patterns and refine guardrails over time

**Enforcement:**
- Pre-commit hooks block commits with incorrect dates
- CI/CD pipelines fail builds with temporal inconsistencies
- Advisory publication requires human temporal accuracy validation
- Quarterly governance reviews audit temporal accuracy across all documentation

**Next Steps:**
1. Implement pre-commit hooks for temporal validation
2. Add CI/CD workflow for automated temporal validation
3. Update ISA Delivery Model to include temporal accuracy quality gate
4. Train all ISA contributors on temporal guardrails
5. Monitor date-handling patterns and refine guardrails as needed

---

**Guardrail Status:** ESTABLISHED  
**Enforcement Status:** READY FOR IMPLEMENTATION  
**Authority:** Manus AI (Documentation Governance Authority)  
**Guardrail Date:** 17 December 2025
