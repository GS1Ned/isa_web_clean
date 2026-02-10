# Agent & Prompt Governance

**Canonical Specification**
**Status:** CURRENT (as-built)

## 1. Identity

- **Name:** Agent & Prompt Governance
- **Scope:** CURRENT state of agent & prompt governance
- **Marker:** CURRENT (as-built) — not ULTIMATE

## 2. Core Sources

1. `./ISA_GOVERNANCE.md`
2. `./docs/agent_collaboration/MANUS_CHATGPT_PROTOCOL.md`
3. `./CHATGPT_PROMPT_BATCH_INGEST_02_04_05_06.md`
4. `./CHATGPT_UPDATE_PROMPT.md`
5. `./docs/CHATGPT_INTEGRATION_CONTRACT.md`
6. `./CHATGPT_DELEGATION_PHASE1.md`
7. `./CHATGPT_PROMPT_INGEST-03.md`
8. `./DELEGATION_PACKAGE_INGEST-03.md`
9. `./docs/AGENT_COLLABORATION_SUMMARY.md`
10. `./docs/CHANGELOG_FOR_CHATGPT.md`

## 3. Definitions

*See ISA_MASTER_SPEC.md*

## 4. Agent & Prompt Regels (Agent & Prompt Rules)

| Regel-ID | Regel | Bron |
|---|---|---|
| APR-001 | De agent MOET alle beslissingen escaleren die overeenkomen met Lane C-triggers. | `./ISA_GOVERNANCE.md` > 2.2 Manus (Autonomous Development Agent) |
| APR-002 | De agent MOET de governance-regels NIET omzeilen voor snelheid of gemak. | `./ISA_GOVERNANCE.md` > 2.2 Manus (Autonomous Development Agent) |

## 5. Kwaliteitspoorten (Gate Definitions)

| Poort-ID | Poortnaam | Trigger | Invoercriteria | Validatiestappen | Uitvoercriteria |
|---|---|---|---|---|---|
| APG-001 | Validation Suite Gate | Voorafgaand aan een nieuwe release. | Een nieuwe release-kandidaat. | Voer de volledige validatiesuite (`validate-esg-artefacts.mjs`) uit. | Succes als alle validaties slagen; anders, falen. |

## 6. Interfaces / Pipelines

*See source documents.*

## 7. Governance & Change Control

1. Review source documents
2. Update TRACEABILITY_MATRIX.csv
3. Follow governance rules

## 8. Observability

**OPEN ISSUE:** Define observability hooks.

## 9. Acceptance Criteria

- AC-1: - Validate claims of completeness, compliance, or currency
- AC-2: - Recommend governance mode transitions when appropriate
- AC-3: - Recommend governance improvements
- AC-4: 3. Run full validation suite (`validate-esg-artefacts.mjs`)
- AC-5: - **Testing** - Run tests, validate data quality, ensure production readiness

## 10. Traceability Annex

*This section will be updated after the finalization of the new agent & prompt rules and gates.*
