# Planning Index (Canonical)
Status: CANONICAL

## Canonical Planning Anchors
- Execution queue (single source of next work): `docs/planning/NEXT_ACTIONS.json`
- Structured backlog (canonical): `docs/planning/BACKLOG.csv`

## Preconditions Before Work
1) Confirm branch and working tree state
2) Read first `READY` item in `docs/planning/NEXT_ACTIONS.json`
3) Run manual preflight checklist: `docs/governance/MANUAL_PREFLIGHT.md`

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

## Database Requirements For Managed DB Alternative Market Research
FACT
- A previous target environment migration path was blocked by managed-provider quota exhaustion (`usage quota exhausted`).

RECOMMENDATION
- Use the following requirement set for market comparison and shortlist scoring:
1. MySQL wire-compatibility sufficient for current Drizzle + migration workflow.
2. Transaction semantics: ACID with repeatable-read behavior for ingestion/update flows.
3. Online schema change support with low-lock additive migrations.
4. Predictable DDL/DML limits for nightly batch ingestion (no hidden hard caps).
5. Vertical and horizontal scaling options with clear upgrade path.
6. Read replica support and failover strategy with documented RTO/RPO.
7. p95 latency SLO support for mixed read/write RAG workloads.
8. Throughput headroom for ingestion spikes and concurrent Ask ISA queries.
9. Native backup/restore, PITR, and tested disaster-recovery workflow.
10. Strong observability: query metrics, slow query logs, audit logs, health APIs.
11. Security baseline: TLS in transit, encryption at rest, key management support.
12. Access control: least-privilege roles, service accounts, rotation-friendly credentials.
13. Network controls: IP allowlists/private networking options for production.
14. Cost transparency: predictable pricing model, no abrupt quota cliff for baseline workload.
15. Region availability aligned with EU/NL data locality requirements.
16. Export portability: logical dump + CDC options to avoid lock-in.
17. Version lifecycle guarantees and upgrade windows compatible with CI/deploy cadence.
18. Managed-service operational maturity: SLA, incident history, support responsiveness.
19. Compatibility with current SQL feature usage in `drizzle/schema*.ts` and migration scripts.
20. Proven rollback strategy for failed migrations in production-like environments.
