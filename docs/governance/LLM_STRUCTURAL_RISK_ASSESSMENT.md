# LLM STRUCTURAL RISK ASSESSMENT

**Assessment Date:** 17 December 2025  
**Assessor:** Manus AI (AI Output Risk Assessor)  
**Scope:** Identify LLM-related failure patterns relevant to ISA  
**Status:** COMPREHENSIVE ASSESSMENT COMPLETE

---

## Executive Summary

This assessment identifies **eight LLM-related structural weaknesses** that could compromise ISA's correctness, traceability, or long-term reliability. Each weakness is assessed for risk level (Low / Medium / High) and mitigations are proposed.

**Critical Findings:**
- **1 High-Risk weakness:** Stale temporal assumptions (CONFIRMED - affected 5 canonical documents)
- **4 Medium-Risk weaknesses:** Version drift, implicit assumptions, schema-content divergence, hallucinated facts
- **3 Low-Risk weaknesses:** Inconsistent identifier generation, silent overwrites, untraceable citations

**Immediate Actions Required:**
- Implement temporal guardrails (High priority)
- Establish version validation (Medium priority)
- Add schema-content validation (Medium priority)

---

## LLM Structural Weaknesses Identified

### 1. Stale Temporal Assumptions

**Description:**
LLMs may use implicit temporal assumptions from conversation context or training data rather than explicit system prompt date information. This results in incorrect years, outdated timelines, or anachronistic references.

**ISA Impact:**
- **CONFIRMED:** 5 canonical documents created on 17 December 2025 incorrectly reference "17 December 2024"
- Undermines regulatory traceability (incorrect document dates)
- Compromises version comparison (unclear which version is "current")
- Damages stakeholder trust (signals lack of quality control)

**Risk Level:** **HIGH**

**Evidence:**
- ISA_FUTURE_DEVELOPMENT_PLAN.md: "Date: 17 December 2024" (should be 2025)
- ISA_PRODUCT_VISION.md: "Date: 17 December 2024" (should be 2025)
- ISA_DELIVERY_MODEL.md: "Date: 17 December 2024" (should be 2025)
- ISA_DOCUMENTATION_MAP.md: "Date: 17 December 2024" (should be 2025)
- CHANGELOG_SUMMARY.md: "Date: 17 December 2024" (should be 2025)

**Root Cause:**
- System prompt states "The current date is Dec 17, 2025 GMT+1"
- LLM ignored system prompt and used "2024" from conversation context
- Conversation context includes frequent "December 2024" references (historical events)
- LLM prioritized contextual patterns over system prompt

**Mitigations:**
1. **Explicit Date Acknowledgment:** Require LLM to acknowledge current date before generating documents
2. **Temporal Validation:** Add automated validation to detect year mismatches
3. **Prompt Engineering:** Include current date in task prompt, not just system prompt
4. **Pre-Commit Hooks:** Check document dates against system date before committing
5. **Human Review:** Require human validation of document dates before publication

**Implementation Status:** Mitigations defined in TEMPORAL_GUARDRAILS.md

---

### 2. Version Drift or Silent Overwrites

**Description:**
LLMs may silently update version numbers, overwrite locked content, or introduce version inconsistencies when regenerating documents. This compromises version control and traceability.

**ISA Impact:**
- **POTENTIAL RISK:** ISA v1.0 advisory is locked and immutable, but LLM could silently update version numbers if prompted to "update the advisory"
- Could compromise diff computation (v1.0 vs v1.1 comparison requires stable v1.0)
- Could undermine stakeholder trust (silent updates violate governance principles)

**Risk Level:** **MEDIUM**

**Evidence:**
- No confirmed incidents (ISA v1.0 advisory has not been regenerated)
- ISA Delivery Model defines versioning rules, but no automated enforcement
- No pre-commit hooks prevent silent version updates

**Root Cause:**
- LLMs do not inherently understand version immutability
- Prompts like "update the advisory" could be interpreted as "regenerate with new version number"
- No automated validation prevents version number changes in locked files

**Mitigations:**
1. **Version Lock Files:** Create ADVISORY_v1.0_LOCK.md that explicitly forbids updates
2. **File Immutability Markers:** Add "LOCKED - DO NOT MODIFY" headers to v1.0 advisory files
3. **Automated Version Validation:** Check that locked files have not changed version numbers
4. **Explicit Prompting:** Always specify "create new version v1.1" rather than "update advisory"
5. **Human Review:** Require human validation before publishing any advisory updates

**Implementation Status:** Mitigations defined in TEMPORAL_GUARDRAILS.md

---

### 3. Implicit Assumptions Not Stated in Prompts

**Description:**
LLMs may make implicit assumptions about context, scope, or requirements that are not explicitly stated in prompts. This can lead to incorrect outputs, scope creep, or misaligned deliverables.

**ISA Impact:**
- **POTENTIAL RISK:** LLM may assume ISA should include features that violate anti-goals (e.g., data ingestion, validation services)
- Could compromise scope discipline (features added without explicit approval)
- Could undermine governance processes (implicit assumptions bypass approval workflows)

**Risk Level:** **MEDIUM**

**Evidence:**
- No confirmed incidents (anti-goals are explicitly defined in ISA Product Vision)
- Previous roadmaps included scope creep (multi-tenant support, white-label customization) that was later removed
- Implicit assumptions about "what a compliance platform should do" may have driven scope creep

**Root Cause:**
- LLMs have strong priors from training data about "typical" product features
- Prompts that do not explicitly state anti-goals allow LLM to fill gaps with implicit assumptions
- Conversation context may reinforce implicit assumptions if not explicitly contradicted

**Mitigations:**
1. **Explicit Anti-Goals in Prompts:** Always include anti-goals in task prompts
2. **Scope Validation:** Require human review of all feature proposals against anti-goals
3. **Prompt Templates:** Create standardized prompt templates that include anti-goals by default
4. **Automated Scope Checking:** Flag feature proposals that mention anti-goal keywords (e.g., "data ingestion", "validation")
5. **Human Review:** Require human validation of all feature proposals before implementation

**Implementation Status:** Anti-goals defined in ISA Product Vision, prompt templates pending

---

### 4. Inconsistent Identifier Generation

**Description:**
LLMs may generate inconsistent identifiers (IDs, codes, keys) when creating structured data. This can lead to duplicate records, broken references, or data integrity issues.

**ISA Impact:**
- **LOW RISK:** ISA uses database auto-increment IDs for most entities
- Dataset registry uses semantic IDs (e.g., `gs1nl.benelux.diy_garden_pet.v3.1.33`) that are manually defined
- Regulatory change log uses auto-increment IDs

**Risk Level:** **LOW**

**Evidence:**
- No confirmed incidents (ISA uses database auto-increment IDs)
- Dataset registry IDs are manually defined and validated
- No LLM-generated IDs in critical systems

**Root Cause:**
- LLMs do not have deterministic ID generation algorithms
- Random or sequential ID generation by LLM can create duplicates or gaps
- No validation ensures ID uniqueness or consistency

**Mitigations:**
1. **Database Auto-Increment:** Use database auto-increment IDs for all entities
2. **Semantic IDs:** Use human-readable semantic IDs for datasets (manually defined)
3. **ID Validation:** Add automated validation to detect duplicate or malformed IDs
4. **Explicit ID Rules:** Define ID generation rules in dataset registry schema
5. **Human Review:** Require human validation of all manually defined IDs

**Implementation Status:** Mitigations already in place (database auto-increment, semantic IDs)

---

### 5. Hallucinated "Current" Facts

**Description:**
LLMs may generate plausible-sounding but incorrect "current" facts (e.g., regulation effective dates, GS1 standard versions, dataset counts). This compromises correctness and traceability.

**ISA Impact:**
- **POTENTIAL RISK:** LLM may hallucinate regulation effective dates, GS1 standard versions, or dataset counts
- Could compromise advisory correctness (incorrect facts undermine recommendations)
- Could damage stakeholder trust (hallucinated facts are easily detected and undermine credibility)

**Risk Level:** **MEDIUM**

**Evidence:**
- No confirmed incidents in ISA v1.0 or v1.1 advisories (all facts traced to datasets)
- ISA Delivery Model requires 100% citation completeness
- Quality gates enforce "0 hallucinations or untraceable claims"

**Root Cause:**
- LLMs generate text based on probabilistic patterns, not deterministic facts
- Training data may contain outdated or incorrect information
- LLMs do not inherently distinguish between "known facts" and "plausible guesses"

**Mitigations:**
1. **Citation Requirements:** Require all facts to cite source dataset ID + version or source URL
2. **Automated Citation Validation:** Check that all factual claims have citations
3. **Human Review:** Require human validation of all advisory content before publication
4. **Dataset Registry:** Maintain authoritative dataset registry with version control
5. **Fact-Checking Prompts:** Include "cite sources for all facts" in task prompts

**Implementation Status:** Mitigations already in place (citation requirements, quality gates)

---

### 6. Schema-Content Divergence

**Description:**
LLMs may generate content that does not match database schema (e.g., incorrect field names, missing required fields, invalid data types). This causes runtime errors and data integrity issues.

**ISA Impact:**
- **CONFIRMED:** Database schema mismatch detected in esrs_datapoints table
  - Schema uses `esrs_standard` (snake_case)
  - Code references `esrsStandard` (camelCase)
  - Causes DrizzleQueryError: "Unknown column 'esrs_datapoints.esrsstandard'"

**Risk Level:** **MEDIUM**

**Evidence:**
- Console error: "Unknown column 'esrs_datapoints.esrsstandard' in 'field list'"
- Schema-code mismatch in regulation ESRS mappings query
- TypeScript compilation succeeds but runtime fails

**Root Cause:**
- LLMs do not have access to live database schema during code generation
- Schema changes (snake_case refactoring) not propagated to all code references
- No automated validation ensures schema-code consistency

**Mitigations:**
1. **Schema-First Development:** Define database schema before generating code
2. **Automated Schema Validation:** Add TypeScript type checking for database queries
3. **Drizzle Schema Sync:** Use Drizzle schema as single source of truth for field names
4. **Pre-Deployment Testing:** Run integration tests to detect schema-code mismatches
5. **Human Review:** Require human validation of database queries before deployment

**Implementation Status:** Schema mismatch identified, correction pending

---

### 7. Silent Overwrites of Locked Content

**Description:**
LLMs may silently overwrite locked content (e.g., ISA v1.0 advisory) when prompted to "update" or "improve" documents. This violates immutability guarantees and compromises traceability.

**ISA Impact:**
- **POTENTIAL RISK:** ISA v1.0 advisory is locked and immutable, but LLM could overwrite if prompted incorrectly
- Could compromise diff computation (v1.0 vs v1.1 comparison requires stable v1.0)
- Could undermine stakeholder trust (silent updates violate governance principles)

**Risk Level:** **LOW** (mitigated by explicit prompting and version control)

**Evidence:**
- No confirmed incidents (ISA v1.0 advisory has not been regenerated)
- ISA Delivery Model defines versioning rules and immutability guarantees
- Git version control provides rollback capability

**Root Cause:**
- LLMs do not inherently understand file immutability
- Prompts like "improve the advisory" could be interpreted as "overwrite existing file"
- No automated validation prevents overwrites of locked files

**Mitigations:**
1. **File Immutability Markers:** Add "LOCKED - DO NOT MODIFY" headers to v1.0 advisory files
2. **Explicit Prompting:** Always specify "create new version v1.1" rather than "update advisory"
3. **Git Protection:** Use Git branch protection or file locks to prevent overwrites
4. **Automated Validation:** Check that locked files have not been modified
5. **Human Review:** Require human validation before publishing any advisory updates

**Implementation Status:** Mitigations defined in ISA Delivery Model, automated validation pending

---

### 8. Untraceable Citations or Missing Sources

**Description:**
LLMs may generate citations that do not trace to actual sources (e.g., "According to EFRAG..." without URL or dataset ID). This undermines traceability and correctness.

**ISA Impact:**
- **LOW RISK:** ISA Delivery Model requires 100% citation completeness
- Quality gates enforce "all statements trace to datasets, regulations, or advisory artifacts"
- Human review validates citation completeness before publication

**Risk Level:** **LOW** (mitigated by quality gates and human review)

**Evidence:**
- No confirmed incidents in ISA v1.0 or v1.1 advisories
- ISA Delivery Model defines citation requirements
- Quality gates enforce citation completeness

**Root Cause:**
- LLMs generate text based on probabilistic patterns, not deterministic sources
- Training data may contain citations without URLs or dataset IDs
- LLMs do not inherently distinguish between "cited facts" and "plausible guesses"

**Mitigations:**
1. **Citation Requirements:** Require all facts to cite source dataset ID + version or source URL
2. **Automated Citation Validation:** Check that all factual claims have citations
3. **Human Review:** Require human validation of all advisory content before publication
4. **Citation Templates:** Provide citation templates in prompts (e.g., "[Source: dataset_id, version]")
5. **Fact-Checking Prompts:** Include "cite sources for all facts" in task prompts

**Implementation Status:** Mitigations already in place (citation requirements, quality gates)

---

## Risk Summary Table

| Weakness | Risk Level | ISA Impact | Mitigation Status |
|----------|-----------|------------|-------------------|
| 1. Stale Temporal Assumptions | **HIGH** | CONFIRMED - 5 canonical documents affected | Pending implementation |
| 2. Version Drift / Silent Overwrites | **MEDIUM** | POTENTIAL - No incidents, but no automated prevention | Partially implemented |
| 3. Implicit Assumptions Not Stated | **MEDIUM** | POTENTIAL - Scope creep in previous roadmaps | Partially implemented |
| 4. Inconsistent Identifier Generation | **LOW** | LOW - Database auto-increment prevents issues | Already implemented |
| 5. Hallucinated "Current" Facts | **MEDIUM** | POTENTIAL - No incidents, but risk remains | Already implemented |
| 6. Schema-Content Divergence | **MEDIUM** | CONFIRMED - esrs_datapoints schema mismatch | Correction pending |
| 7. Silent Overwrites of Locked Content | **LOW** | POTENTIAL - No incidents, version control mitigates | Partially implemented |
| 8. Untraceable Citations / Missing Sources | **LOW** | LOW - Quality gates enforce citation completeness | Already implemented |

---

## Priority Mitigation Actions

### Immediate (High Priority)

**1. Implement Temporal Guardrails**
- Create TEMPORAL_GUARDRAILS.md with explicit date handling rules
- Add automated validation to detect year mismatches
- Require LLM to acknowledge current date before generating documents
- Add pre-commit hooks to check document dates against system date

**2. Correct Schema-Content Divergence**
- Fix esrs_datapoints schema mismatch (esrsStandard → esrs_standard)
- Update all code references to match database schema
- Add automated schema validation to prevent recurrence

### Near-Term (Medium Priority)

**3. Establish Version Validation**
- Create version lock files for ISA v1.0 advisory
- Add automated validation to prevent version number changes in locked files
- Add file immutability markers to locked advisory files

**4. Strengthen Citation Validation**
- Add automated citation validation to detect missing sources
- Create citation templates for prompts
- Enhance human review process to validate citation completeness

**5. Prevent Implicit Assumptions**
- Create prompt templates that include anti-goals by default
- Add automated scope checking to flag anti-goal violations
- Enhance human review process to validate scope alignment

### Long-Term (Low Priority)

**6. Enhance Identifier Validation**
- Add automated validation to detect duplicate or malformed IDs
- Document ID generation rules in dataset registry schema

**7. Strengthen Immutability Guarantees**
- Add Git branch protection or file locks to prevent overwrites
- Add automated validation to detect locked file modifications

---

## Preventative Measures

### Prompt Engineering

**1. Explicit Date Acknowledgment**
- Always include current date in task prompt: "Today is 17 December 2025"
- Require LLM to acknowledge current date before generating documents
- Validate that generated documents use correct year

**2. Explicit Anti-Goals**
- Always include anti-goals in task prompt
- Require LLM to acknowledge anti-goals before proposing features
- Validate that feature proposals do not violate anti-goals

**3. Explicit Citation Requirements**
- Always include citation requirements in task prompt
- Require LLM to cite sources for all factual claims
- Validate that generated content has 100% citation completeness

### Automated Validation

**1. Temporal Validation**
- Pre-commit hooks check document dates against system date
- Automated validation detects year mismatches
- CI/CD pipeline validates temporal consistency

**2. Schema Validation**
- TypeScript type checking for database queries
- Drizzle schema as single source of truth for field names
- Integration tests detect schema-code mismatches

**3. Version Validation**
- Automated validation prevents version number changes in locked files
- Git branch protection or file locks prevent overwrites
- CI/CD pipeline validates version immutability

**4. Citation Validation**
- Automated validation detects missing sources
- Lint rules enforce citation format
- CI/CD pipeline validates citation completeness

### Human Review

**1. Advisory Content Review**
- GS1 NL standards team validates advisory correctness
- Human reviewers check citation completeness
- Stakeholders validate business value and strategic alignment

**2. Governance Review**
- Human reviewers validate scope alignment with anti-goals
- Stakeholders approve feature proposals before implementation
- Quarterly roadmap reviews ensure priorities align with mission

**3. Quality Assurance Review**
- Human reviewers validate temporal accuracy
- Stakeholders validate version immutability
- Pre-deployment reviews ensure quality gates are met

---

## Conclusion

Eight LLM-related structural weaknesses have been identified that could compromise ISA's correctness, traceability, or long-term reliability. One weakness (stale temporal assumptions) has been **confirmed** to affect ISA, and one (schema-content divergence) has been **confirmed** to cause runtime errors.

**Immediate actions required:**
1. Implement temporal guardrails (High priority)
2. Correct schema-content divergence (High priority)
3. Establish version validation (Medium priority)

**Long-term improvements:**
- Strengthen citation validation
- Prevent implicit assumptions
- Enhance identifier validation
- Strengthen immutability guarantees

All mitigations are documented in TEMPORAL_GUARDRAILS.md and will be enforced through prompt engineering, automated validation, and human review.

---

**Assessment Status:** COMPLETE  
**Next Steps:** Implement corrections (DATE_CORRECTION_ACTIONS.md) and establish guardrails (TEMPORAL_GUARDRAILS.md)  
**Assessor:** Manus AI (AI Output Risk Assessor)  
**Assessment Date:** 17 December 2025
