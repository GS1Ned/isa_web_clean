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
import { sql, inArray, and, isNull } from "drizzle-orm";
import {
  advisoryReports,
  regulations,
  advisoryReportTargetRegulations,
} from "../../../drizzle/schema";

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
  const normalizedRegulationIds = Array.from(
    new Set(
      regulationIds
        .map((value) => (typeof value === "number" ? value : Number(value)))
        .filter((value) => Number.isInteger(value) && value > 0)
    )
  );
  if (normalizedRegulationIds.length === 0) return;

  const db = await getDb();
  if (!db) return;

  try {
    const linkedReports = await db
      .selectDistinct({
        reportId: advisoryReportTargetRegulations.reportId,
      })
      .from(advisoryReportTargetRegulations)
      .where(
        inArray(
          advisoryReportTargetRegulations.regulationId,
          normalizedRegulationIds
        )
      );

    const reportIds = linkedReports.map((row) => row.reportId);
    if (reportIds.length > 0) {
      await db
        .update(advisoryReports)
        .set({ staleSince: sql`CURRENT_TIMESTAMP` })
        .where(
          and(
            isNull(advisoryReports.staleSince),
            inArray(advisoryReports.id, reportIds)
          )
        );
    }

    serverLogger.info(
      `[news-impact] advisory stale check completed: regulations=${normalizedRegulationIds.join(", ")}, reports=${reportIds.length}`
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
  const normalizedRegulationIds = Array.from(
    new Set(
      regulationIds
        .map((value) => (typeof value === "number" ? value : Number(value)))
        .filter((value) => Number.isInteger(value) && value > 0)
    )
  );
  if (normalizedRegulationIds.length === 0) return;

  const db = await getDb();
  if (!db) return;

  try {
    await db
      .update(regulations)
      .set({ needsVerification: 1 })
      .where(inArray(regulations.id, normalizedRegulationIds));

    serverLogger.info(
      `[news-impact] flagged regulations for verification: ${normalizedRegulationIds.join(", ")}`
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
