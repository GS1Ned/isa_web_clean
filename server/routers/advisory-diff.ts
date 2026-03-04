/**
 * Advisory Diff Router
 *
 * Provides API for computing and retrieving ISA advisory version diffs.
 * Implements metrics from docs/ADVISORY_DIFF_METRICS.md
 */

import { z } from "zod";
import { router, publicProcedure } from "../_core/trpc";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { execFileSync } from "child_process";
import { serverLogger } from "../_core/logger-wiring";
import { getAdvisoryReports, getReportVersions } from "../db-advisory-reports";
import { enrichAdvisoryDiffWithSnapshot } from "../advisory-diff-snapshot";
import {
  listAdvisoryVersionsWithSnapshots,
  loadLegacyAdvisorySummary,
  normalizeAdvisoryVersionTag,
} from "../advisory-legacy-compat";

export const advisoryDiffRouter = router({
  /**
   * Compute diff between two advisory versions
   */
  computeDiff: publicProcedure
    .input(
      z.object({
        version1: z.string().regex(/^v\d+\.\d+$/), // e.g., "v1.0"
        version2: z.string().regex(/^v\d+\.\d+$/), // e.g., "v1.1"
      })
    )
    .query(async ({ input }) => {
      const { version1, version2 } = input;
      const normalizedVersion1 = normalizeAdvisoryVersionTag(version1);
      const normalizedVersion2 = normalizeAdvisoryVersionTag(version2);

      // Check if diff file already exists
      const advisoriesDir = join(process.cwd(), "data", "advisories");
      const diffFilePath = join(
        advisoriesDir,
        `ISA_ADVISORY_DIFF_${normalizedVersion1}_to_${normalizedVersion2}.json`
      );

      let diffData: any;

      if (existsSync(diffFilePath)) {
        // Load existing diff file
        diffData = JSON.parse(readFileSync(diffFilePath, "utf8"));
      } else {
        // Compute diff on-the-fly
        const scriptPath = join(process.cwd(), "scripts", "compute_advisory_diff.cjs");
        
        try {
          execFileSync("node", [scriptPath, normalizedVersion1, normalizedVersion2], {
            cwd: process.cwd(),
            stdio: "pipe",
          });

          // Load newly computed diff
          if (existsSync(diffFilePath)) {
            diffData = JSON.parse(readFileSync(diffFilePath, "utf8"));
          } else {
            throw new Error("Diff computation failed to produce output file");
          }
        } catch (error: any) {
          serverLogger.error("[AdvisoryDiff] Failed to compute advisory diff", {
            version1,
            version2,
            error: String(error?.message ?? error),
          });
          throw new Error(`Failed to compute diff: ${error.message}`);
        }
      }

      try {
        const reports = await getAdvisoryReports();
        const matchingReports = reports.filter(
          report => normalizeAdvisoryVersionTag(report.version ?? "") === normalizedVersion2,
        );
        const versionsByReportId = new Map(
          await Promise.all(
            matchingReports.map(async report => [report.id, await getReportVersions(report.id)] as const),
          ),
        );

        return enrichAdvisoryDiffWithSnapshot({
          diffData,
          version1: normalizedVersion1,
          version2: normalizedVersion2,
          reports: matchingReports,
          versionsByReportId,
        });
      } catch (error: any) {
        serverLogger.warn("[AdvisoryDiff] Falling back to legacy advisory diff only", {
          version1,
          version2,
          error: String(error?.message ?? error),
        });
        return {
          ...diffData,
          snapshotBacked: {
            matched: false,
            source: "legacy_file_only" as const,
          },
        };
      }
    }),

  /**
   * List available advisory versions
   */
  listVersions: publicProcedure.query(async () => {
    return await listAdvisoryVersionsWithSnapshots();
  }),

  /**
   * Get advisory summary
   */
  getAdvisorySummary: publicProcedure
    .input(z.object({ version: z.string().regex(/^v\d+\.\d+$/) }))
    .query(async ({ input }) => {
      return loadLegacyAdvisorySummary(input.version);
    }),
});
