// @ts-nocheck
import { eq } from "drizzle-orm";

import { serverLogger } from "./_core/logger-wiring";
import { getDb } from "./db";
import { getRuntimeSchema } from "./db-runtime-schema";
import {
  buildKnowledgeCitationLabel,
  buildKnowledgeEvidenceKey,
  buildSourceChunkLocator,
  getKnowledgeVerificationStatus,
} from "./knowledge-provenance";
import { deriveCatalogAuthorityTier } from "./catalog-authority";

function isTruthyDbFlag(value: unknown): boolean {
  return value === true || value === 1 || value === "1";
}

function inferSourceRole(authorityTier?: string | null): string {
  if (authorityTier === "EU" || authorityTier === "GS1_Global" || authorityTier === "GS1_MO") {
    return "normative_authority";
  }
  if (authorityTier === "EFRAG") return "canonical_technical_artifact";
  return "supplemental_source";
}

function inferAdmissionBasis(sourceRole?: string | null, sourceLocator?: string | null): string {
  if (sourceRole === "normative_authority") return "official_publication";
  if (sourceRole === "canonical_technical_artifact") {
    return sourceLocator ? "registry_registered_artifact" : "canonical_publication_evidence";
  }
  return "supplemental_only";
}

async function getKnowledgeProvenanceTables() {
  const runtimeSchema = (await getRuntimeSchema()) as any;
  if (runtimeSchema.sources && runtimeSchema.sourceChunks) {
    return runtimeSchema;
  }

  const corpusSchema = await import("../drizzle/schema_corpus_governance");
  return {
    ...runtimeSchema,
    sources: corpusSchema.sources,
    sourceChunks: corpusSchema.sourceChunks,
  };
}

export interface KnowledgeCitationProvenance {
  id: number;
  title: string;
  url?: string;
  similarity?: number;
  datasetId?: string;
  datasetVersion?: string;
  lastVerifiedDate?: string;
  verificationAgeDays?: number | null;
  needsVerification: boolean;
  verificationReason?:
    | "ok"
    | "missing_last_verified_date"
    | "invalid_last_verified_date"
    | "stale_last_verified_date";
  isDeprecated: boolean;
  deprecationReason?: string;
  evidenceKey: string | null;
  evidenceKeyReason:
    | "ok"
    | "missing_content_hash"
    | "missing_authoritative_chunk"
    | "chunk_not_found"
    | "db_unavailable";
  sourceRecordId?: number;
  sourceChunkId?: number;
  authorityTier?: string;
  sourceRole?: string;
  admissionBasis?: string;
  publicationStatus?: string;
  sourceLocator?: string;
  immutableUri?: string;
  citationLabel?: string;
  sourceChunkLocator?: string;
}

export interface SourceEvidenceRef {
  sourceId?: number;
  sourceChunkId?: number;
  evidenceKey?: string | null;
  citationLabel?: string | null;
  sourceChunkLocator?: string | null;
  sourceLocator?: string | null;
  immutableUri?: string | null;
  authorityTier?: string | null;
  sourceRole?: string | null;
  publicationStatus?: string | null;
  lastVerifiedDate?: string | null;
  needsVerification?: boolean;
  verificationReason?: string;
}

type EvidenceCandidate = {
  id: number;
  sourceType?: string | null;
  title?: string | null;
  content?: string | null;
  sourceChunkId?: number | null;
  isDeprecated?: boolean | number | string | null;
};

function normalizeEvidenceTerms(terms: string[] = []) {
  const values = new Set<string>();

  for (const term of terms) {
    if (typeof term !== "string") continue;
    const normalized = term.trim().toLowerCase();
    if (!normalized) continue;
    values.add(normalized);

    if (normalized.startsWith("esrs ")) {
      values.add(normalized.replace(/^esrs\s+/i, "").trim());
    }
  }

  return Array.from(values);
}

function scoreEvidenceCandidate(
  candidate: EvidenceCandidate,
  terms: string[],
  preferredSourceTypes: string[],
) {
  const title = (candidate.title || "").toLowerCase();
  const content = (candidate.content || "").toLowerCase();
  const sourceType = (candidate.sourceType || "").toLowerCase();

  let score = 0;

  for (const term of terms) {
    if (!term) continue;
    if (title.includes(term)) score += 4;
    if (content.includes(term)) score += 1;
  }

  const preferredIndex = preferredSourceTypes.findIndex(
    (value) => value.toLowerCase() === sourceType,
  );
  if (preferredIndex >= 0) {
    score += Math.max(preferredSourceTypes.length - preferredIndex, 1);
  }

  if (candidate.sourceChunkId != null) score += 2;
  if (isTruthyDbFlag(candidate.isDeprecated)) score -= 8;

  return score;
}

export function buildEvidenceRefFromCitation(
  citation?: Partial<KnowledgeCitationProvenance> | null,
): SourceEvidenceRef | null {
  if (!citation) return null;
  return {
    sourceId: citation.sourceRecordId,
    sourceChunkId: citation.sourceChunkId,
    evidenceKey: citation.evidenceKey ?? null,
    citationLabel: citation.citationLabel ?? null,
    sourceChunkLocator: citation.sourceChunkLocator ?? null,
    sourceLocator: citation.sourceLocator ?? null,
    immutableUri: citation.immutableUri ?? null,
    authorityTier: citation.authorityTier ?? null,
    sourceRole: citation.sourceRole ?? null,
    publicationStatus: citation.publicationStatus ?? null,
    lastVerifiedDate: citation.lastVerifiedDate ?? null,
    needsVerification: citation.needsVerification ?? false,
    verificationReason: citation.verificationReason,
  };
}

export function hasReviewerUsableEvidenceRef(
  evidenceRef?: SourceEvidenceRef | null,
) {
  if (!evidenceRef) return false;
  return Boolean(
    (evidenceRef.evidenceKey || evidenceRef.citationLabel) &&
      (evidenceRef.sourceChunkLocator || evidenceRef.sourceLocator || evidenceRef.immutableUri),
  );
}

export async function collectEvidenceRefsForTerms(input: {
  terms?: string[];
  preferredSourceTypes?: string[];
  limit?: number;
}): Promise<SourceEvidenceRef[]> {
  const normalizedTerms = normalizeEvidenceTerms(input.terms);
  if (normalizedTerms.length === 0) return [];

  const db = await getDb();
  if (!db) return [];

  try {
    const { knowledgeEmbeddings } = await getKnowledgeProvenanceTables();

    const candidates = (await db
      .select({
        id: knowledgeEmbeddings.id,
        sourceType: knowledgeEmbeddings.sourceType,
        title: knowledgeEmbeddings.title,
        content: knowledgeEmbeddings.content,
        sourceChunkId: knowledgeEmbeddings.sourceChunkId,
        isDeprecated: knowledgeEmbeddings.isDeprecated,
      })
      .from(knowledgeEmbeddings)) as EvidenceCandidate[];

    const preferredSourceTypes = input.preferredSourceTypes?.length
      ? input.preferredSourceTypes
      : ["regulation", "esrs_datapoint", "standard"];
    const limit = Math.max(1, Math.min(input.limit ?? 6, 12));

    const ranked = candidates
      .map((candidate) => ({
        candidate,
        score: scoreEvidenceCandidate(candidate, normalizedTerms, preferredSourceTypes),
      }))
      .filter(({ candidate, score }) => score > 0 && !isTruthyDbFlag(candidate.isDeprecated))
      .sort((left, right) => right.score - left.score || left.candidate.id - right.candidate.id)
      .slice(0, limit * 2);

    const refs: SourceEvidenceRef[] = [];
    const seen = new Set<string>();

    for (const rankedCandidate of ranked) {
      const citation = await resolveKnowledgeCitationProvenance(rankedCandidate.candidate.id);
      const evidenceRef = buildEvidenceRefFromCitation(citation);
      if (!evidenceRef) continue;

      const dedupeKey =
        evidenceRef.evidenceKey ||
        String(evidenceRef.sourceChunkId || evidenceRef.sourceId || rankedCandidate.candidate.id);
      if (seen.has(dedupeKey)) continue;
      seen.add(dedupeKey);
      refs.push(evidenceRef);

      if (refs.length >= limit) break;
    }

    return refs;
  } catch (error) {
    serverLogger.error("[SourceProvenance] Failed to collect workflow evidence refs:", error);
    return [];
  }
}

export async function resolveKnowledgeCitationProvenance(
  knowledgeEmbeddingId: number,
): Promise<KnowledgeCitationProvenance | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    const { knowledgeEmbeddings, sourceChunks, sources } = await getKnowledgeProvenanceTables();

    const knowledgeRows = await db
      .select()
      .from(knowledgeEmbeddings)
      .where(eq(knowledgeEmbeddings.id, knowledgeEmbeddingId))
      .limit(1);

    const knowledge = knowledgeRows[0];
    if (!knowledge) {
      return null;
    }

    const sourceChunkId = knowledge.sourceChunkId ?? null;
    const [sourceChunk] = sourceChunkId
      ? await db
          .select()
          .from(sourceChunks)
          .where(eq(sourceChunks.id, sourceChunkId))
          .limit(1)
      : [];
    const [sourceRecord] =
      sourceChunk?.sourceId != null
        ? await db.select().from(sources).where(eq(sources.id, sourceChunk.sourceId)).limit(1)
        : [];

    const sourceLocator =
      sourceRecord?.sourceLocator ||
      sourceRecord?.officialUrl ||
      sourceRecord?.immutableUri ||
      knowledge.canonicalUrl ||
      knowledge.url ||
      undefined;
    const authorityTier =
      sourceRecord?.authorityTier ||
      deriveCatalogAuthorityTier({
        url: sourceLocator,
        sourceAuthority: knowledge.sourceAuthority,
        publisher: sourceRecord?.publisher,
      });
    const sourceRole = sourceRecord?.sourceRole || inferSourceRole(authorityTier);
    const admissionBasis =
      sourceRecord?.admissionBasis || inferAdmissionBasis(sourceRole, sourceLocator);
    const lastVerifiedDate =
      sourceRecord?.lastVerifiedDate ||
      knowledge.lastVerifiedDate ||
      knowledge.lastVerifiedAt ||
      undefined;
    const verificationStatus = getKnowledgeVerificationStatus(lastVerifiedDate);
    const { evidenceKey, evidenceKeyReason } = buildKnowledgeEvidenceKey(
      sourceChunk?.id ?? null,
      sourceChunk?.contentHash || knowledge.contentHash || null,
    );
    const sourceChunkLocator = buildSourceChunkLocator({
      sectionPath: sourceChunk?.sectionPath,
      heading: sourceChunk?.heading,
      charStart: sourceChunk?.charStart,
      charEnd: sourceChunk?.charEnd,
    });
    const citationLabel = buildKnowledgeCitationLabel({
      title: sourceRecord?.name || knowledge.title,
      locator: sourceChunkLocator,
      version: sourceRecord?.version || knowledge.version || knowledge.datasetVersion,
    });

    const sourceStatus = sourceRecord?.status || "active";
    const chunkDeprecated =
      sourceChunk && (!isTruthyDbFlag(sourceChunk.isActive) || Boolean(sourceChunk.deprecatedAt));

    return {
      id: knowledge.id,
      title: knowledge.title,
      url: sourceLocator || knowledge.url || undefined,
      datasetId: sourceRecord?.datasetId || knowledge.datasetId || undefined,
      datasetVersion: knowledge.datasetVersion || sourceRecord?.version || undefined,
      lastVerifiedDate,
      verificationAgeDays: verificationStatus.verificationAgeDays,
      needsVerification: verificationStatus.needsVerification,
      verificationReason: verificationStatus.reason,
      isDeprecated:
        isTruthyDbFlag(knowledge.isDeprecated) ||
        chunkDeprecated ||
        sourceStatus === "superseded" ||
        sourceStatus === "deprecated" ||
        sourceStatus === "archived",
      deprecationReason:
        knowledge.deprecationReason ||
        sourceChunk?.deprecationReason ||
        (sourceStatus !== "active" ? `source_status:${sourceStatus}` : undefined),
      evidenceKey,
      evidenceKeyReason:
        sourceChunkId && !sourceChunk ? "chunk_not_found" : evidenceKeyReason,
      sourceRecordId: sourceRecord?.id,
      sourceChunkId: sourceChunk?.id,
      authorityTier,
      sourceRole,
      admissionBasis,
      publicationStatus: sourceRecord?.publicationStatus || knowledge.legalStatus || undefined,
      sourceLocator,
      immutableUri: sourceRecord?.immutableUri || knowledge.canonicalUrl || undefined,
      citationLabel: citationLabel || undefined,
      sourceChunkLocator: sourceChunkLocator || undefined,
    };
  } catch (error) {
    serverLogger.error("[SourceProvenance] Failed to resolve citation provenance:", error);
    return null;
  }
}
