# Critical Events Taxonomy for ISA News Hub
**Date:** December 17, 2025  
**Version:** 1.0  
**Status:** Design Specification

## Purpose

Define a taxonomy of **critical regulatory events** that warrant immediate attention from GS1 Netherlands users. Critical events trigger proactive alerts and are highlighted in the News Hub to ensure users never miss high-impact developments affecting their compliance obligations.

## Design Principles

1. **Actionability**: Every critical event should require a user response or decision
2. **Materiality**: Events must have significant impact on GS1 data models, standards, or member obligations
3. **Timeliness**: Events must be time-sensitive (deadlines, effective dates, comment periods)
4. **Clarity**: Event types must be unambiguous and machine-detectable

## Critical Event Types

### 1. Compliance Deadline Events

**Definition:** Official dates by which organizations must achieve compliance with a regulation or standard.

**Examples:**
- CSRD reporting deadline for large companies (2025-01-01)
- EUDR implementation deadline (2025-12-30)
- DPP battery passport effective date (2027-02-18)

**Detection Criteria:**
- Keywords: "deadline", "effective date", "compliance date", "must comply by"
- Date extraction: Specific future date within 24 months
- Impact level: HIGH or CRITICAL

**User Action Required:**
- Review compliance readiness
- Update GS1 data models if needed
- Plan implementation timeline

---

### 2. Regulatory Amendment Events

**Definition:** Changes to existing regulations that modify obligations, scope, or technical requirements.

**Examples:**
- ESRS standards updated with new datapoints
- PPWR packaging targets revised
- EUDR deforestation risk criteria expanded

**Detection Criteria:**
- Keywords: "amendment", "revision", "update", "modification", "delegated act"
- References to existing regulation (CELEX ID, regulation name)
- Impact level: MEDIUM or HIGH

**User Action Required:**
- Assess impact on current compliance approach
- Update documentation and processes
- Communicate changes to stakeholders

---

### 3. Consultation Period Events

**Definition:** Public comment periods where stakeholders can influence regulatory development.

**Examples:**
- EFRAG consultation on ESRS sector-specific standards
- EU Commission consultation on Green Claims Directive
- GS1 request for comments on provisional standards

**Detection Criteria:**
- Keywords: "consultation", "public comment", "feedback period", "call for input"
- Closing date within 90 days
- Impact level: MEDIUM

**User Action Required:**
- Review consultation document
- Prepare and submit comments
- Coordinate with GS1 NL advocacy team

---

### 4. New Regulation Announcement Events

**Definition:** First announcement of new regulations that will affect GS1 members.

**Examples:**
- Green Claims Directive proposal published
- CSDDD (Corporate Sustainability Due Diligence Directive) adopted
- New ESPR delegated act for textiles

**Detection Criteria:**
- Keywords: "proposal", "directive", "regulation", "adopted", "published"
- First occurrence of regulation name in news corpus
- Impact level: HIGH

**User Action Required:**
- Assess potential impact on GS1 data models
- Monitor legislative progress
- Begin preliminary gap analysis

---

### 5. GS1 Standard Update Events

**Definition:** Updates to GS1 standards, data models, or guidance that affect member implementations.

**Examples:**
- GS1 NL Data Source Benelux v3.1.34 released
- GS1 Digital Product Passport standard finalized
- GDSN 3.2 with new sustainability attributes

**Detection Criteria:**
- Source: GS1 official channels (GS1 NL, GS1 Europe, GS1 Global)
- Keywords: "release", "version", "update", "standard", "data model"
- Impact level: HIGH

**User Action Required:**
- Review changes to data model
- Plan migration timeline
- Update product data and systems

---

### 6. Enforcement Action Events

**Definition:** Regulatory enforcement actions, penalties, or compliance audits that signal increased scrutiny.

**Examples:**
- First CSRD non-compliance penalties issued
- EUDR enforcement begins with border checks
- National authority publishes audit findings

**Detection Criteria:**
- Keywords: "enforcement", "penalty", "fine", "audit", "non-compliance"
- References to specific companies or sectors
- Impact level: HIGH or CRITICAL

**User Action Required:**
- Review own compliance status
- Identify potential gaps
- Implement corrective actions

---

### 7. Technical Guidance Events

**Definition:** Official guidance, FAQs, or interpretations that clarify regulatory requirements.

**Examples:**
- EFRAG Q&A on ESRS E1 Scope 3 emissions
- EU Commission guidance on DPP data carriers
- GS1 white paper on CSRD compliance using GDSN

**Detection Criteria:**
- Keywords: "guidance", "FAQ", "interpretation", "clarification", "Q&A"
- Source: Authoritative body (EFRAG, EU Commission, GS1)
- Impact level: MEDIUM

**User Action Required:**
- Review guidance for new requirements
- Update compliance approach if needed
- Share with implementation teams

---

### 8. Sector-Specific Mandate Events

**Definition:** Regulations or standards that apply to specific industries (food, healthcare, textiles, etc.).

**Examples:**
- ESPR delegated act for electronics sector
- Food safety regulation requiring GTIN on all products
- Healthcare MDR updates affecting medical device traceability

**Detection Criteria:**
- Keywords: sector names (food, healthcare, textiles, electronics, etc.)
- Sector-specific regulations (MDR, IVDR, food safety)
- Impact level: HIGH for affected sectors

**User Action Required:**
- Assess if sector applies to organization
- Review sector-specific requirements
- Update sector data models

---

## Event Severity Levels

| Level | Definition | Response Time | Alert Method |
|-------|------------|---------------|--------------|
| **CRITICAL** | Immediate action required within 30 days | 24 hours | Email + Dashboard banner |
| **HIGH** | Action required within 90 days | 3 days | Email + Dashboard highlight |
| **MEDIUM** | Action required within 180 days | 7 days | Dashboard notification |
| **LOW** | Informational, no immediate action | None | Dashboard only |

## Detection Algorithm

### Step 1: Keyword Matching

Extract event type candidates using keyword patterns:

```typescript
const EVENT_PATTERNS = {
  COMPLIANCE_DEADLINE: /deadline|effective date|compliance date|must comply by/i,
  REGULATORY_AMENDMENT: /amendment|revision|update|modification|delegated act/i,
  CONSULTATION_PERIOD: /consultation|public comment|feedback period|call for input/i,
  NEW_REGULATION: /proposal|directive.*adopted|regulation.*published/i,
  GS1_STANDARD_UPDATE: /release|version \d+\.\d+|standard.*update/i,
  ENFORCEMENT_ACTION: /enforcement|penalty|fine|audit|non-compliance/i,
  TECHNICAL_GUIDANCE: /guidance|FAQ|interpretation|clarification|Q&A/i,
  SECTOR_MANDATE: /food|healthcare|textiles|electronics|construction/i,
};
```

### Step 2: Date Extraction

Identify time-sensitive dates using NLP:

```typescript
// Extract dates from content
const dates = extractDates(newsContent);

// Calculate urgency
const daysUntilEvent = daysBetween(today, eventDate);

// Map to severity
const severity = 
  daysUntilEvent < 30 ? 'CRITICAL' :
  daysUntilEvent < 90 ? 'HIGH' :
  daysUntilEvent < 180 ? 'MEDIUM' : 'LOW';
```

### Step 3: Impact Assessment

Use AI to assess impact on GS1 standards:

```typescript
const impactAnalysis = await invokeLLM({
  messages: [{
    role: 'system',
    content: 'Assess if this regulatory event requires changes to GS1 data models or member compliance processes.'
  }, {
    role: 'user',
    content: newsContent
  }],
  response_format: {
    type: 'json_schema',
    json_schema: {
      name: 'impact_assessment',
      schema: {
        type: 'object',
        properties: {
          requiresAction: { type: 'boolean' },
          affectedStandards: { type: 'array', items: { type: 'string' } },
          estimatedEffort: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] }
        }
      }
    }
  }
});
```

### Step 4: Confidence Scoring

Calculate confidence that event is truly critical:

```typescript
const confidence = 
  (keywordMatch ? 0.3 : 0) +
  (dateExtracted ? 0.3 : 0) +
  (impactAnalysis.requiresAction ? 0.4 : 0);

// Only flag as critical if confidence > 0.7
const isCritical = confidence > 0.7;
```

## Database Schema

```typescript
export const criticalEvents = mysqlTable('critical_events', {
  id: int('id').primaryKey().autoincrement(),
  newsId: int('news_id').notNull().references(() => hubNews.id),
  eventType: varchar('event_type', { length: 50 }).notNull(),
  severity: varchar('severity', { length: 20 }).notNull(),
  eventDate: timestamp('event_date'),
  daysUntilEvent: int('days_until_event'),
  detectionConfidence: decimal('detection_confidence', { precision: 3, scale: 2 }),
  affectedRegulations: json('affected_regulations'),
  affectedStandards: json('affected_standards'),
  affectedSectors: json('affected_sectors'),
  actionRequired: text('action_required'),
  alertSent: boolean('alert_sent').default(false),
  alertSentAt: timestamp('alert_sent_at'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow().onUpdateNow(),
});
```

## Alert Delivery

### Email Alert Template

```
Subject: [CRITICAL] CSRD Compliance Deadline in 28 Days

Dear GS1 Netherlands Member,

A critical regulatory event has been detected that requires your immediate attention:

EVENT: Compliance Deadline
REGULATION: Corporate Sustainability Reporting Directive (CSRD)
DEADLINE: 2025-01-15 (28 days remaining)
SEVERITY: CRITICAL

WHAT THIS MEANS:
Large companies must submit their first CSRD sustainability report by January 15, 2025. This requires ESRS-compliant disclosures covering environmental, social, and governance topics.

AFFECTED GS1 STANDARDS:
- GDSN (product master data for Scope 3 emissions)
- EPCIS (supply chain traceability for due diligence)
- GS1 Digital Link (product identification for DPP)

ACTION REQUIRED:
1. Verify your ESRS datapoint coverage using ISA Advisory v1.1
2. Update GDSN product data with sustainability attributes
3. Implement EPCIS traceability for high-risk supply chains
4. Contact GS1 NL support if you need implementation guidance

View full details: https://isa.gs1.nl/news/12345

---
This is an automated alert from ISA (Intelligent Standards Architect).
Manage alert preferences: https://isa.gs1.nl/settings/alerts
```

### Dashboard Alert Banner

```tsx
<Alert variant="destructive">
  <AlertTriangle className="h-4 w-4" />
  <AlertTitle>CRITICAL: CSRD Compliance Deadline in 28 Days</AlertTitle>
  <AlertDescription>
    Large companies must submit ESRS-compliant sustainability reports by January 15, 2025.
    <Link to="/news/12345">View details and action plan →</Link>
  </AlertDescription>
</Alert>
```

## SLA Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Detection latency | < 24 hours from publication | Time between source publish and ISA detection |
| False positive rate | < 10% | Critical events that don't require action |
| False negative rate | < 5% | Missed critical events (manual audit) |
| Alert delivery time | < 1 hour from detection | Time between detection and email sent |
| User action rate | > 40% | % of critical alerts that result in user action |

## Future Enhancements

1. **User Preferences**: Allow users to customize event types and severity thresholds
2. **Snooze/Dismiss**: Let users snooze non-relevant alerts
3. **Action Tracking**: Track which users have acknowledged and acted on events
4. **Predictive Alerts**: Use ML to predict upcoming critical events based on legislative patterns
5. **Integration**: Push alerts to Slack, Teams, or other collaboration tools

---

**Status:** Design complete, ready for implementation  
**Next Steps:** Implement detection algorithm and database schema
