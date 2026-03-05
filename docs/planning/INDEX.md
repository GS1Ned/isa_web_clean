# Planning Index (Canonical)
Status: CANONICAL

## Canonical Planning Anchors
- Execution queue (single source of next work): `docs/planning/NEXT_ACTIONS.json`
- Structured backlog (canonical): `docs/planning/BACKLOG.csv`

## Recovery Commands (Archive Tags)
Restore commands for archived local branches and stashes.

Restore archived local branch tags (`archive/local/*`):

```bash
git tag --list 'archive/local/*' | sort
TAG='archive/local/20260305/feat__example-branch'
BRANCH="${TAG##*/}"
BRANCH="${BRANCH//__//}"
git branch "$BRANCH" "$TAG"
git checkout "$BRANCH"
```

Restore archived stash tags (`archive/stash/*`):

```bash
git tag --list 'archive/stash/*' | sort
TAG='archive/stash/20260305/s00'
git stash show --stat "$TAG"
git stash show -p "$TAG"
git stash store -m "restored from $TAG" "$TAG"
git stash list
```

Apply stash tag directly without adding it back to stash stack:

```bash
TAG='archive/stash/20260305/s00'
git stash apply "$TAG"
```

## Preconditions Before Work
0) Optional local noise cleanup:
   - `bash scripts/dev/cleanup-local-forbidden-files.sh` (preview)
   - `APPLY=1 bash scripts/dev/cleanup-local-forbidden-files.sh` (apply)
1) Confirm branch divergence, local delta, and queue drift snapshot:
   - `ALLOW_DIRTY=1 bash scripts/dev/reconcile-branch-main-state.sh`
2) Confirm branch and working tree state
3) Read first `READY` item in `docs/planning/NEXT_ACTIONS.json`
4) Run manual preflight checklist: `docs/governance/MANUAL_PREFLIGHT.md`

## Authority Mapping Policy (Common-Sense)
FACT
- Current mapping implementation uses URL hostname heuristics with explicit GS1 and EU anchors.
- `.nl` and `.eu` GS1 domains are in-scope for authority mapping (`gs1*.nl`, `gs1*.eu`).

RECOMMENDATION
- Keep default policy deterministic and conservative:
  - map only explicit trusted domains to non-`UNKNOWN` tiers;
  - use `UNKNOWN` when hostname does not match policy rules;
  - avoid inferred authority from content-only signals.
- Evaluate mapping policy on a fixed cadence: weekly quick review + monthly full review.
- Trigger an immediate policy review when source mix changes or new domain families are onboarded.

## ASAP Evaluation Scope (Explicit Domain/Repo Coverage)
FACT
- The following domains must be evaluated explicitly in the next authority mapping review cycle:
  - `github.com/orgs/gs1/repositories` (all repositories listed individually below)
  - `efrag.org`
  - `*.overheid.nl`
  - `echr.coe.int`
  - `eur-lex.europa.eu`
  - `uitspraken.rechtspraak.nl`
  - `officielebekendmakingen.nl`
  - `*.rjnet.nl`

RECOMMENDATION
- Evaluate and classify each item with outcome labels `INTEGRATE_NOW`, `RESOLVE_NOW`, or `DROP_NOW`.
- Record final authority-tier decisions and rationale in canonical metadata after review.

GS1 repositories to assess individually:
1. `https://github.com/gs1/2d-barcode-generator`
2. `https://github.com/gs1/dalgiardino`
3. `https://github.com/gs1/DigitalLinkDocs`
4. `https://github.com/gs1/digital-link.js`
5. `https://github.com/gs1/EndToEndTraceability`
6. `https://github.com/gs1/EPCIS`
7. `https://github.com/gs1/EUDR-tool`
8. `https://github.com/gs1/exampleGTIN`
9. `https://github.com/gs1/geocode`
10. `https://github.com/gs1/geoshapes`
11. `https://github.com/gs1/gmn-helpers`
12. `https://github.com/gs1/GS1_DigitalLink_Resolver_CE`
13. `https://github.com/gs1/GS1DL-resolver-testsuite`
14. `https://github.com/gs1/GS1DigitalLicenses`
15. `https://github.com/gs1/GS1DigitalLinkCompressionPrototype`
16. `https://github.com/gs1/GS1DigitalLinkToolkit.js`
17. `https://github.com/gs1/gs1-barcode-engine`
18. `https://github.com/gs1/gs1-digital-link-uri-simple-parser`
19. `https://github.com/gs1/gs1-syntax-dictionary`
20. `https://github.com/gs1/gs1-syntax-engine`
21. `https://github.com/gs1/linkset`
22. `https://github.com/gs1/Mktg-50anniversary`
23. `https://github.com/gs1/Mktg-Branding-templates`
24. `https://github.com/gs1/moduleCount`
25. `https://github.com/gs1/S4T`
26. `https://github.com/gs1/TDS`
27. `https://github.com/gs1/TDT`
28. `https://github.com/gs1/vbg-l2sd-demo`
29. `https://github.com/gs1/VC-Data-Model`
30. `https://github.com/gs1/vc-data-model-verifier`
31. `https://github.com/gs1/WebVoc`

## Data Plane Migration Canon (Current)
FACT
- Target data-plane decision is confirmed: `docs/decisions/ADR-0001_SUPABASE_POSTGRES_DATA_PLANE.md`.
- Migration queue is tracked in `docs/planning/NEXT_ACTIONS.json` under `ISA2-0010` through `ISA2-0020`.
- Scope is DB-only for this line (no Supabase Auth/Storage/Realtime adoption in this tranche).

RECOMMENDATION
- Execute migration in canonical order:
1. Canon + ADR convergence (`ISA2-0010`)
2. Tooling + CI parity foundation (`ISA2-0011`, `ISA2-0012`)
3. Top-3 journey schema/parity slices (`ISA2-0013a`..`ISA2-0016`)
4. Rehydration + parity + readiness + cutover (`ISA2-0017`..`ISA2-0020`)
