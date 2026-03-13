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
  gdsnClasses,
  rawGdsnClasses,
  gdsnClassAttributes,
  rawGdsnClassAttributes,
  gdsnValidationRules,
  rawGdsnValidationRules,
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

interface GdsnClassRaw {
  id: number;
  name: string;
  definition?: string;
  type?: number;
  extensions?: unknown[];
}

interface GdsnAttributeRaw {
  id: number;
  name: string;
  definition?: string;
  parentClassId?: number;
  dataClassId?: number;
  type?: number;
  multiplicity?: string;
  extensions?: unknown[];
}

interface GdsnValidationRuleRaw {
  id: number;
  sunrise?: string;
  messageName?: string;
  structuredRule?: string;
  errorMessageDescription?: string;
  type?: string | null;
  contexts?: string[];
  bmsIds?: number[];
}

function loadJsonFile<T>(filePath: string): T[] {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, "utf8");
  return JSON.parse(content) as T[];
}

const PIPELINE_TYPE = "INGEST-02_gdsn_current";
const PARSER_VERSION = "INGEST-02_gdsn_current@v1";

function getRetrievedAtIso(filePath: string): string | null {
  try {
    const st = fs.statSync(filePath);
    return new Date(st.mtimeMs).toISOString();
  } catch {
    return null;
  }
}

async function shouldSkipByProvenance(
  db: any,
  itemKey: string,
  contentHash: string
): Promise<boolean> {
  const existing = await getIngestProvenanceContentHash(
    db,
    PIPELINE_TYPE,
    itemKey
  );
  return existing !== null && existing === contentHash;
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
    serverLogger.warn("[INGEST-02] provenance upsert failed", {
      traceId: input.traceId,
      error: prov.error,
    });
  }
}

export async function ingestGdsnClasses(
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
      serverLogger.info("Starting GDSN classes ingestion", { traceId });
    }

    const sourceLocator = path.join("data", "gs1", "gdsn", "gdsn_classes.json");
    const filePath = path.join(process.cwd(), sourceLocator);
    const retrievedAt = getRetrievedAtIso(filePath);
    const classes = loadJsonFile<GdsnClassRaw>(filePath);

    if (verbose) {
      serverLogger.info(`Loaded ${classes.length} GDSN classes`, { traceId });
    }

    for (const cls of classes) {
      if (limit !== undefined && result.recordsProcessed >= limit) {
        if (verbose) {
          serverLogger.info(`Limit reached (${limit}), stopping`, { traceId });
        }
        break;
      }

      result.recordsProcessed += 1;

      if (!dryRun) {
        const itemKey = `class:${cls.id}`;
        const contentHash = sha256Hex(JSON.stringify(cls));

        if (await shouldSkipByProvenance(db as any, itemKey, contentHash)) {
          result.recordsSkipped += 1;
          await upsertProvenanceOrWarn(
            db as any,
            { itemKey, sourceLocator, retrievedAt, contentHash, traceId },
            verbose
          );
          continue;
        }

        // Insert into raw table
        await db.insert(rawGdsnClasses).values({
          id: cls.id,
          name: cls.name,
          definition: cls.definition || null,
          type: cls.type || null,
          extensions: cls.extensions || null,
          rawJson: cls,
        }).onDuplicateKeyUpdate({
          set: {
            name: cls.name,
            definition: cls.definition || null,
            type: cls.type || null,
            extensions: cls.extensions || null,
            rawJson: cls,
          },
        });

        // Insert into canonical table
        await db.insert(gdsnClasses).values({
          id: cls.id,
          name: cls.name,
          definition: cls.definition || null,
          type: cls.type || null,
          extensions: cls.extensions || null,
        }).onDuplicateKeyUpdate({
          set: {
            name: cls.name,
            definition: cls.definition || null,
            type: cls.type || null,
            extensions: cls.extensions || null,
          },
        });

        await upsertProvenanceOrWarn(
          db as any,
          { itemKey, sourceLocator, retrievedAt, contentHash, traceId },
          verbose
        );

        result.recordsInserted += 1;
      }

      if (verbose && result.recordsProcessed % 100 === 0) {
        serverLogger.info(`Processed ${result.recordsProcessed} classes`, {
          traceId,
        });
      }
    }

    result.duration = Date.now() - startTime;
    if (verbose) {
      serverLogger.info(
        `GDSN classes ingestion complete: ${result.recordsInserted} inserted in ${result.duration}ms`,
        { traceId }
      );
    }
  } catch (error) {
    result.success = false;
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.errors?.push(errorMessage);
    await serverLogger.error(error, {
      traceId,
      code: "INGEST-02_GDSN_CLASSES",
      classification: "ingest",
      affectedFiles: ["server/ingest/INGEST-02_gdsn_current.ts"],
      failingInputs: { pipelineType: PIPELINE_TYPE, stage: "classes" },
    });
  }

  return result;
}

export async function ingestGdsnClassAttributes(
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
      serverLogger.info("Starting GDSN class attributes ingestion", { traceId });
    }

    const sourceLocator = path.join(
      "data",
      "gs1",
      "gdsn",
      "gdsn_classAttributes.json"
    );
    const filePath = path.join(process.cwd(), sourceLocator);
    const retrievedAt = getRetrievedAtIso(filePath);
    const attributes = loadJsonFile<GdsnAttributeRaw>(filePath);

    if (verbose) {
      serverLogger.info(`Loaded ${attributes.length} GDSN class attributes`, {
        traceId,
      });
    }

    for (const attr of attributes) {
      if (limit !== undefined && result.recordsProcessed >= limit) {
        if (verbose) {
          serverLogger.info(`Limit reached (${limit}), stopping`, { traceId });
        }
        break;
      }

      result.recordsProcessed += 1;

      if (!dryRun) {
        const classId = attr.parentClassId || 0;
        const itemKey = `attr:${classId}:${attr.name}`;
        const contentHash = sha256Hex(JSON.stringify(attr));

        if (await shouldSkipByProvenance(db as any, itemKey, contentHash)) {
          result.recordsSkipped += 1;
          await upsertProvenanceOrWarn(
            db as any,
            { itemKey, sourceLocator, retrievedAt, contentHash, traceId },
            verbose
          );
          continue;
        }

        // Insert into raw table
        await db
          .insert(rawGdsnClassAttributes)
          .values({
            classId,
            attributeCode: attr.name,
            attributeName: attr.definition || attr.name,
            dataType: attr.type ? String(attr.type) : null,
            required: attr.multiplicity?.includes("1") ? 1 : 0,
            rawJson: attr,
          })
          .onDuplicateKeyUpdate({
            set: {
              attributeName: attr.definition || attr.name,
              dataType: attr.type ? String(attr.type) : null,
              required: attr.multiplicity?.includes("1") ? 1 : 0,
              rawJson: attr,
            },
          });

        // Insert into canonical table
        await db
          .insert(gdsnClassAttributes)
          .values({
            classId,
            attributeCode: attr.name,
            attributeName: attr.definition || attr.name,
            dataType: attr.type ? String(attr.type) : null,
            required: attr.multiplicity?.includes("1") ? 1 : 0,
          })
          .onDuplicateKeyUpdate({
            set: {
              attributeName: attr.definition || attr.name,
              dataType: attr.type ? String(attr.type) : null,
              required: attr.multiplicity?.includes("1") ? 1 : 0,
            },
          });

        await upsertProvenanceOrWarn(
          db as any,
          { itemKey, sourceLocator, retrievedAt, contentHash, traceId },
          verbose
        );

        result.recordsInserted += 1;
      }

      if (verbose && result.recordsProcessed % 200 === 0) {
        serverLogger.info(`Processed ${result.recordsProcessed} attributes`, {
          traceId,
        });
      }
    }

    result.duration = Date.now() - startTime;
    if (verbose) {
      serverLogger.info(
        `GDSN class attributes ingestion complete: ${result.recordsInserted} inserted in ${result.duration}ms`,
        { traceId }
      );
    }
  } catch (error) {
    result.success = false;
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.errors?.push(errorMessage);
    await serverLogger.error(error, {
      traceId,
      code: "INGEST-02_GDSN_CLASS_ATTRIBUTES",
      classification: "ingest",
      affectedFiles: ["server/ingest/INGEST-02_gdsn_current.ts"],
      failingInputs: { pipelineType: PIPELINE_TYPE, stage: "class_attributes" },
    });
  }

  return result;
}

export async function ingestGdsnValidationRules(
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
      serverLogger.info("Starting GDSN validation rules ingestion", { traceId });
    }

    const sourceLocator = path.join(
      "data",
      "gs1",
      "gdsn",
      "gdsn_validationRules.json"
    );
    const filePath = path.join(process.cwd(), sourceLocator);
    const retrievedAt = getRetrievedAtIso(filePath);
    const rules = loadJsonFile<GdsnValidationRuleRaw>(filePath);

    if (verbose) {
      serverLogger.info(`Loaded ${rules.length} GDSN validation rules`, {
        traceId,
      });
    }

    for (const rule of rules) {
      if (limit !== undefined && result.recordsProcessed >= limit) {
        if (verbose) {
          serverLogger.info(`Limit reached (${limit}), stopping`, { traceId });
        }
        break;
      }

      result.recordsProcessed += 1;

      if (!dryRun) {
        const ruleId = `GDSN_RULE_${rule.id}`;
        const itemKey = `rule:${ruleId}`;
        const contentHash = sha256Hex(JSON.stringify(rule));

        if (await shouldSkipByProvenance(db as any, itemKey, contentHash)) {
          result.recordsSkipped += 1;
          await upsertProvenanceOrWarn(
            db as any,
            { itemKey, sourceLocator, retrievedAt, contentHash, traceId },
            verbose
          );
          continue;
        }

        // Insert into raw table
        await db
          .insert(rawGdsnValidationRules)
          .values({
            ruleId,
            classId: null,
            attributeCode: null,
            ruleType: rule.type || "general",
            ruleExpression: rule.structuredRule || null,
            errorMessage: rule.errorMessageDescription || null,
            rawJson: rule,
          })
          .onDuplicateKeyUpdate({
            set: {
              classId: null,
              attributeCode: null,
              ruleType: rule.type || "general",
              ruleExpression: rule.structuredRule || null,
              errorMessage: rule.errorMessageDescription || null,
              rawJson: rule,
            },
          });

        // Insert into canonical table
        await db.insert(gdsnValidationRules).values({
          ruleId,
          classId: null,
          attributeCode: null,
          ruleType: rule.type || "general",
          ruleExpression: rule.structuredRule || null,
          errorMessage: rule.errorMessageDescription || null,
        }).onDuplicateKeyUpdate({
          set: {
            ruleType: rule.type || "general",
            ruleExpression: rule.structuredRule || null,
            errorMessage: rule.errorMessageDescription || null,
          },
        });

        await upsertProvenanceOrWarn(
          db as any,
          { itemKey, sourceLocator, retrievedAt, contentHash, traceId },
          verbose
        );

        result.recordsInserted += 1;
      }

      if (verbose && result.recordsProcessed % 100 === 0) {
        serverLogger.info(`Processed ${result.recordsProcessed} validation rules`, {
          traceId,
        });
      }
    }

    result.duration = Date.now() - startTime;
    if (verbose) {
      serverLogger.info(
        `GDSN validation rules ingestion complete: ${result.recordsInserted} inserted in ${result.duration}ms`,
        { traceId }
      );
    }
  } catch (error) {
    result.success = false;
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.errors?.push(errorMessage);
    await serverLogger.error(error, {
      traceId,
      code: "INGEST-02_GDSN_VALIDATION_RULES",
      classification: "ingest",
      affectedFiles: ["server/ingest/INGEST-02_gdsn_current.ts"],
      failingInputs: { pipelineType: PIPELINE_TYPE, stage: "validation_rules" },
    });
  }

  return result;
}

export async function ingestGdsnCurrent(
  options: IngestOptions = {}
): Promise<IngestResult> {
  const { verbose = false } = options;
  const startTime = Date.now();
  const traceId = options.traceId ?? crypto.randomUUID();

  if (verbose) {
    serverLogger.info("=== INGEST-02: GDSN Current v3.1.32 ===", { traceId });
  }

  const classesResult = await ingestGdsnClasses({ ...options, traceId });
  const attributesResult = await ingestGdsnClassAttributes({ ...options, traceId });
  const rulesResult = await ingestGdsnValidationRules({ ...options, traceId });

  const combinedResult: IngestResult = {
    success:
      classesResult.success &&
      attributesResult.success &&
      rulesResult.success,
    recordsProcessed:
      classesResult.recordsProcessed +
      attributesResult.recordsProcessed +
      rulesResult.recordsProcessed,
    recordsInserted:
      classesResult.recordsInserted +
      attributesResult.recordsInserted +
      rulesResult.recordsInserted,
    recordsUpdated:
      classesResult.recordsUpdated +
      attributesResult.recordsUpdated +
      rulesResult.recordsUpdated,
    recordsSkipped:
      classesResult.recordsSkipped +
      attributesResult.recordsSkipped +
      rulesResult.recordsSkipped,
    duration: Date.now() - startTime,
    errors: [
      ...(classesResult.errors || []),
      ...(attributesResult.errors || []),
      ...(rulesResult.errors || []),
    ],
  };

  if (verbose) {
    serverLogger.info("\n=== INGEST-02 Summary ===", { traceId });
    serverLogger.info(`Classes: ${classesResult.recordsInserted}`, { traceId });
    serverLogger.info(`Attributes: ${attributesResult.recordsInserted}`, {
      traceId,
    });
    serverLogger.info(`Validation Rules: ${rulesResult.recordsInserted}`, {
      traceId,
    });
    serverLogger.info(`Total: ${combinedResult.recordsInserted} records`, {
      traceId,
    });
    serverLogger.info(`Duration: ${combinedResult.duration}ms`, { traceId });
  }

  return combinedResult;
}
