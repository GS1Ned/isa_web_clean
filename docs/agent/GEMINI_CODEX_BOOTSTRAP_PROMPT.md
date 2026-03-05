# Gemini / Codex Bootstrap Prompt (ISA)

Status: ACTIVE  
Last Updated: 2026-03-04

Use this as a compact bootstrap prompt for Gemini Code Assist or Codex when starting a new ISA task.

```text
You are working inside the ISA repository.
Mode: evidence-first, minimal diff, no secrets, no parallel truth.

Your job:
- understand the current canonical ISA architecture
- determine what is already done vs still open
- implement only one small, reviewable next step

Non-negotiables:
1. Repo files and code are the only source of truth.
2. Treat docs as claims unless they align with current code/config/tests.
3. Do not create new architecture, target-state, roadmap, or strategy documents.
4. Prefer updating existing canonical docs only when code truth or contracts materially changed.
5. Use `filesystem` and `git` MCP first before making repo claims.

Read in this order:
1. `AGENTS.md`
2. `docs/agent/AGENT_MAP.md`
3. `docs/governance/TECHNICAL_DOCUMENTATION_CANON.md`
4. `docs/planning/NEXT_ACTIONS.json`
5. `docs/spec/ARCHITECTURE.md`
6. `docs/spec/ADVISORY/ISA_CORE_CONTRACT.md`
7. `docs/spec/ISA_DATA_PLANE_ARCHITECTURE.md`
8. `docs/architecture/panel/_generated/CAPABILITY_MANIFEST.json`
9. `docs/architecture/panel/_generated/PRIMITIVE_DICTIONARY.json`
10. `docs/architecture/panel/_generated/CAPABILITY_GRAPH.json`
11. Relevant runtime contracts:
   - `docs/spec/ESRS_MAPPING/RUNTIME_CONTRACT.md`
   - `docs/spec/ADVISORY/RUNTIME_CONTRACT.md`
12. Current code truth for the active stream:
   - `server/esrs-decision-artifacts.ts`
   - `server/advisory-report-versioning.ts`
   - `server/advisory-report-decision-diff.ts`
   - `server/routers/advisory-reports.ts`
   - `client/src/pages/AdvisoryReports.tsx`
   - `client/src/pages/AdvisoryReportDetail.tsx`

Current macro status:
- Canonical next-work queue is `docs/planning/NEXT_ACTIONS.json`
- Current first READY item is `ISA2-0001`
- `ESRS_MAPPING` is the decision core
- `ADVISORY` is the durable stakeholder-deliverable layer
- Recent work already added:
  - stable ESRS decision artifacts
  - advisory report persistence for decision artifacts
  - advisory version snapshots carrying decision artifacts
  - advisory detail UI consuming persisted artifacts
  - advisory version diff summary for decision artifacts

What is probably still open:
- remaining migration away from file-based advisory diff/version flows
- compare surfaces still tied to old static advisory files
- any downstream consumers not yet using persisted report/version artifacts

Do not use as current architecture/status authority:
- `docs/governance/DOC_AUTHORITY_MAP.md`
- `docs/spec/ISA_CAPABILITY_MAP.md`
- `docs/spec/ADVISORY/ARCHITECTURE.md`
- `docs/spec/ADVISORY/FILE_SYSTEM_MEMORY_ARCHITECTURE.md`
- `docs/ISA_STRATEGIC_CONTEXT_SYNTHESIS.md`
- `docs/ISA_STRATEGIC_DISCOVERY_REPORT.md`
- `docs/ISA_IMPLEMENTATION_EXECUTION_PLAN.md`
- historical or deprecated docs listed in `docs/spec/DEPRECATION_MAP.md`

Execution rules:
1. Start from the first READY item unless the current branch/PR clearly continues a narrower in-flight slice.
2. Check code truth before trusting runtime contracts for field-level details.
3. Keep changes scoped to one reviewable slice.
4. Prefer host-side implementation for normal code work.
5. If the task is broad analysis, route it to OpenClaw instead of expanding local scope.
6. End with:
   - FACT
   - INTERPRETATION
   - RECOMMENDATION

Definition of done for this session:
- one small diff
- aligned with canonical docs
- validated proportionally
- no new parallel truth introduced
```
