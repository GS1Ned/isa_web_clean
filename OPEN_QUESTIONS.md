# ISA Open Questions

**Version:** 1.1.0  
**Commit:** `8e82ee41703489494edae7d8cd08d3acb7da930b`  
**Last Updated:** 2026-02-01

---

## 1. Purpose

This document tracks **known unknowns** in the ISA project that cannot be answered from the current repository state. It is a living document that should be updated as new questions arise and existing ones are answered.

---

## 2. Open Questions

| # | Question | Status | Evidence Needed to Close |
|---|---|---|---|
| 1 | **What is the current status of the production database embeddings?** | 🔴 **BLOCKED** | - The `generate-embeddings.yml` workflow is failing due to missing `JWT_SECRET` in GitHub Actions secrets.<br>- The workflow requires `JWT_SECRET` to be set with a value >= 32 characters.<br>- **Action Required:** Add `JWT_SECRET` to GitHub repository secrets. |
| 2 | **What is the definitive source for GS1 standards data?** | 🟢 **CLARIFIED** | - The `scripts/run-all-ingestion.ts` orchestrates INGEST-02, 04, 05, 06 in sequence.<br>- INGEST-02: GDSN Current (classes, attributes, validation rules)<br>- INGEST-04: CTEs and KDEs<br>- INGEST-05: DPP Identification Rules<br>- INGEST-06: CBV Vocabularies & Digital Link Types |
| 3 | **What is the intended use of the `codemods/` directory?** | 🟡 **UNCLEAR** | - The directory exists but contains only one file (`rm-server-logger.ts`).<br>- It is unclear if this is a pattern for future use or a one-off script. |
| 4 | **What is the status of the `test-results/` directory?** | 🟡 **UNCLEAR** | - The directory contains 3 files, but it is not clear if these are from an active CI process or from a one-time test run. |
| 5 | **What is the relationship between `ROADMAP.md` and the `docs/` directory?** | 🟢 **CLARIFIED** | - `ROADMAP.md` is the authoritative strategic document (L2 in IRON hierarchy).<br>- `docs/` contains supporting documentation (L4) and historical/archived content (L5).<br>- `IRON_KNOWLEDGE_MAP.md` provides the complete classification. |
| 6 | **Why does the `generate-embeddings.yml` workflow fail?** | 🔴 **IDENTIFIED** | - The workflow fails because `server/_core/env.ts` validates `JWT_SECRET` on module load.<br>- Even though `JWT_SECRET` is not needed for embedding generation, the validation blocks execution.<br>- **Solution Options:**<br>  1. Add `JWT_SECRET` to GitHub secrets (recommended)<br>  2. Modify `generate-all-embeddings.ts` to bypass env validation<br>  3. Use standalone script `scripts/standalone-embedding-gen.ts` |

---

## 3. Resolved Questions

| # | Question | Resolution | Date |
|---|---|---|---|
| 2 | What is the definitive source for GS1 standards data? | Clarified via `run-all-ingestion.ts` analysis | 2026-02-01 |
| 5 | What is the relationship between ROADMAP.md and docs/? | Clarified via `IRON_KNOWLEDGE_MAP.md` | 2026-02-01 |

---

## 4. Action Items

| Priority | Action | Owner | Status |
|---|---|---|---|
| P0 | Add `JWT_SECRET` to GitHub repository secrets | Human | ⏳ Pending |
| P1 | Run `generate-embeddings.yml` workflow after secrets are configured | Manus/Human | ⏳ Blocked |
| P2 | Verify embedding status in production database | Manus | ⏳ Blocked |
