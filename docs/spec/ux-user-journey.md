# UX & User Journey

**Canonical Specification**
**Status:** CURRENT (as-built)

## 1. Identity

- **Name:** UX & User Journey
- **Scope:** CURRENT state of UX & user journey
- **Marker:** CURRENT (as-built) — not ULTIMATE

## 2. Core Sources

1. `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md`
2. `./docs/ISA_UX_STRATEGY.md`
3. `./docs/ISA_VISUAL_BRANDING_DEVELOPMENT_PLAN.md`
4. `./docs/autonomous-session-2025-12-17.md`
5. `./ISA_STATUS_REPORT_2025-01-11.md`
6. `./docs/ALERTING_SYSTEM_DESIGN.md`
7. `./docs/ALTERNATIVE_FUTURES_EXPLORATION.md`
8. `./docs/ASK_ISA_QUERY_LIBRARY.md`
9. `./docs/CHATGPT_INTEGRATION_WORKFLOW.md`
10. `./docs/ISA_NEWSHUB_EVOLUTION_SUMMARY.md`

## 3. Definitions

*See ISA_MASTER_SPEC.md*

## 4. UX Regels (UX Rules)

| Regel-ID | Regel | Bron |
|---|---|---|
| UXR-001 | De ISA MOET informatieve begeleiding bieden en expliciet vermelden dat het geen juridisch advies is. | `./docs/ISA_PRODUCT_DIMENSIONS_ANALYSIS.md` > Relevance to ISA's Mission |
| UXR-002 | Alle interactieve elementen MOETEN navigeerbaar zijn met het toetsenbord. | `./docs/ISA_VISUAL_BRANDING_DEVELOPMENT_PLAN.md` > Keyboard Navigation |
| UXR-003 | De UI MOET voldoen aan WCAG 2.1 Level AA. | `./docs/ISA_VISUAL_BRANDING_DEVELOPMENT_PLAN.md` > Accessibility |

## 5. Kwaliteitspoorten (Gate Definitions)

| Poort-ID | Poortnaam | Trigger | Invoercriteria | Validatiestappen | Uitvoercriteria |
|---|---|---|---|---|---|
| UXG-001 | Visual Branding Compliance Gate | Voorafgaand aan een nieuwe UI-release. | Een UI-component of -pagina. | Verifieer dat het kleurenpalet, de typografie en de lay-out voldoen aan de GS1-specificaties. | Succes als de component voldoet; anders, falen. |

## 6. Interfaces / Pipelines

*See source documents.*

## 7. Governance & Change Control

1. Review source documents
2. Update TRACEABILITY_MATRIX.csv
3. Follow governance rules

## 8. Observability

**OPEN ISSUE:** Define observability hooks.

## 9. Acceptance Criteria

- AC-1: The primary directive remains: **protect core ISA delivery above all else**. Dimensions should be activated only when they prevent structural failure 
- AC-2: **Formalization Decision:** Should this dimension be:
- AC-3: **Timing & Sequencing:** If formalization is recommended, when should it occur relative to ISA's development lifecycle?
- AC-4: ISA's core value proposition is **automated mapping between EU regulations and GS1 standards**. If users cannot understand or verify these mappings, I
- AC-5: - **User base is small:** Early adopters are technical users who can validate ISA's outputs independently

## 10. Traceability Annex

*This section will be updated after the finalization of the new UX rules and gates.*
