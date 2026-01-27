# Validation Report — EU_ESG_to_GS1_Mapping v1.1
Last verified: 2026-01-27

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
- obligations with placeholders needing article-level precision: 0 ✅

### BL-001 Resolution (2026-01-27)
All placeholder article references have been replaced with exact article numbers:

| Obligation ID | Previous Placeholder | Exact Article | Source |
|---------------|---------------------|---------------|--------|
| PPWR-O1 | "Operative articles (placing on the market and prevention)" | Article 15(1) | EUR-Lex CELEX:32025R0040 |
| PPWR-O2 | "Relevant operative articles" | Article 48 | EUR-Lex CELEX:32025R0040 |
| FL-O1 | "Operative prohibition article" | Article 3 | EUR-Lex CELEX:32024R3015 |
| FL-O2 | "Investigation and enforcement provisions" | Articles 15-24 | EUR-Lex CELEX:32024R3015 |

## 3. Summary
- Overall structural validation: PASS
- Placeholder scan: PASS (0 placeholders remaining)
- Legal traceability: EVIDENCE-GRADE ✅

All obligations now have exact article-level citations traceable to EUR-Lex ELI pages.
