
import { describe, it, expect } from "vitest";
import type { DataValidationResult, DateValidationResult, DigitalLinkUrlValidationResult, GLNValidationResult } from "./data-quality-validator";
import {
  validateData,
  validateGLN,
  validateDate,
  validateDigitalLinkUrl
} from "./data-quality-validator";
import type { ValidationIssueDefinition } from "../../shared/validation-rules";
import { ESRS_TOPIC_CODES, SECTOR_CODES } from "../../shared/validation-rules";

describe("validateGLN", () => {
  it("accepts a valid GLN", () => {
    const result: GLNValidationResult = validateGLN("1234567890128");
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it("rejects GLN with wrong length", () => {
    const result: GLNValidationResult = validateGLN("12345");
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe("GLN_INVALID_LENGTH");
  });

  it("rejects GLN with invalid characters", () => {
    const result: GLNValidationResult = validateGLN("12345678901AB");
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe("GLN_INVALID_CHARACTERS");
  });

  it("rejects GLN with invalid check digit", () => {
    const result: GLNValidationResult = validateGLN("1234567890123");
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe("GLN_INVALID_CHECK_DIGIT");
  });
});

describe("validateDate", () => {
  it("accepts ISO date string", () => {
    const result: DateValidationResult = validateDate("2025-12-31", "expiryDate");
    expect(result.valid).toBe(true);
    expect(result.normalized).toBe("2025-12-31");
  });

  it("accepts YYMMDD string and normalizes to ISO", () => {
    const result: DateValidationResult = validateDate("251231", "expiryDate");
    expect(result.valid).toBe(true);
    expect(result.normalized?.slice(5)).toBe("12-31");
  });

  it("accepts Date instance", () => {
    const dateValue = new Date(Date.UTC(2025, 11, 31));
    const result: DateValidationResult = validateDate(dateValue, "expiryDate");
    expect(result.valid).toBe(true);
    expect(result.normalized).toBe("2025-12-31");
  });

  it("rejects invalid date format", () => {
    const result: DateValidationResult = validateDate("31-12-2025", "expiryDate");
    expect(result.valid).toBe(false);
  });

  it("rejects invalid calendar date", () => {
    const result: DateValidationResult = validateDate("2025-02-30", "expiryDate");
    expect(result.valid).toBe(false);
  });
});

describe("validateDigitalLinkUrl", () => {
  it("accepts a valid Digital Link URL", () => {
    const result: DigitalLinkUrlValidationResult = validateDigitalLinkUrl(
      "https://id.gs1.org/01/09506000134352",
      "digitalLinkUrl"
    );
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it("rejects invalid Digital Link URL", () => {
    const result: DigitalLinkUrlValidationResult = validateDigitalLinkUrl(
      "not-a-url",
      "digitalLinkUrl"
    );
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

describe("validateData", () => {
  it("returns valid result for consistent payload with Date expiry and production dates", () => {
    const expiry = new Date(Date.UTC(2025, 11, 31));
    const production = new Date(Date.UTC(2025, 0, 1));

    const result: DataValidationResult = validateData({
      gtin: "09506000134352",
      gln: "1234567890128",
      expiryDate: expiry,
      productionDate: production,
      digitalLinkUrl: "https://id.gs1.org/01/09506000134352",
      esrsTopic: ESRS_TOPIC_CODES[0],
      sector: SECTOR_CODES[0]
    });

    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  it("reports GTIN errors in validateData", () => {
    const result: DataValidationResult = validateData({
      gtin: "12345"
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some(issue => issue.field == "gtin")).toBe(true);
  });

  it("reports GLN errors in validateData", () => {
    const result: DataValidationResult = validateData({
      gln: "12345"
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some(issue => issue.field == "gln")).toBe(true);
  });

  it("reports expiryDate errors in validateData for invalid string", () => {
    const result: DataValidationResult = validateData({
      expiryDate: "31-12-2025"
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some(issue => issue.field == "expiryDate")).toBe(true);
  });

  it("reports expiryDate errors in validateData for invalid Date", () => {
    const invalidDate = new Date("invalid");
    const result: DataValidationResult = validateData({
      expiryDate: invalidDate
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some(issue => issue.field == "expiryDate")).toBe(true);
  });

  it("reports productionDate errors in validateData for invalid string", () => {
    const result: DataValidationResult = validateData({
      productionDate: "2025/12/31"
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some(issue => issue.field == "productionDate")).toBe(true);
  });

  it("reports productionDate errors in validateData for invalid Date", () => {
    const invalidDate = new Date("invalid");
    const result: DataValidationResult = validateData({
      productionDate: invalidDate
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some(issue => issue.field == "productionDate")).toBe(true);
  });

  it("reports Digital Link URL errors in validateData", () => {
    const result: DataValidationResult = validateData({
      digitalLinkUrl: "not-a-url"
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some(issue => issue.field == "digitalLinkUrl")).toBe(true);
  });

  it("reports invalid enum values in validateData", () => {
    const result: DataValidationResult = validateData({
      esrsTopic: "X9",
      sector: "unknown-sector"
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some(issue => issue.field == "esrsTopic")).toBe(true);
    expect(result.errors.some(issue => issue.field == "sector")).toBe(true);
  });

  it("applies custom validation rules for warnings", () => {
    const customRule: CustomValidationRule = {
      field: "riskFlag",
      validate: value => {
        const issues: ValidationIssueDefinition[] = [];
        if (value == "high") {
          issues.push({
            field: "riskFlag",
            code: "RISK_WARNING",
            message: "This record has been flagged as high risk.",
            level: "warning"
          });
        }
        return issues;
      }
    };

    const result: DataValidationResult = validateData({
      gtin: "09506000134352",
      riskFlag: "high",
      customRules: [customRule]
    });

    expect(result.valid).toBe(true);
    expect(result.warnings.some(issue => issue.field == "riskFlag")).toBe(true);
  });

  it("applies custom validation rules for errors", () => {
    const customRule: CustomValidationRule = {
      field: "qualityScore",
      validate: value => {
        const issues: ValidationIssueDefinition[] = [];
        if (typeof value == "number" && value < 50) {
          issues.push({
            field: "qualityScore",
            code: "QUALITY_TOO_LOW",
            message: "Quality score is below the accepted threshold.",
            level: "error"
          });
        }
        return issues;
      }
    };

    const result: DataValidationResult = validateData({
      gtin: "09506000134352",
      qualityScore: 20,
      customRules: [customRule]
    });

    expect(result.valid).toBe(false);
    expect(result.errors.some(issue => issue.field == "qualityScore")).toBe(true);
  });
});