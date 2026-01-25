# ISA UX Strategy: Excellence Without Compromise

**Document Version:** 1.0  
**Date:** 11 December 2025  
**Status:** Foundational Strategy  
**Scope:** UX design track parallel to ISA v1.1 execution

---

## Executive Summary

This document defines what "excellent UX" means for ISA (Intelligent Standards Architect), establishes design principles that preserve analytical rigor, and creates a phased integration plan that runs parallel to engineering work without blocking v1.1 delivery.

ISA is not a consumer SaaS product. It is a governance-grade advisory platform for ESG-to-GS1 standards mapping, serving standards professionals at GS1 Netherlands who make high-stakes decisions under regulatory pressure. Excellence here means **clarity, confidence, and calmness**—not engagement metrics or visual novelty.

---

## 1. ISA UX North Star

### 1.1 Core Experience Principles

ISA's UX must embody these seven principles:

1. **Clarity Over Cleverness**  
   Every screen answers "What am I looking at?" and "Why does this matter?" within 3 seconds. No mystery navigation, no hidden insights, no ambiguous labels.

2. **Confidence Through Traceability**  
   Users trust ISA because every claim cites a source. Version indicators, dataset IDs, and SHA256 hashes are not "technical details"—they are trust signals that must be visible, not buried.

3. **Calmness Under Pressure**  
   Standards professionals face regulatory deadlines and audit scrutiny. ISA's interface must reduce cognitive load, not add to it. Predictable layouts, consistent patterns, minimal surprises.

4. **Progressive Disclosure**  
   Show summaries first, details on demand. Users should never feel overwhelmed by data density, but should always be able to drill deeper when needed.

5. **Speed and Predictability**  
   Every interaction should feel instant (<200ms perceived latency). Loading states must be informative, not generic spinners. Users should know what to expect before they click.

6. **Explainability as Default**  
   ISA's conclusions (gap analysis, coverage scores, recommendations) must explain their reasoning inline. No "black box" AI outputs. Show the logic, show the sources, show the confidence levels.

7. **GS1 Familiarity with Modern Polish**  
   ISA must feel recognisably GS1 (professional, authoritative, standards-focused) while being noticeably more usable and visually refined than existing GS1 tools. Not a radical rebrand, but an evolution.

### 1.2 What Users Should Feel

When using ISA, users should feel:

- **In control**: "I know where I am, what I can do, and how to get what I need."
- **Informed**: "I understand why ISA is telling me this, and I can verify it."
- **Efficient**: "I got my answer quickly without wading through noise."
- **Confident**: "I can present this to leadership or auditors without hesitation."
- **Respected**: "This tool treats me as an intelligent professional, not a novice."

---

## 2. Critical UX Qualities for ISA

### 2.1 Navigation

**Principle:** Users should never wonder "Where am I?" or "How do I get back?"

**Requirements:**
- Persistent navigation bar with clear hierarchy (ESG Hub, EPCIS Tools, About, Admin)
- Breadcrumbs on all detail pages (e.g., ESG Hub > Regulations > CSRD)
- Consistent "back to list" buttons on detail pages
- Active state indicators (current page highlighted in nav)
- No dead ends (every page has an escape route)

**Anti-patterns to avoid:**
- Dropdown menus with >7 items (cognitive overload)
- Navigation that changes structure between pages
- Links that open in new tabs without warning
- Breadcrumbs that don't match actual navigation path

### 2.2 Cognitive Load Management

**Principle:** Reduce decisions, increase clarity.

**Requirements:**
- Maximum 3 primary actions per page (e.g., "View Advisory", "Compare Versions", "Export PDF")
- Secondary actions grouped in "More" menus or collapsed sections
- Filters default to "All" with clear reset buttons
- Tables show 20-50 rows by default (not 10, not 100)
- Empty states explain what's missing and how to fix it

**Anti-patterns to avoid:**
- Dashboards with >6 metrics (analysis paralysis)
- Filters that require understanding the data model
- Tables with >10 columns visible by default
- Forms with >5 required fields on one screen

### 2.3 Trust Signalling

**Principle:** Make provenance visible, not hidden.

**Requirements:**
- Advisory version indicator on every advisory page (e.g., "ISA v1.0 | Locked 2024-11-07")
- Dataset version badges on every mapping result (e.g., "ESRS IG3 v2024-08-30")
- Source citations inline with match percentages (e.g., "Source: EFRAG IG3 (85% match)")
- SHA256 hashes visible on hover for regulatory change log entries
- "Last updated" timestamps on all data-driven pages

**Anti-patterns to avoid:**
- Hiding version info in "About" pages or footers
- Generic "AI-generated" disclaimers without specifics
- Confidence scores without explanations (e.g., "85% match" means what?)
- Mixing locked and draft content without clear visual distinction

### 2.4 Explainability

**Principle:** Show the "why" behind every conclusion.

**Requirements:**
- Gap analysis shows which ESRS requirements are unmapped and why (e.g., "No GS1 attribute for 'Product Carbon Footprint'")
- Coverage scores break down by standard (e.g., "ESRS E1: 100%, ESRS S1: 0%")
- Recommendations cite specific datasets and regulations (e.g., "Add PCF attribute to GS1 NL v3.1.34 per ESRS E1-6")
- Diff views show before/after values with delta calculations (e.g., "Coverage: 43.8% → 62.5% (+18.7%)")
- Ask ISA responses cite sources with relevance scores (e.g., "ESRS E1-6 (90% relevant)")

**Anti-patterns to avoid:**
- "AI says X" without showing reasoning
- Aggregate scores without breakdowns (e.g., "Overall compliance: 65%" tells me nothing)
- Recommendations without actionable steps or timelines
- Diffs that only show "changed" without showing what changed

### 2.5 Progressive Disclosure

**Principle:** Summaries first, details on demand.

**Requirements:**
- Advisory pages show executive summary + 3-5 key findings above the fold
- Detailed mappings hidden in expandable sections or tabs
- Regulation detail pages show overview + quick stats before full text
- Ask ISA shows answer + top 3 sources, with "View all 10 sources" link
- Tables show 5-10 most important columns by default, with "Show more columns" option

**Anti-patterns to avoid:**
- Showing all 50 ESRS datapoints on page load (use pagination or lazy loading)
- Forcing users to scroll through methodology before seeing results
- Hiding critical information behind multiple clicks (e.g., gap count buried in tab 3)
- Expanding all accordion sections by default (defeats the purpose)

### 2.6 Speed and Predictability

**Principle:** Every interaction feels instant or explains the wait.

**Requirements:**
- Page transitions <200ms perceived latency (use skeleton loaders, not blank screens)
- Data fetching shows "Loading 1,184 ESRS datapoints..." (not generic spinner)
- Export buttons show "Generating PDF (5-10 seconds)..." (not "Please wait")
- Search results appear as user types (debounced, <300ms)
- Large datasets paginate or virtualise (never block UI for >2 seconds)

**Anti-patterns to avoid:**
- Generic "Loading..." spinners without context
- Blocking entire page for one slow query (load other sections first)
- Export buttons with no progress indication
- Search that requires "Enter" key (users expect instant results)

---

## 3. Feature-Level UX Implications

### 3.1 Advisory Viewing

**Current state:** Advisory v1.0 is a 15,000-word Markdown document with 6 sections.

**UX challenges:**
- Users need executive summary without reading 15,000 words
- Gap analysis is buried in Section 4
- Recommendations scattered across 3 sections
- No way to filter by sector (DIY, FMCG, Healthcare)

**UX requirements:**
- **Landing page:** Executive summary + 3 key findings + "Read full advisory" button
- **Navigation:** Jump-to-section menu (sticky sidebar or top tabs)
- **Filtering:** Sector selector that highlights relevant gaps/recommendations
- **Comparison:** Side-by-side view of v1.0 vs v1.1 (already implemented in diff view)
- **Export:** PDF with cover page, table of contents, and page numbers

**Design questions to answer:**
- Should advisory be one long page (scrollable) or multi-page (sectioned)?
- Should gaps be shown as table or cards?
- Should recommendations be grouped by timeframe (short/medium/long) or by topic?

### 3.2 Advisory Diffs

**Current state:** Diff view shows progress score, coverage deltas, gap lifecycle, recommendations.

**UX challenges:**
- Users need to understand "What changed?" at a glance
- Regression detection is binary (yes/no) but users need severity
- Confidence transitions are shown but not explained
- No way to export diff as PDF or share with stakeholders

**UX requirements:**
- **Summary card:** Overall progress score + top 3 changes (e.g., "+18.7% coverage", "+5 new mappings", "0 regressions")
- **Visual indicators:** Green for improvements, red for regressions, yellow for neutral changes
- **Drill-down:** Click on any delta to see detailed before/after comparison
- **Export:** PDF diff report with executive summary + detailed tables
- **Sharing:** Permalink to specific diff (e.g., `/advisory/diff?from=v1.0&to=v1.1`)

**Design questions to answer:**
- Should diff be side-by-side or unified view?
- Should regressions trigger a warning banner?
- Should diff show only changes or also unchanged items?

### 3.3 Regulatory Change Log

**Current state:** Admin-only entry creation, public read access, filters by source type and ISA version.

**UX challenges:**
- Users need to know "What's new?" without reading full change log
- No way to subscribe to updates or get notifications
- No way to see impact on their sector (DIY, FMCG, Healthcare)
- No way to link change log entries to advisory regeneration decisions

**UX requirements:**
- **Public dashboard:** Latest 10 entries + "View all" link
- **Filtering:** By source type, by ISA version, by sector (if tagged)
- **Impact indicators:** High/Medium/Low impact badges
- **Linkage:** "This change triggered ISA v1.1 regeneration" callout
- **Notifications:** Email alerts for high-impact changes (future)

**Design questions to answer:**
- Should change log be chronological or grouped by regulation?
- Should entries show full description or summary + "Read more"?
- Should change log have RSS feed for external monitoring?

### 3.4 Ask ISA

**Current state:** RAG-powered Q&A with vector search, source citations, similarity scores.

**UX challenges:**
- Users don't know which advisory version they're querying
- No query guardrails (users can ask speculative questions)
- Source citations show similarity scores but not dataset versions
- No suggested questions or query library
- No way to save or share queries

**UX requirements:**
- **Advisory version selector:** Dropdown to choose v1.0, v1.1, or "Latest"
- **Frozen advisory indicator:** Banner showing "Querying ISA v1.0 (Locked 2024-11-07)"
- **Query library:** Pre-approved question templates (30 examples from ASK_ISA_QUERY_LIBRARY.md)
- **Enhanced citations:** Show dataset ID + version + SHA256 hash on hover
- **Query guardrails:** System prompt enforces "no speculation" rule, shows refusal message for out-of-scope questions
- **Query history:** Save last 10 queries per user (future)

**Design questions to answer:**
- Should query library be visible by default or hidden in "Examples" dropdown?
- Should Ask ISA show confidence score for entire answer (not just sources)?
- Should Ask ISA support follow-up questions (conversational mode)?

### 3.5 Dataset Exploration (Future)

**Current state:** Dataset registry exists (v1.4.0, 15 datasets) but no UI to browse it.

**UX challenges:**
- Users need to verify which datasets ISA uses
- No way to see dataset provenance (publisher, jurisdiction, lineage)
- No way to compare dataset versions (e.g., GS1 NL v3.1.33 vs v3.1.34)
- No way to see which advisory versions use which datasets

**UX requirements:**
- **Dataset catalogue:** Table of all 15 datasets with metadata (publisher, version, record count, last updated)
- **Dataset detail page:** Full provenance + SHA256 hash + download link (if public)
- **Version comparison:** Side-by-side diff of two dataset versions (e.g., "What changed in GS1 NL v3.1.34?")
- **Advisory linkage:** "This dataset is used in ISA v1.0 and v1.1" callout
- **Search:** Filter datasets by publisher, regulation, or standard

**Design questions to answer:**
- Should dataset catalogue be public or admin-only?
- Should datasets be downloadable or view-only?
- Should dataset diffs show record-level changes or summary stats?

---

## 4. Design Guardrails

### 4.1 What UX Must Never Do in ISA

1. **Never hide version information**  
   Advisory version, dataset version, and last-updated timestamps must be visible on every relevant page. Hiding them in footers or "About" pages breaks traceability.

2. **Never show conclusions without sources**  
   Every gap, recommendation, or coverage score must cite the dataset or regulation it came from. No "AI says X" without provenance.

3. **Never mix locked and draft content**  
   If ISA v1.0 is locked and v1.1 is draft, they must be visually distinct (e.g., green "Locked" badge vs yellow "Draft" badge). Users must never wonder "Is this final?"

4. **Never optimise for engagement metrics**  
   ISA is not a consumer app. No gamification, no "You've viewed 10 regulations!" badges, no dark patterns to increase time-on-site. Users want to get their answer and leave.

5. **Never sacrifice accuracy for aesthetics**  
   If a table needs 10 columns to be accurate, show 10 columns (with horizontal scroll if needed). Don't hide critical data to make the page "cleaner".

6. **Never introduce speculative features**  
   ISA shows what is (locked advisories, frozen datasets) not what could be (predictive analytics, scenario modelling). No "What if?" features until explicitly scoped.

7. **Never break GS1 brand trust**  
   ISA must feel like a GS1 tool (professional, authoritative, standards-focused). No consumer SaaS aesthetics (playful illustrations, casual copy, trendy gradients).

### 4.2 Anti-Patterns to Avoid

**Dashboard without meaning:**  
Don't create a dashboard with 12 metrics just because it looks impressive. Every metric must answer a decision-making question (e.g., "Which gaps should I prioritise?" not "How many gaps exist?").

**Filters that require domain knowledge:**  
Don't create filters like "ESRS Standard" without explaining what ESRS is. Either provide tooltips or use plain language (e.g., "Environmental Standards" instead of "ESRS E1-E5").

**Modals for everything:**  
Don't use modals for content that needs context (e.g., regulation detail). Modals are for confirmations ("Delete this entry?") not for reading 5,000-word documents.

**Infinite scroll without pagination:**  
Don't use infinite scroll for data tables. Users need to know "I'm on page 3 of 10" not "I've scrolled past 150 rows and I'm lost".

**Generic error messages:**  
Don't show "Something went wrong" when a query fails. Show "Could not load ESRS datapoints (database timeout)" so users can report the issue accurately.

---

## 5. Phased UX Integration Plan

### Phase A: Now (v1.1, Non-Blocking)

**Goal:** Improve existing features without blocking v1.1 engineering.

**Scope:**
- Add advisory version indicator to all advisory pages (1 hour)
- Add dataset version badges to mapping results (2 hours)
- Add "Last updated" timestamps to regulatory change log (1 hour)
- Add breadcrumbs to all detail pages (2 hours)
- Add empty states to all list pages (2 hours)
- Add loading skeletons to replace generic spinners (3 hours)

**Total effort:** 11 hours (1.5 days)

**Constraints:**
- No schema changes
- No new features
- No redesigns (only polish existing UI)

**Success criteria:**
- Users can see which advisory version they're viewing
- Users can verify dataset provenance inline
- Users never see blank screens or generic spinners

### Phase B: After v1.1 Stabilisation

**Goal:** Add high-value UX features that require engineering coordination.

**Scope:**
- Advisory version selector in Ask ISA (4 hours)
- Query library with 30 pre-approved questions (6 hours)
- Enhanced citations with dataset IDs and SHA256 hashes (4 hours)
- Diff export as PDF (6 hours)
- Sector filtering on advisory pages (8 hours)
- Dataset catalogue UI (12 hours)

**Total effort:** 40 hours (5 days)

**Constraints:**
- Requires tRPC procedure changes
- Requires schema changes (e.g., query history table)
- Requires coordination with v1.1 feature freeze

**Success criteria:**
- Users can query specific advisory versions
- Users can export diffs for stakeholder presentations
- Users can filter advisories by sector
- Users can browse dataset registry

### Phase C: Pre-v1.2

**Goal:** Prepare UX for v1.2 features (e.g., automated advisory regeneration).

**Scope:**
- Advisory regeneration workflow UI (design only, no implementation)
- Dataset version comparison UI (design only)
- Notification system for regulatory changes (design only)
- Multi-user collaboration features (design only)

**Total effort:** 20 hours (2.5 days, design only)

**Constraints:**
- No implementation (v1.2 engineering will build)
- Must align with ISA Design Contract (immutability, traceability)
- Must not introduce speculative features

**Success criteria:**
- v1.2 engineering team has clear UX specifications
- Design decisions are documented and validated
- No UX debt carried into v1.2

---

## 6. Readiness Check

### 6.1 Design Questions That Must Be Answered Before UI Builds

**For Advisory Viewing:**
- [ ] Should advisory be one long page or multi-page?
- [ ] Should gaps be shown as table or cards?
- [ ] Should recommendations be grouped by timeframe or by topic?
- [ ] Should sector filtering be global (affects entire advisory) or per-section?

**For Advisory Diffs:**
- [ ] Should diff be side-by-side or unified view?
- [ ] Should regressions trigger a warning banner?
- [ ] Should diff show only changes or also unchanged items?
- [ ] Should diff export include full advisory text or just deltas?

**For Regulatory Change Log:**
- [ ] Should change log be chronological or grouped by regulation?
- [ ] Should entries show full description or summary + "Read more"?
- [ ] Should change log have RSS feed for external monitoring?
- [ ] Should high-impact changes trigger email notifications?

**For Ask ISA:**
- [ ] Should query library be visible by default or hidden in "Examples" dropdown?
- [ ] Should Ask ISA show confidence score for entire answer?
- [ ] Should Ask ISA support follow-up questions (conversational mode)?
- [ ] Should query history be per-user or global (for team collaboration)?

**For Dataset Exploration:**
- [ ] Should dataset catalogue be public or admin-only?
- [ ] Should datasets be downloadable or view-only?
- [ ] Should dataset diffs show record-level changes or summary stats?
- [ ] Should dataset detail pages show sample records or just metadata?

### 6.2 Decision Framework

**When to design:**
- Feature is in current phase (v1.1 or earlier)
- Design decision blocks engineering work
- User feedback indicates confusion or frustration

**When to defer:**
- Feature is in future phase (v1.2 or later)
- Design decision is cosmetic (e.g., button colour)
- No user feedback yet (avoid premature optimisation)

**When to validate:**
- Design affects analytical correctness (e.g., how to show confidence scores)
- Design affects traceability (e.g., where to show dataset versions)
- Design affects GS1 brand perception (e.g., visual identity)

---

## 7. Validation and Self-Check

### 7.1 Analytical Guarantees Preserved

✅ **Advisory correctness:** UX changes do not alter advisory conclusions, only how they're displayed.  
✅ **Traceability:** Version indicators, dataset IDs, and SHA256 hashes remain visible.  
✅ **Immutability:** Locked advisories cannot be edited via UI (only viewed and compared).  
✅ **Versioning:** Advisory version selector enforces querying frozen artefacts only.

### 7.2 Compatibility with Frozen Artefacts

✅ **ISA v1.0 advisory:** UX treats it as read-only, displays version badge, links to dataset registry.  
✅ **Dataset registry v1.4.0:** UX displays metadata without modifying registry structure.  
✅ **Regulatory change log:** UX adds filters and visualisations without changing entry schema.

### 7.3 Non-Blocking Engineering

✅ **Phase A (Now):** All tasks are UI-only polish, no schema changes, no new features.  
✅ **Phase B (After v1.1):** Requires coordination but does not block v1.1 delivery.  
✅ **Phase C (Pre-v1.2):** Design-only, no implementation until v1.2 engineering starts.

### 7.4 Realism for GS1 Context

✅ **User base:** Standards professionals, not general public. UX optimises for expertise, not onboarding.  
✅ **Use cases:** Decision-making under regulatory pressure, not casual browsing.  
✅ **Brand alignment:** Professional, authoritative, modern—not playful or consumer-facing.

---

## 8. Completion Criteria

This UX strategy is complete when:

✅ **ISA's UX ambition is clearly defined** (Section 1: North Star)  
✅ **UX work is positioned as a parallel, safe track** (Section 5: Phased Integration Plan)  
✅ **No conflict exists with ISA v1.1 execution priorities** (Section 7: Validation)  
✅ **The output can guide future UI work without re-litigating vision** (Section 6: Readiness Check)

---

## 9. Next Actions

**Immediate (Phase A, 11 hours):**
1. Add advisory version indicator to all advisory pages
2. Add dataset version badges to mapping results
3. Add breadcrumbs to all detail pages
4. Add empty states to all list pages
5. Add loading skeletons to replace generic spinners

**Short-term (Phase B, 40 hours):**
1. Advisory version selector in Ask ISA
2. Query library with 30 pre-approved questions
3. Enhanced citations with dataset IDs
4. Diff export as PDF
5. Sector filtering on advisory pages
6. Dataset catalogue UI

**Long-term (Phase C, 20 hours design):**
1. Advisory regeneration workflow UI (design only)
2. Dataset version comparison UI (design only)
3. Notification system for regulatory changes (design only)

---

## 10. Appendix: GS1 Brand Alignment

### 10.1 GS1 Visual Identity

ISA must respect GS1's visual identity while modernising the user experience:

- **Colours:** GS1 blue (#005EB8) as primary, neutral greys for backgrounds, green for success states, red for warnings
- **Typography:** Professional sans-serif (Inter, Open Sans, or similar), not playful or decorative fonts
- **Iconography:** Simple, functional icons (Lucide or Heroicons), not illustrative or metaphorical
- **Layout:** Clean, structured, grid-based—not asymmetric or artistic

### 10.2 GS1 Editorial Tone

ISA's UI copy must align with GS1 Style Guide Release 5.6:

- **British English spelling** (e.g., "organisation" not "organization")
- **Sentence case headings** (e.g., "Advisory version 1.0" not "Advisory Version 1.0")
- **Abbreviation expansion on first use** (e.g., "ESRS (European Sustainability Reporting Standards)")
- **No Oxford commas** (e.g., "gaps, recommendations and datasets" not "gaps, recommendations, and datasets")
- **Neutral, non-promotional tone** (e.g., "ISA provides" not "ISA delivers world-class")

### 10.3 Differentiation from Existing GS1 Tools

ISA must feel noticeably more usable than existing GS1 tools while remaining recognisably GS1:

- **Better navigation:** Persistent nav bar, breadcrumbs, clear hierarchy (vs. scattered menus)
- **Better performance:** <200ms perceived latency, skeleton loaders (vs. blank screens)
- **Better explainability:** Inline citations, confidence scores, reasoning (vs. opaque conclusions)
- **Better progressive disclosure:** Summaries first, details on demand (vs. walls of text)
- **Better trust signalling:** Version badges, dataset IDs, SHA256 hashes (vs. hidden metadata)

---

**End of ISA UX Strategy v1.0**
