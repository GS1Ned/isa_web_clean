import { existsSync, readFileSync } from "fs";
import { execFileSync } from "child_process";
import { join } from "path";

import { serverLogger } from "./_core/logger-wiring";
import { buildAdvisoryReadModel } from "./advisory-read-model";
import { getAdvisoryReports, getReportVersions } from "./db-advisory-reports";
import { enrichAdvisoryDiffWithSnapshot } from "./advisory-diff-snapshot";
import {
  loadLegacyAdvisorySummary,
  normalizeAdvisoryVersionTag,
} from "./advisory-legacy-compat";

function loadOrComputeLegacyAdvisoryDiff(version1: string, version2: string) {
  const normalizedVersion1 = normalizeAdvisoryVersionTag(version1);
  const normalizedVersion2 = normalizeAdvisoryVersionTag(version2);

  const advisoriesDir = join(process.cwd(), "data", "advisories");
  const diffFilePath = join(
    advisoriesDir,
    `ISA_ADVISORY_DIFF_${normalizedVersion1}_to_${normalizedVersion2}.json`,
  );

  if (existsSync(diffFilePath)) {
    return JSON.parse(readFileSync(diffFilePath, "utf8"));
  }

  const scriptPath = join(process.cwd(), "scripts", "compute_advisory_diff.cjs");

  execFileSync("node", [scriptPath, normalizedVersion1, normalizedVersion2], {
    cwd: process.cwd(),
    stdio: "pipe",
  });

  if (!existsSync(diffFilePath)) {
    throw new Error("Diff computation failed to produce output file");
  }

  return JSON.parse(readFileSync(diffFilePath, "utf8"));
}

export async function computeAdvisoryDiffPayload(version1: string, version2: string) {
  const normalizedVersion1 = normalizeAdvisoryVersionTag(version1);
  const normalizedVersion2 = normalizeAdvisoryVersionTag(version2);

  let diffData: any;

  try {
    diffData = loadOrComputeLegacyAdvisoryDiff(normalizedVersion1, normalizedVersion2);
  } catch (error: any) {
    serverLogger.error("[AdvisoryDiff] Failed to compute advisory diff", {
      version1,
      version2,
      error: String(error?.message ?? error),
    });
    throw new Error(`Failed to compute diff: ${error.message}`);
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
}

export async function getAdvisorySummaryPayload(version: string) {
  const normalizedVersion = normalizeAdvisoryVersionTag(version);
  const readModel = await buildAdvisoryReadModel();
  const currentSummary = readModel.summary;
  const currentSummaryVersion = normalizeAdvisoryVersionTag(currentSummary?.version ?? version);

  if (normalizedVersion === currentSummaryVersion) {
    return currentSummary;
  }

  return loadLegacyAdvisorySummary(normalizedVersion);
}
