import * as fs from "fs";
import * as path from "path";
import crypto from "node:crypto";
import { getDb } from "../db";
import { serverLogger } from "../_core/logger-wiring";
import {
  getIngestProvenanceContentHash,
  recordIngestProvenance,
  sha256Hex,
} from "./_core/provenance";

import {
  cbvVocabularies,
  rawCbvVocabularies,
  digitalLinkTypes,
  rawDigitalLinkTypes,
} from "../../drizzle/schema";

export interface IngestOptions {
  dryRun?: boolean;
  limit?: number;
  verbose?: boolean;
  traceId?: string;
}

export interface IngestResult {
  success: boolean;
  recordsProcessed: number;
  recordsInserted: number;
  recordsUpdated: number;
  recordsSkipped: number;
  duration?: number;
  errors?: string[];
}

interface CbvVocabularyItem {
  code: string;
  label: string;
  definition?: string;
  regulationRelevance?: string[];
}

interface DigitalLinkTypeData {
  title: string;
  description: string;
  status?: string;
  gs1Curie?: string;
  schemaOrgEquivalent?: string;
}

function loadJsonFile<T>(filePath: string): T {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, "utf8");
  return JSON.parse(content) as T;
}

const PIPELINE_TYPE = "INGEST-06_cbv_digital_link";
const PARSER_VERSION = "INGEST-06_cbv_digital_link@v1";

function getRetrievedAtIso(filePath: string): string | null {
  try {
    const st = fs.statSync(filePath);
    return new Date(st.mtimeMs).toISOString();
  } catch {
    return null;
  }
}

async function upsertProvenanceOrWarn(
  db: any,
  input: {
    itemKey: string;
    sourceLocator: string;
    retrievedAt: string | null;
    contentHash: string;
    traceId: string;
  },
  verbose: boolean
): Promise<void> {
  const prov = await recordIngestProvenance(db, {
    pipelineType: PIPELINE_TYPE,
    itemKey: input.itemKey,
    sourceLocator: input.sourceLocator,
    retrievedAt: input.retrievedAt,
    contentHash: input.contentHash,
    parserVersion: PARSER_VERSION,
    traceId: input.traceId,
  });

  if (!prov.ok && verbose) {
    serverLogger.warn("[INGEST-06] provenance upsert failed", {
      traceId: input.traceId,
      error: prov.error,
    });
  }
}

export async function ingestCbvVocabularies(
  options: IngestOptions = {}
): Promise<IngestResult> {
  const startTime = Date.now();
  const { dryRun = false, limit, verbose = false } = options;
  const traceId = options.traceId ?? crypto.randomUUID();
  const result: IngestResult = {
    success: true,
    recordsProcessed: 0,
    recordsInserted: 0,
    recordsUpdated: 0,
    recordsSkipped: 0,
    errors: [],
  };

  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database connection not available");
    }

    if (verbose) {
      serverLogger.info("Starting CBV vocabularies ingestion", { traceId });
    }

    const sourceLocator = path.join("data", "cbv", "cbv_esg_curated.json");
    const filePath = path.join(process.cwd(), sourceLocator);
    const retrievedAt = getRetrievedAtIso(filePath);
    const cbvData = loadJsonFile<Record<string, Record<string, CbvVocabularyItem>>>(filePath);

    // Flatten the nested structure
    const vocabularies: Array<{ type: string; code: string; data: CbvVocabularyItem }> = [];
    for (const [vocabType, vocabItems] of Object.entries(cbvData)) {
      // Skip metadata entries
      if (vocabType === "metadata" || vocabType === "esg_mapping_guide") {
        continue;
      }

      for (const [itemCode, itemData] of Object.entries(vocabItems)) {
        vocabularies.push({
          type: vocabType,
          code: itemCode,
          data: itemData,
        });
      }
    }

    if (verbose) {
      serverLogger.info(`Loaded ${vocabularies.length} CBV vocabulary items`, {
        traceId,
      });
    }

    for (const vocab of vocabularies) {
      if (limit !== undefined && result.recordsProcessed >= limit) {
        if (verbose) {
          serverLogger.info(`Limit reached (${limit}), stopping`);
        }
        break;
      }

      result.recordsProcessed += 1;

      if (!dryRun) {
        const itemKey = `cbv:${vocab.type}:${vocab.code}`;
        const payload = { type: vocab.type, ...vocab.data };
        const contentHash = sha256Hex(JSON.stringify(payload));
        const existingHash = await getIngestProvenanceContentHash(
          db as any,
          PIPELINE_TYPE,
          itemKey
        );
        const skipRaw = existingHash !== null && existingHash === contentHash;

        // Insert into raw table (dedupe via provenance to avoid append-only duplication)
        if (!skipRaw) {
          await db.insert(rawCbvVocabularies).values({
            rawJson: vocab.data,
          });
        } else {
          result.recordsSkipped += 1;
        }

        // Insert into canonical table
        await db.insert(cbvVocabularies).values({
          vocabularyType: vocab.type,
          code: vocab.code,
          label: vocab.data.label || vocab.code,
          definition: vocab.data.definition || null,
          regulationRelevance: vocab.data.regulationRelevance || [],
        }).onDuplicateKeyUpdate({
          set: {
            label: vocab.data.label || vocab.code,
            definition: vocab.data.definition || null,
            regulationRelevance: vocab.data.regulationRelevance || [],
          },
        });

        await upsertProvenanceOrWarn(
          db as any,
          { itemKey, sourceLocator, retrievedAt, contentHash, traceId },
          verbose
        );

        result.recordsInserted += 1;
      }

      if (verbose && result.recordsProcessed % 20 === 0) {
        serverLogger.info(`Processed ${result.recordsProcessed} vocabularies`, {
          traceId,
        });
      }
    }

    result.duration = Date.now() - startTime;
    if (verbose) {
      serverLogger.info(
        `CBV vocabularies ingestion complete: ${result.recordsInserted} inserted in ${result.duration}ms`,
        { traceId }
      );
    }
  } catch (error) {
    result.success = false;
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.errors?.push(errorMessage);
    await serverLogger.error(error, {
      traceId,
      code: "INGEST-06_CBV_VOCABULARIES",
      classification: "ingest",
      affectedFiles: ["server/ingest/INGEST-06_cbv_digital_link.ts"],
      failingInputs: { pipelineType: PIPELINE_TYPE, stage: "cbv_vocabularies" },
    });
  }

  return result;
}

export async function ingestDigitalLinkTypes(
  options: IngestOptions = {}
): Promise<IngestResult> {
  const startTime = Date.now();
  const { dryRun = false, limit, verbose = false } = options;
  const traceId = options.traceId ?? crypto.randomUUID();
  const result: IngestResult = {
    success: true,
    recordsProcessed: 0,
    recordsInserted: 0,
    recordsUpdated: 0,
    recordsSkipped: 0,
    errors: [],
  };

  try {
    const db = await getDb();
    if (!db) {
      throw new Error("Database connection not available");
    }

    if (verbose) {
      serverLogger.info("Starting Digital Link types ingestion", { traceId });
    }

    const sourceLocator = path.join(
      "data",
      "digital_link",
      "linktypes.json"
    );
    const filePath = path.join(process.cwd(), sourceLocator);
    const retrievedAt = getRetrievedAtIso(filePath);
    const linkTypesData = loadJsonFile<Record<string, DigitalLinkTypeData>>(filePath);

    const linkTypes = Object.entries(linkTypesData);

    if (verbose) {
      serverLogger.info(`Loaded ${linkTypes.length} Digital Link types`, {
        traceId,
      });
    }

    for (const [linkType, linkData] of linkTypes) {
      if (limit !== undefined && result.recordsProcessed >= limit) {
        if (verbose) {
          serverLogger.info(`Limit reached (${limit}), stopping`);
        }
        break;
      }

      result.recordsProcessed += 1;

      if (!dryRun) {
        const itemKey = `digital_link:${linkType}`;
        const contentHash = sha256Hex(JSON.stringify({ linkType, ...linkData }));
        const existingHash = await getIngestProvenanceContentHash(
          db as any,
          PIPELINE_TYPE,
          itemKey
        );
        const skipRaw = existingHash !== null && existingHash === contentHash;

        // Insert into raw table (dedupe via provenance to avoid append-only duplication)
        if (!skipRaw) {
          await db.insert(rawDigitalLinkTypes).values({
            rawJson: linkData,
          });
        } else {
          result.recordsSkipped += 1;
        }

        // Insert into canonical table
        await db.insert(digitalLinkTypes).values({
          linkType,
          title: linkData.title,
          description: linkData.description || null,
          gs1Curie: linkData.gs1Curie || null,
          schemaOrgEquivalent: linkData.schemaOrgEquivalent || null,
        }).onDuplicateKeyUpdate({
          set: {
            title: linkData.title,
            description: linkData.description || null,
            gs1Curie: linkData.gs1Curie || null,
            schemaOrgEquivalent: linkData.schemaOrgEquivalent || null,
          },
        });

        await upsertProvenanceOrWarn(
          db as any,
          { itemKey, sourceLocator, retrievedAt, contentHash, traceId },
          verbose
        );

        result.recordsInserted += 1;
      }

      if (verbose && result.recordsProcessed % 10 === 0) {
        serverLogger.info(`Processed ${result.recordsProcessed} link types`, {
          traceId,
        });
      }
    }

    result.duration = Date.now() - startTime;
    if (verbose) {
      serverLogger.info(
        `Digital Link types ingestion complete: ${result.recordsInserted} inserted in ${result.duration}ms`,
        { traceId }
      );
    }
  } catch (error) {
    result.success = false;
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.errors?.push(errorMessage);
    await serverLogger.error(error, {
      traceId,
      code: "INGEST-06_DIGITAL_LINK_TYPES",
      classification: "ingest",
      affectedFiles: ["server/ingest/INGEST-06_cbv_digital_link.ts"],
      failingInputs: { pipelineType: PIPELINE_TYPE, stage: "digital_link_types" },
    });
  }

  return result;
}

export async function ingestCbvDigitalLink(
  options: IngestOptions = {}
): Promise<IngestResult> {
  const { verbose = false } = options;
  const startTime = Date.now();
  const traceId = options.traceId ?? crypto.randomUUID();

  if (verbose) {
    serverLogger.info("=== INGEST-06: CBV Vocabularies & Digital Link Types ===", {
      traceId,
    });
  }

  const cbvResult = await ingestCbvVocabularies({ ...options, traceId });
  const linkResult = await ingestDigitalLinkTypes({ ...options, traceId });

  const combinedResult: IngestResult = {
    success: cbvResult.success && linkResult.success,
    recordsProcessed: cbvResult.recordsProcessed + linkResult.recordsProcessed,
    recordsInserted: cbvResult.recordsInserted + linkResult.recordsInserted,
    recordsUpdated: cbvResult.recordsUpdated + linkResult.recordsUpdated,
    recordsSkipped: cbvResult.recordsSkipped + linkResult.recordsSkipped,
    duration: Date.now() - startTime,
    errors: [...(cbvResult.errors || []), ...(linkResult.errors || [])],
  };

  if (verbose) {
    serverLogger.info("\n=== INGEST-06 Summary ===", { traceId });
    serverLogger.info(`CBV Vocabularies: ${cbvResult.recordsInserted}`, {
      traceId,
    });
    serverLogger.info(`Digital Link Types: ${linkResult.recordsInserted}`, {
      traceId,
    });
    serverLogger.info(`Total: ${combinedResult.recordsInserted} records`, {
      traceId,
    });
    serverLogger.info(`Duration: ${combinedResult.duration}ms`, { traceId });
  }

  return combinedResult;
}
