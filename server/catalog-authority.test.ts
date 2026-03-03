import { describe, expect, it } from "vitest";
import {
  CATALOG_DATASET_AUTHORITY_FIELDS,
  CATALOG_DETAIL_TRANSPARENCY_FIELDS,
  deriveCatalogAuthorityTierFromUrl,
} from "./catalog-authority";

describe("catalog authority helper", () => {
  it("derives EU authority from EUR-Lex URLs", () => {
    expect(deriveCatalogAuthorityTierFromUrl("https://eur-lex.europa.eu/legal-content/EN/TXT/")).toBe("EU");
  });

  it("derives GS1 global authority from global GS1 URLs", () => {
    expect(deriveCatalogAuthorityTierFromUrl("https://ref.gs1.org/standards/")).toBe("GS1_Global");
    expect(deriveCatalogAuthorityTierFromUrl("https://www.gs1.org/standards/")).toBe("GS1_Global");
  });

  it("derives GS1 member-organization authority from GS1 local URLs", () => {
    expect(deriveCatalogAuthorityTierFromUrl("https://gs1.nl/kennisbank/")).toBe("GS1_MO");
    expect(deriveCatalogAuthorityTierFromUrl("https://gs1.eu/standards/")).toBe("GS1_MO");
  });

  it("falls back to UNKNOWN for missing or unrecognized URLs", () => {
    expect(deriveCatalogAuthorityTierFromUrl()).toBe("UNKNOWN");
    expect(deriveCatalogAuthorityTierFromUrl("not-a-url")).toBe("UNKNOWN");
    expect(deriveCatalogAuthorityTierFromUrl("https://example.com/dataset")).toBe("UNKNOWN");
  });

  it("locks the required catalog dataset authority metadata fields", () => {
    expect(CATALOG_DATASET_AUTHORITY_FIELDS).toEqual([
      "authorityTier",
      "publicationStatus",
      "immutableUri",
      "source",
      "downloadUrl",
      "apiEndpoint",
      "lastVerifiedDate",
    ]);
  });

  it("locks the required catalog detail transparency metadata fields", () => {
    expect(CATALOG_DETAIL_TRANSPARENCY_FIELDS).toEqual([
      "authoritativeSourceUrl",
      "datasetIdentifier",
      "lastVerifiedDate",
    ]);
  });
});
