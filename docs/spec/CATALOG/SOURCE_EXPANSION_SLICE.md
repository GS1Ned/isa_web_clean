---
DOC_TYPE: DECISION
CAPABILITY: CATALOG
COMPONENT: source-expansion
FUNCTION_LABEL: "Authoritative source prioritisation for next ingest slice"
OWNER: gs1ned-isa
STATUS: active
LAST_VERIFIED: 2026-03-05
VERIFICATION_METHOD: repo-evidence
---

# Authoritative Source Expansion Slice (B7 — ISA2-0009)

## Purpose

Select the **highest-leverage, lowest-maintenance-burden ingest targets** for the next
CATALOG expansion beyond the current MVP corpus (EFRAG IG3 datapoints, GDSN v3.1.32,
GS1 NL sector models, CSRD/CSDDD/EU Taxonomy regulations).

Selection criteria applied in priority order:

1. **Authority** — Is the source an official EU body, GS1 global, or mandated standard?
2. **Machine-readability** — Can the source be parsed without manual transformation?
3. **Maintenance burden** — How often does the source change and how hard is refresh?
4. **Impact on decision quality** — Does adding this source materially improve mapping
   coverage, gap-analysis recall, or change-intelligence freshness?

---

## Candidate Assessment

### Tier 1 — Include in next slice

| Source | Publisher | Format | Authority | Readability | Burden | Impact |
|--------|-----------|--------|-----------|-------------|--------|--------|
| EFRAG XBRL Taxonomy (Annex 1 Excel) | EFRAG (EU body) | XLSX | Binding | High | Low (semiannual) | High — adds structured element-level ESRS datapoints with XBRL codes; plugs directly into `esrs_datapoints` table |
| EUR-Lex CSRD delegated acts feed | EU Publications Office | XML (Formex/Akn4eu) | Binding | Medium | Low (event-driven) | High — authoritative source for enforcement signals that drive `hub_news.regulatory_state` |
| GS1 Digital Link standard (GS1 web) | GS1 Global | HTML/PDF (structured sections) | Authoritative | Medium | Low (annual) | Medium — extends GS1 attribute catalogue for Digital Link URIs used in ESRS E5/product traceability |

### Tier 2 — Defer (high burden or low marginal impact)

| Source | Reason for deferral |
|--------|---------------------|
| EFRAG XBRL `.xsd` taxonomy files | Machine-readable but complex XBRL parse; Annex 1 Excel covers same concepts with lower implementation cost |
| ESMA ESEF taxonomy | Overlaps EFRAG XBRL; relevant only when EU CSRD reporting mandates ESEF tagging (post-2025 enforcement) |
| GS1 GDSN v3.1.33+ delta releases | Current v3.1.32 is stable; delta-only ingest requires semantic versioning harness not yet implemented |
| UN/CEFACT reference data | High authority but very broad scope; requires significant curation before it improves ISA mapping quality |

---

## Selected Slice: EFRAG XBRL Annex 1 Excel

**Rationale:** The Annex 1 Excel (available at `xbrl.efrag.org`) is the official
EFRAG publication of all ESRS Set 1 datapoints in a tabular format.  It is directly
parseable with existing tooling (openpyxl / pandas), semiannually refreshed, and
fills the most significant gap in the current corpus: element-level XBRL codes and
concept labels are absent from the IG3 Excel already ingested.

**Ingest path:**

```
data/efrag/
  esrs_xbrl_annex1_v1.xlsx        ← raw download (not committed; sourced at ingest time)

scripts/ingest/
  efrag-xbrl-annex1.py            ← parse → normalised JSONL (to be created on ingest run)

data/evaluation/golden/knowledge_base/
  corpus_slice_v2.jsonl           ← existing slice already covers ESRS IG3; Annex 1
                                     extends element-level concept coverage
```

**Target table:** `esrs_datapoints` (existing schema anchor in `drizzle/schema.ts`).

**Acceptance criteria for ingest run:**
- Parsed element count ≥ 1,000 ESRS concepts
- All parsed rows carry `standard_code` (e.g. `E1-1`, `S1-5`) and `xbrl_concept_id`
- Zero duplicate `esrs_datapoint_id` conflicts with existing IG3 rows
- `pnpm check` passes after schema type additions (if any)

---

## Operational Unknowns

- EFRAG Annex 1 URL stability and versioning cadence are UNKNOWN beyond the 2024-08
  publication; the live URL (`xbrl.efrag.org/downloads/Annex-1-...`) should be
  re-verified before each ingest run.
- EUR-Lex Formex/AKN4EU parse complexity is UNKNOWN from repository-only evidence;
  structured XML feed feasibility requires a spike before Tier 1 promotion.

---

## Evidence

<!-- EVIDENCE:implementation:docs/spec/ADVISORY/efrag_xbrl_research.md -->
<!-- EVIDENCE:implementation:docs/spec/CATALOG/DATASETS_CATALOG.md -->
<!-- EVIDENCE:implementation:drizzle/schema.ts -->

**Contract Status:** DECISION_DRAFT — slice chosen; ingest script not yet executed
