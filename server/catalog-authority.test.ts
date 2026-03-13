import { describe, expect, it } from "vitest";
import {
  ADMISSION_BASIS_VALUES,
  CATALOG_DATASET_AUTHORITY_FIELDS,
  CATALOG_DETAIL_TRANSPARENCY_FIELDS,
  SOURCE_ROLE_VALUES,
  deriveCatalogAuthorityTier,
  deriveCatalogAuthorityTierFromUrl,
  getDatasetAdmissionMetadata,
  isGs1GithubUrl,
  resolveDatasetAdmission,
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

  it("derives EU and EFRAG authority from supported official domains", () => {
    expect(deriveCatalogAuthorityTierFromUrl("https://ec.europa.eu/environment/")).toBe("EU");
    expect(deriveCatalogAuthorityTierFromUrl("https://europa.eu/youreurope/business/")).toBe("EU");
    expect(deriveCatalogAuthorityTierFromUrl("https://www.efrag.org/en")).toBe("EFRAG");
  });

  it("falls back to UNKNOWN for missing or unrecognized URLs", () => {
    expect(deriveCatalogAuthorityTierFromUrl()).toBe("UNKNOWN");
    expect(deriveCatalogAuthorityTierFromUrl("not-a-url")).toBe("UNKNOWN");
    expect(deriveCatalogAuthorityTierFromUrl("https://example.com/dataset")).toBe("UNKNOWN");
    expect(deriveCatalogAuthorityTierFromUrl("https://github.com/gs1/interpretGS1scan")).toBe("UNKNOWN");
    expect(deriveCatalogAuthorityTierFromUrl("https://github.com/gs1/oliot-epcis")).toBe("UNKNOWN");
  });

  it("locks the required catalog dataset authority metadata fields", () => {
    expect(CATALOG_DATASET_AUTHORITY_FIELDS).toEqual([
      "authorityTier",
      "sourceRole",
      "admissionBasis",
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
      "sourceRole",
      "admissionBasis",
      "datasetIdentifier",
      "lastVerifiedDate",
    ]);
  });

  it("locks supported source role and admission basis vocabularies", () => {
    expect(SOURCE_ROLE_VALUES).toEqual([
      "normative_authority",
      "canonical_technical_artifact",
      "supplemental_source",
    ]);
    expect(ADMISSION_BASIS_VALUES).toEqual([
      "official_publication",
      "registry_registered_artifact",
      "canonical_publication_evidence",
      "supplemental_only",
    ]);
  });

  it("detects GS1 GitHub repositories as non-normative by default", () => {
    expect(isGs1GithubUrl("https://github.com/gs1/interpretGS1scan")).toBe(true);
    expect(isGs1GithubUrl("https://github.com/example/project")).toBe(false);
  });

  it("derives authority from source authority hints when URL heuristics are insufficient", () => {
    expect(
      deriveCatalogAuthorityTier({
        sourceAuthority: "European Union",
      }),
    ).toBe("EU");
    expect(
      deriveCatalogAuthorityTier({
        sourceAuthority: "EFRAG",
      }),
    ).toBe("EFRAG");
  });

  it("reads normalized dataset admission metadata from metadata blobs", () => {
    expect(
      getDatasetAdmissionMetadata({
        sourceRole: "canonical_technical_artifact",
        admissionBasis: "registry_registered_artifact",
        canonicalPublicationUrl: "https://github.com/gs1/interpretGS1scan",
        ignored: true,
      }),
    ).toEqual({
      sourceRole: "canonical_technical_artifact",
      admissionBasis: "registry_registered_artifact",
      canonicalPublicationUrl: "https://github.com/gs1/interpretGS1scan",
      normativeAuthorityUrl: undefined,
    });
  });

  it("defaults GS1 official domains to normative admission", () => {
    expect(
      resolveDatasetAdmission({
        source: "https://ref.gs1.org/standards/",
      }),
    ).toMatchObject({
      authorityTier: "GS1_Global",
      sourceRole: "normative_authority",
      admissionBasis: "official_publication",
    });
  });

  it("rejects GS1 GitHub repositories as normative authority inputs", () => {
    expect(() =>
      resolveDatasetAdmission({
        source: "https://github.com/gs1/interpretGS1scan",
        metadata: {
          sourceRole: "normative_authority",
        },
      }),
    ).toThrow(/not automatically normative authority/i);
  });

  it("allows GS1 GitHub repositories only with explicit technical artifact admission", () => {
    expect(
      resolveDatasetAdmission({
        source: "https://github.com/gs1/interpretGS1scan",
        metadata: {
          sourceRole: "canonical_technical_artifact",
          admissionBasis: "registry_registered_artifact",
        },
      }),
    ).toMatchObject({
      sourceRole: "canonical_technical_artifact",
      admissionBasis: "registry_registered_artifact",
    });
  });
});
