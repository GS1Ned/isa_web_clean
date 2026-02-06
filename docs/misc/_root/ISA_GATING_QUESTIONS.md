# ISA Capability Exploration: Canonical Gating Questions

**Document Status:** CANONICAL  
**Version:** 1.0  
**Date:** December 18, 2025  
**Purpose:** Standing decision framework for all future capability exploration, comparison, and proposals

---

## Operating Instructions

**All future capability exploration, comparison, or proposal must explicitly reference these 5 questions.**

- No architecture, roadmap, or experiment should be proposed unless it clearly states which of these questions it depends on.
- These questions are intended to **preserve optionality, not resolve it**.
- They collapse uncertainty without committing to architectural choices.

---

## GQ-1 — Interaction Expectation

**What level of responsiveness do users expect for different classes of questions?**

**Why this is gating:**
- Determines whether capabilities must operate synchronously, asynchronously, or hybrid.

**What this unlocks:**
- Which classes of intelligence are viable in the primary user experience.

**What must remain undecided:**
- Performance targets, infrastructure choices, processing strategies.

---

## GQ-2 — Reasoning Centrality

**How often do users' questions require synthesis across multiple sources or steps, rather than direct retrieval?**

**Why this is gating:**
- Determines whether advanced reasoning is a core capability or an occasional enhancement.

**What this unlocks:**
- Whether to invest in reasoning-first or retrieval-first capability paths.

**What must remain undecided:**
- The form of reasoning (symbolic, neural, hybrid, agentic).

---

## GQ-3 — Intelligence Posture

**Do users perceive more value in proactive guidance or in high-quality responses to explicit questions?**

**Why this is gating:**
- Separates "assistant" behavior from "knowledge system" behavior.

**What this unlocks:**
- Whether autonomy and initiative are product-defining.

**What must remain undecided:**
- Degree of autonomy, notification mechanisms, agent design.

---

## GQ-4 — Value Threshold

**What level of outcome improvement is required before increased complexity or cost is considered justified?**

**Why this is gating:**
- Establishes a shared definition of "worth it" across all future capabilities.

**What this unlocks:**
- Objective go/no-go criteria for experimentation.

**What must remain undecided:**
- Exact metrics, benchmarks, or optimization techniques.

---

## GQ-5 — Data Sufficiency

**Is the current breadth, depth, and structure of ISA's data sufficient to support more advanced forms of intelligence?**

**Why this is gating:**
- Prevents pursuing capabilities that are fundamentally data-constrained.

**What this unlocks:**
- Whether focus should be on data enrichment or capability experimentation.

**What must remain undecided:**
- Specific data models, storage technologies, enrichment strategies.

---

## Framework Properties

These canonical gating questions are:

- **Value-anchored:** User and outcome focused, not technology-focused
- **Optionality-preserving:** Collapse uncertainty without prescribing solutions
- **Reusable:** Apply to all future capability decisions, not just current exploration
- **Architecture-neutral:** Do not bias toward specific technical approaches

**These questions can be answered through:**
- User interviews and surveys (GQ-1, GQ-3)
- Query log analysis (GQ-2)
- Stakeholder workshops on cost-benefit trade-offs (GQ-4)
- Data inventory and gap analysis (GQ-5)

**All five questions can be answered without building anything**, preserving full architectural optionality while dramatically reducing the solution space.

---

## Usage in Capability Proposals

When proposing any capability exploration, validation, or implementation, explicitly state:

1. **Which gating questions this depends on** (e.g., "This approach assumes GQ-2 reveals 50%+ of queries require multi-hop reasoning")
2. **What this would prove or invalidate** relative to those questions
3. **What remains undecided** even if the capability succeeds

This framework ensures all capability decisions remain grounded in user value and empirical validation rather than architectural assumptions.
