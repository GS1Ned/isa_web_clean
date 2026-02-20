# ISA System Architecture
## Canonical CURRENT/TARGET Contract

**Version:** 3.1.0  
**Last Updated:** 2026-02-20  
**Status:** AUTHORITATIVE  
**Purpose:** Single canonical architecture contract for one CURRENT state and one TARGET state

---

## 1. Canonical Precedence And Reconciliation

**FACT [EV-ARCH-001, EV-ARCH-002, EV-ARCH-003]:** Canonical precedence for system architecture decisions is:
1. `docs/governance/_root/ISA_GOVERNANCE.md`
2. `docs/agent/AGENT_MAP.md`
3. `docs/spec/ARCHITECTURE.md` (this document)
4. `docs/spec/ESRS_MAPPING/isa-core-architecture.md` (supplemental only)
5. Capability runtime contracts:
   - `docs/spec/ASK_ISA/RUNTIME_CONTRACT.md`
   - `docs/spec/NEWS_HUB/RUNTIME_CONTRACT.md`
   - `docs/spec/KNOWLEDGE_BASE/RUNTIME_CONTRACT.md`
   - `docs/spec/CATALOG/RUNTIME_CONTRACT.md`
   - `docs/spec/ESRS_MAPPING/RUNTIME_CONTRACT.md`
   - `docs/spec/ADVISORY/RUNTIME_CONTRACT.md`
6. Code truth (`server/routers.ts`, `drizzle/schema*.ts`, `client/src/App.tsx`)

**FACT [EV-ARCH-006]:** `docs/spec/ESRS_MAPPING/isa-core-architecture.md` is explicitly supplemental and non-canonical for system CURRENT/TARGET.

---

## 2. CURRENT State (Canonical, As-Built)

### 2.1 Verified Runtime Shape

**FACT [EV-ARCH-004]:** Top-level runtime capability surfaces are defined by `appRouter` in `server/routers.ts`.

**FACT [EV-ARCH-009]:** Client route entrypoint is `client/src/App.tsx`.

**FACT [EV-ARCH-007]:** As-built dependency graph source is `docs/evidence/EXEC_GRAPH.mmd`.

### 2.2 Six Capability Surfaces (Current Ownership)

| Capability | Owned Top-Level Router Surfaces | Primary Runtime Modules | Owned Core Tables |
|---|---|---|---|
| `ASK_ISA` | `askISA`, `askISAV2`, `evaluation` | `server/routers/ask-isa.ts`, `server/routers/ask-isa-v2.ts`, `server/routers/evaluation.ts` | `qa_conversations`, `qa_messages`, `ask_isa_feedback`, `rag_traces`, `evaluation_results` |
| `NEWS_HUB` | `hub`, `newsAdmin`, `cron`, `scraperHealth`, `pipelineObservability`, `regulatoryChangeLog` | `server/routers/hub.ts`, `server/news-admin-router.ts`, `server/routers/cron.ts`, `server/routers/scraper-health.ts`, `server/routers/pipeline-observability.ts`, `server/routers/regulatory-change-log.ts` | `hub_news`, `hub_news_history`, `news_recommendations`, `scraper_executions`, `scraper_health_summary`, `pipeline_execution_log`, `regulatory_change_log`, `regulatory_events` |
| `KNOWLEDGE_BASE` | `citationAdmin` | `server/routers/citation-admin.ts`, `server/db-knowledge.ts`, `server/db-knowledge-vector.ts`, `server/hybrid-search.ts`, `server/embedding.ts` | `knowledge_embeddings`, `sources`, `source_chunks`, `ingest_item_provenance` |
| `CATALOG` | `regulations`, `standards`, `gs1Standards`, `standardsDirectory`, `esrs`, `dutchInitiatives`, `datasetRegistry`, `governanceDocuments`, `gs1Attributes`, `gs1nlAttributes` | `server/routers/regulations.ts`, `server/routers/standards.ts`, `server/gs1-standards-router.ts`, `server/routers/standards-directory.ts`, `server/routers/dataset-registry.ts`, `server/routers/governance-documents.ts`, `server/routers/gs1-attributes.ts`, `server/routers/gs1nl-attributes.ts`, `server/routers/esrs.ts`, `server/routers.ts` | `regulations`, `gs1_standards`, `esrs_datapoints`, `dutch_initiatives`, `regulation_standard_mappings`, `dataset_registry`, `governance_documents`, `gs1_attributes`, `gs1_web_vocabulary` |
| `ESRS_MAPPING` | `esrsGs1Mapping`, `esrsRoadmap`, `gapAnalyzer`, `attributeRecommender` | `server/routers/esrs-gs1-mapping.ts`, `server/routers/esrs-roadmap.ts`, `server/routers/gap-analyzer.ts`, `server/routers/attribute-recommender.ts` | `gs1_esrs_mappings`, `gs1_attribute_esrs_mapping`, `regulation_esrs_mappings`, `mapping_feedback`, `esg_gs1_mappings` |
| `ADVISORY` | `advisory`, `advisoryReports`, `advisoryDiff`, `esgArtefacts` | `server/routers/advisory.ts`, `server/routers/advisory-reports.ts`, `server/routers/advisory-diff.ts`, `server/routers/esg-artefacts.ts` | `advisory_reports`, `advisory_report_versions` |

**FACT [EV-ARCH-003]:** Canonical capability set is exactly `ASK_ISA`, `NEWS_HUB`, `KNOWLEDGE_BASE`, `CATALOG`, `ESRS_MAPPING`, and `ADVISORY`.

### 2.3 Shared Platform Layer (Promoted)

**FACT [EV-ARCH-005, EV-ARCH-012]:** Cross-cutting surfaces are owned by `SHARED_PLATFORM` in the manifest contract (`system`, `auth`, `user`, `analytics`, `contact`, `export`, `onboarding`, `insights`, `monitoring`, `coverageAnalytics`, `observability`, `dataQuality`, `productionMonitoring`, `errorTracking`, `performanceTracking`, `webhookConfig`).

---

## 3. TARGET State (Canonical)

### 3.1 Target Design

**TARGET:** `docs/architecture/panel/_generated/CAPABILITY_MANIFEST.json` is the authoritative ownership contract.

**TARGET:** Every router/table/schema/contract surface has one owner capability or `SHARED_PLATFORM` owner.

**TARGET:** Any cross-capability concept without strong single-owner justification is promoted to `docs/architecture/panel/_generated/PRIMITIVE_DICTIONARY.json`.

**TARGET:** Drift between repository reality and manifest is remediated or explicitly logged as a `CURRENT->TARGET` delta row.

**TARGET:** Completion uses weighted validation confidence plus delta closure gate, not binary gate status alone.

### 3.2 Target Selection Heuristic (Applied)

1. Preserve governance invariants from `docs/governance/_root/ISA_GOVERNANCE.md`.
2. Minimize cross-capability coupling.
3. Maximize evidence traceability.
4. Minimize structural churn in existing router APIs.

---

## 4. CURRENT -> TARGET Delta Table (Completion Gate)

Completion gate rule: every row must be `ACCEPTED` or `BLOCKED_WITH_MITIGATION`.

| Delta ID | Delta Area | Acceptance Criteria | Status | Mitigation / Note | Confidence Impact |
|---|---|---|---|---|---|
| `DELTA-01` | Canonical system CURRENT/TARGET source | Only this file defines system CURRENT and TARGET | `ACCEPTED` | Supplemental file downgraded to non-canonical | `+0.08` |
| `DELTA-02` | Capability ownership normalization | Router/table/schema/contract surfaces mapped to one owner or shared platform | `ACCEPTED` | Enforced in `CAPABILITY_MANIFEST.json` evidence/status sections | `+0.10` |
| `DELTA-03` | Shared primitive promotion | Cross-capability concepts promoted to primitive dictionary | `ACCEPTED` | Enforced in `PRIMITIVE_DICTIONARY.json` evidence refs | `+0.08` |
| `DELTA-04A` | Multi-router module normalization (pilot) | At least one mixed router surface is physically extracted without API break | `ACCEPTED` | `esrs` moved from inline `server/routers.ts` to `server/routers/esrs.ts` while preserving `appRouter.esrs` key | `+0.05` |
| `DELTA-04B` | Multi-router module normalization (remaining scope) | Remaining mixed router surfaces are split, sub-owned, or shared-promoted | `BLOCKED_WITH_MITIGATION` | Sub-surface ownership is explicit; remaining physical splits deferred and tracked in execution registry | `-0.09` |
| `DELTA-05` | Validation confidence model | Weighted pass/fail/unknown with limitation annotations | `ACCEPTED` | Enforced in `MINIMAL_VALIDATION_BUNDLE.json` | `+0.10` |
| `DELTA-06` | Operational execution registry | Registry checkpoint required for phase transitions and DONE threshold | `ACCEPTED` | Enforced in `EXECUTION_STATE.json` | `+0.09` |
| `DELTA-07` | Repo-manifest drift handling | Drift remediated or recorded as explicit delta row | `ACCEPTED` | Manifest authority + evidence pointers enforced | `+0.06` |
| `DELTA-08` | Validation limitations | Known gate limitations explicitly documented and weighted | `ACCEPTED` | Maintained in validation bundle results | `-0.07` |

---

## 5. Six Capability Boundaries (No Overlap, No Gap)

**FACT [EV-ARCH-003]:** Canonical six-capability definition is anchored by `docs/spec/ADVISORY/ISA_CORE_CONTRACT.md`.

**FACT [EV-ARCH-004]:** Ownership derivation source for top-level runtime surfaces is `server/routers.ts`.

**FACT [EV-ARCH-013, EV-ARCH-014]:** Table ownership derivation source is `drizzle/schema.ts` plus supplemental schema files (for example `drizzle/schema_corpus_governance.ts`) that define `mysqlTable(...)` exports.

**FACT [EV-ARCH-010, EV-ARCH-011]:** Machine-readable ownership and overlap/gap coverage are maintained in `CAPABILITY_MANIFEST.json` and `CAPABILITY_GRAPH.json`.

---

## 6. Authoritative Machine-Readable Contracts

Canonical architecture contracts:

- `docs/architecture/panel/_generated/CAPABILITY_MANIFEST.json`
- `docs/architecture/panel/_generated/PRIMITIVE_DICTIONARY.json`
- `docs/architecture/panel/_generated/CAPABILITY_GRAPH.json`
- `docs/architecture/panel/_generated/EVIDENCE_INDEX.json`

Canonical contract set lock for the 2026-02-20 cleanup program:

- `docs/spec/ARCHITECTURE.md`
- `docs/spec/ADVISORY/ISA_CORE_CONTRACT.md`
- `docs/architecture/panel/_generated/CAPABILITY_MANIFEST.json`
- `docs/architecture/panel/_generated/CAPABILITY_GRAPH.json`
- `docs/architecture/panel/_generated/PRIMITIVE_DICTIONARY.json`
- `docs/architecture/panel/_generated/EVIDENCE_INDEX.json`
- `docs/architecture/panel/_generated/MINIMAL_VALIDATION_BUNDLE.json`
- `docs/spec/CONFLICT_REGISTER.md`
- `docs/planning/refactoring/EXECUTION_STATE.json`

Supporting execution/governance artifacts:

- `docs/planning/refactoring/EXECUTION_STATE.json`
- `docs/architecture/panel/_generated/MINIMAL_VALIDATION_BUNDLE.json`
- `docs/spec/CONFLICT_REGISTER.md`
- `docs/governance/EVIDENCE_INDEX.md` (research-output index, not architecture FACT pointer contract)

**FACT [EV-ARCH-008]:** Conflict tracking canonical source is `docs/spec/CONFLICT_REGISTER.md`.

---

## 7. Shared Primitives Contract

Shared primitives are governed by `docs/architecture/panel/_generated/PRIMITIVE_DICTIONARY.json`.

Minimum promoted primitives:
- Identity and access control
- Dataset provenance
- Citation and evidence chain
- Regulation/standard/ESRS canonical entities
- LLM inference contract
- Retrieval and embeddings
- Scheduling and orchestration
- Observability and telemetry

---

## 8. Manifest Authority And Drift Prevention

**Rule 1:** Manifest is authoritative for capability ownership.

**Rule 2:** Repo mismatch is a drift event.

**Rule 3:** Drift must be remediated in the same change set or recorded as an explicit `CURRENT->TARGET` blocked row with mitigation and confidence impact.

**Rule 4:** Shared platform ownership is valid when no single capability owner is defensible.

---

## 9. Minimal Validation Bundle And Confidence Model

### 9.1 Validation Commands

```bash
python3 scripts/validate_planning_and_traceability.py
pnpm check
bash scripts/gates/no-console-gate.sh
bash scripts/gates/security-secrets-scan.sh
bash scripts/gates/slo-policy-check.sh /tmp/slo-policy-check.current.json
bash scripts/gates/observability-contract.sh /tmp/observability.current.json
bash scripts/gates/security-gate.sh /tmp/security.current.json
bash scripts/gates/canonical-docs-allowlist.sh
bash scripts/gates/doc-code-validator.sh --canonical-only
bash scripts/gates/canonical-contract-drift.sh
```

### 9.2 Confidence Formula

`confidence = sum(weight_i * signal_i)` where:
- `signal_i = 1.0` for pass
- `signal_i = 0.0` for fail
- `signal_i = 0.3` for unknown

### 9.3 DONE Gate

**FACT [EV-VAL-003]:** Current aggregate weighted validation confidence is `0.68`.

- `done_confidence_threshold = 0.75`
- `delta_rows_terminal_required = true`
- If threshold or delta-terminal conditions are not met, status must be `DONE_WITH_LIMITATIONS` (or DONE remains not complete).

### 9.4 Current Validation Limitations (Evidence-Backed)

**FACT [EV-VAL-001]:** `observability_contract` currently reports `pass` with runtime-scoped coverage at threshold.

**FACT [EV-VAL-002]:** `security_gate` currently reports `fail` due dependency policy violations under deterministic timeout-fail semantics.

**FACT [EV-VAL-004]:** Canonical doc-code validation passes in `--canonical-only` mode.

**FACT [EV-VAL-005]:** Canonical docs allowlist pass is deterministic on tracked files; local untracked noise is warning-only by policy.

---

## 10. Production Readiness Roadmap (Architecture-Convergence Scope)

1. Enforce manifest ownership and evidence drift checks in CI.
2. Resolve blocked multi-router physical splits incrementally with non-breaking sub-surface ownership.
3. Reduce canonical doc-code drift first; keep global backlog visible but non-blocking for canonical gate.
4. Clear deterministic gate failures (`planning_validator`, `no_console_gate`, `security_gate`) to restore DONE-threshold confidence.

---

## 11. Evidence Pointer Contract

Architecture FACT claims must reference IDs in:
- `docs/architecture/panel/_generated/EVIDENCE_INDEX.json`

Primary architecture evidence IDs:
- `EV-ARCH-001` through `EV-ARCH-014`
- `EV-CAP-*` (capability router/table/module ownership)
- `EV-SHARED-*` (shared platform ownership)
- `EV-P-*` (shared primitive derivation)

---

**Document Status:** AUTHORITATIVE  
**Supersedes:** prior competing system-level CURRENT/TARGET claims in lower-precedence docs  
**Next Review:** on next capability-boundary, shared-primitive, or evidence-drift event
