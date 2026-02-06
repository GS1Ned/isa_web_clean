# CGPT-01: ESRS-to-GS1 Attribute Mapping Library

**Task ID:** CGPT-01  
**Priority:** ⭐ HIGH  
**Risk Level:** Low  
**Estimated Effort:** 8-12 hours  
**Dependencies:** None  
**Status:** Ready

---

## Context

### ISA Mission

The Intelligent Standards Architect (ISA) bridges EU sustainability regulations with GS1 supply chain standards. A core capability is mapping ESRS (European Sustainability Reporting Standards) datapoint requirements to specific GS1 attributes that companies must collect and report.

### Relevant Subsystem

This task focuses on creating a **pure TypeScript mapping library** in `/server/mappings/` that will be used by:

- **Compliance checking features** - Validate if product data meets ESRS requirements
- **DPP generation** - Auto-populate Digital Product Passports with required attributes
- **Guidance UI** - Show users which GS1 attributes they need per ESRS datapoint

### Key Files in Repo

- `/drizzle/schema.ts` - Database schema including `esrs_datapoints` table (1,184 records)
- `/server/db.ts` - Database query helpers
- `/shared/types/` - (Future) Shared TypeScript interfaces
- `/docs/ISA_ESG_GS1_CANONICAL_MODEL.md` - ESG integration strategy
- `/data/esg/common_data_categories.json` - Cross-regulation data categories

---

## Exact Task

### Goal

Implement a **pure TypeScript mapping function** that receives a list of ESRS datapoint IDs and returns relevant GS1 attributes with metadata (attribute name, GS1 standard, data type, mapping confidence).

### How It Will Be Used

**Backend Integration:**

```typescript
// In server/routers/compliance.ts
import { mapESRSToGS1Attributes } from "../mappings/esrs-to-gs1-mapper";

const complianceCheck = publicProcedure
  .input(z.object({ esrsDatapointIds: z.array(z.string()) }))
  .query(async ({ input }) => {
    const mappings = await mapESRSToGS1Attributes(input.esrsDatapointIds);
    // Use mappings to check product data completeness
    return { requiredAttributes: mappings, ... };
  });
```

**Frontend Integration:**

```typescript
// In client/src/pages/ComplianceChecker.tsx
const { data } = trpc.compliance.check.useQuery({
  esrsDatapointIds: ["E1-1_01", "E2-3_05"],
});
// Display required GS1 attributes to user
```

---

## Technical Specification

### 1. File Structure

**Create these files:**

```
/server/mappings/
├── esrs-to-gs1-mapper.ts          # Main mapping logic
├── esrs-to-gs1-mapper.test.ts     # Unit tests
├── esrs-gs1-mapping-data.ts       # Static mapping rules
└── README.md                       # Documentation
```

### 2. Core Function Signature

**File:** `/server/mappings/esrs-to-gs1-mapper.ts`

```typescript
/**
 * Maps ESRS datapoint IDs to relevant GS1 attributes
 *
 * @param esrsDatapointIds - Array of ESRS datapoint IDs (e.g., ["E1-1_01", "E2-3_05"])
 * @param options - Optional configuration
 * @returns Array of GS1 attribute mappings with metadata
 *
 * @example
 * const mappings = await mapESRSToGS1Attributes(["E1-1_01", "E2-3_05"]);
 * // Returns:
 * // [
 * //   {
 * //     esrsDatapointId: "E1-1_01",
 * //     gs1Attributes: [
 * //       {
 * //         attributeName: "greenhouseGasEmissionsScope1",
 * //         gs1Standard: "GDSN",
 * //         dataType: "quantitative",
 * //         unit: "tonnes CO2e",
 * //         mappingConfidence: 0.95,
 * //         mappingReason: "Direct match for Scope 1 GHG emissions reporting"
 * //       }
 * //     ]
 * //   },
 * //   ...
 * // ]
 */
export async function mapESRSToGS1Attributes(
  esrsDatapointIds: string[],
  options?: MappingOptions
): Promise<ESRSToGS1Mapping[]>;

export interface MappingOptions {
  /** Include low-confidence mappings (< 0.7) */
  includeLowConfidence?: boolean;
  /** Filter by specific GS1 standard (e.g., "GDSN", "EPCIS") */
  filterByStandard?: string;
  /** Maximum number of attributes per datapoint */
  maxAttributesPerDatapoint?: number;
}

export interface ESRSToGS1Mapping {
  esrsDatapointId: string;
  esrsDatapointName: string;
  esrsStandard: string; // E.g., "E1", "E2", "S1"
  gs1Attributes: GS1AttributeMapping[];
}

export interface GS1AttributeMapping {
  attributeName: string;
  gs1Standard: string; // E.g., "GDSN", "EPCIS", "GDM", "Digital Link"
  dataType:
    | "narrative"
    | "monetary"
    | "percentage"
    | "date"
    | "boolean"
    | "quantitative";
  unit?: string; // E.g., "tonnes CO2e", "liters", "kWh"
  mappingConfidence: number; // 0.0 to 1.0
  mappingReason: string; // Human-readable explanation
  exampleValue?: string; // Optional example for clarity
}
```

### 3. Mapping Data Structure

**File:** `/server/mappings/esrs-gs1-mapping-data.ts`

Create a static mapping table that encodes the relationships between ESRS datapoints and GS1 attributes. Use a structured format that's easy to maintain and extend.

**Example Structure:**

```typescript
export const ESRS_GS1_MAPPING_RULES: ESRSMappingRule[] = [
  {
    esrsPattern: "E1-1_*", // Matches E1-1_01, E1-1_02, etc.
    esrsStandard: "E1",
    topic: "Climate Change - GHG Emissions",
    gs1Attributes: [
      {
        attributeName: "greenhouseGasEmissionsScope1",
        gs1Standard: "GDSN",
        dataType: "quantitative",
        unit: "tonnes CO2e",
        mappingConfidence: 0.95,
        mappingReason: "Direct match for Scope 1 GHG emissions reporting",
      },
      {
        attributeName: "carbonFootprintTotal",
        gs1Standard: "GDM",
        dataType: "quantitative",
        unit: "kg CO2e",
        mappingConfidence: 0.9,
        mappingReason: "Total carbon footprint includes Scope 1 emissions",
      },
    ],
  },
  {
    esrsPattern: "E2-3_*",
    esrsStandard: "E2",
    topic: "Pollution - Water Discharges",
    gs1Attributes: [
      {
        attributeName: "waterDischargeVolume",
        gs1Standard: "GDSN",
        dataType: "quantitative",
        unit: "cubic meters",
        mappingConfidence: 0.92,
        mappingReason: "Water discharge volume reporting",
      },
    ],
  },
  // Add more mapping rules here...
];

interface ESRSMappingRule {
  esrsPattern: string; // Glob pattern (e.g., "E1-1_*" or exact "E1-1_01")
  esrsStandard: string;
  topic: string;
  gs1Attributes: Omit<GS1AttributeMapping, "exampleValue">[];
}
```

**Mapping Coverage Requirements:**

You must create mappings for at least these ESRS standards (prioritize by importance):

1. **E1 - Climate Change** (GHG emissions, energy consumption)
2. **E2 - Pollution** (Water, air, soil pollution)
3. **E3 - Water and Marine Resources** (Water consumption, withdrawal)
4. **E5 - Resource Use and Circular Economy** (Material composition, recyclability)
5. **S1 - Own Workforce** (Labor practices, human rights)

For each standard, cover the top 5-10 most common datapoints. You can use pattern matching (e.g., `E1-1_*`) to cover multiple related datapoints with one rule.

### 4. Implementation Logic

**Algorithm:**

1. **Input validation** - Check that `esrsDatapointIds` is a non-empty array
2. **Pattern matching** - For each datapoint ID, find matching rules in `ESRS_GS1_MAPPING_RULES`
3. **Confidence filtering** - Apply `includeLowConfidence` option
4. **Standard filtering** - Apply `filterByStandard` option if provided
5. **Limit results** - Apply `maxAttributesPerDatapoint` if provided
6. **Return structured output** - Format as `ESRSToGS1Mapping[]`

**Pattern Matching Logic:**

```typescript
function matchesPattern(datapointId: string, pattern: string): boolean {
  // Exact match
  if (pattern === datapointId) return true;

  // Glob pattern (e.g., "E1-1_*" matches "E1-1_01", "E1-1_02", etc.)
  const regex = new RegExp("^" + pattern.replace("*", ".*") + "$");
  return regex.test(datapointId);
}
```

### 5. Error Handling

- If no mappings found for a datapoint, return empty `gs1Attributes` array (don't throw error)
- If invalid datapoint ID format, log warning but continue processing others
- If `options` contains invalid values, use sensible defaults

### 6. Example Inputs and Outputs

**Example 1: Basic Usage**

```typescript
const mappings = await mapESRSToGS1Attributes(["E1-1_01", "E2-3_05"]);

// Expected output:
[
  {
    esrsDatapointId: "E1-1_01",
    esrsDatapointName: "Gross Scope 1 GHG emissions",
    esrsStandard: "E1",
    gs1Attributes: [
      {
        attributeName: "greenhouseGasEmissionsScope1",
        gs1Standard: "GDSN",
        dataType: "quantitative",
        unit: "tonnes CO2e",
        mappingConfidence: 0.95,
        mappingReason: "Direct match for Scope 1 GHG emissions reporting",
      },
    ],
  },
  {
    esrsDatapointId: "E2-3_05",
    esrsDatapointName: "Water discharge volume",
    esrsStandard: "E2",
    gs1Attributes: [
      {
        attributeName: "waterDischargeVolume",
        gs1Standard: "GDSN",
        dataType: "quantitative",
        unit: "cubic meters",
        mappingConfidence: 0.92,
        mappingReason: "Water discharge volume reporting",
      },
    ],
  },
];
```

**Example 2: With Options**

```typescript
const mappings = await mapESRSToGS1Attributes(["E1-1_01"], {
  filterByStandard: "GDSN",
  maxAttributesPerDatapoint: 3,
});

// Expected output: Only GDSN attributes, max 3 per datapoint
```

**Example 3: No Mappings Found**

```typescript
const mappings = await mapESRSToGS1Attributes(["INVALID_ID"]);

// Expected output:
[
  {
    esrsDatapointId: "INVALID_ID",
    esrsDatapointName: "Unknown",
    esrsStandard: "Unknown",
    gs1Attributes: [],
  },
];
```

---

## Constraints and Conventions

### Coding Standards

- **TypeScript strict mode:** All code must pass `tsc --noEmit`
- **No `any` types:** Use explicit interfaces or `unknown`
- **Pure functions:** No side effects, no database calls, no API calls
- **Immutable data:** Don't modify input arrays/objects
- **Error handling:** Use `try/catch` for any risky operations, return errors gracefully

### Performance

- Function should execute in <50ms for typical input (5-10 datapoint IDs)
- Use efficient data structures (Map, Set) for lookups if needed
- Avoid nested loops where possible

### Documentation

- JSDoc comments for all exported functions
- Include `@example` blocks showing realistic usage
- Document all parameters and return types explicitly

---

## Dependency Assumptions

### What Manus Guarantees

**Existing Types:**

- You can import types from `/drizzle/schema.ts` if needed (e.g., `ESRSDatapoint` type)
- Database schema is stable and won't change during your implementation

**No Database Access Required:**

- This is a pure mapping function using static rules
- You do NOT need to query the database for ESRS datapoint details
- All mapping logic should be self-contained in your files

### What You Must NOT Change

- Do NOT modify `/drizzle/schema.ts`
- Do NOT modify `/server/db.ts`
- Do NOT add new npm dependencies (use only built-in TypeScript/Node.js features)
- Do NOT create new database tables or migrations

---

## Acceptance Criteria

### Code Quality

- [ ] TypeScript compiles without errors (`pnpm check`)
- [ ] Code follows project conventions (kebab-case files, camelCase functions)
- [ ] All exported functions have JSDoc comments
- [ ] No hardcoded credentials or secrets

### Functionality

- [ ] `mapESRSToGS1Attributes` function works as specified
- [ ] Pattern matching correctly handles glob patterns (e.g., `E1-1_*`)
- [ ] Options (`includeLowConfidence`, `filterByStandard`, `maxAttributesPerDatapoint`) work correctly
- [ ] Returns empty `gs1Attributes` array for unknown datapoint IDs (doesn't crash)

### Testing

- [ ] Unit tests cover all major code paths
- [ ] Tests include examples from this spec
- [ ] Tests verify pattern matching logic
- [ ] Tests verify options filtering
- [ ] All tests pass (`pnpm test esrs-to-gs1-mapper.test.ts`)

### Documentation

- [ ] `README.md` explains the mapping library purpose and usage
- [ ] `README.md` includes examples of how to add new mapping rules
- [ ] Inline comments explain complex logic

---

## Deliverables

When complete, provide:

1. **Source code files:**
   - `/server/mappings/esrs-to-gs1-mapper.ts`
   - `/server/mappings/esrs-gs1-mapping-data.ts`

2. **Test file:**
   - `/server/mappings/esrs-to-gs1-mapper.test.ts`

3. **Documentation:**
   - `/server/mappings/README.md`

4. **Notes:**
   - Any assumptions you made
   - Suggestions for future improvements
   - Known limitations or edge cases

---

## Future Extensions (Out of Scope)

These are NOT required for this task but may be added later:

- Database-backed mapping rules (instead of static file)
- Machine learning-based confidence scoring
- Multi-language support for attribute names
- Integration with external GS1 APIs for attribute validation

---

## Questions?

If anything in this spec is unclear:

1. Document your assumptions in delivery notes
2. Implement conservatively (choose the safest interpretation)
3. Flag ambiguities so Manus can clarify the spec for future tasks

---

**Created:** December 11, 2025  
**Spec Version:** 1.0  
**Changelog Version:** 1.0 (see `/docs/CHANGELOG_FOR_CHATGPT.md`)
