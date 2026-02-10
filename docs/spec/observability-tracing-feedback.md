# Observability / Tracing / Production Feedback

**Canonical Specification**
**Status:** CURRENT (as-built)

## 1. Identity

- **Name:** Observability / Tracing / Production Feedback
- **Scope:** CURRENT state of observability / tracing / production feedback
- **Marker:** CURRENT (as-built) — not ULTIMATE

## 2. Core Sources

1. `./docs/PHASE_8.3_INGESTION_WINDOW_COMPLETE.md`
2. `./docs/PRODUCTION_DEPLOYMENT.md`
3. `./docs/PHASE4_OPERATIONAL_READINESS_REPORT.md`
4. `./docs/PRODUCTION_IMPROVEMENTS_JAN_2026.md`
5. `./IRON_KNOWLEDGE_MAP.md`
6. `./docs/evidence/_research/ISA_CURRENT_ARCHITECTURE_BRIEF_v0.md`
7. `./docs/EMBEDDING_PIPELINE_OPTIMIZATION.md`

## 3. Definitions

*See ISA_MASTER_SPEC.md*

## 4. Retrieval and Embeddings

*See [Retrieval and Embeddings](./retrieval-and-embeddings.md) for all definitions, rules, and gates related to embedding models and retrieval strategies.*

## 5. Database Governance

*See [Database Governance](./database-governance.md) for all definitions, rules, and gates related to database configuration, schema management, and data access.*

## 6. Observability Regels (Observability Rules)

| Regel-ID | Regel | Bron |
|---|---|---|
| OR-001 | Alle vereiste omgevingsvariabelen MOETEN worden geconfigureerd in de productieomgeving. | `./docs/PRODUCTION_DEPLOYMENT.md` > Environment Variables |
| OR-002 | Er zijn geen databasemigraties vereist; alle verbeteringen zijn op applicatieniveau. | `./docs/PRODUCTION_IMPROVEMENTS_JAN_2026.md` > 6.2 Database Changes |
| OR-003 | Een cookie-toestemmingsbanner is niet vereist voor alleen essentiële cookies. | `./docs/PRODUCTION_IMPROVEMENTS_JAN_2026.md` > 5.2 Overall Status |

## 7. Kwaliteitspoorten (Gate Definitions)

| Poort-ID | Poortnaam | Trigger | Invoercriteria | Validatiestappen | Uitvoercriteria |
|---|---|---|---|---|---|
| OG-001 | Progress Persistence Gate | Bij de start van een langlopend proces. | Een langlopend proces. | Verifieer dat het proces de voortgang kan opslaan en herstellen na een onderbreking. | Succes als het proces de voortgang kan herstellen; anders, falen. |
| OG-002 | Rollback Verification Gate | Na een rollback. | Een voltooide rollback. | Controleer de health endpoints om de rollback te verifiëren. | Succes als de health endpoints een gezonde status aangeven; anders, falen. |

## 8. Interfaces / Pipelines

*See source documents.*

## 9. Governance & Change Control

1. Review source documents
2. Update TRACEABILITY_MATRIX.csv
3. Follow governance rules

## 10. Observability

*See source documents.*

## 11. Acceptance Criteria

- AC-1: 2. Ensure "Normal (30 days)" is selected (default)
- AC-2: **Note:** Automated tests validate core mode logic but require enhanced mocking for full pipeline execution. Manual testing via admin UI is recommende
- AC-3: 4. **Mode Analytics**: Track mode usage patterns and recommend optimal configurations
- AC-4: 4. **Verify rollback**: Check health endpoints
- AC-5: - [ ] Conduct load testing to validate scaling assumptions

## 12. Traceability Annex

*This section will be updated after the finalization of the new observability rules and gates.*
