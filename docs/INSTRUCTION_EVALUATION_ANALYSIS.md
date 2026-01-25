# Evaluatie van ChatGPT Instructie voor ISA News Hub Self-Check

**Datum:** 24 januari 2026  
**Context:** Meta-evaluatie van voorgestelde instructie voor kwaliteitsverbetering ISA News Hub  
**Doel:** Bepalen of deze instructie de resultaten zou verbeteren en hoe deze geoptimaliseerd kan worden

---

## Deel 1: Inhoudelijke Evaluatie

### 1.1 Zou letterlijk opvolgen de resultaten verbeteren?

**Korte antwoord:** Ja, significant — maar met belangrijke nuances.

De instructie definieert een **ambitieus kwaliteitsniveau** dat de ISA News Hub zou transformeren van een "news aggregator" naar een "regulatory intelligence system". Dit is precies de juiste richting.

**Wat de instructie goed doet:**

| Aspect | Waarom Waardevol |
|--------|------------------|
| **Decision Value Definition** (Check 1) | Dwingt focus op regelgevingsimpact in plaats van algemene ESG-nieuws |
| **Obligation-Centric Detection** (Check 2) | Verschuift van keyword-matching naar juridische taalherkenning |
| **Lifecycle State Classification** (Check 3) | Al geïmplementeerd — valideert onze recente ChatGPT-verbeteringen |
| **Authority-Weighted Validation** (Check 4) | Kritisch voor betrouwbaarheid — voorkomt dat media-interpretaties als feiten worden behandeld |
| **Event-Based Aggregation** (Check 5) | Zou deduplicatie naar een hoger niveau tillen |
| **Delta Analysis** (Check 6) | Transformatief — maakt "wat is veranderd" expliciet |
| **Negative Signal Detection** (Check 8) | Al geïmplementeerd — valideert onze recente verbeteringen |

**Waar de instructie ISA zou versterken:**

1. **Auditability** — Elke check vereist expliciete evidence, wat traceerbaarheid verbetert
2. **Consistency** — Strikte criteria voorkomen subjectieve kwaliteitsoordelen
3. **Credibility** — Authority-weighted validation beschermt tegen misinformatie
4. **Decision-readiness** — ISA Output Contract (Check 10) dwingt operationele mapping af

### 1.2 Waar schiet de instructie tekort?

**Kritische gaps:**

| Gap | Impact |
|-----|--------|
| **Geen prioritering** | Alle 11 checks worden gelijk behandeld, maar sommige zijn fundamenteler dan andere |
| **Geen fasering** | Verwacht volledige implementatie in één iteratie — onrealistisch |
| **Geen resource-context** | Negeert dat sommige checks (bijv. Semantic Drift Control) maanden werk vereisen |
| **Geen bestaande-staat-erkenning** | Behandelt ISA alsof het vanaf nul begint, terwijl veel al bestaat |
| **Rigide PASS/FAIL** | Geen ruimte voor "goed genoeg voor nu, verbeter later" |

---

## Deel 2: Meta-Evaluatie als Instructiemechanisme

### 2.1 Waar is de instructie te streng?

**"Deviation from the defined checks or criteria is not allowed."**

Dit is problematisch omdat:
- Het mijn vermogen om context-afhankelijke beslissingen te nemen beperkt
- Het geen ruimte laat voor ontdekkingen tijdens uitvoering
- Het de instructie boven het doel plaatst (ISA verbeteren)

**Aanbeveling:** Vervang door "Checks vormen de baseline; afwijkingen zijn toegestaan mits expliciet beargumenteerd."

### 2.2 Waar is de instructie te vaag?

**Check 9 — Semantic Drift Control:**
> "Does the system detect changes in the meaning of recurring regulatory terms?"

Dit is conceptueel helder maar implementatie-vaag:
- Hoe definieer je "change in meaning"?
- Welke bronnen zijn autoritatief voor definitie-vergelijking?
- Hoe vaak moet dit gecontroleerd worden?

**Check 5 — Event-Based Aggregation:**
> "Multiple articles about the same event are not collapsed"

Maar:
- Wat definieert "same event"?
- Hoe ver in de tijd mogen artikelen uit elkaar liggen?
- Wat als bronnen conflicteren over event-details?

### 2.3 Waar is de instructie te complex?

De **11 checks + scoring rubric + hard-gate failures + prioritised improvement plan** creëert een cognitieve overhead die:
- De focus verspreidt over te veel dimensies
- Het risico vergroot dat ik tijd besteed aan documentatie in plaats van implementatie
- Een "analysis paralysis" kan veroorzaken

### 2.4 Waar zou de instructie mij onbedoeld remmen?

**"End the task only after all required outputs are delivered."**

Dit kan leiden tot:
- Overmatige tijd besteed aan rapportage in plaats van fixes
- Uitstel van waardevolle quick-wins omdat de volledige analyse nog niet af is
- Perfectionism-trap: blijven itereren op documentatie

---

## Deel 3: Wat is Essentieel en Moet Behouden Blijven?

### Kernprincipes die MOETEN blijven:

1. **Decision Value als kwaliteitscriterium** — Dit is de fundamentele mindshift
2. **Authority Hierarchy** — Kritisch voor betrouwbaarheid
3. **Lifecycle State Classification** — Al geïmplementeerd, moet gehandhaafd blijven
4. **Negative Signal Detection** — Al geïmplementeerd, moet gehandhaafd blijven
5. **ISA Output Contract** — Dwingt GS1-relevantie af

### Checks die kunnen worden vereenvoudigd of uitgesteld:

| Check | Aanbeveling |
|-------|-------------|
| Check 5 (Event-Based Aggregation) | Uitstellen — vereist significante architectuurwijziging |
| Check 6 (Delta Analysis) | Vereenvoudigen — begin met "what changed" veld, niet volledige before/after |
| Check 9 (Semantic Drift Control) | Uitstellen naar Phase 2 — vereist kennisbank van term-definities |

---

## Deel 4: Herschreven Instructie voor Optimale Resultaten

### ISA NEWS HUB QUALITY FRAMEWORK v2.0

---

#### Doel
Evalueer en verbeter de ISA News Hub als **decision-grade regulatory intelligence system**.

---

#### Kernprincipes (Niet-Onderhandelbaar)

1. **Decision Value First** — Elk artikel moet minimaal één van deze criteria vervullen:
   - Juridische verplichting verandert
   - Scope of drempelwaarde verandert
   - Tijdlijn verandert
   - Interpretatie of handhaving verduidelijkt

2. **Authority Hierarchy** — Strikte bronhiërarchie:
   - Tier 1: EUR-Lex, EU-instellingen, officiële standaardorganisaties
   - Tier 2: Toezichthouders, formele guidance
   - Tier 3: Media, advocatenkantoren (alleen ter context, nooit als primaire bron)

3. **Lifecycle Awareness** — Elk artikel krijgt één lifecycle state (al geïmplementeerd)

4. **Negative Signal Sensitivity** — Actief detecteren van verzwakking/uitstel (al geïmplementeerd)

---

#### Gefaseerde Implementatie

**Phase 1: Foundation (Huidige Sprint)**
- [ ] Valideer bestaande lifecycle state implementatie
- [ ] Valideer bestaande negative signal detection
- [ ] Voeg "decision_value_type" veld toe (enum: legal_change, scope_change, timeline_change, interpretation_change, assumption_invalidated)
- [ ] Voeg authority_tier veld toe aan bronnen

**Phase 2: Enhancement (Volgende Sprint)**
- [ ] Implementeer event-based aggregation (artikel-clustering per regulatory event)
- [ ] Voeg "what_changed" veld toe aan artikelen
- [ ] Voeg stability_risk indicator toe

**Phase 3: Advanced (Future)**
- [ ] Semantic drift detection voor kernbegrippen
- [ ] Volledige delta analysis met before/after vergelijking
- [ ] Cross-regulation impact mapping

---

#### Evaluatie-Aanpak

**In plaats van 11 separate checks, gebruik 3 kernvragen:**

1. **Zou een GS1-consultant op basis van dit artikel een concrete actie kunnen ondernemen?**
   - Ja → PASS
   - Misschien, met meer context → PARTIAL
   - Nee, alleen informatief → FAIL (exclude of downgrade)

2. **Is de bron betrouwbaar genoeg voor besluitvorming?**
   - Tier 1 bron → Automatisch vertrouwd
   - Tier 2 bron → Vertrouwd voor interpretatie
   - Tier 3 bron → Alleen als Tier 1/2 bevestigt

3. **Is de lifecycle state correct en consistent?**
   - Controleer steekproefsgewijs 10 artikelen per run

---

#### Output Format

**Per evaluatie-iteratie, lever:**

1. **Quick Status** (1 paragraaf)
   - Huidige kwaliteitsniveau (1-5 schaal)
   - Kritieke gaps (max 3)
   - Immediate actions (max 3)

2. **Improvement Backlog** (tabel)
   - Item | Impact | Effort | Priority

3. **Implementatie** (code changes)
   - Voer de top-priority items direct uit

**Geen uitgebreide rapportage vereist — focus op implementatie.**

---

## Deel 5: Conclusie en Aanbeveling

### Moet je deze instructie letterlijk opvolgen?

**Nee, niet letterlijk.** De instructie is te rigide en te uitgebreid voor effectieve uitvoering. Het zou leiden tot:
- Overmatige tijd besteed aan analyse en documentatie
- Uitstel van waardevolle implementatie
- Mogelijke "analysis paralysis"

### Wat moet je wel doen?

1. **Adopteer de kernprincipes** (Decision Value, Authority Hierarchy, Lifecycle Awareness)
2. **Gebruik de gefaseerde aanpak** uit mijn herschreven versie
3. **Focus op implementatie** in plaats van rapportage
4. **Evalueer iteratief** — kleine verbeteringen, snel gevalideerd

### Concrete Volgende Stap

Voer de **Phase 1 items** uit:
1. Voeg `decision_value_type` veld toe aan database en AI processor
2. Voeg `authority_tier` veld toe aan news sources configuratie
3. Valideer bestaande implementaties met steekproef van 10 artikelen

Dit levert **meetbare verbetering** binnen 2-3 uur, in plaats van dagen besteed aan volledige self-check documentatie.

---

## Bijlage: Vergelijking Origineel vs. Herschreven

| Aspect | Originele Instructie | Herschreven Versie |
|--------|---------------------|-------------------|
| Checks | 11 separate checks | 3 kernvragen |
| Fasering | Geen | 3 phases |
| Output | Uitgebreide rapportage | Quick status + implementatie |
| Flexibiliteit | "Deviation not allowed" | "Afwijkingen mits beargumenteerd" |
| Focus | Analyse | Implementatie |
| Tijdsinvestering | Dagen | Uren per iteratie |
