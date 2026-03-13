# Ask ISA query library

## Purpose

This document provides example queries for Ask ISA (ISA query interface). Ask ISA is read-only and must answer using locked advisory artefacts and the frozen dataset registry.

## Allowed query types

- Advisory summary questions (what are the gaps, what changed, what is covered)
- Mapping lookup questions (which GS1 attributes relate to a requirement)
- Gap exploration questions (what is missing for a domain or sector)
- Recommendation lookup questions (what is recommended, by timeframe)

## Forbidden query types

- Speculation about future regulatory outcomes
- Hypothetical scenarios not grounded in locked artefacts
- Advice that is not traceable to sources
- Anything that requires customer data

## Query examples

### Advisory summary

1. "Summarise ISA_ADVISORY_v1.0 for DIY sector."
2. "List critical gaps in ISA_ADVISORY_v1.0."
3. "What regulations are covered in ISA_ADVISORY_v1.0?"
4. "Show mapping coverage percentages for ISA_ADVISORY_v1.0."

### Mappings

5. "List all mappings for sector FMCG in ISA_ADVISORY_v1.0."
6. "Show mappings with status missing for regulation EUDR."
7. "Find mappings related to domain tag PCF."
8. "List partial mappings for Healthcare."

### Gaps

9. "Show all gaps with severity critical."
10. "Which gaps relate to TRACEABILITY?"
11. "List gaps for DIY only."
12. "Show gap descriptions and linked recommendations."

### Recommendations

13. "List short-term recommendations and their linked gaps."
14. "Show medium-term recommendations for CIRCULARITY."
15. "Which recommendations address DEFORESTATION?"

## Expected answer format

Every answer must cite:
- Advisory ID and version
- Dataset registry version
- Any dataset IDs referenced
- Source artefact hashes when available

Example citation block:

- Advisory: ISA_ADVISORY_v1.0 (v1.0.0)
- Dataset registry: dataset_registry_v1.0_FROZEN.json (v1.0.0)
- Datasets referenced: esrs.datapoints.ig3, gs1nl.benelux.diy_garden_pet.v3.1.33
