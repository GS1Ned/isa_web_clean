import { execFileSync } from "child_process";
import { existsSync } from "fs";
import path from "path";

import {
  listAdvisoryVersionsWithSnapshots,
  loadLegacyAdvisoryDiff,
  normalizeAdvisoryVersionTag,
} from "./advisory-legacy-compat";

function getDiffScriptPath() {
  return path.join(process.cwd(), "scripts", "compute_advisory_diff.cjs");
}

export function loadOrComputeLegacyAdvisoryDiff(version1: string, version2: string) {
  const normalizedVersion1 = normalizeAdvisoryVersionTag(version1);
  const normalizedVersion2 = normalizeAdvisoryVersionTag(version2);

  try {
    return loadLegacyAdvisoryDiff(normalizedVersion1, normalizedVersion2);
  } catch {
    const scriptPath = getDiffScriptPath();

    execFileSync("node", [scriptPath, normalizedVersion1, normalizedVersion2], {
      cwd: process.cwd(),
      stdio: "pipe",
    });

    return loadLegacyAdvisoryDiff(normalizedVersion1, normalizedVersion2);
  }
}

export async function listCompatibilityAdvisoryVersions() {
  return await listAdvisoryVersionsWithSnapshots();
}

export function hasLegacyDiffComputationScript() {
  return existsSync(getDiffScriptPath());
}
