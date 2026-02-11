# Phase 3 Startdocument — Coverage & Intelligence Expansion

**Document Version:** 1.0  
**Date:** 25 January 2026  
**Author:** Manus AI  
**Status:** AWAITING APPROVAL

---

## 1. Formele Uitgangspositie

| Aspect | Waarde |
|--------|--------|
| Baseline | ISA News Hub v2 — decision-grade |
| Baseline Status | ISA-GRADE — PASS (28/33, 85%) |
| Baseline Checkpoint | c4e7e2fb |
| Baseline Freeze Date | 25 January 2026 |
| Phase 3 Start | 25 January 2026 |

De baseline is FROZEN en mag niet worden gewijzigd. Phase 3 bouwt uitsluitend voort op deze baseline met additive, traceerbare wijzigingen.

---

## 2. Scope-Afbakening

### 2.1 Wat WEL binnen scope valt

Phase 3 richt zich op het vergroten van de inhoudelijke en operationele waarde van de News Hub door drie uitbreidingslijnen:

1. **Coverage-uitbreiding** — Toevoegen van ontbrekende EU en NL ESG-bronnen
2. **Intelligence-verdieping** — Verbeteren van obligation en negative signal detection
3. **Gebruikersoriëntatie** — Ontwerpen van een Events Overview pagina

### 2.2 Wat NIET binnen scope valt

| Uitgesloten | Reden |
|-------------|-------|
| Wijzigingen aan Phase 2 of baseline-code | Baseline is FROZEN |
| Rubric-aanpassingen | Governance-regel |
| Nieuwe scores of her-certificering | Geen re-assessment in Phase 3 |
| Redesign van bestaande pagina's | Alleen additive wijzigingen |
| ML-experimenten buiten bestaande AI-processor | Scope-beperking |
| Nieuwe database schema wijzigingen aan bestaande tabellen | Baseline-integriteit |

---

## 3. Geselecteerde Uitbreidingslijnen

### 3.1 Lijn 1: Coverage-Uitbreiding (PRIORITEIT)

**Doel:** Toevoegen van ontbrekende EU en NL ESG-bronnen met focus op CS3D/CSDDD, Green Claims, en ESPR delegated acts.

**Deliverables:**
- Bronnenlijst met authority tier, betrouwbaarheid, en dekkingswaarde per bron
- Configuratie voor nieuwe bronnen in de bestaande pipeline
- Monitoring dashboard voor brondekking

**Aanpak:**
- Identificeer ontbrekende bronnen via gap-analyse tegen huidige coverage
- Classificeer bronnen op authority tier (Tier 1: Official EU/NL, Tier 2: Regulatory bodies, Tier 3: Industry/news)
- Configureer bronnen in bestaande RSS/scraping pipeline
- Valideer output tegen decision-grade kwaliteitseisen

### 3.2 Lijn 2: Intelligence-Verdieping

**Doel:** Verbeteren van obligation detection en negative signal detection binnen de bestaande AI-processor.

**Deliverables:**
- Uitgebreide keyword-sets voor obligation detection (shall, must, required, mandatory, etc.)
- Uitgebreide keyword-sets voor negative signals (delay, exemption, softening, postponement, etc.)
- Verbeterde scoring-logica in bestaande processor

**Aanpak:**
- Analyseer huidige detection-gaps via false negative analyse
- Uitbreiden van keyword-dictionaries zonder structurele wijzigingen
- Toevoegen van context-aware matching (bijv. "shall not" vs "shall")
- Valideren via unit tests

### 3.3 Lijn 3: Gebruikersoriëntatie (UX)

**Doel:** Ontwerpen van een Events Overview pagina met filtering op regulation, lifecycle, en stability_risk.

**Deliverables:**
- Events Overview pagina (`/events`)
- Filter-functionaliteit (regulation, lifecycle_state, stability_risk)
- Sorteer-functionaliteit (date, completeness, stability_risk)

**Aanpak:**
- Nieuwe route `/events` toevoegen (additive)
- Hergebruik van bestaande EventContext en EventDetail componenten
- Implementatie van client-side filtering met bestaande tRPC procedures
- Geen wijzigingen aan bestaande pagina's

---

## 4. Bronnenlijst & Prioritering

### 4.1 Huidige Coverage (Baseline)

De huidige News Hub dekt de volgende regulaties en bronnen:

| Regulatie | Coverage | Bronnen |
|-----------|----------|---------|
| CSRD/ESRS | Hoog | EFRAG, EU Official Journal, ESG Today |
| PPWR | Hoog | EU Official Journal, Packaging Europe |
| EU Taxonomy | Medium | EU Official Journal, Sustainable Finance |
| CSDDD/CS3D | Laag | Beperkte coverage |
| Green Claims | Laag | Beperkte coverage |
| ESPR | Laag | Beperkte coverage |

### 4.2 Prioriteit 1: CS3D / CSDDD Bronnen

| Bron | Authority Tier | Betrouwbaarheid | Dekkingswaarde | Prioriteit |
|------|----------------|-----------------|----------------|------------|
| EU Official Journal (CSDDD) | Tier 1 | Zeer hoog | Hoog | P1 |
| European Commission DG JUST | Tier 1 | Zeer hoog | Hoog | P1 |
| Business & Human Rights Resource Centre | Tier 2 | Hoog | Medium | P2 |
| Shift Project | Tier 2 | Hoog | Medium | P2 |

**Rationale:** CSDDD is een van de meest impactvolle nieuwe EU-regulaties voor supply chain due diligence. Huidige coverage is onvoldoende voor decision-grade intelligence.

### 4.3 Prioriteit 2: Green Claims Bronnen

| Bron | Authority Tier | Betrouwbaarheid | Dekkingswaarde | Prioriteit |
|------|----------------|-----------------|----------------|------------|
| EU Official Journal (Green Claims Directive) | Tier 1 | Zeer hoog | Hoog | P1 |
| European Commission DG ENV | Tier 1 | Zeer hoog | Hoog | P1 |
| BEUC (Consumer Organization) | Tier 2 | Hoog | Medium | P2 |
| Environmental Coalition on Standards | Tier 2 | Hoog | Medium | P3 |

**Rationale:** Green Claims Directive heeft directe impact op product marketing en labeling. GS1-relevantie is hoog vanwege product data requirements.

### 4.4 Prioriteit 3: ESPR Delegated Acts Bronnen

| Bron | Authority Tier | Betrouwbaarheid | Dekkingswaarde | Prioriteit |
|------|----------------|-----------------|----------------|------------|
| EU Official Journal (ESPR) | Tier 1 | Zeer hoog | Hoog | P1 |
| European Commission DG GROW | Tier 1 | Zeer hoog | Hoog | P1 |
| DIGITALEUROPE | Tier 2 | Hoog | Medium | P2 |
| Ecodesign Forum | Tier 3 | Medium | Medium | P3 |

**Rationale:** ESPR delegated acts definiëren product-specifieke eisen voor Digital Product Passport. Directe GS1-relevantie voor data carriers en product identification.

### 4.5 Aanvullende NL-Specifieke Bronnen

| Bron | Authority Tier | Betrouwbaarheid | Dekkingswaarde | Prioriteit |
|------|----------------|-----------------|----------------|------------|
| Rijksoverheid.nl (ESG) | Tier 1 | Zeer hoog | Hoog | P1 |
| SER (Sociaal-Economische Raad) | Tier 1 | Zeer hoog | Medium | P2 |
| MVO Nederland | Tier 2 | Hoog | Medium | P2 |
| IMVO Convenanten | Tier 2 | Hoog | Medium | P3 |

**Rationale:** NL-specifieke implementatie van EU-regulaties vereist lokale bronnen voor compliance-advies.

---

## 5. Success-Criteria

### 5.1 Coverage-Uitbreiding

| Criterium | Meetbaar Doel | Verificatie |
|-----------|---------------|-------------|
| Nieuwe bronnen toegevoegd | ≥8 nieuwe bronnen | Bronconfiguratie audit |
| CSDDD coverage | ≥3 Tier 1 bronnen | Bronnenlijst verificatie |
| Green Claims coverage | ≥2 Tier 1 bronnen | Bronnenlijst verificatie |
| ESPR coverage | ≥2 Tier 1 bronnen | Bronnenlijst verificatie |
| Authority tier documentatie | 100% bronnen geclassificeerd | Documentatie review |

### 5.2 Intelligence-Verdieping

| Criterium | Meetbaar Doel | Verificatie |
|-----------|---------------|-------------|
| Obligation keywords uitgebreid | ≥20 nieuwe keywords | Keyword-dictionary audit |
| Negative signal keywords uitgebreid | ≥15 nieuwe keywords | Keyword-dictionary audit |
| False negative reductie | ≥30% verbetering | Steekproef-analyse |
| Unit test coverage | 100% nieuwe logica | Test suite run |

### 5.3 Gebruikersoriëntatie

| Criterium | Meetbaar Doel | Verificatie |
|-----------|---------------|-------------|
| Events Overview pagina live | Functioneel op `/events` | UI verificatie |
| Filter-functionaliteit | 3 filters (regulation, lifecycle, risk) | Functionele test |
| Sorteer-functionaliteit | 3 sorteeropties | Functionele test |
| Geen regressie bestaande pagina's | 0 breaking changes | Regressie-test |

### 5.4 Overkoepelend

| Criterium | Meetbaar Doel | Verificatie |
|-----------|---------------|-------------|
| Baseline-integriteit | 0 wijzigingen aan frozen code | Git diff analyse |
| Decision-grade kwaliteit behouden | Geen score-daling | Steekproef-analyse |
| Traceerbaarheid | 100% wijzigingen gedocumenteerd | Commit history |
| Terugdraaibaarheid | Alle wijzigingen reversible | Rollback test |

---

## 6. Risico's en Mitigatie

### 6.1 Technische Risico's

| Risico | Impact | Kans | Mitigatie |
|--------|--------|------|-----------|
| Nieuwe bronnen verstoren bestaande pipeline | Hoog | Laag | Isolatie via feature flags, uitgebreide testing |
| Keyword-uitbreiding leidt tot false positives | Medium | Medium | Validatie via steekproef, rollback-optie |
| Events Overview introduceert performance issues | Medium | Laag | Client-side filtering, pagination |

### 6.2 Governance Risico's

| Risico | Impact | Kans | Mitigatie |
|--------|--------|------|-----------|
| Onbedoelde wijziging aan baseline-code | Hoog | Laag | Strikte code review, git branch isolatie |
| Scope creep naar niet-goedgekeurde features | Medium | Medium | Strikte scope-bewaking, checkpoint-reviews |
| Kwaliteitsdaling door snelle uitbreiding | Medium | Laag | Decision-grade validatie per deliverable |

### 6.3 Operationele Risico's

| Risico | Impact | Kans | Mitigatie |
|--------|--------|------|-----------|
| Nieuwe bronnen zijn niet stabiel/beschikbaar | Medium | Medium | Fallback naar bestaande bronnen, monitoring |
| Bronnen wijzigen format zonder waarschuwing | Medium | Medium | Robuuste parsing, error handling |
| Rate limiting door externe bronnen | Laag | Medium | Respectvolle scraping, caching |

---

## 7. Implementatie-Volgorde

Phase 3 wordt uitgevoerd in de volgende volgorde:

| Stap | Deliverable | Afhankelijkheid | Geschatte Duur |
|------|-------------|-----------------|----------------|
| 1 | Events Overview pagina | Geen | 4 uur |
| 2 | Filter- en sorteer-functionaliteit | Stap 1 | 2 uur |
| 3 | Bronnenlijst documentatie | Geen | 2 uur |
| 4 | CSDDD bronnen configuratie | Stap 3 | 3 uur |
| 5 | Green Claims bronnen configuratie | Stap 3 | 2 uur |
| 6 | ESPR bronnen configuratie | Stap 3 | 2 uur |
| 7 | Obligation keyword uitbreiding | Geen | 2 uur |
| 8 | Negative signal keyword uitbreiding | Geen | 2 uur |
| 9 | Validatie en testing | Stap 1-8 | 3 uur |
| 10 | Documentatie en checkpoint | Stap 9 | 1 uur |

**Totale geschatte duur:** 23 uur

---

## 8. Governance Checkpoints

| Checkpoint | Trigger | Actie |
|------------|---------|-------|
| CP-1 | Na Events Overview implementatie | Review en goedkeuring |
| CP-2 | Na bronnen configuratie | Coverage verificatie |
| CP-3 | Na intelligence uitbreiding | Kwaliteitsvalidatie |
| CP-4 | Na volledige implementatie | Phase 3 afsluiting |

---

## 9. Goedkeuringsverzoek

Dit document vraagt goedkeuring voor:

1. **Scope:** De drie uitbreidingslijnen zoals beschreven in sectie 3
2. **Bronnen:** De bronnenlijst en prioritering zoals beschreven in sectie 4
3. **Success-criteria:** De meetbare doelen zoals beschreven in sectie 5
4. **Implementatie-volgorde:** De stappen zoals beschreven in sectie 7

**Geen implementatie start vóór expliciete goedkeuring van dit document.**

---

## 10. Appendix: Baseline Referentie

### 10.1 Frozen Capabilities (Phase 2)

De volgende capabilities zijn FROZEN en mogen niet worden gewijzigd:

- Event-Based Aggregation (Check 5: 3/3)
- Delta Analysis (Check 6: 3/3)
- Decision Value Definition (Check 1: 3/3)
- Stability Risk Indicator (Check 7: 3/3)
- Lifecycle State Classification (Check 3: 3/3)
- Confidence Level Tagging (Check 11: 3/3)
- Negative Signal Detection (Check 8: 3/3)
- ISA Output Contract (Check 10: 3/3)

### 10.2 Bestaande Bestanden (Niet Wijzigen)

De volgende bestanden zijn onderdeel van de frozen baseline en mogen niet worden gewijzigd:

| Bestand | Functie |
|---------|---------|
| `drizzle/schema.ts` | Database schema (alleen additive wijzigingen toegestaan) |
| `server/news-event-processor.ts` | Event processing logica |
| `server/routers.ts` | tRPC procedures (alleen additive wijzigingen toegestaan) |
| `client/src/components/EventContext.tsx` | Event context component |
| `client/src/pages/EventDetail.tsx` | Event detail pagina |
| `client/src/pages/NewsDetail.tsx` | News detail pagina |

---

**Document End**

*Dit document vereist expliciete goedkeuring voordat implementatie mag starten.*
