---
DOC_TYPE: PANEL_KICKOFF
STATUS: active
CREATED: 2026-02-12
FRAMEWORK_VERSION: Repo-Tight v5
TARGET: ≥9/10 across 12 dimensions
---

# ISA Architecture Expert Panel — Kickoff Package (Repo-Tight v5)

## Objective

Produce a coherent target ISA architecture and a verifiable path to ≥9/10 across 12 dimensions, where ≥9/10 is permitted only when backed by:

- **Measurable criteria** (explicit pass/fail or numeric targets)
- **Repo evidence pointers** (path:line, config keys, script/workflow references)
- **Executable proof** (pinned commands + pinned output artifacts)
- **Regression protection** (CI gates/tests/monitors validating the proof artifacts)
- **Coherence** (no violation of invariants / Lane C / provenance / security boundaries)

**Hard rule:** Anything not verifiable is UNKNOWN and cannot score ≥9/10.

## Expert Message (Copy/Paste)

"Assess ISA for your owned dimensions using Repo-Tight v5. You must (1) produce ATAM outputs for your area (scenarios + sensitivities + tradeoffs), (2) bind every claim to schema-valid proof artifacts with pinned paths, (3) define numeric thresholds for ≥9/10, and (4) ensure CI enforces schema validation and (where relevant) SLO/error budget policy compliance."

## 12 Dimensions & Ownership

| Dimension | Owner Role | Status |
|-----------|-----------|--------|
| D1: Domain correctness | Domain Architect | Required |
| D2: Evidence & provenance integrity | Data Architect/Governance | Required |
| D3: Security | Security Architect | Required |
| D4: Reliability | SRE/Platform Architect | Optional |
| D5: Performance & scalability | Performance Engineer | Optional |
| D6: Maintainability | Principal Software Architect | Required |
| D7: Testability & determinism | Test Architect/QA | Optional |
| D8: Observability | SRE/Platform Architect | Optional |
| D9: Data model fitness | Data Architect/Governance | Required |
| D10: LLM/RAG quality | RAG/LLM Architect | Required |
| D11: UX/IA coherence | UX/IA Architect | Optional |
| D12: Operational governance | Principal Software Architect | Required |

## Required Artifacts

### 1. ATAM Outputs (Mandatory)
- `docs/architecture/panel/ATAM_UTILITY_TREE.md`
- `docs/architecture/panel/ATAM_SCENARIOS.md`
- `docs/architecture/panel/ATAM_RISKS_SENSITIVITIES_TRADEOFFS.md`

### 2. ISO/IEC 25010 Mapping (Mandatory)
- `docs/architecture/panel/ISO25010_MAPPING.md`

### 3. Proof Artifacts (Schema-Validated)
- `test-results/ci/*.json`
- `docs/evidence/_generated/catalogue.json`
- `docs/architecture/panel/_generated/ARCHITECTURE_SCORECARD.json`

### 4. JSON Schemas (Required)
- `docs/quality/schemas/*.schema.json`

### 5. SRE Artifacts (Required)
- `docs/sre/SLO_CATALOG.md`
- `docs/sre/ERROR_BUDGET_POLICY.md`
- `docs/sre/_generated/error_budget_status.json`

## Expert Report Format (v5)

### Front Matter
```yaml
DOC_TYPE: PANEL_REVIEW
OWNER_ROLE: <role>
DIMENSIONS: [D?, ...]
STATUS: draft|final
LAST_VERIFIED: 2026-02-12
PROOF_COMMANDS_RUN: [ ... ]
PROOF_ARTIFACTS: [ ... ]
SCHEMAS_REFERENCED: [ ... ]
THRESHOLDS: { ... }
```

### Body Sections (Exact Order)
1. FACTS (repo pointers + artifact pointers)
2. RISKS (ranked)
3. CONFLICTS (docs vs code vs runtime)
4. UNKNOWNs (missing proof/evidence)
5. RECOMMENDATIONS (migration + proof + schema + gate + rollback)
6. SCORECARD_UPDATES (baseline/target; criteria; proof; thresholds)

## Panel Workflow

1. Proof enablement (schemas + gates + SRE artifacts)
2. ATAM session outputs
3. Baseline scoring from schema-valid artifacts
4. Coherence resolution
5. Implement epics (proof-strengthening only)
6. Independent re-score

## Current ISA Baseline (2026-02-12)

- Validation Gates: 6/6 passing
- Quality Score: 75/100
- Semantic Validity: 91.9%
- Evidence Markers: 145
- Test Coverage: 90.1%
- Contract Completeness: 70%

## Proof Artifact Commands

### Generate All Proof Artifacts
```bash
# Security gate
bash scripts/gates/security-gate.sh

# Performance smoke test
bash scripts/gates/perf-smoke.sh

# Reliability smoke test
bash scripts/gates/reliability-smoke.sh

# Observability contract
bash scripts/gates/observability-contract.sh

# Governance gate
bash scripts/gates/governance-gate.sh

# SLO policy check
bash scripts/gates/slo-policy-check.sh

# Error budget status
pnpm tsx scripts/sre/generate-error-budget-status.ts

# Evidence catalogue
pnpm tsx scripts/sre/generate-evidence-catalogue.ts
```

### Validate All Schemas
```bash
bash scripts/gates/validate-proof-artifacts.sh
```

### Artifact → Schema Mapping

| Artifact | Schema | Command |
|----------|--------|----------|
| `test-results/ci/security-gate.json` | `docs/quality/schemas/security-gate.schema.json` | `bash scripts/gates/security-gate.sh` |
| `test-results/ci/perf.json` | `docs/quality/schemas/perf.schema.json` | `bash scripts/gates/perf-smoke.sh` |
| `test-results/ci/reliability.json` | `docs/quality/schemas/reliability.schema.json` | `bash scripts/gates/reliability-smoke.sh` |
| `test-results/ci/observability.json` | `docs/quality/schemas/observability.schema.json` | `bash scripts/gates/observability-contract.sh` |
| `test-results/ci/governance.json` | `docs/quality/schemas/governance.schema.json` | `bash scripts/gates/governance-gate.sh` |
| `test-results/ci/slo-policy-check.json` | `docs/quality/schemas/slo-policy-check.schema.json` | `bash scripts/gates/slo-policy-check.sh` |
| `test-results/ci/rag-eval.json` | `docs/quality/schemas/rag-eval.schema.json` | TBD (requires RAG eval harness) |
| `docs/evidence/_generated/catalogue.json` | `docs/quality/schemas/catalogue.schema.json` | `pnpm tsx scripts/sre/generate-evidence-catalogue.ts` |
| `docs/sre/_generated/error_budget_status.json` | `docs/quality/schemas/error-budget-status.schema.json` | `pnpm tsx scripts/sre/generate-error-budget-status.ts` |
| `docs/architecture/panel/_generated/ARCHITECTURE_SCORECARD.json` | `docs/quality/schemas/architecture-scorecard.schema.json` | Manual (expert panel output) |

## Proof Status

**Current Status (2026-02-12):**
- ✅ Schema validation gate: OPERATIONAL
- ✅ 9 schemas defined
- ✅ 9/11 artifacts generated
- ⏳ 2 artifacts pending (summary.json, rag-eval.json)
- ✅ All generated artifacts schema-valid

**Missing Proof Artifacts:**
1. `test-results/ci/summary.json` - Requires test execution
2. `test-results/ci/rag-eval.json` - Requires RAG evaluation harness

**Proof Artifacts with UNKNOWN Status:**
- `security-gate.json`: No secret scanning, authz tests, or dependency scanning
- `perf.json`: No performance instrumentation
- `reliability.json`: No SLO monitoring

**Rule:** Dimensions with UNKNOWN proof artifacts cannot score ≥9/10.

---

**Status:** Ready for expert distribution
