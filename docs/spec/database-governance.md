# Database Governance

**Canonical Specification**
**Status:** CURRENT (as-built)

## 1. Identity

- **Name:** Database Governance
- **Scope:** Defines the rules, quality gates, and interfaces for all database interactions within the ISA project.
- **Marker:** CURRENT (as-built)

## 2. Core Sources

- `docs/governance/ISA_MANUS_PROJECT_GOVERNANCE.md`

## 3. Definitions

*See ISA_MASTER_SPEC.md*

## 4. Database Regels (Database Rules)

| Regel-ID | Regel | Bron |
|---|---|---|
| DB-RULE-001 | All database connections MUST use the canonical `DATABASE_URL` secret. | ISA_MANUS_PROJECT_GOVERNANCE.md |
| DB-RULE-002 | Direct database access from frontend components is strictly forbidden. | ISA_MANUS_PROJECT_GOVERNANCE.md |
| DB-RULE-003 | Schema migrations MUST be automated and version-controlled. | Inferred Best Practice |
| DB-RULE-004 | All personally identifiable information (PII) MUST be encrypted at rest. | Inferred Best Practice |

## 5. Kwaliteitspoorten (Gate Definitions)

| Poort-ID | Poortnaam | Trigger | Invoercriteria | Validatiestappen | Uitvoercriteria |
|---|---|---|---|---|---|
| DB-GATE-001 | Schema Migration Validation | `git push` to `main` | A new schema migration file is detected. | 1. The migration is reversible.<br>2. The migration does not contain destructive changes (e.g., `DROP TABLE`). | A successful validation report. |
| DB-GATE-002 | PII Encryption Check | `git push` to `main` | A change to the database schema is detected. | 1. All columns containing PII are encrypted. | A successful validation report. |

## 6. Interfaces / Pipelines

- **Schema Migration Pipeline:** An automated pipeline that applies schema migrations to the database upon a successful merge to the `main` branch.

## 7. Governance & Change Control

1.  Any changes to this specification require a formal proposal and approval from the ISA Core Team.
2.  All changes must be documented in the `CONFLICT_REGISTER.md` if they introduce or resolve a conflict.

## 8. Observability

- All database queries MUST be logged.
- Database performance metrics (e.g., query latency, connection count) MUST be monitored.

## 9. Acceptance Criteria

- All database interactions comply with the rules and gates defined in this specification.

## 10. Traceability Annex

*This section will be updated as new rules and gates are added.*
