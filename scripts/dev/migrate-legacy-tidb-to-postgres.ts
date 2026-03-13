#!/usr/bin/env tsx
import path from "node:path";
import { fileURLToPath } from "node:url";

import dotenv from "dotenv";
import mysql from "mysql2/promise";
import postgres from "postgres";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");

dotenv.config({ path: path.join(repoRoot, ".env"), quiet: true });

function cliOut(message: string) {
  process.stdout.write(`${message}\n`);
}

function parseJson<T>(value: unknown): T | null {
  if (value == null) return null;
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  }
  return value as T;
}

function isoOrNull(value: unknown): string | null {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return String(value);
}

function extractCodeFromTitle(title: string | null | undefined): string | null {
  if (!title) return null;
  const [code] = title.split(" - ", 1);
  return code?.trim() || null;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

type LegacyRegulation = {
  id: number;
  celexId: string | null;
  title: string;
  description: string | null;
  regulationType: string;
  effectiveDate: Date | string | null;
  sourceUrl: string | null;
  lastUpdated: Date | string | null;
  createdAt: Date | string | null;
  embedding: unknown;
  version: string | null;
  status: string | null;
  lastVerifiedAt: Date | string | null;
  parentCelexId: string | null;
};

type LegacyStandard = {
  id: number;
  standardCode: string;
  standardName: string;
  description: string | null;
  category: string | null;
  scope: string | null;
  referenceUrl: string | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
  embedding: unknown;
  version: string | null;
  publicationDate: Date | string | null;
  sourceUrl: string | null;
  publisher: string | null;
  lastVerifiedAt: Date | string | null;
};

type LegacyKnowledgeEmbedding = {
  id: number;
  sourceType: "regulation" | "gs1_standard" | "esrs_datapoint";
  sourceId: number;
  content: string;
  contentHash: string;
  embedding: unknown;
  embeddingModel: string;
  title: string;
  url: string | null;
  datasetId: string | null;
  datasetVersion: string | null;
  authorityLevel: string | null;
  legalStatus: string | null;
  effectiveDate: Date | string | null;
  expiryDate: Date | string | null;
  version: string | null;
  sourceAuthority: string | null;
  celexId: string | null;
  canonicalUrl: string | null;
  semanticLayer: string | null;
  documentType: string | null;
  parentEmbeddingId: number | null;
  regulationId: number | null;
  confidenceScore: string | number | null;
  lastVerifiedAt: Date | string | null;
  lastVerifiedDate: Date | string | null;
  isDeprecated: number | boolean;
  deprecationReason: string | null;
  createdAt: Date | string | null;
  updatedAt: Date | string | null;
};

async function main() {
  const legacyUrl = requireEnv("DATABASE_URL");
  const pgUrl = requireEnv("DATABASE_URL_POSTGRES");

  const legacy = await mysql.createConnection({
    uri: legacyUrl,
    ssl: { rejectUnauthorized: false },
  });
  const pg = postgres(pgUrl, { ssl: "require", max: 1, prepare: false });

  const summary = {
    regulations: { inserted: 0, updated: 0 },
    standards: { inserted: 0, updated: 0 },
    gs1Mappings: { inserted: 0, updated: 0 },
    regulationMappings: { inserted: 0, updated: 0, skipped: 0, unchanged: 0 },
    knowledgeEmbeddings: { inserted: 0, updated: 0, skipped: 0 },
  };

  try {
    const [legacyRegulations] = await legacy.query<LegacyRegulation[]>(
      `
        SELECT
          id,
          celexId,
          title,
          description,
          regulationType,
          effectiveDate,
          sourceUrl,
          lastUpdated,
          createdAt,
          embedding,
          version,
          status,
          last_verified_at AS lastVerifiedAt,
          parent_celex_id AS parentCelexId
        FROM regulations
      `
    );

    const [legacyStandards] = await legacy.query<LegacyStandard[]>(
      `
        SELECT
          id,
          standardCode,
          standardName,
          description,
          category,
          scope,
          referenceUrl,
          createdAt,
          updatedAt,
          embedding,
          version,
          publication_date AS publicationDate,
          source_url AS sourceUrl,
          publisher,
          last_verified_at AS lastVerifiedAt
        FROM gs1_standards
      `
    );

    const [legacyGs1Mappings] = await legacy.query<any[]>(
      `
        SELECT
          mapping_id,
          level,
          esrs_standard,
          esrs_topic,
          data_point_name,
          short_name,
          definition,
          gs1_relevance,
          source_document,
          source_date,
          source_authority,
          created_at,
          updated_at
        FROM gs1_esrs_mappings
      `
    );

    const [legacyRegMappings] = await legacy.query<any[]>(
      `
        SELECT
          m.regulationId,
          m.datapointId,
          m.relevanceScore,
          m.reasoning,
          r.celexId,
          SUBSTRING_INDEX(ke.title, ' - ', 1) AS datapointCode
        FROM regulation_esrs_mappings m
        LEFT JOIN regulations r
          ON r.id = m.regulationId
        LEFT JOIN knowledge_embeddings ke
          ON ke.sourceType = 'esrs_datapoint'
         AND ke.sourceId = m.datapointId
      `
    );

    const existingKnowledge = await pg`
      SELECT id, source_type, source_id, content_hash
      FROM knowledge_embeddings
    `;
    const pgKnowledgeByKey = new Map(
      existingKnowledge.map((row) => [
        `${row.source_type}:${row.source_id}:${row.content_hash}`,
        row.id as number,
      ])
    );

    const [legacyKnowledge] = await legacy.query<LegacyKnowledgeEmbedding[]>(
      `
        SELECT
          id,
          sourceType,
          sourceId,
          content,
          contentHash,
          embedding,
          embeddingModel,
          title,
          url,
          datasetId,
          datasetVersion,
          authority_level AS authorityLevel,
          legal_status AS legalStatus,
          effective_date AS effectiveDate,
          expiry_date AS expiryDate,
          version,
          source_authority AS sourceAuthority,
          celex_id AS celexId,
          canonical_url AS canonicalUrl,
          semantic_layer AS semanticLayer,
          document_type AS documentType,
          parent_embedding_id AS parentEmbeddingId,
          regulation_id AS regulationId,
          confidence_score AS confidenceScore,
          last_verified_at AS lastVerifiedAt,
          lastVerifiedDate,
          isDeprecated,
          deprecationReason,
          createdAt,
          updatedAt
        FROM knowledge_embeddings
        WHERE sourceType IN ('regulation', 'gs1_standard', 'esrs_datapoint')
      `
    );

    await legacy.end();

    for (const row of legacyRegulations) {
      if (row.celexId) {
        const result = await pg`
          INSERT INTO regulations (
            celex_id,
            title,
            description,
            regulation_type,
            effective_date,
            source_url,
            last_updated,
            created_at,
            embedding,
            version,
            status,
            last_verified_at,
            parent_celex_id
          )
          VALUES (
            ${row.celexId},
            ${row.title},
            ${row.description},
            ${row.regulationType},
            ${isoOrNull(row.effectiveDate)},
            ${row.sourceUrl},
            ${isoOrNull(row.lastUpdated)},
            ${isoOrNull(row.createdAt) ?? new Date().toISOString()},
            ${parseJson<number[]>(row.embedding)},
            ${row.version},
            ${row.status},
            ${isoOrNull(row.lastVerifiedAt)},
            ${row.parentCelexId}
          )
          ON CONFLICT (celex_id) DO UPDATE SET
            title = EXCLUDED.title,
            description = EXCLUDED.description,
            regulation_type = EXCLUDED.regulation_type,
            effective_date = EXCLUDED.effective_date,
            source_url = EXCLUDED.source_url,
            last_updated = EXCLUDED.last_updated,
            embedding = COALESCE(EXCLUDED.embedding, regulations.embedding),
            version = EXCLUDED.version,
            status = EXCLUDED.status,
            last_verified_at = EXCLUDED.last_verified_at,
            parent_celex_id = EXCLUDED.parent_celex_id
          RETURNING (xmax = 0) AS inserted
        `;
        if (result[0]?.inserted) {
          summary.regulations.inserted += 1;
        } else {
          summary.regulations.updated += 1;
        }
        continue;
      }

      const existing = await pg`
        SELECT id
        FROM regulations
        WHERE title = ${row.title}
        LIMIT 1
      `;
      if (existing.length > 0) {
        await pg`
          UPDATE regulations
          SET
            description = ${row.description},
            regulation_type = ${row.regulationType},
            effective_date = ${isoOrNull(row.effectiveDate)},
            source_url = ${row.sourceUrl},
            last_updated = ${isoOrNull(row.lastUpdated)},
            embedding = COALESCE(${parseJson<number[]>(row.embedding)}, embedding),
            version = ${row.version},
            status = ${row.status},
            last_verified_at = ${isoOrNull(row.lastVerifiedAt)},
            parent_celex_id = ${row.parentCelexId}
          WHERE id = ${existing[0].id}
        `;
        summary.regulations.updated += 1;
      } else {
        await pg`
          INSERT INTO regulations (
            title,
            description,
            regulation_type,
            effective_date,
            source_url,
            last_updated,
            created_at,
            embedding,
            version,
            status,
            last_verified_at,
            parent_celex_id
          )
          VALUES (
            ${row.title},
            ${row.description},
            ${row.regulationType},
            ${isoOrNull(row.effectiveDate)},
            ${row.sourceUrl},
            ${isoOrNull(row.lastUpdated)},
            ${isoOrNull(row.createdAt) ?? new Date().toISOString()},
            ${parseJson<number[]>(row.embedding)},
            ${row.version},
            ${row.status},
            ${isoOrNull(row.lastVerifiedAt)},
            ${row.parentCelexId}
          )
        `;
        summary.regulations.inserted += 1;
      }
    }

    for (const row of legacyStandards) {
      const result = await pg`
        INSERT INTO gs1_standards (
          standard_code,
          standard_name,
          description,
          category,
          scope,
          reference_url,
          created_at,
          updated_at,
          embedding,
          version,
          publication_date,
          source_url,
          publisher,
          last_verified_at
        )
        VALUES (
          ${row.standardCode},
          ${row.standardName},
          ${row.description},
          ${row.category},
          ${row.scope},
          ${row.referenceUrl},
          ${isoOrNull(row.createdAt) ?? new Date().toISOString()},
          ${isoOrNull(row.updatedAt) ?? new Date().toISOString()},
          ${parseJson<number[]>(row.embedding)},
          ${row.version},
          ${isoOrNull(row.publicationDate)},
          ${row.sourceUrl},
          ${row.publisher},
          ${isoOrNull(row.lastVerifiedAt)}
        )
        ON CONFLICT (standard_code) DO UPDATE SET
          standard_name = EXCLUDED.standard_name,
          description = EXCLUDED.description,
          category = EXCLUDED.category,
          scope = EXCLUDED.scope,
          reference_url = EXCLUDED.reference_url,
          updated_at = EXCLUDED.updated_at,
          embedding = COALESCE(EXCLUDED.embedding, gs1_standards.embedding),
          version = EXCLUDED.version,
          publication_date = EXCLUDED.publication_date,
          source_url = EXCLUDED.source_url,
          publisher = EXCLUDED.publisher,
          last_verified_at = EXCLUDED.last_verified_at
        RETURNING (xmax = 0) AS inserted
      `;
      if (result[0]?.inserted) {
        summary.standards.inserted += 1;
      } else {
        summary.standards.updated += 1;
      }
    }

    const pgRegulations = await pg`
      SELECT id, celex_id
      FROM regulations
      WHERE celex_id IS NOT NULL
    `;
    const pgRegulationByCelex = new Map(
      pgRegulations.map((row) => [row.celex_id as string, row.id as number])
    );

    const pgStandards = await pg`
      SELECT id, standard_code
      FROM gs1_standards
    `;
    const pgStandardByCode = new Map(
      pgStandards.map((row) => [row.standard_code as string, row.id as number])
    );

    const pgDatapoints = await pg`
      SELECT id, code
      FROM esrs_datapoints
    `;
    const pgDatapointByCode = new Map(
      pgDatapoints.map((row) => [row.code as string, row.id as number])
    );

    const pgExistingRegMappings = await pg`
      SELECT regulation_id, datapoint_id, relevance_score, reasoning
      FROM regulation_esrs_mappings
    `;
    const pgExistingRegMappingByKey = new Map(
      pgExistingRegMappings.map((row) => [
        `${row.regulation_id}:${row.datapoint_id}`,
        {
          relevanceScore: Number(row.relevance_score ?? 5),
          reasoning: row.reasoning ?? null,
        },
      ])
    );

    const legacyRegulationById = new Map(
      legacyRegulations.map((row) => [row.id, row])
    );
    const legacyStandardById = new Map(
      legacyStandards.map((row) => [row.id, row])
    );

    for (const row of legacyGs1Mappings) {
      const result = await pg`
        INSERT INTO gs1_esrs_mappings (
          mapping_id,
          level,
          esrs_standard,
          esrs_topic,
          data_point_name,
          short_name,
          definition,
          gs1_relevance,
          source_document,
          source_date,
          source_authority,
          created_at,
          updated_at
        )
        VALUES (
          ${row.mapping_id},
          ${row.level},
          ${row.esrs_standard},
          ${row.esrs_topic},
          ${row.data_point_name},
          ${row.short_name},
          ${row.definition},
          ${row.gs1_relevance},
          ${row.source_document},
          ${row.source_date},
          ${row.source_authority},
          ${isoOrNull(row.created_at)},
          ${isoOrNull(row.updated_at)}
        )
        ON CONFLICT (mapping_id) DO UPDATE SET
          level = EXCLUDED.level,
          esrs_standard = EXCLUDED.esrs_standard,
          esrs_topic = EXCLUDED.esrs_topic,
          data_point_name = EXCLUDED.data_point_name,
          short_name = EXCLUDED.short_name,
          definition = EXCLUDED.definition,
          gs1_relevance = EXCLUDED.gs1_relevance,
          source_document = EXCLUDED.source_document,
          source_date = EXCLUDED.source_date,
          source_authority = EXCLUDED.source_authority,
          updated_at = EXCLUDED.updated_at
        RETURNING (xmax = 0) AS inserted
      `;
      if (result[0]?.inserted) {
        summary.gs1Mappings.inserted += 1;
      } else {
        summary.gs1Mappings.updated += 1;
      }
    }

    for (const row of legacyRegMappings) {
      const regulationId = row.celexId
        ? pgRegulationByCelex.get(row.celexId)
        : undefined;
      const datapointId = row.datapointCode
        ? pgDatapointByCode.get(row.datapointCode)
        : undefined;

      if (!regulationId || !datapointId) {
        summary.regulationMappings.skipped += 1;
        continue;
      }

      const normalizedRelevanceScore = Number(row.relevanceScore ?? 5);
      const normalizedReasoning = row.reasoning ?? null;
      const existingMapping = pgExistingRegMappingByKey.get(
        `${regulationId}:${datapointId}`
      );

      if (
        existingMapping &&
        existingMapping.relevanceScore === normalizedRelevanceScore &&
        existingMapping.reasoning === normalizedReasoning
      ) {
        summary.regulationMappings.unchanged += 1;
        continue;
      }

      const result = await pg`
        INSERT INTO regulation_esrs_mappings (
          regulation_id,
          datapoint_id,
          relevance_score,
          reasoning
        )
        VALUES (
          ${regulationId},
          ${datapointId},
          ${normalizedRelevanceScore},
          ${normalizedReasoning}
        )
        ON CONFLICT (regulation_id, datapoint_id) DO UPDATE SET
          relevance_score = EXCLUDED.relevance_score,
          reasoning = EXCLUDED.reasoning,
          updated_at = NOW()
        RETURNING (xmax = 0) AS inserted
      `;
      if (result[0]?.inserted) {
        summary.regulationMappings.inserted += 1;
      } else {
        summary.regulationMappings.updated += 1;
      }
    }

    for (const row of legacyKnowledge) {
      let targetSourceType: "regulation" | "standard" | "esrs_datapoint";
      let targetSourceId: number | undefined;
      let regulationId: number | null = null;
      let celexId: string | null = row.celexId;

      if (row.sourceType === "regulation") {
        targetSourceType = "regulation";
        const legacyRegulation = legacyRegulationById.get(row.sourceId);
        celexId = legacyRegulation?.celexId ?? celexId;
        targetSourceId = celexId ? pgRegulationByCelex.get(celexId) : undefined;
        regulationId = targetSourceId ?? null;
      } else if (row.sourceType === "gs1_standard") {
        targetSourceType = "standard";
        const legacyStandard = legacyStandardById.get(row.sourceId);
        targetSourceId = legacyStandard
          ? pgStandardByCode.get(legacyStandard.standardCode)
          : undefined;
      } else {
        targetSourceType = "esrs_datapoint";
        const code = extractCodeFromTitle(row.title);
        targetSourceId = code ? pgDatapointByCode.get(code) : undefined;
      }

      if (!targetSourceId) {
        summary.knowledgeEmbeddings.skipped += 1;
        continue;
      }

      const key = `${targetSourceType}:${targetSourceId}:${row.contentHash}`;
      const payload = {
        sourceType: targetSourceType,
        sourceId: targetSourceId,
        content: row.content,
        contentHash: row.contentHash,
        embedding: parseJson<number[]>(row.embedding),
        embeddingModel: row.embeddingModel || "text-embedding-3-small",
        title: row.title,
        url: row.url,
        datasetId: row.datasetId,
        datasetVersion: row.datasetVersion,
        authorityLevel: row.authorityLevel,
        legalStatus: row.legalStatus,
        effectiveDate: isoOrNull(row.effectiveDate),
        expiryDate: isoOrNull(row.expiryDate),
        version: row.version,
        sourceAuthority: row.sourceAuthority,
        celexId,
        canonicalUrl: row.canonicalUrl,
        semanticLayer: row.semanticLayer,
        documentType: row.documentType,
        parentEmbeddingId: row.parentEmbeddingId,
        regulationId,
        confidenceScore:
          row.confidenceScore == null ? null : Number(row.confidenceScore),
        lastVerifiedDate: isoOrNull(row.lastVerifiedDate),
        lastVerifiedAt: isoOrNull(row.lastVerifiedAt),
        isDeprecated: Boolean(Number(row.isDeprecated)),
        deprecationReason: row.deprecationReason,
        createdAt: isoOrNull(row.createdAt) ?? new Date().toISOString(),
        updatedAt: isoOrNull(row.updatedAt) ?? new Date().toISOString(),
      };

      const existingId = pgKnowledgeByKey.get(key);
      if (existingId) {
        await pg`
          UPDATE knowledge_embeddings
          SET
            content = ${payload.content},
            embedding = ${payload.embedding},
            embedding_model = ${payload.embeddingModel},
            title = ${payload.title},
            url = ${payload.url},
            dataset_id = ${payload.datasetId},
            dataset_version = ${payload.datasetVersion},
            authority_level = ${payload.authorityLevel},
            legal_status = ${payload.legalStatus},
            effective_date = ${payload.effectiveDate},
            expiry_date = ${payload.expiryDate},
            version = ${payload.version},
            source_authority = ${payload.sourceAuthority},
            celex_id = ${payload.celexId},
            canonical_url = ${payload.canonicalUrl},
            semantic_layer = ${payload.semanticLayer},
            document_type = ${payload.documentType},
            parent_embedding_id = ${payload.parentEmbeddingId},
            regulation_id = ${payload.regulationId},
            confidence_score = ${payload.confidenceScore},
            last_verified_date = ${payload.lastVerifiedDate},
            last_verified_at = ${payload.lastVerifiedAt},
            is_deprecated = ${payload.isDeprecated},
            deprecation_reason = ${payload.deprecationReason},
            updated_at = ${payload.updatedAt}
          WHERE id = ${existingId}
        `;
        summary.knowledgeEmbeddings.updated += 1;
        continue;
      }

      await pg`
        INSERT INTO knowledge_embeddings (
          source_type,
          source_id,
          content,
          content_hash,
          embedding,
          embedding_model,
          title,
          url,
          dataset_id,
          dataset_version,
          authority_level,
          legal_status,
          effective_date,
          expiry_date,
          version,
          source_authority,
          celex_id,
          canonical_url,
          semantic_layer,
          document_type,
          parent_embedding_id,
          regulation_id,
          confidence_score,
          last_verified_date,
          last_verified_at,
          is_deprecated,
          deprecation_reason,
          created_at,
          updated_at
        )
        VALUES (
          ${payload.sourceType},
          ${payload.sourceId},
          ${payload.content},
          ${payload.contentHash},
          ${payload.embedding},
          ${payload.embeddingModel},
          ${payload.title},
          ${payload.url},
          ${payload.datasetId},
          ${payload.datasetVersion},
          ${payload.authorityLevel},
          ${payload.legalStatus},
          ${payload.effectiveDate},
          ${payload.expiryDate},
          ${payload.version},
          ${payload.sourceAuthority},
          ${payload.celexId},
          ${payload.canonicalUrl},
          ${payload.semanticLayer},
          ${payload.documentType},
          ${payload.parentEmbeddingId},
          ${payload.regulationId},
          ${payload.confidenceScore},
          ${payload.lastVerifiedDate},
          ${payload.lastVerifiedAt},
          ${payload.isDeprecated},
          ${payload.deprecationReason},
          ${payload.createdAt},
          ${payload.updatedAt}
        )
      `;
      summary.knowledgeEmbeddings.inserted += 1;
    }

    cliOut(
      `INFO=legacy_migration regulations_inserted=${summary.regulations.inserted} regulations_updated=${summary.regulations.updated}`
    );
    cliOut(
      `INFO=legacy_migration standards_inserted=${summary.standards.inserted} standards_updated=${summary.standards.updated}`
    );
    cliOut(
      `INFO=legacy_migration gs1_mappings_inserted=${summary.gs1Mappings.inserted} gs1_mappings_updated=${summary.gs1Mappings.updated}`
    );
    cliOut(
      `INFO=legacy_migration regulation_mappings_inserted=${summary.regulationMappings.inserted} regulation_mappings_updated=${summary.regulationMappings.updated} regulation_mappings_skipped=${summary.regulationMappings.skipped} regulation_mappings_unchanged=${summary.regulationMappings.unchanged}`
    );
    cliOut(
      `INFO=legacy_migration knowledge_embeddings_inserted=${summary.knowledgeEmbeddings.inserted} knowledge_embeddings_updated=${summary.knowledgeEmbeddings.updated} knowledge_embeddings_skipped=${summary.knowledgeEmbeddings.skipped}`
    );
    cliOut("DONE=legacy_tidb_to_postgres_migration_ok");
  } finally {
    await pg.end();
  }
}

if (path.resolve(process.argv[1] || "") === __filename) {
  cliOut("READY=legacy_tidb_to_postgres_migration_start");
  main().catch((error) => {
    process.stderr.write(`STOP=legacy_tidb_to_postgres_migration_failed ${error.message}\n`);
    process.exit(1);
  });
}
