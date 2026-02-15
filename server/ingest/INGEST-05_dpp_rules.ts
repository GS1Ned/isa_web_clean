import * as fs from "fs";
import * as path from "path";
import { getDb } from "../db";
import { serverLogger } from "../_core/logger-wiring";

import {
  dppIdentifierComponents,
  rawDppIdentifierComponents,
  dppIdentificationRules,
  rawDppIdentificationRules,
} from "../../drizzle/schema";

export interface IngestOptions {
  dryRun?: boolean;
  limit?: number;
  verbose?: boolean;
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

export async function ingestDppComponents(
  options: IngestOptions = {}
): Promise<IngestResult> {
  const startTime = Date.now();
  const { dryRun = false, limit, verbose = false } = options;
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
      serverLogger.info("Starting DPP identifier components ingestion");
    }

    const filePath = path.join(
      process.cwd(),
      "data",
      "esg",
      "dpp_identifier_components.json"
    );
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
      serverLogger.info(`Loaded ${components.length} DPP identifier components`);
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
        // Insert into raw table
        await db.insert(rawDppIdentifierComponents).values({
          rawJson: component.data,
        });

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

        result.recordsInserted += 1;
      }

      if (verbose && result.recordsProcessed % 10 === 0) {
        serverLogger.info(`Processed ${result.recordsProcessed} components`);
      }
    }

    result.duration = Date.now() - startTime;
    if (verbose) {
      serverLogger.info(
        `DPP components ingestion complete: ${result.recordsInserted} inserted in ${result.duration}ms`
      );
    }
  } catch (error) {
    result.success = false;
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.errors?.push(errorMessage);
    if (verbose) {
      serverLogger.error("DPP components ingestion failed:", errorMessage);
    }
  }

  return result;
}

export async function ingestDppRules(
  options: IngestOptions = {}
): Promise<IngestResult> {
  const startTime = Date.now();
  const { dryRun = false, limit, verbose = false } = options;
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
      serverLogger.info("Starting DPP identification rules ingestion");
    }

    const filePath = path.join(
      process.cwd(),
      "data",
      "esg",
      "dpp_identification_rules.json"
    );
    const rules = loadJsonFile<DppRuleRaw[]>(filePath);

    if (verbose) {
      serverLogger.info(`Loaded ${rules.length} DPP identification rules`);
    }

    for (const rule of rules) {
      if (limit !== undefined && result.recordsProcessed >= limit) {
        if (verbose) {
          serverLogger.info(`Limit reached (${limit}), stopping`);
        }
        break;
      }

      result.recordsProcessed += 1;

      if (!dryRun) {
        const ruleCode = `DPP_RULE_${rule.productCategory.replace(/\s+/g, "_").toUpperCase()}`;

        // Insert into raw table
        await db.insert(rawDppIdentificationRules).values({
          rawJson: rule,
        });

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

        result.recordsInserted += 1;
      }

      if (verbose && result.recordsProcessed % 5 === 0) {
        serverLogger.info(`Processed ${result.recordsProcessed} rules`);
      }
    }

    result.duration = Date.now() - startTime;
    if (verbose) {
      serverLogger.info(
        `DPP rules ingestion complete: ${result.recordsInserted} inserted in ${result.duration}ms`
      );
    }
  } catch (error) {
    result.success = false;
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.errors?.push(errorMessage);
    if (verbose) {
      serverLogger.error("DPP rules ingestion failed:", errorMessage);
    }
  }

  return result;
}

export async function ingestDppIdentificationRules(
  options: IngestOptions = {}
): Promise<IngestResult> {
  const { verbose = false } = options;
  const startTime = Date.now();

  if (verbose) {
    serverLogger.info("=== INGEST-05: DPP Identification Rules ===");
  }

  const componentsResult = await ingestDppComponents(options);
  const rulesResult = await ingestDppRules(options);

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
    serverLogger.info("\n=== INGEST-05 Summary ===");
    serverLogger.info(`Components: ${componentsResult.recordsInserted}`);
    serverLogger.info(`Rules: ${rulesResult.recordsInserted}`);
    serverLogger.info(`Total: ${combinedResult.recordsInserted} records`);
    serverLogger.info(`Duration: ${combinedResult.duration}ms`);
  }

  return combinedResult;
}
