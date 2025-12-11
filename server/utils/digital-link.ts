/**
 * Digital Link URL Builder / Validator
 *
 * Core utility functions to:
 * - Build GS1 Digital Link URIs from structured input
 * - Validate existing Digital Link URIs for correctness
 *
 * References:
 * - GS1 Digital Link standard (https://www.gs1.org/standards/gs1-digital-link)
 */

import {
  APPLICATION_IDENTIFIER_SPECS,
  PRIMARY_IDENTIFIER_AIS,
  QUALIFIER_KEY_TO_AI,
  DIGITAL_LINK_DEFAULT_SCHEME,
  PATH_AI_ORDER,
  ALPHANUMERIC_VALUE_REGEX,
  NUMERIC_VALUE_REGEX,
  type AIFormat,
} from "./digital-link-constants";

export type DigitalLinkErrorCode =
  | "INVALID_URI"
  | "MISSING_GTIN"
  | "INVALID_GTIN_LENGTH"
  | "INVALID_GTIN_CHARACTERS"
  | "INVALID_GTIN_CHECK_DIGIT"
  | "UNKNOWN_AI"
  | "INVALID_AI_VALUE";

export interface DigitalLinkError {
  code: DigitalLinkErrorCode;
  message: string;
  ai?: string;
}

export interface ParsedDigitalLink {
  /** Normalised origin including scheme (e.g. https://id.gs1.org) */
  origin: string;
  /** Primary GTIN identifier, normalised to 14 digits (if present and valid) */
  gtin?: string;
  /** Map of AI → raw value as found in the URI path */
  aiSegments: Record<string, string>;
  /** Query parameters as simple key/value pairs */
  queryParams: Record<string, string>;
}

/**
 * Result of Digital Link validation.
 */
export interface DigitalLinkValidationResult {
  valid: boolean;
  errors: DigitalLinkError[];
  parsed?: ParsedDigitalLink;
}

/**
 * Parameters for building a GS1 Digital Link URI.
 *
 * Examples:
 *
 * buildDigitalLinkURI({
 *   domain: "id.gs1.org",
 *   gtin: "09506000134352",
 *   qualifiers: { batch: "ABC123" },
 * });
 */
export interface BuildDigitalLinkParams {
  /**
   * Domain or full origin.
   * Examples:
   * - "id.gs1.org"
   * - "https://id.gs1.org"
   * - "https://resolver.example.com/dpp"
   */
  domain: string;

  /**
   * GTIN value (8/12/13/14 digits). Can contain spaces or leading zeros,
   * the function will normalise and left-pad to 14 digits.
   */
  gtin: string;

  /**
   * Optional qualifiers mapped to AIs:
   * - batch / lot / batchOrLot → AI 10
   * - serial / serialNumber → AI 21
   * - expirationDate / expiry / expiryDate → AI 17
   *
   * Values may be:
   * - string
   * - number (converted to string)
   * - Date (for expirationDate)
   */
  qualifiers?: Record<string, string | number | Date>;

  /**
   * Optional query parameters appended as `?key=value&...`.
   * All values are converted to strings and URI-encoded.
   */
  queryParams?: Record<string, string | number | boolean | undefined>;
}

/**
 * Build a GS1 Digital Link URI using GTIN as primary identifier (AI 01).
 *
 * Example:
 *
 * ```ts
 * const uri = buildDigitalLinkURI({
 *   domain: "id.gs1.org",
 *   gtin: "09506000134352",
 *   qualifiers: { batch: "ABC123" },
 * });
 * // -> "https://id.gs1.org/01/09506000134352/10/ABC123"
 * ```
 */
export function buildDigitalLinkURI(params: BuildDigitalLinkParams): string {
  const { domain, gtin, qualifiers, queryParams } = params;

  const origin = normalizeDomain(domain);

  const gtinResult = validateGTIN(gtin);
  if (!gtinResult.valid || !gtinResult.normalized) {
    throw new Error(gtinResult.errors[0]?.message ?? "Invalid GTIN");
  }

  const primaryAI = PRIMARY_IDENTIFIER_AIS.gtin;
  const segments: Array<{ ai: string; value: string }> = [
    { ai: primaryAI, value: gtinResult.normalized },
  ];

  if (qualifiers) {
    const qualifierSegments = buildQualifierSegments(qualifiers);
    for (const segment of qualifierSegments) {
      segments.push(segment);
    }
  }

  const orderedSegments = orderSegments(segments);

  const pathParts: string[] = [];
  for (const segment of orderedSegments) {
    pathParts.push(segment.ai, segment.value);
  }

  const path = pathParts.length ? `/${pathParts.join("/")}` : "";

  const queryString = buildQueryString(queryParams);

  return `${origin}${path}${queryString}`;
}

/**
 * Validate a GS1 Digital Link URI.
 *
 * - Checks URI structure
 * - Extracts Application Identifier segments
 * - Validates GTIN length, characters and check digit
 * - Validates AI-specific value constraints (length, character set)
 */
export function validateDigitalLinkURI(uri: string): DigitalLinkValidationResult {
  const errors: DigitalLinkError[] = [];

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(uri);
  } catch {
    errors.push({
      code: "INVALID_URI",
      message: "The provided string is not a valid absolute URI.",
    });
    return { valid: false, errors };
  }

  const origin = `${parsedUrl.protocol}//${parsedUrl.host}`;
  const segments = parsedUrl.pathname.split("/").filter((s) => s.length > 0);

  const aiSegments: Record<string, string> = {};
  let primaryGTIN: string | undefined;

  for (let i = 0; i < segments.length; i += 2) {
    const ai = segments[i];
    const value = segments[i + 1];

    if (!ai || !value) {
      break;
    }

    aiSegments[ai] = value;

    const aiSpec = APPLICATION_IDENTIFIER_SPECS[ai];

    if (!aiSpec) {
      errors.push({
        code: "UNKNOWN_AI",
        message: `Unknown or unsupported Application Identifier: ${ai}`,
        ai,
      });
      continue;
    }

    // Character set validation
    if (aiSpec.format === "numeric" && !NUMERIC_VALUE_REGEX.test(value)) {
      errors.push({
        code: "INVALID_AI_VALUE",
        message: `AI ${ai} expects numeric value, got "${value}".`,
        ai,
      });
    } else if (aiSpec.format === "alphanumeric" && !ALPHANUMERIC_VALUE_REGEX.test(value)) {
      errors.push({
        code: "INVALID_AI_VALUE",
        message: `AI ${ai} expects alphanumeric value, got "${value}".`,
        ai,
      });
    }

    // Length validation
    if (value.length < aiSpec.minLength || value.length > aiSpec.maxLength) {
      errors.push({
        code: "INVALID_AI_VALUE",
        message: `AI ${ai} value length must be between ${aiSpec.minLength} and ${aiSpec.maxLength}, got length ${value.length}.`,
        ai,
      });
    }

    // Fixed-length validation
    if (aiSpec.fixedLength && value.length !== aiSpec.minLength) {
      errors.push({
        code: "INVALID_AI_VALUE",
        message: `AI ${ai} value must be exactly ${aiSpec.minLength} characters, got length ${value.length}.`,
        ai,
      });
    }

    // GTIN-specific validation
    if (ai === PRIMARY_IDENTIFIER_AIS.gtin) {
      const gtinValidation = validateGTIN(value);
      if (!gtinValidation.valid) {
        for (const err of gtinValidation.errors) {
          errors.push({
            code: err.code,
            message: err.message,
            ai,
          });
        }
      } else {
        primaryGTIN = gtinValidation.normalized;
      }
    }
  }

  if (!primaryGTIN) {
    errors.push({
      code: "MISSING_GTIN",
      message: "Digital Link URI does not contain a valid GTIN (AI 01).",
    });
  }

  const queryParams: Record<string, string> = {};
  parsedUrl.searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  const validationResult: DigitalLinkValidationResult = {
    valid: errors.length === 0,
    errors,
    parsed: {
      origin,
      gtin: primaryGTIN,
      aiSegments,
      queryParams,
    },
  };

  return validationResult;
}

/**
 * Validation result for a GTIN.
 */
export interface GTINValidationResult {
  valid: boolean;
  normalized?: string;
  errors: Array<{
    code: Extract<
      DigitalLinkErrorCode,
      "INVALID_GTIN_LENGTH" | "INVALID_GTIN_CHARACTERS" | "INVALID_GTIN_CHECK_DIGIT"
    >;
    message: string;
  }>;
}

/**
 * Validate a GTIN (8/12/13/14 digits).
 *
 * - Removes non-digit characters before validation
 * - Verifies length
 * - Verifies check digit using GS1 modulo 10 algorithm
 * - Normalises to 14 digits (left-padded with zeros) when valid
 */
export function validateGTIN(gtin: string): GTINValidationResult {
  const errors: GTINValidationResult["errors"] = [];

  const digits = (gtin ?? "").replace(/[^0-9]/g, "");

  if (!digits.length) {
    errors.push({
      code: "INVALID_GTIN_LENGTH",
      message: "GTIN must contain digits.",
    });
    return { valid: false, errors };
  }

  if (![8, 12, 13, 14].includes(digits.length)) {
    errors.push({
      code: "INVALID_GTIN_LENGTH",
      message: `GTIN length must be 8, 12, 13, or 14 digits, got ${digits.length}.`,
    });
    return { valid: false, errors };
  }

  if (!NUMERIC_VALUE_REGEX.test(digits)) {
    errors.push({
      code: "INVALID_GTIN_CHARACTERS",
      message: "GTIN may only contain numeric digits.",
    });
    return { valid: false, errors };
  }

  const body = digits.slice(0, -1);
  const checkDigit = digits.slice(-1);
  const expectedCheckDigit = computeGTINCheckDigit(body);

  if (checkDigit !== expectedCheckDigit) {
    errors.push({
      code: "INVALID_GTIN_CHECK_DIGIT",
      message: `GTIN check digit mismatch: expected ${expectedCheckDigit}, got ${checkDigit}.`,
    });
    return { valid: false, errors };
  }

  const normalized = digits.padStart(14, "0");

  return {
    valid: true,
    normalized,
    errors: [],
  };
}

/**
 * Compute GTIN check digit using GS1 modulo 10 algorithm.
 */
export function computeGTINCheckDigit(body: string): string {
  const digits = body.replace(/[^0-9]/g, "").split("").map((d) => Number(d));

  let sum = 0;
  for (let i = digits.length - 1, positionFromRight = 1; i >= 0; i--, positionFromRight++) {
    const weight = positionFromRight % 2 === 1 ? 3 : 1;
    sum += digits[i] * weight;
  }

  const mod = sum % 10;
  const checkDigit = (10 - mod) % 10;

  return String(checkDigit);
}

/**
 * Normalise a domain or origin string to an origin with scheme, without trailing slash.
 */
function normalizeDomain(domain: string): string {
  let value = (domain ?? "").trim();
  if (!value) {
    throw new Error("Domain is required for Digital Link URIs.");
  }

  if (!/^https?:\/\//i.test(value)) {
    value = `${DIGITAL_LINK_DEFAULT_SCHEME}://${value}`;
  }

  // Remove any trailing slashes
  value = value.replace(/\/+$/, "");

  return value;
}

/**
 * Build qualifier segments (AI/value pairs) from user-friendly keys.
 */
function buildQualifierSegments(qualifiers: Record<string, string | number | Date>): Array<{ ai: string; value: string }> {
  const segments: Array<{ ai: string; value: string }> = [];

  for (const [key, rawValue] of Object.entries(qualifiers)) {
    if (rawValue === undefined || rawValue === null) continue;

    let ai = QUALIFIER_KEY_TO_AI[key];

    // If the key itself looks like an AI (e.g. "10", "21"), accept it directly.
    if (!ai && /^[0-9]{2,4}$/.test(key)) {
      ai = key;
    }

    if (!ai) {
      // Unknown qualifier key, ignore for now (conservative behaviour).
      continue;
    }

    const spec = APPLICATION_IDENTIFIER_SPECS[ai];
    if (!spec) {
      continue;
    }

    const value = formatQualifierValue(ai, rawValue, spec.format);
    segments.push({ ai, value });
  }

  return segments;
}

/**
 * Format qualifier values according to AI format.
 */
function formatQualifierValue(ai: string, value: string | number | Date, format: AIFormat): string {
  if (format === "date") {
    // Accept Date objects, YYMMDD strings, or ISO YYYY-MM-DD strings.
    if (value instanceof Date) {
      return formatDateYYMMDD(value);
    }

    // Convert to string if it's a number
    const stringValue = typeof value === 'number' ? String(value) : String(value).trim();

    if (/^[0-9]{6}$/.test(stringValue)) {
      // Already YYMMDD
      return stringValue;
    }

    if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(stringValue)) {
      const [yearStr, monthStr, dayStr] = stringValue.split("-");
      const year = Number(yearStr);
      const month = Number(monthStr);
      const day = Number(dayStr);
      const date = new Date(Date.UTC(year, month - 1, day));
      return formatDateYYMMDD(date);
    }

    throw new Error(`Cannot parse date value "${stringValue}" for AI ${ai}. Expected YYMMDD or YYYY-MM-DD.`);
  }

  // For non-date formats, convert to string
  if (typeof value === "number") {
    return String(value);
  }
  
  if (value instanceof Date) {
    // If we reach here, format is not "date" but value is Date - convert to ISO string
    return value.toISOString();
  }

  return String(value);
}

/**
 * Format a Date as YYMMDD (UTC).
 */
function formatDateYYMMDD(date: Date): string {
  const year = date.getUTCFullYear() % 100;
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  const yy = year.toString().padStart(2, "0");
  const mm = month.toString().padStart(2, "0");
  const dd = day.toString().padStart(2, "0");

  return `${yy}${mm}${dd}`;
}

/**
 * Order segments so that AIs follow PATH_AI_ORDER, others appended in ascending AI order.
 */
function orderSegments(segments: Array<{ ai: string; value: string }>): Array<{ ai: string; value: string }> {
  const orderIndex = new Map<string, number>();
  PATH_AI_ORDER.forEach((ai, index) => {
    orderIndex.set(ai, index);
  });

  return [...segments].sort((a, b) => {
    const aIndex = orderIndex.has(a.ai) ? orderIndex.get(a.ai)! : PATH_AI_ORDER.length + Number(a.ai);
    const bIndex = orderIndex.has(b.ai) ? orderIndex.get(b.ai)! : PATH_AI_ORDER.length + Number(b.ai);
    return aIndex - bIndex;
  });
}

/**
 * Build query string from key/value pairs.
 */
function buildQueryString(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return "";

  const entries: string[] = [];

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    const encodedKey = encodeURIComponent(key);
    const encodedValue = encodeURIComponent(String(value));
    entries.push(`${encodedKey}=${encodedValue}`);
  }

  if (!entries.length) return "";

  return `?${entries.join("&")}`;
}
