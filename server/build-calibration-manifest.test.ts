import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

type MappingConfidence = "high" | "medium" | "low";
type MappingType = "direct" | "calculated" | "aggregated";

type ManifestAttribute = {
  attributeId: string;
  attributeName: string;
  mappingConfidence: MappingConfidence;
  mappingType: MappingType;
  implementationNotes: string;
};

type ManifestRule = {
  id: string;
  esrsStandard: string;
  shortNamePhrases: string[];
  requirementPhrases: string[];
  definitionPhrases: string[];
  rationale: string;
  attributes: ManifestAttribute[];
};

type Manifest = {
  meta: {
    manifestVersion: number;
    schemaVersion: number;
    generatedBy: string;
    generatedFrom: string;
    heuristicReference: string;
    deterministic: boolean;
    runtimeBehavior: string;
    payloadHash: string;
    renderedHash: string;
  };
  summary: Record<string, unknown>;
  rules: ManifestRule[];
};

const confidenceRank: Record<MappingConfidence, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const mappingTypeRank: Record<MappingType, number> = {
  direct: 0,
  calculated: 1,
  aggregated: 2,
};

function run(cmd: string, args: string[], cwd: string) {
  return execFileSync(cmd, args, {
    cwd,
    stdio: "pipe",
    encoding: "utf8",
  });
}

function sha256(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

function renderWithoutRenderedHash(manifest: Manifest) {
  const { renderedHash: _renderedHash, ...metaWithoutRenderedHash } = manifest.meta;
  return `${JSON.stringify(
    {
      ...manifest,
      meta: metaWithoutRenderedHash,
    },
    null,
    2,
  )}\n`;
}

function firstDiffHint(a: string, b: string) {
  const aLines = a.split("\n");
  const bLines = b.split("\n");
  const max = Math.max(aLines.length, bLines.length);
  for (let index = 0; index < max; index += 1) {
    const left = aLines[index] ?? "";
    const right = bLines[index] ?? "";
    if (left !== right) {
      const start = Math.max(0, index - 2);
      const end = Math.min(max, index + 3);
      const context: string[] = [];
      for (let line = start; line < end; line += 1) {
        const before = aLines[line] ?? "";
        const after = bLines[line] ?? "";
        context.push(
          [
            String(line + 1).padStart(5, "0"),
            "A:",
            before,
            " | ",
            "B:",
            after,
          ].join(" "),
        );
      }
      return {
        line: index + 1,
        context: context.join("\n"),
      };
    }
  }
  return null;
}

describe("build_calibration_manifest", () => {
  it("is deterministic and includes stable hashes", () => {
    const repoRoot = process.cwd();
    const script = path.join(
      repoRoot,
      "scripts",
      "governance",
      "build_calibration_manifest.ts",
    );
    const manifestPath = path.join(
      repoRoot,
      "data",
      "governance",
      "calibrations.manifest.json",
    );

    run("pnpm", ["exec", "tsx", script], repoRoot);
    const firstRender = readFileSync(manifestPath, "utf8");

    run("pnpm", ["exec", "tsx", script], repoRoot);
    const secondRender = readFileSync(manifestPath, "utf8");

    if (firstRender !== secondRender) {
      const hint = firstDiffHint(firstRender, secondRender);
      const firstHash = sha256(firstRender);
      const secondHash = sha256(secondRender);
      console.error(
        `STOP=calibration_manifest_nondeterministic sha256_a=${firstHash} sha256_b=${secondHash}`,
      );
      if (hint) {
        console.error(`STOP=first_diff_line=${hint.line}\n${hint.context}`);
      }
    }
    expect(firstRender).toBe(secondRender);

    const parsed = JSON.parse(firstRender) as Manifest;
    expect(parsed.meta.schemaVersion).toBe(1);
    expect(typeof parsed.meta.payloadHash).toBe("string");
    expect(typeof parsed.meta.renderedHash).toBe("string");

    expect(parsed.meta.payloadHash).toBe(
      sha256(
        JSON.stringify({
          summary: parsed.summary,
          rules: parsed.rules,
        }),
      ),
    );
    expect(parsed.meta.renderedHash).toBe(sha256(renderWithoutRenderedHash(parsed)));

    expect(Array.isArray(parsed.rules)).toBe(true);
    expect(parsed.rules.length).toBeGreaterThan(0);

    for (let index = 1; index < parsed.rules.length; index += 1) {
      const previous = parsed.rules[index - 1];
      const current = parsed.rules[index];
      const ordered =
        previous.esrsStandard.localeCompare(current.esrsStandard) < 0 ||
        (previous.esrsStandard === current.esrsStandard &&
          previous.id.localeCompare(current.id) <= 0);
      expect(ordered).toBe(true);
    }

    for (const rule of parsed.rules) {
      for (let index = 1; index < rule.attributes.length; index += 1) {
        const previous = rule.attributes[index - 1];
        const current = rule.attributes[index];
        const ordered =
          confidenceRank[previous.mappingConfidence] <
            confidenceRank[current.mappingConfidence] ||
          (confidenceRank[previous.mappingConfidence] ===
            confidenceRank[current.mappingConfidence] &&
            (mappingTypeRank[previous.mappingType] <
              mappingTypeRank[current.mappingType] ||
              (mappingTypeRank[previous.mappingType] ===
                mappingTypeRank[current.mappingType] &&
                (previous.attributeId.localeCompare(current.attributeId) < 0 ||
                  (previous.attributeId === current.attributeId &&
                    previous.attributeName.localeCompare(current.attributeName) <= 0)))));
        expect(ordered).toBe(true);
      }
    }

    const anyRule = parsed.rules[0];
    expect(typeof anyRule.id).toBe("string");
    expect(typeof anyRule.esrsStandard).toBe("string");
    expect(Array.isArray(anyRule.attributes)).toBe(true);
    expect(anyRule.attributes.length).toBeGreaterThan(0);
    const anyAttribute = anyRule.attributes[0];
    expect(typeof anyAttribute.attributeId).toBe("string");
    expect(typeof anyAttribute.attributeName).toBe("string");
  });
});
