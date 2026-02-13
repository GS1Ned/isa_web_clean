# ISA — Agent Entry Point

**Purpose:** Single canonical orientation for any AI agent or developer working on ISA.
**Last Updated:** 2026-02-13

---

## What is ISA

ISA (Intelligent Standards Architect) is a sustainability compliance intelligence platform connecting EU ESG regulations to GS1 standards. It is deployed at `gs1isa.com`.

**Stack:** React 19 + Express 4 + tRPC 11 + Drizzle ORM + TiDB + OpenAI

---

## Key Entry Points

| Document | Path | Purpose |
| --- | --- | --- |
| Architecture SSOT | `docs/spec/ARCHITECTURE.md` | System architecture (v2.0.0, authoritative) |
| Governance Framework | `docs/governance/_root/ISA_GOVERNANCE.md` | Governance principles and rules |
| Docs Index | `docs/INDEX.md` | Master documentation navigation |
| Repository Map | `docs/REPO_MAP.md` | CI-generated repo structure snapshot |
| ISA Map | `ISA_MAP.md` | Current-state repo-truth report |

---

## Code Entry Points

| Component | Path |
| --- | --- |
| Server entry | `server/_core/index.ts` |
| Client entry | `client/src/main.tsx` |
| Master tRPC router | `server/routers.ts` |
| Database schema | `drizzle/schema.ts` |
| Shared types | `shared/types.ts` |

---

## 6 Core Capabilities

| Capability | Spec | Key router |
| --- | --- | --- |
| ASK_ISA | `docs/spec/ASK_ISA/CAPABILITY_SPEC.md` | `server/routers/ask-isa-v2.ts` |
| NEWS_HUB | `docs/spec/NEWS_HUB/CAPABILITY_SPEC.md` | `server/news-pipeline.ts` |
| KNOWLEDGE_BASE | `docs/spec/KNOWLEDGE_BASE/RUNTIME_CONTRACT.md` | `server/knowledge-vector-search.ts` |
| CATALOG | `docs/spec/CATALOG/RUNTIME_CONTRACT.md` | `server/routers/standards-directory.ts` |
| ESRS_MAPPING | `docs/spec/ESRS_MAPPING/RUNTIME_CONTRACT.md` | `server/routers/esrs-gs1-mapping.ts` |
| ADVISORY | `docs/spec/ADVISORY/RUNTIME_CONTRACT.md` | `server/routers/advisory-reports.ts` |

---

## Planning

- **Next actions:** `docs/planning/NEXT_ACTIONS.json`
- **Backlog:** `docs/planning/BACKLOG.csv`
- **Program plan:** `docs/planning/PROGRAM_PLAN.md`

---

## Development Commands

```bash
pnpm dev          # Start dev server (port 3000)
pnpm build        # Production build (Vite + esbuild)
pnpm check        # TypeScript type check
pnpm test         # Run all tests (Vitest)
pnpm test-unit    # Unit tests only
```

---

## Rules

1. **Secrets safety:** Never commit `.env`, never print secret values, never hardcode credentials.
2. **Governance:** Follow `docs/governance/_root/ISA_GOVERNANCE.md`. Escalate Lane C triggers.
3. **Conventional commits:** `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
4. **Evidence-first:** Back claims with file paths. Mark unknowns as UNKNOWN.
5. **Minimal changes:** Only change what is needed. Avoid speculative refactoring.
