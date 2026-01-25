# Phase 2 Design Proposal: Formele Evaluatie

**Document:** Phase 2 Design Proposal: Hard-Gate Closure  
**Evaluator:** Manus AI  
**Datum:** 24 januari 2026  
**Status:** Bindend ontwerpbesluit — evaluatie met voorgestelde verbeteringen

---

## 1. Bevestiging: Ontwerp Begrepen

Ik bevestig dat ik het ontwerp volledig begrijp:

| Component | Begrip Bevestigd |
|-----------|------------------|
| Regulatory Event als canonieke eenheid | ✅ Event vervangt artikel als primaire beslissingseenheid |
| 11 Event Types | ✅ Exhaustieve classificatie van regelgevingsmomenten |
| 5 Verplichte Delta Velden | ✅ Elk event moet expliciet beantwoorden wat veranderde en waarom |
| Article-to-Event Linking | ✅ Meerdere artikelen → één event via `source_article_ids` |
| Pipeline Validatie | ✅ Events zonder complete delta worden afgewezen |

---

## 2. Bijdrage aan Hard-Gate Closure

### Check 5: Event-Based Aggregation

| Rubric Vereiste | Ontwerp Respons | Sluit Hard-Gate? |
|-----------------|-----------------|------------------|
| Canoniek event object | `regulatory_events` tabel met expliciet schema | ✅ JA |
| event_type classificatie | 11 exhaustieve types | ✅ JA |
| affected_regulation(s) | JSON array veld | ✅ JA |
| lifecycle_state | Enum veld | ✅ JA |
| event_date | DATE veld | ✅ JA |
| Meerdere artikelen → één event | `source_article_ids` array | ✅ JA |
| News Hub onderscheidt events van artikelen | Aparte tabel + event-centric UI | ✅ JA |

**Conclusie Check 5:** Ontwerp sluit hard-gate volledig.

### Check 6: Delta Analysis

| Rubric Vereiste | Ontwerp Respons | Sluit Hard-Gate? |
|-----------------|-----------------|------------------|
| previous_assumption | Verplicht TEXT veld | ✅ JA |
| new_information | Verplicht TEXT veld | ✅ JA |
| what_changed | Verplicht TEXT veld | ✅ JA |
| what_did_not_change | Verplicht TEXT veld | ✅ JA |
| decision_impact | Verplicht TEXT veld | ✅ JA |
| Geen delta = geen ISA-waardig event | Pipeline rejecteert incomplete events | ✅ JA |

**Conclusie Check 6:** Ontwerp sluit hard-gate volledig.

---

## 3. Kritische Evaluatie: Verbeterpunten

Het ontwerp is fundamenteel correct, maar ik identificeer **3 verbeterpunten** die de kwaliteit en beslissingswaarde verhogen:

### 3.1 Verbetering 1: Event Deduplicatie Logica (Kritisch)

**Probleem:** Het ontwerp noemt deduplicatie "by regulation + event_type + date range" maar specificeert niet hoe dit werkt wanneer:
- Hetzelfde event door meerdere bronnen wordt gerapporteerd op verschillende dagen
- Een event evolueert (bijv. "CSDDD agreement" → "CSDDD adoption" binnen 2 weken)

**Voorgestelde Verbetering:**

```typescript
interface EventDeduplicationKey {
  // Primary key: regulation + event_type + quarter
  primaryRegulation: string;      // Hoofdregelgeving (bijv. "CSDDD")
  eventType: EventType;           // Type event
  eventQuarter: string;           // "2024-Q2" (niet dag, maar kwartaal)
  
  // Secondary validation
  eventDateRange: {
    earliest: Date;               // Eerste melding
    latest: Date;                 // Laatste melding
  };
}
```

**Motivatie:** 
- Kwartaal-gebaseerde deduplicatie voorkomt dat hetzelfde event meerdere keren wordt aangemaakt bij kleine datumverschillen
- `eventDateRange` houdt bij wanneer het event voor het eerst en laatst werd gerapporteerd
- Dit verhoogt de score omdat het "fragmentatie" expliciet voorkomt (Check 5 vereiste)

### 3.2 Verbetering 2: Event Confidence Inheritance (Belangrijk)

**Probleem:** Het ontwerp heeft `confidence_level` op event-niveau, maar specificeert niet hoe dit wordt bepaald wanneer meerdere artikelen met verschillende confidence levels naar hetzelfde event verwijzen.

**Voorgestelde Verbetering:**

```typescript
// Confidence wordt bepaald door hoogste autoriteit bron
function determineEventConfidence(sourceArticles: Article[]): ConfidenceLevel {
  const authorityOrder = ['EUR_LEX', 'EC_PRESS', 'EFRAG', 'GS1_OFFICIAL', 'DUTCH_NATIONAL', 'INDUSTRY'];
  
  // Hoogste autoriteit bron bepaalt confidence
  const highestAuthority = sourceArticles
    .sort((a, b) => authorityOrder.indexOf(a.sourceType) - authorityOrder.indexOf(b.sourceType))
    [0];
  
  return highestAuthority.confidenceLevel;
}
```

**Motivatie:**
- Voorkomt dat een event met EUR-Lex bron wordt gedegradeerd door een industrie-artikel
- Expliciet gekoppeld aan Check 4 (Source Authority Hierarchy)
- Verhoogt beslissingswaarde door duidelijke autoriteitsafleiding

### 3.3 Verbetering 3: Delta Completeness Score (Belangrijk)

**Probleem:** Het ontwerp zegt "reject events without complete delta fields", maar definieert niet wat "complete" betekent. Een veld met "Unknown" of "N/A" is technisch gevuld maar niet informatief.

**Voorgestelde Verbetering:**

```typescript
interface DeltaCompletenessValidation {
  // Minimum karakters per veld (voorkomt placeholder tekst)
  minCharacters: {
    previousAssumption: 50;       // Moet context geven
    newInformation: 50;           // Moet specifiek zijn
    whatChanged: 30;              // Kan kort zijn als expliciet
    whatDidNotChange: 30;         // Kan kort zijn als expliciet
    decisionImpact: 100;          // Moet actionable zijn
  };
  
  // Verboden placeholder patronen
  forbiddenPatterns: [
    /^(unknown|n\/a|not applicable|to be determined|tbd)$/i,
    /^(no change|nothing|none)$/i,  // Te vaag
  ];
}
```

**Motivatie:**
- Voorkomt dat AI placeholder tekst genereert die technisch valideert maar geen waarde heeft
- Dwingt decision-grade kwaliteit af op veldniveau
- Direct gekoppeld aan Check 6 vereiste "No delta = no ISA-worthy event"

---

## 4. Antwoorden op Open Vragen

### Vraag 1: Event Deduplicatie Window

**Aanbeveling:** Gebruik **kwartaal-gebaseerde deduplicatie**, niet 7 dagen.

**Motivatie:**
- Regelgevingsprocessen duren weken/maanden, niet dagen
- 7 dagen is te kort — dezelfde adoptie kan 2 weken later nog worden gerapporteerd
- Kwartaal is de juiste granulariteit voor EU regelgeving

### Vraag 2: Incomplete Event Handling

**Aanbeveling:** **(B) Opslaan met "INCOMPLETE" flag voor handmatige review**

**Motivatie:**
- (A) Volledig afwijzen verliest waardevolle signalen
- (C) Auto-aanvullen degradeert kwaliteit en maskeert gaps
- (B) behoudt signaal, markeert expliciet als onvolledig, en staat handmatige verrijking toe

**Implementatie:**
```typescript
enum EventStatus {
  COMPLETE = 'complete',      // Alle delta velden gevuld en gevalideerd
  INCOMPLETE = 'incomplete',  // Sommige delta velden ontbreken of zijn onvoldoende
  DRAFT = 'draft',            // Handmatig aangemaakt, nog niet gevalideerd
}
```

### Vraag 3: Historische Backfill

**Aanbeveling:** **Ja, backfill voor bestaande artikelen**, maar met prioritering.

**Motivatie:**
- Bestaande 35 artikelen bevatten waardevolle events die nu verloren gaan
- Zonder backfill start de News Hub met 0 events — slechte UX
- Backfill demonstreert dat het model werkt op echte data

**Implementatie:**
1. Eerst: Nieuwe artikelen krijgen automatisch event-detectie
2. Daarna: Batch-backfill van bestaande artikelen (kan async)
3. Prioriteit: Artikelen met `regulatory_state = ADOPTED` eerst (hoogste beslissingswaarde)

---

## 5. Verbeterd Ontwerp (Herschreven Secties)

### 5.1 Verbeterd Database Schema

```sql
CREATE TABLE regulatory_events (
  id INT PRIMARY KEY AUTO_INCREMENT,
  
  -- Event Identity
  event_type ENUM('PROPOSAL', 'POLITICAL_AGREEMENT', 'ADOPTION', 'PUBLICATION', 
                  'DELEGATED_ACT_DRAFT', 'DELEGATED_ACT_ADOPTED', 'GUIDANCE',
                  'ENFORCEMENT_START', 'POSTPONEMENT', 'AMENDMENT', 'EXEMPTION') NOT NULL,
  event_date DATE NOT NULL,
  event_title VARCHAR(500) NOT NULL,
  
  -- Deduplication Key (NIEUW)
  dedup_key VARCHAR(100) NOT NULL UNIQUE,  -- Format: "{regulation}_{event_type}_{quarter}"
  event_date_earliest DATE NOT NULL,        -- Eerste melding
  event_date_latest DATE NOT NULL,          -- Laatste melding
  
  -- Regulatory Context
  primary_regulation VARCHAR(50) NOT NULL,  -- Hoofdregelgeving (NIEUW)
  affected_regulations JSON NOT NULL,       -- Alle gerelateerde regelgeving
  lifecycle_state ENUM('PROPOSAL', 'POLITICAL_AGREEMENT', 'ADOPTED', 
                       'DELEGATED_ACT_DRAFT', 'DELEGATED_ACT_ADOPTED', 
                       'GUIDANCE', 'ENFORCEMENT_SIGNAL', 'POSTPONED_OR_SOFTENED') NOT NULL,
  
  -- Delta Analysis (Check 6) - ALL MANDATORY
  previous_assumption TEXT NOT NULL,
  new_information TEXT NOT NULL,
  what_changed TEXT NOT NULL,
  what_did_not_change TEXT NOT NULL,
  decision_impact TEXT NOT NULL,
  
  -- Completeness Tracking (NIEUW)
  status ENUM('COMPLETE', 'INCOMPLETE', 'DRAFT') NOT NULL DEFAULT 'INCOMPLETE',
  completeness_score INT NOT NULL DEFAULT 0,  -- 0-100 gebaseerd op veld kwaliteit
  
  -- Metadata
  confidence_level ENUM('CONFIRMED_LAW', 'DRAFT_PROPOSAL', 'GUIDANCE_INTERPRETATION', 'MARKET_PRACTICE') NOT NULL,
  confidence_source VARCHAR(100),            -- Welke bron bepaalde confidence (NIEUW)
  is_negative_signal BOOLEAN DEFAULT FALSE,
  source_article_ids JSON NOT NULL,
  
  -- GS1 Context
  gs1_impact_summary TEXT,
  suggested_actions JSON,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  -- Indexes
  INDEX idx_event_type (event_type),
  INDEX idx_event_date (event_date),
  INDEX idx_lifecycle_state (lifecycle_state),
  INDEX idx_primary_regulation (primary_regulation),
  INDEX idx_status (status)
);
```

### 5.2 Verbeterde Pipeline Validatie

```typescript
function validateEventDelta(event: RegulatoryEvent): ValidationResult {
  const errors: string[] = [];
  
  // Minimum karakters validatie
  const minChars = {
    previousAssumption: 50,
    newInformation: 50,
    whatChanged: 30,
    whatDidNotChange: 30,
    decisionImpact: 100,
  };
  
  for (const [field, min] of Object.entries(minChars)) {
    const value = event[field as keyof RegulatoryEvent] as string;
    if (!value || value.length < min) {
      errors.push(`${field} must be at least ${min} characters (got ${value?.length || 0})`);
    }
  }
  
  // Verboden placeholder patronen
  const forbiddenPatterns = [
    /^(unknown|n\/a|not applicable|to be determined|tbd)$/i,
    /^(no change|nothing|none|not available)$/i,
  ];
  
  for (const field of Object.keys(minChars)) {
    const value = event[field as keyof RegulatoryEvent] as string;
    for (const pattern of forbiddenPatterns) {
      if (pattern.test(value?.trim() || '')) {
        errors.push(`${field} contains forbidden placeholder text`);
      }
    }
  }
  
  // Bereken completeness score
  const completenessScore = calculateCompletenessScore(event);
  
  return {
    isValid: errors.length === 0 && completenessScore >= 80,
    errors,
    completenessScore,
    status: completenessScore >= 80 ? 'COMPLETE' : 'INCOMPLETE',
  };
}
```

---

## 6. Score Impact Analyse

### Huidige Score: 20/33 (61%)

### Verwachte Score na Phase 2:

| Check | Huidige Score | Na Phase 2 | Reden |
|-------|---------------|------------|-------|
| Check 1 (Decision Value) | 2/3 | 3/3 | Events zijn per definitie decision-grade |
| Check 2 (Obligation Detection) | 2/3 | 2/3 | Geen wijziging |
| Check 3 (Lifecycle State) | 3/3 | 3/3 | Behouden |
| Check 4 (Source Authority) | 2/3 | 3/3 | Confidence inheritance van hoogste bron |
| **Check 5 (Event Aggregation)** | **0/3 (FAIL)** | **3/3 (PASS)** | **Hard-gate gesloten** |
| **Check 6 (Delta Analysis)** | **0/3 (FAIL)** | **3/3 (PASS)** | **Hard-gate gesloten** |
| Check 7 (Stability Warning) | 2/3 | 3/3 | Events met INCOMPLETE status krijgen warning |
| Check 8 (Negative Signal) | 3/3 | 3/3 | Behouden |
| Check 9 (Confidence Level) | 2/3 | 3/3 | Confidence inheritance verbetert accuraatheid |
| Check 10 (GS1 Mapping) | 3/3 | 3/3 | Behouden |
| Check 11 (Actionability) | 2/3 | 3/3 | decision_impact veld dwingt actionability af |

### Verwachte Eindscore: 31/33 (94%)

Dit overschrijdt de target van ≥85%.

---

## 7. Conclusie

### Ontwerp Beoordeling

| Aspect | Oordeel |
|--------|---------|
| Sluit Check 5 (Event-Based Aggregation)? | ✅ JA |
| Sluit Check 6 (Delta Analysis)? | ✅ JA |
| Levert decision-grade intelligence? | ✅ JA — elk event beantwoordt expliciet "wat veranderde en waarom" |
| Haalt ≥85% score? | ✅ JA — verwacht 94% |

### Voorgestelde Verbeteringen

| Verbetering | Impact | Aanbeveling |
|-------------|--------|-------------|
| Kwartaal-gebaseerde deduplicatie | Voorkomt fragmentatie | **Adopteren** |
| Confidence inheritance van hoogste bron | Verhoogt autoriteit | **Adopteren** |
| Delta completeness score met validatie | Voorkomt placeholder tekst | **Adopteren** |
| Status veld (COMPLETE/INCOMPLETE/DRAFT) | Expliciet kwaliteitssignaal | **Adopteren** |

### Finale Aanbeveling

**Het ontwerp is goedgekeurd met de voorgestelde verbeteringen.**

De verbeteringen zijn geen herdefinitie van het kader, maar operationele verfijningen die de kwaliteit en beslissingswaarde verhogen zonder de scope uit te breiden.

---

**Wacht op expliciete goedkeuring van dit evaluatiedocument voordat implementatie start.**
