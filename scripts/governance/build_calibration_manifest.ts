import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ESRS_GS1_CALIBRATION_RULES } from "../../server/mappings/esrs-gs1-calibration-data.ts";

type ManifestRule = {
  id: string;
  esrsStandard: string;
  shortNamePhrases: string[];
  requirementPhrases: string[];
  definitionPhrases: string[];
  rationale: string;
  attributes: {
    attributeId: string;
    attributeName: string;
    mappingConfidence: "high" | "medium" | "low";
    mappingType: "direct" | "calculated" | "aggregated";
    implementationNotes: string;
  }[];
};

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..", "..");
const defaultOutputPath = path.join(
  repoRoot,
  "data",
  "governance",
  "calibrations.manifest.json",
);
const generatedFrom = "server/mappings/esrs-gs1-calibration-data.ts";
const heuristicReference = "server/mappings/esrs-gs1-mapping-data.ts";
const generatedBy = "scripts/governance/build_calibration_manifest.ts";

function countBy<T extends string>(values: T[]) {
  return values.reduce<Record<string, number>>((acc, value) => {
    acc[value] = (acc[value] ?? 0) + 1;
    return acc;
  }, {});
}

function sortedObject(input: Record<string, number>) {
  return Object.fromEntries(
    Object.entries(input).sort(([left], [right]) => left.localeCompare(right)),
  );
}

const confidenceRank: Record<ManifestRule["attributes"][number]["mappingConfidence"], number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const mappingTypeRank: Record<ManifestRule["attributes"][number]["mappingType"], number> = {
  direct: 0,
  calculated: 1,
  aggregated: 2,
};

function stableSortRules(rules: ManifestRule[]) {
  return [...rules].sort(
    (a, b) =>
      a.esrsStandard.localeCompare(b.esrsStandard) || a.id.localeCompare(b.id),
  );
}

function stableSortAttributes(attrs: ManifestRule["attributes"]) {
  return [...attrs].sort(
    (a, b) =>
      confidenceRank[a.mappingConfidence] - confidenceRank[b.mappingConfidence] ||
      mappingTypeRank[a.mappingType] - mappingTypeRank[b.mappingType] ||
      a.attributeId.localeCompare(b.attributeId) ||
      a.attributeName.localeCompare(b.attributeName),
  );
}

function buildManifest() {
  const rulesRaw: ManifestRule[] = ESRS_GS1_CALIBRATION_RULES.map((rule) => ({
    id: rule.id,
    esrsStandard: rule.esrsStandard,
    shortNamePhrases: [...(rule.shortNamePhrases ?? [])],
    requirementPhrases: [...(rule.requirementPhrases ?? [])],
    definitionPhrases: [...(rule.definitionPhrases ?? [])],
    rationale: rule.rationale,
    attributes: rule.attributes.map((attribute) => ({
      attributeId: attribute.attributeId,
      attributeName: attribute.attributeName,
      mappingConfidence: attribute.mappingConfidence,
      mappingType: attribute.mappingType,
      implementationNotes: attribute.implementationNotes,
    })),
  }));

  const rules = stableSortRules(
    rulesRaw.map((rule) => ({
      ...rule,
      attributes: stableSortAttributes(rule.attributes),
    })),
  );

  const allAttributes = rules.flatMap((rule) => rule.attributes);
  const payload = {
    summary: {
      ruleCount: rules.length,
      attributeCount: allAttributes.length,
      esrsStandardCounts: sortedObject(
        countBy(rules.map((rule) => rule.esrsStandard)),
      ),
      confidenceCounts: {
        high: allAttributes.filter((attribute) => attribute.mappingConfidence === "high").length,
        medium: allAttributes.filter((attribute) => attribute.mappingConfidence === "medium").length,
        low: allAttributes.filter((attribute) => attribute.mappingConfidence === "low").length,
      },
      mappingTypeCounts: {
        direct: allAttributes.filter((attribute) => attribute.mappingType === "direct").length,
        calculated: allAttributes.filter((attribute) => attribute.mappingType === "calculated").length,
        aggregated: allAttributes.filter((attribute) => attribute.mappingType === "aggregated").length,
      },
    },
    rules,
  };

  const payloadHash = createHash("sha256")
    .update(JSON.stringify(payload))
    .digest("hex");

  const metaBase = {
    manifestVersion: 1,
    schemaVersion: 1,
    generatedBy,
    generatedFrom,
    heuristicReference,
    deterministic: true,
    runtimeBehavior: "review_only" as const,
  };

  const manifestBase = {
    meta: {
      ...metaBase,
      payloadHash,
    },
    ...payload,
  };

  const renderedWithoutRenderedHash = `${JSON.stringify(manifestBase, null, 2)}\n`;
  const renderedHash = createHash("sha256")
    .update(renderedWithoutRenderedHash)
    .digest("hex");

  const manifest = {
    ...manifestBase,
    meta: {
      ...manifestBase.meta,
      renderedHash,
    },
  };

  const rendered = `${JSON.stringify(manifest, null, 2)}\n`;

  return { manifest, rendered };
}

function renderManifest() {
  return buildManifest().rendered;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const checkMode = args.has("--check");
  const outputPath = defaultOutputPath;
  const rendered = renderManifest();

  if (checkMode) {
    let current = "";

    try {
      current = await readFile(outputPath, "utf8");
    } catch {
      console.error(
        `STOP=calibration_manifest_stale reason=missing path=${path.relative(repoRoot, outputPath)}`,
      );
      process.exit(1);
    }

    if (current !== rendered) {
      const currentHash = createHash("sha256").update(current).digest("hex");
      const nextHash = createHash("sha256").update(rendered).digest("hex");
      console.error(
        `STOP=calibration_manifest_stale reason=out_of_sync path=${path.relative(repoRoot, outputPath)}`,
      );
      console.error(`INFO=current_rendered_sha256=${currentHash}`);
      console.error(`INFO=next_rendered_sha256=${nextHash}`);
      process.exit(1);
    }

    console.log(
      `DONE=calibration_manifest_in_sync path=${path.relative(repoRoot, outputPath)}`,
    );
    return;
  }

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, rendered, "utf8");
  console.log(
    `DONE=calibration_manifest_written path=${path.relative(repoRoot, outputPath)}`,
  );
}

await main();
