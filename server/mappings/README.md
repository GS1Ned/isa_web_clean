# ESRS-to-GS1 Mapping Library

This folder contains a static ESRS → GS1 attribute mapping library used by ISA
to translate ESRS datapoints into concrete GS1 supply chain attributes.

The library is **pure TypeScript** and does not call the database or external
services. It is designed so that Manus can safely extend and refine mappings
over time without touching infrastructure or runtime configuration.

---

## Files

- `esrs-to-gs1-mapper.ts`  
  Public TypeScript API for resolving ESRS datapoint IDs into GS1 attributes.

- `esrs-gs1-mapping-data.ts`  
  Static mapping rules (`ESRS_GS1_MAPPING_RULES`) that encode relationships
  between ESRS datapoint patterns and GS1 attributes.

- `esrs-to-gs1-mapper.test.ts`  
  Vitest test suite that validates the core mapping behaviour.

---

## Usage

### Basic example

```ts
import { mapESRSToGS1Attributes } from "./mappings/esrs-to-gs1-mapper";

const mappings = await mapESRSToGS1Attributes(["E1-1_01", "E5-2_01"]);

for (const mapping of mappings) {
  console.log(mapping.esrsDatapointId, mapping.esrsStandard);
  for (const attribute of mapping.gs1Attributes) {
    console.log(`  - ${attribute.attributeName} (${attribute.gs1Standard})`);
  }
}
```

### With options

```ts
import {
  mapESRSToGS1Attributes,
  type MappingOptions,
} from "./mappings/esrs-to-gs1-mapper";

const options: MappingOptions = {
  filterByStandard: "GDSN",
  maxAttributesPerDatapoint: 3,
};

const mappings = await mapESRSToGS1Attributes(["E1-1_01", "S1-1_01"], options);
```

The options behave as follows:

- **includeLowConfidence** (default false)  
  When false, mappings with `mappingConfidence < 0.7` are filtered out.

- **filterByStandard**  
  Only returns attributes where `gs1Standard` matches (case-insensitive).

- **maxAttributesPerDatapoint**  
  Truncates each datapoint's attribute list after filtering and sorting by
  confidence.

---

## Extending the Mapping Rules

To extend coverage:

1. Open `esrs-gs1-mapping-data.ts`.
2. Add a new `ESRSMappingRule` entry to `ESRS_GS1_MAPPING_RULES`:
   - Choose a glob-style `esrsPattern` (e.g. `"E1-6_*"` or `"S1-3_01"`).
   - Set `esrsStandard` to the ESRS standard (e.g. `"E1"`, `"S1"`).
   - Provide a short `topic` description.
   - Add one or more `gs1Attributes` with:
     - `attributeName`
     - `gs1Standard` (e.g. `"GDSN"`, `"GDM"`, `"EPCIS"`, `"Digital Link"`)
     - `dataType`
     - Optional `unit`
     - `mappingConfidence` between 0 and 1
     - `mappingReason` explaining the rationale
3. If needed, add or adjust tests in `esrs-to-gs1-mapper.test.ts` to cover the
   new rules.

The mapping function automatically picks up new rules via pattern matching; no
changes to `esrs-to-gs1-mapper.ts` are required as long as the types remain
stable.

---

## Design Notes

- The library is intentionally conservative:
  - Only a curated subset of ESRS topics (E1, E2, E3, E5, S1) is covered.
  - Confidence scores are explicitly encoded to support filtering and future
    tuning.
- ESRS datapoint names are approximated using the rule `topic` field, because
  the mapping layer does not query the `esrs_datapoints` table directly.
- All logic is deterministic and side-effect free, making it safe for use in
  backend routes and test environments without additional setup.
