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
import { execSync } from "child_process";

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

      // Check if diff file already exists
      const advisoriesDir = join(process.cwd(), "data", "advisories");
      const diffFilePath = join(
        advisoriesDir,
        `ISA_ADVISORY_DIFF_${version1}_to_${version2}.json`
      );

      let diffData: any;

      if (existsSync(diffFilePath)) {
        // Load existing diff file
        diffData = JSON.parse(readFileSync(diffFilePath, "utf8"));
      } else {
        // Compute diff on-the-fly
        const scriptPath = join(process.cwd(), "scripts", "compute_advisory_diff.cjs");
        
        try {
          execSync(`node ${scriptPath} ${version1} ${version2}`, {
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
          throw new Error(`Failed to compute diff: ${error.message}`);
        }
      }

      return diffData;
    }),

  /**
   * List available advisory versions
   */
  listVersions: publicProcedure.query(async () => {
    const advisoriesDir = join(process.cwd(), "data", "advisories");
    const files = require("fs").readdirSync(advisoriesDir);

    const versions = files
      .filter((f: string) => f.match(/^ISA_ADVISORY_v\d+\.\d+\.json$/))
      .map((f: string) => {
        const match = f.match(/v(\d+\.\d+)/);
        return match ? match[1] : null;
      })
      .filter(Boolean)
      .sort();

    return versions.map((v: string) => ({
      version: `v${v}`,
      label: `ISA Advisory v${v}`,
    }));
  }),

  /**
   * Get advisory summary
   */
  getAdvisorySummary: publicProcedure
    .input(z.object({ version: z.string().regex(/^v\d+\.\d+$/) }))
    .query(async ({ input }) => {
      const summaryPath = join(
        process.cwd(),
        "data",
        "advisories",
        `ISA_ADVISORY_${input.version}.summary.json`
      );

      if (!existsSync(summaryPath)) {
        throw new Error(`Summary not found for ${input.version}`);
      }

      return JSON.parse(readFileSync(summaryPath, "utf8"));
    }),
});
