Last_verified: 2026-02-10
Scope: Evidence index for P0 gate claims and backbone bootstrap.
Rules:
- Evidence-first: each claim must link to file path(s) or command output.
- STOP: unresolved conflicts remain unresolved until human-confirmed.
- Secrets: no secret values.

# EVIDENCE_LEDGER

| Claim_ID | Claim | Evidence Paths / Commands | Excerpt / Output | Notes | Date |
|---|---|---|---|---|---|
| CLM-001 | Required P0 entrypoint files exist. | `AGENT_START_HERE.md`, `docs/agent/AGENT_MAP.md`, `docs/spec/INDEX.md`, `docs/governance/_root/ISA_GOVERNANCE.md` | Command output listed all four files present. | Precondition satisfied. | 2026-02-10 |
| CLM-002 | Planning canon is self-contradictory in agent entrypoint docs. | `AGENT_START_HERE.md:10`, `AGENT_START_HERE.md:19` | `todo.md` + `BACKLOG.csv` vs `NEXT_ACTIONS.json` + `PROGRAM_PLAN.md`. | Canon ambiguity. | 2026-02-10 |
| CLM-003 | Planning policy defines live sources as `todo.md` + `BACKLOG.csv`. | `docs/planning/PLANNING_POLICY.md:4-5` | `Canonical "live" planning sources` lists those two files. | Competes with NEXT_ACTIONS model. | 2026-02-10 |
| CLM-004 | AGENT_MAP declares single source of next work as `NEXT_ACTIONS.json`. | `docs/agent/AGENT_MAP.md:6-10` | `Execution queue (single source of next work): docs/planning/NEXT_ACTIONS.json`. | Competes with planning policy. | 2026-02-10 |
| CLM-005 | Validator only allows a narrow planning file set and rejects extra planning docs. | `scripts/validate_planning_and_traceability.py:5-13`, `scripts/validate_planning_and_traceability.py:25-27` | `Disallowed planning file ...` error branch. | Conflicts with required backbone docs. | 2026-02-10 |
| CLM-006 | Governance root path references are broken at repo root. | `README.md:77`, `README.md:115`, command: `test -f ISA_GOVERNANCE.md` | Output: `ISA_GOVERNANCE.md MISSING`. | Authoritative file exists under `docs/governance/_root/`. | 2026-02-10 |
| CLM-007 | IRON protocol references missing root artifacts. | `docs/governance/IRON_PROTOCOL.md:38-40`, command checks | Output: `ROADMAP_MISSING`, `IRON_PROTOCOL_MISSING`, `SCOPE_DECISIONS_MISSING`, `ISA_INVENTORY_MISSING`. | IRON hierarchy cannot be executed as written. | 2026-02-10 |
| CLM-008 | docs/spec CI status claims do not match workflow files. | `docs/spec/README.md:116-119`, command `ls .github/workflows | nl -ba` | Claimed active workflows are present as `.yml.disabled`. | Formal-but-unenforced control. | 2026-02-10 |
| CLM-009 | Canonical context script includes destructive reset. | `scripts/iron-context.sh:33` | `git reset --hard origin/main`. | Conflicts with non-destructive safety policy. | 2026-02-10 |
| CLM-010 | Repo policy forbids destructive commands by default. | `AGENTS.md:10` | `Never run destructive commands unless explicitly required`. | Safety conflict with CLM-009. | 2026-02-10 |
| CLM-011 | STOP behavior is formally defined for audit execution. | `docs/governance/AUDIT_EXECUTION_MODE.md:94-118` | STOP requires listing conflicts, impact, and evidence needed. | Governs gate-stop behavior. | 2026-02-10 |
| CLM-012 | Conflict lifecycle requires human confirmation before canonicalization. | `docs/spec/CONFLICT_REGISTER.md:27-40` | `No conflict may advance beyond DECISION_PROPOSED without explicit human confirmation.` | Human authority retained. | 2026-02-10 |
| CLM-013 | `.env.example` is absent while env contract and preflight expect env discipline. | `server/_core/env.ts:11-14`, `docs/governance/MANUAL_PREFLIGHT.md:62`, command `test -f .env.example` | Output: `.env.example MISSING`. | Reproducibility gap. | 2026-02-10 |
| CLM-014 | Core capabilities are explicitly defined as six canonical capabilities. | `docs/core/ISA_CORE_CONTRACT.md:4-9` | ASK_ISA, NEWS_HUB, KNOWLEDGE_BASE, CATALOG, ESRS_MAPPING, ADVISORY. | Basis for capability inventory. | 2026-02-10 |
| CLM-015 | App router wires core capability endpoints. | `server/routers.ts:1132`, `server/routers.ts:1162`, `server/routers.ts:1172`, `server/routers.ts:1199`, `server/routers.ts:1214`, `server/routers.ts:1308` | Capability routers are exported in root `appRouter`. | Code-backed capability presence. | 2026-02-10 |
| CLM-016 | Client routes expose capability pages. | `client/src/App.tsx:174`, `client/src/App.tsx:182`, `client/src/App.tsx:204`, `client/src/App.tsx:206`, `client/src/App.tsx:218`, `client/src/App.tsx:227` | Routes for news, mappings, ask, advisory, dataset registry, admin news. | UI wiring evidence. | 2026-02-10 |
| CLM-017 | Ask ISA has active smoke validation in CI. | `.github/workflows/ask-isa-runtime-smoke.yml:26-29`, `.github/workflows/ask-isa-smoke.yml:14` | Runs planning validator + smoke script. | Targeted enforcement exists for Ask ISA only. | 2026-02-10 |
| CLM-018 | Repository contains high-risk large documentation/data surfaces. | command: top-level file count/size inventory | `docs` 365 files (13M), `data` 72 files (99M), `isa-archive` 108 files (25M). | Coverage risk for P0 gate. | 2026-02-10 |
