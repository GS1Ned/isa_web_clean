/**
 * News to Regulatory Change Log Integration
 *
 * Automatically creates Regulatory Change Log entries from high-impact news items.
 * Adheres to ISA Design Contract:
 * - Only high-impact news (impactLevel: HIGH or CRITICAL)
 * - Traceable to source documents (URL + SHA256)
 * - Immutable entries (no updates)
 * - GS1 Style Guide compliant
 */

import { createRegulatoryChangeLogEntry } from "./db-regulatory-change-log";
import type { HubNews } from "../drizzle/schema";
import { createHash } from "crypto";
import { serverLogger } from "./_core/logger-wiring";


/**
 * Impact level threshold for auto-creating change log entries
 */
const IMPACT_THRESHOLD = ["HIGH", "CRITICAL"];

/**
 * Map news source types to regulatory change log source types
 */
const SOURCE_TYPE_MAPPING: Record<string, string> = {
  "EU_OFFICIAL": "EU_REGULATION",
  "EFRAG": "EFRAG_IG",
  "GS1_GLOBAL": "GS1_AISBL",
  "GS1_EUROPE": "GS1_EUROPE",
  "GS1_NL": "GS1_NL",
  "DUTCH_GOV": "EU_DIRECTIVE", // Default to EU_DIRECTIVE for Dutch government sources
  "INDUSTRY": "GS1_EUROPE", // Default to GS1_EUROPE for industry sources
};

/**
 * Determine if a news item should trigger a regulatory change log entry
 */
export function shouldCreateChangeLogEntry(newsItem: HubNews): boolean {
  // Must have high impact
  if (!newsItem.impactLevel || !IMPACT_THRESHOLD.includes(newsItem.impactLevel)) {
    return false;
  }

  // Must have regulation tags
  const tags = Array.isArray(newsItem.regulationTags) ? newsItem.regulationTags : [];
  if (tags.length === 0) {
    return false;
  }

  // Must have source URL
  if (!newsItem.sourceUrl) {
    return false;
  }

  return true;
}

/**
 * Generate SHA256 hash for a news item's content
 */
function generateDocumentHash(newsItem: HubNews): string {
  const content = `${newsItem.title || ""}|${newsItem.summary || ""}|${newsItem.sourceUrl || ""}`;
  return createHash("sha256").update(content).digest("hex");
}

/**
 * Map news source type to regulatory change log source type
 */
function mapSourceType(newsSourceType: string): string {
  return SOURCE_TYPE_MAPPING[newsSourceType] || "EU_REGULATION";
}

/**
 * Extract ISA version from news item (if mentioned)
 */
function extractIsaVersion(newsItem: HubNews): string | undefined {
  const versionPattern = /ISA\s+v?(\d+\.\d+)/i;
  const match = (newsItem.summary || "").match(versionPattern) || (newsItem.title || "").match(versionPattern);
  return match ? `v${match[1]}` : undefined;
}

/**
 * Create a regulatory change log entry from a news item
 */
export async function createChangeLogEntryFromNews(
  newsItem: HubNews
): Promise<{ success: boolean; entryId?: number; error?: string }> {
  try {
    // Validate news item
    if (!shouldCreateChangeLogEntry(newsItem)) {
      return {
        success: false,
        error: "News item does not meet criteria for change log entry",
      };
    }

    // Generate document hash
    const documentHash = generateDocumentHash(newsItem);

    // Map source type
    const sourceType = mapSourceType(newsItem.sourceType || "EU_OFFICIAL");

    // Extract ISA version (if mentioned)
    const isaVersionAffected = extractIsaVersion(newsItem);

    // Create impact assessment from GS1 impact analysis
    const tags = Array.isArray(newsItem.regulationTags) ? newsItem.regulationTags : [];
    const impactAssessment = newsItem.gs1ImpactAnalysis || 
      `Impact level: ${newsItem.impactLevel}. Affects regulations: ${tags.join(", ")}.`;

    // Create entry
    const entry = await createRegulatoryChangeLogEntry({
      entryDate: typeof newsItem.publishedDate === 'string' ? newsItem.publishedDate : new Date().toISOString(),
      sourceType: sourceType as any,
      sourceOrg: newsItem.sourceTitle || "Unknown",
      title: newsItem.title || "Untitled",
      description: newsItem.summary || "",
      url: newsItem.sourceUrl || "",
      documentHash,
      impactAssessment,
      isaVersionAffected,
    });

    console.log(
      `[news-regulatory-integration] Created change log entry ${entry.id} from news ${newsItem.id}`
    );

    return {
      success: true,
      entryId: entry.id,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    serverLogger.error(
      `[news-regulatory-integration] Failed to create change log entry from news ${newsItem.id}:`,
      errorMsg
    );
    return {
      success: false,
      error: errorMsg,
    };
  }
}

/**
 * Bulk create regulatory change log entries from multiple news items
 */
export async function bulkCreateChangeLogEntriesFromNews(
  newsItems: HubNews[]
): Promise<{
  success: boolean;
  created: number;
  skipped: number;
  errors: string[];
}> {
  let created = 0;
  let skipped = 0;
  const errors: string[] = [];

  console.log(
    `[news-regulatory-integration] Processing ${newsItems.length} news items for change log entries...`
  );

  for (const newsItem of newsItems) {
    if (!shouldCreateChangeLogEntry(newsItem)) {
      skipped++;
      continue;
    }

    const result = await createChangeLogEntryFromNews(newsItem);
    if (result.success) {
      created++;
    } else {
      skipped++;
      if (result.error) {
        errors.push(`News ${newsItem.id}: ${result.error}`);
      }
    }
  }

  console.log(
    `[news-regulatory-integration] Bulk creation complete: ${created} created, ${skipped} skipped, ${errors.length} errors`
  );

  return {
    success: errors.length === 0,
    created,
    skipped,
    errors,
  };
}
