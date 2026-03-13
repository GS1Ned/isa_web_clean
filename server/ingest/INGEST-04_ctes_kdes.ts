import * as fs from "fs";
import * as path from "path";
import crypto from "node:crypto";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { serverLogger } from "../_core/logger-wiring";
import {
  getIngestProvenanceContentHash,
  recordIngestProvenance,
  sha256Hex,
} from "./_core/provenance";

import {
  ctes,
  kdes,
  cteKdeMappings,
  rawCtesKdes,
} from "../../drizzle_pg/schema";

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

interface KdeRaw {
  kde: string;
  description: string;
  gs1Standard: string;
}

interface CteRaw {
  cteId: string;
  cteName: string;
  description: string;
  typicalKDEs: KdeRaw[];
  exampleStandards?: string[];
  exampleRegulations?: string[];
}

function loadJsonFile<T>(filePath: string): T {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, "utf8");
  return JSON.parse(content) as T;
}

const PIPELINE_TYPE = "INGEST-04_ctes_kdes";
const PARSER_VERSION = "INGEST-04_ctes_kdes@v1";

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
    serverLogger.warn("[INGEST-04] provenance upsert failed", {
      traceId: input.traceId,
      error: prov.error,
    });
  }
}

export async function ingestCtesKdes(
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
      serverLogger.info("Starting CTEs and KDEs ingestion", { traceId });
    }

    const sourceLocator = path.join("data", "esg", "ctes_and_kdes.json");
    const filePath = path.join(process.cwd(), sourceLocator);
    const retrievedAt = getRetrievedAtIso(filePath);
    const ctesList = loadJsonFile<CteRaw[]>(filePath);

    if (verbose) {
      serverLogger.info(`Loaded ${ctesList.length} CTEs`, { traceId });
    }

    // Track unique KDEs
    const kdeMap = new Map<string, { name: string; description: string; gs1Standard: string }>();
    
    // First pass: collect all unique KDEs
    for (const cte of ctesList) {
      for (const kde of cte.typicalKDEs) {
        if (!kdeMap.has(kde.kde)) {
          kdeMap.set(kde.kde, {
            name: kde.kde,
            description: kde.description,
            gs1Standard: kde.gs1Standard,
          });
        }
      }
    }

    if (verbose) {
      serverLogger.info(`Found ${kdeMap.size} unique KDEs`, { traceId });
    }

    // Insert KDEs first
    const kdeIdMap = new Map<string, number>();
    let kdeCount = 0;

    for (const [kdeCode, kdeData] of Array.from(kdeMap)) {
      if (limit !== undefined && kdeCount >= limit) {
        break;
      }

      if (!dryRun) {
        await db
          .insert(kdes)
          .values({
            code: kdeCode,
            name: kdeData.name,
            description: kdeData.description,
            dataType: kdeData.gs1Standard,
            mandatory: 0,
          })
          .onDuplicateKeyUpdate({
            set: {
              name: kdeData.name,
              description: kdeData.description,
              dataType: kdeData.gs1Standard,
              mandatory: 0,
            },
          });

        // Get the ID (whether just inserted or already exists)
        const [kdeRecord] = await db.select().from(kdes).where(eq(kdes.code, kdeCode)).limit(1);
        if (kdeRecord) {
          kdeIdMap.set(kdeCode, kdeRecord.id);
        }

        const itemKey = `kde:${kdeCode}`;
        const contentHash = sha256Hex(JSON.stringify({ code: kdeCode, ...kdeData }));
        await upsertProvenanceOrWarn(
          db as any,
          { itemKey, sourceLocator, retrievedAt, contentHash, traceId },
          verbose
        );
      }

      kdeCount += 1;
      result.recordsInserted += 1;
    }

    // Insert CTEs and mappings
    let cteCount = 0;
    for (const cte of ctesList) {
      if (limit !== undefined && cteCount >= limit) {
        if (verbose) {
          serverLogger.info(`Limit reached (${limit}), stopping`, { traceId });
        }
        break;
      }

      result.recordsProcessed += 1;

      if (!dryRun) {
        const itemKey = `cte:${cte.cteId}`;
        const contentHash = sha256Hex(JSON.stringify(cte));
        const existingHash = await getIngestProvenanceContentHash(
          db as any,
          PIPELINE_TYPE,
          itemKey
        );
        const skipRaw = existingHash !== null && existingHash === contentHash;

        // Insert into raw table (dedupe via provenance to avoid append-only duplication)
        if (!skipRaw) {
          await db.insert(rawCtesKdes).values({
            rawJson: cte,
          });
        } else {
          result.recordsSkipped += 1;
        }

        // Insert CTE
        await db
          .insert(ctes)
          .values({
            code: cte.cteId,
            name: cte.cteName,
            description: cte.description,
            category: cte.exampleStandards?.join(", ") || null,
            regulationContext: cte.exampleRegulations?.join(", ") || null,
          })
          .onDuplicateKeyUpdate({
            set: {
              name: cte.cteName,
              description: cte.description,
              category: cte.exampleStandards?.join(", ") || null,
              regulationContext: cte.exampleRegulations?.join(", ") || null,
            },
          });

        // Get CTE ID
        const [cteRecord] = await db.select().from(ctes).where(eq(ctes.code, cte.cteId)).limit(1);
        
        if (cteRecord) {
          // Insert CTE-KDE mappings
          for (const kde of cte.typicalKDEs) {
            const kdeId = kdeIdMap.get(kde.kde);
            if (kdeId) {
              await db.insert(cteKdeMappings).values({
                cteId: cteRecord.id,
                kdeId,
                required: 1,
              }).onDuplicateKeyUpdate({
                set: { required: 1 },
              });
            }
          }
        }

        await upsertProvenanceOrWarn(
          db as any,
          { itemKey, sourceLocator, retrievedAt, contentHash, traceId },
          verbose
        );

        result.recordsInserted += 1;
      }

      cteCount += 1;

      if (verbose && cteCount % 2 === 0) {
        serverLogger.info(`Processed ${cteCount} CTEs`, { traceId });
      }
    }

    result.duration = Date.now() - startTime;
    if (verbose) {
      serverLogger.info(
        `CTEs/KDEs ingestion complete: ${kdeCount} KDEs + ${cteCount} CTEs in ${result.duration}ms`,
        { traceId }
      );
    }
  } catch (error) {
    result.success = false;
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.errors?.push(errorMessage);
    await serverLogger.error(error, {
      traceId,
      code: "INGEST-04_CTES_KDES",
      classification: "ingest",
      affectedFiles: ["server/ingest/INGEST-04_ctes_kdes.ts"],
      failingInputs: { pipelineType: PIPELINE_TYPE },
    });
  }

  return result;
}
