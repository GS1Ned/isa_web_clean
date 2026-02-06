# CGPT-05: Digital Link URL Builder/Validator

**Task ID:** CGPT-05  
**Priority:** ⭐ LOW  
**Risk Level:** Low  
**Estimated Effort:** 4-6 hours  
**Dependencies:** None  
**Status:** Ready

---

## Context

### ISA Mission

ISA enables Digital Product Passport (DPP) compliance by helping companies generate GS1 Digital Link URIs. These URIs encode product identifiers (GTIN, batch, serial) into web-friendly URLs that can be embedded in QR codes for product traceability.

### Relevant Subsystem

This task creates a **pure TypeScript utility library** in `/server/utils/` for constructing and validating GS1 Digital Link URIs according to the official GS1 specification.

### Key Files in Repo

- `/server/utils/` - Utility functions
- `/shared/types/` - (Future) Shared TypeScript interfaces
- `/docs/ISA_ESG_GS1_CANONICAL_MODEL.md` - ESG integration strategy

---

## Exact Task

### Goal

Implement **two pure TypeScript functions**:

1. `buildDigitalLinkURI` - Constructs a GS1 Digital Link URI from product identifiers
2. `validateDigitalLinkURI` - Validates a URI against GS1 Digital Link specification

### How It Will Be Used

**Backend Integration:**

```typescript
// In server/routers/dpp.ts
import {
  buildDigitalLinkURI,
  validateDigitalLinkURI,
} from "../utils/digital-link";

const generateDPP = protectedProcedure
  .input(z.object({ gtin: z.string(), batch: z.string().optional() }))
  .mutation(async ({ input }) => {
    const uri = buildDigitalLinkURI({
      domain: "example.com",
      gtin: input.gtin,
      qualifiers: input.batch ? { batch: input.batch } : undefined,
    });

    // Generate QR code with this URI
    return { dppUri: uri };
  });
```

---

## Technical Specification

### 1. File Structure

**Create these files:**

```
/server/utils/
├── digital-link.ts              # Main utility functions
├── digital-link.test.ts         # Unit tests
└── digital-link-constants.ts    # GS1 AI codes and validation rules
```

### 2. Core Function Signatures

**File:** `/server/utils/digital-link.ts`

```typescript
/**
 * Builds a GS1 Digital Link URI from product identifiers
 *
 * @param params - Digital Link parameters
 * @returns Valid GS1 Digital Link URI
 * @throws Error if parameters are invalid
 *
 * @example
 * const uri = buildDigitalLinkURI({
 *   domain: "id.gs1.org",
 *   gtin: "09506000134352",
 *   qualifiers: { batch: "ABC123", serial: "12345" },
 *   linkType: "https://gs1.org/voc/certificationInfo"
 * });
 * // Returns: "https://id.gs1.org/01/09506000134352/10/ABC123/21/12345?linkType=https://gs1.org/voc/certificationInfo"
 */
export function buildDigitalLinkURI(params: DigitalLinkParams): string;

/**
 * Validates a GS1 Digital Link URI
 *
 * @param uri - URI to validate
 * @returns Validation result with parsed components or error details
 *
 * @example
 * const result = validateDigitalLinkURI("https://id.gs1.org/01/09506000134352");
 * if (result.valid) {
 *   console.log("GTIN:", result.components.gtin);
 * } else {
 *   console.error("Errors:", result.errors);
 * }
 */
export function validateDigitalLinkURI(uri: string): ValidationResult;

export interface DigitalLinkParams {
  /** Domain name (e.g., "id.gs1.org" or custom domain) */
  domain: string;
  /** Global Trade Item Number (GTIN-8, GTIN-12, GTIN-13, or GTIN-14) */
  gtin: string;
  /** Optional qualifiers (batch, serial, expiry, etc.) */
  qualifiers?: {
    batch?: string; // AI 10
    serial?: string; // AI 21
    expiry?: string; // AI 17 (YYMMDD format)
    lotNumber?: string; // AI 10 (alias for batch)
  };
  /** Optional link type (URL to resource type) */
  linkType?: string;
  /** Use HTTPS (default: true) */
  useHttps?: boolean;
}

export interface ValidationResult {
  /** Whether URI is valid */
  valid: boolean;
  /** Parsed components (if valid) */
  components?: {
    domain: string;
    gtin: string;
    qualifiers?: Record<string, string>;
    linkType?: string;
  };
  /** Validation errors (if invalid) */
  errors?: string[];
}
```

### 3. GS1 Application Identifier (AI) Mapping

**File:** `/server/utils/digital-link-constants.ts`

```typescript
/**
 * GS1 Application Identifiers (AIs) used in Digital Link
 * Format: AI code -> { name, path segment, validation regex }
 */
export const GS1_AI_CODES = {
  "01": {
    name: "GTIN",
    pathSegment: "01",
    regex: /^\d{8}$|^\d{12,14}$/,
    description: "Global Trade Item Number",
  },
  "10": {
    name: "BATCH/LOT",
    pathSegment: "10",
    regex: /^[\x21-\x22\x25-\x2F\x30-\x39\x41-\x5A\x5F\x61-\x7A]{1,20}$/,
    description: "Batch or lot number",
  },
  "21": {
    name: "SERIAL",
    pathSegment: "21",
    regex: /^[\x21-\x22\x25-\x2F\x30-\x39\x41-\x5A\x5F\x61-\x7A]{1,20}$/,
    description: "Serial number",
  },
  "17": {
    name: "EXPIRY",
    pathSegment: "17",
    regex: /^\d{6}$/,
    description: "Expiration date (YYMMDD)",
  },
} as const;
```

### 4. Implementation Logic

**Building Digital Link URI:**

1. **Validate inputs:**
   - GTIN must be 8, 12, 13, or 14 digits
   - GTIN must pass check digit validation
   - Qualifiers must match their respective regex patterns
   - Domain must be valid (no protocol prefix)

2. **Construct path:**
   - Start with protocol (`https://` or `http://`)
   - Add domain
   - Add `/01/{gtin}` (GTIN is always first)
   - Add qualifiers in order: `/10/{batch}/21/{serial}/17/{expiry}`

3. **Add query parameters:**
   - If `linkType` provided, add as `?linkType={value}`

**Validating Digital Link URI:**

1. **Parse URI:**
   - Extract protocol, domain, path, query params
   - Split path into segments

2. **Validate structure:**
   - Must start with `https://` or `http://`
   - Must have `/01/{gtin}` as first path segment
   - Qualifiers must follow correct order

3. **Validate components:**
   - GTIN must pass check digit validation
   - Each qualifier must match its AI regex
   - Query params must be valid URLs (if present)

4. **Return result:**
   - If valid: return parsed components
   - If invalid: return list of error messages

### 5. GTIN Check Digit Validation

**Algorithm:**

```typescript
function validateGTINCheckDigit(gtin: string): boolean {
  // Pad to 14 digits (GTIN-14 format)
  const paddedGTIN = gtin.padStart(14, "0");

  // Calculate check digit
  let sum = 0;
  for (let i = 0; i < 13; i++) {
    const digit = parseInt(paddedGTIN[i]);
    sum += digit * (i % 2 === 0 ? 3 : 1);
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  const providedCheckDigit = parseInt(paddedGTIN[13]);

  return checkDigit === providedCheckDigit;
}
```

### 6. Example Inputs and Outputs

**Example 1: Basic GTIN**

```typescript
const uri = buildDigitalLinkURI({
  domain: "id.gs1.org",
  gtin: "09506000134352",
});
// Returns: "https://id.gs1.org/01/09506000134352"
```

**Example 2: GTIN with Batch and Serial**

```typescript
const uri = buildDigitalLinkURI({
  domain: "example.com",
  gtin: "09506000134352",
  qualifiers: {
    batch: "ABC123",
    serial: "XYZ789",
  },
});
// Returns: "https://example.com/01/09506000134352/10/ABC123/21/XYZ789"
```

**Example 3: With Link Type**

```typescript
const uri = buildDigitalLinkURI({
  domain: "id.gs1.org",
  gtin: "09506000134352",
  linkType: "https://gs1.org/voc/certificationInfo",
});
// Returns: "https://id.gs1.org/01/09506000134352?linkType=https://gs1.org/voc/certificationInfo"
```

**Example 4: Validation - Valid URI**

```typescript
const result = validateDigitalLinkURI(
  "https://id.gs1.org/01/09506000134352/10/ABC123"
);
// Returns:
// {
//   valid: true,
//   components: {
//     domain: "id.gs1.org",
//     gtin: "09506000134352",
//     qualifiers: { batch: "ABC123" }
//   }
// }
```

**Example 5: Validation - Invalid GTIN**

```typescript
const result = validateDigitalLinkURI("https://id.gs1.org/01/12345");
// Returns:
// {
//   valid: false,
//   errors: ["Invalid GTIN length: must be 8, 12, 13, or 14 digits"]
// }
```

---

## Constraints and Conventions

### Coding Standards

- **TypeScript strict mode** - All code must pass `tsc --noEmit`
- **Pure functions** - No side effects, no external dependencies
- **Immutable data** - Don't modify input objects
- **Error handling** - Throw descriptive errors for invalid inputs

### GS1 Specification Compliance

- Follow GS1 Digital Link URI Syntax v1.2 specification
- Support GTIN-8, GTIN-12, GTIN-13, GTIN-14
- Validate check digits using GS1 algorithm
- Support standard qualifiers (batch, serial, expiry)

### Performance

- Functions should execute in <10ms for typical inputs
- No external API calls or network requests
- Use efficient string manipulation

---

## Dependency Assumptions

### What Manus Guarantees

**No External Dependencies:**

- Use only built-in TypeScript/Node.js features
- No npm packages required

**Stable Interfaces:**

- Function signatures won't change during implementation

### What You Must NOT Change

- Do NOT add new npm dependencies
- Do NOT create database tables or migrations
- Do NOT make API calls to external services

---

## Acceptance Criteria

### Code Quality

- [ ] TypeScript compiles without errors
- [ ] All functions have JSDoc comments
- [ ] No hardcoded credentials or secrets
- [ ] Code follows project conventions

### Functionality

- [ ] `buildDigitalLinkURI` constructs valid URIs
- [ ] GTIN check digit validation works correctly
- [ ] Qualifiers are added in correct order
- [ ] `validateDigitalLinkURI` correctly validates URIs
- [ ] Validation returns helpful error messages
- [ ] Invalid inputs throw descriptive errors

### Testing

- [ ] Unit tests cover all major code paths
- [ ] Tests include examples from this spec
- [ ] Tests verify GTIN check digit algorithm
- [ ] Tests verify qualifier validation
- [ ] All tests pass (`pnpm test digital-link.test.ts`)

---

## Deliverables

When complete, provide:

1. **Source code files:**
   - `/server/utils/digital-link.ts`
   - `/server/utils/digital-link-constants.ts`

2. **Test file:**
   - `/server/utils/digital-link.test.ts`

3. **Notes:**
   - Any assumptions made
   - Suggestions for future improvements
   - Known limitations

---

## Future Extensions (Out of Scope)

These are NOT required:

- QR code generation (separate library)
- Support for all 100+ GS1 AIs (only common ones needed)
- URL shortening or compression
- Integration with GS1 Resolver API

---

## Questions?

If anything is unclear:

1. Document your assumptions in delivery notes
2. Implement conservatively
3. Flag ambiguities for future spec improvements

---

**Created:** December 11, 2025  
**Spec Version:** 1.0  
**Changelog Version:** 1.0 (see `/docs/CHANGELOG_FOR_CHATGPT.md`)
