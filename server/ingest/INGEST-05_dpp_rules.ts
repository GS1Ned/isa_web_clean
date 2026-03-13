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
  dppIdentifierComponents,
  rawDppIdentifierComponents,
  dppIdentificationRules,
  rawDppIdentificationRules,
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

interface ComponentCategory {
  [key: string]: {
    description: string;
    gs1Standard?: string;
    format?: string;
    example?: string;
  };
}

interface DppRuleRaw {
  productCategory: string;
  requiredIdentifiers: string[];
  optionalIdentifiers?: string[];
  description: string;
  regulationContext?: string;
}

function loadJsonFile<T>(filePath: string): T {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, "utf8");
  return JSON.parse(content) as T;
}

const PIPELINE_TYPE = "INGEST-05_dpp_rules";
const PARSER_VERSION = "INGEST-05_dpp_rules@v1";

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
    serverLogger.warn("[INGEST-05] provenance upsert failed", {
      traceId: input.traceId,
      error: prov.error,
    });
  }
}

export async function ingestDppComponents(
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
      serverLogger.info("Starting DPP identifier components ingestion", {
        traceId,
      });
    }

    const sourceLocator = path.join(
      "data",
      "esg",
      "dpp_identifier_components.json"
    );
    const filePath = path.join(process.cwd(), sourceLocator);
    const retrievedAt = getRetrievedAtIso(filePath);
    const componentsData = loadJsonFile<Record<string, ComponentCategory>>(filePath);

    // Flatten the nested structure
    const components: Array<{ code: string; name: string; data: any }> = [];
    for (const [categoryKey, categoryData] of Object.entries(componentsData)) {
      for (const [componentKey, componentData] of Object.entries(categoryData)) {
        components.push({
          code: componentKey,
          name: categoryKey,
          data: componentData,
        });
      }
    }

    if (verbose) {
      serverLogger.info(`Loaded ${components.length} DPP identifier components`, {
        traceId,
      });
    }

    for (const component of components) {
      if (limit !== undefined && result.recordsProcessed >= limit) {
        if (verbose) {
          serverLogger.info(`Limit reached (${limit}), stopping`);
        }
        break;
      }

      result.recordsProcessed += 1;

      if (!dryRun) {
        const itemKey = `component:${component.code}`;
        const payload = {
          code: component.code,
          name: component.name,
          ...component.data,
        };
        const contentHash = sha256Hex(JSON.stringify(payload));
        const existingHash = await getIngestProvenanceContentHash(
          db as any,
          PIPELINE_TYPE,
          itemKey
        );
        const skipRaw = existingHash !== null && existingHash === contentHash;

        // Insert into raw table (dedupe via provenance to avoid append-only duplication)
        if (!skipRaw) {
          await db.insert(rawDppIdentifierComponents).values({
            rawJson: component.data,
          });
        } else {
          result.recordsSkipped += 1;
        }

        // Insert into canonical table
        await db.insert(dppIdentifierComponents).values({
          componentCode: component.code,
          componentName: component.name,
          description: component.data.description || null,
          gs1Standard: component.data.gs1Standard || null,
          format: component.data.format || null,
          example: component.data.example || null,
        }).onDuplicateKeyUpdate({
          set: {
            componentName: component.name,
            description: component.data.description || null,
            gs1Standard: component.data.gs1Standard || null,
            format: component.data.format || null,
            example: component.data.example || null,
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
        serverLogger.info(`Processed ${result.recordsProcessed} components`, {
          traceId,
        });
      }
    }

    result.duration = Date.now() - startTime;
    if (verbose) {
      serverLogger.info(
        `DPP components ingestion complete: ${result.recordsInserted} inserted in ${result.duration}ms`,
        { traceId }
      );
    }
  } catch (error) {
    result.success = false;
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.errors?.push(errorMessage);
    await serverLogger.error(error, {
      traceId,
      code: "INGEST-05_DPP_COMPONENTS",
      classification: "ingest",
      affectedFiles: ["server/ingest/INGEST-05_dpp_rules.ts"],
      failingInputs: { pipelineType: PIPELINE_TYPE, stage: "components" },
    });
  }

  return result;
}

export async function ingestDppRules(
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
      serverLogger.info("Starting DPP identification rules ingestion", {
        traceId,
      });
    }

    const sourceLocator = path.join(
      "data",
      "esg",
      "dpp_identification_rules.json"
    );
    const filePath = path.join(process.cwd(), sourceLocator);
    const retrievedAt = getRetrievedAtIso(filePath);
    const rules = loadJsonFile<DppRuleRaw[]>(filePath);

    if (verbose) {
      serverLogger.info(`Loaded ${rules.length} DPP identification rules`, {
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
        const ruleCode = `DPP_RULE_${rule.productCategory.replace(/\s+/g, "_").toUpperCase()}`;
        const itemKey = `rule:${ruleCode}`;
        const contentHash = sha256Hex(JSON.stringify({ ruleCode, ...rule }));
        const existingHash = await getIngestProvenanceContentHash(
          db as any,
          PIPELINE_TYPE,
          itemKey
        );
        const skipRaw = existingHash !== null && existingHash === contentHash;

        // Insert into raw table (dedupe via provenance to avoid append-only duplication)
        if (!skipRaw) {
          await db.insert(rawDppIdentificationRules).values({
            rawJson: rule,
          });
        } else {
          result.recordsSkipped += 1;
        }

        // Insert into canonical table
        await db.insert(dppIdentificationRules).values({
          ruleCode,
          productCategory: rule.productCategory,
          requiredComponents: rule.requiredIdentifiers,
          optionalComponents: rule.optionalIdentifiers || [],
          description: rule.description,
          regulationContext: rule.regulationContext || null,
        }).onDuplicateKeyUpdate({
          set: {
            productCategory: rule.productCategory,
            requiredComponents: rule.requiredIdentifiers,
            optionalComponents: rule.optionalIdentifiers || [],
            description: rule.description,
            regulationContext: rule.regulationContext || null,
          },
        });

        await upsertProvenanceOrWarn(
          db as any,
          { itemKey, sourceLocator, retrievedAt, contentHash, traceId },
          verbose
        );

        result.recordsInserted += 1;
      }

      if (verbose && result.recordsProcessed % 5 === 0) {
        serverLogger.info(`Processed ${result.recordsProcessed} rules`, { traceId });
      }
    }

    result.duration = Date.now() - startTime;
    if (verbose) {
      serverLogger.info(
        `DPP rules ingestion complete: ${result.recordsInserted} inserted in ${result.duration}ms`,
        { traceId }
      );
    }
  } catch (error) {
    result.success = false;
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.errors?.push(errorMessage);
    await serverLogger.error(error, {
      traceId,
      code: "INGEST-05_DPP_RULES",
      classification: "ingest",
      affectedFiles: ["server/ingest/INGEST-05_dpp_rules.ts"],
      failingInputs: { pipelineType: PIPELINE_TYPE, stage: "rules" },
    });
  }

  return result;
}

export async function ingestDppIdentificationRules(
  options: IngestOptions = {}
): Promise<IngestResult> {
  const { verbose = false } = options;
  const startTime = Date.now();
  const traceId = options.traceId ?? crypto.randomUUID();

  if (verbose) {
    serverLogger.info("=== INGEST-05: DPP Identification Rules ===", { traceId });
  }

  const componentsResult = await ingestDppComponents({ ...options, traceId });
  const rulesResult = await ingestDppRules({ ...options, traceId });

  const combinedResult: IngestResult = {
    success: componentsResult.success && rulesResult.success,
    recordsProcessed:
      componentsResult.recordsProcessed + rulesResult.recordsProcessed,
    recordsInserted:
      componentsResult.recordsInserted + rulesResult.recordsInserted,
    recordsUpdated:
      componentsResult.recordsUpdated + rulesResult.recordsUpdated,
    recordsSkipped:
      componentsResult.recordsSkipped + rulesResult.recordsSkipped,
    duration: Date.now() - startTime,
    errors: [
      ...(componentsResult.errors || []),
      ...(rulesResult.errors || []),
    ],
  };

  if (verbose) {
    serverLogger.info("\n=== INGEST-05 Summary ===", { traceId });
    serverLogger.info(`Components: ${componentsResult.recordsInserted}`, {
      traceId,
    });
    serverLogger.info(`Rules: ${rulesResult.recordsInserted}`, { traceId });
    serverLogger.info(`Total: ${combinedResult.recordsInserted} records`, {
      traceId,
    });
    serverLogger.info(`Duration: ${combinedResult.duration}ms`, { traceId });
  }

  return combinedResult;
}
