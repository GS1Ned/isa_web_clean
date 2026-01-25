import * as fs from "fs";
import * as path from "path";
import { getDb } from "../db";
import { serverLogger } from "../_core/logger-wiring";

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

export async function ingestCbvVocabularies(
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
      console.log("Starting CBV vocabularies ingestion");
    }

    const filePath = path.join(
      process.cwd(),
      "data",
      "cbv",
      "cbv_esg_curated.json"
    );
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
      console.log(`Loaded ${vocabularies.length} CBV vocabulary items`);
    }

    for (const vocab of vocabularies) {
      if (limit !== undefined && result.recordsProcessed >= limit) {
        if (verbose) {
          console.log(`Limit reached (${limit}), stopping`);
        }
        break;
      }

      result.recordsProcessed += 1;

      if (!dryRun) {
        // Insert into raw table
        await db.insert(rawCbvVocabularies).values({
          rawJson: vocab.data,
        });

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

        result.recordsInserted += 1;
      }

      if (verbose && result.recordsProcessed % 20 === 0) {
        console.log(`Processed ${result.recordsProcessed} vocabularies`);
      }
    }

    result.duration = Date.now() - startTime;
    if (verbose) {
      console.log(
        `CBV vocabularies ingestion complete: ${result.recordsInserted} inserted in ${result.duration}ms`
      );
    }
  } catch (error) {
    result.success = false;
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.errors?.push(errorMessage);
    if (verbose) {
      serverLogger.error("CBV vocabularies ingestion failed:", errorMessage);
    }
  }

  return result;
}

export async function ingestDigitalLinkTypes(
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
      console.log("Starting Digital Link types ingestion");
    }

    const filePath = path.join(
      process.cwd(),
      "data",
      "digital_link",
      "linktypes.json"
    );
    const linkTypesData = loadJsonFile<Record<string, DigitalLinkTypeData>>(filePath);

    const linkTypes = Object.entries(linkTypesData);

    if (verbose) {
      console.log(`Loaded ${linkTypes.length} Digital Link types`);
    }

    for (const [linkType, linkData] of linkTypes) {
      if (limit !== undefined && result.recordsProcessed >= limit) {
        if (verbose) {
          console.log(`Limit reached (${limit}), stopping`);
        }
        break;
      }

      result.recordsProcessed += 1;

      if (!dryRun) {
        // Insert into raw table
        await db.insert(rawDigitalLinkTypes).values({
          rawJson: linkData,
        });

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

        result.recordsInserted += 1;
      }

      if (verbose && result.recordsProcessed % 10 === 0) {
        console.log(`Processed ${result.recordsProcessed} link types`);
      }
    }

    result.duration = Date.now() - startTime;
    if (verbose) {
      console.log(
        `Digital Link types ingestion complete: ${result.recordsInserted} inserted in ${result.duration}ms`
      );
    }
  } catch (error) {
    result.success = false;
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.errors?.push(errorMessage);
    if (verbose) {
      serverLogger.error("Digital Link types ingestion failed:", errorMessage);
    }
  }

  return result;
}

export async function ingestCbvDigitalLink(
  options: IngestOptions = {}
): Promise<IngestResult> {
  const { verbose = false } = options;
  const startTime = Date.now();

  if (verbose) {
    console.log("=== INGEST-06: CBV Vocabularies & Digital Link Types ===");
  }

  const cbvResult = await ingestCbvVocabularies(options);
  const linkResult = await ingestDigitalLinkTypes(options);

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
    console.log("\n=== INGEST-06 Summary ===");
    console.log(`CBV Vocabularies: ${cbvResult.recordsInserted}`);
    console.log(`Digital Link Types: ${linkResult.recordsInserted}`);
    console.log(`Total: ${combinedResult.recordsInserted} records`);
    console.log(`Duration: ${combinedResult.duration}ms`);
  }

  return combinedResult;
}
