import "dotenv/config";

import { createHash } from "node:crypto";

import { createPostgresDb } from "../../server/db-connection-pg";
import { deriveCatalogAuthorityTier } from "../../server/catalog-authority";

type KnowledgeRow = {
  id: number;
  source_type: "regulation" | "standard" | "esrs_datapoint";
  source_id: number;
  title: string;
  content: string;
  content_hash: string;
  url: string | null;
  dataset_id: string | null;
  dataset_version: string | null;
  source_authority: string | null;
  canonical_url: string | null;
  last_verified_date: string | null;
  last_verified_at: string | null;
  created_at: string;
  updated_at: string;
  is_deprecated: boolean;
  deprecation_reason: string | null;
  source_chunk_id: number | null;
  version: string | null;
  authority_level: string | null;
  legal_status: string | null;
};

const DATASET_ID_FALLBACK: Record<KnowledgeRow["source_type"], string> = {
  regulation: "isa.runtime.regulations",
  standard: "isa.runtime.gs1_standards",
  esrs_datapoint: "isa.runtime.esrs_datapoints",
};

// Keep aligned with the authoritative EFRAG posture already exposed by
// server/routers/standards-directory.ts.
const EFRAG_LAB6_SOURCE_LOCATOR = "https://www.efrag.org/lab6";
const EFRAG_LAB6_LAST_VERIFIED_DATE = "2025-12-13";

function toPublisherUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function toSourceType(group: KnowledgeRow[], authorityTier: string): string {
  const first = group[0];
  if (first.source_type === "regulation") {
    return group.some((row) => row.title.toLowerCase().includes("directive"))
      ? "eu_directive"
      : "eu_regulation";
  }
  if (first.source_type === "standard") {
    return authorityTier === "GS1_MO" ? "gs1_regional_standard" : "gs1_global_standard";
  }
  return "official_guidance";
}

function inferSourceRole(group: KnowledgeRow[], authorityTier: string, sourceLocator?: string | null): string {
  const first = group[0];
  if (first.source_type === "regulation") return "normative_authority";
  if (first.source_type === "standard") {
    if (authorityTier === "GS1_Global" || authorityTier === "GS1_MO") {
      return "normative_authority";
    }
    return sourceLocator ? "canonical_technical_artifact" : "supplemental_source";
  }
  if (first.source_type === "esrs_datapoint") return "canonical_technical_artifact";
  return "supplemental_source";
}

function inferAdmissionBasis(sourceRole: string, sourceLocator?: string | null): string {
  if (sourceRole === "normative_authority") return "official_publication";
  if (sourceRole === "canonical_technical_artifact") {
    return sourceLocator ? "registry_registered_artifact" : "canonical_publication_evidence";
  }
  return "supplemental_only";
}

function inferPublicationStatus(group: KnowledgeRow[]): string {
  if (group.some((row) => row.is_deprecated)) return "superseded";
  return "in_force";
}

function inferAuthorityLevel(sourceRole: string): number {
  if (sourceRole === "normative_authority") return 1;
  if (sourceRole === "canonical_technical_artifact") return 2;
  return 4;
}

function inferChunkType(row: KnowledgeRow): string {
  if (row.source_type === "regulation") return "article";
  if (row.source_type === "standard") return "section";
  if (row.source_type === "esrs_datapoint") return "requirement";
  return "paragraph";
}

function buildSourceSeed(group: KnowledgeRow[], domainRow?: Record<string, unknown> | null) {
  const first = group[0];
  const sourceLocator =
    (typeof domainRow?.source_url === "string" ? (domainRow.source_url as string) : null) ||
    (typeof domainRow?.reference_url === "string" ? (domainRow.reference_url as string) : null) ||
    (first.source_type === "esrs_datapoint" ? EFRAG_LAB6_SOURCE_LOCATOR : null) ||
    first.canonical_url ||
    first.url ||
    null;
  const publisher =
    (typeof domainRow?.publisher === "string" ? (domainRow.publisher as string) : null) ||
    first.source_authority ||
    (first.source_type === "regulation" ? "European Union" : null) ||
    (first.source_type === "standard" ? "GS1" : null) ||
    (first.source_type === "esrs_datapoint" ? "EFRAG" : null);
  const authorityTier = deriveCatalogAuthorityTier({
    url: sourceLocator,
    sourceAuthority: first.source_authority || publisher,
    publisher,
  });
  const sourceRole = inferSourceRole(group, authorityTier, sourceLocator);
  const publicationStatus = inferPublicationStatus(group);
  const version =
    (typeof domainRow?.version === "string" ? (domainRow.version as string) : null) ||
    first.version ||
    first.dataset_version ||
    null;
  const datasetId = first.dataset_id || DATASET_ID_FALLBACK[first.source_type];
  const contentHash = createHash("sha256")
    .update(group.map((row) => row.content_hash).sort().join("\n"))
    .digest("hex");
  const lastVerifiedDate =
    (typeof domainRow?.last_verified_at === "string" ? (domainRow.last_verified_at as string) : null) ||
    (first.source_type === "esrs_datapoint" ? EFRAG_LAB6_LAST_VERIFIED_DATE : null) ||
    first.last_verified_at ||
    first.last_verified_date ||
    null;

  const name =
    (typeof domainRow?.title === "string" ? (domainRow.title as string) : null) ||
    (typeof domainRow?.standard_name === "string" ? (domainRow.standard_name as string) : null) ||
    (typeof domainRow?.name === "string" ? (domainRow.name as string) : null) ||
    first.title;
  const acronym =
    (typeof domainRow?.regulation_type === "string" ? (domainRow.regulation_type as string) : null) ||
    (typeof domainRow?.standard_code === "string" ? (domainRow.standard_code as string) : null) ||
    (typeof domainRow?.code === "string" ? (domainRow.code as string) : null) ||
    null;

  return {
    externalId: `phase3:${first.source_type}:${first.source_id}`,
    datasetId,
    name,
    acronym,
    sourceType: toSourceType(group, authorityTier),
    authorityLevel: inferAuthorityLevel(sourceRole),
    authorityTier,
    sourceRole,
    publicationStatus,
    immutableUri: first.canonical_url || null,
    sourceLocator,
    publisher,
    publisherUrl: toPublisherUrl(sourceLocator),
    version,
    publicationDate:
      (typeof domainRow?.publication_date === "string" ? (domainRow.publication_date as string) : null) ||
      null,
    effectiveDate:
      (typeof domainRow?.effective_date === "string" ? (domainRow.effective_date as string) : null) ||
      null,
    officialUrl: sourceLocator,
    archiveUrl: null,
    status: group.some((row) => row.is_deprecated) ? "superseded" : "active",
    retrievedAt: first.updated_at || first.created_at,
    lastVerifiedDate,
    verificationStatus: lastVerifiedDate ? "verified" : "pending",
    contentHash,
    description:
      (typeof domainRow?.description === "string" ? (domainRow.description as string) : null) ||
      null,
    admissionBasis: inferAdmissionBasis(sourceRole, sourceLocator),
    language: "en",
  };
}

function buildDomainMaps(regulations: any[], standards: any[], datapoints: any[]) {
  return {
    regulation: new Map(regulations.map((row) => [row.id, row])),
    standard: new Map(standards.map((row) => [row.id, row])),
    esrs_datapoint: new Map(datapoints.map((row) => [row.id, row])),
  };
}

async function ensureSource(sql: any, seed: ReturnType<typeof buildSourceSeed>) {
  const existing = await sql`
    select id
    from sources
    where external_id = ${seed.externalId}
    limit 1
  `;

  if (existing[0]?.id) {
    await sql`
      update sources
      set
        dataset_id = ${seed.datasetId},
        name = ${seed.name},
        acronym = ${seed.acronym},
        source_type = ${seed.sourceType},
        authority_level = ${seed.authorityLevel},
        authority_tier = ${seed.authorityTier},
        source_role = ${seed.sourceRole},
        publication_status = ${seed.publicationStatus},
        immutable_uri = ${seed.immutableUri},
        source_locator = ${seed.sourceLocator},
        publisher = ${seed.publisher},
        publisher_url = ${seed.publisherUrl},
        version = ${seed.version},
        publication_date = ${seed.publicationDate},
        effective_date = ${seed.effectiveDate},
        official_url = ${seed.officialUrl},
        status = ${seed.status},
        retrieved_at = ${seed.retrievedAt},
        last_verified_date = ${seed.lastVerifiedDate},
        verification_status = ${seed.verificationStatus},
        content_hash = ${seed.contentHash},
        description = ${seed.description},
        admission_basis = ${seed.admissionBasis},
        updated_at = now()
      where id = ${existing[0].id}
    `;
    return Number(existing[0].id);
  }

  const inserted = await sql`
    insert into sources (
      name,
      acronym,
      external_id,
      dataset_id,
      source_type,
      authority_level,
      authority_tier,
      source_role,
      publication_status,
      immutable_uri,
      source_locator,
      publisher,
      publisher_url,
      version,
      publication_date,
      effective_date,
      official_url,
      status,
      ingestion_date,
      retrieved_at,
      last_verified_date,
      verification_status,
      content_hash,
      description,
      admission_basis,
      language,
      created_by
    ) values (
      ${seed.name},
      ${seed.acronym},
      ${seed.externalId},
      ${seed.datasetId},
      ${seed.sourceType},
      ${seed.authorityLevel},
      ${seed.authorityTier},
      ${seed.sourceRole},
      ${seed.publicationStatus},
      ${seed.immutableUri},
      ${seed.sourceLocator},
      ${seed.publisher},
      ${seed.publisherUrl},
      ${seed.version},
      ${seed.publicationDate},
      ${seed.effectiveDate},
      ${seed.officialUrl},
      ${seed.status},
      now(),
      ${seed.retrievedAt},
      ${seed.lastVerifiedDate},
      ${seed.verificationStatus},
      ${seed.contentHash},
      ${seed.description},
      ${seed.admissionBasis},
      ${seed.language},
      'phase3-provenance-rebuild'
    )
    returning id
  `;

  return Number(inserted[0].id);
}

async function ensureSourceChunk(sql: any, sourceId: number, knowledgeRow: KnowledgeRow) {
  const existing = await sql`
    select id
    from source_chunks
    where source_id = ${sourceId}
      and chunk_index = ${knowledgeRow.id}
    limit 1
  `;

  if (existing[0]?.id) {
    await sql`
      update source_chunks
      set
        chunk_type = ${inferChunkType(knowledgeRow)},
        section_path = ${knowledgeRow.title},
        heading = ${knowledgeRow.title},
        content = ${knowledgeRow.content},
        content_hash = ${knowledgeRow.content_hash},
        char_start = 0,
        char_end = ${knowledgeRow.content.length},
        version = ${knowledgeRow.version || knowledgeRow.dataset_version},
        is_active = ${!knowledgeRow.is_deprecated},
        deprecated_at = ${knowledgeRow.is_deprecated ? knowledgeRow.updated_at : null},
        deprecation_reason = ${knowledgeRow.deprecation_reason},
        updated_at = now()
      where id = ${existing[0].id}
    `;
    return Number(existing[0].id);
  }

  const inserted = await sql`
    insert into source_chunks (
      source_id,
      chunk_index,
      chunk_type,
      section_path,
      heading,
      content,
      content_hash,
      char_start,
      char_end,
      version,
      is_active,
      deprecated_at,
      deprecation_reason,
      created_at,
      updated_at
    ) values (
      ${sourceId},
      ${knowledgeRow.id},
      ${inferChunkType(knowledgeRow)},
      ${knowledgeRow.title},
      ${knowledgeRow.title},
      ${knowledgeRow.content},
      ${knowledgeRow.content_hash},
      0,
      ${knowledgeRow.content.length},
      ${knowledgeRow.version || knowledgeRow.dataset_version},
      ${!knowledgeRow.is_deprecated},
      ${knowledgeRow.is_deprecated ? knowledgeRow.updated_at : null},
      ${knowledgeRow.deprecation_reason},
      now(),
      now()
    )
    returning id
  `;

  return Number(inserted[0].id);
}

async function updateKnowledgeBridge(
  sql: any,
  knowledgeRow: KnowledgeRow,
  sourceChunkId: number,
  seed: ReturnType<typeof buildSourceSeed>,
) {
  await sql`
    update knowledge_embeddings
    set
      source_chunk_id = ${sourceChunkId},
      dataset_id = coalesce(dataset_id, ${seed.datasetId}),
      dataset_version = coalesce(dataset_version, ${seed.version}),
      url = coalesce(url, ${seed.sourceLocator}),
      canonical_url = coalesce(canonical_url, ${seed.immutableUri}, ${seed.sourceLocator}),
      source_authority = coalesce(source_authority, ${seed.publisher}),
      last_verified_date = coalesce(last_verified_date, ${seed.lastVerifiedDate}),
      version = coalesce(version, ${seed.version}),
      updated_at = now()
    where id = ${knowledgeRow.id}
  `;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL_POSTGRES;
  if (!databaseUrl) {
    console.error("STOP=provenance_bridge_database_url_missing");
    process.exit(1);
  }

  const { sql } = createPostgresDb(databaseUrl);

  try {
    console.log("READY=phase3_provenance_bridge_start");

    const columns = await sql`
      select column_name
      from information_schema.columns
      where table_schema = 'public'
        and table_name = 'knowledge_embeddings'
        and column_name = 'source_chunk_id'
    `;
    if (columns.length === 0) {
      console.error("STOP=phase3_provenance_bridge_missing_schema source_chunk_id");
      process.exit(1);
    }

    const knowledgeRows = (await sql`
      select
        id,
        source_type,
        source_id,
        title,
        content,
        content_hash,
        url,
        dataset_id,
        dataset_version,
        source_authority,
        canonical_url,
        last_verified_date,
        last_verified_at,
        created_at,
        updated_at,
        is_deprecated,
        deprecation_reason,
        source_chunk_id,
        version,
        authority_level,
        legal_status
      from knowledge_embeddings
      order by source_type, source_id, id
    `) as KnowledgeRow[];

    const [regulations, standards, datapoints] = await Promise.all([
      sql`select id, title, description, celex_id, source_url, effective_date, regulation_type, last_verified_at from regulations`,
      sql`select id, standard_code, standard_name, description, category, reference_url, source_url, version, publication_date, publisher, last_verified_at from gs1_standards`,
      sql`select id, code, name, esrs_standard, disclosure_requirement, data_type, voluntary from esrs_datapoints`,
    ]);

    const domainMaps = buildDomainMaps(regulations, standards, datapoints);
    const grouped = new Map<string, KnowledgeRow[]>();
    for (const row of knowledgeRows) {
      const key = `${row.source_type}:${row.source_id}`;
      const existing = grouped.get(key) || [];
      existing.push(row);
      grouped.set(key, existing);
    }

    let sourcesCreated = 0;
    let sourcesUpdated = 0;
    let chunksCreated = 0;
    let chunksUpdated = 0;
    let knowledgeBridged = 0;

    for (const [key, group] of grouped.entries()) {
      const first = group[0];
      const domainRow = domainMaps[first.source_type]?.get(first.source_id) || null;
      const seed = buildSourceSeed(group, domainRow);

      const existingBefore = await sql`
        select id
        from sources
        where external_id = ${seed.externalId}
        limit 1
      `;
      const sourceId = await ensureSource(sql, seed);
      if (existingBefore[0]?.id) sourcesUpdated += 1;
      else sourcesCreated += 1;

      for (const row of group) {
        const hadBridge = Boolean(row.source_chunk_id);
        const existingChunk = await sql`
          select id
          from source_chunks
          where source_id = ${sourceId}
            and chunk_index = ${row.id}
          limit 1
        `;
        const sourceChunkId = await ensureSourceChunk(sql, sourceId, row);
        if (existingChunk[0]?.id) chunksUpdated += 1;
        else chunksCreated += 1;
        await updateKnowledgeBridge(sql, row, sourceChunkId, seed);
        if (!hadBridge || row.source_chunk_id !== sourceChunkId) {
          knowledgeBridged += 1;
        }
      }
    }

    const counts = await sql`
      select
        (select count(*)::int from sources) as sources_count,
        (select count(*)::int from source_chunks) as chunks_count,
        (select count(*)::int from knowledge_embeddings where source_chunk_id is not null) as bridged_embeddings
    `;

    console.log(
      `DONE=phase3_provenance_bridge_ok sources_created=${sourcesCreated} sources_updated=${sourcesUpdated} chunks_created=${chunksCreated} chunks_updated=${chunksUpdated} knowledge_bridged=${knowledgeBridged} total_sources=${counts[0].sources_count} total_chunks=${counts[0].chunks_count} total_bridged=${counts[0].bridged_embeddings}`,
    );
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error("STOP=phase3_provenance_bridge_failed");
  console.error(error);
  process.exit(1);
});
