# Manus Handoff Pack — EU ESG ↔ GS1 Mapping (v1.1)

Last verified: 2026-01-25

## What this pack contains
1. Canonical mapping artefacts (JSON) across six layers:
   - corpus
   - obligations
   - atomic requirements
   - data requirements
   - GS1 mapping
   - scoring
2. JSON Schemas for each layer (`/schemas`)
3. Structural validation report (`VALIDATION_REPORT.md`)
4. A targeted improvement backlog for Manus (`backlog.json`)

## What is already validated
- Cross-layer key consistency (IDs link correctly)
- Scoring totals are internally consistent

## What is NOT yet evidence-grade (must be fixed)
Some obligations still use placeholder article references:
- PPWR-O1, PPWR-O2
- FL-O1

These MUST be replaced with exact article numbers (from EUR-Lex ELI pages) before ISA can treat those obligations as citation-grade.

## Manus execution goals (highest value)
A) Tighten legal traceability
- Replace placeholder article references with exact article numbers and keep obligation wording strictly obligation-shaped (“obliges [actor] to [action]”).
- Update the corresponding atomic requirement `obligation_ref.article` fields if needed.
- Re-run schema + structural validation.

B) Expand beyond the baseline corpus (only after A)
Add *confirmed* EU instruments that materially create product/value-chain data obligations relevant to GS1:
- ESPR / DPP instruments and delegated acts
- Green Claims Directive (status and obligations)
- Ecodesign (where still active) and product environmental information requirements
- Waste shipments / SCIP / REACH-related data flows where relevant to product identity and compliance proofs
- Food information & labelling updates that create ESG-adjacent substantiation or traceability requirements

Every added instrument MUST include:
- ELI URL (primary authority)
- CELEX (where available)
- lifecycle/effect status
- last_verified = 2026-01-25

C) Strengthen GS1-side grounding (authoritative only)
For each GS1 standard referenced in mappings, attach:
- canonical GS1 source URL
- version/date
- scope statement

Do not rely on blogs or non-GS1 summaries.

## Output contract (what Manus must deliver)
- Updated JSON artefacts (same filenames) + updated `VALIDATION_REPORT.md`
- A change log (`CHANGELOG.md`) listing every modification with reason + evidence link
