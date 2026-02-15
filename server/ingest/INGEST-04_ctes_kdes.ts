import * as fs from "fs";
import * as path from "path";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { serverLogger } from "../_core/logger-wiring";

import {
  ctes,
  kdes,
  cteKdeMappings,
  rawCtesKdes,
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

export async function ingestCtesKdes(
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
      serverLogger.info("Starting CTEs and KDEs ingestion");
    }

    const filePath = path.join(
      process.cwd(),
      "data",
      "esg",
      "ctes_and_kdes.json"
    );
    const ctesList = loadJsonFile<CteRaw[]>(filePath);

    if (verbose) {
      serverLogger.info(`Loaded ${ctesList.length} CTEs`);
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
      serverLogger.info(`Found ${kdeMap.size} unique KDEs`);
    }

    // Insert KDEs first
    const kdeIdMap = new Map<string, number>();
    let kdeCount = 0;

    for (const [kdeCode, kdeData] of Array.from(kdeMap)) {
      if (limit !== undefined && kdeCount >= limit) {
        break;
      }

      if (!dryRun) {
        try {
          await db.insert(kdes).values({
            code: kdeCode,
            name: kdeData.name,
            description: kdeData.description,
            dataType: kdeData.gs1Standard,
            mandatory: 0,
          });
        } catch (error) {
          // Ignore duplicate key errors
        }

        // Get the ID (whether just inserted or already exists)
        const [kdeRecord] = await db.select().from(kdes).where(eq(kdes.code, kdeCode)).limit(1);
        if (kdeRecord) {
          kdeIdMap.set(kdeCode, kdeRecord.id);
        }
      }

      kdeCount += 1;
      result.recordsInserted += 1;
    }

    // Insert CTEs and mappings
    let cteCount = 0;
    for (const cte of ctesList) {
      if (limit !== undefined && cteCount >= limit) {
        if (verbose) {
          serverLogger.info(`Limit reached (${limit}), stopping`);
        }
        break;
      }

      result.recordsProcessed += 1;

      if (!dryRun) {
        // Insert into raw table
        await db.insert(rawCtesKdes).values({
          rawJson: cte,
        });

        // Insert CTE
        try {
          await db.insert(ctes).values({
            code: cte.cteId,
            name: cte.cteName,
            description: cte.description,
            category: cte.exampleStandards?.join(", ") || null,
            regulationContext: cte.exampleRegulations?.join(", ") || null,
          });
        } catch (error) {
          // Ignore duplicate key errors
        }

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

        result.recordsInserted += 1;
      }

      cteCount += 1;

      if (verbose && cteCount % 2 === 0) {
        serverLogger.info(`Processed ${cteCount} CTEs`);
      }
    }

    result.duration = Date.now() - startTime;
    if (verbose) {
      serverLogger.info(
        `CTEs/KDEs ingestion complete: ${kdeCount} KDEs + ${cteCount} CTEs in ${result.duration}ms`
      );
    }
  } catch (error) {
    result.success = false;
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.errors?.push(errorMessage);
    if (verbose) {
      serverLogger.error("CTEs/KDEs ingestion failed:", errorMessage);
    }
  }

  return result;
}
