export const CATALOG_DATASET_AUTHORITY_FIELDS = [
  "authorityTier",
  "publicationStatus",
  "immutableUri",
  "source",
  "downloadUrl",
  "apiEndpoint",
  "lastVerifiedDate",
] as const;

export const CATALOG_DETAIL_TRANSPARENCY_FIELDS = [
  "authoritativeSourceUrl",
  "datasetIdentifier",
  "lastVerifiedDate",
] as const;

export function deriveCatalogAuthorityTierFromUrl(url?: string): string {
  if (!url) return "UNKNOWN";

  try {
    const hostname = new URL(url).hostname.toLowerCase();

    if (hostname === "eur-lex.europa.eu") return "EU";
    if (hostname === "ref.gs1.org" || hostname === "gs1.org" || hostname === "www.gs1.org") {
      return "GS1_Global";
    }
    if (/^gs1[a-z0-9-]*\.(org|nl|eu)$/.test(hostname)) return "GS1_MO";

    return "UNKNOWN";
  } catch {
    return "UNKNOWN";
  }
}
