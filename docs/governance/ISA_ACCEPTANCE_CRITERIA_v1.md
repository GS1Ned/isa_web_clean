# ISA Research & Critical-Path Evaluation — Acceptance Criteria (v1)

Last verified: 2026-01-28

## A. Completeness controls

1. **Repo census exists and is reproducible**
   - `CENSUS.json` lists total files, total bytes, file-type counts, and per-subdirectory counts.
   - A rerun produces either identical results or a documented diff in `CENSUS_DIFF.md`.

2. **All first-order locations are enumerated**
   - Each top-level directory has: purpose hypothesis, file count, byte count, and key file types (`SUBDIR_SUMMARY.md`).
   - Any directory excluded from later deep-dive is explicitly marked **OUT** in `SCOPE_DECISIONS.md`.

3. **Top risks and large assets are identified**
   - Files above an explicit threshold (e.g., >5MB) are listed with paths + sizes (`LARGE_ASSETS.md`).

## B. Evidence binding

4. **Every non-trivial statement is evidence-bound**
   - Each architecture/journey claim includes at least one repo reference: `[path:Lx-Ly]` or `[path]`.

5. **Authority and “truth priority” is explicit**
   - For documents: `DOC_AUTHORITY_MAP.md` must map each candidate doc to authority tier and “binding vs informative”.

## C. ISA primary journeys are traceable end-to-end

6. **For each primary journey (5):**
   - UI entrypoint(s) → client page(s) → tRPC procedure(s) → server router(s) → DB access layer → tables
   - Recorded in a single “Journey Traces” artefact.

7. **Critical-path candidate list is grounded**
   - “Critical files” list must be derived from: entrypoints, routing, ingestion runners, DB schema, CI gates.

## D. External benchmarking (currency-verified)

8. **Externally-sourced best practices are current**
   - Any best-practice claim is backed by an authoritative source URL and “verified at 2026-01-28”.
   - Preferred sources: vendor docs + engineering blogs, standards bodies, major OSS docs.

## E. Decision-readiness

9. **Critical Path decision doc is actionable**
   - States: candidate path(s), assumptions, risks, dependencies, and acceptance tests.
   - Includes explicit “UNKNOWN (no evidence)” items with closure actions.
