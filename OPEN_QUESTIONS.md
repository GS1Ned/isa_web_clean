# ISA Open Questions

**Version:** 1.0.0  
**Commit:** `bd6e18cabed87201790ede614576e14cb8548de1`  
**Last Updated:** 2026-01-27

---

## 1. Purpose

This document tracks **known unknowns** in the ISA project that cannot be answered from the current repository state. It is a living document that should be updated as new questions arise and existing ones are answered.

---

## 2. Open Questions

| # | Question | Status | Evidence Needed to Close |
|---|---|---|---|
| 1 | **What is the current status of the production database embeddings?** | 🔴 **UNKNOWN** | - Confirmation that the `generate-embeddings.yml` workflow has been run against the production database.<br>- A count of `NULL` embeddings in the production `regulations` and `gs1_standards` tables. |
| 2 | **What is the definitive source for GS1 standards data?** | 🟡 **UNCLEAR** | - The `server/ingest/` directory contains multiple GS1-related scripts (`INGEST-04_gpc.ts`, `INGEST-05_gdsn.ts`, `INGEST-06_shared.ts`).<br>- It is unclear which of these is the canonical, up-to-date source, or if they are all used in sequence. |
| 3 | **What is the intended use of the `codemods/` directory?** | 🟡 **UNCLEAR** | - The directory exists but contains only one file (`rm-server-logger.ts`).<br>- It is unclear if this is a pattern for future use or a one-off script. |
| 4 | **What is the status of the `test-results/` directory?** | 🟡 **UNCLEAR** | - The directory contains 3 files, but it is not clear if these are from an active CI process or from a one-time test run. |
| 5 | **What is the relationship between `ROADMAP.md` and the `docs/` directory?** | 🟡 **UNCLEAR** | - `ROADMAP.md` is the strategic document, but `docs/` contains many older roadmap and planning documents.<br>- The `IRON_KNOWLEDGE_MAP.md` should clarify this, but the relationship is not yet explicit. |

