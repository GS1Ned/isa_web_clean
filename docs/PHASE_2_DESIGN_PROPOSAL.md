# Phase 2 Design Proposal: Hard-Gate Closure

**Objective:** Close Check 5 (Event-Based Aggregation) and Check 6 (Delta Analysis)  
**Target Score:** ≥85% (currently 61%)  
**Acceptance Criteria:** Decision-grade regulatory intelligence, not news aggregation

---

## 1. Event-Based Aggregation (Check 5)

### 1.1 Core Concept

A **Regulatory Event** is a discrete, identifiable moment in the regulatory lifecycle that changes the compliance landscape. Events are canonical — multiple articles may reference the same event, but the event itself is the unit of decision-making.

### 1.2 Event Model Schema

```typescript
interface RegulatoryEvent {
  id: number;
  
  // Event Identity
  eventType: EventType;
  eventDate: Date;
  eventTitle: string;           // Canonical title (e.g., "CSDDD Final Adoption")
  
  // Regulatory Context
  affectedRegulations: string[];  // ["CSDDD", "CSRD"]
  lifecycleState: LifecycleState; // PROPOSAL → ADOPTED → ENFORCEMENT
  
  // Decision Intelligence (Check 6)
  previousAssumption: string;     // What was believed before
  newInformation: string;         // What this event reveals
  whatChanged: string;            // Explicit delta
  whatDidNotChange: string;       // Stability confirmation
  decisionImpact: string;         // Why this matters for decisions
  
  // Metadata
  confidenceLevel: ConfidenceLevel;
  isNegativeSignal: boolean;
  sourceArticleIds: number[];     // Links to hub_news articles
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}
```

### 1.3 Event Types (Exhaustive)

| EventType | Description | Example |
|-----------|-------------|---------|
| `PROPOSAL` | Initial legislative proposal | "EC proposes Green Claims Directive" |
| `POLITICAL_AGREEMENT` | Council/Parliament agreement | "Trilogue agreement on CSDDD" |
| `ADOPTION` | Final adoption by EU institutions | "CSDDD adopted by Parliament" |
| `PUBLICATION` | Publication in Official Journal | "CSRD published in OJ" |
| `DELEGATED_ACT_DRAFT` | Draft delegated/implementing act | "Draft ESPR battery passport specs" |
| `DELEGATED_ACT_ADOPTED` | Adopted delegated/implementing act | "Battery passport specs finalized" |
| `GUIDANCE` | Official guidance/FAQ published | "EC CSRD FAQ published" |
| `ENFORCEMENT_START` | Enforcement begins | "EUDR enforcement starts" |
| `POSTPONEMENT` | Delay or postponement announced | "EUDR enforcement delayed 12 months" |
| `AMENDMENT` | Significant amendment to existing law | "CSRD scope reduced for SMEs" |
| `EXEMPTION` | New exemption or carve-out | "CSDDD SME exemption announced" |

### 1.4 Rubric Mapping (Check 5)

| Rubric Requirement | Design Response |
|--------------------|-----------------|
| "Canonical event object" | ✅ `regulatory_events` table with explicit schema |
| "event_type classification" | ✅ 11 exhaustive event types defined |
| "affected_regulation(s)" | ✅ `affectedRegulations` array field |
| "lifecycle_state" | ✅ `lifecycleState` enum field |
| "event_date" | ✅ `eventDate` field |
| "Multiple articles → one event" | ✅ `sourceArticleIds` array links articles to event |
| "News Hub distinguishes events from articles" | ✅ Separate `regulatory_events` table, UI shows events as primary unit |

---

## 2. Delta Analysis (Check 6)

### 2.1 Core Concept

**Delta Analysis** answers the question: "What changed, and why does it matter?" Every regulatory event must explicitly state what was assumed before, what is now known, and what decision-makers should do differently.

### 2.2 Delta Fields (Mandatory per Event)

| Field | Purpose | Example (CSDDD Adoption) |
|-------|---------|--------------------------|
| `previousAssumption` | What was believed before this event | "CSDDD scope and timeline remained uncertain pending Parliament vote" |
| `newInformation` | What this event reveals | "Parliament adopted CSDDD with 2027 enforcement for large companies, 2029 for others" |
| `whatChanged` | Explicit delta | "Timeline confirmed: 2027/2029 phased enforcement. Scope: >1000 employees or >€450M turnover" |
| `whatDidNotChange` | Stability confirmation | "Due diligence requirements remain as proposed. No SME exemption added." |
| `decisionImpact` | Why this matters for decisions | "Companies must now begin supply chain mapping and risk assessment. GS1 EPCIS implementation should start Q1 2026 to meet 2027 deadline." |

### 2.3 Rubric Mapping (Check 6)

| Rubric Requirement | Design Response |
|--------------------|-----------------|
| "previous_assumption" | ✅ Mandatory field on every event |
| "new_information" | ✅ Mandatory field on every event |
| "what_changed" | ✅ Mandatory field on every event |
| "what_did_not_change" | ✅ Mandatory field on every event |
| "decision_impact" | ✅ Mandatory field on every event |
| "No delta = no ISA-worthy event" | ✅ Pipeline rejects events without complete delta fields |

---

## 3. Database Schema

### 3.1 New Table: `regulatory_events`

```sql
CREATE TABLE regulatory_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Event Identity
  event_type ENUM('PROPOSAL', 'POLITICAL_AGREEMENT', 'ADOPTION', 'PUBLICATION', 
                  'DELEGATED_ACT_DRAFT', 'DELEGATED_ACT_ADOPTED', 'GUIDANCE',
                  'ENFORCEMENT_START', 'POSTPONEMENT', 'AMENDMENT', 'EXEMPTION') NOT NULL,
  event_date DATE NOT NULL,
  event_title VARCHAR(500) NOT NULL,
  
  -- Regulatory Context
  affected_regulations JSON NOT NULL,  -- ["CSDDD", "CSRD"]
  lifecycle_state ENUM('PROPOSAL', 'POLITICAL_AGREEMENT', 'ADOPTED', 
                       'DELEGATED_ACT_DRAFT', 'DELEGATED_ACT_ADOPTED', 
                       'GUIDANCE', 'ENFORCEMENT_SIGNAL', 'POSTPONED_OR_SOFTENED') NOT NULL,
  
  -- Delta Analysis (Check 6) - ALL MANDATORY
  previous_assumption TEXT NOT NULL,
  new_information TEXT NOT NULL,
  what_changed TEXT NOT NULL,
  what_did_not_change TEXT NOT NULL,
  decision_impact TEXT NOT NULL,
  
  -- Metadata
  confidence_level ENUM('CONFIRMED_LAW', 'DRAFT_PROPOSAL', 'GUIDANCE_INTERPRETATION', 'MARKET_PRACTICE') NOT NULL,
  is_negative_signal BOOLEAN DEFAULT FALSE,
  source_article_ids JSON NOT NULL,  -- [123, 456, 789]
  
  -- GS1 Context
  gs1_impact_summary TEXT,
  suggested_actions JSON,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_event_type (event_type),
  INDEX idx_event_date (event_date),
  INDEX idx_lifecycle_state (lifecycle_state)
);
```

### 3.2 Updated Table: `hub_news` (Add Foreign Key)

```sql
ALTER TABLE hub_news 
ADD COLUMN regulatory_event_id INT NULL,
ADD CONSTRAINT fk_regulatory_event 
    FOREIGN KEY (regulatory_event_id) 
    REFERENCES regulatory_events(id);
```

---

## 4. Pipeline Flow

### 4.1 Event Detection & Creation

```
1. Article Ingestion (existing)
   ↓
2. Event Detection (NEW)
   - AI analyzes article for event signals
   - Checks if event already exists (dedup by regulation + event_type + date range)
   - If new event: create with full delta analysis
   - If existing event: link article to event
   ↓
3. Delta Validation (NEW)
   - Reject events without complete delta fields
   - Log incomplete events for manual review
   ↓
4. Storage
   - Save event to regulatory_events
   - Link article via regulatory_event_id
```

### 4.2 AI Prompt for Event + Delta Extraction

```
You are analyzing a regulatory news article. Extract:

1. EVENT IDENTIFICATION
- Is this article about a specific regulatory event (adoption, proposal, guidance, etc.)?
- If yes, identify: event_type, event_date, affected_regulations

2. DELTA ANALYSIS (MANDATORY if event detected)
- previous_assumption: What was believed before this event?
- new_information: What does this event reveal?
- what_changed: What is explicitly different now?
- what_did_not_change: What remains stable?
- decision_impact: Why does this matter for compliance decisions?

If you cannot provide complete delta analysis, mark event as "INCOMPLETE".
```

---

## 5. UI Changes

### 5.1 News Hub: Event-Centric View

**Before (Article-Centric):**
```
[Article 1: CSDDD adopted by Parliament]
[Article 2: CSDDD vote passes]
[Article 3: Supply chain law approved]
```

**After (Event-Centric):**
```
[EVENT: CSDDD Final Adoption - April 24, 2024]
  ├── What Changed: Timeline confirmed (2027/2029)
  ├── Decision Impact: Begin supply chain mapping now
  └── Sources: 3 articles
```

### 5.2 Event Detail Page

```
┌─────────────────────────────────────────────────────────┐
│ CSDDD Final Adoption                                    │
│ ADOPTION • April 24, 2024 • CONFIRMED_LAW               │
├─────────────────────────────────────────────────────────┤
│ DELTA ANALYSIS                                          │
│                                                         │
│ ▶ Previous Assumption                                   │
│   CSDDD scope and timeline remained uncertain...        │
│                                                         │
│ ▶ What Changed                                          │
│   Timeline confirmed: 2027/2029 phased enforcement...   │
│                                                         │
│ ▶ What Did NOT Change                                   │
│   Due diligence requirements remain as proposed...      │
│                                                         │
│ ▶ Decision Impact                                       │
│   Companies must now begin supply chain mapping...      │
├─────────────────────────────────────────────────────────┤
│ GS1 IMPACT                                              │
│   • EPCIS implementation should start Q1 2026           │
│   • GLN registration for tier-1 suppliers required      │
├─────────────────────────────────────────────────────────┤
│ SOURCE ARTICLES (3)                                     │
│   • CSDDD adopted by Parliament (Reuters)               │
│   • EU supply chain law passes (EC Press)               │
│   • CSDDD vote analysis (EFRAG)                         │
└─────────────────────────────────────────────────────────┘
```

---

## 6. Acceptance Criteria Mapping

| Acceptance Criterion | Design Response |
|---------------------|-----------------|
| Check 5 → PASS | ✅ Canonical event model with 11 types, explicit schema, article-to-event linking |
| Check 6 → PASS | ✅ 5 mandatory delta fields, pipeline rejects incomplete events |
| Score ≥85% | ✅ +6 points from Check 5/6 closure → 26/33 (79%), plus existing improvements → target 28/33 (85%) |
| "Decision-grade intelligence" | ✅ Every event answers: What changed? Why does it matter? What should I do? |

---

## 7. Implementation Estimate

| Component | Effort | Priority |
|-----------|--------|----------|
| Database schema (regulatory_events table) | 1 hour | P0 |
| Drizzle schema + migration | 1 hour | P0 |
| AI prompt for event + delta extraction | 2 hours | P0 |
| Pipeline integration (event detection, linking) | 4 hours | P0 |
| Event detail page UI | 3 hours | P0 |
| News Hub event-centric view | 3 hours | P0 |
| Unit tests | 2 hours | P0 |
| **Total** | **16 hours** | |

---

## 8. Open Questions (For Approval)

1. **Event Deduplication Window:** Should events be considered duplicates if they occur within 7 days for the same regulation + event_type?

2. **Incomplete Event Handling:** Should incomplete events (missing delta fields) be:
   - (A) Rejected entirely
   - (B) Stored with "INCOMPLETE" flag for manual review
   - (C) Auto-completed with placeholder text

3. **Historical Backfill:** Should we create events for existing articles, or only for new articles going forward?

---

## 9. Approval Request

This design proposal addresses:
- ✅ Check 5: Event-Based Aggregation (canonical event model)
- ✅ Check 6: Delta Analysis (5 mandatory fields)
- ✅ Rubric alignment (explicit mapping per requirement)
- ✅ Decision-grade intelligence (not news aggregation)

**Awaiting explicit approval before implementation.**
