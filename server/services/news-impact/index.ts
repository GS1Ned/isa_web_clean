/**
 * News Impact Service
 *
 * Propagates regulatory news signals into downstream capability state:
 *   E-01: Marks advisory reports as stale when related regulations receive news coverage.
 *   E-02: Flags regulations as needing verification when enforcement/amendment signals are detected.
 *
 * Both functions are fire-and-forget (non-blocking) and called from createHubNews() in db.ts.
 */

import { getDb } from "../../db";
import { serverLogger } from "../../_core/logger-wiring";
import { sql, inArray } from "drizzle-orm";
import { advisoryReports, regulations } from "../../../drizzle/schema";

/** Regulatory states that warrant flagging regulations for verification. */
const VERIFICATION_TRIGGER_STATES = new Set([
  "ENFORCEMENT_SIGNAL",
  "DELEGATED_ACT_DRAFT",
  "DELEGATED_ACT_ADOPTED",
]);

/**
 * Marks all advisory reports whose targetRegulationIds overlap with the given
 * regulationIds as stale (sets stale_since = NOW() if not already set).
 *
 * E-01: Advisory staleness signal.
 */
export async function flagAdvisoryReportsStaleSince(
  regulationIds: number[]
): Promise<void> {
  if (regulationIds.length === 0) return;

  const db = await getDb();
  if (!db) return;

  try {
    // For each regulation ID, update advisory reports that target it and are not yet stale.
    // MySQL JSON_CONTAINS checks if the JSON array contains the given value.
    for (const regulationId of regulationIds) {
      await db.execute(
        sql.raw(`
          UPDATE advisory_reports
          SET stale_since = NOW()
          WHERE stale_since IS NULL
            AND JSON_CONTAINS(target_regulation_ids, '${regulationId}', '$')
        `)
      );
    }
    serverLogger.debug(
      `[news-impact] Checked advisory staleness for regulation IDs: ${regulationIds.join(", ")}`
    );
  } catch (error) {
    // Non-blocking: log and continue
    serverLogger.error("[news-impact] Failed to flag advisory reports as stale:", error);
  }
}

/**
 * Sets needs_verification = 1 on regulations identified by the given IDs.
 *
 * E-02: Regulation verification flag.
 * Only called when the article carries a high-authority signal (credibilityScore >= 0.8)
 * or a verification-trigger regulatory state. The caller is responsible for this guard.
 */
export async function flagRegulationsNeedVerification(
  regulationIds: number[]
): Promise<void> {
  if (regulationIds.length === 0) return;

  const db = await getDb();
  if (!db) return;

  try {
    await db
      .update(regulations)
      .set({ needsVerification: 1 })
      .where(inArray(regulations.id, regulationIds));

    serverLogger.debug(
      `[news-impact] Flagged regulations for verification: ${regulationIds.join(", ")}`
    );
  } catch (error) {
    serverLogger.error("[news-impact] Failed to flag regulations for verification:", error);
  }
}

/**
 * Returns true if the given regulatory state warrants flagging the regulation for verification.
 */
export function isVerificationTriggerState(regulatoryState: string | null | undefined): boolean {
  return typeof regulatoryState === "string" && VERIFICATION_TRIGGER_STATES.has(regulatoryState);
}
