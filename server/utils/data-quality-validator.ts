import type { DigitalLinkValidationResult } from "./digital-link";
import { validateDigitalLinkURI, validateGTIN } from "./digital-link";
import type {
  CustomValidationRule,
  ValidationIssueDefinition
} from "../../shared/validation-rules";
import { ESRS_TOPIC_CODES, SECTOR_CODES } from "../../shared/validation-rules";

export interface FieldValidationIssue {
  field: string;
  code: string;
  message: string;
}

export interface DataValidationResult {
  valid: boolean;
  errors: FieldValidationIssue[];
  warnings: FieldValidationIssue[];
}

export interface ValidateDataInput {
  gtin?: string;
  gln?: string;
  expiryDate?: string | Date;
  productionDate?: string | Date;
  digitalLinkUrl?: string;
  esrsTopic?: string;
  sector?: string;
  customRules?: CustomValidationRule[];
  [key: string]: unknown;
}

export interface GLNValidationResult {
  valid: boolean;
  normalized?: string;
  errors: FieldValidationIssue[];
}

/**
 * Validate GLN using GS1 check digit algorithm.
 */
export function validateGLN(gln: string): GLNValidationResult {
  const errors: FieldValidationIssue[] = [];
  const input = (gln || "").trim();

  if (!input.length) {
    errors.push({
      field: "gln",
      code: "GLN_INVALID_LENGTH",
      message: "GLN must contain digits."
    });
    return {
      valid: false,
      errors
    };
  }

  // Check for invalid characters BEFORE stripping
  if (!/^[0-9]+$/.test(input)) {
    errors.push({
      field: "gln",
      code: "GLN_INVALID_CHARACTERS",
      message: "GLN may only contain numeric digits."
    });
    return {
      valid: false,
      errors
    };
  }

  if (input.length != 13) {
    errors.push({
      field: "gln",
      code: "GLN_INVALID_LENGTH",
      message: "GLN length must be exactly 13 digits."
    });
    return {
      valid: false,
      errors
    };
  }

  const digits = input;

  const body = digits.slice(0, -1);
  const checkDigit = digits.slice(-1);
  const computedCheckDigit = computeCheckDigitUsingGs1Algorithm(body);

  if (checkDigit != computedCheckDigit) {
    errors.push({
      field: "gln",
      code: "GLN_INVALID_CHECK_DIGIT",
      message: "GLN check digit is not valid."
    });
    return {
      valid: false,
      errors
    };
  }

  return {
    valid: true,
    normalized: digits,
    errors: []
  };
}

function computeCheckDigitUsingGs1Algorithm(body: string): string {
  const cleaned = body.replace(/[^0-9]/g, "");
  const digits = cleaned.split("").map(digit => Number(digit));
  let sum = 0;
  for (let index = digits.length - 1, positionFromRight = 1; index >= 0; index -= 1, positionFromRight += 1) {
    const weight = positionFromRight % 2 == 1 ? 3 : 1;
    sum += digits[index] * weight;
  }
  const remainder = sum % 10;
  const checkDigit = (10 - remainder) % 10;
  return String(checkDigit);
}

export interface DateValidationResult {
  valid: boolean;
  normalized?: string;
  errors: FieldValidationIssue[];
}

/**
 * Validate ISO date (YYYY-MM-DD) or YYMMDD format, or Date instance.
 */
export function validateDate(value: string | Date, fieldName: string): DateValidationResult {
  const errors: FieldValidationIssue[] = [];

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      errors.push({
        field: fieldName,
        code: "DATE_INVALID",
        message: "Date instance is not valid."
      });
      return {
        valid: false,
        errors
      };
    }
    const iso = value.toISOString().slice(0, 10);
    return {
      valid: true,
      normalized: iso,
      errors: []
    };
  }

  const input = value.trim();
  if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(input)) {
    const result = parseIsoDate(input, fieldName);
    if (!result.valid) {
      return result;
    }
    return result;
  }

  if (/^[0-9]{6}$/.test(input)) {
    const result = parseYyMmDd(input, fieldName);
    if (!result.valid) {
      return result;
    }
    return result;
  }

  errors.push({
    field: fieldName,
    code: "DATE_INVALID_FORMAT",
    message: "Date must be in YYYY-MM-DD or YYMMDD format."
  });

  return {
    valid: false,
    errors
  };
}

function parseIsoDate(input: string, fieldName: string): DateValidationResult {
  const parts = input.split("-");
  const yearText = parts[0];
  const monthText = parts[1];
  const dayText = parts[2];

  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const candidate = new Date(Date.UTC(year, month - 1, day));

  if (Number.isNaN(candidate.getTime())) {
    return {
      valid: false,
      errors: [
        {
          field: fieldName,
          code: "DATE_INVALID",
          message: "Date value is not a valid calendar date."
        }
      ]
    };
  }

  // Validate that the date components match (catch Feb 30 -> Mar 2 rollover)
  if (candidate.getUTCFullYear() !== year || 
      candidate.getUTCMonth() !== month - 1 || 
      candidate.getUTCDate() !== day) {
    return {
      valid: false,
      errors: [
        {
          field: fieldName,
          code: "DATE_INVALID",
          message: "Date value is not a valid calendar date."
        }
      ]
    };
  }

  const normalized = candidate.toISOString().slice(0, 10);
  return {
    valid: true,
    normalized,
    errors: []
  };
}

function parseYyMmDd(input: string, fieldName: string): DateValidationResult {
  const yearPart = Number(input.slice(0, 2));
  const monthPart = Number(input.slice(2, 4));
  const dayPart = Number(input.slice(4, 6));

  const fullYear = yearPart >= 70 ? 1900 + yearPart : 2000 + yearPart;
  const date = new Date(Date.UTC(fullYear, monthPart - 1, dayPart));

  if (Number.isNaN(date.getTime())) {
    return {
      valid: false,
      errors: [
        {
          field: fieldName,
          code: "DATE_INVALID",
          message: "Date value is not a valid calendar date."
        }
      ]
    };
  }

  const normalized = date.toISOString().slice(0, 10);
  return {
    valid: true,
    normalized,
    errors: []
  };
}

export interface DigitalLinkUrlValidationResult {
  valid: boolean;
  errors: FieldValidationIssue[];
}

export function validateDigitalLinkUrl(url: string, fieldName: string): DigitalLinkUrlValidationResult {
  const result: DigitalLinkValidationResult = validateDigitalLinkURI(url);
  if (result.valid) {
    return {
      valid: true,
      errors: []
    };
  }

  const errors: FieldValidationIssue[] = [];
  result.errors.forEach(error => {
    errors.push({
      field: fieldName,
      code: "DIGITAL_LINK_" + error.code,
      message: error.message
    });
  });

  return {
    valid: false,
    errors
  };
}

export function validateEnumField(value: string | undefined, allowed: string[], fieldName: string): FieldValidationIssue[] {
  const issues: FieldValidationIssue[] = [];
  if (!value) {
    return issues;
  }
  if (allowed.indexOf(value) == -1) {
    issues.push({
      field: fieldName,
      code: "ENUM_INVALID_VALUE",
      message: "Value " + value + " is not in the allowed set."
    });
  }
  return issues;
}

/**
 * Main entry point for validating a collection of fields.
 */
export function validateData(input: ValidateDataInput): DataValidationResult {
  const errors: FieldValidationIssue[] = [];
  const warnings: FieldValidationIssue[] = [];

  if (typeof input.gtin == "string" && input.gtin.length > 0) {
    const gtinResult = validateGTIN(input.gtin);
    if (!gtinResult.valid) {
      gtinResult.errors.forEach(error => {
        errors.push({
          field: "gtin",
          code: "GTIN_" + error.code,
          message: error.message
        });
      });
    }
  }

  if (typeof input.gln == "string" && input.gln.length > 0) {
    const glnResult = validateGLN(input.gln);
    if (!glnResult.valid) {
      glnResult.errors.forEach(error => {
        errors.push(error);
      });
    }
  }

  if (input.expiryDate instanceof Date || typeof input.expiryDate == "string") {
    const expiryResult = validateDate(input.expiryDate as string | Date, "expiryDate");
    if (!expiryResult.valid) {
      expiryResult.errors.forEach(error => {
        errors.push(error);
      });
    }
  }

  if (input.productionDate instanceof Date || typeof input.productionDate == "string") {
    const productionResult = validateDate(input.productionDate as string | Date, "productionDate");
    if (!productionResult.valid) {
      productionResult.errors.forEach(error => {
        errors.push(error);
      });
    }
  }

  if (typeof input.digitalLinkUrl == "string" && input.digitalLinkUrl.length > 0) {
    const linkResult = validateDigitalLinkUrl(input.digitalLinkUrl, "digitalLinkUrl");
    if (!linkResult.valid) {
      linkResult.errors.forEach(error => {
        errors.push(error);
      });
    }
  }

  if (typeof input.esrsTopic == "string" && input.esrsTopic.length > 0) {
    const enumIssues = validateEnumField(input.esrsTopic, ESRS_TOPIC_CODES, "esrsTopic");
    enumIssues.forEach(issue => {
      errors.push(issue);
    });
  }

  if (typeof input.sector == "string" && input.sector.length > 0) {
    const enumIssues = validateEnumField(input.sector, SECTOR_CODES, "sector");
    enumIssues.forEach(issue => {
      errors.push(issue);
    });
  }

  const customRules = input.customRules || [];
  customRules.forEach(rule => {
    const value = (input as Record<string, unknown>)[rule.field];
    const ruleIssues: ValidationIssueDefinition[] = rule.validate(value);
    ruleIssues.forEach(def => {
      const issue: FieldValidationIssue = {
        field: def.field,
        code: def.code,
        message: def.message
      };
      if (def.level == "warning") {
        warnings.push(issue);
      } else {
        errors.push(issue);
      }
    });
  });

  return {
    valid: errors.length == 0,
    errors,
    warnings
  };
}

