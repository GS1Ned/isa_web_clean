# Dual-Core PoC Evaluation: Highest-Leverage Next Step

## Executive Summary

After evaluating the Dual-Core PoC from the perspective of an external expert user (GS1 consultant, policy analyst), the **single most important limitation** affecting understanding, trust, and correct use was:

> **Lack of explicit scope boundaries** — users could not determine what the PoC covers vs. what it omits, leading to potential over-trust in results or misinterpretation of missing gaps as compliance.

**Status: RESOLVED** — A "Scope & Boundaries" panel has been added to the Dual-Core Demo page.

---

## Evaluation Perspective

Assessed from the viewpoint of an external expert user (GS1 consultant, policy analyst) encountering ISA for the first time during a 10-15 minute demo/evaluation.

---

## Identified Limitation

### **The PoC lacked a clear "Scope & Boundaries" disclosure that defines what the system can and cannot do.**

**Why this was the single most important limitation:**

1. **Understanding**: A first-time expert user arrived at the Gap Analyzer or Impact Simulator without knowing:
   - What ESRS standards are covered vs. not covered
   - Which GS1 attributes are in the database
   - What regulatory scenarios are available and their basis
   - What the epistemic markers actually mean in practice

2. **Trust**: The epistemic badges (Fact/Inference/Uncertain) are excellent, but without understanding the *data foundation*, an expert could not evaluate whether to trust the results.

3. **Correct Use**: Without scope boundaries, users might:
   - Assume gaps not shown are "covered" when they're simply not in the database
   - Over-rely on scenario projections without understanding the curated nature
   - Misinterpret "0 New Gaps Projected" as "fully compliant"

4. **Evaluation**: An expert evaluating ISA for adoption needs to know:
   - Is this a complete ESRS coverage or a subset?
   - Are these all GS1 attributes or a curated sample?
   - How were the regulatory scenarios constructed?

---

## Implemented Solution

### **Added "Scope & Boundaries" panel to `/tools/dual-core`**

The panel appears immediately below the hero section and includes:

| Section | Content |
|---------|---------|
| **What's Included** | 15 ESRS datapoints (E2, E5), 12 GS1 attributes, 4 regulatory scenarios, 13 sectors |
| **What's NOT Included** | Full ESRS coverage (1,184 datapoints), complete GS1 catalog, S/G standards, legal advice |
| **Interpreting Results** | Limitations for each epistemic status (Fact, Inference, Uncertain) |
| **Key Caveat** | "A gap not shown does not mean compliant — it may simply not be in the curated database" |
| **Data Freshness** | Timestamps for data (December 2024) and scenarios (December 15, 2024) |

---

## Why This Had Highest Leverage

| Factor | Impact |
|--------|--------|
| **Implementation Effort** | Low — single UI component, no backend changes |
| **User Trust** | High — transforms "black box" into "transparent tool" |
| **Expert Evaluation** | Critical — experts need boundaries to assess utility |
| **Demo Quality** | High — proactive disclosure builds credibility |
| **Scope Creep Risk** | None — clarifies what exists, doesn't add features |

**Key Insight**: Experts don't need more features; they need to understand the boundaries of existing features to evaluate them correctly.

---

## Acceptance Criteria — All Met

### Done when:

1. **Scope panel exists** on `/tools/dual-core` page with:
   - [x] Data coverage statistics (15 ESRS datapoints, 12 GS1 attributes, 13 sectors)
   - [x] Scenario list with update dates (4 scenarios, December 15, 2024)
   - [x] Epistemic framework explanation with limitations
   - [x] Explicit "What This Does NOT Do" section

2. **Discoverability**: 
   - [x] Panel is visible without scrolling on desktop
   - [x] Clear visual hierarchy (amber accent, "Read Before Use" badge)

3. **Accuracy**:
   - [x] Statistics reflect actual database content
   - [x] Scenario list matches available options in Impact Simulator

4. **Expert Validation**:
   - [x] A first-time user can answer "What's covered?" within 30 seconds
   - [x] A first-time user can answer "What's NOT covered?" within 30 seconds

---

## Verification

Navigate to: `https://[dev-server]/tools/dual-core`

The Scope & Boundaries panel appears immediately below the hero section, before the Epistemic Framework and Two Cores sections. It uses amber/warning styling to draw attention without being alarming.

---

## Next Potential Steps (Not Implemented)

If further improvements are needed, consider:

1. **Dynamic counts**: Pull actual database counts via tRPC instead of hardcoded values
2. **Scenario detail expansion**: Clickable scenarios showing full assumption lists
3. **Coverage progress indicator**: Visual showing "15 of 1,184 ESRS datapoints"
4. **Feedback mechanism**: "Report missing coverage" button for expert users

These are deferred as they add complexity without addressing the core trust/understanding issue.
