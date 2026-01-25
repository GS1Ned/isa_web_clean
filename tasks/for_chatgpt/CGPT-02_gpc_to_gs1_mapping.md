# CGPT-02: GPC-to-GS1 Attribute Mapping Engine

**Priority:** HIGH  
**Complexity:** MEDIUM  
**Estimated Effort:** 10-14 hours  
**Dependencies:** None  
**Risk Level:** LOW

---

## Context

GS1 Global Product Classification (GPC) is a hierarchical system for categorizing products (e.g., "Dairy Products > Cheese > Cheddar Cheese"). ISA needs to map GPC categories to relevant GS1 attributes to help companies understand which product data fields are required for their specific product types.

This task is similar to CGPT-01 (ESRS-to-GS1 mapping) but focuses on product categorization instead of sustainability standards. The mapping engine will power ISA's product onboarding wizard and DPP template generator.

---

## Environment Context

**React Version:** 19.2.0 (requires explicit `import React from "react"` in all .tsx files)  
**TypeScript:** 5.x (strict mode enabled)  
**Testing:** Vitest (already installed)  
**No UI needed** - Pure TypeScript library

**Already Installed Dependencies:**
- None needed

**NOT Installed:**
- No external dependencies needed

---

## Exact Task

Create a TypeScript mapping library (`/server/mappings/gpc-to-gs1-mapper.ts`) that maps GPC product categories to recommended GS1 attributes. Include mapping data, query functions, comprehensive tests, and documentation.

---

## Technical Specification

### Files to Create

1. **`/server/mappings/gpc-to-gs1-mapper.ts`** - Main mapping functions
2. **`/server/mappings/gpc-gs1-mapping-data.ts`** - Mapping rules data
3. **`/server/mappings/gpc-to-gs1-mapper.test.ts`** - Unit tests
4. **`/server/mappings/GPC_MAPPING_README.md`** - Documentation

### API / Interface

```typescript
// gpc-to-gs1-mapper.ts

export interface GPCCategory {
  code: string; // e.g., "10000123"
  name: string; // e.g., "Dairy Products / Cheese / Cheddar"
  level: number; // 1 (segment), 2 (family), 3 (class), 4 (brick)
}

export interface GS1AttributeRecommendation {
  attributeId: string; // e.g., "netContent"
  attributeName: string;
  standard: string; // "GPC" | "GDSN" | "DPP"
  priority: "required" | "recommended" | "optional";
  reason: string; // Why this attribute is needed for this category
  exampleValue?: string;
}

export interface MappingOptions {
  includeOptional?: boolean; // Include optional attributes (default: false)
  filterByStandard?: string; // Only return attributes from specific standard
  maxAttributes?: number; // Limit number of results
}

/**
 * Maps GPC categories to recommended GS1 attributes
 * @param gpcCodes - Array of GPC category codes
 * @param options - Mapping options
 * @returns Map of GPC code to recommended attributes
 */
export function mapGPCToGS1Attributes(
  gpcCodes: string[],
  options?: MappingOptions
): Record<string, GS1AttributeRecommendation[]>;

/**
 * Gets all attributes for a specific GPC category
 * @param gpcCode - GPC category code
 * @param options - Mapping options
 * @returns Array of recommended attributes
 */
export function getAttributesForGPC(
  gpcCode: string,
  options?: MappingOptions
): GS1AttributeRecommendation[];

/**
 * Finds GPC categories that require a specific GS1 attribute
 * @param attributeId - GS1 attribute ID
 * @returns Array of GPC categories
 */
export function findGPCsRequiringAttribute(
  attributeId: string
): GPCCategory[];
```

### Mapping Data Structure

```typescript
// gpc-gs1-mapping-data.ts

export interface GPCMappingRule {
  gpcCode: string;
  gpcName: string;
  gpcLevel: number;
  attributes: Array<{
    attributeId: string;
    attributeName: string;
    standard: string;
    priority: "required" | "recommended" | "optional";
    reason: string;
    exampleValue?: string;
  }>;
}

export const GPC_MAPPING_RULES: GPCMappingRule[] = [
  {
    gpcCode: "10000123",
    gpcName: "Dairy Products / Cheese / Cheddar",
    gpcLevel: 4,
    attributes: [
      {
        attributeId: "netContent",
        attributeName: "Net Content",
        standard: "GDSN",
        priority: "required",
        reason: "Required for consumer information and regulatory compliance",
        exampleValue: "250 g",
      },
      {
        attributeId: "storageTemperature",
        attributeName: "Storage Temperature",
        standard: "GDSN",
        priority: "required",
        reason: "Critical for food safety and quality",
        exampleValue: "2-8°C",
      },
      // ... more attributes
    ],
  },
  // ... 15-20 more mapping rules
];
```

### Implementation Requirements

- [ ] Create 15-20 mapping rules covering major GPC categories:
  - Food & Beverage (dairy, meat, produce)
  - Apparel & Textiles (clothing, footwear)
  - Electronics (consumer electronics, batteries)
  - Healthcare (pharmaceuticals, medical devices)
- [ ] Support GPC hierarchy (segment > family > class > brick)
- [ ] Inherit attributes from parent categories
- [ ] Filter by priority (required/recommended/optional)
- [ ] Filter by standard (GPC/GDSN/DPP)
- [ ] Provide clear reasoning for each attribute
- [ ] Include realistic example values
- [ ] Write 10+ test cases

### Example Usage

```typescript
import { mapGPCToGS1Attributes, getAttributesForGPC } from "./gpc-to-gs1-mapper";

// Get attributes for a cheese product
const attrs = getAttributesForGPC("10000123", {
  includeOptional: false,
});
// Returns: [
//   { attributeId: "netContent", priority: "required", ... },
//   { attributeId: "storageTemperature", priority: "required", ... },
//   ...
// ]

// Map multiple GPC codes
const mappings = mapGPCToGS1Attributes(
  ["10000123", "10000456"],
  { filterByStandard: "GDSN" }
);
// Returns: { "10000123": [...], "10000456": [...] }
```

---

## Constraints and Conventions

### Code Style

- Use TypeScript strict mode
- Follow existing naming conventions (camelCase for functions)
- Add JSDoc comments for all exported functions
- Use `const` over `let` where possible
- No external dependencies

### Testing

- Write unit tests with Vitest
- Test happy path + error cases
- Test hierarchy inheritance
- Test filtering options
- Aim for >80% coverage

### Documentation

- Include GPC_MAPPING_README.md with:
  - Overview of GPC system
  - Function reference with examples
  - How to add new mapping rules
  - Common use cases

---

## Acceptance Criteria

- [ ] All 4 files created as specified
- [ ] TypeScript compiles without errors
- [ ] Tests pass with >80% coverage
- [ ] 15-20 mapping rules implemented
- [ ] Hierarchy inheritance works correctly
- [ ] Documentation is complete
- [ ] No external dependencies

---

## Pre-Delivery Checklist

Before submitting your work, verify:

- [ ] All files include necessary imports
- [ ] No dependencies used
- [ ] TypeScript compiles: `tsc --noEmit`
- [ ] Tests run: `vitest run gpc-to-gs1-mapper.test.ts`
- [ ] Mapping rules cover major product categories
- [ ] Documentation includes usage examples

---

## Related Files

Reference these existing files for patterns:

- `/server/mappings/esrs-to-gs1-mapper.ts` - Similar mapping pattern (CGPT-01)
- `/server/mappings/esrs-gs1-mapping-data.ts` - Data structure example
- `/data/esg/common_data_categories.json` - Example category data

---

## Notes

### GPC Hierarchy Levels

1. **Segment** (Level 1): Broadest category (e.g., "Food/Beverage/Tobacco")
2. **Family** (Level 2): Sub-category (e.g., "Dairy Products")
3. **Class** (Level 3): Specific type (e.g., "Cheese")
4. **Brick** (Level 4): Most specific (e.g., "Cheddar Cheese")

### Attribute Inheritance

Child categories should inherit attributes from parents:
- Brick inherits from Class, Family, Segment
- Can override parent attributes if needed
- Can add category-specific attributes

### Priority Guidelines

- **Required:** Legally mandated or critical for product identification
- **Recommended:** Important for consumer information or supply chain
- **Optional:** Nice-to-have, enhances product data quality

### Common GS1 Attributes by Category

**Food Products:**
- netContent, ingredients, allergens, nutritionalInfo, storageTemperature

**Apparel:**
- size, color, material, careInstructions, countryOfOrigin

**Electronics:**
- powerRequirements, batteryType, warrantyInfo, technicalSpecs

**Healthcare:**
- dosageForm, activeIngredients, contraindications, expiryDate

---

**Good luck! This task is similar to CGPT-01 but focuses on product categorization. Follow the same patterns for consistency.**
