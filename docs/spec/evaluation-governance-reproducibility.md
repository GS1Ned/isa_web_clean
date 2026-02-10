# Evaluation Governance & Reproducibility

**Canonical Specification**
**Status:** CURRENT (as-built)

## 1. Identity

- **Name:** Evaluation Governance & Reproducibility
- **Scope:** CURRENT state of evaluation governance & reproducibility
- **Marker:** CURRENT (as-built) — not ULTIMATE

## 2. Core Sources

1. `./docs/PIPELINE_OBSERVABILITY_SPEC.md`
2. `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md`
3. `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md`
4. `./docs/ISA_STRATEGIC_EVALUATION_QUALITY_MAPPING.md`
5. `./docs/evidence/ISA_IRON_DOCSET_AND_CRITICAL_PATH_DECISION_DRAFT_v0.md`
6. `./docs/gs1_research/feasibility_assessment.md`
7. `./EXTERNAL_REFERENCES.md`
8. `./ISA_DEVELOPMENT_PLAYBOOK.md`
9. `./README.md`
10. `./docs/CRITICAL_EVENTS_TAXONOMY.md`

## 3. Definitions

*See ISA_MASTER_SPEC.md*

## 4. Retrieval and Embeddings

*See [Retrieval and Embeddings](./retrieval-and-embeddings.md) for all definitions, rules, and gates related to embedding models and retrieval strategies.*

## 5. Database Governance

*See [Database Governance](./database-governance.md) for all definitions, rules, and gates related to database configuration, schema management, and data access.*

## 6. Evaluatieregels (Evaluation Rules)

| Regel-ID | Regel | Bron |
|---|---|---|
| ER-001 | Er is geen escalatie vereist bij het uitvoeren van directe gebruikersinstructies. | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Action 6: Created ISA_GOVERNANCE.md |
| ER-002 | Gebruikersactie is vereist om branch protection te configureren via de GitHub UI. | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Risk 2: Branch Protection Not Yet Configured |
| ER-003 | Gebruikersactie is vereist om beveiligingsfuncties op organisatieniveau in te schakelen. | `./docs/GOVERNANCE_SELF_CHECK_2025-12-17.md` > Risk 5: Security Features Not Yet Enabled (Org-Level) |
| ER-004 | De datakwaliteit MOET worden gecontroleerd op null-waarden in de vereiste velden. | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` > 2. Check data quality (no nulls in required fields) |
| ER-005 | De structuur en volledigheid van de data MOETEN worden gevalideerd. | `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md` > 2. Validate structure and completeness |

## 7. Kwaliteitspoorten (Gate Definitions)

| Poort-ID | Poortnaam | Trigger | Invoercriteria | Validatiestappen | Uitvoercriteria |
|---|---|---|---|---|---|
| EG-001 | Third-Party Connection Gate | Bij het aanmaken van een verbinding met een derde partij. | Een verzoek om een verbinding met een derde partij tot stand te brengen. | Verifieer dat de verbinding is goedgekeurd door de Project Owner (Human). | Succes als de verbinding is goedgekeurd; anders, falen. |
| EG-002 | Testing & Validation Gate | Voorafgaand aan een nieuwe release. | Een nieuwe release-kandidaat. | Voer tests uit, valideer de datakwaliteit en zorg voor productie-gereedheid. | Succes als alle tests slagen en de datakwaliteit is gevalideerd; anders, falen. |

## 8. Interfaces / Pipelines

*See source documents.*

## 9. Governance & Change Control

1. Review source documents
2. Update TRACEABILITY_MATRIX.csv
3. Follow governance rules

## 10. Observability

*See source documents.*

## 11. Acceptance Criteria

- AC-1: - [ ] Verify dashboard UI rendering
- AC-2: - Ensure procedures are comprehensive and current
- AC-3: - Validate security monitoring is working
- AC-4: - **Testing** - Run tests, validate data quality, ensure production readiness
- AC-5: 2. Verify data files exist in `/data/` directories

## 12. Traceability Annex

*This section will be updated after the finalization of the new evaluation rules and gates.*
