import { format as utilFormat } from "node:util";

const cliOut = (...args: unknown[]) => process.stdout.write(`${utilFormat(...args)}\n`);
const cliErr = (...args: unknown[]) => process.stderr.write(`${utilFormat(...args)}\n`);

/**
 * Automated CELLAR Sync Script
 *
 * Runs monthly to:
 * 1. Fetch latest EU regulations from CELLAR
 * 2. Normalize and deduplicate
 * 3. Insert/update database
 * 4. Generate ESRS mappings for new regulations
 * 5. Email admin with summary
 *
 * Designed to run via cron: 0 2 1 * * (1st of month at 2 AM)
 */

import { cellarConnector } from "./cellar-connector.js";
import {
  normalizeEULegalActsBatch,
  deduplicateRegulations,
  validateRegulation,
} from "./cellar-normalizer.js";
import { generateRegulationEsrsMappings } from "./regulation-esrs-mapper.js";
import { notifyOwner } from "./_core/notification.js";
import { upsertRegulation } from "./db.js";
import { serverLogger } from "./_core/logger-wiring";


interface SyncResult {
  success: boolean;
  fetched: number;
  normalized: number;
  newRegulations: number;
  updatedRegulations: number;
  errors: number;
  esrsMappingsGenerated: number;
  duration: number;
  errorMessages: string[];
  newRegulationTitles: string[];
}

export async function runAutomatedCellarSync(): Promise<SyncResult> {
  const startTime = Date.now();
  cliOut("[AutoSync] Starting automated CELLAR sync...");

  const result: SyncResult = {
    success: false,
    fetched: 0,
    normalized: 0,
    newRegulations: 0,
    updatedRegulations: 0,
    errors: 0,
    esrsMappingsGenerated: 0,
    duration: 0,
    errorMessages: [],
    newRegulationTitles: [],
  };

  try {
    // Step 1: Fetch regulations from CELLAR
    cliOut("[AutoSync] Step 1/5: Fetching regulations from CELLAR...");
    const legalActs = await cellarConnector.getAllRecentRegulations(5, 500);
    result.fetched = legalActs.length;
    cliOut(`[AutoSync] Retrieved ${result.fetched} legal acts`);

    // Step 2: Normalize to ISA schema
    cliOut("[AutoSync] Step 2/5: Normalizing to ISA schema...");
    let normalized = normalizeEULegalActsBatch(legalActs);
    result.normalized = normalized.length;
    cliOut(
      `[AutoSync] Normalized ${result.normalized} regulations (filtered ${legalActs.length - normalized.length} non-ESG)`
    );

    // Step 3: Deduplicate and validate
    cliOut("[AutoSync] Step 3/5: Deduplicating and validating...");
    normalized = deduplicateRegulations(normalized);
    const valid = normalized.filter(validateRegulation);
    cliOut(`[AutoSync] ${valid.length} valid regulations`);

    if (valid.length === 0) {
      cliOut("[AutoSync] No valid regulations to process");
      result.success = true;
      result.duration = Math.round((Date.now() - startTime) / 1000);
      await sendSyncNotification(result);
      return result;
    }

    // Step 4: Insert/update database
    cliOut("[AutoSync] Step 4/5: Upserting regulations to database...");
    const newRegIds: number[] = [];

    for (const reg of valid) {
      try {
        const upsertResult = await upsertRegulation(reg);

        if (upsertResult.inserted) {
          result.newRegulations++;
          newRegIds.push(upsertResult.id);
          result.newRegulationTitles.push(reg.title);
        } else if (upsertResult.updated) {
          result.updatedRegulations++;
        }
      } catch (error) {
        result.errors++;
        const errorMsg = error instanceof Error ? error.message : String(error);
        result.errorMessages.push(`Failed to upsert ${reg.title}: ${errorMsg}`);
      }
    }

    cliOut(
      `[AutoSync] Database upsert complete: ${result.newRegulations} new, ${result.updatedRegulations} updated, ${result.errors} errors`
    );

    // Step 5: Generate ESRS mappings for new regulations
    if (newRegIds.length > 0) {
      cliOut(
        `[AutoSync] Step 5/5: Generating ESRS mappings for ${newRegIds.length} new regulations...`
      );

      for (const regId of newRegIds) {
        try {
          const mappingResult = await generateRegulationEsrsMappings(regId);

          if (mappingResult.success) {
            result.esrsMappingsGenerated += mappingResult.mappingsCount || 0;
            cliOut(
              `[AutoSync] Generated ${mappingResult.mappingsCount} mappings for regulation ${regId}`
            );
          } else {
            result.errorMessages.push(
              `Failed to generate mappings for regulation ${regId}: ${mappingResult.error}`
            );
          }
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          result.errorMessages.push(
            `Error generating mappings for regulation ${regId}: ${errorMsg}`
          );
        }
      }

      cliOut(
        `[AutoSync] Total ESRS mappings generated: ${result.esrsMappingsGenerated}`
      );
    } else {
      cliOut(
        "[AutoSync] No new regulations, skipping ESRS mapping generation"
      );
    }

    // Step 6: Send email notification
    cliOut("[AutoSync] Sending email notification...");
    const emailSent = await sendSyncNotification(result);

    if (!emailSent) {
      result.errorMessages.push("Failed to send email notification");
    }

    result.success = true;
    result.duration = Math.round((Date.now() - startTime) / 1000);

    cliOut(`[AutoSync] Sync complete in ${result.duration}s`);
    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    serverLogger.error("[AutoSync] Sync failed:", errorMsg);

    result.success = false;
    result.duration = Math.round((Date.now() - startTime) / 1000);
    result.errorMessages.push(errorMsg);

    // Send failure notification
    await sendSyncNotification(result);

    return result;
  }
}

async function sendSyncNotification(result: SyncResult): Promise<boolean> {
  const title = result.success
    ? `✅ CELLAR Sync Successful (${result.newRegulations} new regulations)`
    : `❌ CELLAR Sync Failed`;

  let content = `**Automated CELLAR Sync Report**\n\n`;

  if (result.success) {
    content += `**Summary:**\n`;
    content += `- Fetched: ${result.fetched} legal acts\n`;
    content += `- Normalized: ${result.normalized} regulations\n`;
    content += `- New Regulations: ${result.newRegulations}\n`;
    content += `- Updated Regulations: ${result.updatedRegulations}\n`;
    content += `- ESRS Mappings Generated: ${result.esrsMappingsGenerated}\n`;
    content += `- Errors: ${result.errors}\n`;
    content += `- Duration: ${result.duration}s\n\n`;

    if (result.newRegulations > 0) {
      content += `✨ **New Regulations Added:**\n\n`;
      result.newRegulationTitles.forEach((title, i) => {
        content += `${i + 1}. ${title}\n`;
      });
      content += `\nAll new regulations have been automatically mapped to ESRS datapoints.\n\n`;
      content += `Visit the ESG Hub to review the new regulations.`;
    } else {
      content += `No new regulations found. ISA is up to date.`;
    }

    if (result.errorMessages.length > 0) {
      content += `\n\n**Warnings (${result.errorMessages.length}):**\n`;
      result.errorMessages.forEach((msg, i) => {
        content += `${i + 1}. ${msg}\n`;
      });
    }
  } else {
    content += `**Sync failed with ${result.errorMessages.length} error(s):**\n\n`;
    result.errorMessages.forEach((msg, i) => {
      content += `${i + 1}. ${msg}\n`;
    });
    content += `\n**Duration:** ${result.duration}s\n\n`;
    content += `Please check the server logs for more details.`;
  }

  try {
    const sent = await notifyOwner({ title, content });
    return sent;
  } catch (error) {
    serverLogger.error("[AutoSync] Failed to send notification:", error);
    return false;
  }
}

// Allow direct execution for testing
if (import.meta.url === `file://${process.argv[1]}`) {
  runAutomatedCellarSync()
    .then(result => {
      cliOut("\n=== Sync Result ===");
      cliOut(JSON.stringify(result, null, 2));
      process.exit(result.success ? 0 : 1);
    })
    .catch(error => {
      serverLogger.error("Fatal error:", error);
      process.exit(1);
    });
}
