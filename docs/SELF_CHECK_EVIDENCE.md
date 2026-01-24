# ISA News Hub Self-Check Evidence

**Date:** 24 January 2026  
**Assessed by:** Manus AI  
**Purpose:** Collect evidence for formal self-check assessment

---

## Sample Article Analysis

### Article 1: "EU Publishes Measures to Boost Plastic Recycling Industry in Line with Dutch Call"

**Source:** Rijksoverheid - Infrastructuur en Waterstaat (DUTCH_NATIONAL)  
**Published:** 23 Dec 2025  
**Impact Level:** MEDIUM  
**Regulation Tags:** PPWR, ESPR, Green Claims  
**AI-Enriched:** Yes

**GS1 Impact Tags:**
- PACKAGING_ATTRIBUTES
- CIRCULAR_ECONOMY
- PRODUCT_MASTER_DATA

**Sector Tags:**
- RETAIL
- PACKAGING
- GENERAL

**GS1 Impact Analysis (verbatim):**
> "Compliance with recycling mandates requires robust, standardized data about packaging composition, weight, and recyclability status. GDSN must be utilized to exchange standardized packaging attributes, ensuring accurate master data is available to retailers and waste processors. GS1 Digital Link can provide consumers and recyclers with immediate access to specific recycling instructions linked to the GTIN."

**Suggested Actions (4 items):**
1. Review and update product master data in GDSN to include mandatory PPWR-related packaging attributes (e.g., material composition, recycled content percentage, recyclability score).
2. Engage with packaging suppliers to ensure they provide verifiable data supporting recycling claims.
3. Prepare for future Digital Product Passport (DPP) requirements by structuring packaging sustainability data using GS1 Web Vocabulary.
4. Monitor final PPWR text for specific labeling and marking requirements regarding plastic recyclability.

---

## Database Statistics (from SQL queries)

| Metric | Value |
|--------|-------|
| Total Articles | 34 |
| EU_OFFICIAL Sources | ~20 |
| DUTCH_NATIONAL Sources | ~10 |
| GS1_OFFICIAL Sources | ~4 |
| HIGH Impact | ~8 |
| MEDIUM Impact | ~20 |
| LOW Impact | ~6 |
| With GS1 Analysis | 34 (100%) |
| With Suggested Actions | 34 (100%) |
| Credibility 1.00 | ~24 |
| Credibility 0.95 | ~10 |

---

## Source Configuration Analysis

**Total Configured Sources:** 14
**Enabled Sources:** 11
**Disabled Sources:** 3 (WAF blocks)

**Source Types:**
- EU_OFFICIAL: 5 sources (EUR-Lex, EC Press Corner, EC Circular Economy, EFRAG, EUR-Lex Press)
- GS1_OFFICIAL: 3 sources (GS1 NL, GS1 Global, GS1 EU)
- DUTCH_NATIONAL: 5 sources (Green Deal Zorg, ZES, Rijksoverheid IenW, Rijksoverheid Green Deals, AFM)

**Credibility Scores:**
- EU_OFFICIAL: 1.0
- DUTCH_NATIONAL: 0.95-1.0
- GS1_OFFICIAL: 0.9

---

## Implemented Features (ChatGPT Recommendations)

### 1. Regulatory Lifecycle State Model ✅
- Database field: `regulatory_state` (enum)
- 8 states: PROPOSAL → POLITICAL_AGREEMENT → ADOPTED → DELEGATED_ACT_DRAFT → DELEGATED_ACT_ADOPTED → GUIDANCE → ENFORCEMENT_SIGNAL → POSTPONED_OR_SOFTENED
- Detection function: `detectRegulatoryState()` in news-sources.ts
- Keywords configured: 50+ keywords across 8 categories

### 2. Negative Signal Detection ✅
- Database fields: `is_negative_signal` (boolean), `negative_signal_keywords` (JSON)
- 6 categories: POSTPONEMENT, EXEMPTION, SIMPLIFICATION, SCOPE_REDUCTION, VOLUNTARY, PHASED_IN
- Detection function: `detectNegativeSignals()` in news-sources.ts
- Keywords configured: 50+ keywords (EN + NL)

### 3. Confidence Level Tagging ✅
- Database field: `confidence_level` (enum)
- 4 levels: CONFIRMED_LAW → DRAFT_PROPOSAL → GUIDANCE_INTERPRETATION → MARKET_PRACTICE
- Detection function: `detectConfidenceLevel()` in news-sources.ts
- Source-type aware: EU_OFFICIAL gets higher default confidence

---

## Test Coverage

**Total Tests:** 32 (all passing)
- Negative signal detection: 10 tests
- Regulatory state detection: 8 tests
- Confidence level detection: 6 tests
- Integration tests: 3 tests
- Keyword configuration tests: 5 tests

---

## UI Features

### News Hub Page
- ✅ Pipeline status banner (last run, duration)
- ✅ Explicit date display (e.g., "23 Dec 2025")
- ✅ Filter by GS1 Impact Areas (6 options)
- ✅ Filter by Industry Sectors (6 options)
- ✅ Filter by Impact Level
- ✅ Sort by Latest First / Highest Impact
- ✅ High Impact Only toggle
- ✅ Search functionality
- ✅ AI-Enriched badge

### News Detail Page
- ✅ Impact level badge
- ✅ Regulation tags
- ✅ AI-Enriched badge
- ✅ GS1 Impact Tags
- ✅ Sector Tags
- ✅ GS1 Impact Analysis (2-3 sentences)
- ✅ Recommended Actions (2-4 items)
- ✅ Source attribution
- ✅ Published date
- ✅ Link to original article

---

## Gaps Identified

### Not Yet Implemented:
1. **Decision Value Type** - No explicit classification of what type of decision value an article provides
2. **Authority Tier Display** - Source credibility not visible in UI
3. **Event-Based Aggregation** - Multiple articles about same event not collapsed
4. **Delta Analysis** - No "what changed" comparison with previous state
5. **Semantic Drift Control** - No tracking of term definition changes
6. **Obligation-Centric Language Detection** - Keywords focus on regulations, not legal obligations

### Partially Implemented:
1. **Regulatory State** - Implemented but not displayed in UI
2. **Negative Signal** - Implemented but not displayed in UI
3. **Confidence Level** - Implemented but not displayed in UI
