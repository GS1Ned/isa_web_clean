# ISA News Hub Self-Check Assessment

**Assessment Date:** 24 January 2026  
**Assessor:** Manus AI  
**Document Version:** 1.0  
**Status:** FORMAL ASSESSMENT

---

## Executive Summary

This document presents the formal self-check assessment of the ISA News Hub against the 11 quality criteria defined in the ChatGPT-provided normative framework. The assessment follows the prescribed scoring rubric and identifies hard-gate failures, scores per criterion, and the overall ISA-grade determination.

**Overall Result: CONDITIONAL**

The ISA News Hub demonstrates strong foundations in source authority, GS1 relevance, and AI-enriched analysis, but falls short of full ISA-grade status due to gaps in decision value classification, event aggregation, and delta analysis.

---

## Stap A: Formele Beoordeling

### Check 1: Decision Value Definition

**Criterion:** Does every ingested news item answer at least one of these questions for a GS1 NL member?
- What legal obligation changed?
- What scope or threshold changed?
- What timeline changed?
- What interpretation or enforcement approach was clarified?
- What assumption was invalidated?

**Evidence:**
- Articles contain GS1 Impact Analysis explaining relevance
- Suggested Actions provide concrete next steps
- Regulation tags identify applicable regulations
- Impact level (HIGH/MEDIUM/LOW) indicates urgency

**Gap:**
- No explicit `decision_value_type` field classifying which question is answered
- Some articles may be "informational" without clear decision value

**Score: 2/3 (Partial)**

---

### Check 2: Obligation-Centric Detection

**Criterion:** Does the system detect obligation-centric language (shall, must, required, mandatory, deadline, penalty) rather than just regulation acronyms?

**Evidence:**
- IMPACT_KEYWORDS includes: "mandatory", "deadline", "enforcement", "penalty"
- AI processor prompt instructs: "Focus on regulations..."
- Impact level HIGH requires: "Final adoption, enforcement deadlines, mandatory requirements, penalties"

**Gap:**
- Detection is keyword-based, not semantic
- No explicit obligation language extraction
- "Shall" and "must" not in keyword lists

**Score: 2/3 (Partial)**

---

### Check 3: Lifecycle State Classification

**Criterion:** Is every article tagged with its regulatory lifecycle state?

**Evidence:**
- ✅ Database field `regulatory_state` implemented
- ✅ 8 states defined: PROPOSAL → POLITICAL_AGREEMENT → ADOPTED → DELEGATED_ACT_DRAFT → DELEGATED_ACT_ADOPTED → GUIDANCE → ENFORCEMENT_SIGNAL → POSTPONED_OR_SOFTENED
- ✅ Detection function `detectRegulatoryState()` with 50+ keywords
- ✅ 32 unit tests passing

**Gap:**
- Existing articles have NULL values (not backfilled)
- UI does not display lifecycle state

**Score: 2/3 (Partial - implemented but not visible)**

---

### Check 4: Authority-Weighted Validation

**Criterion:** Does the system apply authority hierarchy?
- Tier 1: EUR-Lex, EU institutions, official standards bodies
- Tier 2: Regulators, formal guidance
- Tier 3: Media, law firms (context only, never primary)

**Evidence:**
- ✅ Source types defined: EU_OFFICIAL, GS1_OFFICIAL, DUTCH_NATIONAL, INDUSTRY, MEDIA
- ✅ Credibility scores: EU_OFFICIAL = 1.0, DUTCH_NATIONAL = 0.95-1.0, GS1_OFFICIAL = 0.9
- ✅ 14 sources configured with explicit credibility scores
- ✅ No MEDIA sources currently enabled

**Gap:**
- Authority tier not displayed in UI
- No explicit Tier 1/2/3 classification in schema
- No validation that Tier 3 sources require Tier 1/2 confirmation

**Score: 2/3 (Partial)**

---

### Check 5: Event-Based Aggregation

**Criterion:** Are multiple articles about the same regulatory event collapsed or linked?

**Evidence:**
- Deduplication exists based on URL and title similarity
- `news-deduplicator.ts` implements cross-source deduplication

**Gap:**
- ❌ No event-based aggregation
- ❌ Multiple articles about same event (e.g., CSDDD adoption) remain separate
- ❌ No "related articles" linking
- ❌ No event entity extraction

**Score: 0/3 (FAIL) — HARD-GATE FAILURE**

---

### Check 6: Delta Analysis

**Criterion:** Does the system track what changed between regulatory versions?

**Evidence:**
- `whatHappened` field describes the change
- `whyItMatters` field explains impact

**Gap:**
- ❌ No before/after comparison
- ❌ No version tracking for regulations
- ❌ No "delta" field showing specific changes
- ❌ No historical state storage for comparison

**Score: 0/3 (FAIL) — HARD-GATE FAILURE**

---

### Check 7: Stability Risk Indicator

**Criterion:** Does the system flag when a regulatory position may still change?

**Evidence:**
- `newsType` includes PROPOSAL, GUIDANCE
- `impactLevel` LOW for "preliminary discussions"
- `regulatoryState` includes PROPOSAL, POLITICAL_AGREEMENT

**Gap:**
- No explicit "stability_risk" field
- No warning when regulation is not yet final
- UI does not distinguish draft from final

**Score: 1/3 (Minimal)**

---

### Check 8: Negative Signal Detection

**Criterion:** Does the system detect weakening, postponement, or exemption signals?

**Evidence:**
- ✅ Database fields: `is_negative_signal`, `negative_signal_keywords`
- ✅ 6 categories: POSTPONEMENT, EXEMPTION, SIMPLIFICATION, SCOPE_REDUCTION, VOLUNTARY, PHASED_IN
- ✅ 50+ keywords (EN + NL)
- ✅ Detection function `detectNegativeSignals()`
- ✅ 10 unit tests passing

**Gap:**
- Existing articles have NULL values (not backfilled)
- UI does not display negative signal indicator

**Score: 2/3 (Partial - implemented but not visible)**

---

### Check 9: Semantic Drift Control

**Criterion:** Does the system detect changes in the meaning of recurring regulatory terms?

**Evidence:**
- None

**Gap:**
- ❌ Not implemented
- ❌ No term definition tracking
- ❌ No semantic comparison over time
- ❌ No glossary or term registry

**Score: 0/3 (FAIL)**

---

### Check 10: ISA Output Contract (GS1 Mapping)

**Criterion:** Does every article map to specific GS1 standards, identifiers, or data models?

**Evidence:**
- ✅ `gs1ImpactTags`: 12 defined tags (IDENTIFICATION, PACKAGING_ATTRIBUTES, ESG_REPORTING, DUE_DILIGENCE, TRACEABILITY, DPP, etc.)
- ✅ `gs1ImpactAnalysis`: 2-3 sentences explaining GS1 relevance
- ✅ `suggestedActions`: 2-4 actionable steps mentioning GTIN, GLN, GDSN, EPCIS, Digital Link
- ✅ 100% of articles have GS1 analysis and suggested actions
- ✅ AI prompt explicitly instructs GS1 standard mapping

**Gap:**
- No direct linking to GS1 standard documentation
- No structured mapping to specific GDSN attributes or EPCIS events

**Score: 3/3 (PASS)**

---

### Check 11: Confidence Level Tagging

**Criterion:** Is every article tagged with a confidence level indicating source authority?

**Evidence:**
- ✅ Database field `confidence_level` implemented
- ✅ 4 levels: CONFIRMED_LAW, DRAFT_PROPOSAL, GUIDANCE_INTERPRETATION, MARKET_PRACTICE
- ✅ Detection function `detectConfidenceLevel()`
- ✅ Source-type aware (EU_OFFICIAL gets higher default)
- ✅ 6 unit tests passing

**Gap:**
- Existing articles have NULL values (not backfilled)
- UI does not display confidence level

**Score: 2/3 (Partial - implemented but not visible)**

---

## Scoring Summary

| Check | Criterion | Score | Status |
|-------|-----------|-------|--------|
| 1 | Decision Value Definition | 2/3 | PARTIAL |
| 2 | Obligation-Centric Detection | 2/3 | PARTIAL |
| 3 | Lifecycle State Classification | 2/3 | PARTIAL |
| 4 | Authority-Weighted Validation | 2/3 | PARTIAL |
| 5 | Event-Based Aggregation | 0/3 | **HARD-GATE FAIL** |
| 6 | Delta Analysis | 0/3 | **HARD-GATE FAIL** |
| 7 | Stability Risk Indicator | 1/3 | MINIMAL |
| 8 | Negative Signal Detection | 2/3 | PARTIAL |
| 9 | Semantic Drift Control | 0/3 | FAIL |
| 10 | ISA Output Contract (GS1 Mapping) | 3/3 | **PASS** |
| 11 | Confidence Level Tagging | 2/3 | PARTIAL |

**Total Score: 16/33 (48%)**

---

## Hard-Gate Failures

The following checks are identified as hard-gate failures that prevent ISA-GRADE status:

1. **Check 5: Event-Based Aggregation** — Multiple articles about the same regulatory event are not collapsed or linked. This creates noise and reduces decision efficiency.

2. **Check 6: Delta Analysis** — No tracking of what changed between regulatory versions. Users cannot see the specific changes that affect their compliance obligations.

---

## Overall Determination

| Grade | Criteria | Result |
|-------|----------|--------|
| **ISA-GRADE** | All checks ≥2/3, no hard-gate failures | ❌ NOT MET |
| **CONDITIONAL** | Total ≥50% OR ≤2 hard-gate failures | ✅ MET |
| **FAIL** | Total <50% AND >2 hard-gate failures | ❌ NOT APPLICABLE |

**Final Status: CONDITIONAL**

The ISA News Hub is **CONDITIONAL** — it demonstrates strong foundations but requires remediation of hard-gate failures before achieving ISA-GRADE status.

---

## Stap B: Gefaseerd Verbeterpad

### Phase 1: Immediate (Current Sprint)

**Objective:** Surface existing implementations in UI and backfill data

| Item | Rubric Criteria | Effort | Impact |
|------|-----------------|--------|--------|
| Add regulatory_state badge to NewsCard | Check 3 | 2h | HIGH |
| Add confidence_level badge to NewsCard | Check 11 | 2h | HIGH |
| Add negative_signal indicator to NewsCard | Check 8 | 2h | HIGH |
| Backfill existing articles with new fields | Checks 3, 8, 11 | 4h | HIGH |
| Add stability_risk warning for non-final regulations | Check 7 | 3h | MEDIUM |

**Expected Score Improvement:** +3 points (16 → 19/33, 58%)

**Criteria NOT addressed in Phase 1:**
- Check 5 (Event-Based Aggregation) — Open quality risk
- Check 6 (Delta Analysis) — Open quality risk
- Check 9 (Semantic Drift Control) — Open quality risk

---

### Phase 2: Short-Term (Next Sprint)

**Objective:** Address one hard-gate failure

| Item | Rubric Criteria | Effort | Impact |
|------|-----------------|--------|--------|
| Implement event entity extraction | Check 5 | 8h | CRITICAL |
| Add "related articles" linking | Check 5 | 4h | HIGH |
| Create event-based article grouping | Check 5 | 6h | HIGH |
| Add decision_value_type field | Check 1 | 4h | MEDIUM |
| Add obligation language detection (shall, must, required) | Check 2 | 4h | MEDIUM |

**Expected Score Improvement:** +4 points (19 → 23/33, 70%)

**Criteria NOT addressed in Phase 2:**
- Check 6 (Delta Analysis) — Open quality risk
- Check 9 (Semantic Drift Control) — Open quality risk

---

### Phase 3: Medium-Term (Future Sprints)

**Objective:** Address remaining hard-gate failure and advanced features

| Item | Rubric Criteria | Effort | Impact |
|------|-----------------|--------|--------|
| Implement regulation version tracking | Check 6 | 16h | CRITICAL |
| Add delta comparison view | Check 6 | 12h | HIGH |
| Store historical regulation states | Check 6 | 8h | HIGH |
| Create term registry/glossary | Check 9 | 12h | MEDIUM |
| Implement semantic drift detection | Check 9 | 20h | LOW |

**Expected Score Improvement:** +6 points (23 → 29/33, 88%)

---

## Open Quality Risks

The following criteria are explicitly deferred and remain as open quality risks:

| Criterion | Risk Description | Mitigation |
|-----------|------------------|------------|
| **Check 5: Event-Based Aggregation** | Users may see duplicate coverage of same event, reducing efficiency | Prioritize in Phase 2 |
| **Check 6: Delta Analysis** | Users cannot see what specifically changed, limiting decision precision | Prioritize in Phase 3 |
| **Check 9: Semantic Drift Control** | Term meanings may shift without detection, causing interpretation errors | Accept risk for now; revisit in Phase 3 |

---

## Conclusion

The ISA News Hub is **CONDITIONAL** — not yet ISA-GRADE, but with a clear path to achieving that status.

**Current State:**
- Strong GS1 mapping (Check 10: PASS)
- Solid source authority framework (Check 4: 2/3)
- AI-enriched analysis with actionable recommendations
- New regulatory intelligence features implemented but not visible

**Path to ISA-GRADE:**
1. Phase 1: Surface existing implementations (+3 points)
2. Phase 2: Address event aggregation hard-gate (+4 points)
3. Phase 3: Address delta analysis hard-gate (+6 points)

**Target:** ISA-GRADE status achievable within 3 sprints with focused execution.

---

**Document End**
