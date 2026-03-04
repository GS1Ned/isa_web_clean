import fs from "fs";
import path from "path";

import { getAdvisoryReports, getReportVersions } from "./db-advisory-reports";

function getAdvisoriesDir() {
  return path.join(process.cwd(), "data", "advisories");
}

function stripLeadingVersionPrefix(version: string) {
  return version.trim().replace(/^v/i, "");
}

function trimTrailingZeroSegments(segments: string[]) {
  const normalized = [...segments];

  while (normalized.length > 2 && normalized[normalized.length - 1] === "0") {
    normalized.pop();
  }

  return normalized;
}

export function normalizeAdvisoryVersionTag(version: string) {
  const stripped = stripLeadingVersionPrefix(version);
  const trimmed = trimTrailingZeroSegments(stripped.split("."));
  return `v${trimmed.join(".")}`;
}

function compareVersionTags(left: string, right: string) {
  const leftParts = stripLeadingVersionPrefix(left).split(".").map(part => Number(part));
  const rightParts = stripLeadingVersionPrefix(right).split(".").map(part => Number(part));
  const maxLength = Math.max(leftParts.length, rightParts.length);

  for (let index = 0; index < maxLength; index += 1) {
    const leftValue = leftParts[index] ?? 0;
    const rightValue = rightParts[index] ?? 0;

    if (leftValue !== rightValue) {
      return leftValue - rightValue;
    }
  }

  return 0;
}

export function buildAdvisoryVersionInventory(versionCandidates: string[]) {
  return Array.from(new Set(versionCandidates.map(normalizeAdvisoryVersionTag)))
    .sort(compareVersionTags)
    .map(version => ({
      version,
      label: `ISA Advisory ${version}`,
    }));
}

export function listFileBackedAdvisoryVersions() {
  const advisoriesDir = getAdvisoriesDir();
  const files = fs.readdirSync(advisoriesDir);

  return files
    .filter(file => file.match(/^ISA_ADVISORY_v\d+\.\d+\.json$/))
    .map(file => {
      const match = file.match(/v(\d+\.\d+)/);
      return match ? `v${match[1]}` : null;
    })
    .filter((version): version is string => Boolean(version));
}

export async function listSnapshotBackedAdvisoryVersions() {
  try {
    const reports = await getAdvisoryReports();
    const reportVersions = reports.map(report => report.version).filter(Boolean);
    const snapshotVersionGroups = await Promise.all(
      reports.map(report => getReportVersions(report.id)),
    );
    const snapshotVersions = snapshotVersionGroups.flatMap(versions =>
      versions.map(version => version.version).filter(Boolean),
    );

    return buildAdvisoryVersionInventory([...reportVersions, ...snapshotVersions]).map(
      entry => entry.version,
    );
  } catch {
    return [];
  }
}

export async function listAdvisoryVersionsWithSnapshots() {
  const fileVersions = listFileBackedAdvisoryVersions();
  const snapshotVersions = await listSnapshotBackedAdvisoryVersions();
  return buildAdvisoryVersionInventory([...fileVersions, ...snapshotVersions]);
}

export function loadLegacyAdvisory(version: string) {
  const advisoryPath = path.join(
    getAdvisoriesDir(),
    `ISA_ADVISORY_${normalizeAdvisoryVersionTag(version)}.json`,
  );

  return JSON.parse(fs.readFileSync(advisoryPath, "utf8"));
}

export function loadLegacyAdvisorySummary(version: string) {
  const summaryPath = path.join(
    getAdvisoriesDir(),
    `ISA_ADVISORY_${normalizeAdvisoryVersionTag(version)}.summary.json`,
  );

  return JSON.parse(fs.readFileSync(summaryPath, "utf8"));
}

export function loadLegacyAdvisoryDiff(version1: string, version2: string) {
  const diffPath = path.join(
    getAdvisoriesDir(),
    `ISA_ADVISORY_DIFF_${normalizeAdvisoryVersionTag(version1)}_to_${normalizeAdvisoryVersionTag(version2)}.json`,
  );

  if (!fs.existsSync(diffPath)) {
    throw new Error(
      `Diff file not found for ${normalizeAdvisoryVersionTag(version1)} to ${normalizeAdvisoryVersionTag(version2)}`,
    );
  }

  return JSON.parse(fs.readFileSync(diffPath, "utf8"));
}
