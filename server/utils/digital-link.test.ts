/**
 * Tests for Digital Link URL Builder / Validator
 */

import { describe, it, expect } from "vitest";
import {
  buildDigitalLinkURI,
  validateDigitalLinkURI,
  validateGTIN,
  computeGTINCheckDigit,
} from "./digital-link";

describe("Digital Link – GTIN utilities", () => {
  it("computes GTIN check digit correctly", () => {
    const body = "0950600013435";
    const checkDigit = computeGTINCheckDigit(body);
    expect(checkDigit).toBe("2");
  });

  it("validates a correct GTIN", () => {
    const result = validateGTIN("09506000134352");
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.normalized).toBe("09506000134352");
  });

  it("rejects GTIN with invalid length", () => {
    const result = validateGTIN("1234567");
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe("INVALID_GTIN_LENGTH");
  });

  it("rejects GTIN with invalid check digit", () => {
    const result = validateGTIN("09506000134351");
    expect(result.valid).toBe(false);
    expect(result.errors[0].code).toBe("INVALID_GTIN_CHECK_DIGIT");
  });
});

describe("Digital Link – buildDigitalLinkURI", () => {
  it("builds a simple Digital Link URI with GTIN only", () => {
    const uri = buildDigitalLinkURI({
      domain: "id.gs1.org",
      gtin: "09506000134352",
    });

    expect(uri).toBe("https://id.gs1.org/01/09506000134352");
  });

  it("builds a Digital Link URI with GTIN and batch qualifier", () => {
    const uri = buildDigitalLinkURI({
      domain: "id.gs1.org",
      gtin: "09506000134352",
      qualifiers: {
        batch: "ABC123",
      },
    });

    expect(uri).toBe("https://id.gs1.org/01/09506000134352/10/ABC123");
  });

  it("normalises domain and pads GTIN as needed", () => {
    const uri = buildDigitalLinkURI({
      domain: "https://id.gs1.org/",
      gtin: "9506000134352", // 13-digit GTIN, missing leading 0
    });

    // Normalised GTIN should be padded to 14 digits
    expect(uri).toBe("https://id.gs1.org/01/09506000134352");
  });

  it("throws an error for invalid GTIN", () => {
    expect(() =>
      buildDigitalLinkURI({
        domain: "id.gs1.org",
        gtin: "12345",
      }),
    ).toThrow();
  });

  it("supports expirationDate qualifier with Date input", () => {
    const uri = buildDigitalLinkURI({
      domain: "id.gs1.org",
      gtin: "09506000134352",
      qualifiers: {
        expirationDate: new Date(Date.UTC(2025, 11, 31)), // 2025-12-31
      },
    });

    expect(uri).toBe("https://id.gs1.org/01/09506000134352/17/251231");
  });

  it("supports additional query parameters", () => {
    const uri = buildDigitalLinkURI({
      domain: "id.gs1.org",
      gtin: "09506000134352",
      qualifiers: {
        batch: "ABC123",
      },
      queryParams: {
        linkType: "gs1:dpp",
        locale: "en",
      },
    });

    expect(uri.startsWith("https://id.gs1.org/01/09506000134352/10/ABC123")).toBe(true);
    expect(uri).toContain("linkType=gs1%3Adpp");
    expect(uri).toContain("locale=en");
  });
});

describe("Digital Link – validateDigitalLinkURI", () => {
  it("validates a correct Digital Link URI and extracts GTIN", () => {
    const uri = "https://id.gs1.org/01/09506000134352/10/ABC123";

    const result = validateDigitalLinkURI(uri);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.parsed?.gtin).toBe("09506000134352");
    expect(result.parsed?.aiSegments["01"]).toBe("09506000134352");
    expect(result.parsed?.aiSegments["10"]).toBe("ABC123");
  });

  it("flags unknown AIs and keeps other validation intact", () => {
    const uri = "https://id.gs1.org/99/ABC/01/09506000134352";

    const result = validateDigitalLinkURI(uri);

    expect(result.valid).toBe(false);
    const unknownAiError = result.errors.find((e) => e.code === "UNKNOWN_AI");
    expect(unknownAiError).toBeDefined();
    expect(unknownAiError?.ai).toBe("99");
  });

  it("detects invalid GTIN value in URI", () => {
    const uri = "https://id.gs1.org/01/09506000134351"; // wrong check digit

    const result = validateDigitalLinkURI(uri);

    expect(result.valid).toBe(false);
    const checkDigitError = result.errors.find((e) => e.code === "INVALID_GTIN_CHECK_DIGIT");
    expect(checkDigitError).toBeDefined();
  });

  it("returns error for malformed URI string", () => {
    const result = validateDigitalLinkURI("not-a-uri");

    expect(result.valid).toBe(false);
    const error = result.errors[0];
    expect(error.code).toBe("INVALID_URI");
  });

  it("returns error when GTIN is missing from path", () => {
    const uri = "https://id.gs1.org/10/ABC123";

    const result = validateDigitalLinkURI(uri);

    expect(result.valid).toBe(false);
    const missingGtinError = result.errors.find((e) => e.code === "MISSING_GTIN");
    expect(missingGtinError).toBeDefined();
  });
});
