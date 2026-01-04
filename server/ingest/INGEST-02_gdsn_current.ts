import * as fs from "fs";
import * as path from "path";
import { getDb } from "../db";
import { serverLogger } from "../_core/logger-wiring";

import {
  gdsnClasses,
  rawGdsnClasses,
  gdsnClassAttributes,
  rawGdsnClassAttributes,
  gdsnValidationRules,
  rawGdsnValidationRules,
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

export async function ingestGdsnClasses(
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
      console.log("Starting GDSN classes ingestion");
    }

    const filePath = path.join(
      process.cwd(),
      "data",
      "gs1",
      "gdsn",
      "gdsn_classes.json"
    );
    const classes = loadJsonFile<GdsnClassRaw>(filePath);

    if (verbose) {
      console.log(`Loaded ${classes.length} GDSN classes`);
    }

    for (const cls of classes) {
      if (limit !== undefined && result.recordsProcessed >= limit) {
        if (verbose) {
          console.log(`Limit reached (${limit}), stopping`);
        }
        break;
      }

      result.recordsProcessed += 1;

      if (!dryRun) {
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

        result.recordsInserted += 1;
      }

      if (verbose && result.recordsProcessed % 100 === 0) {
        console.log(`Processed ${result.recordsProcessed} classes`);
      }
    }

    result.duration = Date.now() - startTime;
    if (verbose) {
      console.log(
        `GDSN classes ingestion complete: ${result.recordsInserted} inserted in ${result.duration}ms`
      );
    }
  } catch (error) {
    result.success = false;
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.errors?.push(errorMessage);
    if (verbose) {
      serverLogger.error("GDSN classes ingestion failed:", errorMessage);
    }
  }

  return result;
}

export async function ingestGdsnClassAttributes(
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
      console.log("Starting GDSN class attributes ingestion");
    }

    const filePath = path.join(
      process.cwd(),
      "data",
      "gs1",
      "gdsn",
      "gdsn_classAttributes.json"
    );
    const attributes = loadJsonFile<GdsnAttributeRaw>(filePath);

    if (verbose) {
      console.log(`Loaded ${attributes.length} GDSN class attributes`);
    }

    for (const attr of attributes) {
      if (limit !== undefined && result.recordsProcessed >= limit) {
        if (verbose) {
          console.log(`Limit reached (${limit}), stopping`);
        }
        break;
      }

      result.recordsProcessed += 1;

      if (!dryRun) {
        try {
          // Insert into raw table
          await db.insert(rawGdsnClassAttributes).values({
            classId: attr.parentClassId || 0,
            attributeCode: attr.name,
            attributeName: attr.definition || attr.name,
            dataType: attr.type ? String(attr.type) : null,
            required: attr.multiplicity?.includes("1") ? 1 : 0,
            rawJson: attr,
          });

          // Insert into canonical table
          await db.insert(gdsnClassAttributes).values({
            classId: attr.parentClassId || 0,
            attributeCode: attr.name,
            attributeName: attr.definition || attr.name,
            dataType: attr.type ? String(attr.type) : null,
            required: attr.multiplicity?.includes("1") ? 1 : 0,
          });

          result.recordsInserted += 1;
        } catch (error) {
          // Skip duplicates silently
          result.recordsSkipped += 1;
        }
      }

      if (verbose && result.recordsProcessed % 200 === 0) {
        console.log(`Processed ${result.recordsProcessed} attributes`);
      }
    }

    result.duration = Date.now() - startTime;
    if (verbose) {
      console.log(
        `GDSN class attributes ingestion complete: ${result.recordsInserted} inserted in ${result.duration}ms`
      );
    }
  } catch (error) {
    result.success = false;
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.errors?.push(errorMessage);
    if (verbose) {
      serverLogger.error("GDSN class attributes ingestion failed:", errorMessage);
    }
  }

  return result;
}

export async function ingestGdsnValidationRules(
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
      console.log("Starting GDSN validation rules ingestion");
    }

    const filePath = path.join(
      process.cwd(),
      "data",
      "gs1",
      "gdsn",
      "gdsn_validationRules.json"
    );
    const rules = loadJsonFile<GdsnValidationRuleRaw>(filePath);

    if (verbose) {
      console.log(`Loaded ${rules.length} GDSN validation rules`);
    }

    for (const rule of rules) {
      if (limit !== undefined && result.recordsProcessed >= limit) {
        if (verbose) {
          console.log(`Limit reached (${limit}), stopping`);
        }
        break;
      }

      result.recordsProcessed += 1;

      if (!dryRun) {
        const ruleId = `GDSN_RULE_${rule.id}`;

        // Insert into raw table
        await db.insert(rawGdsnValidationRules).values({
          ruleId,
          classId: null,
          attributeCode: null,
          ruleType: rule.type || "general",
          ruleExpression: rule.structuredRule || null,
          errorMessage: rule.errorMessageDescription || null,
          rawJson: rule,
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

        result.recordsInserted += 1;
      }

      if (verbose && result.recordsProcessed % 100 === 0) {
        console.log(`Processed ${result.recordsProcessed} validation rules`);
      }
    }

    result.duration = Date.now() - startTime;
    if (verbose) {
      console.log(
        `GDSN validation rules ingestion complete: ${result.recordsInserted} inserted in ${result.duration}ms`
      );
    }
  } catch (error) {
    result.success = false;
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.errors?.push(errorMessage);
    if (verbose) {
      serverLogger.error("GDSN validation rules ingestion failed:", errorMessage);
    }
  }

  return result;
}

export async function ingestGdsnCurrent(
  options: IngestOptions = {}
): Promise<IngestResult> {
  const { verbose = false } = options;
  const startTime = Date.now();

  if (verbose) {
    console.log("=== INGEST-02: GDSN Current v3.1.32 ===");
  }

  const classesResult = await ingestGdsnClasses(options);
  const attributesResult = await ingestGdsnClassAttributes(options);
  const rulesResult = await ingestGdsnValidationRules(options);

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
    console.log("\n=== INGEST-02 Summary ===");
    console.log(`Classes: ${classesResult.recordsInserted}`);
    console.log(`Attributes: ${attributesResult.recordsInserted}`);
    console.log(`Validation Rules: ${rulesResult.recordsInserted}`);
    console.log(`Total: ${combinedResult.recordsInserted} records`);
    console.log(`Duration: ${combinedResult.duration}ms`);
  }

  return combinedResult;
}
