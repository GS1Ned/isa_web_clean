export const CATALOG_DATASET_AUTHORITY_FIELDS = [
  "authorityTier",
  "sourceRole",
  "admissionBasis",
  "publicationStatus",
  "immutableUri",
  "source",
  "downloadUrl",
  "apiEndpoint",
  "lastVerifiedDate",
] as const;

export const CATALOG_DETAIL_TRANSPARENCY_FIELDS = [
  "authoritativeSourceUrl",
  "sourceRole",
  "admissionBasis",
  "datasetIdentifier",
  "lastVerifiedDate",
] as const;

export const SOURCE_ROLE_VALUES = [
  "normative_authority",
  "canonical_technical_artifact",
  "supplemental_source",
] as const;

export const ADMISSION_BASIS_VALUES = [
  "official_publication",
  "registry_registered_artifact",
  "canonical_publication_evidence",
  "supplemental_only",
] as const;

export type SourceRole = (typeof SOURCE_ROLE_VALUES)[number];
export type AdmissionBasis = (typeof ADMISSION_BASIS_VALUES)[number];

export interface DatasetAdmissionMetadata {
  sourceRole?: SourceRole;
  admissionBasis?: AdmissionBasis;
  canonicalPublicationUrl?: string;
  normativeAuthorityUrl?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized.length > 0 ? normalized : undefined;
}

function normalizeSourceRole(value: unknown): SourceRole | undefined {
  const normalized = normalizeString(value);
  if (!normalized) return undefined;
  return SOURCE_ROLE_VALUES.includes(normalized as SourceRole)
    ? (normalized as SourceRole)
    : undefined;
}

function normalizeAdmissionBasis(value: unknown): AdmissionBasis | undefined {
  const normalized = normalizeString(value);
  if (!normalized) return undefined;
  return ADMISSION_BASIS_VALUES.includes(normalized as AdmissionBasis)
    ? (normalized as AdmissionBasis)
    : undefined;
}

export function isGs1GithubUrl(url?: string | null): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname.toLowerCase() === "github.com" &&
      parsed.pathname.toLowerCase().startsWith("/gs1/")
    );
  } catch {
    return false;
  }
}

export function deriveCatalogAuthorityTierFromUrl(url?: string): string {
  if (!url) return "UNKNOWN";

  try {
    const hostname = new URL(url).hostname.toLowerCase();

    if (
      hostname === "eur-lex.europa.eu" ||
      hostname === "ec.europa.eu" ||
      hostname === "europa.eu" ||
      hostname.endsWith(".europa.eu")
    ) {
      return "EU";
    }
    if (hostname === "efrag.org" || hostname === "www.efrag.org") return "EFRAG";
    if (hostname === "ref.gs1.org" || hostname === "gs1.org" || hostname === "www.gs1.org") {
      return "GS1_Global";
    }
    if (/^gs1[a-z0-9-]*\.(org|nl|eu)$/.test(hostname)) return "GS1_MO";

    return "UNKNOWN";
  } catch {
    return "UNKNOWN";
  }
}

export function deriveCatalogAuthorityTier(
  input: {
    url?: string | null;
    sourceAuthority?: string | null;
    publisher?: string | null;
  } = {},
): string {
  const fromUrl = deriveCatalogAuthorityTierFromUrl(input.url || undefined);
  if (fromUrl !== "UNKNOWN") return fromUrl;

  const authorityHint = [input.sourceAuthority, input.publisher]
    .map((value) => normalizeString(value))
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  if (!authorityHint) return "UNKNOWN";
  if (
    authorityHint.includes("eur-lex") ||
    authorityHint.includes("european union") ||
    authorityHint.includes("european commission") ||
    authorityHint.includes("official journal")
  ) {
    return "EU";
  }
  if (authorityHint.includes("efrag")) return "EFRAG";
  if (authorityHint.includes("gs1")) {
    const fromPublisherUrl = deriveCatalogAuthorityTierFromUrl(input.url || undefined);
    return fromPublisherUrl === "UNKNOWN" ? "GS1_Global" : fromPublisherUrl;
  }

  return "UNKNOWN";
}

export function getDatasetAdmissionMetadata(metadata?: unknown): DatasetAdmissionMetadata {
  if (!isRecord(metadata)) return {};
  return {
    sourceRole: normalizeSourceRole(metadata.sourceRole),
    admissionBasis: normalizeAdmissionBasis(metadata.admissionBasis),
    canonicalPublicationUrl: normalizeString(metadata.canonicalPublicationUrl),
    normativeAuthorityUrl: normalizeString(metadata.normativeAuthorityUrl),
  };
}

export function resolveDatasetAdmission(input: {
  source?: string | null;
  downloadUrl?: string | null;
  apiEndpoint?: string | null;
  authorityTier?: string | null;
  metadata?: unknown;
}): {
  authorityTier: string;
  sourceRole: SourceRole;
  admissionBasis: AdmissionBasis;
  metadata: Record<string, unknown>;
} {
  const metadata = isRecord(input.metadata) ? { ...input.metadata } : {};
  const existing = getDatasetAdmissionMetadata(metadata);
  const sourceLocator =
    normalizeString(input.source) ||
    normalizeString(input.downloadUrl) ||
    normalizeString(input.apiEndpoint) ||
    existing.canonicalPublicationUrl ||
    existing.normativeAuthorityUrl;

  const authorityTier =
    normalizeString(input.authorityTier) ||
    deriveCatalogAuthorityTier({
      url: sourceLocator,
      sourceAuthority: normalizeString(metadata.sourceAuthority),
      publisher: normalizeString(metadata.publisher),
    });

  const defaultSourceRole: SourceRole =
    authorityTier === "EU" || authorityTier === "GS1_Global" || authorityTier === "GS1_MO"
      ? "normative_authority"
      : authorityTier === "EFRAG"
        ? "canonical_technical_artifact"
        : "supplemental_source";

  const sourceRole = existing.sourceRole || defaultSourceRole;

  const defaultAdmissionBasis: AdmissionBasis =
    sourceRole === "normative_authority"
      ? "official_publication"
      : sourceRole === "canonical_technical_artifact"
        ? isGs1GithubUrl(sourceLocator)
          ? "registry_registered_artifact"
          : "canonical_publication_evidence"
        : "supplemental_only";

  const admissionBasis = existing.admissionBasis || defaultAdmissionBasis;

  if (isGs1GithubUrl(sourceLocator) && sourceRole === "normative_authority") {
    throw new Error(
      "GS1 GitHub repositories are not automatically normative authority sources. Register them as technical artifacts or provide canonical publication evidence.",
    );
  }

  if (
    isGs1GithubUrl(sourceLocator) &&
    sourceRole === "canonical_technical_artifact" &&
    admissionBasis !== "registry_registered_artifact" &&
    admissionBasis !== "canonical_publication_evidence"
  ) {
    throw new Error(
      "GS1 GitHub repositories require explicit registry registration or canonical publication evidence before admission as technical artifacts.",
    );
  }

  const nextMetadata: Record<string, unknown> = {
    ...metadata,
    sourceRole,
    admissionBasis,
  };

  if (sourceRole === "normative_authority" && sourceLocator && !existing.normativeAuthorityUrl) {
    nextMetadata.normativeAuthorityUrl = sourceLocator;
  }

  if (
    sourceRole === "canonical_technical_artifact" &&
    sourceLocator &&
    !existing.canonicalPublicationUrl
  ) {
    nextMetadata.canonicalPublicationUrl = sourceLocator;
  }

  return {
    authorityTier,
    sourceRole,
    admissionBasis,
    metadata: nextMetadata,
  };
}
