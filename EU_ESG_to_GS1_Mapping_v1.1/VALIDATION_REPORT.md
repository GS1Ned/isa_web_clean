# Validation Report — EU_ESG_to_GS1_Mapping v1.1
Last verified: 2026-01-25

## 1. Referential integrity
- corpus instruments: 11
- obligations: 24
- atomic requirements: 24
- data requirements: 24

- obligations -> corpus: PASS
- atomic_requirements.obligation_id present & valid: PASS
- data_requirements.atomic_id valid: PASS
- data_requirements.obligation_id valid: PASS
- gs1_mapping.data_id valid: PASS
- scoring total equals sum of factors: PASS

## 2. Placeholder / ambiguity scan
- obligations with placeholders needing article-level precision: 4
  - PPWR-O1: matches `\boperative articles\b` → Operative articles (placing on the market and prevention) The regulation obliges economic operators to place on the market only packaging that complies with essential sustainability and waste-reduction requirements.
  - PPWR-O2: matches `\boperative articles\b` → Relevant operative articles The regulation obliges Member States to ensure systems for packaging waste collection and treatment.
  - PPWR-O2: matches `\brelevant operative articles\b` → Relevant operative articles The regulation obliges Member States to ensure systems for packaging waste collection and treatment.
  - FL-O1: matches `\boperative prohibition\b` → Operative prohibition article The regulation obliges economic operators not to place or make available products made with forced labour on the EU market.

## 3. Summary
- Overall structural validation: PASS
- Action needed: replace placeholder article references (if any) with exact article numbers to reach evidence-grade legal traceability.