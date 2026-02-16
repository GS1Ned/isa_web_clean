import crypto from "node:crypto";
import { sql } from "drizzle-orm";

export type IngestProvenanceInput = {
  pipelineType: string;
  itemKey: string;
  sourceLocator?: string | null;
  retrievedAt?: string | null;
  contentHash?: string | null;
  parserVersion?: string | null;
  lastIngestedAt?: string | null;
  traceId?: string | null;
};

export type IngestProvenanceWriteResult =
  | { ok: true }
  | { ok: false; error: string };

export function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export async function getIngestProvenanceContentHash(
  db: any,
  pipelineType: string,
  itemKey: string
): Promise<string | null> {
  if (!db || typeof db.execute !== "function") {
    return null;
  }

  try {
    const [rows] = await db.execute(sql`
      SELECT content_hash
      FROM ingest_item_provenance
      WHERE pipeline_type = ${pipelineType}
        AND item_key = ${itemKey}
      LIMIT 1
    `);
    const first = (rows as any[])?.[0];
    const value = first?.content_hash;
    return typeof value === "string" && value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

export async function recordIngestProvenance(
  db: any,
  input: IngestProvenanceInput
): Promise<IngestProvenanceWriteResult> {
  if (!db || typeof db.execute !== "function") {
    return { ok: false, error: "db_execute_unavailable" };
  }

  try {
    const lastIngestedAt = input.lastIngestedAt ?? new Date().toISOString();

    await db.execute(sql`
      INSERT INTO ingest_item_provenance (
        pipeline_type,
        item_key,
        source_locator,
        retrieved_at,
        content_hash,
        parser_version,
        last_ingested_at,
        trace_id
      ) VALUES (
        ${input.pipelineType},
        ${input.itemKey},
        ${input.sourceLocator ?? null},
        ${input.retrievedAt ?? null},
        ${input.contentHash ?? null},
        ${input.parserVersion ?? null},
        ${lastIngestedAt},
        ${input.traceId ?? null}
      )
      ON DUPLICATE KEY UPDATE
        source_locator = VALUES(source_locator),
        retrieved_at = VALUES(retrieved_at),
        content_hash = VALUES(content_hash),
        parser_version = VALUES(parser_version),
        last_ingested_at = VALUES(last_ingested_at),
        trace_id = VALUES(trace_id);
    `);

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}
