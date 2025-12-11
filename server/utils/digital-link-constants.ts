/**
 * GS1 Digital Link / Application Identifier constants
 *
 * This module defines the subset of Application Identifiers (AIs) and rules
 * that ISA needs for building and validating Digital Link URIs.
 *
 * The focus is on identifiers commonly used for Digital Product Passports:
 * - 01: GTIN
 * - 10: Batch / lot
 * - 17: Expiration date (YYMMDD)
 * - 21: Serial number
 */

export type AIFormat = "numeric" | "alphanumeric" | "date";

/**
 * Specification for a GS1 Application Identifier.
 */
export interface ApplicationIdentifierSpec {
  /** Application Identifier, e.g. "01" for GTIN */
  ai: string;
  /** Short human-readable description */
  description: string;
  /** Minimum data length in characters */
  minLength: number;
  /** Maximum data length in characters */
  maxLength: number;
  /** Whether the data has fixed length (minLength === maxLength) */
  fixedLength?: boolean;
  /** Expected data format */
  format: AIFormat;
}

/**
 * Subset of Application Identifiers commonly used in ISA.
 *
 * NOTE: This is intentionally conservative. Additional AIs can be added later
 * without changing the public API of the Digital Link utility.
 */
export const APPLICATION_IDENTIFIER_SPECS: Record<string, ApplicationIdentifierSpec> = {
  // 01 – GTIN
  "01": {
    ai: "01",
    description: "Global Trade Item Number (GTIN)",
    minLength: 14,
    maxLength: 14,
    fixedLength: true,
    format: "numeric",
  },

  // 10 – Batch or lot number
  "10": {
    ai: "10",
    description: "Batch or lot number",
    minLength: 1,
    maxLength: 20,
    format: "alphanumeric",
  },

  // 17 – Expiration date
  "17": {
    ai: "17",
    description: "Expiration date (YYMMDD)",
    minLength: 6,
    maxLength: 6,
    fixedLength: true,
    format: "date",
  },

  // 21 – Serial number
  "21": {
    ai: "21",
    description: "Serial number",
    minLength: 1,
    maxLength: 20,
    format: "alphanumeric",
  },
};

/**
 * Primary identifiers used for ISA Digital Link URIs.
 *
 * For this implementation we only support GTIN-based URIs (AI 01).
 */
export const PRIMARY_IDENTIFIER_AIS = {
  gtin: "01",
} as const;

/**
 * Mapping from friendly qualifier keys (used in builder API) to AIs.
 *
 * This allows `buildDigitalLinkURI` to accept readable keys:
 * - batch → 10
 * - serial → 21
 * - expirationDate → 17
 */
export const QUALIFIER_KEY_TO_AI: Record<string, string> = {
  batch: "10",
  lot: "10",
  batchOrLot: "10",

  serial: "21",
  serialNumber: "21",

  expirationDate: "17",
  expiry: "17",
  expiryDate: "17",
};

/**
 * Default scheme for Digital Link URIs when the caller omits it.
 */
export const DIGITAL_LINK_DEFAULT_SCHEME = "https";

/**
 * Recommended ordering of AIs in the path.
 *
 * 1. Primary identifier (01)
 * 2. Serial number (21)
 * 3. Batch / lot (10)
 * 4. Expiration date (17)
 *
 * Any unknown AIs are appended in ascending numeric order.
 */
export const PATH_AI_ORDER: string[] = ["01", "21", "10", "17"];

/**
 * Character classes for validation.
 */

/**
 * Alphanumeric characters allowed in most GS1 attributes when URL-encoded.
 * This is conservative compared to the full GS1 character set but sufficient
 * for typical ISA use cases.
 */
export const ALPHANUMERIC_VALUE_REGEX = /^[A-Za-z0-9\-_.+\/]*$/;

/**
 * Numeric-only characters.
 */
export const NUMERIC_VALUE_REGEX = /^[0-9]+$/;


