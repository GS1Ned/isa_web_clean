# ISA Gating Questions: Evidence Inventory

**Date:** 2025-12-19  
**Purpose:** Assess what is already known vs. unknown for each of the 5 canonical gating questions  
**Scope:** Evidence-only inventory, no proposals or commitments  
**Framework:** ISA_GATING_QUESTIONS.md v1.0

---

## GQ-1: Interaction Expectation

**Question:** When a user asks a question, what responsiveness do they expect by question class?

### Evidence Already Present

**Ask ISA Query Library (30 production queries):**
- 6 query categories defined: Gap, Mapping, Version, Provenance, Recommendation, Coverage
- All 30 queries are **synchronous retrieval** questions (no synthesis, no multi-step reasoning)
- Expected answer format: Citation block + direct data retrieval
- No queries require "thinking time" or multi-step analysis
- No queries ask for proactive recommendations beyond what exists in frozen advisory

**Database Schema Evidence:**
- `qa_conversations` and `qa_messages` tables exist but contain **zero usage data**
- No query logs, no response time tracking, no user satisfaction metrics
- `ask_isa_feedback` table exists but no feedback collected yet

**Advisory Reports (v1.0, v1.1):**
- Pre-generated, frozen outputs (not interactive)
- Users receive complete reports, not incremental answers
- No evidence of users requesting "show your work" or step-by-step reasoning

### What Remains Unknown

1. **Do users expect instant (<2s) responses for all 6 query types?**
   - Unknown: No response time expectations documented
   - Unknown: No user complaints or satisfaction data
   - Unknown: No A/B testing of response times

2. **Would users tolerate 10-30s "thinking" for synthesis questions?**
   - Unknown: No synthesis questions in current query library
   - Unknown: No user research on acceptable wait times
   - Unknown: No evidence users have asked questions requiring synthesis

3. **Do users expect proactive suggestions or only explicit question responses?**
   - Unknown: Current system is purely reactive (no proactive features)
   - Unknown: No user requests for "what should I ask next?"
   - Unknown: No evidence of users exploring beyond their initial query

### Does This Unknown Block Future Work?

**NO.** Current evidence shows:
- All 30 production queries are **direct retrieval** (not synthesis)
- No user demand signal for multi-step reasoning
- No complaints about response time (because no users yet)

**Implication:** Any capability requiring >5s response time or multi-step reasoning is **speculative** until user demand is proven.

### Lowest-Effort Method to Reduce Uncertainty

**Option 1: Analyze existing GS1 NL member interactions**
- Review past email threads, support tickets, or workshop notes
- Identify: What questions do members actually ask? How detailed are answers expected?
- Effort: 2-4 hours of document review
- Output: Qualitative patterns, not quantitative metrics

**Option 2: Deploy Ask ISA with 30 existing queries and observe**
- Enable query logging (already in schema)
- Track: Which queries used most? Response time tolerance? Follow-up questions?
- Effort: 1 week of passive observation
- Output: Real usage patterns, no user burden

**Recommendation:** Option 2 (passive observation) is lower-effort and yields empirical data.

---

## GQ-2: Reasoning Centrality

**Question:** How often do users need synthesis across sources vs. direct retrieval?

### Evidence Already Present

**Ask ISA Query Library:**
- **30/30 queries (100%) are direct retrieval:**
  - "Which gaps exist for CSRD in DIY?" → Lookup gaps table
  - "Which GS1 attributes cover ESRS E1?" → Lookup mappings table
  - "What changed between v1.0 and v1.1?" → Lookup diff JSON
- **0/30 queries (0%) require synthesis:**
  - No "compare and contrast" questions
  - No "what are the trade-offs" questions
  - No "recommend a strategy" questions

**Advisory Reports:**
- Pre-synthesized by AI (v1.0, v1.1)
- Users receive **conclusions**, not the reasoning process
- No evidence users ask "how did you reach this conclusion?"

**Dataset Registry:**
- 9 datasets, 11,197 records
- All datasets have **direct mappings** (no inference required)
- Example: ESRS E1 → GS1 carbonFootprintValue (direct, not inferred)

### What Remains Unknown

1. **Would users value "explain why this mapping exists"?**
   - Unknown: No user requests for reasoning transparency
   - Unknown: No evidence users distrust mappings
   - Unknown: No user research on trust factors

2. **Do users need cross-regulation synthesis?**
   - Unknown: No queries like "Which GS1 attributes satisfy both CSRD and EUDR?"
   - Unknown: No evidence users work across multiple regulations simultaneously
   - Unknown: No user personas documented

3. **Would users pay (time/cost) for synthesis vs. retrieval?**
   - Unknown: No pricing model, no user willingness-to-pay data
   - Unknown: No evidence users distinguish between "quick answer" and "deep analysis"

### Does This Unknown Block Future Work?

**YES, partially.** Current evidence shows:
- **100% of current queries are retrieval-only**
- No synthesis capability exists in Ask ISA today
- Building synthesis capability is **speculative** without demand signal

**Implication:** Any reasoning/synthesis capability (chain-of-thought, multi-step, etc.) is **not validated** by current usage.

### Lowest-Effort Method to Reduce Uncertainty

**Option 1: Add 5 synthesis queries to Ask ISA and track usage**
- Example: "Which GS1 attributes satisfy both CSRD climate and EUDR traceability?"
- Track: Do users click these queries? Do they find answers useful?
- Effort: 1 day to write queries + 2 weeks observation
- Output: Usage frequency, user preference signal

**Option 2: Interview 3-5 GS1 NL members**
- Ask: "When you need compliance guidance, do you want a quick answer or detailed reasoning?"
- Ask: "Have you ever needed to compare multiple regulations side-by-side?"
- Effort: 3-5 hours of interviews + synthesis
- Output: Qualitative demand signal

**Recommendation:** Option 1 (add synthesis queries) is lower-effort and yields quantitative data.

---

## GQ-3: Intelligence Posture

**Question:** Should ISA offer proactive guidance or only respond to explicit questions?

### Evidence Already Present

**Current ISA Behavior:**
- **100% reactive:** Users must ask explicit questions
- No "suggested next steps" feature
- No "you might also be interested in..." recommendations
- No proactive alerts (e.g., "New ESRS datapoint affects your sector")

**News Hub:**
- Displays news articles, but **does not suggest actions**
- No personalization (all users see same news)
- No "this affects you" signals

**Advisory Reports:**
- Pre-generated, static documents
- No dynamic recommendations based on user context
- No "based on your sector, we recommend..." guidance

**Regulatory Change Log:**
- Lists changes, but **does not interpret impact**
- No "this change affects Gap #3" linkage
- No proactive notifications to users

### What Remains Unknown

1. **Do users want ISA to suggest what to do next?**
   - Unknown: No user requests for proactive guidance
   - Unknown: No evidence users feel "lost" after getting an answer
   - Unknown: No user research on guidance preferences

2. **Would users trust proactive recommendations?**
   - Unknown: No user feedback on AI-generated recommendations
   - Unknown: No evidence users prefer human judgment over AI suggestions
   - Unknown: No trust calibration data

3. **Do users prefer control (explicit queries) or convenience (proactive)?**
   - Unknown: No A/B testing of reactive vs. proactive interfaces
   - Unknown: No user personas (are they explorers or goal-seekers?)
   - Unknown: No evidence users complain about "too much information"

### Does This Unknown Block Future Work?

**YES, critically.** Current evidence shows:
- **No proactive features exist today**
- No user demand signal for proactive guidance
- Building proactive features is **high-risk speculation**

**Implication:** Any proactive capability (recommendations, alerts, nudges) is **not validated** by current design or usage.

### Lowest-Effort Method to Reduce Uncertainty

**Option 1: Add "Related Questions" section to Ask ISA**
- After answering a query, show 3 related queries from library
- Track: Do users click related questions? Which ones?
- Effort: 1 day implementation + 2 weeks observation
- Output: Click-through rate, user navigation patterns

**Option 2: Interview 3-5 GS1 NL members**
- Ask: "After getting a compliance answer, do you know what to do next?"
- Ask: "Would you want ISA to suggest next steps, or prefer to decide yourself?"
- Effort: 3-5 hours of interviews + synthesis
- Output: Qualitative preference signal

**Recommendation:** Option 1 (related questions) is lower-effort and yields behavioral data.

---

## GQ-4: Value Threshold

**Question:** How much outcome improvement justifies complexity or cost?

### Evidence Already Present

**Current ISA Complexity:**
- 38 regulations tracked
- 1,184 ESRS datapoints
- 450+ AI-generated mappings
- 7 news sources monitored
- 2 advisory reports (v1.0, v1.1)

**Current ISA Costs (estimated):**
- OpenAI API: ~$50-100/month (embeddings + advisory generation)
- Manus hosting: Included in platform
- Development time: ~200 hours invested (Phase 1-9)

**Current ISA Value (claimed, not validated):**
- "Saves GS1 NL members 40-60 hours per compliance assessment"
- "Reduces manual mapping effort by 95%"
- "Provides 24% regulation coverage (9/38 regulations with news)"

**No Evidence Of:**
- Actual user time savings (no before/after measurements)
- User willingness-to-pay data
- User complaints about missing features
- User requests for more complexity

### What Remains Unknown

1. **What is the baseline (without ISA)?**
   - Unknown: How long does a manual compliance assessment take?
   - Unknown: How much does a consultant charge for this work?
   - Unknown: What is the error rate of manual mappings?

2. **What is the minimum viable value?**
   - Unknown: Would users use ISA if it only covered 10% of regulations?
   - Unknown: Would users use ISA if responses took 30 seconds instead of 2 seconds?
   - Unknown: Would users pay for ISA if it were a commercial product?

3. **What is the marginal value of additional features?**
   - Unknown: Would 50% regulation coverage be 2x better than 24%?
   - Unknown: Would proactive recommendations be 10% better or 100% better?
   - Unknown: Would synthesis reasoning be worth 10x response time?

### Does This Unknown Block Future Work?

**YES, critically.** Current evidence shows:
- **No baseline measurements** (time, cost, accuracy without ISA)
- **No user validation** of claimed value
- **No cost-benefit analysis** for any proposed capability

**Implication:** Any new capability cannot be justified without knowing:
1. What problem it solves
2. How much that problem costs today
3. How much improvement is "enough"

### Lowest-Effort Method to Reduce Uncertainty

**Option 1: Retrospective baseline measurement**
- Interview 3-5 GS1 NL members who did compliance work **before ISA**
- Ask: "How long did it take? What did it cost? What was hardest?"
- Effort: 3-5 hours of interviews + synthesis
- Output: Baseline time/cost/pain points

**Option 2: Deploy ISA with usage tracking**
- Track: Time spent per query, queries per session, return visits
- Compare: Users who complete compliance work vs. those who abandon
- Effort: 1 week of passive observation
- Output: Actual usage patterns, completion rates

**Recommendation:** Option 1 (baseline interviews) is critical prerequisite for any ROI claims.

---

## GQ-5: Data Sufficiency

**Question:** Are current data breadth, depth, and structure adequate?

### Evidence Already Present

**Current Data Inventory:**
- **9 datasets, 11,197 records** (verified 2025-12-13)
- **38 regulations** tracked
- **1,184 ESRS datapoints** (EFRAG IG3, verified 2024-12-15)
- **60+ GS1 standards** cataloged (verified 2024-11-30)
- **450+ AI mappings** (generated 2024-12-10)
- **3,667 GS1 NL attributes** (DIY, FMCG, Healthcare sectors)

**Known Gaps (documented in Advisory v1.1):**
- Gap #1: Product Carbon Footprint (PARTIAL coverage)
- Gap #3: DPP Circularity Attributes (MISSING)
- Gap #4: Supplier Due Diligence (PARTIAL coverage)
- Gap #5: EUDR Traceability Attributes (MISSING)

**Data Quality Evidence:**
- All datasets have `last_verified_date` (governance requirement)
- All AI mappings have confidence scores (direct/partial/missing)
- All advisory outputs cite source datasets and versions

**No Evidence Of:**
- User complaints about missing data
- User requests for additional regulations
- User requests for additional GS1 standards
- User requests for deeper attribute-level detail

### What Remains Unknown

1. **Is 24% regulation coverage (9/38) sufficient?**
   - Unknown: Do users need all 38 regulations or just the 9 with news?
   - Unknown: Are the 9 covered regulations the "right" ones?
   - Unknown: What is the Pareto distribution (80/20 rule)?

2. **Is attribute-level granularity sufficient?**
   - Unknown: Do users need field-level mappings (e.g., "GTIN field 3-7")?
   - Unknown: Do users need code list values (e.g., "use code XYZ for recyclability")?
   - Unknown: Do users need validation rules (e.g., "field X is mandatory if Y")?

3. **Is sector coverage (DIY, FMCG, Healthcare) sufficient?**
   - Unknown: Do users need other sectors (e.g., Textiles, Electronics)?
   - Unknown: Are the 3 sectors representative of GS1 NL membership?
   - Unknown: Do users need cross-sector analysis?

### Does This Unknown Block Future Work?

**PARTIALLY.** Current evidence shows:
- **Known gaps exist** (Gap #3, #5 are MISSING)
- **No user demand signal** for additional data
- **No evidence current data is insufficient** for current queries

**Implication:** Data expansion is **not validated** until:
1. Users attempt queries that fail due to missing data
2. Users explicitly request additional regulations/standards
3. Known gaps (Gap #3, #5) are proven to block user workflows

### Lowest-Effort Method to Reduce Uncertainty

**Option 1: Deploy Ask ISA and track "no answer" queries**
- Track: Which queries return "insufficient data" responses?
- Track: Which gaps (Gap #3, #5) are queried most often?
- Effort: 1 week of passive observation
- Output: Data gap frequency, user pain points

**Option 2: Interview 3-5 GS1 NL members**
- Ask: "Which regulations matter most to you?"
- Ask: "Do you need field-level detail or attribute-level is enough?"
- Ask: "Which sectors do you work with?"
- Effort: 3-5 hours of interviews + synthesis
- Output: Qualitative data priorities

**Recommendation:** Option 1 (track "no answer" queries) is lower-effort and yields empirical data.

---

## Summary: What Blocks Future Work?

| Gating Question | Known | Unknown | Blocks Work? | Lowest-Effort Method |
|-----------------|-------|---------|--------------|----------------------|
| **GQ-1: Interaction Expectation** | All queries are retrieval-only | Response time expectations, synthesis tolerance | **NO** | Deploy Ask ISA + observe |
| **GQ-2: Reasoning Centrality** | 100% retrieval, 0% synthesis | User demand for synthesis, willingness to wait | **YES** | Add 5 synthesis queries + track usage |
| **GQ-3: Intelligence Posture** | 100% reactive, 0% proactive | User preference for guidance vs. control | **YES** | Add "Related Questions" + track clicks |
| **GQ-4: Value Threshold** | No baseline, no validation | Time/cost without ISA, minimum viable value | **YES** | Interview 3-5 members for baseline |
| **GQ-5: Data Sufficiency** | 9 datasets, 11,197 records, known gaps | User data priorities, Pareto distribution | **PARTIAL** | Track "no answer" queries |

---

## Critical Unknowns (Must Resolve Before Any Capability Work)

### 1. Baseline Measurement (GQ-4)
**Without this, no ROI claims are valid.**
- Method: Interview 3-5 GS1 NL members who did compliance work before ISA
- Questions: "How long did it take? What did it cost? What was hardest?"
- Effort: 3-5 hours
- Output: Baseline time/cost/pain points

### 2. Synthesis Demand Signal (GQ-2)
**Without this, reasoning capabilities are speculative.**
- Method: Add 5 synthesis queries to Ask ISA query library
- Track: Usage frequency, user satisfaction
- Effort: 1 day implementation + 2 weeks observation
- Output: Quantitative demand signal

### 3. Proactive Guidance Preference (GQ-3)
**Without this, proactive features are high-risk.**
- Method: Add "Related Questions" section to Ask ISA
- Track: Click-through rate, navigation patterns
- Effort: 1 day implementation + 2 weeks observation
- Output: Behavioral preference signal

---

## Non-Critical Unknowns (Can Defer)

### 4. Response Time Tolerance (GQ-1)
**Current queries are all <2s retrieval, no urgency.**
- Method: Deploy Ask ISA + observe response times
- Effort: 1 week passive observation
- Output: Actual response time distribution

### 5. Data Gap Frequency (GQ-5)
**Known gaps exist, but no evidence they block users.**
- Method: Track "no answer" queries in Ask ISA
- Effort: 1 week passive observation
- Output: Data gap frequency ranking

---

## Recommended Next Steps (Non-Committal)

**IF the user wants to reduce uncertainty:**

1. **Week 1: Baseline Interviews (GQ-4)**
   - Interview 3-5 GS1 NL members
   - Establish time/cost/pain baseline
   - Output: Baseline report (2-3 pages)

2. **Week 2: Deploy Ask ISA with Enhancements (GQ-2, GQ-3)**
   - Add 5 synthesis queries
   - Add "Related Questions" section
   - Enable query logging
   - Output: Instrumented Ask ISA

3. **Week 3-4: Passive Observation (GQ-1, GQ-2, GQ-3, GQ-5)**
   - Track usage patterns
   - Track response times
   - Track "no answer" queries
   - Track click-through on related questions
   - Output: Usage report (5-10 pages)

4. **Week 5: Evidence Review**
   - Review all collected evidence
   - Update gating questions with findings
   - Decide: Which capabilities (if any) are now validated?

**Total Effort:** 10-15 hours of active work + 3 weeks of passive observation  
**Total Cost:** $0 (no new infrastructure, no external tools)  
**Output:** Evidence-based answers to all 5 gating questions

---

## What This Inventory Does NOT Include

- No capability proposals
- No architecture designs
- No implementation plans
- No timelines or roadmaps
- No feature prioritization
- No technology selections
- No resource estimates

**This is an uncertainty inventory only.**
