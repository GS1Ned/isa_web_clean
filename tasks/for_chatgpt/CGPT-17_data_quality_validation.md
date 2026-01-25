# CGPT-17: Data Quality Validation Library

**Priority:** MEDIUM  
**Complexity:** MEDIUM  
**Estimated Effort:** 8-10 hours  
**Dependencies:** None  
**Risk Level:** LOW

---

## Context

ISA helps companies map regulations to GS1 standards, but data quality is critical for compliance. Companies need to validate that their product data meets GS1 format requirements before submitting to GDSN or generating DPPs.

This task creates a validation library that checks common GS1 data fields (GTIN, GLN, dates, measurements) against official GS1 specifications. The library will be used in ISA's DPP generator and data import features.

---

## Environment Context

**React Version:** 19.2.0 (requires explicit `import React from "react"` in all .tsx files)  
**TypeScript:** 5.x (strict mode enabled)  
**Testing:** Vitest (already installed)  
**No UI needed** - Pure TypeScript library

**Already Installed Dependencies:**
- date-fns (for date validation)
- zod (for schema validation)

**NOT Installed:**
- No additional dependencies needed

---

## Exact Task

Create a TypeScript validation library (`/shared/data-quality-validators.ts`) that validates common GS1 data fields according to official specifications. Include validators, error messages, comprehensive tests, and documentation.

---

## Technical Specification

### Files to Create

1. **`/shared/data-quality-validators.ts`** - Main validation functions
2. **`/shared/data-quality-types.ts`** - TypeScript types
3. **`/shared/data-quality-validators.test.ts`** - Unit tests
4. **`/docs/DATA_QUALITY_GUIDE.md`** - Validation rules documentation

### API / Interface

```typescript
// data-quality-types.ts

export interface ValidationResult {
  valid: boolean;
  errors?: ValidationError[];
  warnings?: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  code: string;
  message: string;
  value?: any;
}

export interface ValidationWarning {
  field: string;
  code: string;
  message: string;
  suggestion?: string;
}

// data-quality-validators.ts

/**
 * Validates a GTIN (Global Trade Item Number)
 * Supports GTIN-8, GTIN-12, GTIN-13, GTIN-14
 */
export function validateGTIN(gtin: string): ValidationResult;

/**
 * Validates a GLN (Global Location Number)
 * 13-digit identifier for locations
 */
export function validateGLN(gln: string): ValidationResult;

/**
 * Validates a batch/lot number
 * Alphanumeric, 1-20 characters, GS1 AI 10
 */
export function validateBatchNumber(batch: string): ValidationResult;

/**
 * Validates a serial number
 * Alphanumeric, 1-20 characters, GS1 AI 21
 */
export function validateSerialNumber(serial: string): ValidationResult;

/**
 * Validates a date in GS1 format (YYMMDD)
 * Used for expiry, best before, production dates
 */
export function validateGS1Date(date: string): ValidationResult;

/**
 * Validates net content (weight/volume)
 * Format: number + unit (e.g., "250 g", "1.5 L")
 */
export function validateNetContent(content: string): ValidationResult;

/**
 * Validates a product description
 * 1-200 characters, no special formatting
 */
export function validateProductDescription(description: string): ValidationResult;

/**
 * Validates multiple fields at once
 * Returns aggregated results
 */
export function validateProductData(data: Record<string, any>): ValidationResult;
```

### Implementation Requirements

- [ ] GTIN validation with check digit algorithm
- [ ] GLN validation with check digit algorithm
- [ ] Batch/serial number format validation
- [ ] GS1 date format validation (YYMMDD)
- [ ] Net content parsing and validation
- [ ] Product description length and character validation
- [ ] Clear error messages with fix suggestions
- [ ] Warning messages for non-critical issues
- [ ] 15+ test cases covering edge cases

### Example Usage

```typescript
import { validateGTIN, validateBatchNumber, validateProductData } from "@shared/data-quality-validators";

// Validate a GTIN
const gtinResult = validateGTIN("09506000134352");
if (!gtinResult.valid) {
  console.error(gtinResult.errors);
}
// Returns: { valid: true }

// Validate a batch number
const batchResult = validateBatchNumber("ABC-123");
// Returns: { valid: false, errors: [{ code: "INVALID_CHARS", message: "Batch number contains invalid character: '-'" }] }

// Validate multiple fields
const productResult = validateProductData({
  gtin: "09506000134352",
  batchNumber: "ABC123",
  expiryDate: "251231",
  netContent: "250 g",
});
// Returns: { valid: true } or aggregated errors
```

---

## Validation Rules

### GTIN Validation

- **Length:** 8, 12, 13, or 14 digits
- **Format:** Numeric only
- **Check digit:** Must pass GS1 algorithm
- **Errors:**
  - `INVALID_LENGTH`: "GTIN must be 8, 12, 13, or 14 digits"
  - `INVALID_FORMAT`: "GTIN must contain only digits"
  - `INVALID_CHECK_DIGIT`: "GTIN check digit is incorrect"

### GLN Validation

- **Length:** 13 digits
- **Format:** Numeric only
- **Check digit:** Must pass GS1 algorithm
- **Errors:**
  - `INVALID_LENGTH`: "GLN must be exactly 13 digits"
  - `INVALID_FORMAT`: "GLN must contain only digits"
  - `INVALID_CHECK_DIGIT`: "GLN check digit is incorrect"

### Batch/Serial Number Validation

- **Length:** 1-20 characters
- **Format:** Alphanumeric + allowed special chars (! " % & ' ( ) * + , - . / : ; < = > ? _ space)
- **Errors:**
  - `EMPTY`: "Batch/serial number cannot be empty"
  - `TOO_LONG`: "Batch/serial number exceeds 20 characters"
  - `INVALID_CHARS`: "Contains invalid character: [char]"

### GS1 Date Validation

- **Format:** YYMMDD (6 digits)
- **Range:** Valid calendar date
- **Errors:**
  - `INVALID_FORMAT`: "Date must be in YYMMDD format"
  - `INVALID_DATE`: "Date is not a valid calendar date"
  - `DATE_IN_PAST`: "Expiry date is in the past" (warning, not error)

### Net Content Validation

- **Format:** `<number> <unit>` (e.g., "250 g", "1.5 L")
- **Units:** g, kg, mg, L, mL, oz, lb
- **Errors:**
  - `INVALID_FORMAT`: "Net content must be '<number> <unit>'"
  - `INVALID_NUMBER`: "Quantity must be a positive number"
  - `INVALID_UNIT`: "Unit must be one of: g, kg, mg, L, mL, oz, lb"

### Product Description Validation

- **Length:** 1-200 characters
- **Format:** Plain text, no HTML/markdown
- **Warnings:**
  - `TOO_SHORT`: "Description is very short, consider adding more detail" (< 10 chars)
  - `SPECIAL_CHARS`: "Description contains special characters that may not display correctly"

---

## Constraints and Conventions

### Code Style

- Use TypeScript strict mode
- Follow existing naming conventions (camelCase for functions)
- Add JSDoc comments for all exported functions
- Use `const` over `let` where possible
- Leverage zod for schema validation where appropriate

### Testing

- Write unit tests with Vitest
- Test valid inputs (happy path)
- Test invalid inputs (error cases)
- Test edge cases (boundary conditions)
- Test check digit algorithms with known values
- Aim for >90% coverage

### Error Messages

- Be specific about what's wrong
- Suggest how to fix the issue
- Use consistent error codes
- Distinguish errors (blocking) from warnings (non-blocking)

---

## Acceptance Criteria

- [ ] All 4 files created as specified
- [ ] TypeScript compiles without errors
- [ ] Tests pass with >90% coverage
- [ ] GTIN/GLN check digit validation works correctly
- [ ] All validation rules implemented
- [ ] Error messages are clear and actionable
- [ ] Documentation is complete
- [ ] No external dependencies beyond date-fns and zod

---

## Pre-Delivery Checklist

Before submitting your work, verify:

- [ ] All files include necessary imports
- [ ] No dependencies used beyond date-fns and zod
- [ ] TypeScript compiles: `tsc --noEmit`
- [ ] Tests run: `vitest run data-quality-validators.test.ts`
- [ ] Check digit algorithms tested with known GTINs/GLNs
- [ ] Documentation includes examples

---

## Related Files

Reference these existing files for patterns:

- `/shared/digital-link-utils.ts` - Similar validation patterns (CGPT-05)
- `/server/mappings/esrs-to-gs1-mapper.test.ts` - Test structure example
- `/shared/gs1-link-types.ts` - GS1 type definitions

---

## Notes

### GS1 Check Digit Algorithm

Same algorithm for GTIN and GLN:

```
1. Sum odd-position digits (from right, excluding check digit) × 3
2. Sum even-position digits (from right, excluding check digit) × 1
3. Add sums together
4. Subtract from nearest equal or higher multiple of 10
5. Result is check digit
```

### Allowed Characters for Batch/Serial

GS1 AI 10 and 21 allow these characters:
- Letters: A-Z, a-z
- Digits: 0-9
- Special: ! " % & ' ( ) * + , - . / : ; < = > ? _ space

### Date Format Examples

- `251231` = December 31, 2025
- `260101` = January 1, 2026
- `991231` = December 31, 2099 (Y2K-style, assume 20xx)

### Net Content Units

Common units:
- **Weight:** g (gram), kg (kilogram), mg (milligram), oz (ounce), lb (pound)
- **Volume:** L (liter), mL (milliliter), fl oz (fluid ounce)

---

**Focus on correctness and helpful error messages. This library will be used by real companies to validate their data.**
